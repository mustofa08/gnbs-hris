import { Outlet } from 'react-router-dom';
import { LogoutButton } from '@features/auth/components/LogoutButton';
import { useAuthStore } from '@features/auth/store/auth.store';

export function AppLayout() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r bg-card lg:block" />
        <main className="min-w-0 flex-1">
          <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
            <div>
              <p className="text-sm font-medium">{user?.name ?? 'Pesantren HRIS'}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
            <LogoutButton />
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
