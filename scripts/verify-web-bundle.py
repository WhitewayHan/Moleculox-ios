from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'WEB-BUNDLE-SHA256.json').read_text())
for rel,expected in manifest.items():
 p=root/'www'/rel
 if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=expected:
  raise SystemExit('Missing or changed bundled file: '+rel)
print('R391 complete native web bundle verified:',len(manifest),'files')
