interface ValidationStatsProps {
  pending: number;
  approved: number;
}

export function ValidationStats({ approved, pending }: ValidationStatsProps) {
  const total = pending + approved;
  const approvedRatio = total === 0 ? 0 : Math.round((approved / total) * 100);

  return (
    <div className="rounded-lg border bg-card p-5">
      <h2 className="text-base font-semibold">Validation Statistics</h2>
      <p className="mt-1 text-sm text-muted-foreground">Current activity validation workload</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border bg-background p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="mt-2 text-2xl font-semibold">{pending}</p>
        </div>
        <div className="rounded-md border bg-background p-4">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="mt-2 text-2xl font-semibold">{approved}</p>
        </div>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>Approved ratio</span>
          <span>{approvedRatio}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${approvedRatio}%` }} />
        </div>
      </div>
    </div>
  );
}
