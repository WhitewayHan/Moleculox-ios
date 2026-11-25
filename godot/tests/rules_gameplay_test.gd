extends SceneTree

const Rules = preload("res://scripts/rules/molecule_rules.gd")
var rules: RefCounted = Rules.new()
var checks: int = 0
var failures: int = 0

func check(ok: bool,label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr(label)

func base(atoms: Array) -> Dictionary:
	var grid: Array = []
	for y in range(6):
		var row: Array = []
		for x in range(7): row.append(x == 0 or y == 0 or x == 6 or y == 5)
		grid.append(row)
	return rules.setup({"grid":grid,"atoms":atoms,"targetKey":"NO-TARGET"})

func _initialize() -> void:
	var s: Dictionary = base([{"x":1,"y":1,"e":"H","fragile":true,"fragileHits":2,"fragileMax":3},{"x":4,"y":4,"e":"O"}])
	check(rules.apply_action(s,0,1,"NO-TARGET") == null,"Search excludes fragile failure")
	var failed: Dictionary = rules.apply_gameplay_action(s,0,1,"NO-TARGET")
	check(failed.atoms[0].x == 5 and failed.atoms[0].fragileHits == 3 and failed.atoms[0].fragileBroken,"Gameplay retains settled fragile failure")
	check(failed.fragileFailure and rules.snapshot(failed).fragileFailure,"Snapshot retains failure state")
	check(s.atoms[0].x == 1 and s.atoms[0].fragileHits == 2,"Actions preserve input state")
	var success_key: String = rules.norm_goal([{"x":5,"y":1,"e":"H"},{"x":4,"y":4,"e":"O"}])
	var success: Dictionary = rules.apply_gameplay_action(s,0,1,success_key)
	check(rules.goal(success,success_key) and success.atoms[0].fragileHits == 2 and not success.get("fragileFailure",false),"Goal precedes fragile impact")
	var precise: Dictionary = rules.apply_precision(s,0,1,"NO-TARGET")
	check(precise.atoms[0].x == 2 and precise.fragileFailure,"Precision preserves fragile failure after one tile")
	s = base([{"x":1,"y":1,"e":"H"},{"x":3,"y":3,"e":"O"}])
	s.rifts["2,1"] = {"x":2,"y":1,"toX":4,"toY":4}
	s.photonPad = {"x":2,"y":1}
	s.replicator = {"x":2,"y":1,"spawnX":1,"spawnY":4,"targetCount":3}
	precise = rules.apply_precision(s,0,1,"NO-TARGET")
	check(precise.atoms[0].x == 2 and precise.atoms[0].y == 1,"Precision bypasses rift continuation")
	check(not precise.atoms[0].get("photonBoost",false) and precise.atoms.size() == 2,"Precision does not activate photon or replication")
	s.barrierSet["2,1"] = true
	check(rules.apply_precision(s,0,1,"NO-TARGET") == null and s.barrierSet.has("2,1"),"Blocked precision does not break barriers")

	s = base([{"x":1,"y":1,"e":"H"},{"x":2,"y":1,"e":"O"}])
	s.fusionGroups = [{"part":0,"members":[0.0,1.0]}]
	s = rules.setup(rules.snapshot(s))
	precise = rules.apply_precision(s,0,2,"NO-TARGET")
	check(precise.atoms[0].y == 2 and precise.atoms[1].y == 2,"Precision moves a complete rigid group one tile")
	s.fusionGroups = []
	s.linkedPairs = [[0,1]]
	s = rules.setup(rules.snapshot(s))
	check(rules.apply_precision(s,0,2,"NO-TARGET") == null,"Linked pair precision is unavailable")
	s.linkedPairs = []
	s.stickyPairs = [[0,1]]
	s = rules.setup(rules.snapshot(s))
	check(rules.apply_precision(s,0,2,"NO-TARGET") == null,"Sticky pair precision is unavailable")

	s = base([{"x":1,"y":1,"e":"H","fire":true},{"x":3,"y":1,"e":"O","frozen":true,"zombie":true,"zombieGen":2}])
	s.rotatingChambers = [{"id":"A","x":1,"y":1,"size":2,"turns":0}]
	s = rules.setup(rules.snapshot(s))
	var rotated_worker: Dictionary = rules.apply_action(s,-1,4,"NO-TARGET")
	var rotated_game: Dictionary = rules.apply_gameplay_action(s,-1,4,"NO-TARGET")
	check(rotated_worker.atoms[1].frozen,"Search retains worker chamber melt semantics")
	check(not rotated_game.atoms[1].frozen and not rotated_game.atoms[1].zombie and rotated_game.atoms[1].zombieGen == 0,"Gameplay chamber rotation melts and cures adjacent atoms")
	check(rotated_game.rotatingChambers[0].turns == 1,"Chamber turn state increments")

	s = base([{"x":1,"y":1,"e":"H"},{"x":2,"y":4,"e":"O"}])
	s.crystals = [{"x":5,"y":1,"collected":false}]
	var limited: Dictionary = rules.apply_gameplay_action(s,0,1,"NO-TARGET",0,{"x":3,"y":1})
	check(limited.atoms[0].x == 3,"Reactor override shortens selected atom destination")
	check(limited.crystals[0].collected,"Reactor keeps source path-triggered crystal semantics")

	s = base([{"x":1,"y":1,"e":"H"},{"x":2,"y":4,"e":"O"}])
	s.movingWalls = [{"x":2,"y":2,"index":0,"path":[{"x":2,"y":2},{"x":3,"y":2}]},{"x":4,"y":2,"index":0,"path":[{"x":4,"y":2},{"x":3,"y":2}]}]
	s.grid[2][2] = true
	s.grid[2][4] = true
	var worker_walls: Dictionary = rules.apply_action(s,0,1,"NO-TARGET")
	var gameplay_walls: Dictionary = rules.apply_gameplay_action(s,0,1,"NO-TARGET")
	check(worker_walls.movingWalls[0].x == 3 and worker_walls.movingWalls[1].x == 3,"Search preserves worker simultaneous wall semantics")
	check(gameplay_walls.movingWalls[0].x == 3 and gameplay_walls.movingWalls[1].x == 4,"Gameplay reserves simultaneous moving wall destinations")

	print("Native gameplay rules: ",checks," checks, ",failures," failures")
	quit(0 if failures == 0 else 1)
