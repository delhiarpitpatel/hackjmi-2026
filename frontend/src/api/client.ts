const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

// In-memory token store (never localStorage)
let accessToken: string | null = null;

export const setToken = (token: string) => { accessToken = token; };
export const getToken = () => accessToken;
export const clearToken = () => { accessToken = null; };

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string;
}

// ── Base request ──────────────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body: unknown = null,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    const error: ApiError = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail ?? "Request failed");
  }

  // Handle 204 No Content
  if (res.status === 204) return null as T;

  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string)                  => request<T>("GET",    path),
  post:   <T>(path: string, body: unknown)   => request<T>("POST",   path, body),
  patch:  <T>(path: string, body: unknown)   => request<T>("PATCH",  path, body),
  delete: <T>(path: string)                  => request<T>("DELETE", path),
};

// Alias — used by services that import apiClient
export const apiClient = api;
