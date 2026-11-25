extends SceneTree

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var script: Script = load("res://scripts/ui/board_view.gd")
	if script == null or not script.can_instantiate():
		push_error("Board renderer failed to load")
		quit(1)
		return
	var board = script.new()
	root.add_child(board)
	board.size = Vector2(420, 600)
	var grid: Array = []
	for y in range(10):
		var row: Array = []
		for x in range(8): row.append(x == 0 or y == 0 or x == 7 or y == 9)
		grid.append(row)
	var state: Dictionary = {"grid": grid, "atoms": [{"x": 6, "y": 3, "e": "H"}, {"x": 6, "y": 1, "e": "H"}], "portals": [{"x": 2, "y": 4, "id": "A", "toX": 5, "toY": 7}, {"x": 5, "y": 7, "id": "B", "toX": 2, "toY": 4}], "oneWays": [{"x": 3, "y": 6, "d": 1}], "rotationPads": [{"x": 3, "y": 3, "d": 1}], "barriers": [{"x": 4, "y": 6}], "repulsorCores": [{"x": 4, "y": 4}], "replicator": {"x": 2, "y": 6, "spawnX": 2, "spawnY": 7}, "synthesizer": {"x": 5, "y": 5, "spawnX": 5, "spawnY": 6, "inputA": "H", "inputB": "O", "output": "N"}, "photonPad": {"x": 5, "y": 2}, "crystals": [{"x": 1, "y": 7, "type": "catalyst"}], "enzymeGate": {"x": 1, "y": 5, "open": false}, "rotatingChambers": [{"x": 1, "y": 1, "size": 3, "id": "A"}]}
	board.set_state(state, {"_index": 0, "tier": 0}, {"f": "H₂", "bonds": ["H,H,1,0"]})
	await process_frame
	await process_frame
	assert(board.board_dimensions == Vector2i(8, 10))
	assert(board.cell_size > 0)
	var center: Vector2 = board.board_origin + Vector2(6.5, 3.5) * board.cell_size
	assert(board.nearest_atom(center) == 0)
	assert(board.cell_at(center) == Vector2i(6, 3))
	board.set_selected(0)
	assert(board.selected == 0)
	board.set_hint(0, 0)
	var after: Dictionary = state.duplicate(true)
	after.atoms[0].y = 2
	board.animate_action(state, after, {"i": 0, "d": 0})
	assert(board.interaction_locked)
	await create_timer(0.4).timeout
	assert(not board.interaction_locked)
	assert(board.state.atoms[0].y == 2)
	board.fx.burst("portal_enter", center)
	board.fx.burst("portal_exit", center)
	board.fx.burst("win", center)
	await process_frame
	assert(not board.fx.particles.is_empty())
	board.stop_animation()
	var badges: Array = ["frozen", "fire", "lightning", "zombie", "sticky", "fragile", "photonBoost", "linked"]
	var special: Dictionary = state.duplicate(true)
	special.atoms.clear()
	for index in range(badges.size()):
		var atom: Dictionary = {"x": 1 + index % 6, "y": 2 + index / 6, "e": "H", "fragileHits": 2}
		atom[badges[index]] = true
		special.atoms.append(atom)
	special.linkedPairs = [[0, 1]]
	special.stickyPairs = [[2, 3]]
	special.fusionGroups = [{"part": 0, "members": [4, 5]}]
	board.set_state(special, {"tier": 3}, {})
	await process_frame
	await process_frame
	board.fx.clear_effects()
	assert(board.fx.particles.is_empty())
	print("BOARD_RENDER_TEST_PASS")
	board.queue_free()
	quit(0)
