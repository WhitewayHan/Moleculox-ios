extends SceneTree

var checks := 0
var failures: Array = []

func _initialize() -> void:
	call_deferred("_run")

func check(value: bool, message: String) -> void:
	checks += 1
	if not value:
		failures.append(message)
		push_error(message)

func _run() -> void:
	var progress: Node = root.get_node("Progress")
	progress._path = "user://main-flow-test-profiles.json"
	progress._backup_path = "user://main-flow-test-backup.json"
	progress.profiles = {"Integration":progress.defaults()}
	progress.current_name = "Integration"
	progress.save = progress.profiles.Integration
	progress.save.playerName = "Integration"
	progress.save.profileId = "test-main-flow"
	progress.save.tutorialDone = true
	progress.save.tutorialTips = false
	var scene: PackedScene = load("res://scenes/main.tscn")
	var game: Control = scene.instantiate()
	root.add_child(game)
	await process_frame
	await process_frame
	check(game.current_screen == "studio","Original studio screen must open first")
	check(game.online != null,"Native online orchestration must be installed")
	game.menus.navigate.emit("boot")
	await process_frame
	check(game.current_screen == "boot","Studio -> boot navigation")
	game.menus.navigate.emit("splash")
	await process_frame
	game.menus.navigate.emit("levels")
	for frame in 26: await process_frame
	check(game.current_screen == "levels","Menu -> 801-level chooser")
	game.menus.level_chosen.emit(0)
	await process_frame
	check(game.current_screen == "story" and game.story_view.visible,"Level story opens before campaign")
	game.story_view._finish(true)
	await process_frame
	check(game.current_screen == "game" and game.session.level_index == 0,"Story -> native game board")
	check(not game.board.interaction_locked,"Board must accept the first move")
	check(game.board.board_dimensions == Vector2i(8,10),"Original 8x10 board geometry")
	var catalog: Node = root.get_node("Catalog")
	var route: Array = catalog.levels[0].fs
	for step in route:
		game.board.action_requested.emit(int(step[0]),int(step[1]))
		await create_timer(.6).timeout
	check(game.session.finished,"Real native animation completion must finish the first level")
	check(int(progress.save.stars.get("0",0)) == 3,"First level earned three stars")
	check(int(progress.save.cur) == 1,"Second level unlocked")
	check(int(progress.save.bestMoves.get("0",0)) == route.size(),"Original best move count saved")
	await create_timer(3.7).timeout
	check(is_instance_valid(game._dialog),"Completion dialog is visible")
	game.start_level(1,true)
	await process_frame
	var initial: Dictionary = game.session.state.duplicate(true)
	var next_route: Array = catalog.levels[1].fs
	game.board.action_requested.emit(int(next_route[0][0]),int(next_route[0][1]))
	await create_timer(.6).timeout
	check(game.session.moves == 1,"Second level accepts a move")
	game.hud.action.emit("undo")
	await process_frame
	check(game.session.moves == 0 and game.session.state.atoms == initial.atoms,"HUD undo restores native state")
	game.hud.action.emit("settings")
	await process_frame
	check(game.menus.visible and game.board.interaction_locked,"Settings pauses board input")
	game.menus.close_modal()
	await process_frame
	check(not game.menus.visible and not game.board.interaction_locked,"Closing settings resumes board")
	game.start_level(780,true)
	await process_frame
	check(game.session.state.atoms.size() == catalog.snapshots[780].atoms.size(),"Advanced level loads complete atom data")
	check(game.board.level_index == 780,"Advanced board uses correct level index")
	for mode in ["crystal","chain","reactor","daily"]:
		game._choose_mode(mode)
		await process_frame
		check(game.session.mode == mode,"Mode routing: "+mode)
		check(not game.session.state.atoms.is_empty(),"Mode atoms: "+mode)
	game.show_screen("splash")
	game._start_tutorial(1)
	await process_frame
	check(game.session.mode == "tutorial","Original two-puzzle tutorial opens")
	game.show_screen("splash")
	await process_frame
	check(game.current_screen == "splash","Return home from a live game")
	game.queue_free()
	await process_frame
	print("MAIN FLOW: %d checks; %d failures" % [checks,failures.size()])
	quit(0 if failures.is_empty() else 1)
