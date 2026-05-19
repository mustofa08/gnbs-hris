import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { EmptyState } from './DashboardState';
import { formatStatus } from '../lib/dashboard-formatters';
import type { CountByStatus, AttendanceStatus } from '../types/admin-dashboard.types';

const COLORS: Record<AttendanceStatus, string> = {
  PRESENT: '#0f766e',
  LATE: '#eab308',
  ABSENT: '#dc2626',
  EXCUSED: '#2563eb',
};

interface AttendanceChartProps {
  data: CountByStatus<AttendanceStatus>[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  if (!data.length) {
    return <EmptyState message="No attendance records yet." />;
  }

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold">Attendance Statistics</h2>
        <p className="text-sm text-muted-foreground">Distribution by attendance status</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="status" innerRadius={64} outerRadius={96} paddingAngle={2}>
              {data.map((item) => (
                <Cell key={item.status} fill={COLORS[item.status]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, formatStatus(String(name))]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {data.map((item) => (
          <div key={item.status} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[item.status] }} />
            <span className="text-muted-foreground">{formatStatus(item.status)}</span>
            <span className="font-medium">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
