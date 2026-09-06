const fs=require('fs'),path=require('path');
function must(v,msg){if(!v){console.error('R200 MOBILE FAIL:',msg);process.exit(1);}}
const root=path.resolve(__dirname,'..'),www=path.join(root,'www');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const game=read('www/js/game.js'),sync=read('www/js/sync-core.js'),fb=read('www/js/firebase.js'),idx=read('www/index.html');
const pkg=JSON.parse(read('package.json')),manifest=JSON.parse(read('www/manifest.webmanifest')),cap=JSON.parse(read('capacitor.config.json'));
const platform='ios',version='8.7.97',build='8.7.97-r200-final-ios';
must(pkg.version===version,'package version mismatch');
must(manifest.version===version,'manifest version mismatch');
must(game.includes(`const APP_VERSION="v${version}";`),'visible app version mismatch');
must(game.includes('R200 STONE DOODLE PASS'),'R200 doodle pass missing');
must(game.includes('R199: one verified STRATEGIC clue is free per eligible level'),'free-first strategic hint missing');
must(game.includes('function stoneDoodle('),'stone doodle renderer missing');
must(game.includes('T*.43'),'large stone doodle scale missing');
must(idx.includes(`window.__MX_BUILD_ID__='${build}'`),'build identity mismatch');
must(idx.includes(`window.__MX_DISTRIBUTION__='${platform}'`),'distribution mismatch');
must(idx.includes('window.__MX_NATIVE_SHELL__=true;'),'native shell flag missing');
must(idx.includes(`css/app.css?v=${build}`),'native CSS cache token mismatch');
must(idx.includes(`js/game.js?v=${build}`),'native game cache token mismatch');
must(idx.includes(`js/firebase.js?v=${build}`),'native Firebase cache token mismatch');
must(sync.includes('const MAX_LEVELS=501;'),'sync not configured for 501 levels');
must(fb.includes('const LEADERBOARD_LEVEL_COUNT = 501;'),'leaderboard not configured for 501 levels');
must(!game.includes('LocalNotifications')&&!game.includes('PushNotifications'),'notification runtime returned');
must(cap.webDir==='www','Capacitor webDir mismatch');
if(platform==='ios'){
  must(cap.appId==='com.whitewayhan.moleculox','iOS bundle id mismatch');
  must((cap.plugins?.FirebaseAuthentication?.providers||[]).includes('apple.com'),'Apple provider missing from iOS Capacitor config');
  must((cap.plugins?.FirebaseAuthentication?.providers||[]).includes('google.com'),'Google provider missing from iOS Capacitor config');
  must(game.includes('const MX_SHOW_APPLE_BTN=MX_IOS_NATIVE&&MX_APPLE_NATIVE_READY;'),'Apple button is not native-iOS gated');
  must(fs.existsSync(path.join(root,'ios-config/GoogleService-Info.plist')),'GoogleService-Info.plist missing');
  must(fs.existsSync(path.join(root,'ios-config/App.entitlements')),'App.entitlements missing');
} else {
  must(cap.appId==='com.whitewaystudio.moleculox','Android package id mismatch');
  must(!(cap.plugins?.FirebaseAuthentication?.providers||[]).includes('apple.com'),'Apple provider must not ship on Android');
  must((cap.plugins?.FirebaseAuthentication?.providers||[]).includes('google.com'),'Google provider missing from Android Capacitor config');
  must(game.includes('const MX_SHOW_APPLE_BTN=false;'),'Apple button must be disabled on Android');
  must(fs.existsSync(path.join(root,'android-config/google-services.json')),'google-services.json missing');
}
for(const lang of ['en','tr','de','es','pt','ja','fr','zh','it']) must(fs.existsSync(path.join(www,`assets/audio/voices/dre-voice-sprite-${lang}.mp3`)),`voice sprite missing: ${lang}`);
console.log(`R200 mobile source verified: ${platform} v${version}.`);
