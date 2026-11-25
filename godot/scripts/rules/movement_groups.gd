class_name MovementGroups
extends RefCounted

# Exact R180 shared JavaScript movement semantics; JSON member indices are
# normalized because Godot Array.has() distinguishes floats from integers.
const VERSION: int = 180

const DIRS: Array = [Vector2i(0,-1), Vector2i(1,0), Vector2i(0,1), Vector2i(-1,0)]

func key(x: int, y: int) -> String:
	return str(x) + "," + str(y)

func floor_at(s: Dictionary, x: int, y: int) -> bool:
	return y >= 0 and y < s.grid.size() and x >= 0 and x < s.grid[y].size() and s.grid[y][x] == false

func one_way(s: Dictionary, fx: int, fy: int, tx: int, ty: int, d: int) -> bool:
	var a: Variant = s.oneWays.get(key(fx,fy))
	var b: Variant = s.oneWays.get(key(tx,ty))
	return not (a != null and int(a.d) != d) and not (b != null and int(b.d) != d)

func occupied(s: Dictionary, x: int, y: int, excluded: Array) -> bool:
	for j in range(s.atoms.size()):
		if not excluded.has(j) and int(s.atoms[j].x) == x and int(s.atoms[j].y) == y:
			return true
	return false

func rigid(s: Dictionary, members: Array, i: int, d: int, single_step: bool = false) -> Variant:
	if members.size() < 2 or d < 0 or d > 3: return null
	var indices: Array = []
	for member in members: indices.append(int(member))
	var cur: Dictionary = {}
	for member in indices:
		var k: int = int(member)
		if k < 0 or k >= s.atoms.size() or s.atoms[k].get("frozen",false): return null
		cur[k] = {"x": int(s.atoms[k].x), "y": int(s.atoms[k].y)}
	var delta: Vector2i = DIRS[d]
	var moved: bool = false
	var barrier_hit: Variant = null
	for _step in range(1 if single_step else 32):
		var next: Dictionary = {}
		var stop: bool = false
		for member in indices:
			var k: int = int(member)
			var p: Dictionary = cur[k]
			var nx: int = int(p.x) + delta.x
			var ny: int = int(p.y) + delta.y
			if s.barrierSet.has(key(nx,ny)):
				barrier_hit = key(nx,ny)
				stop = true
			if not floor_at(s,nx,ny) or occupied(s,nx,ny,indices) or not one_way(s,int(p.x),int(p.y),nx,ny,d): stop = true
			next[k] = {"x":nx,"y":ny}
		if stop: break
		cur = next
		moved = true
	if not moved and barrier_hit == null: return null
	var aux: Array = []
	for member in indices:
		if int(member) != i: aux.append({"i":int(member),"pos":cur[int(member)]})
	return {"fusion":true,"members":indices.duplicate(),"main":cur.get(i) if moved else null,"aux":aux,"barrierHit":barrier_hit}

func linked(s: Dictionary, i: int, j: Variant, d: int) -> Variant:
	if j == null or d < 0 or d > 3 or i < 0 or int(j) < 0 or i >= s.atoms.size() or int(j) >= s.atoms.size(): return null
	j = int(j)
	if s.atoms[i].get("frozen",false) or s.atoms[j].get("frozen",false): return null
	var delta: Vector2i = DIRS[d]
	var start_i: Dictionary = {"x":int(s.atoms[i].x),"y":int(s.atoms[i].y)}
	var start_j: Dictionary = {"x":int(s.atoms[j].x),"y":int(s.atoms[j].y)}
	var pi: Dictionary = start_i.duplicate()
	var pj: Dictionary = start_j.duplicate()
	var ai: bool = true
	var aj: bool = true
	var barrier_hit: Variant = null
	for _step in range(32):
		if not ai and not aj: break
		var ni: Dictionary = {"x":int(pi.x)+delta.x,"y":int(pi.y)+delta.y}
		var nj: Dictionary = {"x":int(pj.x)+delta.x,"y":int(pj.y)+delta.y}
		if (ai and s.barrierSet.has(key(ni.x,ni.y))) or (aj and s.barrierSet.has(key(nj.x,nj.y))):
			barrier_hit = key(ni.x,ni.y) if ai and s.barrierSet.has(key(ni.x,ni.y)) else key(nj.x,nj.y)
			break
		var ci: bool = ai and floor_at(s,ni.x,ni.y) and not occupied(s,ni.x,ni.y,[i,j]) and one_way(s,pi.x,pi.y,ni.x,ni.y,d)
		var cj: bool = aj and floor_at(s,nj.x,nj.y) and not occupied(s,nj.x,nj.y,[i,j]) and one_way(s,pj.x,pj.y,nj.x,nj.y,d)
		if ci and cj and ni == nj: ci = false; cj = false
		if ci and ni == pj and not cj: ci = false
		if cj and nj == pi and not ci: cj = false
		if ci: pi = ni
		else: ai = false
		if cj: pj = nj
		else: aj = false
	var moved: bool = pi != start_i or pj != start_j
	return {"j":j,"main":pi if moved else null,"mate":pj,"barrierHit":barrier_hit} if moved or barrier_hit != null else null

func sticky(s: Dictionary, i: int, j: Variant, d: int) -> Variant:
	if j == null: return null
	var plan: Variant = rigid(s,[i,int(j)],i,d)
	if plan == null: return null
	return {"j":int(j),"main":plan.main,"mate":plan.aux[0].pos,"sticky":true,"barrierHit":plan.barrierHit}
