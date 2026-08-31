import { Shield } from "lucide-react";
import GoogleSignInButton from "./GoogleSignInButton";

export const metadata = {
  title: "Sign in · GhostWyre",
};

/** Keep redirects on-origin — never bounce to an attacker-supplied absolute URL. */
function safeCallbackUrl(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl);

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10">
            <Shield className="size-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Sign in to GhostWyre
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Use your Google account to start scanning.
            </p>
          </div>
        </div>

        <GoogleSignInButton callbackUrl={callbackUrl} />

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          By continuing you agree to run scans only against systems you are
          authorised to test.
        </p>
      </div>
    </main>
  );
}
