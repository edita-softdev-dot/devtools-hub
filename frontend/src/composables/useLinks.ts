import { ref } from 'vue';
import { useApi } from './useApi';
import type { Link, CreateLinkRequest, UpdateLinkRequest } from '../types/link';

export function useLinks() {
  const api = useApi();
  const links = ref<Link[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchPublicLinks(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      links.value = await api.get<Link[]>('/links');
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAllLinks(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      links.value = await api.get<Link[]>('/links/admin', true);
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function createLink(data: CreateLinkRequest): Promise<Link> {
    const link = await api.post<Link>('/links', data, true);
    links.value.push(link);
    return link;
  }

  async function updateLink(id: string, data: UpdateLinkRequest): Promise<Link> {
    const updated = await api.patch<Link>(`/links/${id}`, data, true);
    const index = links.value.findIndex((l) => l.id === id);
    if (index !== -1) links.value[index] = updated;
    return updated;
  }

  async function deleteLink(id: string): Promise<void> {
    await api.del(`/links/${id}`, true);
    links.value = links.value.filter((l) => l.id !== id);
  }

  return {
    links,
    loading,
    error,
    fetchPublicLinks,
    fetchAllLinks,
    createLink,
    updateLink,
    deleteLink,
  };
}
