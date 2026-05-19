import { EmptyState } from './DashboardState';
import { formatDateTime, formatStatus } from '../lib/dashboard-formatters';
import type { RecentValidationSummary } from '../types/admin-dashboard.types';

export function RecentValidationsTable({ data }: { data: RecentValidationSummary[] }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <h2 className="text-base font-semibold">Recent Validations</h2>
      <p className="mt-1 text-sm text-muted-foreground">Latest activity validation submissions</p>
      <div className="mt-4">
        {data.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-3 font-medium">Employee</th>
                  <th className="py-3 font-medium">Activity</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3">{item.employee.fullName}</td>
                    <td className="py-3">{item.activity.name}</td>
                    <td className="py-3">{formatStatus(item.status)}</td>
                    <td className="py-3 text-muted-foreground">{formatDateTime(item.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="No recent validations." />
        )}
      </div>
    </div>
  );
}
