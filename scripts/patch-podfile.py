from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PODFILE = ROOT / "ios" / "App" / "Podfile"
if not PODFILE.exists():
    raise SystemExit("Podfile not found after npx cap add ios")

s = PODFILE.read_text()
# Apple and Google native providers are both required on iOS. Install the
# Google subspec after capacitor_pods, outside def capacitor_pods (Capawesome docs).
google_pod="pod 'CapacitorFirebaseAuthentication/Google', :path => '../../node_modules/@capacitor-firebase/authentication'"
if google_pod not in s:
    # Capacitor templates use varying indentation: usually two spaces, not four.
    marker=re.search(r'(?m)^(?P<indent>[ \t]*)# Add your Pods here[ \t]*$',s)
    if marker:
        indent=marker.group('indent')
        insertion=marker.group(0)+'\n'+indent+google_pod
        s=s[:marker.start()]+insertion+s[marker.end():]
    else:
        # Capacitor versions without the comment still declare capacitor_pods
        # inside target 'App' do. Insert directly after that invocation.
        target=re.search(r"(?m)^[ \t]*target ['\"]App['\"] do[ \t]*\n",s)
        if not target:
            raise SystemExit('Could not locate Capacitor App target in Podfile')
        anchor=re.search(r'(?m)^(?P<indent>[ \t]+)capacitor_pods[ \t]*$',s[target.end():])
        if not anchor:
            raise SystemExit('Could not locate capacitor_pods in App target')
        pos=target.end()+anchor.end()
        s=s[:pos]+'\n'+anchor.group('indent')+google_pod+s[pos:]

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
print("Patched Podfile for Apple + Google auth build and resource-bundle signing.")
