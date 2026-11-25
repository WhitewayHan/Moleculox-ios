extends Control
## Application router. Gameplay, menus and original assets are rendered by Godot.
const UI = preload("res://scripts/ui/ui_theme.gd")
const Menus = preload("res://scripts/ui/menu_screens.gd")
const Board = preload("res://scripts/ui/board_view.gd")
const HUD = preload("res://scripts/ui/game_hud.gd")
const Story = preload("res://scripts/ui/story_view.gd")
const Session = preload("res://scripts/level_session.gd")
const Audio = preload("res://scripts/ui/audio_director.gd")
const Modes = preload("res://scripts/services/mode_catalog.gd")
const Duel = preload("res://scripts/training/duel_orchestrator.gd")
const AccountSync = preload("res://scripts/services/account_sync.gd")

var menus: Control
var board: Control
var hud: Control
var story_view: Control
var session: Node
var audio: Node
var duel: Node
var online: Node
var account_sync: Node
var current_screen := "studio"
var _game: Control
var _background: TextureRect
var _dialog: Control
var _pending_level := -1
var _tool := ""
var _return_to_game := false
var _training: Dictionary = {}
var _tutorial_stage := 0
var _cloud_pending: Dictionary = {}
var _rankings: Array = []
var _bonus_milestone := 0
var _after_epilogue: Callable
var _epilogue_key := ""
var _presentation_generation := 0
var _completion_banner: Control

func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	theme = UI.make_theme()
	_background = UI.image("assets/images/bg-default.webp")
	_background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_background.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	add_child(_background)
	_game = Control.new()
	_game.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(_game)
	hud = HUD.new()
	_game.add_child(hud)
	board = Board.new()
	board.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	hud.board_slot.add_child(board)
	menus = Menus.new()
	add_child(menus)
	story_view = Story.new()
	add_child(story_view)
	session = Session.new()
	session.name = "LevelSession"
	add_child(session)
	audio = Audio.new()
	audio.name = "AudioDirector"
	add_child(audio)
	duel = Duel.new()
	add_child(duel)
	duel.setup(session,Catalog)
	_wire_signals()
	_install_account_sync()
	_install_online()
	audio.configure({"audio":Catalog.audio},Progress.save)
	_apply_settings()
	show_screen("studio")
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with("--level="):
			start_level(clampi(int(argument.trim_prefix("--level="))-1,0,Catalog.levels.size()-1),true)
		elif argument == "--menu":show_screen("splash")

func _wire_signals() -> void:
	menus.navigate.connect(_navigate)
	menus.level_chosen.connect(func(index: int):start_level(index))
	menus.mode_chosen.connect(_choose_mode)
	menus.setting_changed.connect(_setting_changed)
	menus.profile_selected.connect(_profile_selected)
	menus.action.connect(_menu_action)
	menus.modal_opened.connect(func():
		if current_screen == "game":
			session.pause("settings")
			board.interaction_locked = true)
	menus.modal_closed.connect(func():
		if current_screen == "game":
			session.resume("settings")
			board.interaction_locked = session.finished
			menus.visible = false)
	hud.action.connect(_hud_action)
	hud.direction_requested.connect(_direction)
	board.action_requested.connect(_move)
	board.chamber_requested.connect(func(index: int):session.rotate_chamber(index))
	board.tools_cell_requested.connect(_tool_cell)
	board.selected_changed.connect(_selected)
	board.animation_finished.connect(func():
		session.animation_finished()
		_refresh_hud())
	board.signature_started.connect(func(recipe: Dictionary):audio.play_signature(recipe))
	session.state_changed.connect(_state_changed)
	session.action_started.connect(_action_started)
	session.action_rejected.connect(func(index: int, direction: int, _reason: String):
		board.nudge(index,direction)
		audio.play_effect("wallTap"))
	session.completed.connect(_completed)
	session.failed.connect(_failed)
	session.clock_changed.connect(func(_seconds: float):
		if current_screen == "game":hud.update_clock(session))
	session.hint_ready.connect(_hint_ready)
	session.hint_failed.connect(_hint_failed)
	session.assistance_requested.connect(func(kind: String, payload: Dictionary):hud.set_notice(_assistance_message(kind,payload)))
	session.assistance_changed.connect(_refresh_hud)
	session.attempt_restarted.connect(func(reason: String):
		if account_sync != null:account_sync.begin_attempt(session.level_index,session.mode)
		hud.set_notice(_t("fragileRestart","A fragile atom broke. Try again.") if reason == "fragile" else _t("moveCapRestart","Move limit reached. The experiment restarted.")))
	story_view.continued.connect(_story_finished)
	story_view.skipped.connect(_story_finished)
	story_view.voice_requested.connect(func(page: Dictionary):
		var cue := str(page.get("voiceCue",page.get("voice","")))
		if not cue.is_empty():audio.speak(cue))
	Progress.changed.connect(_progress_changed)
	Progress.save_failed.connect(_notice)
	Cloud.error.connect(_cloud_error)
	Cloud.request_completed.connect(_cloud_completed)
	Cloud.account_changed.connect(func(_account: Dictionary):
		if menus.visible:menus.refresh(_screen_data()))
	duel.turn_ready.connect(_duel_turn_ready)
	duel.turn_completed.connect(_duel_turn_completed)
	duel.round_completed.connect(_duel_round_completed)
	duel.match_completed.connect(_duel_match_completed)

func _screen_data() -> Dictionary:
	var bonuses: Array = []
	for milestone in [10,20,40,60,80,100,120,140]:
		if milestone <= int(Progress.save.get("cur",0)) and not Progress.save.get("bonusClaims",{}).has(str(milestone)):
			bonuses.append({"id":milestone,"name":_t("bonusMission","BONUS MISSION")+" · "+str(milestone),"desc":_t("bonusMissionDesc","Complete the laboratory challenge.")})
	return {"save":Progress.save,"profiles":Progress.profiles,"levels":Catalog.levels,"can_continue":session.level_index >= 0,"cloud_status":_account_sync_status(),"rankings":_rankings,"missions":Economy.lab_missions(),"apple_available":OS.has_feature("web"),"bonusMissions":bonuses}

func show_screen(screen: String) -> void:
	if screen != "game":
		_presentation_generation += 1
		_clear_completion_banner()
	_close_dialog()
	if screen == "game" and session.level_index >= 0:
		current_screen = "game"
		menus.visible = false
		story_view.visible = false
		_game.visible = true
		session.resume("navigation")
		board.interaction_locked = session.finished
		audio.set_mode("game")
		_refresh_hud()
		return
	current_screen = screen
	session.pause("navigation")
	board.interaction_locked = true
	_game.visible = false
	story_view.visible = false
	menus.show_screen(screen,_screen_data())
	audio.set_mode(screen if screen in ["studio","boot"] else "menu")
	if screen == "boot":audio.play_startup()
	if screen == "splash":
		audio.schedule_menu_voice("menuReturn" if bool(Progress.save.get("menuVoiceSeen",false)) else "menuFirst")
		Progress.save.menuVoiceSeen = true
		Progress.persist()

func _navigate(screen: String) -> void:
	if screen == "splash" and _return_to_game and session.level_index >= 0 and not session.finished:
		_return_to_game = false
		show_screen("game")
	else:show_screen(screen)

func start_level(index: int, skip_story: bool = false) -> void:
	if index < 0 or index >= Catalog.levels.size():return
	if not skip_story and index > int(Progress.save.get("cur",0)):
		_notice(_t("levelLocked","Complete the preceding experiment to unlock this one."))
		return
	_training.clear()
	_tutorial_stage = 0
	_bonus_milestone = 0
	if duel.active:duel.quit()
	var pages: Array = Catalog.story_pages(index)
	if not skip_story and not pages.is_empty() and not bool(Progress.save.get("storySeen",{}).get(str(index+1),false)):
		_pending_level = index
		current_screen = "story"
		session.pause("navigation")
		menus.visible = false
		_game.visible = false
		story_view.show_story(pages,index)
		audio.set_mode("menu")
		return
	_begin_attempt(index,"campaign",{})

func _story_finished(index: int) -> void:
	audio.stop_voice()
	if _after_epilogue.is_valid():
		Progress.save.storySeen[_epilogue_key] = true
		Progress.persist()
		var callback := _after_epilogue
		_after_epilogue = Callable()
		_epilogue_key = ""
		story_view.visible = false
		_game.visible = true
		current_screen = "game"
		callback.call()
		return
	Progress.save.storySeen[str(index+1)] = true
	Progress.persist()
	_begin_attempt(_pending_level if _pending_level >= 0 else index,"campaign",{})
	_pending_level = -1

func _begin_attempt(index: int, mode: String, options: Dictionary, caption: String = "") -> bool:
	_presentation_generation += 1
	_clear_completion_banner()
	_close_dialog()
	menus.close_modal()
	board.stop_animation()
	board.fx.clear_effects()
	if not session.start_level(index,mode,options):return false
	if account_sync != null:account_sync.begin_attempt(index,mode)
	_display_attempt(caption,options)
	return true

func _display_attempt(caption: String = "", options: Dictionary = {}) -> void:
	menus.visible = false
	story_view.visible = false
	_game.visible = true
	current_screen = "game"
	_tool = ""
	board.set_tool("")
	board.clear_hint()
	board.interaction_locked = false
	board.level_index = session.level_index
	board.configure(Progress.save)
	board.configure_catalog(Catalog.elements)
	hud.configure(Progress.save)
	hud.show_level(session.level_index,session.mode,session.molecule,Catalog.elements,caption)
	var background_path := str(options.get("background",session.state.get("background","")))
	if background_path.is_empty():
		var tier := 0
		for threshold in [20,40,60,80,100,120,140,301]:
			if session.level_index >= threshold:tier += 1
		var backgrounds: Array = Catalog.data.get("tierBackgrounds",[])
		background_path = str(backgrounds[mini(tier,backgrounds.size()-1)].get("uri","assets/images/bg-default.webp")) if not backgrounds.is_empty() else "assets/images/bg-default.webp"
	_background.texture = Catalog.asset(background_path)
	board.set_selected(0 if not session.state.get("atoms",[]).is_empty() else -1)
	session.resume("navigation")
	audio.set_mode("game")
	if session.mode == "campaign":audio.voice_event("nobelIntro" if session.level_index == 300 else "ready")
	_refresh_hud()
	call_deferred("_maybe_mechanic_intro")

func _maybe_mechanic_intro() -> void:
	if session.mode not in ["campaign","crystal","chain","reactor"] or Progress.save.get("tutorialTips",true) == false or current_screen != "game":return
	var ids: Array = []
	for atom in session.state.get("atoms",[]):
		for flag in ["frozen","fire","lightning","sticky","zombie","fragile"]:
			if bool(atom.get(flag,false)) and not ids.has(flag):ids.append(flag)
	for key in {"oneWays":"oneWay","breakableWalls":"hammer","portals":"portal","rifts":"rift","movingWalls":"movingWall","pressureSystems":"pressureDoor","linkedPairs":"linked","fusionDefs":"fusion","rotationPads":"rotation","repulsorCores":"repulsor","rotatingChambers":"rotatingChamber"}:
		var values: Variant = session.state.get(key,[])
		if values is Array and not values.is_empty():ids.append({"oneWays":"oneWay","breakableWalls":"hammer","portals":"portal","rifts":"rift","movingWalls":"movingWall","pressureSystems":"pressureDoor","linkedPairs":"linked","fusionDefs":"fusion","rotationPads":"rotation","repulsorCores":"repulsor","rotatingChambers":"rotatingChamber"}[key])
	for key in {"replicator":"replicator","photonPad":"photonBoost","synthesizer":"synthesizer"}:
		if session.state.get(key) is Dictionary:ids.append({"replicator":"replicator","photonPad":"photonBoost","synthesizer":"synthesizer"}[key])
	if session.feature == "enzyme":ids.append("enzymeGate")
	if session.feature == "bio":ids.append("bioAssembly")
	if session.game_type in ["crystal","chain","reactor"]:ids.append({"crystal":"classicCatalyst","chain":"classicChain","reactor":"classicReactor"}[session.game_type])
	var guides: Array = Catalog.data.get("guides",{}).get("mechanics",{}).get(Catalog.language,[])
	var pending: Array = []
	for item in guides:
		if ids.has(str(item.get("id",""))) and not bool(Progress.save.get(str(item.get("flag","")),false)):pending.append(item)
	if not pending.is_empty():_mechanic_intro_page(pending,0)

func _mechanic_intro_page(items: Array, index: int) -> void:
	if index >= items.size():
		_close_dialog()
		return
	var item: Dictionary = items[index]
	var box := _open_dialog(_local(item.get("title","")))
	box.add_child(UI.label(_local(item.get("desc","")),16))
	var demo: Dictionary = item.get("demo",{})
	if not demo.is_empty():box.add_child(UI.label("  ".join(demo.get("cells",[])),22,UI.CYAN))
	box.add_child(UI.button(_t("continue","CONTINUE"),func():
		Progress.save[str(item.get("flag",""))] = true
		Progress.persist()
		_mechanic_intro_page(items,index+1),Color("55c77d")))

func _state_changed(snapshot: Dictionary) -> void:
	var raw: Dictionary = session.level.duplicate(true)
	raw["_index"] = session.level_index
	board.set_state(snapshot,raw,session.molecule)
	_refresh_hud()

func _action_started(before: Dictionary, after: Dictionary, action: Dictionary) -> void:
	board.clear_hint()
	board.animate_action(before,after,action)
	var index := int(action.get("i",-1))
	var distance := 1
	if index >= 0 and index < before.get("atoms",[]).size() and index < after.get("atoms",[]).size():
		distance = maxi(1,absi(int(before.atoms[index].x)-int(after.atoms[index].x))+absi(int(before.atoms[index].y)-int(after.atoms[index].y)))
	audio.play_effect("slide",{"distance":distance})
	if session.mode == "campaign":audio.voice_event("goodMove")
	_refresh_hud()
	if _tutorial_stage == 1:hud.set_notice(_t("tut4","Now slide the atom RIGHT to build the molecule."))

func _move(index: int, direction: int) -> void:
	if current_screen != "game" or is_instance_valid(_dialog):return
	if _tool == "precision":
		_confirm(_t("precisionConfirm","Move this atom one square? Cost: 250 MoleCoin, or one precision token."),func():
			if session.request_move(index,direction,true):_set_tool(""))
		return
	if _tutorial_stage == 1:
		var expected := 2 if session.moves == 0 else 1
		if index != 0 or direction != expected:
			hud.set_notice(_t("tut3","Slide the selected atom DOWN until the wall stops it.") if session.moves == 0 else _t("tut4","Slide the atom RIGHT to meet the other atom."))
			board.set_hint(0,expected)
			return
	if session.request_move(index,direction,_tool == "precision"):_set_tool("")

func _direction(direction: int) -> void:
	if board.selected < 0:hud.set_notice(_t("selectAtom","Select an atom first."))
	else:_move(board.selected,direction)

func _selected(_index: int) -> void:
	if _tutorial_stage == 1 and session.moves == 0:hud.set_notice(_t("tut3","Slide the selected atom DOWN until the wall stops it."))

func _tool_cell(cell: Vector2i) -> void:
	if _tool in ["barrier","hammer"]:
		var chosen_tool := _tool
		if chosen_tool == "barrier" and not session.barrier_cell_available(cell.x,cell.y):
			hud.set_notice(_t("barrierNormalFloor","Choose an empty normal floor square."))
			return
		_confirm(_t("barrierConfirm","Place a Nano Barrier here for 500 MoleCoin? It can be used once this attempt.") if chosen_tool == "barrier" else _t("hammerConfirm","Use one hammer to break this cracked wall?"),func():
			var placed: bool = session.place_barrier(cell.x,cell.y) if chosen_tool == "barrier" else session.hammer_wall(cell.x,cell.y)
			if placed:
				_set_tool("")
				audio.play_effect("barrierBuild" if chosen_tool == "barrier" else "wallBreak"))
		return
	var used := false
	if _tool == "barrier":used = session.place_barrier(cell.x,cell.y)
	elif _tool == "hammer":used = session.hammer_wall(cell.x,cell.y)
	if used:
		var sound := "wallBreak" if _tool == "hammer" else "barrierBuild"
		_set_tool("")
		audio.play_effect(sound)

func _set_tool(kind: String) -> void:
	_tool = kind
	board.set_tool(kind if kind in ["hammer","barrier"] else "")
	hud.set_tool(kind)
	if kind == "precision":hud.set_notice(_t("precisionReady","Select an atom and move it exactly one square."))
	elif kind == "hammer":hud.set_notice(_t("hammerReady","Choose a cracked wall to break."))
	elif kind == "barrier":hud.set_notice(_t("barrierReady","Choose an empty floor square for the nano barrier."))
	else:hud.set_notice("")

func _hud_action(name: String) -> void:
	audio.unlock()
	match name:
		"settings":
			menus.screen_data = _screen_data()
			menus.visible = true
			menus.set_overlay_mode(true)
			menus.open_settings()
		"home":_confirm(_t("returnHome","Return to the laboratory?"),func():show_screen("splash"))
		"undo":
			if session.undo():
				audio.play_effect("undo")
				_set_tool("")
				board.clear_hint()
		"restart":
			if session.mode != "duel":_confirm(_t("restartConfirm","Restart this experiment?"),_restart)
		"hint":_show_hints()
		"hammer","precision","barrier":
			if _tool == name:_set_tool("")
			elif session.assistance_available(name):_set_tool(name)
			else:hud.set_notice(_assistance_message(name,{}))
		"lab","collect","hof":
			_return_to_game = true
			show_screen(name)

func _restart() -> void:
	_presentation_generation += 1
	_clear_completion_banner()
	_close_dialog()
	_set_tool("")
	board.stop_animation()
	board.clear_hint()
	board.interaction_locked = false
	session.restart()
	if account_sync != null:account_sync.begin_attempt(session.level_index,session.mode)
	_refresh_hud()

func _show_hints() -> void:
	if session.mode == "duel":return
	var box := _open_dialog(_t("hint","HINT"))
	box.add_child(UI.label(_t("hintChoose","Choose the help you need. A hint is charged when a valid route is found."),13))
	var costs: Dictionary = Economy.hint_costs(session.hint_count)
	for entry in [["strategic",_t("strategicHint","STRATEGIC HINT")],["exact",_t("exactHint","EXACT MOVE")],["full",_t("fullSolution","FULL SOLUTION")]]:
		var kind: String = entry[0]
		var button := UI.button("%s · ◉ %d" % [str(entry[1]),int(costs.get(kind,0))],func():_request_hint(kind),UI.CYAN)
		if kind == "full":button.disabled = not Economy.full_solution_hint_unlocked(session.hint_count,session.moves,int(session.level.get("p",1)))
		box.add_child(button)
	if Economy.quantum_hint_available() or Economy.legend_exact_hint_tokens() > 0:
		box.add_child(UI.button(_t("freeHint","FREE EXACT HINT"),func():_request_hint("exact",true),UI.AMBER))
	box.add_child(UI.button(_t("cancel","CANCEL"),_close_dialog))

func _request_hint(kind: String, free: bool = false) -> void:
	_close_dialog()
	hud.set_notice(_t("findingHint","Finding a route…"))
	session.request_hint(kind == "full",{"kind":kind,"charge":true,"free":free,"autoplay":kind == "full"})

func _hint_ready(action: Array) -> void:
	if action.size() >= 2:
		board.set_hint(int(action[0]),int(action[1]))
		audio.play_effect("hint")
		audio.voice_event("hint")
		hud.set_notice(_t("hintMove","Follow the highlighted arrow."))
	_refresh_hud()

func _hint_failed(reason: String, proven_dead_end: bool) -> void:
	var message := _t("noHint","No hint is available from this position.")
	if reason == "insufficient-coins":message = _t("notEnoughCoins","Not enough MoleCoins.")
	if proven_dead_end:message = _t("deadEnd","This position has no solution. Undo or restart the experiment.")
	hud.set_notice(message)

func _completed(result: Dictionary) -> void:
	board.interaction_locked = true
	board.play_win_effect()
	audio.play_effect("moleculeComplete")
	audio.voice_event("clear%d" % int(result.stars))
	if session.mode == "duel":return
	if session.mode == "tutorial":
		_tutorial_completed()
		return
	var reward: Dictionary = {}
	match str(result.mode):
		"campaign":reward = Progress.complete_level(int(result.level),int(result.stars),int(result.moves),float(result.seconds),bool(result.assisted),int(result.hints))
		"daily":
			reward = Progress.complete_daily(str(result.dayId),int(result.stars),int(result.moves),float(result.seconds),int(result.par),int(result.minimum),int(result.hints),bool(result.assisted))
			if account_sync != null:account_sync.claim_daily(result,reward)
		"bonus":reward = Progress.claim_bonus(_bonus_milestone)
	if not _training.is_empty():Progress.mark_training(str(_training.get("group","mechanic")),str(_training.get("id","")))
	Economy.discover_legend(int(result.level),int(result.stars),str(result.mode),str(result.dayId))
	_present_completion(result,reward)
	if account_sync != null:
		account_sync.finish_attempt(result,session.move_log)
		account_sync.sync_now()

func _present_completion(result: Dictionary, reward: Dictionary) -> void:
	var generation := _presentation_generation
	var profile := str(Progress.save.get("profileId",""))
	var first_discovery := bool(reward.get("discovery",false))
	var hold := 3.65 if first_discovery else .95
	var banner_delay := .64
	var recipes: Array = Catalog.data.get("fxRecipes",[])
	if int(result.level) >= 0 and int(result.level) < recipes.size():banner_delay += float(int(recipes[int(result.level)].get("seed",0)) % 121)/1000.0
	await get_tree().create_timer(banner_delay).timeout
	if generation != _presentation_generation or not session.finished or current_screen != "game":return
	_show_completion_banner()
	await get_tree().create_timer(maxf(.01,hold-banner_delay)).timeout
	if generation != _presentation_generation or not session.finished or current_screen != "game" or profile != str(Progress.save.get("profileId","")):return
	_clear_completion_banner()
	if str(result.mode) == "campaign" and int(result.level) in [300,800] and not bool(Progress.save.storySeen.get("%d-epilogue" % (int(result.level)+1),false)):
		var by_lang: Dictionary = Catalog.epilogues.get("byLang",{})
		var pages: Array = by_lang.get(Catalog.language,by_lang.get("en",{})).get("final801" if int(result.level) == 800 else "nobel",[])
		if not pages.is_empty():
			_epilogue_key = "%d-epilogue" % (int(result.level)+1)
			_after_epilogue = func():_show_result(result,reward)
			current_screen = "story"
			_game.visible = false
			story_view.show_story(pages,int(result.level))
		else:_show_result(result,reward)
	else:_show_result(result,reward)

func _clear_completion_banner() -> void:
	if is_instance_valid(_completion_banner):_completion_banner.queue_free()
	_completion_banner = null

func _show_completion_banner() -> void:
	_clear_completion_banner()
	var panel := PanelContainer.new()
	_completion_banner = panel
	_game.add_child(panel)
	panel.set_anchors_and_offsets_preset(Control.PRESET_TOP_LEFT)
	panel.position = Vector2(size.x*.1,size.y*.38)
	panel.size = Vector2(size.x*.8,0)
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var colors: Array = session.molecule.get("c",["#7ee8ff"])
	panel.add_theme_stylebox_override("panel",UI.panel(Color("101a35"),Color(str(colors[0])),2,18))
	var copy := VBoxContainer.new()
	copy.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(copy)
	for line in [str(session.molecule.get("w","")),str(session.molecule.get("f","")),str(session.molecule.get("n","")),str(session.molecule.get("fa",""))]:
		var label := UI.label(UI.plain(line),18 if copy.get_child_count()<3 else 13,UI.AMBER if copy.get_child_count()==1 else UI.TEXT)
		label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		label.mouse_filter = Control.MOUSE_FILTER_IGNORE
		copy.add_child(label)
	if not bool(Progress.save.get("reduceMotion",false)):
		panel.modulate.a = 0
		var tween := create_tween()
		tween.tween_property(panel,"modulate:a",1.0,.18)

func _show_result(result: Dictionary, reward: Dictionary) -> void:
	var box := _open_dialog(_t("experimentComplete","EXPERIMENT COMPLETE"))
	_dialog.set_meta("completion_result",{"profileId":str(Progress.save.get("profileId","")),"presentation":_presentation_generation,"mode":str(result.get("mode","")),"level":int(result.get("level",-1)),"dayId":str(result.get("dayId",""))})
	var stars := UI.label("★".repeat(int(result.stars))+"☆".repeat(3-int(result.stars)),39,UI.AMBER)
	stars.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(stars)
	box.add_child(UI.label(str(session.molecule.get("f",""))+" · "+UI.plain(session.molecule.get("n","")),21,UI.CYAN))
	box.add_child(UI.label("%s %d · %.1f s" % [_t("movesLabel","MOVES"),int(result.moves),float(result.seconds)],16))
	if int(reward.get("coins",0)) > 0 or int(reward.get("rp",0)) > 0:box.add_child(UI.label("+%d MoleCoin · +%d RP" % [int(reward.get("coins",0)),int(reward.get("rp",0))],16,UI.AMBER))
	if bool(reward.get("practice",false)):box.add_child(UI.label(_t("dailyPractice","Daily practice saved on this device."),12))
	var fact := str(session.molecule.get("fa",session.molecule.get("fact","")))
	if not fact.is_empty():box.add_child(UI.label(UI.plain(fact),13))
	if str(result.mode) == "campaign" and int(result.level)+1 < Catalog.levels.size():
		box.add_child(UI.button(_t("next","NEXT EXPERIMENT")+"  ▶",func():start_level(int(result.level)+1),Color("55c77d")))
	elif str(result.mode) in ["crystal","chain","reactor"]:
		box.add_child(UI.button(_t("playAgain","PLAY AGAIN"),func():_choose_mode(str(result.mode)),Color("55c77d")))
	box.add_child(UI.button(_t("replay","REPLAY"),_restart,UI.CYAN))
	box.add_child(UI.button(_t("levels","LEVELS"),func():show_screen("levels")))
	box.add_child(UI.button(_t("home","HOME"),func():show_screen("splash")))

func _failed(reason: String) -> void:
	if reason == "fragile":
		hud.set_notice(_t("fragileRestart","A fragile atom broke. The experiment will restart."))
		return
	if session.mode == "duel" and reason == "timeout":return
	var box := _open_dialog(_t("timeUp","TIME'S UP") if reason == "timeout" else _t("experimentFailed","EXPERIMENT PAUSED"))
	box.add_child(UI.label(_t("tryAgain","Try the experiment again.") if reason == "timeout" else reason,15))
	box.add_child(UI.button(_t("restart","RESTART"),_restart,Color("55c77d")))
	box.add_child(UI.button(_t("home","HOME"),func():show_screen("splash")))

func _choose_mode(mode: String) -> void:
	_training.clear()
	_tutorial_stage = 0
	_bonus_milestone = 0
	if duel.active:duel.quit()
	if mode == "tutorial":
		_start_tutorial(1)
		return
	if mode == "daily":
		var challenge: Dictionary = Modes.daily_challenge(Catalog)
		if not challenge.is_empty():_begin_attempt(int(challenge.index),"daily",challenge.options)
	else:
		var index: int = Modes.choose_level(Catalog,mode)
		if index >= 0:_begin_attempt(index,mode,Modes.level_options(Catalog,index,mode))

func _menu_action(name: String, payload: Dictionary) -> void:
	audio.unlock()
	match name:
		"unlock_audio":audio.unlock()
		"continue":
			if session.level_index >= 0 and not session.finished:show_screen("game")
			else:start_level(mini(int(Progress.save.get("cur",0)),Catalog.levels.size()-1))
		"new_game":
			var requested := str(payload.get("name","Player 1"))
			if Progress.profiles.has(requested):Progress.select_profile(requested)
			elif bool(Progress.save.get("autoGuest",false)) and int(Progress.save.get("cur",0)) == 0:Progress.rename_profile(requested)
			elif not Progress.create_profile(requested):
				_notice(_t("profileLimit","Five players already exist. Choose a player or remove one first."))
				return
			if not bool(Progress.save.get("tutorialDone",false)):_start_tutorial(1)
			else:start_level(0)
		"create_profile":
			if Progress.create_profile(str(payload.get("name",""))):show_screen("profiles")
		"delete_profile":
			if account_sync != null:account_sync.delete_profile(str(payload.get("name","")))
			else:Progress.delete_profile(str(payload.get("name","")))
			show_screen("profiles")
		"purchase":
			var purchased: bool = Economy.purchase(str(payload.get("id","")))
			menus.refresh(_screen_data())
			_notice(_t("purchased","Added to your laboratory.") if purchased else _t("purchaseFailed","This purchase is unavailable."))
		"claim_mission":
			var result: Dictionary = Economy.claim_lab_mission(str(payload.get("id","")))
			menus.refresh(_screen_data())
			_notice("+%d MoleCoin · +%d RP" % [int(result.get("coins",0)),int(result.get("rp",0))] if bool(result.get("ok",false)) else _t("missionIncomplete","Complete the mission first."))
		"favorite_molecule":
			Progress.save.favoriteMolecules[str(payload.get("id",""))] = bool(payload.get("favorite",false))
			Progress.persist()
			menus.open_molecule(str(payload.get("id","")))
		"music_track":audio.play_track(int(payload.get("index",0)))
		"training_learned":Progress.mark_training(str(payload.get("group","mechanic")),str(payload.get("id","")))
		"training_experiment":_training_experiment(payload)
		"reset_progress":_reset_progress()
		"rankings":_cloud_pending[Cloud.get_leaderboard()] = "rankings"
		"google_sign_in":Cloud.connect_google()
		"apple_sign_in":Cloud.connect_apple()
		"email_sign_in":Cloud.sign_in_email(str(payload.get("email","")),str(payload.get("password","")))
		"email_sign_up":Cloud.register_email(str(payload.get("email","")),str(payload.get("password","")),str(Progress.save.get("playerName","")))
		"reset_password":Cloud.reset_password(str(payload.get("email","")),Catalog.language)
		"sign_out":Cloud.sign_out()
		"sync_now":_sync_account_now()
		"cloud_status":_notice(Cloud.status)
		"local_duel":_start_local_duel(payload)
		"quick_match","create_room","join_room":_online_duel(name,payload)
		"offline_download":_download_offline()
		"open_legal":_open_legal(str(payload.get("path","")))
		"certificate":_certificate(payload)
		"claim_reward":_notice(_t("noRewards","No rewards are available to claim."))
		"bonus_mission":_bonus_mission(payload)
		_:_notice(_t("unavailable","This action is unavailable."))

func _profile_selected(profile_name: String) -> void:
	if Progress.select_profile(profile_name):
		session.cancel_hint("profile-changed")
		session.level_index = -1
		_return_to_game = false
		show_screen("splash")

func _setting_changed(key: String, value: Variant) -> void:
	if Progress.setting(key,value):
		_apply_settings()
		menus.screen_data = _screen_data()
		if key == "lang" and current_screen == "game":hud.show_level(session.level_index,session.mode,Catalog.get_molecule(str(session.level.get("m",""))),Catalog.elements)

func _apply_settings() -> void:
	board.configure(Progress.save)
	hud.configure(Progress.save)
	audio.apply_settings(Progress.save)
	Engine.max_fps = 120 if str(Progress.save.get("frameRate","60")) == "120" else 60

func _progress_changed() -> void:
	_refresh_hud()
	if is_instance_valid(menus):menus.screen_data = _screen_data()

func _refresh_hud() -> void:
	if is_instance_valid(session) and session.level_index >= 0 and is_instance_valid(hud):hud.update_attempt(session,Progress.save)

func _notice(message: String) -> void:
	if current_screen == "game":hud.set_notice(message)
	else:menus.set_notice(message)

func _cloud_error(details: Dictionary) -> void:
	var message := str(details.get("message",""))
	var code := str(details.get("code",""))
	var bootstrap := str(details.get("method","")) == "bootstrap" or "Failed to fetch" in message or "blob:" in message
	if bootstrap:
		if current_screen not in ["studio","boot"]:_notice(_t("cloudOffline","Cloud is offline. Progress is saved on this device."))
		return
	var friendly := {"auth/popup-blocked":"Allow the sign-in popup, then try again.","auth/popup-closed-by-user":"Sign-in was cancelled.","auth/cancelled-popup-request":"Sign-in was cancelled.","auth/invalid-credential":"Check the email address and password, then try again.","auth/wrong-password":"Check the email address and password, then try again.","auth/user-not-found":"Check the email address and password, then try again.","auth/invalid-email":"Enter a valid email address.","auth/email-already-in-use":"This email is already registered. Use Sign In.","auth/weak-password":"Use a password with at least six characters.","auth/too-many-requests":"Too many attempts. Please try again later.","auth/network-request-failed":"Check your internet connection, then try again.","auth/account-exists-with-different-credential":"Sign in with the account's existing provider before connecting another sign-in method."}
	if friendly.has(code):_notice(str(friendly[code]))
	elif code == "cloud/native-sdk-unavailable":_notice(Cloud.status)
	else:_notice(message if not message.is_empty() else _t("cloudFailed","The online service could not complete this request."))

func _download_offline() -> void:
	if not OS.has_feature("web"):
		_notice(_t("nativeOffline","All experiments and game assets are included in the native app."))
		return
	JavaScriptBridge.eval("globalThis.MXGodotOffline && globalThis.MXGodotOffline.start();",true)
	for attempt in range(600):
		var state := str(JavaScriptBridge.eval("globalThis.MXGodotOffline ? globalThis.MXGodotOffline.state : 'error'",true))
		if state == "done":
			_notice(_t("offlineReady","The game is ready to reopen offline on this device."))
			return
		if state == "error":
			_notice(_t("offlineDenied","This browser could not save the offline game. You can keep playing online."))
			return
		_notice(_t("offlineDownloading","Downloading the offline game…"))
		await get_tree().create_timer(.25).timeout
	_notice(_t("offlineRetry","The download is still pending. Try the offline button again."))

func _assistance_message(kind: String, _payload: Dictionary) -> String:
	return {"precision":_t("precisionUnavailable","One-square movement needs 250 MoleCoins or a precision token."),"barrier":_t("barrierUnavailable","A nano barrier costs 500 MoleCoins and can be placed once per attempt."),"hammer":_t("hammerUnavailable","Buy a hammer in the Lab Shop and choose a cracked wall."),"hint":_t("notEnoughCoins","Not enough MoleCoins.")}.get(kind,_t("assistanceUnavailable","This support is unavailable here."))

func _open_dialog(title: String) -> VBoxContainer:
	_close_dialog()
	session.pause("dialog")
	board.interaction_locked = true
	_dialog = Control.new()
	_dialog.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(_dialog)
	var shade := ColorRect.new()
	shade.color = Color(0.01,0.015,0.05,.85)
	shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_dialog.add_child(shade)
	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_dialog.add_child(center)
	var panel := PanelContainer.new()
	panel.custom_minimum_size.x = minf(400,size.x-28)
	panel.add_theme_stylebox_override("panel",UI.panel(Color("101a35"),UI.CYAN,2,20))
	center.add_child(panel)
	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(0,minf(610,size.y-50))
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	panel.add_child(scroll)
	var box := VBoxContainer.new()
	box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	box.add_theme_constant_override("separation",12)
	scroll.add_child(box)
	box.add_child(UI.label(title,23,UI.AMBER))
	return box

func _close_dialog() -> void:
	if is_instance_valid(_dialog):
		remove_child(_dialog)
		_dialog.queue_free()
	_dialog = null
	if is_instance_valid(session):session.resume("dialog")
	if is_instance_valid(board):board.interaction_locked = bool(session.finished) if is_instance_valid(session) else false

func _confirm(text: String, callback: Callable) -> void:
	var box := _open_dialog(text)
	box.add_child(UI.button(_t("yes","YES"),func():
		_close_dialog()
		callback.call(),UI.CYAN))
	box.add_child(UI.button(_t("cancel","CANCEL"),_close_dialog))

func _start_tutorial(stage: int) -> void:
	var raw: Dictionary = Catalog.data.get("tutorials",[])[stage-1]
	_begin_attempt(0,"tutorial",{"level":raw,"snapshot":_simple_snapshot(raw)},_t("howToPlay","HOW TO PLAY"))
	_tutorial_stage = stage
	hud.set_notice(_t("tut2","Tap the highlighted atom.") if stage == 1 else _t("tut8","Build the target molecule on your own."))
	if stage == 1:board.set_hint(0,2)

func _simple_snapshot(raw: Dictionary) -> Dictionary:
	var grid: Array = []
	for row in raw.g:
		var cells: Array = []
		for cell in str(row):cells.append(cell == "1")
		grid.append(cells)
	var atoms: Array = []
	for atom in raw.a:atoms.append({"x":int(atom[0]),"y":int(atom[1]),"e":str(atom[2]),"frozen":false,"fire":false,"sticky":false,"zombie":false,"zombieGen":0})
	return {"grid":grid,"atoms":atoms,"feature":"","targetKey":str(Catalog.get_molecule(str(raw.m)).get("key",""))}

func _tutorial_completed() -> void:
	if _tutorial_stage == 1:
		var box := _open_dialog(_t("wellDone","WELL DONE!"))
		box.add_child(UI.label(_t("tut6","Atoms stop at walls or other atoms. Now try building the molecule yourself."),15))
		box.add_child(UI.button(_t("continue","CONTINUE"),func():_start_tutorial(2),Color("55c77d")))
	else:
		var first := not bool(Progress.save.get("tutorialDone",false))
		Progress.save.tutorialDone = true
		Progress.mark_training("basic","movement")
		if first:Progress.add_coins(15)
		Progress.persist()
		_tutorial_stage = 0
		var box := _open_dialog(_t("tut9","You're ready for the laboratory!"))
		if first:box.add_child(UI.label("+15 MoleCoin",20,UI.AMBER))
		box.add_child(UI.button(_t("play","PLAY"),func():start_level(0) if int(Progress.save.get("cur",0)) == 0 else show_screen("splash"),Color("55c77d")))

func _training_experiment(payload: Dictionary) -> void:
	var group := str(payload.get("group","mechanics"))
	var id := str(payload.get("id",""))
	var guides: Dictionary = Catalog.data.get("guides",{})
	var items: Variant = guides.get(group,[])
	if items is Dictionary:items = items.get(Catalog.language,items.get("en",[]))
	for item in items:
		if item is Dictionary and str(item.get("id","")) == id:
			var index := clampi(int(item.get("level",item.get("unlock",1)))-1,0,Catalog.levels.size()-1)
			_training = {"group":group.trim_suffix("s"),"id":id}
			_begin_attempt(index,"training",{},_local(item.get("title",item.get("name",id))))
			hud.set_notice(_local(item.get("desc",item.get("description",""))))
			return
	_notice(_t("trainingUnavailable","This training experiment has no level attached."))

func _reset_progress() -> void:
	var identity := {"playerName":Progress.save.get("playerName",""),"profileId":Progress.save.get("profileId",""),"uid":Progress.save.get("uid","")}
	Progress.save = Progress.normalize(identity)
	Progress.profiles[Progress.current_name] = Progress.save
	Progress.persist()
	session.level_index = -1
	show_screen("splash")

func _account_sync_status() -> String:
	if account_sync == null or not Cloud.available:return Cloud.status
	var suffix := str(account_sync.status)
	var labels := {"syncing":_t("syncing","Syncing…"),"saved":_t("synced","Progress synced."),"offline":_t("cloudOffline","Progress is saved on this device."),"account-profile-mismatch":_t("cloudOtherAccount","This player belongs to another account. Select a player from the connected account.")}
	return Cloud.status+(" · "+str(labels[suffix]) if labels.has(suffix) else "")

func _sync_account_now() -> void:
	if account_sync == null:return
	var result: Dictionary = await account_sync.sync_now()
	if bool(result.get("ok",false)):_notice(_t("synced","Progress synced."))
	elif not bool(result.get("stale",false)):
		var reason := str(result.get("reason",""))
		_notice(_t("cloudOtherAccount","This player belongs to another account. Select a player from the connected account.") if reason.contains("another-account") else _t("cloudOffline","Progress is saved on this device. Cloud sync is unavailable."))

func _install_account_sync() -> void:
	account_sync = AccountSync.new()
	account_sync.name = "AccountSync"
	add_child(account_sync)
	account_sync.configure(Cloud,Progress,Catalog)
	account_sync.changed.connect(func(_status: String):
		if menus.visible:menus.refresh(_screen_data())
		_refresh_hud())
	account_sync.profiles_changed.connect(func(_rows: Array):
		if menus.visible:menus.refresh(_screen_data()))
	account_sync.sync_completed.connect(func(_details: Dictionary):
		if current_screen == "account":_notice(_t("synced","Progress synced.")))
	account_sync.daily_reward.connect(_cloud_daily_reward)
	account_sync.verification_changed.connect(func(details: Dictionary):
		if bool(details.get("verified",false)):_notice(_t("secureVerified","Score verified by the server."))
		elif not str(details.get("reason","")).is_empty():_notice(_t("secureUnranked","Saved locally. Server score verification is unavailable.")))

func _cloud_daily_reward(result: Dictionary, reward: Dictionary) -> void:
	if str(result.get("mode","")) == "daily" and current_screen == "game" and session.mode == "daily" and session.finished and str(session.day_id) == str(result.get("dayId","")):
		if is_instance_valid(_dialog) and not is_instance_valid(_completion_banner):
			var context: Variant = _dialog.get_meta("completion_result",{})
			if context is Dictionary and str(context.get("profileId","")) == str(Progress.save.get("profileId","")) and int(context.get("presentation",-1)) == _presentation_generation and str(context.get("mode","")) == "daily" and int(context.get("level",-1)) == int(result.get("level",-2)) and str(context.get("dayId","")) == str(result.get("dayId","")):_show_result(result,reward)
	elif int(reward.get("coins",0)) > 0:
		_notice("+%d MoleCoin" % int(reward.coins))

func _cloud_completed(request_id: int, result: Dictionary) -> void:
	if not _cloud_pending.has(request_id):return
	var operation := str(_cloud_pending[request_id])
	_cloud_pending.erase(request_id)
	if not bool(result.get("ok",false)):return
	var value: Variant = result.get("value",result.get("result",{}))
	if operation == "rankings":
		_rankings = value if value is Array else value.get("rows",[]) if value is Dictionary else []
		menus.refresh(_screen_data())
	elif operation == "sync":_notice(_t("synced","Progress synced."))

func _open_legal(path: String) -> void:
	if path not in ["privacy-policy.html","terms-of-use.html","player-name-rules.html","delete-data.html"]:return
	var documents: Dictionary = Catalog.load_json("legal",{})
	if documents.has(path):
		var box := _open_dialog(path.trim_suffix(".html").replace("-"," ").capitalize())
		box.add_child(UI.label(str(documents[path]),12))
		box.add_child(UI.button(_t("close","CLOSE"),_close_dialog))
		return
	var source := "res://"+path
	if not FileAccess.file_exists(source):source = "res://web/"+path
	if FileAccess.file_exists(source):
		var box := _open_dialog(path.trim_suffix(".html").replace("-"," ").capitalize())
		box.add_child(UI.label(UI.plain(FileAccess.get_file_as_string(source)),12))
		box.add_child(UI.button(_t("close","CLOSE"),_close_dialog))
	else:OS.shell_open("https://moleculox.com/"+path)

func _certificate(payload: Dictionary) -> void:
	var box := _open_dialog(_t("certificate","CERTIFICATE"))
	box.add_child(UI.label("MOLECULOX\nDR. EDWARD ATOM'S LAB",24,UI.CYAN))
	box.add_child(UI.label(str(Progress.save.get("playerName",Progress.current_name)),28,UI.AMBER))
	box.add_child(UI.label(_local(payload.get("title",payload.get("name",""))),20))
	box.add_child(UI.label("%d / 801 · %d RP" % [int(Progress.save.get("cur",0)),int(Progress.save.get("researchPoints",0))],16))
	box.add_child(UI.button(_t("close","CLOSE"),_close_dialog))

func _bonus_mission(payload: Dictionary) -> void:
	_bonus_milestone = int(payload.get("id",0))
	var mission: Dictionary = Modes.bonus_mission(Catalog,_bonus_milestone)
	if not mission.is_empty():
		var index := int(mission.get("level",0))
		_begin_attempt(index,"bonus",Modes.level_options(Catalog,index,str(mission.get("mode","classic"))))

func _start_local_duel(payload: Dictionary) -> void:
	menus.close_modal()
	duel.start_local(payload.get("players",[Progress.current_name,"Player 2"]),str(payload.get("gameKind","mixed")))

func _duel_turn_ready(context: Dictionary) -> void:
	_display_attempt(_t("duelTitle","ATOM DUEL")+" · %d" % (int(context.get("round",0))+1))
	session.pause("handoff")
	var players: Array = context.get("players",[])
	var turn := int(context.get("turn",0))
	var box := _open_dialog(str(players[turn]) if turn < players.size() else _t("ready","READY?"))
	box.add_child(UI.label(_t("duelPassDevice","Pass the device to the next player. Press PLAY when ready."),16))
	box.add_child(UI.button(_t("play","PLAY"),func():
		_close_dialog()
		session.resume("handoff"),Color("55c77d")))

func _duel_turn_completed(_context: Dictionary) -> void:
	board.interaction_locked = true
	if not duel.active:return
	var box := _open_dialog(_t("turnComplete","TURN COMPLETE"))
	box.add_child(UI.label(_t("duelNextPlayer","The next player will solve the same experiment."),16))
	box.add_child(UI.button(_t("continue","CONTINUE"),func():
		_close_dialog()
		duel.next_turn(),UI.CYAN))

func _duel_round_completed(context: Dictionary) -> void:
	var box := _open_dialog(_t("roundComplete","ROUND COMPLETE"))
	box.add_child(UI.label(_duel_score(context),22,UI.AMBER))
	box.add_child(UI.button(_t("next","NEXT ROUND"),func():
		_close_dialog()
		duel.next_turn(),Color("55c77d")))

func _duel_match_completed(context: Dictionary) -> void:
	var box := _open_dialog(_t("matchComplete","MATCH COMPLETE"))
	box.add_child(UI.label(_duel_score(context),24,UI.AMBER))
	box.add_child(UI.button(_t("duelTitle","ATOM DUEL"),func():show_screen("duel"),UI.CYAN))
	box.add_child(UI.button(_t("home","HOME"),func():show_screen("splash")))

func _duel_score(context: Dictionary) -> String:
	var players: Array = context.get("players",duel.state.get("players",["Player 1","Player 2"]))
	var wins: Array = context.get("wins",duel.state.get("wins",[0,0]))
	return "%s  %d : %d  %s" % [str(players[0]),int(wins[0]),int(wins[1]),str(players[1])]

func _install_online() -> void:
	var path := "res://scripts/services/online_duel.gd"
	if not ResourceLoader.exists(path):return
	var script: Script = load(path)
	if script == null or not script.can_instantiate():return
	online = script.new()
	add_child(online)
	online.configure(Cloud,Progress,session,Catalog)
	online.error.connect(func(details: Dictionary):_notice(str(details.get("message",details.get("code","Online duel unavailable")))))
	online.round_started.connect(func(_info: Dictionary):_display_attempt(_t("duelTitle","ATOM DUEL")))
	online.round_result.connect(_online_result)
	online.match_finished.connect(_online_result)
	online.changed.connect(_online_changed)

func _online_duel(action_name: String, payload: Dictionary) -> void:
	if online == null:
		_notice(Cloud.status)
		return
	if duel.active:duel.quit()
	match action_name:
		"create_room":online.create("mixed","mixed",Progress.current_name)
		"join_room":online.join(str(payload.get("code","")),Progress.current_name)
		"quick_match":online.quick_match(Progress.current_name)

func _online_changed(view: Dictionary) -> void:
	if current_screen != "game":
		_notice(str(view.get("status",view.get("state","")))+" "+str(view.get("code","")))

func _online_result(view: Dictionary) -> void:
	var box := _open_dialog(_t("duelTitle","ATOM DUEL"))
	box.add_child(UI.label(_local(view.get("message",view.get("status","ROUND COMPLETE"))),18,UI.CYAN))
	box.add_child(UI.button(_t("continue","CONTINUE"),func():
		_close_dialog()
		online.next_round(),Color("55c77d")))
	box.add_child(UI.button(_t("home","HOME"),func():
		online.leave()
		show_screen("splash")))

func _local(value: Variant) -> String:
	return UI.plain(value.get(Catalog.language,value.get("en",""))) if value is Dictionary else UI.plain(value)

func _t(key: String, fallback: String) -> String:
	var value := str(Catalog.text(key))
	return UI.plain(value) if value != key else fallback

func _unhandled_key_input(event: InputEvent) -> void:
	if not event.is_pressed() or current_screen != "game":return
	if event.is_action_pressed("ui_cancel"):
		if is_instance_valid(_dialog):_close_dialog()
		else:_hud_action("home")
	elif not is_instance_valid(_dialog) and not menus.visible:
		if event.is_action_pressed("ui_up"):_direction(0)
		elif event.is_action_pressed("ui_right"):_direction(1)
		elif event.is_action_pressed("ui_down"):_direction(2)
		elif event.is_action_pressed("ui_left"):_direction(3)
		elif event is InputEventKey and event.keycode == KEY_Z:_hud_action("undo")
		elif event is InputEventKey and event.keycode == KEY_R:_hud_action("restart")
		elif event is InputEventKey and event.keycode == KEY_H:_hud_action("hint")
		elif event is InputEventKey and event.keycode == KEY_TAB:
			var count: int = session.state.get("atoms",[]).size()
			if count > 0:board.set_selected((board.selected+1)%count)
		else:return
	else:return
	get_viewport().set_input_as_handled()

func _notification(what: int) -> void:
	if not is_instance_valid(session):return
	if what == NOTIFICATION_APPLICATION_PAUSED:
		session.pause("application")
		Progress.persist()
	elif what == NOTIFICATION_APPLICATION_RESUMED:session.resume("application")
