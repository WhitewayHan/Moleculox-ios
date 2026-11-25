extends SceneTree
const Session = preload("res://scripts/level_session.gd")
const Modes = preload("res://scripts/services/mode_catalog.gd")
const Duel = preload("res://scripts/training/duel_orchestrator.gd")
const Economy = preload("res://scripts/services/economy.gd")

class MemoryProgress extends Node:
	var save := {"profileId": "session_contract", "playerName": "Test", "cur": 801, "coins": 5000, "maxCoins": 5000, "researchAchievements": {"__coinEarned": 5000, "__coinSpent": 0, "__booster_hammer": 3}, "stars": {}, "totalHints": 0}
	var current_name := "Test"
	var escrow := 0
	func ensure_ledger(value: Dictionary) -> void:
		value.coins = maxi(0, int(value.researchAchievements.__coinEarned) - int(value.researchAchievements.__coinSpent))
	func persist() -> bool:
		ensure_ledger(save)
		return true
	func spend_coins(amount: int) -> bool:
		ensure_ledger(save)
		if amount < 1 or int(save.coins) < amount:
			return false
		save.researchAchievements.__coinSpent += amount
		ensure_ledger(save)
		return true
	func begin_hint_escrow(amount: int) -> bool:
		if not spend_coins(amount):
			return false
		escrow = amount
		return true
	func refund_hint_escrow() -> int:
		var returned := escrow
		save.researchAchievements.__coinSpent -= escrow
		escrow = 0
		ensure_ledger(save)
		return returned
	func commit_hint_escrow() -> bool:
		escrow = 0
		return true

var failures: Array[String] = []
var checks := 0
var session: Node
var progress: MemoryProgress
var economy: Node
var catalog: Node

func check(condition: bool, message: String) -> void:
	checks += 1
	if not condition:
		failures.append(message)
		push_error(message)

func _initialize() -> void:
	call_deferred("run")

func run() -> void:
	await process_frame
	catalog = root.get_node("Catalog")
	for name in ["Progress", "Economy"]:
		var existing := root.get_node_or_null(name)
		if existing != null:
			root.remove_child(existing)
			existing.free()
	progress = MemoryProgress.new()
	progress.name = "Progress"
	root.add_child(progress)
	economy = Economy.new()
	economy.name = "Economy"
	economy.progress_override = progress
	economy.auxiliary_directory = "/tmp/moleculox_session_contract_" + str(Time.get_ticks_usec())
	DirAccess.make_dir_recursive_absolute(economy.auxiliary_directory)
	root.add_child(economy)
	session = Session.new()
	root.add_child(session)
	session.set_process(false)
	var oracle: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/session-oracle.json"))
	for row in oracle.stars:
		check(Session.stars_for_moves(int(row.moves), int(row.par)) == int(row.value), "JS stars boundary mismatch")
	for row in oracle.chains:
		var route: Array = []
		route.resize(int(row.count))
		var actual: Array = session._build_chain_plan(route)
		check(JSON.parse_string(JSON.stringify(actual)) == row.plan, "JS chain plan mismatch at " + str(row.count))
	for row in oracle.daily:
		var challenge: Dictionary = Modes.daily_challenge(catalog, float(row.unixTime))
		check(int(challenge.themeIndex) == int(row.themeIndex) and int(challenge.poolIndex) == int(row.poolIndex) and str(challenge.variant) == str(row.variant) and str(challenge.dayId) == str(row.dayId), "JS UTC daily rotation mismatch " + str(row.dayId))
		check(challenge.options.level.m == row.molecule and challenge.options.level.a[0] == row.firstAtom and challenge.options.level.fs.size() == int(row.routeLength), "JS daily authoritative level mismatch " + str(row.dayId))
	for row in oracle.winners:
		check(Duel.round_winner(row.a, row.b, str(row.kind)) == int(row.winner), "JS duel winner mismatch")
	for row in oracle.gates:
		session.elapsed = float(row.elapsed)
		check(session.reactor_gate_active(row.gate) == bool(row.active), "JS reactor clock mismatch")
	for mode in ["classic", "crystal", "chain", "reactor"]:
		var choices: Array = Modes.eligible_indexes(catalog, mode)
		check(not choices.is_empty(), "Certified " + mode + " pool missing")
		for index in choices:
			check(not Modes.level_options(catalog, int(index), "duel", mode).get("snapshot", {}).is_empty(), "Eligible mode lacks initial state")
	await test_attempts()
	await test_chain()
	await test_hints()
	await test_duel()
	print("SESSION CONTRACTS: ", checks, " checks; ", failures.size(), " failures")
	quit(0 if failures.is_empty() else 1)

func fixture(atoms: Array = [], target: String = "X,0,0", par: int = 100, feature: String = "", route: Array = []) -> Dictionary:
	var grid: Array = []
	for y in range(7):
		var row: Array = []
		for x in range(7):
			row.append(x == 0 or y == 0 or x == 6 or y == 6)
		grid.append(row)
	if atoms.is_empty():
		atoms = [{"x": 1, "y": 1, "e": "H"}, {"x": 5, "y": 5, "e": "H"}]
	var snapshot := {"grid": grid, "atoms": atoms.duplicate(true), "targetKey": target}
	return {"snapshot": snapshot, "level": {"m": "H2", "p": par, "fs": route, "b": feature}}

func settle() -> void:
	if session.animation_busy:
		session.animation_finished()
	await process_frame

func test_attempts() -> void:
	var data := fixture()
	check(session.start_level(0, "campaign", data), "Synthetic campaign begins")
	check(not session.request_move(0, 0, true) and economy.balance() == 5000, "Blocked precision is free")
	check(session.request_move(0, 1, true) and economy.balance() == 4750, "Legal precision costs 250 only after validation")
	await settle()
	check(session.moves == 1 and session.assisted and int(session.state.atoms[0].x) == 2, "Precision moves exactly one tile and marks assistance")
	check(session.undo() and economy.balance() == 4750 and session.moves == 0 and session.assisted, "Undo restores board/count without refunding precision or clearing assistance")
	check(not session.place_barrier(1, 1) and economy.balance() == 4750, "Occupied barrier placement is free")
	check(session.place_barrier(2, 1) and economy.balance() == 4250 and session.barrier_used, "Nano Barrier costs 500 once per attempt")
	check(not session.place_barrier(3, 1) and economy.balance() == 4250, "Second Nano Barrier is prohibited")
	check(session.request_move(0, 1) and session.moves == 1 and session.state.barriers.is_empty() and not session.animation_busy, "Adjacent barrier impact counts one move and breaks without sliding")
	check(session.undo() and session.state.barriers.size() == 1 and session.barrier_used and economy.balance() == 4250, "Undo restores the barrier but not its allowance or coins")
	session.restart()
	check(not session.barrier_used and not session.assisted and session.state.get("barriers", []).is_empty(), "Restart restores attempt allowances and authoritative initial state")
	data = fixture()
	data.snapshot.grid[2][2] = true
	data.snapshot["breakableWalls"] = [{"x": 2, "y": 2, "broken": false}]
	session.start_level(0, "campaign", data)
	check(not session.hammer_wall(3, 3) and economy.booster_count("hammer") == 3, "Hammer rejects unmarked cells for free")
	check(session.hammer_wall(2, 2) and economy.booster_count("hammer") == 2 and not session.state.grid[2][2] and session.moves == 0, "Hammer consumes inventory without a move")
	check(not session.hammer_wall(2, 2) and economy.booster_count("hammer") == 2, "Broken wall cannot consume another Hammer")
	# Time-dependent reactor contact does not enter moveLog/history. Undo retains
	# impacts as debt and does not erase elapsed time or penalties.
	data = fixture()
	data.snapshot["reactorGates"] = [{"x": 2, "y": 1, "period": 1800, "safeMs": 820, "phase": 0}]
	session.start_level(0, "reactor", data)
	session.elapsed = 1.0
	check(not session.request_move(0, 1) and session.moves == 1 and session.reactor_hits == 1 and session.reactor_penalty == 3.0 and session.history.is_empty(), "Adjacent active reactor beam counts impact/move/+3 seconds")
	session.elapsed = 1.85
	check(session.request_move(0, 1), "Safe reactor phase permits movement")
	await settle()
	session.elapsed = 2.9
	check(session.request_move(0, 3), "Unrelated movement remains legal")
	await settle()
	check(session.undo() and session.moves == 2 and session.reactor_penalty == 3.0 and session.reactor_hits == 1, "Reactor undo preserves penalty and earlier impact debt")
	data = fixture()
	data.snapshot["reactorGates"] = [{"x": 4, "y": 1, "period": 1800, "safeMs": 820, "phase": 0}]
	session.start_level(0, "reactor", data)
	session.elapsed = 1.0
	check(session.request_move(0, 1) and int(session.state.atoms[0].x) == 3 and session.reactor_hits == 0 and session.reactor_penalty == 0, "Distant beam truncates movement without impact penalty")
	await settle()
	check(bool(session.move_log[0].reactorPartial), "Reactor truncation invalidates certified hint prefix")
	data.level.b = "reactor"
	session.start_level(0, "campaign", data)
	session.elapsed = 1.0
	session.state.reactorGates[0].x = 2
	check(not session.request_move(0, 1) and session.reactor_penalty == 0, "Campaign reactor contacts never add timer penalty")
	var fragile := [{"x": 1, "y": 1, "e": "H", "fragile": true, "fragileHits": 2, "fragileMax": 3}, {"x": 5, "y": 5, "e": "H"}]
	session.start_level(0, "campaign", fixture(fragile))
	check(session.request_move(0, 1), "Genuine fragile failure still accepts and animates the legal move")
	await settle()
	check(session.failed_attempt and bool(session.state.atoms[0].fragileBroken), "Third nonwinning impact produces genuine failure")
	check(session.undo() and not session.failed_attempt and int(session.state.atoms[0].fragileHits) == 2, "Undo recovers the unbroken fragile state before timed restart")
	fragile[1].x = 5
	fragile[1].y = 2
	session.start_level(0, "campaign", fixture(fragile, "H,0,0|H,0,1"))
	check(session.request_move(0, 1), "Third-impact winning move accepted")
	await settle()
	check(session.finished and not session.failed_attempt and int(session.state.atoms[0].fragileHits) == 2, "Victory precedes fragile third-hit failure")
	data = fixture([], "X,0,0", 1)
	session.start_level(0, "campaign", data)
	check(session.hard_move_cap() == 6, "Campaign allows exactly three zero-star moves beyond ceil(PAR*2.3)")
	for direction in [1, 2, 3, 0, 1, 2]:
		check(session.request_move(0, direction), "Move cap test accepts legal move")
		await settle()
	check(session.moves == 0 and session.move_log.is_empty() and not session.finished, "Unsolved third zero-star move automatically restarts")
	for mode in ["crystal", "chain", "reactor", "duel"]:
		session.start_level(0, mode, fixture())
		session.pause("menu")
		session._process(100.0)
		check(not session.finished and session.elapsed == 0.0, "Pause freezes " + mode + " clock")
		session.resume("menu")
		session._process(90.0)
		check(session.finished and not bool(session.result_snapshot(false).completed), "90-second " + mode + " timeout")

func test_chain() -> void:
	var route := [[0, 1], [0, 2], [0, 3], [0, 0]]
	for mode in ["chain", "campaign"]:
		var data := fixture([], "X,0,0", 100, "chain" if mode == "campaign" else "", route)
		session.start_level(0, mode, data)
		check(session.request_move(0, 1), "Charged chain action begins")
		check(session.chain_auto_active and session.chain_reactions == 1 and session.chain_auto_moves == 1 and session.chain_max_combo == 2, "Chain records source combo at the trigger")
		check(not session.undo(), "Chain cannot be interrupted by undo")
		session.animation_finished()
		await create_timer(.12).timeout
		check(session.animation_busy, "Chain queues the certified next action asynchronously")
		await settle()
		check(session.history.size() == 1 and session.moves == (2 if mode == "campaign" else 1) and session.move_log.size() == (2 if mode == "campaign" else 1), "Chain bonus counts a manual trigger while campaign counts automatic actions; both undo as one group")
		check(session.undo() and session.moves == 0 and session.chain_reactions == 0 and session.chain_auto_moves == 0 and session.chain_step == 0, "Undo restores the complete chain group and counters")

func test_hints() -> void:
	# Exact hint is validated against the current board before payment.
	var atoms := [{"x": 1, "y": 1, "e": "H"}, {"x": 5, "y": 2, "e": "H"}]
	var data := fixture(atoms, "H,0,0|H,0,1", 3, "", [[0, 1]])
	session.start_level(0, "campaign", data)
	var coins: int = economy.balance()
	session.request_hint(false, {"cost": 200})
	check(economy.balance() == coins - 200 and session.hint_count == 1 and session.assisted and session.moves == 0, "Legal exact hint costs source price and never performs the move")
	session.start_level(0, "campaign", fixture(atoms, "H,0,0|H,0,1", 3, "", [[0, 0]]))
	coins = economy.balance()
	session.request_hint(false, {"cost": 200})
	check(economy.balance() == coins and session.hint_count == 0, "Invalid certified action never charges")
	session.start_level(0, "campaign", data)
	session.request_hint(false, {"kind": "strategic"})
	check(economy.balance() == coins and session.hint_count == 1, "Strategic clue consumes a free per-experiment allowance")
	session.restart()
	session.request_hint(false, {"kind": "strategic"})
	check(session.hint_count == 0 and economy.balance() == coins, "Strategic allowance survives restart")
	session.start_level(0, "campaign", data)
	session.hint_count = 2
	session.request_hint(true, {"cost": 900})
	check(session.auto_solving and progress.escrow == 900 and economy.balance() == coins - 900, "Verified full route begins recoverable escrow")
	session.restart()
	check(not session.auto_solving and progress.escrow == 0 and economy.balance() == coins, "Restart refunds interrupted full solution escrow")
	session.hint_count = 2
	session.request_hint(true, {"cost": 900})
	session._process(.2)
	check(session.animation_busy, "Full solution performs native actions incrementally")
	await settle()
	check(session.finished and not session.auto_solving and progress.escrow == 0 and economy.balance() == coins - 900, "Completed full solution settles its charge")
	# Off-route hint uses the exact current board, with bounded per-frame A*.
	data = fixture(atoms, "H,0,0|H,0,1", 3)
	session.start_level(0, "campaign", data)
	coins = economy.balance()
	session.request_hint(false, {"charge": false, "maxNodes": 3000})
	check(not session._hint_search.is_empty() and session.hint_count == 0, "Off-route search begins without charging")
	for frame in range(100):
		if session._hint_search.is_empty():
			break
		session._advance_hint_search()
	check(session._hint_search.is_empty() and session.hint_count == 1 and economy.balance() == coins, "Incremental native solver verifies off-route legal hint")

func test_duel() -> void:
	var duel: Node = Duel.new()
	root.add_child(duel)
	duel.setup(session, catalog)
	check(duel.start_local(["Ada", "Bert"], "mixed", "medium"), "Local mixed duel starts from exported certified pool")
	check(duel.state.rounds.size() == 3 and session.mode == "duel", "Local duel has exactly three rounds")
	var index: int = session.level_index
	session.moves = 7
	session.restart()
	check(session.moves == 7 and session.level_index == index, "User restart is disabled during duel")
	for round_index in range(2):
		duel.finish_turn({"seconds": 10, "moves": 4, "chainMaxCombo": 3, "chainReactions": 4, "reactorHits": 0}, true)
		check(duel.next_turn() and int(duel.state.turn) == 1, "Same-device duel hands identical board to player two")
		duel.finish_turn({"seconds": 90, "moves": 8, "chainMaxCombo": 1, "reactorHits": 4}, false)
		if round_index == 0:
			check(duel.next_turn() and int(duel.state.round) == 1 and int(duel.state.turn) == 0, "Duel advances to next round")
	check(bool(duel.state.finished) and int(duel.state.winner) == 0 and int(duel.state.wins[0]) == 2 and int(duel.state.round) == 1, "First two round wins finish match early without ranked rewards")
	duel.quit()
	duel.free()
