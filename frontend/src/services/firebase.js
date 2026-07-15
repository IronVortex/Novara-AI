import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId
);

let auth = null;

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

const requireFirebase = () => {
  if (!auth) {
    throw new Error("Firebase is not configured. Set VITE_FIREBASE_* environment variables.");
  }
  return auth;
};

export const firebaseRegister = async ({ name, email, password }) => {
  const firebaseAuth = requireFirebase();
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  if (name) await updateProfile(credential.user, { displayName: name });
  return credential.user;
};

export const firebaseLogin = async ({ email, password }) => {
  const firebaseAuth = requireFirebase();
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  return credential.user;
};

export const firebaseGoogleLogin = async () => {
  const firebaseAuth = requireFirebase();
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(firebaseAuth, provider);
  return credential.user;
};

export const firebaseForgotPassword = async (email) => {
  const firebaseAuth = requireFirebase();
  await sendPasswordResetEmail(firebaseAuth, email);
};

export const firebaseLogout = async () => {
  if (!auth) return;
  await signOut(auth);
};

export const toFirebaseIdentity = (user, provider = "firebase") => ({
  firebaseUid: user.uid,
  email: user.email,
  name: user.displayName || user.email?.split("@")[0] || "Novara User",
  provider,
});
