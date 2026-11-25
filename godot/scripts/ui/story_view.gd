class_name MoleculoxStoryView
extends Control

signal continued(level_index: int)
signal skipped(level_index: int)
signal page_changed(index: int, page: Dictionary)
signal voice_requested(page: Dictionary)

var pages: Array = []
var page_index := 0
var level_index := -1
var _title: Label
var _counter: Label
var _art: TextureRect
var _cast: HBoxContainer
var _speaker: Label
var _dialogue: RichTextLabel
var _narration: Label
var _caption: Label
var _bang: Label
var _next: Button
var _previous: Button
var _body: VBoxContainer
var _background: TextureRect

func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	theme = MoleculoxUITheme.make_theme()
	mouse_filter = Control.MOUSE_FILTER_STOP
	var shade := ColorRect.new()
	shade.color = Color("080a24")
	shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(shade)
	_background = MoleculoxUITheme.image("assets/images/bg-default.webp")
	_background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_background.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	_background.modulate = Color(.4,.4,.5,1)
	add_child(_background)
	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	for side in ["left", "right", "top", "bottom"]:
		margin.add_theme_constant_override("margin_" + side, 16)
	add_child(margin)
	_body = VBoxContainer.new()
	margin.add_child(_body)
	var head := HBoxContainer.new()
	_body.add_child(head)
	_title = MoleculoxUITheme.label("", 18, MoleculoxUITheme.AMBER)
	head.add_child(_title)
	_counter = MoleculoxUITheme.label("", 12)
	_counter.size_flags_horizontal = 0
	head.add_child(_counter)
	var close := MoleculoxUITheme.button("×", _finish.bind(true))
	close.custom_minimum_size = Vector2(42,42)
	close.size_flags_horizontal = 0
	head.add_child(close)
	var art_panel := PanelContainer.new()
	art_panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_body.add_child(art_panel)
	var art_stage := Control.new()
	art_stage.custom_minimum_size = Vector2(0,250)
	art_panel.add_child(art_stage)
	_art = MoleculoxUITheme.image("")
	_art.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	art_stage.add_child(_art)
	_bang = MoleculoxUITheme.label("", 35, MoleculoxUITheme.AMBER)
	_bang.position = Vector2(12,12)
	art_stage.add_child(_bang)
	_cast = HBoxContainer.new()
	_cast.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	_cast.offset_top = -150
	_cast.alignment = BoxContainer.ALIGNMENT_CENTER
	art_stage.add_child(_cast)
	var text_panel := PanelContainer.new()
	text_panel.add_theme_stylebox_override("panel", MoleculoxUITheme.panel(Color("f3e9c9"), Color("a08b5e"),2,18))
	_body.add_child(text_panel)
	var copy := VBoxContainer.new()
	text_panel.add_child(copy)
	_speaker = MoleculoxUITheme.label("", 12, Color("4d3248"))
	copy.add_child(_speaker)
	_dialogue = RichTextLabel.new()
	_dialogue.bbcode_enabled = false
	_dialogue.fit_content = true
	_dialogue.custom_minimum_size = Vector2(0,65)
	_dialogue.add_theme_color_override("default_color", Color("242542"))
	_dialogue.add_theme_font_size_override("normal_font_size",18)
	copy.add_child(_dialogue)
	_narration = MoleculoxUITheme.label("",13,Color("493e4b"))
	copy.add_child(_narration)
	_caption = MoleculoxUITheme.label("",12,Color("c8c7df"))
	_caption.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_body.add_child(_caption)
	var nav := HBoxContainer.new()
	_body.add_child(nav)
	_previous = MoleculoxUITheme.button("◀", previous)
	_previous.custom_minimum_size.x = 58
	_previous.size_flags_horizontal = 0
	nav.add_child(_previous)
	_next = MoleculoxUITheme.button("CONTINUE", next, Color("55c77d"))
	nav.add_child(_next)
	var skip := MoleculoxUITheme.button(_tr("skipStory", "Skip story"), _finish.bind(true), Color("66547e"))
	_body.add_child(skip)
	visible = false

func show_story(value: Array, index: int = -1) -> void:
	pages = value.duplicate(true)
	level_index = index
	page_index = 0
	visible = true
	if pages.is_empty():
		_finish(false)
	else:
		_render()

func next() -> void:
	if page_index + 1 >= pages.size():
		_finish(false)
	else:
		page_index += 1
		_render()

func previous() -> void:
	if page_index > 0:
		page_index -= 1
		_render()

func _render() -> void:
	if not is_node_ready() or pages.is_empty():
		return
	var page: Dictionary = pages[page_index]
	_title.text = MoleculoxUITheme.plain(page.get("title", "MOLECULOX"))
	_counter.text = "%d / %d" % [page_index+1,pages.size()]
	_bang.text = MoleculoxUITheme.plain(page.get("bang", ""))
	_speaker.text = str(page.get("speakerName", _speaker_name(str(page.get("speaker", "drE")))))
	_dialogue.text = MoleculoxUITheme.plain(page.get("dialogue", page.get("text", "")))
	_narration.text = MoleculoxUITheme.plain(page.get("narration", ""))
	_narration.visible = not _narration.text.is_empty() and _narration.text != _dialogue.text
	_caption.text = MoleculoxUITheme.plain(page.get("caption", ""))
	_previous.disabled = page_index == 0
	_next.text = _tr("play", "PLAY") if page_index == pages.size()-1 else _tr("continue", "CONTINUE")
	var art_path := str(page.get("img", ""))
	_art.texture = _texture(art_path)
	var crop: Variant = page.get("crop",null)
	if crop is Dictionary and _art.texture != null:
		var atlas := AtlasTexture.new()
		atlas.atlas = _art.texture
		var factor_x := float(_art.texture.get_width()) / maxf(1.0,float(crop.get("sourceW",_art.texture.get_width())))
		var factor_y := float(_art.texture.get_height()) / maxf(1.0,float(crop.get("sourceH",_art.texture.get_height())))
		atlas.region = Rect2(float(crop.get("x",0))*factor_x,float(crop.get("y",0))*factor_y,float(crop.get("w",_art.texture.get_width()))*factor_x,float(crop.get("h",_art.texture.get_height()))*factor_y)
		atlas.filter_clip = true
		_art.texture = atlas
	_art.visible = _art.texture != null
	var world_path := str(page.get("worldArt", ""))
	_background.texture = _texture(world_path if not world_path.is_empty() else "assets/images/bg-default.webp")
	for child in _cast.get_children():
		child.queue_free()
	if not _art.visible:
		for person in page.get("cast", [page.get("speaker", "drE")]):
			var picture := MoleculoxUITheme.image(_cast_path(str(person)), Vector2(130,150))
			_cast.add_child(picture)
	_cast.visible = not _art.visible
	page_changed.emit(page_index,page)
	voice_requested.emit(page)

func _finish(was_skipped: bool) -> void:
	visible = false
	if was_skipped:
		skipped.emit(level_index)
	else:
		continued.emit(level_index)

func _unhandled_key_input(event: InputEvent) -> void:
	if not visible or not event.is_pressed():
		return
	if event.is_action_pressed("ui_accept") or event.is_action_pressed("ui_right"):
		next()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_left"):
		previous()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_cancel"):
		_finish(true)
		get_viewport().set_input_as_handled()

func _texture(path: String) -> Texture2D:
	return MoleculoxUITheme.texture(path)

func _tr(key: String, fallback: String) -> String:
	var data := get_node_or_null("/root/Catalog")
	if data != null and data.has_method("text"):
		var translated := str(data.call("text",key))
		if translated != key and not translated.is_empty():
			return translated
	return fallback

func _speaker_name(person: String) -> String:
	return {"drE":"DR. EDWARD ATOM","null":"DR. NULL","drNull":"DR. NULL","moxy":"MOXY","cat":"DR. NULL'S CAT","narrator":_tr("storyNarrator","NARRATOR")}.get(person,person.to_upper())

func _cast_path(person: String) -> String:
	return {"drE":"assets/images/dr-edward-atom.png","null":"assets/images/characters/dr-null-canon-r40.webp","drNull":"assets/images/characters/dr-null-canon-r40.webp","moxy":"assets/images/characters/moxy-canon-r40.webp","cat":"assets/images/characters/null-cat-canon-r40.webp"}.get(person,"assets/images/dr-edward-atom.png")
