class_name MoleculoxProgress
extends Node
## Original Moleculox profile schema. Unknown fields and identity keys are retained.
signal changed
signal save_failed(message: String)
signal profile_changed(name: String)

const PROFILE_KEY := "moleculox_profiles_v1"
const BACKUP_KEY := "moleculox_profiles_v1_backup"
const SAVE_KEY := "moleculox_save_v1"
const MAX_PROFILES := 5
const LANGUAGES := ["en", "tr", "de", "es", "pt", "ja", "fr", "zh", "it", "ko", "ru"]
var profiles: Dictionary = {}
var current_name: String = ""
var save: Dictionary = {}
var _extra: Dictionary = {}
var _loaded := false
var _path := "user://moleculox_profiles_v1.json"
var _backup_path := "user://moleculox_profiles_v1_backup.json"
var _completed_attempts: Dictionary = {}
var _escrow_active: Dictionary = {}
var economy_override: Node
var _escrow_path := "user://moleculox_hint_escrow_v1.json"
const ACHIEVEMENT_RP := {"a_stars10":150,"a_streak7":200,"a_disc15":100,"a_nobel":1000,"a_prof":300,"a_daily":100,"a_hints20":25,"a_allmol":1000,"a_stars25":300,"a_mechanics":350,"a_disc30":250,"a_level50":300,"a_firstlesson":25,"a_toolstudent":50,"a_mechexplorer":75,"a_labstudent":75,"a_trainingmaster":250}
const CAREER_REWARDS := [[325,250],[350,300],[375,400],[401,500],[415,600],[430,750],[445,900],[461,1200],[480,1600],[501,3000],[525,1800],[550,2000],[575,2200],[601,2500],[625,2800],[650,3200],[675,3600],[701,4200],[725,4800],[750,5500],[775,6500],[801,10000]]
const MAP_FIELDS := ["stars","disc","achv","speedRuns","bestMoves","favoriteMolecules","scienceLegends","scienceLegendRevealed","storySeen","researchLevels","researchAchievements","researchBonuses","bonusClaims","dailyScores","duelRatedMatches","duelRewards","duelRewardClaims"]

func _ready() -> void:
	load_store()

func defaults() -> Dictionary:
	var catalog := get_node_or_null("/root/Catalog")
	if catalog != null:
		var economy_data: Dictionary = catalog.get("economy")
		var exported: Variant = economy_data.get("defaultSave", economy_data.get("defaults", {}))
		if exported is Dictionary and not exported.is_empty():
			return exported.duplicate(true)
	# A complete exported schema is preferred; these defaults allow safe first boot
	# before content loading and never replace fields from an existing profile.
	return {"saveSchema":5,"audioSettingsSchema":1,"cur":0,"stars":{},"coins":0,"maxCoins":0,"disc":{},"volM":1.0,"volMu":0.8,"volS":1.0,"volV":1.0,"muM":false,"muMu":false,"muS":false,"muV":false,"externalMusic":false,"dpad":false,"reduceMotion":false,"duelMessages":true,"duelEffects":true,"haptics":true,"effectLevel":"normal","largeText":false,"colorBlind":false,"highContrast":false,"performanceMode":"auto","frameRate":"60","favoriteMolecules":{},"collectionFilter":"all","scienceLegends":{},"scienceLegendRevealed":{},"scienceLegendSchema":0,"storySeen":{},"storySchema":0,"dailyDate":"","totalHints":0,"streak3":0,"lang":"en","achv":{},"playerName":"","profileId":"","speedRuns":{},"bestMoves":{},"tutorialDone":false,"menuVoiceSeen":false,"autoGuest":false,"rpSchema":3,"researchPoints":0,"researchLevels":{},"researchAchievements":{},"researchBonuses":{},"bonusClaims":{},"dailyScores":{},"dailyRPStreak":0,"lastDailyRPDate":"","seasonId":"","seasonRP":0,"weekId":"","weekRP":0,"campaignContentSchema":3,"labTheme":"basic","economySchema":1,"quantumHintDay":"","duelRatedMatches":{},"duelRewards":{},"duelRewardClaims":{},"activeDuelFrame":"frame_bronze","activeDuelTitle":"","duelRating":800,"duelPeakRating":800,"duelWins":0,"duelLosses":0,"duelDraws":0,"duelStreak":0,"duelBestStreak":0,"duelWeekPoints":0,"duelWeekWins":0,"duelMonthPoints":0,"duelMonthWins":0,"tutorialTips":true}

func normalize(profile: Dictionary) -> Dictionary:
	var result := defaults()
	result.merge(profile.duplicate(true), true)
	for field in MAP_FIELDS:
		result[field] = _progress_map(result.get(field))
	# Absence of a legacy schema is meaningful; exported fresh defaults must not
	# suppress one-time migrations on an older imported save.
	if int(profile.get("audioSettingsSchema",0)) < 1:
		result.volV = profile.get("volS",1.0)
		result.muV = bool(profile.get("muS",false))
	result.audioSettingsSchema = 1
	result.saveSchema = 5
	result.cur = clampi(int(result.get("cur", 0)), 0, level_count())
	if not str(result.get("lang", "en")) in LANGUAGES:
		result.lang = "en"
	if str(result.get("profileId", "")).is_empty():
		result.profileId = _new_id()
	var content_schema := int(profile.get("campaignContentSchema",0))
	var catalog := get_node_or_null("/root/Catalog")
	if content_schema < 1 and catalog != null:
		for index in range(73, mini(90,catalog.levels.size())):
			if int(result.cur) > index or int(result.stars.get(str(index),0)) > 0:
				result.disc[str(catalog.levels[index].get("m",""))] = 1
	if content_schema < 2:
		for key in ["seenLightning","seenClassicCatalystTutorialV2","seenClassicChainTutorialV2","seenClassicReactorTutorialV2","seenBarrierSupport"]:
			result[key] = false
	if content_schema < 3:
		for key in ["seenOneWay","seenBreakableWall","seenHammerWall","seenPortal","seenMovingWall","seenPressureDoor","seenFragile","seenFragileAtom","seenLinked","seenLinkedAtoms","seenClassicCatalystTutorialV2","seenClassicChainTutorialV2","seenClassicReactorTutorialV2"]:
			result[key] = false
	result.campaignContentSchema = maxi(3,content_schema)
	var schema := int(profile.get("rpSchema",0))
	if schema < 1:
		for key in result.stars:
			var st := clampi(int(result.stars[key]),0,3)
			if st > 0:
				result.researchLevels[key] = maxi(int(result.researchLevels.get(key,0)),100+st*25)
		for key in result.achv:
			if bool(result.achv[key]) and ACHIEVEMENT_RP.has(key):
				result.researchAchievements[key] = maxi(int(result.researchAchievements.get(key,0)),int(ACHIEVEMENT_RP[key]))
	if schema < 2:
		result.seasonId = month_id()
		result.weekId = week_id()
		result.seasonRP = 0
		result.weekRP = 0
	result.rpSchema = maxi(3,schema)
	# Production repairs only verified complete pre-Nobel campaigns.
	if int(result.cur) > 301:
		var completed_base := true
		for index in range(301):
			completed_base = completed_base and int(result.stars.get(str(index),0)) > 0
		if completed_base:
			for index in range(301,int(result.cur)):
				result.stars[str(index)] = maxi(1,int(result.stars.get(str(index),0)))
	result.researchPoints = maxi(maxi(0,int(result.get("researchPoints",0))),canonical_research(result))
	result.dailyRPStreak = maxi(0,int(result.get("dailyRPStreak",0)))
	result.dailyLoginStreak = clampi(int(result.get("dailyLoginStreak",0)),0,7)
	result.dailyLoginDate = str(result.get("dailyLoginDate","")).substr(0,10)
	result.quantumHintDay = str(result.get("quantumHintDay","")).substr(0,10)
	result.labTheme = str(result.get("labTheme","basic"))
	if result.labTheme not in ["basic","collider","arctic","mars"]:
		result.labTheme = "basic"
	var stamp := int(result.researchAchievements.get("__labThemeStamp",0))
	if stamp > 0:
		var themes := ["basic","collider","arctic","mars"]
		result.labTheme = themes[stamp % 10] if stamp % 10 < themes.size() else "basic"
	var today_epoch := maxi(0,int((Time.get_unix_time_from_system()-1577836800.0)/86400.0))
	if int(result.researchAchievements.get("__quantumDay",0)) == today_epoch:
		result.quantumHintDay = day_id()
	# Both tools are pay per confirmed use. No legacy free inventory survives.
	result.researchAchievements.erase("__booster_barrier")
	result.researchAchievements.erase("__booster_precision")
	ensure_ledger(result)
	sync_periods(result)
	ensure_duel_state(result)
	return result

func _progress_map(value: Variant) -> Dictionary:
	if value is Dictionary:
		return value.duplicate(true)
	var result: Dictionary = {}
	if value is Array:
		for index in range(value.size()):
			if value[index] != null:
				result[str(index)] = value[index]
	return result

func _economy() -> Node:
	return economy_override if economy_override != null else get_node_or_null("/root/Economy")

func level_count() -> int:
	var catalog := get_node_or_null("/root/Catalog")
	return catalog.levels.size() if catalog != null and not catalog.levels.is_empty() else 801

func load_store() -> bool:
	var source: Dictionary = {}
	if OS.has_feature("web"):
		for key in [PROFILE_KEY, BACKUP_KEY, "moleculox_qa_profiles_r131"]:
			var raw: Variant = JavaScriptBridge.eval("(function(){try{return localStorage.getItem(%s)||'';}catch(e){return '';}})()" % JSON.stringify(key))
			source = _parse_store(str(raw) if raw != null else "")
			if not source.is_empty():
				break
	if source.is_empty():
		for path in [_path, _backup_path]:
			if FileAccess.file_exists(path):
				source = _parse_store(FileAccess.get_file_as_string(path))
				if not source.is_empty():
					break
	if source.is_empty() and OS.has_feature("web"):
		for key in [SAVE_KEY, "moleculox_qa_save_r131"]:
			var raw: Variant = JavaScriptBridge.eval("(function(){try{return localStorage.getItem(%s)||'';}catch(e){return '';}})()" % JSON.stringify(key))
			var legacy_text := str(raw) if raw != null else ""
			var legacy: Variant = JSON.parse_string(legacy_text) if not legacy_text.is_empty() else null
			if legacy is Dictionary and not legacy.is_empty():
				var name := str(legacy.get("playerName", "Player 1"))
				source = {"profiles":{name:legacy},"last":name}
				break
	profiles = {}
	_extra = source.duplicate(true)
	var stored: Dictionary = source.get("profiles", {})
	for name in stored:
		if stored[name] is Dictionary:
			profiles[str(name)] = normalize(stored[name])
	if profiles.is_empty():
		var name := "Player 1"
		profiles[name] = normalize({"playerName":name,"autoGuest":true})
	current_name = str(source.get("last", ""))
	if not profiles.has(current_name):
		current_name = str(profiles.keys()[0])
	save = profiles[current_name]
	_loaded = true
	_recover_escrows()
	_apply_settings()
	persist()
	return true

func _parse_store(text: String) -> Dictionary:
	if text.strip_edges().is_empty():
		return {}
	if text.is_empty():
		return {}
	var parsed: Variant = JSON.parse_string(text)
	if parsed is Dictionary and parsed.get("profiles") is Dictionary:
		return parsed
	if parsed is Dictionary and not parsed.is_empty():
		# Original early saves used the profile map itself as the root.
		for value in parsed.values():
			if not value is Dictionary:
				return {}
		return {"profiles":parsed,"last":""}
	return {}

func select_profile(name: String) -> bool:
	if not profiles.has(name):
		return false
	if not _escrow_active.is_empty():
		refund_hint_escrow()
	if not current_name.is_empty() and not save.is_empty():
		profiles[current_name] = save
	current_name = name
	save = normalize(profiles[name])
	profiles[name] = save
	_apply_settings()
	persist()
	profile_changed.emit(name)
	return true

func create_profile(raw_name: String) -> bool:
	var requested := raw_name.strip_edges().replace("<", "").replace(">", "").substr(0, 18)
	if requested.is_empty() or profiles.size() >= MAX_PROFILES:
		return false
	var name := requested
	var suffix := 2
	while profiles.has(name):
		name = requested.substr(0, 14) + " " + str(suffix)
		suffix += 1
	profiles[name] = normalize({"playerName":name,"profileId":_new_id(),"tutorialDone":false})
	return select_profile(name)

func rename_profile(raw_name: String) -> bool:
	var name := raw_name.strip_edges().replace("<", "").replace(">", "").substr(0, 18)
	if name.is_empty() or (name != current_name and profiles.has(name)):
		return false
	profiles.erase(current_name)
	current_name = name
	save.playerName = name
	profiles[name] = save
	return persist()

func delete_profile(name: String) -> bool:
	if not profiles.has(name):
		return false
	profiles.erase(name)
	if profiles.is_empty():
		current_name = ""
		save = {}
		return create_profile("Player 1")
	if current_name == name:
		return select_profile(str(profiles.keys()[0]))
	return persist()

func persist() -> bool:
	if current_name.is_empty() or save.is_empty():
		return false
	save.saveSchema = 5
	ensure_ledger(save)
	profiles[current_name] = save
	var store := _extra.duplicate(true)
	store.merge({"profiles":profiles,"last":current_name,"storageSchema":1,"savedAt":int(Time.get_unix_time_from_system()*1000)}, true)
	var text := JSON.stringify(store)
	var ok := _write_atomic(text)
	if OS.has_feature("web"):
		var js := "(function(){try{const text=%s;const old=localStorage.getItem(%s);if(old){try{if(JSON.parse(old).profiles)localStorage.setItem(%s,old);}catch(e){}}localStorage.setItem(%s,text);localStorage.setItem(%s,%s);return true;}catch(e){return false;}})()" % [JSON.stringify(text), JSON.stringify(PROFILE_KEY),JSON.stringify(BACKUP_KEY),JSON.stringify(PROFILE_KEY),JSON.stringify(SAVE_KEY),JSON.stringify(JSON.stringify(save))]
		# Emscripten's in-memory user:// can accept a write even when the host
		# blocks IndexedDB. Only count durable browser storage as a saved game.
		ok = bool(JavaScriptBridge.eval(js)) or (ok and OS.is_userfs_persistent())
	if not ok:
		save_failed.emit("Progress could not be saved. Check available storage.")
	changed.emit()
	return ok

func _write_atomic(text: String) -> bool:
	var temporary := _path + ".tmp"
	var file := FileAccess.open(temporary, FileAccess.WRITE)
	if file == null:
		return false
	file.store_string(text)
	file.flush()
	file.close()
	if _parse_store(FileAccess.get_file_as_string(temporary)).is_empty():
		return false
	if FileAccess.file_exists(_path) and not _parse_store(FileAccess.get_file_as_string(_path)).is_empty():
		if DirAccess.copy_absolute(_path, _backup_path) != OK:
			return false
	return DirAccess.rename_absolute(temporary, _path) == OK

func export_store_json() -> String:
	var store := _extra.duplicate(true)
	profiles[current_name] = save
	store.merge({"profiles":profiles,"last":current_name,"storageSchema":1}, true)
	return JSON.stringify(store, "\t")

func import_store_json(text: String) -> bool:
	# Merge by stable profileId. An import never silently destroys other profiles.
	var incoming := _parse_store(text)
	if incoming.is_empty():
		return false
	var additional := 0
	for record in incoming.profiles.values():
		if record is Dictionary and find_profile_id(str(record.get("profileId",""))).is_empty(): additional += 1
	if profiles.size()+additional > MAX_PROFILES:
		save_failed.emit("Import would exceed the five-player limit. Existing progress was retained.")
		return false
	for key in incoming:
		if key not in ["profiles","last"] and not _extra.has(key): _extra[key] = incoming[key]
	for name in incoming.profiles:
		if not incoming.profiles[name] is Dictionary:
			continue
		var record: Dictionary = normalize(incoming.profiles[name])
		var existing_name := find_profile_id(str(record.profileId))
		if not existing_name.is_empty():
			profiles[existing_name] = merge_progress(profiles[existing_name], record)
		else:
			var candidate := str(name)
			while profiles.has(candidate):
				candidate += " 2"
			profiles[candidate] = record
	save = profiles[current_name]
	return persist()

func find_profile_id(id: String) -> String:
	for name in profiles:
		if str(profiles[name].get("profileId", "")) == id:
			return str(name)
	return ""

func merge_progress(local: Dictionary, remote: Dictionary) -> Dictionary:
	# Keep unknown extension fields around the canonical production merge.
	var result := remote.duplicate(true)
	result.merge(local.duplicate(true),true)
	if OS.has_feature("web"):
		var script := "(function(){if(!window.MXSyncCore)return '';return JSON.stringify(MXSyncCore.mergeProfiles(%s,%s,{settings:'left',identity:'left',includeBonus:true,now:new Date()}));})()" % [JSON.stringify(local),JSON.stringify(remote)]
		var raw: Variant = JavaScriptBridge.eval(script)
		if raw != null and not str(raw).is_empty():
			var decoded: Variant = JSON.parse_string(str(raw))
			if decoded is Dictionary:
				result.merge(decoded,true)
				return normalize(result)
	var left := normalize(local)
	var right := normalize(remote)
	var truth_maps := ["disc","achv","bonusClaims","duelRewards","favoriteMolecules","storySeen","scienceLegends","scienceLegendRevealed"]
	var max_maps := ["stars","researchLevels","researchAchievements","researchBonuses","dailyScores","duelRatedMatches","duelRewardClaims"]
	for field in truth_maps + max_maps:
		var merged: Dictionary = {}
		for source: Dictionary in [left[field],right[field]]:
			for key in source:
				if field in truth_maps:
					if bool(source[key]):
						merged[key] = 1
				else:
					var value := maxi(0,int(source[key]))
					if field == "stars": value = mini(3,value)
					if value > 0: merged[key] = maxi(int(merged.get(key,0)),value)
		result[field] = merged
	for field in ["bestMoves","speedRuns"]:
		var merged: Dictionary = {}
		for source: Dictionary in [left[field],right[field]]:
			for key in source:
				var value := float(source[key])
				if value > 0 and (not merged.has(key) or value < float(merged[key])):
					merged[key] = value
		result[field] = merged
	for field in ["cur","maxCoins","totalHints","streak3","duelPeakRating","duelBestStreak","accountMilestoneInviteLastLevel","storySchema","campaignContentSchema","scienceLegendSchema"]:
		result[field] = maxi(int(left.get(field,0)),int(right.get(field,0)))
	for key in result.stars:
		if int(result.stars[key]) > 0:
			result.cur = maxi(int(result.cur),int(key)+1)
	for key in right:
		if str(key).begins_with("seen") or key in ["tutorialDone","nobelCertificateShared","accountMilestoneInviteSeen"]:
			result[key] = bool(left.get(key,false)) or bool(right[key])
	for field in ["dailyDate","dailyLoginDate","lastDailyRPDate"]:
		result[field] = str(left.get(field,"")) if str(left.get(field,"")) > str(right.get(field,"")) else str(right.get(field,""))
	for pair in [["dailyLoginDate","dailyLoginStreak"],["lastDailyRPDate","dailyRPStreak"]]:
		var ld := str(left.get(pair[0],""))
		var rd := str(right.get(pair[0],""))
		result[pair[1]] = left.get(pair[1],0) if ld > rd else right.get(pair[1],0)
		if ld == rd: result[pair[1]] = maxi(int(left.get(pair[1],0)),int(right.get(pair[1],0)))
	var canonical := canonical_research(result)
	var claimed := maxi(int(left.researchPoints),int(right.researchPoints))
	result.researchPoints = mini(5000000,maxi(canonical,mini(claimed,canonical+500)))
	var month := month_id()
	var week := week_id()
	var month_total := 0
	var week_total := 0
	for day in result.dailyScores:
		if str(day).substr(0,7) == month: month_total += int(result.dailyScores[day])
		if week_id(_day_unix(str(day))) == week: week_total += int(result.dailyScores[day])
	result.seasonId = month
	result.weekId = week
	result.seasonRP = mini(1000000,maxi(month_total,maxi(int(left.seasonRP) if left.seasonId == month else 0,int(right.seasonRP) if right.seasonId == month else 0)))
	result.weekRP = mini(500000,maxi(week_total,maxi(int(left.weekRP) if left.weekId == week else 0,int(right.weekRP) if right.weekId == week else 0)))
	return normalize(result)

func setting(key: String, value: Variant) -> bool:
	if not defaults().has(key) and key not in ["effects","dailyLoginDate","dailyLoginStreak"]:
		return false
	if key == "lang" and not str(value) in LANGUAGES:
		return false
	if key in ["volM","volMu","volS","volV"]:
		value = clampf(float(value),0.0,1.0)
	save[key] = value
	if key == "lang" and OS.has_feature("web"):
		JavaScriptBridge.eval("try{localStorage.setItem('mx_language_pref_v1',%s);}catch(e){}" % JSON.stringify(str(value)))
	_apply_settings()
	return persist()

func _apply_settings() -> void:
	# The original preference is device-wide and takes precedence over a
	# profile's older language field when switching players.
	if OS.has_feature("web"):
		var language: Variant = JavaScriptBridge.eval("(function(){try{return localStorage.getItem('mx_language_pref_v1')||'';}catch(e){return '';}})()")
		if language != null and str(language) in LANGUAGES: save.lang = str(language)
	var catalog := get_node_or_null("/root/Catalog")
	if catalog != null:
		catalog.set("language",str(save.get("lang","en")))
	if OS.has_feature("web"):
		JavaScriptBridge.eval("try{localStorage.setItem('mx_language_pref_v1',%s);}catch(e){}" % JSON.stringify(str(save.get("lang","en"))))

func complete_level(index: int, stars: int, moves: int, seconds: float, assisted: bool = false, hints: int = 0) -> Dictionary:
	if index < 0 or index >= level_count():
		return {"ok":false,"reason":"invalid-level"}
	stars = clampi(stars,0,3)
	var key := str(index)
	var previous := int(save.stars.get(key,0))
	var catalog := get_node_or_null("/root/Catalog")
	var level: Dictionary = {}
	if catalog != null and index < catalog.levels.size(): level = catalog.levels[index]
	var molecule := str(level.get("m",""))
	var discovery: bool = not molecule.is_empty() and not save.disc.has(molecule)
	var gained := maxi(0,stars-previous)*10 if stars > 0 else 0
	var economy := _economy()
	if discovery:
		save.disc[molecule] = 1
		if stars > 0:
			gained += 5 + (5 if economy != null and economy.lab_owned("gold_scope") else 0)
	save.stars[key] = maxi(previous,stars)
	var old_cur := int(save.cur)
	save.cur = maxi(old_cur,mini(index+1,level_count()))
	save.streak3 = int(save.streak3)+1 if stars == 3 else 0
	var rp := 0
	if stars > 0:
		var score: int = 100+stars*25
		if economy != null:
			score = economy.campaign_score(stars,moves,int(level.get("p",6)),int(level.get("mn",level.get("p",6))),seconds,hints,assisted)
		rp = maxi(0,score-int(save.researchLevels.get(key,0)))
		save.researchLevels[key] = maxi(score,int(save.researchLevels.get(key,0)))
		award_research(rp,0)
		if not assisted:
			if float(save.speedRuns.get(key,0)) <= 0 or seconds < float(save.speedRuns[key]): save.speedRuns[key] = maxf(0.1,seconds)
			if int(save.bestMoves.get(key,0)) <= 0 or moves < int(save.bestMoves[key]): save.bestMoves[key] = moves
	add_coins(gained)
	var career := {"coins":0,"rp":0,"claimed":[]}
	if stars > 0:
		career = claim_career(old_cur,int(save.cur))
		gained += int(career.coins)
		rp += int(career.rp)
	var legend: Variant = {}
	if economy != null and economy.has_method("discover_legend"):
		legend = economy.discover_legend(index,stars,"campaign")
	var unlocked := check_achievements()
	persist()
	return {"ok":true,"coins":gained,"rp":rp,"stars":stars,"discovery":discovery,"achievements":unlocked,"legend":legend,"career":career}

func complete_daily(day: String, stars: int, moves: int, seconds: float, par: int, minimum: int, hints: int = 0, assisted: bool = false, claim: Dictionary = {}) -> Dictionary:
	# The production service verifies a single account reward. An offline clear
	# remains practice; never manufacture a server receipt or competition score.
	var economy := _economy()
	var legend: Variant = {}
	# Science Legends are completion rewards in the original game, including
	# a three-star daily practice solve. Currency still requires verification.
	if economy != null and economy.has_method("discover_legend"): legend = economy.discover_legend(0,stars,"daily",day)
	if bool(claim.get("offline",false)) or (not bool(claim.get("alreadyClaimed",false)) and int(claim.get("reward",0)) <= 0):
		return {"ok":true,"practice":true,"coins":0,"rp":0,"stars":stars,"legend":legend,"reason":str(claim.get("errorCode","cloud/unavailable"))}
	var claim_day := str(claim.get("day",day))
	var old := int(save.dailyScores.get(day,0))
	if old == 0:
		save.dailyRPStreak = int(save.dailyRPStreak)+1 if str(save.lastDailyRPDate) == day_id(_day_unix(day)-86400) else 1
		save.lastDailyRPDate = day
	var score := 50
	if economy != null: score = economy.daily_score(moves,par,minimum,seconds,hints,int(save.dailyRPStreak),assisted)
	var delta := maxi(0,score-old)
	save.dailyScores[day] = maxi(old,score)
	var days: Array = save.dailyScores.keys()
	days.sort()
	while days.size() > 120: save.dailyScores.erase(days.pop_front())
	award_research(delta,delta)
	var coins := maxi(0,int(claim.get("reward",0)))
	# A repeated receipt is harmless even if a UI submits the response twice.
	var receipt_key := "__daily_reward_"+claim_day
	if bool(save.researchAchievements.get(receipt_key,false)): coins = 0
	if coins > 0:
		if economy != null and economy.lab_owned("robot"): coins += 5
		add_coins(coins)
		save.researchAchievements[receipt_key] = 1
	save.dailyDate = claim_day
	var unlocked := check_achievements()
	persist()
	return {"ok":true,"practice":false,"coins":coins,"rp":delta,"stars":stars,"streak":save.dailyRPStreak,"achievements":unlocked,"legend":legend}

func apply_daily_login_claim(claim: Dictionary) -> Dictionary:
	if not bool(claim.get("ok",false)) or bool(claim.get("offline",false)) or bool(claim.get("accountRequired",false)):
		return {"ok":false,"coins":0,"reason":str(claim.get("errorCode","cloud/unavailable"))}
	var day := str(claim.get("day",day_id()))
	var reward := maxi(0,int(claim.get("reward",0)))
	var marker := "__daily_login_"+day
	if bool(save.researchAchievements.get(marker,false)): reward = 0
	save.dailyLoginDate = day
	save.dailyLoginStreak = clampi(int(claim.get("streak",1)),1,7)
	if reward > 0:
		ensure_ledger(save)
		if claim.has("earned"):
			save.researchAchievements["__coinEarned"] = maxi(int(save.researchAchievements["__coinEarned"]),int(claim.earned))
			save.researchAchievements["__coinSpent"] = maxi(int(save.researchAchievements["__coinSpent"]),int(claim.get("spent",0)))
			ensure_ledger(save)
		else:
			add_coins(reward)
		save.researchAchievements[marker] = 1
	persist()
	return {"ok":true,"coins":reward,"streak":save.dailyLoginStreak,"day":day}

func award_research(delta: int, competitive: int = 0) -> int:
	delta = maxi(0,delta)
	competitive = clampi(competitive,0,delta)
	if day_id() < "2026-07-20": competitive = 0
	sync_periods(save)
	save.researchPoints = maxi(0,int(save.get("researchPoints",0)))+delta
	save.seasonRP = maxi(0,int(save.get("seasonRP",0)))+competitive
	save.weekRP = maxi(0,int(save.get("weekRP",0)))+competitive
	return delta

func claim_career(old_cur: int, new_cur: int) -> Dictionary:
	var result := {"coins":0,"rp":0,"claimed":[]}
	for row: Array in CAREER_REWARDS:
		if old_cur < int(row[0]) and new_cur >= int(row[0]):
			var key := "career_"+str(row[0])
			if int(save.researchAchievements.get(key,0)) > 0: continue
			save.researchAchievements[key] = int(row[1])
			award_research(int(row[1]))
			add_coins(int(row[1]))
			result.coins += int(row[1])
			result.rp += int(row[1])
			result.claimed.append(row[0])
	return result

func claim_bonus(milestone: int) -> Dictionary:
	if milestone < 10 or milestone > 150 or milestone % 10 != 0 or int(save.cur) < milestone:
		return {"ok":false,"reason":"locked"}
	var key := str(milestone)
	if bool(save.bonusClaims.get(key,false)):
		return {"ok":true,"new":false,"coins":0,"rp":0,"medals":save.bonusClaims.size()}
	save.bonusClaims[key] = 1
	var rp := maxi(0,100-int(save.researchBonuses.get(key,0)))
	save.researchBonuses[key] = maxi(100,int(save.researchBonuses.get(key,0)))
	award_research(rp)
	var economy := _economy()
	var coins := 50+(20 if economy != null and economy.lab_owned("collider") else 0)
	add_coins(coins)
	persist()
	return {"ok":true,"new":true,"coins":coins,"rp":rp,"medals":save.bonusClaims.size()}

static func ensure_ledger(profile: Dictionary) -> void:
	if not profile.get("researchAchievements") is Dictionary:
		profile.researchAchievements = {}
	var ledger: Dictionary = profile.researchAchievements
	var earned := maxi(0,int(ledger.get("__coinEarned",0)))
	var spent := maxi(0,int(ledger.get("__coinSpent",0)))
	if int(profile.get("economySchema",0)) == 0 or earned == 0:
		earned = maxi(earned,maxi(int(profile.get("coins",0)),int(profile.get("maxCoins",0))))
		spent = mini(spent,earned)
	spent = mini(spent,earned)
	ledger["__coinEarned"] = earned
	ledger["__coinSpent"] = spent
	profile.economySchema = 1
	profile.coins = maxi(0,earned-spent)
	profile.maxCoins = maxi(int(profile.get("maxCoins",0)),int(profile.coins))

func add_coins(amount: int, _reason: String = "") -> int:
	ensure_ledger(save)
	amount = maxi(0,amount)
	save.researchAchievements["__coinEarned"] = int(save.researchAchievements["__coinEarned"])+amount
	ensure_ledger(save)
	return amount

func spend_coins(amount: int) -> bool:
	ensure_ledger(save)
	if amount <= 0 or int(save.coins) < amount:
		return false
	save.researchAchievements["__coinSpent"] = int(save.researchAchievements["__coinSpent"])+amount
	ensure_ledger(save)
	return true

func check_achievements() -> Array:
	var counts := {"perfect":0,"discoveries":save.disc.size(),"training_basic":0,"training_support":0,"training_mechanic":0,"training_lab":0}
	for value in save.stars.values():
		if int(value) == 3: counts.perfect += 1
	for key in save.researchAchievements:
		for kind in ["basic","support","mechanic","lab"]:
			if str(key).begins_with("__training_learned_"+kind+"_") and bool(save.researchAchievements[key]): counts["training_"+kind] += 1
	var conditions := {"a_stars10":counts.perfect>=10,"a_streak7":int(save.streak3)>=7,"a_disc15":counts.discoveries>=15,"a_nobel":int(save.cur)>=301,"a_prof":int(save.cur)>=100,"a_daily":not str(save.dailyDate).is_empty(),"a_hints20":int(save.totalHints)>=20,"a_stars25":counts.perfect>=25,"a_disc30":counts.discoveries>=30,"a_level50":int(save.cur)>=49,"a_firstlesson":bool(save.tutorialDone) or counts.training_basic>=1,"a_toolstudent":counts.training_support>=3,"a_mechexplorer":counts.training_mechanic>=5,"a_labstudent":counts.training_lab>=3}
	var mechanism := true
	for index in [16,17,18,24,31,32,37,42,43,46,47,48,60,61]: mechanism = mechanism and int(save.stars.get(str(index),0)) == 3
	conditions.a_mechanics = mechanism
	var catalog := get_node_or_null("/root/Catalog")
	if catalog != null:
		var all_molecules: Dictionary = catalog.molecules.get("byLang",catalog.molecules.get("languages",catalog.molecules))
		all_molecules = all_molecules.get("en",all_molecules)
		conditions.a_allmol = not all_molecules.is_empty() and counts.discoveries >= all_molecules.size()
	var complete_training := bool(save.tutorialDone) or bool(save.researchAchievements.get("__training_learned_basic_movement",false))
	for id in ["hint","undo","restart","hammer","precision","barrier","lab"]:
		complete_training = complete_training and bool(save.researchAchievements.get("__training_learned_support_"+id,false))
	for id in ["frozen","fire","lightning","sticky","zombie","oneWay","hammer","portal","rift","movingWall","pressureDoor","fragile","linked","fusion","prebuilt","rotation","precision","enzymeGate","bioAssembly","classicCatalyst","classicChain","classicReactor"]:
		complete_training = complete_training and bool(save.researchAchievements.get("__training_learned_mechanic_"+id,false))
	var items: Array = []
	if catalog != null: items = catalog.economy.get("labItems",catalog.economy.get("LAB_ITEMS",[]))
	complete_training = complete_training and not items.is_empty()
	for item: Dictionary in items: complete_training = complete_training and bool(save.researchAchievements.get("__training_learned_lab_"+str(item.get("id","")),false))
	conditions.a_trainingmaster = complete_training
	var unlocked: Array = []
	for id in conditions:
		if bool(conditions[id]) and not bool(save.achv.get(id,false)):
			save.achv[id] = 1
			if int(save.researchAchievements.get(id,0)) <= 0:
				var points := int(ACHIEVEMENT_RP.get(id,0))
				save.researchAchievements[id] = points
				award_research(points)
			unlocked.append(id)
	return unlocked

func mark_training(group: String, id: String) -> Array:
	save.researchAchievements["__training_learned_"+group+"_"+id] = 1
	if group == "basic" and id == "movement": save.tutorialDone = true
	var unlocked := check_achievements()
	persist()
	return unlocked

static func research_map_sum(map: Dictionary) -> int:
	var total := 0
	for key in map:
		if not str(key).begins_with("__"): total += maxi(0,int(map[key]))
	return total

static func canonical_research(profile: Dictionary) -> int:
	var total := 0
	for field in ["researchLevels","researchAchievements","researchBonuses","dailyScores"]:
		if profile.get(field) is Dictionary: total += research_map_sum(profile[field])
	return total

func recalc_research() -> int:
	var before := canonical_research(save)
	for key in save.stars:
		var st := clampi(int(save.stars[key]),0,3)
		if st > 0: save.researchLevels[key] = maxi(int(save.researchLevels.get(key,0)),100+st*25)
	for key in save.achv:
		if bool(save.achv[key]) and ACHIEVEMENT_RP.has(key): save.researchAchievements[key] = maxi(int(save.researchAchievements.get(key,0)),int(ACHIEVEMENT_RP[key]))
	var raised := maxi(0,canonical_research(save)-before)
	if raised > 0:
		save.researchPoints = mini(5000000,canonical_research(save))
		persist()
	return raised

func refund_coins(amount: int) -> int:
	ensure_ledger(save)
	var refunded := mini(maxi(0,amount),int(save.researchAchievements["__coinSpent"]))
	save.researchAchievements["__coinSpent"] = int(save.researchAchievements["__coinSpent"])-refunded
	ensure_ledger(save)
	return refunded

func set_coins(balance: int) -> void:
	ensure_ledger(save)
	var difference := maxi(0,balance)-int(save.coins)
	if difference >= 0: add_coins(difference)
	else: spend_coins(-difference)

func escrow_key(profile: Dictionary = {}) -> String:
	var record := save if profile.is_empty() else profile
	var raw := str(record.get("profileId",record.get("playerName",current_name)))
	var valid := RegEx.new()
	valid.compile("[^A-Za-z0-9_.-]")
	return "moleculox_hint_escrow_v1_"+valid.sub(raw,"_",true).substr(0,72)

func _read_escrows() -> Dictionary:
	if not FileAccess.file_exists(_escrow_path): return {}
	var result: Variant = JSON.parse_string(FileAccess.get_file_as_string(_escrow_path))
	return result if result is Dictionary else {}

func _write_escrows(records: Dictionary) -> bool:
	var file := FileAccess.open(_escrow_path,FileAccess.WRITE)
	if file == null: return false
	file.store_string(JSON.stringify(records))
	file.flush()
	file.close()
	return true

func begin_hint_escrow(amount: int) -> bool:
	if amount <= 0 or int(save.coins) < amount or not _escrow_active.is_empty(): return false
	var key := escrow_key()
	var records := _read_escrows()
	var record := {"amount":amount,"at":int(Time.get_unix_time_from_system()*1000),"spentBefore":int(save.researchAchievements.get("__coinSpent",0)),"profileId":save.profileId}
	records[key] = record
	if not _write_escrows(records): return false
	if OS.has_feature("web"):
		var stored: Variant = JavaScriptBridge.eval("(function(){try{localStorage.setItem(%s,%s);return true;}catch(e){return false;}})()" % [JSON.stringify(key),JSON.stringify(JSON.stringify(record))])
		if not bool(stored):
			records.erase(key)
			_write_escrows(records)
			return false
	_escrow_active = {"key":key,"amount":amount}
	if not spend_coins(amount):
		commit_hint_escrow()
		return false
	return persist()

func commit_hint_escrow() -> bool:
	var key := str(_escrow_active.get("key",escrow_key()))
	var records := _read_escrows()
	records.erase(key)
	var ok := _write_escrows(records)
	if OS.has_feature("web"):
		JavaScriptBridge.eval("try{localStorage.removeItem(%s);}catch(e){}" % JSON.stringify(key))
	_escrow_active = {}
	return ok

func refund_hint_escrow() -> int:
	var amount := int(_escrow_active.get("amount",0))
	if amount <= 0: return 0
	var refunded := refund_coins(amount)
	persist()
	commit_hint_escrow()
	return refunded

func _recover_escrows() -> void:
	var records := _read_escrows()
	var recovered := false
	for name in profiles:
		var profile: Dictionary = profiles[name]
		var key := escrow_key(profile)
		var record: Dictionary = records.get(key,{})
		if OS.has_feature("web"):
			var raw: Variant = JavaScriptBridge.eval("(function(){try{return localStorage.getItem(%s)||'';}catch(e){return '';}})()" % JSON.stringify(key))
			var escrow_text := str(raw) if raw != null else ""
			var web_record: Variant = JSON.parse_string(escrow_text) if not escrow_text.is_empty() else null
			if web_record is Dictionary: record = web_record
		if not record.is_empty():
			ensure_ledger(profile)
			var spent := int(profile.researchAchievements.get("__coinSpent",0))
			var refund := maxi(0,int(record.get("amount",0)))
			# Our transaction marker knows whether the debit reached persistence.
			if record.has("spentBefore"): refund = mini(refund,maxi(0,spent-int(record.spentBefore)))
			var recovery_marker := "__hintEscrowRecovered_"+str(record.get("at",0))+"_"+str(record.get("amount",0))
			if not bool(profile.researchAchievements.get(recovery_marker,false)):
				profile.researchAchievements["__coinSpent"] = maxi(0,spent-refund)
				profile.researchAchievements[recovery_marker] = 1
			ensure_ledger(profile)
			records.erase(key)
			recovered = true
	if recovered:
		save = profiles[current_name]
		if persist():
			_write_escrows(records)
			if OS.has_feature("web"):
				for name in profiles:
					JavaScriptBridge.eval("try{localStorage.removeItem(%s);}catch(e){}" % JSON.stringify(escrow_key(profiles[name])))

static func day_id(unix: float = -1) -> String:
	return Time.get_datetime_string_from_unix_time(int(Time.get_unix_time_from_system() if unix < 0 else unix)).substr(0,10)

static func month_id(unix: float = -1) -> String:
	return day_id(unix).substr(0,7)

static func _day_unix(day: String) -> int:
	return int(Time.get_unix_time_from_datetime_string(day+"T00:00:00"))

static func week_id(unix: float = -1) -> String:
	var epoch := int(Time.get_unix_time_from_system() if unix < 0 else unix)
	var date := Time.get_datetime_dict_from_unix_time(epoch)
	var start_day := int(Time.get_unix_time_from_datetime_dict({"year":date.year,"month":date.month,"day":date.day,"hour":0,"minute":0,"second":0}))
	var weekday := int(date.weekday)
	if weekday == 0: weekday = 7
	var thursday := start_day+(4-weekday)*86400
	var year := int(Time.get_datetime_dict_from_unix_time(thursday).year)
	var year_start := int(Time.get_unix_time_from_datetime_dict({"year":year,"month":1,"day":1,"hour":0,"minute":0,"second":0}))
	var week := int(ceil(float(thursday-year_start+86400)/604800.0))
	return "%04d-W%02d" % [year,week]

static func sync_periods(profile: Dictionary) -> void:
	var month := month_id()
	var week := week_id()
	if str(profile.get("seasonId","")) != month:
		profile.seasonId = month
		profile.seasonRP = 0
	if str(profile.get("weekId","")) != week:
		profile.weekId = week
		profile.weekRP = 0

static func ensure_duel_state(profile: Dictionary) -> void:
	var rows: Array = profile.duelRatedMatches.values()
	rows.sort()
	var rating := 800
	var peak := 800
	var wins := 0
	var losses := 0
	var draws := 0
	var streak := 0
	var best := 0
	var week_points := 0
	var week_wins := 0
	var month_points := 0
	var month_wins := 0
	for value in rows:
		var outcome := int(value) % 10
		if outcome < 1 or outcome > 3: continue
		var when := int(int(value)/10)*1000
		# Receipt stores epoch seconds * 10 + outcome, then JS converts to ms.
		var epoch := float(when)/1000.0
		if when <= 0: epoch = Time.get_unix_time_from_system()
		var this_week := week_id(epoch) == week_id()
		var this_month := month_id(epoch) == month_id()
		if outcome == 1:
			wins += 1
			streak += 1
			best = maxi(best,streak)
			rating += 25
			if this_week: week_points += 3; week_wins += 1
			if this_month: month_points += 3; month_wins += 1
		elif outcome == 2:
			losses += 1
			streak = 0
			rating = maxi(0,rating-10)
		else:
			draws += 1
			streak = 0
			rating += 3
			if this_week: week_points += 1
			if this_month: month_points += 1
		peak = maxi(peak,rating)
	profile.merge({"duelRating":rating,"duelPeakRating":maxi(peak,int(profile.get("duelPeakRating",800))),"duelWins":wins,"duelLosses":losses,"duelDraws":draws,"duelStreak":streak,"duelBestStreak":maxi(best,int(profile.get("duelBestStreak",0))),"duelWeekPoints":week_points,"duelWeekWins":week_wins,"duelMonthPoints":month_points,"duelMonthWins":month_wins},true)
	var thresholds := {"bronze":0,"silver":900,"gold":1050,"platinum":1200,"diamond":1400,"professor":1650,"nobel":1900}
	for league in thresholds:
		if int(profile.duelPeakRating) >= int(thresholds[league]): profile.duelRewards["league_"+league] = 1
	profile.duelRewards.frame_bronze = 1
	for pair in [["frame_gold",1050],["frame_diamond",1400],["frame_nobel",1900],["title_professor",1650],["title_nobel",1900]]:
		if int(profile.duelPeakRating) >= int(pair[1]): profile.duelRewards[pair[0]] = 1
	if wins >= 1: profile.duelRewards.title_first_win = 1
	if int(profile.duelBestStreak) >= 3: profile.duelRewards.title_streak3 = 1
	if not bool(profile.duelRewards.get(str(profile.get("activeDuelFrame","frame_bronze")),false)): profile.activeDuelFrame = "frame_bronze"
	if not bool(profile.duelRewards.get(str(profile.get("activeDuelTitle","")),false)): profile.activeDuelTitle = ""

func _new_id() -> String:
	return "p_" + String.num_uint64(int(Time.get_unix_time_from_system()*1000),36) + "_" + Crypto.new().generate_random_bytes(6).hex_encode()
