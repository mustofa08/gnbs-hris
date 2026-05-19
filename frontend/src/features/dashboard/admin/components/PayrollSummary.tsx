import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EmptyState } from './DashboardState';
import { formatCurrency, formatStatus } from '../lib/dashboard-formatters';
import type { AdminDashboardResponse } from '../types/admin-dashboard.types';

interface PayrollSummaryProps {
  payroll: AdminDashboardResponse['payrollStatistics'];
  monthlyTotals: AdminDashboardResponse['monthlyPayrollTotals'];
}

export function PayrollSummary({ monthlyTotals, payroll }: PayrollSummaryProps) {
  const chartData = monthlyTotals.map((item) => ({
    ...item,
    totalFinalAmountValue: Number(item.totalFinalAmount),
  }));
  const hasMonthlyData = chartData.some((item) => item.totalFinalAmountValue > 0);

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold">Payroll Summary</h2>
        <p className="text-sm text-muted-foreground">Generated payroll totals and monthly trend</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryMetric label="Compensation" value={formatCurrency(payroll.totalCompensation)} />
        <SummaryMetric label="Penalty" value={formatCurrency(payroll.totalPenalty)} />
        <SummaryMetric label="Late penalty" value={formatCurrency(payroll.totalLatePenalty)} />
        <SummaryMetric label="Final amount" value={formatCurrency(payroll.totalFinalAmount)} />
      </div>
      <div className="mt-6 h-72">
        {hasMonthlyData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis
                tickFormatter={(value) => `${Number(value) / 1_000_000}M`}
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="totalFinalAmountValue" fill="#0f766e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="No payroll totals for this year." />
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {payroll.byStatus.map((item) => (
          <span
            key={item.status}
            className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
          >
            {formatStatus(item.status)}: {item.count}
          </span>
        ))}
      </div>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
