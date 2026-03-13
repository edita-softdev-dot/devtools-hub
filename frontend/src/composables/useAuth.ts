import { ref, computed } from 'vue';
import { useApi } from './useApi';
import type { LoginRequest, LoginResponse } from '../types/link';

const token = ref<string | null>(localStorage.getItem('token'));

export function useAuth() {
  const api = useApi();
  const isAuthenticated = computed(() => !!token.value);

  async function login(credentials: LoginRequest): Promise<void> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    token.value = response.accessToken;
    localStorage.setItem('token', response.accessToken);
  }

  function logout(): void {
    token.value = null;
    localStorage.removeItem('token');
  }

  return { isAuthenticated, login, logout };
}
