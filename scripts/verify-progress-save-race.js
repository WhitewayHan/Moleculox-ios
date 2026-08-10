'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.resolve(__dirname, '..');
const syncCode = fs.readFileSync(path.join(root, 'www/js/sync-core.js'), 'utf8');
const context = { window: {}, console, Date, Object, Math, Number, String, Array, Set, Map };
context.window.window = context.window;
vm.createContext(context);
vm.runInContext(syncCode, context, { filename: 'sync-core.js' });
const core = context.window.MXSyncCore;
if (!core || typeof core.mergeProfiles !== 'function') throw new Error('MXSyncCore.mergeProfiles unavailable');

const local = {
  uid: 'u1', profileId: 'p1', playerName: 'wHiTeWaY', cur: 59,
  stars: Object.fromEntries(Array.from({length: 59}, (_, i) => [String(i), 3])),
  coins: 500, researchPoints: 900, lang: 'en'
};
const staleCloud = {
  uid: 'u1', profileId: 'p1', playerName: 'wHiTeWaY', cur: 56,
  stars: Object.fromEntries(Array.from({length: 56}, (_, i) => [String(i), 2])),
  coins: 450, researchPoints: 800, lang: 'tr'
};
const merged = core.mergeProfiles(local, staleCloud, { settings: 'right', identity: 'right', includeBonus: true, now: new Date('2026-08-06T00:00:00Z') });
if (merged.cur !== 59) throw new Error(`Progress rollback: expected 59, got ${merged.cur}`);
if (merged.stars['58'] !== 3) throw new Error('Newest local stars were lost');
if (merged.lang !== 'tr') throw new Error('Cloud-side settings preference was not preserved');

const gameCode = fs.readFileSync(path.join(root, 'www/js/game.js'), 'utf8');
const checks = [
  ['monotonic cloud comment', 'progress must be monotonic'],
  ['suspend journal', 'preserveProgressBeforeSuspend'],
  ['pagehide checkpoint', "window.addEventListener('pagehide'"],
  ['auth-independent checkpoint', 'if(!window.MXCloud||!save||!save.profileId)return;']
];
for (const [label, needle] of checks) if (!gameCode.includes(needle)) throw new Error(`Missing ${label}`);
console.log('Progress save race regression checks passed.');
