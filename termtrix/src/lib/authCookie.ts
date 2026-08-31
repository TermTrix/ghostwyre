/**
 * Name of the cookie the browser mirrors the Firebase ID token into.
 *
 * Shared between `AuthProvider` (which writes it) and `proxy.ts` (which reads
 * it). Kept free of Firebase imports so the proxy stays lightweight.
 */
export const ID_TOKEN_COOKIE = "gw_id_token";
