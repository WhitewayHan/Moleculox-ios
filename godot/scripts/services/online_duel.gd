class_name MoleculoxOnlineDuel
extends Node
## Authoritative, simultaneous-hidden online duel client. Firebase owns room,
## results, winners, matchmaking, presence and forfeits; Godot owns each attempt.
signal changed(view: Dictionary)
signal round_started(info: Dictionary)
signal round_result(view: Dictionary)
signal match_finished(view: Dictionary)
signal message_received(message: Dictionary)
signal error(details: Dictionary)
signal countdown(seconds: int)

const MESSAGE_KEYS := ["hello","good_luck","nice_move","great_reaction","almost_there","brilliant","oops","well_played","good_game","rematch","thanks"]
const RESUME_KEY := "mx_online_duel_resume_v2"
var state := "idle"
var room: Dictionary = {}
var code := ""
var player_index := -1
var quick_ticket := ""
var countdown_seconds := 3.2
# Test harnesses may scale time; production follows the original request windows.
var request_timeout_scale := 1.0
var resume_path := "user://mx_online_duel_resume_v2.json"
var last_error: Dictionary = {}
var _cloud: Node
var _progress: Node
var _session: Node
var _catalog: Node
var _generation := 0
var _context: Dictionary = {}
var _round_key := ""
var _started_key := ""
var _start_at := 0.0
var _last_countdown := -1
var _result_key := ""
var _pending: Dictionary = {}
var _submit_busy := false
var _heartbeat_busy := false
var _heartbeat_failures := 0
var _heartbeat_left := 0.0
var _listener_retry_left := -1.0
var _listener_failures := 0
var _quick_left := 0.0
var _quick_started := 0.0
var _quick_busy := false
var _quick_rounds: Array = []
var _disconnect_busy := false
var _resolve_busy := false
var _local_offline := false
var _connection_blocked := false
var _disconnect_deadline := 0.0
var _pause_marker := ""
var _message_seq := 0
var _last_message_sent := -1800
var _last_rank: Dictionary = {}

func configure(cloud: Node, progress: Node, session: Node, catalog: Node) -> void:
	_cloud = cloud
	_progress = progress
	_session = session
	_catalog = catalog
	for spec in [[_cloud,"room_updated",_on_room],[_cloud,"match_updated",_on_ticket],[_cloud,"account_changed",_on_account],[_cloud,"error",_on_cloud_error],[_progress,"profile_changed",_on_profile],[_session,"completed",_on_completed],[_session,"failed",_on_failed]]:
		if spec[0] != null and spec[0].has_signal(spec[1]) and not spec[0].is_connected(spec[1],spec[2]): spec[0].connect(spec[1],spec[2])

func active() -> bool:
	return state not in ["idle","error","cancelled","abandoned"]

func view() -> Dictionary:
	var rounds: Array = room.get("rounds",[]).duplicate(true)
	if str(room.get("status","")) == "playing":
		# The opponent's attempt and both round results stay hidden until locked.
		for round_info: Dictionary in rounds:
			round_info.results = [null,null]
			round_info.winner = null
	return {"state":state,"code":code,"playerIndex":player_index,"players":room.get("playerNames",["Player 1","Player 2"]),"styles":room.get("playerStyles",[]),"round":int(room.get("round",0)),"matchNo":int(room.get("matchNo",1)),"wins":room.get("wins",[0,0]),"rounds":rounds,"host":player_index==0,"ranked":_ranked(room),"rank":_last_rank.duplicate(true),"finishReason":room.get("finishReason",""),"forfeitWinner":room.get("forfeitWinner"),"disconnectDeadline":_disconnect_deadline,"quickTicket":quick_ticket,"error":last_error.duplicate(true)}

func _set_state(value: String) -> void:
	state = value
	changed.emit(view())

func _capture() -> void:
	_generation += 1
	_context = {"uid":str(_cloud.get("uid")),"clientId":str(_cloud.get("duel_client_id")),"profileId":str(_progress.get("save").get("profileId","")),"profileName":str(_progress.get("current_name")),"authGeneration":int(_cloud.get("account").get("authGeneration",0))}

func _valid(epoch: int = -1) -> bool:
	if _cloud == null or _progress == null or _context.is_empty(): return false
	return (epoch < 0 or epoch == _generation) and str(_cloud.get("uid")) == str(_context.uid) and str(_cloud.get("duel_client_id")) == str(_context.clientId) and str(_progress.get("save").get("profileId","")) == str(_context.profileId) and str(_progress.get("current_name")) == str(_context.profileName) and int(_cloud.get("account").get("authGeneration",0)) == int(_context.authGeneration)

class RequestRace extends RefCounted:
	signal settled
	var done := false
	var value: Variant
	func finish(result: Variant) -> void:
		if done: return
		done = true
		value = result
		settled.emit()

func _request_seconds(method: String) -> float:
	if method in ["createDuelRoom","joinDuelRoom"]: return 15.0
	if method == "heartbeatDuelRoom": return 7.0
	if method in ["cancelQuickMatch","startDuelDisconnectCountdown","resolveDuelDisconnect"]: return 9.0
	return 12.0

func _transport(race: RequestRace, method: String, args: Array) -> void:
	# Firebase may finish after a timeout. The race and generation guards discard
	# that late UI result while the SDK retains its own atomic transaction rules.
	var result: Variant = await _cloud.call("request",method,args)
	race.finish(result)

func _call(method: String, args: Array = []) -> Dictionary:
	if _cloud == null: return {"ok":false,"reason":"cloud/unavailable"}
	var epoch := _generation
	var race := RequestRace.new()
	_transport(race,method,args)
	if not race.done:
		var timeout := get_tree().create_timer(maxf(0.001,_request_seconds(method)*request_timeout_scale))
		timeout.timeout.connect(func():race.finish({"ok":false,"error":{"code":"duel/heartbeat-timeout" if method == "heartbeatDuelRoom" else "duel/submit-timeout" if method == "submitDuelTurn" else "duel/timeout"}}),CONNECT_ONE_SHOT)
		await race.settled
	var envelope: Variant = race.value
	if not _valid(epoch): return {"ok":false,"reason":"duel/context-changed","stale":true}
	if not envelope is Dictionary: return {"ok":false,"reason":"cloud/invalid-response"}
	if not bool(envelope.get("ok",false)):
		var details: Dictionary = envelope.get("error",{}) if envelope.get("error",{}) is Dictionary else {}
		return {"ok":false,"reason":str(details.get("code",envelope.get("reason","cloud/error"))),"error":details}
	var value: Variant = envelope.get("value",envelope)
	if value is Dictionary: return value
	return {"ok":true,"value":value}

func _name(value: String) -> String:
	var result := value if not value.strip_edges().is_empty() else str(_progress.get("save").get("playerName","Player"))
	return result.replace("<","").replace(">","").strip_edges().substr(0,14)

func _style() -> Dictionary:
	var save: Dictionary = _progress.get("save")
	return {"frame":save.get("activeDuelFrame","frame_bronze"),"title":save.get("activeDuelTitle","")}

func _prepare(operation: String) -> bool:
	if _cloud == null or _progress == null or _session == null or _catalog == null:
		_fail("duel/not-configured")
		return false
	if not bool(_cloud.get("available")):
		_fail("cloud/native-sdk-unavailable" if not OS.has_feature("web") else "cloud/unavailable")
		return false
	if not code.is_empty() or not quick_ticket.is_empty():
		_fail("duel/already-active")
		return false
	_capture()
	last_error = {}
	_set_state(operation)
	return true

func create(game_kind: String = "mixed", pool_kind: String = "mixed", player_name: String = "") -> Dictionary:
	if not _prepare("creating"): return {"ok":false,"reason":last_error.get("code")}
	var rounds := build_rounds(game_kind,pool_kind)
	if rounds.size() != 3: return _fail("duel/invalid-rounds")
	var pool := {"kind":pool_kind,"min":120 if pool_kind=="hard" else 40,"max":99 if pool_kind=="medium" else 300}
	var result := await _call("createDuelRoom",[{"hostName":_name(player_name),"playerStyle":_style(),"gameKind":game_kind,"pool":pool,"rounds":rounds}])
	if bool(result.get("stale",false)): return result
	if not bool(result.get("ok",false)): return _fail(str(result.get("reason","duel/create-failed")))
	await _enter(str(result.get("code","")),int(result.get("playerIndex",0)),result.get("room",{}))
	return result

func join(invite_code: String, player_name: String = "") -> Dictionary:
	if not _prepare("joining"): return {"ok":false,"reason":last_error.get("code")}
	var normalized := invite_code.strip_edges().replace(" ","")
	if normalized.length() != 6 or not normalized.is_valid_int(): return _fail("duel/invalid-code")
	var result := await _call("joinDuelRoom",[normalized,_name(player_name),_style(),build_rounds("classic","mixed")])
	if bool(result.get("stale",false)): return result
	if not bool(result.get("ok",false)): return _fail(str(result.get("reason","duel/join-failed")))
	await _enter(str(result.get("code",normalized)),int(result.get("playerIndex",1)),result.get("room",{}))
	return result

func quick_match(player_name: String = "") -> Dictionary:
	if not _prepare("searching"): return {"ok":false,"reason":last_error.get("code")}
	_quick_rounds = build_rounds("mixed","mixed")
	if _quick_rounds.size() != 3: return _fail("duel/invalid-rounds")
	var result := await _call("createQuickMatchTicket",[_name(player_name),_style()])
	if bool(result.get("stale",false)): return result
	if not bool(result.get("ok",false)): return _fail(str(result.get("reason","duel/match-failed")))
	quick_ticket = str(result.get("ticketId",""))
	_quick_started = _now()
	_quick_left = 2.4
	await _call("subscribeQuickMatchTicket",[quick_ticket])
	if not _valid(): return {"ok":false,"stale":true}
	_set_state("searching")
	_attempt_quick()
	return result

func _attempt_quick() -> void:
	if _quick_busy or quick_ticket.is_empty() or not _valid(): return
	_quick_busy = true
	var ticket := quick_ticket
	var result := await _call("tryQuickMatch",[ticket,_quick_rounds])
	_quick_busy = false
	if quick_ticket != ticket or bool(result.get("stale",false)): return
	if bool(result.get("ok",false)) and str(result.get("status","")) == "matched":
		await _matched(str(result.get("code","")),int(result.get("playerIndex",0)),result.get("room",{}))
	elif not bool(result.get("ok",false)) and not _retryable(str(result.get("reason",""))):
		await cancel_search(true)
		_fail(str(result.get("reason","duel/match-failed")))

func _matched(room_code: String, index: int, initial: Dictionary = {}) -> void:
	if quick_ticket.is_empty(): return
	var ticket := quick_ticket
	quick_ticket = ""
	await _call("unsubscribeQuickMatchTicket",[ticket])
	await _call("removeQuickMatchTicket",[ticket])
	if not _valid(): return
	await _enter(room_code,index,initial)

func cancel_search(expired: bool = false) -> Dictionary:
	if quick_ticket.is_empty(): return {"ok":true}
	var ticket := quick_ticket
	var result := await _call("cancelQuickMatch",[ticket])
	if bool(result.get("stale",false)): return result
	if bool(result.get("matched",false)):
		await _matched(str(result.get("code","")),int(result.get("playerIndex",0)))
		return result
	if not bool(result.get("ok",false)): return _fail(str(result.get("reason","duel/cancel-failed")),false)
	await _call("unsubscribeQuickMatchTicket",[ticket])
	await _call("removeQuickMatchTicket",[ticket])
	quick_ticket = ""
	_set_state("expired" if expired else "idle")
	return result

func _enter(room_code: String, index: int, initial: Dictionary = {}) -> void:
	if room_code.length() != 6:
		_fail("duel/invalid-code")
		return
	code = room_code
	player_index = index
	_started_key = ""
	_round_key = ""
	_result_key = ""
	_pending = {}
	_last_rank = {}
	_message_seq = 0
	_heartbeat_left = 0.0
	_set_state("connecting")
	if not initial.is_empty(): ingest_room(code,initial)
	await _call("subscribeDuelRoom",[code])

func ingest_room(room_code: String, incoming: Variant) -> void:
	if room_code != code or not _valid(): return
	if not incoming is Dictionary or incoming.is_empty():
		_clear_resume()
		_fail("duel/room-closed")
		return
	var member := membership(incoming)
	if member < 0:
		_clear_resume()
		_fail("duel/not-player")
		return
	player_index = member
	var first := room.is_empty()
	room = incoming.duplicate(true)
	_listener_failures = 0
	_listener_retry_left = -1
	var message: Variant = room.get("lastQuickMessage")
	if message is Dictionary:
		var seq := int(message.get("seq",0))
		if not first and seq > _message_seq and int(message.get("playerIndex",-1)) != player_index and bool(_progress.get("save").get("duelMessages",true)):
			message_received.emit(message.duplicate(true))
		_message_seq = maxi(_message_seq,seq)
	var status := str(room.get("status",""))
	if status in ["playing","round_result"]: _persist_resume()
	if status in ["cancelled","abandoned","finished"]: _clear_resume()
	if status in ["cancelled","abandoned"]:
		_session.call("pause","online-duel")
		_set_state(status)
		return
	if status == "finished":
		_session.call("pause","online-duel")
		_connection_blocked = false
		_set_state("finished")
		var key := str(room.get("matchNo",1))+"-finished"
		if _result_key != key:
			_result_key = key
			_last_rank = _record_rank()
			match_finished.emit(view())
		return
	if _handle_connection(): return
	if status == "waiting":
		_set_state("waiting")
	elif status == "round_result":
		_session.call("pause","online-duel")
		_set_state("round_result")
		var key := str(room.get("matchNo",1))+"-"+str(room.get("round",0))+"-result"
		if _result_key != key:
			_result_key = key
			round_result.emit(view())
	elif status == "playing":
		var round_info := current_round()
		var results: Array = round_info.get("results",[null,null])
		if results.size() > player_index and results[player_index] != null:
			_pending = {}
			_session.call("pause","online-duel")
			_set_state("waiting_opponent")
		else:
			var key := str(room.get("matchNo",1))+"-"+str(room.get("round",0))
			if _started_key == key:
				_session.call("resume","online-duel")
				_set_state("submitting" if _submit_busy else "playing")
			else:
				if _round_key != key or _start_at <= 0:
					_round_key = key
					var first_quick := int(room.get("round",0)) == 0 and int(room.get("matchNo",1)) == 1 and str(room.get("matchType","")) == "quick"
					var event_at := timestamp_ms(room.get("createdAt") if first_quick else room.get("updatedAt"))
					_start_at = event_at+countdown_seconds*1000.0 if event_at > 0 else (_now() if countdown_seconds <= 0 else 0.0)
				_set_state("countdown")
				_countdown_tick()

func membership(value: Dictionary) -> int:
	var uid := str(_cloud.get("uid"))
	var client := str(_cloud.get("duel_client_id"))
	if uid.is_empty() or client.is_empty(): return -1
	if str(value.get("hostUid","")) == uid and str(value.get("hostClientId","")) == client: return 0
	if str(value.get("guestUid","")) == uid and str(value.get("guestClientId","")) == client: return 1
	return -1

func current_round() -> Dictionary:
	var rounds: Array = room.get("rounds",[])
	var index := int(room.get("round",0))
	return rounds[index] if index >= 0 and index < rounds.size() and rounds[index] is Dictionary else {}

func _countdown_tick() -> void:
	if state != "countdown" or _start_at <= 0: return
	var left := int(ceil((_start_at-_now())/1000.0))
	if left != _last_countdown:
		_last_countdown = left
		countdown.emit(maxi(0,left))
	if left <= 0: _start_round()

func _start_round() -> void:
	if not _valid() or _connection_blocked: return
	var info := current_round()
	if info.is_empty():
		_fail("duel/invalid-round")
		return
	var index := int(info.get("level",-1))
	var kind := str(info.get("gameType","classic"))
	var record: Dictionary = _catalog.call("get_snapshot_record",index,kind)
	var initial: Dictionary = record.get("initial",{})
	if index < 0 or index >= _catalog.get("levels").size() or initial.is_empty():
		_fail("duel/missing-level")
		return
	var plan := {"crystals":info.get("crystals",[]),"chainPlan":info.get("chainPlan",[]),"reactorPlan":info.get("reactorPlan",[])}
	for key in plan:
		if not plan[key] is Array: plan[key] = []
	var options := {"gameType":kind,"snapshot":initial,"level":_catalog.get("levels")[index],"modePlan":plan}
	if not bool(_session.call("start_level",index,"duel",options)):
		_fail("duel/start-failed")
		return
	_started_key = _round_key
	_pending = {}
	_session.set("elapsed",maxf(0.0,(_now()-_start_at)/1000.0))
	_set_state("playing")
	round_started.emit({"level":index,"gameType":kind,"round":int(room.get("round",0)),"playerIndex":player_index,"players":room.get("playerNames",[]),"options":options})

func submit_turn(result: Dictionary) -> Dictionary:
	if code.is_empty() or not _valid() or state not in ["playing","submission_failed","submitting"]: return {"ok":false,"reason":"duel/not-playing"}
	if _submit_busy: return {"ok":false,"reason":"duel/submission-pending"}
	var completed := bool(result.get("completed",true))
	_pending = {"time":clampf(float(result.get("time",result.get("seconds",90))),0,90) if completed else 90.0,"moves":clampi(int(result.get("moves",0)),0,9999),"completed":completed,"maxCombo":clampi(int(result.get("maxCombo",result.get("chainMaxCombo",1))),1,99),"reactions":clampi(int(result.get("reactions",result.get("chainReactions",0))),0,999),"autoMoves":clampi(int(result.get("autoMoves",result.get("chainAutoMoves",0))),0,999),"hits":clampi(int(result.get("hits",result.get("reactorHits",0))),0,99),"penalty":clampf(float(result.get("penalty",result.get("reactorPenalty",0))),0,999)}
	return await retry_submission()

func retry_submission() -> Dictionary:
	if _pending.is_empty() or _submit_busy or not _valid(): return {"ok":false,"reason":"duel/no-pending-result"}
	_submit_busy = true
	_session.call("pause","online-duel")
	_set_state("submitting")
	var round_number := int(room.get("round",0))
	var key := _started_key
	var payload := _pending.duplicate(true)
	var result := {"ok":false,"reason":"duel/offline"}
	for attempt in range(3):
		if attempt > 0:
			await get_tree().create_timer(0.9 if attempt == 1 else 2.2).timeout
			if not _valid() or key != _started_key: break
		result = await _call("submitDuelTurn",[code,round_number,player_index,payload])
		if bool(result.get("stale",false)) or bool(result.get("ok",false)) or not _retryable(str(result.get("reason",""))): break
	_submit_busy = false
	if bool(result.get("stale",false)) or not _valid() or key != _started_key: return result
	if bool(result.get("ok",false)):
		if str(room.get("status","")) == "playing": _set_state("waiting_opponent")
	else:
		if str(room.get("status","")) != "playing": return result
		_set_state("submission_failed")
		_fail(str(result.get("reason","duel/submit-failed")),false)
	return result

func next_round() -> Dictionary:
	if state != "round_result" or not _valid(): return {"ok":false,"reason":"duel/not-ready"}
	var result := await _call("advanceDuelRound",[code,int(room.get("round",0))])
	if not bool(result.get("ok",false)) and not bool(result.get("stale",false)): _fail(str(result.get("reason","duel/advance-failed")),false)
	return result # Only a new authoritative snapshot can start the next round.

func rematch() -> Dictionary:
	if state != "finished" or player_index != 0 or not _valid(): return {"ok":false,"reason":"duel/host-only"}
	return await _call("rematchDuelRoom",[code,build_rounds(str(room.get("gameKind","mixed")),str(room.get("pool",{}).get("kind","mixed")))])

func leave(notify: bool = true) -> Dictionary:
	if not quick_ticket.is_empty(): return await cancel_search()
	var result := {"ok":true}
	if notify and not code.is_empty() and _valid():
		result = await _call("leaveDuelRoom",[code])
		if not bool(result.get("ok",false)):
			if not bool(result.get("stale",false)): _fail(str(result.get("reason","duel/leave-failed")),false)
			return result
	if result.get("data") is Dictionary and str(result.data.get("status","")) == "finished":
		ingest_room(code,result.data)
		return result
	if not code.is_empty() and _valid(): await _call("unsubscribeDuelRoom",[code])
	reset_local()
	return result

func reset_local() -> void:
	# Unsubscribe only detaches the local listener; it makes no room/account write.
	if _cloud != null and _cloud.has_method("invoke"):
		if not code.is_empty(): _cloud.call("invoke","unsubscribeDuelRoom",[code])
		if not quick_ticket.is_empty(): _cloud.call("invoke","unsubscribeQuickMatchTicket",[quick_ticket])
	_generation += 1
	if _session != null: _session.call("pause","online-duel")
	_clear_resume()
	code = ""
	quick_ticket = ""
	room = {}
	player_index = -1
	_started_key = ""
	_pending = {}
	_connection_blocked = false
	_submit_busy = false
	_heartbeat_busy = false
	_heartbeat_failures = 0
	_quick_busy = false
	_local_offline = false
	_listener_retry_left = -1
	_start_at = 0
	_context = {}
	_set_state("idle")

func send_message(key: String) -> Dictionary:
	if _progress != null and not bool(_progress.get("save").get("duelMessages",true)): return {"ok":false,"reason":"duel/messages-disabled"}
	if key not in MESSAGE_KEYS: return {"ok":false,"reason":"duel/invalid-message"}
	if code.is_empty() or not _valid(): return {"ok":false,"reason":"duel/not-player"}
	if Time.get_ticks_msec()-_last_message_sent < 1800: return {"ok":false,"reason":"duel/message-cooldown"}
	var result := await _call("sendDuelQuickMessage",[code,key])
	if bool(result.get("ok",false)): _last_message_sent = Time.get_ticks_msec()
	return result

func set_network_online(online: bool) -> void:
	_local_offline = not online
	if not online:
		_block_connection("self",0)
	else:
		_heartbeat_left = 0
		_listener_retry_left = 0

func _handle_connection() -> bool:
	if _local_offline or _heartbeat_failures >= 2:
		_block_connection("self",0)
		return true
	var disconnected: Variant = room.get("disconnectState")
	if disconnected is Dictionary and str(room.get("status","")) in ["playing","round_result"]:
		var marker := str(timestamp_ms(disconnected.get("startedAt")))+"-"+str(disconnected.get("playerIndex",0))
		if int(disconnected.get("playerIndex",0)) == player_index and marker != _pause_marker and not _connection_blocked:
			_session.set("elapsed",maxf(0,float(_session.get("elapsed"))-maxf(0,(_now()-timestamp_ms(disconnected.get("startedAt")))/1000.0)))
		_pause_marker = marker
		_block_connection("self" if int(disconnected.get("playerIndex",0)) == player_index else "opponent",timestamp_ms(disconnected.get("deadlineAt")))
		return true
	if _connection_blocked:
		_connection_blocked = false
		_disconnect_deadline = 0
		_session.call("resume","online-connection")
	return false

func _block_connection(kind: String, deadline: float) -> void:
	_connection_blocked = true
	_disconnect_deadline = deadline
	_session.call("pause","online-connection")
	_set_state("reconnecting_"+kind)

func _heartbeat() -> void:
	if _heartbeat_busy or code.is_empty() or not _valid() or _local_offline or str(room.get("status","")) not in ["waiting","playing","round_result"]: return
	_heartbeat_busy = true
	var result := await _call("heartbeatDuelRoom",[code])
	_heartbeat_busy = false
	if bool(result.get("stale",false)): return
	if bool(result.get("ok",false)):
		var was_disconnected := _heartbeat_failures >= 2
		_heartbeat_failures = 0
		if was_disconnected:
			await _call("resolveDuelDisconnect",[code])
			if not room.is_empty(): ingest_room(code,room)
	else:
		_heartbeat_failures += 1
		if _heartbeat_failures >= 2:
			_block_connection("self",0)
			_listener_retry_left = 0.9

func _check_opponent_presence() -> void:
	if _disconnect_busy or _connection_blocked or str(room.get("status","")) not in ["playing","round_result"]: return
	var own := timestamp_ms(room.get("hostPresenceAt" if player_index == 0 else "guestPresenceAt"))
	var opponent := timestamp_ms(room.get("guestPresenceAt" if player_index == 0 else "hostPresenceAt"))
	if own <= 0 or _now()-own >= 20000 or (opponent > 0 and _now()-opponent < 10000): return
	_disconnect_busy = true
	await _call("startDuelDisconnectCountdown",[code,1-player_index])
	_disconnect_busy = false

func _resolve_disconnect() -> void:
	if _resolve_busy or not _valid(): return
	_resolve_busy = true
	await _call("resolveDuelDisconnect",[code])
	_resolve_busy = false

func _process(delta: float) -> void:
	if not _valid(): return
	if not quick_ticket.is_empty():
		_quick_left -= delta
		if _now()-_quick_started >= 118000:
			if not _quick_busy: cancel_search(true)
		elif _quick_left <= 0:
			_quick_left = 2.4
			_attempt_quick()
	if not code.is_empty():
		_heartbeat_left -= delta
		if _heartbeat_left <= 0:
			_heartbeat_left = 4.5
			_heartbeat()
		if _listener_retry_left >= 0:
			_listener_retry_left -= delta
			if _listener_retry_left <= 0:
				_listener_retry_left = -1
				_call("subscribeDuelRoom",[code])
		if _disconnect_deadline > 0 and _now() >= _disconnect_deadline: _resolve_disconnect()
		if state == "countdown": _countdown_tick()
		_check_opponent_presence()

func _on_room(room_code: String, value: Variant) -> void:
	ingest_room(room_code,value)

func _on_ticket(ticket: String, value: Variant) -> void:
	if ticket != quick_ticket or not _valid() or not value is Dictionary: return
	if str(value.get("status","")) == "matched" and not str(value.get("roomCode","")).is_empty(): _matched(str(value.roomCode),int(value.get("playerIndex",0)))

func _on_completed(result: Dictionary) -> void:
	if _session.get("mode") == "duel" and state == "playing": submit_turn(result)

func _on_failed(reason: String) -> void:
	if _session.get("mode") == "duel" and state == "playing" and reason in ["timeout","fragile"]:
		submit_turn(_session.call("result_snapshot",false))

func _on_account(_account: Dictionary) -> void:
	if not _context.is_empty() and not _valid():
		reset_local()
		_fail("duel/account-context-changed")

func _on_profile(_name: String) -> void:
	if not _context.is_empty() and not _valid():
		reset_local()
		_fail("duel/profile-context-changed")

func _on_cloud_error(details: Dictionary) -> void:
	if code.is_empty() or not _valid(): return
	var method := str(details.get("method",""))
	if method not in ["subscribeDuelRoom","room_updated"]: return
	var reason := str(details.get("code","cloud/error"))
	if not _retryable(reason):
		_fail(reason)
		return
	_listener_failures += 1
	_listener_retry_left = minf(10.0,0.9*pow(2.0,_listener_failures-1))
	_block_connection("self",0)

func _fail(reason: String, change_state: bool = true) -> Dictionary:
	last_error = {"code":reason,"message":reason}
	if change_state: _set_state("error")
	error.emit(last_error.duplicate(true))
	return {"ok":false,"reason":reason}

static func _retryable(reason: String) -> bool:
	if reason.is_empty(): return true
	for word in ["offline","unavailable","network","timeout","deadline-exceeded","aborted","internal","cancelled"]:
		if reason.contains(word): return true
	return false

static func timestamp_ms(value: Variant) -> float:
	if value is Dictionary:
		if value.has("milliseconds"): return float(value.milliseconds)
		return float(value.get("seconds",value.get("_seconds",0)))*1000.0+float(value.get("nanoseconds",0))/1000000.0
	if value is float or value is int: return float(value)
	if value is String and not value.is_empty(): return Time.get_unix_time_from_datetime_string(value)*1000.0
	return 0

static func _now() -> float:
	return Time.get_unix_time_from_system()*1000.0

func build_rounds(game_kind: String = "mixed", pool_kind: String = "mixed") -> Array:
	var kinds: Array = [game_kind,game_kind,game_kind]
	if game_kind == "mixed":
		kinds = ["classic","crystal","chain","reactor"]
		kinds.shuffle()
		kinds = kinds.slice(0,3)
	var result: Array = []
	var eligible: Array = _catalog.get("mode_data").get("eligible",[])
	var lower := 120 if pool_kind == "hard" else 40
	var upper := mini(99 if pool_kind == "medium" else 300,_catalog.get("levels").size()-1)
	for kind: String in kinds:
		var choices: Array = []
		for index in range(lower,upper+1):
			if index < eligible.size() and bool(eligible[index].get(kind,false)):
				var used := false
				for row: Dictionary in result: used = used or int(row.level) == index
				if not used: choices.append(index)
		if choices.is_empty(): return []
		choices.shuffle()
		var index := int(choices[0])
		var record: Dictionary = _catalog.call("get_snapshot_record",index,kind)
		var meta: Dictionary = record.get("meta",record.get("plan",record))
		var initial: Dictionary = record.get("initial",{})
		result.append({"level":index,"gameType":kind,"crystals":meta.get("crystals",meta.get("crystalLayout",initial.get("crystals",[]))) if kind=="crystal" else null,"chainPlan":meta.get("chainPlan",[]) if kind=="chain" else null,"reactorPlan":meta.get("reactorPlan",initial.get("reactorGates",[])) if kind=="reactor" else null,"results":[null,null],"winner":null})
	return result

static func _ranked(value: Dictionary) -> bool:
	if str(value.get("matchType","")) != "quick": return false
	for ticket in value.get("queueTickets",[]):
		if str(ticket).begins_with("mq_f_") or str(ticket).begins_with("mq_g_"): return false
	return true

func _record_rank() -> Dictionary:
	if not _ranked(room) or not _valid(): return {}
	var wins: Array = room.get("wins",[0,0])
	var winner := -1 if int(wins[0]) == int(wins[1]) else (0 if int(wins[0]) > int(wins[1]) else 1)
	if str(room.get("finishReason","")) in ["disconnect","left"] and room.get("forfeitWinner") != null: winner = int(room.forfeitWinner)
	var outcome := 3 if winner < 0 else (1 if winner == player_index else 2)
	var epoch := int(timestamp_ms(room.get("createdAt",room.get("updatedAt")))/1000.0)
	if epoch <= 0: return {}
	var key := code+"_"+str(epoch)+"_"+str(room.get("matchNo",1))
	var save: Dictionary = _progress.get("save")
	if save.get("duelRatedMatches",{}).has(key): return _last_rank
	var old := int(save.get("duelRating",800))
	save.duelRatedMatches[key] = epoch*10+outcome
	_progress.call("ensure_duel_state",save)
	_progress.call("persist")
	var result := {"key":key,"outcome":outcome,"old":old,"rating":int(save.get("duelRating",800)),"delta":int(save.get("duelRating",800))-old}
	if not bool(_cloud.get("account").get("isAnonymous",true)): _call("syncDuelLeaderboard",[save.duplicate(true),str(save.get("profileId","")),true])
	return result

func _persist_resume() -> void:
	if not _valid(): return
	var record := {"code":code,"playerIndex":player_index,"uid":_context.uid,"clientId":_context.clientId,"profileId":_context.profileId,"savedAt":_now(),"expiresAt":_now()+21600000}
	var text := JSON.stringify(record)
	var file := FileAccess.open(resume_path,FileAccess.WRITE)
	if file != null: file.store_string(text)
	if OS.has_feature("web"): JavaScriptBridge.eval("try{localStorage.setItem(%s,%s);}catch(e){}" % [JSON.stringify(RESUME_KEY),JSON.stringify(text)])

func resume_saved_match() -> Dictionary:
	if not _prepare("connecting"): return {"ok":false,"reason":last_error.get("code")}
	var raw := FileAccess.get_file_as_string(resume_path) if FileAccess.file_exists(resume_path) else ""
	if OS.has_feature("web"):
		var stored: Variant = JavaScriptBridge.eval("(function(){try{return localStorage.getItem(%s)||'';}catch(e){return '';}})()" % JSON.stringify(RESUME_KEY))
		if stored != null and not str(stored).is_empty(): raw = str(stored)
	var value: Variant = JSON.parse_string(raw) if not raw.is_empty() else {}
	if not value is Dictionary or value.is_empty() or str(value.get("uid","")) != str(_context.uid) or str(value.get("clientId","")) != str(_context.clientId) or str(value.get("profileId",_context.profileId)) != str(_context.profileId) or float(value.get("expiresAt",0)) < _now():
		_set_state("idle")
		return {"ok":false,"reason":"duel/no-resume"}
	await _enter(str(value.get("code","")),int(value.get("playerIndex",0)))
	return {"ok":true}

func _clear_resume() -> void:
	if FileAccess.file_exists(resume_path): DirAccess.remove_absolute(resume_path)
	if OS.has_feature("web"): JavaScriptBridge.eval("try{localStorage.removeItem(%s);}catch(e){}" % JSON.stringify(RESUME_KEY))
