from pathlib import Path, PurePosixPath
import hashlib, json, shutil, tarfile, tempfile
root=Path(__file__).resolve().parents[1]
parts=json.loads((root/'PAYLOAD-SHA256.json').read_text())
expected=json.loads((root/'WEB-BUNDLE-SHA256.json').read_text())
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
  shutil.rmtree(root/'www',ignore_errors=True)
  shutil.move(str(stage/'www'),str(root/'www'))
print('R392 complete web bundle restored and verified:',len(expected),'files')
