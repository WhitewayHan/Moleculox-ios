const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const must = (condition, message) => {
  if (!condition) throw new Error(message);
};

const version = '8.5.78';
const token = '8.5.78-r38-native-cache-bust';
const index = read('www/index.html');
const game = read('www/js/game.js');
const sw = read('www/sw.js');
const manifest = JSON.parse(read('www/manifest.webmanifest'));
const pkg = JSON.parse(read('package.json'));
const codemagic = read('codemagic.yaml');
const patchIos = read('scripts/patch-ios.py');

const expectedAssets = [
  'css/app.css',
  'js/sync-core.js',
  'js/daily-levels.js',
  'js/campaign-levels.js',
  'js/level-fx-recipes.js',
  'js/game.js',
  'js/firebase.js',
];

for (const asset of expectedAssets) {
  must(index.includes(`${asset}?v=${token}`), `Missing R38 cache identity for ${asset}`);
}

must(!/8\.5\.69-r24|8\.5\.73-r25/.test(index), 'Stale R24/R25 asset cache identity remains in index.html');
must(index.includes(`window.__MX_BUILD_ID__='${token}'`), 'Native build identity does not match R38');
must(game.includes(`const APP_VERSION="v${version}";`), 'Visible app version does not match R38');
must(pkg.version === version, 'package.json version does not match R38');
must(manifest.version === version, 'manifest version does not match R38');
must(codemagic.includes(`CFBundleShortVersionString ${version}`), 'Codemagic TestFlight version does not match R38');
must(patchIos.includes(`'MARKETING_VERSION':'${version}'`), 'Generated Xcode marketing version does not match R38');
must(sw.includes(`moleculox-v${version}-r38-native-cache-bust`), 'Service-worker cache does not match R38');

console.log('R38 native asset cache/version checks passed.');
