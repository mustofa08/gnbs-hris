import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getDefaultRouteByRole } from '../lib/get-default-route-by-role';
import { login, type LoginRequest } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { toast } from '@shared/ui/toast';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (request: LoginRequest) => login(request),
    onSuccess: (session) => {
      setAuth(session);
      toast.success('Signed in', `Welcome back, ${session.user.name}.`);
      navigate(getDefaultRouteByRole(session.user.role), { replace: true });
    },
  });
}
