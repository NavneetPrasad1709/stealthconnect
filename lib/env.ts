/**
 * Validates required environment variables at startup.
 * Import this in server-only code (layout, route handlers, middleware).
 * Throws clearly if misconfigured rather than failing silently.
 */

const requiredServer = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const requiredClient = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
] as const;

function validate(vars: readonly string[]) {
  const missing = vars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((v) => `  • ${v}`).join("\n")}\n\nCheck your .env.local file.`
    );
  }
}

/**
 * Strongly recommended for full functionality. Missing → WARN (don't crash): the app still
 * boots, but the dependent feature won't work. These are intentionally NOT hard-required
 * because they legitimately vary per environment (e.g. PAYPAL_WEBHOOK_ID is set only once a
 * PayPal webhook is registered; preview deploys may omit several).
 */
const recommendedServer = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_PAYPAL_CLIENT_ID",
  "PAYPAL_CLIENT_SECRET",
  "PAYPAL_WEBHOOK_ID",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "TEAM_EMAIL",
  "GROQ_API_KEY",
] as const;

/**
 * Validate server env at startup (called from instrumentation.ts). Hard-fails only on the
 * catastrophic, always-present Supabase vars; warns on recommended ones so misconfiguration
 * is visible in logs without crashing the deployment.
 */
export function validateServerEnv() {
  validate(requiredServer); // throws if a Supabase var is missing
  const missing = recommendedServer.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.warn(
      `[env] Missing recommended server env vars — dependent features disabled:\n${missing
        .map((v) => `  • ${v}`)
        .join("\n")}`
    );
  }
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
  paypalClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
  paypalMode: (process.env.PAYPAL_MODE ?? "sandbox") as "sandbox" | "live",
} as const;

export { validate as validateClientEnv, requiredClient };
