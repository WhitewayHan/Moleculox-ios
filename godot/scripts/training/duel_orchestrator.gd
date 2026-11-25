class_name MoleculoxDuel
extends Node
## Same-device matches use the original 3-round / first-to-two rules. Online
## transport remains server-authoritative; no local result can award ranked DP.
signal turn_ready(context: Dictionary)
signal turn_completed(context: Dictionary)
signal round_completed(context: Dictionary)
signal match_completed(context: Dictionary)
signal error(message: String)
const Modes = preload("res://scripts/services/mode_catalog.gd")
var state: Dictionary = {}
var active: bool = false
var _session: Node
var _catalog: Node

func setup(session: Node, catalog: Node) -> void:
	_session = session
	_catalog = catalog
	if not session.completed.is_connected(_on_completed):
		session.completed.connect(_on_completed)
	if not session.failed.is_connected(_on_failed):
		session.failed.connect(_on_failed)

func start_local(players: Array, game_kind: String = "classic", difficulty: String = "mixed") -> bool:
	if _session == null or _catalog == null:
		return false
	var names := [str(players[0]).strip_edges().left(14) if players.size() > 0 else "Player 1", str(players[1]).strip_edges().left(14) if players.size() > 1 else "Player 2"]
	for i in range(2):
		if names[i].is_empty():
			names[i] = "Player " + str(i + 1)
	var rounds := build_rounds(game_kind, difficulty)
	if rounds.size() != 3:
		error.emit("No certified boards are available for this duel.")
		return false
	state = {"players": names, "gameKind": game_kind, "difficulty": difficulty, "round": 0, "turn": 0, "wins": [0, 0], "turnFinished": false, "rounds": rounds, "winner": -1, "finished": false}
	active = true
	return _start_turn()

func build_rounds(game_kind: String, difficulty: String) -> Array:
	var types: Array = [game_kind, game_kind, game_kind]
	if game_kind not in ["classic", "crystal", "chain", "reactor"]:
		types = ["classic", "crystal", "chain", "reactor"]
		types.shuffle()
		types.resize(3)
	var recent := Modes.recent_levels()
	var seeds := Modes.eligible_indexes(_catalog, "classic", difficulty, [], true)
	var fresh: Array = []
	var fallback: Array = []
	for index in seeds:
		if recent.has(int(index)):
			fallback.append(index)
		else:
			fresh.append(index)
	fresh.shuffle()
	fallback.shuffle()
	seeds = fresh + fallback
	if seeds.size() < 3:
		return []
	var used: Array = []
	var rounds: Array = []
	for i in range(3):
		var game_type := str(types[i])
		var choices := Modes.eligible_indexes(_catalog, game_type, difficulty, recent + used, true)
		if choices.is_empty():
			choices = Modes.eligible_indexes(_catalog, game_type, difficulty, used, true)
		if choices.is_empty():
			return []
		var index := int(seeds[i])
		if not choices.has(index):
			index = int(choices[randi() % choices.size()])
		var options := Modes.level_options(_catalog, index, "duel", game_type)
		if options.is_empty():
			return []
		used.append(index)
		var plan: Dictionary = options.get("modePlan", {})
		rounds.append({"level": index, "gameType": game_type, "crystals": plan.get("crystalLayout"), "chainPlan": plan.get("chainPlan"), "reactorPlan": plan.get("reactorPlan"), "results": [null, null], "winner": null})
	Modes.remember_levels(used)
	return rounds

func _start_turn() -> bool:
	if not active or bool(state.finished):
		return false
	state.turnFinished = false
	var round: Dictionary = state.rounds[int(state.round)]
	var options := Modes.level_options(_catalog, int(round.level), "duel", str(round.gameType))
	if options.is_empty():
		return false
	var plan: Dictionary = options.get("modePlan", {})
	for key in ["crystals", "chainPlan", "reactorPlan"]:
		if round.get(key) != null:
			plan[key] = round[key].duplicate(true)
	options["modePlan"] = plan
	if not _session.start_level(int(round.level), "duel", options):
		return false
	turn_ready.emit(context())
	return true

func context() -> Dictionary:
	var result := state.duplicate(true)
	if not state.is_empty():
		var current: Dictionary = state.rounds[int(state.round)]
		result["level"] = current.level
		result["gameType"] = current.gameType
	return result

func next_turn() -> bool:
	if not active or not bool(state.turnFinished) or bool(state.finished):
		return false
	if int(state.turn) == 0:
		state.turn = 1
	else:
		state.round = int(state.round) + 1
		state.turn = 0
	return _start_turn()

func _on_completed(result: Dictionary) -> void:
	if active and _session.mode == "duel":
		finish_turn(result, true)

func _on_failed(reason: String) -> void:
	if active and _session.mode == "duel" and reason == "timeout":
		finish_turn(_session.result_snapshot(false), false)

func finish_turn(result: Dictionary, solved: bool) -> void:
	if not active or bool(state.get("turnFinished", false)):
		return
	state.turnFinished = true
	var round: Dictionary = state.rounds[int(state.round)]
	var safe_time := minf(90.0, maxf(0.0, float(result.get("seconds", result.get("time", 90.0))))) if solved else 90.0
	round.results[int(state.turn)] = {"time": safe_time, "moves": int(result.get("moves", 0)), "completed": solved, "maxCombo": int(result.get("chainMaxCombo", result.get("maxCombo", 1))) if round.gameType == "chain" else 1, "reactions": int(result.get("chainReactions", result.get("reactions", 0))) if round.gameType == "chain" else 0, "autoMoves": int(result.get("chainAutoMoves", result.get("autoMoves", 0))) if round.gameType == "chain" else 0, "hits": int(result.get("reactorHits", result.get("hits", 0))) if round.gameType == "reactor" else 0, "penalty": float(result.get("reactorPenalty", result.get("penalty", 0))) if round.gameType == "reactor" else 0}
	if int(state.turn) == 0:
		turn_completed.emit(context())
		return
	var winner := round_winner(round.results[0], round.results[1], str(round.gameType))
	round.winner = winner
	if winner >= 0:
		state.wins[winner] = int(state.wins[winner]) + 1
	if int(state.wins[0]) >= 2 or int(state.wins[1]) >= 2 or int(state.round) >= 2:
		state.finished = true
		state.winner = 0 if int(state.wins[0]) > int(state.wins[1]) else 1 if int(state.wins[1]) > int(state.wins[0]) else -1
		match_completed.emit(context())
	else:
		round_completed.emit(context())

static func round_winner(a: Dictionary, b: Dictionary, game_type: String) -> int:
	if bool(a.completed) != bool(b.completed):
		return 0 if bool(a.completed) else 1
	if game_type == "chain":
		for key in ["maxCombo", "reactions"]:
			var default_value := 1 if key == "maxCombo" else 0
			if int(a.get(key, default_value)) != int(b.get(key, default_value)):
				return 0 if int(a.get(key, default_value)) > int(b.get(key, default_value)) else 1
	if game_type == "reactor" and int(a.get("hits", 0)) != int(b.get("hits", 0)):
		return 0 if int(a.get("hits", 0)) < int(b.get("hits", 0)) else 1
	if not bool(a.completed) and not bool(b.completed):
		return 0 if int(a.moves) < int(b.moves) else 1 if int(b.moves) < int(a.moves) else -1
	var at := int(floor(float(a.time) * 10.0 + .5))
	var bt := int(floor(float(b.time) * 10.0 + .5))
	if at != bt:
		return 0 if at < bt else 1
	return 0 if int(a.moves) < int(b.moves) else 1 if int(b.moves) < int(a.moves) else -1

func quit() -> void:
	active = false
	if _session != null and _session.mode == "duel":
		_session.pause("duel-exit")
	state.clear()
