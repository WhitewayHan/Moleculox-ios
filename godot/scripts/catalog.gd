extends Node
## Immutable exported source content. Runtime never evaluates the old HTML game.
signal loaded
var data: Dictionary = {}
var levels: Array = []
var daily_levels: Array = []
var snapshots: Array = []
var snapshot_records: Array = []
var mode_data: Dictionary = {}
var tutorials: Array = []
var sprites: Dictionary = {}
var molecules: Dictionary = {}
var localization: Dictionary = {}
var story: Variant = {}
var epilogues: Dictionary = {}
var science: Variant = {}
var economy: Dictionary = {}
var audio: Dictionary = {}
var elements: Dictionary = {}
var language: String = "en"
var font: Font
var bold_font: Font
var missing_assets: Dictionary = {}
var _textures: Dictionary = {}

func _ready() -> void:
	load_content()

func load_json(name: String, fallback: Variant = {}) -> Variant:
	var path := "res://data/" + name
	if not path.ends_with(".json"):
		path += ".json"
	if not FileAccess.file_exists(path):
		return fallback
	var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(path))
	return fallback if parsed == null else parsed

func load_content() -> void:
	snapshots.clear()
	snapshot_records.clear()
	data = load_json("catalog", {})
	var raw_levels: Variant = load_json("levels", {})
	if raw_levels is Array:
		levels = raw_levels
	elif raw_levels is Dictionary:
		levels = raw_levels.get("campaign", raw_levels.get("levels", []))
		daily_levels = raw_levels.get("daily", raw_levels.get("dailyLevels", []))
		tutorials = raw_levels.get("tutorials", [])
	molecules = load_json("molecules", {})
	localization = load_json("localization", {})
	story = load_json("story", {})
	epilogues = load_json("epilogues", {})
	science = load_json("science", {})
	economy = load_json("economy", {})
	audio = data.get("audio", {})
	elements = data.get("elements", data.get("EL", {}))
	data["tutorials"] = tutorials
	mode_data = load_json("modes", {})
	sprites = load_json("sprites", {})
	var parity: Variant = load_json("parity", {})
	if parity is Array:
		for record in parity:
			snapshot_records.append(record)
			snapshots.append(record.get("initial", record.get("snapshot", record)))
	elif parity is Dictionary:
		var records: Variant = parity.get("levels", parity.get("campaign", parity.get("snapshots", [])))
		for record in records:
			snapshot_records.append(record)
			snapshots.append(record.get("initial", record.get("snapshot", record)))
	_setup_fonts()
	loaded.emit()

func _setup_fonts() -> void:
	font = load("res://assets/fonts/DejaVuSans.ttf") as Font
	bold_font = load("res://assets/fonts/DejaVuSans-Bold.ttf") as Font
	var fallbacks: Array[Font] = []
	for path in ["res://assets/fonts/NotoSansCJK-Regular.ttc", "res://assets/fonts/NotoColorEmoji.ttf"]:
		var fallback: Font = load(path) as Font
		if fallback != null:
			fallbacks.append(fallback)
	if font != null:
		font.fallbacks = fallbacks
	if bold_font != null:
		bold_font.fallbacks = fallbacks

func get_molecule(key: String, lang: String = "") -> Dictionary:
	var code := language if lang.is_empty() else lang
	var by_lang: Dictionary = molecules.get("byLang", molecules.get("languages", molecules))
	var collection: Dictionary = by_lang.get(code, by_lang.get("en", by_lang))
	var result: Variant = collection.get(key, {})
	if result is Dictionary:
		return result
	return {}

func text(key: String, params: Array = []) -> String:
	if key == "copyLine":
		return "© 2026 Orhan Akyol · wHiTeWaY studio · Godot Web"
	if key == "trackLabel" and not params.is_empty():
		var index := int(params[0]) - 1
		var names: Array = audio.get("trackNames", [])
		return str(names[index]) if index >= 0 and index < names.size() else "Track %d" % (index + 1)
	var by_lang: Dictionary = localization.get("byLang", localization.get("I18N", localization))
	var entries: Dictionary = by_lang.get(language, by_lang.get("en", {}))
	var value: Variant = entries.get(key, by_lang.get("en", {}).get(key, key))
	var text := str(value)
	for i in range(params.size()):
		text = text.replace("{" + str(i) + "}", str(params[i]))
	return text

func get_snapshot(index: int) -> Dictionary:
	if index >= 0 and index < snapshots.size():
		return snapshots[index].duplicate(true)
	return {}

func get_snapshot_record(index: int, mode: String = "campaign") -> Dictionary:
	var records: Array = snapshot_records if mode == "campaign" else mode_data.get("modes", {}).get(mode, [])
	if index >= 0 and index < records.size() and records[index] is Dictionary:
		return records[index].duplicate(true)
	return {}

func story_pages(index: int, lang: String = "") -> Array:
	var code := language if lang.is_empty() else lang
	var pages: Variant = story
	if pages is Dictionary:
		pages = pages.get("byLang", pages.get("languages", pages))
		if pages is Dictionary:
			pages = pages.get(code, pages.get("en", pages))
		if pages is Dictionary:
			pages = pages.get(str(index), pages.get(str(index + 1), []))
	if pages is Array:
		if pages.size() > index and pages[index] is Array:
			return pages[index]
		if pages.size() > index and pages[index] is Dictionary:
			return pages[index].get("pages", [])
	return []

func asset(path: String) -> Texture2D:
	if path.is_empty():
		return null
	var normalized := path.trim_prefix("./")
	if not normalized.begins_with("res://"):
		normalized = "res://" + normalized.trim_prefix("/")
	if _textures.has(normalized):
		var cached: Variant = _textures[normalized]
		var retained: Variant = cached.get_ref() if cached is WeakRef else cached
		if retained is Texture2D:
			return retained
	# Keep the shipped WebP/PNG bytes in web packs. Godot's default lossless
	# re-encoding made 45 MB of artwork become 291 MB of imported textures.
	# Decoding the original image preserves its pixels and avoids that inflation.
	var extension := normalized.get_extension().to_lower()
	if extension in ["png", "webp", "jpg", "jpeg"] and FileAccess.file_exists(normalized):
		var bytes := FileAccess.get_file_as_bytes(normalized)
		var decoded := Image.new()
		var result := decoded.load_webp_from_buffer(bytes) if extension == "webp" else decoded.load_png_from_buffer(bytes) if extension == "png" else decoded.load_jpg_from_buffer(bytes)
		if result == OK:
			var original := ImageTexture.create_from_image(decoded)
			_textures[normalized] = weakref(original)
			return original
	if not ResourceLoader.exists(normalized):
		missing_assets[normalized] = true
		return null
	var texture := load(normalized) as Texture2D
	_textures[normalized] = weakref(texture) if texture != null else null
	return texture

static func plain_text(value: String) -> String:
	var text := value.replace("<br>", "\n").replace("<br/>", "\n").replace("<br />", "\n")
	var tags := RegEx.new()
	tags.compile("<[^>]+>")
	return tags.sub(text, "", true).replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
