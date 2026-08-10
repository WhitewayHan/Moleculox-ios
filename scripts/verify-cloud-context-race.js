'use strict';
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const firebase=fs.readFileSync(path.join(root,'www/js/firebase.js'),'utf8');
const game=fs.readFileSync(path.join(root,'www/js/game.js'),'utf8');
const firebaseMust=[
  'let authGeneration = 0;',
  'function cloudContextSnapshot()',
  'function cloudContextMatches(context)',
  'snapshot: cloneCloudSnapshot(save)',
  'context: cloudContextSnapshot()',
  'pendingSaveContext = nextJob.context;',
  'const ref = doc(db, "players", ownerUid, "profiles", profileId);',
  'uid: ownerUid, profileId',
  'accountUid: ownerUid, authGeneration:',
  'if(finalPayload&&!stillCurrent)return skippedCloudSave(context,true);',
  'const ownerUid = String(context.uid || "");',
  'collection(db, "players", ownerUid, "profiles")',
  'removals.map((ref) => deleteDoc(ref))',
  'if (MX_NATIVE_AUTH_HOST) {\n    db = initializeFirestore(app, {ignoreUndefinedProperties: true});'
];
for(const needle of firebaseMust)if(!firebase.includes(needle))throw new Error('Missing Firebase R37 context guard: '+needle);
const gameMust=[
  'let accountContextEpoch=0;',
  'function captureCloudOperationContext(profileId)',
  'function cloudOperationContextIsCurrent(ctx)',
  'if(saveResultWasSkipped(result)||!cloudOperationContextIsCurrent(writeContext))',
  "if(detail.accountUid&&String(detail.accountUid)!==currentCloudAuthUid())return;",
  'markCloudSaveConfirmed(writeProfileId,writeContext.uid);',
  'const manualContextIsCurrent=()=>cloudOperationContextIsCurrent(manualContext);',
  'if(stopStaleManualSync())return false;',
  'syncDuelLeaderboard(duelSnapshot,manualProfileId,true)',
  'if(connectionContext&&!cloudOperationContextIsCurrent(connectionContext))return false;'
];
for(const needle of gameMust)if(!game.includes(needle))throw new Error('Missing game R37 context guard: '+needle);
if(game.includes('markCloudSyncSuccess();'))throw new Error('Undefined markCloudSyncSuccess call still present');
console.log('R37 Firebase/account context race checks passed.');
