from pathlib import Path, PurePosixPath
import hashlib, json, shutil, tarfile, tempfile
from web_bundle_patches import load_overrides, reviewed_overrides, overlay_reviewed, verify_bundle
root=Path(__file__).resolve().parents[1]
parts=json.loads((root/'PAYLOAD-SHA256.json').read_text())
expected=json.loads((root/'WEB-BUNDLE-SHA256.json').read_text())
overrides=load_overrides(root,expected)
approved=reviewed_overrides(root/'www',expected,overrides)
with tempfile.TemporaryFile() as joined:
 for rel,digest in parts.items():
  p=root/rel
  if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=digest:
   raise SystemExit('Missing or damaged payload part: '+rel)
  with p.open('rb') as src:shutil.copyfileobj(src,joined)
 joined.seek(0)
 with tempfile.TemporaryDirectory(prefix='mx-restore-',dir=root) as tmp:
  stage=Path(tmp)
  with tarfile.open(fileobj=joined,mode='r:gz') as archive:
   members=archive.getmembers()
   for item in members:
    path=PurePosixPath(item.name)
    if path.is_absolute() or '..' in path.parts or not path.parts or path.parts[0]!='www' or not(item.isdir() or item.isfile()):
     raise SystemExit('Invalid web payload member: '+item.name)
   for item in members:
    target=stage/item.name
    if item.isdir():target.mkdir(parents=True,exist_ok=True)
    else:
     target.parent.mkdir(parents=True,exist_ok=True)
     with archive.extractfile(item) as src,target.open('wb') as dest:shutil.copyfileobj(src,dest)
  actual={p.relative_to(stage/'www').as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in (stage/'www').rglob('*') if p.is_file()}
  if actual!=expected:raise SystemExit('Restored web bundle is incomplete or changed')
  # The original archive is immutable; overlay only hash-approved tracked files.
  overlay_reviewed(stage/'www',approved)
  verify_bundle(stage/'www',expected,overrides)
  shutil.rmtree(root/'www',ignore_errors=True)
  shutil.move(str(stage/'www'),str(root/'www'))
print('R392 web payload restored with exact reviewed overrides:',len(expected),'files')
