extends SceneTree
## Disposable native progress + in-memory Firebase contract responses only.
const ProgressService := preload("res://scripts/services/progress_store.gd")
const SyncService := preload("res://scripts/services/account_sync.gd")

class MockCloud extends Node:
	signal account_changed(account: Dictionary)
	signal profiles_updated(rows: Array)
	signal profile_merged(details: Dictionary)
	signal release_response
	var uid := "fixture-account"
	var account: Dictionary = {"uid":"fixture-account","authGeneration":1,"signedIn":true,"isAnonymous":false}
	var available := false
	var responses: Dictionary = {}
	var calls: Array = []
	var gate := ""
	var pending := false
	func request(method: String, args: Array = []) -> Dictionary:
		calls.append({"method":method,"args":args.duplicate(true)})
		var value: Variant = responses.get(method)
		if method == "saveProgressNow" and value == null:
			value = args[0].duplicate(true)
			value.uid = uid
			value.profileId = args[1]
		if method == "listProfiles" and value is Array: profiles_updated.emit(value)
		if method == gate:
			pending = true
			await release_response
			pending = false
		return {"ok":true,"value":value}
	func count_method(method: String) -> int:
		var count := 0
		for item in calls:
			if item.method == method: count += 1
		return count
	func last_call(method: String) -> Dictionary:
		for i in range(calls.size()-1,-1,-1):
			if calls[i].method == method: return calls[i]
		return {}

var failures: Array[String] = []
var cloud: MockCloud
var progress: Node
var sync: Node
var pending_result: Dictionary = {}
var pending_save: Dictionary = {}
var base_path := "user://test_account_sync_"+str(OS.get_process_id())

func _initialize() -> void:
	call_deferred("_run")

func check(condition: bool, message: String) -> void:
	if not condition:
		failures.append(message)
		push_error(message)

func _capture_list() -> void:
	pending_result = await sync.refresh_profiles()

func _capture_save() -> void:
	pending_save = await sync.sync_now(false)

func _run() -> void:
	cloud = MockCloud.new()
	progress = ProgressService.new()
	progress.set("_path",base_path+"_profiles.json")
	progress.set("_backup_path",base_path+"_backup.json")
	progress.set("_escrow_path",base_path+"_escrow.json")
	root.add_child(cloud)
	root.add_child(progress)
	progress.profiles = {"Local":progress.normalize({"profileId":"local-stable","playerName":"Local","cur":2,"stars":{"0":3},"rpSchema":3,"researchLevels":{"0":200},"researchPoints":200,"economySchema":1,"coins":180,"maxCoins":200,"researchAchievements":{"__coinEarned":200,"__coinSpent":20,"__futureReserved":81},"localFuture":{"preserve":true}})}
	progress.current_name = "Local"
	progress.save = progress.profiles.Local
	sync = SyncService.new()
	sync.state_path = base_path+"_sync.json"
	root.add_child(sync)
	sync.configure(cloud,progress,root.get_node("Catalog"))
	await process_frame
	check(cloud.calls.is_empty(),"Unavailable native cloud issued account requests")
	cloud.available = true
	var remote := {"profileId":"local-stable","uid":"fixture-account","playerName":"Server Name","cur":8,"stars":{"0":3,"7":2},"rpSchema":3,"researchLevels":{"0":250,"7":175},"researchPoints":425,"economySchema":1,"researchAchievements":{"__coinEarned":300,"__coinSpent":60},"remoteFuture":{"preserve":true}}
	cloud.responses.listProfiles = [remote,{"profileId":"remote-second","uid":"fixture-account","playerName":"Local","cur":5,"unknownRemote":17}]
	cloud.responses.loadProfile = remote
	var restored: Dictionary = await sync.refresh_profiles()
	check(restored.get("ok",false),"Account profile listing/restore failed")
	check(progress.current_name == "Local" and progress.save.profileId == "local-stable" and progress.save.playerName == "Local","Cloud restore changed active local player identity/name")
	check(progress.save.cur == 8 and progress.save.researchPoints == 425,"Cloud progress was listed but never merged into native progress")
	check(progress.save.coins == 240 and progress.save.researchAchievements.__futureReserved == 81,"Cloud merge resurrected spent coins or lost reserved economy state")
	check(progress.save.localFuture.preserve and progress.save.remoteFuture.preserve,"Cloud merge discarded unknown profile fields")
	check(progress.profiles.size() == 2 and not progress.find_profile_id("remote-second").is_empty(),"Remote player import was omitted or name collision replaced a local profile")
	check(cloud.count_method("loadProfile") >= 1 and cloud.count_method("saveProgressNow") >= 1,"Restore did not load and checkpoint the exact active profile")
	check(sync.status == "saved","Profile read was confused with a confirmed save")
	var wrong_patch := {"profileId":"local-stable","accountUid":"other-account","authGeneration":1,"data":{"cur":799,"profileId":"local-stable"}}
	cloud.profile_merged.emit(wrong_patch)
	check(progress.save.cur == 8,"Wrong-account merged event altered local progress")
	# A valid SDK merge event applies only to its tracked write, and a newer
	# local change remains queued after the earlier snapshot is acknowledged.
	cloud.gate = "saveProgressNow"
	_capture_save()
	await process_frame
	cloud.profile_merged.emit({"profileId":"local-stable","accountUid":"fixture-account","authGeneration":1,"data":{"profileId":"local-stable","uid":"fixture-account","cur":9,"serverFuture":31}})
	check(progress.save.cur == 9 and progress.save.serverFuture == 31,"Tracked account merge event was not applied")
	progress.save.newerLocal = 22
	progress.persist()
	cloud.release_response.emit()
	await process_frame
	check(pending_save.get("ok",false) and bool(sync.get("_dirty")) and progress.save.newerLocal == 22,"Earlier save acknowledgement dropped a newer local checkpoint")
	cloud.gate = ""
	await sync.sync_now(false)
	check(not bool(sync.get("_dirty")),"Newest checkpoint never cleared after its own confirmed save")

	# A verified campaign result submits the real server attempt token and moves.
	cloud.responses.startLevelAttempt = {"attemptId":"fixture-server-attempt"}
	cloud.responses.submitLevelResult = {"ok":true,"data":{"verified":true}}
	await sync.begin_attempt(0,"campaign")
	var submitted: Dictionary = await sync.finish_attempt({"mode":"campaign","level":0,"stars":3,"moves":2,"seconds":8.0,"assisted":false,"hints":0},[{"i":0,"d":1,"privateCoordinate":99},{"i":1,"d":2}])
	check(submitted.get("ok",false),"Unassisted completion did not submit server verification")
	var proof: Dictionary = cloud.last_call("submitLevelResult").args[0]
	check(proof.attemptId == "fixture-server-attempt" and proof.profileId == "local-stable" and proof.moveLog == [{"i":0,"d":1},{"i":1,"d":2}],"Verified score used an invented token or incorrect movement proof")
	var proof_count := cloud.count_method("submitLevelResult")
	await sync.finish_attempt({"mode":"campaign","level":0,"stars":3,"assisted":true},[])
	check(cloud.count_method("submitLevelResult") == proof_count,"Assisted solve entered verified rankings")
	# Daily currency and competition RP require an actual successful claim.
	var day := Time.get_date_string_from_system(true)
	var daily := {"mode":"daily","level":0,"dayId":day,"stars":3,"moves":3,"seconds":10.0,"par":3,"minimum":3,"hints":0,"assisted":false}
	var before: int = progress.save.coins
	cloud.responses.claimDailyExperiment = {"offline":true}
	await sync.claim_daily(daily)
	check(progress.save.coins == before and progress.save.dailyScores.is_empty(),"Offline daily claim fabricated currency or competition RP")
	var previous_day := ProgressService.day_id(Time.get_unix_time_from_system()-86400)
	sync.set("_state",{"daily_pending":{"uid":cloud.uid,"profileId":"local-stable","result":{"mode":"daily","dayId":previous_day}}})
	var prior_calls := cloud.count_method("claimDailyExperiment")
	sync._recover_daily()
	check(cloud.count_method("claimDailyExperiment") == prior_calls,"Pending daily recovery consumed today's account reward for yesterday's run")
	cloud.responses.claimDailyExperiment = {"reward":40,"day":day}
	var reward_target := {"practice":true,"coins":0,"rp":0}
	var claimed: Dictionary = await sync.claim_daily(daily,reward_target)
	check(not reward_target.get("practice",true) and reward_target.coins == 40,"Verified claim did not update the retained result-presentation reward dictionary")
	check(claimed.get("ok",false) and progress.save.coins == before+40 and progress.save.dailyScores.get(day) == 125,"Verified daily claim did not credit exact reward/RP")
	await sync.claim_daily(daily)
	check(progress.save.coins == before+40,"Daily claim response replayed currency")
	cloud.responses.claimDailyLogin = {"ok":true,"day":day,"reward":25,"streak":1}
	var login: Dictionary = await sync.claim_login()
	check(login.get("ok",false) and login.get("coins") == 25,"Verified daily login claim was not applied")
	var login_calls := cloud.count_method("claimDailyLogin")
	await sync.claim_login()
	check(cloud.count_method("claimDailyLogin") == login_calls,"Repeated daily login re-called the account reward endpoint")
	# Locally deleting a cloud player cannot be undone by a stale remote list.
	var remote_name: String = progress.find_profile_id("remote-second")
	await sync.delete_profile(remote_name)
	sync.import_remote_profiles([{ "profileId":"remote-second","uid":"fixture-account","playerName":"Local","cur":5 }])
	check(progress.find_profile_id("remote-second").is_empty(),"Stale cloud list resurrected a locally deleted player")
	# A delayed list cannot alter a newly selected player or a new auth account.
	progress.create_profile("Different")
	cloud.responses.listProfiles = [{"profileId":"stale-new","uid":"fixture-account","playerName":"Stale","cur":700}]
	cloud.gate = "listProfiles"
	_capture_list()
	await process_frame
	check(cloud.pending,"Profile-context race fixture did not suspend the read")
	progress.select_profile("Local")
	cloud.release_response.emit()
	await process_frame
	check(not pending_result.get("ok",true) and progress.find_profile_id("stale-new").is_empty(),"Delayed profile list crossed selected-player epoch")
	_capture_list()
	await process_frame
	cloud.available = false
	cloud.uid = "other-account"
	cloud.account = {"uid":"other-account","authGeneration":2,"signedIn":true,"isAnonymous":false}
	cloud.account_changed.emit(cloud.account)
	cloud.release_response.emit()
	await process_frame
	check(not pending_result.get("ok",true) and progress.find_profile_id("stale-new").is_empty(),"Delayed cloud list crossed account generation")
	# Profiles bound to an earlier account are retained locally and never uploaded
	# to a different account merely because the account selector changed.
	cloud.gate = ""
	cloud.available = true
	var saves_before := cloud.count_method("saveProgressNow")
	var mismatch: Dictionary = await sync.sync_now()
	check(not mismatch.get("ok",true) and cloud.count_method("saveProgressNow") == saves_before,"Local profile silently uploaded into a different account")
	var other_player := progress.profiles.get("Different",{}) as Dictionary
	var deletes_before := cloud.count_method("deleteCloudProfile")
	if not other_player.is_empty():
		other_player.uid = "fixture-account"
		var old_id := str(other_player.get("profileId",""))
		await sync.delete_profile("Different")
		check(cloud.count_method("deleteCloudProfile") == deletes_before and sync._suppressed("fixture-account",old_id),"Deleting a prior-account local player used the newly connected account or lost its owner-scoped tombstone")
	cloud.available = false
	var login_before := cloud.count_method("claimDailyLogin")
	await sync.claim_login()
	check(cloud.count_method("claimDailyLogin") == login_before,"Unavailable native SDK issued a login reward request")
	cloud.uid = "fixture-account"
	cloud.account = {"uid":"fixture-account","authGeneration":3,"signedIn":true,"isAnonymous":false}
	cloud.available = true
	cloud.gate = "loadProfile"
	sync.request_timeout_scale = 0.001
	var timeout_result: Dictionary = await sync.restore_active(false)
	check(not timeout_result.get("ok",true) and str(timeout_result.get("reason","")).contains("timeout") and sync.status == "offline","Stalled profile read was never bounded or incorrectly reported healthy sync")
	var cur_before: int = progress.save.cur
	cloud.release_response.emit()
	await process_frame
	check(progress.save.cur == cur_before,"Timed-out profile read later mutated native progress")
	cloud.available = false
	for suffix in ["_profiles.json","_profiles.json.tmp","_backup.json","_escrow.json","_sync.json","_sync.json.tmp"]:
		var path: String = base_path+str(suffix)
		if FileAccess.file_exists(path):DirAccess.remove_absolute(path)
	if failures.is_empty(): print("ACCOUNT_SYNC_CONFORMANCE_OK: import/merge/identity, ledger, secure proof, verified rewards, deletion, profile/account guards")
	else: print("ACCOUNT_SYNC_CONFORMANCE_FAILED: ",failures.size())
	sync.free()
	progress.free()
	cloud.free()
	quit(0 if failures.is_empty() else 1)
