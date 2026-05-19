import { Activity, CalendarDays, GraduationCap, Users } from 'lucide-react';
import { AttendanceChart } from '../components/AttendanceChart';
import {
  DashboardCardSkeleton,
  DashboardErrorState,
  DashboardPanelSkeleton,
} from '../components/DashboardState';
import { PayrollSummary } from '../components/PayrollSummary';
import { RecentAttendanceTable } from '../components/RecentAttendanceTable';
import { RecentValidationsTable } from '../components/RecentValidationsTable';
import { StatCard } from '../components/StatCard';
import { ValidationStats } from '../components/ValidationStats';
import { useAdminDashboard } from '../hooks/use-admin-dashboard';

export function AdminDashboardPage() {
  const year = new Date().getFullYear();
  const dashboard = useAdminDashboard(year);

  if (dashboard.isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-48 rounded bg-muted" />
          <div className="mt-2 h-4 w-72 rounded bg-muted" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <DashboardCardSkeleton key={index} />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
          <DashboardPanelSkeleton />
          <DashboardPanelSkeleton />
        </div>
      </div>
    );
  }

  if (dashboard.isError || !dashboard.data) {
    return <DashboardErrorState onRetry={() => dashboard.refetch()} />;
  }

  const data = dashboard.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Operational overview for HRIS activity, attendance, validation, and payroll.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Employees"
          value={data.totals.employees}
          icon={Users}
          description="Active employee records"
        />
        <StatCard
          title="Students"
          value={data.totals.students}
          icon={GraduationCap}
          description="Active student records"
        />
        <StatCard
          title="Activities"
          value={data.totals.activities}
          icon={Activity}
          description="Configured activity masters"
        />
        <StatCard
          title="Schedules"
          value={data.totals.schedules}
          icon={CalendarDays}
          description="Active schedule records"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <AttendanceChart data={data.attendanceStatistics} />
        <PayrollSummary payroll={data.payrollStatistics} monthlyTotals={data.monthlyPayrollTotals} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <ValidationStats pending={data.validations.pending} approved={data.validations.approved} />
        <RecentValidationsTable data={data.recentValidations} />
      </div>

      <RecentAttendanceTable data={data.recentAttendanceRecords} />
    </div>
  );
}
