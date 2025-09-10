import { hasFirebaseEnv } from '../core/env.js';
export let app=null, db=null, auth=null, storage=null;
export let sref, uploadBytes, getDownloadURL, deleteObject;
export let mock = false;
export async function initFirebase(){
  if (!hasFirebaseEnv()){ mock = true; console.warn('[PutPing] Mock mode (no env)'); return; }
  try{
    const { initializeApp } = await import('firebase/app');
    const { getDatabase } = await import('firebase/database');
    const { getAuth, browserLocalPersistence, setPersistence } = await import('firebase/auth');
    const s = await import('firebase/storage');
    const cfg = {
      apiKey: import.meta.env.VITE_API_KEY,
      authDomain: import.meta.env.VITE_AUTH_DOMAIN,
      databaseURL: import.meta.env.VITE_DATABASE_URL,
      projectId: import.meta.env.VITE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_APP_ID,
      measurementId: import.meta.env.VITE_MEASUREMENT_ID,
    };
    app = initializeApp(cfg);
    db = getDatabase(app);
    auth = getAuth(app); try{ await setPersistence(auth, browserLocalPersistence) }catch{}
    storage = s.getStorage(app);
    sref = s.ref; uploadBytes = s.uploadBytes; getDownloadURL = s.getDownloadURL; deleteObject = s.deleteObject;
  }catch(e){ console.warn('[PutPing] Firebase init failed → mock', e); mock=true; }
}
