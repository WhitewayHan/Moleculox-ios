extends SceneTree

func _initialize() -> void:
	call_deferred("run")

func run() -> void:
	var script = load("res://scripts/services/cloud_bridge.gd")
	assert(script != null)
	var cloud = script.new()
	root.add_child(cloud)
	await process_frame
	assert(cloud.initialized)
	assert(not cloud.available)
	assert(cloud.account.isAnonymous)
	assert(not cloud.account.signedIn)
	var failure: Dictionary = await cloud.request("connectGoogle")
	assert(not failure.ok)
	assert(failure.error.code == "cloud/native-sdk-unavailable")
	assert(cloud.uid.is_empty())
	var calls: Array = []
	cloud.request_completed.connect(func(id, result): calls.append([id, result]))
	var request_id: int = cloud.create_duel_room({"rounds":[]})
	await process_frame
	assert(calls.size() == 1)
	assert(calls[0][0] == request_id)
	assert(not calls[0][1].ok)
	assert(not cloud.set_native_adapter(null))
	cloud.queue_free()
	print("CLOUD_NATIVE_TESTS_OK")
	quit(0)
