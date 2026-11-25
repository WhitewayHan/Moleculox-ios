extends SceneTree
## Offline room-schema conformance. Every network response is an in-memory mock.
## No Firebase/account writes, credentials, or live listeners are involved.
const ProgressService := preload("res://scripts/services/progress_store.gd")

class MockCloud extends Node:
	signal room_updated(code: String, room: Variant)
	signal match_updated(ticket_id: String, ticket: Variant)
	signal account_changed(account: Dictionary)
	signal error(details: Dictionary)
	signal release_response
	var uid := "test-account"
	var duel_client_id := "test-device"
	var available := true
	var initialized := true
	var status := "Offline contract fixture"
	var account: Dictionary = {"uid":"test-account","authGeneration":1,"signedIn":true,"isAnonymous":true}
	var calls: Array = []
	var responses: Dictionary = {}
	var gate_method := ""
	var pending := false
	var held_value: Dictionary = {}
	func request(method: String, args: Array = []) -> Dictionary:
		calls.append({"method":method,"args":args.duplicate(true)})
		var result: Dictionary = responses.get(method,{"ok":true}).duplicate(true)
		if method == gate_method:
			pending = true
			held_value = result
			await release_response
			pending = false
		return {"ok":true,"value":result}
	func count_method(method: String) -> int:
		var total := 0
		for call in calls:
			if call.method == method: total += 1
		return total
	func last_call(method: String) -> Dictionary:
		for index in range(calls.size()-1,-1,-1):
			if calls[index].method == method: return calls[index]
		return {}

class MockProgress extends Node:
	signal profile_changed(name: String)
	var current_name := "Network Fixture"
	var save: Dictionary = {"profileId":"network-profile","playerName":"Network Fixture","duelMessages":true,"activeDuelFrame":"frame_bronze","activeDuelTitle":"","duelRatedMatches":{},"duelRewards":{},"duelRewardClaims":{},"duelRating":800,"duelPeakRating":800,"duelBestStreak":0}
	var persist_count := 0
	func persist() -> bool:
		persist_count += 1
		return true
	func ensure_duel_state(profile: Dictionary) -> void:
		ProgressService.ensure_duel_state(profile)

class MockSession extends Node:
	signal completed(result: Dictionary)
	signal failed(reason: String)
	var mode := ""
	var elapsed := 0.0
	var moves := 0
	var finished := false
	var paused := false
	var starts: Array = []
	var pause_count := 0
	var resume_count := 0
	func start_level(index: int, mode_value: String = "campaign", options: Dictionary = {}) -> bool:
		mode = mode_value
		starts.append({"index":index,"mode":mode_value,"options":options.duplicate(true)})
		elapsed = 0.0
		moves = 0
		finished = false
		paused = false
		return true
	func pause(_reason: String = "") -> void:
		paused = true
		pause_count += 1
	func resume(_reason: String = "") -> void:
		paused = false
		resume_count += 1
	func result_snapshot(success: bool = true) -> Dictionary:
		return {"mode":mode,"seconds":elapsed,"time":elapsed,"moves":moves,"completed":success and finished,"maxCombo":1,"reactions":0,"autoMoves":0,"hits":0,"penalty":0}

var failures: Array[String] = []
var service: Node
var cloud: MockCloud
var progress: MockProgress
var session: MockSession
var observed_rounds: Array = []
var observed_finals: Array = []
var observed_messages: Array = []
var operation_result: Dictionary = {}

func check(condition: bool, message: String) -> void:
	if not condition:
		failures.append(message)
		push_error(message)

func _initialize() -> void:
	call_deferred("_run")

func _round(level: int = 47) -> Dictionary:
	return {"level":level,"gameType":"classic","crystals":null,"chainPlan":null,"reactorPlan":null,"results":[null,null],"winner":null}

func _room(status_value: String = "playing", guest: bool = false) -> Dictionary:
	var now := int(Time.get_unix_time_from_system()*1000)
	return {"version":4,"code":"123456","matchType":"friend","queueTickets":[],"status":status_value,"hostUid":"other-account" if guest else cloud.uid,"hostClientId":"other-device" if guest else cloud.duel_client_id,"guestUid":cloud.uid if guest else "other-account","guestClientId":cloud.duel_client_id if guest else "other-device","playerNames":["Host","Guest"],"playerStyles":[{"frame":"frame_bronze","title":""},{"frame":"frame_bronze","title":""}],"matchNo":1,"pool":{"kind":"mixed","min":40,"max":300},"gameKind":"classic","round":0,"turn":0,"wins":[0,0],"rounds":[_round(47),_round(55),_round(65)],"createdAt":now-5000,"updatedAt":now-5000,"expiresAt":now+900000,"hostPresenceAt":now,"guestPresenceAt":now,"disconnectState":null,"lastQuickMessage":null,"finishReason":null,"forfeitWinner":null,"forfeitBy":null}

func _ingest(value: Dictionary) -> void:
	service.ingest_room("123456",value)
	await process_frame
	await process_frame

func _new_service() -> void:
	if service != null:
		service.free()
	service = load("res://scripts/services/online_duel.gd").new()
	root.add_child(service)
	service.countdown_seconds = 0.0
	service.resume_path = "user://test_online_duel_resume_"+str(OS.get_process_id())+".json"
	service.configure(cloud,progress,session,root.get_node("Catalog"))
	service.round_started.connect(func(info): observed_rounds.append(info))
	service.match_finished.connect(func(info): observed_finals.append(info))
	service.message_received.connect(func(info): observed_messages.append(info))

func _capture_create() -> void:
	operation_result = await service.create("classic","mixed","Fixture")

func _run() -> void:
	cloud = MockCloud.new()
	progress = MockProgress.new()
	session = MockSession.new()
	root.add_child(cloud)
	root.add_child(progress)
	root.add_child(session)
	_new_service()
	# Each wire plan comes directly from the authored per-mode export.
	var catalog: Node = root.get_node("Catalog")
	for kind: String in ["classic","crystal","chain","reactor"]:
		var built: Array = service.build_rounds(kind,"mixed")
		check(built.size() == 3,"Round builder failed source mode "+kind)
		var seen: Dictionary = {}
		for round_info: Dictionary in built:
			var level: int = int(round_info.level)
			check(not seen.has(level) and bool(catalog.mode_data.eligible[level].get(kind,false)),"Round builder selected duplicate or incompatible board")
			seen[level] = true
			var record: Dictionary = catalog.get_snapshot_record(level,kind)
			if kind == "crystal": check(round_info.crystals == record.crystalLayout,"Crystal room did not carry authored crystal positions")
			if kind == "chain": check(round_info.chainPlan == record.chainPlan,"Chain room did not carry authored reaction plan")
			if kind == "reactor": check(round_info.reactorPlan == record.reactorPlan,"Reactor room did not carry authored gate plan")
	var waiting := _room("waiting")
	waiting.guestUid = null
	waiting.guestClientId = null
	cloud.responses.createDuelRoom = {"ok":true,"code":"123456","playerIndex":0,"room":waiting}
	var created: Dictionary = await service.create("classic","mixed","Fixture")
	check(created.get("ok",false) and service.code == "123456" and service.player_index == 0,"Friend creation did not adopt authoritative room")
	var create_call := cloud.last_call("createDuelRoom")
	check(not create_call.is_empty() and create_call.args[0].rounds.size() == 3,"Friend create must send exactly three source-schema rounds")
	check(session.starts.is_empty(),"Waiting friend room started local play before opponent joined")
	var playing := _room()
	await _ingest(playing)
	check(session.starts.size() == 1 and session.mode == "duel","Authoritative playing snapshot did not start host local solve")
	check(observed_rounds.size() == 1,"Round start notification missing")
	var hidden_probe := playing.duplicate(true)
	hidden_probe.rounds[0].results[1] = {"time":77.712345,"moves":9876,"completed":true}
	await _ingest(hidden_probe)
	var public_view: Dictionary = service.view()
	check(not JSON.stringify(public_view).contains("77.712345") and not JSON.stringify(public_view).contains("9876"),"Waiting UI exposed opponent result before both results were revealed")
	var starts_before := session.starts.size()
	playing.updatedAt = int(Time.get_unix_time_from_system()*1000)
	await _ingest(playing)
	check(session.starts.size() == starts_before,"Heartbeat snapshot restarted an active round")
	cloud.responses.submitDuelTurn = {"ok":true,"data":{"status":"playing","wins":[0,0],"waitingForOpponent":true}}
	var submitted: Dictionary = await service.submit_turn({"seconds":12.4,"time":12.4,"moves":7,"completed":true})
	check(submitted.get("ok",false),"Own solve submission failed")
	var submit_call := cloud.last_call("submitDuelTurn")
	check(submit_call.args[0] == "123456" and int(submit_call.args[1]) == 0 and int(submit_call.args[2]) == 0,"Submission must use local player slot, not room.turn")
	check(not submit_call.args[3].has("atoms") and not submit_call.args[3].has("moveLog"),"Hidden duel leaked board or move proof outside source contract")
	playing.rounds[0].results[0] = {"time":12.4,"moves":7,"completed":true}
	await _ingest(playing)
	check(session.starts.size() == starts_before,"Own locked result restarted a solve")
	check(cloud.count_method("publishDuelMoveEvent") == 0 and cloud.count_method("publishDuelLiveState") == 0,"Duel published forbidden opponent-visible board state")
	var resolved := playing.duplicate(true)
	resolved.status = "round_result"
	resolved.rounds[0].results[1] = {"time":15.0,"moves":8,"completed":true}
	resolved.rounds[0].winner = 0
	resolved.wins = [1,0]
	await _ingest(resolved)
	check(service.room.status == "round_result" and service.room.wins == [1,0],"Round result must follow authoritative server snapshot")
	cloud.responses.advanceDuelRound = {"ok":true,"data":{"advanced":true,"waiting":false}}
	await service.next_round()
	check(int(service.room.round) == 0,"Next request advanced locally before authoritative snapshot")
	resolved.status = "playing"
	resolved.round = 1
	resolved.updatedAt = int(Time.get_unix_time_from_system()*1000)-5000
	await _ingest(resolved)
	check(session.starts.size() == starts_before+1,"Next authoritative round did not start")
	# Reconnect pauses current board and preserves its accumulated elapsed time.
	session.elapsed = 19.5
	resolved.disconnectState = {"playerIndex":1,"reporterIndex":0,"startedAt":int(Time.get_unix_time_from_system()*1000),"deadlineAt":int(Time.get_unix_time_from_system()*1000)+30000}
	await _ingest(resolved)
	check(session.paused and session.elapsed == 19.5,"Opponent reconnect window failed to pause/preserve local timer")
	resolved.disconnectState = null
	resolved.hostPresenceAt = int(Time.get_unix_time_from_system()*1000)
	resolved.guestPresenceAt = resolved.hostPresenceAt
	await _ingest(resolved)
	check(not session.paused and session.elapsed == 19.5,"Reconnection reset timer or failed to resume")
	# Preset messages are a strict source whitelist, with sequence deduplication.
	check(not (await service.send_message("arbitrary-text")).get("ok",false),"Unlisted free-text chat escaped preset whitelist")
	resolved.lastQuickMessage = {"seq":1,"playerIndex":1,"key":"hello","sentAt":int(Time.get_unix_time_from_system()*1000)}
	await _ingest(resolved)
	await _ingest(resolved)
	check(observed_messages.size() == 1,"Incoming message was lost or replayed by duplicate room snapshots")
	progress.save.duelMessages = false
	resolved.lastQuickMessage.seq = 2
	await _ingest(resolved)
	check(observed_messages.size() == 1,"Disabled duel messages still showed opponent messages")
	var message_calls := cloud.count_method("sendDuelQuickMessage")
	check(not (await service.send_message("hello")).get("ok",false) and cloud.count_method("sendDuelQuickMessage") == message_calls,"Disabled duel messages still sent an outbound message")
	progress.save.duelMessages = true
	var alien_identity := resolved.duplicate(true)
	alien_identity.hostClientId = "different-device"
	check(service.membership(alien_identity) == -1,"Room membership trusted account UID without matching device identity")
	var final := resolved.duplicate(true)
	final.status = "finished"
	final.wins = [2,0]
	final.finishReason = "normal"
	await _ingest(final)
	check(observed_finals.size() == 1,"Authoritative final result notification missing")
	check(progress.save.duelRatedMatches.is_empty(),"Friendly room modified rated duel receipts")
	cloud.responses.rematchDuelRoom = {"ok":true}
	var rematched: Dictionary = await service.rematch()
	check(rematched.get("ok",false) and cloud.count_method("rematchDuelRoom") == 1,"Host could not request real shared-room rematch")
	check(service.room.status == "finished","Rematch request reopened locally before server snapshot")
	var rematch_room := _room()
	rematch_room.matchNo = 2
	await _ingest(rematch_room)
	check(session.starts.size() == starts_before+2,"Authoritative rematch did not reopen first round")
	# Guest also starts immediately despite legacy room.turn remaining zero.
	_new_service()
	var guest_room := _room("playing",true)
	cloud.responses.joinDuelRoom = {"ok":true,"code":"123456","playerIndex":1,"room":guest_room}
	var guest_joined: Dictionary = await service.join("123456","Guest")
	await process_frame
	check(guest_joined.get("ok",false) and service.player_index == 1,"Guest room join failed")
	check(session.starts.size() == starts_before+3,"Guest incorrectly waited for room.turn to become one")
	guest_room.status = "round_result"
	guest_room.rounds[0].results = [{"completed":true},{"completed":true}]
	guest_room.wins = [0,1]
	await _ingest(guest_room)
	cloud.responses.advanceDuelRound = {"ok":true,"data":{"advanced":false,"waiting":true}}
	await service.next_round()
	check(int(service.room.round) == 0,"Guest next request advanced shared room locally")
	# Quick match adopts the ticket's real room rather than reporting a fake opponent.
	await service.leave()
	_new_service()
	cloud.responses.createQuickMatchTicket = {"ok":true,"ticketId":"mq_fixture_ticket_123","ticket":{"status":"waiting"}}
	cloud.responses.tryQuickMatch = {"ok":true,"status":"waiting"}
	var quick: Dictionary = await service.quick_match("Fixture")
	check(quick.get("ok",false) and not service.quick_ticket.is_empty(),"Quick match did not create and retain a real queue ticket")
	cloud.match_updated.emit(service.quick_ticket,{"status":"matched","roomCode":"123456","playerIndex":0})
	await process_frame
	await process_frame
	check(service.code == "123456" and cloud.count_method("subscribeDuelRoom") > 0,"Matched queue ticket did not attach authoritative room listener")
	var ranked := _room()
	ranked.matchType = "quick"
	ranked.queueTickets = ["mq_fixture_first","mq_fixture_second"]
	await _ingest(ranked)
	ranked.status = "finished"
	ranked.wins = [2,0]
	ranked.finishReason = "normal"
	await _ingest(ranked)
	check(progress.save.duelRatedMatches.size() == 1 and progress.save.duelRating == 825,"Completed ranked quick room did not record exact source +25 DP receipt")
	await _ingest(ranked)
	check(progress.save.duelRatedMatches.size() == 1 and progress.save.duelRating == 825,"Repeated ranked final snapshot farmed DP")
	# A queue cancellation can race with a real match; preserve that server match.
	await service.leave()
	_new_service()
	await service.quick_match("Fixture")
	cloud.responses.cancelQuickMatch = {"ok":true,"matched":true,"code":"123456","playerIndex":0}
	var cancel_race: Dictionary = await service.cancel_search()
	check(cancel_race.get("matched",false) and service.code == "123456","Quick cancel race discarded an already matched room")
	cloud.responses.cancelQuickMatch = {"ok":true,"matched":false}
	# Async responses from a prior profile/account must never populate the new context.
	await service.leave()
	_new_service()
	cloud.gate_method = "createDuelRoom"
	_capture_create()
	await process_frame
	check(cloud.pending,"Stale-response fixture failed to suspend create request")
	progress.save.profileId = "different-profile"
	progress.current_name = "Different"
	progress.profile_changed.emit("Different")
	cloud.release_response.emit()
	await process_frame
	await process_frame
	check(service.code.is_empty() and not operation_result.get("ok",false),"Prior profile create response took over the new profile")
	cloud.gate_method = ""
	_new_service()
	operation_result = {}
	cloud.gate_method = "createDuelRoom"
	_capture_create()
	await process_frame
	cloud.uid = "changed-account"
	cloud.account = {"uid":"changed-account","authGeneration":2,"signedIn":true,"isAnonymous":true}
	cloud.account_changed.emit(cloud.account)
	cloud.release_response.emit()
	await process_frame
	await process_frame
	check(service.code.is_empty() and not operation_result.get("ok",false),"Prior account response crossed auth generation boundary")
	cloud.gate_method = ""
	cloud.available = false
	var unavailable: Dictionary = await service.quick_match("Fixture")
	check(not unavailable.get("ok",false),"Native unavailable cloud produced a successful matchmaking result")
	# Original request windows bound stalled SDK promises; a late response cannot
	# change a request that has already timed out.
	cloud.available = true
	_new_service()
	service.request_timeout_scale = 0.001
	cloud.gate_method = "createDuelRoom"
	operation_result = {}
	_capture_create()
	await create_timer(0.04).timeout
	check(not operation_result.get("ok",true) and str(operation_result.get("reason","")).contains("timeout"),"Stalled SDK promise left room creation hanging past source timeout")
	cloud.release_response.emit()
	await process_frame
	check(service.code.is_empty(),"Late SDK response adopted a room after request timeout")
	cloud.gate_method = ""
	check(is_equal_approx(float(service._request_seconds("heartbeatDuelRoom")),7.0) and is_equal_approx(float(service._request_seconds("createDuelRoom")),15.0) and is_equal_approx(float(service._request_seconds("submitDuelTurn")),12.0),"Request windows differ from source heartbeat/room/submit timing")
	if failures.is_empty():
		print("ONLINE_DUEL_CONFORMANCE_OK: authoritative simultaneous rounds, hidden results, reconnection, guest progression, queue, context guards, preset messages")
	else:
		print("ONLINE_DUEL_CONFORMANCE_FAILED: ",failures.size())
	service.free()
	cloud.free()
	progress.free()
	session.free()
	quit(0 if failures.is_empty() else 1)
