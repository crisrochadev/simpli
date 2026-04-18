<script setup>
import { ref } from 'vue'
import { useEventsStore } from '@/stores/events'
import { useTasksStore } from '@/stores/tasks'
import { useBillsStore } from '@/stores/bills'
import { useDataSync } from '@/composables/useDataSync'

const eventsStore = useEventsStore()
const tasksStore  = useTasksStore()
const billsStore  = useBillsStore()
const { exportData, importData } = useDataSync()

const importing     = ref(false)
const toast         = ref(null)
const showClearConfirm = ref(false)
const fileInput     = ref(null)

function showToast(type, text) {
  toast.value = { type, text }
  setTimeout(() => toast.value = null, 4000)
}

async function handleExport() {
  try {
    await exportData()
    showToast('success', 'Backup exportado com sucesso!')
  } catch (e) {
    showToast('error', 'Erro ao exportar: ' + e.message)
  }
}

async function handleFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  importing.value = true
  try {
    await importData(file)
    await Promise.all([eventsStore.loadAll(), tasksStore.loadAll(), billsStore.loadAll()])
    showToast('success', 'Dados importados com sucesso!')
  } catch (e) {
    showToast('error', e.message)
  } finally {
    importing.value = false
    e.target.value  = ''
  }
}

async function clearAll() {
  try {
    await Promise.all([
      eventsStore.events.splice(0),
      tasksStore.tasks.splice(0),
      billsStore.bills.splice(0)
    ])
    const db = (await import('@/db')).default
    await Promise.all([db.events.clear(), db.tasks.clear(), db.bills.clear()])
    await Promise.all([eventsStore.loadAll(), tasksStore.loadAll(), billsStore.loadAll()])
    showToast('success', 'Todos os dados foram apagados.')
  } catch {
    showToast('error', 'Erro ao apagar dados.')
  } finally {
    showClearConfirm.value = false
  }
}

const APP_VERSION = '1.0.0'
</script>

<template>
  <main class="page">

    <div class="page-header">
      <h1>Configurações</h1>
    </div>

    <!-- Toast -->
    <Transition name="slide-up">
      <div v-if="toast" :class="['settings-toast', `toast-${toast.type}`]">
        {{ toast.text }}
      </div>
    </Transition>

    <!-- Export / Import -->
    <section class="section">
      <div class="section-header">
        <span class="section-title">💾 Dados</span>
      </div>

      <div class="settings-card">
        <div class="settings-row">
          <div class="settings-info">
            <strong>Exportar backup</strong>
            <span>Salva todos os seus dados em um arquivo JSON</span>
          </div>
          <button class="btn btn-primary btn-sm" @click="handleExport">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar
          </button>
        </div>

        <div class="settings-divider" />

        <div class="settings-row">
          <div class="settings-info">
            <strong>Importar backup</strong>
            <span>Restaura dados de um arquivo exportado anteriormente</span>
          </div>
          <button
            class="btn btn-ghost btn-sm"
            :disabled="importing"
            @click="fileInput.click()"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {{ importing ? 'Importando…' : 'Importar' }}
          </button>
          <input
            ref="fileInput"
            type="file"
            accept=".json,application/json"
            style="display:none"
            @change="handleFileChange"
          />
        </div>
      </div>

      <p class="settings-hint">
        Para trocar de celular: exporte no aparelho antigo, importe no novo. Os dados substituem os existentes.
      </p>
    </section>

    <!-- Danger zone -->
    <section class="section">
      <div class="section-header">
        <span class="section-title">⚠️ Zona de perigo</span>
      </div>

      <div class="settings-card danger-card">
        <div class="settings-row">
          <div class="settings-info">
            <strong>Apagar todos os dados</strong>
            <span>Remove permanentemente todos os eventos, tarefas e contas</span>
          </div>
          <button class="btn btn-sm" style="background:var(--c-danger-light);color:var(--c-danger)" @click="showClearConfirm = true">
            Apagar
          </button>
        </div>
      </div>
    </section>

    <!-- About -->
    <section class="section">
      <div class="section-header">
        <span class="section-title">ℹ️ Sobre</span>
      </div>
      <div class="settings-card">
        <div class="about-block">
          <img src="/icons/icon.svg" alt="Simpli" style="width:48px;height:48px;border-radius:12px" />
          <div>
            <div style="font-weight:700;font-size:16px">Simpli</div>
            <div style="font-size:12px;color:var(--c-text-2)">Versão {{ APP_VERSION }}</div>
            <div style="font-size:12px;color:var(--c-text-3);margin-top:2px">Organizador pessoal offline-first</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Confirm clear modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showClearConfirm" class="modal-overlay" @click.self="showClearConfirm = false">
          <div class="modal-sheet" @click.stop>
            <div class="modal-handle" />
            <p class="modal-title">Apagar todos os dados?</p>
            <p style="font-size:14px;color:var(--c-text-2);margin-bottom:20px;line-height:1.5">
              Esta ação é irreversível. Todos os eventos, tarefas e contas serão removidos permanentemente.
            </p>
            <div class="form-actions">
              <button class="btn btn-ghost btn-sm" @click="showClearConfirm = false">Cancelar</button>
              <button class="btn btn-sm" style="background:var(--c-danger);color:white" @click="clearAll">Apagar tudo</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </main>
</template>

<style scoped>
.settings-card {
  background: var(--c-surface);
  border-radius: var(--r-md);
  border: 1px solid var(--c-border);
  overflow: hidden;
  box-shadow: var(--sh-sm);
}

.danger-card { border-color: var(--c-danger-light); }

.settings-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
}

.settings-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.settings-info strong {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
}

.settings-info span {
  font-size: 12px;
  color: var(--c-text-2);
}

.settings-divider {
  height: 1px;
  background: var(--c-border);
  margin: 0 16px;
}

.settings-hint {
  font-size: 12px;
  color: var(--c-text-3);
  margin-top: 8px;
  padding: 0 4px;
  line-height: 1.5;
}

.about-block {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
}

.settings-toast {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: var(--r-full);
  font-size: 13px;
  font-weight: 600;
  z-index: 300;
  box-shadow: var(--sh-md);
  white-space: nowrap;
}

.toast-success { background: var(--c-sage-light); color: #2E7D52; }
.toast-error   { background: var(--c-danger-light); color: var(--c-danger); }
</style>
