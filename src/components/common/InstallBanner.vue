<script setup>
import { ref } from 'vue'
import { usePWAInstall } from '@/composables/usePWAInstall'

const { showInstall, isIOS, canNativeInstall, install } = usePWAInstall()

const showIOSGuide = ref(false)
const dismissed = ref(sessionStorage.getItem('install-dismissed') === '1')

function dismiss() {
  dismissed.value = true
  sessionStorage.setItem('install-dismissed', '1')
}

function handleInstall() {
  if (isIOS.value) {
    showIOSGuide.value = true
  } else {
    install()
  }
}
</script>

<template>
  <!-- Install card -->
  <Transition name="slide-up">
    <div v-if="showInstall && !dismissed" class="install-card">
      <div class="install-left">
        <img src="/icons/icon.svg" alt="Simpli" class="install-app-icon" />
        <div class="install-text">
          <strong>Instalar Simpli</strong>
          <span>Acesse direto da tela inicial, funciona offline</span>
        </div>
      </div>
      <div class="install-actions">
        <button class="install-btn" @click="handleInstall">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Instalar
        </button>
        <button class="install-dismiss" @click="dismiss" aria-label="Dispensar">✕</button>
      </div>
    </div>
  </Transition>

  <!-- iOS step-by-step guide -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showIOSGuide" class="ios-overlay" @click.self="showIOSGuide = false">
        <div class="ios-sheet">
          <div class="ios-handle" />
          <h3 class="ios-title">Instalar no iPhone / iPad</h3>
          <p class="ios-subtitle">Siga os passos abaixo no Safari:</p>

          <div class="ios-steps">
            <div class="ios-step">
              <div class="ios-step-num">1</div>
              <div class="ios-step-body">
                <span>Toque em</span>
                <span class="ios-step-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <polyline points="16 6 12 2 8 6"/>
                    <line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                </span>
                <strong>Compartilhar</strong> na barra do Safari
              </div>
            </div>

            <div class="ios-step">
              <div class="ios-step-num">2</div>
              <div class="ios-step-body">
                Role para baixo e toque em <strong>Adicionar à Tela de Início</strong>
              </div>
            </div>

            <div class="ios-step">
              <div class="ios-step-num">3</div>
              <div class="ios-step-body">
                Toque em <strong>Adicionar</strong> no canto superior direito
              </div>
            </div>
          </div>

          <button class="ios-close-btn" @click="showIOSGuide = false">Entendi</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Install card ────────────────────────────────────────────────────────── */
.install-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 0 20px 16px;
  padding: 14px 14px 14px 12px;
  background: linear-gradient(135deg, #F0EAF8 0%, #FAF0F5 100%);
  border: 1.5px solid var(--c-primary);
  border-radius: var(--r-lg);
  box-shadow: 0 2px 12px rgba(184,164,201,.25);
}

.install-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.install-app-icon {
  width: 44px;
  height: 44px;
  border-radius: 11px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(123,94,167,.3);
}

.install-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.install-text strong {
  font-size: 14px;
  font-weight: 700;
  color: var(--c-text);
}

.install-text span {
  font-size: 11px;
  color: var(--c-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.install-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.install-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--c-primary-dark);
  color: white;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: var(--r-full);
  box-shadow: 0 2px 8px rgba(123,94,167,.35);
  transition: background .15s, transform .1s;
  white-space: nowrap;
}

.install-btn:active { transform: scale(.96); }
.install-btn:hover  { background: #6A4E8F; }

.install-dismiss {
  color: var(--c-text-3);
  font-size: 15px;
  padding: 4px 6px;
  transition: color .15s;
}

.install-dismiss:hover { color: var(--c-text-2); }

/* ── iOS guide sheet ─────────────────────────────────────────────────────── */
.ios-overlay {
  position: fixed;
  inset: 0;
  background: rgba(45,36,36,.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 300;
}

.ios-sheet {
  width: 100%;
  max-width: 480px;
  background: var(--c-surface);
  border-radius: var(--r-xl) var(--r-xl) 0 0;
  padding: 20px 24px calc(32px + env(safe-area-inset-bottom, 0px));
  animation: slideUp .22s ease;
}

.ios-handle {
  width: 36px;
  height: 4px;
  background: var(--c-border);
  border-radius: var(--r-full);
  margin: 0 auto 20px;
}

.ios-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--c-text);
  margin-bottom: 4px;
}

.ios-subtitle {
  font-size: 13px;
  color: var(--c-text-2);
  margin-bottom: 20px;
}

.ios-steps {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
}

.ios-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.ios-step-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--c-primary-light);
  color: var(--c-primary-dark);
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ios-step-body {
  font-size: 14px;
  color: var(--c-text);
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.ios-step-icon {
  display: inline-flex;
  align-items: center;
  background: var(--c-surface-2);
  border: 1px solid var(--c-border);
  border-radius: 6px;
  padding: 2px 4px;
  color: var(--c-primary-dark);
}

.ios-close-btn {
  width: 100%;
  padding: 14px;
  background: var(--c-primary);
  color: white;
  font-size: 15px;
  font-weight: 600;
  border-radius: var(--r-full);
  transition: background .15s;
}

.ios-close-btn:hover { background: var(--c-primary-dark); }
</style>
