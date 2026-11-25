extends SceneTree
const FX = preload('res://scripts/ui/board_fx.gd')
func _initialize() -> void:
	call_deferred('run')
func run() -> void:
	var fx := FX.new()
	get_root().add_child(fx)
	fx.set_size(Vector2(800,800))
	var catalog: Dictionary = JSON.parse_string(FileAccess.get_file_as_string('res://data/catalog.json'))
	var shapes: Dictionary = {}
	for recipe in catalog.fxRecipes:
		if not shapes.has(recipe.shape):
			shapes[recipe.shape] = true
			fx.clear_effects()
			fx.signature(recipe,Vector2(300,300))
			fx._process(0.12)
			await process_frame
			await process_frame
	fx.clear_effects()
	for kind in ['pop','flame','spark','streak','bond','bub','crys','conf','ring','drop','smoke','squig','glit']:
		fx.emit_particle({'k':kind,'pos':Vector2(100,100),'to':Vector2(200,200),'velocity':Vector2(3,-2),'life':1.0,'radius':10})
	fx._process(0.12)
	await process_frame
	await process_frame
	print('Native FX draw smoke check: ',shapes.size(),' source signature shapes and 13 particle types')
	fx.queue_free()
	quit(0)
