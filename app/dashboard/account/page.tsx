import { Metadata } from "next";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { AccountView } from "@/components/dashboard/AccountView";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const h      = await headers();
  const userId = h.get("x-user-id")!;

  const db = createAdminClient();

  const [{ data: profileRaw }, { data: logsRaw }] = await Promise.all([
    db
      .from("profiles")
      .select("id, email, full_name, phone, linkedin_id, credits, role, created_at")
      .eq("id", userId)
      .maybeSingle(),
    db
      .from("credit_logs")
      .select("id, amount, type, note, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const profile = profileRaw as {
    id:          string;
    email:       string;
    full_name:   string | null;
    phone:       string | null;
    linkedin_id: string | null;
    credits:     number;
    role:        "user" | "admin";
    created_at:  string;
  } | null;

  const logs = (logsRaw ?? []) as {
    id:         string;
    amount:     number;
    type:       string;
    note:       string | null;
    created_at: string;
  }[];

  return <AccountView profile={profile} creditLogs={logs} />;
}
