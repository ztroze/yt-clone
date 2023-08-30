import { initializeApp } from "firebase/app";
import { 
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCWxBrxl2InoMkDrLzJTU-ipCupwhSPRfo",
  authDomain: "yt-clone-40e57.firebaseapp.com",
  projectId: "yt-clone-40e57",
  appId: "1:642449564493:web:19cca1809a46d005ff0d04"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/**
 * Signs the user in with a Google popup.
 * @return A promise that resolves with the user's credentials.
 */
export function signInWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 * Signs the user out.
 * @return A promise that resolves when the user is signed out.
 */
export function signOut() {
  return auth.signOut();
}

/**
 * Triggers a callback when user auth state changes.
 * @return A function to unsubscribe callback.
 */
export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
