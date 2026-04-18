<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue'

const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegisteredSW(_, r) {
    // Poll for updates every hour while app is open
    if (r) setInterval(() => r.update(), 60 * 60 * 1000)
  }
})
</script>

<template>
  <Transition name="slide-up">
    <div v-if="needRefresh" class="update-banner">
      <div class="update-left">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-.09-4.95"/>
        </svg>
        <span>Nova versão disponível!</span>
      </div>
      <button class="update-btn" @click="updateServiceWorker(true)">Atualizar</button>
    </div>
  </Transition>
</template>

<style scoped>
.update-banner {
  position: fixed;
  bottom: calc(var(--nav-h) + var(--safe-bottom) + 10px);
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 440px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: #1A0A2E;
  border: 1px solid rgba(184,164,201,.3);
  border-radius: var(--r-lg);
  box-shadow: 0 8px 32px rgba(0,0,0,.35);
  z-index: 150;
  color: white;
}

.update-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
}

.update-btn {
  background: var(--c-primary);
  color: white;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 16px;
  border-radius: var(--r-full);
  white-space: nowrap;
  transition: background .15s;
  flex-shrink: 0;
}

.update-btn:hover { background: var(--c-primary-dark); }

@media (min-width: 768px) {
  .update-banner {
    bottom: 20px;
    left: calc(220px + 20px);
    transform: none;
    width: auto;
    max-width: 380px;
  }
}
</style>
