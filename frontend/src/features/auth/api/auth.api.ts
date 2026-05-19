import { httpClient } from '@shared/api/http-client';
import type { AuthSession } from '../types/auth.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export async function login(request: LoginRequest): Promise<AuthSession> {
  const response = await httpClient.post<AuthSession>('/auth/login', request);
  return response.data;
}

export async function logout(): Promise<void> {
  await httpClient.post('/auth/logout', {});
}
