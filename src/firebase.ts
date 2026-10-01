import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyB0cIkO3lAcoe73kiZ8fAbVV5CCyr1MXNA",
  authDomain: "hospital-management-3b3f6.firebaseapp.com",
  databaseURL: "https://hospital-management-3b3f6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hospital-management-3b3f6",
  storageBucket: "hospital-management-3b3f6.firebasestorage.app",
  messagingSenderId: "882819376168",
  appId: "1:882819376168:web:403919db3fa306f0c0c11d",
  measurementId: "G-2YRV6Z7DXQ"
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.warn("Google Sign-In popup notice:", error?.message);
    return { user: null, error: error?.message || 'Failed to authenticate with Google' };
  }
}

export async function logOut() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Sign out error", err);
  }
}

export { onAuthStateChanged, type User };
