from __future__ import annotations
import json, re, shutil
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
IOS=ROOT/'ios'/'App'
APP=IOS/'App'

# App Store icon: generate every slot from the non-alpha 1024 master.
master=Image.open(ROOT/'resources'/'AppIcon-1024.png').convert('RGB')
sets=list(APP.glob('Assets.xcassets/AppIcon.appiconset'))+list(APP.glob('**/AppIcon.appiconset'))
if not sets:
    raise SystemExit('AppIcon.appiconset not found')
appset=sets[0]
contents=appset/'Contents.json'
data=json.loads(contents.read_text())
for item in data.get('images',[]):
    size=item.get('size'); scale=item.get('scale'); fn=item.get('filename')
    if not size or not scale: continue
    px=round(float(size.split('x')[0])*float(scale.rstrip('x')))
    if not fn:
        fn=f'AppIcon-{px}.png'; item['filename']=fn
    master.resize((px,px),Image.Resampling.LANCZOS).save(appset/fn,'PNG',optimize=True)
contents.write_text(json.dumps(data,indent=2)+"\n")
# Keep an explicit App Store marketing icon as well.
master.save(appset/'AppIcon-1024.png','PNG',optimize=True)

# Sign in with Apple entitlement.
shutil.copy2(ROOT/'ios-config'/'App.entitlements', APP/'App.entitlements')

# Firebase initialization in AppDelegate.
appdelegate=APP/'AppDelegate.swift'
s=appdelegate.read_text()
if 'import FirebaseCore' not in s:
    s=s.replace('import UIKit','import UIKit\nimport FirebaseCore')
if 'FirebaseApp.configure()' not in s:
    needle='func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {'
    if needle in s:
        s=s.replace(needle,needle+'\n        if FirebaseApp.app() == nil { FirebaseApp.configure() }')
    else:
        raise SystemExit('Could not patch AppDelegate didFinishLaunchingWithOptions')
appdelegate.write_text(s)

# Link entitlement file to all configurations and set version/build values.
pbx=IOS/'App.xcodeproj'/'project.pbxproj'
p=pbx.read_text()
p=p.replace('PRODUCT_BUNDLE_IDENTIFIER = com.whitewayhan.moleculox;', 'PRODUCT_BUNDLE_IDENTIFIER = com.whitewayhan.moleculox;')
# Insert settings after PRODUCT_BUNDLE_IDENTIFIER lines if missing in each build config.
lines=p.splitlines()
out=[]
for line in lines:
    out.append(line)
    if 'PRODUCT_BUNDLE_IDENTIFIER = com.whitewayhan.moleculox;' in line:
        indent=line[:len(line)-len(line.lstrip())]
        block='\n'.join(out[-12:])
        # Safe to add duplicates only once globally per config section.
        out.append(indent+'CODE_SIGN_ENTITLEMENTS = App/App.entitlements;')
        out.append(indent+'MARKETING_VERSION = 1.0.0;')
        out.append(indent+'CURRENT_PROJECT_VERSION = 1;')
p='\n'.join(out)+'\n'
# Remove exact duplicate adjacent settings if script is run more than once.
p=re.sub(r'(\s+CODE_SIGN_ENTITLEMENTS = App/App\.entitlements;\n)(?:\s+CODE_SIGN_ENTITLEMENTS = App/App\.entitlements;\n)+',r'\1',p)
p=re.sub(r'(\s+MARKETING_VERSION = 1\.0\.0;\n)(?:\s+MARKETING_VERSION = 1\.0\.0;\n)+',r'\1',p)
p=re.sub(r'(\s+CURRENT_PROJECT_VERSION = 1;\n)(?:\s+CURRENT_PROJECT_VERSION = 1;\n)+',r'\1',p)
pbx.write_text(p)

# Add Google reversed client ID URL scheme when available.
plist=APP/'GoogleService-Info.plist'
info=APP/'Info.plist'
if plist.exists() and info.exists():
    import plistlib
    with plist.open('rb') as f: gp=plistlib.load(f)
    reversed_id=gp.get('REVERSED_CLIENT_ID')
    with info.open('rb') as f: ip=plistlib.load(f)
    if reversed_id:
        types=ip.setdefault('CFBundleURLTypes',[])
        if not any(reversed_id in x.get('CFBundleURLSchemes',[]) for x in types):
            types.append({'CFBundleURLSchemes':[reversed_id]})
    ip['ITSAppUsesNonExemptEncryption']=False
    bg=ip.setdefault('UIBackgroundModes',[])
    if 'remote-notification' not in bg:
        bg.append('remote-notification')
    with info.open('wb') as f: plistlib.dump(ip,f,sort_keys=False)

print('Patched icon, Firebase initialization, Apple entitlement, push background mode and iOS metadata.')
