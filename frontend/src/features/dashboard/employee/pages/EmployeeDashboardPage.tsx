import {
  DashboardCardSkeleton,
  DashboardErrorState,
  DashboardPanelSkeleton,
} from '../../admin/components/DashboardState';
import { AttendanceSummaryCards } from '../components/AttendanceSummaryCards';
import { PayrollSummaryCards } from '../components/PayrollSummaryCards';
import { ProfileSummaryCard } from '../components/ProfileSummaryCard';
import { RecentEmployeeValidations } from '../components/RecentEmployeeValidations';
import { UpcomingSchedulesList } from '../components/UpcomingSchedulesList';
import { useEmployeeDashboard } from '../hooks/use-employee-dashboard';

export function EmployeeDashboardPage() {
  const dashboard = useEmployeeDashboard();

  if (dashboard.isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-56 rounded bg-muted" />
          <div className="mt-2 h-4 w-72 rounded bg-muted" />
        </div>
        <DashboardPanelSkeleton className="h-44" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <DashboardCardSkeleton key={index} />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
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
        <h1 className="text-2xl font-semibold tracking-normal">Employee Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your profile, attendance, schedule, validation, and payroll overview.
        </p>
      </div>

      <ProfileSummaryCard profile={data.profile} />
      <AttendanceSummaryCards data={data.attendanceSummary} />
      <PayrollSummaryCards payroll={data.payrollSummary} />

      <div className="grid gap-6 xl:grid-cols-2">
        <UpcomingSchedulesList data={data.upcomingSchedules} />
        <RecentEmployeeValidations data={data.recentValidations} />
      </div>
    </div>
  );
}
