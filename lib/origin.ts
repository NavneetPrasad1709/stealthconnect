/**
 * Same-site origin guard for mutating API routes (SEC-M3 / CSRF defence-in-depth).
 *
 * Returns true when the request is same-site. We compare the `Origin` to the request's
 * own `Host` (works for prod, Vercel preview *.vercel.app, custom domains, and localhost
 * without hardcoding), and also accept the configured app URL + localhost as a fallback.
 *
 * Requests with NO `Origin` header are ALLOWED — browsers always send Origin on
 * cross-origin and on non-GET requests, while legitimate server-to-server callers omit it.
 *
 * DO NOT use this on the PayPal webhook: PayPal posts server-to-server with no browser
 * Origin, and a non-matching value must not be rejected there.
 */
export function isAllowedOrigin(headers: { get(name: string): string | null }): boolean {
  const origin = headers.get("origin");
  if (!origin) return true; // no Origin → server-to-server / same-origin GET — allow

  try {
    const originHost = new URL(origin).host;

    // Same-origin: Origin matches the host the request is actually hitting.
    const reqHost = headers.get("host");
    if (reqHost && originHost === reqHost) return true;

    // Fallback allowlist: configured canonical app URL (www/apex-insensitive) + localhost.
    const norm = (h: string) => h.replace(/^www\./, "");
    const allowed = new Set<string>(["localhost:3000", "localhost"]);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl) {
      try { allowed.add(norm(new URL(appUrl).host)); } catch { /* ignore bad APP_URL */ }
    }
    return allowed.has(norm(originHost));
  } catch {
    return false; // malformed Origin — reject (legit browsers never send this)
  }
}
