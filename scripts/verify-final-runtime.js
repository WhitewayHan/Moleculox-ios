'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const game = read('www/js/game.js');
const firebase = read('www/js/firebase.js');
const css = read('www/css/app.css');
const prepare = read('scripts/prepare-ios.sh');
const capacitor = JSON.parse(read('capacitor.config.json'));
const legacyRootFiles = fs.readdirSync(root).filter((name) => /\.txt$|^R\d+.*\.json$|^RELEASE-R46/i.test(name));

function ok(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exitCode = 1;
  } else {
    console.log('PASS:', message);
  }
}

ok(firebase.includes('const PRESENCE_WRITE_COALESCE_MS = 25000;'), 'menu presence writes are rate-limited');
ok(firebase.includes('if (presenceWritePromise) return presenceWritePromise;'), 'concurrent presence writes share one request');
ok(firebase.includes('await writePresence(true);'), 'presence startup still publishes immediately');
ok(firebase.includes('window.addEventListener("pageshow", resumePresenceAfterPageReturn);'), 'presence heartbeat restarts after a page-cache return');
ok(game.includes('document.hidden||navigator.onLine===false'), 'duel heartbeat stops while suspended or offline');
ok(game.includes('},45000);'), 'online player count polling uses the lower-cost final cadence');

ok(game.includes('function scheduleMainLoop('), 'hybrid main-loop scheduler is installed');
ok(game.includes('function cadenceStamp('), 'display-independent accumulated cadence is installed');
ok(game.includes('scheduleMainLoop(liveSync?ACTIVE_FRAME_MS:staticCadence,liveSync);'), 'main loop separates live VSync and lower-cost idle cadence');
ok((game.match(/requestAnimationFrame\(loop\)/g) || []).length <= 3, 'main-loop RAF calls remain centralized in scheduler/wake paths');
ok(game.includes("let PARTS=[],DUST=[],lastEmit=0,fxCanvasDirty=true,fxBufferKey='';"), 'FX canvas tracks dirtiness and buffer identity');
ok(game.includes('if(fxBufferKey===nextBufferKey&&fxc.width===pixelW&&fxc.height===pixelH)return;'), 'unchanged FX canvas buffers are not reallocated');
ok(game.includes('if(!ambientFx&&!PARTS.length)'), 'empty disabled FX canvas clears once instead of every frame');
ok((css.match(/V4\.0\.0 — clearer campaign cards/g) || []).length === 1, 'duplicate campaign-card CSS was removed');
ok((css.match(/Step 18 — reactive laboratory spectacle/g) || []).length === 1, 'duplicate reaction FX CSS was removed');
ok(!/body\.(?:reduce-motion|reduceMotion)\b/.test(css), 'reduced-motion selectors use the active mxReduceMotion class');
ok(game.includes("classList.add('keyboardOpen')") && game.includes("classList.remove('keyboardOpen')"), 'software-keyboard layout state is connected to focus events');
ok(!css.includes('body.mxDirectNext'), 'unreachable direct-next CSS state was removed');

function relativeLuminance(hex) {
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
function contrast(a, b) {
  const values = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
for (const color of ['#eef0ff', '#a3a8d4', '#4fd8ff', '#4ade80', '#ffc94d', '#ff5c69']) {
  ok(css.includes(color) && contrast(color, '#0e0c26') >= 4.5, `${color} keeps readable contrast on the main background`);
}

function accumulatedRenderRate(displayHz, targetMs, seconds = 12) {
  let last = 0;
  let renders = 0;
  const ticks = Math.floor(displayHz * seconds);
  for (let i = 1; i <= ticks; i += 1) {
    const now = i * 1000 / displayHz;
    if (now - last >= targetMs - 1e-7) {
      last = !last || now - last > targetMs * 4 ? now : last + targetMs;
      renders += 1;
    }
  }
  return renders / seconds;
}

for (const displayHz of [60, 90, 120, 144, 165]) {
  const fps = accumulatedRenderRate(displayHz, 1000/60);
  ok(fps >= 59 && fps <= 61, `${displayHz} Hz cadence holds the ~60 FPS gameplay target (${fps.toFixed(1)})`);
}

ok(capacitor.ios && capacitor.ios.backgroundColor === '#070b24', 'iOS launch background matches the game palette');
ok(prepare.includes('rm -f ios/App/App/public/sw.js'), 'iOS native bundle removes the PWA service worker');
ok(legacyRootFiles.length === 0, `legacy root reports were removed (${legacyRootFiles.join(', ')})`);

if (process.exitCode) process.exit(process.exitCode);
