class_name MoleculoxAudioDirector
extends Node

signal track_changed(index: int, title: String)
signal voice_started(cue: String)
signal voice_finished

# Music/voices are shipped raw; SFX WAVs already contain the original master
# compressor and .75 output gain from the OfflineAudioContext export.
const OUTPUT_BUS: StringName = &"MoleculoxMusicVoice"
const MUSIC_TRACK_TRIM: Array[float] = [0.57544,0.65313,0.65313,0.63096,0.5559,0.59566,0.67608,0.6166,0.63826,0.63096,0.63096,0.63096,0.71614,0.6166,0.57544,0.5821,0.54954,0.63826,0.59566,0.53088,0.52481,0.56885,0.62373]
const MENU_EVENTS: Array[String] = ["menuFirst","menuReturn","menuHome","menu"]
const SFX_COOLDOWN: Dictionary = {"click":65,"back":90,"select":80,"slide":48,"atomLand":52,"wallTap":70,"portalWarp":120,"portalExit":120,"barrierBuild":160,"movingWall":140,"thunk":110,"wallBreak":240,"undo":110,"hint":180,"coin":85,"sparkle":130,"chainPulse":150,"rewardSeal":500,"moleculeComplete":700,"studioIdent":900,"bulbTick":150}

var settings: Dictionary = {}
var catalog: Dictionary = {}
var current_track: int = -1
var mode: String = "studio"
var armed: bool = false
var music := AudioStreamPlayer.new()
var voice := AudioStreamPlayer.new()
var startup := AudioStreamPlayer.new()
var effects: Array[AudioStreamPlayer] = []
var shuffle_state_path: String = "user://music_shuffle_v1.json"
var rng := RandomNumberGenerator.new()
var _startup_played: bool = false
var _voice_timer: Timer
var _queue_timer: Timer
var _duck_timer: Timer
var _menu_timer: Timer
var _shuffle: Array[int] = []
var _music_last: int = -1
var _shuffle_signature: String = ""
var _shuffle_loaded: bool = false
var _voice_generation: int = 0
var _voice_queue: Array[Dictionary] = []
var _voice_bags: Dictionary = {}
var _active_voice: Dictionary = {}
var _last_voice_name: String = ""
var _last_voice_at: float = 0.0
var _menu_voice_last_at: float = -1e9
var _pending_menu_event: String = ""
var _speech_armed: bool = false
var _music_duck: float = 1.0
var _cue_gain: float = 1.0
var _effect_times: Dictionary = {}
var _stream_cache: Dictionary = {}
var _application_suspended: bool = false
var _manual_music_paused: bool = false
var _music_was_playing_before_suspend: bool = false
var _voice_was_playing_before_suspend: bool = false
var _music_resume_position: float = 0.0
var _voice_resume_position: float = 0.0
var _voice_deadline_ms: float = 0.0
var _queue_deadline_ms: float = 0.0
var _suspended_at_ms: float = 0.0

func _ready() -> void:
	rng.randomize()
	_setup_output_bus()
	for player in [music,voice,startup]:
		add_child(player)
		player.bus = OUTPUT_BUS
	music.finished.connect(_on_music_finished)
	voice.finished.connect(_finish_voice)
	_voice_timer = _timer(_on_voice_cutoff)
	_queue_timer = _timer(_on_queue_timeout)
	_duck_timer = _timer(_release_music_duck)
	_menu_timer = _timer(_play_pending_menu_voice)
	for index in range(8):
		var player := AudioStreamPlayer.new()
		add_child(player)
		effects.append(player)
	apply_settings(settings)

func _timer(callback: Callable) -> Timer:
	var timer := Timer.new()
	timer.one_shot = true
	add_child(timer)
	timer.timeout.connect(callback)
	return timer

func _audio() -> Dictionary:
	return catalog.get("audio", catalog)

func configure(data: Dictionary, preferences: Dictionary = {}) -> void:
	catalog = data
	_load_music_shuffle()
	if is_inside_tree(): _setup_output_bus()
	apply_settings(preferences)

func unlock() -> void:
	armed = true
	if mode in ["menu","game"] and not music.playing and not _manual_music_paused and not _application_suspended:
		if current_track >= 0: play_track(current_track)
		else: next_track()
	_drain_voice_queue()

func apply_settings(preferences: Dictionary) -> void:
	var previous_language: String = str(settings.get("lang", "en"))
	settings = preferences.duplicate(true)
	# This setting was retired by syncExternalMusicMode in the shipped game.
	settings.externalMusic = false
	if not is_inside_tree(): return
	if previous_language != str(settings.get("lang", "en")): stop_voice()
	_apply_volumes()

func _apply_volumes() -> void:
	var master: float = 0.0 if bool(settings.get("muM",false)) else clampf(float(settings.get("volM",1.0)),0.0,1.0)
	var music_level: float = 0.0 if bool(settings.get("muMu",false)) else clampf(float(settings.get("volMu",0.8)),0.0,1.0)
	var voice_level: float = 0.0 if bool(settings.get("muV",false)) else clampf(float(settings.get("volV",1.0)),0.0,1.0)
	var effects_level: float = 0.0 if bool(settings.get("muS",false)) else clampf(float(settings.get("volS",1.0)),0.0,1.0)
	music.volume_db = _db(master * music_level * current_music_trim() * _music_duck)
	voice.volume_db = _db(master * voice_level * _cue_gain)
	startup.volume_db = _db(master * effects_level)
	for player in effects: player.volume_db = _db(master * effects_level)

func _setup_output_bus() -> void:
	var index: int = AudioServer.get_bus_index(OUTPUT_BUS)
	if index < 0:
		AudioServer.add_bus()
		index = AudioServer.bus_count - 1
		AudioServer.set_bus_name(index, OUTPUT_BUS)
		AudioServer.set_bus_send(index, &"Master")
		var compressor := AudioEffectCompressor.new()
		compressor.threshold = -8.0
		compressor.ratio = 20.0
		compressor.attack_us = 3000.0
		compressor.release_ms = 160.0
		AudioServer.add_bus_effect(index, compressor)
	var output_gain: float = float(_audio().get("masterOutputGain", _audio().get("outputGain",0.75)))
	AudioServer.set_bus_volume_db(index, _db(clampf(output_gain,0.0,1.0)))

func current_music_trim() -> float:
	var trims: Array = _audio().get("musicTrackTrim", MUSIC_TRACK_TRIM)
	if trims.is_empty(): return 1.0
	return clampf(float(trims[clampi(current_track,0,trims.size()-1)]),0.0,1.0)

func set_mode(value: String) -> void:
	mode = value
	if value != "menu": cancel_pending_menu_voice()
	if value in ["studio","boot"]:
		music.stop()
		stop_voice()
	elif armed and not music.playing and not _manual_music_paused and not _application_suspended:
		if current_track >= 0: play_track(current_track)
		else: next_track()

func play_startup() -> bool:
	if not armed or _startup_played or bool(settings.get("muM",false)): return false
	var stream: AudioStream = _load_audio("assets/audio/startup-lab.mp3")
	if stream == null: return false
	_startup_played = true
	startup.stream = stream
	startup.play()
	return true

func tracks() -> Array:
	var audio: Dictionary = _audio()
	var result: Array = audio.get("tracks", audio.get("TRACKS", []))
	if result.is_empty():
		result = []
		for index in range(1,24): result.append("assets/audio/%ddr.mp3" % index)
	return result

func track_name(index: int) -> String:
	var audio: Dictionary = _audio()
	var names: Array = audio.get("trackNames", audio.get("TRACK_NAMES", []))
	return str(names[index]) if index >= 0 and index < names.size() else "Track %d" % (index + 1)

func play_track(index: int) -> bool:
	var list: Array = tracks()
	if not armed or index < 0 or index >= list.size(): return false
	var stream: AudioStream = _load_audio(str(list[index]))
	if stream == null: return false
	var same_track: bool = current_track == index and music.stream == stream
	var previous_position: float = music.get_playback_position() if same_track else 0.0
	current_track = index
	_music_last = index
	_shuffle.erase(index)
	_save_music_shuffle()
	_apply_volumes()
	if not same_track or not music.playing:
		music.stream = stream
		music.play(previous_position)
	music.stream_paused = _manual_music_paused or _application_suspended
	track_changed.emit(index,track_name(index))
	return true

func next_track() -> void:
	var count: int = tracks().size()
	if count == 0: return
	if _shuffle.is_empty():
		for index in range(count): _shuffle.append(index)
		_shuffle_array(_shuffle)
		var previous_track: int = current_track if current_track >= 0 else _music_last
		if _shuffle.size() > 1 and _shuffle[0] == previous_track:
			var other: int = 1 + floori(_random_unit() * (_shuffle.size() - 1))
			var previous: int = _shuffle[0]
			_shuffle[0] = _shuffle[other]
			_shuffle[other] = previous
	play_track(_shuffle.pop_front())

func _load_music_shuffle() -> void:
	var signature: String = "|".join(tracks())
	if _shuffle_loaded and signature == _shuffle_signature: return
	_shuffle_loaded = true
	_shuffle_signature = signature
	_shuffle.clear()
	if shuffle_state_path.is_empty() or not FileAccess.file_exists(shuffle_state_path): return
	var state: Variant = JSON.parse_string(FileAccess.get_file_as_string(shuffle_state_path))
	if not state is Dictionary or state.get("signature","") != signature or not state.get("remaining") is Array: return
	var clean: Array[int] = []
	for value in state.remaining:
		var index: int = int(value)
		if float(value) != index or index < 0 or index >= tracks().size() or clean.has(index): return
		clean.append(index)
	_shuffle = clean
	var last: int = int(state.get("last",-1))
	if last >= 0 and last < tracks().size(): _music_last = last

func _save_music_shuffle() -> void:
	if shuffle_state_path.is_empty(): return
	var file := FileAccess.open(shuffle_state_path,FileAccess.WRITE)
	if file != null: file.store_string(JSON.stringify({"signature":"|".join(tracks()),"remaining":_shuffle,"last":_music_last}))

func pause_music(paused: bool = true) -> void:
	_manual_music_paused = paused
	music.stream_paused = paused or _application_suspended

func duck_music(level: float = 0.58, duration_ms: int = 850) -> void:
	_music_duck = clampf(level,0.0,1.0)
	_apply_volumes()
	if is_instance_valid(_duck_timer): _duck_timer.start(maxf(0.12,float(duration_ms if duration_ms else 850)/1000.0))

func _release_music_duck() -> void:
	_music_duck = 1.0
	_apply_volumes()

# Optional variants are original OfflineAudioContext exports keyed by the exact
# original function parameters. Existing one-argument calls retain their WAV.
func play_effect(event: String, parameters: Dictionary = {}) -> bool:
	if not armed or bool(settings.get("muM",false)) or bool(settings.get("muS",false)): return false
	var now_ms: float = _now_ms()
	var gap: float = float(SFX_COOLDOWN.get(event,0))
	if gap > 0 and float(_effect_times.get(event,0.0)) + gap > now_ms: return false
	var audio: Dictionary = _audio()
	var recipes: Dictionary = audio.get("sfx",{})
	var resource: String = str(recipes.get(event,"assets/audio/sfx/%s.wav" % event))
	var variants: Dictionary = audio.get("sfxVariants",{}).get(event,{})
	var key: String = effect_variant_key(event,parameters)
	if variants.has(key): resource = str(variants[key])
	var stream: AudioStream = _load_audio(resource)
	if stream == null: return false
	for player in effects:
		if not player.playing:
			_effect_times[event] = now_ms
			player.stream = stream
			player.play()
			return true
	return false

func play_signature(recipe: Dictionary) -> bool:
	if settings.get("effects",true) == false: return false
	return play_effect("signature",recipe)

func effect_variant_key(event: String, parameters: Dictionary = {}) -> String:
	match event:
		"signature": return str(int(parameters.get("seed",0)) % 9) + "|" + str(parameters.get("tone","rise"))
		"slide": return str(maxi(1,int(parameters.get("distance",1))))
		"star": return str(int(parameters.get("index",0)))
		"chainPulse": return str(clampi(int(parameters.get("combo",2)),2,4))
		"rewardSeal": return "3" if int(parameters.get("stars",1)) >= 3 else "1"
		"bulbTick": return "true" if bool(parameters.get("strong",false)) else "false"
		"atomLand": return "%d|%s|%s|%s|%s" % [maxi(1,int(parameters.get("distance",1))),str(bool(parameters.get("bonded",false))).to_lower(),str(parameters.get("element","")),str(parameters.get("otherElement","")),str(parameters.get("kind","free"))]
	return "default"

func semantic_voice_bank(event: String, language: String = "") -> Array[String]:
	if language.is_empty(): language = str(settings.get("lang","en"))
	var audio: Dictionary = _audio()
	var packs: Dictionary = audio.get("voicePacks",audio.get("VOICE_PACKS",{}))
	var pack: Dictionary = packs.get(language,{})
	var sprite: Dictionary = pack.get("sprite",{})
	var events: Dictionary = audio.get("voiceEvents",{}).get(language,{})
	var result: Array[String] = []
	for cue in events.get(event,[]):
		if sprite.has(str(cue)): result.append(str(cue))
	return result

func voice_cue_gain(cue: String, language: String = "") -> float:
	if language.is_empty(): language = str(settings.get("lang","en"))
	var gains: Dictionary = _audio().get("voiceCueGain",{}).get(language,{})
	return clampf(float(gains.get(cue,1.22 if cue.begins_with("dre-tr-") else 1.0)),0.7,3.15)

func voice_event(event: String, options: Dictionary = {}, language: String = "") -> bool:
	if language.is_empty(): language = str(settings.get("lang","en"))
	if not _voice_enabled(language): return false
	var files: Array[String] = semantic_voice_bank(event,language)
	if files.is_empty(): return false
	var opts: Dictionary = _voice_event_defaults(event)
	opts.merge(options,true)
	var now_ms: float = _now_ms()
	var cooldown: float = float(opts.get("cooldown",1800))
	if cooldown == 0: cooldown = 1800.0
	cooldown = maxf(900.0,cooldown)
	if not bool(opts.get("force",false)) and now_ms - _last_voice_at < cooldown: return false
	_last_voice_at = now_ms
	var max_delay: float = float(opts.get("maxDelay",7000))
	if max_delay == 0: max_delay = 7000.0
	var item: Dictionary = {"character":"drE","event":event,"name":_shuffled_voice_name(event,files,language),"language":language,"duck":clampf(float(opts.get("duck",0.32)),0.0,1.0),"expiresAt":now_ms + maxf(3500.0,max_delay)}
	_enqueue_voice(item)
	return true

func _voice_event_defaults(event: String) -> Dictionary:
	if event in MENU_EVENTS: return {"force":true,"duck":0.26,"cooldown":0,"maxDelay":2600}
	if event == "ready": return {"force":true,"duck":0.38,"cooldown":0}
	if event == "goodMove": return {"duck":0.27,"cooldown":4200,"maxDelay":2600}
	if event.begins_with("clear"): return {"force":true,"duck":0.28,"cooldown":0}
	if event == "nobelIntro": return {"force":true,"duck":0.24,"cooldown":0}
	if event in ["hint","lastMove"]: return {"force":true,"duck":0.30,"cooldown":0}
	return {}

func _shuffled_voice_name(event: String, files: Array[String], language: String) -> String:
	var key: String = language + ":drE:" + event
	var bag: Array = _voice_bags.get(key,[])
	if bag.is_empty():
		bag = files.duplicate()
		_shuffle_array(bag)
		if bag.size() > 1 and bag.back() == _last_voice_name:
			var first: Variant = bag[0]
			bag[0] = bag.back()
			bag[bag.size()-1] = first
	var cue: String = str(bag.pop_back())
	_voice_bags[key] = bag
	_last_voice_name = cue
	return cue

func _shuffle_array(array: Array) -> void:
	for index in range(array.size()-1,0,-1):
		var other: int = floori(_random_unit() * (index + 1))
		var value: Variant = array[index]
		array[index] = array[other]
		array[other] = value

func _random_unit() -> float:
	return minf(0.9999999999999999,rng.randf())

func _now_ms() -> float:
	return float(Time.get_ticks_msec())

# Legacy raw-cue entry point also queues, so an explicit story cue never cuts a
# professor line in half. Only shipped sprite filenames can be requested.
func speak(cue: String, language: String = "") -> bool:
	if language.is_empty(): language = str(settings.get("lang","en"))
	if not _voice_enabled(language): return false
	var pack: Dictionary = _audio().get("voicePacks",_audio().get("VOICE_PACKS",{})).get(language,{})
	if not pack.get("sprite",{}).has(cue): return false
	_enqueue_voice({"character":"drE","event":"raw","name":cue,"language":language,"duck":0.32,"expiresAt":_now_ms()+7000.0})
	return true

func _voice_enabled(language: String) -> bool:
	var pack: Dictionary = _audio().get("voicePacks",_audio().get("VOICE_PACKS",{})).get(language,{})
	return armed and _speech_armed and mode not in ["studio","boot"] and not str(pack.get("url","")).is_empty() and not bool(settings.get("muM",false)) and not bool(settings.get("muV",false)) and float(settings.get("volM",1.0)) > 0 and float(settings.get("volV",1.0)) > 0

func _enqueue_voice(item: Dictionary) -> void:
	if _voice_queue.size() >= 3: _voice_queue.pop_front()
	_voice_queue.append(item)
	_drain_voice_queue()

func _drain_voice_queue() -> void:
	if not is_inside_tree() or not _active_voice.is_empty() or _voice_queue.is_empty() or _application_suspended: return
	var item: Dictionary = {}
	while not _voice_queue.is_empty() and item.is_empty():
		var candidate: Dictionary = _voice_queue.pop_front()
		if float(candidate.expiresAt) > _now_ms(): item = candidate
	if item.is_empty(): return
	var language: String = str(item.language)
	if not _voice_enabled(language):
		if not _voice_queue.is_empty(): _queue_after(0.08)
		return
	var pack: Dictionary = _audio().get("voicePacks",_audio().get("VOICE_PACKS",{})).get(language,{})
	var sprite: Dictionary = pack.get("sprite",{})
	var segment: Variant = sprite.get(str(item.name))
	var stream: AudioStream = _load_audio(str(pack.get("url","")))
	if segment == null or stream == null:
		if not _voice_queue.is_empty(): _queue_after(0.001)
		return
	var start: float = float(segment.get("start",0.0)) if segment is Dictionary else float(segment[0])
	var duration: float = float(segment.get("duration",0.0)) if segment is Dictionary else float(segment[1])
	if duration <= 0: return
	_active_voice = item
	_cue_gain = voice_cue_gain(str(item.name),language)
	_music_duck = clampf(float(item.get("duck",0.34)),0.0,1.0)
	_apply_volumes()
	voice.stream = stream
	voice.play(maxf(0.0,start))
	_voice_deadline_ms = float(Time.get_ticks_msec()) + duration * 1000.0
	_voice_timer.start(duration)
	voice_started.emit(str(item.name))

func _on_voice_cutoff() -> void:
	if _active_voice.is_empty(): return
	var remaining: float = _voice_deadline_ms - float(Time.get_ticks_msec())
	if remaining > 1.0:
		_voice_timer.start(remaining / 1000.0)
		return
	_finish_voice()

func _queue_after(seconds: float) -> void:
	_queue_deadline_ms = float(Time.get_ticks_msec()) + seconds * 1000.0
	_queue_timer.start(seconds)

func _on_queue_timeout() -> void:
	var remaining: float = _queue_deadline_ms - float(Time.get_ticks_msec())
	if remaining > 1.0:
		_queue_timer.start(remaining / 1000.0)
		return
	_drain_voice_queue()

func _finish_voice() -> void:
	var was_active: bool = not _active_voice.is_empty()
	_clear_active_voice()
	_cue_gain = 1.0
	_music_duck = 1.0
	_apply_volumes()
	if was_active: voice_finished.emit()
	if not _voice_queue.is_empty() and is_instance_valid(_queue_timer): _queue_after(0.12)

func _clear_active_voice() -> void:
	_voice_generation += 1
	if is_instance_valid(_voice_timer): _voice_timer.stop()
	voice.stop()
	_active_voice.clear()

func stop_voice() -> void:
	_voice_queue.clear()
	if is_instance_valid(_queue_timer): _queue_timer.stop()
	_finish_voice()

func schedule_menu_voice(event: String = "menuFirst", delay_ms: int = 620) -> void:
	cancel_pending_menu_voice()
	if event not in MENU_EVENTS: return
	_pending_menu_event = event
	if is_instance_valid(_menu_timer): _menu_timer.start(maxf(0.42,float(delay_ms if delay_ms else 620)/1000.0))

func cancel_pending_menu_voice() -> void:
	_pending_menu_event = ""
	if is_instance_valid(_menu_timer): _menu_timer.stop()
	for index in range(_voice_queue.size()-1,-1,-1):
		if str(_voice_queue[index].event) in MENU_EVENTS: _voice_queue.remove_at(index)

func _play_pending_menu_voice() -> void:
	var event: String = _pending_menu_event
	_pending_menu_event = ""
	if event.is_empty() or mode != "menu" or _application_suspended or _now_ms() - _menu_voice_last_at < 2600.0: return
	_speech_armed = true
	if voice_event(event): _menu_voice_last_at = _now_ms()

func _on_music_finished() -> void:
	if armed and mode in ["menu","game"]: next_track()

func _notification(what: int) -> void:
	if what == NOTIFICATION_APPLICATION_PAUSED: suspend_audio()
	elif what == NOTIFICATION_APPLICATION_RESUMED: resume_audio()

func suspend_audio() -> void:
	if _application_suspended: return
	_application_suspended = true
	_suspended_at_ms = float(Time.get_ticks_msec())
	_music_was_playing_before_suspend = music.playing
	_voice_was_playing_before_suspend = voice.playing
	_music_resume_position = music.get_playback_position()
	_voice_resume_position = voice.get_playback_position()
	music.stream_paused = true
	voice.stream_paused = true
	startup.stream_paused = true
	if is_instance_valid(_voice_timer): _voice_timer.paused = true
	if is_instance_valid(_queue_timer): _queue_timer.paused = true
	for player in effects: player.stream_paused = true

func resume_audio() -> void:
	if not _application_suspended: return
	_application_suspended = false
	if not _active_voice.is_empty(): _voice_deadline_ms += float(Time.get_ticks_msec()) - _suspended_at_ms
	music.stream_paused = _manual_music_paused
	voice.stream_paused = false
	startup.stream_paused = false
	for player in effects: player.stream_paused = false
	if is_instance_valid(_voice_timer): _voice_timer.paused = false
	if is_instance_valid(_queue_timer): _queue_timer.paused = false
	# Native drivers may discard their playback handles across an interruption.
	# Restore those handles at their old offsets, never choose a new track/cue.
	if _music_was_playing_before_suspend and not music.playing and music.stream != null and not _manual_music_paused and mode in ["menu","game"]: music.play(_music_resume_position)
	if _voice_was_playing_before_suspend and not voice.playing and not _active_voice.is_empty() and voice.stream != null: voice.play(_voice_resume_position)
	_apply_volumes()
	_drain_voice_queue()

func _load_audio(path: String) -> AudioStream:
	var resource: String = path.get_slice("?",0)
	if not resource.begins_with("res://"): resource = "res://" + resource.trim_prefix("./").trim_prefix("/")
	if _stream_cache.has(resource): return _stream_cache[resource]
	if resource == "res://" or not ResourceLoader.exists(resource): return null
	var stream: AudioStream = load(resource)
	if stream != null: _stream_cache[resource] = stream
	return stream

func _db(value: float) -> float:
	return linear_to_db(maxf(0.0,value))
