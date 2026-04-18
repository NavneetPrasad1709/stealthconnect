import { createAdminClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const userId    = headersList.get("x-user-id");
  const userEmail = headersList.get("x-user-email");

  if (!userId) redirect("/login");

  const supabase = createAdminClient();
  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("credits, full_name, role")
    .eq("id", userId)
    .maybeSingle();

  const profile = profileRaw as { credits: number; full_name: string | null; role: string } | null;
  const credits     = profile?.credits ?? 0;
  const displayName = profile?.full_name ?? userEmail ?? "User";
  const isAdmin     = profile?.role === "admin";

  return (
    <DashboardShell
      userName={displayName}
      userEmail={userEmail ?? ""}
      credits={credits}
      isAdmin={isAdmin}
    >
      {children}
    </DashboardShell>
  );
}
