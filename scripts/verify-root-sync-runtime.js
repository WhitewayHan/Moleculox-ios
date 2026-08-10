'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const project = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const firebase = fs.readFileSync(path.join(project, 'www/js/firebase.js'), 'utf8');
const game = fs.readFileSync(path.join(project, 'www/js/game.js'), 'utf8');

function section(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  if (from < 0 || to < 0) throw new Error(`Could not extract ${start} .. ${end}`);
  return source.slice(from, to);
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return {promise, resolve, reject};
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeDebounceHarness() {
  const timeoutCode = section(firebase, 'function withCloudTimeout(', 'function cloneCloudSnapshot(');
  const contextCode = section(firebase, 'function cloneCloudSnapshot(', 'function providerIdsOf(');
  const stateCode = section(firebase, 'let saveTimer = null;', 'const deletedProfileIds');
  const saveCode = section(firebase, 'function saveProgress(save, profileId)', 'async function listProfiles()')
    .replace('}, 1100);', '}, 10);');
  const source = `
    let uid = null;
    let authGeneration = 0;
    const CLOUD_OPERATION_TIMEOUT_MS = 15000;
    ${timeoutCode}
    ${contextCode}
    let writes = [];
    let writeMode = 'success';
    async function writeProgress(save, profileId, context) {
      writes.push({snapshot: cloneCloudSnapshot(save), profileId, context: Object.assign({}, context)});
      if (writeMode === 'throw') {
        const err = new Error('permission-denied');
        err.code = 'permission-denied';
        throw err;
      }
      return {ok: true, cur: save.cur, nested: save.nested, accountUid: context.uid};
    }
    ${stateCode}
    const deletedProfileIds = new Set();
    ${saveCode}
    globalThis.api = {
      saveProgress,
      getLastSaveError,
      writes: () => writes,
      clearWrites: () => { writes = []; },
      mode: (value) => { writeMode = value; },
      setUid: (next) => {
        next = next || null;
        if (String(next || '') !== String(uid || '')) authGeneration += 1;
        uid = next;
      },
      context: cloudContextSnapshot,
    };
  `;
  const context = vm.createContext({
    console: {warn() {}, info() {}, log() {}},
    setTimeout,
    clearTimeout,
  });
  vm.runInContext(source, context, {filename: 'firebase-debounce-runtime-harness.js'});
  return context.api;
}

async function testDebounceAndErrorScoping() {
  const api = makeDebounceHarness();

  api.setUid('APPLE_A');
  const mutable = {cur: 3, nested: {stars: 2}};
  const frozenPromise = api.saveProgress(mutable, 'profile-a');
  mutable.cur = 99;
  mutable.nested.stars = 9;
  const frozenResult = await frozenPromise;
  assert.equal(frozenResult.cur, 3);
  assert.deepEqual(plain(api.writes()[0].snapshot), {cur: 3, nested: {stars: 2}});
  assert.equal(api.writes()[0].context.uid, 'APPLE_A');

  api.clearWrites();
  const stalePromise = api.saveProgress({cur: 4}, 'profile-a');
  api.setUid('GOOGLE_B');
  const staleResult = await stalePromise;
  assert.equal(staleResult.__mxSaveSkipped, true);
  assert.equal(staleResult.committed, false);
  assert.equal(api.writes().length, 0);

  api.setUid('APPLE_A');
  const oldPromise = api.saveProgress({cur: 5}, 'profile-a');
  api.setUid('GOOGLE_B');
  const newPromise = api.saveProgress({cur: 8}, 'profile-b');
  const [oldResult, newResult] = await Promise.all([oldPromise, newPromise]);
  assert.equal(oldResult.__mxSaveSkipped, true);
  assert.equal(newResult.cur, 8);
  assert.equal(api.writes().length, 1);
  assert.equal(api.writes()[0].context.uid, 'GOOGLE_B');

  api.clearWrites();
  api.setUid('APPLE_A');
  api.mode('throw');
  assert.equal(await api.saveProgress({cur: 10}, 'profile-a'), false);
  assert.equal(api.getLastSaveError().code, 'permission-denied');
  api.setUid('GOOGLE_B');
  assert.equal(api.getLastSaveError(), null);
}

function makeTransactionHarness() {
  const contextCode = section(firebase, 'function cloneCloudSnapshot(', 'function providerIdsOf(');
  const payloadCode = section(firebase, 'function profilePayload(', 'async function writeProgressTransaction(');
  const transactionCode = section(firebase, 'async function writeProgressTransaction(', 'async function writeProgress(');
  const source = `
    let uid = null;
    let authGeneration = 0;
    const db = {name: 'mock-db'};
    const RP_SCHEMA = 3;
    const SAVE_SCHEMA = 5;
    const SECURE_BACKEND_ENABLED = false;
    let runImpl;
    let events = [];
    let leaderboardCalls = [];
    function cleanName(value) { return String(value || 'Player').slice(0, 18); }
    function serverTimestamp() { return '__server_timestamp__'; }
    function doc(_db, ...parts) { return {path: parts.join('/')}; }
    function runTransaction(_db, callback) { return runImpl(_db, callback); }
    function syncLeaderboard(data, profileId, immediate) {
      leaderboardCalls.push({kind: 'classic', data, profileId, immediate});
    }
    function syncDuelLeaderboard(data, profileId, immediate) {
      leaderboardCalls.push({kind: 'duel', data, profileId, immediate});
    }
    class CustomEvent {
      constructor(type, init) { this.type = type; this.detail = init && init.detail; }
    }
    const window = {
      MXSyncCore: {mergeProfiles: (incoming, oldData) => Object.assign({}, oldData, incoming)},
      dispatchEvent: (event) => { events.push(event); },
    };
    ${contextCode}
    ${payloadCode}
    ${transactionCode}
    globalThis.api = {
      writeProgressTransaction,
      snapshot: cloudContextSnapshot,
      setUid: (next) => {
        next = next || null;
        if (String(next || '') !== String(uid || '')) authGeneration += 1;
        uid = next;
      },
      setRunImpl: (value) => { runImpl = value; },
      events: () => events,
      leaderboardCalls: () => leaderboardCalls,
      resetEffects: () => { events = []; leaderboardCalls = []; },
    };
  `;
  const context = vm.createContext({console: {warn() {}, log() {}}});
  vm.runInContext(source, context, {filename: 'firebase-transaction-runtime-harness.js'});
  return context.api;
}

async function testTransactionOwnerAndGenerationGuards() {
  const api = makeTransactionHarness();
  const writes = [];

  api.setUid('APPLE_A');
  const appleContext = plain(api.snapshot());
  api.setRunImpl(async (_db, callback) => {
    const tx = {
      get: async () => ({exists: () => false, data: () => ({})}),
      set: (ref, payload, options) => writes.push({ref, payload: plain(payload), options}),
    };
    await callback(tx);
  });
  const result = await api.writeProgressTransaction(
    {playerName: 'Ada', cur: 7, stars: {1: 3}},
    'profile-a', true, true, true, appleContext,
  );
  assert.equal(result.uid, 'APPLE_A');
  assert.equal(writes[0].ref.path, 'players/APPLE_A/profiles/profile-a');
  assert.equal(writes[0].payload.uid, 'APPLE_A');
  assert.equal(api.events()[0].detail.accountUid, 'APPLE_A');

  api.resetEffects();
  writes.length = 0;
  const getStarted = deferred();
  const getGate = deferred();
  api.setUid('APPLE_A');
  const beforeReadContext = plain(api.snapshot());
  api.setRunImpl(async (_db, callback) => {
    const tx = {
      get: async () => {
        getStarted.resolve();
        await getGate.promise;
        return {exists: () => false, data: () => ({})};
      },
      set: (ref, payload, options) => writes.push({ref, payload: plain(payload), options}),
    };
    await callback(tx);
  });
  const beforeRead = api.writeProgressTransaction(
    {playerName: 'Ada', cur: 8}, 'profile-a', true, true, true, beforeReadContext,
  );
  await getStarted.promise;
  api.setUid('GOOGLE_B');
  getGate.resolve();
  await assert.rejects(beforeRead, (error) => error && error.code === 'cloud/account-context-changed');
  assert.equal(writes.length, 0);

  api.resetEffects();
  writes.length = 0;
  api.setUid('APPLE_A');
  const beforeCommitContext = plain(api.snapshot());
  const callbackFinished = deferred();
  const commitGate = deferred();
  api.setRunImpl(async (_db, callback) => {
    const tx = {
      get: async () => ({exists: () => false, data: () => ({})}),
      set: (ref, payload, options) => writes.push({ref, payload: plain(payload), options}),
    };
    await callback(tx);
    callbackFinished.resolve();
    await commitGate.promise;
  });
  const beforeCommit = api.writeProgressTransaction(
    {playerName: 'Ada', cur: 9}, 'profile-a', true, true, true, beforeCommitContext,
  );
  await callbackFinished.promise;
  api.setUid('GOOGLE_B');
  api.setUid('APPLE_A');
  commitGate.resolve();
  const staleCommitResult = await beforeCommit;
  assert.equal(staleCommitResult.__mxSaveSkipped, true);
  assert.equal(staleCommitResult.committed, true);
  assert.equal(writes[0].ref.path, 'players/APPLE_A/profiles/profile-a');
  assert.equal(writes[0].payload.uid, 'APPLE_A');
  assert.equal(api.events().length, 0);
  assert.equal(api.leaderboardCalls().length, 0);
}

function makeSyncTruthHarness() {
  const storageCode = section(game, 'function cloudSyncStorageKey(', 'function formatCloudDate(');
  const statusCode = section(game, 'function setSyncStatus(s)', 'let leaderboardRepairPromise');
  const source = `
    let cloudUid = 'APPLE_A';
    let save = {profileId: 'profile-a'};
    let syncStatus = 'idle';
    const values = new Map();
    const localStorage = {
      getItem: (key) => values.has(key) ? values.get(key) : null,
      setItem: (key, value) => values.set(key, String(value)),
    };
    function currentCloudAuthUid() { return cloudUid; }
    const document = {getElementById: () => null};
    ${storageCode}
    ${statusCode}
    globalThis.api = {
      setSyncStatus,
      markCloudSaveConfirmed,
      readLastCloudSync,
      status: () => syncStatus,
      setUid: (value) => { cloudUid = value; },
    };
  `;
  const context = vm.createContext({Date, Intl});
  vm.runInContext(source, context, {filename: 'game-sync-truth-runtime-harness.js'});
  return context.api;
}

function testSyncTimestampTruth() {
  const api = makeSyncTruthHarness();
  api.setSyncStatus('saved');
  assert.equal(api.readLastCloudSync('profile-a', 'APPLE_A'), 0);
  assert.ok(api.markCloudSaveConfirmed('profile-a', 'APPLE_A') > 0);
  assert.ok(api.readLastCloudSync('profile-a', 'APPLE_A') > 0);
  api.setUid('GOOGLE_B');
  assert.equal(api.markCloudSaveConfirmed('profile-a', 'APPLE_A'), 0);
  assert.equal(api.readLastCloudSync('profile-a', 'GOOGLE_B'), 0);
}

function makeManualSyncHarness() {
  const contextCode = section(game, 'function currentCloudAuthUid()', '// R31: permanent accounts');
  const manualCode = section(game, 'async function runManualCloudSync(btn)', 'function openCloudStatusModal(');
  const source = `
    let accountContextEpoch = 0;
    let profileContextEpoch = 0;
    let save = {profileId: 'profile-a', playerName: 'Apple Player', cur: 10};
    let accountState = {uid: 'APPLE_A', isAnonymous: false};
    let calls = [];
    let cleanupResolve;
    let cleanupStartedResolve;
    const cleanupStarted = new Promise((resolve) => { cleanupStartedResolve = resolve; });
    const cleanupGate = new Promise((resolve) => { cleanupResolve = resolve; });
    const navigator = {onLine: true};
    const window = {MXCloud: {
      uid: 'APPLE_A',
      ready: Promise.resolve(),
      saveProgressNow: async (snapshot, profileId) => { calls.push({kind: 'save', uid: window.MXCloud.uid, profileId}); return {...snapshot, profileId}; },
      cleanupOrphanRankingRows: async () => {
        calls.push({kind: 'cleanup-start', uid: window.MXCloud.uid, profileId: save.profileId});
        cleanupStartedResolve();
        await cleanupGate;
        calls.push({kind: 'cleanup-end', uid: window.MXCloud.uid, profileId: save.profileId});
        return {ok: true};
      },
      syncDuelLeaderboard: async (snapshot, profileId) => {
        calls.push({kind: 'duel', uid: window.MXCloud.uid, profileId, snapshot: {...snapshot}});
        return {ok: true};
      },
    }};
    function accountCopy() {
      return {syncGuest: 'guest', syncOffline: 'offline', syncWorking: 'working',
        syncSavedRankPending: 'rank-pending', syncSuccess: 'success'};
    }
    function setAuthBusy(_btn, on) { calls.push({kind: 'busy', on, uid: window.MXCloud.uid}); }
    function setSyncStatus(value) { calls.push({kind: 'status', value, uid: window.MXCloud.uid}); }
    function reconcileAccountProfiles() { calls.push({kind: 'reconcile', uid: window.MXCloud.uid}); return Promise.resolve(true); }
    function applyMergedCloudProfile() {}
    function markCloudSaveConfirmed(profileId, uid) { calls.push({kind: 'confirmed', profileId, uid}); }
    async function repairCurrentLeaderboard() {
      calls.push({kind: 'classic', uid: window.MXCloud.uid, profileId: save.profileId});
      return {ok: true};
    }
    function openCloudStatusModal(message, good) {
      calls.push({kind: 'modal', message, good, uid: window.MXCloud.uid});
    }
    function recordCloudDiagnostic() {}
    function isRetryableCloudError() { return false; }
    function queueLevelCloudCheckpoint() {}
    function preserveHealthyStatusAfterTimeout() {}
    ${contextCode}
    ${manualCode}
    globalThis.api = {
      run: () => runManualCloudSync({}),
      cleanupStarted,
      releaseCleanup: () => cleanupResolve(),
      switchToGoogle: () => {
        accountContextEpoch += 1;
        accountState = {uid: 'GOOGLE_B', isAnonymous: false};
        window.MXCloud.uid = 'GOOGLE_B';
        save = {profileId: 'profile-b', playerName: 'Google Player', cur: 2};
      },
      calls: () => calls,
    };
  `;
  const context = vm.createContext({console: {warn() {}}});
  vm.runInContext(source, context, {filename: 'game-manual-sync-runtime-harness.js'});
  return context.api;
}

async function detectManualSyncStaleContinuation() {
  const api = makeManualSyncHarness();
  const operation = api.run();
  let operationError = null;
  operation.catch((error) => { operationError = error; });
  for (let index = 0; index < 20 && !plain(api.calls()).some((call) => call.kind === 'cleanup-start'); index += 1) {
    await Promise.resolve();
  }
  if (!plain(api.calls()).some((call) => call.kind === 'cleanup-start')) {
    throw new Error('manual cleanup was not reached: '+JSON.stringify(plain(api.calls())));
  }
  api.switchToGoogle();
  api.releaseCleanup();
  for (let index = 0; index < 20; index += 1) await Promise.resolve();
  if (operationError) throw operationError;
  const calls = plain(api.calls());
  const stopped = calls.some((call) => call.kind === 'busy' && call.on === false && call.uid === 'GOOGLE_B');
  const staleContinuation = calls.some((call) => call.kind === 'classic' && call.uid === 'GOOGLE_B') &&
    calls.some((call) => call.kind === 'duel' && call.uid === 'GOOGLE_B' && call.profileId === 'profile-b') &&
    calls.some((call) => call.kind === 'status' && call.value === 'saved' && call.uid === 'GOOGLE_B');
  return {stopped, staleContinuation, calls};
}

async function testManualSyncNormalCompletion() {
  const api = makeManualSyncHarness();
  let operationError = null;
  api.run().catch((error) => { operationError = error; });
  for (let index = 0; index < 20 && !plain(api.calls()).some((call) => call.kind === 'cleanup-start'); index += 1) {
    await Promise.resolve();
  }
  assert.ok(plain(api.calls()).some((call) => call.kind === 'cleanup-start'));
  api.releaseCleanup();
  for (let index = 0; index < 30 && !plain(api.calls()).some((call) => call.kind === 'modal'); index += 1) {
    await Promise.resolve();
  }
  if (operationError) throw operationError;
  const calls = plain(api.calls());
  assert.ok(calls.some((call) => call.kind === 'classic' && call.uid === 'APPLE_A' && call.profileId === 'profile-a'));
  assert.ok(calls.some((call) => call.kind === 'duel' && call.uid === 'APPLE_A' && call.profileId === 'profile-a'));
  assert.ok(calls.some((call) => call.kind === 'status' && call.value === 'saved' && call.uid === 'APPLE_A'));
  assert.ok(calls.some((call) => call.kind === 'modal' && call.message === 'success' && call.good === true && call.uid === 'APPLE_A'));
}

function makeCleanupHarness() {
  const cleanupCode = section(firebase, 'async function cleanupOrphanRankingRows()', '// R5 — remove legacy placeholder');
  const source = `
    const readyPromise = Promise.resolve();
    const db = {};
    let uid = 'APPLE_A';
    let authGeneration = 1;
    let currentUser = {uid: 'APPLE_A', isAnonymous: false};
    let firstGetResolve;
    let firstGetStartedResolve;
    const firstGetStarted = new Promise((resolve) => { firstGetStartedResolve = resolve; });
    const firstGet = new Promise((resolve) => { firstGetResolve = resolve; });
    let getCount = 0;
    let deletes = [];
    let leaderboardRowUid = 'GOOGLE_B';
    let leaderboardProfileId = 'profile-b';
    function collection(_db, ...parts) { return {path: parts.join('/')}; }
    function cloudContextSnapshot() { return {uid: String(uid || ''), generation: authGeneration}; }
    function cloudContextMatches(context) {
      return !!context && String(context.uid || '') === String(uid || '') && Number(context.generation) === Number(authGeneration);
    }
    function safeProfileId(value) { return String(value || ''); }
    async function getDocs(ref) {
      getCount += 1;
      if (getCount === 1) {
        firstGetStartedResolve(ref.path);
        return firstGet;
      }
      if (ref.path === 'leaderboard') {
        return {forEach: (callback) => callback({
          data: () => ({uid: leaderboardRowUid, profileId: leaderboardProfileId}),
          ref: {path: 'leaderboard/' + leaderboardRowUid + '_' + leaderboardProfileId},
        })};
      }
      return {forEach: () => {}};
    }
    function deleteDoc(ref) { deletes.push(ref.path); return Promise.resolve(); }
    function clearLeaderboardCaches() {}
    ${cleanupCode}
    globalThis.api = {
      run: cleanupOrphanRankingRows,
      firstGetStarted,
      resolveAppleProfiles: () => firstGetResolve({
        forEach: (callback) => callback({id: 'profile-a'}),
      }),
      switchToGoogle: () => {
        authGeneration += 1;
        uid = 'GOOGLE_B';
        currentUser = {uid: 'GOOGLE_B', isAnonymous: false};
      },
      setLeaderboardRow: (rowUid, profileId) => {
        leaderboardRowUid = rowUid;
        leaderboardProfileId = profileId;
      },
      deletes: () => deletes,
    };
  `;
  const context = vm.createContext({console: {warn() {}}, Set, Promise});
  vm.runInContext(source, context, {filename: 'firebase-cleanup-runtime-harness.js'});
  return context.api;
}

async function detectCleanupUidRace() {
  const api = makeCleanupHarness();
  const operation = api.run();
  let settled = false;
  let operationResult = null;
  let operationError = null;
  operation.then((value) => { settled = true; operationResult = value; }, (error) => { settled = true; operationError = error; });
  const initialPath = await api.firstGetStarted;
  api.switchToGoogle();
  api.resolveAppleProfiles();
  for (let index = 0; index < 20 && !settled; index += 1) await Promise.resolve();
  if (operationError) throw operationError;
  if (!settled) throw new Error('orphan cleanup did not settle after the account-context change');
  const deletes = plain(api.deletes());
  return {
    initialPath,
    result: plain(operationResult),
    deletes,
    crossedAccounts: initialPath === 'players/APPLE_A/profiles' && deletes.includes('leaderboard/GOOGLE_B_profile-b'),
  };
}

async function testCleanupNormalCompletion() {
  const api = makeCleanupHarness();
  api.setLeaderboardRow('APPLE_A', 'orphan-profile');
  const operation = api.run();
  let settled = false;
  let operationResult = null;
  let operationError = null;
  operation.then((value) => { settled = true; operationResult = value; }, (error) => { settled = true; operationError = error; });
  assert.equal(await api.firstGetStarted, 'players/APPLE_A/profiles');
  api.resolveAppleProfiles();
  for (let index = 0; index < 30 && !settled; index += 1) await Promise.resolve();
  if (operationError) throw operationError;
  assert.equal(settled, true);
  assert.deepEqual(plain(operationResult), {ok: true, removed: 1});
  assert.deepEqual(plain(api.deletes()), ['leaderboard/APPLE_A_orphan-profile']);
}

async function main() {
  const results = [];
  async function passed(name, fn) {
    await fn();
    results.push({name, pass: true});
  }

  await passed('Debounced save freezes snapshot and rejects stale UID/generation', testDebounceAndErrorScoping);
  await passed('Progress transaction freezes owner path/payload and neutralizes stale completion', testTransactionOwnerAndGenerationGuards);
  await passed('Saved UI state does not fabricate Last successful sync timestamp', testSyncTimestampTruth);
  await passed('Manual Sync Now completes normally without an account switch', testManualSyncNormalCompletion);
  await passed('Orphan ranking cleanup still removes the active account orphan', testCleanupNormalCompletion);

  const manual = await detectManualSyncStaleContinuation();
  results.push({
    name: 'Manual Sync Now stops all post-save work after account switch',
    pass: manual.stopped && !manual.staleContinuation,
    evidence: manual.calls,
  });

  const cleanup = await detectCleanupUidRace();
  results.push({
    name: 'Orphan ranking cleanup keeps one immutable account context across awaits',
    pass: !cleanup.crossedAccounts,
    evidence: cleanup,
  });

  for (const result of results) {
    console.log(`${result.pass ? 'PASS' : 'FAIL'}  ${result.name}`);
    if (!result.pass) console.log(JSON.stringify(result.evidence, null, 2));
  }
  const failed = results.filter((result) => !result.pass).length;
  console.log(`\nRuntime behavior summary: ${results.length - failed} passed, ${failed} failed.`);
  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error && error.stack || error);
  process.exitCode = 1;
});
