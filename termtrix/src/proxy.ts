import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ID_TOKEN_COOKIE } from "@/lib/authCookie";

/**
 * Cheap `exp` check against the *unverified* JWT payload.
 *
 * This is a routing hint only, never a security boundary — anyone can forge a
 * cookie that passes it. The FastAPI agent verifies the signature with the
 * Firebase Admin SDK before trusting a token, and that is what actually guards
 * the data.
 */
function looksSignedIn(token: string | undefined): boolean {
  if (!token) return false;

  try {
    const { exp } = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
    );
    return typeof exp === "number" && exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// Next.js 16 renamed Middleware to Proxy. It runs on the Node.js runtime.
export function proxy(request: NextRequest) {
  if (looksSignedIn(request.cookies.get(ID_TOKEN_COOKIE)?.value)) {
    return NextResponse.next();
  }

  // A returning user whose cookie expired still has a live Firebase session in
  // IndexedDB, so /signin re-mints the cookie and bounces them straight back.
  const signInUrl = new URL("/signin", request.url);
  signInUrl.searchParams.set(
    "callbackUrl",
    request.nextUrl.pathname + request.nextUrl.search,
  );

  return NextResponse.redirect(signInUrl);
}

export const config = {
  // Guard everything except the sign-in page and static assets.
  matcher: [
    "/((?!signin|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
