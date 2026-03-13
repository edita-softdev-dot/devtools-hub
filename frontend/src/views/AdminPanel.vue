<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { LogOut, Plus, Pencil, Trash2, Wrench } from 'lucide-vue-next';
import { useLinks } from '../composables/useLinks';
import { useAuth } from '../composables/useAuth';
import LinkForm from '../components/LinkForm.vue';
import DynamicIcon from '../components/DynamicIcon.vue';
import type { CreateLinkRequest, Link } from '../types/link';

const router = useRouter();
const { logout } = useAuth();
const { links, loading, error, fetchAllLinks, createLink, updateLink, deleteLink } = useLinks();

const showForm = ref(false);
const editingLink = ref<Link | null>(null);
const formError = ref<string | null>(null);

function openCreate() {
  editingLink.value = null;
  showForm.value = true;
  formError.value = null;
}

function openEdit(link: Link) {
  editingLink.value = link;
  showForm.value = true;
  formError.value = null;
}

function closeForm() {
  showForm.value = false;
  editingLink.value = null;
  formError.value = null;
}

async function onSubmit(data: CreateLinkRequest) {
  formError.value = null;
  try {
    if (editingLink.value) {
      await updateLink(editingLink.value.id, data);
    } else {
      await createLink(data);
    }
    closeForm();
    await fetchAllLinks();
  } catch (e: any) {
    formError.value = e.message;
  }
}

async function onDelete(link: Link) {
  if (!confirm(`Delete "${link.title}"?`)) return;
  try {
    await deleteLink(link.id);
  } catch (e: any) {
    alert(e.message);
  }
}

function onLogout() {
  logout();
  router.push('/');
}

onMounted(fetchAllLinks);
</script>

<template>
  <div class="admin">
    <header class="admin__header">
      <div class="admin__brand">
        <router-link to="/" class="admin__brand-link">
          <Wrench :size="24" />
          <span>DevTools Hub</span>
        </router-link>
        <span class="admin__badge">Admin</span>
      </div>
      <button class="btn btn--ghost btn--sm" @click="onLogout">
        <LogOut :size="16" />
        Logout
      </button>
    </header>

    <div class="admin__toolbar">
      <h2>Manage Links</h2>
      <button class="btn btn--primary btn--sm" @click="openCreate">
        <Plus :size="16" />
        Add Link
      </button>
    </div>

    <div v-if="showForm" class="admin__form-container">
      <h3>{{ editingLink ? 'Edit Link' : 'Create New Link' }}</h3>
      <div v-if="formError" class="admin__form-error">{{ formError }}</div>
      <LinkForm :link="editingLink" @submit="onSubmit" @cancel="closeForm" />
    </div>

    <div v-if="loading" class="admin__state">Loading...</div>
    <div v-else-if="error" class="admin__state admin__state--error">{{ error }}</div>
    <div v-else-if="!links.length" class="admin__state">
      No links yet. Click "Add Link" to create one.
    </div>

    <table v-else class="admin__table">
      <thead>
        <tr>
          <th>Link</th>
          <th>Category</th>
          <th>Environment</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="link in links" :key="link.id">
          <td>
            <div class="admin__link-info">
              <DynamicIcon :name="link.icon" :size="18" />
              <div>
                <strong>{{ link.title }}</strong>
                <span class="admin__link-url">{{ link.url }}</span>
              </div>
            </div>
          </td>
          <td>
            <span class="admin__category-badge">
              {{ link.category ?? 'Uncategorized' }}
            </span>
          </td>
          <td>{{ link.environment ?? '-' }}</td>
          <td>
            <span
              class="admin__status"
              :class="link.isActive ? 'admin__status--active' : 'admin__status--inactive'"
            >
              {{ link.isActive ? 'Active' : 'Inactive' }}
            </span>
          </td>
          <td>
            <div class="admin__actions">
              <button class="btn btn--ghost btn--icon" @click="openEdit(link)" title="Edit">
                <Pencil :size="15" />
              </button>
              <button class="btn btn--ghost btn--icon btn--danger" @click="onDelete(link)" title="Delete">
                <Trash2 :size="15" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.admin {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.admin__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.admin__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.admin__brand-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 700;
  font-size: 1.15rem;
}

.admin__brand-link span {
  color: var(--color-text);
}

.admin__badge {
  padding: 0.2rem 0.6rem;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.admin__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.admin__toolbar h2 {
  font-size: 1.15rem;
  margin: 0;
}

.admin__form-container {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.admin__form-container h3 {
  margin: 0 0 1rem;
  font-size: 1rem;
}

.admin__form-error {
  padding: 0.5rem 0.75rem;
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-radius: 8px;
  font-size: 0.8rem;
  margin-bottom: 1rem;
}

.admin__state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-secondary);
}

.admin__state--error {
  color: var(--color-danger);
}

.admin__table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.admin__table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}

.admin__table td {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.admin__table tr:last-child td {
  border-bottom: none;
}

.admin__link-info {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: var(--color-primary);
}

.admin__link-info div {
  display: flex;
  flex-direction: column;
}

.admin__link-info strong {
  color: var(--color-text);
  font-size: 0.875rem;
}

.admin__link-url {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.admin__category-badge {
  padding: 0.15rem 0.5rem;
  background: var(--color-tag-bg);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.admin__status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}

.admin__status--active {
  background: #dcfce7;
  color: #16a34a;
}

.admin__status--inactive {
  background: #fef2f2;
  color: #dc2626;
}

.admin__actions {
  display: flex;
  gap: 0.25rem;
}
</style>
