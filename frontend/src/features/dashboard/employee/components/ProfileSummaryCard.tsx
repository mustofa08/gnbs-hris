import { BadgeCheck, Building2, IdCard, UserCircle } from 'lucide-react';
import type { ComponentType } from 'react';
import { formatStatus } from '../../admin/lib/dashboard-formatters';
import type { EmployeeProfileSummary } from '../types/employee-dashboard.types';

export function ProfileSummaryCard({ profile }: { profile: EmployeeProfileSummary }) {
  return (
    <div className="rounded-lg border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-md bg-primary/10 p-3 text-primary">
          <UserCircle className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Employee Profile</p>
          <h2 className="mt-1 truncate text-xl font-semibold tracking-normal">{profile.fullName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{profile.position}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <ProfileMeta icon={IdCard} label="Code" value={profile.employeeCode} />
        <ProfileMeta icon={Building2} label="Department" value={profile.department} />
        <ProfileMeta icon={BadgeCheck} label="Status" value={formatStatus(profile.employmentStatus)} />
      </div>
    </div>
  );
}

function ProfileMeta({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border bg-background p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}
