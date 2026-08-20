const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const must = (condition, message) => {
  if (!condition) throw new Error(message);
};

const version = '8.5.78';
const buildId = '8.5.78-r45-ui-proportion-final-ios';
const cssToken = '8.5.78-r45-ui-proportion-final-ios';

const index = read('www/index.html');
const game = read('www/js/game.js');
const sw = read('www/sw.js');
const manifest = JSON.parse(read('www/manifest.webmanifest'));
const pkg = JSON.parse(read('package.json'));
const codemagic = read('codemagic.yaml');
const patchIos = read('scripts/patch-ios.py');

const expected = {
  'css/app.css': cssToken,
  'js/sync-core.js': buildId,
  'js/daily-levels.js': buildId,
  'js/campaign-levels.js': buildId,
  'js/level-fx-recipes.js': buildId,
  'js/game.js': buildId,
  'js/firebase.js': buildId,
  'js/story-universe.js': buildId,
};

for (const [asset, token] of Object.entries(expected)) {
  must(index.includes(`${asset}?v=${token}`), `Missing FINAL R45 cache identity for ${asset}: expected ${token}`);
}

must(index.includes(`window.__MX_BUILD_ID__='${buildId}'`), 'Native build identity does not match FINAL R45');
must(game.includes(`const APP_VERSION="v${version}";`), 'Visible app version does not match FINAL R45');
must(pkg.version === version, 'package.json version does not match FINAL R45');
must(manifest.version === version, 'manifest version does not match FINAL R45');
must(codemagic.includes(`CFBundleShortVersionString ${version}`), 'Codemagic TestFlight version does not match FINAL R45');
must(patchIos.includes(`'MARKETING_VERSION':'${version}'`), 'Generated Xcode marketing version does not match FINAL R45');
must(sw.includes(`const CACHE_NAME = 'moleculox-8.5.78-r45-ui-proportion-final-ios';`), 'Service-worker cache does not match iOS UI-proportion final build');

console.log('FINAL R45 native asset cache/version checks passed.');
