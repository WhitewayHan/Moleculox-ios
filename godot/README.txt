MOLECULOX — GODOT PORT

Open project.godot with Godot 4.6.3 (Compatibility renderer).
The game uses native Godot Controls, CanvasItems and GDScript rules. The original
HTML/JavaScript game is not embedded as a renderer or WebView.

This is the editor/source project. To play on itch.io, upload the separate
Moleculox-Godot-Itch.zip browser export. Uploading this source ZIP as an HTML game
will not work: the WebAssembly engine and compiled resources must be exported.

For an itch export after making changes, install the matching Godot 4.6.3 Web
export templates, then run the included packaging tool from the source ZIP:
python3 export_tools/build-godot-web.py --output Moleculox-Web.zip
The repository copy of that tool is scripts/build-godot-web.py.
Standard editor export re-encodes the artwork into a resource file larger than
itch's single-file limit; the packaging tool retains original image bytes.

Source baseline: WhitewayHan/Moleculox-ios, af91729, 8.7.239-web-smooth1.
801 campaign levels, 832 daily pool entries, 11 languages, 23 tracks, 11 voice
packs, stories, final epilogues and original art are included.

Web accounts and online duels use the original Firebase modules via a platform
bridge. Desktop play and local duels work offline; desktop account login needs
a real native Firebase SDK adapter. No account or leaderboard test writes were
made during migration.

Native test commands (from this folder):
godot --headless --path . --script res://tests/test_main_flow.gd
godot --headless --path . --script res://tests/rules_oracle_test.gd
godot --headless --path . --script res://tests/session_contract_test.gd
godot --headless --path . --script res://tests/test_all_boards.gd
godot --headless --path . --script res://tests/test_audio_fidelity.gd
godot --headless --path . --script res://tests/test_fx_fidelity.gd
godot --headless --path . --script res://tests/test_fx_bonds.gd

The compressed rules fixture is lossless gzip. It contains expected transitions
and complete solutions computed with the shipped JavaScript worker, so the
native port is checked against an independent implementation.

Game artwork and content retain their original Moleculox copyright.
Godot Engine is MIT licensed: https://godotengine.org/license/
Font licenses are included under assets/fonts/.
