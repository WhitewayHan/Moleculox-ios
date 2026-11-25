/* Godot platform transport only. Gameplay and UI stay in native Godot nodes.
 * Production Firebase/profile rules/sync modules are packaged unchanged in vendor/.
 * No HTML, old game script, credential storage, or independent save format is used.
 */
(function (root) {
  "use strict";
  if (root.MXGodotCloudAdapter) return;

  const methods = new Set((`
    ensureAnonymous refreshPersistence connectGoogle connectGoogleIdToken connectApple
    connectAppleIdToken registerEmail signInEmail resetPassword signOutToGuest
    deleteCurrentAuthAccount deleteAccountAndData setAuthDisplayName saveProgress
    saveProgressNow getLastSaveError loadProfile listProfiles syncLeaderboard
    repairLeaderboard startLevelAttempt submitLevelResult updateDisplayName
    claimDailyExperiment claimDailyLogin deleteCloudProfile cleanupOrphanRankingRows
    cleanupPlaceholderRankingRows reportPlayerName getLeaderboard getWeeklyLeaderboard
    getMonthlyLeaderboard getMyRankingStatus clearLeaderboardCache getChampions
    syncDuelLeaderboard getDuelLeaderboard createDuelRoom joinDuelRoom
    decodeFriendDuelCode heartbeatDuelRoom startDuelDisconnectCountdown
    resolveDuelDisconnect publishDuelLiveState publishDuelMoveEvent sendDuelQuickMessage
    submitDuelTurn advanceDuelRound rematchDuelRoom leaveDuelRoom createQuickMatchTicket
    tryQuickMatch cancelQuickMatch removeQuickMatchTicket startPresence
    getOnlinePlayerCount stopPresence track reportJsError cloudContextSnapshot
    cloudContextMatches isSkippedSaveResult
  `).trim().split(/\s+/));
  const events = [];
  const subscriptions = new Map();
  let cloud = null;
  let bootstrap = null;
  let unsubscribeAuth = null;
  let ready = false;
  let activeGeneration = 0;
  let activeUid = "";
  let source = {};
  let disposed = false;

  function jsonValue(value) {
    if (value === undefined) return null;
    return JSON.parse(JSON.stringify(value, (_, item) => {
      if (typeof item === "bigint") return Number(item);
      if (item && typeof item.toMillis === "function") {
        return {seconds: Math.floor(item.toMillis() / 1000),
          nanoseconds: Math.round((item.toMillis() % 1000) * 1000000),
          milliseconds: item.toMillis()};
      }
      return item;
    }));
  }
  function packet(type, data) {
    if (!disposed) events.push({type, data: jsonValue(data)});
  }
  function failure(value, method) {
    return {code: String(value && (value.code || value.reason) || "cloud/error"),
      message: String(value && value.message || value || "Cloud operation failed"),
      stage: String(value && value.mxStage || ""), method: String(method || "")};
  }
  function reject(code, message) {
    return Object.assign(new Error(message || code), {code});
  }
  function snapshot() {
    return {available: !!cloud && ready, ready, uid: String(cloud && cloud.uid || ""),
      authFailed: !!(cloud && cloud.authFailed),
      account: cloud ? jsonValue(cloud.account) : {uid: "", authGeneration: 0,
        signedIn: false, isAnonymous: true, email: "", displayName: "", photoURL: "",
        emailVerified: false, providers: []},
      security: cloud ? jsonValue(cloud.security) : {},
      duelClientId: String(cloud && cloud.duelClientId || "")};
  }
  function stopSubscriptions() {
    for (const unsubscribe of subscriptions.values()) {
      try { unsubscribe(); } catch (_) {}
    }
    subscriptions.clear();
  }
  async function withTimeout(promise, milliseconds, method) {
    let timer;
    try {
      return await Promise.race([promise, new Promise((_, no) => {
        timer = setTimeout(() => no(reject("cloud/timeout", method + " timed out")), milliseconds);
      })]);
    } finally { clearTimeout(timer); }
  }
  function attachCloud(value) {
    cloud = value;
    if (!cloud || typeof cloud.subscribeAuth !== "function") {
      throw reject("cloud/sdk-unavailable", "Firebase cloud SDK did not initialize");
    }
    if (unsubscribeAuth) unsubscribeAuth();
    unsubscribeAuth = cloud.subscribeAuth((account) => {
      const nextUid = String(account && account.uid || "");
      const nextGeneration = Number(account && account.authGeneration || 0);
      if (nextUid !== activeUid || nextGeneration !== activeGeneration) stopSubscriptions();
      activeUid = nextUid;
      activeGeneration = nextGeneration;
      packet("account_changed", account);
      // A failed anonymous bootstrap must not permanently disable account sign-in.
      // Firebase can restore a member later when connectivity returns.
      if (!ready && account && account.signedIn && !cloud.authFailed) {
        ready = true;
        packet("ready", snapshot());
      }
    });
  }
  async function importPackagedModules() {
    if (!root.MXSyncCore) {
      if (!source.syncSource) throw reject("cloud/missing-module", "Packaged sync-core.js is missing");
      // The source is an immutable first-party PCK resource, never downloaded HTML.
      (0, eval)(source.syncSource);
    }
    if (root.MXCloud) return root.MXCloud;
    if (!source.firebaseSource || !source.rulesSource) {
      throw reject("cloud/missing-module", "Packaged Firebase adapter is missing");
    }
    const rulesUrl = URL.createObjectURL(new Blob([source.rulesSource], {type: "text/javascript"}));
    const firebaseSource = source.firebaseSource.replace(
      'from "./profile-rules-compat.js"', 'from ' + JSON.stringify(rulesUrl));
    const firebaseUrl = URL.createObjectURL(new Blob([firebaseSource], {type: "text/javascript"}));
    try { await import(firebaseUrl); }
    finally {
      URL.revokeObjectURL(firebaseUrl);
      URL.revokeObjectURL(rulesUrl);
    }
    return root.MXCloud;
  }
  async function start(options) {
    if (bootstrap) return bootstrap;
    disposed = false;
    source = Object.assign({}, source, options || {});
    bootstrap = (async () => {
      try {
        // Explicit dependency injection is for offline contract tests and native hosts.
        attachCloud(source.cloud || await importPackagedModules());
        await withTimeout(Promise.resolve(cloud.ready), 12000, "bootstrap");
        ready = !cloud.authFailed;
        const state = snapshot();
        packet("ready", state);
        if (!ready) packet("error", failure(reject("cloud/auth-unavailable", "Firebase authentication unavailable"), "bootstrap"));
        return state;
      } catch (error) {
        ready = false;
        packet("error", failure(error, "bootstrap"));
        packet("ready", snapshot());
        return snapshot();
      }
    })();
    return bootstrap;
  }
  function subscribe(kind, key) {
    const id = kind + ":" + String(key || "");
    if (!key) throw reject("cloud/invalid-subscription", "A room or match identifier is required");
    if (subscriptions.has(id)) subscriptions.get(id)();
    const method = kind === "room" ? "subscribeDuelRoom" : "subscribeQuickMatchTicket";
    if (typeof cloud[method] !== "function") throw reject("cloud/unsupported-method", method);
    const unsubscribe = cloud[method](String(key), (value) => {
      packet(kind === "room" ? "room_updated" : "match_updated", {key: String(key), value});
    }, (error) => packet("error", failure(error, method)));
    subscriptions.set(id, typeof unsubscribe === "function" ? unsubscribe : () => {});
    return {subscribed: true, key: String(key), kind};
  }
  function unsubscribe(kind, key) {
    const id = kind + ":" + String(key || "");
    if (subscriptions.has(id)) subscriptions.get(id)();
    subscriptions.delete(id);
    return {subscribed: false, key: String(key || ""), kind};
  }
  async function call(method, args) {
    const authMethod = /^(connect|registerEmail|signInEmail|resetPassword|ensureAnonymous|refreshPersistence|signOutToGuest)/.test(method);
    if (!cloud || (!ready && !authMethod)) throw reject("cloud/sdk-unavailable", "Cloud SDK is unavailable; local progress is retained");
    if (method === "snapshot") return snapshot();
    if (method === "subscribeDuelRoom") return subscribe("room", args[0]);
    if (method === "subscribeQuickMatchTicket") return subscribe("match", args[0]);
    if (method === "unsubscribeDuelRoom") return unsubscribe("room", args[0]);
    if (method === "unsubscribeQuickMatchTicket") return unsubscribe("match", args[0]);
    if (method === "mergeProfiles") {
      if (!root.MXSyncCore) throw reject("cloud/sync-unavailable", "Sync core is unavailable");
      // Reserved ledgers use the original merge. Preserve future local fields too.
      const left = args[0] || {}, right = args[1] || {};
      return Object.assign({}, right, left, root.MXSyncCore.mergeProfiles(left, right, args[2] || {}));
    }
    if (!methods.has(method) || typeof cloud[method] !== "function") {
      throw reject("cloud/unsupported-method", "Unsupported cloud operation: " + method);
    }
    const value = await cloud[method](...args);
    if (method === "listProfiles") {
      if (!Array.isArray(value)) throw reject("cloud/list-unavailable", "Cloud profiles could not be loaded");
      packet("profiles", value);
    }
    if (method === "saveProgress" || method === "saveProgressNow") {
      if (!value) throw reject("cloud/save-failed", "Cloud progress was not confirmed");
      if (value.__mxSaveSkipped) throw reject(value.reason || "cloud/account-context-changed", "Save skipped after account context changed");
    }
    if (value && value.ok === false) {
      throw reject(value.reason || "cloud/rejected", value.reason || "Cloud operation was rejected");
    }
    return value;
  }
  function invoke(id, method, argsJson) {
    Promise.resolve().then(async () => {
      let args = typeof argsJson === "string" ? JSON.parse(argsJson) : argsJson;
      if (!Array.isArray(args)) throw reject("cloud/invalid-arguments", "Cloud arguments must be an array");
      if (!bootstrap) await start(); else await bootstrap;
      const context = {uid: activeUid, generation: activeGeneration};
      const value = await withTimeout(call(String(method), args), 22000, String(method));
      // Auth operations intentionally change this context. All other late results
      // from a prior account must never be applied to the newly selected account.
      const authMethod = /^(connect|registerEmail|signInEmail|signOutToGuest|deleteCurrentAuthAccount|deleteAccountAndData)/.test(method);
      if (!authMethod && (context.uid !== activeUid || context.generation !== activeGeneration)) {
        throw reject("cloud/account-context-changed", "Account changed while the operation was running");
      }
      packet("result", {id, method, ok: true, value: jsonValue(value), accountUid: activeUid, authGeneration: activeGeneration});
    }).catch((error) => {
      const result = {id, method, ok: false, error: failure(error, method)};
      packet("error", result.error);
      packet("result", result);
    });
    return id;
  }
  function dispose() {
    stopSubscriptions();
    if (unsubscribeAuth) unsubscribeAuth();
    unsubscribeAuth = null;
    disposed = true;
    ready = false;
    events.length = 0;
  }
  if (root.addEventListener) root.addEventListener("mx-cloud-profile-merged", (event) => {
    packet("profile_merged", event && event.detail || {});
  });
  root.MXGodotCloudAdapter = Object.freeze({version: 1, start, invoke, snapshot,
    drain_events_json() { return JSON.stringify(events.splice(0)); }, dispose});
})(typeof window !== "undefined" ? window : globalThis);
