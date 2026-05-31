import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Always execute on the server so the DB read actually fires on every hit.
// A daily Vercel cron (see vercel.json) calls this to keep the Supabase
// free-tier project active — it auto-pauses after 7 days of zero activity,
// which is what took auth (sign-in / Google) down.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const startedAt = Date.now();

  try {
    const supabase = createAdminClient();

    // Cheapest query that still touches Postgres: HEAD count, returns no rows.
    const { error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        { status: "degraded", db: "error", message: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "ok",
      db: "reachable",
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { status: "down", message: err instanceof Error ? err.message : "unknown error" },
      { status: 503 }
    );
  }
}
