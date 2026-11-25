class_name MoleculoxSession
extends Node
## Owns an attempt; the pure rules engine never owns time, money or presentation.
signal state_changed(snapshot: Dictionary)
signal action_started(before: Dictionary, after: Dictionary, action: Dictionary)
signal action_rejected(index: int, direction: int, reason: String)
signal completed(result: Dictionary)
signal failed(reason: String)
signal hint_ready(action: Array)
signal clock_changed(seconds: float)
signal assistance_requested(kind: String, payload: Dictionary)
signal hint_failed(reason: String, proven_dead_end: bool)
signal assistance_changed
signal attempt_restarted(reason: String)

const DIRECTIONS := [Vector2i.UP, Vector2i.RIGHT, Vector2i.DOWN, Vector2i.LEFT]
var state: Dictionary = {}
var level: Dictionary = {}
var molecule: Dictionary = {}
var level_index: int = -1
var mode: String = "campaign"
var feature: String = ""
var moves: int = 0
var history: Array = []
var move_log: Array = []
var elapsed: float = 0.0
var reactor_penalty: float = 0.0
var reactor_hits: int = 0
var finished: bool = false
var failed_attempt: bool = false
var assisted: bool = false
var route_assisted: bool = false
var hint_count: int = 0
var game_type: String = "classic"
var day_id: String = ""
var auto_solving: bool = false
var chain_auto_active: bool = false
var barrier_used: bool = false
var animation_busy: bool = false
var chain_step: int = 0
var chain_plan: Array = []
var chain_queue: Array = []
var chain_max_combo: int = 1
var chain_reactions: int = 0
var chain_auto_moves: int = 0
var _pauses: Dictionary = {}
var _rules: Variant
var _initial: Dictionary = {}
var _generation: int = 0
var _pending_result: Dictionary = {}
var _hint_search: Dictionary = {}
var _bonus_meta: Dictionary = {}
var _start_options: Dictionary = {}
var _hint_options: Dictionary = {}
var _solution: Array = []
var _solution_cursor: int = 0
var _solution_wait: float = 0.0
var _solution_gate_waits: int = 0
var _solution_retries: int = 0
var _executing_solution: bool = false
var _fragile_restart_left: float = -1.0
var _synth_history_origin: int = -1
var _goal_layouts: Array = []

func _ready() -> void:
	if ResourceLoader.exists("res://scripts/rules/molecule_rules.gd"):
		_rules = load("res://scripts/rules/molecule_rules.gd").new()

func start_level(index: int, play_mode: String = "campaign", options: Dictionary = {}) -> bool:
	if _rules == null and ResourceLoader.exists("res://scripts/rules/molecule_rules.gd"):
		_rules = load("res://scripts/rules/molecule_rules.gd").new()
	var catalog: Node = get_node_or_null("/root/Catalog")
	if _rules == null or catalog == null or index < 0 or index >= catalog.levels.size():
		failed.emit("Source content or native rules are unavailable.")
		return false
	if not options.has("snapshot"):
		var defaults: Dictionary = load("res://scripts/services/mode_catalog.gd").level_options(catalog, index, play_mode, str(options.get("gameType", "")))
		defaults.merge(options, true)
		options = defaults
	cancel_hint("level-changed")
	_start_options = options.duplicate(true)
	level_index = index
	mode = play_mode
	game_type = str(options.get("gameType", play_mode if play_mode in ["crystal", "chain", "reactor"] else "classic"))
	day_id = str(options.get("dayId", ""))
	level = options.get("level", catalog.levels[index]).duplicate(true)
	var initial: Dictionary = options.get("snapshot", catalog.get_snapshot(index)).duplicate(true)
	if initial.is_empty():
		failed.emit("Missing authoritative level snapshot: " + str(index + 1))
		return false
	feature = str(level.get("b", "")) if mode == "campaign" or (mode == "daily" and bool(level.get("dailyAdvancedMechanics", false))) else ""
	molecule = catalog.get_molecule(str(level.get("m", "")))
	if not initial.has("targetKey"):
		initial["targetKey"] = str(molecule.get("key", ""))
	_generation += 1
	_initial = initial.duplicate(true)
	state = initial
	moves = 0
	elapsed = 0.0
	reactor_penalty = 0.0
	reactor_hits = 0
	finished = false
	failed_attempt = false
	assisted = false
	route_assisted = false
	hint_count = 0
	auto_solving = false
	chain_auto_active = false
	_fragile_restart_left = -1.0
	_synth_history_origin = -1
	barrier_used = false
	animation_busy = false
	history.clear()
	move_log.clear()
	_pauses.clear()
	_hint_search.clear()
	chain_step = 0
	chain_queue.clear()
	chain_max_combo = 1
	chain_reactions = 0
	chain_auto_moves = 0
	_bonus_meta = options.get("modePlan", {}).duplicate(true)
	chain_plan = _bonus_meta.get("chainPlan", _bonus_meta.get("chain", _build_chain_plan(level.get("fs", [])))) if _chain_active() else []
	chain_step = 0 if _chain_active() else -1
	if game_type == "crystal":
		state["crystals"] = _bonus_meta.get("crystals", _bonus_meta.get("crystalLayout", state.get("crystals", []))).duplicate(true)
	if game_type == "reactor":
		state["reactorGates"] = _bonus_meta.get("reactorPlan", _bonus_meta.get("reactor", state.get("reactorGates", []))).duplicate(true)
	_initial = state.duplicate(true)
	state_changed.emit(state)
	clock_changed.emit(0.0)
	return true

func restart(force: bool = false) -> void:
	if mode == "duel" and not force:
		return
	var options := _start_options.duplicate(true)
	options.merge({"level": level, "snapshot": _initial, "modePlan": _bonus_meta}, true)
	start_level(level_index, mode, options)

func pause(reason: String = "menu") -> void:
	_pauses[reason] = true

func resume(reason: String = "menu") -> void:
	_pauses.erase(reason)

func _process(delta: float) -> void:
	if level_index < 0 or finished:
		return
	# Hint computation keeps yielding even while a modal pauses the attempt clock.
	if not _hint_search.is_empty():
		_advance_hint_search()
	if not _pauses.is_empty():
		return
	elapsed += maxf(0.0, delta)
	clock_changed.emit(elapsed + reactor_penalty)
	if time_limit() > 0.0 and elapsed + reactor_penalty >= time_limit():
		_finish_timeout()
		return
	if _fragile_restart_left >= 0.0:
		_fragile_restart_left -= delta
		if _fragile_restart_left <= 0.0 and failed_attempt and mode != "duel":
			restart(true)
			attempt_restarted.emit("fragile")
	if auto_solving and not animation_busy and not chain_auto_active:
		_solution_wait -= delta
		if _solution_wait <= 0.0:
			_play_solution_step()

func time_limit() -> float:
	return 90.0 if mode in ["crystal", "chain", "reactor", "duel"] else 0.0

func remaining_seconds() -> float:
	return maxf(0.0, time_limit() - elapsed - reactor_penalty) if time_limit() > 0.0 else 0.0

func _finish_timeout() -> void:
	cancel_hint("timeout")
	finished = true
	animation_busy = false
	chain_queue.clear()
	chain_auto_active = false
	_pending_result = result_snapshot(false)
	failed.emit("timeout")

func request_move(index: int, direction: int, precision: bool = false, automatic: bool = false) -> bool:
	if finished or animation_busy or failed_attempt or _rules == null or not _pauses.is_empty() or (chain_auto_active and not automatic) or (auto_solving and not _executing_solution and not automatic):
		return false
	if index == -1 and direction == 4:
		return rotate_chamber(0)
	var atoms: Array = state.get("atoms", [])
	if index < 0 or index >= atoms.size() or direction < 0 or direction > 3:
		return false
	if bool(atoms[index].get("frozen", false)):
		action_rejected.emit(index, direction, "frozen")
		return false
	if hard_move_cap() > 0 and moves >= hard_move_cap():
		_restart_at_cap()
		return false
	if precision and not assistance_available("precision"):
		return false
	var before := state.duplicate(true)
	var internal: Dictionary = _rules.setup(before)
	var plan: Dictionary = _move_plan(internal, index, direction, precision)
	var route_path: Array = plan.get("path", [])
	var laser: Dictionary = _first_active_laser(route_path)
	if not laser.is_empty() and int(laser.get("index", -1)) == 0:
		moves += 1
		reactor_hits += 1
		if feature != "reactor":
			reactor_penalty += 3.0
		action_rejected.emit(index, direction, "reactor")
		state_changed.emit(state)
		clock_changed.emit(elapsed + reactor_penalty)
		return false
	if plan.get("dest") == null and plan.get("barrierHit") != null and not precision:
		_push_history()
		moves += 1
		move_log.append({"i": index, "d": direction, "barrier": true})
		var barrier_key := str(plan.barrierHit)
		var barriers: Array = state.get("barriers", [])
		for barrier_index in range(barriers.size() - 1, -1, -1):
			if str(int(barriers[barrier_index].x)) + "," + str(int(barriers[barrier_index].y)) == barrier_key:
				barriers.remove_at(barrier_index)
		state_changed.emit(state)
		return true
	var next_internal: Variant
	if precision:
		next_internal = _rules.apply_precision(internal, index, direction, str(state.get("targetKey", "")))
	else:
		var override_dest: Dictionary = route_path[int(laser.index) - 1] if not laser.is_empty() else {}
		next_internal = _rules.apply_gameplay_action(internal, index, direction, str(state.get("targetKey", "")), 0, override_dest)
	if next_internal == null:
		action_rejected.emit(index, direction, "blocked")
		return false
	if precision and not _consume_precision():
		action_rejected.emit(index, direction, "insufficient_funds")
		return false
	var after: Dictionary = _rules.snapshot(next_internal)
	_preserve_visual_metadata(after, before)
	if not automatic:
		_push_history()
	if not automatic or feature == "chain":
		moves += 1
		move_log.append({"i": index, "d": direction, "precision": precision, "reactorPartial": not laser.is_empty(), "barrier": bool(plan.get("dest") == null and plan.get("barrierHit") != null)})
	if precision:
		assisted = true
		route_assisted = true
		assistance_changed.emit()
	_update_chain(index, direction, automatic)
	if automatic and auto_solving and _solution_cursor < _solution.size():
		var solution_step: Array = _solution[_solution_cursor]
		if int(solution_step[0]) == index and int(solution_step[1]) == direction:
			_solution_cursor += 1
	_track_synth_history(before, after)
	state = after
	var action: Dictionary = {"i": index, "d": direction, "precision": precision, "plan": plan, "routePath": route_path, "mobile": _is_mobile(), "mode": mode}
	animation_busy = true
	action_started.emit(before, state, action)
	return true

func rotate_chamber(index: int) -> bool:
	if animation_busy or finished or failed_attempt or _rules == null or not _pauses.is_empty() or chain_auto_active or (auto_solving and not _executing_solution):
		return false
	if hard_move_cap() > 0 and moves >= hard_move_cap() and not auto_solving:
		_restart_at_cap()
		return false
	var before := state.duplicate(true)
	var next: Variant = _rules.apply_gameplay_action(_rules.setup(before), -1, 4, str(state.get("targetKey", "")), index)
	if next == null:
		return false
	_push_history(true)
	moves += 1
	move_log.append({"i": -1, "d": 4, "chamberIndex": index})
	state = _rules.snapshot(next)
	_preserve_visual_metadata(state, before)
	animation_busy = true
	action_started.emit(before, state, {"i": -1, "d": 4, "chamberIndex": index, "mobile": _is_mobile(), "mode": mode})
	return true

func animation_finished() -> void:
	if not animation_busy:
		return
	animation_busy = false
	state_changed.emit(state)
	if _rules.goal(_rules.setup(state), str(state.get("targetKey", ""))):
		_finish_success()
		return
	if bool(state.get("fragileFailure", false)) or _has_broken_fragile():
		failed_attempt = true
		chain_queue.clear()
		chain_auto_active = false
		cancel_hint("fragile")
		_fragile_restart_left = 1.3
		failed.emit("fragile")
		return
	if hard_move_cap() > 0 and moves >= hard_move_cap():
		_restart_at_cap()
		return
	if not chain_queue.is_empty():
		var step: Array = chain_queue.pop_front()
		var generation := _generation
		await get_tree().create_timer(.07 if _is_mobile() else .11).timeout
		if generation == _generation and not finished:
			if not request_move(int(step[0]), int(step[1]), false, true):
				chain_queue.clear()
				chain_auto_active = false
	else:
		chain_auto_active = false

func _restart_at_cap() -> void:
	failed.emit("move_cap")
	restart(true)
	attempt_restarted.emit("move_cap")

func _has_broken_fragile() -> bool:
	for atom in state.get("atoms", []):
		if bool(atom.get("fragileBroken", false)):
			return true
	return false

func result_snapshot(success: bool = true) -> Dictionary:
	return {"level": level_index, "mode": mode, "gameType": game_type, "moves": moves, "seconds": minf(90.0, elapsed + reactor_penalty) if time_limit() > 0.0 else elapsed + reactor_penalty, "time": minf(90.0, elapsed + reactor_penalty) if success else 90.0, "completed": success, "stars": stars_for_moves(moves, int(level.get("p", 1))) if success else 0, "assisted": assisted, "hints": hint_count, "dayId": day_id, "par": int(level.get("p", 1)), "minimum": int(level.get("mn", level.get("p", 1))), "reactorHits": reactor_hits, "hits": reactor_hits, "reactorPenalty": reactor_penalty, "penalty": reactor_penalty, "chainMaxCombo": chain_max_combo, "maxCombo": chain_max_combo, "chainReactions": chain_reactions, "reactions": chain_reactions, "chainAutoMoves": chain_auto_moves, "autoMoves": chain_auto_moves, "molecule": str(level.get("m", "")), "moveLog": move_log.duplicate(true)}

func _finish_success() -> void:
	if finished:
		return
	finished = true
	chain_queue.clear()
	chain_auto_active = false
	if auto_solving:
		var progress := get_node_or_null("/root/Progress")
		if progress != null and progress.has_method("commit_hint_escrow"):
			progress.commit_hint_escrow()
		auto_solving = false
	_solution.clear()
	_hint_search.clear()
	_pending_result = result_snapshot(true)
	completed.emit(_pending_result)

func undo() -> bool:
	if animation_busy or finished or history.is_empty() or chain_auto_active or auto_solving:
		return false
	var entry: Dictionary = history.pop_back()
	var broken_walls: Array = state.get("breakableWalls", []).duplicate(true)
	state = entry.state.duplicate(true)
	if not broken_walls.is_empty():
		state["breakableWalls"] = broken_walls
		if not bool(entry.get("chamber", false)):
			for wall in broken_walls:
				if bool(wall.get("broken", false)):
					state.grid[int(wall.y)][int(wall.x)] = false
	var impact_debt := maxi(0, reactor_hits - int(entry.get("reactorHits", 0))) if _reactor_active() else 0
	moves = int(entry.moves) + impact_debt
	move_log = entry.log.duplicate(true)
	chain_step = int(entry.chainStep)
	chain_queue.clear()
	chain_max_combo = int(entry.chainMax)
	chain_reactions = int(entry.chainReactions)
	chain_auto_moves = int(entry.chainAuto)
	failed_attempt = false
	_fragile_restart_left = -1.0
	_synth_history_origin = int(entry.get("synthOrigin", -1))
	state_changed.emit(state)
	return true

func _push_history(chamber: bool = false) -> void:
	history.append({"state": state.duplicate(true), "moves": moves, "log": move_log.duplicate(true), "reactorHits": reactor_hits, "chainStep": chain_step, "chainMax": chain_max_combo, "chainReactions": chain_reactions, "chainAuto": chain_auto_moves, "synthOrigin": _synth_history_origin, "chamber": chamber})

func _preserve_visual_metadata(after: Dictionary, before: Dictionary) -> void:
	for key in ["breakableWalls", "wallPalette", "background", "chainPlan", "campaignFeature", "targetKey", "objectiveType"]:
		if before.has(key) and not after.has(key):
			after[key] = before[key].duplicate(true) if before[key] is Array or before[key] is Dictionary else before[key]

func hard_move_cap() -> int:
	if mode != "campaign" or level_index < 0:
		return 0
	return int(ceil(maxi(1, int(level.get("p", 1))) * 2.3)) + 3

static func stars_for_moves(count: int, par: int) -> int:
	return 3 if count <= par else 2 if count <= int(ceil(par * 1.7)) else 1 if count <= int(ceil(par * 2.3)) else 0

func _is_mobile() -> bool:
	return minf(get_viewport().get_visible_rect().size.x, get_viewport().get_visible_rect().size.y) < 760.0

func _reactor_active() -> bool:
	return game_type == "reactor" or feature == "reactor"

func reactor_gate_active(gate: Dictionary) -> bool:
	var period := maxf(1.0, float(gate.get("period", 1800)))
	return fposmod(elapsed * 1000.0 + float(gate.get("phase", 0)), period) >= float(gate.get("safeMs", 820))

func _first_active_laser(cells: Array) -> Dictionary:
	if not _reactor_active():
		return {}
	for i in range(cells.size()):
		for gate in state.get("reactorGates", []):
			if int(gate.x) == int(cells[i].x) and int(gate.y) == int(cells[i].y) and reactor_gate_active(gate):
				return {"index": i, "gate": gate}
	return {}

func _build_chain_plan(route: Array) -> Array:
	var count := route.size()
	if count < 4:
		return []
	var specifications := [[.08, 1], [.42, 2], [.74, 1]] if count >= 9 else [[.08, 1], [.52, 2]] if count >= 6 else [[0, 1], [.56, 1]]
	var result: Array = []
	var last_end := -1
	for spec in specifications:
		var trigger := int(floor((count - 1) * float(spec[0])))
		if trigger <= last_end:
			trigger = last_end + 1
		if trigger >= count - 1:
			continue
		var automatic_count := mini(int(spec[1]), count - trigger - 1)
		if automatic_count < 1:
			continue
		result.append({"trigger": trigger, "autoCount": automatic_count})
		last_end = trigger + automatic_count
	return result

func _update_chain(index: int, direction: int, automatic: bool) -> void:
	if not _chain_active():
		return
	var route: Array = level.get("fs", [])
	if chain_step < 0 or chain_step >= route.size():
		return
	var expected: Array = route[chain_step]
	var prior_step := chain_step
	if int(expected[0]) == index and int(expected[1]) == direction:
		chain_step += 1
	else:
		chain_step = -1
		return
	if automatic:
		return
	for point in chain_plan:
		if int(point.trigger) == prior_step:
			var count := int(point.autoCount)
			chain_auto_active = true
			chain_max_combo = maxi(chain_max_combo, 1 + count)
			chain_reactions += 1
			chain_auto_moves += count
			for i in range(prior_step + 1, mini(route.size(), prior_step + count + 1)):
				chain_queue.append(route[i].duplicate())
			break

func _chain_active() -> bool:
	return game_type == "chain" or feature == "chain"

func _move_plan(internal: Dictionary, index: int, direction: int, precision: bool = false) -> Dictionary:
	var group: Variant = _rules.group_for(internal, index)
	var pair: Variant = _rules.movement.rigid(internal, group.members, index, direction, precision) if group != null else null
	if not precision:
		if pair == null:
			pair = _rules.movement.sticky(internal, index, internal.stickyMate.get(index), direction)
		if pair == null:
			pair = _rules.movement.linked(internal, index, internal.linkedMate.get(index), direction)
	if pair != null:
		var result: Dictionary = pair.duplicate(true)
		result["dest"] = pair.get("main")
		result["path"] = _rules.line_path(int(internal.atoms[index].x), int(internal.atoms[index].y), int(pair.main.x), int(pair.main.y)) if pair.get("main") != null else []
		return result
	if group != null or internal.stickyMate.has(index) or internal.linkedMate.has(index):
		return {"dest": null, "path": []}
	if precision:
		var dest: Variant = _rules.precision_dest(internal, index, direction)
		return {"dest": dest, "path": [dest] if dest != null else []}
	return _rules.slide_plan(internal, index, direction)

func assistance_available(kind: String) -> bool:
	if level_index < 0 or finished or animation_busy or failed_attempt or auto_solving or chain_auto_active:
		return false
	match kind:
		"precision":
			return mode not in ["duel", "daily", "chain", "reactor"]
		"barrier":
			return mode not in ["duel", "daily"] and not barrier_used
		"hammer":
			if mode in ["duel", "daily"]:
				return false
			for wall in state.get("breakableWalls", []):
				if not bool(wall.get("broken", false)):
					return true
			return false
		"hint", "strategic", "exact", "full":
			return mode not in ["duel", "chain", "reactor"]
		"restart":
			return mode != "duel"
	return false

func barrier_cell_available(x: int, y: int) -> bool:
	var grid: Array = state.get("grid", [])
	if grid.is_empty() or y <= 0 or y >= grid.size() - 1 or x <= 0 or x >= grid[y].size() - 1 or bool(grid[y][x]):
		return false
	for field in ["atoms", "portals", "oneWays", "barriers"]:
		for cell in state.get(field, []):
			if int(cell.x) == x and int(cell.y) == y:
				return false
	return true

func place_barrier(x: int, y: int) -> bool:
	if not assistance_available("barrier") or not barrier_cell_available(x, y):
		return false
	var economy := get_node_or_null("/root/Economy")
	if economy == null or not economy.consume_barrier():
		return false
	if not state.has("barriers"):
		state["barriers"] = []
	state.barriers.append({"x": x, "y": y})
	barrier_used = true
	assisted = true
	route_assisted = true
	_cancel_search("board-changed")
	assistance_changed.emit()
	state_changed.emit(state)
	return true

func hammer_wall(x: int, y: int) -> bool:
	if not assistance_available("hammer"):
		return false
	var target: Dictionary = {}
	for wall in state.get("breakableWalls", []):
		if int(wall.x) == x and int(wall.y) == y and not bool(wall.get("broken", false)):
			target = wall
			break
	if target.is_empty() or not bool(state.grid[y][x]):
		return false
	var economy := get_node_or_null("/root/Economy")
	if economy == null or not economy.spend_booster("hammer", 1):
		return false
	target["broken"] = true
	state.grid[y][x] = false
	assisted = true
	route_assisted = true
	_cancel_search("board-changed")
	assistance_changed.emit()
	state_changed.emit(state)
	return true

func _consume_precision() -> bool:
	var economy := get_node_or_null("/root/Economy")
	return economy != null and economy.consume_precision()

func _track_synth_history(before: Dictionary, after: Dictionary) -> void:
	var previous: Variant = before.get("synthesizer")
	var next: Variant = after.get("synthesizer")
	if previous == null or next == null:
		return
	var previous_buffer: Array = previous.get("buffer", [])
	var next_buffer: Array = next.get("buffer", [])
	if previous_buffer.is_empty() and next_buffer.size() == 1 and _synth_history_origin < 0:
		_synth_history_origin = maxi(0, history.size() - 1)
	if not bool(previous.get("complete", false)) and bool(next.get("complete", false)):
		if _synth_history_origin >= 0 and _synth_history_origin < history.size():
			history.resize(_synth_history_origin + 1)
		_synth_history_origin = -1

func certified_route_progress(route: Array, allow_assistance: bool = false) -> int:
	if route.is_empty() or (route_assisted and not allow_assistance) or move_log.size() > route.size():
		return -1
	for i in range(move_log.size()):
		var log: Dictionary = move_log[i]
		var step: Array = route[i]
		if int(log.i) != int(step[0]) or int(log.d) != int(step[1]) or bool(log.get("precision", false)) or bool(log.get("barrier", false)) or bool(log.get("reactorPartial", false)):
			return -1
		if int(step[0]) == -1 and int(step[1]) == 4 and int(log.get("chamberIndex", 0)) != (int(step[2]) if step.size() > 2 else 0):
			return -1
	return move_log.size()

# Paid hints never mutate economy until an actual legal action/complete route is
# available. The solver is the shipped weighted A* with a small per-frame budget.
func request_hint(full_solution: bool = false, options: Dictionary = {}) -> void:
	if not assistance_available("hint") or not _hint_search.is_empty():
		return
	_hint_options = options.duplicate(true)
	_hint_options["kind"] = str(options.get("kind", "full" if full_solution else "exact"))
	_hint_options["autoplay"] = bool(options.get("autoplay", full_solution))
	var route: Array = level.get("fs", [])
	var progress := certified_route_progress(route)
	if progress >= 0 and progress < route.size():
		var path: Array = route.slice(progress)
		_deliver_hint(path)
		return
	var is_full := str(_hint_options.kind) == "full"
	var max_nodes := clampi(int(options.get("maxNodes", 95000 if is_full else 70000)), 2000, 120000)
	var max_depth := clampi(int(options.get("maxDepth", 26 if is_full else 22)), 2, 30)
	var internal: Dictionary = _rules.setup(state)
	if _rules.goal(internal, str(state.get("targetKey", ""))):
		_hint_failed("already-complete")
		return
	_goal_layouts = _build_goal_layouts(str(state.get("targetKey", "")), internal.grid[0].size(), internal.grid.size())
	var start_key: String = _rules.state_key(internal)
	_hint_search = {"open": [], "seen": {start_key: 0}, "nodes": 0, "max": max_nodes, "depth": max_depth, "depthCut": false, "generation": _generation, "stateKey": start_key, "started": Time.get_ticks_msec(), "timeout": maxi(1800, int(options.get("timeout", 7000 if is_full else 5600))), "prefer": route.slice(move_log.size(), move_log.size() + 2)}
	_heap_push(_hint_search.open, {"state": internal, "g": 0, "f": _heuristic(internal), "path": []})

func _validate_hint_path(path: Array, require_goal: bool) -> bool:
	if path.is_empty():
		return false
	var internal: Dictionary = _rules.setup(state)
	for step in path:
		if not step is Array or step.size() < 2:
			return false
		var next: Variant = _rules.apply_action(internal, int(step[0]), int(step[1]), str(state.get("targetKey", "")), int(step[2]) if step.size() > 2 else 0)
		if next == null:
			return false
		internal = next
		if not require_goal:
			return true
	return _rules.goal(internal, str(state.get("targetKey", "")))

func _deliver_hint(path: Array) -> void:
	var kind: String = str(_hint_options.get("kind", "exact"))
	var full: bool = kind == "full"
	if not _validate_hint_path(path, full):
		_hint_failed("unplayable")
		return
	var economy := get_node_or_null("/root/Economy")
	var progress := get_node_or_null("/root/Progress")
	var should_charge := bool(_hint_options.get("charge", true))
	var costs: Dictionary = economy.hint_costs(hint_count) if economy != null else {"move": 50, "full": 200}
	var cost := maxi(0, int(_hint_options.get("cost", costs.get("full" if full else "move", 0))))
	if kind == "strategic":
		# Free strategic allowance belongs to the current profile and experiment.
		if economy == null or not economy.has_method("consume_free_strategic_hint") or not economy.consume_free_strategic_hint(mode, day_id if mode == "daily" else str(level_index)):
			_hint_failed("allowance-used")
			return
	elif should_charge:
		if economy == null or progress == null:
			_hint_failed("economy-unavailable")
			return
		if full:
			if not economy.full_solution_hint_unlocked(hint_count, moves, int(level.get("p", 1))):
				_hint_failed("locked")
				return
			if not progress.begin_hint_escrow(cost):
				_hint_failed("insufficient_funds")
				return
		elif bool(_hint_options.get("free", false)) or economy.quantum_hint_available():
			if not economy.consume_quantum_hint():
				_hint_failed("allowance-used")
				return
		elif not economy.spend(cost, "exact-hint"):
			_hint_failed("insufficient_funds")
			return
	assisted = true
	hint_count += 1
	if progress != null:
		progress.save["totalHints"] = int(progress.save.get("totalHints", 0)) + 1
		progress.persist()
	assistance_changed.emit()
	if full:
		if bool(_hint_options.get("autoplay", true)):
			_solution = path.duplicate(true)
			_solution_cursor = 0
			_solution_wait = .12
			_solution_gate_waits = 0
			_solution_retries = 0
			auto_solving = true
		else:
			# A route preview is not a completed purchased autoplay transaction.
			if progress != null and should_charge:
				progress.refund_hint_escrow()
		hint_ready.emit(["route", path.duplicate(true)])
	elif kind == "strategic":
		var step: Array = path[0]
		hint_ready.emit(["strategic", int(step[0]), "vertical" if int(step[1]) in [0, 2] else "horizontal", int(step[2]) if step.size() > 2 else 0])
	else:
		hint_ready.emit(path[0].duplicate())
	_hint_options.clear()

func _play_solution_step() -> void:
	if finished:
		return
	if _solution_cursor >= _solution.size():
		cancel_hint("incomplete")
		return
	var step: Array = _solution[_solution_cursor]
	if int(step[0]) >= 0 and _reactor_active():
		var internal: Dictionary = _rules.setup(state)
		var plan := _move_plan(internal, int(step[0]), int(step[1]))
		if not _first_active_laser(plan.get("path", [])).is_empty():
			_solution_gate_waits += 1
			if _solution_gate_waits > 40:
				cancel_hint("gate-timeout")
			else:
				_solution_wait = .12
			return
	_solution_gate_waits = 0
	_executing_solution = true
	var accepted := rotate_chamber(int(step[2]) if step.size() > 2 else 0) if int(step[0]) == -1 and int(step[1]) == 4 else request_move(int(step[0]), int(step[1]))
	_executing_solution = false
	if accepted:
		_solution_cursor += 1
		_solution_retries = 0
		_solution_wait = .12
	else:
		_solution_retries += 1
		if _solution_retries > 4:
			cancel_hint("unplayable")
		else:
			_solution_wait = .18

func cancel_hint(reason: String = "cancelled") -> void:
	_cancel_search(reason)
	if auto_solving:
		var progress := get_node_or_null("/root/Progress")
		if progress != null and progress.has_method("refund_hint_escrow"):
			progress.refund_hint_escrow()
		auto_solving = false
	_solution.clear()
	_hint_options.clear()

func _cancel_search(reason: String) -> void:
	if not _hint_search.is_empty():
		_hint_search.clear()
		hint_failed.emit(reason, false)

func _hint_failed(reason: String, proven_dead_end: bool = false) -> void:
	_hint_search.clear()
	_hint_options.clear()
	hint_failed.emit(reason, proven_dead_end)
	hint_ready.emit([])

func _advance_hint_search() -> void:
	if _generation != int(_hint_search.generation) or _rules.state_key(_rules.setup(state)) != str(_hint_search.stateKey):
		_hint_failed("board-changed")
		return
	var started := Time.get_ticks_usec()
	var open: Array = _hint_search.open
	while not open.is_empty() and Time.get_ticks_usec() - started < 2500:
		if int(_hint_search.nodes) >= int(_hint_search.max):
			_hint_failed("node-budget")
			return
		if Time.get_ticks_msec() - int(_hint_search.started) >= int(_hint_search.timeout):
			_hint_failed("timeout")
			return
		var current: Dictionary = _heap_pop(open)
		_hint_search.nodes = int(_hint_search.nodes) + 1
		if int(current.g) >= int(_hint_search.depth):
			_hint_search.depthCut = true
			continue
		for action in _search_actions(current.state, int(current.g)):
			var next: Variant = _rules.apply_action(current.state, int(action[0]), int(action[1]), str(state.get("targetKey", "")), int(action[2]) if action.size() > 2 else 0)
			if next == null:
				continue
			var path: Array = current.path.duplicate()
			path.append(action)
			if _rules.goal(next, str(state.get("targetKey", ""))):
				_hint_search.clear()
				_deliver_hint(path)
				return
			var key: String = _rules.state_key(next)
			var depth := int(current.g) + 1
			if int(_hint_search.seen.get(key, 2147483647)) <= depth:
				continue
			_hint_search.seen[key] = depth
			_heap_push(open, {"state": next, "g": depth, "f": depth + _heuristic(next) * 1.35, "path": path})
	if open.is_empty():
		var depth_cut := bool(_hint_search.depthCut)
		_hint_failed("depth-budget" if depth_cut else "dead-end", not depth_cut)

func _search_actions(internal: Dictionary, depth: int) -> Array:
	var actions: Array = []
	var chambers: Array = internal.get("rotatingChambers", [])
	for i in range(chambers.size()):
		actions.append([-1, 4, i] if chambers.size() > 1 else [-1, 4])
	var rigid_seen: Dictionary = {}
	for i in range(internal.atoms.size()):
		if bool(internal.atoms[i].get("frozen", false)):
			continue
		var group: Variant = _rules.group_for(internal, i)
		var representative := i
		if group != null:
			if rigid_seen.has(group.part):
				continue
			rigid_seen[group.part] = true
			for candidate in group.members:
				if not bool(internal.atoms[int(candidate)].get("frozen", false)) and not bool(internal.atoms[int(candidate)].get("fragile", false)):
					representative = int(candidate)
					break
		for direction in range(4):
			actions.append([representative, direction])
	var prefer: Array = _hint_search.get("prefer", [])
	if not prefer.is_empty():
		var preferred: Array = prefer[mini(depth, prefer.size() - 1)]
		for i in range(actions.size()):
			var action: Array = actions[i]
			if int(action[0]) == int(preferred[0]) and int(action[1]) == int(preferred[1]) and (int(action[0]) != -1 or (int(action[2]) if action.size() > 2 else 0) == (int(preferred[2]) if preferred.size() > 2 else 0)):
				actions.remove_at(i)
				actions.push_front(action)
				break
	return actions

func _build_goal_layouts(target: String, width: int, height: int) -> Array:
	var cells: Array = []
	var max_x := 0
	var max_y := 0
	for value in target.split("|", false):
		var bits := value.split(",")
		if bits.size() != 3:
			continue
		var cell := {"e": bits[0], "x": int(bits[1]), "y": int(bits[2])}
		cells.append(cell)
		max_x = maxi(max_x, cell.x)
		max_y = maxi(max_y, cell.y)
	var layouts: Array = []
	for y in range(height - max_y):
		for x in range(width - max_x):
			var layout: Dictionary = {}
			for cell in cells:
				if not layout.has(cell.e):
					layout[cell.e] = []
				layout[cell.e].append({"x": int(cell.x) + x, "y": int(cell.y) + y})
			layouts.append(layout)
	return layouts

func _heuristic(internal: Dictionary) -> float:
	var best := INF
	var synth: Variant = internal.get("synthesizer")
	for layout in _goal_layouts:
		var cost := 0.0
		for i in range(internal.atoms.size()):
			var atom: Dictionary = internal.atoms[i]
			var destinations: Array = layout.get(atom.e, [])
			var minimum := INF
			for destination in destinations:
				minimum = minf(minimum, (1.0 if int(atom.x) != int(destination.x) else 0.0) + (1.0 if int(atom.y) != int(destination.y) else 0.0) + .045 * (absi(int(atom.x) - int(destination.x)) + absi(int(atom.y) - int(destination.y))))
			if destinations.is_empty() and synth != null and not bool(synth.get("complete", false)) and not bool(synth.get("faulted", false)) and str(atom.e) in [str(synth.inputA), str(synth.inputB)]:
				minimum = .65 + .04 * (absi(int(atom.x) - int(synth.x)) + absi(int(atom.y) - int(synth.y)))
			var group: Variant = _rules.group_for(internal, i)
			cost += minimum / float(group.members.size() if group != null else 1)
			if cost >= best:
				break
		best = minf(best, cost)
	var synth_pending := (.35 if not synth.get("buffer", []).is_empty() else .8) if synth != null and not bool(synth.get("complete", false)) and not bool(synth.get("faulted", false)) else 0.0
	var remaining_crystals := 0
	var frozen := 0
	for crystal in internal.get("crystals", []):
		if not bool(crystal.get("collected", false)):
			remaining_crystals += 1
	for atom in internal.atoms:
		if bool(atom.get("frozen", false)):
			frozen += 1
	return best + synth_pending + remaining_crystals * .7 + frozen * .3

func _heap_push(heap: Array, entry: Dictionary) -> void:
	heap.append(entry)
	var index := heap.size() - 1
	while index > 0:
		var parent := (index - 1) >> 1
		if float(heap[parent].f) <= float(entry.f):
			break
		heap[index] = heap[parent]
		index = parent
	heap[index] = entry

func _heap_pop(heap: Array) -> Dictionary:
	var result: Dictionary = heap[0]
	var last: Dictionary = heap.pop_back()
	if not heap.is_empty():
		var index := 0
		while true:
			var left := index * 2 + 1
			if left >= heap.size():
				break
			var right := left + 1
			var child := right if right < heap.size() and float(heap[right].f) < float(heap[left].f) else left
			if float(heap[child].f) >= float(last.f):
				break
			heap[index] = heap[child]
			index = child
		heap[index] = last
	return result
