extends SceneTree
## Offline conformance checks. Uses a disposable in-memory profile; never calls
## cloud services, account providers or the real Progress persistence methods.
const Service := preload("res://scripts/services/economy.gd")

class MemoryProgress extends Node:
	var save: Dictionary = {"profileId":"economy_test", "playerName":"Test", "cur":801, "coins":20000, "maxCoins":20000, "economySchema":1, "scienceLegendSchema":5, "researchPoints":0, "researchAchievements":{"__coinEarned":20000,"__coinSpent":0}, "achv":{}, "stars":{}, "bonusClaims":{}, "researchBonuses":{}, "scienceLegends":{}, "scienceLegendRevealed":{}, "dailyScores":{}}
	var current_name: String = "Test"
	var saves: int = 0
	func ensure_ledger(state: Dictionary) -> void:
		state.coins = maxi(0, int(state.researchAchievements.get("__coinEarned", 0)) - int(state.researchAchievements.get("__coinSpent", 0)))
		state.maxCoins = maxi(int(state.maxCoins), int(state.coins))
	func persist() -> bool:
		ensure_ledger(save)
		saves += 1
		return true
	func spend_coins(amount: int) -> bool:
		ensure_ledger(save)
		if amount <= 0 or int(save.coins) < amount:
			return false
		save.researchAchievements.__coinSpent += amount
		ensure_ledger(save)
		return true
	func add_coins(amount: int, _reason: String = "") -> int:
		amount = maxi(0, amount)
		save.researchAchievements.__coinEarned += amount
		ensure_ledger(save)
		return amount
	func award_research(delta: int, competitive: int = 0) -> int:
		save.researchPoints += maxi(0, delta)
		save.weekRP = int(save.get("weekRP", 0)) + mini(delta, competitive)
		return maxi(0, delta)

var failures: Array[String] = []

func _check(condition: bool, message: String) -> void:
	if not condition:
		failures.append(message)
		push_error(message)

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var progress: MemoryProgress = MemoryProgress.new()
	var service: Node = Service.new()
	root.add_child(progress)
	root.add_child(service)
	service.progress_override = progress
	var test_directory: String = "/tmp/moleculox_economy_test_" + str(Time.get_ticks_usec())
	DirAccess.make_dir_recursive_absolute(test_directory)
	service.auxiliary_directory = test_directory
	_check(service.balance() == 20000, "Ledger balance uses earned minus spent")
	_check(not service.spend(0) and not service.spend(25000), "Invalid purchases cannot spend coins")
	_check(service.purchase("hammer") and service.booster_count("hammer") == 1, "Hammer purchase grants actual inventory")
	_check(service.balance() == 19850, "Hammer price is 150 coins")
	_check(service.spend_booster("hammer") and not service.spend_booster("hammer"), "Hammer cannot be spent twice")
	_check(service.hint_costs(0) == {"general":75,"move":200,"full":900}, "Base source hint prices")
	_check(service.hint_costs(1) == {"general":95,"move":250,"full":1130}, "Quarter-step hint escalation and JS rounding")
	_check(service.hint_costs(100) == {"general":150,"move":400,"full":1800}, "Hint prices cap at twice base")
	_check(service.purchase("holo_table") and not service.purchase("holo_table"), "Equipment purchases are one-time")
	_check(service.hint_costs(0) == {"general":75,"move":160,"full":720}, "Holographic table discounts exact hints only")
	_check(service.purchase("quantum_desk"), "Quantum desk can be purchased after unlock")
	_check(service.quantum_hint_available("2026-11-25") and service.consume_quantum_hint("2026-11-25"), "Quantum desk grants one UTC entitlement")
	_check(not service.consume_quantum_hint("2026-11-25") and service.quantum_hint_available("2026-11-26"), "Quantum entitlement survives same-day rechecks")
	_check(service.free_strategic_hint_available("campaign", "42"), "Free strategic clue starts available")
	_check(service.consume_free_strategic_hint("campaign", "42") and not service.consume_free_strategic_hint("campaign", "42"), "Restart cannot restore a consumed strategic clue")
	progress.save.profileId = "economy_test_second"
	_check(service.free_strategic_hint_available("campaign", "42"), "Strategic entitlements are profile-scoped")
	progress.save.profileId = "economy_test"
	var before: int = service.balance()
	var discovery: Dictionary = service.discover_legend(47, 1)
	_check(discovery.get("id") == "gilbert-lewis", "Campaign completion at level 48 discovers the authored legend")
	_check(service.hammer_count() == 1 and service.legend_exact_hint_tokens() == 1 and service.legend_precision_tokens() == 1, "Legend reward grants one of each authored support")
	_check(service.discover_legend(47, 3).is_empty() and not service.grant_legend_reward("gilbert-lewis"), "Legend discovery and support rewards cannot be farmed")
	_check(service.consume_precision() and service.balance() == before, "Precision consumes a legend token before charging coins")
	_check(service.consume_precision() and service.balance() == before - 250, "Precision costs 250 without a token")
	_check(service.consume_quantum_hint("2026-11-25") and service.legend_exact_hint_tokens() == 0, "Legend exact hint token takes precedence over exhausted quantum desk")
	_check(service.discover_legend(0, 2, "daily", "2026-11-25").is_empty(), "Daily legend requires three stars")
	_check(not service.discover_legend(0, 3, "daily", "2026-11-25").is_empty() and service.discover_legend(0, 3, "daily", "2026-11-25").is_empty(), "One daily legend per UTC day")
	_check(Service.move_bonus(4, 6, 4) == 40 and Service.move_bonus(5, 6, 4) == 35, "Authored reference route bonuses")
	_check(Service.move_bonus(6, 6, 6) == 25 and Service.move_bonus(8, 6, 6) == 15 and Service.move_bonus(10, 6, 6) == 5 and Service.move_bonus(11, 6, 6) == 0, "Move score boundaries match production")
	_check(Service.campaign_score(3, 6, 6, 6, 12, 0) == 250, "Unassisted perfect source campaign score")
	_check(Service.campaign_score(3, 6, 6, 6, 12, 1, true) == 200, "Assistance drops time bonus and hints drop no-hint bonus")
	_check(Service.daily_score(6, 6, 6, 12, 0, 7) == 155, "Daily score includes a capped streak bonus")
	var daily: Dictionary = service.award_daily_research("2026-11-24", 6, 6, 6, 12, 0)
	_check(daily.delta == 125 and service.award_daily_research("2026-11-24", 6, 6, 6, 12, 0).delta == 0, "Daily RP only credits an improvement")
	_check(service.award_daily_research("2026-11-25", 6, 6, 6, 12, 0).streak == 2, "Daily RP tracks adjacent UTC dates")
	_check(service.purchase("arctic") and service.current_lab_theme() == "arctic", "Owned equipment enables its theme")
	for index: int in range(100, 108):
		progress.save.stars[str(index)] = 3
	var mission: Dictionary = service.claim_lab_mission("polar")
	_check(mission.get("ok", false) and mission.coins == 200 and mission.rp == 150, "Polar expedition checks progress and grants the exact reward")
	_check(not service.claim_lab_mission("polar").get("ok", false), "Lab expedition cannot be claimed twice")
	_check(not service.equip_theme("mars"), "Unowned themes cannot be equipped")
	_check(service.purchase("collider"), "Collider equipment can be purchased")
	var bonus: Dictionary = service.award_bonus_mission(10)
	_check(bonus.get("new", false) and bonus.coins == 70 and bonus.rp == 100, "Collider adds 20 coins to one-time bonus mission reward")
	_check(not service.award_bonus_mission(10).get("new", true), "Bonus reward cannot be claimed twice")
	print("Economy service conformance: ", "PASS" if failures.is_empty() else "FAIL", " (", failures.size(), " failures)")
	service.free()
	progress.free()
	quit(0 if failures.is_empty() else 1)
