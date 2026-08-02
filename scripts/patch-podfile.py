from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PODFILE = ROOT / 'ios' / 'App' / 'Podfile'
if not PODFILE.exists():
    raise SystemExit('Podfile not found after npx cap add ios')

s = PODFILE.read_text()
google_pod = "pod 'CapacitorFirebaseAuthentication/Google', :path => '../../node_modules/@capacitor-firebase/authentication'"
if google_pod not in s:
    marker = '# Add your Pods here'
    if marker not in s:
        raise SystemExit('Could not find Podfile app-target insertion marker')
    s = s.replace(marker, marker + '\n  ' + google_pod, 1)

if "CODE_SIGNING_ALLOWED'] = 'NO'" not in s:
    bundle_fix = '''  installer.pods_project.targets.each do |target|\n    if target.respond_to?(:product_type) && target.product_type == "com.apple.product-type.bundle"\n      target.build_configurations.each do |config|\n        config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'\n      end\n    end\n  end\n'''
    post = re.search(r'post_install do \|installer\|\n', s)
    if post:
        s = s[:post.end()] + bundle_fix + s[post.end():]
    else:
        s += '\npost_install do |installer|\n' + bundle_fix + 'end\n'

PODFILE.write_text(s)
print('Patched Podfile for native Google Sign-In and resource-bundle signing.')
