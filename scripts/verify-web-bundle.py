from pathlib import Path
import json
from web_bundle_patches import verify_bundle
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'WEB-BUNDLE-SHA256.json').read_text())
try:
 verify_bundle(root/'www',manifest)
except ValueError as error:
 raise SystemExit(str(error))
print('R392 complete native web bundle and exact level-card patch verified:',len(manifest),'files')
