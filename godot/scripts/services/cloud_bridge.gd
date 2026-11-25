class_name MoleculoxCloud
extends Node
## Platform transport for the original Firebase SDK contracts. The non-web build
## remains local/offline until a real native SDK adapter is installed.
signal cloud_ready(available: bool)
signal account_changed(account: Dictionary)
signal error(details: Dictionary)
signal profiles_updated(profiles: Array)
signal room_updated(code: String, room: Variant)
signal match_updated(ticket_id: String, ticket: Variant)
signal profile_merged(details: Dictionary)
signal request_completed(request_id: int, result: Dictionary)

const ADAPTER_PATH := "res://bridge/cloud-adapter.js"
const VENDOR_PATH := "res://bridge/vendor/"
const NATIVE_UNAVAILABLE := "Cloud accounts and online duels require a configured native Firebase SDK. Local progress is available."
var available := false
var initialized := false
var status := "Starting cloud service…"
var uid := ""
var account: Dictionary = {"uid":"", "authGeneration":0, "signedIn":false, "isAnonymous":true, "email":"", "displayName":"", "photoURL":"", "emailVerified":false, "providers":[]}
var security: Dictionary = {}
var duel_client_id := ""
var last_error: Dictionary = {}
var _next_id := 1
var _poll_seconds := 0.0
var _responses: Dictionary = {}
var _waiting: Dictionary = {}
var _native_adapter: Object
var _web_started := false

func _ready() -> void:
	if OS.has_feature("web"):
		_start_web()
	else:
		initialized = true
		status = NATIVE_UNAVAILABLE
		cloud_ready.emit(false)

func _start_web() -> void:
	for path in [ADAPTER_PATH, VENDOR_PATH + "firebase.js", VENDOR_PATH + "sync-core.js", VENDOR_PATH + "profile-rules-compat.js"]:
		if not FileAccess.file_exists(path):
			_fail_start("cloud/missing-module", "Packaged cloud resource is missing: " + path)
			return
	JavaScriptBridge.eval(FileAccess.get_file_as_string(ADAPTER_PATH), true)
	var adapter_present: Variant = JavaScriptBridge.eval("Boolean(globalThis.MXGodotCloudAdapter)", true)
	if not bool(adapter_present):
		_fail_start("cloud/adapter-unavailable", "Cloud platform adapter could not start. Local progress is available.")
		return
	var options := {
		"firebaseSource":FileAccess.get_file_as_string(VENDOR_PATH + "firebase.js"),
		"syncSource":FileAccess.get_file_as_string(VENDOR_PATH + "sync-core.js"),
		"rulesSource":FileAccess.get_file_as_string(VENDOR_PATH + "profile-rules-compat.js")
	}
	JavaScriptBridge.eval("globalThis.MXGodotCloudAdapter.start(%s);" % JSON.stringify(options), true)
	_web_started = true
	status = "Restoring cloud account…"
	set_process(true)

func _process(delta: float) -> void:
	if not OS.has_feature("web"):
		return
	_poll_seconds += delta
	if _poll_seconds < 0.1:
		return
	_poll_seconds = 0.0
	var raw: Variant = JavaScriptBridge.eval("globalThis.MXGodotCloudAdapter ? globalThis.MXGodotCloudAdapter.drain_events_json() : '[]'", true)
	var packets: Variant = JSON.parse_string(str(raw)) if raw != null else []
	if not packets is Array:
		return
	for packet in packets:
		if packet is Dictionary:
			_receive_packet(packet)

func _fail_start(code: String, message: String) -> void:
	available = false
	initialized = true
	status = message
	last_error = {"code":code, "message":message, "method":"bootstrap"}
	error.emit(last_error)
	cloud_ready.emit(false)

func _receive_packet(packet: Dictionary) -> void:
	var value: Variant = packet.get("data", {})
	match str(packet.get("type", "")):
		"ready":
			initialized = true
			if value is Dictionary:
				available = bool(value.get("available", false))
				uid = str(value.get("uid", ""))
				security = value.get("security", {}) if value.get("security", {}) is Dictionary else {}
				duel_client_id = str(value.get("duelClientId", ""))
				if value.get("account") is Dictionary:
					_update_account(value.account)
			status = _account_status() if available else "Cloud unavailable. Local progress is available."
			cloud_ready.emit(available)
		"account_changed":
			if value is Dictionary:
				_update_account(value)
		"error":
			last_error = value if value is Dictionary else {"code":"cloud/error", "message":str(value)}
			error.emit(last_error)
		"profiles":
			if value is Array:
				profiles_updated.emit(value)
		"room_updated":
			if value is Dictionary:
				room_updated.emit(str(value.get("key", "")), value.get("value"))
		"match_updated":
			if value is Dictionary:
				match_updated.emit(str(value.get("key", "")), value.get("value"))
		"profile_merged":
			if value is Dictionary:
				# Consumers verify profileId/accountUid before applying this patch.
				profile_merged.emit(value)
		"result":
			if value is Dictionary:
				_deliver_result(int(value.get("id", 0)), value)

func _update_account(value: Dictionary) -> void:
	account = value.duplicate(true)
	uid = str(account.get("uid", "")) if account.get("uid") != null else ""
	if available:
		status = _account_status()
	account_changed.emit(account.duplicate(true))

func _account_status() -> String:
	if not bool(account.get("signedIn", false)):
		return "Cloud account is not signed in."
	if bool(account.get("isAnonymous", true)):
		return "Guest cloud session. Connect Google, Apple, or email to sync your account."
	return "Connected: " + str(account.get("email", account.get("displayName", uid)))

## A host adapter must implement request(method:String, args:Array), returning a
## real result dictionary. Installing it never synthesizes account credentials.
func set_native_adapter(adapter: Object) -> bool:
	if adapter == null or not adapter.has_method("request"):
		return false
	_native_adapter = adapter
	available = true
	initialized = true
	status = "Native cloud adapter connected."
	cloud_ready.emit(true)
	return true

func receive_native_event(packet: Dictionary) -> void:
	_receive_packet(packet)

## Starts an asynchronous operation. Results include {ok,value} or {ok:false,error}.
## All method names and argument order follow the original MXCloud JavaScript API.
func invoke(method: String, args: Array = []) -> int:
	var request_id := _next_id
	_next_id += 1
	if OS.has_feature("web") and _web_started:
		JavaScriptBridge.eval("globalThis.MXGodotCloudAdapter && globalThis.MXGodotCloudAdapter.invoke(%d,%s,%s);" % [request_id, JSON.stringify(method), JSON.stringify(JSON.stringify(args))], true)
	elif OS.has_feature("web"):
		var details := {"code":"cloud/adapter-unavailable", "message":status, "method":method}
		_deliver_unavailable.call_deferred(request_id, method, details)
	elif _native_adapter != null:
		_execute_native.call_deferred(request_id, method, args.duplicate(true))
	else:
		var details := {"code":"cloud/native-sdk-unavailable", "message":NATIVE_UNAVAILABLE, "method":method}
		_deliver_unavailable.call_deferred(request_id, method, details)
	return request_id

func _execute_native(request_id: int, method: String, args: Array) -> void:
	var value: Variant = await _native_adapter.call("request", method, args)
	var result: Dictionary
	if value is Dictionary and value.has("ok"):
		result = value.duplicate(true)
	else:
		result = {"ok":false, "error":{"code":"cloud/invalid-native-result", "message":"Native cloud adapter did not return a confirmed result", "method":method}}
	result.id = request_id
	result.method = method
	if not bool(result.get("ok", false)):
		last_error = result.get("error", {})
		error.emit(last_error)
	_deliver_result(request_id, result)

func _deliver_unavailable(request_id: int, method: String, details: Dictionary) -> void:
	last_error = details
	error.emit(details)
	_deliver_result(request_id, {"id":request_id, "method":method, "ok":false, "error":details})

func _deliver_result(request_id: int, result: Dictionary) -> void:
	if _waiting.has(request_id):
		_responses[request_id] = result
	request_completed.emit(request_id, result)

func request(method: String, args: Array = []) -> Dictionary:
	var request_id := invoke(method, args)
	_waiting[request_id] = true
	while not _responses.has(request_id):
		await request_completed
	var result: Dictionary = _responses[request_id]
	_responses.erase(request_id)
	_waiting.erase(request_id)
	return result

func connect_google() -> int:
	return invoke("connectGoogle")

func connect_apple() -> int:
	return invoke("connectApple")

func register_email(email: String, password: String, display_name: String = "") -> int:
	return invoke("registerEmail", [email, password, display_name])

func sign_in_email(email: String, password: String) -> int:
	return invoke("signInEmail", [email, password])

func reset_password(email: String, language: String = "en") -> int:
	return invoke("resetPassword", [email, language])

func sign_out() -> int:
	return invoke("signOutToGuest")

func delete_account() -> int:
	return invoke("deleteAccountAndData")

func set_display_name(display_name: String) -> int:
	return invoke("setAuthDisplayName", [display_name])

func list_profiles() -> int:
	return invoke("listProfiles")

func load_profile(profile_id: String) -> int:
	return invoke("loadProfile", [profile_id])

func save_progress(profile: Dictionary, profile_id: String = "", immediate: bool = true) -> int:
	var identity := profile_id if not profile_id.is_empty() else str(profile.get("profileId", ""))
	return invoke("saveProgressNow" if immediate else "saveProgress", [profile.duplicate(true), identity])

func delete_profile(profile_id: String) -> int:
	return invoke("deleteCloudProfile", [profile_id])

func get_leaderboard(period: String = "world", count: int = 100, refresh: bool = false) -> int:
	var method := {"world":"getLeaderboard", "week":"getWeeklyLeaderboard", "month":"getMonthlyLeaderboard", "champions":"getChampions"}.get(period, "getLeaderboard") as String
	return invoke(method, [clampi(count, 1, 100), refresh] if period != "champions" else [clampi(count, 1, 100)])

func get_duel_leaderboard(period: String = "world", count: int = 100, refresh: bool = false, target_id: String = "") -> int:
	return invoke("getDuelLeaderboard", [period, clampi(count, 1, 100), refresh, target_id])

func create_duel_room(config: Dictionary) -> int:
	return invoke("createDuelRoom", [config])

func join_duel_room(code: String, player_name: String, style: Dictionary = {}, rounds: Array = []) -> int:
	return invoke("joinDuelRoom", [code, player_name, style, rounds])

func subscribe_room(code: String) -> int:
	return invoke("subscribeDuelRoom", [code])

func unsubscribe_room(code: String) -> int:
	return invoke("unsubscribeDuelRoom", [code])

func create_quick_match(player_name: String, style: Dictionary = {}) -> int:
	return invoke("createQuickMatchTicket", [player_name, style])

func subscribe_match(ticket_id: String) -> int:
	return invoke("subscribeQuickMatchTicket", [ticket_id])

func unsubscribe_match(ticket_id: String) -> int:
	return invoke("unsubscribeQuickMatchTicket", [ticket_id])

func try_quick_match(ticket_id: String, rounds: Array) -> int:
	return invoke("tryQuickMatch", [ticket_id, rounds])

func cancel_quick_match(ticket_id: String) -> int:
	return invoke("cancelQuickMatch", [ticket_id])

func leave_room(code: String) -> int:
	return invoke("leaveDuelRoom", [code])

func submit_duel_turn(code: String, expected_round: int, expected_turn: int, result: Dictionary) -> int:
	return invoke("submitDuelTurn", [code, expected_round, expected_turn, result])

func advance_duel_round(code: String, expected_round: int) -> int:
	return invoke("advanceDuelRound", [code, expected_round])

func rematch_room(code: String, rounds: Array) -> int:
	return invoke("rematchDuelRoom", [code, rounds])

func heartbeat_room(code: String) -> int:
	return invoke("heartbeatDuelRoom", [code])

func send_duel_message(code: String, message_key: String) -> int:
	return invoke("sendDuelQuickMessage", [code, message_key])

func _exit_tree() -> void:
	if OS.has_feature("web"):
		JavaScriptBridge.eval("globalThis.MXGodotCloudAdapter && globalThis.MXGodotCloudAdapter.dispose();", true)
