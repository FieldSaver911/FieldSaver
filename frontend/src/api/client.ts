const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => ({ error: 'Invalid JSON response' }));

  if (!res.ok) {
    throw new ApiError(body.error || `HTTP ${res.status}`, res.status, body.details);
  }

  return body.data as T;
}

export const api = {
  get<T>(path: string)                      { return apiFetch<T>(path); },
  post<T>(path: string, data?: unknown)     { return apiFetch<T>(path, { method: 'POST',  body: JSON.stringify(data) }); },
  put<T>(path: string, data?: unknown)      { return apiFetch<T>(path, { method: 'PUT',   body: JSON.stringify(data) }); },
  patch<T>(path: string, data?: unknown)    { return apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(data) }); },
  delete<T>(path: string)                   { return apiFetch<T>(path, { method: 'DELETE' }); },
};
