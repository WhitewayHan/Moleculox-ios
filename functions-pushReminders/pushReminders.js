/**
 * MOLECULOX — Inaktiflik / seri hatırlatma push bildirimi
 * ---------------------------------------------------------
 * Bu dosya CLIENT KODUNA dahil DEĞİL — Firebase Cloud Functions'a ayrıca
 * deploy edilmesi gereken, sunucu tarafında (Node.js) çalışan bir zamanlanmış
 * görevdir. Mevcut functions/ klasörünüze bu dosyayı ekleyip (örn.
 * functions/pushReminders.js), functions/index.js içinde
 * `exports.sendInactivityReminders = require('./pushReminders').sendInactivityReminders;`
 * satırıyla dışa aktarmanız, sonra
 * `firebase deploy --only functions:sendInactivityReminders`
 * ile yayınlamanız gerekir.
 *
 * Ne yapar:
 * 1) Her gün bir kez çalışır (varsayılan: UTC 18:00 — RUNTIME_SCHEDULE'dan
 *    kendi oyuncu kitlenize göre değiştirebilirsiniz).
 * 2) pushTokens koleksiyonundaki her kullanıcı için, players/{uid}/profiles
 *    altındaki en güncel updatedAt zaman damgasını bulur (bu alan zaten her
 *    ilerleme kaydında otomatik yazılıyor — js/firebase.js writeProgress()).
 * 3) Son aktiviteden bu yana INACTIVITY_DAYS gün geçtiyse VE son hatırlatmadan
 *    bu yana en az REMINDER_COOLDOWN_DAYS gün geçtiyse (spam önleme), o
 *    kullanıcının kayıtlı cihaz token'larına, kendi tercih ettiği dilde
 *    (pushTokens/{uid}.lang — en/tr/de/es/pt/ja) FCM push gönderir.
 *
 * Gerekli Firestore güvenlik kuralı eklentisi (firestore.rules dosyanıza):
 *   match /pushTokens/{uid} {
 *     allow read, write: if request.auth != null && request.auth.uid == uid;
 *   }
 *   (Cloud Function firebase-admin ile çalıştığı için güvenlik kurallarını
 *   zaten atlar — bu kural sadece İSTEMCİNİN kendi token'ını yazabilmesi için.)
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

if (!getApps().length) initializeApp();
const db = getFirestore();
const messaging = getMessaging();

const INACTIVITY_DAYS = 2; // ne kadar süre oynamayınca hatırlatma tetiklensin
const REMINDER_COOLDOWN_DAYS = 5; // aynı kullanıcıya en erken kaç günde bir tekrar gönderilsin
const RUNTIME_SCHEDULE = "0 18 * * *"; // her gün UTC 18:00 (cron formatı)

const REMINDER_MESSAGES = {
  en: { title: "🧪 The lab is waiting!", body: "Dr. E prepared today's molecule. Keep your streak alive!" },
  tr: { title: "🧪 Laboratuvar seni bekliyor!", body: "Dr. E bugünün molekülünü hazırladı. Serini bozma!" },
  de: { title: "🧪 Das Labor wartet!", body: "Dr. E hat das heutige Molekül vorbereitet. Reiß deine Serie nicht ab!" },
  es: { title: "🧪 ¡El laboratorio te espera!", body: "El Dr. E preparó la molécula de hoy. ¡No pierdas tu racha!" },
  pt: { title: "🧪 O laboratório está esperando!", body: "O Dr. E preparou a molécula de hoje. Não perca sua sequência!" },
  ja: { title: "🧪 ラボがあなたを待っています！", body: "E博士が今日の分子を用意しました。連続記録を途切れさせないで！" },
};

async function mostRecentActivity(uid) {
  const snap = await db.collection("players").doc(uid).collection("profiles").get();
  let latest = null;
  snap.forEach((docSnap) => {
    const t = docSnap.data() && docSnap.data().updatedAt;
    const ms = t && typeof t.toMillis === "function" ? t.toMillis() : null;
    if (ms && (!latest || ms > latest)) latest = ms;
  });
  return latest; // null if the user has no synced profile yet
}

exports.sendInactivityReminders = onSchedule(RUNTIME_SCHEDULE, async () => {
  const now = Date.now();
  const tokensSnap = await db.collection("pushTokens").get();
  let sent = 0, skipped = 0, errored = 0;

  for (const tokenDoc of tokensSnap.docs) {
    const uid = tokenDoc.id;
    const data = tokenDoc.data() || {};
    const tokenMap = data.tokens || {};
    const tokens = Object.keys(tokenMap);
    if (!tokens.length) { skipped++; continue; }

    const lastReminderAt = data.lastReminderSentAt && typeof data.lastReminderSentAt.toMillis === "function"
      ? data.lastReminderSentAt.toMillis() : 0;
    if (now - lastReminderAt < REMINDER_COOLDOWN_DAYS * 86400000) { skipped++; continue; }

    let lastActive;
    try {
      lastActive = await mostRecentActivity(uid);
    } catch (e) {
      errored++;
      continue;
    }
    if (!lastActive || now - lastActive < INACTIVITY_DAYS * 86400000) { skipped++; continue; }

    const lang = ["en","tr","de","es","pt","ja"].includes(data.lang) ? data.lang : "en";
    const msg = REMINDER_MESSAGES[lang];

    try {
      await messaging.sendEachForMulticast({
        tokens,
        notification: { title: msg.title, body: msg.body },
        data: { type: "inactivity-reminder" },
      });
      await tokenDoc.ref.set({ lastReminderSentAt: new Date() }, { merge: true });
      sent++;
    } catch (e) {
      errored++;
    }
  }

  console.log(`[sendInactivityReminders] sent=${sent} skipped=${skipped} errored=${errored}`);
});
