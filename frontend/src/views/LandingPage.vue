<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Search, Wrench } from 'lucide-vue-next';
import { useLinks } from '../composables/useLinks';
import { useAuth } from '../composables/useAuth';
import LinkCard from '../components/LinkCard.vue';

const { links, loading, error, fetchPublicLinks } = useLinks();
const { isAuthenticated } = useAuth();
const searchQuery = ref('');
const activeCategory = ref<string | null>(null);

const categories = computed(() => {
  const cats = new Set(links.value.map((l) => l.category ?? 'Uncategorized'));
  return Array.from(cats).sort();
});

const filteredLinks = computed(() => {
  let result = links.value;

  if (activeCategory.value) {
    result = result.filter((l) => (l.category ?? 'Uncategorized') === activeCategory.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (l) =>
        l.title.toLowerCase().includes(query) ||
        l.description?.toLowerCase().includes(query) ||
        l.tags?.some((t) => t.toLowerCase().includes(query)),
    );
  }

  return result;
});

const groupedLinks = computed(() => {
  const groups: Record<string, typeof links.value> = {};
  for (const link of filteredLinks.value) {
    const cat = link.category ?? 'Uncategorized';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(link);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
});

onMounted(fetchPublicLinks);
</script>

<template>
  <div class="landing">
    <header class="landing__header">
      <div class="landing__brand">
        <Wrench :size="28" />
        <div>
          <h1>DevTools Hub</h1>
          <p>Internal developer tools &amp; services</p>
        </div>
      </div>
      <router-link
        v-if="isAuthenticated"
        to="/admin"
        class="btn btn--secondary btn--sm"
      >
        Admin Panel
      </router-link>
      <router-link v-else to="/login" class="btn btn--ghost btn--sm">
        Admin Login
      </router-link>
    </header>

    <div class="landing__controls">
      <div class="landing__search">
        <Search :size="18" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search tools..."
        />
      </div>
      <div class="landing__filters">
        <button
          class="landing__filter"
          :class="{ 'landing__filter--active': !activeCategory }"
          @click="activeCategory = null"
        >
          All
        </button>
        <button
          v-for="cat in categories"
          :key="cat"
          class="landing__filter"
          :class="{ 'landing__filter--active': activeCategory === cat }"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="landing__state">Loading tools...</div>
    <div v-else-if="error" class="landing__state landing__state--error">
      {{ error }}
    </div>
    <div v-else-if="!filteredLinks.length" class="landing__state">
      No tools found.
    </div>

    <main v-else class="landing__content">
      <section v-for="[category, items] in groupedLinks" :key="category">
        <h2 class="landing__category">{{ category }}</h2>
        <div class="landing__grid">
          <LinkCard v-for="link in items" :key="link.id" :link="link" />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.landing {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.landing__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.landing__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-primary);
}

.landing__brand h1 {
  font-size: 1.4rem;
  margin: 0;
  color: var(--color-text);
}

.landing__brand p {
  font-size: 0.825rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.landing__controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.landing__search {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text-muted);
}

.landing__search input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  color: var(--color-text);
  outline: none;
}

.landing__filters {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.landing__filter {
  padding: 0.35rem 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.landing__filter:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.landing__filter--active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.landing__state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.landing__state--error {
  color: var(--color-danger);
}

.landing__category {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  margin: 0 0 0.75rem;
  font-weight: 600;
}

.landing__content section + section {
  margin-top: 2rem;
}

.landing__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 0.75rem;
}
</style>
