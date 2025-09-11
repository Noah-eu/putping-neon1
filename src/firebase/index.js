// src/firebase/index.js
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import {
  getDatabase,
  ref, onValue, set, update, remove, serverTimestamp, push
} from 'firebase/database';

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

let app, auth, db;

/** Inicializuj Firebase a zajisti přihlášení (anonymně pokud není uživatel). */
export async function initFirebase() {
  if (app) return { app, auth, db };
  app = initializeApp(cfg);
  auth = getAuth(app);
  db = getDatabase(app);

  // Auto-login anonymně, aby appka fungovala i bez uživatelského kroku
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      await signInAnonymously(auth).catch(console.warn);
      return;
    }
    // Ulož základní profil do DB (presence + profil)
    const uref = ref(db, `users/${user.uid}`);
    const snapshot = await (await import('firebase/database')).get(uref).catch(() => null);
    const base = {
      uid: user.uid,
      name: user.displayName || 'Guest',
      photoURL: user.photoURL || null,
      gender: 'other',
      onlineAt: serverTimestamp(),
    };
    if (!snapshot || !snapshot.exists()) {
      await set(uref, base);
    } else {
      await update(uref, { onlineAt: serverTimestamp() });
    }

    // základní clean-up při zavření
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        try { update(uref, { onlineAt: serverTimestamp() }); } catch {}
      });
    }
  });

  return { app, auth, db };
}

// Auth helpers (volitelné pro UI)
export { getAuth, GoogleAuthProvider, signInWithPopup, updateProfile };

// DB re-exports pro snadné použití
export {
  getDatabase, ref, onValue, set, update, remove, push, serverTimestamp
};
