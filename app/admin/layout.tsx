import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/admin-db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");

  if (!userId) redirect("/login?next=/admin");

  const profile = await getProfile(userId);

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
