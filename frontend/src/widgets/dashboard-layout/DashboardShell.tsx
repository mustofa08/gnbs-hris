import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/auth.store';
import { DashboardSidebar } from './components/DashboardSidebar';
import { MobileSidebar } from './components/MobileSidebar';
import { TopNavbar } from './components/TopNavbar';

export function DashboardShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((value) => !value)}
          role={user?.role}
        />
        <MobileSidebar
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          role={user?.role}
        />
        <main className="min-w-0 flex-1">
          <TopNavbar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} user={user} />
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
