import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuth } from './useAuth';
import * as clientModule from '../api/client';

// ─── localStorage mock ────────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useAuth', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.restoreAllMocks();
    // Replace window.location.href setter to avoid jsdom errors
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return null user and token when not logged in', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('should restore user and token from localStorage on mount', () => {
    const fakeUser = { id: 'u1', email: 'a@b.com', name: 'Alice', role: 'admin' as const, mondayAccountId: null, createdAt: '', updatedAt: '' };
    localStorageMock.setItem('token', 'jwt-abc');
    localStorageMock.setItem('user', JSON.stringify(fakeUser));

    const { result } = renderHook(() => useAuth());
    expect(result.current.token).toBe('jwt-abc');
    expect(result.current.user?.email).toBe('a@b.com');
  });

  it('should store token and user in localStorage after login', async () => {
    const fakeUser = { id: 'u1', email: 'a@b.com', name: 'Alice', role: 'editor' as const, mondayAccountId: null, createdAt: '', updatedAt: '' };
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({ token: 'jwt-xyz', user: fakeUser } as never);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ email: 'a@b.com', password: 'password123' });
    });

    expect(localStorageMock.getItem('token')).toBe('jwt-xyz');
    expect(result.current.token).toBe('jwt-xyz');
    expect(result.current.user?.email).toBe('a@b.com');
  });

  it('should store token and user in localStorage after register', async () => {
    const fakeUser = { id: 'u2', email: 'b@c.com', name: 'Bob', role: 'editor' as const, mondayAccountId: null, createdAt: '', updatedAt: '' };
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({ token: 'jwt-reg', user: fakeUser } as never);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register({ name: 'Bob', email: 'b@c.com', password: 'password123' });
    });

    expect(localStorageMock.getItem('token')).toBe('jwt-reg');
    expect(result.current.token).toBe('jwt-reg');
  });

  it('should clear localStorage and redirect on logout', async () => {
    localStorageMock.setItem('token', 'jwt-abc');
    localStorageMock.setItem('user', JSON.stringify({ id: 'u1' }));
    vi.spyOn(clientModule.api, 'post').mockResolvedValue(undefined as never);

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(localStorageMock.getItem('token')).toBeNull();
    expect(localStorageMock.getItem('user')).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('should propagate ApiError thrown by the API client on login', async () => {
    vi.spyOn(clientModule.api, 'post').mockRejectedValue(
      new clientModule.ApiError('Unauthorized', 401)
    );

    const { result } = renderHook(() => useAuth());

    await expect(
      act(async () => {
        await result.current.login({ email: 'x@y.com', password: 'wrongpassword' });
      })
    ).rejects.toThrow('Unauthorized');
  });
});
