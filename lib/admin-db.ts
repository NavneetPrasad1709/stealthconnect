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

/**
 * Atomically deduct N credits.
 * Calls the `deduct_credit(p_user_id UUID, p_amount INT)` RPC which uses
 * `SELECT … FOR UPDATE` and CHECK (credits >= 0) to be race-safe.
 * Falls back to optimistic locking only if the RPC fails.
 */
export async function deductCredits(userId: string, amount: number): Promise<boolean> {
  const db = adminDb();

  const { data: rpcData, error: rpcErr } = await db.rpc("deduct_credit" as never, {
    p_user_id: userId,
    p_amount:  amount,
  } as never);

  if (!rpcErr) {
    // RPC returns boolean: true = deducted, false = insufficient credits
    return rpcData === true;
  }

  // RPC failed — log and try optimistic-lock fallback for resilience
  console.error("deduct_credit RPC failed, using fallback:", rpcErr);

  const profile = await getProfile(userId);
  if (!profile || profile.credits < amount) return false;

  const { data: updated, error: updateErr } = await db
    .from("profiles")
    .update({ credits: profile.credits - amount } as never)
    .eq("id", userId)
    .eq("credits" as never, profile.credits as never)
    .select("id");

  if (updateErr || !updated?.length) return false;

  await db.from("credit_logs").insert({
    user_id: userId,
    amount:  -amount,
    type:    "usage",
    note:    `Deducted ${amount} credit${amount > 1 ? "s" : ""} (fallback path)`,
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
  if (amount <= 0) throw new Error("addCredits: amount must be positive");

  const db = adminDb();
  const { error: rpcErr } = await db.rpc("add_credits" as never, {
    p_user_id: userId,
    p_amount:  amount,
    p_note:    note,
    p_admin_id: adminId,
  } as never);

  if (!rpcErr) return;

  // Fallback
  console.error("add_credits RPC failed, using fallback:", rpcErr);
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
  await db.from("credit_logs").insert({
    user_id:  userId,
    amount,
    type:     "admin_grant",
    note,
    admin_id: adminId,
  } as never);
}

/* ─── PayPal ───────────────────────────────────────────────── */

const PP_MODE = process.env.PAYPAL_MODE;

/** PayPal base URL — defaults to live; only `"sandbox"` switches to sandbox. */
export const PAYPAL_BASE =
  PP_MODE === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

function assertPayPalMode() {
  if (PP_MODE !== "live" && PP_MODE !== "sandbox") {
    throw new Error(
      `PAYPAL_MODE must be "live" or "sandbox", got: ${PP_MODE ?? "undefined"}`
    );
  }
}

/**
 * fetch wrapper with AbortController timeout.
 * Default 15s — PayPal capture under load can take 8-12s.
 */
export function fetchWithTimeout(
  url:     string,
  options: RequestInit = {},
  ms:      number = 15000,
): Promise<Response> {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

/**
 * In-memory PayPal access-token cache.
 * Tokens are valid for ~9 hours; we re-use the same token across requests
 * within a warm serverless instance.
 */
let cachedToken: { value: string; expiresAt: number } | null = null;

export async function getPayPalToken(): Promise<string> {
  assertPayPalMode();

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const secret   = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal credentials not configured");

  const res = await fetchWithTimeout(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method:  "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:  "Basic " + Buffer.from(`${clientId}:${secret}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json() as {
    access_token?: string;
    expires_in?:   number;
    error?:        string;
  };
  if (!res.ok || !data.access_token) {
    throw new Error(`PayPal auth failed: ${data.error ?? res.status}`);
  }

  // Refresh ~60s before real expiry to avoid in-flight expiry
  const ttlMs = (data.expires_in ?? 32400) * 1000 - 60_000;
  cachedToken = { value: data.access_token, expiresAt: Date.now() + ttlMs };
  return data.access_token;
}

/* ─── PayPal intent helpers ────────────────────────────────────
   Records the {paypal_order_id, user_id, expected_cents} mapping at
   create-order time. Verified at capture-order and orders/create
   to prevent ownership hijacking and amount tampering.
─────────────────────────────────────────────────────────────── */

export interface PayPalIntent {
  paypal_order_id: string;
  user_id:         string;
  contact_type:    "email" | "phone" | "both";
  quantity:        number;
  email_draft:     boolean;
  expected_cents:  number;
  consumed:        boolean;
}

export async function recordPayPalIntent(input: Omit<PayPalIntent, "consumed">): Promise<void> {
  const db = adminDb();
  const { error } = await db.from("paypal_intents").insert(input as never);
  if (error) throw new Error(`paypal_intent insert failed: ${error.message}`);
}

export async function getPayPalIntent(
  paypal_order_id: string,
): Promise<PayPalIntent | null> {
  const db = adminDb();
  const { data } = await db
    .from("paypal_intents")
    .select("paypal_order_id, user_id, contact_type, quantity, email_draft, expected_cents, consumed")
    .eq("paypal_order_id", paypal_order_id)
    .maybeSingle();
  return data as PayPalIntent | null;
}

export async function consumePayPalIntent(paypal_order_id: string): Promise<void> {
  const db = adminDb();
  await db
    .from("paypal_intents")
    .update({ consumed: true } as never)
    .eq("paypal_order_id", paypal_order_id as never);
}

/* ─── Pending alerts (admin surfacing for team-email failures, disputes) ─── */

export async function recordPendingAlert(input: {
  order_id?: string | null;
  user_id?:  string | null;
  reason:    string;
  details?:  unknown;
}): Promise<void> {
  const db = adminDb();
  await db.from("pending_alerts").insert({
    order_id: input.order_id ?? null,
    user_id:  input.user_id ?? null,
    reason:   input.reason,
    details:  input.details ?? null,
  } as never);
}
