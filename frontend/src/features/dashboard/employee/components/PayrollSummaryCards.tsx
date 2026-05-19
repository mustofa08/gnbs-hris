import { Banknote, CalendarDays, ReceiptText } from 'lucide-react';
import { StatCard } from '../../admin/components/StatCard';
import { formatCurrency, formatStatus } from '../../admin/lib/dashboard-formatters';
import type { EmployeeDashboardResponse } from '../types/employee-dashboard.types';

export function PayrollSummaryCards({
  payroll,
}: {
  payroll: EmployeeDashboardResponse['payrollSummary'];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Payroll Records"
        value={payroll.totalPayrolls}
        icon={ReceiptText}
        description="Generated payroll periods"
      />
      <StatCard
        title="Total Paid"
        value={formatCurrency(payroll.totalFinalAmount)}
        icon={Banknote}
        description="Accumulated final amount"
      />
      <StatCard
        title="Latest Period"
        value={payroll.latestPayrollPeriod ?? '-'}
        icon={CalendarDays}
        description={payroll.latestPayrollStatus ? formatStatus(payroll.latestPayrollStatus) : 'No payroll yet'}
      />
    </div>
  );
}
