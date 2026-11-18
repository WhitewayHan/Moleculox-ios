"""Exercise verified web export, offline scope and deterministic ZIP output."""
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
import zipfile

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
SPEC=importlib.util.spec_from_file_location('build_itch',ROOT/'scripts/build-itch.py')
build=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(build)
from web_bundle_patches import PATCH_PATHS
sha=lambda data:hashlib.sha256(data).hexdigest()

class ItchBuildTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup);self.root=Path(self.temp.name)
        source='const APP_VERSION="v8.7.238 · R392 · IOS"; const PKEY="moleculox_profiles_v1";'
        index="""<html><head><script>
window.__MX_BUILD_ID__='8.7.238-r392-ios-auth3-release';
window.__MX_DISTRIBUTION__='ios';window.__MX_NATIVE_SHELL__=true;
window.MX_QA_TEST_GAME=false;window.MX_QA_ALL_LEVELS_OPEN=false;window.MX_QA_NO_CLOUD=false;
</script><link href="css/app-r160.css?v=8.7.238-r392-ios-auth3-release"><script src="js/game-r160.js?v=8.7.238-r392-ios-auth3-release"></script></head><body></body></html>"""
        self.files={'index.html':index.encode(),'js/game.js':source.encode(),'js/game-r160.js':source.encode(),'css/app.css':b'/* original style */','css/app-r160.css':b'/* original style */','sw.js':(ROOT/'www/sw.js').read_bytes(),'sw-r160.js':(ROOT/'www/sw.js').read_bytes(),'offline-manifest-r193.js':b'old manifest','js/story-continuity-r385.js':b'window.story=true;','assets/images/bg-default.webp':b'image','assets/icons/icon-192.png':b'icon','assets/icons/icon-512.png':b'icon','assets/audio/test.mp3':b'audio','js/firebase.js':b'const projectId="keep-real-project";'}
        self.original={name:sha(data) for name,data in self.files.items()}
        for name in PATCH_PATHS:
            self.files[name]+=b'\n/* approved smoothness changes */'
        self.overrides={name:sha(self.files[name]) for name in PATCH_PATHS}
        for name,data in self.files.items():
            p=self.root/'www'/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
        (self.root/'WEB-BUNDLE-SHA256.json').write_text(json.dumps(self.original))
        (self.root/'WEB-OVERRIDES-SHA256.json').write_text(json.dumps(self.overrides))

    def test_web_flags_visible_version_and_storage_identity_preserved(self):
        exported=build.export_files(self.root)
        index=exported['index.html'].decode()
        self.assertIn("__MX_DISTRIBUTION__='web'",index);self.assertIn('__MX_NATIVE_SHELL__=false',index)
        self.assertIn(build.BUILD_ID,index);self.assertNotIn(build.ORIGINAL_BUILD_ID,index)
        self.assertIn('MX_QA_TEST_GAME=false',index);self.assertIn(build.APP_VERSION,exported['js/game-r160.js'].decode())
        self.assertIn('moleculox_profiles_v1',exported['js/game-r160.js'].decode())
        self.assertEqual(exported['js/firebase.js'],self.files['js/firebase.js'])
        self.assertEqual(exported['css/app-r160.css'],self.files['css/app-r160.css'])
        self.assertEqual((self.root/'www/index.html').read_bytes(),self.files['index.html'])

    def test_offline_manifest_complete_and_account_traffic_outside_scope(self):
        exported=build.export_files(self.root);manifest=exported['offline-manifest-r193.js'].decode();worker=exported['sw.js'].decode()
        self.assertIn('./js/story-continuity-r385.js',manifest);self.assertIn('./assets/audio/test.mp3',manifest)
        self.assertNotIn('https://',manifest);self.assertIn("req.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith",worker)
        self.assertIn('moleculox-web-smooth1-v8-7-239',worker)
        self.assertIn('serviceWorker.register',exported['index.html'].decode());self.assertIn('.catch(function () {})',exported['index.html'].decode())

    def test_unreviewed_change_or_missing_asset_rejected(self):
        p=self.root/'www/js/game-r160.js';p.write_bytes(p.read_bytes()+b' changed')
        with self.assertRaises(ValueError):build.export_files(self.root)
        p.write_bytes(self.files['js/game-r160.js']);(self.root/'www/assets/audio/test.mp3').unlink()
        with self.assertRaises(ValueError):build.export_files(self.root)

    def test_zip_root_contents_integrity_and_reproducibility(self):
        (self.root/'www/native-secret.plist').write_bytes(b'not a web file')
        exported=build.export_files(self.root)
        one=self.root/'one.zip';two=self.root/'two.zip';build.write_archive(exported,one);build.write_archive(exported,two)
        self.assertEqual(one.read_bytes(),two.read_bytes())
        with zipfile.ZipFile(one) as archive:
            self.assertIn('index.html',archive.namelist());self.assertNotIn('www/index.html',archive.namelist());self.assertNotIn('native-secret.plist',archive.namelist())
            info=json.loads(archive.read('BUILD-INFO.json'))
            self.assertEqual(info['reviewedOverridesManifestSHA256'],sha((self.root/'WEB-OVERRIDES-SHA256.json').read_bytes()))
            for name,digest in info['files'].items():self.assertEqual(sha(archive.read(name)),digest)
        self.assertTrue(one.with_suffix('.zip.sha256').read_text().startswith(sha(one.read_bytes())))

    def test_unsafe_or_missing_index_reference_rejected(self):
        for reference in ('missing.js','../secret.js','/absolute.js'):
            files={'index.html':('<script src="'+reference+'"></script>').encode()}
            with self.subTest(reference=reference),self.assertRaises(ValueError):build.validate_index(files)

if __name__=='__main__':unittest.main()
