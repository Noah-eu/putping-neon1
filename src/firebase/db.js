import { mock, db, auth, storage, sref, uploadBytes, getDownloadURL } from './index.js';

// ---- Mock store ----
const MOCK = {
  users: new Map(),           // uid -> user
  pings: new Map(),           // toUid -> [ {fromUid, timestamp, read:false, state:'sent'} ]
  pairs: new Map(),           // pairId -> { members:[a,b], createdAt }
  messages: new Map(),        // pairId -> [ { fromUid, type, text?, imageURL?, timestamp } ]
};
function pidOf(a,b){ return [a,b].sort().join('_'); }

// ---- Users ----
export async function saveUserProfile(uid, data){
  try{
    if (mock){ MOCK.users.set(uid, { uid, ...data }); return true; }
    const { ref, set, serverTimestamp } = await import('firebase/database');
    const r = ref(db, `users/${uid}`);
    const payload = { ...data, lastSeen: serverTimestamp() };
    return set(r, payload);
  }catch{ return false }
}
export async function getUserProfile(uid){
  try{
    if (mock) return MOCK.users.get(uid) || null;
    const { ref, get } = await import('firebase/database');
    const s = await get(ref(db, `users/${uid}`));
    return s.exists() ? s.val() : null;
  }catch{ return null }
}
export async function listenToUsers(cb){
  if (mock){ const id = setInterval(()=> cb(Object.fromEntries(MOCK.users)), 1000); return ()=> clearInterval(id); }
  try{
    const { ref, onValue } = await import('firebase/database');
    const r = ref(db, 'users');
    return onValue(r, (snap) => cb(snap.val() || {}));
  }catch{ return ()=>{} }
}

// ---- Pings ----
export async function sendPing(fromUid, toUid){
  try{
    if (mock){
      const arr = MOCK.pings.get(toUid) || [];
      arr.push({ id: String(Date.now()), fromUid, timestamp: Date.now(), read:false, state:'sent' });
      MOCK.pings.set(toUid, arr);
      return true;
    }
    const { ref, push, serverTimestamp, set } = await import('firebase/database');
    const r = push(ref(db, `pings/${toUid}`));
    return set(r, { fromUid, timestamp: serverTimestamp(), read:false, state:'sent' });
  }catch{ return false }
}
export async function acceptPing(toUid, fromUid){
  try{
    if (mock){
      const arr = MOCK.pings.get(toUid) || [];
      const item = arr.find(x => x.fromUid === fromUid && x.state === 'sent');
      if (item) item.state = 'accepted';
      const pid = await ensurePair(toUid, fromUid);
      return pid;
    }
    const { ref, update, query, orderByChild, equalTo, get } = await import('firebase/database');
    const q = query(ref(db, `pings/${toUid}`), orderByChild('fromUid'), equalTo(fromUid));
    const s = await get(q);
    s.forEach(child => { if (child.val()?.state === 'sent') update(ref(db, `pings/${toUid}/${child.key}`), { state:'accepted', read:true }); });
    return ensurePair(toUid, fromUid);
  }catch{ return null }
}
export async function rejectPing(toUid, fromUid){
  try{
    if (mock){
      const arr = MOCK.pings.get(toUid) || [];
      const item = arr.find(x => x.fromUid === fromUid && x.state === 'sent');
      if (item) item.state = 'rejected';
      return true;
    }
    const { ref, update, query, orderByChild, equalTo, get } = await import('firebase/database');
    const q = query(ref(db, `pings/${toUid}`), orderByChild('fromUid'), equalTo(fromUid));
    const s = await get(q);
    s.forEach(child => { if (child.val()?.state === 'sent') update(ref(db, `pings/${toUid}/${child.key}`), { state:'rejected', read:true }); });
    return true;
  }catch{ return false }
}
export async function listenToPings(userUid, onPing){
  if (mock){
    const id = setInterval(() => {
      const arr = MOCK.pings.get(userUid) || [];
      arr.forEach(p => onPing({ ...p }));
    }, 1200);
    return ()=> clearInterval(id);
  }
  try{
    const { ref, onChildAdded } = await import('firebase/database');
    const r = ref(db, `pings/${userUid}`);
    return onChildAdded(r, (snap) => { const v = snap.val(); v && onPing({ id: snap.key, ...v }); });
  }catch{ return ()=>{} }
}

// ---- Pairs & messages ----
export async function ensurePair(uidA, uidB){
  const pid = pidOf(uidA, uidB);
  try{
    if (mock){ if (!MOCK.pairs.has(pid)) MOCK.pairs.set(pid, { members:[uidA,uidB], createdAt: Date.now() }); return pid; }
    const { ref, get, set, serverTimestamp } = await import('firebase/database');
    const r = ref(db, `pairs/${pid}`);
    const s = await get(r);
    if (!s.exists()) await set(r, { members:[uidA, uidB], createdAt: serverTimestamp() });
    return pid;
  }catch{ return pid }
}

export async function listenToMessages(uid, peerUid, onData){
  const pid = pidOf(uid, peerUid);
  if (mock){
    const id = setInterval(()=> onData(MOCK.messages.get(pid) || []), 800);
    return ()=> clearInterval(id);
  }
  try{
    const { ref, onChildAdded } = await import('firebase/database');
    const r = ref(db, `messages/${pid}`);
    const buf = [];
    const unsub = onChildAdded(r, (snap) => { const v = snap.val(); v && buf.push({ id: snap.key, ...v }); onData(buf.slice()); });
    return ()=> unsub();
  }catch{ return ()=>{} }
}

export async function sendMessage(fromUid, toUid, { type, text, imageURL }){
  const pid = pidOf(fromUid, toUid);
  try{
    if (mock){
      const arr = MOCK.messages.get(pid) || [];
      arr.push({ id:String(Date.now()), fromUid, type, text, imageURL, timestamp: Date.now() });
      MOCK.messages.set(pid, arr);
      return true;
    }
    const { ref, push, set, serverTimestamp } = await import('firebase/database');
    const r = push(ref(db, `messages/${pid}`));
    return set(r, { fromUid, type, text: text||null, imageURL: imageURL||null, timestamp: serverTimestamp() });
  }catch{ return false }
}

// Utility: upload file (uses storage from index.js)
export async function uploadFile(file, folder='uploads'){
  if (!file) return null;
  try{
    if (mock){ return URL.createObjectURL(file); }
    const path = `${folder}/${Date.now()}_${file.name}`;
    const r = sref(storage, path);
    await uploadBytes(r, file);
    return await getDownloadURL(r);
  }catch{ return null }
}
