import { EmptyState } from '../../admin/components/DashboardState';
import { formatDateTime, formatStatus } from '../../admin/lib/dashboard-formatters';
import type { EmployeeRecentValidation } from '../types/employee-dashboard.types';

export function RecentEmployeeValidations({ data }: { data: EmployeeRecentValidation[] }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <h2 className="text-base font-semibold">Recent Validations</h2>
      <p className="mt-1 text-sm text-muted-foreground">Latest validation submissions</p>
      <div className="mt-4">
        {data.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-3 font-medium">Activity</th>
                  <th className="py-3 font-medium">Schedule</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3">{item.activity.name}</td>
                    <td className="py-3">{item.schedule.title}</td>
                    <td className="py-3">{formatStatus(item.status)}</td>
                    <td className="py-3 text-muted-foreground">{formatDateTime(item.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="No validation records yet." />
        )}
      </div>
    </div>
  );
}
