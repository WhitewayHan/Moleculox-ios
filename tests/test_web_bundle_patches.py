"""Reviewed overrides must survive restore without weakening payload verification."""
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tarfile
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('web_bundle_patches', ROOT/'scripts/web_bundle_patches.py')
patches = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(patches)
sha = lambda data: hashlib.sha256(data).hexdigest()

class WebBundlePatchTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.web = self.root/'www'
        self.original = {name: ('original '+name).encode() for name in patches.PATCH_PATHS}
        self.original['js/movement-core.js'] = b'original movement'
        self.manifest = {name:sha(data) for name,data in self.original.items()}
        self.approved = {name:data+b' reviewed changes' for name,data in self.original.items() if name in patches.PATCH_PATHS}
        self.overrides = {name:sha(data) for name,data in self.approved.items()}
        for name,data in {**self.original,**self.approved}.items():
            p=self.web/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
        (self.root/'WEB-OVERRIDES-SHA256.json').write_text(json.dumps(self.overrides))

    def test_exact_hashes_and_both_aliases_verified(self):
        self.assertEqual(patches.load_overrides(self.root,self.manifest),self.overrides)
        self.assertEqual(patches.reviewed_overrides(self.web,self.manifest,self.overrides),self.approved)
        patches.verify_bundle(self.web,self.manifest,self.overrides)

    def test_unapproved_code_or_css_rejected(self):
        for name in patches.PATCH_PATHS:
            p=self.web/name;valid=p.read_bytes();p.write_bytes(valid+b' ')
            with self.subTest(name=name), self.assertRaises(ValueError):
                patches.reviewed_overrides(self.web,self.manifest,self.overrides)
            p.write_bytes(valid)

    def test_unapproved_unchanged_file_rejected(self):
        (self.web/'js/movement-core.js').write_bytes(b'changed')
        with self.assertRaises(ValueError):patches.verify_bundle(self.web,self.manifest,self.overrides)

    def test_unknown_missing_or_invalid_override_rejected(self):
        for invalid in ({}, {**self.overrides,'js/movement-core.js':self.manifest['js/movement-core.js']}, {**self.overrides,patches.PATCH_PATHS[0]:'invalid'}):
            (self.root/'WEB-OVERRIDES-SHA256.json').write_text(json.dumps(invalid))
            with self.subTest(invalid=invalid), self.assertRaises(ValueError):patches.load_overrides(self.root,self.manifest)

    def prepare_restore(self):
        scripts=self.root/'scripts';scripts.mkdir()
        for name in ('restore-web-payload.py','verify-web-bundle.py','web_bundle_patches.py'):
            shutil.copy2(ROOT/'scripts'/name,scripts/name)
        part=self.root/'payload/test.tar.gz';part.parent.mkdir()
        with tarfile.open(part,'w:gz') as archive:
            for name,data in self.original.items():
                info=tarfile.TarInfo('www/'+name);info.size=len(data);archive.addfile(info,io.BytesIO(data))
        (self.root/'PAYLOAD-SHA256.json').write_text(json.dumps({'payload/test.tar.gz':sha(part.read_bytes())}))
        (self.root/'WEB-BUNDLE-SHA256.json').write_text(json.dumps(self.manifest))
        return part

    def run_script(self,name):
        return subprocess.run([sys.executable,str(self.root/'scripts'/name)],capture_output=True,text=True)

    def test_fresh_partial_checkout_restores_twice_without_losing_reviewed_changes(self):
        self.prepare_restore()
        (self.web/'js/movement-core.js').unlink()
        for _ in range(2):
            result=self.run_script('restore-web-payload.py');self.assertEqual(result.returncode,0,result.stdout+result.stderr)
            patches.verify_bundle(self.web,self.manifest,self.overrides)
            for name,data in self.approved.items():self.assertEqual((self.web/name).read_bytes(),data)
        result=self.run_script('verify-web-bundle.py');self.assertEqual(result.returncode,0,result.stdout+result.stderr)

    def test_unreviewed_local_change_preserved_and_restore_rejected(self):
        self.prepare_restore();p=self.web/patches.PATCH_PATHS[0];p.write_bytes(b'unreviewed local edit')
        before={p.relative_to(self.web).as_posix():p.read_bytes() for p in self.web.rglob('*') if p.is_file()}
        result=self.run_script('restore-web-payload.py');self.assertNotEqual(result.returncode,0)
        self.assertIn('Changed reviewed override',result.stderr)
        self.assertEqual(before,{p.relative_to(self.web).as_posix():p.read_bytes() for p in self.web.rglob('*') if p.is_file()})

    def test_corrupt_payload_does_not_replace_bundle(self):
        part=self.prepare_restore();part.write_bytes(part.read_bytes()+b'damaged')
        result=self.run_script('restore-web-payload.py');self.assertNotEqual(result.returncode,0)
        self.assertIn('Missing or damaged payload part',result.stdout+result.stderr)
        self.assertEqual(patches.reviewed_overrides(self.web,self.manifest,self.overrides),self.approved)

if __name__=='__main__':unittest.main()
