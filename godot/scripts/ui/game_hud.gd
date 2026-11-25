class_name MoleculoxGameHUD
extends Control
## Native version of the web goal card, action rail and lower navigation.
signal action(name: String)
signal direction_requested(direction: int)

const UI = preload("res://scripts/ui/ui_theme.gd")
const Preview = preload("res://scripts/ui/molecule_preview.gd")
var board_slot: Control
var _goal: Control
var _preview: Control
var _goal_name: Label
var _formula: Label
var _level: Label
var _stars: Label
var _moves: Label
var _clock: Label
var _special: Label
var _coins: Label
var _notice: Label
var _dpad: Control
var _buttons: Dictionary = {}
var _settings: Dictionary = {}

func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	theme = UI.make_theme()
	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	for side in ["left","right","top","bottom"]:
		margin.add_theme_constant_override("margin_"+side,8)
	add_child(margin)
	var layout := VBoxContainer.new()
	layout.add_theme_constant_override("separation",5)
	margin.add_child(layout)
	var header := HBoxContainer.new()
	header.custom_minimum_size.y = 153
	layout.add_child(header)
	_goal = PanelContainer.new()
	_goal.custom_minimum_size = Vector2(112,148)
	_goal.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	_goal.add_theme_stylebox_override("panel",UI.panel(Color("101a35"),UI.CYAN,2,14))
	header.add_child(_goal)
	var goal_copy := VBoxContainer.new()
	goal_copy.add_theme_constant_override("separation",1)
	_goal.add_child(goal_copy)
	var goal_title := UI.label(_t("goal","GOAL"),10,UI.CYAN)
	goal_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	goal_copy.add_child(goal_title)
	_preview = Preview.new()
	_preview.custom_minimum_size = Vector2(88,67)
	goal_copy.add_child(_preview)
	_goal_name = UI.label("",10)
	_goal_name.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	goal_copy.add_child(_goal_name)
	_formula = UI.label("",15,UI.AMBER)
	_formula.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	goal_copy.add_child(_formula)
	var middle := VBoxContainer.new()
	middle.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	middle.add_theme_constant_override("separation",4)
	header.add_child(middle)
	_level = _center_label(17)
	middle.add_child(_level)
	_stars = _center_label(25,UI.AMBER)
	middle.add_child(_stars)
	_moves = _center_label(12)
	middle.add_child(_moves)
	_clock = _center_label(13,UI.CYAN)
	middle.add_child(_clock)
	_special = _center_label(10,UI.AMBER)
	middle.add_child(_special)
	var right := VBoxContainer.new()
	right.custom_minimum_size.x = 58
	header.add_child(right)
	_coins = _center_label(13,UI.AMBER)
	right.add_child(_coins)
	right.add_child(_icon_button("settings","settings","",Color("b8c8de")))
	right.add_child(_icon_button("home","home","",UI.VIOLET))
	var play_area := HBoxContainer.new()
	play_area.size_flags_vertical = Control.SIZE_EXPAND_FILL
	play_area.add_theme_constant_override("separation",5)
	layout.add_child(play_area)
	board_slot = Control.new()
	board_slot.name = "BoardSlot"
	board_slot.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	board_slot.size_flags_vertical = Control.SIZE_EXPAND_FILL
	play_area.add_child(board_slot)
	var rail := VBoxContainer.new()
	rail.custom_minimum_size.x = 63
	rail.alignment = BoxContainer.ALIGNMENT_CENTER
	rail.add_theme_constant_override("separation",8)
	play_area.add_child(rail)
	for entry in [["undo","undo",_t("undo","UNDO"),UI.VIOLET],["hint","hint",_t("hint","HINT"),UI.CYAN],["hammer","hammer","HAMMER",UI.AMBER],["precision","one_square_move","1 SQUARE",UI.CYAN],["barrier","nano_barrier","BARRIER",UI.CYAN],["restart","restart",_t("restart","RESTART"),Color("51d28b")]]:
		rail.add_child(_icon_button(str(entry[0]),str(entry[1]),str(entry[2]),entry[3]))
	_notice = UI.label("",12,UI.AMBER)
	_notice.custom_minimum_size.y = 32
	_notice.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	layout.add_child(_notice)
	var bottom := HBoxContainer.new()
	bottom.custom_minimum_size.y = 112
	bottom.alignment = BoxContainer.ALIGNMENT_CENTER
	layout.add_child(bottom)
	_dpad = GridContainer.new()
	_dpad.columns = 3
	_dpad.add_theme_constant_override("h_separation",2)
	_dpad.add_theme_constant_override("v_separation",2)
	bottom.add_child(_dpad)
	for cell in 9:
		var directions := {1:0,3:3,5:1,7:2}
		if directions.has(cell):
			var direction: int = directions[cell]
			var key := UI.button(["↑","→","↓","←"][direction],func():direction_requested.emit(direction),UI.CYAN)
			key.custom_minimum_size = Vector2(34,34)
			key.add_theme_font_size_override("font_size",20)
			var style := UI.panel(Color("14213a"),Color("6fadd3"),1,9)
			style.content_margin_left = 2
			style.content_margin_right = 2
			style.content_margin_top = 0
			style.content_margin_bottom = 0
			key.add_theme_stylebox_override("normal",style)
			_dpad.add_child(key)
		else:
			var blank := Control.new()
			blank.custom_minimum_size = Vector2(34,34)
			_dpad.add_child(blank)
	var nav := HBoxContainer.new()
	nav.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	nav.alignment = BoxContainer.ALIGNMENT_CENTER
	bottom.add_child(nav)
	for entry in [["lab","lab",_t("lab","LAB")],["collect","molecule",_t("molecules","MOLECULES")],["hof","awards",_t("achvShort","AWARDS")]]:
		nav.add_child(_icon_button(str(entry[0]),str(entry[1]),str(entry[2]),UI.VIOLET))
	var doctor := UI.image("assets/images/dr-edward-atom.png",Vector2(72,112))
	bottom.add_child(doctor)

func configure(settings: Dictionary) -> void:
	_settings = settings
	if is_node_ready():
		_dpad.visible = bool(settings.get("dpad",false))
		for label in [_level,_moves,_clock]:
			label.add_theme_font_size_override("font_size",18 if bool(settings.get("largeText",false)) else (17 if label == _level else 12))

func show_level(index: int, mode: String, molecule: Dictionary, elements: Dictionary, caption: String = "") -> void:
	_level.text = caption if not caption.is_empty() else (_t("level","LEVEL {0}",[index+1]) if mode == "campaign" else _mode_name(mode))
	_goal_name.text = UI.plain(molecule.get("shortName",molecule.get("n","")))
	_formula.text = str(molecule.get("f",""))
	_preview.configure(molecule,elements)
	_notice.text = ""
	_buttons.restart.disabled = mode == "duel"
	_buttons.hint.disabled = mode == "duel"
	for kind in ["hammer","precision","barrier"]:
		_buttons[kind].visible = mode != "duel" and mode != "tutorial"
	configure(_settings)

func update_attempt(session: Node, save: Dictionary) -> void:
	var count: int = session.stars_for_moves(int(session.moves),int(session.level.get("p",1)))
	_stars.text = "★".repeat(count)+"☆".repeat(3-count)
	_moves.text = "%s %d · PAR %d" % [_t("movesLabel","MOVES"),int(session.moves),int(session.level.get("p",1))]
	_coins.text = "◉ %d" % int(save.get("coins",0))
	_buttons.undo.disabled = session.history.is_empty() or bool(session.finished) or bool(session.animation_busy)
	_buttons.restart.disabled = str(session.mode) == "duel" or bool(session.animation_busy)
	_buttons.hint.disabled = str(session.mode) == "duel" or bool(session.finished) or bool(session.auto_solving)
	var special := ""
	match str(session.game_type):
		"crystal":
			var collected := 0
			var crystals: Array = session.state.get("crystals",[])
			for crystal in crystals:
				if bool(crystal.get("collected",crystal.get("taken",false))):
					collected += 1
			special = "◆ %d / %d" % [collected,crystals.size()]
		"chain": special = "⚡ COMBO ×%d · %d" % [int(session.chain_max_combo),int(session.chain_reactions)]
		"reactor": special = "☢ %d · +%.0f s" % [int(session.reactor_hits),float(session.reactor_penalty)]
	_special.text = special if not special.is_empty() else str(session.feature).replace("_"," ").to_upper()
	update_clock(session)

func update_clock(session: Node) -> void:
	var seconds: float = session.remaining_seconds() if session.time_limit() > 0 else float(session.elapsed)+float(session.reactor_penalty)
	_clock.text = "%02d:%04.1f" % [int(seconds)/60,fmod(seconds,60)]
	_clock.add_theme_color_override("font_color",Color("ff718a") if session.time_limit() > 0 and seconds < 15 else UI.CYAN)

func set_notice(message: String) -> void:
	_notice.text = UI.plain(message)

func set_tool(kind: String) -> void:
	for key in ["hammer","precision","barrier"]:
		_buttons[key].self_modulate = Color("fff3a4") if key == kind else Color.WHITE

func _icon_button(key: String, icon: String, caption: String, tint: Color) -> Button:
	var button := UI.button(caption,func():action.emit(key),tint)
	button.name = key.capitalize()+"Button"
	button.custom_minimum_size = Vector2(60,58 if not caption.is_empty() else 43)
	button.icon = UI.texture("assets/ui/moleculox-icons/"+icon+".webp")
	button.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
	button.vertical_icon_alignment = VERTICAL_ALIGNMENT_TOP if not caption.is_empty() else VERTICAL_ALIGNMENT_CENTER
	button.expand_icon = true
	button.add_theme_constant_override("icon_max_width",26)
	button.add_theme_font_size_override("font_size",8)
	var style := UI.panel(tint.darkened(.85),tint.darkened(.25),1,12)
	style.content_margin_left = 3
	style.content_margin_right = 3
	style.content_margin_top = 5
	style.content_margin_bottom = 4
	button.add_theme_stylebox_override("normal",style)
	_buttons[key] = button
	return button

func _center_label(font_size: int, color: Color = UI.TEXT) -> Label:
	var label := UI.label("",font_size,color)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	return label

func _mode_name(mode: String) -> String:
	return {"daily":_t("todaysExpLabel","TODAY'S EXP."),"tutorial":_t("howToPlay","HOW TO PLAY"),"crystal":_t("catalystHunt","CATALYST HUNT"),"chain":_t("chainReaction","CHAIN REACTION"),"reactor":_t("classicReactor","CLASSIC REACTOR"),"duel":_t("duelTitle","ATOM DUEL")}.get(mode,mode.to_upper())

func _t(key: String, fallback: String, params: Array = []) -> String:
	var catalog := get_node_or_null("/root/Catalog")
	if catalog != null:
		var value := str(catalog.text(key,params))
		if value != key:
			return UI.plain(value)
	return fallback
