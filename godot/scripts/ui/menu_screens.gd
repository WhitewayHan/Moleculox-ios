class_name MoleculoxMenus
extends Control

signal navigate(screen: String)
signal level_chosen(index: int)
signal mode_chosen(mode: String)
signal setting_changed(key: String, value: Variant)
signal profile_selected(profile_name: String)
signal story_continue
signal action(name: String, payload: Dictionary)
signal modal_opened
signal modal_closed

const UI := preload("res://scripts/ui/ui_theme.gd")
const Preview := preload("res://scripts/ui/molecule_preview.gd")
const LANGUAGES := {"en":"English","tr":"Türkçe","de":"Deutsch","es":"Español","pt":"Português","ja":"日本語","fr":"Français","zh":"简体中文","it":"Italiano","ko":"한국어","ru":"Русский"}

var current_screen := ""
var screen_data: Dictionary = {}
var _root: Control
var _background: TextureRect
var _shade: ColorRect
var _overlay_mode := false
var _notice: Label
var _modal: Control
var _cache: Dictionary = {}
var _build_generation := 0
var _collection_tab := "molecules"
var _lab_tab := "overview"
var _filter := "all"
var _search := ""
var _dialog_return := "splash"
var _screen_tween: Tween

func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	theme = UI.make_theme()
	_background = UI.image("assets/images/bg-default.webp")
	_background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_background.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	add_child(_background)
	_shade = ColorRect.new()
	_shade.color = Color(0.02,.025,.1,.2)
	_shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_shade)
	_root = Control.new()
	_root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(_root)
	_notice = UI.label("", 13, UI.AMBER)
	_notice.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	_notice.offset_left = 18
	_notice.offset_right = -18
	_notice.offset_top = -52
	_notice.offset_bottom = -15
	_notice.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_notice.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_notice)

func show_screen(screen: String, data: Dictionary = {}) -> void:
	if not is_node_ready():
		await ready
	_build_generation += 1
	if _screen_tween != null and _screen_tween.is_valid():
		_screen_tween.kill()
	_screen_tween = null
	current_screen = screen
	screen_data = data
	visible = true
	set_overlay_mode(false)
	_notice.text = ""
	_shade.color.a = .48 if bool(_save().get("highContrast",false)) else .2
	close_modal()
	for child in _root.get_children():
		child.queue_free()
	var tier := 0
	var thresholds := [20,40,60,80,100,120,140,301]
	for threshold in thresholds:
		if int(_save().get("cur",0)) >= threshold:
			tier += 1
	var sources := ["bg-default","tier-bg-1","tier-bg-2","tier-bg-3","tier-bg-4","tier-bg-1","tier-bg-2","tier-bg-3","tier-bg-4"]
	var background_path := str(screen_data.get("background","assets/images/%s.webp" % sources[tier]))
	_background.texture = _texture(background_path)
	match screen:
		"studio": _studio()
		"boot": _boot()
		"splash", "menu": _splash()
		"profiles": _profiles()
		"levels": _levels_screen()
		"collect", "collection", "encyclopedia": _collection(screen == "encyclopedia")
		"lab": _lab()
		"hof", "hall": _hall()
		"training": _training()
		"duel": _duel()
		"bonus": _bonus()
		"settings":
			_splash()
			open_settings()
		"account":
			_splash()
			open_account()
		_:
			_splash()

func refresh(data: Dictionary = {}) -> void:
	show_screen(current_screen,data if not data.is_empty() else screen_data)

func set_notice(message: String) -> void:
	_notice.text = UI.plain(message)

func close_modal() -> void:
	var was_open := is_instance_valid(_modal)
	if was_open:
		_modal.queue_free()
	_modal = null
	if was_open:
		modal_closed.emit()

func set_overlay_mode(enabled:bool) -> void:
	_overlay_mode = enabled
	if is_instance_valid(_root):
		_root.visible = not enabled
	if is_instance_valid(_background):
		_background.visible = not enabled
	if is_instance_valid(_shade):
		_shade.visible = not enabled


func _studio() -> void:
	_background.texture = null
	var dark := ColorRect.new()
	dark.color = Color("03050d")
	dark.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_root.add_child(dark)
	var logo := UI.image("assets/images/whiteway-studio-intro.webp")
	_place(logo, Rect2(.04,.13,.92,.6))
	_root.add_child(logo)
	var start := UI.button(_t("tapToStart", "TAP TO START"), func():
		action.emit("unlock_audio",{})
		navigate.emit("boot"), UI.CYAN)
	_place(start,Rect2(.15,.78,.7,.07))
	_root.add_child(start)
	var sound := UI.label(_t("soundOn","SOUND ON"),11,Color("b6bdce"))
	sound.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_place(sound,Rect2(.2,.87,.6,.04))
	_root.add_child(sound)

func _boot() -> void:
	_background.texture = _texture("assets/images/boot-splash.webp")
	var veil := ColorRect.new()
	veil.color = Color(0,0,.03,.97)
	veil.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_root.add_child(veil)
	var enter := UI.button(_t("tapTheScreen","TAP THE SCREEN"), func(): navigate.emit("splash"), UI.CYAN)
	_place(enter,Rect2(.18,.83,.64,.065))
	_root.add_child(enter)
	enter.disabled = true
	_screen_tween = create_tween()
	var reduced := bool(_save().get("reduceMotion",false))
	_screen_tween.tween_interval(0.0 if reduced else .35)
	_screen_tween.tween_property(veil,"color:a",0.0,.01 if reduced else 1.15)
	_screen_tween.tween_callback(func():
		if is_instance_valid(enter):
			enter.disabled = false)
	var copy := UI.label(_t("copyLine","© 2026 Orhan Akyol - wHiTeWaY studio · All Rights Reserved"),9)
	_place(copy,Rect2(.05,.95,.9,.035))
	copy.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_root.add_child(copy)

func _splash() -> void:
	var account := _small_button("user",func():open_account())
	_place(account,Rect2(.035,.025,.105,.055))
	_root.add_child(account)
	var coins := UI.label("◉  %d" % int(_save().get("coins",0)),17,UI.AMBER)
	coins.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_place(coins,Rect2(.37,.03,.26,.05))
	_root.add_child(coins)
	var gear := _small_button("settings",func():open_settings())
	_place(gear,Rect2(.86,.025,.105,.055))
	_root.add_child(gear)
	var heading := UI.label("DR. EDWARD ATOM'S LAB",12,Color("d5d2e9"))
	heading.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_place(heading,Rect2(.1,.12,.8,.04))
	_root.add_child(heading)
	var logo := UI.image("assets/images/moleculox-logo-r220.png")
	_place(logo,Rect2(.07,.16,.86,.14))
	_root.add_child(logo)
	var subtitle := UI.label(_t("logoSub","Push atoms · Build molecules · Save science!"),12)
	subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_place(subtitle,Rect2(.08,.3,.84,.045))
	_root.add_child(subtitle)
	var badge := UI.label("801 " + _t("experiments","EXPERIMENTS"),11,UI.CYAN)
	badge.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_place(badge,Rect2(.2,.35,.6,.035))
	_root.add_child(badge)
	var buttons := VBoxContainer.new()
	_place(buttons,Rect2(.22,.41,.56,.32))
	_root.add_child(buttons)
	var resume := UI.button(_t("continue","CONTINUE"),func():action.emit("continue",{}),Color("4cc879"))
	resume.disabled = int(_save().get("cur",0)) == 0 and not screen_data.get("can_continue",false)
	buttons.add_child(resume)
	buttons.add_child(UI.button(_t("newGameLabel","NEW GAME"),_new_game))
	buttons.add_child(UI.button(_t("todaysExpLabel","TODAY'S EXP."),func():mode_chosen.emit("daily"),UI.AMBER))
	buttons.add_child(UI.button(_t("levels","LEVELS"),func():navigate.emit("levels"),Color("538ce8")))
	buttons.add_child(UI.button(_t("myMolsLabel","MY MOLECULES"),func():navigate.emit("collect"),Color("6a6688")))
	var doctor := UI.image("assets/images/dr-edward-atom.png")
	_place(doctor,Rect2(.65,.74,.35,.25))
	_root.add_child(doctor)
	var docks := HBoxContainer.new()
	_place(docks,Rect2(.03,.85,.59,.085))
	_root.add_child(docks)
	docks.add_child(_dock("lab",_t("labShop","LAB\nSHOP"),func():navigate.emit("lab")))
	docks.add_child(_dock("molecule",_t("duel","VS · 2P"),func():navigate.emit("duel")))
	docks.add_child(_dock("awards",_t("hallOfFame","HALL"),func():navigate.emit("hof")))
	var learning := HBoxContainer.new()
	_place(learning,Rect2(.03,.76,.59,.075))
	_root.add_child(learning)
	learning.add_child(UI.button(_t("training","TRAINING"),func():navigate.emit("training"),Color("536786")))
	learning.add_child(UI.button("?",func():open_guide(),Color("536786")))
	var encyclopedia := _small_button("moleculopedia",func():navigate.emit("encyclopedia"))
	_place(encyclopedia,Rect2(.035,.42,.12,.07))
	_root.add_child(encyclopedia)
	var copy := UI.label(_t("copyLine","© 2026 Orhan Akyol - wHiTeWaY studio"),8,Color("c1bfd7"))
	_place(copy,Rect2(.04,.96,.65,.03))
	_root.add_child(copy)

func _profiles() -> void:
	var body := _page(_t("whosPlaying","WHO'S PLAYING?"))
	var names: Dictionary = screen_data.get("profiles",_profiles_data())
	for profile_name in names:
		var row := HBoxContainer.new()
		body.add_child(row)
		var data: Dictionary = names[profile_name] if names[profile_name] is Dictionary else {}
		row.add_child(UI.button("%s · %d / 801" % [str(profile_name),int(data.get("cur",0))],func():profile_selected.emit(str(profile_name)),UI.CYAN))
		var remove := UI.button("×",func():_confirm(_t("deleteProfile","Delete player?")+" "+str(profile_name),func():action.emit("delete_profile",{"name":str(profile_name)})),Color("b35a72"))
		remove.custom_minimum_size.x = 44
		remove.size_flags_horizontal = 0
		row.add_child(remove)
	if names.size() < 5:
		body.add_child(UI.button(_t("newPlayer","NEW PLAYER"),_create_profile,Color("50af7f")))
	body.add_child(UI.label(_t("profilesLocalNote","Each player keeps separate progress on this device."),12))

func _levels_screen() -> void:
	var body := _page(_t("levels","LEVELS"),false)
	var bonus := UI.button(_t("bonusLab","BONUS LAB"),func():navigate.emit("bonus"),UI.AMBER)
	body.add_child(bonus)
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	body.add_child(scroll)
	var grid := GridContainer.new()
	grid.columns = 5
	grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(grid)
	_build_levels(grid,_build_generation)

func _build_levels(grid: GridContainer, generation: int) -> void:
	var levels := _levels()
	var available := int(_save().get("cur",0))
	var stars: Dictionary = _save().get("stars",{})
	for i in levels.size():
		if generation != _build_generation or not is_instance_valid(grid):
			return
		var level: Dictionary = levels[i]
		var molecule := _molecule(str(level.get("m","")))
		var known := i <= available
		var caption := "%d\n%s\n%s" % [i+1,str(molecule.get("f","")) if known else "",_stars(int(stars.get(str(i),stars.get(i,0)))) if known else "🔒"]
		var card := UI.button(caption,func():level_chosen.emit(i),UI.CYAN if i == available else UI.VIOLET)
		card.custom_minimum_size = Vector2(70,78)
		card.disabled = not known
		card.add_theme_font_size_override("font_size",17 if bool(_save().get("largeText",false)) else 13)
		card.tooltip_text = "%s · %s" % [_t("level","Level {0}",[i+1]),str(molecule.get("n",""))]
		grid.add_child(card)
		if i % 40 == 39:
			await get_tree().process_frame

func _collection(encyclopedia: bool) -> void:
	var body := _page(_t("moleculopedia","MOLECULOPEDIA") if encyclopedia else _t("myMolecules","MY MOLECULES"),false)
	var tabs := _tab_bar(body)
	for entry in [["molecules","molecules","MOLECULES"],["elements","elements","ELEMENTS"],["achievements","achievements","AWARDS"],["diplomas","diplomas","DIPLOMAS"],["legends","scienceLegends","LEGENDS"]]:
		var tab := UI.button(_t(str(entry[1]),str(entry[2])),func():
			_collection_tab = str(entry[0])
			show_screen("encyclopedia" if encyclopedia else "collect",screen_data),UI.CYAN if _collection_tab == entry[0] else Color("5e5176"))
		tab.add_theme_font_size_override("font_size",10)
		tabs.add_child(tab)
	var search := LineEdit.new()
	search.placeholder_text = _t("searchMolecules","Search")
	search.text = _search
	body.add_child(search)
	search.text_submitted.connect(func(value:String):
		_search = value
		show_screen("encyclopedia" if encyclopedia else "collect",screen_data))
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	body.add_child(scroll)
	var list := VBoxContainer.new()
	list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(list)
	match _collection_tab:
		"elements": _element_cards(list,encyclopedia)
		"achievements": _achievement_cards(list)
		"diplomas": _diploma_cards(list)
		"legends": _legend_cards(list)
		_: _molecule_cards(list,encyclopedia,_build_generation)

func _molecule_cards(parent: VBoxContainer, all_known: bool, generation:int) -> void:
	var molecules := _molecules()
	var discovered: Dictionary = _save().get("disc",{})
	var favorites: Dictionary = _save().get("favoriteMolecules",{})
	var filters := HBoxContainer.new()
	parent.add_child(filters)
	for option in [["all",_t("all","ALL")],["discovered",_t("discovered","DISCOVERED")],["favorites",_t("favorites","FAVORITES")]]:
		filters.add_child(UI.button(str(option[1]),func():
			_filter = str(option[0])
			show_screen(current_screen,screen_data),UI.CYAN if option[0] == _filter else UI.VIOLET))
	var count := 0
	for key in molecules:
		if generation != _build_generation or not is_instance_valid(parent):
			return
		var item: Dictionary = molecules[key]
		var known := all_known or discovered.has(key)
		if _filter == "discovered" and not discovered.has(key):
			continue
		if _filter == "favorites" and not bool(favorites.get(key,false)):
			continue
		if not _search.is_empty() and not (str(item.get("n",""))+" "+str(item.get("f",""))).to_lower().contains(_search.to_lower()):
			continue
		var card := PanelContainer.new()
		parent.add_child(card)
		var row := HBoxContainer.new()
		card.add_child(row)
		var drawing := Preview.new()
		drawing.custom_minimum_size = Vector2(110,95)
		drawing.configure(item,_elements(),known)
		row.add_child(drawing)
		var copy := VBoxContainer.new()
		copy.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(copy)
		copy.add_child(UI.label(str(item.get("f","?")) if known else "?",20,UI.CYAN))
		copy.add_child(UI.label(str(item.get("n","")) if known else _t("undiscovered","UNDISCOVERED"),13))
		var detail := UI.button(_t("details","DETAILS"),func():open_molecule(str(key)))
		detail.disabled = not known
		copy.add_child(detail)
		count += 1
		if count % 20 == 0:
			await get_tree().process_frame

func _element_cards(parent:VBoxContainer, all_known:bool) -> void:
	var elements := _elements()
	var known := {}
	for molecule_id in _save().get("disc",{}):
		for cell in _molecule(str(molecule_id)).get("s",[]):
			known[str(cell[0])] = true
	for symbol in elements:
		var element: Dictionary = elements[symbol]
		var revealed := all_known or known.has(symbol)
		var name := _local(element.get("name",element.get("n",symbol)))
		var button := UI.button("%s · %s" % [str(symbol),name] if revealed else "%s · ?" % str(symbol),func():_element_detail(str(symbol),element),Color(str(element.get("c","#77cfff"))))
		button.disabled = not revealed
		parent.add_child(button)

func _achievement_cards(parent:VBoxContainer) -> void:
	var economy: Dictionary = _document("economy")
	var achievements: Array = economy.get("achievements",economy.get("ACHV",[]))
	var state: Dictionary = _save().get("achv",{})
	for item in achievements:
		if not item is Dictionary:
			continue
		var unlocked := bool(state.get(str(item.get("id","")),false))
		var panel := _card(parent,_t(str(item.get("name","")),_local(item.get("title",item.get("name","")))) + (" ✓" if unlocked else ""), _t(str(item.get("desc","")),_local(item.get("description",item.get("desc","")))))
		panel.modulate.a = 1.0 if unlocked else .55

func _diploma_cards(parent:VBoxContainer) -> void:
	var catalog: Dictionary = _document("catalog")
	var diplomas: Array = catalog.get("diplomas",[]).duplicate(true)
	var thresholds := [0,20,40,60,80,100,120,140,301]
	if diplomas.is_empty():
		for i in thresholds.size():
			diplomas.append({})
	for i in diplomas.size():
		diplomas[i]["level"] = int(diplomas[i].get("level",thresholds[mini(i,thresholds.size()-1)]))
		diplomas[i]["title"] = diplomas[i].get("title",_t("rank%d" % i,""))
		diplomas[i]["rank"] = i
	for item in diplomas:
		var unlocked := int(_save().get("cur",0)) >= int(item.get("level",0))
		var text := _local(item.get("title",item.get("name","")))
		var row := _card(parent,text,"%s / 801" % _t("level","Level {0}",[int(item.get("level",0))]))
		row.modulate.a = 1.0 if unlocked else .45
		if unlocked:
			row.add_child(UI.button(_t("viewCertificate","VIEW CERTIFICATE"),func():action.emit("certificate",item),UI.AMBER))

func _legend_cards(parent:VBoxContainer) -> void:
	var science: Dictionary = _document("science")
	var legends: Variant = science.get("legends",science.get("SCIENCE_LEGENDS",[]))
	if legends is Dictionary:
		legends = legends.get(_language(),legends.get("en",[]))
	for item in legends:
		if not item is Dictionary:
			continue
		var unlocked := bool(_save().get("scienceLegends",{}).get(str(item.get("id","")),false))
		var card := PanelContainer.new()
		parent.add_child(card)
		var row := HBoxContainer.new()
		card.add_child(row)
		var picture := UI.image("assets/images/science-legends/%s-thumb.webp" % str(item.get("art",item.get("id",""))),Vector2(85,100))
		picture.modulate.a = 1.0 if unlocked else .28
		row.add_child(picture)
		var copy := VBoxContainer.new()
		copy.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(copy)
		copy.add_child(UI.label(str(item.get("name","")),16,UI.AMBER))
		copy.add_child(UI.label(str(item.get("years",""))+" · "+_local(item.get("field","")),12))
		var detail := UI.button(_t("details","DETAILS"),func():open_legend(item))
		detail.disabled = not unlocked
		copy.add_child(detail)

func _lab() -> void:
	var body := _page(_t("labShop","LAB · SHOP"),false)
	var tabs := _tab_bar(body)
	for entry in [["overview","LAB"],["shop",_t("shop","SHOP")],["nobel",_t("nobelRace","NOBEL RACE")],["rewards",_t("rewards","REWARDS")]]:
		tabs.add_child(UI.button(str(entry[1]),func():
			_lab_tab = str(entry[0])
			show_screen("lab",screen_data),UI.CYAN if _lab_tab == entry[0] else UI.VIOLET))
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	body.add_child(scroll)
	var list := VBoxContainer.new()
	list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(list)
	var economy: Dictionary = _document("economy")
	match _lab_tab:
		"shop":
			for item in economy.get("labItems",economy.get("LAB_ITEMS",[])):
				_shop_card(list,item,false)
			for item in economy.get("boosterItems",economy.get("BOOSTER_ITEMS",[])):
				_shop_card(list,item,true)
		"nobel":
			_card(list,_t("nobelRace","NOBEL RACE"),_t("nobelRaceNote","Complete the 301st Nobel Final after the first 300 experiments to become a permanent Nobel Laureate."))
			list.add_child(UI.label("%d / 301 · %d RP" % [mini(301,int(_save().get("cur",0))),int(_save().get("researchPoints",0))],23,UI.AMBER))
			list.add_child(UI.button(_t("worldRankings","WORLD RANKINGS"),func():action.emit("rankings",{}),UI.CYAN))
			var rankings: Array = screen_data.get("rankings",[])
			for row in rankings:
				_card(list,str(row.get("playerName","")),str(row.get("researchPoints",0))+" RP")
		"rewards":
			var rewards: Array = screen_data.get("rewards",economy.get("duelRewards",[]))
			for reward in rewards:
				var panel := _card(list,_local(reward.get("name",reward.get("title",""))),_local(reward.get("desc","")))
				panel.add_child(UI.button(_t("claim","CLAIM"),func():action.emit("claim_reward",{"id":reward.get("id","")}),UI.AMBER))
			if rewards.is_empty():
				list.add_child(UI.label(_t("noRewards","No rewards are available to claim.")))
		_:
			var room := PanelContainer.new()
			room.custom_minimum_size.y = 190
			list.add_child(room)
			var row := HBoxContainer.new()
			room.add_child(row)
			row.add_child(UI.image("assets/images/dr-edward-atom.png",Vector2(120,170)))
			var copy := VBoxContainer.new()
			copy.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			row.add_child(copy)
			copy.add_child(UI.label(str(_save().get("playerName",_current_profile())),19,UI.AMBER))
			copy.add_child(UI.label("%d / 801\n%d RP\n%d MoleCoin" % [int(_save().get("cur",0)),int(_save().get("researchPoints",0)),int(_save().get("coins",0))],18))
			for item in economy.get("labItems",economy.get("LAB_ITEMS",[])):
				if bool(_save().get("achv",{}).get("lab_"+str(item.get("id","")),false)):
					copy.add_child(UI.label(_local(item.get("name","")),11,UI.CYAN))
			for mission in screen_data.get("missions",economy.get("missions",[])):
				var panel := _card(list,_local(mission.get("title",mission.get("name",""))),_local(mission.get("desc","")))
				panel.add_child(UI.label("%d / %d" % [int(mission.get("progress",0)),int(mission.get("target",0))],13,UI.CYAN))
				var claim := UI.button(_t("claim","CLAIM"),func():action.emit("claim_mission",{"id":mission.get("id","")}),UI.AMBER)
				claim.disabled = not bool(mission.get("ready",false))
				panel.add_child(claim)

func _shop_card(parent:VBoxContainer,item:Dictionary,consumable:bool) -> void:
	var owned := bool(_save().get("achv",{}).get("lab_"+str(item.get("id","")),false)) and not consumable
	var unlocked := int(_save().get("cur",0)) >= int(item.get("unlock",0))
	var panel := _card(parent,_local(item.get("name",item.get("title",""))),_local(item.get("desc","")))
	var price := int(item.get("price",0))
	var caption := _t("owned","OWNED") if owned else ("◉ %d" % price if unlocked else "%s %d" % [_t("unlockLevel","UNLOCKS AT LEVEL"),int(item.get("unlock",0))])
	var purchase := UI.button(caption,func():action.emit("purchase",{"id":item.get("id",""),"consumable":consumable}),UI.AMBER)
	purchase.disabled = owned or not unlocked or int(_save().get("coins",0)) < price
	panel.add_child(purchase)

func _hall() -> void:
	var body := _page(_t("hallOfFame","HALL OF FAME"))
	var save := _save()
	var stats := GridContainer.new()
	stats.columns = 3
	body.add_child(stats)
	for entry in [[str(save.get("researchPoints",0)),"RP"],[str(save.get("maxCoins",0)),_t("hofStatMaxCoins","MAX COINS")],[str(_best_time(save)),_t("hofStatBestTime","BEST TIME")]]:
		_card(stats,str(entry[0]),str(entry[1]))
	var completed := 0
	var perfect := 0
	for value in save.get("stars",{}).values():
		if int(value) > 0:
			completed += 1
		if int(value) == 3:
			perfect += 1
	_card(body,str(save.get("playerName",_current_profile())),"%d / 801 · %d ★★★ · %d %s" % [completed,perfect,save.get("disc",{}).size(),_t("molecules","MOLECULES")])
	body.add_child(UI.button(_t("worldRankings","WORLD RANKINGS"),func():action.emit("rankings",{}),UI.CYAN))
	var times: Dictionary = save.get("speedRuns",{})
	var speed_levels: Array = _document("catalog").get("speedrunLevels",[2,15,35,45,55,65])
	for level in speed_levels:
		var value: Variant = times.get(str(level),times.get(int(level),null))
		var caption := "%s · %s" % [_t("level","LEVEL {0}",[int(level)+1]),("%.1f s" % float(value)) if value != null else "—"]
		body.add_child(UI.button(caption,func():level_chosen.emit(int(level)),Color("5e6d93")))
	for row in screen_data.get("rankings",[]):
		_card(body,str(row.get("playerName","")),"%d RP" % int(row.get("researchPoints",0)))

func _training() -> void:
	var body := _page(_t("trainingCenter","TRAINING CENTER"))
	body.add_child(UI.button(_t("basicTraining","BASIC TRAINING"),func():mode_chosen.emit("tutorial"),Color("5cc38a")))
	body.add_child(UI.button(_t("atomsAndMechanics","ATOMS & MECHANICS"),func():_guide_catalog("mechanics")))
	body.add_child(UI.button(_t("supports","SUPPORTS"),func():_guide_catalog("supports")))
	body.add_child(UI.button(_t("labEquipment","LAB EQUIPMENT"),func():_guide_catalog("labs")))
	var progress: Dictionary = _save().get("researchAchievements",{})
	var learned := 0
	for key in progress:
		if str(key).begins_with("__training_learned_") and bool(progress[key]):
			learned += 1
	body.add_child(UI.label("%s: %d" % [_t("learned","LEARNED"),learned],16,UI.CYAN))

func _duel() -> void:
	var body := _page(_t("duelTitle","ATOM DUEL"))
	body.add_child(UI.label(_t("duelDescription","Two players · Three rounds · First to two wins"),17,UI.CYAN))
	body.add_child(UI.button(_t("samePhone","SAME DEVICE"),func():_local_duel_setup(),Color("5ac28b")))
	body.add_child(UI.button(_t("quickMatch","ONLINE QUICK MATCH"),func():action.emit("quick_match",{}),UI.AMBER))
	body.add_child(UI.button(_t("createRoom","CREATE FRIEND ROOM"),func():action.emit("create_room",{})))
	var room_code := LineEdit.new()
	room_code.placeholder_text = _t("roomCode","6-DIGIT ROOM CODE")
	room_code.max_length = 6
	body.add_child(room_code)
	body.add_child(UI.button(_t("joinRoom","JOIN ROOM"),func():action.emit("join_room",{"code":room_code.text}),UI.CYAN))
	body.add_child(UI.label(_local(screen_data.get("duel_status",_t("signInForDuel","Sign in to play online."))),13))
	body.add_child(UI.button(_t("howToPlay","HOW TO PLAY"),func():open_guide("duel"),Color("62677d")))

func _local_duel_setup() -> void:
	var box := _dialog(_t("samePhone","SAME DEVICE"))
	var first := LineEdit.new()
	first.text = str(_save().get("playerName",_current_profile()))
	first.placeholder_text = _t("playerOne","PLAYER 1")
	box.add_child(first)
	var second := LineEdit.new()
	second.placeholder_text = _t("playerTwo","PLAYER 2")
	box.add_child(second)
	var choice := OptionButton.new()
	for title in [_t("mixed","MIXED"),_t("classic","CLASSIC"),_t("crystal","CATALYST"),_t("chain","CHAIN"),_t("reactor","REACTOR")]:
		choice.add_item(title)
	box.add_child(choice)
	box.add_child(UI.button(_t("play","PLAY"),func():action.emit("local_duel",{"players":[first.text,second.text],"gameKind":["mixed","classic","crystal","chain","reactor"][choice.selected]}),Color("5ac28b")))

func _bonus() -> void:
	var body := _page(_t("bonusLab","BONUS LAB"))
	for entry in [["crystal",_t("catalystHunt","CATALYST HUNT"),"atom"],["chain",_t("chainReaction","CHAIN REACTION"),"linked_atoms"],["reactor",_t("classicReactor","CLASSIC REACTOR"),"fire_atom"]]:
		var button := UI.button(str(entry[1]),func():mode_chosen.emit(str(entry[0])),UI.CYAN)
		button.icon = _texture("assets/ui/moleculox-icons/%s.webp" % str(entry[2]))
		button.expand_icon = true
		button.add_theme_constant_override("icon_max_width",32)
		body.add_child(button)
	for mission in screen_data.get("bonusMissions",[]):
		var panel := _card(body,_local(mission.get("name","")),_local(mission.get("desc","")))
		panel.add_child(UI.button(_t("play","PLAY"),func():action.emit("bonus_mission",{"id":mission.get("id","")})))

func open_settings() -> void:
	_dialog_return = current_screen
	var box := _dialog(_t("settingsTitle","SETTINGS"))
	box.add_child(UI.button(_t("language","LANGUAGE")+" · "+str(LANGUAGES.get(_language(),"English")),open_languages,UI.CYAN))
	for entry in [["volM","master","MASTER"],["volMu","music","MUSIC"],["volS","sfx","SFX"],["volV","dialogue","DIALOGUE"]]:
		var row := HBoxContainer.new()
		box.add_child(row)
		row.add_child(UI.label(_t(str(entry[1]),str(entry[2])),13))
		var slider := HSlider.new()
		slider.min_value = 0.0
		slider.max_value = 1.0
		slider.step = .01
		slider.value = float(_save().get(entry[0],1.0))
		slider.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(slider)
		slider.value_changed.connect(func(value:float):setting_changed.emit(str(entry[0]),value))
		var mute_key: String = {"volM":"muM","volMu":"muMu","volS":"muS","volV":"muV"}[entry[0]]
		var mute := CheckButton.new()
		mute.text = "🔇"
		mute.button_pressed = bool(_save().get(mute_key,false))
		mute.toggled.connect(func(value:bool):setting_changed.emit(mute_key,value))
		row.add_child(mute)
	for entry in [["dpad","showDpad","DIRECTION BUTTONS"],["tutorialTips","tutorialTipsLabel","TUTORIAL TIPS"],["reduceMotion","reduceMotionLabel","REDUCE MOTION"],["duelEffects","duelEffectsLabel","DUEL EFFECTS"],["duelMessages","duelMessagesLabel","DUEL MESSAGES"],["haptics","hapticsLabel","HAPTICS"],["largeText","largeTextLabel","LARGE TEXT"],["colorBlind","colorBlindLabel","COLOR BLIND MODE"],["highContrast","highContrastLabel","HIGH CONTRAST"],["externalMusic","externalMusic","EXTERNAL MUSIC"]]:
		var toggle := CheckButton.new()
		toggle.text = _t(str(entry[1]),str(entry[2]))
		toggle.button_pressed = bool(_save().get(entry[0],entry[0] in ["tutorialTips","duelEffects","duelMessages","haptics"]))
		toggle.toggled.connect(func(value:bool):setting_changed.emit(str(entry[0]),value))
		box.add_child(toggle)
	_picker(box,_t("effectIntensityLabel","EFFECT INTENSITY"),"effectLevel",["low","normal","high"])
	_picker(box,_t("performanceModeLabel","PERFORMANCE MODE"),"performanceMode",["auto","low","high"])
	_picker(box,_t("frameRate","FRAME RATE"),"frameRate",["60","120"])
	box.add_child(UI.button(_t("musicListBtn","MUSIC LIST"),open_music_list))
	box.add_child(UI.button(_t("offlineDownload","DOWNLOAD OFFLINE PACK"),func():action.emit("offline_download",{})))
	for legal in [["privacy-policy.html","privacyLink","PRIVACY"],["terms-of-use.html","termsLink","TERMS"],["player-name-rules.html","nameRulesLink","PLAYER NAME RULES"]]:
		box.add_child(UI.button(_t(str(legal[1]),str(legal[2])),func():action.emit("open_legal",{"path":str(legal[0])}),Color("666981")))
	box.add_child(UI.button(_t("resetProgress","RESET PROGRESS"),func():_confirm(_t("wipeWarn","Reset progress for this player?"),func():action.emit("reset_progress",{})),Color("b55f74")))

func open_languages() -> void:
	var box := _dialog(_t("language","LANGUAGE"))
	for code in LANGUAGES:
		box.add_child(UI.button(str(LANGUAGES[code])+(" ✓" if code == _language() else ""),func():
			setting_changed.emit("lang",str(code))
			open_settings(),UI.CYAN if code == _language() else UI.VIOLET))

func open_music_list() -> void:
	var box := _dialog(_t("musicListBtn","MUSIC LIST"))
	var audio: Dictionary = _document("catalog").get("audio",{})
	var names: Array = audio.get("trackNames",audio.get("TRACK_NAMES",[]))
	if names.is_empty():
		names = ["Dr. Edward Atom's Lab","Bouncing Lab","Lab of Laughs","Atom Steps","Bubble Beat","Happy Formula","Neon Flask","Molecule Hop","Tiny Reactions","Clever Sparks","Puzzle Potion","Curious Atoms","Lab Parade","Fizzy Science","Quantum Bounce","Atomic Smile","Flask Dance","Bright Bonds","Eureka!","Science Shuffle","Proton Party","Cosmic Lab","Final Formula"]
	for i in names.size():
		box.add_child(UI.button("%02d  ▶  %s" % [i+1,str(names[i])],func():action.emit("music_track",{"index":i})))

func open_account() -> void:
	var box := _dialog(_t("accountPlayers","ACCOUNT & PLAYERS"))
	box.add_child(UI.label(str(_save().get("playerName",_current_profile())),18,UI.AMBER))
	box.add_child(UI.label(_local(screen_data.get("cloud_status",_cloud_status())),12,UI.CYAN))
	box.add_child(UI.button(_t("players","PLAYERS"),func():
		close_modal()
		navigate.emit("profiles")))
	box.add_child(UI.button(_t("signInGoogle","SIGN IN WITH GOOGLE"),func():action.emit("google_sign_in",{}),Color("638ac1")))
	if bool(screen_data.get("apple_available",false)):
		box.add_child(UI.button(_t("signInApple","SIGN IN WITH APPLE"),func():action.emit("apple_sign_in",{}),Color("626676")))
	var email := LineEdit.new()
	email.placeholder_text = _t("email","EMAIL")
	box.add_child(email)
	var password := LineEdit.new()
	password.placeholder_text = _t("password","PASSWORD")
	password.secret = true
	box.add_child(password)
	box.add_child(UI.button(_t("emailSignIn","EMAIL SIGN IN"),func():action.emit("email_sign_in",{"email":email.text,"password":password.text}),UI.CYAN))
	box.add_child(UI.button(_t("emailCreateAccount","CREATE EMAIL ACCOUNT"),func():action.emit("email_sign_up",{"email":email.text,"password":password.text})))
	box.add_child(UI.button(_t("forgotPassword","RESET PASSWORD"),func():action.emit("reset_password",{"email":email.text}),Color("626676")))
	box.add_child(UI.button(_t("cloudStatus","CLOUD & RANKING STATUS"),func():action.emit("cloud_status",{})))
	box.add_child(UI.button(_t("syncNow","SYNC NOW"),func():action.emit("sync_now",{}),Color("50af8c")))
	box.add_child(UI.button(_t("signOut","SIGN OUT"),func():_confirm(_t("signOut","SIGN OUT")+"?",func():action.emit("sign_out",{})),Color("a36d80")))

func open_molecule(identifier:String) -> void:
	var molecule := _molecule(identifier)
	var box := _dialog(str(molecule.get("f",identifier))+" · "+str(molecule.get("n","")))
	var drawing := Preview.new()
	drawing.custom_minimum_size.y = 190
	drawing.configure(molecule,_elements())
	box.add_child(drawing)
	var info: Variant = molecule.get("info",molecule.get("science",{}))
	if info is Dictionary:
		for key in ["category","name","formula","description","what","where","use","uses","fact","safety","geometry"]:
			var text := _local(info.get(key,""))
			if not text.is_empty():
				_card(box,key.capitalize(),text)
	elif info is String and not info.is_empty():
		box.add_child(UI.label(UI.plain(info),14))
	var fact := str(molecule.get("fa",molecule.get("fact","")))
	if not fact.is_empty():
		box.add_child(UI.label(UI.plain(fact),15,UI.CYAN))
	var favorite := bool(_save().get("favoriteMolecules",{}).get(identifier,false))
	box.add_child(UI.button((_t("removeFavorite","REMOVE FAVORITE") if favorite else _t("addFavorite","ADD FAVORITE")),func():action.emit("favorite_molecule",{"id":identifier,"favorite":not favorite}),UI.AMBER))
	box.add_child(UI.label(_t("moleculeModelNote","Moleculox uses a 2D puzzle model; real 3D molecular geometry may differ."),11))

func open_legend(item:Dictionary) -> void:
	var box := _dialog(str(item.get("name","")))
	var image := UI.image("assets/images/science-legends/%s.webp" % str(item.get("art",item.get("id",""))),Vector2(0,260))
	box.add_child(image)
	for key in ["years","field","bio","contribution","connection"]:
		var text := _local(item.get(key,""))
		if not text.is_empty():
			box.add_child(UI.label(text,14,UI.AMBER if key == "years" else UI.TEXT))
	var sources: Array = item.get("sources",[])
	if not sources.is_empty():
		box.add_child(UI.label(_t("sources","SOURCES")+": "+", ".join(sources),11))

func open_guide(section:String = "basic") -> void:
	if section == "duel":
		var guide: Dictionary = _document("catalog").get("guides",{})
		var text := _local(guide.get("duel",""))
		var box := _dialog(_t("howToPlay","HOW TO PLAY"))
		box.add_child(UI.label(text if not text.is_empty() else _t("duelRules","Three rounds. First to two round wins takes the match. Each round lasts 90 seconds. Hints and restart are disabled during Duel."),15))
	else:
		var guide: Dictionary = _document("catalog").get("guides",{})
		var box := _dialog(_t("howToPlay","HOW TO PLAY"))
		var text := _local(guide.get(section,guide.get("basic","")))
		box.add_child(UI.label(text if not text.is_empty() else _t("tutSlideMsg","Select an atom, then swipe in a direction. It slides until a wall or another atom stops it. Build the target molecule shown in the goal card."),16))
		box.add_child(UI.button(_t("trainingCenter","TRAINING CENTER"),func():
			close_modal()
			navigate.emit("training"),UI.CYAN))

func _guide_catalog(group:String) -> void:
	var box := _dialog({"mechanics":_t("atomsAndMechanics","ATOMS & MECHANICS"),"supports":_t("supports","SUPPORTS"),"labs":_t("labEquipment","LAB EQUIPMENT")}.get(group,group))
	var guides: Dictionary = _document("catalog").get("guides",{})
	var items: Variant = guides.get(group,[])
	if items is Dictionary:
		items = items.get(_language(),items.get("en",[]))
	if items is String:
		box.add_child(UI.label(UI.plain(items),14))
		return
	for item in items:
		if not item is Dictionary:
			continue
		var row := UI.button(_local(item.get("title",item.get("name",item.get("id","")))),func():_show_training_item(group,item),UI.CYAN)
		var unlock := int(item.get("unlock",0))
		var permitted := int(_save().get("cur",0)) >= maxi(0,unlock-(0 if group == "labs" else 1))
		if item.has("flag"):
			permitted = bool(_save().get(str(item.flag),false))
		row.disabled = not permitted
		box.add_child(row)
	if items.is_empty():
		box.add_child(UI.label(_t("noTrainingEntries","Training entries become available when their mechanics are introduced."),14))

func _show_training_item(group:String,item:Dictionary) -> void:
	var box := _dialog(_local(item.get("title",item.get("name",""))))
	box.add_child(UI.label(_local(item.get("desc",item.get("text",""))),16))
	if item.has("art"):
		box.add_child(UI.image(str(item.art),Vector2(0,170)))
	var demo: Dictionary = item.get("demo",{})
	if not demo.is_empty():
		box.add_child(UI.label("  ".join(demo.get("cells",[])),24,UI.CYAN))
		var result := UI.label("",15,UI.AMBER)
		box.add_child(result)
		var finish := UI.button(_t("continue","CONTINUE"),func():
			action.emit("training_learned",{"group":group.trim_suffix("s"),"id":item.get("id","")})
			close_modal(),Color("5cc38a"))
		finish.disabled = true
		box.add_child(UI.button(_local(demo.get("action",_t("tryExperiment","TRY EXPERIMENT"))),func():
			result.text = _local(demo.get("result",item.get("desc","")))
			finish.disabled = false,UI.CYAN))
		box.add_child(finish)
	else:
		box.add_child(UI.button(_t("continue","CONTINUE"),func():
			action.emit("training_learned",{"group":group.trim_suffix("s"),"id":item.get("id","")})
			close_modal(),UI.CYAN))

func _element_detail(symbol:String,element:Dictionary) -> void:
	var box := _dialog(symbol+" · "+_local(element.get("name",element.get("n",symbol))))
	for key in ["number","atomicNumber","description","fact","uses","safety"]:
		if element.has(key):
			box.add_child(UI.label(_local(element[key]),15))
	var example := {"s":[[symbol,0,0]]}
	var drawing := Preview.new()
	drawing.custom_minimum_size.y = 150
	drawing.configure(example,_elements())
	box.add_child(drawing)

func _create_profile() -> void:
	var box := _dialog(_t("newPlayer","NEW PLAYER"))
	var name_input := LineEdit.new()
	name_input.placeholder_text = _t("playerName","PLAYER NAME")
	name_input.max_length = 18
	box.add_child(name_input)
	var create := func():
		if name_input.text.strip_edges().is_empty():
			return
		action.emit("create_profile",{"name":name_input.text.strip_edges()})
	box.add_child(UI.button(_t("create","CREATE"),create,Color("4cc879")))
	name_input.text_submitted.connect(func(_value:String):create.call())
	name_input.grab_focus()

func _new_game() -> void:
	var box := _dialog(_t("newGameLabel","NEW GAME"))
	var name_input := LineEdit.new()
	name_input.placeholder_text = _t("playerName","PLAYER NAME")
	name_input.text = str(_save().get("playerName",_current_profile()))
	name_input.max_length = 18
	box.add_child(name_input)
	box.add_child(UI.label(_t("newGameNote","Choose a player for a new experiment."),13))
	box.add_child(UI.button(_t("play","PLAY"),func():
		if not name_input.text.strip_edges().is_empty():
			action.emit("new_game",{"name":name_input.text.strip_edges()}),Color("4cc879")))

func _picker(parent:VBoxContainer,title:String,key:String,options:Array) -> void:
	var row := HBoxContainer.new()
	parent.add_child(row)
	row.add_child(UI.label(title,13))
	var choice := OptionButton.new()
	var selected := str(_save().get(key,options[0]))
	for i in options.size():
		choice.add_item(str(options[i]).to_upper())
		if str(options[i]) == selected:
			choice.select(i)
	choice.item_selected.connect(func(index:int):setting_changed.emit(key,options[index]))
	row.add_child(choice)

func _tab_bar(parent:VBoxContainer) -> HBoxContainer:
	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size.y = 52
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO
	scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	parent.add_child(scroll)
	var tabs := HBoxContainer.new()
	tabs.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(tabs)
	return tabs

func _page(title:String,scrolled:bool = true) -> VBoxContainer:
	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.offset_left = 16
	margin.offset_right = -16
	margin.offset_top = 18
	margin.offset_bottom = -55
	_root.add_child(margin)
	var page := VBoxContainer.new()
	page.add_theme_constant_override("separation",12)
	margin.add_child(page)
	var head := HBoxContainer.new()
	page.add_child(head)
	var back := _small_button("home",func():navigate.emit("splash"))
	back.custom_minimum_size = Vector2(45,44)
	head.add_child(back)
	var label := UI.label(title,19,UI.CYAN)
	label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	head.add_child(label)
	var coins := UI.label("◉ %d" % int(_save().get("coins",0)),14,UI.AMBER)
	coins.size_flags_horizontal = 0
	coins.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	head.add_child(coins)
	if not scrolled:
		return page
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	page.add_child(scroll)
	var body := VBoxContainer.new()
	body.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	body.add_theme_constant_override("separation",12)
	scroll.add_child(body)
	return body

func _card(parent:Node,title:String,text:String) -> VBoxContainer:
	var panel := PanelContainer.new()
	panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	parent.add_child(panel)
	var body := VBoxContainer.new()
	panel.add_child(body)
	body.add_child(UI.label(UI.plain(title),17,UI.CYAN))
	if not text.is_empty():
		body.add_child(UI.label(UI.plain(text),13))
	return body

func _dialog(title:String) -> VBoxContainer:
	close_modal()
	if not visible:
		set_overlay_mode(true)
	visible = true
	_modal = Control.new()
	_modal.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_modal.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(_modal)
	var shade := ColorRect.new()
	shade.color = Color(0,0,.04,.78)
	shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_modal.add_child(shade)
	var panel := PanelContainer.new()
	_place(panel,Rect2(.055,.07,.89,.86))
	_modal.add_child(panel)
	modal_opened.emit()
	var outer := VBoxContainer.new()
	panel.add_child(outer)
	var head := HBoxContainer.new()
	outer.add_child(head)
	head.add_child(UI.label(title,18,UI.AMBER))
	var close := UI.button("×",close_modal)
	close.custom_minimum_size = Vector2(42,42)
	close.size_flags_horizontal = 0
	head.add_child(close)
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	outer.add_child(scroll)
	var body := VBoxContainer.new()
	body.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	body.add_theme_constant_override("separation",10)
	scroll.add_child(body)
	return body

func _confirm(question:String,callback:Callable) -> void:
	var box := _dialog(_t("areYouSure","ARE YOU SURE?"))
	box.add_child(UI.label(question,16))
	box.add_child(UI.button(_t("yes","YES"),func():
		close_modal()
		callback.call(),Color("b45e78")))
	box.add_child(UI.button(_t("cancel","CANCEL"),close_modal,UI.CYAN))

func _small_button(icon:String,callback:Callable) -> Button:
	var button := UI.button("",callback,Color("66718c"))
	button.size_flags_horizontal = 0
	button.custom_minimum_size = Vector2(44,44)
	button.icon = _texture("assets/ui/moleculox-icons/%s.webp" % icon)
	button.expand_icon = true
	button.add_theme_constant_override("icon_max_width",28)
	if button.icon == null:
		button.text = "‹" if icon == "home" else "⚙" if icon == "settings" else "●"
	return button

func _dock(icon:String,text:String,callback:Callable) -> Button:
	var button := UI.button(text,callback,Color("62518b"))
	button.icon = _texture("assets/ui/moleculox-icons/%s.webp" % icon)
	button.expand_icon = true
	button.add_theme_constant_override("icon_max_width",27)
	button.add_theme_font_size_override("font_size",10)
	return button

func _place(control:Control,rect:Rect2) -> void:
	control.anchor_left = rect.position.x
	control.anchor_top = rect.position.y
	control.anchor_right = rect.end.x
	control.anchor_bottom = rect.end.y
	control.offset_left = 0
	control.offset_top = 0
	control.offset_right = 0
	control.offset_bottom = 0

func _document(name:String) -> Dictionary:
	if _cache.has(name):
		return _cache[name]
	var catalog := get_node_or_null("/root/Catalog")
	var parsed: Variant = null
	if catalog != null and catalog.has_method("load_json"):
		parsed = catalog.call("load_json",name)
	if parsed == null:
		var source := "res://data/%s.json" % name
		if FileAccess.file_exists(source):
			parsed = JSON.parse_string(FileAccess.get_file_as_string(source))
	var result: Dictionary = parsed if parsed is Dictionary else {"items":parsed} if parsed is Array else {}
	_cache[name] = result
	return result

func _levels() -> Array:
	if screen_data.get("levels") is Array:
		return screen_data.levels
	var catalog := get_node_or_null("/root/Catalog")
	if catalog != null and catalog.get("levels") is Array:
		return catalog.get("levels")
	var data := _document("levels")
	return data.get("campaign",data.get("levels",data.get("items",[])))

func _molecules() -> Dictionary:
	var data := _document("molecules")
	var by_language: Dictionary = data.get("byLang",data.get("languages",data.get("byLanguage",data)))
	var values: Variant = by_language.get(_language(),by_language.get("en",{}))
	return values if values is Dictionary else {}

func _molecule(identifier:String) -> Dictionary:
	var catalog := get_node_or_null("/root/Catalog")
	if catalog != null and catalog.has_method("get_molecule"):
		return catalog.call("get_molecule",identifier,_language())
	return _molecules().get(identifier,{})

func _elements() -> Dictionary:
	var catalog := _document("catalog")
	var result: Dictionary = catalog.get("elements",catalog.get("EL",{})).duplicate(true)
	var by_lang: Dictionary = catalog.get("elementInfo",{})
	var info: Dictionary = by_lang.get(_language(),by_lang.get("en",{}))
	for symbol in result:
		if info.get(symbol) is Dictionary:
			result[symbol].merge(info[symbol],true)
			result[symbol]["atomicNumber"] = "Z = %d" % int(info[symbol].get("z",0))
			result[symbol]["fact"] = info[symbol].get("fa","")
	return result

func _save() -> Dictionary:
	if screen_data.get("save") is Dictionary:
		return screen_data.save
	var progress := get_node_or_null("/root/Progress")
	if progress != null and progress.get("save") is Dictionary:
		return progress.get("save")
	return {}

func _profiles_data() -> Dictionary:
	var progress := get_node_or_null("/root/Progress")
	if progress != null and progress.get("profiles") is Dictionary:
		return progress.get("profiles")
	return {}

func _current_profile() -> String:
	var progress := get_node_or_null("/root/Progress")
	return str(progress.get("current_name")) if progress != null else "Player 1"

func _language() -> String:
	return str(_save().get("lang","en"))

func _local(value:Variant) -> String:
	if value is Dictionary:
		return UI.plain(value.get(_language(),value.get("en",value.get("tr",""))))
	return UI.plain(value)

func _t(key:String,fallback:String = "",params:Array = []) -> String:
	var catalog := get_node_or_null("/root/Catalog")
	if catalog != null and catalog.has_method("text"):
		var translated := str(catalog.call("text",key,params))
		if translated != key and not translated.is_empty():
			return UI.plain(translated)
	return fallback if not fallback.is_empty() else key

func _texture(path:String) -> Texture2D:
	return UI.texture(path)

func _stars(count:int) -> String:
	return "★".repeat(clampi(count,0,3))+"☆".repeat(3-clampi(count,0,3))

func _best_time(save:Dictionary) -> String:
	var values: Array = save.get("speedRuns",{}).values()
	if values.is_empty():
		return "—"
	var best := INF
	for value in values:
		best = minf(best,float(value))
	return "%.1f s" % best

func _cloud_status() -> String:
	var cloud := get_node_or_null("/root/Cloud")
	if cloud != null:
		for property in cloud.get_property_list():
			if property.name == "status":
				return str(cloud.get("status"))
	return _t("guestAccount","GUEST · LOCAL PROGRESS")

func _unhandled_key_input(event:InputEvent) -> void:
	if not visible:
		return
	if event.is_action_pressed("ui_cancel") and event.is_pressed():
		if is_instance_valid(_modal):
			close_modal()
		elif current_screen not in ["studio","boot","splash","menu"]:
			navigate.emit("splash")
		get_viewport().set_input_as_handled()
