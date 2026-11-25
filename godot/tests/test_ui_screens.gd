extends SceneTree

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var menus_script: Script = load("res://scripts/ui/menu_screens.gd")
	assert(menus_script != null and menus_script.can_instantiate(), "Native menu script must compile")
	var menus: Control = menus_script.new()
	root.add_child(menus)
	await process_frame
	menus.size = Vector2(480,900)
	var screen_names := ["studio","boot","splash","profiles","levels","collect","lab","hof","training","duel","bonus"]
	for screen_name in screen_names:
		menus.call("show_screen",screen_name,{"save":{"cur":0,"coins":0,"lang":"en","stars":{},"disc":{},"achv":{}}})
		await process_frame
		assert(menus.get("current_screen") == screen_name)
	var selected_levels: Array = []
	menus.connect("level_chosen",func(index:int):selected_levels.append(index))
	var fixture_levels: Array = []
	for index in 801:
		fixture_levels.append({"m":"H2","p":3})
	menus.call("show_screen","levels",{"levels":fixture_levels,"save":{"cur":800,"lang":"en","stars":{"0":3}}})
	for frame in 24:
		await process_frame
	var grids := _find_nodes(menus,"GridContainer")
	assert(grids.size() == 1 and grids[0].get_child_count() == 801,"All 801 native level buttons must be built")
	grids[0].get_child(800).emit_signal("pressed")
	grids[0].get_child(0).emit_signal("pressed")
	assert(selected_levels == [800,0],"Level callbacks must retain each original level index")
	menus.call("show_screen","levels",{"levels":fixture_levels,"save":{"cur":0,"lang":"en","stars":{}}})
	for frame in 24:
		await process_frame
	grids = _find_nodes(menus,"GridContainer")
	assert(not grids[0].get_child(0).disabled and grids[0].get_child(1).disabled,"New player unlock boundary must stay at original first level")
	var selected_profiles: Array = []
	menus.connect("profile_selected",func(value:String):selected_profiles.append(value))
	menus.call("show_screen","profiles",{"profiles":{"Ada":{"cur":10},"Bert":{"cur":2}},"save":{"cur":0,"lang":"en"}})
	await process_frame
	for button in _find_nodes(menus,"Button"):
		if button.text.begins_with("Ada ·") or button.text.begins_with("Bert ·"):
			button.emit_signal("pressed")
	assert(selected_profiles == ["Ada","Bert"],"Profile callbacks must keep their player identity")
	var changed_settings: Array = []
	menus.connect("setting_changed",func(key:String,value:Variant):changed_settings.append([key,value]))
	menus.call("open_settings")
	await process_frame
	var sliders := _find_nodes(menus,"HSlider")
	assert(sliders.size() == 4,"Original master/music/SFX/dialogue controls must exist")
	sliders[0].value = .31
	sliders[3].value = .62
	assert(changed_settings[0][0] == "volM" and changed_settings[1][0] == "volV","Audio sliders must change their own setting")
	menus.call("close_modal")
	menus.call("open_account")
	await process_frame
	menus.call("close_modal")
	var story_script: Script = load("res://scripts/ui/story_view.gd")
	assert(story_script != null and story_script.can_instantiate(), "Native story script must compile")
	var story: Control = story_script.new()
	root.add_child(story)
	await process_frame
	story.call("show_story",[{"title":"Chapter 1","text":"Original story text","speaker":"drE","img":"assets/images/dr-edward-atom.png"}],0)
	await process_frame
	assert(story.visible)
	story.call("next")
	assert(not story.visible)
	var audio_script: Script = load("res://scripts/ui/audio_director.gd")
	assert(audio_script != null and audio_script.can_instantiate(), "Native audio director must compile")
	var audio: Node = audio_script.new()
	root.add_child(audio)
	await process_frame
	audio.call("configure",{"audio":{"tracks":["assets/audio/1dr.mp3"],"trackNames":["Dr. Edward Atom's Lab"]}},{"muM":true})
	assert(audio.call("track_name",0) == "Dr. Edward Atom's Lab")
	assert(audio.call("play_track",0) == false, "Audio must wait for a real unlock")
	print("PASS native Godot menus, story navigation and audio construction")
	quit(0)


func _find_nodes(parent:Node,type:String) -> Array:
	var result: Array = []
	for child in parent.get_children():
		if child.is_class(type):
			result.append(child)
		result.append_array(_find_nodes(child,type))
	return result
