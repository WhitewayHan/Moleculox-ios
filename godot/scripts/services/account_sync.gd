class_name MoleculoxAccountSync
extends Node
const EconomyRules = preload("res://scripts/services/economy.gd")
## Coordinates original Firebase contracts with native progress. Every async
## result belongs to a frozen account generation AND selected player context.
signal changed(status: String)
signal profiles_changed(profiles: Array)
signal sync_completed(details: Dictionary)
signal daily_reward(result: Dictionary, reward: Dictionary)
signal verification_changed(details: Dictionary)
signal error(details: Dictionary)

var status := "offline"
var remote_profiles: Array = []
var state_path := "user://moleculox_account_sync_v1.json"
var request_timeout_scale := 1.0
var _cloud: Node
var _progress: Node
var _catalog: Node
var _epoch := 0
var _profile_epoch := 0
var _list_serial := 0
var _save_serial := 0
var _attempt_serial := 0
var _attempt: Dictionary = {}
var _applying := false
var _saving := false
var _dirty := false
var _local_revision := 0
var _dirty_delay := 0.0
var _state: Dictionary = {}
var _list_event: Array = []
var _write_contexts: Dictionary = {}
var _login_signature := ""
var _login_busy := false

class RequestRace extends RefCounted:
	signal settled
	var done := false
	var value: Variant
	func finish(result: Variant) -> void:
		if done: return
		done = true
		value = result
		settled.emit()

func configure(cloud: Node, progress: Node, catalog: Node = null) -> void:
	_cloud = cloud
	_progress = progress
	_catalog = catalog
	_load_state()
	for spec in [[cloud,"account_changed",_on_account],[cloud,"profiles_updated",_on_profiles],[cloud,"profile_merged",_on_merged],[progress,"profile_changed",_on_profile],[progress,"changed",_on_local_changed]]:
		if spec[0] != null and spec[0].has_signal(spec[1]) and not spec[0].is_connected(spec[1],spec[2]): spec[0].connect(spec[1],spec[2])
	_on_account.call_deferred(_cloud.get("account"))

func _context() -> Dictionary:
	return {"epoch":_epoch,"profileEpoch":_profile_epoch,"uid":str(_cloud.get("uid")),"generation":int(_cloud.get("account").get("authGeneration",0)),"profileId":str(_progress.get("save").get("profileId","")),"name":str(_progress.get("current_name"))}

func _valid(context: Dictionary, require_profile: bool = true) -> bool:
	if _cloud == null or _progress == null or context.is_empty(): return false
	return int(context.epoch) == _epoch and str(context.uid) == str(_cloud.get("uid")) and int(context.generation) == int(_cloud.get("account").get("authGeneration",0)) and (not require_profile or (int(context.profileEpoch) == _profile_epoch and str(context.profileId) == str(_progress.get("save").get("profileId","")) and str(context.name) == str(_progress.get("current_name"))))

func _connected(permanent: bool = false) -> bool:
	if _cloud == null or not bool(_cloud.get("available")) or str(_cloud.get("uid")).is_empty(): return false
	var account: Dictionary = _cloud.get("account")
	return bool(account.get("signedIn",false)) and (not permanent or not bool(account.get("isAnonymous",true)))

func _set_status(value: String) -> void:
	status = value
	changed.emit(status)

func _transport(race: RequestRace, method: String, args: Array) -> void:
	var value: Variant = await _cloud.call("request",method,args)
	race.finish(value)

func _request(method: String, args: Array, context: Dictionary) -> Dictionary:
	if not _connected(): return {"ok":false,"reason":"cloud/unavailable"}
	var race := RequestRace.new()
	_transport(race,method,args)
	if not race.done:
		var timer := get_tree().create_timer(maxf(0.001,15.0*request_timeout_scale))
		timer.timeout.connect(func():race.finish({"ok":false,"error":{"code":"cloud/timeout"}}),CONNECT_ONE_SHOT)
		await race.settled
	if not _valid(context): return {"ok":false,"stale":true,"reason":"cloud/account-context-changed"}
	var envelope: Variant = race.value
	if not envelope is Dictionary: return {"ok":false,"reason":"cloud/invalid-response"}
	if not bool(envelope.get("ok",false)):
		var details: Variant = envelope.get("error",{})
		return {"ok":false,"reason":str(details.get("code","cloud/error")) if details is Dictionary else "cloud/error"}
	var value: Variant = envelope.get("value",envelope)
	if value is Dictionary and (bool(value.get("__mxSaveSkipped",false)) or value.get("ok") == false): return {"ok":false,"reason":str(value.get("reason","cloud/rejected"))}
	return {"ok":true,"value":value}

func _on_account(_account: Dictionary) -> void:
	_epoch += 1
	_list_serial += 1
	_save_serial += 1
	_attempt_serial += 1
	_attempt = {}
	_write_contexts = {}
	_saving = false
	_login_busy = false
	_login_signature = ""
	remote_profiles = []
	_set_status("idle" if _connected() else "offline")
	if _connected(true):
		refresh_profiles()
		claim_login()
	elif _connected(): restore_active(true)

func _on_profile(_name: String) -> void:
	_profile_epoch += 1
	_attempt_serial += 1
	_attempt = {}
	_dirty = false
	_login_signature = ""
	if _connected():
		restore_active(true)
		if _connected(true): claim_login()

func _on_profiles(rows: Array) -> void:
	# The SDK event carries no player epoch. Cache it; apply only the matching
	# request result below, where the captured account/player context is proven.
	_list_event = rows.duplicate(true)

func refresh_profiles() -> Dictionary:
	if not _connected(true): return {"ok":false,"reason":"auth/account-required"}
	_list_serial += 1
	var serial := _list_serial
	var context := _context()
	_set_status("syncing")
	var response := await _request("listProfiles",[],context)
	if not _valid(context) or serial != _list_serial: return {"ok":false,"stale":true}
	if not bool(response.get("ok",false)) or not response.get("value") is Array:
		_set_status("offline")
		return response
	remote_profiles = response.value.duplicate(true)
	var imported := import_remote_profiles(remote_profiles,context)
	profiles_changed.emit(remote_profiles.duplicate(true))
	if not _valid(context): return {"ok":false,"stale":true}
	await restore_active(true)
	_recover_daily()
	return {"ok":true,"imported":imported}

func import_remote_profiles(rows: Array, context: Dictionary = {}) -> int:
	if context.is_empty(): context = _context()
	if not _valid(context): return 0
	var count := 0
	_applying = true
	var profiles: Dictionary = _progress.get("profiles")
	for value in rows:
		if not value is Dictionary: continue
		var remote: Dictionary = value.duplicate(true)
		var id := str(remote.get("profileId",""))
		if id.is_empty() or _suppressed(str(context.uid),id): continue
		if not str(remote.get("uid",context.uid)) in ["",str(context.uid)]: continue
		remote.uid = str(context.uid)
		var name := str(_progress.call("find_profile_id",id))
		if not name.is_empty():
			var local: Dictionary = profiles[name]
			if str(local.get("uid","")) not in ["",str(context.uid)]: continue
			profiles[name] = _progress.call("merge_progress",local,remote)
		else:
			if profiles.size() >= 5: continue
			name = _unique_name(str(remote.get("playerName","Player")),profiles)
			profiles[name] = _progress.call("normalize",remote)
		count += 1
	if profiles.has(str(_progress.get("current_name"))): _progress.set("save",profiles[str(_progress.get("current_name"))])
	_progress.call("persist")
	_applying = false
	return count

func _unique_name(raw: String, profiles: Dictionary) -> String:
	var base := raw.replace("<","").replace(">","").strip_edges().substr(0,18)
	if base.is_empty(): base = "Player"
	var result := base
	var suffix := 2
	while profiles.has(result):
		result = base.substr(0,14)+" "+str(suffix)
		suffix += 1
	return result

func restore_active(upload: bool = true) -> Dictionary:
	if not _connected(): return {"ok":false,"reason":"cloud/unavailable"}
	var context := _context()
	if str(context.profileId).is_empty() or _suppressed(str(context.uid),str(context.profileId)): return {"ok":false,"reason":"cloud/profile-suppressed"}
	if str(_progress.get("save").get("uid","")) not in ["",str(context.uid)]:
		_set_status("account-profile-mismatch")
		return {"ok":false,"reason":"cloud/profile-belongs-to-another-account"}
	_set_status("syncing")
	var response := await _request("loadProfile",[str(context.profileId)],context)
	if not _valid(context): return {"ok":false,"stale":true}
	if not bool(response.get("ok",false)):
		_set_status("offline")
		return response
	if response.get("value") is Dictionary and not response.value.is_empty():
		if not _apply_profile(response.value,context):
			_set_status("account-profile-mismatch")
			return {"ok":false,"reason":"cloud/profile-owner-mismatch"}
	if upload and _connected(): return await sync_now(false)
	_set_status("idle")
	return response

func _apply_profile(remote: Dictionary, context: Dictionary) -> bool:
	if not _valid(context): return false
	var id := str(remote.get("profileId",context.profileId))
	if id != str(context.profileId) or _suppressed(str(context.uid),id) or str(remote.get("uid",context.uid)) not in ["",str(context.uid)]: return false
	var local: Dictionary = _progress.get("save")
	if str(local.get("uid","")) not in ["",str(context.uid)]: return false
	var safe_remote := remote.duplicate(true)
	safe_remote.profileId = id
	safe_remote.uid = str(context.uid)
	_applying = true
	var merged: Dictionary = _progress.call("merge_progress",local,safe_remote)
	merged.profileId = str(local.get("profileId",id))
	merged.playerName = str(local.get("playerName",context.name))
	_progress.set("save",merged)
	_progress.get("profiles")[str(context.name)] = merged
	_progress.call("persist")
	_applying = false
	return true

func sync_now(restore_first: bool = true) -> Dictionary:
	if not _connected(): return {"ok":false,"reason":"auth/account-required"}
	if _saving: return {"ok":false,"reason":"cloud/sync-busy"}
	if restore_first: return await restore_active(true)
	var context := _context()
	var snapshot: Dictionary = _progress.get("save").duplicate(true)
	var revision := _local_revision
	if str(snapshot.get("uid","")) not in ["",str(context.uid)]: return {"ok":false,"reason":"cloud/profile-belongs-to-another-account"}
	if _suppressed(str(context.uid),str(context.profileId)): return {"ok":false,"reason":"cloud/profile-suppressed"}
	_saving = true
	_save_serial += 1
	var serial := _save_serial
	_set_status("syncing")
	_write_contexts[str(context.profileId)] = context
	var response := await _request("saveProgressNow",[snapshot,str(context.profileId)],context)
	if serial == _save_serial: _saving = false
	if not _valid(context): return {"ok":false,"stale":true}
	_write_contexts.erase(str(context.profileId))
	var value: Variant = response.get("value")
	if not bool(response.get("ok",false)) or not value is Dictionary or value.is_empty():
		_set_status("offline")
		return {"ok":false,"reason":response.get("reason","cloud/save-unconfirmed")}
	_apply_profile(value,context)
	if revision == _local_revision:
		_dirty = false
		_state.get("checkpoints",{}).erase(str(context.uid)+"|"+str(context.profileId))
	else:
		_dirty = true
		_dirty_delay = 1.1
	_store_state()
	_set_status("saved" if not _dirty else "syncing")
	sync_completed.emit({"ok":true,"profileId":context.profileId})
	return {"ok":true,"profileId":context.profileId}

func _on_merged(details: Dictionary) -> void:
	var id := str(details.get("profileId",""))
	var context: Dictionary = _write_contexts.get(id,{})
	if context.is_empty() or not _valid(context): return
	if str(details.get("accountUid","")) != str(context.uid) or int(details.get("authGeneration",-1)) != int(context.generation): return
	if details.get("data") is Dictionary: _apply_profile(details.data,context)

func _on_local_changed() -> void:
	if _applying or not _connected(): return
	_local_revision += 1
	_dirty = true
	_dirty_delay = 1.1
	var context := _context()
	if str(_progress.get("save").get("uid","")) not in ["",str(context.uid)]: return
	if not _state.get("checkpoints") is Dictionary: _state.checkpoints = {}
	_state.checkpoints[str(context.uid)+"|"+str(context.profileId)] = {"uid":context.uid,"profileId":context.profileId,"at":Time.get_unix_time_from_system(),"snapshot":_progress.get("save").duplicate(true)}
	_store_state()

func _process(delta: float) -> void:
	if not _dirty or _saving or not _connected(): return
	_dirty_delay -= delta
	if _dirty_delay <= 0:
		_dirty_delay = 5.0
		sync_now()

func delete_profile(name: String) -> Dictionary:
	var profiles: Dictionary = _progress.get("profiles")
	if not profiles.has(name): return {"ok":false,"reason":"profile/not-found"}
	var id := str(profiles[name].get("profileId",""))
	var context := _context()
	var owner := str(profiles[name].get("uid",context.uid))
	if owner.is_empty():owner = str(context.uid)
	if not _state.get("suppressed") is Dictionary: _state.suppressed = {}
	_state.suppressed[owner+"|"+id] = int(Time.get_unix_time_from_system())
	_store_state()
	var removed := bool(_progress.call("delete_profile",name))
	if removed and _connected() and owner == str(context.uid) and not id.is_empty(): _delete_remote(id)
	return {"ok":removed}

func _delete_remote(id: String) -> void:
	await _request("deleteCloudProfile",[id],_context())

func _suppressed(uid: String, id: String) -> bool:
	return _state.get("suppressed",{}).has(uid+"|"+id)

func begin_attempt(index: int, mode: String) -> void:
	_attempt_serial += 1
	_attempt = {}
	if mode != "campaign" or not _connected(): return
	var serial := _attempt_serial
	var context := _context()
	var response := await _request("startLevelAttempt",[context.profileId,index,"campaign"],context)
	if serial != _attempt_serial or not _valid(context): return
	var value: Variant = response.get("value")
	if bool(response.get("ok",false)) and value is Dictionary and not str(value.get("attemptId","")).is_empty():
		_attempt = {"attemptId":str(value.attemptId),"level":index,"context":context,"serial":serial}
	verification_changed.emit({"ready":not _attempt.is_empty(),"verified":false})

func finish_attempt(result: Dictionary, move_log: Array) -> Dictionary:
	if str(result.get("mode","")) != "campaign" or int(result.get("stars",0)) <= 0 or bool(result.get("assisted",false)): return {"ok":false,"reason":"verification/unranked"}
	var attempt := _attempt.duplicate(true)
	_attempt = {}
	if attempt.is_empty() or int(attempt.level) != int(result.get("level",-1)) or not _valid(attempt.context):
		verification_changed.emit({"ready":false,"verified":false,"reason":"verification/unavailable"})
		return {"ok":false,"reason":"verification/unavailable"}
	var proof: Array = []
	for step in move_log:
		if step is Dictionary: proof.append({"i":int(step.get("i",-1)),"d":int(step.get("d",-1))})
	var payload := {"profileId":attempt.context.profileId,"attemptId":attempt.attemptId,"levelId":attempt.level,"moveLog":proof,"playerName":str(_progress.get("save").get("playerName","")),"hints":maxi(0,int(result.get("hints",0)))}
	var response := await _request("submitLevelResult",[payload],attempt.context)
	if not _valid(attempt.context): return {"ok":false,"stale":true}
	var value: Variant = response.get("value")
	var verified := bool(response.get("ok",false)) and value is Dictionary and bool(value.get("ok",false))
	verification_changed.emit({"ready":true,"verified":verified,"reason":"" if verified else response.get("reason","verification/unranked")})
	return {"ok":verified}

func claim_login() -> Dictionary:
	if not _connected(true) or _login_busy: return {"ok":false,"reason":"auth/account-required"}
	var context := _context()
	var day := Time.get_date_string_from_system(true)
	var signature := str(context.uid)+"|"+str(context.profileId)+"|"+day
	if _login_signature == signature: return {"ok":true,"already":true}
	_login_busy = true
	var response := await _request("claimDailyLogin",[context.profileId],context)
	_login_busy = false
	if not _valid(context): return {"ok":false,"stale":true}
	var value: Variant = response.get("value")
	if not bool(response.get("ok",false)) or not value is Dictionary or not bool(value.get("ok",false)): return response
	_login_signature = signature
	_applying = true
	var reward: Dictionary = _progress.call("apply_daily_login_claim",value)
	_applying = false
	if bool(reward.get("ok",false)):
		daily_reward.emit({"mode":"login"},reward)
	return reward

func claim_daily(result: Dictionary, reward_target: Dictionary = {}) -> Dictionary:
	if str(result.get("mode","")) != "daily": return {"ok":false,"reason":"daily/invalid-result"}
	var context := _context()
	var previous: Variant = _state.get("daily_pending")
	var stronger := previous is Dictionary and str(previous.get("uid","")) == str(context.uid) and str(previous.get("profileId","")) == str(context.profileId) and previous.get("result") is Dictionary and str(previous.result.get("dayId","")) == str(result.get("dayId","")) and _daily_score(previous.result) >= _daily_score(result)
	if not stronger:_state.daily_pending = {"uid":context.uid,"profileId":context.profileId,"result":result.duplicate(true)}
	_store_state()
	if not _connected(): return {"ok":false,"reason":"auth/account-required"}
	var response := await _request("claimDailyExperiment",[context.profileId],context)
	if not _valid(context): return {"ok":false,"stale":true}
	var claim: Variant = response.get("value")
	if not bool(response.get("ok",false)) or not claim is Dictionary: return response
	_applying = true
	var reward: Dictionary = _progress.call("complete_daily",str(result.get("dayId",Time.get_date_string_from_system(true))),int(result.get("stars",0)),int(result.get("moves",0)),float(result.get("seconds",0)),int(result.get("par",1)),int(result.get("minimum",1)),int(result.get("hints",0)),bool(result.get("assisted",false)),claim)
	_applying = false
	if bool(reward.get("practice",true)): return {"ok":false,"reason":"daily/unverified"}
	_state.erase("daily_pending")
	_store_state()
	if not reward_target.is_empty():
		reward_target.clear()
		reward_target.merge(reward,true)
	daily_reward.emit(result.duplicate(true),reward)
	_dirty = true
	_dirty_delay = 0.0
	return {"ok":true,"reward":reward}

func _daily_score(result: Dictionary) -> int:
	return EconomyRules.daily_score(int(result.get("moves",0)),int(result.get("par",1)),int(result.get("minimum",1)),float(result.get("seconds",0)),int(result.get("hints",0)),1,bool(result.get("assisted",false)))

func _recover_daily() -> void:
	var pending: Variant = _state.get("daily_pending")
	if not pending is Dictionary or not _connected(): return
	# Yesterday's offline result must never consume today's account claim.
	if pending.get("result") is Dictionary and str(pending.result.get("dayId","")) != Time.get_date_string_from_system(true):
		_state.erase("daily_pending")
		_store_state()
		return
	var context := _context()
	if str(pending.get("uid","")) == str(context.uid) and str(pending.get("profileId","")) == str(context.profileId) and pending.get("result") is Dictionary: claim_daily(pending.result)

func _load_state() -> void:
	if not FileAccess.file_exists(state_path): return
	var value: Variant = JSON.parse_string(FileAccess.get_file_as_string(state_path))
	if value is Dictionary: _state = value

func _store_state() -> void:
	var file := FileAccess.open(state_path+".tmp",FileAccess.WRITE)
	if file == null: return
	file.store_string(JSON.stringify(_state))
	file.flush()
	file.close()
	DirAccess.rename_absolute(state_path+".tmp",state_path)
