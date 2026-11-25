extends SceneTree

const Rules = preload("res://scripts/rules/molecule_rules.gd")
var rules: RefCounted = Rules.new()
var failures: int = 0
var checks: int = 0
var first_details: Array = []

func equivalent(a: Variant,b: Variant,path: String = "") -> String:
	if a is Dictionary and b is Dictionary:
		for key in a:
			if not b.has(key): return path+" missing expected key "+str(key)
		for key in b:
			if not a.has(key): return path+" missing actual key "+str(key)
			var diff: String = equivalent(a[key],b[key],path+"/"+str(key))
			if not diff.is_empty(): return diff
		return ""
	if a is Array and b is Array:
		if a.size() != b.size(): return path+" array length "+str(a.size())+" != "+str(b.size())
		for index in range(a.size()):
			var diff: String = equivalent(a[index],b[index],path+"/"+str(index))
			if not diff.is_empty(): return diff
		return ""
	if (a is int or a is float) and (b is int or b is float):
		return "" if float(a) == float(b) else path+" numeric "+str(a)+" != "+str(b)
	return "" if a == b else path+" "+str(a)+" != "+str(b)

func check(actual: Variant,expected: Variant,label: String) -> void:
	checks += 1
	var diff: String = equivalent(actual,expected)
	if diff.is_empty(): return
	failures += 1
	if first_details.size() < 20: first_details.append(label+": "+diff)

func _initialize() -> void:
	var path: String = "res://tests/fixtures/rules-oracle.json.gz"
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--fixtures="): path = arg.trim_prefix("--fixtures=")
	var file: FileAccess = FileAccess.open(path,FileAccess.READ)
	if file == null:
		push_error("Missing rules oracle fixtures: "+path)
		quit(2)
		return
	var source: String
	if path.ends_with(".gz"):
		source = file.get_buffer(file.get_length()).decompress_dynamic(128*1024*1024,FileAccess.COMPRESSION_GZIP).get_string_from_utf8()
	else:
		source = file.get_as_text()
	var parsed: Variant = JSON.parse_string(source)
	var fixtures: Array = parsed if parsed is Array else parsed.get("fixtures",[])
	for fixture in fixtures:
		var state: Dictionary = rules.setup(fixture.state)
		var target: String = str(fixture.get("targetKey",fixture.state.get("targetKey","")))
		if fixture.has("initialKey"): check(rules.state_key(state),fixture.initialKey,str(fixture.get("id",fixture.get("level","?")))+" initial key")
		for action in fixture.actions:
			var i: int = int(action.i)
			var d: int = int(action.d)
			var label: String = str(fixture.get("id",fixture.get("level","?")))+" action "+str(i)+","+str(d)+","+str(action.get("chamberIndex",0))
			if action.has("slide"): check(rules.slide_plan(state,i,d),action.slide,label+" slide")
			var actual: Variant = rules.apply_action(state,i,d,target,int(action.get("chamberIndex",0)))
			check(null if actual == null else rules.snapshot(actual),action.expected,label+" state")
			if action.has("expectedKey"): check(null if actual == null else rules.state_key(actual),action.expectedKey,label+" key")
		var route_state: Variant = state
		var step_index: int = 0
		for action in fixture.get("route",[]):
			if route_state == null: break
			route_state = rules.apply_action(route_state,int(action.i),int(action.d),target,int(action.get("chamberIndex",0)))
			check(null if route_state == null else rules.snapshot(route_state),action.expected,str(fixture.get("level","?"))+" route "+str(step_index))
			step_index += 1
		if not fixture.get("route",[]).is_empty(): check(route_state != null and rules.goal(route_state,target),true,str(fixture.get("level","?"))+" certified goal")
	print("Native rules oracle: ",checks," checks, ",failures," failures across ",fixtures.size()," fixtures")
	for detail in first_details: printerr(detail)
	quit(0 if failures == 0 else 1)
