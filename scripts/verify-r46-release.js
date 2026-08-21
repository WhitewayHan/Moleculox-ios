const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const must = (condition, message) => { if (!condition) throw new Error(message); };
const pkg = JSON.parse(read('package.json'));
const android = pkg.name.includes('google-play');
const platform = android ? 'android' : 'ios';
const buildId = `8.5.79-r46-ui-centered-${platform}`;
const index = read('www/index.html');
const game = read('www/js/game.js');
const firebase = read('www/js/firebase.js');
const css = read('www/css/app.css');
const capacitor = JSON.parse(read('capacitor.config.json'));
const providers = capacitor.plugins?.FirebaseAuthentication?.providers || [];

must(pkg.version === '8.5.79', 'package version must be 8.5.79');
must(pkg.dependencies['@capacitor-firebase/app-check'] === '7.3.1', 'native App Check dependency missing');
must(pkg.dependencies['@capacitor-firebase/authentication'] === '7.3.1', 'native authentication dependency mismatch');
must(capacitor.webDir === 'www', 'Capacitor webDir must remain www');
must(capacitor.plugins?.FirebaseAuthentication?.skipNativeAuth === true, 'Firebase native/web session bridge setting mismatch');
must(index.includes(`window.__MX_BUILD_ID__='${buildId}'`), 'R46 build identity mismatch');
must(game.includes('const APP_VERSION="v8.5.79";'), 'visible R46 version mismatch');
must(game.includes('t/145+p.x*.7+p.y'), 'portal core must use portal coordinates');
must(!game.includes('t/145+g.x*.7+g.y'), 'invalid CanvasGradient coordinate access remains');
must(!css.includes('\\n'), 'literal backslash-n remains in CSS');
must(css.includes('.rankingSafetyBtn'), 'ranking safety UI CSS missing');
must(game.includes('function publicPlayerNameAllowed'), 'public name filter missing');
must(game.includes('function openRankingSafetyModal'), 'report/block UI missing');
must(firebase.includes('CustomProvider'), 'Firebase JS App Check bridge missing');
must(firebase.includes('FirebaseAppCheck'), 'native Firebase App Check bridge missing');
must(firebase.includes('playerNameReports'), 'player-name report persistence missing');
must(read('www/privacy-policy.html').includes('Firebase App Check'), 'privacy policy App Check disclosure missing');
must(read('www/player-name-rules.html').includes('Report &amp; Block'), 'player-name report instructions missing');
must(fs.existsSync(path.join(root, 'firestore-name-reports.rules')), 'Firestore report-rule snippet missing');
if (android) {
  must(capacitor.appId === 'com.whitewaystudio.moleculox', 'Android application id mismatch');
  must(providers.includes('google.com'), 'Google provider missing on Android');
  must(!providers.includes('apple.com'), 'Apple provider must not be packaged on Android');
  must(game.includes('const MX_SHOW_APPLE_BTN=false;'), 'Apple button must stay disabled on Android');
  must(read('codemagic.yaml').includes('const MX_SHOW_APPLE_BTN=false;'), 'Codemagic must enforce Android Apple-button policy');
} else {
  must(capacitor.appId === 'com.whitewayhan.moleculox', 'iOS bundle id mismatch');
  must(providers.includes('apple.com'), 'Apple provider missing on iOS');
  must(providers.includes('google.com'), 'Google provider missing on iOS');
  must(game.includes('const MX_SHOW_APPLE_BTN=MX_IOS_NATIVE&&MX_APPLE_NATIVE_READY;'), 'native Apple button guard missing on iOS');
  must(read('ios-config/App.entitlements').includes('com.apple.developer.applesignin'), 'Sign in with Apple entitlement missing');
  must(read('codemagic.yaml').includes('bundle_identifier: com.whitewayhan.moleculox'), 'Codemagic iOS bundle id mismatch');
}

const ids = [...index.matchAll(/\bid=["']([^"']+)["']/g)].map((m) => m[1]);
const duplicates = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
must(!duplicates.length, `duplicate HTML ids: ${duplicates.join(', ')}`);

for (const match of index.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
  const value = match[1].split(/[?#]/)[0];
  if (!value || /^(?:https?:|mailto:|data:|#)/i.test(value)) continue;
  must(fs.existsSync(path.join(root, 'www', value)), `missing HTML asset: ${value}`);
}
for (const match of css.matchAll(/url\((['"]?)([^)'"\s]+)\1\)/g)) {
  const value = match[2].split(/[?#]/)[0];
  if (!value || /^(?:https?:|data:|#)/i.test(value)) continue;
  must(fs.existsSync(path.resolve(root, 'www/css', value)), `missing CSS asset: ${value}`);
}

const defined = new Set([...css.matchAll(/@(?:-webkit-)?keyframes\s+([\w-]+)/g)].map((m) => m[1]));
const known = new Set(['none','initial','inherit','unset','revert','linear','ease','ease-in','ease-out','ease-in-out','infinite','normal','reverse','alternate','alternate-reverse','forwards','backwards','both','running','paused','step-start','step-end']);
const missing = new Set();
for (const match of css.matchAll(/(?:^|[;{])\s*animation(?:-name)?\s*:\s*([^;}]+)/gm)) {
  for (const group of match[1].split(',')) {
    for (const token of group.trim().split(/\s+/)) {
      if (/^[A-Za-z_][\w-]*$/.test(token) && !known.has(token) && !defined.has(token)) missing.add(token);
    }
  }
}
must(!missing.size, `undefined CSS animations: ${[...missing].join(', ')}`);

console.log(`R46 ${platform} release checks passed: ${ids.length} HTML ids, ${defined.size} keyframes.`);
