import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

async function testConnection() {
  try {
    // This call is to verify the Firebase configuration is reachable.
    // It may fail with "permission-denied" if rules are strict, which is fine.
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection test successful");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('the client is offline')) {
      console.warn("Firebase check: The client appears to be offline. This might be temporary or a configuration issue.", error);
    } else if (message.includes('permission-denied')) {
      console.log("Firebase connection reachable (access denied as expected by rules).");
    } else {
      console.warn("Firebase connection test produced an unexpected result:", error);
    }
  }
}

testConnection();
