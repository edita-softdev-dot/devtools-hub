<script setup lang="ts">
import { computed } from 'vue';
import type { Link } from '../types/link';
import DynamicIcon from './DynamicIcon.vue';
import { ExternalLink } from 'lucide-vue-next';

const props = defineProps<{ link: Link }>();

const safeUrl = computed(() => {
  try {
    const url = new URL(props.link.url);
    return ['http:', 'https:'].includes(url.protocol) ? props.link.url : '#';
  } catch {
    return '#';
  }
});
</script>

<template>
  <a
    :href="safeUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="link-card"
  >
    <div class="link-card__icon">
      <DynamicIcon :name="link.icon" :size="28" />
    </div>
    <div class="link-card__body">
      <div class="link-card__header">
        <h3 class="link-card__title">{{ link.title }}</h3>
        <span v-if="link.environment" class="link-card__env" :class="`link-card__env--${link.environment}`">
          {{ link.environment }}
        </span>
        <ExternalLink :size="14" class="link-card__external" />
      </div>
      <p v-if="link.description" class="link-card__description">
        {{ link.description }}
      </p>
      <div v-if="link.tags?.length" class="link-card__tags">
        <span v-for="tag in link.tags" :key="tag" class="link-card__tag">
          {{ tag }}
        </span>
      </div>
    </div>
  </a>
</template>

<style scoped>
.link-card {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.link-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.link-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  flex-shrink: 0;
}

.link-card__body {
  flex: 1;
  min-width: 0;
}

.link-card__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.link-card__title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
}

.link-card__external {
  color: var(--color-text-muted);
  opacity: 0;
  transition: opacity 0.2s;
}

.link-card:hover .link-card__external {
  opacity: 1;
}

.link-card__description {
  font-size: 0.825rem;
  color: var(--color-text-secondary);
  margin: 0.25rem 0 0;
  line-height: 1.4;
}

.link-card__tags {
  display: flex;
  gap: 0.375rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.link-card__tag {
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  background: var(--color-tag-bg);
  color: var(--color-tag-text);
  border-radius: 999px;
  font-weight: 500;
  text-transform: lowercase;
}

.link-card__env {
  font-size: 0.65rem;
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  flex-shrink: 0;
}

.link-card__env--production {
  background: #dcfce7;
  color: #15803d;
}

.link-card__env--staging {
  background: #fef9c3;
  color: #a16207;
}

.link-card__env--development {
  background: #dbeafe;
  color: #1d4ed8;
}
</style>
