<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Lock, Wrench } from 'lucide-vue-next';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { login } = useAuth();

const email = ref('');
const password = ref('');
const error = ref<string | null>(null);
const loading = ref(false);

async function onSubmit() {
  error.value = null;
  loading.value = true;
  try {
    await login({ email: email.value, password: password.value });
    router.push('/admin');
  } catch (e: any) {
    error.value = e.message ?? 'Login failed';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login">
    <form class="login__card" @submit.prevent="onSubmit">
      <div class="login__header">
        <div class="login__icon">
          <Lock :size="24" />
        </div>
        <h1>Admin Login</h1>
        <p>Sign in to manage developer tools</p>
      </div>

      <div v-if="error" class="login__error">{{ error }}</div>

      <div class="login__field">
        <label>Email</label>
        <input
          v-model="email"
          type="email"
          required
          placeholder="admin@devtools.local"
          autocomplete="email"
        />
      </div>

      <div class="login__field">
        <label>Password</label>
        <input
          v-model="password"
          type="password"
          required
          placeholder="Enter password"
          autocomplete="current-password"
        />
      </div>

      <button type="submit" class="btn btn--primary btn--full" :disabled="loading">
        {{ loading ? 'Signing in...' : 'Sign In' }}
      </button>

      <router-link to="/" class="login__back">
        <Wrench :size="14" />
        Back to DevTools Hub
      </router-link>
    </form>
  </div>
</template>

<style scoped>
.login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1.5rem;
}

.login__card {
  width: 100%;
  max-width: 380px;
  padding: 2rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.login__header {
  text-align: center;
}

.login__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  margin-bottom: 0.75rem;
}

.login__header h1 {
  font-size: 1.25rem;
  margin: 0;
  color: var(--color-text);
}

.login__header p {
  font-size: 0.825rem;
  color: var(--color-text-secondary);
  margin: 0.25rem 0 0;
}

.login__error {
  padding: 0.625rem 0.875rem;
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-radius: 8px;
  font-size: 0.825rem;
  text-align: center;
}

.login__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.login__field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.login__field input {
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--color-bg);
  color: var(--color-text);
  transition: border-color 0.15s;
}

.login__field input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.login__back {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  text-decoration: none;
  transition: color 0.15s;
}

.login__back:hover {
  color: var(--color-primary);
}
</style>
