import { LogOut } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { useLogout } from '../hooks/use-logout';

export function LogoutButton() {
  const logout = useLogout();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => logout.mutate()}
      disabled={logout.isPending}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {logout.isPending ? 'Signing out' : 'Logout'}
    </Button>
  );
}
