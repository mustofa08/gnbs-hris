import { AlertTriangle, CalendarCheck, Clock3, FileQuestion } from 'lucide-react';
import type { ComponentType } from 'react';
import { StatCard } from '../../admin/components/StatCard';
import type { AttendanceStatus, CountByStatus } from '../types/employee-dashboard.types';

const statusConfig = {
  PRESENT: { title: 'Present', icon: CalendarCheck },
  LATE: { title: 'Late', icon: Clock3 },
  ABSENT: { title: 'Absent', icon: AlertTriangle },
  EXCUSED: { title: 'Excused', icon: FileQuestion },
} satisfies Record<AttendanceStatus, { title: string; icon: ComponentType<{ className?: string }> }>;

export function AttendanceSummaryCards({
  data,
}: {
  data: CountByStatus<AttendanceStatus>[];
}) {
  const counts = new Map(data.map((item) => [item.status, item.count]));

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {(Object.keys(statusConfig) as AttendanceStatus[]).map((status) => {
        const config = statusConfig[status];

        return (
          <StatCard
            key={status}
            title={config.title}
            value={counts.get(status) ?? 0}
            icon={config.icon}
            description="Attendance records"
          />
        );
      })}
    </div>
  );
}
