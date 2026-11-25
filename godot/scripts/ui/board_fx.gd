class_name MoleculoxBoardFX
extends Control
## Native CanvasItem counterpart of the authored particle layer. No DOM/JS renderer.

var effects_enabled: bool = true
var reduced_motion: bool = false
var particle_limit: int = 195
var particles: Array[Dictionary] = []
var rng := RandomNumberGenerator.new()

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	rng.randomize()
	set_process(not particles.is_empty())

func clear_effects() -> void:
	particles.clear()
	set_process(false)
	queue_redraw()

func emit_particle(spec: Dictionary) -> void:
	if not effects_enabled or reduced_motion or particles.size() >= particle_limit:
		return
	var particle: Dictionary = {"k": "glit", "pos": Vector2.ZERO, "velocity": Vector2.ZERO, "age": 0.0, "life": 1.0, "delay": 0.0, "radius": 2.0, "color": Color.WHITE, "rotation": 0.0, "spin": 0.0}
	particle.merge(spec, true)
	particles.append(particle)
	set_process(true)
	queue_redraw()

func burst(kind: String, at: Vector2, colors: Array = [], scale_factor: float = 1.0) -> void:
	if not effects_enabled or reduced_motion:
		return
	var palette: Array = colors if not colors.is_empty() else [Color("4fd8ff"), Color("9d7bff"), Color.WHITE]
	var count: int = 23
	var particle_type: String = kind
	if kind == "portal_enter" or kind == "portal_exit" or kind == "rift":
		particle_type = "glit"
		count = 18
	elif kind == "landing":
		particle_type = "spark"
		count = 10
	elif kind == "select":
		particle_type = "glit"
		count = 8
	elif kind == "collect":
		particle_type = "crys"
		count = 12
	elif kind == "win":
		particle_type = "conf"
		count = 22
	elif kind == "bub":
		count = 19
	elif kind == "smoke":
		count = 14
	elif kind == "glit":
		count = 23
	elif kind == "pop":
		count = 12
	elif kind == "splash" or kind == "drip":
		particle_type = "drop"
	for index in range(count):
		var angle: float = float(index) / maxf(1.0, float(count)) * TAU
		var speed: float = rng.randf_range(0.8, 3.5)
		var velocity := Vector2(cos(angle), sin(angle)) * speed
		var radius: float = rng.randf_range(1.5, 3.5) * scale_factor
		var life: float = rng.randf_range(0.65, 1.25)
		if particle_type in ["spark", "drop", "crys", "conf"]:
			velocity = Vector2(rng.randf_range(-4.5, 4.5), rng.randf_range(-9.0, -3.0)) * scale_factor
		elif particle_type == "bub":
			velocity = Vector2(rng.randf_range(-1.1, 1.1), rng.randf_range(-3.0, -1.8))
			life = 2.0
			radius = rng.randf_range(3.0, 6.0) * scale_factor
		elif particle_type == "smoke":
			velocity = Vector2(rng.randf_range(-0.8, 0.8), rng.randf_range(-2.8, -1.4))
			life = 2.0
			radius = rng.randf_range(8.0, 18.0) * scale_factor
		elif particle_type == "flame":
			velocity = Vector2(rng.randf_range(-0.6, 0.6), rng.randf_range(-4.8, -2.4))
			radius = rng.randf_range(5.0, 11.0) * scale_factor
		elif particle_type == "pop":
			velocity = Vector2.ZERO
			life = 0.55
		var offset := Vector2.ZERO
		if particle_type in ["pop", "glit"] and kind not in ["portal_enter", "portal_exit", "rift", "select"]:
			offset = Vector2(rng.randf_range(-45.0, 45.0), rng.randf_range(-45.0, 45.0)) * scale_factor
		emit_particle({"k": particle_type, "pos": at + offset, "velocity": velocity, "life": life, "radius": radius, "color": _color(palette[index % palette.size()]), "rotation": rng.randf_range(0, TAU), "spin": rng.randf_range(-0.35, 0.35), "delay": index * (0.012 if kind == "select" else 0.004)})
	if kind in ["portal_enter", "portal_exit", "rift", "select", "landing", "collect", "win", "splash", "pop"]:
		emit_particle({"k": "ring", "pos": at, "radius": 7.0 * scale_factor, "radial_speed": (-28.0 if kind == "portal_enter" else 82.0) * scale_factor, "color": _color(palette[0]), "life": 0.45})

func bond(from: Vector2, to: Vector2, color: Color = Color("7ee8ff")) -> void:
	emit_particle({"k": "bond", "pos": from, "to": to, "color": color, "life": 0.48, "width": 4.0})

func _process(delta: float) -> void:
	var step: float = minf(0.12, maxf(0.0, delta))
	for index in range(particles.size() - 1, -1, -1):
		var particle: Dictionary = particles[index]
		var previous_age: float = float(particle.age)
		particle.age = previous_age + step
		var delay: float = float(particle.get("delay", 0.0))
		if float(particle.age) >= float(particle.life):
			particles.remove_at(index)
			continue
		if float(particle.age) < delay:
			continue
		var active_step: float = maxf(0.0, step - maxf(0.0, delay - previous_age))
		var units: float = active_step / 0.0167
		var velocity: Vector2 = particle.velocity
		var position_value: Vector2 = particle.pos
		particle.previous = position_value
		var drift := Vector2.ZERO
		match String(particle.k):
			"drop", "spark", "crys", "conf":
				var gravity: float = {"drop": 0.28, "spark": 0.30, "crys": 0.20, "conf": 0.26}[String(particle.k)]
				velocity.y += gravity * units
				if particle.k == "conf": drift.x = sin(float(particle.age) * 8.0) * 1.05
			"smoke":
				particle.radius = float(particle.radius) + 0.22 * units
			"bub":
				drift.x = sin(float(particle.age) * 6.0) * 0.5
			"squig":
				drift.y = sin(float(particle.age) * 9.0 + float(particle.get("phase", 0.0))) * 1.1
			"flame":
				drift.x = rng.randf_range(-0.4, 0.4)
		particle.pos = position_value + (velocity + drift) * units
		particle.velocity = velocity
		particle.rotation = float(particle.rotation) + float(particle.spin) * units
	queue_redraw()
	if particles.is_empty():
		set_process(false)

func _draw() -> void:
	for particle in particles:
		if float(particle.age) < float(particle.delay):
			continue
		var proportion: float = clampf(float(particle.age) / maxf(0.001, float(particle.life)), 0.0, 1.0)
		var position_value: Vector2 = particle.pos
		var color: Color = particle.color
		color.a *= 1.0 - proportion
		var radius: float = maxf(0.0, float(particle.radius))
		match String(particle.k):
			"ring", "pop":
				var ring_radius: float = radius + float(particle.get("radial_speed", 26.0 / maxf(0.001, float(particle.life)))) * float(particle.age)
				if ring_radius > 0.0:
					draw_arc(position_value, ring_radius, 0, TAU, 48, color, maxf(0.5, (2.5 if particle.k == "pop" else 3.5) * (1.0 - proportion)), true)
			"spark":
				draw_line(particle.get("previous", position_value), position_value, color, 2.0, true)
			"streak":
				var velocity: Vector2 = particle.velocity
				var direction: Vector2 = velocity.normalized()
				var length_value: float = float(particle.get("length", 12.0)) * (1.0 - proportion * 0.45)
				var tail: Vector2 = position_value - direction * length_value
				var width: float = float(particle.get("width", 1.6)) * (1.0 - proportion * 0.35)
				var streak_color: Color = _color(particle.get("color2", particle.color))
				streak_color.a *= 1.0 - proportion
				draw_line(tail, position_value, streak_color, width, true)
			"glit":
				var alpha: float = (0.4 + 0.6 * absf(sin(float(particle.age) * 10.0)))
				color.a *= alpha
				var rotation_value: float = float(particle.age) * 3.0
				draw_line(position_value - Vector2(radius, 0).rotated(rotation_value), position_value + Vector2(radius, 0).rotated(rotation_value), color, 1.8, true)
				draw_line(position_value - Vector2(0, radius).rotated(rotation_value), position_value + Vector2(0, radius).rotated(rotation_value), color, 1.8, true)
			"crys", "conf":
				var points := PackedVector2Array()
				var height: float = radius * (0.5 if particle.k == "conf" else 1.0)
				for point in [Vector2(-radius, -height), Vector2(radius, -height), Vector2(radius, height), Vector2(-radius, height)]:
					points.append(position_value + point.rotated(float(particle.rotation)))
				draw_colored_polygon(points, color)
			"bub":
				draw_arc(position_value, radius, 0, TAU, 28, color, 1.6, true)
				color.a *= 0.35
				draw_circle(position_value, radius, color, true, -1, true)
			"smoke":
				color.a *= 0.55
				draw_circle(position_value, radius, color, true, -1, true)
			"flame":
				var rr: float = radius * (1.0 - proportion * 0.7)
				# The original flame is two quadratic curves, not a diamond.
				var flame_points := PackedVector2Array()
				for side in range(2):
					var start := Vector2(0, -rr * 1.7) if side == 0 else Vector2(0, rr * 0.6)
					var control := Vector2(rr if side == 0 else -rr, 0)
					var end := Vector2(0, rr * 0.6) if side == 0 else Vector2(0, -rr * 1.7)
					for segment in range(12):
						var amount: float = float(segment) / 12.0
						flame_points.append(position_value + start * pow(1.0 - amount, 2.0) + control * (2.0 * (1.0 - amount) * amount) + end * amount * amount)
				draw_colored_polygon(flame_points, color)
			"bond":
				var local: float = clampf((float(particle.age) - float(particle.delay)) / maxf(0.05, float(particle.life) - float(particle.delay)), 0.0, 1.0)
				var to: Vector2 = particle.to
				var end: Vector2 = position_value.lerp(to, 1.0 - pow(1.0 - local, 3.0))
				var bond_alpha: float = sin(local * PI) * 0.92
				color = _color(particle.get("color2", Color.WHITE))
				color.a *= bond_alpha
				var bond_width: float = float(particle.get("width", 4.0))
				draw_line(position_value, end, color, bond_width + 5.0, true)
				draw_line(position_value, end, Color(1, 1, 1, bond_alpha), maxf(1.0, bond_width * 0.42), true)
			"sig":
				var local: float = clampf((float(particle.age) - float(particle.delay)) / maxf(0.05, float(particle.life) - float(particle.delay)), 0.0, 1.0)
				var point: Vector2 = signature_point(particle, local)
				var previous: Vector2 = signature_point(particle, maxf(0.0, local - 0.045))
				color.a *= sin(local * PI)
				var trail_color: Color = _color(particle.get("color2", particle.color))
				trail_color.a *= color.a / maxf(0.001, _color(particle.color).a)
				draw_line(previous, point, trail_color, maxf(0.7, radius * 0.45 * (1.0 - local)), true)
				_draw_signature_shape(particle, point, local, color)
			_:
				draw_circle(position_value, radius, color, true, -1, true)

func _color(value: Variant) -> Color:
	if value is Color:
		return value
	return Color(String(value))

func win_burst(kind: String, at: Vector2, colors: Array = [], quality: String = "high") -> void:
	if not effects_enabled or reduced_motion: return
	var palette: Array = colors if not colors.is_empty() else [Color.WHITE, Color("4fd8ff"), Color("9d7bff")]
	var factor: float = 0.46 if quality == "low" else (0.68 if quality == "mid" else 0.88)
	var families: Array = []
	match kind:
		"splash": families = [["drop", 26], ["ring", 3], ["bub", 10]]
		"crys": families = [["crys", 24], ["glit", 10]]
		"smoke": families = [["smoke", 16]]
		"bub": families = [["bub", 22]]
		"pop": families = [["pop", 14], ["ring", 2]]
		"drip": families = [["drop", 20], ["smoke", 5]]
		"squig": families = [["squig", 13], ["smoke", 4]]
		"spark": families = [["spark", 26]]
		"glit": families = [["glit", 26]]
		"flame": families = [["flame", 26], ["smoke", 6]]
		_: families = [["glit", 26]]
	for family in families:
		var particle_type: String = family[0]
		for index in range(maxi(1, roundi(float(family[1]) * factor))):
			var spec: Dictionary = {"k": particle_type, "pos": at, "color": _color(palette[rng.randi_range(0, palette.size() - 1)]), "life": 1.3}
			match kind:
				"splash":
					if particle_type == "drop": spec.merge({"velocity": Vector2(rng.randf_range(-3.25, 3.25), rng.randf_range(-9.5, -5.0)), "radius": rng.randf_range(2.5, 6.0), "life": 1.5}, true)
					elif particle_type == "ring": spec.merge({"radius": 8.0, "radial_speed": 130.0 + index * 60.0, "life": 0.8}, true)
					else: spec.merge({"velocity": Vector2(rng.randf_range(-0.7, 0.7), rng.randf_range(-2.5, -1.5)), "radius": rng.randf_range(3.0, 7.0), "life": 1.8}, true)
				"crys":
					if particle_type == "crys": spec.merge({"velocity": Vector2(rng.randf_range(-2.5, 2.5), rng.randf_range(-8.0, -4.0)), "radius": rng.randf_range(2.0, 4.5), "rotation": rng.randf_range(0, 7), "spin": rng.randf_range(-0.175, 0.175), "life": 1.7}, true)
					else: spec.merge({"velocity": Vector2(rng.randf_range(-1.0, 1.0), rng.randf_range(-3.0, -1.0)), "radius": rng.randf_range(2.0, 4.0), "life": 1.4}, true)
				"smoke": spec.merge({"velocity": Vector2(rng.randf_range(-0.8, 0.8), rng.randf_range(-2.8, -1.4)), "radius": rng.randf_range(8.0, 18.0), "life": 2.0}, true)
				"bub": spec.merge({"velocity": Vector2(rng.randf_range(-1.1, 1.1), rng.randf_range(-3.8, -1.8)), "radius": rng.randf_range(3.0, 9.0), "life": 2.0}, true)
				"pop":
					if particle_type == "pop": spec.merge({"pos": at + Vector2(rng.randf_range(-45, 45), rng.randf_range(-45, 45)), "radius": 3.0, "life": 0.55, "delay": index * 0.05}, true)
					else: spec.merge({"radius": 6.0, "radial_speed": 110.0, "life": 0.7}, true)
				"drip":
					if particle_type == "drop": spec.merge({"velocity": Vector2(rng.randf_range(-2.25, 2.25), rng.randf_range(-7.0, -3.5)), "radius": rng.randf_range(2.5, 5.5), "life": 1.5}, true)
					else: spec.merge({"velocity": Vector2(rng.randf_range(-0.5, 0.5), -1.2), "radius": rng.randf_range(7.0, 13.0), "life": 1.6}, true)
				"squig":
					if particle_type == "squig": spec.merge({"velocity": Vector2((-1 if rng.randf() < 0.5 else 1) * rng.randf_range(0.9, 2.2), rng.randf_range(-2.3, -1.1)), "radius": rng.randf_range(2.5, 4.5), "phase": rng.randf_range(0, 7), "life": 2.1}, true)
					else: spec.merge({"velocity": Vector2(0, -1.0), "radius": 9.0, "life": 1.7}, true)
				"spark": spec.merge({"velocity": Vector2(rng.randf_range(-4.5, 4.5), rng.randf_range(-10.0, -5.0)), "life": 1.0}, true)
				"glit": spec.merge({"pos": at + Vector2(rng.randf_range(-55, 55), rng.randf_range(-55, 55)), "velocity": Vector2(0, rng.randf_range(-1.6, -0.6)), "radius": rng.randf_range(2.0, 4.5), "life": 1.6}, true)
				"flame":
					if particle_type == "flame": spec.merge({"pos": at + Vector2(rng.randf_range(-35, 35), 0), "velocity": Vector2(rng.randf_range(-0.6, 0.6), rng.randf_range(-4.8, -2.4)), "radius": rng.randf_range(5, 11), "life": 1.2}, true)
					else: spec.merge({"velocity": Vector2(rng.randf_range(-0.5, 0.5), -1.5), "radius": 8.0, "life": 1.6, "color": Color("99aaaa")}, true)
			emit_particle(spec)

func confetti(at: Vector2, quality: String = "high") -> void:
	var count: int = 10 if quality == "low" else (16 if quality == "mid" else 22)
	var colors: Array = [Color("ff5c69"), Color("ffc94d"), Color("4fd8ff"), Color("9d7bff"), Color("4ade80"), Color("ff8ad0")]
	for index in range(count):
		emit_particle({"k": "conf", "pos": at, "velocity": Vector2(rng.randf_range(-4.1, 4.1), rng.randf_range(-10.3, -5.1)), "color": colors[rng.randi_range(0, colors.size() - 1)], "radius": rng.randf_range(1.75, 4), "rotation": rng.randf_range(0, 7), "spin": rng.randf_range(-0.26, 0.26), "life": 1.02})

func portal(at: Vector2, portal_id: String, exiting: bool, cell: float) -> void:
	var is_a: bool = portal_id == "A"
	var colors: Array = [Color.WHITE, Color("65ebff"), Color("9af5ff")] if is_a else [Color.WHITE, Color("c888ff"), Color("e5bdff")]
	for index in range(18):
		var angle: float = index / 18.0 * TAU + rng.randf_range(-0.09, 0.09)
		var speed: float = rng.randf_range(0.55, 2.0)
		var radius: float = rng.randf_range(0, 5) if exiting else cell * 0.30 + rng.randf_range(0, cell * 0.12)
		var direction := Vector2(cos(angle), sin(angle))
		emit_particle({"k": "glit", "pos": at + direction * radius, "velocity": direction * speed * (1.0 if exiting else -1.0), "radius": rng.randf_range(1.4, 3.4), "color": colors[rng.randi_range(0, colors.size() - 1)], "life": rng.randf_range(0.52, 0.74), "delay": index * 0.006})
	emit_particle({"k": "ring", "pos": at, "radius": 5.0 if exiting else cell * 0.30, "radial_speed": 92.0 if exiting else -55.0, "color": Color("7cf3ff") if is_a else Color("d6a4ff"), "life": 0.38})
	if exiting: emit_particle({"k": "ring", "pos": at, "radius": 9.0, "radial_speed": 58.0, "color": Color.WHITE, "life": 0.25, "delay": 0.035})

func rift(at: Vector2, exiting: bool) -> void:
	for index in range(18):
		var angle: float = index / 18.0 * TAU
		var speed: float = rng.randf_range(0.8, 3.2)
		emit_particle({"k": "glit", "pos": at, "velocity": Vector2(cos(angle), sin(angle)) * speed, "radius": rng.randf_range(1.3, 3.4), "color": Color("b95cff") if index % 3 else Color("efe2ff"), "life": 0.55, "delay": index * 0.004})
	emit_particle({"k": "ring", "pos": at, "radius": 7.0, "radial_speed": 82.0, "color": Color("d67aff") if exiting else Color("7a28a8"), "life": 0.5})

# Mulberry32 matches mxFxRng, including JavaScript's unsigned 32-bit arithmetic.
class SignatureRng extends RefCounted:
	var state: int
	func _init(seed_value: int) -> void:
		state = seed_value & 0xffffffff
		if state == 0: state = 1
	func next_float() -> float:
		state = (state + 0x6d2b79f5) & 0xffffffff
		var value: int = ((state ^ (state >> 15)) * (1 | state)) & 0xffffffff
		value = ((value + (((value ^ (value >> 7)) * (61 | value)) & 0xffffffff)) ^ value) & 0xffffffff
		return float((value ^ (value >> 14)) & 0xffffffff) / 4294967296.0

func _signature_angle(direction: String) -> float:
	match direction:
		"up": return -PI / 2.0
		"down": return PI / 2.0
		"left": return PI
		"diag-ne": return -PI / 4.0
		"diag-nw": return -PI * 3.0 / 4.0
	return 0.0

# Uses the unmodified authored catalog.fxRecipes entry. The caller schedules this
# at 330 ms, after the chemistry burst at 90 ms and structure bonds at 185 ms.
func signature(recipe: Dictionary, at: Vector2, colors: Array = [], low_performance: bool = false) -> void:
	if not effects_enabled or reduced_motion: return
	var seeded := SignatureRng.new(int(recipe.get("seed", 1)))
	var count: int = maxi(8, roundi(float(recipe.get("count", 22)) * (0.48 if low_performance else 1.0)))
	var direction: String = String(recipe.get("direction", "radial"))
	var base_angle: float = _signature_angle(direction)
	var palette: Array = colors if not colors.is_empty() else [Color.WHITE, Color("7ee8ff"), Color("ffd76a")]
	for index in range(count):
		var u1: float = seeded.next_float()
		var u2: float = seeded.next_float()
		var u3: float = seeded.next_float()
		var u4: float = seeded.next_float()
		var twist: float = float(recipe.get("twist", 0.0))
		var angle: float = (TAU * u1 if direction == "radial" else base_angle + (u1 - 0.5) * PI * 0.95) + index * 0.013 * (twist if twist else 1.0)
		var delay: float = float(recipe.get("delay", 0.0))
		var color: Color = _color(palette[floori(seeded.next_float() * palette.size())])
		var color2: Color = _color(palette[floori(seeded.next_float() * palette.size())])
		emit_particle({"k": "sig", "pos": at, "mode": String(recipe.get("motif", "radial")), "shape": String(recipe.get("shape", "spark")), "angle": angle, "spread": float(recipe.get("spread", 120.0)) * (0.58 + u3 * 0.58), "twist": twist, "gravity": float(recipe.get("gravity", 0.28)), "waves": float(recipe.get("waves", 3.0)), "phase": u4 * TAU, "index": index, "total": count, "u1": u1, "u2": u2, "u3": u3, "u4": u4, "color": color, "color2": color2, "radius": 2.2 + seeded.next_float() * 3.8, "life": (0.88 + u2 * 0.65) / maxf(0.72, float(recipe.get("speed", 1.0))) + delay, "delay": delay})
	var ring_count: int = 1 if low_performance else maxi(1, int(recipe.get("rings", 1)))
	for index in range(ring_count):
		emit_particle({"k": "ring", "pos": at, "radius": 8.0 + index * 4.0, "radial_speed": 86.0 + index * 31.0 + int(recipe.get("seed", 0)) % 23, "life": 0.62 + index * 0.08, "color": _color(palette[index % palette.size()]), "delay": index * 0.035})

func signature_bonds(recipe: Dictionary, atoms: Array, origin: Vector2, cell: float, colors: Array = []) -> void:
	if not effects_enabled or reduced_motion or atoms.size() < 2: return
	var palette: Array = colors if not colors.is_empty() else [Color.WHITE, Color("7ee8ff")]
	var seeded := SignatureRng.new((int(recipe.get("seed", 1)) ^ 0xb0ad5eed) & 0xffffffff)
	var bonds: Array = []
	for first in range(atoms.size()):
		for second in range(first + 1, atoms.size()):
			if absi(int(atoms[first].x) - int(atoms[second].x)) + absi(int(atoms[first].y) - int(atoms[second].y)) == 1:
				bonds.append([first, second])
	for index in range(bonds.size() - 1, 0, -1):
		var other: int = floori(seeded.next_float() * (index + 1))
		var value: Variant = bonds[index]
		bonds[index] = bonds[other]
		bonds[other] = value
	for index in range(bonds.size()):
		var first: Dictionary = atoms[bonds[index][0]]
		var second: Dictionary = atoms[bonds[index][1]]
		var delay: float = index * float(recipe.get("bondStep", 60)) / 1000.0
		emit_particle({"k": "bond", "pos": origin + Vector2(float(first.x) + 0.5, float(first.y) + 0.5) * cell, "to": origin + Vector2(float(second.x) + 0.5, float(second.y) + 0.5) * cell, "color": _color(palette[index % palette.size()]), "color2": _color(palette[(index + 1) % palette.size()]), "life": 0.62 + delay, "delay": delay, "width": 3.0 + seeded.next_float() * 2.4, "pulse": float(recipe.get("pulse", 1.0))})

func signature_point(particle: Dictionary, amount: float) -> Vector2:
	var eased: float = 1.0 - pow(1.0 - clampf(amount, 0.0, 1.0), 3.0)
	var spread: float = float(particle.get("spread", 120.0))
	var twist: float = float(particle.get("twist", 0.0))
	var angle: float = float(particle.get("angle", 0.0))
	var phase: float = float(particle.get("phase", 0.0))
	var waves: float = float(particle.get("waves", 3.0))
	var offset := Vector2.ZERO
	var index: int = int(particle.get("index", 0))
	var u1: float = float(particle.get("u1", 0.0))
	var u2: float = float(particle.get("u2", 0.0))
	match String(particle.get("mode", "radial")):
		"spiral": offset = _signature_direction(angle + twist * TAU * eased) * spread * eased
		"orbit":
			offset = _signature_direction(angle + (1.6 + absf(twist)) * TAU * eased) * spread * (0.35 + 0.2 * sin(eased * PI))
			offset.y *= 0.55 + u2 * 0.35
		"fountain": offset = Vector2(cos(angle) * spread * 0.72 * eased, -spread * (0.72 + u1 * 0.45) * eased + float(particle.get("gravity", 0.28)) * spread * 2.8 * eased * eased)
		"fan": offset = Vector2(cos(angle), sin(angle) * 0.7) * spread * eased
		"helix": offset = Vector2(sin(phase + eased * TAU * waves) * spread * 0.32 + cos(angle) * spread * 0.18, -spread * eased)
		"wave": offset = Vector2(cos(angle) * spread * eased, sin(angle) * spread * eased + sin(phase + eased * TAU * waves) * spread * 0.24)
		"lattice":
			var total: int = int(particle.get("total", 20))
			var columns: int = maxi(3, roundi(sqrt(float(total))))
			offset = Vector2(float(index % columns) - (columns - 1) / 2.0, floorf(float(index) / columns) - (ceilf(float(total) / columns) - 1) / 2.0) * (spread / columns) * eased
		"vortex": offset = _signature_direction(angle + (2.2 + absf(twist)) * TAU * eased) * spread * (1.0 - eased) * (0.55 + u2 * 0.45)
		"cascade": offset = Vector2((u1 - 0.5) * spread * 0.9 + sin(phase + eased * TAU * waves) * 14.0, -spread * 0.58 + spread * 1.25 * eased)
		"crown":
			var horizontal: float = (u1 - 0.5) * spread * 1.1
			offset = Vector2(horizontal * eased, -sin(eased * PI) * spread * (0.42 + u2 * 0.35) - absf(horizontal) * 0.15 * eased)
		"ribbon": offset = Vector2(cos(angle + twist * eased * 3.0) * spread * eased, sin(angle + twist * eased * 3.0) * spread * eased * 0.42 + sin(phase + eased * TAU * waves) * 18.0)
		"prism": offset = _signature_direction(angle + (index % 3) * TAU / 3.0 + twist * eased) * spread * eased
		"cross": offset = _signature_direction((index % 4) * PI / 2.0 + angle) * spread * eased
		"comet": offset = _signature_direction(angle) * spread * eased + _signature_direction(angle + PI / 2.0) * sin(eased * PI) * spread * 0.2
		"bloom":
			var bloom_angle: float = angle + TAU * eased
			offset = _signature_direction(bloom_angle) * spread * eased * (0.5 + 0.48 * absf(sin((waves + 1.0) * bloom_angle)))
		"zigzag": offset = _signature_direction(angle) * spread * eased + _signature_direction(angle + PI / 2.0) * (1.0 if floori(eased * waves * 4.0) % 2 else -1.0) * spread * 0.12 * (1.0 - eased)
		"arc-reactor":
			offset = _signature_direction(angle + TAU * eased * (1.6 + absf(twist))) * spread * (0.28 + 0.72 * eased)
			offset.y = offset.y * 0.62 - sin(eased * PI) * 28.0
		"nobel-crown":
			offset = _signature_direction((index % 8) / 8.0 * TAU + twist * eased) * spread * (0.3 + 0.7 * eased)
			offset.y = offset.y * 0.52 - sin(eased * PI) * spread * 0.28
		_: offset = _signature_direction(angle + twist * eased) * spread * eased
	return particle.pos + offset

func _draw_signature_shape(particle: Dictionary, at: Vector2, amount: float, color: Color) -> void:
	var radius: float = maxf(1.2, float(particle.get("radius", 3.0)) * (1.0 - amount * 0.45))
	var rotation_value: float = float(particle.get("angle", 0.0)) + amount * 5.0 + float(particle.get("twist", 0.0))
	var width: float = maxf(1.0, 2.0 * (1.0 - amount))
	draw_set_transform(at, rotation_value)
	match String(particle.get("shape", "spark")):
		"diamond": draw_rect(Rect2(-radius, -radius, radius * 2.0, radius * 2.0), color)
		"shard": draw_colored_polygon(PackedVector2Array([Vector2(0, -radius * 1.7), Vector2(radius, radius), Vector2(-radius * 0.75, radius * 0.55)]), color)
		"bubble":
			color.a *= 0.76
			draw_arc(Vector2.ZERO, radius * 1.25, 0, TAU, 28, color, width, true)
		"spark":
			draw_rect(Rect2(-radius * 1.8, -0.8, radius * 3.6, 1.6), color)
			draw_rect(Rect2(-0.8, -radius * 1.8, 1.6, radius * 3.6), color)
		"hex", "star":
			var points := PackedVector2Array()
			var is_star: bool = particle.shape == "star"
			for index in range(8 if is_star else 6):
				var angle: float = -PI / 2.0 + index * PI / 4.0 if is_star else index * PI / 3.0
				var point_radius: float = radius * (0.55 if index % 2 else 1.7) if is_star else radius * 1.3
				points.append(_signature_direction(angle) * point_radius)
			if is_star: draw_colored_polygon(points, color)
			else:
				points.append(points[0])
				draw_polyline(points, color, width, true)
		"ring": draw_arc(Vector2.ZERO, radius * 1.45, 0, TAU, 28, color, width, true)
		"capsule":
			var points := PackedVector2Array()
			for side in range(2):
				for index in range(13):
					var angle: float = (float(index) / 12.0 - 0.5 + side) * PI
					points.append(Vector2(radius * (1.05 if side == 0 else -1.05), 0) + _signature_direction(angle) * radius * 0.55)
			draw_colored_polygon(points, color)
		_: draw_circle(Vector2.ZERO, radius, color, true, -1, true)
	draw_set_transform(Vector2.ZERO)

func _signature_direction(angle: float) -> Vector2:
	# Scalar trigonometry preserves the JavaScript double-precision phase before
	# CanvasItem converts the resulting coordinates to native Vector2 values.
	return Vector2(cos(angle), sin(angle))
