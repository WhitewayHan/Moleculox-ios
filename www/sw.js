// Moleculox v8.7.25 — R82 Codemagic final. Native preparation removes this PWA service worker.
// Core code is precached; large audio/story assets are cached only after use.
// Firebase and Google traffic is never intercepted.
const CACHE_NAME = 'moleculox-8.7.25-r82-codemagic-final-ios';
const CACHE_PREFIX = 'moleculox-';
const CORE_SHELL = [
  './index.html','./css/app.css','./js/sync-core.js','./js/daily-levels.js',
  './js/campaign-levels.js','./js/level-fx-recipes.js','./js/story-universe.js',
  './js/v2-locales-generated.js','./js/v2-story-quality.js','./js/voice-locales-generated.js','./js/game.js','./js/firebase.js',
  './manifest.webmanifest','./privacy-policy.html','./terms-of-use.html',
  './player-name-rules.html','./delete-data.html',
  './assets/icons/icon-192.png','./assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/images/bg-default.webp','./assets/images/boot-splash.webp',
  './assets/images/whiteway-studio-intro.png','./assets/images/button-doodle-left.svg',
  './assets/images/button-doodle-right.svg','./assets/images/einstein.webp',
  './assets/images/characters/dr-null-canon-r40.webp','./assets/images/characters/null-cat-canon-r40.webp',
  './assets/images/characters/moxy-canon-r40.webp',
  './assets/images/worlds/world-quantum-lab-r40.webp','./assets/images/worlds/world-element-island-r40.webp',
  './assets/images/worlds/world-crystal-cave-r40.webp','./assets/images/worlds/world-orbital-station-r40.webp',
  './assets/images/tier-bg-1.webp',
  './assets/images/tier-bg-2.webp','./assets/images/tier-bg-3.webp','./assets/images/tier-bg-4.webp',
  './assets/images/dr-e-poses/thinking.png','./assets/images/dr-e-poses/celebrate.png',
  './assets/images/dr-e-poses/clap.png','./assets/images/dr-e-poses/surprised.png',
  './assets/images/dr-e-poses/confused.png','./assets/images/dr-e-poses/victory.png',
  './assets/images/dr-e-poses/medal.png','./assets/images/dr-e-poses/experiment.png',
  './assets/images/dr-e-poses/clipboard.png','./assets/images/dr-e-poses/magnifier.png',
  './assets/images/dr-e-poses/molecule.png',
  './assets/audio/voices/dre-voice-sprite-en.mp3',
  './assets/audio/voices/dre-voice-sprite-fr.mp3','./assets/audio/voices/dre-voice-sprite-es.mp3',
  './assets/audio/voices/dre-voice-sprite-de.mp3','./assets/audio/voices/dre-voice-sprite-tr.mp3',
  './assets/audio/voices/dre-voice-sprite-ja.mp3','./assets/audio/voices/dre-voice-sprite-zh.mp3',
  './assets/audio/voices/dre-voice-sprite-pt.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(
    names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map(name => caches.delete(name))
  )).then(() => self.clients.claim()));
});

function isFirebaseOrRemote(url) {
  return /firebaseio\.com|firebaseapp\.com|googleapis\.com|gstatic\.com|cloudfunctions\.net|run\.app/.test(url);
}
function isVersionSensitive(url) {
  try {
    const path = new URL(url).pathname;
    return /\.html$|\.js$|\.css$|manifest\.webmanifest$/.test(path) || path.endsWith('/');
  } catch (_) {
    return /\.html(?:\?|$)|\.js(?:\?|$)|\.css(?:\?|$)|manifest\.webmanifest(?:\?|$)/.test(url) || url.endsWith('/');
  }
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || isFirebaseOrRemote(req.url)) return;

  if (isVersionSensitive(req.url)) {
    event.respondWith(fetch(req).then(res => {
      if (res && res.ok && new URL(req.url).origin === self.location.origin) {
        caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));
      }
      return res;
    }).catch(async () => (await caches.match(req, {ignoreSearch:true})) ||
      (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())));
    return;
  }

  event.respondWith(caches.match(req, {ignoreSearch:true}).then(cached => cached || fetch(req).then(res => {
    if (res && res.ok && res.type === 'basic') {
      caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));
    }
    return res;
  }).catch(() => cached || Response.error())));
});
