/**
 * Base URL to send Supabase auth redirects back to.
 *
 * Uses the live browser origin so a user who started on the apex
 * (stealthconnect.ai) returns to the apex, and a www visitor returns to www.
 * The PKCE `code_verifier` cookie is host-scoped — sending the callback to a
 * different host than the one the flow began on makes exchangeCodeForSession
 * fail with "code verifier missing". Falling back to NEXT_PUBLIC_APP_URL keeps
 * it safe if ever called during SSR (these flows run in client handlers).
 */
export function authRedirectBase(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? "";
}
