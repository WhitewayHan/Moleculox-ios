class_name MoleculoxBoard
extends Control
## Native Godot board, motion and input. Gameplay decisions remain in MoleculeRules.

signal action_requested(atom_index: int, direction: int)
signal chamber_requested(index: int)
signal selected_changed(atom_index: int)
signal tools_cell_requested(cell: Vector2i)
signal animation_finished
signal signature_started(recipe: Dictionary)

const FXScript = preload("res://scripts/ui/board_fx.gd")
const DIRECTIONS = [Vector2i.UP, Vector2i.RIGHT, Vector2i.DOWN, Vector2i.LEFT]
const STONE_PALETTES = [
	["b5b5b5", "8f8f8f", "686868"], ["5ba3ec", "3d76c0", "234f80"],
	["bd68ec", "8f42c0", "5f2884"], ["45cbd0", "29959b", "176b70"],
	["4ade9a", "279767", "176a4a"], ["56c8f2", "318fb6", "1d6381"],
	["ef79dc", "b64ca7", "7a2e70"], ["ffc85a", "d99a2d", "966417"],
	["ffdf72", "d8a936", "8a5c16"]]
const ELEMENTS = {
	"H": ["4fa8ff", "cfe6ff", "ffffff"], "O": ["ff5257", "ffd0d1", "ffffff"],
	"C": ["303c48", "93a7b8", "eaf6ff"], "N": ["8b5cf6", "ddccff", "ffffff"],
	"Cl": ["3ecf6e", "ccf6da", "06371c"], "Na": ["e9eef4", "ffffff", "37424d"],
	"S": ["ffd23f", "fff3bd", "5c4a00"], "F": ["c6e84a", "eefdb0", "2f4a00"],
	"Xe": ["3ecfc4", "c6f5ef", "083b36"], "B": ["ff9e8a", "ffd9cf", "5c1c0e"],
	"P": ["f0c05a", "ffe9bd", "4a3200"], "Si": ["a8b5c2", "e2e8ee", "1c2733"],
	"Br": ["a13b1c", "ff9e6e", "ffffff"], "I": ["5e2a8c", "c9a0ff", "ffffff"],
	"K": ["8f5fd1", "dcc8ff", "2a1245"], "Ca": ["7fae7f", "d4ecd4", "1c3320"],
	"Al": ["b8bec5", "eef1f4", "22262b"], "Li": ["d17f9e", "ffd6e6", "3a1220"],
	"Mg": ["6bc98a", "c8f5d6", "0e2617"], "Ge": ["7a8fa6", "cfe0f0", "141c26"],
	"Ga": ["c9a876", "f0e0c0", "2a2010"], "Sn": ["9db3bd", "e0eaee", "1a2226"],
	"As": ["c07ec9", "f0c8f5", "2a132c"], "Se": ["e67e22", "ffd4a8", "3d1c00"],
	"Te": ["c8a46b", "f3dfae", "2d2108"], "Pb": ["7d8597", "d8dde7", "10151c"],
	"Ti": ["819fb5", "dbeaf5", "102333"], "Bi": ["be8fa9", "f5ddeb", "351a2c"],
	"Sb": ["91afa8", "dcefe9", "17352d"]}

var state: Dictionary = {}
var level: Dictionary = {}
var molecule: Dictionary = {}
var selected: int = -1
var level_index: int = 0
var interaction_locked: bool = false
var reduced_motion: bool = false
var effects_enabled: bool = true
var mobile_motion: bool = true
var low_performance: bool = false
var tool_mode: String = ""
var hint_mark: Dictionary = {}
var won: bool = false
var cell_size: float = 40.0
var board_origin := Vector2.ZERO
var board_dimensions := Vector2i(8, 10)
var fx = FXScript.new()

var _clock: float = 0.0
var _redraw_elapsed: float = 0.0
var _pointer: Dictionary = {}
var _atom_positions: Dictionary = {}
var _moving_walls: Dictionary = {}
var _active_tween: Tween
var _animation_action: Dictionary = {}
var _animation_before: Dictionary = {}
var _animation_after: Dictionary = {}
var _motion_stages: Array[Dictionary] = []
var _motion_total: float = 0.0
var _stage_effects: Dictionary = {}
var _chamber_flash: Dictionary = {}
var _selected_at: float = -1000.0
var _press_at: float = 0.0
var _landing_at: float = -1000.0
var _landing_index: int = -1
var _landing_direction: int = 0
var _style_cache: Dictionary = {}
var _stone_texture_cache: Dictionary = {}
var _texture_cache: Dictionary = {}
var _sprite_metadata: Dictionary = {}
var _component_metadata: Dictionary = {}
var _stone_sprite_records: Dictionary = {}
var _atom_motion_duration: float = 0.0
var _wall_motion_duration: float = 0.0
var _motion_duration: float = 0.0
var _wall_phase_started: bool = false
var _synth_consumed: bool = false
var _element_palette: Dictionary = {}
var _font: Font
var _show_goal: bool = false
var _win_generation := 0

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP
	focus_mode = Control.FOCUS_ALL
	_font = ThemeDB.fallback_font
	fx.mouse_filter = Control.MOUSE_FILTER_IGNORE
	fx.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(fx)
	resized.connect(_recalculate_layout)
	_load_sprite_metadata()
	_recalculate_layout()

func configure(settings: Dictionary) -> void:
	reduced_motion = bool(settings.get("reduceMotion", false))
	effects_enabled = bool(settings.get("effects", true))
	low_performance = String(settings.get("performanceMode", "auto")) == "low"
	fx.reduced_motion = reduced_motion
	fx.effects_enabled = effects_enabled
	fx.particle_limit = 70 if low_performance else 195
	queue_redraw()

func configure_catalog(element_palette: Dictionary, sprite_metadata: Dictionary = {}) -> void:
	_element_palette = element_palette
	if not sprite_metadata.is_empty():
		_sprite_metadata = sprite_metadata.get("atoms",sprite_metadata)
		_component_metadata = sprite_metadata.get("components",{})
	queue_redraw()

func set_state(new_state: Dictionary, new_level: Dictionary = {}, new_molecule: Dictionary = {}) -> void:
	_win_generation += 1
	stop_animation()
	state = new_state.duplicate(true)
	level = new_level.duplicate(true)
	molecule = new_molecule.duplicate(true)
	level_index = int(level.get("_index", level.get("index", level_index)))
	var catalog: Node = get_node_or_null("/root/Catalog")
	if catalog != null and catalog.has_method("get_snapshot_record"):
		var record: Dictionary = catalog.get_snapshot_record(level_index)
		if not state.has("wallPalette") and record.get("palette") is Array: state.wallPalette = record.palette.duplicate()
		if not state.has("breakableWalls") and record.get("breakableWalls") is Array: state.breakableWalls = record.breakableWalls.duplicate(true)
	won = bool(state.get("won", false))
	if selected >= _atoms().size():
		selected = -1
	_pointer.clear()
	_recalculate_layout()
	queue_redraw()

func set_selected(index: int) -> void:
	if index < -1 or index >= _atoms().size():
		return
	selected = index
	_selected_at = _clock
	selected_changed.emit(index)
	queue_redraw()

func set_tool(mode: String) -> void:
	tool_mode = mode
	_pointer.clear()
	queue_redraw()

func set_hint(index: int, direction: int) -> void:
	hint_mark = {"i": index, "d": direction}
	set_selected(index)

func clear_hint() -> void:
	hint_mark.clear()
	queue_redraw()

func stop_animation() -> void:
	if _active_tween != null and _active_tween.is_valid():
		_active_tween.kill()
	_active_tween = null
	interaction_locked = false
	_atom_positions.clear()
	_moving_walls.clear()
	_animation_action.clear()
	_motion_stages.clear()
	_stage_effects.clear()

func animate_action(before: Dictionary, after: Dictionary, action: Dictionary) -> void:
	stop_animation()
	_pointer.clear()
	_animation_before = before.duplicate(true)
	_animation_after = after.duplicate(true)
	_animation_action = action.duplicate(true)
	state = before.duplicate(true)
	var before_atoms: Array = before.get("atoms", [])
	var after_atoms: Array = after.get("atoms", [])
	var main_index: int = int(action.get("i", action.get("atom_index", 0)))
	var direction: int = int(action.get("d", action.get("direction", 0)))
	_synth_consumed = _synthesis_consumed(before,after)
	var distance: float = 1.0
	if main_index >= 0 and main_index < before_atoms.size() and main_index < after_atoms.size():
		distance = maxf(1.0, absf(float(after_atoms[main_index].x) - float(before_atoms[main_index].x)) + absf(float(after_atoms[main_index].y) - float(before_atoms[main_index].y)))
		selected = main_index
	var duration: float = minf(0.125, 0.048 + distance * 0.014) if reduced_motion else (minf(0.160, 0.042 + distance * 0.021) if mobile_motion else minf(0.210, 0.050 + distance * 0.027))
	if direction == 4 or main_index < 0:
		# Original chamber actions commit the rotated grid immediately; only the
		# touch control flashes. Do not invent a whole-board rotation animation.
		state = after.duplicate(true)
		_chamber_flash[int(action.get("chamber_index", action.get("chamberIndex", 0)))] = _clock
		queue_redraw()
		call_deferred("_emit_animation_finished")
		return
	_motion_stages = _build_motion_stages(before, after, action, duration)
	_motion_total = 0.0
	for stage in _motion_stages: _motion_total += float(stage.duration)
	if _motion_total > 0.0: duration = _motion_total
	_atom_motion_duration = duration
	_wall_motion_duration = 0.0
	_wall_phase_started = false
	var old_walls: Array = _array(before.get("movingWalls",[]))
	var new_walls: Array = _array(after.get("movingWalls",[]))
	for index in range(mini(old_walls.size(),new_walls.size())):
		if _position_of(old_walls[index]) != _position_of(new_walls[index]):
			_wall_motion_duration = 0.080 if reduced_motion else (0.110 if mobile_motion else 0.210)
			break
	# Source advanceMovingWalls runs after landing and retains its own input lock.
	if _wall_motion_duration > 0.0: duration += 0.090 if reduced_motion else (0.122 if mobile_motion else 0.225)
	_motion_duration = duration
	interaction_locked = true
	_active_tween = create_tween()
	_active_tween.tween_method(_animate_progress, 0.0, 1.0, duration)
	_active_tween.finished.connect(_finish_animation)
	_animate_progress(0.0)

func _animate_progress(progress: float) -> void:
	var elapsed: float = progress * _motion_duration
	var atom_progress: float = clampf(elapsed / maxf(0.001,_atom_motion_duration),0.0,1.0)
	var wall_progress: float = clampf((elapsed-_atom_motion_duration)/maxf(0.001,_wall_motion_duration),0.0,1.0)
	if _wall_motion_duration > 0.0 and atom_progress >= 1.0 and not _wall_phase_started:
		_wall_phase_started = true
		state = _animation_after.duplicate(true)
		_landing_index = int(_animation_action.get("i",-1))
		_landing_direction = int(_animation_action.get("d",0))
		_landing_at = _clock
	var eased: float = clampf(atom_progress + 0.055 * sin(PI * atom_progress), 0.0, 1.0)
	var before_atoms: Array = _animation_before.get("atoms", [])
	var after_atoms: Array = _animation_after.get("atoms", [])
	var moved_index: int = int(_animation_action.get("i",-1))
	for index in range(before_atoms.size()):
		var after_index: int = index-1 if _synth_consumed and index > moved_index else index
		var from: Vector2 = _position_of(before_atoms[index])
		var to: Vector2 = from
		if _synth_consumed and index == moved_index:
			to = _position_of(_dictionary(_animation_action.get("plan",{})).get("dest",before_atoms[index]))
		elif after_index >= 0 and after_index < after_atoms.size(): to = _position_of(after_atoms[after_index])
		if from != to:
			if index == int(_animation_action.get("i", -1)) and not _motion_stages.is_empty():
				_atom_positions[index] = _staged_point(atom_progress)
				continue
			_atom_positions[index] = from.lerp(to, eased)
	var before_walls: Array = _array(_animation_before.get("movingWalls", []))
	var after_walls: Array = _array(_animation_after.get("movingWalls", []))
	for index in range(mini(before_walls.size(), after_walls.size())):
		var from := Vector2(float(before_walls[index].x), float(before_walls[index].y))
		var to := Vector2(float(after_walls[index].x), float(after_walls[index].y))
		_moving_walls[index] = from.lerp(to, wall_progress * wall_progress * (3.0 - 2.0 * wall_progress))
	queue_redraw()

func _finish_animation() -> void:
	var before: Dictionary = _animation_before
	var after: Dictionary = _animation_after
	var action: Dictionary = _animation_action
	state = after.duplicate(true)
	_atom_positions.clear()
	_moving_walls.clear()
	interaction_locked = false
	_active_tween = null
	_animation_action = {}
	_landing_index = int(action.get("i", action.get("atom_index", -1)))
	_landing_direction = int(action.get("d", action.get("direction", 0)))
	if not _wall_phase_started: _landing_at = _clock
	_emit_action_effects(before, after, action)
	queue_redraw()
	animation_finished.emit()

func _emit_action_effects(before: Dictionary, after: Dictionary, action: Dictionary) -> void:
	var previous: Array = before.get("atoms", [])
	var current: Array = after.get("atoms", [])
	var index: int = int(action.get("i", action.get("atom_index", -1)))
	if index >= 0 and index < current.size() and not _synthesis_consumed(before,after):
		var at: Vector2 = _center(current[index])
		var colors: Array = [_element_color(String(current[index].get("e", "H")), 0), Color.WHITE]
		fx.burst("landing", at, colors, cell_size / 40.0)
		if index < previous.size():
			var from: Vector2 = _center(previous[index])
			for portal in ([] if not _motion_stages.is_empty() else _array(before.get("portals", [])) + _array(before.get("rifts", []))):
				if Vector2(float(portal.get("toX", -1)), float(portal.get("toY", -1))) == Vector2(float(current[index].x), float(current[index].y)):
					fx.burst("portal_enter", from, [Color("67ebff"), Color("c58cff")], cell_size / 40.0)
					fx.burst("portal_exit", at, [Color("c58cff"), Color.WHITE], cell_size / 40.0)
	var old_crystals: Array = _array(before.get("crystals", []))
	var new_crystals: Array = _array(after.get("crystals", []))
	for crystal_index in range(mini(old_crystals.size(), new_crystals.size())):
		if not bool(old_crystals[crystal_index].get("collected", false)) and bool(new_crystals[crystal_index].get("collected", false)):
			fx.burst("collect", _center(new_crystals[crystal_index]), [Color("9d7bff"), Color("4fd8ff"), Color.WHITE], cell_size / 40.0)
	for atom_index in range(previous.size(), current.size()):
		fx.burst("collect", _center(current[atom_index]), [Color("7ee8ff"), Color.WHITE], cell_size / 40.0)

func play_win_effect(kind: String = "", colors: Array = []) -> void:
	won = true
	_win_generation += 1
	var generation := _win_generation
	var middle: Vector2 = board_origin + Vector2(board_dimensions) * cell_size * 0.5
	var palette: Array = colors if not colors.is_empty() else molecule.get("c",["#ffffff","#7ee8ff","#ffd76a"])
	var chemistry := str(molecule.get("fx","glit")) if kind.is_empty() else kind
	var recipe: Dictionary = {}
	var catalog: Node = get_node_or_null("/root/Catalog")
	if catalog != null:
		var recipes: Array = catalog.data.get("fxRecipes",[])
		if level_index >= 0 and level_index < recipes.size(): recipe = recipes[level_index]
	var atoms := _atoms().duplicate(true)
	get_tree().create_timer(.09).timeout.connect(func():
		if generation == _win_generation:fx.win_burst(chemistry,middle,palette,"low" if low_performance else "high"))
	get_tree().create_timer(.185).timeout.connect(func():
		if generation == _win_generation and not recipe.is_empty():fx.signature_bonds(recipe,atoms,board_origin,cell_size,palette))
	get_tree().create_timer(.330).timeout.connect(func():
		if generation == _win_generation and not recipe.is_empty():
			fx.signature(recipe,middle,palette,low_performance)
			signature_started.emit(recipe))
	queue_redraw()

func nudge(index: int, direction: int) -> void:
	if index < 0 or index >= _atoms().size() or interaction_locked:
		return
	selected = index
	var atom: Dictionary = _atoms()[index]
	var at := Vector2(float(atom.x), float(atom.y))
	var direction_value: Vector2 = Vector2(DIRECTIONS[clampi(direction, 0, 3)])
	interaction_locked = true
	_active_tween = create_tween()
	_active_tween.tween_method(func(p: float) -> void:
		_atom_positions[index] = at + direction_value * sin(p * PI) * 0.14
		queue_redraw(), 0.0, 1.0, 0.13)
	_active_tween.finished.connect(func() -> void:
		_atom_positions.erase(index)
		interaction_locked = false
		_active_tween = null
		queue_redraw()
		animation_finished.emit())

func _process(delta: float) -> void:
	_clock += maxf(0.0, delta)
	_redraw_elapsed += delta
	if interaction_locked or _redraw_elapsed >= (0.05 if low_performance else 1.0 / 30.0):
		_redraw_elapsed = 0.0
		queue_redraw()

func _notification(what: int) -> void:
	if what == NOTIFICATION_APPLICATION_FOCUS_OUT or what == NOTIFICATION_WM_MOUSE_EXIT:
		_pointer.clear()
		queue_redraw()

func _gui_input(event: InputEvent) -> void:
	if interaction_locked or won:
		return
	if event is InputEventScreenTouch:
		if event.pressed:
			_begin_pointer(event.position, event.index, true)
		else:
			_end_pointer(event.position, event.index, event.canceled)
		accept_event()
	elif event is InputEventScreenDrag:
		if not _pointer.is_empty() and int(_pointer.id) == event.index:
			_pointer.current = event.position
		accept_event()
	elif event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		if event.pressed:
			_begin_pointer(event.position, -1, false)
		else:
			_end_pointer(event.position, -1, false)
		accept_event()
	elif event is InputEventMouseMotion and not _pointer.is_empty() and int(_pointer.id) == -1:
		_pointer.current = event.position
	elif event is InputEventKey and event.pressed and not event.echo:
		var direction: int = -1
		match event.keycode:
			KEY_UP, KEY_W: direction = 0
			KEY_RIGHT, KEY_D: direction = 1
			KEY_DOWN, KEY_S: direction = 2
			KEY_LEFT, KEY_A: direction = 3
		if direction >= 0 and selected >= 0:
			action_requested.emit(selected, direction)
			accept_event()
		elif event.keycode == KEY_TAB and not _atoms().is_empty():
			set_selected((selected + 1) % _atoms().size())
			accept_event()

func _begin_pointer(at: Vector2, pointer_id: int, touch: bool) -> void:
	if not _pointer.is_empty() and int(_pointer.id) != pointer_id:
		return
	grab_focus()
	var chamber: int = _chamber_at(at)
	if tool_mode.is_empty() and chamber >= 0:
		chamber_requested.emit(chamber)
		return
	var index: int = -1 if tool_mode in ["barrier", "hammer"] else nearest_atom(at, 1.0, touch)
	_pointer = {"at": at, "current": at, "id": pointer_id, "touch": touch, "index": index, "atom": _atoms()[index] if index >= 0 else null, "cell": cell_at(at)}
	_press_at = _clock
	queue_redraw()

func _end_pointer(at: Vector2, pointer_id: int, cancelled: bool) -> void:
	if _pointer.is_empty() or int(_pointer.id) != pointer_id:
		return
	var gesture: Dictionary = _pointer
	_pointer = {}
	queue_redraw()
	if cancelled:
		return
	if tool_mode in ["barrier", "hammer"]:
		tools_cell_requested.emit(gesture.cell if tool_mode == "barrier" else cell_at(at))
		return
	var delta: Vector2 = at - Vector2(gesture.at)
	var distance: float = maxf(absf(delta.x), absf(delta.y))
	var index: int = int(gesture.index)
	if index >= _atoms().size():
		return
	if index >= 0 and gesture.atom != _atoms()[index]:
		return
	if distance < (18.0 if bool(gesture.touch) else 13.0):
		if index < 0:
			index = nearest_atom(at, 1.08, bool(gesture.touch))
		if index >= 0:
			set_selected(index)
			fx.burst("select", _center(_atoms()[index]), [_element_color(String(_atoms()[index].e), 0), Color.WHITE], cell_size / 40.0)
		return
	var direction: int = (1 if delta.x > 0 else 3) if absf(delta.x) > absf(delta.y) else (2 if delta.y > 0 else 0)
	if index < 0:
		index = nearest_atom(Vector2(gesture.at) + delta * 0.35, 1.10, bool(gesture.touch))
	if index < 0:
		index = nearest_atom(at, 1.05, bool(gesture.touch))
	if index >= 0:
		set_selected(index)
		action_requested.emit(index, direction)

func nearest_atom(at: Vector2, extra: float = 1.0, touch: bool = true) -> int:
	var radius_x: float = maxf(30.0 if touch else 22.0, cell_size * (0.92 if touch else 0.72)) * maxf(1.0, extra)
	var best: int = -1
	var best_score: float = 1.0
	for index in range(_atoms().size()):
		var center: Vector2 = _center(_atoms()[index])
		var difference := (at - center) / radius_x
		var score: float = difference.length_squared()
		if score < best_score:
			best_score = score
			best = index
	return best

func cell_at(at: Vector2) -> Vector2i:
	var cell: Vector2 = (at - board_origin) / maxf(1.0, cell_size)
	return Vector2i(floori(cell.x), floori(cell.y))

func _chamber_at(at: Vector2) -> int:
	var best: int = -1
	var best_score: float = 1.0
	var chambers: Array = _chambers()
	for index in range(chambers.size()):
		var chamber: Dictionary = chambers[index]
		var k: int = floori((float(chamber.get("size", 3)) - 1.0) * 0.5)
		var center: Vector2 = _center({"x": int(chamber.x) + k, "y": int(chamber.y) + k})
		var score: float = ((at - center) / maxf(28.0, cell_size * 0.72)).length_squared()
		if score <= best_score:
			best = index
			best_score = score
	return best

func _recalculate_layout() -> void:
	var grid: Array = state.get("grid", [])
	board_dimensions = Vector2i(grid[0].size(), grid.size()) if not grid.is_empty() else Vector2i(8, 10)
	cell_size = maxf(1.0, minf(58.0, floorf(minf(maxf(1.0, size.x - 18.0) / board_dimensions.x, maxf(1.0, size.y - 18.0) / board_dimensions.y))))
	board_origin = (size - Vector2(board_dimensions) * cell_size) * 0.5
	_style_cache.clear()
	queue_redraw()

func _draw() -> void:
	if _font == null:
		_font = ThemeDB.fallback_font
	var grid: Array = state.get("grid", [])
	if grid.is_empty():
		return
	var board_size: Vector2 = Vector2(board_dimensions) * cell_size
	_panel(Rect2(board_origin - Vector2(8, 8), board_size + Vector2(16, 16)), Color(0.025, 0.035, 0.11, 0.8), Color("8776ab"), 2.0, 12.0)
	draw_set_transform(board_origin)
	_draw_grid(grid)
	_draw_devices()
	_draw_group_bonds()
	_draw_atoms()
	_draw_hint()
	if not tool_mode.is_empty():
		var highlight: Vector2i = _pointer.get("cell", Vector2i(-1, -1))
		if highlight.x >= 0 and highlight.y >= 0 and highlight.x < board_dimensions.x and highlight.y < board_dimensions.y:
			var color := Color("8fefff")
			color.a = 0.55
			_panel(Rect2(Vector2(highlight) * cell_size + Vector2(2, 2), Vector2.ONE * (cell_size - 4)), Color(0.2, 0.7, 1, 0.18), color, 2.0, 5.0)
	draw_set_transform(Vector2.ZERO)

func _draw_grid(grid: Array) -> void:
	var excluded: Dictionary = {}
	for wall in _array(state.get("movingWalls", [])):
		excluded[_key(wall)] = true
	for pressure in _array(state.get("pressureSystems", [])):
		excluded[_key(pressure.door)] = true
	var enzyme: Dictionary = _dictionary(state.get("enzymeGate"))
	if not enzyme.is_empty():
		excluded[_key(enzyme)] = true
	var breakable: Dictionary = {}
	for entry in _breakable_walls():
		breakable[_key(entry)] = entry
	for y in range(grid.size()):
		for x in range(grid[y].size()):
			var wall: bool = bool(grid[y][x]) if not grid[y] is String else String(grid[y][x]) == "1"
			var key: String = str(x) + "," + str(y)
			if wall and not excluded.has(key):
				_draw_stone(Vector2(x, y) * cell_size, x, y, breakable.has(key))
			else:
				_panel(Rect2(Vector2(x, y) * cell_size + Vector2(2, 2), Vector2.ONE * (cell_size - 4.0)), Color(1, 1, 1, 0.05 if (x + y) % 2 else 0.028), Color.TRANSPARENT, 0, 4)

func _draw_stone(at: Vector2, gx: int, gy: int, broken_wall: bool = false,allow_doodle: bool = true) -> void:
	var tier: int = clampi(int(level.get("tier", floori(float(level_index) / 40.0))), 0, STONE_PALETTES.size() - 1)
	var palette: Array = state.get("wallPalette",level.get("stonePalette", STONE_PALETTES[tier]))
	var palette_parts: PackedStringArray = []
	for color in palette: palette_parts.append("#"+Color(String(color)).to_html(false))
	var record: Dictionary = _stone_sprite_records.get("|".join(palette_parts),{})
	var doodle: bool = allow_doodle and not broken_wall and not _has_clean_lab() and (gx * 5 + gy * 3 + gx * gy + level_index * 7) % 4 == 0
	var captured_path: String = str(record.get("plain",""))
	if doodle and record.get("doodles",[]).size() >= 8: captured_path = str(record.doodles[absi(gx * 11 + gy * 7 + level_index * 13)%8])
	var captured: Texture2D = _texture(captured_path) if not captured_path.is_empty() else null
	if captured != null:
		draw_texture_rect(captured,Rect2(at,Vector2.ONE*cell_size),false)
	else:
		var rectangle := Rect2(at + Vector2(2, 2), Vector2.ONE * (cell_size - 4.0))
		var texture: Texture2D = _stone_texture(palette)
		draw_texture_rect(texture, Rect2(at, Vector2.ONE * cell_size), false)
		_panel(rectangle, Color.TRANSPARENT, Color(1, 1, 1, 0.11), 1.0, 5.0)
		var inset: float = 5.0
		draw_polyline(PackedVector2Array([at + Vector2(inset, cell_size - inset), at + Vector2(inset, inset), at + Vector2(cell_size - inset, inset)]), Color(1, 1, 1, 0.35), 1.5, true)
		draw_polyline(PackedVector2Array([at + Vector2(inset, cell_size - inset), at + Vector2(cell_size - inset, cell_size - inset), at + Vector2(cell_size - inset, inset)]), Color(0, 0, 0, 0.4), 1.5, true)
		if doodle: _draw_doodle(at + Vector2.ONE * cell_size * 0.5, cell_size * 0.43, gx * 11 + gy * 7 + level_index * 13)
	if broken_wall:
		var crack := PackedVector2Array([Vector2(0.28, 0.16), Vector2(0.45, 0.38), Vector2(0.34, 0.55), Vector2(0.53, 0.72), Vector2(0.46, 0.88)])
		for index in range(crack.size()): crack[index] = at + crack[index] * cell_size
		draw_polyline(crack, Color("ffd699"), maxf(2.0, cell_size * 0.045), true)
		_text("⚒", at + Vector2(0.74, 0.24) * cell_size, cell_size * 0.20, Color("fff1bd"))

func _draw_doodle(center: Vector2, radius: float, seed: int) -> void:
	var color := Color(0.97, 0.985, 1, 0.36)
	var s: float = radius * 0.82
	match absi(seed) % 8:
		0:
			for angle in [0.0, PI / 3.0, -PI / 3.0]: _ellipse(center, Vector2(s * 0.82, s * 0.29), float(angle), color, maxf(1.15, radius * 0.105))
			draw_circle(center, radius * 0.1, color, true, -1, true)
		1:
			var points := PackedVector2Array([Vector2(-0.25, -0.68), Vector2(0.25, -0.68), Vector2(0.1, -0.68), Vector2(0.1, -0.12), Vector2(0.56, 0.62), Vector2(0.4, 0.76), Vector2(-0.4, 0.76), Vector2(-0.56, 0.62), Vector2(-0.1, -0.12), Vector2(-0.1, -0.68)])
			for index in range(points.size()): points[index] = center + points[index] * s
			draw_polyline(points, color, 1.5, true)
		2, 7:
			var points := [Vector2(-0.62, -0.25), Vector2(-0.12, 0.05), Vector2(0.36, -0.34), Vector2(0.64, 0.30)]
			for index in range(points.size() - 1): draw_line(center + points[index] * s, center + points[index + 1] * s, color, 1.5, true)
			for point in points: draw_arc(center + point * s, radius * 0.11, 0, TAU, 12, color, 1.4, true)
		3:
			_polygon_outline(center - Vector2(s * 0.28, 0), s * 0.42, 6, color, 1.5)
			_polygon_outline(center + Vector2(s * 0.28, 0), s * 0.42, 6, color, 1.5)
		4:
			for y in [-1, 1]:
				for x in [-1, 1]: draw_rect(Rect2(center + Vector2(x, y) * s * 0.31 - Vector2.ONE * s * 0.2, Vector2.ONE * s * 0.4), color, false, 1.3)
		5:
			for side in [-1.0, 1.0]:
				var points := PackedVector2Array()
				for index in range(17):
					var y: float = -0.7 + float(index) / 16.0 * 1.4
					points.append(center + Vector2(sin(y * PI * 1.4) * 0.55 * side, y) * s)
				draw_polyline(points, color, 1.4, true)
			for y in [-0.48, -0.16, 0.18, 0.49]: draw_line(center + Vector2(-0.30, y) * s, center + Vector2(0.30, y) * s, color, 1.3, true)
		6:
			_polygon_outline(center, s * 0.68, 6, color, 1.5)
			draw_arc(center, s * 0.33, 0, TAU, 24, color, 1.3, true)

func _draw_devices() -> void:
	for entry in _array(state.get("oneWays", [])):
		var at: Vector2 = _center_local(entry)
		var rotation_value: float = float(entry.get("d", 0)) * PI * 0.5
		draw_set_transform(board_origin + at, rotation_value)
		_panel(Rect2(-Vector2.ONE * cell_size * 0.36, Vector2.ONE * cell_size * 0.72), Color(0.345, 0.847, 1.0, 0.42), Color.TRANSPARENT, 0, cell_size * 0.12)
		var arrow := PackedVector2Array([Vector2(0, -0.25), Vector2(0.2, 0.02), Vector2(0.08, 0.02), Vector2(0.08, 0.25), Vector2(-0.08, 0.25), Vector2(-0.08, 0.02), Vector2(-0.2, 0.02)])
		for index in range(arrow.size()): arrow[index] *= cell_size
		draw_colored_polygon(arrow, Color("eaffff"))
		_reset_transform()
	for pad in _array(state.get("rotationPads", [])):
		var at: Vector2 = _center_local(pad)
		_glow(at, cell_size * 0.37, Color("7c3cff"), 0.18)
		draw_circle(at, cell_size * 0.31, Color(0.28, 0.12, 0.46, 0.7), true, -1, true)
		var angle: float = 0.0 if reduced_motion else _clock / 0.76 * signf(float(pad.get("d", 1)))
		draw_arc(at, cell_size * 0.19, angle - 0.35, angle + PI * 1.35, 24, Color("c9f7ff"), maxf(2.0, cell_size * 0.045), true)
		_text("90°", at, cell_size * 0.16, Color.WHITE)
	for entry in _array(state.get("rifts", [])): _draw_portal(entry, true)
	for entry in _array(state.get("portals", [])): _draw_portal(entry, false)
	for barrier in _array(state.get("barriers", [])): _draw_barrier(barrier)
	var walls: Array = _array(state.get("movingWalls", []))
	for index in range(walls.size()):
		var wall: Dictionary = walls[index]
		var coordinates := Vector2(float(wall.x), float(wall.y))
		coordinates = _moving_walls.get(index, coordinates)
		var at: Vector2 = coordinates * cell_size
		_draw_stone(at, roundi(coordinates.x), roundi(coordinates.y),false,false)
		_panel(Rect2(at + Vector2.ONE * cell_size * 0.095, Vector2.ONE * cell_size * 0.81), Color.TRANSPARENT, Color("ffc148"), maxf(2.0, cell_size * 0.045), cell_size * 0.12)
		for point in [Vector2(0.18, 0.18), Vector2(0.82, 0.18), Vector2(0.18, 0.82), Vector2(0.82, 0.82)]:
			draw_circle(at + point * cell_size, maxf(1.8, cell_size * 0.038), Color("1c2634"), true, -1, true)
			draw_circle(at + point * cell_size, maxf(1.0, cell_size * 0.017), Color("ffe48c"), true, -1, true)
		_text("↔", at + Vector2.ONE * cell_size * 0.5, cell_size * 0.34, Color("fff4bf"))
	for index in range(_array(state.get("pressureSystems", [])).size()):
		var system: Dictionary = _array(state.get("pressureSystems", []))[index]
		var occupied: bool = false
		for atom in _atoms():
			if _key(atom) == _key(system.plate): occupied = true
		var open: bool = _floor_at(Vector2i(int(system.door.x),int(system.door.y)))
		var plate: Vector2 = _center_local(system.plate)
		var color := Color("68ffb2") if occupied else Color("ffd36e")
		_glow(plate, cell_size * 0.3, color, 0.18)
		draw_circle(plate, cell_size * 0.3, Color(color, 0.25), true, -1, true)
		draw_arc(plate, cell_size * 0.22, 0, TAU, 28, Color("d9ffea") if occupied else Color("ffe7a8"), maxf(2.0, cell_size * 0.045), true)
		_text("✓" if occupied else "●", plate, cell_size * 0.25, Color("eafff2") if occupied else Color("fff1bf"))
		_text(String.chr(65 + index), plate + Vector2(0.23, -0.22) * cell_size, cell_size * 0.18, color)
		var door := Vector2(float(system.door.x), float(system.door.y)) * cell_size
		if open:
			_dashed_rect(Rect2(door + Vector2.ONE * cell_size * 0.12, Vector2.ONE * cell_size * 0.76), Color(0.45, 1, 0.71, 0.65), cell_size * 0.12, maxf(2.0, cell_size * 0.04))
			_text("↔", door + Vector2.ONE * cell_size * 0.5, cell_size * 0.28, Color("d9ffea"))
		else:
			_draw_stone(door, int(system.door.x), int(system.door.y),false,false)
			for rail in range(1, 4):
				draw_line(door + Vector2(0.22 * rail, 0.18) * cell_size, door + Vector2(0.22 * rail, 0.82) * cell_size, Color("ffe0a0"), maxf(2.0, cell_size * 0.04), true)
		_text(String.chr(65 + index), door + Vector2(0.76, 0.24) * cell_size, cell_size * 0.18, Color("d9ffea") if open else Color("4b2f00"))
	for crystal in _array(state.get("crystals", [])):
		if not bool(crystal.get("collected", false)): _draw_component(crystal)
	var enzyme: Dictionary = _dictionary(state.get("enzymeGate"))
	if not enzyme.is_empty(): _draw_enzyme(enzyme)
	var replicator: Dictionary = _dictionary(state.get("replicator"))
	if not replicator.is_empty():
		_draw_lab_box(replicator, "×2", Color("79f2ff"))
		_draw_spawn(replicator, "+", Color("d2bbff"))
	var photon: Dictionary = _dictionary(state.get("photonPad"))
	if not photon.is_empty():
		var at: Vector2 = _center_local(photon)
		_glow(at, cell_size * 0.34, Color("8e78ff"), 0.18)
		draw_circle(at, cell_size * 0.34, Color(0.416, 0.306, 1, 0.13), true, -1, true)
		draw_arc(at, cell_size * 0.34, 0, TAU, 36, Color("79ebff"), maxf(2.0, cell_size * 0.04), true)
		_ellipse(at, Vector2(0.29, 0.12) * cell_size, 0.62, Color("bda1ff"), 1.4)
		_ellipse(at, Vector2(0.29, 0.12) * cell_size, -0.62, Color("bda1ff"), 1.4)
		_text("hν", at, cell_size * 0.24, Color("f5fbff"))
	var synthesizer: Dictionary = _dictionary(state.get("synthesizer"))
	if not synthesizer.is_empty():
		var failed: bool = bool(synthesizer.get("faulted", false))
		var complete: bool = bool(synthesizer.get("complete", false))
		var color := Color("ff6878") if failed else (Color("68ffc5") if complete else Color("db9bff"))
		_draw_lab_box(synthesizer, "×" if failed else "Σ", color)
		var recipe: String = String(synthesizer.get("inputA", "?")) + "+" + String(synthesizer.get("inputB", "?")) + "→" + String(synthesizer.get("output", ""))
		_text(recipe, _center_local(synthesizer) + Vector2(0, cell_size * 0.23), cell_size * 0.115, Color("f4e1ff"))
		var buffer: Array = synthesizer.get("buffer", [])
		for dot in range(2):
			var at: Vector2 = _center_local(synthesizer) + Vector2(-0.15 + dot * 0.30, -0.32) * cell_size
			draw_circle(at, cell_size * 0.075, Color("ffdb70") if dot < buffer.size() else Color(1, 1, 1, 0.13), true, -1, true)
		_draw_spawn(synthesizer, String(synthesizer.get("output", "")), color)
	for core in _array(state.get("repulsorCores", [])):
		var at: Vector2 = _center_local(core)
		for direction in DIRECTIONS:
			var neighbor: Vector2i = Vector2i(int(core.x), int(core.y)) + Vector2i(direction)
			if _floor_at(neighbor):
				_panel(Rect2(Vector2(neighbor) * cell_size + Vector2.ONE * cell_size * 0.10, Vector2.ONE * cell_size * 0.8), Color(0.322, 0.792, 1, 0.085), Color(0.424, 0.886, 1, 0.48), maxf(1.4, cell_size * 0.026), cell_size * 0.14)
		_glow(at, cell_size * 0.35, Color("54e8ff"), 0.15)
		draw_circle(at, cell_size * 0.35, Color(0.114, 0.545, 0.769, 0.24), true, -1, true)
		draw_arc(at, cell_size * 0.35, 0, TAU, 36, Color("76efff"), maxf(2.0, cell_size * 0.05), true)
		var angle: float = 0.0 if reduced_motion else _clock / 0.65
		draw_arc(at, cell_size * 0.22, angle, angle + PI * 1.45, 28, Color("ccfbff"), maxf(1.2, cell_size * 0.023), true)
		_text("⇱", at, cell_size * 0.25, Color("f5feff"))
	for index in range(_chambers().size()): _draw_chamber(_chambers()[index], index)
	for gate in _array(state.get("reactorGates", [])): _draw_reactor_gate(gate)

func _draw_portal(portal: Dictionary, rift: bool) -> void:
	var at: Vector2 = _center_local(portal)
	var is_a: bool = String(portal.get("id", "A")) in ["A", "RIFT-A"]
	var main := Color("b24cff") if rift else (Color("67ebff") if is_a else Color("c58cff"))
	var soft := Color("f4d8ff") if rift else (Color("bdf8ff") if is_a else Color("ead3ff"))
	var pulse: float = 1.0 if reduced_motion else (0.93 + 0.07 * sin(_clock / 0.22 + (0.0 if is_a else PI)))
	_glow(at, cell_size * 0.34, main, 0.18)
	for ring in range(12, 0, -1):
		var amount: float = float(ring) / 12.0
		var color: Color = Color(0.008, 0.031, 0.086, 0.1).lerp(main.darkened(0.5), 1.0 - amount)
		if amount < 0.3: color = color.lerp(soft, (0.3 - amount) / 0.3)
		draw_circle(at, cell_size * (0.31 if rift else 0.29) * amount * pulse, color, true, -1, true)
	if not reduced_motion:
		for ring in range(3):
			var progress: float = fmod(_clock / 0.76 + float(ring) / 3.0, 1.0)
			var radius: float = cell_size * (0.08 + 0.18 * progress)
			var color := Color(soft if ring % 2 else main, maxf(0.06, (1.0 - progress) * (0.28 - ring * 0.035)))
			_ellipse(at, Vector2(radius, radius * 0.58), (1.0 if is_a else -1.0) * (_clock / 1.6 + ring * 0.4), color, maxf(1.0, cell_size * 0.018))
	var spin: float = 0.0 if reduced_motion else _clock * (1.0 if is_a else -1.0) / (0.52 if rift else 0.9)
	_dashed_arc(at, cell_size * 0.245, spin, main, maxf(1.5, cell_size * 0.026), 12)
	_text("◆" if rift and is_a else ("◇" if rift else ("A" if is_a else "B")), at, cell_size * 0.16, soft)

func _draw_barrier(barrier: Dictionary) -> void:
	var at: Vector2 = _center_local(barrier)
	var pulse: float = 0.5 if reduced_motion else (0.5 + 0.5 * sin(_clock / 0.21))
	_glow(at, cell_size * 0.38, Color("56eaff"), 0.18)
	_panel(Rect2(at - Vector2.ONE * cell_size * 0.335, Vector2.ONE * cell_size * 0.67), Color(0.16, 0.55, 0.8, 0.25), Color("72ebff"), maxf(2.0, cell_size * 0.05), cell_size * 0.11)
	for line in [-1, 0, 1]:
		draw_line(at + Vector2(-0.24, line * 0.11) * cell_size, at + Vector2(0.24, line * 0.11) * cell_size, Color(0.79, 0.98, 1, 0.34), 1.0, true)
		draw_line(at + Vector2(line * 0.11, -0.24) * cell_size, at + Vector2(line * 0.11, 0.24) * cell_size, Color(0.79, 0.98, 1, 0.34), 1.0, true)
	for corner in [Vector2(-0.29, -0.29), Vector2(0.29, -0.29), Vector2(-0.29, 0.29), Vector2(0.29, 0.29)]:
		draw_circle(at + corner * cell_size, maxf(2.0, cell_size * 0.05), Color("102b49"), true, -1, true)
		draw_circle(at + corner * cell_size, maxf(1.0, cell_size * 0.021), Color("dfffff"), true, -1, true)
	var diamond := PackedVector2Array([at + Vector2(0, -0.16) * cell_size, at + Vector2(0.12, 0) * cell_size, at + Vector2(0, 0.16) * cell_size, at + Vector2(-0.12, 0) * cell_size])
	draw_colored_polygon(diamond, Color(0.36, 0.94, 1, 0.32))
	_closed_line(diamond, Color("efffff"), maxf(1.0, cell_size * 0.025))
	if not reduced_motion:
		var scan: float = -0.22 + fmod(_clock / 0.72 + float(barrier.x) * 0.13 + float(barrier.y) * 0.09, 1.0) * 0.44
		draw_line(at + Vector2(-0.23, scan) * cell_size, at + Vector2(0.23, scan) * cell_size, Color(1, 1, 1, 0.30 + 0.18 * pulse), 1.0, true)

func _draw_chamber(chamber: Dictionary, index: int) -> void:
	var chamber_size: int = int(chamber.get("size", 3))
	var at := Vector2(float(chamber.x), float(chamber.y)) * cell_size
	_dashed_rect(Rect2(at + Vector2.ONE * cell_size * 0.08, Vector2.ONE * cell_size * (chamber_size - 0.16)), Color("60ebff"), cell_size * 0.16, maxf(2.0, cell_size * 0.055))
	var k: int = floori((chamber_size - 1.0) / 2.0)
	var center: Vector2 = at + Vector2(k + 0.5, k + 0.5) * cell_size
	var pulse: float = 1.0 if reduced_motion else (0.88 + 0.12 * sin(_clock / 0.18 + index * 0.85))
	if _chamber_flash.has(index):
		var age: float = _clock - float(_chamber_flash[index])
		if age < 0.165: pulse *= 1.0 - 0.18 * sin(age / 0.165 * PI)
	draw_circle(center, cell_size * 0.29 * pulse, Color(0.055, 0.29, 0.424, 0.65), true, -1, true)
	draw_arc(center, cell_size * 0.29 * pulse, 0, TAU, 32, Color("cdfdff"), maxf(1.5, cell_size * 0.035), true)
	_text("↻", center, cell_size * 0.31, Color("f4feff"))
	if _chambers().size() > 1:
		_text(String(chamber.get("id", String.chr(65 + index))), center + Vector2(0, cell_size * 0.23), cell_size * 0.14, Color("e2fcff"))

func _draw_lab_box(device: Dictionary, caption: String, color: Color) -> void:
	var at: Vector2 = _center_local(device)
	var pulse: float = 1.0 if reduced_motion else (0.88 + 0.12 * sin(_clock / 0.22))
	_glow(at, cell_size * 0.39, color, 0.14 * pulse)
	_panel(Rect2(at - Vector2.ONE * cell_size * 0.40, Vector2.ONE * cell_size * 0.8), Color(color, 0.12), Color(color, 0.78 * pulse), maxf(2.0, cell_size * 0.045), cell_size * 0.16)
	_text(caption, at - Vector2(0, cell_size * 0.04), cell_size * 0.31, Color("eaffff"))

func _draw_spawn(device: Dictionary, caption: String, color: Color) -> void:
	var at := Vector2(float(device.get("spawnX", device.get("x", 0))) + 0.5, float(device.get("spawnY", device.get("y", 0))) + 0.5) * cell_size
	draw_circle(at, cell_size * 0.24, Color(color, 0.10), true, -1, true)
	draw_arc(at, cell_size * 0.24, 0, TAU, 32, Color(color, 0.68), maxf(1.5, cell_size * 0.032), true)
	_text(caption, at, cell_size * 0.23, Color("eaffff"))

func _draw_component(component: Dictionary) -> void:
	var at: Vector2 = _center_local(component)
	var kind: String = String(component.get("type", "catalyst"))
	var texture: Texture2D = _texture("res://assets/generated/components/" + kind + ".png")
	var legacy: bool = kind in ["catalyst", "energy", "stabilizer"]
	var animate: bool = not reduced_motion and not low_performance
	var pulse: float = (1.0 + sin(_clock / (0.23 if legacy else 0.47) + at.x * 0.017 + at.y * 0.013) * (0.07 if legacy else 0.026)) if animate else 1.0
	var rotation_value: float = sin(_clock / (0.760 if legacy else 1.280) + at.x * 0.012) * (0.08 if legacy else 0.028) if animate else 0.0
	if texture != null:
		var meta: Dictionary = _component_metadata.get(kind,{})
		var extent: float = cell_size * float(meta.get("logical",135.0))/55.0
		draw_set_transform(board_origin+at,rotation_value,Vector2.ONE*pulse)
		draw_texture_rect(texture, Rect2(-Vector2.ONE * extent * 0.5, Vector2.ONE * extent), false)
		_reset_transform()
	else:
		var colors: Array = [Color("a986ff"), Color("66e4ff"), Color("ffd66b")]
		var color: Color = colors[absi(kind.hash()) % colors.size()]
		_glow(at, cell_size * 0.3, color, 0.16)
		var points := PackedVector2Array()
		for index in range(6):
			points.append(at + Vector2(cos(-PI * 0.5 + index * TAU / 6.0), sin(-PI * 0.5 + index * TAU / 6.0)) * cell_size * 0.23 * pulse)
		draw_colored_polygon(points, Color(color, 0.65))
		_closed_line(points, color.lightened(0.4), 1.5)
		_text("✦" if legacy else "⚗", at, cell_size * 0.23, Color.WHITE)

func _draw_enzyme(gate: Dictionary) -> void:
	var at: Vector2 = _center_local(gate)
	var open: bool = bool(gate.get("open", false))
	var bio: bool = String(level.get("b", "")) == "bio"
	var animate: bool = not reduced_motion and not low_performance
	var phase: int = int(_clock / (0.120 if mobile_motion else 0.092)) % 12 if animate and (bio or not open) else 0
	var path: String = "res://assets/generated/enzyme/" + ("bio" if bio else "enzyme") + "-" + ("open" if open else "closed") + "-" + str(phase) + ".png"
	var texture: Texture2D = _texture(path)
	if texture != null:
		var extent: float = cell_size * (81.0/55.0) * (1.0+0.016*sin(_clock/0.430) if animate else 1.0)
		draw_texture_rect(texture, Rect2(at - Vector2.ONE * extent * 0.5, Vector2.ONE * extent), false)
	else:
		var color := Color("68ffb2") if open else Color("aa86ff")
		_panel(Rect2(at - Vector2.ONE * cell_size * 0.36, Vector2.ONE * cell_size * 0.72), Color(0.1, 0.12, 0.23, 0.9), color, maxf(2.0, cell_size * 0.04), cell_size * 0.15)
		_text("✓" if open else ("DNA" if bio else "⚗"), at, cell_size * 0.23, color)

func _draw_reactor_gate(gate: Dictionary) -> void:
	var x: float = float(gate.get("x", 0))
	var y: float = float(gate.get("y", 0))
	var at := Vector2(x + 0.5, y + 0.5) * cell_size
	var active: bool = bool(gate.get("active", false))
	var horizontal: bool = String(gate.get("axis", gate.get("orientation", "h"))) in ["h", "horizontal", "x"]
	var color := Color("ff5c69") if active else Color("a5edff")
	var direction: Vector2 = Vector2.RIGHT if horizontal else Vector2.DOWN
	_glow(at, cell_size * 0.38, color, 0.13 if active else 0.06)
	draw_line(at - direction * cell_size * 0.44, at + direction * cell_size * 0.44, Color(color, 0.25 if active else 0.12), cell_size * 0.15, true)
	draw_line(at - direction * cell_size * 0.44, at + direction * cell_size * 0.44, color, maxf(2.0, cell_size * 0.045), true)
	draw_circle(at, cell_size * 0.065, color.lightened(0.4), true, -1, true)

func _draw_group_bonds() -> void:
	var atoms: Array = _atoms()
	for group in _array(state.get("fusionGroups", [])):
		var members: Array = group.get("members", [])
		for first in range(members.size()):
			for second in range(first + 1, members.size()):
				var a: int = int(members[first])
				var b: int = int(members[second])
				if a >= atoms.size() or b >= atoms.size(): continue
				if absi(int(atoms[a].x) - int(atoms[b].x)) + absi(int(atoms[a].y) - int(atoms[b].y)) != 1: continue
				var from: Vector2 = _atom_point(a)
				var to: Vector2 = _atom_point(b)
				draw_line(from, to, Color("9c72ff"), maxf(9.0, cell_size * 0.14), true)
				draw_line(from, to, Color("73efff"), maxf(3.0, cell_size * 0.055), true)
	for pair in _array(state.get("stickyPairs", [])):
		if pair.size() < 2: continue
		var first: int = int(pair[0])
		var second: int = int(pair[1])
		if first >= atoms.size() or second >= atoms.size(): continue
		draw_line(_atom_point(first), _atom_point(second), Color(0.71, 0.9, 0.25, 0.4), cell_size * 0.21, true)
		draw_line(_atom_point(first), _atom_point(second), Color(1, 0.88, 0.41, 0.7), cell_size * 0.08, true)
	for pair in _array(state.get("linkedPairs", [])):
		if pair.size() < 2: continue
		var first: int = int(pair[0])
		var second: int = int(pair[1])
		if first >= atoms.size() or second >= atoms.size(): continue
		_dashed_line(_atom_point(first), _atom_point(second), Color("77e8ff"), cell_size * 0.12, maxf(3.0, cell_size * 0.055), 0.0 if reduced_motion else -_clock * cell_size / 0.035)
	var raw_bonds: Variant = molecule.get("bonds", molecule.get("bs", []))
	var bonds: Array = raw_bonds if raw_bonds is Array else raw_bonds.keys() if raw_bonds is Dictionary else []
	for first in range(atoms.size()):
		for second in range(first + 1, atoms.size()):
			if _atom_positions.has(first) or _atom_positions.has(second): continue
			var delta := Vector2i(int(atoms[second].x) - int(atoms[first].x), int(atoms[second].y) - int(atoms[first].y))
			if absi(delta.x) + absi(delta.y) != 1: continue
			var identity: String = String(atoms[first].e) + "," + String(atoms[second].e) + "," + str(delta.x) + "," + str(delta.y)
			if not bonds.is_empty() and not bonds.has(identity): continue
			var color := Color(0.76, 0.92, 1, 0.95)
			if bool(molecule.get("researchPattern", false)):
				_dashed_line(_atom_point(first), _atom_point(second), color, cell_size * 0.09, cell_size * 0.16)
			else:
				draw_line(_atom_point(first), _atom_point(second), color, cell_size * 0.16, true)

func _draw_atoms() -> void:
	var atoms: Array = _atoms()
	for index in range(atoms.size()):
		var atom: Dictionary = atoms[index]
		var at: Vector2 = _atom_point(index)
		var element: String = String(atom.get("e", "H"))
		var radius: float = cell_size * 0.4
		var scale_factor: float = 1.0
		if _landing_index == index and _clock - _landing_at < (0.09 if mobile_motion else 0.17):
			var wave: float = sin(clampf((_clock - _landing_at) / (0.09 if mobile_motion else 0.17), 0.0, 1.0) * PI)
			scale_factor += (0.05 if mobile_motion else 0.16) * wave
		elif index == selected and not won:
			var progress: float = clampf((_clock - _selected_at) / 0.12, 0.0, 1.0)
			scale_factor += 0.06 * (1.0 - pow(1.0 - progress, 3.0))
		var pressed: bool = not _pointer.is_empty() and int(_pointer.get("index", -1)) == index
		if pressed:
			var progress: float = clampf((_clock - _press_at) / 0.09, 0.0, 1.0)
			scale_factor *= 1.0 - 0.045 * (1.0 - pow(1.0 - progress, 3.0))
		radius *= scale_factor
		var fast: bool = interaction_locked and mobile_motion
		if not fast:
			var glow: float = 0.6 + 0.4 * sin(_clock / 1.5 + at.x * 0.011 + at.y * 0.014)
			_glow(at, radius * 1.6, _element_color(element, 0), 0.15 * glow)
		if index == selected and not won and not (fast and _atom_positions.has(index)):
			_dashed_arc(at, radius + 5.0 + (0.0 if reduced_motion else sin(_clock / 0.22) * 1.5), 0.0 if reduced_motion else _clock / 0.6, Color(1, 1, 1, 0.95), 2.5, 12)
		_draw_atom_base(at, radius, element)
		if not reduced_motion and not interaction_locked:
			var sweep: float = fmod(_clock / 2.6 + (at.x + at.y) * 0.0007, 1.0)
			var angle: float = -2.72 + sweep * 1.65
			draw_arc(at, radius * 0.78, angle, angle + 0.38, 12, Color(1, 1, 1, 0.10 + 0.06 * sin(sweep * PI)), maxf(1.0, radius * 0.035), true)
		_draw_atom_badges(at, radius, atom)
		if pressed:
			draw_arc(at, cell_size * 0.455, 0, TAU, 40, Color(_element_color(element, 1), 0.42), maxf(1.5, cell_size * 0.025), true)

func _draw_atom_base(at: Vector2, radius: float, element: String) -> void:
	var texture: Texture2D = _texture("res://assets/generated/atoms/" + element + ".png")
	if texture != null:
		var meta: Dictionary = _dictionary(_sprite_metadata.get(element))
		var base_radius: float = float(meta.get("r", 22.0))
		var width: float = float(meta.get("logicalW", 68.0)) / base_radius * radius
		var height: float = float(meta.get("logicalH", 68.0)) / base_radius * radius
		var center_x: float = float(meta.get("cx", 34.0)) / base_radius * radius
		var center_y: float = float(meta.get("cy", 34.0)) / base_radius * radius
		draw_texture_rect(texture, Rect2(at - Vector2(center_x, center_y), Vector2(width, height)), false)
		return
	var color: Color = _element_color(element, 0)
	var high: Color = _element_color(element, 1)
	_ellipse(at + Vector2(0, radius * 0.82), Vector2(radius * 0.85, radius * 0.32), 0.0, Color(0, 0, 0, 0.3), -1, true)
	var rings: int = maxi(18, ceili(radius))
	for ring in range(rings, 0, -1):
		var progress: float = float(ring) / rings
		var fill: Color = color.darkened(0.18).lerp(color, (1.0 - progress) * 2.0) if progress > 0.5 else color.lerp(high, (0.5 - progress) * 2.0)
		var light_offset := Vector2(-radius * 0.35, -radius * 0.42) * (1.0 - progress)
		draw_circle(at + light_offset, radius * progress, fill, true, -1, true)
	draw_arc(at, radius, 0, TAU, 48, Color(0, 0, 0, 0.35), 1.5, true)
	draw_arc(at, radius * 0.91, -2.72, -0.58, 24, Color(high, 0.34), maxf(1.0, radius * 0.055), true)
	_ellipse(at + Vector2(-0.3, -0.45) * radius, Vector2(0.32, 0.18) * radius, -0.6, Color(1, 1, 1, 0.58), -1, true)
	draw_circle(at + Vector2(-0.48, -0.18) * radius, maxf(1.0, radius * 0.065), Color(1, 1, 1, 0.28), true, -1, true)
	_text(element, at + Vector2(0, radius * 0.05), radius * 0.85, _element_color(element, 2))

func _draw_atom_badges(at: Vector2, radius: float, atom: Dictionary) -> void:
	if bool(atom.get("fragile", false)):
		var hits: int = int(atom.get("fragileHits", 0))
		_dashed_arc(at, radius + 5.0, 0, Color("c4efff"), maxf(2.0, radius * 0.09), 12)
		if hits >= 1:
			draw_polyline(PackedVector2Array([at + Vector2(-0.15, -0.72) * radius, at + Vector2(0.05, -0.22) * radius, at + Vector2(-0.16, 0.08) * radius]), Color.WHITE, 1.5, true)
		if hits >= 2:
			draw_line(at + Vector2(0.05, -0.22) * radius, at + Vector2(0.48, -0.02) * radius, Color.WHITE, 1.5, true)
			draw_line(at + Vector2(-0.16, 0.08) * radius, at + Vector2(0.16, 0.58) * radius, Color.WHITE, 1.5, true)
		_text(str(maxi(0, int(atom.get("fragileMax", 3)) - hits)), at + Vector2(0.72, -0.68) * radius, radius * 0.55, Color("eaf9ff"))
	if bool(atom.get("photonBoost", false)):
		_dashed_arc(at, radius + cell_size * 0.085, 0 if reduced_motion else -_clock / 0.032, Color("96efff"), maxf(2.0, cell_size * 0.034), 12)
		_text("✦", at + Vector2(0.7, -0.72) * radius, cell_size * 0.18, Color("f6f0ff"))
	var kind: String = ""
	for candidate in ["zombie", "lightning", "fire", "frozen", "sticky"]:
		if bool(atom.get(candidate, false)):
			kind = candidate
			break
	var tint := Color("8feaff")
	match kind:
		"frozen":
			tint = Color("c8f4ff")
			_dashed_arc(at, radius + 6.0, 0, tint, maxf(2.0, cell_size * 0.035), 12)
			draw_polyline(PackedVector2Array([at + Vector2(-0.55, -0.18) * radius, at + Vector2(-0.12, 0.05) * radius, at + Vector2(-0.38, 0.48) * radius]), tint, maxf(2.0, cell_size * 0.035), true)
			draw_polyline(PackedVector2Array([at + Vector2(0.05, -0.55) * radius, at + Vector2(-0.02, -0.12) * radius, at + Vector2(0.42, 0.18) * radius]), tint, maxf(2.0, cell_size * 0.035), true)
			_text("❄", at + Vector2(0.78, -0.78) * radius, radius * 0.56, tint)
		"fire":
			tint = Color("ff9b3d")
			var pulse: float = 1.0 if reduced_motion else (1.0 + sin(_clock / 0.18) * 0.06)
			var points := PackedVector2Array()
			for index in range(10):
				var angle: float = -PI * 0.5 + index * PI / 5.0
				var rr: float = (radius + (3.0 if index % 2 else 9.0)) * pulse
				points.append(at + Vector2(cos(angle), sin(angle)) * rr)
			_closed_line(points, tint, maxf(2.0, cell_size * 0.035))
			_text("🔥", at + Vector2(0.78, -0.78) * radius, radius * 0.56, tint)
		"lightning":
			tint = Color("83efff")
			_dashed_arc(at, radius + 7.0, 0.0 if reduced_motion else -_clock / 0.024, tint, maxf(2.0, cell_size * 0.035), 18)
			if not reduced_motion and not interaction_locked:
				for index in range(3):
					var angle: float = _clock / 0.22 + index * 2.1
					var from: Vector2 = at + Vector2(cos(angle), sin(angle)) * (radius + 4.0)
					var to: Vector2 = at + Vector2(cos(angle + 0.28), sin(angle + 0.28)) * (radius + 13.0)
					draw_polyline(PackedVector2Array([from, (from + to) * 0.5 + Vector2(sin(_clock / 0.07 + index) * 3.0, 0), to]), Color(tint, 0.7), maxf(2.0, cell_size * 0.035), true)
			_text("⚡", at + Vector2(0.78, -0.78) * radius, radius * 0.56, tint)
		"zombie":
			tint = Color("8feaff")
			var orbit: float = radius + 7.0
			_ellipse(at, Vector2(orbit, orbit * 0.38), -0.54, Color("69e8ff"), maxf(1.8, cell_size * 0.027))
			_ellipse(at, Vector2(orbit * 0.98, orbit * 0.40), 0.54, Color("bc86ff"), maxf(1.8, cell_size * 0.027))
			draw_circle(at + Vector2(-0.70, -0.25) * orbit, maxf(1.9, cell_size * 0.029), Color("eaffff"), true, -1, true)
			draw_circle(at + Vector2(0.68, 0.26) * orbit, maxf(1.9, cell_size * 0.029), Color("d2adff"), true, -1, true)
			var badge: Vector2 = at + Vector2(0.78, -0.78) * radius
			var badge_radius: float = maxf(7.0, cell_size * 0.115)
			draw_circle(badge, badge_radius, Color("0a111f"), true, -1, true)
			draw_arc(badge, badge_radius, 0, TAU, 24, Color("d9d7ff"), 1.5, true)
			draw_circle(badge, badge_radius * 0.58, Color("c26fff"), true, -1, true)
			draw_polyline(PackedVector2Array([badge + Vector2(-0.16, -0.48) * badge_radius, badge + Vector2(0.05, -0.12) * badge_radius, badge + Vector2(-0.11, 0.08) * badge_radius, badge + Vector2(0.21, 0.44) * badge_radius]), Color("fff1a5"), 1.5, true)
		"sticky":
			tint = Color("ffd25c")
			var points := PackedVector2Array()
			for index in range(16):
				var angle: float = index * PI / 8.0
				points.append(at + Vector2(cos(angle), sin(angle)) * (radius + (4.0 if index % 2 else 8.0)))
			_closed_line(points, tint, maxf(2.0, cell_size * 0.035))
			_ellipse(at + Vector2(-0.2, 0.36) * radius, Vector2(0.28, 0.14) * radius, 0.0, Color(1, 0.77, 0.18, 0.7), -1, true)
			_text("🍯", at + Vector2(0.78, -0.78) * radius, radius * 0.56, tint)
	if kind != "" and kind != "zombie" and not interaction_locked:
		_glow(at, radius + 10.0, tint, 0.06)
	if bool(atom.get("linked", false)):
		_text("🔗", at + Vector2(0.27, -0.28) * cell_size, cell_size * 0.20, Color("e8fbff"))
	if bool(atom.get("stickyBonded", false)) and not bool(atom.get("sticky", false)):
		_text("🍯", at + Vector2(0.28, -0.28) * cell_size, cell_size * 0.18, Color("fff4b8"))

func _draw_hint() -> void:
	var index: int = int(hint_mark.get("i", -1))
	if index < 0 or index >= _atoms().size(): return
	var direction: int = clampi(int(hint_mark.get("d", 0)), 0, 3)
	var at: Vector2 = _atom_point(index)
	var vector: Vector2 = Vector2(DIRECTIONS[direction])
	var distance: float = cell_size * (0.75 + (0.0 if reduced_motion else 0.18 * sin(_clock / 0.18)))
	var head: Vector2 = at + vector * distance
	var side: Vector2 = vector.orthogonal()
	draw_colored_polygon(PackedVector2Array([head + vector * cell_size * 0.3, head - vector * cell_size * 0.12 + side * cell_size * 0.22, head - vector * cell_size * 0.12 - side * cell_size * 0.22]), Color("ffd23f"))
	draw_arc(at, cell_size * 0.52, 0, TAU, 40, Color("ffd23f"), 3.0, true)

func _atom_point(index: int) -> Vector2:
	var atom: Dictionary = _atoms()[index]
	var coordinates := Vector2(float(atom.x), float(atom.y))
	coordinates = _atom_positions.get(index, coordinates)
	var bob: float = 0.0 if reduced_motion or _atom_positions.has(index) else sin(_clock / 0.52 + float(atom.get("ph", index * 1.73))) * 0.035
	return (coordinates + Vector2(0.5, 0.5 + bob)) * cell_size

func _center(value: Dictionary) -> Vector2:
	return board_origin + _center_local(value)

func _center_local(value: Dictionary) -> Vector2:
	return Vector2(float(value.get("x", 0)) + 0.5, float(value.get("y", 0)) + 0.5) * cell_size

func _atoms() -> Array:
	return _array(state.get("atoms", []))

func _chambers() -> Array:
	var chambers: Array = _array(state.get("rotatingChambers", []))
	if chambers.is_empty() and state.get("rotatingChamber") is Dictionary:
		chambers.append(state.rotatingChamber)
	return chambers

func _array(value: Variant) -> Array:
	if value is Array: return value
	if value is Dictionary: return value.values()
	return []

func _dictionary(value: Variant) -> Dictionary:
	return value if value is Dictionary else {}

func _key(value: Dictionary) -> String:
	return str(int(value.get("x", -1))) + "," + str(int(value.get("y", -1)))

func _floor_at(cell: Vector2i) -> bool:
	var grid: Array = state.get("grid", [])
	return cell.y >= 0 and cell.y < grid.size() and cell.x >= 0 and cell.x < grid[cell.y].size() and not bool(grid[cell.y][cell.x])

func _breakable_walls() -> Array:
	var source: Variant = state.get("breakableWalls", level.get("bw", []))
	var result: Array = []
	for value in _array(source):
		if value is Dictionary:
			if not bool(value.get("broken", false)): result.append(value)
		elif value is Array and value.size() >= 2:
			result.append({"x": value[0], "y": value[1]})
	return result

func _has_clean_lab() -> bool:
	return state.get("photonPad") is Dictionary or state.get("synthesizer") is Dictionary or not _array(state.get("repulsorCores", [])).is_empty()

func _element_color(element: String, part: int) -> Color:
	if _element_palette.has(element):
		var value: Variant = _element_palette[element]
		if value is Dictionary:
			return Color(String(value.get(["c", "hi", "t"][part], "ffffff")))
		if value is Array and value.size() > part: return Color(String(value[part]))
	var colors: Array = ELEMENTS.get(element, ELEMENTS.H)
	return Color(String(colors[part]))

func _texture(resource_path: String) -> Texture2D:
	if _texture_cache.has(resource_path): return _texture_cache[resource_path]
	var texture: Texture2D = null
	var catalog: Node = get_node_or_null("/root/Catalog")
	if catalog != null:
		texture = catalog.call("asset",resource_path) as Texture2D
	elif ResourceLoader.exists(resource_path): texture = load(resource_path) as Texture2D
	_texture_cache[resource_path] = texture
	return texture

func _load_sprite_metadata() -> void:
	if FileAccess.file_exists("res://data/stones.json"):
		var stones: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://data/stones.json"))
		if stones is Dictionary: _stone_sprite_records = stones.get("byPalette",{})
	if FileAccess.file_exists("res://data/sprites.json"):
		var sprites: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://data/sprites.json"))
		if sprites is Dictionary:
			_sprite_metadata = sprites.get("atoms",{})
			_component_metadata = sprites.get("components",{})
	for resource_path in ["res://assets/generated/atoms/manifest.json", "res://data/atom-sprites.json"]:
		if FileAccess.file_exists(resource_path):
			var content: Variant = JSON.parse_string(FileAccess.get_file_as_string(resource_path))
			if content is Dictionary: _sprite_metadata = content
	var catalog: Node = get_node_or_null("/root/Catalog")
	if catalog != null:
		var candidate: Variant = catalog.get("font")
		if candidate is Font: _font = candidate
		var elements: Variant = catalog.get("elements")
		if elements is Dictionary: _element_palette = elements

func _panel(rectangle: Rect2, fill: Color, border: Color, width: float, radius: float) -> void:
	var key: String = fill.to_html() + "|" + border.to_html() + "|" + str(width) + "|" + str(radius)
	var style: StyleBoxFlat = _style_cache.get(key)
	if style == null:
		style = StyleBoxFlat.new()
		style.bg_color = fill
		style.border_color = border
		style.set_border_width_all(roundi(width))
		style.set_corner_radius_all(roundi(radius))
		style.anti_aliasing = true
		_style_cache[key] = style
	draw_style_box(style, rectangle)

func _text(value: String, at: Vector2, font_size: float, color: Color) -> void:
	if _font == null: return
	var point_size: int = maxi(6, roundi(font_size))
	var extent: Vector2 = _font.get_string_size(value, HORIZONTAL_ALIGNMENT_LEFT, -1, point_size)
	draw_string(_font, at + Vector2(-extent.x * 0.5, point_size * 0.35), value, HORIZONTAL_ALIGNMENT_LEFT, -1, point_size, color)

func _ellipse(center: Vector2, radii: Vector2, angle: float, color: Color, width: float = 1.0, filled: bool = false) -> void:
	var points := PackedVector2Array()
	for index in range(49):
		var progress: float = float(index) / 48.0 * TAU
		points.append(center + Vector2(cos(progress) * radii.x, sin(progress) * radii.y).rotated(angle))
	if filled: draw_colored_polygon(points, color)
	else: draw_polyline(points, color, width, true)

func _glow(at: Vector2, radius: float, color: Color, alpha: float) -> void:
	if low_performance: return
	for ring in range(5, 0, -1):
		var tint := Color(color, alpha / 5.0 * float(6 - ring) / 5.0)
		draw_circle(at, radius * (0.50 + 0.10 * ring), tint, true, -1, true)

func _polygon_outline(center: Vector2, radius: float, sides: int, color: Color, width: float) -> void:
	var points := PackedVector2Array()
	for index in range(sides): points.append(center + Vector2(cos(-PI * 0.5 + index * TAU / sides), sin(-PI * 0.5 + index * TAU / sides)) * radius)
	_closed_line(points, color, width)

func _closed_line(points: PackedVector2Array, color: Color, width: float) -> void:
	if points.is_empty(): return
	var closed: PackedVector2Array = points.duplicate()
	closed.append(points[0])
	draw_polyline(closed, color, width, true)

func _dashed_arc(center: Vector2, radius: float, rotation_value: float, color: Color, width: float, dash_count: int) -> void:
	for index in range(dash_count):
		var start: float = rotation_value + float(index) / dash_count * TAU
		draw_arc(center, radius, start, start + TAU / dash_count * 0.54, 5, color, width, true)

func _dashed_rect(rectangle: Rect2, color: Color, dash_length: float, width: float) -> void:
	var points: Array[Vector2] = [rectangle.position, rectangle.position + Vector2(rectangle.size.x, 0), rectangle.end, rectangle.position + Vector2(0, rectangle.size.y), rectangle.position]
	for index in range(4): _dashed_line(points[index], points[index + 1], color, dash_length, width)

func _dashed_line(from: Vector2, to: Vector2, color: Color, dash_length: float, width: float, phase: float = 0.0) -> void:
	var length: float = from.distance_to(to)
	if length <= 0.01: return
	var direction: Vector2 = (to - from) / length
	var period: float = maxf(1.0, dash_length * 1.7)
	var position_value: float = fposmod(phase, period) - period
	while position_value < length:
		var begin: float = maxf(0.0, position_value)
		var end: float = minf(length, position_value + dash_length)
		if end > begin: draw_line(from + direction * begin, from + direction * end, color, width, true)
		position_value += period

func _route_point(route: Array, progress: float) -> Vector2:
	var span: float = float(route.size() - 1)
	var coordinate: float = clampf(progress, 0.0, 1.0) * span
	var index: int = mini(route.size() - 2, floori(coordinate))
	var from: Variant = route[index]
	var to: Variant = route[index + 1]
	var a: Vector2 = Vector2(float(from.x), float(from.y)) if from is Dictionary else Vector2(float(from[0]), float(from[1]))
	var b: Vector2 = Vector2(float(to.x), float(to.y)) if to is Dictionary else Vector2(float(to[0]), float(to[1]))
	return a.lerp(b, coordinate - index)

func _reset_transform() -> void:
	draw_set_transform(board_origin)


func _emit_animation_finished() -> void:
	animation_finished.emit()

func _slide_duration(distance: float) -> float:
	if reduced_motion: return minf(0.125, 0.048 + maxf(1.0, distance) * 0.014)
	return minf(0.160, 0.042 + maxf(1.0, distance) * 0.021) if mobile_motion else minf(0.210, 0.050 + maxf(1.0, distance) * 0.027)

func _build_motion_stages(before: Dictionary, after: Dictionary, action: Dictionary, default_duration: float) -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	var supplied: Array = _array(action.get("visual_segments", []))
	for item in supplied:
		if item is Dictionary and item.has("from") and item.has("to"):
			result.append({"from": _position_of(item.from), "to": _position_of(item.to), "duration": maxf(0.001, float(item.get("duration", default_duration))), "kind": String(item.get("kind", "slide"))})
	if not result.is_empty(): return result
	var index: int = int(action.get("i", action.get("atom_index", -1)))
	var previous: Array = before.get("atoms", [])
	var current: Array = after.get("atoms", [])
	if index < 0 or index >= mini(previous.size(), current.size()): return result
	var start: Vector2 = _position_of(previous[index])
	var finish: Vector2 = _position_of(current[index])
	var plan: Dictionary = _dictionary(action.get("plan", {}))
	if _synthesis_consumed(before,after) and plan.get("dest") != null: finish = _position_of(plan.dest)
	var direction: int = clampi(int(action.get("d", action.get("direction", 0))), 0, 3)
	var axis := Vector2(DIRECTIONS[direction])
	var route: Array = _array(action.get("routePath", action.get("route_path", []))).duplicate()
	if not route.is_empty() and _position_of(route[0]) != start: route.push_front({"x":start.x,"y":start.y})
	var rift: Dictionary = _dictionary(plan.get("rift", action.get("rift", {})))
	if rift.is_empty():
		for point_index in range(maxi(0,route.size()-1)):
			for entry in _array(before.get("rifts",[])):
				var exit := Vector2(float(entry.get("toX",-1)),float(entry.get("toY",-1)))
				if _position_of(route[point_index]) == _position_of(entry) and _position_of(route[point_index+1]) == exit:
					rift = {"entry":entry,"exit":{"x":exit.x,"y":exit.y}}
					break
			if not rift.is_empty(): break
	if not rift.is_empty() and rift.has("entry") and rift.has("exit"):
		var entry: Vector2 = _position_of(rift.entry)
		var exit: Vector2 = _position_of(rift.exit)
		result.append({"from": start, "to": entry, "duration": _slide_duration(start.distance_to(entry)), "kind": "slide"})
		result.append({"from": entry, "to": exit, "duration": 0.001, "kind": "rift"})
		if exit != finish: result.append({"from": exit, "to": finish, "duration": _slide_duration(exit.distance_to(finish)), "kind": "slide"})
		return result
	for portal in _array(before.get("portals", [])):
		var entry: Vector2 = _position_of(portal)
		var exit := Vector2(float(portal.get("toX", -1)), float(portal.get("toY", -1)))
		var delta: Vector2 = entry - start
		if exit == finish and absf(delta.cross(axis)) < 0.01 and delta.dot(axis) >= 0.0:
			result.append({"from": start, "to": entry, "duration": _slide_duration(start.distance_to(entry)), "kind": "slide"})
			result.append({"from": entry, "to": exit, "duration": 0.080 if reduced_motion else (0.125 if mobile_motion else 0.155), "kind": "portal", "portal_id": String(portal.get("id", "A"))})
			return result
	# Active reactor beams truncate the visible path at the actual settled cell.
	for point_index in range(1,route.size()-1):
		if _position_of(route[point_index]) == finish:
			route = route.slice(0,point_index+1)
			break
	if route.size() >= 2:
		result.append({"from": start, "to": finish, "duration": _slide_duration(route.size() - 1), "kind": "route", "route": route})
	return result

func _staged_point(progress: float) -> Vector2:
	var elapsed: float = clampf(progress, 0.0, 1.0) * _motion_total
	for index in range(_motion_stages.size()):
		var stage: Dictionary = _motion_stages[index]
		var duration: float = float(stage.duration)
		if elapsed <= duration or index == _motion_stages.size() - 1:
			var fraction: float = clampf(elapsed / maxf(0.001, duration), 0.0, 1.0)
			var eased: float = clampf(fraction + 0.055 * sin(PI * fraction), 0.0, 1.0)
			if String(stage.kind) in ["portal", "rift"]:
				_stage_burst(index, stage, false)
				if fraction >= 1.0: _stage_burst(index, stage, true)
			if stage.kind == "route": return _route_point(stage.route, eased)
			return Vector2(stage.from).lerp(Vector2(stage.to), eased)
		if String(stage.kind) in ["portal", "rift"]:
			_stage_burst(index, stage, false)
			_stage_burst(index, stage, true)
		elapsed -= duration
	return Vector2(_motion_stages.back().to)

func _position_of(value: Variant) -> Vector2:
	if value is Vector2: return value
	if value is Vector2i: return Vector2(value)
	if value is Dictionary: return Vector2(float(value.get("x", 0)), float(value.get("y", 0)))
	if value is Array and value.size() >= 2: return Vector2(float(value[0]), float(value[1]))
	return Vector2.ZERO


func _stage_burst(index: int, stage: Dictionary, exiting: bool) -> void:
	var key: String = str(index) + ("-exit" if exiting else "-entry")
	if _stage_effects.has(key): return
	_stage_effects[key] = true
	var kind: String = "rift" if String(stage.kind) == "rift" else ("portal_exit" if exiting else "portal_enter")
	var position_value: Vector2 = Vector2(stage.to if exiting else stage.from)
	var at: Vector2 = board_origin + (position_value + Vector2.ONE * 0.5) * cell_size
	if kind == "rift": fx.rift(at, exiting)
	else: fx.portal(at, String(stage.get("portal_id", "A")), exiting, cell_size)


func _stone_texture(palette: Array) -> Texture2D:
	var key: String = str(palette) + "|" + str(cell_size)
	if _stone_texture_cache.has(key): return _stone_texture_cache[key]
	var dimension: int = maxi(1, ceili(cell_size))
	var image := Image.create(dimension, dimension, false, Image.FORMAT_RGBA8)
	var half_size: float = maxf(0.0, cell_size * 0.5 - 2.0)
	var radius: float = minf(5.0, half_size)
	for y in range(dimension):
		var progress: float = (y + 0.5) / maxf(1.0, cell_size)
		var color: Color = Color(String(palette[0])).lerp(Color(String(palette[1])), progress * 2.0) if progress < 0.5 else Color(String(palette[1])).lerp(Color(String(palette[2])), (progress - 0.5) * 2.0)
		for x in range(dimension):
			var q := Vector2(absf(x + 0.5 - cell_size * 0.5), absf(y + 0.5 - cell_size * 0.5)) - Vector2.ONE * (half_size - radius)
			var distance: float = Vector2(maxf(q.x, 0.0), maxf(q.y, 0.0)).length() + minf(maxf(q.x, q.y), 0.0) - radius
			var alpha: float = clampf(0.5 - distance, 0.0, 1.0)
			image.set_pixel(x, y, Color(color, alpha))
	var texture: ImageTexture = ImageTexture.create_from_image(image)
	_stone_texture_cache[key] = texture
	return texture

func _synthesis_consumed(before: Dictionary,after: Dictionary) -> bool:
	var old: Dictionary = _dictionary(before.get("synthesizer"))
	var current: Dictionary = _dictionary(after.get("synthesizer"))
	if old.is_empty() or current.is_empty(): return false
	return not bool(old.get("faulted",false)) and bool(current.get("faulted",false)) or not bool(old.get("complete",false)) and bool(current.get("complete",false)) or old.get("buffer",[]) != current.get("buffer",[])
