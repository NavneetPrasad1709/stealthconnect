export default function DashboardLoading() {
  return (
    <div className="p-6 lg:p-10 space-y-8 animate-pulse">
      {/* Welcome header */}
      <div className="space-y-2">
        <div className="h-3 w-28 rounded" style={{ background: "var(--elevated)" }} />
        <div className="h-8 w-64 rounded" style={{ background: "var(--elevated)" }} />
      </div>

      {/* Credits hero */}
      <div className="rounded-2xl h-40 w-full" style={{ background: "var(--surface)" }} />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl h-24" style={{ background: "var(--surface)" }} />
        ))}
      </div>

      {/* Recent orders */}
      <div className="space-y-3">
        <div className="h-4 w-32 rounded" style={{ background: "var(--elevated)" }} />
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)" }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 w-full"
              style={{
                borderBottom: i < 3 ? "1px solid var(--border)" : "none",
              }}
            >
              <div className="flex items-center gap-4 px-4 h-full">
                <div className="h-3 w-20 rounded" style={{ background: "var(--elevated)" }} />
                <div className="h-3 w-32 rounded" style={{ background: "var(--elevated)" }} />
                <div className="ml-auto h-5 w-16 rounded-full" style={{ background: "var(--elevated)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
