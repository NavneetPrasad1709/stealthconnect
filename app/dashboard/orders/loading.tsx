export default function OrdersLoading() {
  return (
    <div className="p-6 lg:p-10 space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-40 rounded" style={{ background: "var(--elevated)" }} />
        <div className="h-3 w-52 rounded" style={{ background: "var(--elevated)" }} />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-20 rounded-full" style={{ background: "var(--surface)" }} />
        ))}
      </div>

      {/* Table header */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)" }}>
        <div className="h-10 px-4 flex items-center gap-6" style={{ borderBottom: "1px solid var(--border)" }}>
          {[80, 120, 80, 100, 80, 60].map((w, i) => (
            <div key={i} className="h-3 rounded" style={{ width: w, background: "var(--elevated)" }} />
          ))}
        </div>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-14 px-4 flex items-center gap-6"
            style={{ borderBottom: i < 5 ? "1px solid var(--border)" : "none" }}
          >
            {[80, 120, 80, 100, 80, 60].map((w, j) => (
              <div key={j} className="h-3 rounded" style={{ width: w, background: "var(--elevated)" }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
