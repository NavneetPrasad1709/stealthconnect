import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — untyped to avoid Database generic friction.
 * Bypasses RLS. Server-side only.
 */
export function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** Fetch a user's profile. Returns null if not found. */
export async function getProfile(userId: string) {
  const { data } = await adminDb()
    .from("profiles")
    .select("id, email, full_name, credits, role")
    .eq("id", userId)
    .maybeSingle();
  return data as {
    id:        string;
    email:     string;
    full_name: string | null;
    credits:   number;
    role:      "user" | "admin";
  } | null;
}

/** Deduct N credits from a user. Returns false if insufficient. */
export async function deductCredits(userId: string, amount: number): Promise<boolean> {
  const db      = adminDb();
  const profile = await getProfile(userId);
  if (!profile || profile.credits < amount) return false;

  // Try RPC first, fall back to direct update
  const { error } = await db.rpc("deduct_credit" as never, {
    p_user_id: userId,
    p_amount:  amount,
  } as never);

  if (error) {
    await db
      .from("profiles")
      .update({ credits: profile.credits - amount } as never)
      .eq("id", userId);
  }

  await db.from("credit_logs").insert({
    user_id: userId,
    amount:  -amount,
    type:    "usage",
    note:    `Deducted ${amount} credit${amount > 1 ? "s" : ""}`,
  } as never);

  return true;
}

/** Add N credits to a user. */
export async function addCredits(
  userId:  string,
  amount:  number,
  note:    string,
  adminId: string | null = null,
): Promise<void> {
  const db = adminDb();
  await db.rpc("add_credits" as never, {
    p_user_id: userId,
    p_amount:  amount,
  } as never).then(async ({ error }) => {
    if (error) {
      // Fallback: direct update
      const { data: profile } = await db
        .from("profiles")
        .select("credits")
        .eq("id", userId)
        .maybeSingle();
      const cur = (profile as { credits: number } | null)?.credits ?? 0;
      await db
        .from("profiles")
        .update({ credits: cur + amount } as never)
        .eq("id", userId);
    }
  });

  await db.from("credit_logs").insert({
    user_id:  userId,
    amount,
    type:     "admin_grant",
    note,
    admin_id: adminId,
  } as never);
}

/** PayPal base URL */
export const PAYPAL_BASE =
  process.env.PAYPAL_MODE === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

/** Get a PayPal access token */
export async function getPayPalToken(): Promise<string> {
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method:  "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json() as { access_token: string };
  return data.access_token;
}
