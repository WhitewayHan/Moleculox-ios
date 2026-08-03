from __future__ import annotations
import json
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / 'ios' / 'App' / 'App'
MASTER_PATH = ROOT / 'resources' / 'AppIcon-1024.png'

master = Image.open(MASTER_PATH)
if master.size != (1024, 1024):
    raise SystemExit(f'App icon master must be 1024x1024, got {master.size}')
if master.mode != 'RGB':
    raise SystemExit(f'App icon master must be opaque RGB, got {master.mode}')

sets = list(APP.glob('Assets.xcassets/AppIcon.appiconset')) + list(APP.glob('**/AppIcon.appiconset'))
if not sets:
    raise SystemExit('AppIcon.appiconset not found after iOS preparation')
appset = sets[0]
contents = appset / 'Contents.json'
data = json.loads(contents.read_text())
checked = 0
marketing = 0
for item in data.get('images', []):
    size = item.get('size')
    scale_raw = item.get('scale')
    fn = item.get('filename')
    if not size:
        continue
    if not fn:
        raise SystemExit(f'AppIcon entry has no filename: {item}')
    # Modern Xcode/Capacitor catalogs may define one universal 1024x1024
    # iOS icon without a `scale` key. Treat the omitted scale as 1x.
    scale = float(str(scale_raw).rstrip('x')) if scale_raw else 1.0
    px = round(float(size.split('x')[0]) * scale)
    path = appset / fn
    if not path.exists():
        raise SystemExit(f'Missing generated AppIcon file: {path}')
    icon = Image.open(path)
    if icon.size != (px, px):
        raise SystemExit(f'Wrong icon size for {fn}: {icon.size}, expected {(px, px)}')
    if icon.mode != 'RGB':
        raise SystemExit(f'Icon must not contain alpha: {fn} mode={icon.mode}')
    expected = master.resize((px, px), Image.Resampling.LANCZOS)
    if ImageChops.difference(icon, expected).getbbox() is not None:
        raise SystemExit(f'Icon does not match approved master: {fn}')
    checked += 1
    if item.get('idiom') == 'ios-marketing' or item.get('platform') == 'ios' and px == 1024 or px == 1024:
        marketing += 1

if checked == 0:
    raise SystemExit('No AppIcon slots were validated')
if marketing == 0:
    raise SystemExit('No 1024px / ios-marketing AppIcon slot found')

pbx = (ROOT / 'ios' / 'App' / 'App.xcodeproj' / 'project.pbxproj').read_text()
if 'ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;' not in pbx:
    raise SystemExit('Xcode app icon catalog is not explicitly set to AppIcon')

print(f'Validated {checked} generated AppIcon slots from approved opaque 1024px master.')
