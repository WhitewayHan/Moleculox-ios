class_name MoleculoxUITheme
extends RefCounted

const INK := Color("080c23")
const CYAN := Color("4fd8ff")
const VIOLET := Color("9d7bff")
const AMBER := Color("ffc94d")
const TEXT := Color("f2f5ff")

static func make_theme() -> Theme:
	var result := Theme.new()
	var font := SystemFont.new()
	font.font_names = PackedStringArray(["Arial", "Noto Sans", "DejaVu Sans"])
	font.font_weight = 700
	var loop := Engine.get_main_loop() as SceneTree
	var catalog := loop.root.get_node_or_null("Catalog") if loop != null else null
	if catalog != null and catalog.get("font") is Font:
		result.default_font = catalog.get("font")
	else:
		result.default_font = font
	if catalog != null and catalog.get("bold_font") is Font:
		result.set_font("font", "Button", catalog.get("bold_font"))
	result.default_font_size = 15
	result.set_color("font_color", "Label", TEXT)
	result.set_color("font_color", "Button", TEXT)
	result.set_color("font_hover_color", "Button", Color.WHITE)
	result.set_color("font_disabled_color", "Button", Color("7c7994"))
	result.set_stylebox("normal", "Button", panel(Color("292044"), VIOLET))
	result.set_stylebox("hover", "Button", panel(Color("39305c"), CYAN))
	result.set_stylebox("pressed", "Button", panel(Color("181b39"), CYAN))
	result.set_stylebox("disabled", "Button", panel(Color("13132b"), Color("49405d")))
	result.set_stylebox("focus", "Button", panel(Color(0,0,0,0), CYAN, 3))
	result.set_stylebox("panel", "PanelContainer", panel(Color("101a35"), Color("665084")))
	result.set_stylebox("normal", "LineEdit", panel(Color("0a122b"), VIOLET))
	result.set_stylebox("focus", "LineEdit", panel(Color("0a122b"), CYAN, 2))
	result.set_color("font_color", "LineEdit", TEXT)
	result.set_color("font_placeholder_color", "LineEdit", Color("9a9eb8"))
	result.set_constant("separation", "VBoxContainer", 8)
	result.set_constant("separation", "HBoxContainer", 8)
	result.set_constant("h_separation", "GridContainer", 8)
	result.set_constant("v_separation", "GridContainer", 8)
	return result

static func panel(fill: Color, border: Color = VIOLET, width: int = 1, radius: int = 14) -> StyleBoxFlat:
	var box := StyleBoxFlat.new()
	box.bg_color = fill
	box.border_color = border
	box.set_border_width_all(width)
	box.set_corner_radius_all(radius)
	box.content_margin_left = 12
	box.content_margin_right = 12
	box.content_margin_top = 10
	box.content_margin_bottom = 10
	box.shadow_color = Color(0, 0, 0, .3)
	box.shadow_size = 4
	box.shadow_offset = Vector2(0, 3)
	return box

static func button(text: String, callback: Callable = Callable(), tint: Color = VIOLET) -> Button:
	var result := Button.new()
	result.text = text
	result.custom_minimum_size = Vector2(0, 44)
	result.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	result.add_theme_stylebox_override("normal", panel(tint.darkened(.72), tint))
	result.add_theme_stylebox_override("hover", panel(tint.darkened(.6), tint.lightened(.3), 2))
	result.add_theme_stylebox_override("pressed", panel(tint.darkened(.82), Color.WHITE, 2))
	if callback.is_valid():
		result.pressed.connect(callback)
	return result

static func label(text: String, font_size: int = 15, color: Color = TEXT) -> Label:
	var result := Label.new()
	result.text = text
	result.add_theme_font_size_override("font_size", font_size)
	if font_size >= 17:
		var loop := Engine.get_main_loop() as SceneTree
		var catalog := loop.root.get_node_or_null("Catalog") if loop != null else null
		if catalog != null and catalog.get("bold_font") is Font:
			result.add_theme_font_override("font", catalog.get("bold_font"))
	result.add_theme_color_override("font_color", color)
	result.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	result.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	return result

static func image(path: String, minimum: Vector2 = Vector2.ZERO) -> TextureRect:
	var result := TextureRect.new()
	result.texture = texture(path)
	result.custom_minimum_size = minimum
	result.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	result.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	result.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return result

static func texture(path: String) -> Texture2D:
	if path.is_empty():
		return null
	var loop := Engine.get_main_loop() as SceneTree
	var catalog := loop.root.get_node_or_null("Catalog") if loop != null else null
	if catalog != null and catalog.has_method("asset"):
		return catalog.call("asset", path) as Texture2D
	var source := resource_path(path)
	return load(source) as Texture2D if ResourceLoader.exists(source) else null

static func resource_path(path: String) -> String:
	var clean := path.get_slice("?", 0)
	if clean.begins_with("res://"):
		return clean
	return "res://" + clean.trim_prefix("./").trim_prefix("/")

static func plain(value: Variant) -> String:
	var text := str(value) if value != null else ""
	text = text.replace("<br>", "\n").replace("<br/>", "\n").replace("<br />", "\n")
	var expression := RegEx.new()
	expression.compile("<[^>]*>")
	text = expression.sub(text, "", true)
	return text.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&#39;", "'").replace("&quot;", '"')
