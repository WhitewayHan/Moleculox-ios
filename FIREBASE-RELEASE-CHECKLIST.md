# MOLECULOX R378 / R374 — CLOUD, AUTH AND DAILY REWARD CHECKLIST

## Included in these SOURCE packages (not a live Firebase deployment)

- iOS: Apple sign-in retained; Google (native) and email/password UI restored. Google provider included in Capacitor config, Google subspec injected into Podfile, and iOS reversed client URL scheme registered from GoogleService-Info.plist. The source now follows Capawesome's Google iOS setup requirements; a signed IPA still requires Codemagic and real-device verification.
- iOS/Android/Web/itch: Science Legends and Moleculopedia responsive R377/R373 fixes preserved, plus improved cloud error diagnostic reporting. A Firestore permission denial displays the actual code instead of being presented as ordinary lack of network access.
- iOS/Android/Web/itch: Failed Daily Experiment completions are remembered as per-user, per-profile, current-UTC-day pending receipts on the device; verification is retried at sign-in/reconnect/resume. Nothing is credited until Firestore/Cloud confirms the claim. Old-day receipts are NOT applied to a new day. A failed first claim with a late response can still lead to a previously seen result; these paths need real Firebase verification.
- iOS/Android/Web/itch: Daily Login MoleCoin claim is retried after restored auth and network reconnection (only for signed-in non-anonymous members).
- itch: Embedded Safari storage-access request triggered by real studio user gesture; guest is never silently granted rewards.
- Existing campaign/level/PAR/stars/save schema is preserved; no local save migration, score award rule alteration, security-rule weakening, or automatic account merging.

## Required real Firebase Console checks — not performed here

1. In Firebase Auth > Sign-in method, verify Google, Apple and Email/Password are enabled as appropriate. Verify the iOS OAuth configuration, GoogleService-Info.plist, and the iOS URL scheme for the final signed IPA. Test **linking** an Apple user to a *different* existing Google account; the app must show a safe conflict, never silently merge two Firebase UIDs.
2. Check Firestore security rules specifically for `players/{userUid}/profiles/{profileId}`: verify that the authenticated user's request.auth.uid matches the path userUid, and check both read and write rules including allowed fields, `dailyDate`, `dailyLoginDate`, `researchAchievements`, `coins`, and `researchPoints`. Do not allow public writes, do not make coins writable by unauthenticated users, and do not expand permissions blindly. Inspect the real rule set and test in the Firestore Rules Playground / Emulator Suite with real UID-scoped requests before publishing.
3. Check App Check enforcement and App Attest/DeviceCheck vs native App Check provider; monitor actual Firebase error codes. A `permission-denied` result may be rules OR App Check enforcement; the client cannot prove which without Console/server logs.
4. Sign in on a real iPhone, verify Apple -> restart -> member UID remains stable. Sign in with Google and email, verify cloud sync, old progress, daily login reward once, and daily experiment reward/RP once. Do not uninstall until a successful verified sync.
5. Verify web/itch in normal and embedded Safari with blocked/unblocked third-party storage, signed-in and guest. Confirm no previous-day pending Daily Experiment can claim today's reward and no repeated grant after network resume.
6. Google Play: build an AAB from the Android source; use a versionCode above the last published code and compare with Play Console, as any concurrent published AAB could occupy the expected number.

## Known unresolved constraint

The exact live `permission-denied` root cause remains unverified and *could require a Firebase Console rules/App Check change*. These ZIPs cannot change remote Firebase permissions, and must not be called a verified live Firebase fix until the above tests pass. A Firestore transaction confirmed a dailyDate claim only; it is not an independent authoritative full financial/reward ledger. Delayed claims across UTC midnight are not converted to the new day's claim.

## Versions

- iOS R378 / v8.7.211 — source package.
- Android R378 / v8.7.211 — source package.
- Web & itch R374 / v8.7.207 — uploadable web content.
