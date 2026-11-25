extends SceneTree

const Director = preload("res://scripts/ui/audio_director.gd")
class ControlledDirector extends "res://scripts/ui/audio_director.gd":
	var clock_ms: float = 50000.0
	var random_at: int = 0
	func _now_ms() -> float:
		return clock_ms
	func _random_unit() -> float:
		var value: float = float((random_at * 73 + 19) % 997) / 997.0
		random_at += 1
		return value

var failures: int = 0
var checks: int = 0

func _initialize() -> void:
	call_deferred("_run")

func _check(condition: bool, message: String) -> void:
	checks += 1
	if not condition:
		failures += 1
		push_error(message)

func _run() -> void:
	var catalog: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/catalog.json"))
	var data: Dictionary = catalog.audio
	var oracle: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/audio_fidelity_oracle.json"))
	var shuffled := ControlledDirector.new()
	shuffled.shuffle_state_path = ""
	root.add_child(shuffled)
	shuffled.configure(catalog,{"lang":"en"})
	for fixture in oracle.cases:
		var bank: Array[String] = shuffled.semantic_voice_bank(fixture.event,fixture.lang)
		_check(bank == fixture.bank,"Semantic bank differs from original JS: " + fixture.lang + "/" + fixture.event)
		for cue in bank:
			_check(is_equal_approx(shuffled.voice_cue_gain(cue,fixture.lang),float(fixture.gains[cue])),"Measured cue gain differs: " + fixture.lang + "/" + cue)
		for expected in fixture.choices:
			_check(shuffled._shuffled_voice_name(fixture.event,bank,fixture.lang) == expected,"Voice bag differs from original JS: " + fixture.lang + "/" + fixture.event)
	shuffled.queue_free()

	var music_audio := ControlledDirector.new()
	music_audio.shuffle_state_path = ""
	root.add_child(music_audio)
	music_audio.configure(catalog,{"lang":"en","externalMusic":true})
	music_audio.set_mode("menu")
	music_audio.unlock()
	for index in range(oracle.music.size()):
		if index == 49: music_audio.play_track(7)
		if index > 0: music_audio.next_track()
		_check(music_audio.current_track == int(oracle.music[index]),"Music shuffle differs from original JS at step " + str(index))
		_check(is_equal_approx(music_audio.current_music_trim(),float(data.musicTrackTrim[music_audio.current_track])),"Track mastering trim differs")
		_check(is_equal_approx(music_audio.music.volume_linear,0.8 * float(data.musicTrackTrim[music_audio.current_track])),"Track trim missing from music volume")
	_check(music_audio.settings.externalMusic == false,"Retired externalMusic preference must not silence the game")
	music_audio.music.stop()
	music_audio.queue_free()

	var audio := ControlledDirector.new()
	audio.shuffle_state_path = ""
	root.add_child(audio)
	audio.configure(catalog,{"lang":"en"})
	audio.unlock()
	_check(not audio.voice_event("menuFirst"),"Unlock must not leak a voice on the studio screen")
	audio.set_mode("boot")
	_check(not audio.speak("dre-01-welcome-back.mp3"),"Boot must remain speech-free")
	audio.set_mode("menu")
	audio.schedule_menu_voice("menuFirst",1)
	_check(not audio._speech_armed,"Speech must wait for the visible menu to settle")
	await _wait_ms(460)
	_check(audio._speech_armed and not audio._active_voice.is_empty(),"Settled menu must arm and start the greeting")
	_check(audio._active_voice.get("event") == "menuFirst","First greeting must use menuFirst semantic bank")
	audio.stop_voice()

	var cue_count: int = 0
	for language in data.voicePacks:
		audio.apply_settings({"lang":language})
		var pack: Dictionary = data.voicePacks[language]
		var stream: AudioStream = audio._load_audio(pack.url)
		_check(stream != null,"Native voice sprite must load: " + language)
		if stream == null: continue
		_check(pack.sprite.size() == 44,"Every language must retain the exact 44 verified cue segments")
		for cue in pack.sprite:
			var segment: Dictionary = pack.sprite[cue]
			_check(float(segment.start) >= 0 and float(segment.duration) > 0 and float(segment.start) + float(segment.duration) <= stream.get_length() + 0.06,"Cue outside its actual native MP3: " + language + "/" + cue)
			cue_count += 1
		_check(audio.voice_event("ready"),"Native ready event must play in " + language)
		var cue: String = audio._active_voice.get("name","")
		_check(cue in audio.semantic_voice_bank("ready",language),"Native playback must select a verified semantic cue")
		_check(audio.voice.stream == stream,"Native event must use the selected language's actual MP3")
		_check(is_equal_approx(audio._voice_timer.wait_time,float(pack.sprite[cue].duration)),"Voice must stop at the original sprite segment duration")
		_check(is_equal_approx(audio.voice.volume_linear,audio.voice_cue_gain(cue,language)),"Measured per-cue gain missing from voice playback")
		audio.stop_voice()
	_check(cue_count == 484,"All 11 x 44 original voice segments must be checked")
	audio.apply_settings({"lang":"xx"})
	_check(audio.semantic_voice_bank("ready").is_empty() and not audio.voice_event("ready"),"Unknown language must stay silent instead of borrowing English cues")

	audio.apply_settings({"lang":"en"})
	audio.voice_event("ready")
	var active: String = audio._active_voice.name
	for event in ["hint","lastMove","clear1","clear2","clear3"]: audio.voice_event(event)
	_check(audio._active_voice.name == active,"New professor reactions must never cut off the active line")
	_check(audio._voice_queue.size() == 3,"Pending professor queue must retain only three fresh items")
	_check(audio._voice_queue[0].event == "clear1" and audio._voice_queue[2].event == "clear3","Full queue must discard its oldest pending item")
	_check(is_equal_approx(float(audio._voice_queue[0].expiresAt),audio.clock_ms + 7000.0),"Default queue lifetime must be 7000 ms")
	_check(not audio.voice_event("goodMove"),"Good-move reactions must obey the global 4200 ms cooldown")
	audio.clock_ms += 4200.0
	_check(audio.voice_event("goodMove"),"Good-move reaction must become available after 4200 ms")
	_check(is_equal_approx(float(audio._voice_queue.back().expiresAt),audio.clock_ms + 3500.0),"Original maxDelay 2600 coerces to 3500 ms")
	audio.stop_voice()
	audio.voice_event("ready")
	audio.voice_event("hint")
	audio._finish_voice()
	_check(audio._active_voice.is_empty() and audio._voice_queue.size() == 1,"Finished line must leave a 120 ms inter-line pause")
	await _wait_ms(50)
	_check(audio._active_voice.is_empty(),"Queued speech must not begin before the inter-line pause")
	await _wait_ms(90)
	_check(audio._active_voice.get("event") == "hint","Queued speech must resume after the original inter-line pause")
	audio.stop_voice()

	audio.voice_event("ready")
	active = audio._active_voice.name
	audio.voice_event("menuHome")
	audio.set_mode("game")
	_check(audio._active_voice.name == active and audio._voice_queue.is_empty(),"Leaving menu must remove queued greetings while preserving active speech")
	audio.voice_event("hint")
	audio.clock_ms += 8000.0
	audio._finish_voice()
	audio._drain_voice_queue()
	_check(audio._active_voice.is_empty() and audio._voice_queue.is_empty(),"Expired queued reactions must never play later")

	audio.voice_event("ready")
	await _wait_ms(40)
	var remaining: float = audio._voice_timer.time_left
	var track: int = audio.current_track
	active = audio._active_voice.name
	audio.suspend_audio()
	await _wait_ms(80)
	_check(audio.voice.stream_paused and audio._voice_timer.paused,"Interruption must pause both native voice and its cutoff timer")
	_check(absf(audio._voice_timer.time_left - remaining) < 0.005,"Paused speech must retain its full remaining segment")
	audio.resume_audio()
	_check(not audio.voice.stream_paused and not audio._voice_timer.paused and audio._active_voice.name == active,"Resume must continue the same spoken cue")
	_check(audio.current_track == track,"Interruption recovery must preserve the same music track")
	audio.pause_music(true)
	audio.suspend_audio()
	audio.resume_audio()
	_check(audio.music.stream_paused,"Recovery must preserve an intentional music pause")
	audio.stop_voice()

	audio.apply_settings({"lang":"en","volM":0.5,"volMu":0.6,"volS":0.4,"volV":0.7})
	_check(is_equal_approx(audio.effects[0].volume_linear,0.2),"Captured SFX must not receive the .75 output attenuation a second time")
	_check(audio.effects[0].bus == &"Master" and audio.voice.bus == Director.OUTPUT_BUS,"Only raw music/voice/startup use the original master output bus")
	var bus: int = AudioServer.get_bus_index(Director.OUTPUT_BUS)
	_check(is_equal_approx(db_to_linear(AudioServer.get_bus_volume_db(bus)),0.75),"Native raw-audio output gain must be the original .75")
	var compressor: AudioEffectCompressor = AudioServer.get_bus_effect(bus,0)
	_check(is_equal_approx(compressor.threshold,-8.0) and is_equal_approx(compressor.ratio,20.0) and is_equal_approx(compressor.attack_us,3000.0) and is_equal_approx(compressor.release_ms,160.0),"Native master compressor must preserve original settings")
	audio.duck_music(0.58,120)
	_check(is_equal_approx(audio._music_duck,0.58),"Music duck must apply immediately")
	await _wait_ms(140)
	_check(is_equal_approx(audio._music_duck,1.0),"Transient music duck must restore after its duration")
	audio.apply_settings({"lang":"en","muM":true})
	_check(audio.music.volume_linear == 0 and audio.voice.volume_linear == 0 and audio.effects[0].volume_linear == 0,"Master mute must produce actual digital silence")
	_check(not audio.voice_event("ready") and not audio.play_effect("click"),"Master mute must reject new speech and effects")
	audio.apply_settings({"lang":"en"})
	for event in data.sfx:
		for player in audio.effects: player.stop()
		_check(audio.play_effect(event),"Native captured SFX must load and play: " + event)
	_check(audio.effect_variant_key("slide",{"distance":5}) == "5","Distance-aware slide variant key")
	_check(audio.effect_variant_key("atomLand",{"distance":3,"bonded":true,"element":"H","otherElement":"O","kind":"atom"}) == "3|true|H|O|atom","Element-aware landing variant key")
	_check(audio.effect_variant_key("star",{"index":2}) == "2" and audio.effect_variant_key("rewardSeal",{"stars":3}) == "3","Star/reward variants must retain their original parameters")
	_check(audio.effect_variant_key("signature",{"seed":19,"tone":"minor"}) == "1|minor","Signature tone must retain original seed root and interval recipe")
	audio.music.stop()
	audio.queue_free()
	print("Audio fidelity: ",checks," checks; 165 JS semantic banks, 2277 JS voice-bag decisions, 57 JS music decisions, 484 native MP3 segments; ",failures," failures")
	quit(1 if failures else 0)

func _wait_ms(milliseconds: int) -> void:
	var until: int = Time.get_ticks_msec() + milliseconds
	while Time.get_ticks_msec() < until:
		await process_frame
