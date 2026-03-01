import { setToken, clearToken } from '../api/client';
import { TokenResponse, UserResponse } from '../types/api';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail ?? 'Request failed');
  }
  return res.json();
}

// OAuth2 form login — Swagger compatible
export async function login(phone: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
  const form = new URLSearchParams();
  form.append('username', phone);
  form.append('password', password);

  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(err.detail ?? 'Login failed');
  }

  const data: TokenResponse = await res.json();
  setToken(data.access_token);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}

export async function register(
  fullName: string,
  phone: string,
  password: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const data = await post<TokenResponse>('/auth/register', {
    full_name: fullName,
    phone,
    password,
  });
  setToken(data.access_token);
  return { accessToken: data.access_token, refreshToken: data.refresh_token };
}

export function logout() {
  clearToken();
}