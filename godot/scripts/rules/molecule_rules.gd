class_name MoleculeRules
extends RefCounted

# Pure settled-state rules translated from the shipped JavaScript worker.
# UI animation, clocks, economy and history belong to LevelSession.
const Groups = preload("res://scripts/rules/movement_groups.gd")
const DIRS: Array = [Vector2i(0,-1),Vector2i(1,0),Vector2i(0,1),Vector2i(-1,0)]
var movement: RefCounted = Groups.new()

func kxy(x: int,y: int) -> String:
	return str(x)+","+str(y)

func floor_at(s: Dictionary,x: int,y: int) -> bool:
	return movement.floor_at(s,x,y)

func _map_tiles(value: Variant) -> Dictionary:
	if value is Dictionary: return value.duplicate(true)
	var out: Dictionary = {}
	if value is Array:
		for tile in value: out[kxy(int(tile.x),int(tile.y))] = tile.duplicate(true)
	return out

func setup(raw: Dictionary) -> Dictionary:
	var s: Dictionary = raw.duplicate(true)
	for name in ["atoms","grid","movingWalls","pressureSystems","linkedPairs","stickyPairs","fusionGroups","fusionDefs","crystals","reactorGates","repulsorCores"]:
		if not s.get(name) is Array: s[name] = []
	for name in ["enzymeGate","replicator","photonPad","synthesizer"]:
		if not s.has(name): s[name] = null
	var chambers: Array = s.get("rotatingChambers",[])
	if chambers.is_empty() and s.get("rotatingChamber") is Dictionary: chambers = [s.rotatingChamber]
	s.rotatingChambers = []
	for idx in range(chambers.size()):
		var c: Dictionary = chambers[idx]
		s.rotatingChambers.append({"id":str(c.get("id",String.chr(65+idx))),"x":int(c.x),"y":int(c.y),"size":maxi(2,int(c.get("size",3))),"turns":int(c.get("turns",0))%4})
	s.rotatingChamber = s.rotatingChambers[0] if not s.rotatingChambers.is_empty() else null
	for name in ["portals","rifts","oneWays","rotationPads"]: s[name] = _map_tiles(s.get(name,[]))
	s.linkedMate = {}; s.stickyMate = {}; s.fusionGroupByAtom = {}; s.barrierSet = {}
	for pair in s.linkedPairs: s.linkedMate[int(pair[0])] = int(pair[1]); s.linkedMate[int(pair[1])] = int(pair[0])
	for pair in s.stickyPairs: s.stickyMate[int(pair[0])] = int(pair[1]); s.stickyMate[int(pair[1])] = int(pair[0])
	for gi in range(s.fusionGroups.size()):
		for member in s.fusionGroups[gi].members: s.fusionGroupByAtom[int(member)] = gi
	for barrier in s.get("barriers",[]): s.barrierSet[kxy(int(barrier.x),int(barrier.y))] = true
	if s.enzymeGate != null:
		var g: Dictionary = s.enzymeGate
		s.enzymeGate = {"x":int(g.x),"y":int(g.y),"open":bool(g.get("open",false))}
		if int(g.y) >= 0 and int(g.y) < s.grid.size(): s.grid[int(g.y)][int(g.x)] = not s.enzymeGate.open
	update_fusion(s)
	return s

func snapshot(s: Dictionary) -> Dictionary:
	var out: Dictionary = {}
	for name in ["grid","atoms","movingWalls","pressureSystems","linkedPairs","stickyPairs","fusionDefs","crystals","reactorGates","replicator","photonPad","synthesizer","repulsorCores","rotatingChambers","rotatingChamber","enzymeGate"]:
		var value: Variant = s.get(name)
		out[name] = value.duplicate(true) if value is Array or value is Dictionary else value
	for name in ["portals","rifts","oneWays","rotationPads"]: out[name] = s.get(name,{}).values().duplicate(true)
	out.barriers = []
	for key in s.get("barrierSet",{}):
		var bits: PackedStringArray = str(key).split(",")
		out.barriers.append({"x":int(bits[0]),"y":int(bits[1])})
	out.fusionGroups = []
	for group in s.get("fusionGroups",[]): out.fusionGroups.append({"part":group.part,"members":group.members.duplicate()})
	out.rulesVersion = 253
	out.targetKey = s.get("targetKey",null)
	if s.get("fragileFailure",false): out.fragileFailure = true
	return out

func group_for(s: Dictionary,i: int) -> Variant:
	var gi: Variant = s.fusionGroupByAtom.get(i)
	return null if gi == null else s.fusionGroups[int(gi)]

func one_way_allows(s: Dictionary,fx: int,fy: int,tx: int,ty: int,d: int) -> bool:
	return movement.one_way(s,fx,fy,tx,ty,d)

func norm_goal(atoms: Array) -> String:
	if atoms.is_empty(): return ""
	var min_x: int = 2147483647
	var min_y: int = 2147483647
	for a in atoms: min_x = mini(min_x,int(a.x)); min_y = mini(min_y,int(a.y))
	var cells: Array[String] = []
	for a in atoms: cells.append(str(a.e)+","+str(int(a.x)-min_x)+","+str(int(a.y)-min_y))
	cells.sort()
	return "|".join(cells)

func goal(s: Dictionary,target_key: String) -> bool:
	if norm_goal(s.atoms) != target_key: return false
	for crystal in s.get("crystals",[]):
		if not crystal.get("collected",false): return false
	return true

func update_fusion(s: Dictionary) -> void:
	var claimed: Dictionary = {}; var used: Dictionary = {}
	for g in s.fusionGroups: claimed[g.part] = true
	for member in s.fusionGroupByAtom: used[int(member)] = true
	for definition in s.fusionDefs:
		if claimed.has(definition.part) or definition.cells.is_empty(): continue
		var first: Array = definition.cells[0]
		var found: Variant = null
		for anchor in range(s.atoms.size()):
			if found != null: break
			if used.has(anchor) or s.atoms[anchor].e != first[0]: continue
			var ox: int = int(s.atoms[anchor].x)-int(first[1]); var oy: int = int(s.atoms[anchor].y)-int(first[2])
			var members: Array = []; var taken: Dictionary = {}; var ok: bool = true
			for cell in definition.cells:
				var idx: int = -1
				for ai in range(s.atoms.size()):
					var a: Dictionary = s.atoms[ai]
					if not used.has(ai) and not taken.has(ai) and a.e == cell[0] and int(a.x) == ox+int(cell[1]) and int(a.y) == oy+int(cell[2]): idx = ai; break
				if idx < 0: ok = false; break
				members.append(idx); taken[idx] = true
			if ok: found = members
		if found != null:
			var gi: int = s.fusionGroups.size()
			s.fusionGroups.append({"part":definition.part,"members":found.duplicate()})
			for member in found: used[int(member)] = true; s.fusionGroupByAtom[int(member)] = gi
			claimed[definition.part] = true

func state_key(s: Dictionary) -> String:
	var atoms: Array[String] = []
	for a in s.atoms:
		var bits: Array = [int(a.x),int(a.y),str(a.e)]
		for flag in ["frozen","fire","sticky","zombie","lightning"]: bits.append(1 if a.get(flag,false) else 0)
		bits.append(int(a.get("zombieGen",0))); bits.append(1 if a.get("fragile",false) else 0)
		bits.append(int(a.get("fragileHits",0))); bits.append(int(a.get("fragileMax",3)) if a.get("fragileMax",3) else 3)
		bits.append(1 if a.get("photonBoost",false) else 0)
		atoms.append(",".join(bits.map(func(v: Variant) -> String: return str(v))))
	var pairs: Array[String] = []; var groups: Array[String] = []; var walls: Array[String] = []; var barriers: Array[String] = []; var crystals: Array[String] = []; var chambers: Array[String] = []
	for pair in s.stickyPairs:
		var ids: Array = pair.duplicate(); ids.sort()
		pairs.append("-".join(ids.map(func(v: Variant) -> String: return str(int(v)))))
	pairs.sort()
	for g in s.fusionGroups:
		var ids: Array = g.members.duplicate(); ids.sort()
		groups.append(str(int(g.part))+":"+",".join(ids.map(func(v: Variant) -> String: return str(int(v)))))
	groups.sort()
	for w in s.movingWalls: walls.append(str(int(w.get("index",0)))+":"+kxy(int(w.x),int(w.y)))
	for b in s.get("barriers",[]): barriers.append(kxy(int(b.x),int(b.y)))
	barriers.sort()
	for c in s.crystals: crystals.append("1" if c.get("collected",false) else "0")
	for c in s.rotatingChambers: chambers.append(str(int(c.get("turns",0))%4))
	var sy: Variant = s.synthesizer
	var sy_state: String = "-"
	if sy != null: sy_state = "F" if sy.get("faulted",false) else ("C" if sy.get("complete",false) else "W"+",".join(sy.get("buffer",[])))
	return "|".join(atoms)+"#S"+";".join(pairs)+"#F"+";".join(groups)+"#M"+";".join(walls)+"#B"+";".join(barriers)+"#C"+"".join(crystals)+"#E"+("1" if s.enzymeGate != null and s.enzymeGate.get("open",false) else "0")+"#Y"+sy_state+"#Q"+(",".join(chambers) if not chambers.is_empty() else "-")

func repulsor_trigger_at(s: Dictionary,x: int,y: int,used: Dictionary = {}) -> Variant:
	for ci in range(s.repulsorCores.size()):
		if used.has(ci): continue
		var c: Dictionary = s.repulsorCores[ci]
		var ox: int = x-int(c.x)
		var oy: int = y-int(c.y)
		if absi(ox)+absi(oy) != 1: continue
		return {"coreIndex":ci,"core":{"x":int(c.x),"y":int(c.y)},"d":1 if ox == 1 else (3 if ox == -1 else (2 if oy == 1 else 0))}
	return null

func _pad_at(s: Dictionary,x: int,y: int) -> bool:
	return s.photonPad != null and int(s.photonPad.x) == x and int(s.photonPad.y) == y

func _atom_at(s: Dictionary,x: int,y: int,excluded: Array = []) -> int:
	var excluded_set: Dictionary = {}
	for member in excluded: excluded_set[int(member)] = true
	for ai in range(s.atoms.size()):
		if not excluded_set.has(ai) and int(s.atoms[ai].x) == x and int(s.atoms[ai].y) == y: return ai
	return -1

func slide_plan(s: Dictionary,i: int,d: int) -> Dictionary:
	if i < 0 or i >= s.atoms.size() or d < 0 or d > 3: return {}
	var sx: int = int(s.atoms[i].x)
	var sy: int = int(s.atoms[i].y)
	var x: int = sx
	var y: int = sy
	var direction: int = d
	var barrier_hit: Variant = null
	var rift_used: bool = false
	var path: Array = []
	var repulsor_events: Array = []
	var used_cores: Dictionary = {}
	var photon_on: bool = s.photonPad != null
	var photon_charged: bool = photon_on and bool(s.atoms[i].get("photonBoost",false))
	var photon_used: bool = false
	var photon_activated: bool = false
	for _guard in range(256):
		var delta: Vector2i = DIRS[direction]
		var nx: int = x+delta.x
		var ny: int = y+delta.y
		if s.barrierSet.has(kxy(nx,ny)):
			barrier_hit = kxy(nx,ny)
			break
		var blocker: int = _atom_at(s,nx,ny,[i])
		if blocker >= 0:
			if photon_on and photon_charged and not photon_used and one_way_allows(s,x,y,nx,ny,direction):
				var bx: int = nx+delta.x
				var by: int = ny+delta.y
				if floor_at(s,bx,by) and not s.barrierSet.has(kxy(bx,by)) and _atom_at(s,bx,by,[i]) < 0 and one_way_allows(s,nx,ny,bx,by,direction):
					path.append({"x":nx,"y":ny,"photonPass":true})
					x = bx
					y = by
					path.append({"x":x,"y":y})
					photon_charged = false
					photon_used = true
					if _pad_at(s,x,y):
						photon_charged = true
						photon_activated = true
					var photon_hit: Variant = repulsor_trigger_at(s,x,y,used_cores)
					if photon_hit != null:
						used_cores[photon_hit.coreIndex] = true
						repulsor_events.append({"coreIndex":photon_hit.coreIndex,"x":x,"y":y,"coreX":photon_hit.core.x,"coreY":photon_hit.core.y,"fromD":direction,"toD":photon_hit.d})
						direction = int(photon_hit.d)
					continue
			break
		if not floor_at(s,nx,ny) or not one_way_allows(s,x,y,nx,ny,direction): break
		if not rift_used and s.rifts.has(kxy(nx,ny)):
			var r: Dictionary = s.rifts[kxy(nx,ny)]
			if not floor_at(s,int(r.toX),int(r.toY)) or s.barrierSet.has(kxy(int(r.toX),int(r.toY))) or _atom_at(s,int(r.toX),int(r.toY),[i]) >= 0: break
			path.append({"x":nx,"y":ny})
			x = int(r.toX)
			y = int(r.toY)
			path.append({"x":x,"y":y})
			rift_used = true
		else:
			x = nx
			y = ny
			path.append({"x":x,"y":y})
		if _pad_at(s,x,y):
			photon_charged = true
			photon_activated = true
		var hit: Variant = repulsor_trigger_at(s,x,y,used_cores)
		if hit != null:
			used_cores[hit.coreIndex] = true
			repulsor_events.append({"coreIndex":hit.coreIndex,"x":x,"y":y,"coreX":hit.core.x,"coreY":hit.core.y,"fromD":direction,"toD":hit.d})
			direction = int(hit.d)
	return {"dest":null if x == sx and y == sy else {"x":x,"y":y},"barrierHit":barrier_hit,"path":path,"repulsorEvents":repulsor_events,"photonChargedAfter":photon_charged,"photonUsed":photon_used,"photonActivated":photon_activated}

func line_path(x0: int,y0: int,x1: int,y1: int) -> Array:
	if x0 != x1 and y0 != y1: return []
	var out: Array = []
	var dx: int = int(sign(x1-x0))
	var dy: int = int(sign(y1-y0))
	var x: int = x0
	var y: int = y0
	for _step in range(absi(x1-x0)+absi(y1-y0)):
		x += dx
		y += dy
		out.append({"x":x,"y":y})
	return out

func collect_crystals(s: Dictionary,cells: Array) -> void:
	for p in cells:
		for c in s.crystals:
			if not c.get("collected",false) and int(c.x) == int(p.x) and int(c.y) == int(p.y): c.collected = true

func update_enzyme_gate(s: Dictionary) -> void:
	if s.enzymeGate == null: return
	var is_open: bool = true
	for c in s.crystals:
		if not c.get("collected",false): is_open = false
	s.enzymeGate.open = is_open
	var g: Dictionary = s.enzymeGate
	if int(g.y) >= 0 and int(g.y) < s.grid.size(): s.grid[int(g.y)][int(g.x)] = not is_open

func apply_rotation(s: Dictionary,i: int) -> void:
	var g: Variant = group_for(s,i)
	if g == null or g.members.size() < 2: return
	var pivot_idx: int = -1
	for member in g.members:
		var a: Dictionary = s.atoms[int(member)]
		if s.rotationPads.has(kxy(int(a.x),int(a.y))):
			pivot_idx = int(member)
			break
	if pivot_idx < 0: return
	var pivot: Dictionary = s.atoms[pivot_idx]
	var pad: Dictionary = s.rotationPads[kxy(int(pivot.x),int(pivot.y))]
	var next: Array = []
	var seen: Dictionary = {}
	for member in g.members:
		var a: Dictionary = s.atoms[int(member)]
		var dx: int = int(a.x)-int(pivot.x)
		var dy: int = int(a.y)-int(pivot.y)
		var nx: int = int(pivot.x)+(-dy if int(pad.d) >= 0 else dy)
		var ny: int = int(pivot.y)+(dx if int(pad.d) >= 0 else -dx)
		if not floor_at(s,nx,ny) or s.barrierSet.has(kxy(nx,ny)) or _atom_at(s,nx,ny,g.members) >= 0 or seen.has(kxy(nx,ny)): return
		seen[kxy(nx,ny)] = true
		next.append({"k":int(member),"x":nx,"y":ny})
	for q in next:
		s.atoms[q.k].x = q.x
		s.atoms[q.k].y = q.y

func lightning(s: Dictionary,i: int) -> void:
	if i < 0 or i >= s.atoms.size() or not s.atoms[i].get("lightning",false): return
	var seen: Dictionary = {i:true}
	var queue: Array = [i]
	while not queue.is_empty():
		var a: Dictionary = s.atoms[int(queue.pop_front())]
		for j in range(s.atoms.size()):
			if seen.has(j): continue
			var b: Dictionary = s.atoms[j]
			if absi(int(a.x)-int(b.x))+absi(int(a.y)-int(b.y)) == 1:
				seen[j] = true
				queue.append(j)
	for j in seen:
		var a: Dictionary = s.atoms[int(j)]
		if int(j) != i and a.get("frozen",false):
			a.frozen = false
			if a.get("zombie",false):
				a.zombie = false
				a.zombieGen = 0

func melt(s: Dictionary) -> void:
	for f in s.atoms:
		if not f.get("fire",false): continue
		for a in s.atoms:
			if a.get("frozen",false) and absi(int(f.x)-int(a.x))+absi(int(f.y)-int(a.y)) == 1:
				a.frozen = false
				if a.get("zombie",false):
					a.zombie = false
					a.zombieGen = 0

func stick(s: Dictionary,i: int) -> void:
	if i < 0 or i >= s.atoms.size(): return
	var a: Dictionary = s.atoms[i]
	if a.get("frozen",false) or s.stickyMate.has(i) or s.linkedMate.has(i) or group_for(s,i) != null or a.get("sticky",false): return
	for j in range(s.atoms.size()):
		var b: Dictionary = s.atoms[j]
		if j != i and b.get("sticky",false) and not b.get("frozen",false) and not s.stickyMate.has(j) and not s.linkedMate.has(j) and group_for(s,j) == null and absi(int(a.x)-int(b.x))+absi(int(a.y)-int(b.y)) == 1:
			s.stickyPairs.append([i,j])
			s.stickyMate[i] = j
			s.stickyMate[j] = i
			return

func zombie(s: Dictionary,i: int) -> void:
	if i < 0 or i >= s.atoms.size(): return
	var a: Dictionary = s.atoms[i]
	if a.get("frozen",false) or a.get("zombie",false): return
	for zi in range(s.atoms.size()):
		var z: Dictionary = s.atoms[zi]
		if not z.get("zombie",false) or zi == i or int(z.get("zombieGen",0)) >= 2: continue
		if absi(int(a.x)-int(z.x))+absi(int(a.y)-int(z.y)) == 1:
			a.frozen = true
			a.zombie = true
			a.zombieGen = int(z.get("zombieGen",0))+1
			return

func pressure(s: Dictionary) -> void:
	for p in s.pressureSystems:
		var is_open: bool = _atom_at(s,int(p.plate.x),int(p.plate.y)) >= 0 or _atom_at(s,int(p.door.x),int(p.door.y)) >= 0
		if int(p.door.y) >= 0 and int(p.door.y) < s.grid.size(): s.grid[int(p.door.y)][int(p.door.x)] = not is_open

func move_walls(s: Dictionary,reserve_destinations: bool = false) -> void:
	var plans: Array = []
	var reserved: Dictionary = {}
	for w in s.movingWalls:
		if w.get("path",[]).is_empty(): continue
		var ni: int = (int(w.get("index",0))+1)%w.path.size()
		var to: Dictionary = w.path[ni]
		if _atom_at(s,int(to.x),int(to.y)) >= 0: continue
		if not floor_at(s,int(to.x),int(to.y)) and (int(to.x) != int(w.x) or int(to.y) != int(w.y)): continue
		var destination: String = kxy(int(to.x),int(to.y))
		if reserve_destinations and reserved.has(destination): continue
		reserved[destination] = true
		plans.append({"w":w,"ni":ni,"to":to,"from":{"x":int(w.x),"y":int(w.y)}})
	for p in plans:
		s.grid[int(p.from.y)][int(p.from.x)] = false
		s.grid[int(p.to.y)][int(p.to.x)] = true
	for p in plans:
		p.w.x = p.to.x
		p.w.y = p.to.y
		p.w.index = p.ni

func _fresh_atom(x: int,y: int,element: String,photon: bool = false) -> Dictionary:
	var a: Dictionary = {"x":x,"y":y,"e":element,"frozen":false,"fire":false,"sticky":false,"zombie":false,"lightning":false,"zombieGen":0,"fragile":false,"fragileHits":0,"fragileMax":3}
	if photon: a.photonBoost = false
	return a

func _crosses(plan: Dictionary,x: int,y: int) -> bool:
	for p in plan.get("path",[]):
		if int(p.x) == x and int(p.y) == y: return true
	return false

func apply_replicator(s: Dictionary,normal: Dictionary,i: int) -> bool:
	var r: Variant = s.replicator
	if r == null or i < 0 or i >= s.atoms.size() or s.atoms.size() >= maxi(1,int(r.get("targetCount",0))) or not _crosses(normal,int(r.x),int(r.y)): return false
	if not floor_at(s,int(r.spawnX),int(r.spawnY)) or _atom_at(s,int(r.spawnX),int(r.spawnY)) >= 0: return false
	s.atoms.append(_fresh_atom(int(r.spawnX),int(r.spawnY),str(s.atoms[i].e)))
	return true

func apply_synthesizer(s: Dictionary,normal: Dictionary,i: int) -> Dictionary:
	var device: Variant = s.synthesizer
	if device == null or device.get("complete",false) or device.get("faulted",false) or i < 0 or i >= s.atoms.size() or not _crosses(normal,int(device.x),int(device.y)): return {"consumed":false,"event":"none"}
	var element: String = str(s.atoms[i].get("e",""))
	var buffer: Array = device.get("buffer",[])
	if element != str(device.inputA) and element != str(device.inputB):
		s.atoms.remove_at(i)
		device.buffer = []
		device.faulted = true
		return {"consumed":true,"event":"wrong","element":element}
	if buffer.is_empty():
		s.atoms.remove_at(i)
		device.buffer = [element]
		return {"consumed":true,"event":"stored","element":element}
	var pair: Array = [str(buffer[0]),element]
	var recipe: Array = [str(device.inputA),str(device.inputB)]
	pair.sort()
	recipe.sort()
	if pair != recipe:
		s.atoms.remove_at(i)
		device.buffer = []
		device.faulted = true
		return {"consumed":true,"event":"wrong-pair","element":element}
	var sx: int = int(device.spawnX)
	var sy: int = int(device.spawnY)
	if not floor_at(s,sx,sy) or _atom_at(s,sx,sy,[i]) >= 0: return {"consumed":false,"event":"blocked","element":element}
	s.atoms.remove_at(i)
	s.atoms.append(_fresh_atom(sx,sy,str(device.output),true))
	device.buffer = []
	device.complete = true
	return {"consumed":true,"event":"created","element":element,"output":str(device.output)}

func _rotate_chamber(s: Dictionary,chamber_index: int) -> bool:
	if chamber_index < 0 or chamber_index >= s.rotatingChambers.size(): return false
	var c: Dictionary = s.rotatingChambers[chamber_index]
	var n: int = int(c.size)
	var old: Array = []
	for ly in range(n):
		var row: Array = []
		for lx in range(n): row.append(not floor_at(s,int(c.x)+lx,int(c.y)+ly))
		old.append(row)
	for ly in range(n):
		for lx in range(n):
			var ny: int = int(c.y)+lx
			var nx: int = int(c.x)+n-1-ly
			if ny >= 0 and ny < s.grid.size() and nx >= 0 and nx < s.grid[ny].size(): s.grid[ny][nx] = old[ly][lx]
	for a in s.atoms:
		if int(a.x) < int(c.x) or int(a.x) >= int(c.x)+n or int(a.y) < int(c.y) or int(a.y) >= int(c.y)+n: continue
		var lx: int = int(a.x)-int(c.x)
		var ly: int = int(a.y)-int(c.y)
		a.x = int(c.x)+n-1-ly
		a.y = int(c.y)+lx
	c.turns = (int(c.get("turns",0))+1)%4
	s.rotatingChamber = s.rotatingChambers[0]
	return true

func rotate_chamber_state(s: Dictionary,chamber_index: int = 0) -> bool:
	if not _rotate_chamber(s,maxi(0,chamber_index)): return false
	update_fusion(s)
	pressure(s)
	return true

func precision_dest(s: Dictionary,i: int,d: int) -> Variant:
	if i < 0 or i >= s.atoms.size() or d < 0 or d > 3 or s.atoms[i].get("frozen",false): return null
	var g: Variant = group_for(s,i)
	if g != null:
		var plan: Variant = movement.rigid(s,g.members,i,d,true)
		return null if plan == null else plan.main
	if s.stickyMate.has(i) or s.linkedMate.has(i): return null
	var a: Dictionary = s.atoms[i]
	var delta: Vector2i = DIRS[d]
	var x: int = int(a.x)+delta.x
	var y: int = int(a.y)+delta.y
	if not floor_at(s,x,y) or s.barrierSet.has(kxy(x,y)) or _atom_at(s,x,y,[i]) >= 0 or not one_way_allows(s,int(a.x),int(a.y),x,y,d): return null
	return {"x":x,"y":y}

# Worker/search contract: null means the move cannot be used by a solution,
# including a valid move that shatters a fragile atom. Gameplay uses the wrapper
# below to retain the resulting board and report its failure explicitly.
func apply_action(state: Dictionary,i: int,d: int,target_key: String,chamber_index: int = 0) -> Variant:
	return _apply_action(state,i,d,target_key,chamber_index,false,false)

func apply_gameplay_action(state: Dictionary,i: int,d: int,target_key: String,chamber_index: int = 0,override_dest: Dictionary = {}) -> Variant:
	return _apply_action(state,i,d,target_key,chamber_index,false,true,override_dest)

func apply_precision(state: Dictionary,i: int,d: int,target_key: String) -> Variant:
	return _apply_action(state,i,d,target_key,0,true,true)

func _apply_action(state: Dictionary,i: int,d: int,target_key: String,chamber_index: int,precision: bool,gameplay: bool,override_dest: Dictionary = {}) -> Variant:
	var s: Dictionary = setup(snapshot(state))
	if i == -1 and d == 4 and not precision:
		var ci: int = maxi(0,chamber_index)
		if gameplay:
			if not _rotate_chamber(s,ci): return null
			melt(s)
			update_fusion(s)
			if goal(s,target_key): return s
			pressure(s)
		else:
			if not rotate_chamber_state(s,ci): return null
			if goal(s,target_key): return s
		move_walls(s,gameplay)
		return s
	if i < 0 or i >= s.atoms.size() or d < 0 or d > 3 or s.atoms[i].get("frozen",false): return null
	var from: Dictionary = {"x":int(s.atoms[i].x),"y":int(s.atoms[i].y)}
	var group: Variant = group_for(s,i)
	var pair: Variant = movement.rigid(s,group.members,i,d,precision) if group != null else null
	if not precision:
		if pair == null: pair = movement.sticky(s,i,s.stickyMate.get(i),d)
		if pair == null: pair = movement.linked(s,i,s.linkedMate.get(i),d)
	var bound: bool = group != null or s.stickyMate.has(i) or s.linkedMate.has(i)
	var normal: Variant = slide_plan(s,i,d) if pair == null and not bound and not precision else null
	var dest: Variant = pair.main if pair != null else (precision_dest(s,i,d) if precision and not bound else (normal.dest if normal != null else null))
	# Reactor beams shorten only the selected atom's planned destination in the
	# source runtime. Pair auxiliaries and path-triggered devices keep their plan.
	if gameplay and not override_dest.is_empty() and dest != null: dest = override_dest.duplicate()
	var barrier_hit: Variant = pair.get("barrierHit") if pair != null else (normal.get("barrierHit") if normal != null else null)
	if dest == null:
		if barrier_hit != null and not precision:
			s.barrierSet.erase(barrier_hit)
			return s
		return null
	s.atoms[i].x = dest.x
	s.atoms[i].y = dest.y
	if pair != null and pair.get("fusion",false):
		for member in pair.aux:
			s.atoms[int(member.i)].x = member.pos.x
			s.atoms[int(member.i)].y = member.pos.y
	elif pair != null and pair.has("j"):
		s.atoms[int(pair.j)].x = pair.mate.x
		s.atoms[int(pair.j)].y = pair.mate.y
	if normal != null and s.photonPad != null and normal.has("photonChargedAfter"): s.atoms[i].photonBoost = bool(normal.photonChargedAfter)
	if normal != null: apply_replicator(s,normal,i)
	collect_crystals(s,normal.path if normal != null and not normal.path.is_empty() else line_path(int(from.x),int(from.y),int(dest.x),int(dest.y)))
	update_enzyme_gate(s)
	if barrier_hit != null: s.barrierSet.erase(barrier_hit)
	var synth: Dictionary = apply_synthesizer(s,normal,i) if normal != null else {"consumed":false,"event":"none"}
	if not synth.consumed and group_for(s,i) == null:
		var p: Variant = s.portals.get(kxy(int(s.atoms[i].x),int(s.atoms[i].y)))
		if p != null and floor_at(s,int(p.toX),int(p.toY)) and _atom_at(s,int(p.toX),int(p.toY),[i]) < 0:
			s.atoms[i].x = int(p.toX)
			s.atoms[i].y = int(p.toY)
	if not synth.consumed:
		apply_rotation(s,i)
		lightning(s,i)
	melt(s)
	update_fusion(s)
	if goal(s,target_key): return s
	var a: Variant = s.atoms[i] if not synth.consumed else null
	if a != null and a.get("fragile",false):
		a.fragileHits = int(a.get("fragileHits",0))+1
		if int(a.fragileHits) >= (int(a.get("fragileMax",3)) if a.get("fragileMax",3) else 3):
			if not gameplay: return null
			a.fragileBroken = true
			s.fragileFailure = true
			return s
	if not synth.consumed:
		stick(s,i)
		zombie(s,i)
	pressure(s)
	move_walls(s,gameplay)
	return s
