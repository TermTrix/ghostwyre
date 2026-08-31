import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

// Next remounts modules across HMR reloads; reuse the app instead of re-initing.
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

/**
 * Firebase restores the signed-in user from IndexedDB asynchronously, so
 * `auth.currentUser` is still null for a few ms after boot. Wait that out once.
 */
function waitForAuthInit(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

/**
 * A currently-valid Firebase ID token, or null when signed out.
 *
 * `getIdToken()` renews the token automatically once it is within five minutes
 * of expiry, so this never hands back an expired one — that is the whole reason
 * the agent can stay a plain bearer-token API with no refresh bookkeeping.
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser ?? (await waitForAuthInit());
  return user ? user.getIdToken() : null;
}
