"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  onIdTokenChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ID_TOKEN_COOKIE } from "@/lib/authCookie";

interface AuthContextValue {
  user: User | null;
  /** True until Firebase has restored (or ruled out) a persisted session. */
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Mirror the ID token into a cookie so `proxy.ts` can gate routes server-side. */
function syncTokenCookie(token: string | null) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const attrs = `Path=/; SameSite=Lax${secure}`;

  document.cookie = token
    ? `${ID_TOKEN_COOKIE}=${token}; ${attrs}; Max-Age=3600`
    : `${ID_TOKEN_COOKIE}=; ${attrs}; Max-Age=0`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fires on sign-in, sign-out AND every background token refresh — that last
    // one is what keeps the cookie from going stale after an hour.
    return onIdTokenChanged(auth, async (nextUser) => {
      setUser(nextUser);
      syncTokenCookie(nextUser ? await nextUser.getIdToken() : null);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signInWithGoogle: async () => {
        await signInWithPopup(auth, new GoogleAuthProvider());
      },
      signOut: async () => {
        await firebaseSignOut(auth);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
