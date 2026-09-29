"""Run the actual native patcher on a generated-project fixture (no Apple SDK)."""
import unittest, tempfile, shutil, subprocess, json, plistlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class NativePatchTests(unittest.TestCase):
 def test_provider_order_entitlements_version_and_idempotence(self):
  with tempfile.TemporaryDirectory() as tmp:
   r=Path(tmp)
   for name in ('scripts','ios-config','resources'):shutil.copytree(ROOT/name,r/name)
   app=r/'ios/App/App';app.mkdir(parents=True)
   icon=app/'Assets.xcassets/AppIcon.appiconset';icon.mkdir(parents=True)
   (icon/'Contents.json').write_text(json.dumps({'images':[{'size':'1024x1024','idiom':'universal','platform':'ios'}]}))
   (app/'AppDelegate.swift').write_text('''import UIKit
import Capacitor
@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }
}
''')
   (app/'Info.plist').write_bytes(plistlib.dumps({}))
   shutil.copy2(r/'ios-config/GoogleService-Info.plist',app/'GoogleService-Info.plist')
   project=r/'ios/App/App.xcodeproj';project.mkdir()
   (project/'project.pbxproj').write_text('''/* Begin PBXFileReference section */
/* Begin PBXBuildFile section */
ABCDEFABCDEFABCDEFABCDEF /* AppDelegate.swift */,
isa = PBXResourcesBuildPhase;
  buildActionMask = 2147483647;
  files = (
  );
  buildSettings = {
    PRODUCT_BUNDLE_IDENTIFIER = com.whitewayhan.moleculox;
    MARKETING_VERSION = 1.0;
  };
''')
   for _ in range(2):subprocess.run(['python3',str(r/'scripts/patch-ios.py')],check=True,capture_output=True)
   native=(app/'AppDelegate.swift').read_text()
   install='AppCheck.setAppCheckProviderFactory(MXAppCheckProviderFactory())'
   self.assertEqual(native.count(install),1)
   self.assertEqual(native.count('final class MXAppCheckProviderFactory:'),1)
   self.assertLess(native.index(install),native.index('FirebaseApp.configure('))
   ent=plistlib.loads((app/'App.entitlements').read_bytes())
   self.assertEqual(ent['com.apple.developer.devicecheck.appattest-environment'],'production')
   self.assertEqual(ent['com.apple.developer.applesignin'],['Default'])
   self.assertIn('MARKETING_VERSION = 8.7.215;', (project/'project.pbxproj').read_text())
if __name__=='__main__':unittest.main()
