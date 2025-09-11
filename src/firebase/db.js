// src/firebase/db.js
import { initFirebase } from './index.js';
import { ref, onValue, set, update, remove, push, serverTimestamp } from './index.js';

/** Poslouchej všechny uživatele. Vrací plain objekt {uid: {name, lat, lng, …}} */
export async function listenToUsers(cb) {
  const { db } = await initFirebase();
  const r = ref(db, 'users');
  return onValue(r, (snap) => cb(snap.val() || {}));
}

/** Ulož/aktualizuj vlastní pozici (lat, lng) do users/{uid} */
export async function updateMyLocation(uid, { lat, lng }) {
  const { db } = await initFirebase();
  const r = ref(db, `users/${uid}`);
  await update(r, { lat, lng, onlineAt: serverTimestamp() });
}

/** Poslouchej příchozí/odchozí pings pro daného uživatele */
export async function listenToPings(myUid, cb) {
  const { db } = await initFirebase();
  const r = ref(db, `pings/${myUid}`);
  return onValue(r, (snap) => {
    const val = snap.val() || {};
    // cb voláme jednotlivě, aby navazující kód nemusel dělat diffs
    Object.entries(val).forEach(([fromUid, p]) => {
      cb({ fromUid, ...p });
    });
  });
}

/** Pošli ping: zapiš do pings/{toUid}/{myUid} = {state:'sent', …} */
export async function sendPing(myUid, toUid) {
  const { db } = await initFirebase();
  const pr = ref(db, `pings/${toUid}/${myUid}`);
  await set(pr, {
    fromUid: myUid,
    toUid,
    state: 'sent',
    ts: serverTimestamp(),
  });
}

/** Přijmi ping (změň state na 'accepted') */
export async function acceptPing(myUid, fromUid) {
  const { db } = await initFirebase();
  const pr = ref(db, `pings/${myUid}/${fromUid}`);
  await update(pr, { state: 'accepted', tsAccepted: serverTimestamp() });
  return `${myUid}:${fromUid}`;
}

/** Odmítnout ping (buď state='rejected', nebo klidně smaž) */
export async function rejectPing(myUid, fromUid) {
  const { db } = await initFirebase();
  const pr = ref(db, `pings/${myUid}/${fromUid}`);
  await update(pr, { state: 'rejected', tsRejected: serverTimestamp() });
}
