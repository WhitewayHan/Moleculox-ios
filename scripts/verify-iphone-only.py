from __future__ import annotations
import re
import plistlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PBX = ROOT / 'ios' / 'App' / 'App.xcodeproj' / 'project.pbxproj'
INFO = ROOT / 'ios' / 'App' / 'App' / 'Info.plist'

if not PBX.exists():
    raise SystemExit(f'Xcode project missing: {PBX}')

pbx = PBX.read_text()
app_blocks = []
for match in re.finditer(r'buildSettings = \{.*?^\s*\};', pbx, flags=re.DOTALL | re.MULTILINE):
    block = match.group(0)
    if 'PRODUCT_BUNDLE_IDENTIFIER = com.whitewayhan.moleculox;' in block:
        app_blocks.append(block)

if not app_blocks:
    raise SystemExit('No Moleculox app target build settings found')

for index, block in enumerate(app_blocks, start=1):
    values = re.findall(r'^\s*TARGETED_DEVICE_FAMILY\s*=\s*([^;]+);', block, flags=re.MULTILINE)
    if values != ['1']:
        raise SystemExit(f'App configuration {index} is not strictly iPhone-only: TARGETED_DEVICE_FAMILY={values!r}')
    if re.search(r'^\s*TARGETED_DEVICE_FAMILY\s*=\s*[^;]*(?:2|iPad)', block, flags=re.MULTILINE | re.IGNORECASE):
        raise SystemExit(f'App configuration {index} still contains iPad device-family support')

if not INFO.exists():
    raise SystemExit(f'Info.plist missing: {INFO}')
with INFO.open('rb') as handle:
    info = plistlib.load(handle)
if 'UISupportedInterfaceOrientations~ipad' in info:
    raise SystemExit('Info.plist still contains iPad-only orientation metadata')

print(f'Validated {len(app_blocks)} Moleculox build configurations as iPhone-only (TARGETED_DEVICE_FAMILY=1).')
