"use client";

import { useState, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

type Order = {
  id: string;
  created_at: string;
  status: string;
  contact_type: string;
  quantity: number;
  amount_paid: number;
  email_draft_requested: boolean;
  profiles: { email: string; full_name: string } | null;
};

const STATUS_OPTIONS = ["pending", "processing", "delivered", "failed", "refunded"] as const;
type Status = (typeof STATUS_OPTIONS)[number];

const STATUS_COLORS: Record<Status, string> = {
  pending:    "#f59e0b",
  processing: "#3b82f6",
  delivered:  "#22c55e",
  failed:     "#ef4444",
  refunded:   "#8b5cf6",
};

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  // Credits form
  const [creditEmail, setCreditEmail] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditNote, setCreditNote] = useState("");
  const [creditLoading, setCreditLoading] = useState(false);

  const LIMIT = 20;

  const fetchOrders = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "20" });
      if (q) params.set("email", q);
      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setOrders(json.orders ?? []);
      setTotal(json.total ?? 0);
      setFetched(true);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    setSearch(q);
    setPage(1);
    fetchOrders(1, q);
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    const prev = orders.find((o) => o.id === orderId)?.status;
    setOrders((cur) => cur.map((o) => (o.id === orderId ? { ...o, status } : o)));
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status updated");
    } catch {
      setOrders((cur) => cur.map((o) => (o.id === orderId ? { ...o, status: prev ?? "pending" } : o)));
      toast.error("Failed to update status");
    }
  };

  const handleExport = async () => {
    const toastId = toast.loading("Preparing CSV…");
    try {
      const res = await fetch("/api/admin/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV downloaded", { id: toastId });
    } catch {
      toast.error("Export failed", { id: toastId });
    }
  };

  const handleAssignCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(creditAmount, 10);
    if (!creditEmail || isNaN(amt) || amt < 1) {
      toast.error("Enter a valid email and amount");
      return;
    }
    setCreditLoading(true);
    try {
      const res = await fetch("/api/admin/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: creditEmail, amount: amt, note: creditNote || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      toast.success(`${amt} credit${amt !== 1 ? "s" : ""} assigned to ${creditEmail}`);
      setCreditEmail("");
      setCreditAmount("");
      setCreditNote("");
    } catch (err: any) {
      toast.error(err.message || "Failed to assign credits");
    } finally {
      setCreditLoading(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: "var(--brand)" }}>
              Admin
            </p>
            <h1 className="font-display text-3xl font-700" style={{ color: "var(--fg)" }}>
              Control Panel
            </h1>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-600 border transition-colors hover:opacity-80"
            style={{
              background: "var(--surface)",
              color: "var(--fg)",
              borderColor: "var(--border)",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 1v9m0 0L4.5 7m3 3 3-3M1 11v1.5A1.5 1.5 0 002.5 14h10a1.5 1.5 0 001.5-1.5V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export CSV
          </button>
        </div>

        {/* Assign Credits Card */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h2 className="font-display text-base font-600 mb-5" style={{ color: "var(--fg)" }}>
            Assign Credits
          </h2>
          <form onSubmit={handleAssignCredits} className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1.5 min-w-[220px] flex-1">
              <label className="text-xs font-medium" style={{ color: "var(--fg-muted)" }}>User email</label>
              <input
                type="email"
                value={creditEmail}
                onChange={(e) => setCreditEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="px-3 py-2.5 rounded-lg text-sm outline-none border transition-colors"
                style={{
                  background: "var(--elevated)",
                  color: "var(--fg)",
                  borderColor: "var(--border)",
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5 w-28">
              <label className="text-xs font-medium" style={{ color: "var(--fg-muted)" }}>Credits</label>
              <input
                type="number"
                min={1}
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="5"
                required
                className="px-3 py-2.5 rounded-lg text-sm outline-none border transition-colors"
                style={{
                  background: "var(--elevated)",
                  color: "var(--fg)",
                  borderColor: "var(--border)",
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
              <label className="text-xs font-medium" style={{ color: "var(--fg-muted)" }}>Note (optional)</label>
              <input
                type="text"
                value={creditNote}
                onChange={(e) => setCreditNote(e.target.value)}
                placeholder="e.g. Welcome bonus"
                className="px-3 py-2.5 rounded-lg text-sm outline-none border transition-colors"
                style={{
                  background: "var(--elevated)",
                  color: "var(--fg)",
                  borderColor: "var(--border)",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={creditLoading}
              className="px-5 py-2.5 rounded-lg text-sm font-600 transition-opacity disabled:opacity-50 shrink-0"
              style={{ background: "var(--brand)", color: "#fff" }}
            >
              {creditLoading ? "Assigning…" : "Assign"}
            </button>
          </form>
        </div>

        {/* Orders Section */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <h2 className="font-display text-base font-600" style={{ color: "var(--fg)" }}>
              All Orders
              {fetched && (
                <span className="ml-2 text-sm font-400" style={{ color: "var(--fg-muted)" }}>
                  ({total})
                </span>
              )}
            </h2>

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by email…"
                className="px-3 py-2 rounded-lg text-sm outline-none border w-52 transition-colors"
                style={{
                  background: "var(--surface)",
                  color: "var(--fg)",
                  borderColor: "var(--border)",
                }}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-600 transition-opacity hover:opacity-80"
                style={{ background: "var(--brand)", color: "#fff" }}
              >
                Search
              </button>
            </form>
          </div>

          {!fetched ? (
            <div
              className="rounded-2xl flex flex-col items-center justify-center py-16 gap-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
                Search by email or load all orders
              </p>
              <button
                onClick={() => fetchOrders(1, "")}
                className="px-5 py-2.5 rounded-lg text-sm font-600 transition-opacity hover:opacity-80"
                style={{ background: "var(--brand)", color: "#fff" }}
              >
                Load all orders
              </button>
            </div>
          ) : loading ? (
            <div className="rounded-2xl p-8 animate-pulse space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} className="h-12 rounded-lg" style={{ background: "var(--elevated)" }} />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div
              className="rounded-2xl flex items-center justify-center py-16"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm" style={{ color: "var(--fg-muted)" }}>No orders found.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <m.div
                key={`${page}-${search}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Desktop table */}
                <div className="hidden md:block rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div
                    className="grid text-xs font-600 uppercase tracking-wide px-4 py-3"
                    style={{
                      gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr 1.5fr",
                      color: "var(--fg-subtle)",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <span>Date</span>
                    <span>User</span>
                    <span>Type</span>
                    <span>Qty</span>
                    <span>Paid ($)</span>
                    <span>Status</span>
                  </div>
                  {orders.map((order, idx) => (
                    <div
                      key={order.id}
                      className="grid items-center px-4 py-3 text-sm"
                      style={{
                        gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr 1.5fr",
                        borderBottom: idx < orders.length - 1 ? "1px solid var(--border)" : "none",
                      }}
                    >
                      <span style={{ color: "var(--fg-muted)" }}>
                        {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-500" style={{ color: "var(--fg)" }}>
                          {order.profiles?.full_name ?? "—"}
                        </p>
                        <p className="truncate text-xs" style={{ color: "var(--fg-subtle)" }}>
                          {order.profiles?.email ?? "—"}
                        </p>
                      </div>
                      <span className="capitalize" style={{ color: "var(--fg)" }}>
                        {order.contact_type.replace("_", " ")}
                      </span>
                      <span style={{ color: "var(--fg)" }}>{order.quantity}</span>
                      <span style={{ color: "var(--fg)" }}>${order.amount_paid.toFixed(2)}</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="px-2 py-1 rounded-md text-xs font-600 outline-none border cursor-pointer"
                        style={{
                          background: `${STATUS_COLORS[order.status as Status]}18`,
                          color: STATUS_COLORS[order.status as Status] ?? "var(--fg)",
                          borderColor: `${STATUS_COLORS[order.status as Status]}40`,
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} style={{ background: "var(--surface)", color: "var(--fg)" }}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl p-4 space-y-3"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-600" style={{ color: "var(--fg)" }}>
                            {order.profiles?.full_name ?? "Unknown"}
                          </p>
                          <p className="text-xs" style={{ color: "var(--fg-subtle)" }}>
                            {order.profiles?.email ?? "—"}
                          </p>
                        </div>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="px-2 py-1 rounded-md text-xs font-600 outline-none border"
                          style={{
                            background: `${STATUS_COLORS[order.status as Status]}18`,
                            color: STATUS_COLORS[order.status as Status] ?? "var(--fg)",
                            borderColor: `${STATUS_COLORS[order.status as Status]}40`,
                          }}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} style={{ background: "var(--surface)", color: "var(--fg)" }}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-4 text-xs" style={{ color: "var(--fg-muted)" }}>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        <span className="capitalize">{order.contact_type.replace("_", " ")}</span>
                        <span>{order.quantity} URL{order.quantity !== 1 ? "s" : ""}</span>
                        <span>${order.amount_paid.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <button
                      onClick={() => {
                        const p = Math.max(1, page - 1);
                        setPage(p);
                        fetchOrders(p, search);
                      }}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg text-sm font-500 border disabled:opacity-40 transition-opacity hover:opacity-70"
                      style={{ background: "var(--surface)", color: "var(--fg)", borderColor: "var(--border)" }}
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm" style={{ color: "var(--fg-muted)" }}>
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => {
                        const p = Math.min(totalPages, page + 1);
                        setPage(p);
                        fetchOrders(p, search);
                      }}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-lg text-sm font-500 border disabled:opacity-40 transition-opacity hover:opacity-70"
                      style={{ background: "var(--surface)", color: "var(--fg)", borderColor: "var(--border)" }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </m.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
