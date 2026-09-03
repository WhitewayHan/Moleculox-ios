// Moleculox v8.7.73 — R177 FINAL cache identity; R173 gameplay preserved.
// Core code is precached; large audio/story assets are cached only after use.
// Firebase and Google traffic is never intercepted.
const CACHE_NAME = 'moleculox-8.7.73-r177-final-ios';
const CACHE_PREFIX = 'moleculox-';
const CORE_SHELL = [
  './index.html','./css/app.css','./js/sync-core.js','./js/daily-levels.js',
  './js/campaign-levels.js','./js/campaign-expansion-loader-r137.js','./js/campaign-levels-expansion-r137.js',
  './js/early-campaign-quality-r137.js','./js/campaign-integrity-r139.js','./js/campaign-uniqueness-r140.js','./js/campaign-completion-r142.js','./js/campaign-hardcore-r143.js','./js/campaign-quality-r144.js','./js/campaign-polish-r145.js','./js/campaign-feel-r146.js','./js/campaign-choreography-r147.js','./js/campaign-final-r148.js','./js/campaign-final-r149.js','./js/campaign-final-r150.js','./js/campaign-final-r151.js','./js/level-fx-recipes.js','./js/story-universe.js','./js/story-art-completion-r142.js','./js/story-art-completion-r152.js','./js/story-continuity-r153.js','./js/story-main-campaign-art-r154.js',
  './js/v2-locales-generated.js','./js/v2-story-quality.js','./js/it-locale-generated.js','./js/voice-locales-generated.js','./js/voice-it-generated.js',
  './js/game.js','./js/expansion-science-loader-r137.js','./js/expansion-science-bundle-r137.js','./js/smart-hint-worker.js',
  './manifest.webmanifest','./privacy-policy.html','./terms-of-use.html',
  './player-name-rules.html','./delete-data.html',
  './assets/icons/icon-192.png','./assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/images/bg-default.webp','./assets/images/boot-splash.webp',
  './assets/images/whiteway-studio-intro.webp','./assets/images/button-doodle-left.svg',
  './assets/images/button-doodle-right.svg','./assets/images/einstein.webp',
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
