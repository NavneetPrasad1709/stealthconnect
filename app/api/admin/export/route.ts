import { NextRequest, NextResponse } from "next/server";
import { adminDb, getProfile } from "@/lib/admin-db";

// SEC-M2: neutralise CSV/formula injection — a cell starting with = + - @ (or control
// chars) can execute in Excel/Sheets. Prefix with ' to render it inert, then quote+escape.
function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

const HEADER = ["Order ID", "Date", "User Email", "User Name", "Contact Type", "Quantity", "Amount Paid ($)", "AI Draft", "Status"];
const PAGE = 1000; // PERF-M2: stream the export in pages so memory stays bounded at scale.

export async function GET(req: NextRequest) {
  // Auth: admin only
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await getProfile(userId);
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = adminDb();
  const encoder = new TextEncoder();

  // PERF-M2: stream the CSV page-by-page instead of loading every order into memory,
  // so the export scales without hitting function memory/time limits.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(HEADER.map(csvCell).join(",") + "\n"));
        let from = 0;
        for (;;) {
          const { data, error } = await (db as any)
            .from("orders")
            .select(
              `id, created_at, status, contact_type, quantity, amount_paid, email_draft_requested,
               profiles!orders_user_id_fkey(email, full_name)`
            )
            .order("created_at", { ascending: false })
            .range(from, from + PAGE - 1);

          if (error) { controller.error(new Error(error.message)); return; }

          const rows = (data ?? []) as any[];
          for (const r of rows) {
            const cells = [
              r.id,
              new Date(r.created_at).toISOString().split("T")[0],
              r.profiles?.email ?? "",
              r.profiles?.full_name ?? "",
              r.contact_type,
              r.quantity,
              r.amount_paid,
              r.email_draft_requested ? "Yes" : "No",
              r.status,
            ];
            controller.enqueue(encoder.encode(cells.map(csvCell).join(",") + "\n"));
          }

          if (rows.length < PAGE) break;
          from += PAGE;
        }
        controller.close();
      } catch (e) {
        controller.error(e as Error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${Date.now()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
