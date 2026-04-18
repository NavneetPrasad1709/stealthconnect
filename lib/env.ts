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

// Call once at module load — server side only
if (typeof window === "undefined") {
  validate(requiredServer);
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
