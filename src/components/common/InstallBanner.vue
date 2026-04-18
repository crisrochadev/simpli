<script setup>
import { usePWAInstall } from '@/composables/usePWAInstall'
const { canInstall, isInstalled, install, dismiss } = usePWAInstall()
</script>

<template>
  <Transition name="slide-up">
    <div v-if="canInstall && !isInstalled" class="install-banner">
      <img src="/icons/icon.svg" alt="Simpli" class="install-icon" />
      <div class="install-text">
        <strong>Instalar Simpli</strong>
        <span>Acesse direto da tela inicial</span>
      </div>
      <button class="install-btn" @click="install">Instalar</button>
      <button class="install-dismiss" @click="dismiss" aria-label="Fechar">✕</button>
    </div>
  </Transition>
</template>

<style scoped>
.install-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 20px 16px;
  padding: 12px 14px;
  background: var(--c-surface);
  border: 1.5px solid var(--c-primary);
  border-radius: var(--r-lg);
  box-shadow: var(--sh-md);
}

.install-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  flex-shrink: 0;
}

.install-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.install-text strong {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
}

.install-text span {
  font-size: 12px;
  color: var(--c-text-2);
}

.install-btn {
  background: var(--c-primary);
  color: white;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: var(--r-full);
  flex-shrink: 0;
  transition: background .15s;
}

.install-btn:hover { background: var(--c-primary-dark); }

.install-dismiss {
  color: var(--c-text-3);
  font-size: 14px;
  padding: 4px;
  flex-shrink: 0;
  transition: color .15s;
}

.install-dismiss:hover { color: var(--c-text-2); }
</style>
