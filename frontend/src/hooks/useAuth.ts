import React from 'react';
import { api, ApiError } from '../api/client';
import type { User } from '@fieldsaver/shared';

// ─── Response shapes ──────────────────────────────────────────────────────────

interface AuthResponse {
  token: string;
  user: User;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

// ─── State ───────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
}

function readStoredAuth(): AuthState {
  const token = localStorage.getItem('token');
  const raw = localStorage.getItem('user');
  if (!token || !raw) return { user: null, token: null };
  try {
    const user = JSON.parse(raw) as User;
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
}

function writeStoredAuth(token: string, user: User): void {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearStoredAuth(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseAuthReturn {
  user: User | null;
  token: string | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = React.useState<AuthState>(readStoredAuth);

  const login = React.useCallback(async (input: LoginInput): Promise<void> => {
    const result = await api.post<AuthResponse>('/auth/login', input);
    writeStoredAuth(result.token, result.user);
    setState({ user: result.user, token: result.token });
  }, []);

  const register = React.useCallback(async (input: RegisterInput): Promise<void> => {
    const result = await api.post<AuthResponse>('/auth/register', input);
    writeStoredAuth(result.token, result.user);
    setState({ user: result.user, token: result.token });
  }, []);

  const logout = React.useCallback((): void => {
    // Best-effort server-side invalidation — ignore errors
    api.post('/auth/logout').catch(() => undefined);
    clearStoredAuth();
    setState({ user: null, token: null });
    window.location.href = '/login';
  }, []);

  return { user: state.user, token: state.token, login, register, logout };
}

export { ApiError };
