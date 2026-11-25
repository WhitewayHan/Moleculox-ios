extends SceneTree

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var catalog: Node = root.get_node("Catalog")
	var board := MoleculoxBoard.new()
	root.add_child(board)
	board.size = Vector2(390,570)
	var rules := MoleculeRules.new()
	var rendered := 0
	var motions := 0
	for index in catalog.levels.size():
		var snapshot: Dictionary = catalog.get_snapshot(index)
		var level: Dictionary = catalog.levels[index].duplicate(true)
		level["_index"] = index
		var molecule: Dictionary = catalog.get_molecule(str(level.m))
		board.set_state(snapshot,level,molecule)
		await process_frame
		await process_frame
		rendered += 1
		var path: Array = level.get("fs",[])
		if not path.is_empty():
			var before: Dictionary = rules.setup(snapshot)
			var step: Array = path[0]
			var after: Variant = rules.apply_action(before,int(step[0]),int(step[1]),str(snapshot.targetKey),int(step[2]) if step.size()>2 else 0)
			if after is Dictionary:
				board.animate_action(snapshot,rules.snapshot(after),{"i":int(step[0]),"d":int(step[1])})
				board._animate_progress(.35)
				board._animate_progress(.8)
				board._animate_progress(1.0)
				await process_frame
				board.stop_animation()
				motions += 1
	for mode in ["classic","crystal","chain","reactor"]:
		var entries: Array = catalog.mode_data.get("modes",{}).get(mode,[])
		for index in entries.size():
			if not entries[index] is Dictionary:continue
			var level: Dictionary = catalog.levels[index].duplicate(true)
			level["_index"] = index
			board.set_state(entries[index].initial,level,catalog.get_molecule(str(level.m)))
			await process_frame
			rendered += 1
	board.queue_free()
	await process_frame
	print("ALL BOARDS: %d source/mode boards drawn; %d first-motion paths; PASS" % [rendered,motions])
	quit(0)
