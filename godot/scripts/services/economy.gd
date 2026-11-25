class_name MoleculoxEconomy
extends Node
## Native implementation of the production MoleCoin, equipment, support and
## Science Legends contracts. Gameplay validates an action before charging it.
signal changed
signal purchased(id: String)
signal legend_discovered(id: String)
signal transaction_failed(reason: String)

const BARRIER_USE_PRICE := 500
const PRECISION_USE_PRICE := 250
const LEGEND_HINT_KEY := "__legend_exact_hint_tokens"
const LEGEND_PRECISION_KEY := "__legend_precision_tokens"
const LAB_THEME_NAMES := ["basic", "collider", "arctic", "mars"]
const LEGEND_ORDER := ["ibn-sina", "jabir", "al-razi", "lavoisier", "avogadro", "mendeleev", "faraday", "remziye-hisar", "dalton", "robert-boyle", "berzelius", "humphry-davy", "marie-curie", "oktay-sinanoglu", "cahit-arf", "feza-gursey", "gilbert-lewis", "linus-pauling", "dorothy-hodgkin", "rosalind-franklin", "ahmed-zewail", "rutherford", "niels-bohr", "fuat-sezgin", "jang-yeong-sil"]
const LEGEND_CONFIG := {
	"ibn-sina":{"campaignLevel":64,"reward":{"hammer":1,"hint":1,"precision":1}},
	"jabir":{"campaignLevel":128,"reward":{"hammer":1,"hint":1,"precision":1}},
	"al-razi":{"campaignLevel":193,"reward":{"hammer":1,"hint":1}},
	"lavoisier":{"campaignLevel":256,"reward":{"hammer":1,"hint":1,"precision":1}},
	"avogadro":{"campaignLevel":342,"reward":{"hammer":1,"precision":1}},
	"remziye-hisar":{"campaignLevel":430,"reward":{"hammer":1,"hint":1,"precision":1}},
	"mendeleev":{"campaignLevel":540,"reward":{"hammer":1,"hint":1,"precision":1}},
	"faraday":{"campaignLevel":633,"reward":{"hammer":1,"hint":1,"precision":1}},
	"dalton":{"campaignLevel":96,"reward":{"hammer":1,"hint":1,"precision":1}},
	"robert-boyle":{"campaignLevel":176,"reward":{"hammer":1,"precision":1}},
	"berzelius":{"campaignLevel":232,"reward":{"hammer":1,"hint":1}},
	"humphry-davy":{"campaignLevel":304,"reward":{"hammer":1,"precision":1}},
	"marie-curie":{"campaignLevel":396,"reward":{"hammer":1,"hint":1,"precision":1}},
	"oktay-sinanoglu":{"campaignLevel":502,"reward":{"hammer":1,"hint":1,"precision":1}},
	"cahit-arf":{"campaignLevel":602,"reward":{"hammer":1,"hint":1}},
	"feza-gursey":{"campaignLevel":702,"reward":{"hammer":1,"hint":1,"precision":1}},
	"gilbert-lewis":{"campaignLevel":48,"reward":{"hammer":1,"hint":1,"precision":1}},
	"linus-pauling":{"campaignLevel":144,"reward":{"hammer":1,"hint":1,"precision":1}},
	"dorothy-hodgkin":{"campaignLevel":208,"reward":{"hammer":1,"hint":1,"precision":1}},
	"rosalind-franklin":{"campaignLevel":280,"reward":{"hammer":1,"hint":1}},
	"ahmed-zewail":{"campaignLevel":366,"reward":{"hammer":1,"hint":1,"precision":1}},
	"rutherford":{"campaignLevel":470,"reward":{"hammer":1,"precision":1}},
	"niels-bohr":{"campaignLevel":570,"reward":{"hammer":1,"hint":1,"precision":1}},
	"fuat-sezgin":{"campaignLevel":770,"reward":{"hammer":1,"hint":1}},
	"jang-yeong-sil":{"campaignLevel":736,"reward":{"hammer":1,"hint":1,"precision":1}}
}
const FALLBACK_LAB_ITEMS := [
	{"id":"gold_scope","price":250,"unlock":10,"theme":"basic","icon":"🔬","name":{"en":"Gold-Plated Microscope"},"desc":{"en":"Earn +5 extra MoleCoins from new discoveries."}},
	{"id":"holo_table","price":400,"unlock":20,"theme":"basic","icon":"🧬","name":{"en":"Holographic Periodic Table"},"desc":{"en":"Reduces exact-hint coin costs by 20%."}},
	{"id":"quantum_desk","price":650,"unlock":40,"theme":"basic","icon":"💻","name":{"en":"Quantum Research Desk"},"desc":{"en":"One free exact-move hint per UTC day."}},
	{"id":"robot","price":850,"unlock":60,"theme":"basic","icon":"🤖","name":{"en":"Robot Lab Assistant"},"desc":{"en":"Adds 5 MoleCoins to the first Daily Experiment reward."}},
	{"id":"collider","price":1100,"unlock":80,"theme":"collider","icon":"⚛️","name":{"en":"Particle Collider Console"},"desc":{"en":"Adds 20 MoleCoins to first-clear bonus missions."}},
	{"id":"arctic","price":1400,"unlock":100,"theme":"arctic","icon":"❄️","name":{"en":"Polar Research Station"},"desc":{"en":"Unlocks the polar theme and research expedition."}},
	{"id":"mars","price":1800,"unlock":120,"theme":"mars","icon":"🚀","name":{"en":"Mars Sample Capsule"},"desc":{"en":"Unlocks the Mars theme and research expedition."}}
]
const FALLBACK_BOOSTERS := [{"id":"hammer","price":150,"icon":"🔨","name":{"en":"Hammer"},"desc":{"en":"Breaks one cracked wall in compatible levels."}}]
const MISSIONS := [
	{"id":"polar","item":"arctic","target":8,"rewardCoins":200,"rewardRP":150},
	{"id":"collider","item":"collider","target":6,"rewardCoins":250,"rewardRP":200},
	{"id":"mars","item":"mars","target":25,"rewardCoins":300,"rewardRP":250}
]

# Optional dependency injection is used by offline service tests only.
var progress_override: Node
var auxiliary_directory: String = "user://"

func _progress() -> Node:
	return progress_override if progress_override != null else get_node_or_null("/root/Progress")

func _save() -> Dictionary:
	var progress: Node = _progress()
	if progress == null:
		return {}
	var state: Dictionary = progress.get("save")
	for key: String in ["researchAchievements", "achv", "stars", "bonusClaims", "researchBonuses", "scienceLegends", "scienceLegendRevealed", "dailyScores"]:
		if not state.get(key) is Dictionary:
			state[key] = {}
	return state

func _persist() -> bool:
	var progress: Node = _progress()
	if progress == null:
		return false
	var ok: bool = bool(progress.call("persist"))
	changed.emit()
	return ok

func _data() -> Dictionary:
	var catalog: Node = get_node_or_null("/root/Catalog")
	return catalog.get("economy") if catalog != null else {}

func lab_items() -> Array:
	var value: Variant = _data().get("labItems", _data().get("LAB_ITEMS", FALLBACK_LAB_ITEMS))
	return value if value is Array else FALLBACK_LAB_ITEMS

func booster_items() -> Array:
	var value: Variant = _data().get("boosterItems", _data().get("BOOSTER_ITEMS", FALLBACK_BOOSTERS))
	return value if value is Array else FALLBACK_BOOSTERS

func balance() -> int:
	var state: Dictionary = _save()
	if state.is_empty():
		return 0
	_progress().call("ensure_ledger", state)
	return maxi(0, int(state.get("coins", 0)))

func spend(amount: int, _reason: String = "") -> bool:
	if _progress() == null or not bool(_progress().call("spend_coins", amount)):
		return false
	# The caller must apply the validated action after a charge. A storage error
	# is reported by Progress; it must not turn a successful debit into a failed
	# gameplay action that leaves the player charged without the support.
	_persist()
	return true

func add_coins(amount: int, reason: String = "") -> int:
	if _progress() == null:
		return 0
	var added: int = int(_progress().call("add_coins", amount, reason))
	_persist()
	return added

func lab_owned(id: String) -> bool:
	return bool(_save().get("achv", {}).get("lab_" + id, false))

func lab_unlocked(id: String) -> bool:
	for item: Dictionary in lab_items():
		if str(item.get("id", "")) == id:
			return int(_save().get("cur", 0)) >= int(item.get("unlock", 0))
	return false

func purchase(id: String) -> bool:
	for item: Dictionary in booster_items():
		if str(item.get("id", "")) == id:
			return buy_booster(id)
	for item: Dictionary in lab_items():
		if str(item.get("id", "")) != id:
			continue
		if lab_owned(id) or not lab_unlocked(id):
			return false
		if not bool(_progress().call("spend_coins", int(item.get("price", 0)))):
			return false
		var state: Dictionary = _save()
		state.achv["lab_" + id] = 1
		var theme: String = str(item.get("theme", "basic"))
		if theme != "basic":
			_set_synced_theme(theme)
		# Purchase immediately starts the original equipment tutorial.
		state.researchAchievements["__lab_tutorial_" + id] = 1
		state.researchAchievements["__training_learned_lab_" + id] = 1
		_persist()
		purchased.emit(id)
		return true
	return false

func booster_count(id: String) -> int:
	return maxi(0, int(_save().get("researchAchievements", {}).get("__booster_" + id, 0)))

func hammer_count() -> int:
	return booster_count("hammer")

func add_booster(id: String, amount: int = 1, persist_now: bool = true) -> int:
	var state: Dictionary = _save()
	if state.is_empty():
		return 0
	state.researchAchievements["__booster_" + id] = booster_count(id) + maxi(0, amount)
	if persist_now:
		_persist()
	return booster_count(id)

func spend_booster(id: String, amount: int = 1) -> bool:
	amount = maxi(1, amount)
	var have: int = booster_count(id)
	if have < amount:
		return false
	_save().researchAchievements["__booster_" + id] = have - amount
	_persist()
	return true

func buy_booster(id: String, amount: int = 1) -> bool:
	amount = maxi(1, amount)
	for item: Dictionary in booster_items():
		if str(item.get("id", "")) == id:
			if not bool(_progress().call("spend_coins", int(item.get("price", 0)) * amount)):
				return false
			add_booster(id, amount, false)
			_persist()
			purchased.emit(id)
			return true
	return false

func _set_synced_theme(theme: String) -> void:
	var index: int = LAB_THEME_NAMES.find(theme)
	if index < 0:
		index = 0
	var start: int = int(Time.get_unix_time_from_datetime_string("2026-01-01T00:00:00"))
	var minute: int = maxi(0, int((Time.get_unix_time_from_system() - start) / 60.0))
	var state: Dictionary = _save()
	state.researchAchievements["__labThemeStamp"] = mini(9999999, minute * 10 + index)
	state.labTheme = LAB_THEME_NAMES[index]

func current_lab_theme() -> String:
	var state: Dictionary = _save()
	var stamp: int = maxi(0, int(state.get("researchAchievements", {}).get("__labThemeStamp", 0)))
	var theme: String = str(state.get("labTheme", "basic"))
	if stamp > 0:
		var code: int = stamp % 10
		theme = LAB_THEME_NAMES[code] if code < LAB_THEME_NAMES.size() else "basic"
	if not theme in LAB_THEME_NAMES or (theme != "basic" and not lab_owned(theme)):
		return "basic"
	return theme

func equip_theme(theme: String) -> bool:
	if theme not in LAB_THEME_NAMES or (theme != "basic" and not lab_owned(theme)):
		return false
	_set_synced_theme(theme)
	return _persist()

func hint_costs(attempts: int = 0) -> Dictionary:
	var discount: float = 0.8 if lab_owned("holo_table") else 1.0
	var repeat: float = minf(2.0, 1.0 + maxi(0, attempts) * 0.25)
	return {"general":maxi(75, int(floor(75.0 * repeat / 5.0 + 0.5)) * 5), "move":maxi(160, int(floor(200.0 * discount * repeat / 5.0 + 0.5)) * 5), "full":maxi(720, int(floor(900.0 * discount * repeat / 10.0 + 0.5)) * 10)}

func full_solution_hint_unlocked(attempts: int, moves: int, par: int) -> bool:
	return attempts >= 2 or moves >= maxi(1, par) + 2

func legend_exact_hint_tokens() -> int:
	return maxi(0, int(_save().get("researchAchievements", {}).get(LEGEND_HINT_KEY, 0)))

func legend_precision_tokens() -> int:
	return maxi(0, int(_save().get("researchAchievements", {}).get(LEGEND_PRECISION_KEY, 0)))

func consume_legend_exact_hint() -> bool:
	if legend_exact_hint_tokens() < 1:
		return false
	_save().researchAchievements[LEGEND_HINT_KEY] = legend_exact_hint_tokens() - 1
	_persist()
	return true

func consume_legend_precision() -> bool:
	if legend_precision_tokens() < 1:
		return false
	_save().researchAchievements[LEGEND_PRECISION_KEY] = legend_precision_tokens() - 1
	_persist()
	return true

func _utc_day(day_id: String = "") -> String:
	return Time.get_date_string_from_system(true) if day_id.is_empty() else day_id

func _epoch_day(day_id: String = "") -> int:
	var start: int = int(Time.get_unix_time_from_datetime_string("2020-01-01T00:00:00"))
	var current: int = int(Time.get_unix_time_from_datetime_string(_utc_day(day_id) + "T00:00:00"))
	return maxi(0, int((current - start) / 86400.0))

func quantum_hint_available(day_id: String = "") -> bool:
	if legend_exact_hint_tokens() > 0:
		return true
	return lab_owned("quantum_desk") and int(_save().researchAchievements.get("__quantumDay", 0)) != _epoch_day(day_id)

func consume_quantum_hint(day_id: String = "") -> bool:
	if legend_exact_hint_tokens() > 0:
		return consume_legend_exact_hint()
	if not quantum_hint_available(day_id):
		return false
	var state: Dictionary = _save()
	state.researchAchievements["__quantumDay"] = _epoch_day(day_id)
	state.quantumHintDay = _utc_day(day_id)
	_persist()
	return true

func consume_precision() -> bool:
	return consume_legend_precision() if legend_precision_tokens() > 0 else spend(PRECISION_USE_PRICE, "precision")

func consume_barrier() -> bool:
	return spend(BARRIER_USE_PRICE, "barrier")

func _strategic_key() -> String:
	var state: Dictionary = _save()
	var identity: String = str(state.get("profileId", ""))
	if identity.is_empty():
		identity = str(_progress().get("current_name"))
	if identity.strip_edges().is_empty():
		identity = str(state.get("playerName", "guest"))
	var regex: RegEx = RegEx.new()
	regex.compile("[^A-Za-z0-9_.-]")
	identity = regex.sub(identity.strip_edges(), "_", true).substr(0, 72)
	return "moleculox_free_strategic_v1_" + ("guest" if identity.is_empty() else identity)

func _strategic_state() -> Dictionary:
	var key: String = _strategic_key()
	var raw: String = ""
	if OS.has_feature("web"):
		var result: Variant = JavaScriptBridge.eval("(function(){try{return localStorage.getItem(%s)||'';}catch(e){return '';}})()" % JSON.stringify(key))
		raw = str(result) if result != null else ""
	var path: String = auxiliary_directory.path_join(key + ".json")
	if raw.is_empty() and FileAccess.file_exists(path):
		raw = FileAccess.get_file_as_string(path)
	var parsed: Variant = JSON.parse_string(raw) if not raw.is_empty() else {}
	var state: Dictionary = parsed if parsed is Dictionary else {}
	return {"campaign":state.get("campaign", {}) if state.get("campaign", {}) is Dictionary else {}, "crystal":state.get("crystal", {}) if state.get("crystal", {}) is Dictionary else {}, "daily":str(state.get("daily", ""))}

func _write_strategic_state(state: Dictionary) -> bool:
	var key: String = _strategic_key()
	var text: String = JSON.stringify(state)
	var path: String = auxiliary_directory.path_join(key + ".json")
	var file: FileAccess = FileAccess.open(path + ".tmp", FileAccess.WRITE)
	var ok: bool = false
	if file != null:
		file.store_string(text)
		file.flush()
		file.close()
		ok = DirAccess.rename_absolute(path + ".tmp", path) == OK
	if OS.has_feature("web"):
		ok = bool(JavaScriptBridge.eval("(function(){try{localStorage.setItem(%s,%s);return true;}catch(e){return false;}})()" % [JSON.stringify(key), JSON.stringify(text)])) or ok
	return ok

func free_strategic_hint_available(kind: String, id: String) -> bool:
	if kind not in ["campaign", "crystal", "daily"] or id.is_empty():
		return false
	var state: Dictionary = _strategic_state()
	return state.daily != id if kind == "daily" else not bool(state[kind].get(id, false))

func consume_free_strategic_hint(kind: String, id: String) -> bool:
	if not free_strategic_hint_available(kind, id):
		return false
	var state: Dictionary = _strategic_state()
	if kind == "daily":
		state.daily = id
	else:
		state[kind][id] = 1
	return _write_strategic_state(state)

static func move_bonus(moves: int, par: int, minimum: int) -> int:
	moves = maxi(0, moves)
	par = maxi(1, par)
	minimum = clampi(minimum, 1, par)
	if minimum < par and moves <= minimum:
		return 40
	if minimum < par and moves < par:
		return 35
	if moves <= par:
		return 25
	if moves <= int(ceil(par * 1.25)):
		return 15
	return 5 if moves <= int(ceil(par * 1.6)) else 0

static func time_bonus(seconds: float, par: int) -> int:
	seconds = maxf(0.0, seconds)
	var target: float = maxf(12.0, maxi(1, par) * 2.2)
	if seconds <= target:
		return 30
	if seconds <= target * 1.5:
		return 20
	return 10 if seconds <= target * 2.2 else 0

static func campaign_score(stars: int, moves: int, par: int, minimum: int, seconds: float, hints: int, assisted: bool = false) -> int:
	return 100 + clampi(stars, 0, 3) * 25 + move_bonus(moves, par, minimum) + (0 if assisted else time_bonus(seconds, par)) + (20 if hints == 0 else 0)

static func daily_score(moves: int, par: int, minimum: int, seconds: float, hints: int, streak: int, assisted: bool = false) -> int:
	return 50 + move_bonus(moves, par, minimum) + (0 if assisted else time_bonus(seconds, par)) + (20 if hints == 0 else 0) + mini(30, maxi(0, streak - 1) * 5)

func award_daily_research(day_id: String, moves: int, par: int, minimum: int, seconds: float, hints: int, assisted: bool = false) -> Dictionary:
	var state: Dictionary = _save()
	var old: int = maxi(0, int(state.dailyScores.get(day_id, 0)))
	if old == 0:
		var yesterday: String = Time.get_date_string_from_unix_time(int(Time.get_unix_time_from_datetime_string(day_id + "T00:00:00")) - 86400)
		state.dailyRPStreak = maxi(1, int(state.get("dailyRPStreak", 0)) + 1) if str(state.get("lastDailyRPDate", "")) == yesterday else 1
		state.lastDailyRPDate = day_id
	var score: int = daily_score(moves, par, minimum, seconds, hints, int(state.get("dailyRPStreak", 1)), assisted)
	if score <= old:
		return {"delta":0,"score":old,"streak":state.dailyRPStreak}
	state.dailyScores[day_id] = score
	var days: Array = state.dailyScores.keys()
	days.sort()
	while days.size() > 120:
		state.dailyScores.erase(days.pop_front())
	var delta: int = int(_progress().call("award_research", score - old, score - old))
	_persist()
	return {"delta":delta,"score":score,"streak":state.dailyRPStreak}

func bonus_medal_count() -> int:
	var count: int = 0
	for value: Variant in _save().get("bonusClaims", {}).values():
		if bool(value):
			count += 1
	return count

static func bonus_visual_tier(count: int) -> int:
	return mini(5, maxi(0, count) / 3)

func award_bonus_mission(milestone: int) -> Dictionary:
	if milestone < 10 or milestone > 150 or milestone % 10 != 0 or int(_save().get("cur", 0)) < milestone:
		return {"new":false,"reason":"locked"}
	var state: Dictionary = _save()
	var key: String = str(milestone)
	var before: int = bonus_medal_count()
	if bool(state.bonusClaims.get(key, false)):
		return {"new":false,"medals":before,"coins":0,"rp":0,"tier":bonus_visual_tier(before)}
	state.bonusClaims[key] = 1
	var old_rp: int = maxi(0, int(state.researchBonuses.get(key, 0)))
	state.researchBonuses[key] = maxi(100, old_rp)
	var added_rp: int = int(_progress().call("award_research", maxi(0, 100 - old_rp), 0))
	var coins: int = 50 + (20 if lab_owned("collider") else 0)
	_progress().call("add_coins", coins, "bonus")
	_persist()
	return {"new":true,"medals":bonus_medal_count(),"coins":coins,"rp":added_rp,"tier":bonus_visual_tier(bonus_medal_count())}

func lab_mission_progress(id: String) -> int:
	if id == "collider":
		return bonus_medal_count()
	var count: int = 0
	var stars: Dictionary = _save().get("stars", {})
	for key: Variant in stars:
		if id == "polar" and int(key) >= 100 and int(stars[key]) == 3:
			count += 1
		# Production intentionally counts every completed level from index 120.
		elif id == "mars" and int(key) >= 120 and int(stars[key]) > 0:
			count += 1
	return count

func lab_missions() -> Array:
	var result: Array = []
	var metadata: Variant = _data().get("labMissions", _data().get("LAB_MISSIONS", MISSIONS))
	var rows: Array = metadata if metadata is Array else MISSIONS
	for source: Dictionary in rows:
		var row: Dictionary = source.duplicate(true)
		row.progress = lab_mission_progress(str(row.get("id", "")))
		row.unlocked = lab_owned(str(row.get("item", "")))
		row.claimed = bool(_save().achv.get("labmission_" + str(row.id), false))
		row.ready = row.unlocked and not row.claimed and int(row.progress) >= int(row.get("target", 0))
		result.append(row)
	return result

func claim_lab_mission(id: String) -> Dictionary:
	for row: Dictionary in lab_missions():
		if str(row.id) != id or not bool(row.ready):
			continue
		var state: Dictionary = _save()
		var key: String = "labmission_" + id
		state.achv[key] = 1
		var old: int = maxi(0, int(state.researchAchievements.get(key, 0)))
		state.researchAchievements[key] = maxi(old, int(row.rewardRP))
		var rp: int = int(_progress().call("award_research", maxi(0, int(row.rewardRP) - old), 0))
		_progress().call("add_coins", int(row.rewardCoins), "labmission")
		_persist()
		return {"ok":true,"coins":row.rewardCoins,"rp":rp}
	return {"ok":false,"reason":"not-ready"}

func ensure_legend_state() -> void:
	var state: Dictionary = _save()
	if state.is_empty():
		return
	var schema: int = maxi(0, int(state.get("scienceLegendSchema", 0)))
	if schema < 2:
		state.scienceLegends = {}
		state.scienceLegendRevealed = {}
	elif schema < 3:
		state.scienceLegends.erase("dalton")
		state.scienceLegendRevealed.erase("dalton")
	state.scienceLegendSchema = 5
	for id: String in LEGEND_ORDER:
		if int(state.researchAchievements.get("__legend_discovered_" + id, 0)) > 0:
			state.scienceLegends[id] = true

func legend_reward(id: String) -> Dictionary:
	return LEGEND_CONFIG.get(id, {}).get("reward", {}).duplicate(true)

func grant_legend_reward(id: String) -> bool:
	ensure_legend_state()
	if not LEGEND_CONFIG.has(id):
		return false
	var state: Dictionary = _save()
	var key: String = "__legend_rewarded_" + id
	if int(state.researchAchievements.get(key, 0)) > 0:
		return false
	var reward: Dictionary = legend_reward(id)
	add_booster("hammer", int(reward.get("hammer", 0)), false)
	state.researchAchievements[LEGEND_HINT_KEY] = legend_exact_hint_tokens() + int(reward.get("hint", 0))
	state.researchAchievements[LEGEND_PRECISION_KEY] = legend_precision_tokens() + int(reward.get("precision", 0))
	state.researchAchievements[key] = 1
	return true

func _daily_legend(day_id: String) -> String:
	var state: Dictionary = _save()
	if int(state.researchAchievements.get("__legend_daily_claim_" + day_id, 0)) > 0:
		return ""
	var hash_value: int = 2166136261
	for index: int in range(day_id.length()):
		hash_value = ((hash_value ^ day_id.unicode_at(index)) * 16777619) & 0xffffffff
	var start: int = hash_value % LEGEND_ORDER.size()
	for index: int in range(LEGEND_ORDER.size()):
		var id: String = LEGEND_ORDER[(start + index) % LEGEND_ORDER.size()]
		if not bool(state.scienceLegends.get(id, false)):
			return id
	return ""

func discover_legend(index: int, stars: int, mode: String = "campaign", day_id: String = "") -> Dictionary:
	if mode not in ["campaign", "daily"]:
		return {}
	ensure_legend_state()
	var state: Dictionary = _save()
	var id: String = ""
	if mode == "daily":
		if stars < 3:
			return {}
		day_id = _utc_day(day_id)
		id = _daily_legend(day_id)
	else:
		for card_id: String in LEGEND_ORDER:
			if int(LEGEND_CONFIG[card_id].campaignLevel) == index + 1 and not bool(state.scienceLegends.get(card_id, false)):
				id = card_id
				break
	if id.is_empty():
		return {}
	state.scienceLegends[id] = true
	state.researchAchievements["__legend_discovered_" + id] = 1
	if mode == "daily":
		state.researchAchievements["__legend_daily_claim_" + day_id] = 1
	var rewarded: bool = grant_legend_reward(id)
	_persist()
	legend_discovered.emit(id)
	return {"id":id,"rewarded":rewarded,"reward":legend_reward(id)}

func pending_legend_reveals() -> Array:
	ensure_legend_state()
	var state: Dictionary = _save()
	var result: Array = []
	for id: String in LEGEND_ORDER:
		if bool(state.scienceLegends.get(id, false)) and not bool(state.scienceLegendRevealed.get(id, false)):
			result.append(id)
	return result

func mark_legend_revealed(id: String) -> bool:
	ensure_legend_state()
	if not bool(_save().scienceLegends.get(id, false)):
		return false
	_save().scienceLegendRevealed[id] = true
	return _persist()
