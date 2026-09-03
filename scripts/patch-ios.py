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
# Remove every stale/default Capacitor PNG before writing the approved icon set.
for stale in appset.glob('*.png'):
    stale.unlink()
data=json.loads(contents.read_text())
generated=0
for index,item in enumerate(data.get('images',[])):
    size=item.get('size')
    if not size:
        continue
    # Xcode 15+/modern Capacitor can use one universal iOS 1024x1024 slot
    # without a `scale` field. Older catalogs use size + scale entries.
    scale_raw=item.get('scale')
    scale=float(str(scale_raw).rstrip('x')) if scale_raw else 1.0
    px=round(float(size.split('x')[0])*scale)
    if px <= 0:
        continue
    fn=item.get('filename')
    if not fn:
        idiom=item.get('idiom','icon')
        fn=f'AppIcon-{idiom}-{px}-{index}.png'
        item['filename']=fn
    master.resize((px,px),Image.Resampling.LANCZOS).save(appset/fn,'PNG',optimize=True)
    generated += 1
if generated == 0:
    raise SystemExit(f'No usable AppIcon entries found in {contents}')
contents.write_text(json.dumps(data,indent=2)+"\n")
# Keep an explicit App Store marketing icon as well.
master.save(appset/'AppIcon-1024.png','PNG',optimize=True)

# Sign in with Apple entitlement.
shutil.copy2(ROOT/'ios-config'/'App.entitlements', APP/'App.entitlements')

# Firebase initialization in AppDelegate — configured explicitly in code
# rather than relying on GoogleService-Info.plist being present in the app
# bundle's resources at runtime. A plist file sitting on disk in ios-config/
# is not automatically included in the compiled .app unless it's registered
# as a build resource, which this project doesn't do; the previous plain
# FirebaseApp.configure() call trusted Firebase to find and parse that file
# and threw an uncaught NSException (crash on every launch) when it couldn't.
# Passing the known values directly removes that dependency entirely.
appdelegate=APP/'AppDelegate.swift'
s=appdelegate.read_text()
if 'import FirebaseCore' not in s:
    s=s.replace('import UIKit','import UIKit\nimport FirebaseCore')
if 'FirebaseOptions(' not in s:
    needle='func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {'
    if needle in s:
        firebase_init = '''
        if FirebaseApp.app() == nil {
            let fbOptions = FirebaseOptions(googleAppID: "1:638154711182:ios:854a506583df0945ff69df", gcmSenderID: "638154711182")
            fbOptions.apiKey = "AIzaSyBYZT6PJPsABWzHgZhc7em3o7yrZoFvl1o"
            fbOptions.projectID = "moleculox-2f4b4"
            fbOptions.bundleID = "com.whitewayhan.moleculox"
            fbOptions.clientID = "638154711182-7iqh4hdleuulgchvq4o3ibaph5fic88h.apps.googleusercontent.com"
            fbOptions.storageBucket = "moleculox-2f4b4.firebasestorage.app"
            FirebaseApp.configure(options: fbOptions)
        }'''
        s=s.replace(needle,needle+firebase_init)
    else:
        raise SystemExit('Could not patch AppDelegate didFinishLaunchingWithOptions')


# Required by @capacitor-firebase/authentication for Google/Apple OAuth callbacks.
# Keep this in the reusable patcher so local and Codemagic builds behave alike.
if 'ApplicationDelegateProxy.shared.application(app, open: url' not in s:
    open_url_fn = '''

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }'''
    last_brace=s.rfind('}')
    if last_brace < 0:
        raise SystemExit('Could not patch AppDelegate URL callback')
    s=s[:last_brace]+open_url_fn+'\n'+s[last_brace:]

appdelegate.write_text(s)


# Ensure GoogleService-Info.plist is a real Xcode resource. Native Google/Apple
# authentication SDKs may inspect the bundled plist even though FirebaseCore is
# also configured explicitly in AppDelegate.

# Link the entitlement file and normalize the app target's version/build
# settings. Capacitor's generated project can already contain MARKETING_VERSION
# and CURRENT_PROJECT_VERSION values, so replace them instead of appending
# duplicates. This also makes repeated local/Codemagic preparation idempotent.
pbx=IOS/'App.xcodeproj'/'project.pbxproj'
p=pbx.read_text()
settings={
    'CODE_SIGN_ENTITLEMENTS':'App/App.entitlements',
    'MARKETING_VERSION':'8.7.59',
    'CURRENT_PROJECT_VERSION':'1',
    'ASSETCATALOG_COMPILER_APPICON_NAME':'AppIcon',
    # iPhone only. Xcode writes UIDeviceFamily=[1] into the built app.
    # This intentionally removes iPad support and the App Store iPad screenshot requirement.
    'TARGETED_DEVICE_FAMILY':'1',
    # Apple requires iOS 15+ for uploads starting Spring 2027; adopt it now.
    'IPHONEOS_DEPLOYMENT_TARGET':'15.0',
}

def _patch_app_build_settings(match: re.Match[str]) -> str:
    block=match.group(0)
    if 'PRODUCT_BUNDLE_IDENTIFIER = com.whitewayhan.moleculox;' not in block:
        return block
    # Remove any previous value for our three settings inside this one app
    # configuration, then insert one canonical copy after the bundle ID.
    for key in settings:
        block=re.sub(r'^[ \t]*'+re.escape(key)+r'[ \t]*=[ \t]*[^;]*;[ \t]*\n?', '', block, flags=re.MULTILINE)
    bundle=re.search(r'^(?P<indent>[ \t]*)PRODUCT_BUNDLE_IDENTIFIER = com\.whitewayhan\.moleculox;[ \t]*$', block, flags=re.MULTILINE)
    if not bundle:
        return block
    indent=bundle.group('indent')
    addition=''.join(f'\n{indent}{key} = {value};' for key,value in settings.items())
    return block[:bundle.end()]+addition+block[bundle.end():]

p=re.sub(
    r'buildSettings = \{.*?^\s*\};',
    _patch_app_build_settings,
    p,
    flags=re.DOTALL|re.MULTILINE,
)

# Register GoogleService-Info.plist as an actual target resource. Copying the
# file onto disk is insufficient: Firebase/Google Sign-In expect it inside the
# compiled app bundle and Xcode only bundles files listed in project.pbxproj.
if (APP/'GoogleService-Info.plist').exists():
    import hashlib
    def _mx_pbx_id(label: str) -> str:
        return hashlib.sha1(('moleculox:'+label).encode('utf-8')).hexdigest()[:24].upper()
    file_ref_id=_mx_pbx_id('GoogleService-Info.plist:file')
    build_file_id=_mx_pbx_id('GoogleService-Info.plist:resource')

    # Respect an existing registration, including a project previously patched
    # by another tool, but fill in any missing piece independently.
    existing_file_ref=re.search(r'([A-F0-9]{24}) /\* GoogleService-Info\.plist \*/ = \{isa = PBXFileReference;',p)
    if existing_file_ref:
        file_ref_id=existing_file_ref.group(1)
    else:
        marker='/* Begin PBXFileReference section */'
        if marker not in p:
            raise SystemExit('Could not find PBXFileReference section')
        p=p.replace(
            marker,
            marker+'\n\t\t'+file_ref_id+' /* GoogleService-Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = GoogleService-Info.plist; sourceTree = "<group>"; };',
            1,
        )

    existing_build_file=re.search(r'([A-F0-9]{24}) /\* GoogleService-Info\.plist in Resources \*/ = \{isa = PBXBuildFile;',p)
    if existing_build_file:
        build_file_id=existing_build_file.group(1)
    else:
        marker='/* Begin PBXBuildFile section */'
        if marker not in p:
            raise SystemExit('Could not find PBXBuildFile section')
        p=p.replace(
            marker,
            marker+'\n\t\t'+build_file_id+' /* GoogleService-Info.plist in Resources */ = {isa = PBXBuildFile; fileRef = '+file_ref_id+' /* GoogleService-Info.plist */; };',
            1,
        )

    # Add the plist to the App group if it is not already a child there.
    group_child=file_ref_id+' /* GoogleService-Info.plist */,'
    if group_child not in p:
        p2=re.sub(
            r'([A-F0-9]{24} /\* AppDelegate\.swift \*/,)',
            r'\1\n\t\t\t\t'+group_child,
            p,
            count=1,
        )
        if p2==p:
            raise SystemExit('Could not add GoogleService-Info.plist to the App group')
        p=p2

    # Add it to Copy Bundle Resources if it is not already there.
    resource_child=build_file_id+' /* GoogleService-Info.plist in Resources */,'
    if resource_child not in p:
        p2=re.sub(
            r'(isa = PBXResourcesBuildPhase;\s*\n\s*buildActionMask = \d+;\s*\n\s*files = \(\s*\n)',
            r'\1\t\t\t\t'+resource_child+'\n',
            p,
            count=1,
        )
        if p2==p:
            raise SystemExit('Could not register GoogleService-Info.plist in Copy Bundle Resources')
        p=p2
    print('Verified GoogleService-Info.plist as a bundled Xcode resource.')

pbx.write_text(p)

# Add the Google reversed client ID URL scheme when available, while always
# applying the iPhone-only and export-compliance Info.plist metadata.
google_plist=APP/'GoogleService-Info.plist'
info=APP/'Info.plist'
if info.exists():
    import plistlib
    with info.open('rb') as f:
        ip=plistlib.load(f)
    if google_plist.exists():
        with google_plist.open('rb') as f:
            gp=plistlib.load(f)
        reversed_id=gp.get('REVERSED_CLIENT_ID')
        if reversed_id:
            types=ip.setdefault('CFBundleURLTypes',[])
            if not any(reversed_id in x.get('CFBundleURLSchemes',[]) for x in types):
                types.append({'CFBundleURLSchemes':[reversed_id]})
    ip['ITSAppUsesNonExemptEncryption']=False
    # The product is intentionally iPhone-only. The definitive device family is
    # TARGETED_DEVICE_FAMILY=1; remove stale iPad-only orientation metadata too.
    ip.pop('UISupportedInterfaceOrientations~ipad', None)
    with info.open('wb') as f:
        plistlib.dump(ip,f,sort_keys=False)
else:
    raise SystemExit(f'Info.plist missing: {info}')

print('Patched icon, Firebase initialization, Apple entitlement, iPhone-only target and iOS metadata.')
