<script setup lang="ts">
import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpen,
  Cloud,
  Database,
  FileText,
  GitBranch,
  Hammer,
  Link as LinkIcon,
  Search,
  Server,
  Shield,
} from 'lucide-vue-next';
import { computed } from 'vue';

const props = defineProps<{ name?: string; size?: number }>();

const iconMap: Record<string, any> = {
  activity: Activity,
  'alert-triangle': AlertTriangle,
  bell: Bell,
  'book-open': BookOpen,
  cloud: Cloud,
  database: Database,
  'file-text': FileText,
  'git-branch': GitBranch,
  hammer: Hammer,
  link: LinkIcon,
  search: Search,
  server: Server,
  shield: Shield,
};

const iconComponent = computed(() => iconMap[props.name ?? ''] ?? LinkIcon);
</script>

<template>
  <component :is="iconComponent" :size="size ?? 24" />
</template>
