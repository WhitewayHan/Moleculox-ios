import {initializeApp} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {initializeAppCheck, ReCaptchaV3Provider} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app-check.js";
import {
  getAuth, setPersistence, indexedDBLocalPersistence, browserLocalPersistence,
  signInAnonymously, onAuthStateChanged,
  GoogleAuthProvider, OAuthProvider, signInWithPopup, linkWithPopup,
  signInWithRedirect, linkWithRedirect, getRedirectResult, signInWithCredential,
  EmailAuthProvider, linkWithCredential, signInWithEmailAndPassword,
  sendPasswordResetEmail, sendEmailVerification, updateProfile,
  signOut, deleteUser,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, getDoc, setDoc, deleteDoc, collection, query, where, orderBy, limit, getDocs, serverTimestamp, runTransaction, onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import {getFunctions, httpsCallable} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-functions.js";
import {getAnalytics, logEvent, isSupported as analyticsIsSupported} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyC4BEvdWGtrzZBqa8fiPx-o7p_XTgHRy5w",
  authDomain: "moleculox-2f4b4.firebaseapp.com",
  projectId: "moleculox-2f4b4",
  storageBucket: "moleculox-2f4b4.firebasestorage.app",
  messagingSenderId: "638154711182",
  appId: "1:638154711182:web:1d8b4fc82f2c0c89ff69df",
  measurementId: "G-XTL1FWK41K",
};

// App Check stays optional until a real reCAPTCHA v3 site key is registered.
const RECAPTCHA_V3_SITE_KEY = "REPLACE_WITH_YOUR_RECAPTCHA_V3_SITE_KEY";
const SECURE_BACKEND_ENABLED = false;
const CLOUD_FUNCTIONS_ENABLED = false;
const FUNCTIONS_REGION = "europe-west1";

let db = null;
let analytics = null;
let auth = null;
let fx = null;
let uid = null;
let currentUser = null;
let authFailed = false;
let guestSignInInFlight = null;
let initialAuthCheckComplete = false;
let authRestorePromise = null;
let authOperationInFlight = false;
let readySettled = false;
let readyResolve;
const readyPromise = new Promise((resolve) => {
  readyResolve = resolve;
});
const authListeners = new Set();

// V8.4.28: Never leave the interface on “Saving…” forever when a WebView,
// iframe or flaky network stalls a Firestore request. The underlying SDK may
// still complete later, but the caller always receives a deterministic result.
const CLOUD_OPERATION_TIMEOUT_MS = 15000;
function withCloudTimeout(promise, label, timeoutMs = CLOUD_OPERATION_TIMEOUT_MS) {
  let timer = null;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(label || "cloud/timeout");
      err.code = "cloud/timeout";
      reject(err);
    }, Math.max(1000, Number(timeoutMs) || CLOUD_OPERATION_TIMEOUT_MS));
  });
  return Promise.race([Promise.resolve(promise), timeout]).finally(() => clearTimeout(timer));
}

function providerIdsOf(user) {
  return user && Array.isArray(user.providerData) ?
    user.providerData.map((p) => p && p.providerId).filter(Boolean) : [];
}
function accountSnapshot() {
  return {
    uid,
    signedIn: !!currentUser,
    isAnonymous: !currentUser || !!currentUser.isAnonymous,
    email: currentUser && currentUser.email ? currentUser.email : "",
    displayName: currentUser && currentUser.displayName ? currentUser.displayName : "",
    photoURL: currentUser && currentUser.photoURL ? currentUser.photoURL : "",
    emailVerified: !!(currentUser && currentUser.emailVerified),
    providers: providerIdsOf(currentUser),
  };
}
function notifyAuthListeners() {
  const snap = accountSnapshot();
  authListeners.forEach((cb) => {
    try {
      cb(snap);
    } catch (e) {
      console.warn("[MXCloud] auth listener failed:", e);
    }
  });
}
function subscribeAuth(cb) {
  if (typeof cb !== "function") return () => {};
  authListeners.add(cb);
  try {
    cb(accountSnapshot());
  } catch (e) {}
  return () => authListeners.delete(cb);
}
async function ensureAnonymous() {
  // Never create a guest until Firebase has finished restoring any persisted
  // Google/Apple/email session. This prevents an early anonymous user from replacing
  // the saved account inside embedded hosts such as itch.io.
  if (!initialAuthCheckComplete && authRestorePromise) {
    try {
      await authRestorePromise;
    } catch (e) {}
  }
  if (authOperationInFlight) return auth && auth.currentUser;
  if (!auth || auth.currentUser) return auth && auth.currentUser;
  if (!initialAuthCheckComplete) return null;
  if (guestSignInInFlight) return guestSignInInFlight;
  guestSignInInFlight = signInAnonymously(auth)
      .then((cred) => cred.user)
      .catch((err) => {
        authFailed = true;
        console.warn("[MXCloud] anonymous auth failed:", err && err.code);
        if (!readySettled) {
          readySettled = true;
          readyResolve(null);
        }
        throw err;
      })
      .finally(() => {
        guestSignInInFlight = null;
      });
  return guestSignInInFlight;
}

function applyAuthUser(user) {
  currentUser = user || null;
  uid = user ? user.uid : null;
  authFailed = false;
  notifyAuthListeners();
  if (user && !readySettled) {
    readySettled = true;
    readyResolve(uid);
  }
}

async function restorePersistentAuth() {
  // Persistence must be selected before listening to the initial auth state.
  // Otherwise an embedded page can observe a temporary null state and create
  // a guest before Firebase has restored the saved Google/email account.
  try {
    // IndexedDB is the most reliable persistent store for Firebase Auth inside
    // Safari/itch.io after Storage Access has been granted. Fall back to localStorage.
    try { await setPersistence(auth, indexedDBLocalPersistence); }
    catch (idbError) { await setPersistence(auth, browserLocalPersistence); }
  } catch (e) {
    console.warn("[MXCloud] persistent auth unavailable:", e && e.code);
  }

  // Complete a Google full-page redirect before deciding that no saved
  // member exists and creating a new anonymous guest.
  try { await finishPendingGoogleRedirect(); } catch (e) {}

  let firstAuthEventResolve;
  let firstAuthEventSettled = false;
  const firstAuthEvent = new Promise((resolve) => {
    firstAuthEventResolve = resolve;
  });

  onAuthStateChanged(auth, (user) => {
    applyAuthUser(user);
    if (!firstAuthEventSettled) {
      firstAuthEventSettled = true;
      firstAuthEventResolve(user || null);
    }
    if (!user && initialAuthCheckComplete) {
      // Delay one task so an in-progress account sign-in can finish before a
      // fallback guest is considered. Explicit sign-out/delete paths also call
      // ensureAnonymous and are deduplicated by guestSignInInFlight.
      setTimeout(() => {
        if (!authOperationInFlight && auth && !auth.currentUser) ensureAnonymous().catch(() => {});
      }, 1200);
    }
  });

  try {
    if (typeof auth.authStateReady === "function") await auth.authStateReady();
    else await firstAuthEvent;
  } catch (e) {
    console.warn("[MXCloud] persisted auth restore check failed:", e && e.code);
  }

  initialAuthCheckComplete = true;
  if (auth.currentUser) {
    applyAuthUser(auth.currentUser);
    return auth.currentUser;
  }
  return await ensureAnonymous();
}

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  fx = getFunctions(app, FUNCTIONS_REGION);
  try {
    if (RECAPTCHA_V3_SITE_KEY && RECAPTCHA_V3_SITE_KEY.indexOf("REPLACE_WITH") !== 0) {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(RECAPTCHA_V3_SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      });
    }
  } catch (e) {
    console.warn("[MXCloud] App Check not initialized:", e && e.message);
  }
  try {
    db = initializeFirestore(app, {ignoreUndefinedProperties: true, localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})});
  } catch (e) {
    db = initializeFirestore(app, {ignoreUndefinedProperties: true});
  }
  analyticsIsSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn("[MXCloud] analytics init failed (non-fatal):", e && e.message);
      }
    }
  }).catch(() => {});

  authRestorePromise = restorePersistentAuth().catch((e) => {
    authFailed = true;
    console.warn("[MXCloud] auth restore failed:", e && e.code, e && e.message);
    if (!readySettled) {
      readySettled = true;
      readyResolve(null);
    }
    return null;
  });
} catch (e) {
  authFailed = true;
  console.warn("[MXCloud] firebase init failed:", e);
  if (!readySettled) {
    readySettled = true;
    readyResolve(null);
  }
}

function shouldUseGoogleRedirect() {
  // V8.4.33: Do not use Firebase redirect auth on Netlify/itch/custom hosts.
  // Safari can return from the Google account picker without completing the
  // Firebase credential because redirect auth relies on cross-origin storage.
  // connectGoogle() opens the popup immediately inside the user's tap, which
  // keeps the flow reliable while preserving the current guest account.
  return false;
}

function setGoogleRedirectMarker(value) {
  try {
    if (value) sessionStorage.setItem("mx_google_redirect_v1", value);
    else sessionStorage.removeItem("mx_google_redirect_v1");
  } catch (e) {}
}

async function finishPendingGoogleRedirect() {
  if (!auth) return null;
  let pending = false;
  try { pending = sessionStorage.getItem("mx_google_redirect_v1") === "pending"; } catch (e) {}
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      applyAuthUser(result.user);
      setGoogleRedirectMarker("success");
      refreshPersistence().catch(() => {});
      return result.user;
    }
    // No result is normal on ordinary page loads. Clear only a stale marker;
    // a real redirect completion normally returns a user above.
    if (pending) setGoogleRedirectMarker("");
    return null;
  } catch (e) {
    console.warn("[MXCloud] Google redirect completion failed:", e && e.code, e && e.message);
    try { sessionStorage.setItem("mx_google_redirect_error_v1", String((e && e.code) || "auth/redirect-failed")); } catch (_) {}
    setGoogleRedirectMarker("");
    return null;
  }
}

async function refreshPersistence() {
  if (!auth) return false;
  try {
    try { await setPersistence(auth, indexedDBLocalPersistence); }
    catch (idbError) { await setPersistence(auth, browserLocalPersistence); }
    return true;
  } catch (e) {
    console.warn("[MXCloud] persistence refresh failed:", e && e.code);
    return false;
  }
}

async function connectGoogle() {
  // IMPORTANT: Do not await anything before opening the Google popup.
  // iPhone Safari and embedded itch.io games can otherwise lose the trusted
  // user gesture and block the popup even though the player tapped the button.
  if (!auth) throw Object.assign(new Error("auth/unavailable"), {code: "auth/unavailable"});
  const user = auth.currentUser;
  auth.useDeviceLanguage();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({prompt: "select_account"});
  authOperationInFlight = true;
  try {
    if (shouldUseGoogleRedirect()) {
      // Full-page redirect avoids the iOS Safari pop-up permission setting.
      // Local profiles are already persisted, so the auth listener can safely
      // reconcile them after Google returns to Moleculox.
      setGoogleRedirectMarker("pending");
      if (!user) {
        await signInWithRedirect(auth, provider);
      } else if (user.isAnonymous || !providerIdsOf(user).includes("google.com")) {
        await linkWithRedirect(user, provider);
      } else {
        await signInWithRedirect(auth, provider);
      }
      // Browsers normally navigate away before reaching this line. This guard
      // prevents the caller from attempting reconciliation on the old account.
      return {redirectStarted: true};
    }

    // Open the popup immediately inside the original tap gesture.
    // Persistence is configured during Firebase initialization; awaiting here
    // causes iPhone Safari/embedded browsers to block the popup.
    let result;
    if (!user) {
      // Direct Google sign-in is valid even before anonymous auth restoration finishes.
      result = await signInWithPopup(auth, provider);
    } else if (user.isAnonymous) {
      // Preserve the current guest UID and all progress when possible.
      result = await linkWithPopup(user, provider);
    } else if (!providerIdsOf(user).includes("google.com")) {
      // Existing email/password member: add Google as a second login method.
      result = await linkWithPopup(user, provider);
    } else {
      result = await signInWithPopup(auth, provider);
    }
    // Apply the authenticated user immediately. onAuthStateChanged can arrive
    // one task later on iPhone Safari; the game starts cloud reconciliation
    // as soon as this promise resolves, so waiting for that callback made it
    // still see the old guest account and report cloud/reconcile-failed.
    applyAuthUser(result.user);
    // Re-assert persistent auth after the popup has completed.
    refreshPersistence().catch(()=>{});
    return accountSnapshotFor(result.user);
  } catch (e) {
    console.warn("[MXCloud] Google sign-in failed:", e && e.code, e && e.message, "host:", location.hostname);
    const collision = [
      "auth/credential-already-in-use",
      "auth/email-already-in-use",
      "auth/account-exists-with-different-credential",
    ].includes(e && e.code);
    const credential = collision ? GoogleAuthProvider.credentialFromError(e) : null;
    if (credential) {
      if (user && !user.isAnonymous) {
        throw Object.assign(new Error("auth/provider-account-conflict"), {code: "auth/provider-account-conflict"});
      }
      const result = await signInWithCredential(auth, credential);
      applyAuthUser(result.user);
      refreshPersistence().catch(()=>{});
      return accountSnapshotFor(result.user);
    }
    throw e;
  } finally {
    authOperationInFlight = false;
  }
}

function accountSnapshotFor(user) {
  if (!user) return accountSnapshot();
  return {
    uid: user.uid,
    signedIn: true,
    isAnonymous: !!user.isAnonymous,
    email: user.email || "",
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
    emailVerified: !!user.emailVerified,
    providers: providerIdsOf(user),
  };
}

function appleProvider() {
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  provider.setCustomParameters({locale: (document.documentElement.lang || "en").toLowerCase().startsWith("tr") ? "tr_TR" : "en_US"});
  return provider;
}

async function connectApple() {
  // Keep the Apple popup inside the original tap gesture, matching the Google
  // path. The native iOS wrapper can instead call connectAppleIdToken().
  if (!auth) throw Object.assign(new Error("auth/unavailable"), {code: "auth/unavailable"});
  const user = auth.currentUser;
  if (!user) throw Object.assign(new Error("auth/not-ready"), {code: "auth/not-ready"});
  auth.useDeviceLanguage();
  const provider = appleProvider();
  try {
    let result;
    if (user.isAnonymous || !providerIdsOf(user).includes("apple.com")) {
      result = await linkWithPopup(user, provider);
    } else {
      result = await signInWithPopup(auth, provider);
    }
    return accountSnapshotFor(result.user);
  } catch (e) {
    console.warn("[MXCloud] Apple sign-in failed:", e && e.code, e && e.message, "host:", location.hostname);
    const collision = [
      "auth/credential-already-in-use",
      "auth/email-already-in-use",
      "auth/account-exists-with-different-credential",
    ].includes(e && e.code);
    const credential = collision ? OAuthProvider.credentialFromError(e) : null;
    if (credential) {
      if (user && !user.isAnonymous) {
        throw Object.assign(new Error("auth/provider-account-conflict"), {code: "auth/provider-account-conflict"});
      }
      const result = await signInWithCredential(auth, credential);
      return accountSnapshotFor(result.user);
    }
    throw e;
  }
}

async function connectGoogleIdToken(idToken) {
  await readyPromise;
  if (!auth) throw Object.assign(new Error("auth/unavailable"), {code: "auth/unavailable"});
  const token = String(idToken || "").trim();
  if (!token) throw Object.assign(new Error("auth/invalid-credential"), {code: "auth/invalid-credential"});
  const credential = GoogleAuthProvider.credential(token);
  const user = auth.currentUser;
  try {
    let result;
    if (user && (user.isAnonymous || !providerIdsOf(user).includes("google.com"))) result = await linkWithCredential(user, credential);
    else result = await signInWithCredential(auth, credential);
    return accountSnapshotFor(result.user);
  } catch (e) {
    const collision = [
      "auth/credential-already-in-use",
      "auth/email-already-in-use",
      "auth/account-exists-with-different-credential",
    ].includes(e && e.code);
    if (collision) {
      if (user && !user.isAnonymous) {
        throw Object.assign(new Error("auth/provider-account-conflict"), {code: "auth/provider-account-conflict"});
      }
      const result = await signInWithCredential(auth, credential);
      return accountSnapshotFor(result.user);
    }
    throw e;
  }
}


async function connectAppleIdToken(idToken, rawNonce, displayName) {
  await readyPromise;
  if (!auth) throw Object.assign(new Error("auth/unavailable"), {code: "auth/unavailable"});
  const token = String(idToken || "").trim();
  const nonce = String(rawNonce || "").trim();
  if (!token || !nonce) throw Object.assign(new Error("auth/invalid-credential"), {code: "auth/invalid-credential"});
  const credential = appleProvider().credential({idToken: token, rawNonce: nonce});
  const user = auth.currentUser;
  try {
    let result;
    if (user && (user.isAnonymous || !providerIdsOf(user).includes("apple.com"))) result = await linkWithCredential(user, credential);
    else result = await signInWithCredential(auth, credential);
    const name = String(displayName || "").trim().slice(0, 40);
    if (name && !result.user.displayName) await updateProfile(result.user, {displayName: name});
    return accountSnapshotFor(result.user);
  } catch (e) {
    const collision = [
      "auth/credential-already-in-use",
      "auth/email-already-in-use",
      "auth/account-exists-with-different-credential",
    ].includes(e && e.code);
    if (collision) {
      if (user && !user.isAnonymous) {
        throw Object.assign(new Error("auth/provider-account-conflict"), {code: "auth/provider-account-conflict"});
      }
      const updatedCredential = OAuthProvider.credentialFromError(e) || credential;
      const result = await signInWithCredential(auth, updatedCredential);
      const name = String(displayName || "").trim().slice(0, 40);
      if (name && !result.user.displayName) await updateProfile(result.user, {displayName: name});
      return accountSnapshotFor(result.user);
    }
    throw e;
  }
}

async function registerEmail(email, password, displayName) {
  await readyPromise;
  if (!auth) throw new Error("auth/unavailable");
  const cleanEmail = String(email || "").trim().toLowerCase();
  const credential = EmailAuthProvider.credential(cleanEmail, String(password || ""));
  let result;
  let user = auth.currentUser;
  if (!user) {
    try {
      await ensureAnonymous();
      user = auth.currentUser;
    } catch (e) {
      console.warn("[MXCloud] anonymous recovery before email registration failed:", e && e.code);
    }
  }
  if (!user) {
    throw Object.assign(new Error("auth/no-current-user"), {code: "auth/no-current-user"});
  }
  if (providerIdsOf(user).includes("password")) {
    throw Object.assign(new Error("auth/provider-already-linked"), {code: "auth/provider-already-linked"});
  }
  result = await linkWithCredential(user, credential);
  const name = String(displayName || "").trim().slice(0, 40);
  if (name) await updateProfile(result.user, {displayName: name});
  try {
    await sendEmailVerification(result.user);
  } catch (e) {
    console.warn("[MXCloud] verification email failed:", e && e.code);
  }
  return accountSnapshotFor(result.user);
}

async function signInEmail(email, password) {
  await readyPromise;
  if (!auth) throw new Error("auth/unavailable");
  const result = await signInWithEmailAndPassword(auth, String(email || "").trim().toLowerCase(), String(password || ""));
  return accountSnapshotFor(result.user);
}

async function resetPassword(email, language) {
  if (!auth) throw new Error("auth/unavailable");
  auth.languageCode = language === "tr" ? "tr" : "en";
  await sendPasswordResetEmail(auth, String(email || "").trim().toLowerCase());
  return true;
}

async function signOutToGuest() {
  if (!auth) throw new Error("auth/unavailable");
  await signOut(auth);
  await ensureAnonymous();
  return accountSnapshot();
}

async function deleteCurrentAuthAccount() {
  await readyPromise;
  if (!auth || !auth.currentUser || auth.currentUser.isAnonymous) return false;
  await deleteUser(auth.currentUser);
  await ensureAnonymous();
  return true;
}
async function deleteAccountAndData() {
  await readyPromise;
  if (!auth || !db || !auth.currentUser || auth.currentUser.isAnonymous) {
    throw Object.assign(new Error("auth/unavailable"), {code: "auth/unavailable"});
  }
  const user = auth.currentUser;
  const lastSignIn = Date.parse((user.metadata && user.metadata.lastSignInTime) || "");
  if (!lastSignIn || Date.now() - lastSignIn > 10 * 60 * 1000) {
    throw Object.assign(new Error("auth/requires-recent-login"), {code: "auth/requires-recent-login"});
  }
  const snap = await getDocs(collection(db, "players", user.uid, "profiles"));
  const removals = [];
  const secureDelete = SECURE_BACKEND_ENABLED && CLOUD_FUNCTIONS_ENABLED && fx ? httpsCallable(fx, "deleteSecureProfileData") : null;
  snap.forEach((item) => {
    const profileId = safeProfileId(item.id);
    if (profileId && secureDelete) {
      // The trusted backend owns both profile and competitive-data cleanup.
      removals.push(secureDelete({profileId}));
      return;
    }
    removals.push(deleteDoc(item.ref));
    if (profileId) { removals.push(deleteDoc(doc(db, "leaderboard", user.uid + "_" + profileId))); removals.push(deleteDoc(doc(db, "duelLeaderboard", user.uid + "_" + profileId))); }
  });
  // Never delete the Authentication account after a partial cloud cleanup.
  // Promise.all surfaces the failure so the UI can ask the player to retry.
  await Promise.all(removals);
  await deleteUser(user);
  await ensureAnonymous();
  return true;
}

function cleanName(v) {
  return String(v || "Player").replace(/[<>]/g, "").trim().slice(0, 18) || "Player";
}
function genRunId() {
  return "r_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 12);
}

// V6.9.3 — remove ranking rows whose profile no longer exists.
// This repairs old entries left behind by earlier profile-deletion builds.
async function cleanupOrphanRankingRows() {
  try {
    await readyPromise;
    if (!db || !uid || !currentUser || currentUser.isAnonymous) return {ok:false, reason:"account-required"};
    const profilesSnap = await getDocs(collection(db, "players", uid, "profiles"));
    const valid = new Set();
    profilesSnap.forEach((d) => valid.add(safeProfileId(d.id)));
    const [classicSnap, duelSnap] = await Promise.all([
      getDocs(collection(db, "leaderboard")),
      getDocs(collection(db, "duelLeaderboard")),
    ]);
    const removals = [];
    classicSnap.forEach((d) => {
      const row = d.data() || {};
      if (row.uid === uid && row.profileId && !valid.has(safeProfileId(row.profileId))) removals.push(deleteDoc(d.ref));
    });
    duelSnap.forEach((d) => {
      const row = d.data() || {};
      if (row.uid === uid && row.profileId && !valid.has(safeProfileId(row.profileId))) removals.push(deleteDoc(d.ref));
    });
    await Promise.all(removals);
    if (removals.length) clearLeaderboardCaches();
    return {ok:true, removed:removals.length};
  } catch (e) {
    console.warn("[MXCloud] orphan ranking cleanup failed:", e && e.code, e && e.message);
    return {ok:false, reason:(e && (e.code || e.message)) || "error"};
  }
}

// ---- Spark-plan world leaderboard ----
// World uses Career Score (RP + completed levels × 20 + stars × 5); schema-3 preserves all old progress. Permanent
// Google/Apple/email accounts can publish only their own profile document. The
// Firestore rules validate identity, field types, sensible limits and
// monotonic progress. This deters casual tampering, but a client-written
// leaderboard cannot provide the same anti-cheat guarantees as a server.
const LEADERBOARD_LEVEL_COUNT = 301;
const RP_SCHEMA = 3;
const SAVE_SCHEMA = 5;
const LEADERBOARD_SPEED_LEVELS = [2, 15, 35, 45, 55, 65];
const LEADERBOARD_MISSING_TIME_MS = 3600000;
const leaderboardLocalSignatures = new Map();
const leaderboardTimers = new Map();

function canPublishLeaderboard() {
  return !!(currentUser && !currentUser.isAnonymous && uid && db);
}
function safeProfileId(value) {
  const id = String(value || "").trim();
  return /^[A-Za-z0-9_-]{3,80}$/.test(id) ? id : "";
}
function leaderboardDocId(profileId) {
  const id = safeProfileId(profileId);
  return id && uid ? uid + "_" + id : "";
}
function leaderboardMetrics(save) {
  const stars = save && save.stars && typeof save.stars === "object" ? save.stars : {};
  let totalStars = 0; let completedLevels = 0; let perfectLevels = 0;
  Object.keys(stars).forEach((key) => {
    const level = Number(key);
    if (!Number.isInteger(level) || level < 0 || level >= LEADERBOARD_LEVEL_COUNT) return;
    const value = Math.max(0, Math.min(3, Math.floor(Number(stars[key]) || 0)));
    if (value > 0) completedLevels += 1;
    if (value === 3) perfectLevels += 1;
    totalStars += value;
  });
  const speedRuns = save && save.speedRuns && typeof save.speedRuns === "object" ? save.speedRuns : {};
  let totalValidatedSolveTime = 0;
  LEADERBOARD_SPEED_LEVELS.forEach((level) => {
    const seconds = Number(speedRuns[level]);
    totalValidatedSolveTime += Number.isFinite(seconds) && seconds > 0 && seconds <= 3600 ?
      Math.max(1, Math.round(seconds * 1000)) : LEADERBOARD_MISSING_TIME_MS;
  });
  return {totalStars, completedLevels, perfectLevels, totalValidatedSolveTime};
}
function leaderboardPayload(save, profileId) {
  const id = safeProfileId(profileId);
  if (!id) return null;
  const now = new Date();
  const seasonId = monthIdOf(now);
  const weekId = isoWeekId(now);
  return Object.assign({
    uid, profileId: id, playerName: cleanName(save && (save.playerName || "Player")),
    researchPoints: Math.max(0, Math.floor(Number(save && save.researchPoints) || 0)),
    seasonId,
    seasonRP: save && save.seasonId === seasonId ? Math.max(0, Math.floor(Number(save.seasonRP) || 0)) : 0,
    weekId,
    weekRP: save && save.weekId === weekId ? Math.max(0, Math.floor(Number(save.weekRP) || 0)) : 0,
    rpSchema: RP_SCHEMA,
    updatedAt: serverTimestamp(),
  }, leaderboardMetrics(save || {}));
}
function leaderboardSignature(payload) {
  return [payload.playerName, payload.rpSchema, payload.researchPoints, payload.seasonId, payload.seasonRP,
    payload.weekId, payload.weekRP, payload.totalStars, payload.completedLevels,
    payload.perfectLevels, payload.totalValidatedSolveTime].join("|");
}
async function writeLeaderboard(save, profileId, force) {
  if (!canPublishLeaderboard()) return {ok: false, reason: "account-required"};
  const boardId = leaderboardDocId(profileId);
  const localPayload = leaderboardPayload(save, profileId);
  if (!boardId || !localPayload) return {ok: false, reason: "invalid-profile"};
  const localSig = leaderboardSignature(localPayload);
  if (!force && leaderboardLocalSignatures.get(boardId) === localSig) return {ok: true, unchanged: true};
  const ref = doc(db, "leaderboard", boardId);
  try {
    const existingSnap = await getDoc(ref);
    const payload = Object.assign({}, localPayload);
    if (existingSnap.exists()) {
      const old = existingSnap.data() || {};
      payload.researchPoints = Math.max(payload.researchPoints, Math.floor(Number(old.researchPoints) || 0));
      // Older leaderboard schemas are upgraded by the V3.8.3 client. Career RP remains monotonic;
      // current period values come from the merge-safe profile record.
      if (Number(old.rpSchema) >= 2 && old.seasonId === payload.seasonId) payload.seasonRP = Math.max(payload.seasonRP, Math.floor(Number(old.seasonRP) || 0));
      if (Number(old.rpSchema) >= 2 && old.weekId === payload.weekId) payload.weekRP = Math.max(payload.weekRP, Math.floor(Number(old.weekRP) || 0));
      payload.totalStars = Math.max(payload.totalStars, Math.floor(Number(old.totalStars) || 0));
      payload.completedLevels = Math.max(payload.completedLevels, Math.floor(Number(old.completedLevels) || 0));
      payload.perfectLevels = Math.max(payload.perfectLevels, Math.floor(Number(old.perfectLevels) || 0));
      const oldTime = Math.floor(Number(old.totalValidatedSolveTime) || 0);
      if (oldTime > 0) payload.totalValidatedSolveTime = Math.min(payload.totalValidatedSolveTime, oldTime);
      const oldComparable = Object.assign({}, old, {playerName: payload.playerName});
      if (leaderboardSignature(oldComparable) === leaderboardSignature(payload)) {
        leaderboardLocalSignatures.set(boardId, localSig);
        return {ok: true, unchanged: true};
      }
    }
    await setDoc(ref, payload, {merge: false});
    leaderboardLocalSignatures.set(boardId, localSig);
    clearLeaderboardCaches();
    return {ok: true};
  } catch (e) {
    leaderboardLocalSignatures.delete(boardId);
    console.warn("[MXCloud] writeLeaderboard failed:", e && e.code, e && e.message);
    return {ok: false, reason: (e && e.code) || "error"};
  }
}
function syncLeaderboard(save, profileId, immediate) {
  if (!canPublishLeaderboard()) return Promise.resolve({ok: false, reason: "account-required"});
  if (SECURE_BACKEND_ENABLED) {
    // Competitive fields are written only by submitLevelResult on the server.
    return Promise.resolve({ok: true, secure: true, serverValidated: true});
  }
  const boardId = leaderboardDocId(profileId);
  if (!boardId) return Promise.resolve({ok: false, reason: "invalid-profile"});
  if (leaderboardTimers.has(boardId)) {
    clearTimeout(leaderboardTimers.get(boardId));
    leaderboardTimers.delete(boardId);
  }
  if (immediate) return writeLeaderboard(save, profileId);
  return new Promise((resolve) => {
    const timer = setTimeout(async () => {
      leaderboardTimers.delete(boardId);
      resolve(await writeLeaderboard(save, profileId));
    }, 1400);
    leaderboardTimers.set(boardId, timer);
  });
}

// V3.13.3 recovery path: ignore the in-memory signature and compare the
// current merged profile against Firestore. This repairs old/stale Android
// leaderboard rows after account restoration or a previously interrupted sync.
function repairLeaderboard(save, profileId) {
  if (!canPublishLeaderboard()) return Promise.resolve({ok: false, reason: "account-required"});
  if (SECURE_BACKEND_ENABLED) return Promise.resolve({ok: true, secure: true, serverValidated: true});
  const boardId = leaderboardDocId(profileId);
  if (!boardId) return Promise.resolve({ok: false, reason: "invalid-profile"});
  if (leaderboardTimers.has(boardId)) {
    clearTimeout(leaderboardTimers.get(boardId));
    leaderboardTimers.delete(boardId);
  }
  leaderboardLocalSignatures.delete(boardId);
  return writeLeaderboard(save, profileId, true);
}


// ---- Spark-plan ranked Duel leaderboard (cosmetic/prestige only) ----
const DUEL_BOARD_COLLECTION = "duelLeaderboard";
const duelBoardTimers = new Map();
const duelBoardSignatures = new Map();
const duelBoardCache = new Map();
function duelBoardDocId(profileId) { const id=safeProfileId(profileId); return id ? uid + "_" + id : ""; }
function duelMonthId(date) { date=date instanceof Date?date:new Date(); return date.getUTCFullYear()+"-"+String(date.getUTCMonth()+1).padStart(2,"0"); }
function duelWeekId(date) { date=date instanceof Date?date:new Date(); const d=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate())); const day=d.getUTCDay()||7; d.setUTCDate(d.getUTCDate()+4-day); const start=new Date(Date.UTC(d.getUTCFullYear(),0,1)); const week=Math.ceil((((d-start)/86400000)+1)/7); return d.getUTCFullYear()+"-W"+String(week).padStart(2,"0"); }
function previousDuelWeekId(){const d=new Date();d.setUTCDate(d.getUTCDate()-7);return duelWeekId(d);}
function previousDuelMonthId(){const d=new Date();d.setUTCMonth(d.getUTCMonth()-1);return duelMonthId(d);}
function duelOutcome(value){return Math.max(0,Math.floor(Number(value)||0))%10;}
function duelReceiptDate(value){return new Date(Math.floor(Math.max(0,Number(value)||0)/10)*1000);}
function duelBoardMetrics(save){
  const vals=Object.values(save&&save.duelRatedMatches&&typeof save.duelRatedMatches==="object"?save.duelRatedMatches:{}).map(Number).filter(v=>Number.isFinite(v)&&duelOutcome(v)>=1&&duelOutcome(v)<=3).sort((a,b)=>a-b);
  let rating=800,peak=800,wins=0,losses=0,draws=0,streak=0,bestStreak=0;
  const weekId=duelWeekId(),monthId=duelMonthId(),previousWeekId=previousDuelWeekId(),previousMonthId=previousDuelMonthId();
  let weekPoints=0,weekWins=0,previousWeekPoints=0,previousWeekWins=0,monthPoints=0,monthWins=0,previousMonthPoints=0,previousMonthWins=0;
  for(const v of vals){const outcome=duelOutcome(v),d=duelReceiptDate(v),w=duelWeekId(d),m=duelMonthId(d);let points=0;if(outcome===1){wins++;streak++;bestStreak=Math.max(bestStreak,streak);rating+=25;points=3;}else if(outcome===2){losses++;streak=0;rating=Math.max(0,rating-10);}else{draws++;streak=0;rating+=3;points=1;}peak=Math.max(peak,rating);if(w===weekId){weekPoints+=points;if(outcome===1)weekWins++;}if(w===previousWeekId){previousWeekPoints+=points;if(outcome===1)previousWeekWins++;}if(m===monthId){monthPoints+=points;if(outcome===1)monthWins++;}if(m===previousMonthId){previousMonthPoints+=points;if(outcome===1)previousMonthWins++;}}
  return {rating,peak,wins,losses,draws,bestStreak,weekId,weekPoints,weekWins,previousWeekId,previousWeekPoints,previousWeekWins,monthId,monthPoints,monthWins,previousMonthId,previousMonthPoints,previousMonthWins};
}
function duelBoardPayload(save,profileId){const m=duelBoardMetrics(save);return {uid,profileId,playerName:cleanName(save.playerName),rating:m.rating,peakRating:m.peak,wins:m.wins,losses:m.losses,draws:m.draws,bestStreak:m.bestStreak,activeFrame:String(save.activeDuelFrame||"frame_bronze").slice(0,40),activeTitle:String(save.activeDuelTitle||"").slice(0,40),weekId:m.weekId,weekPoints:m.weekPoints,weekWins:m.weekWins,previousWeekId:m.previousWeekId,previousWeekPoints:m.previousWeekPoints,previousWeekWins:m.previousWeekWins,monthId:m.monthId,monthPoints:m.monthPoints,monthWins:m.monthWins,previousMonthId:m.previousMonthId,previousMonthPoints:m.previousMonthPoints,previousMonthWins:m.previousMonthWins,updatedAt:serverTimestamp()};}
function duelBoardSignature(value){return JSON.stringify(value,(k,v)=>k==="updatedAt"?undefined:v);}
async function writeDuelLeaderboard(save,profileId){await readyPromise;if(!db||!uid||!profileId||!currentUser||currentUser.isAnonymous)return {ok:false,reason:"account-required"};const id=duelBoardDocId(profileId);if(!id)return {ok:false,reason:"invalid-profile"};const payload=duelBoardPayload(save,profileId),sig=duelBoardSignature(payload);if(duelBoardSignatures.get(id)===sig)return {ok:true,unchanged:true};try{await setDoc(doc(db,DUEL_BOARD_COLLECTION,id),payload,{merge:false});duelBoardSignatures.set(id,sig);duelBoardCache.clear();return {ok:true};}catch(e){console.warn("[MXCloud] writeDuelLeaderboard failed:",e&&e.code,e&&e.message);return {ok:false,reason:(e&&(e.code||e.message))||"error"};}}
function syncDuelLeaderboard(save,profileId,immediate){if(!currentUser||currentUser.isAnonymous)return Promise.resolve({ok:false,reason:"account-required"});const id=duelBoardDocId(profileId);if(!id)return Promise.resolve({ok:false,reason:"invalid-profile"});if(duelBoardTimers.has(id)){clearTimeout(duelBoardTimers.get(id));duelBoardTimers.delete(id);}if(immediate)return writeDuelLeaderboard(save,profileId);return new Promise(resolve=>{const timer=setTimeout(async()=>{duelBoardTimers.delete(id);resolve(await writeDuelLeaderboard(save,profileId));},700);duelBoardTimers.set(id,timer);});}
function duelRankRows(rows,period,targetId){const out=[];for(const r of rows){const row=Object.assign({},r);if(period==="week"){if(row.weekId!==duelWeekId())continue;row.periodPoints=Math.max(0,Number(row.weekPoints)||0);row.periodWins=Math.max(0,Number(row.weekWins)||0);}else if(period==="month"){if(row.monthId!==duelMonthId())continue;row.periodPoints=Math.max(0,Number(row.monthPoints)||0);row.periodWins=Math.max(0,Number(row.monthWins)||0);}else if(period==="closedWeek"){let ok=false;if(row.weekId===targetId){row.periodPoints=Math.max(0,Number(row.weekPoints)||0);row.periodWins=Math.max(0,Number(row.weekWins)||0);ok=true;}else if(row.previousWeekId===targetId){row.periodPoints=Math.max(0,Number(row.previousWeekPoints)||0);row.periodWins=Math.max(0,Number(row.previousWeekWins)||0);ok=true;}if(!ok)continue;}else if(period==="closedMonth"){let ok=false;if(row.monthId===targetId){row.periodPoints=Math.max(0,Number(row.monthPoints)||0);row.periodWins=Math.max(0,Number(row.monthWins)||0);ok=true;}else if(row.previousMonthId===targetId){row.periodPoints=Math.max(0,Number(row.previousMonthPoints)||0);row.periodWins=Math.max(0,Number(row.previousMonthWins)||0);ok=true;}if(!ok)continue;}if(period!=="world"&&row.periodPoints<=0)continue;out.push(row);}out.sort((a,b)=>period==="world"?((Number(b.rating)||0)-(Number(a.rating)||0)||(Number(b.wins)||0)-(Number(a.wins)||0)||(Number(a.losses)||0)-(Number(b.losses)||0)):((Number(b.periodPoints)||0)-(Number(a.periodPoints)||0)||(Number(b.periodWins)||0)-(Number(a.periodWins)||0)||(Number(b.rating)||0)-(Number(a.rating)||0)));return out;}
async function getDuelLeaderboard(period,n,forceRefresh,targetId){period=["world","week","month","closedWeek","closedMonth"].includes(period)?period:"world";n=Math.max(1,Math.min(100,Math.floor(Number(n)||100)));const key=period+":"+(targetId||"")+":"+n,cached=duelBoardCache.get(key);if(!forceRefresh&&cached&&Date.now()-cached.at<20000)return cached.value;try{await readyPromise;const snap=await getDocs(collection(db,DUEL_BOARD_COLLECTION)),rows=[];snap.forEach(d=>rows.push(Object.assign({id:d.id},d.data())));const value={rows:duelRankRows(rows,period,targetId).slice(0,n),period,targetId:targetId||""};duelBoardCache.set(key,{at:Date.now(),value});return value;}catch(e){console.warn("[MXCloud] getDuelLeaderboard failed:",e&&e.code);return null;}}

// ---- Cloud save: profile-scoped, owner-writable directly (no leaderboard fields live here) ----
// This mirrors ALL local fields so a lost/reset device can be fully restored.
let saveTimer = null;
let saveTimerResolve = null;
let pendingSaveProfileId = null;
const deletedProfileIds = new Set();
let fullProfileWriteAllowed = null;
let researchProfileWriteAllowed = null;
function profilePayload(save, profileId, includeFullProgress, includeResearch = true) {
  const payload = {
    uid, profileId,
    playerName: cleanName(save.playerName),
    coins: Math.max(0, Math.floor(Number(save.coins) || 0)),
    maxCoins: Math.max(0, Math.floor(Number(save.maxCoins) || 0)),
    disc: (save.disc && typeof save.disc === "object") ? save.disc : {},
    achv: (save.achv && typeof save.achv === "object") ? save.achv : {},
    speedRuns: (save.speedRuns && typeof save.speedRuns === "object") ? save.speedRuns : {},
    bestMoves: (save.bestMoves && typeof save.bestMoves === "object") ? save.bestMoves : {},
    totalHints: Math.max(0, Math.floor(Number(save.totalHints) || 0)),
    dailyDate: String(save.dailyDate || ""),
    streak3: Math.max(0, Math.floor(Number(save.streak3) || 0)),
    lang: save.lang === "en" ? "en" : "tr",
    volM: Number(save.volM), volMu: Number(save.volMu), volS: Number(save.volS), volV: Number(save.volV),
    muM: !!save.muM, muMu: !!save.muMu, muS: !!save.muS, muV: !!save.muV, externalMusic: !!save.externalMusic, dpad: !!save.dpad,
    reduceMotion: !!save.reduceMotion, duelMessages: save.duelMessages !== false, duelEffects: save.duelEffects !== false,
    haptics: save.haptics !== false, effectLevel: ["low", "normal", "high"].includes(save.effectLevel) ? save.effectLevel : "normal",
    performanceMode: ["auto", "low", "high"].includes(save.performanceMode) ? save.performanceMode : "auto",
    largeText: !!save.largeText, colorBlind: !!save.colorBlind, highContrast: !!save.highContrast,
    favoriteMolecules: (save.favoriteMolecules && typeof save.favoriteMolecules === "object") ? save.favoriteMolecules : {},
    collectionFilter: String(save.collectionFilter || "all").slice(0, 24),
    storySeen: (save.storySeen && typeof save.storySeen === "object") ? save.storySeen : {},
    storySchema: Math.max(0, Math.floor(Number(save.storySchema) || 0)),
    accountMilestoneInviteSeen: !!save.accountMilestoneInviteSeen,
    accountMilestoneInviteLastLevel: Math.max(0, Math.floor(Number(save.accountMilestoneInviteLastLevel) || 0)),
    nobelCertificateShared: !!save.nobelCertificateShared,
    duelRatedMatches: (save.duelRatedMatches && typeof save.duelRatedMatches === "object") ? save.duelRatedMatches : {},
    duelRewards: (save.duelRewards && typeof save.duelRewards === "object") ? save.duelRewards : {},
    duelRewardClaims: (save.duelRewardClaims && typeof save.duelRewardClaims === "object") ? save.duelRewardClaims : {},
    activeDuelFrame: String(save.activeDuelFrame || "frame_bronze").slice(0, 40),
    activeDuelTitle: String(save.activeDuelTitle || "").slice(0, 40),
    duelPeakRating: Math.max(800, Math.floor(Number(save.duelPeakRating) || 800)),
    duelBestStreak: Math.max(0, Math.floor(Number(save.duelBestStreak) || 0)),
    labTheme: ["basic", "collider", "arctic", "mars"].includes(save.labTheme) ? save.labTheme : "basic",
    economySchema: Math.max(0, Math.min(10, Math.floor(Number(save.economySchema) || 0))),
    quantumHintDay: String(save.quantumHintDay || "").slice(0, 16),
    updatedAt: serverTimestamp(),
  };
  if (includeResearch) {
    Object.assign(payload, {
      rpSchema: RP_SCHEMA,
      researchPoints: Math.max(0, Math.floor(Number(save.researchPoints) || 0)),
      researchLevels: (save.researchLevels && typeof save.researchLevels === "object") ? save.researchLevels : {},
      researchAchievements: (save.researchAchievements && typeof save.researchAchievements === "object") ? save.researchAchievements : {},
      dailyScores: (save.dailyScores && typeof save.dailyScores === "object") ? save.dailyScores : {},
      dailyRPStreak: Math.max(0, Math.floor(Number(save.dailyRPStreak) || 0)),
      lastDailyRPDate: String(save.lastDailyRPDate || ""),
      seasonId: String(save.seasonId || ""),
      seasonRP: Math.max(0, Math.floor(Number(save.seasonRP) || 0)),
      weekId: String(save.weekId || ""),
      weekRP: Math.max(0, Math.floor(Number(save.weekRP) || 0)),
    });
  }
  if (includeFullProgress) {
    Object.assign(payload, {
      cur: Math.max(0, Math.floor(Number(save.cur) || 0)),
      stars: (save.stars && typeof save.stars === "object") ? save.stars : {},
      seenFrozen: !!save.seenFrozen,
      seenFire: !!save.seenFire,
      seenSticky: !!save.seenSticky,
      seenZombie: !!save.seenZombie,
      seenLightning: !!save.seenLightning,
      seenOneWay: !!save.seenOneWay,
      seenBreakableWall: !!save.seenBreakableWall,
      seenPortal: !!save.seenPortal,
      seenMovingWall: !!save.seenMovingWall,
      seenPressureDoor: !!save.seenPressureDoor,
      seenFragile: !!save.seenFragile,
      seenPrecision: !!save.seenPrecision,
      seenHintSupport: !!save.seenHintSupport,
      seenUndoSupport: !!save.seenUndoSupport,
      seenRestartSupport: !!save.seenRestartSupport,
      seenLabSupport: !!save.seenLabSupport,
      seenSupportGuide: !!save.seenSupportGuide,
      seenHammerSupport: !!save.seenHammerSupport,
      seenPrecisionSupport: !!save.seenPrecisionSupport,
      tutorialDone: !!save.tutorialDone,
      saveSchema: SAVE_SCHEMA,
    });
  }
  return payload;
}
async function writeProgressTransaction(save, profileId, includeFullProgress, includeResearch, includeBestMoves) {
  const ref = doc(db, "players", uid, "profiles", profileId);
  let finalPayload = null;
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const oldData = snap.exists() ? (snap.data() || {}) : {};
    const incoming = profilePayload(save, profileId, includeFullProgress, includeResearch);
    if (includeBestMoves) {
      incoming.bonusClaims = (save.bonusClaims && typeof save.bonusClaims === "object") ? save.bonusClaims : {};
      incoming.researchBonuses = (save.researchBonuses && typeof save.researchBonuses === "object") ? save.researchBonuses : {};
    } else delete incoming.bestMoves;
    const core = window.MXSyncCore;
    let merged = core && typeof core.mergeProfiles === "function" ?
      core.mergeProfiles(incoming, oldData, {settings: "left", identity: "left", now: new Date(), includeBonus: includeBestMoves}) :
      Object.assign({}, oldData, incoming);
    merged.uid = uid;
    merged.profileId = profileId;
    merged.playerName = cleanName(save.playerName);
    merged.updatedAt = serverTimestamp();
    merged.saveSchema = SAVE_SCHEMA;
    if (!includeBestMoves) delete merged.bestMoves;
    if (!includeResearch) {
      ["rpSchema", "researchPoints", "researchLevels", "researchAchievements", "dailyScores",
        "researchBonuses", "dailyRPStreak", "lastDailyRPDate", "seasonId", "seasonRP", "weekId", "weekRP"].forEach((k) => delete merged[k]);
    }
    if (!includeFullProgress) {
      ["cur", "stars", "bonusClaims", "seenFrozen", "seenFire", "seenSticky", "seenZombie",
        "seenLightning", "seenOneWay", "seenBreakableWall", "seenPortal", "seenMovingWall",
        "seenPressureDoor", "seenFragile", "seenPrecision", "seenHintSupport", "seenUndoSupport",
        "seenRestartSupport", "seenLabSupport", "seenSupportGuide", "seenHammerSupport",
        "seenPrecisionSupport", "tutorialDone", "saveSchema"].forEach((k) => delete merged[k]);
    }
    finalPayload = merged;
    tx.set(ref, merged, {merge: !(includeFullProgress && includeResearch && includeBestMoves)});
  });
  if (finalPayload) {
    try {
      window.dispatchEvent(new CustomEvent("mx-cloud-profile-merged", {detail: {profileId, data: finalPayload}}));
    } catch (e) {}
    if (!SECURE_BACKEND_ENABLED) syncLeaderboard(finalPayload, profileId, false);
    syncDuelLeaderboard(finalPayload, profileId, false);
  }
  return finalPayload || true;
}

async function writeProgress(save, profileId) {
  await readyPromise;
  if (!db || !uid || !profileId || deletedProfileIds.has(profileId)) return false;

  // V3.8.3 first writes the complete merge-safe schema, including bestMoves.
  // Compatibility fallbacks keep older published rules usable, but the new
  // Firestore rules are required for full cross-platform best-move sync.
  try {
    const merged = await writeProgressTransaction(save, profileId, true, true, true);
    researchProfileWriteAllowed = true;
    fullProfileWriteAllowed = true;
    return merged;
  } catch (e) {
    if (!(e && (e.code === "permission-denied" || e.code === "firestore/permission-denied"))) throw e;
    console.warn("[MXCloud] V3.8.3 profile schema is waiting for the new Firestore rules; trying compatibility mode.");
  }

  if (researchProfileWriteAllowed !== false) {
    try {
      const merged = await writeProgressTransaction(save, profileId, true, true, false);
      researchProfileWriteAllowed = true;
      fullProfileWriteAllowed = true;
      return merged;
    } catch (e) {
      if (e && (e.code === "permission-denied" || e.code === "firestore/permission-denied")) {
        researchProfileWriteAllowed = false;
      } else throw e;
    }
  }
  if (fullProfileWriteAllowed !== false) {
    try {
      const merged = await writeProgressTransaction(save, profileId, true, false, false);
      fullProfileWriteAllowed = true;
      return merged;
    } catch (e) {
      if (e && (e.code === "permission-denied" || e.code === "firestore/permission-denied")) fullProfileWriteAllowed = false;
      else throw e;
    }
  }
  return await writeProgressTransaction(save, profileId, false, false, false);
}

function saveProgress(save, profileId) {
  if (deletedProfileIds.has(profileId)) return Promise.resolve(false);
  if (saveTimer) {
    clearTimeout(saveTimer);
    if (saveTimerResolve) saveTimerResolve(false);
  }
  return new Promise((resolve) => {
    saveTimerResolve = resolve;
    pendingSaveProfileId = profileId;
    saveTimer = setTimeout(async () => {
      saveTimer = null;
      saveTimerResolve = null;
      pendingSaveProfileId = null;
      try {
        resolve(await withCloudTimeout(writeProgress(save, profileId), "cloud/save-timeout"));
      } catch (e) {
        console.warn("[MXCloud] saveProgress failed:", e && e.code);
        resolve(false);
      }
    }, 1100);
  });
}
async function saveProgressNow(save, profileId) {
  try {
    const result = await withCloudTimeout(writeProgress(save, profileId), "cloud/save-timeout");
    if (!result) {
      const err = new Error("cloud/save-failed");
      err.code = "cloud/save-failed";
      throw err;
    }
    return result;
  } catch (e) {
    console.warn("[MXCloud] saveProgressNow failed:", e && e.code);
    throw e;
  }
}
async function listProfiles() {
  try {
    await readyPromise;
    if (!db || !uid) return [];
    const snap = await withCloudTimeout(getDocs(collection(db, "players", uid, "profiles")), "cloud/list-timeout");
    const rows = [];
    snap.forEach((d) => rows.push(Object.assign({profileId: d.id}, d.data())));
    return rows;
  } catch (e) {
    console.warn("[MXCloud] listProfiles failed:", e && e.code);
    return null;
  }
}

async function loadProfile(profileId) {
  try {
    await readyPromise;
    if (!db || !uid || !profileId) return null;
    const snap = await withCloudTimeout(getDoc(doc(db, "players", uid, "profiles", profileId)), "cloud/load-timeout");
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.warn("[MXCloud] loadProfile failed:", e && e.code);
    return null;
  }
}

// ---- Authoritative, server-validated level-completion submission ----
// The client NEVER writes leaderboard/weekly/monthly/champions documents
// directly (Firestore rules deny it) — this Cloud Function is the only path.
async function startLevelAttempt(profileId, levelId, mode) {
  try {
    await readyPromise;
    if (!CLOUD_FUNCTIONS_ENABLED || !fx || !uid) return null;
    const call = httpsCallable(fx, "startLevelAttempt");
    const res = await call({profileId, levelId: Math.floor(Number(levelId)), mode: mode || "campaign", clientVersion: "moleculox-v8-web-sync"});
    return res.data;
  } catch (e) {
    console.warn("[MXCloud] startLevelAttempt failed:", e && e.code, e && e.message);
    return null;
  }
}

async function submitLevelResult(entry) {
  try {
    await readyPromise;
    if (!CLOUD_FUNCTIONS_ENABLED || !fx || !uid) return {ok: false, reason: "disabled"};
    const call = httpsCallable(fx, "submitLevelResult");
    const payload = {
      profileId: entry.profileId,
      attemptId: entry.attemptId,
      levelId: Math.floor(Number(entry.levelId)),
      moveLog: Array.isArray(entry.moveLog) ? entry.moveLog.map((m) => ({i: Number(m.i), d: Number(m.d)})) : [],
      playerName: cleanName(entry.playerName),
      hints: Math.max(0, Math.floor(Number(entry.hints) || 0)),
    };
    const res = await call(payload);
    cachedBoard = null; cachedWeekly = null; cachedMonthly = null;
    return {ok: true, data: res.data};
  } catch (e) {
    console.warn("[MXCloud] submitLevelResult failed:", e && e.code, e && e.message);
    return {ok: false, reason: (e && e.code) || "error"};
  }
}

async function deleteCloudProfile(profileId) {
  const cleanId = safeProfileId(profileId);
  try {
    await readyPromise;
    if (!db || !uid || !cleanId) return {ok: false, reason: "offline"};

    // Mark the profile before deleting it so a delayed autosave cannot recreate
    // the document immediately after the user removes the player.
    deletedProfileIds.add(cleanId);
    if (saveTimer && pendingSaveProfileId === cleanId) {
      clearTimeout(saveTimer);
      saveTimer = null;
      pendingSaveProfileId = null;
      if (saveTimerResolve) saveTimerResolve(false);
      saveTimerResolve = null;
    }
    const boardId = leaderboardDocId(cleanId);
    if (boardId && leaderboardTimers.has(boardId)) {
      clearTimeout(leaderboardTimers.get(boardId));
      leaderboardTimers.delete(boardId);
      leaderboardLocalSignatures.delete(boardId);
    }

    if (SECURE_BACKEND_ENABLED && CLOUD_FUNCTIONS_ENABLED && fx && currentUser && !currentUser.isAnonymous) {
      try {
        const call = httpsCallable(fx, "deleteSecureProfileData");
        await call({profileId: cleanId});
      } catch (e) {
        console.warn("[MXCloud] secure profile cleanup failed:", e && e.code);
      }
    }
    await deleteDoc(doc(db, "players", uid, "profiles", cleanId));
    if (!SECURE_BACKEND_ENABLED && currentUser && !currentUser.isAnonymous) {
      await Promise.all([
        deleteDoc(doc(db, "leaderboard", uid + "_" + cleanId)),
        deleteDoc(doc(db, "duelLeaderboard", uid + "_" + cleanId)),
      ]);
    }
    cachedBoard = null; cachedWeekly = null; cachedMonthly = null;
    return {ok: true};
  } catch (e) {
    deletedProfileIds.delete(cleanId);
    console.warn("[MXCloud] deleteCloudProfile failed:", e && e.code, e && e.message);
    return {ok: false, reason: (e && e.code) || "error"};
  }
}

async function reportPlayerName(targetBoardId, reason) {
  try {
    await readyPromise;
    if (!CLOUD_FUNCTIONS_ENABLED || !fx || !uid) return {ok: false, reason: "disabled"};
    const call = httpsCallable(fx, "reportPlayerName");
    await call({targetBoardId, reason});
    return {ok: true};
  } catch (e) {
    console.warn("[MXCloud] reportPlayerName failed:", e && e.code, e && e.message);
    return {ok: false, reason: (e && e.code) || "error"};
  }
}

async function updateDisplayName(profileId, playerName) {
  try {
    await readyPromise;
    if (!db || !uid || !profileId) return false;
    const cleaned = cleanName(playerName);
    await setDoc(doc(db, "players", uid, "profiles", profileId), {
      uid, profileId, playerName: cleaned, updatedAt: serverTimestamp(),
    }, {merge: true});
    if (SECURE_BACKEND_ENABLED && CLOUD_FUNCTIONS_ENABLED && fx && currentUser && !currentUser.isAnonymous) {
      try {
        const call = httpsCallable(fx, "updateLeaderboardName");
        await call({profileId, playerName: cleaned});
      } catch (e) {
        console.warn("[MXCloud] secure name sync failed:", e && e.code);
      }
    }
    cachedBoard = null; cachedWeekly = null; cachedMonthly = null;
    return true;
  } catch (e) {
    console.warn("[MXCloud] updateDisplayName failed:", e && e.code);
    return false;
  }
}

async function claimDailyExperiment(profileId) {
  try {
    await readyPromise;
    if (!CLOUD_FUNCTIONS_ENABLED || !fx || !uid) return {alreadyClaimed: false, offline: true, disabled: true};
    const call = httpsCallable(fx, "claimDailyExperiment");
    const res = await call({profileId});
    return res.data;
  } catch (e) {
    console.warn("[MXCloud] claimDailyExperiment failed:", e && e.code);
    return {alreadyClaimed: false, offline: true};
  }
}

// ---- Leaderboard reads (public; cached briefly to limit Firestore reads) ----
function isoWeekId(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return d.getUTCFullYear() + "-W" + String(weekNo).padStart(2, "0");
}
function monthIdOf(date) {
  return date.getUTCFullYear() + "-" + String(date.getUTCMonth() + 1).padStart(2, "0");
}
function rowResearchScore(row) {
  if (row && row.periodRP != null) return Math.max(0, Math.floor(Number(row.periodRP) || 0));
  // V6.9.3 Career Score keeps old RP and adds visible campaign progress.
  // Formula: RP + completed levels × 20 + total stars × 5.
  const rp = Math.max(0, Math.floor(Number(row && row.researchPoints) || 0));
  const completed = Math.max(0, Math.floor(Number(row && row.completedLevels) || 0));
  const stars = Math.max(0, Math.floor(Number(row && row.totalStars) || 0));
  return rp + completed * 20 + stars * 5;
}
function leaderboardSort(a, b) {
  const rp = rowResearchScore(b) - rowResearchScore(a);
  if (rp) return rp;
  const perfect = Number(b.perfectLevels || 0) - Number(a.perfectLevels || 0);
  if (perfect) return perfect;
  const completed = Number(b.completedLevels || 0) - Number(a.completedLevels || 0);
  if (completed) return completed;
  return Number(a.totalValidatedSolveTime || Number.MAX_SAFE_INTEGER) -
      Number(b.totalValidatedSolveTime || Number.MAX_SAFE_INTEGER);
}
function leaderboardRowsFromSnapshot(snap, n, mapper) {
  const rows = [];
  snap.forEach((d) => {
    let row = d.data() || {};
    if (typeof mapper === "function") row = mapper(row);
    if (row) rows.push(row);
  });
  rows.sort(leaderboardSort);
  return rows.slice(0, n || 100);
}
let cachedBoard = null; let cachedBoardT = 0;
async function getMyRankingStatus(profileId) {
  try {
    await readyPromise;
    const cleanId = safeProfileId(profileId);
    if (!db || !uid || !cleanId || !currentUser || currentUser.isAnonymous) {
      return {ok: false, reason: "account-required", classic: null, duel: null};
    }
    const classicId = uid + "_" + cleanId;
    const duelId = uid + "_" + cleanId;
    const [classicSnap, duelSnap] = await Promise.all([
      getDocs(collection(db, "leaderboard")),
      getDocs(collection(db, DUEL_BOARD_COLLECTION)),
    ]);
    const classicRows = leaderboardRowsFromSnapshot(classicSnap, 100000);
    const duelRaw = [];
    duelSnap.forEach((d) => duelRaw.push(Object.assign({id: d.id}, d.data())));
    const duelRows = duelRankRows(duelRaw, "world");
    const classicIndex = classicRows.findIndex((r) => r && (r.id === classicId || (r.uid === uid && r.profileId === cleanId)));
    const duelIndex = duelRows.findIndex((r) => r && (r.id === duelId || (r.uid === uid && r.profileId === cleanId)));
    return {
      ok: true,
      classic: classicIndex >= 0 ? {rank: classicIndex + 1, row: classicRows[classicIndex], total: classicRows.length} : {rank: 0, row: null, total: classicRows.length},
      duel: duelIndex >= 0 ? {rank: duelIndex + 1, row: duelRows[duelIndex], total: duelRows.length} : {rank: 0, row: null, total: duelRows.length},
    };
  } catch (e) {
    console.warn("[MXCloud] getMyRankingStatus failed:", e && e.code);
    return {ok: false, reason: (e && e.code) || "error", classic: null, duel: null};
  }
}

async function getLeaderboard(n, forceRefresh) {
  if (!forceRefresh && cachedBoard && Date.now() - cachedBoardT < 45000) return cachedBoard;
  try {
    await readyPromise;
    if (!db) return null;
    // Raw read deliberately avoids composite-index failures and supports the
    // one-time migration from star ranking to Research Points.
    const snap = await getDocs(collection(db, "leaderboard"));
    const rows = leaderboardRowsFromSnapshot(snap, n);
    cachedBoard = rows; cachedBoardT = Date.now();
    return rows;
  } catch (e) {
    console.warn("[MXCloud] getLeaderboard failed:", e && e.code);
    return null;
  }
}

let cachedWeekly = null; let cachedWeeklyT = 0; let cachedWeeklyId = "";
async function getWeeklyLeaderboard(n, forceRefresh) {
  const weekId = isoWeekId(new Date());
  if (!forceRefresh && cachedWeekly && cachedWeeklyId === weekId && Date.now() - cachedWeeklyT < 45000) return {weekId, rows: cachedWeekly};
  try {
    await readyPromise;
    if (!db) return null;
    const snap = await getDocs(collection(db, "leaderboard"));
    const rows = leaderboardRowsFromSnapshot(snap, n, (row) => {
      if (Number(row.rpSchema) < 2 || row.weekId !== weekId) return null;
      return Object.assign({}, row, {periodRP: Math.max(0, Math.floor(Number(row.weekRP) || 0))});
    }).filter((row) => row.periodRP > 0);
    cachedWeekly = rows; cachedWeeklyT = Date.now(); cachedWeeklyId = weekId;
    return {weekId, rows};
  } catch (e) {
    console.warn("[MXCloud] getWeeklyLeaderboard failed:", e && e.code);
    return null;
  }
}

let cachedMonthly = null; let cachedMonthlyT = 0; let cachedMonthlyId = "";
function clearLeaderboardCaches() {
  cachedBoard = null; cachedBoardT = 0;
  cachedWeekly = null; cachedWeeklyT = 0; cachedWeeklyId = "";
  cachedMonthly = null; cachedMonthlyT = 0; cachedMonthlyId = "";
}
async function getMonthlyLeaderboard(n, forceRefresh) {
  const mId = monthIdOf(new Date());
  if (!forceRefresh && cachedMonthly && cachedMonthlyId === mId && Date.now() - cachedMonthlyT < 45000) return {monthId: mId, rows: cachedMonthly};
  try {
    await readyPromise;
    if (!db) return null;
    const snap = await getDocs(collection(db, "leaderboard"));
    const rows = leaderboardRowsFromSnapshot(snap, n, (row) => {
      if (Number(row.rpSchema) < 2 || row.seasonId !== mId) return null;
      return Object.assign({}, row, {periodRP: Math.max(0, Math.floor(Number(row.seasonRP) || 0))});
    }).filter((row) => row.periodRP > 0);
    cachedMonthly = rows; cachedMonthlyT = Date.now(); cachedMonthlyId = mId;
    return {monthId: mId, rows};
  } catch (e) {
    console.warn("[MXCloud] getMonthlyLeaderboard failed:", e && e.code);
    return null;
  }
}

let cachedChamps = null; let cachedChampsT = 0;
async function getChampions(n) {
  if (cachedChamps && Date.now() - cachedChampsT < 120000) return cachedChamps;
  try {
    await readyPromise;
    if (!db) return null;
    const snap = await getDocs(query(collection(db, "champions"), orderBy("archivedAt", "desc"), limit(n || 50)));
    const rows = [];
    snap.forEach((d) => rows.push(d.data()));
    cachedChamps = rows; cachedChampsT = Date.now();
    return rows;
  } catch (e) {
    console.warn("[MXCloud] getChampions failed:", e && e.code);
    return null;
  }
}


// ---- Online Atom Duel rooms (live spectator board + preset messages) ----
const DUEL_ROOM_COLLECTION = "duelRooms";
const DUEL_MATCH_COLLECTION = "duelMatchQueue";
const DUEL_ROOM_TTL_MS = 6 * 60 * 60 * 1000;
const DUEL_MATCH_TTL_MS = 2 * 60 * 1000;
const DUEL_PRESENCE_STALE_MS = 10 * 1000;
const DUEL_RECONNECT_GRACE_MS = 30 * 1000;
function createDuelClientId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") return "dc_" + globalThis.crypto.randomUUID();
  return "dc_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 14);
}
function loadDuelClientId() {
  const key = "mx_online_duel_client_v1";
  try {
    const saved = localStorage.getItem(key);
    if (saved && /^[A-Za-z0-9_-]{8,80}$/.test(saved)) return saved;
    const made = createDuelClientId();
    localStorage.setItem(key, made);
    return made;
  } catch (e) {
    return createDuelClientId();
  }
}
const duelClientId = loadDuelClientId();

function cleanDuelName(value, fallback) {
  const name = String(value || "").replace(/[<>]/g, "").trim().slice(0, 14);
  return name || fallback || "Player";
}
function normalizeDuelCode(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 6);
}
function randomMatchTicketId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") return "mq_" + globalThis.crypto.randomUUID();
  return "mq_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 14);
}
function normalizeMatchTicketId(value) {
  const id = String(value || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 96);
  return /^mq_[A-Za-z0-9_-]{8,92}$/.test(id) ? id : "";
}
function randomDuelCode() {
  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === "function") {
    const numbers = new Uint32Array(1);
    globalThis.crypto.getRandomValues(numbers);
    return String(100000 + (numbers[0] % 900000));
  }
  return String(100000 + Math.floor(Math.random() * 900000));
}
function cloneDuelRounds(rounds) {
  const raw = JSON.parse(JSON.stringify(Array.isArray(rounds) ? rounds.slice(0, 3) : []));
  return raw.map((round) => ({
    level: Math.max(0, Math.min(205, Math.floor(Number(round && round.level) || 0))),
    gameType: ["classic", "crystal", "chain", "reactor"].includes(round && round.gameType) ? round.gameType : "classic",
    crystals: Array.isArray(round && round.crystals) ? round.crystals.slice(0, 3) : null,
    chainPlan: Array.isArray(round && round.chainPlan) ? round.chainPlan.slice(0, 80) : null,
    reactorPlan: Array.isArray(round && round.reactorPlan) ? round.reactorPlan.slice(0, 3) : null,
    results: [null, null],
    winner: null,
  }));
}
function normalizeDuelResult(result) {
  return {
    time: Math.max(0, Math.min(90, Number(result && result.time) || 90)),
    moves: Math.max(0, Math.min(9999, Math.floor(Number(result && result.moves) || 0))),
    completed: !!(result && result.completed),
    maxCombo: Math.max(1, Math.min(99, Math.floor(Number(result && result.maxCombo) || 1))),
    reactions: Math.max(0, Math.min(999, Math.floor(Number(result && result.reactions) || 0))),
    autoMoves: Math.max(0, Math.min(999, Math.floor(Number(result && result.autoMoves) || 0))),
    hits: Math.max(0, Math.min(99, Math.floor(Number(result && result.hits) || 0))),
    penalty: Math.max(0, Math.min(999, Number(result && result.penalty) || 0)),
  };
}
function onlineDuelRoundWinner(a, b, gameType) {
  if (a.completed && !b.completed) return 0;
  if (b.completed && !a.completed) return 1;
  if (gameType === "chain") {
    if ((a.maxCombo || 1) > (b.maxCombo || 1)) return 0;
    if ((b.maxCombo || 1) > (a.maxCombo || 1)) return 1;
    if ((a.reactions || 0) > (b.reactions || 0)) return 0;
    if ((b.reactions || 0) > (a.reactions || 0)) return 1;
  }
  if (gameType === "reactor") {
    if ((a.hits || 0) < (b.hits || 0)) return 0;
    if ((b.hits || 0) < (a.hits || 0)) return 1;
  }
  if (!a.completed && !b.completed) {
    if (a.moves < b.moves) return 0;
    if (b.moves < a.moves) return 1;
    return -1;
  }
  const at = Math.round((a.time || 0) * 10);
  const bt = Math.round((b.time || 0) * 10);
  if (at < bt) return 0;
  if (bt < at) return 1;
  if (a.moves < b.moves) return 0;
  if (b.moves < a.moves) return 1;
  return -1;
}
function duelRoomRef(code) {
  return doc(db, DUEL_ROOM_COLLECTION, normalizeDuelCode(code));
}
function duelMatchRef(ticketId) {
  return doc(db, DUEL_MATCH_COLLECTION, normalizeMatchTicketId(ticketId));
}

function normalizeDuelStyle(value){const frame=String(value&&value.frame||"frame_bronze").replace(/[^A-Za-z0-9_-]/g,"").slice(0,40)||"frame_bronze";const title=String(value&&value.title||"").replace(/[^A-Za-z0-9_-]/g,"").slice(0,40);return {frame,title};}
function timestampMillis(value) {
  if (value && typeof value.toMillis === "function") return value.toMillis();
  if (value instanceof Date) return value.getTime();
  return Number(value) || 0;
}
async function prepareDuelCloud() {
  await readyPromise;
  if (!auth || !auth.currentUser) await ensureAnonymous();
  if (!db || !uid) throw new Error("duel/offline");
}
async function createDuelRoom(config) {
  try {
    await prepareDuelCloud();
    const rounds = cloneDuelRounds(config && config.rounds);
    if (rounds.length !== 3) return {ok: false, reason: "invalid-rounds"};
    const hostName = cleanDuelName(config && config.hostName, "Player 1");
    const pool = config && config.pool && ["mixed", "medium", "hard"].includes(config.pool.kind) ? {
      kind: config.pool.kind,
      min: Math.max(0, Math.min(205, Math.floor(Number(config.pool.min) || 0))),
      max: Math.max(0, Math.min(205, Math.floor(Number(config.pool.max) || 205))),
    } : {kind: "mixed", min: 40, max: 205};
    const gameKind = ["classic", "crystal", "chain", "reactor", "mixed"].includes(config && config.gameKind) ? config.gameKind : "classic";
    for (let attempt = 0; attempt < 8; attempt++) {
      const code = randomDuelCode();
      const ref = duelRoomRef(code);
      try {
        const room = {
          version: 4,
          code,
          matchType: "friend",
          queueTickets: [],
          status: "waiting",
          hostUid: uid,
          hostClientId: duelClientId,
          guestUid: null,
          guestClientId: null,
          playerNames: [hostName, ""],
          playerStyles: [normalizeDuelStyle(config && config.playerStyle), null],
          matchNo: 1,
          pool,
          gameKind,
          round: 0,
          turn: 0,
          wins: [0, 0],
          rounds,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          expiresAt: new Date(Date.now() + DUEL_ROOM_TTL_MS),
          abandonedBy: null,
          liveState: null,
          liveMove: null,
          lastQuickMessage: null,
          hostPresenceAt: serverTimestamp(),
          guestPresenceAt: null,
          disconnectState: null,
          finishReason: null,
          forfeitWinner: null,
          forfeitBy: null,
        };
        await runTransaction(db, async (transaction) => {
          const snap = await transaction.get(ref);
          if (snap.exists()) throw new Error("duel/code-collision");
          transaction.set(ref, room);
        });
        return {ok: true, code, playerIndex: 0, room: Object.assign({}, room, {createdAt: null, updatedAt: null})};
      } catch (e) {
        if (String(e && e.message) === "duel/code-collision") continue;
        throw e;
      }
    }
    return {ok: false, reason: "code-collision"};
  } catch (e) {
    console.warn("[MXCloud] createDuelRoom failed:", e && (e.code || e.message));
    return {ok: false, reason: (e && (e.code || e.message)) || "error"};
  }
}
async function joinDuelRoom(codeValue, guestNameValue, guestStyleValue) {
  const code = normalizeDuelCode(codeValue);
  if (code.length !== 6) return {ok: false, reason: "invalid-code"};
  try {
    await prepareDuelCloud();
    const ref = duelRoomRef(code);
    let result = null;
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error("duel/not-found");
      const room = snap.data();
      if (room.hostUid === uid && room.hostClientId === duelClientId) {
        result = {playerIndex: 0, room};
        return;
      }
      if (room.guestUid === uid && room.guestClientId === duelClientId) {
        result = {playerIndex: 1, room};
        return;
      }
      if (room.status !== "waiting" || room.guestUid) throw new Error("duel/full");
      if (room.expiresAt && typeof room.expiresAt.toMillis === "function" && room.expiresAt.toMillis() < Date.now()) throw new Error("duel/expired");
      const guestName = cleanDuelName(guestNameValue, "Player 2");
      const nextNames = [cleanDuelName(room.playerNames && room.playerNames[0], "Player 1"), guestName];
      const nextStyles = [normalizeDuelStyle(room.playerStyles && room.playerStyles[0]), normalizeDuelStyle(guestStyleValue)];
      transaction.update(ref, {
        guestUid: uid,
        guestClientId: duelClientId,
        playerNames: nextNames,
        playerStyles: nextStyles,
        status: "playing",
        turn: 0,
        guestPresenceAt: serverTimestamp(),
        disconnectState: null,
        updatedAt: serverTimestamp(),
      });
      result = {playerIndex: 1, room: Object.assign({}, room, {guestUid: uid, guestClientId: duelClientId, playerNames: nextNames, playerStyles: nextStyles, status: "playing", turn: 0})};
    });
    return {ok: true, code, playerIndex: result.playerIndex, room: result.room};
  } catch (e) {
    console.warn("[MXCloud] joinDuelRoom failed:", e && (e.code || e.message));
    return {ok: false, reason: (e && (e.code || e.message)) || "error"};
  }
}
function subscribeDuelRoom(codeValue, onData, onError) {
  const code = normalizeDuelCode(codeValue);
  let stopped = false;
  let unsubscribe = () => {};
  prepareDuelCloud().then(() => {
    if (stopped) return;
    unsubscribe = onSnapshot(duelRoomRef(code), (snap) => {
      if (typeof onData === "function") onData(snap.exists() ? Object.assign({id: snap.id}, snap.data()) : null);
    }, (err) => {
      console.warn("[MXCloud] duel listener failed:", err && err.code);
      if (typeof onError === "function") onError(err);
    });
  }).catch((err) => {
    if (typeof onError === "function") onError(err);
  });
  return () => {
    stopped = true;
    try { unsubscribe(); } catch (e) {}
  };
}

async function createQuickMatchTicket(playerNameValue, playerStyleValue) {
  try {
    await prepareDuelCloud();
    const playerName = cleanDuelName(playerNameValue, "Player");
    for (let attempt = 0; attempt < 5; attempt++) {
      const ticketId = randomMatchTicketId();
      const ref = duelMatchRef(ticketId);
      const ticket = {
        version: 1,
        ticketId,
        status: "waiting",
        uid,
        clientId: duelClientId,
        playerName,
        playerStyle: normalizeDuelStyle(playerStyleValue),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + DUEL_MATCH_TTL_MS),
        roomCode: null,
        playerIndex: null,
      };
      try {
        await runTransaction(db, async (transaction) => {
          const snap = await transaction.get(ref);
          if (snap.exists()) throw new Error("duel/ticket-collision");
          transaction.set(ref, ticket);
        });
        return {ok: true, ticketId, ticket: Object.assign({}, ticket, {createdAt: null, updatedAt: null})};
      } catch (e) {
        if (String(e && e.message) === "duel/ticket-collision") continue;
        throw e;
      }
    }
    return {ok: false, reason: "ticket-collision"};
  } catch (e) {
    console.warn("[MXCloud] createQuickMatchTicket failed:", e && (e.code || e.message));
    return {ok: false, reason: (e && (e.code || e.message)) || "error"};
  }
}

async function tryQuickMatch(ticketIdValue, roundsValue) {
  const ticketId = normalizeMatchTicketId(ticketIdValue);
  if (!ticketId) return {ok: false, reason: "invalid-ticket"};
  try {
    await prepareDuelCloud();
    const rounds = cloneDuelRounds(roundsValue);
    if (rounds.length !== 3) return {ok: false, reason: "invalid-rounds"};
    const ownRef = duelMatchRef(ticketId);
    const ownSnap = await getDoc(ownRef);
    if (!ownSnap.exists()) return {ok: false, reason: "ticket-missing"};
    const own = ownSnap.data();
    if (own.uid !== uid || own.clientId !== duelClientId) return {ok: false, reason: "ticket-owner"};
    if (own.status === "matched" && own.roomCode) {
      return {ok: true, status: "matched", code: own.roomCode, playerIndex: Number(own.playerIndex) || 0};
    }
    if (timestampMillis(own.expiresAt) && timestampMillis(own.expiresAt) < Date.now()) return {ok: false, reason: "ticket-expired"};

    const candidatesSnap = await getDocs(query(
      collection(db, DUEL_MATCH_COLLECTION),
      where("status", "==", "waiting"),
      limit(12),
    ));
    const candidates = [];
    candidatesSnap.forEach((snap) => {
      if (snap.id === ticketId) return;
      const data = snap.data();
      if (!data || data.clientId === duelClientId || data.uid === uid) return;
      if (timestampMillis(data.expiresAt) && timestampMillis(data.expiresAt) < Date.now()) {
        deleteDoc(duelMatchRef(snap.id)).catch(() => {});
        return;
      }
      candidates.push({id: snap.id, data});
    });
    candidates.sort((a, b) => timestampMillis(a.data.createdAt) - timestampMillis(b.data.createdAt));

    for (const candidate of candidates) {
      for (let roomAttempt = 0; roomAttempt < 5; roomAttempt++) {
        const code = randomDuelCode();
        const roomRef = duelRoomRef(code);
        const candidateRef = duelMatchRef(candidate.id);
        let outcome = null;
        try {
          await runTransaction(db, async (transaction) => {
            const [freshOwnSnap, freshCandidateSnap, roomSnap] = await Promise.all([
              transaction.get(ownRef),
              transaction.get(candidateRef),
              transaction.get(roomRef),
            ]);
            if (!freshOwnSnap.exists()) throw new Error("duel/ticket-missing");
            const freshOwn = freshOwnSnap.data();
            if (freshOwn.status === "matched" && freshOwn.roomCode) {
              outcome = {status: "matched", code: freshOwn.roomCode, playerIndex: Number(freshOwn.playerIndex) || 0};
              return;
            }
            if (!freshCandidateSnap.exists()) throw new Error("duel/match-unavailable");
            const freshCandidate = freshCandidateSnap.data();
            if (freshOwn.status !== "waiting" || freshCandidate.status !== "waiting") throw new Error("duel/match-unavailable");
            if (freshOwn.uid !== uid || freshOwn.clientId !== duelClientId) throw new Error("duel/ticket-owner");
            if (freshCandidate.clientId === duelClientId) throw new Error("duel/same-client");
            if (freshCandidate.uid === uid) throw new Error("duel/same-account");
            if ((timestampMillis(freshOwn.expiresAt) && timestampMillis(freshOwn.expiresAt) < Date.now()) ||
                (timestampMillis(freshCandidate.expiresAt) && timestampMillis(freshCandidate.expiresAt) < Date.now())) {
              throw new Error("duel/ticket-expired");
            }
            if (roomSnap.exists()) throw new Error("duel/code-collision");
            const room = {
              version: 4,
              code,
              matchType: "quick",
              queueTickets: [ticketId, candidate.id],
              status: "playing",
              hostUid: freshOwn.uid,
              hostClientId: freshOwn.clientId,
              guestUid: freshCandidate.uid,
              guestClientId: freshCandidate.clientId,
              playerNames: [cleanDuelName(freshOwn.playerName, "Player 1"), cleanDuelName(freshCandidate.playerName, "Player 2")],
              playerStyles: [normalizeDuelStyle(freshOwn.playerStyle), normalizeDuelStyle(freshCandidate.playerStyle)],
              matchNo: 1,
              pool: {kind: "mixed", min: 40, max: 205},
              gameKind: "mixed",
              round: 0,
              turn: 0,
              wins: [0, 0],
              rounds,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              expiresAt: new Date(Date.now() + DUEL_ROOM_TTL_MS),
              abandonedBy: null,
              liveState: null,
              liveMove: null,
              lastQuickMessage: null,
              hostPresenceAt: serverTimestamp(),
              guestPresenceAt: serverTimestamp(),
              disconnectState: null,
              finishReason: null,
              forfeitWinner: null,
              forfeitBy: null,
            };
            transaction.set(roomRef, room);
            transaction.update(ownRef, {status: "matched", roomCode: code, playerIndex: 0, updatedAt: serverTimestamp()});
            transaction.update(candidateRef, {status: "matched", roomCode: code, playerIndex: 1, updatedAt: serverTimestamp()});
            outcome = {status: "matched", code, playerIndex: 0, room};
          });
          if (outcome && outcome.status === "matched") return {ok: true, ...outcome};
        } catch (e) {
          const reason = String(e && (e.code || e.message) || "");
          if (reason.includes("code-collision")) continue;
          if (reason.includes("match-unavailable") || reason.includes("ticket-expired") || reason.includes("same-client") || reason.includes("same-account")) break;
          throw e;
        }
      }
    }
    return {ok: true, status: "waiting"};
  } catch (e) {
    console.warn("[MXCloud] tryQuickMatch failed:", e && (e.code || e.message));
    return {ok: false, reason: (e && (e.code || e.message)) || "error"};
  }
}

function subscribeQuickMatchTicket(ticketIdValue, onData, onError) {
  const ticketId = normalizeMatchTicketId(ticketIdValue);
  let stopped = false;
  let unsubscribe = () => {};
  prepareDuelCloud().then(() => {
    if (stopped || !ticketId) return;
    unsubscribe = onSnapshot(duelMatchRef(ticketId), (snap) => {
      if (typeof onData === "function") onData(snap.exists() ? Object.assign({id: snap.id}, snap.data()) : null);
    }, (err) => {
      console.warn("[MXCloud] quick-match listener failed:", err && err.code);
      if (typeof onError === "function") onError(err);
    });
  }).catch((err) => {
    if (typeof onError === "function") onError(err);
  });
  return () => {
    stopped = true;
    try { unsubscribe(); } catch (e) {}
  };
}

async function cancelQuickMatch(ticketIdValue) {
  const ticketId = normalizeMatchTicketId(ticketIdValue);
  if (!ticketId) return {ok: true};
  try {
    await prepareDuelCloud();
    let matched = null;
    await runTransaction(db, async (transaction) => {
      const ref = duelMatchRef(ticketId);
      const snap = await transaction.get(ref);
      if (!snap.exists()) return;
      const ticket = snap.data();
      if (ticket.uid !== uid || ticket.clientId !== duelClientId) throw new Error("duel/ticket-owner");
      if (ticket.status === "matched" && ticket.roomCode) {
        matched = {code: ticket.roomCode, playerIndex: Number(ticket.playerIndex) || 0};
        return;
      }
      transaction.delete(ref);
    });
    return matched ? {ok: true, matched: true, ...matched} : {ok: true, matched: false};
  } catch (e) {
    return {ok: false, reason: (e && (e.code || e.message)) || "error"};
  }
}

async function removeQuickMatchTicket(ticketIdValue) {
  const ticketId = normalizeMatchTicketId(ticketIdValue);
  if (!ticketId) return {ok: true};
  try {
    await prepareDuelCloud();
    const ref = duelMatchRef(ticketId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return {ok: true};
    const ticket = snap.data();
    if (ticket.uid !== uid || ticket.clientId !== duelClientId) return {ok: false, reason: "ticket-owner"};
    await deleteDoc(ref);
    return {ok: true};
  } catch (e) {
    return {ok: false, reason: (e && (e.code || e.message)) || "error"};
  }
}


const DUEL_QUICK_MESSAGE_KEYS = ["hello", "good_luck", "nice_move", "good_game", "rematch", "thanks"];
function normalizeDuelLiveState(value) {
  const atoms = Array.isArray(value && value.atoms) ? value.atoms.slice(0, 16).map((atom) => ({
    x: Math.max(0, Math.min(7, Math.floor(Number(atom && atom.x) || 0))),
    y: Math.max(0, Math.min(9, Math.floor(Number(atom && atom.y) || 0))),
    e: String(atom && atom.e || "H").replace(/[^A-Za-z]/g, "").slice(0, 2) || "H",
    frozen: !!(atom && atom.frozen),
    fire: !!(atom && atom.fire),
    sticky: !!(atom && atom.sticky),
    zombie: !!(atom && atom.zombie),
  })) : [];
  const crystals = Array.isArray(value && value.crystals) ? value.crystals.slice(0, 3).map((crystal) => ({
    x: Math.max(0, Math.min(7, Math.floor(Number(crystal && crystal.x) || 0))),
    y: Math.max(0, Math.min(9, Math.floor(Number(crystal && crystal.y) || 0))),
    type: String(crystal && crystal.type || "catalyst").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 24),
    collected: !!(crystal && crystal.collected),
  })) : [];
  return {
    seq: Math.max(0, Math.min(100000, Math.floor(Number(value && value.seq) || 0))),
    moves: Math.max(0, Math.min(9999, Math.floor(Number(value && value.moves) || 0))),
    level: Math.max(0, Math.min(205, Math.floor(Number(value && value.level) || 0))),
    gameType: ["classic", "crystal", "chain", "reactor"].includes(value && value.gameType) ? value.gameType : "classic",
    atoms,
    crystals,
    maxCombo: Math.max(1, Math.min(99, Math.floor(Number(value && value.maxCombo) || 1))),
    reactions: Math.max(0, Math.min(999, Math.floor(Number(value && value.reactions) || 0))),
    hits: Math.max(0, Math.min(99, Math.floor(Number(value && value.hits) || 0))),
  };
}
function normalizeDuelMoveEvent(value) {
  return {
    seq: Math.max(0, Math.min(100000, Math.floor(Number(value && value.seq) || 0))),
    atomIndex: Math.max(0, Math.min(15, Math.floor(Number(value && value.atomIndex) || 0))),
    fromX: Math.max(0, Math.min(7, Number(value && value.fromX) || 0)),
    fromY: Math.max(0, Math.min(9, Number(value && value.fromY) || 0)),
    toX: Math.max(0, Math.min(7, Number(value && value.toX) || 0)),
    toY: Math.max(0, Math.min(9, Number(value && value.toY) || 0)),
    direction: Math.max(0, Math.min(3, Math.floor(Number(value && value.direction) || 0))),
    duration: Math.max(80, Math.min(1200, Math.floor(Number(value && value.duration) || 280))),
    moves: Math.max(0, Math.min(9999, Math.floor(Number(value && value.moves) || 0))),
  };
}

function duelPlayerIndexForRoom(room) {
  return room.hostUid === uid && room.hostClientId === duelClientId ? 0 :
    (room.guestUid === uid && room.guestClientId === duelClientId ? 1 : -1);
}
function duelPresenceAt(room, playerIndex) {
  return playerIndex === 0 ? room.hostPresenceAt : room.guestPresenceAt;
}
async function heartbeatDuelRoom(codeValue) {
  const code = normalizeDuelCode(codeValue);
  try {
    await prepareDuelCloud();
    const ref = duelRoomRef(code);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error("duel/not-found");
      const room = snap.data();
      const playerIndex = duelPlayerIndexForRoom(room);
      if (playerIndex < 0) throw new Error("duel/not-player");
      if (!["waiting", "playing", "round_result"].includes(room.status)) return;
      const patch = {updatedAt: serverTimestamp()};
      patch[playerIndex === 0 ? "hostPresenceAt" : "guestPresenceAt"] = serverTimestamp();
      if (room.disconnectState && Number(room.disconnectState.playerIndex) === playerIndex) patch.disconnectState = null;
      transaction.update(ref, patch);
    });
    return {ok: true};
  } catch (e) {
    return {ok: false, reason: (e && (e.code || e.message)) || "error"};
  }
}
async function startDuelDisconnectCountdown(codeValue, opponentIndexValue) {
  const code = normalizeDuelCode(codeValue);
  const opponentIndex = Number(opponentIndexValue) === 1 ? 1 : 0;
  try {
    await prepareDuelCloud();
    const ref = duelRoomRef(code);
    let state = null;
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error("duel/not-found");
      const room = snap.data();
      const reporterIndex = duelPlayerIndexForRoom(room);
      if (reporterIndex < 0 || reporterIndex === opponentIndex) throw new Error("duel/not-player");
      if (!["playing", "round_result"].includes(room.status)) return;
      if (room.disconnectState) { state = room.disconnectState; return; }
      const lastSeen = timestampMillis(duelPresenceAt(room, opponentIndex));
      if (lastSeen && Date.now() - lastSeen < DUEL_PRESENCE_STALE_MS) return;
      state = {
        playerIndex: opponentIndex,
        reporterIndex,
        startedAt: serverTimestamp(),
        deadlineAt: new Date(Date.now() + DUEL_RECONNECT_GRACE_MS),
      };
      transaction.update(ref, {disconnectState: state, updatedAt: serverTimestamp()});
    });
    return {ok: true, state};
  } catch (e) {
    return {ok: false, reason: (e && (e.code || e.message)) || "error"};
  }
}
async function resolveDuelDisconnect(codeValue) {
  const code = normalizeDuelCode(codeValue);
  try {
    await prepareDuelCloud();
    const ref = duelRoomRef(code);
    let outcome = null;
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error("duel/not-found");
      const room = snap.data();
      const callerIndex = duelPlayerIndexForRoom(room);
      if (callerIndex < 0) throw new Error("duel/not-player");
      if (!["playing", "round_result"].includes(room.status)) return;
      const now = Date.now();
      const p0 = timestampMillis(room.hostPresenceAt);
      const p1 = timestampMillis(room.guestPresenceAt);
      const fresh0 = !!p0 && now - p0 < DUEL_PRESENCE_STALE_MS;
      const fresh1 = !!p1 && now - p1 < DUEL_PRESENCE_STALE_MS;
      if (!fresh0 && !fresh1) {
        transaction.update(ref, {
          status: "cancelled", finishReason: "both_disconnected", disconnectState: null,
          liveState: null, liveMove: null, updatedAt: serverTimestamp(),
        });
        outcome = {status: "cancelled"};
        return;
      }
      if (!room.disconnectState) return;
      const deadline = timestampMillis(room.disconnectState.deadlineAt);
      if (deadline && deadline > now) return;
      const disconnected = Number(room.disconnectState.playerIndex) === 1 ? 1 : 0;
      const disconnectedFresh = disconnected === 0 ? fresh0 : fresh1;
      if (disconnectedFresh) {
        transaction.update(ref, {disconnectState: null, updatedAt: serverTimestamp()});
        outcome = {status: room.status, restored: true};
        return;
      }
      const winner = 1 - disconnected;
      const wins = Array.isArray(room.wins) ? room.wins.slice(0, 2).map((v) => Math.max(0, Math.floor(Number(v) || 0))) : [0, 0];
      wins[winner] = Math.max(2, wins[winner]);
      transaction.update(ref, {
        status: "finished", wins, finishReason: "disconnect", forfeitWinner: winner, forfeitBy: disconnected,
        disconnectState: null, liveState: null, liveMove: null, updatedAt: serverTimestamp(),
      });
      outcome = {status: "finished", winner, forfeitBy: disconnected};
    });
    return {ok: true, data: outcome};
  } catch (e) {
    return {ok: false, reason: (e && (e.code || e.message)) || "error"};
  }
}

async function publishDuelMoveEvent(codeValue, expectedRound, expectedTurn, moveValue) {
  const code = normalizeDuelCode(codeValue);
  try {
    await prepareDuelCloud();
    const ref = duelRoomRef(code);
    const move = normalizeDuelMoveEvent(moveValue);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error("duel/not-found");
      const room = snap.data();
      const playerIndex = room.hostUid === uid && room.hostClientId === duelClientId ? 0 :
        (room.guestUid === uid && room.guestClientId === duelClientId ? 1 : -1);
      if (playerIndex < 0) throw new Error("duel/not-player");
      if (room.status !== "playing" || room.round !== expectedRound || room.turn !== expectedTurn || playerIndex !== expectedTurn) {
        throw new Error("duel/not-your-turn");
      }
      transaction.update(ref, {
        liveMove: Object.assign({}, move, {
          round: expectedRound,
          turn: expectedTurn,
          playerIndex,
          sentAt: serverTimestamp(),
        }),
        updatedAt: serverTimestamp(),
      });
    });
    return {ok: true};
  } catch (e) {
    const reason = (e && (e.code || e.message)) || "error";
    if (!String(reason).includes("not-your-turn")) console.warn("[MXCloud] publishDuelMoveEvent failed:", reason);
    return {ok: false, reason};
  }
}
async function publishDuelLiveState(codeValue, expectedRound, expectedTurn, stateValue) {
  const code = normalizeDuelCode(codeValue);
  try {
    await prepareDuelCloud();
    const ref = duelRoomRef(code);
    const state = normalizeDuelLiveState(stateValue);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error("duel/not-found");
      const room = snap.data();
      const playerIndex = room.hostUid === uid && room.hostClientId === duelClientId ? 0 :
        (room.guestUid === uid && room.guestClientId === duelClientId ? 1 : -1);
      if (playerIndex < 0) throw new Error("duel/not-player");
      if (room.status !== "playing" || room.round !== expectedRound || room.turn !== expectedTurn || playerIndex !== expectedTurn) {
        throw new Error("duel/not-your-turn");
      }
      transaction.update(ref, {
        liveState: Object.assign({}, state, {
          round: expectedRound,
          turn: expectedTurn,
          playerIndex,
          sentAt: serverTimestamp(),
        }),
        updatedAt: serverTimestamp(),
      });
    });
    return {ok: true};
  } catch (e) {
    const reason = (e && (e.code || e.message)) || "error";
    if (!String(reason).includes("not-your-turn")) console.warn("[MXCloud] publishDuelLiveState failed:", reason);
    return {ok: false, reason};
  }
}
async function sendDuelQuickMessage(codeValue, messageKeyValue) {
  const code = normalizeDuelCode(codeValue);
  const messageKey = String(messageKeyValue || "");
  if (!DUEL_QUICK_MESSAGE_KEYS.includes(messageKey)) return {ok: false, reason: "invalid-message"};
  try {
    await prepareDuelCloud();
    const ref = duelRoomRef(code);
    let sent = null;
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error("duel/not-found");
      const room = snap.data();
      const playerIndex = room.hostUid === uid && room.hostClientId === duelClientId ? 0 :
        (room.guestUid === uid && room.guestClientId === duelClientId ? 1 : -1);
      if (playerIndex < 0) throw new Error("duel/not-player");
      if (!["waiting", "playing", "round_result", "finished"].includes(room.status)) throw new Error("duel/not-playing");
      const previousSeq = Math.max(0, Math.floor(Number(room.lastQuickMessage && room.lastQuickMessage.seq) || 0));
      sent = {seq: previousSeq + 1, playerIndex, key: messageKey, sentAt: serverTimestamp()};
      transaction.update(ref, {lastQuickMessage: sent, updatedAt: serverTimestamp()});
    });
    return {ok: true, message: sent};
  } catch (e) {
    return {ok: false, reason: (e && (e.code || e.message)) || "error"};
  }
}

async function submitDuelTurn(codeValue, expectedRound, expectedTurn, resultValue) {
  const code = normalizeDuelCode(codeValue);
  try {
    await prepareDuelCloud();
    const ref = duelRoomRef(code);
    const result = normalizeDuelResult(resultValue);
    let outcome = null;
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error("duel/not-found");
      const room = snap.data();
      const playerIndex = room.hostUid === uid && room.hostClientId === duelClientId ? 0 :
        (room.guestUid === uid && room.guestClientId === duelClientId ? 1 : -1);
      if (playerIndex < 0) throw new Error("duel/not-player");
      const rounds = JSON.parse(JSON.stringify(room.rounds || []));
      const wins = Array.isArray(room.wins) ? room.wins.slice(0, 2).map((v) => Math.max(0, Math.floor(Number(v) || 0))) : [0, 0];
      const round = rounds[expectedRound];
      if (!round) throw new Error("duel/invalid-round");
      round.results = Array.isArray(round.results) ? round.results.slice(0, 2) : [null, null];
      if (round.results[playerIndex]) {
        outcome = {status: room.status, idempotent: true};
        return;
      }
      if (room.status !== "playing") throw new Error("duel/not-playing");
      if (room.round !== expectedRound || room.turn !== expectedTurn || playerIndex !== expectedTurn) throw new Error("duel/not-your-turn");
      round.results[playerIndex] = result;
      let status = "playing";
      let nextTurn = 1;
      if (playerIndex === 1) {
        const winner = onlineDuelRoundWinner(round.results[0], round.results[1], round.gameType);
        round.winner = winner;
        if (winner >= 0) wins[winner] += 1;
        const matchOver = wins[0] >= 2 || wins[1] >= 2 || expectedRound >= 2;
        status = matchOver ? "finished" : "round_result";
        nextTurn = 1;
      }
      transaction.update(ref, {
        rounds,
        wins,
        status,
        turn: nextTurn,
        liveState: null,
        liveMove: null,
        disconnectState: null,
        finishReason: status === "finished" ? "normal" : null,
        forfeitWinner: null,
        forfeitBy: null,
        updatedAt: serverTimestamp(),
      });
      outcome = {status, wins, winner: round.winner};
    });
    return {ok: true, data: outcome};
  } catch (e) {
    console.warn("[MXCloud] submitDuelTurn failed:", e && (e.code || e.message));
    return {ok: false, reason: (e && (e.code || e.message)) || "error"};
  }
}
async function advanceDuelRound(codeValue, expectedRound) {
  const code = normalizeDuelCode(codeValue);
  try {
    await prepareDuelCloud();
    const ref = duelRoomRef(code);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error("duel/not-found");
      const room = snap.data();
      if (duelPlayerIndexForRoom(room) < 0) throw new Error("duel/not-player");
      if (room.status !== "round_result") return;
      if (room.round !== expectedRound) return;
      transaction.update(ref, {
        round: expectedRound + 1,
        turn: 0,
        status: "playing",
        liveState: null,
        liveMove: null,
        disconnectState: null,
        finishReason: null,
        forfeitWinner: null,
        forfeitBy: null,
        updatedAt: serverTimestamp(),
      });
    });
    return {ok: true};
  } catch (e) {
    return {ok: false, reason: (e && (e.code || e.message)) || "error"};
  }
}
async function rematchDuelRoom(codeValue, roundsValue) {
  const code = normalizeDuelCode(codeValue);
  try {
    await prepareDuelCloud();
    const rounds = cloneDuelRounds(roundsValue);
    if (rounds.length !== 3) return {ok: false, reason: "invalid-rounds"};
    const ref = duelRoomRef(code);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error("duel/not-found");
      const room = snap.data();
      if (room.hostUid !== uid || room.hostClientId !== duelClientId) throw new Error("duel/host-only");
      if (!room.guestUid) throw new Error("duel/no-guest");
      transaction.update(ref, {
        rounds,
        matchNo: Math.max(1, Math.floor(Number(room.matchNo) || 1)) + 1,
        round: 0,
        turn: 0,
        wins: [0, 0],
        status: "playing",
        abandonedBy: null,
        liveState: null,
        liveMove: null,
        disconnectState: null,
        finishReason: null,
        forfeitWinner: null,
        forfeitBy: null,
        hostPresenceAt: serverTimestamp(),
        guestPresenceAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
    return {ok: true};
  } catch (e) {
    return {ok: false, reason: (e && (e.code || e.message)) || "error"};
  }
}
async function leaveDuelRoom(codeValue) {
  const code = normalizeDuelCode(codeValue);
  try {
    await prepareDuelCloud();
    const ref = duelRoomRef(code);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) return;
      const room = snap.data();
      const playerIndex = duelPlayerIndexForRoom(room);
      if (playerIndex < 0) return;
      transaction.update(ref, {status: "abandoned", abandonedBy: uid, abandonedClientId: duelClientId, abandonedPlayerIndex: playerIndex, disconnectState: null, finishReason: "left", updatedAt: serverTimestamp()});
    });
    return {ok: true};
  } catch (e) {
    return {ok: false, reason: (e && (e.code || e.message)) || "error"};
  }
}


// V6.9.3 — lightweight Firestore presence for the main-menu online count.
// A device is considered online when its heartbeat is newer than 90 seconds.
const PRESENCE_TTL_MS = 90000;
const PRESENCE_HEARTBEAT_MS = 30000;
let presenceTimer = null;
let presenceStarted = false;
let presenceDocId = null;
function safePresenceClientId() {
  try {
    const key = "mx_presence_client_v1";
    let id = localStorage.getItem(key);
    if (!id) {
      id = "pc_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(key, id);
    }
    return id.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 70);
  } catch (e) {
    return "pc_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
const presenceClientId = safePresenceClientId();
async function writePresence() {
  if (!db) return false;
  await readyPromise;
  if (!uid) return false;
  presenceDocId = (uid + "_" + presenceClientId).slice(0, 150);
  await setDoc(doc(db, "onlinePresence", presenceDocId), {
    uid,
    clientId: presenceClientId,
    lastSeen: serverTimestamp(),
    platform: /iPhone|iPad|iPod/i.test(navigator.userAgent || "") ? "ios" : (/Android/i.test(navigator.userAgent || "") ? "android" : "web"),
  }, {merge: true});
  return true;
}
async function startPresence() {
  if (presenceStarted) return true;
  presenceStarted = true;
  try { await writePresence(); } catch (e) { console.warn("[MXCloud] presence start failed:", e && e.code); }
  clearInterval(presenceTimer);
  presenceTimer = setInterval(() => {
    if (!document.hidden && navigator.onLine !== false) writePresence().catch(() => {});
  }, PRESENCE_HEARTBEAT_MS);
  return true;
}
async function getOnlinePlayerCount() {
  if (!db || navigator.onLine === false) return null;
  await readyPromise;
  if (!uid) return null;
  try {
    await writePresence();
    const cutoff = new Date(Date.now() - PRESENCE_TTL_MS);
    const q = query(collection(db, "onlinePresence"), where("lastSeen", ">=", cutoff), orderBy("lastSeen", "desc"), limit(500));
    const snap = await getDocs(q);
    return snap.size;
  } catch (e) {
    console.warn("[MXCloud] online count failed:", e && e.code);
    return null;
  }
}
function stopPresence() {
  clearInterval(presenceTimer);
  presenceTimer = null;
  presenceStarted = false;
  if (db && presenceDocId) deleteDoc(doc(db, "onlinePresence", presenceDocId)).catch(() => {});
}
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && navigator.onLine !== false) writePresence().catch(() => {});
});
window.addEventListener("pagehide", () => { stopPresence(); });

// Added 2026-07-30: stores one push-notification token per device under
// pushTokens/{uid}, keyed by token so multiple devices per account are all
// kept (not overwritten). Written by mxInitPush() in game.js once the native
// Capacitor Push Notifications plugin successfully registers. `lang` is
// stored top-level on the doc (not per-token) so the reminder Cloud Function
// can pick the right one of the 6 supported languages. Requires a matching
// Firestore rule allowing the signed-in uid to write only its own
// pushTokens/{uid} document — see the release notes for the exact rule text.
async function savePushToken(token, platform, lang) {
  await readyPromise;
  if (!db || !uid || !token) return { ok: false, reason: "not-ready" };
  try {
    await setDoc(
      doc(db, "pushTokens", uid),
      { lang: ["en","tr","de","es","pt","ja"].includes(lang) ? lang : "en",
        tokens: { [token]: { platform: platform || "unknown", updatedAt: serverTimestamp() } } },
      { merge: true }
    );
    return { ok: true };
  } catch (e) {
    console.warn("[MXCloud] savePushToken failed:", e && e.code, e && e.message);
    return { ok: false, reason: (e && (e.code || e.message)) || "error" };
  }
}
async function updatePushLang(lang) {
  await readyPromise;
  if (!db || !uid || !["en","tr","de","es","pt","ja"].includes(lang)) return { ok: false };
  try {
    await setDoc(doc(db, "pushTokens", uid), { lang }, { merge: true });
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: (e && (e.code || e.message)) || "error" };
  }
}

function sanitizeTelemetryParams(params={}) {
  const out={};
  Object.entries(params||{}).slice(0,24).forEach(([k,v])=>{
    const key=String(k).replace(/[^a-zA-Z0-9_]/g,'_').slice(0,40);
    if(!key)return;
    if(typeof v==='number'||typeof v==='boolean')out[key]=v;
    else if(v!=null)out[key]=String(v).slice(0,100);
  });
  return out;
}
function track(name, params={}) {
  const eventName=String(name||'').replace(/[^a-zA-Z0-9_]/g,'_').slice(0,40);
  if(!eventName)return false;
  try{ if(analytics) logEvent(analytics,eventName,sanitizeTelemetryParams(params)); }catch(e){}
  return true;
}
function reportJsError(kind, raw, extra={}) {
  const err=raw instanceof Error?raw:new Error(String(raw||kind||'unknown'));
  const payload=Object.assign({error_kind:String(kind||'error'),error_name:String(err.name||'Error'),error_message:String(err.message||'').slice(0,100),screen:String(location.pathname||'').slice(0,100)},extra||{});
  track('app_error',payload);
  try{
    const cap=window.Capacitor&&window.Capacitor.Plugins;
    const crash=cap&&(cap.FirebaseCrashlytics||cap.Crashlytics);
    if(crash){
      if(typeof crash.recordException==='function')crash.recordException({message:payload.error_message});
      else if(typeof crash.log==='function')crash.log({message:payload.error_kind+': '+payload.error_message});
    }
  }catch(e){}
}
window.addEventListener('error',(ev)=>reportJsError('window_error',ev.error||ev.message,{line:ev.lineno||0,column:ev.colno||0}));
window.addEventListener('unhandledrejection',(ev)=>reportJsError('unhandled_rejection',ev.reason));

window.MXCloud = {
  get uid() {
    return uid;
  },
  get authFailed() {
    return authFailed;
  },
  get duelClientId() {
    return duelClientId;
  },
  get account() {
    return accountSnapshot();
  },
  get security() {
    return {
      secureBackendEnabled: SECURE_BACKEND_ENABLED,
      appCheckConfigured: !!(RECAPTCHA_V3_SITE_KEY && RECAPTCHA_V3_SITE_KEY.indexOf("REPLACE_WITH") !== 0),
      region: FUNCTIONS_REGION,
    };
  },
  ready: readyPromise, track, reportJsError,
  subscribeAuth, ensureAnonymous,
  refreshPersistence, connectGoogle, connectGoogleIdToken, connectApple, connectAppleIdToken, registerEmail, signInEmail, resetPassword, signOutToGuest, deleteCurrentAuthAccount, deleteAccountAndData,
  saveProgress, saveProgressNow, loadProfile, listProfiles, syncLeaderboard, repairLeaderboard, savePushToken, updatePushLang,
  startLevelAttempt, submitLevelResult, updateDisplayName, claimDailyExperiment,
  deleteCloudProfile, cleanupOrphanRankingRows, reportPlayerName,
  getLeaderboard, getWeeklyLeaderboard, getMonthlyLeaderboard, getMyRankingStatus, clearLeaderboardCache: clearLeaderboardCaches, getChampions,
  syncDuelLeaderboard, getDuelLeaderboard,
  createDuelRoom, joinDuelRoom, subscribeDuelRoom, heartbeatDuelRoom, startDuelDisconnectCountdown, resolveDuelDisconnect, publishDuelLiveState, publishDuelMoveEvent, sendDuelQuickMessage, submitDuelTurn, advanceDuelRound, rematchDuelRoom, leaveDuelRoom,
  createQuickMatchTicket, tryQuickMatch, subscribeQuickMatchTicket, cancelQuickMatch, removeQuickMatchTicket,
  startPresence, getOnlinePlayerCount, stopPresence,
};
