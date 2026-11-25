class_name MoleculoxMoleculePreview
extends Control

var molecule: Dictionary = {}
var palette: Dictionary = {}
var discovered := true
static var _sphere_cache: Dictionary = {}

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	custom_minimum_size = Vector2(120, 110)
	resized.connect(queue_redraw)

func configure(value: Dictionary, colors: Dictionary = {}, known: bool = true) -> void:
	molecule = value
	palette = colors
	discovered = known
	queue_redraw()

func _draw() -> void:
	var cells: Array = molecule.get("s", [])
	if cells.is_empty():
		return
	var low := Vector2(INF, INF)
	var high := Vector2(-INF, -INF)
	for entry in cells:
		if entry is Array and entry.size() >= 3:
			low = low.min(Vector2(float(entry[1]), float(entry[2])))
			high = high.max(Vector2(float(entry[1]), float(entry[2])))
	var span := high - low + Vector2.ONE
	var tile := minf(size.x / (span.x + .8), size.y / (span.y + .8))
	tile = minf(tile, 52.0)
	var origin := size * .5 - (high - low) * tile * .5
	var points: Array[Vector2] = []
	for entry in cells:
		points.append(origin + (Vector2(float(entry[1]), float(entry[2])) - low) * tile)
	for i in cells.size():
		for j in range(i + 1, cells.size()):
			var distance := absf(float(cells[i][1]) - float(cells[j][1])) + absf(float(cells[i][2]) - float(cells[j][2]))
			if is_equal_approx(distance, 1.0):
				draw_line(points[i], points[j], Color("b9edff") if discovered else Color("55516c"), tile * .14, true)
	for i in cells.size():
		var symbol := str(cells[i][0])
		var colors: Dictionary = palette.get(symbol, {})
		var color := Color(str(colors.get("c", "#77cfff"))) if discovered else Color("4b4962")
		var radius := tile * .36
		var point: Vector2 = points[i]
		draw_set_transform(point+Vector2(0,radius*.82),0,Vector2(radius*.85,radius*.32))
		draw_circle(Vector2.ZERO,1.0,Color(0,0,0,.3),true,-1.0,true)
		draw_set_transform(Vector2.ZERO,0,Vector2.ONE)
		var highlight := Color(str(colors.get("hi","#ffffff"))) if discovered else color.lightened(.2)
		var sphere := _sphere_texture(color,highlight)
		draw_texture_rect(sphere,Rect2(point-Vector2.ONE*radius,Vector2.ONE*radius*2),false)
		draw_arc(point,radius,0,TAU,48,Color(0,0,0,.35),1.5,true)
		draw_set_transform(point-Vector2(radius*.3,radius*.45),-.6,Vector2(radius*.32,radius*.18))
		draw_circle(Vector2.ZERO,1.0,Color(1,1,1,.58),true,-1.0,true)
		draw_set_transform(Vector2.ZERO,0,Vector2.ONE)
		var font := get_theme_default_font()
		var font_size := maxi(9, int(radius*.9))
		var caption := symbol if discovered else "?"
		var text_size := font.get_string_size(caption, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size)
		draw_string(font, point + Vector2(-text_size.x*.5, text_size.y*.28), caption, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, Color(str(colors.get("t","#0a1830"))))


static func _sphere_texture(color:Color,highlight:Color) -> Texture2D:
	var key := color.to_html()+highlight.to_html()
	if _sphere_cache.has(key):
		return _sphere_cache[key]
	var resolution := 96
	var image := Image.create(resolution,resolution,false,Image.FORMAT_RGBA8)
	var start := Vector2(-.35,-.42)
	var centers := -start
	var inner_radius := .12
	var delta_radius := 1.0-inner_radius
	var quadratic_a := centers.length_squared()-delta_radius*delta_radius
	var shadow := Color(maxf(0,color.r-30.0/255.0),maxf(0,color.g-30.0/255.0),maxf(0,color.b-30.0/255.0))
	for y in resolution:
		for x in resolution:
			var point := (Vector2(x+.5,y+.5)/float(resolution)-Vector2(.5,.5))*2.0
			var alpha := clampf((1.0-point.length())*resolution*.5,0.0,1.0)
			if alpha <= 0.0:
				continue
			var displacement := point-start
			var quadratic_b := -2.0*(displacement.dot(centers)+inner_radius*delta_radius)
			var quadratic_c := displacement.length_squared()-inner_radius*inner_radius
			var discriminant := maxf(0,quadratic_b*quadratic_b-4.0*quadratic_a*quadratic_c)
			var fraction := clampf((-quadratic_b-sqrt(discriminant))/(2.0*quadratic_a),0.0,1.0)
			var pixel := highlight.lerp(color,fraction/.55) if fraction < .55 else color.lerp(shadow,(fraction-.55)/.45)
			pixel.a = alpha
			image.set_pixel(x,y,pixel)
	var texture := ImageTexture.create_from_image(image)
	_sphere_cache[key] = texture
	return texture
