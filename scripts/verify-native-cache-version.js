const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const must = (condition, message) => {
  if (!condition) throw new Error(message);
};

const version = '8.7.57';
const buildId = '8.7.57-r160-codemagic-final-ios';
const cssToken = '8.7.57-r160-codemagic-final-ios';

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
  'js/v2-locales-generated.js': buildId,
  'js/v2-story-quality.js': buildId,
  'js/voice-locales-generated.js': buildId,
};

for (const [asset, token] of Object.entries(expected)) {
  must(index.includes(`${asset}?v=${token}`), `Missing R160 cache identity for ${asset}: expected ${token}`);
}

must(index.includes(`window.__MX_BUILD_ID__='${buildId}'`), 'Native build identity does not match R160');
must(game.includes(`const APP_VERSION="v${version}";`), 'Visible app version does not match R160');
must(pkg.version === version, 'package.json version does not match R160');
must(manifest.version === version, 'manifest version does not match R160');
must(codemagic.includes(`CFBundleShortVersionString ${version}`), 'Codemagic TestFlight version does not match R160');
must(patchIos.includes(`'MARKETING_VERSION':'${version}'`), 'Generated Xcode marketing version does not match R160');
must(sw.includes(`const CACHE_NAME = 'moleculox-8.7.57-r160-codemagic-final-ios';`), 'Service-worker cache does not match iOS R160 build');

console.log('R160 native asset cache/version checks passed.');
