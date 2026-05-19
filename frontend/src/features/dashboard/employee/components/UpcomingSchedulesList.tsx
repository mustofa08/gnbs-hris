import { CalendarDays, MapPin } from 'lucide-react';
import { EmptyState } from '../../admin/components/DashboardState';
import type { EmployeeScheduleSummary } from '../types/employee-dashboard.types';

export function UpcomingSchedulesList({ data }: { data: EmployeeScheduleSummary[] }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <h2 className="text-base font-semibold">Upcoming Schedules</h2>
      <p className="mt-1 text-sm text-muted-foreground">Your next assigned schedule records</p>
      <div className="mt-4 space-y-3">
        {data.length ? (
          data.map((schedule) => (
            <div key={schedule.id} className="rounded-md border bg-background p-4">
              <p className="font-medium">{schedule.title}</p>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {schedule.startDate.slice(0, 10)} · {schedule.startTime}-{schedule.endTime}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {schedule.location}
                </span>
              </div>
            </div>
          ))
        ) : (
          <EmptyState message="No upcoming schedules." />
        )}
      </div>
    </div>
  );
}
