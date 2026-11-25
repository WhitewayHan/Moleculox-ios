extends SceneTree
const FX = preload('res://scripts/ui/board_fx.gd')
func _initialize() -> void:
	var fx := FX.new()
	get_root().add_child(fx)
	var cases: Array = JSON.parse_string(FileAccess.get_file_as_string('res://tests/fixtures/fx-bond-oracle.json'))
	var failures := 0
	var count := 0
	for test_case in cases:
		fx.clear_effects()
		fx.signature_bonds(test_case.recipe,test_case.atoms,Vector2(5,7),40,[Color.WHITE,Color('7ee8ff'),Color('ffd76a')])
		if fx.particles.size() != test_case.particles.size():
			failures += 1
			continue
		for index in range(fx.particles.size()):
			var p: Dictionary = fx.particles[index]
			var expected: Dictionary = test_case.particles[index]
			count += 1
			if absf(float(p.width) - float(expected.w)) > 0.000001 or absf(float(p.life) - float(expected.life)) > 0.000001 or absf(float(p.delay) - float(expected.d)) > 0.000001 or p.pos.distance_to(Vector2(expected.x1,expected.y1)) > 0.0001 or p.to.distance_to(Vector2(expected.x2,expected.y2)) > 0.0001 or not p.color.is_equal_approx(Color(expected.c)) or not p.color2.is_equal_approx(Color(expected.c2)):
				failures += 1
	print('FX bond JavaScript oracle: ',cases.size(),' recipes, ',count,' bonds, ',failures,' failures')
	fx.queue_free()
	quit(1 if failures else 0)
