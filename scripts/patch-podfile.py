from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PODFILE = ROOT / "ios" / "App" / "Podfile"
if not PODFILE.exists():
    raise SystemExit("Podfile not found after npx cap add ios")

s = PODFILE.read_text()
# Apple is the only native sign-in provider in this iOS build. Do not add the
# Google authentication subspec. The Firebase base plugin provides Apple auth.
if "CapacitorFirebaseAuthentication/Google" in s:
    raise SystemExit("Unexpected Google authentication pod in Apple-only iOS Podfile")

if "CODE_SIGNING_ALLOWED'] = 'NO'" not in s:
    bundle_fix = """  installer.pods_project.targets.each do |target|
    if target.respond_to?(:product_type) && target.product_type == "com.apple.product-type.bundle"
      target.build_configurations.each do |config|
        config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
      end
    end
  end
"""
    post = re.search(r"post_install do \|installer\|\n", s)
    if post:
        s = s[:post.end()] + bundle_fix + s[post.end():]
    else:
        s += "\npost_install do |installer|\n" + bundle_fix + "end\n"

PODFILE.write_text(s)
print("Patched Podfile for Apple-only auth build and resource-bundle signing.")
