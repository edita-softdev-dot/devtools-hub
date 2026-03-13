<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { CreateLinkRequest, Link } from '../types/link';

const props = defineProps<{ link?: Link | null }>();
const emit = defineEmits<{
  submit: [data: CreateLinkRequest];
  cancel: [];
}>();

const form = reactive<CreateLinkRequest>({
  title: '',
  url: '',
  description: '',
  icon: '',
  category: '',
  sortOrder: 0,
  isActive: true,
  tags: [],
  environment: '',
});

const tagInput = reactive({ value: '' });

watch(
  () => props.link,
  (link) => {
    if (link) {
      Object.assign(form, {
        title: link.title,
        url: link.url,
        description: link.description ?? '',
        icon: link.icon ?? '',
        category: link.category ?? '',
        sortOrder: link.sortOrder,
        isActive: link.isActive,
        tags: [...(link.tags ?? [])],
        environment: link.environment ?? '',
      });
    } else {
      Object.assign(form, {
        title: '',
        url: '',
        description: '',
        icon: '',
        category: '',
        sortOrder: 0,
        isActive: true,
        tags: [],
        environment: '',
      });
    }
  },
  { immediate: true },
);

function addTag() {
  const tag = tagInput.value.trim();
  if (tag && !form.tags?.includes(tag)) {
    form.tags = [...(form.tags ?? []), tag];
  }
  tagInput.value = '';
}

function removeTag(tag: string) {
  form.tags = form.tags?.filter((t) => t !== tag);
}

function onSubmit() {
  emit('submit', { ...form });
}
</script>

<template>
  <form class="link-form" @submit.prevent="onSubmit">
    <div class="link-form__row">
      <div class="link-form__field">
        <label>Title *</label>
        <input v-model="form.title" type="text" required placeholder="e.g. Grafana" />
      </div>
      <div class="link-form__field">
        <label>URL *</label>
        <input v-model="form.url" type="url" required placeholder="https://..." />
      </div>
    </div>

    <div class="link-form__field">
      <label>Description</label>
      <textarea v-model="form.description" rows="2" placeholder="What this tool does..." />
    </div>

    <div class="link-form__row">
      <div class="link-form__field">
        <label>Icon</label>
        <select v-model="form.icon">
          <option value="">Select icon...</option>
          <option value="activity">Activity</option>
          <option value="alert-triangle">Alert</option>
          <option value="bell">Bell</option>
          <option value="book-open">Book</option>
          <option value="cloud">Cloud</option>
          <option value="database">Database</option>
          <option value="file-text">File</option>
          <option value="git-branch">Git</option>
          <option value="hammer">Hammer</option>
          <option value="link">Link</option>
          <option value="search">Search</option>
          <option value="server">Server</option>
          <option value="shield">Shield</option>
        </select>
      </div>
      <div class="link-form__field">
        <label>Category</label>
        <input v-model="form.category" type="text" placeholder="e.g. Monitoring" />
      </div>
    </div>

    <div class="link-form__row">
      <div class="link-form__field">
        <label>Environment</label>
        <select v-model="form.environment">
          <option value="">Select...</option>
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="development">Development</option>
        </select>
      </div>
      <div class="link-form__field">
        <label>Sort Order</label>
        <input v-model.number="form.sortOrder" type="number" min="0" />
      </div>
    </div>

    <div class="link-form__field">
      <label>Tags</label>
      <div class="link-form__tags-input">
        <div v-if="form.tags?.length" class="link-form__tags">
          <span v-for="tag in form.tags" :key="tag" class="link-form__tag">
            {{ tag }}
            <button type="button" @click="removeTag(tag)">&times;</button>
          </span>
        </div>
        <input
          v-model="tagInput.value"
          type="text"
          placeholder="Add tag and press Enter"
          @keydown.enter.prevent="addTag"
        />
      </div>
    </div>

    <div class="link-form__field link-form__checkbox">
      <label>
        <input v-model="form.isActive" type="checkbox" />
        Active (visible on landing page)
      </label>
    </div>

    <div class="link-form__actions">
      <button type="button" class="btn btn--secondary" @click="$emit('cancel')">
        Cancel
      </button>
      <button type="submit" class="btn btn--primary">
        {{ link ? 'Update' : 'Create' }} Link
      </button>
    </div>
  </form>
</template>

<style scoped>
.link-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.link-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.link-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.link-form__field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.link-form__field input[type='text'],
.link-form__field input[type='url'],
.link-form__field input[type='number'],
.link-form__field textarea,
.link-form__field select {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--color-surface);
  color: var(--color-text);
  transition: border-color 0.15s;
}

.link-form__field input:focus,
.link-form__field textarea:focus,
.link-form__field select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.link-form__checkbox label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  text-transform: none;
  letter-spacing: normal;
  cursor: pointer;
}

.link-form__tags-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.link-form__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.link-form__tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.link-form__tag button {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
}

.link-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
</style>
