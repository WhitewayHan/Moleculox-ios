extends SceneTree
## Offline native schema, journal, merge, escrow and economy regressions.
const ProgressScript = preload("res://scripts/services/progress_store.gd")
const EconomyScript = preload("res://scripts/services/economy.gd")
var failures: Array[String] = []
var progress: Node
var temp_path := "user://test_services_"+str(OS.get_process_id())

func _initialize() -> void:
	call_deferred("_run")

func check(condition: bool, message: String) -> void:
	if not condition: failures.append(message)

func _run() -> void:
	progress = ProgressScript.new()
	progress.name = "TestProgress"
	progress.set("_path",temp_path+".json")
	progress.set("_backup_path",temp_path+"_backup.json")
	progress.set("_escrow_path",temp_path+"_escrow.json")
	root.add_child(progress)
	var economy := EconomyScript.new()
	economy.progress_override = progress
	economy.auxiliary_directory = "/tmp"
	root.add_child(economy)
	progress.economy_override = economy
	var legacy: Dictionary = progress.normalize({"uid":"existing-account","profileId":"preserved-id","cur":4,"stars":[3,2,null,1],"coins":75,"maxCoins":90,"unknownFutureField":{"value":19},"volS":0.35,"muS":true,"researchAchievements":{"__reserved":999}})
	check(legacy.profileId == "preserved-id" and legacy.uid == "existing-account","Profile/account identity changed")
	check(legacy.unknownFutureField.value == 19,"Unknown profile field lost")
	check(legacy.stars.get("0") == 3 and not legacy.stars.has("2"),"Legacy array maps did not migrate")
	check(legacy.rpSchema == 3 and legacy.saveSchema == 5 and legacy.economySchema == 1,"Save schemas incorrect")
	check(legacy.researchLevels.get("0") == 175 and legacy.researchPoints == 450,"Legacy RP migration incorrect or reserved keys included")
	check(legacy.coins == 90 and legacy.researchAchievements.__coinEarned == 90,"Legacy coin migration incorrect")
	check(is_equal_approx(float(legacy.volV),0.35) and legacy.muV,"Audio schema migration incorrect")
	progress.profiles = {"Test":progress.normalize({"playerName":"Test","profileId":"test-profile","coins":500,"maxCoins":500})}
	progress.current_name = "Test"
	progress.save = progress.profiles.Test
	check(progress.persist(),"Atomic journal write failed")
	progress.save.unknownFutureField = {"retained":true}
	progress.persist()
	check(FileAccess.file_exists(temp_path+"_backup.json"),"Backup journal missing")
	check(progress.begin_hint_escrow(200),"Full hint escrow failed")
	check(progress.save.coins == 300,"Escrow did not charge once")
	progress.set("_escrow_active",{}) # Simulated process interruption.
	progress.load_store()
	check(progress.save.coins == 500,"Interrupted full hint did not refund")
	progress.load_store()
	check(progress.save.coins == 500,"Interrupted full hint refunded twice")
	check(progress.save.unknownFutureField.retained,"Journal roundtrip lost extension field")
	check(progress.begin_hint_escrow(200),"Second escrow failed")
	check(progress.commit_hint_escrow(),"Escrow commit failed")
	progress.load_store()
	check(progress.save.coins == 300,"Completed full hint was refunded")
	check(progress.begin_hint_escrow(100),"Cancelable escrow failed")
	check(progress.refund_hint_escrow() == 100 and progress.save.coins == 300,"Explicit full hint refund incorrect")
	var left: Dictionary = progress.normalize({"profileId":"same","uid":"account","coins":500,"maxCoins":500,"economySchema":1,"rpSchema":3,"researchPoints":200,"researchLevels":{"0":200},"researchAchievements":{"__coinEarned":500,"__coinSpent":200,"__custom":42},"speedRuns":{"0":20},"localOnly":{"flag":true}})
	var right: Dictionary = progress.normalize({"profileId":"other","coins":500,"maxCoins":500,"economySchema":1,"rpSchema":3,"researchPoints":300,"researchLevels":{"0":250,"1":50},"researchAchievements":{"__coinEarned":500,"__coinSpent":350},"speedRuns":{"0":12},"remoteOnly":{"flag":true}})
	var merged: Dictionary = progress.merge_progress(left,right)
	check(merged.profileId == "same" and merged.uid == "account","Merge changed active identity")
	check(merged.coins == 150 and merged.researchAchievements.__custom == 42,"Merge resurrected spent coins or dropped reserved key")
	check(merged.researchPoints == 300 and merged.speedRuns["0"] == 12,"Merge research/record reconciliation incorrect")
	check(merged.localOnly.flag and merged.remoteOnly.flag,"Merge lost unknown extension field")
	check(progress.week_id(1735689600) == "2025-W01" and progress.week_id(1609459200) == "2020-W53","ISO week boundaries incorrect")
	var daily: Dictionary = progress.complete_daily("2026-11-25",3,4,15,5,4,0,false,{"offline":true})
	check(daily.practice and daily.coins == 0 and daily.rp == 0,"Offline daily fabricated verified reward")
	var before_coins: int = progress.save.coins
	var before_rp: int = progress.save.researchPoints
	var zero: Dictionary = progress.complete_level(0,0,10,20)
	check(zero.coins == 0 and zero.rp == 0 and progress.save.cur == 1,"Zero-star clear did not preserve progress-only semantics")
	check(progress.save.coins == before_coins and progress.save.researchPoints == before_rp,"Zero-star clear awarded coins or RP")
	var clear: Dictionary = progress.complete_level(0,3,3,10)
	check(clear.coins == 30 and clear.rp == 250,"Perfect improvement reward differs from production score")
	check(progress.save.bestMoves.get("0") == 3 and progress.save.speedRuns.get("0") == 10,"Unassisted records did not save")
	var replay: Dictionary = progress.complete_level(0,3,3,10)
	check(replay.coins == 0 and replay.rp == 0,"Equal replay farmed rewards")
	progress.complete_level(0,3,2,5,true,1)
	check(progress.save.bestMoves.get("0") == 3 and progress.save.speedRuns.get("0") == 10,"Assisted clear replaced unassisted records")
	var invalid_claim: Dictionary = progress.apply_daily_login_claim({"offline":true,"reward":1000})
	check(not invalid_claim.ok and invalid_claim.coins == 0,"Offline daily login fabricated reward")
	var login: Dictionary = progress.apply_daily_login_claim({"ok":true,"day":"2026-11-25","reward":25,"streak":1})
	check(login.coins == 25 and progress.apply_daily_login_claim({"ok":true,"day":"2026-11-25","reward":25}).coins == 0,"Verified login receipt replayed")
	var claim: Dictionary = progress.complete_daily("2026-11-25",3,3,10,3,3,0,false,{"reward":40,"day":"2026-11-25"})
	check(claim.rp == 125 and claim.coins == 40,"Verified daily reward differs from production")
	check(progress.complete_daily("2026-11-25",3,3,10,3,3,0,false,{"reward":40,"day":"2026-11-25"}).coins == 0,"Daily receipt replayed")
	check(progress.import_store_json(JSON.stringify({"profiles":{"Imported":{"profileId":"remote-new"}}})),"Valid profile import failed")

	# Profile creation enforces the five-player production limit.
	for index in range(3): check(progress.create_profile("Profile "+str(index)),"Profile creation failed before limit")
	check(not progress.create_profile("Sixth"),"Five-profile limit bypassed")
	for path in [temp_path+".json",temp_path+".json.tmp",temp_path+"_backup.json",temp_path+"_escrow.json"]:
		if FileAccess.file_exists(path): DirAccess.remove_absolute(path)
	if failures.is_empty():
		print("PASS services: migration, identity, reserved ledger, merge, atomic backup, escrow recovery, periods, offline rewards, profile limit")
	else:
		for failure in failures: push_error(failure)
	economy.queue_free()
	progress.queue_free()
	quit(0 if failures.is_empty() else 1)
