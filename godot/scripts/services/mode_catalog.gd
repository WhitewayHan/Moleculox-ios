class_name MoleculoxModes
extends RefCounted
## Selection and immutable initial states, exported from the shipped JS runtime.
const DAILY_EPOCH_SERIAL: int = 20654 # 2026-07-20 UTC
const ADVANCED_START: int = 501
const ADVANCED_END: int = 800
const RECENT_PATH := "user://moleculox_duel_recent_levels_v1.json"
static var _exported: Dictionary = {}

static func mode_data() -> Dictionary:
	if _exported.is_empty() and FileAccess.file_exists("res://data/modes.json"):
		var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://data/modes.json"))
		if parsed is Dictionary:
			_exported = parsed
	return _exported

static func pool_for(kind: String, count: int = 801) -> Dictionary:
	if kind == "medium":
		return {"kind": kind, "min": 40, "max": mini(99, count - 1)}
	if kind == "hard":
		return {"kind": kind, "min": 120, "max": count - 1}
	return {"kind": "mixed", "min": 40, "max": count - 1}

static func level_options(catalog: Node, index: int, mode: String, game_type: String = "") -> Dictionary:
	if index < 0 or index >= catalog.levels.size():
		return {}
	var kind := game_type if not game_type.is_empty() else mode
	if kind == "duel":
		kind = "classic"
	var record: Dictionary = {}
	if mode in ["campaign", "daily"]:
		record = catalog.get_snapshot_record(index)
	else:
		var entries: Array = mode_data().get("modes", {}).get(kind, [])
		if index >= entries.size() or not entries[index] is Dictionary:
			return {}
		record = entries[index]
	var snapshot: Dictionary = record.get("initial", {}).duplicate(true)
	if snapshot.is_empty():
		return {}
	for key in ["breakableWalls", "background", "targetKey"]:
		if record.has(key):
			snapshot[key] = record[key].duplicate(true) if record[key] is Array or record[key] is Dictionary else record[key]
	snapshot["wallPalette"] = record.get("palette", [])
	return {"level": catalog.levels[index].duplicate(true), "snapshot": snapshot, "modePlan": record.duplicate(true), "gameType": "classic" if mode in ["campaign", "daily"] else kind}

static func eligible_indexes(catalog: Node, mode: String, difficulty: String = "mixed", exclude: Array = [], duel: bool = false) -> Array:
	var pool := pool_for(difficulty, catalog.levels.size())
	var flags: Array = mode_data().get("eligible", [])
	var out: Array = []
	for index in range(int(pool.min), int(pool.max) + 1):
		if exclude.has(index) or exclude.has(float(index)) or index >= flags.size():
			continue
		var eligible: Dictionary = flags[index] if flags[index] is Dictionary else {}
		var allowed := bool(eligible.get(mode, false))
		if not eligible.has(mode):
			allowed = bool(eligible.get("duel", false)) if mode in ["classic", "crystal"] else false
		if allowed:
			out.append(index)
	return out

static func choose_level(catalog: Node, mode: String, difficulty: String = "mixed", exclude: Array = []) -> int:
	var choices := eligible_indexes(catalog, mode, difficulty, exclude)
	if choices.is_empty():
		choices = eligible_indexes(catalog, mode, difficulty)
	return -1 if choices.is_empty() else int(choices[randi() % choices.size()])

static func advanced_daily_eligible(level: Dictionary, index: int) -> bool:
	if index < ADVANCED_START or index > ADVANCED_END or level.get("fs", []).is_empty():
		return false
	if bool(level.get("rotatingChamberLab", false)) and index < 699:
		return false
	if str(level.get("b", "")) in ["enzyme", "bio"] or bool(level.get("rotatingChamberLab", false)):
		return true
	for key in ["ow", "bw", "pt", "rt", "mw", "pd", "linked", "fragile", "fu", "pm", "rp", "rep", "sy", "rc", "pb"]:
		if level.get(key, []) is Array and not level.get(key, []).is_empty():
			return true
	for key in ["repulsorLab", "photonBoostLab", "replicatorLab", "synthesizerLab"]:
		if bool(level.get(key, false)):
			return true
	for atom in level.get("a", []):
		for flag in range(3, mini(8, atom.size())):
			if bool(atom[flag]):
				return true
	return false

static func utc_day_id(unix_time: float = -1.0) -> String:
	var date := Time.get_datetime_dict_from_unix_time(int(Time.get_unix_time_from_system() if unix_time < 0.0 else unix_time))
	return "%04d-%02d-%02d" % [date.year, date.month, date.day]

static func daily_challenge(catalog: Node, unix_time: float = -1.0) -> Dictionary:
	var serial := int(floor((Time.get_unix_time_from_system() if unix_time < 0.0 else unix_time) / 86400.0))
	var offset := serial - DAILY_EPOCH_SERIAL
	var day := utc_day_id(unix_time)
	if catalog.levels.size() >= 801 and posmod(offset, 3) == 2:
		var candidates: Array = []
		for index in range(ADVANCED_START, mini(ADVANCED_END + 1, catalog.levels.size())):
			if advanced_daily_eligible(catalog.levels[index], index):
				candidates.append(index)
		if not candidates.is_empty():
			var pick := posmod(int(floor(float(offset) / 3.0)), candidates.size())
			var index := int(candidates[pick])
			var options := level_options(catalog, index, "campaign")
			options.level["dailyAdvancedMechanics"] = true
			options.level["dailySourceLevel"] = index + 1
			options["dayId"] = day
			return {"index": index, "dayId": day, "themeIndex": index, "poolIndex": index, "variant": "CAMPAIGN-ADVANCED", "sourceLevel": index + 1, "options": options}
	var daily: Array = catalog.daily_levels
	if daily.is_empty():
		var index := absi(serial) % mini(300, catalog.levels.size())
		var options := level_options(catalog, index, "campaign")
		options["dayId"] = day
		return {"index": index, "dayId": day, "themeIndex": index, "poolIndex": index, "variant": "I", "options": options}
	var pool_index := posmod(offset, daily.size())
	var index := pool_index % 300
	var level: Dictionary = daily[pool_index].duplicate(true)
	var snapshot := plain_snapshot(level, str(catalog.get_molecule(str(level.m)).get("key", "")))
	return {"index": index, "dayId": day, "themeIndex": index, "poolIndex": pool_index, "variant": "CERTIFIED", "options": {"level": level, "snapshot": snapshot, "gameType": "classic", "dayId": day}}

static func plain_snapshot(level: Dictionary, target_key: String) -> Dictionary:
	var grid: Array = []
	for row in level.get("g", []):
		var cells: Array = []
		for cell in str(row):
			cells.append(cell == "1")
		grid.append(cells)
	var atoms: Array = []
	for atom in level.get("a", []):
		atoms.append({"x": int(atom[0]), "y": int(atom[1]), "e": str(atom[2]), "frozen": bool(atom[3]) if atom.size() > 3 else false, "fire": bool(atom[4]) if atom.size() > 4 else false, "sticky": bool(atom[5]) if atom.size() > 5 else false, "zombie": bool(atom[6]) if atom.size() > 6 else false, "lightning": bool(atom[7]) if atom.size() > 7 else false, "zombieGen": 0, "photonBoost": false})
	return {"grid": grid, "atoms": atoms, "targetKey": target_key}

static func bonus_mission(catalog: Node, milestone: int) -> Dictionary:
	if milestone < 10 or milestone > 150 or milestone % 10 != 0:
		return {}
	var mode: String = ["crystal", "chain", "reactor"][posmod(int(milestone / 10) - 1, 3)]
	var target := 40 + int(round(float(milestone - 10) / 140.0 * 110.0))
	var choices := eligible_indexes(catalog, mode)
	for radius in range(111):
		if choices.has(target + radius):
			return {"milestone": milestone, "mode": mode, "level": target + radius}
		if target - radius >= 40 and choices.has(target - radius):
			return {"milestone": milestone, "mode": mode, "level": target - radius}
	return {"milestone": milestone, "mode": mode, "level": 40}

static func recent_levels() -> Array:
	if FileAccess.file_exists(RECENT_PATH):
		var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(RECENT_PATH))
		if parsed is Array:
			var result: Array = []
			for value in parsed:
				if value is int or value is float:
					result.append(int(value))
			return result.slice(maxi(0, result.size() - 18))
	return []

static func remember_levels(levels: Array) -> void:
	var recent := recent_levels()
	for value in levels:
		var index := int(value)
		recent.erase(index)
		recent.append(index)
	var file := FileAccess.open(RECENT_PATH, FileAccess.WRITE)
	if file != null:
		file.store_string(JSON.stringify(recent.slice(maxi(0, recent.size() - 18))))
