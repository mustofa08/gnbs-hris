import { Button } from '@shared/ui/button';
import type { PaginatedMeta } from '@shared/api/api-response.type';

interface EmployeePaginationProps {
  meta: PaginatedMeta;
  onPageChange: (page: number) => void;
}

export function EmployeePagination({ meta, onPageChange }: EmployeePaginationProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground">
        Page {meta.page} of {meta.totalPages || 1} - {meta.total} employees
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!meta.hasPreviousPage}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
