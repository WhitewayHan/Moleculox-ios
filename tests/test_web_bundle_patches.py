"""Ensure the level-card optimization survives restore without weakening hashes."""

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
SPEC = importlib.util.spec_from_file_location(
    "web_bundle_patches", ROOT / "scripts/web_bundle_patches.py"
)
patches = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(patches)


class WebBundlePatchTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.web = self.root / "www"
        self.files = {
            "css/app.css": b".lvBtn{aspect-ratio:1}\n",
            "css/app-r160.css": b".lvBtn{aspect-ratio:1}\n",
            "js/game.js": b"// original game\n",
            "js/game-r160.js": b"// original game\n",
            "js/movement-core.js": b"// original movement\n",
        }
        self.manifest = {}
        for relative_path, data in self.files.items():
            path = self.web / relative_path
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
            self.manifest[relative_path] = hashlib.sha256(data).hexdigest()

    def test_apply_is_idempotent_and_retains_original_bytes(self):
        patches.apply_patches(self.web, self.manifest)
        patches.apply_patches(self.web, self.manifest)
        patches.verify_bundle(self.web, self.manifest)
        for relative_path, data in self.files.items():
            suffix = patches.PATCHES.get(relative_path, b"")
            self.assertEqual((self.web / relative_path).read_bytes(), data + suffix)

    def test_verify_rejects_missing_patch(self):
        with self.assertRaises(ValueError):
            patches.verify_bundle(self.web, self.manifest)

    def test_verify_rejects_tampering_and_duplicate_patch(self):
        patches.apply_patches(self.web, self.manifest)
        for relative_path, suffix in patches.PATCHES.items():
            target = self.web / relative_path
            valid = target.read_bytes()
            for invalid in (
                b"/* injected */" + valid,
                valid[:-len(suffix)] + suffix.replace(b"Performance", b"Altered", 1),
                valid + b" ",
                valid + suffix,
            ):
                with self.subTest(path=relative_path, invalid=invalid):
                    target.write_bytes(invalid)
                    with self.assertRaises(ValueError):
                        patches.verify_bundle(self.web, self.manifest)
            target.write_bytes(valid)

    def test_verify_rejects_changed_unpatched_file(self):
        patches.apply_patches(self.web, self.manifest)
        (self.web / "js/movement-core.js").write_bytes(b"// changed\n")
        with self.assertRaises(ValueError):
            patches.verify_bundle(self.web, self.manifest)

    def test_apply_validates_all_targets_before_writing(self):
        (self.web / patches.PATCH_PATHS[1]).write_bytes(b"/* changed */")
        with self.assertRaises(ValueError):
            patches.apply_patches(self.web, self.manifest)
        self.assertEqual(
            (self.web / patches.PATCH_PATHS[0]).read_bytes(),
            self.files[patches.PATCH_PATHS[0]],
        )

    def prepare_restore_fixture(self):
        scripts = self.root / "scripts"
        scripts.mkdir()
        for name in ("restore-web-payload.py", "verify-web-bundle.py", "web_bundle_patches.py"):
            shutil.copy2(ROOT / "scripts" / name, scripts / name)
        payload = self.root / "payload"
        payload.mkdir()
        part = payload / "www-test.tar.gz.part-001"
        with tarfile.open(part, "w:gz") as archive:
            for relative_path, data in self.files.items():
                info = tarfile.TarInfo("www/" + relative_path)
                info.size = len(data)
                archive.addfile(info, io.BytesIO(data))
        (self.root / "PAYLOAD-SHA256.json").write_text(json.dumps({
            part.relative_to(self.root).as_posix(): hashlib.sha256(part.read_bytes()).hexdigest()
        }))
        (self.root / "WEB-BUNDLE-SHA256.json").write_text(json.dumps(self.manifest))
        return part

    def run_script(self, name):
        return subprocess.run(
            [sys.executable, str(self.root / "scripts" / name)],
            cwd=self.root, capture_output=True, text=True,
        )

    def test_restore_twice_then_verify_preserves_exact_patch(self):
        self.prepare_restore_fixture()
        for _ in range(2):
            result = self.run_script("restore-web-payload.py")
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            patches.verify_bundle(self.web, self.manifest)
        result = self.run_script("verify-web-bundle.py")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_corrupt_payload_does_not_replace_current_bundle(self):
        part = self.prepare_restore_fixture()
        part.write_bytes(part.read_bytes() + b"damaged")
        before = (self.web / "js/game-r160.js").read_bytes()
        result = self.run_script("restore-web-payload.py")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Missing or damaged payload part", result.stdout + result.stderr)
        self.assertEqual((self.web / "js/game-r160.js").read_bytes(), before)


if __name__ == "__main__":
    unittest.main()
