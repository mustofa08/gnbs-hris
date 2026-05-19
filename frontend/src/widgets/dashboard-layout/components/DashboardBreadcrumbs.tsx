import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getBreadcrumbs } from '../lib/navigation';

export function DashboardBreadcrumbs() {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname).filter((item) => item.label !== 'App');

  if (!breadcrumbs.length) {
    return null;
  }

  return (
    <nav className="hidden items-center gap-1 text-sm text-muted-foreground sm:flex" aria-label="Breadcrumb">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <span key={item.path} className="inline-flex items-center gap-1">
            {index > 0 ? <ChevronRight className="h-3.5 w-3.5" /> : null}
            {isLast ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              <Link className="hover:text-foreground" to={item.path}>
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
