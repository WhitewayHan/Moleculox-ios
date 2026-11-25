extends SceneTree
const FX = preload('res://scripts/ui/board_fx.gd')
func _initialize() -> void:
	var fx := FX.new()
	get_root().add_child(fx)
	var cases: Array = JSON.parse_string(FileAccess.get_file_as_string('res://tests/fixtures/fx-oracle.json'))
	var failures := 0
	var count := 0
	for test_case in cases:
		fx.clear_effects()
		fx.signature(test_case.recipe,Vector2(200,200))
		if fx.particles.size() != test_case.particles.size():
			push_error('Count mismatch seed ' + str(test_case.recipe.seed))
			failures += 1
			continue
		for index in range(fx.particles.size()):
			var p: Dictionary = fx.particles[index]
			var expected: Dictionary = test_case.particles[index]
			count += 1
			var failed: bool = p.k != expected.k or absf(float(p.life) - float(expected.life)) > 0.000001 or absf(float(p.delay) - float(expected.delay)) > 0.000001 or absf(float(p.radius) - float(expected.radius)) > 0.000001 or not p.color.is_equal_approx(Color(expected.color))
			if p.k == 'sig':
				failed = failed or absf(float(p.spread) - float(expected.spread)) > 0.000001 or absf(float(p.angle) - float(expected.angle)) > 0.000001 or not p.color2.is_equal_approx(Color(expected.color2))
				for amount_index in range(5):
					var point: Vector2 = fx.signature_point(p,amount_index / 4.0)
					var ep: Array = expected.positions[amount_index]
					if point.distance_to(Vector2(ep[0],ep[1])) > 0.0001: failed = true
			if failed:
				failures += 1
				if failures < 5: print('Mismatch seed ',test_case.recipe.seed,' particle ',index,': ',p,' expected ',expected)
	print('FX JavaScript oracle: ',cases.size(),' recipes, ',count,' particles, ',failures,' failures')
	fx.queue_free()
	quit(1 if failures else 0)
