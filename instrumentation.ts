/**
 * Next.js instrumentation — runs once when the server starts (SEC-M5).
 * Validates server env vars: hard-fails on the catastrophic, always-present Supabase keys;
 * warns on recommended-but-environment-specific ones (PayPal/Resend/email/Groq/webhook) so
 * misconfiguration is visible in logs without crashing the deployment.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateServerEnv } = await import("@/lib/env");
    validateServerEnv();
  }
}
