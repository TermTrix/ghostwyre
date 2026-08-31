"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/popup-blocked":
    "Your browser blocked the sign-in popup. Allow popups and try again.",
  "auth/account-exists-with-different-credential":
    "That email is already linked to a different sign-in method.",
  "auth/network-request-failed":
    "Network error. Check your connection and try again.",
  "auth/unauthorized-domain":
    "This domain is not authorised in the Firebase console.",
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-5">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

export default function GoogleSignInButton({
  callbackUrl,
}: {
  callbackUrl: string;
}) {
  const router = useRouter();
  const { user, loading, signInWithGoogle } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Covers both a fresh sign-in and a returning user whose cookie lapsed while
  // their Firebase session stayed alive — the provider re-mints the cookie and
  // we send them straight on.
  useEffect(() => {
    if (user) router.replace(callbackUrl);
  }, [user, callbackUrl, router]);

  const handleSignIn = async () => {
    setPending(true);
    setError(null);
    try {
      await signInWithGoogle();
      // The effect above redirects once the provider reports the new user.
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(ERROR_MESSAGES[code] ?? "Could not sign you in. Please try again.");
      setPending(false);
    }
  };

  const busy = pending || loading || Boolean(user);

  return (
    <>
      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={busy}
        onClick={handleSignIn}
        className="h-11 w-full gap-3 text-sm"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
        {busy ? "Signing you in…" : "Continue with Google"}
      </Button>
    </>
  );
}
