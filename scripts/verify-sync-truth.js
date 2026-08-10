'use strict';
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const game=fs.readFileSync(path.join(root,'www/js/game.js'),'utf8');
const start=game.indexOf('function setSyncStatus(s)');
const end=game.indexOf('let leaderboardRepairPromise',start);
if(start<0||end<0)throw new Error('setSyncStatus block unavailable');
const block=game.slice(start,end);
const executable=block.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');
if(executable.includes('recordLastCloudSync(')||executable.includes('markCloudSaveConfirmed('))throw new Error('UI status still advances confirmed sync timestamp');
const required=[
  'function markCloudSaveConfirmed(profileId,uidOverride)',
  "const MX_CLOUD_DIAG_KEY='mxCloudSyncDiagnosticsR36';",
  'function cloudDiagnosticText(err)',
  "base=ml('Bulut senkronizasyonu tamamlanamadı.'",
  'function isRetryableCloudError(err)',
  "code==='cloud/account-context-changed'"
];
for(const needle of required)if(!game.includes(needle))throw new Error('Missing sync-truth fix: '+needle);
const diagStart=game.indexOf('function cloudDiagnosticText(err)');
const diagEnd=game.indexOf('async function runManualCloudSync',diagStart);
if(game.slice(diagStart,diagEnd).includes('authErrorText('))throw new Error('Cloud diagnostics still route through auth/sign-in error text');
console.log('R37 sync truth/diagnostic checks passed.');
