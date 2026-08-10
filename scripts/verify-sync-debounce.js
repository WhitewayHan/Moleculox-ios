'use strict';
const fs = require('fs');
const path = require('path');
const code = fs.readFileSync(path.join(__dirname, '..', 'www/js/firebase.js'), 'utf8');
const must = [
  'let saveWaiters = [];',
  'async function executePendingSave(job, waiters)',
  'saveWaiters.push(resolve);',
  'settleSaveWaiters(waiters, result);',
  'snapshot: cloneCloudSnapshot(save)',
  'pendingSaveContext = nextJob.context;'
];
for (const needle of must) if (!code.includes(needle)) throw new Error(`Missing debounce fix: ${needle}`);
if (code.includes('saveTimerResolve(false)')) throw new Error('Cancelled debounce still resolves as a false sync failure');
console.log('Cloud sync debounce regression checks passed.');
