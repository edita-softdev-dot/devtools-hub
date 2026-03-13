const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

function getHeaders(auth = false): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export function useApi() {
  async function get<T>(path: string, auth = false): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, { headers: getHeaders(auth) });
    return handleResponse<T>(res);
  }

  async function post<T>(path: string, body: unknown, auth = false): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: getHeaders(auth),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  }

  async function patch<T>(path: string, body: unknown, auth = false): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: getHeaders(auth),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  }

  async function del(path: string, auth = false): Promise<void> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: getHeaders(auth),
    });
    return handleResponse<void>(res);
  }

  return { get, post, patch, del };
}
