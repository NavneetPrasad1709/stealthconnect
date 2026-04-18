import { createAdminClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { SubmitWizard } from "@/components/dashboard/SubmitOrder/SubmitWizard";

export const metadata = { title: "Submit Order" };

export default async function SubmitOrderPage() {
  const headersList = await headers();
  const userId      = headersList.get("x-user-id");

  const supabase = createAdminClient();
  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId!)
    .maybeSingle();

  const credits = (profileRaw as { credits: number } | null)?.credits ?? 0;

  return <SubmitWizard credits={credits} />;
}
