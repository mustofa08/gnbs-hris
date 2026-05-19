import { Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import type { EmployeeQuery, EmploymentStatus } from '../types/employee.types';

interface EmployeeFiltersProps {
  query: EmployeeQuery;
  onChange: (query: EmployeeQuery) => void;
}

export function EmployeeFilters({ onChange, query }: EmployeeFiltersProps) {
  const [search, setSearch] = useState(query.search ?? '');

  useEffect(() => {
    setSearch(query.search ?? '');
  }, [query.search]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onChange({ ...query, search: search || undefined, page: 1 });
  };

  const reset = () => {
    setSearch('');
    onChange({ page: 1, limit: query.limit });
  };

  return (
    <form
      className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_180px_180px_auto_auto]"
      onSubmit={submit}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search code, name, phone, position"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <select
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        value={query.status ?? ''}
        onChange={(event) =>
          onChange({
            ...query,
            status: (event.target.value || undefined) as EmploymentStatus | undefined,
            page: 1,
          })
        }
      >
        <option value="">All statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
        <option value="PROBATION">Probation</option>
        <option value="RESIGNED">Resigned</option>
        <option value="TERMINATED">Terminated</option>
      </select>
      <Input
        placeholder="Department"
        value={query.department ?? ''}
        onChange={(event) =>
          onChange({ ...query, department: event.target.value || undefined, page: 1 })
        }
      />
      <Button type="submit">Search</Button>
      <Button type="button" variant="outline" onClick={reset}>
        Reset
      </Button>
    </form>
  );
}
