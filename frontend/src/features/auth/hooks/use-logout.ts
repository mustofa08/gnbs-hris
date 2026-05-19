import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { routePaths } from '@app/router/route-paths';
import { logout } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { toast } from '@shared/ui/toast';

export function useLogout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuth();
      toast.info('Signed out');
      navigate(routePaths.login, { replace: true });
    },
  });
}
