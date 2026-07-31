// Moleculox V8 web sync release service worker
// so the game keeps working offline. Firebase/Google requests are always
// passed straight to the network (never cached, never intercepted) so
// auth/Firestore/Functions behave normally when a connection exists.
const CACHE_NAME = 'moleculox-v8.5.46-final-merged';
const APP_SHELL = [
  './index.html',
  './css/app.css',
  './js/sync-core.js',
  './js/daily-levels.js',
  './js/campaign-levels.js',
  './js/game.js',
  './js/firebase.js',
  './manifest.webmanifest',
  './privacy-policy.html',
  './terms-of-use.html',
  './player-name-rules.html',
  './delete-data.html',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-512-maskable.png',
  './assets/icons/apple-touch-icon.png',
  './assets/images/bg-default.webp',
  './assets/images/boot-splash.webp',
  './assets/images/whiteway-studio-intro.png',
  './assets/images/button-doodle-left.svg',
  './assets/images/button-doodle-right.svg',
  './assets/images/einstein.webp',
  './assets/images/professor-null.webp',
  './assets/images/story/chapter-scene-1.webp',
  './assets/images/story/chapter-scene-2.webp',
  './assets/images/story/chapter-scene-3.webp',
  './assets/images/story/chapter-scene-4.webp',
  './assets/images/story/chapter-scene-5.webp',
  './assets/images/story/chapter-scene-6.webp',
  './assets/images/story/chapter-scene-7.webp',
  './assets/images/story/chapter-scene-8.webp',
  './assets/images/story/chapter-scene-9.webp',
  './assets/images/story/chapter-scene-10.webp',
  './assets/images/story/chapter-scene-11.webp',
  './assets/images/story/chapter-scene-12.webp',
  './assets/images/story/chapter-scene-13.webp',
  './assets/images/story/chapter-scene-14.webp',
  './assets/images/story/chapter-scene-15.webp',
  './assets/images/story/chapter-scene-16.webp',
  './assets/images/story/chapter-scene-17.webp',
  './assets/images/story/chapter-scene-18.webp',
  './assets/images/story/chapter-scene-19.webp',
  './assets/images/story/chapter-scene-20.webp',
  './assets/images/story/chapter-scene-21.webp',
  './assets/images/tier-bg-1.webp',
  './assets/images/tier-bg-2.webp',
  './assets/images/tier-bg-3.webp',
  './assets/images/tier-bg-4.webp',
  './assets/audio/1dr.mp3',
  './assets/audio/2dr.mp3',
  './assets/audio/3dr.mp3',
  './assets/audio/4dr.mp3',
  './assets/audio/5dr.mp3',
  './assets/audio/6dr.mp3',
  './assets/audio/7dr.mp3',
  './assets/audio/8dr.mp3',
  './assets/audio/9dr.mp3',
  './assets/audio/10dr.mp3',
  './assets/audio/11dr.mp3',
  './assets/audio/12dr.mp3',
  './assets/audio/13dr.mp3',
  './assets/audio/14dr.mp3',
  './assets/audio/15dr.mp3',
  './assets/audio/16dr.mp3',
  './assets/audio/17dr.mp3',
  './assets/audio/18dr.mp3',
  './assets/audio/19dr.mp3',
  './assets/audio/20dr.mp3',
  './assets/audio/21dr.mp3',
  './assets/audio/22dr.mp3',
  './assets/audio/23dr.mp3',
  './assets/audio/startup-lab.mp3',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
      caches.keys().then((names) => Promise.all(
          names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)),
      )).then(() => self.clients.claim()),
  );
});

function isFirebaseOrRemote(url) {
  return /firebaseio\.com|firebaseapp\.com|googleapis\.com|gstatic\.com|cloudfunctions\.net|run\.app/.test(url);
}
function isVersionSensitive(url) {
  try {
    const path = new URL(url).pathname;
    return /\.html$|\.js$|\.css$|manifest\.webmanifest$/.test(path) || path.endsWith('/');
  } catch (e) {
    return /\.html(?:\?|$)|\.js(?:\?|$)|\.css(?:\?|$)|manifest\.webmanifest(?:\?|$)/.test(url) || url.endsWith('/');
  }
}


self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // never intercept POST (Functions calls etc.)
  const url = req.url;
  if (isFirebaseOrRemote(url)) return; // always network for Firebase/Google

  if (isVersionSensitive(url)) {
    // network-first: always try to get the latest HTML/JS/CSS/manifest so a
    // new deployment is picked up immediately; fall back to cache only if
    // genuinely offline. This is what prevents a stale index.html from
    // sticking around after you ship an update.
    event.respondWith(
        fetch(req).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        }).catch(() => caches.match(req, {ignoreSearch: true})),
    );
    return;
  }

  // cache-first for stable binary assets (images/audio) — these are large
  // and effectively immutable between versions, so prefer instant loads.
  event.respondWith(
      caches.match(req, {ignoreSearch: true}).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        }).catch(() => cached);
      }),
  );
});
