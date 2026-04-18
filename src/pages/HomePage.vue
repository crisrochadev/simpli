<script setup>
import { ref, computed } from 'vue'
import { useEventsStore } from '@/stores/events'
import { useTasksStore } from '@/stores/tasks'
import { useBillsStore } from '@/stores/bills'
import { useNotifications } from '@/composables/useNotifications'
import CreateEventModal from '@/components/agenda/CreateEventModal.vue'
import CreateTaskModal from '@/components/planner/CreateTaskModal.vue'
import CreateBillModal from '@/components/bills/CreateBillModal.vue'
import { today, formatFullDate, formatCurrency, daysDiff, isPast } from '@/utils/dateUtils'

const eventsStore = useEventsStore()
const tasksStore  = useTasksStore()
const billsStore  = useBillsStore()
const { supported, requestPermission, scheduleDaily } = useNotifications()

const showEventModal = ref(false)
const showTaskModal  = ref(false)
const showBillModal  = ref(false)
const notifDismissed = ref(localStorage.getItem('notif-dismissed') === '1')

const todayStr      = today()
const todayLabel    = computed(() => formatFullDate(todayStr))
const todayEvents   = computed(() => eventsStore.todayEvents)
const todayTasks    = computed(() => tasksStore.todayTasks)
const urgentBills   = computed(() => billsStore.urgentBills)

function billStatus(bill) {
  if (bill.paid) return { label: 'pago', cls: 'badge-success' }
  const d = daysDiff(bill.dueDate)
  if (d < 0) return { label: 'vencida', cls: 'badge-danger' }
  if (d === 0) return { label: 'vence hoje', cls: 'badge-warning' }
  return { label: `${d}d`, cls: 'badge-warning' }
}

async function enableNotifications() {
  const ok = await requestPermission()
  if (ok) {
    scheduleDaily()
    notifDismissed.value = true
    localStorage.setItem('notif-dismissed', '1')
  }
}

function dismissNotif() {
  notifDismissed.value = true
  localStorage.setItem('notif-dismissed', '1')
}
</script>

<template>
  <main class="page">

    <!-- Header -->
    <div class="page-header">
      <h1>Simpli ✦</h1>
      <p>{{ todayLabel }}</p>
    </div>

    <!-- Notification banner -->
    <Transition name="slide-up">
      <div
        v-if="supported && !notifDismissed && 'Notification' in window && Notification.permission === 'default'"
        class="notif-banner"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span>Ativar lembretes do app?</span>
        <button @click="enableNotifications">Ativar</button>
        <button @click="dismissNotif" style="background:none;color:var(--c-primary-dark);margin-left:0">✕</button>
      </div>
    </Transition>

    <!-- Today Events -->
    <section class="section">
      <div class="section-header">
        <span class="section-title">📅 Hoje</span>
        <button class="btn-add" @click="showEventModal = true">+</button>
      </div>

      <TransitionGroup name="slide-up" tag="div">
        <div
          v-for="event in todayEvents"
          :key="event.id"
          class="event-item"
        >
          <div class="event-dot" />
          <div class="event-info">
            <div class="event-title">{{ event.title }}</div>
            <div v-if="event.startTime" class="event-time">{{ event.startTime }}{{ event.endTime ? ' – ' + event.endTime : '' }}</div>
          </div>
          <button class="event-remove" @click="eventsStore.remove(event.id)" aria-label="Remover">×</button>
        </div>
      </TransitionGroup>

      <div v-if="!todayEvents.length" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>
        </svg>
        Nenhum evento hoje
      </div>
    </section>

    <!-- Today Tasks -->
    <section class="section">
      <div class="section-header">
        <span class="section-title">✅ Tarefas</span>
        <button class="btn-add" @click="showTaskModal = true">+</button>
      </div>

      <TransitionGroup name="slide-up" tag="div">
        <div
          v-for="task in todayTasks"
          :key="task.id"
          class="task-item"
          :class="{ done: task.done }"
          style="cursor:default"
        >
          <button
            class="task-check"
            :class="{ checked: task.done }"
            @click="tasksStore.toggle(task.id)"
            aria-label="Concluir"
          >
            <svg v-if="task.done" viewBox="0 0 12 12" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="2 6 5 9 10 3"/>
            </svg>
          </button>
          <span class="task-label">{{ task.title }}</span>
          <button class="task-remove" @click="tasksStore.remove(task.id)" aria-label="Remover">×</button>
        </div>
      </TransitionGroup>

      <div v-if="!todayTasks.length" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polyline points="9 11 12 14 22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        Nenhuma tarefa para hoje
      </div>
    </section>

    <!-- Urgent Bills -->
    <section class="section">
      <div class="section-header">
        <span class="section-title">💰 Contas urgentes</span>
        <button class="btn-add" @click="showBillModal = true">+</button>
      </div>

      <TransitionGroup name="slide-up" tag="div">
        <div
          v-for="bill in urgentBills"
          :key="bill.id"
          class="bill-item"
          :class="{
            overdue:  !bill.paid && isPast(bill.dueDate),
            'due-soon': !bill.paid && !isPast(bill.dueDate),
            paid: bill.paid
          }"
        >
          <button
            class="bill-status"
            :class="{ 'paid-status': bill.paid }"
            @click="billsStore.togglePaid(bill.id)"
            aria-label="Marcar pago"
          >
            <svg v-if="bill.paid" viewBox="0 0 14 14" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="2 7 6 11 12 3"/>
            </svg>
          </button>
          <div class="bill-info">
            <div class="bill-name">{{ bill.name }}</div>
            <div class="bill-meta">
              <span>vence {{ bill.dueDate.split('-').reverse().join('/') }}</span>
              <span :class="['badge', billStatus(bill).cls]">{{ billStatus(bill).label }}</span>
            </div>
          </div>
          <div class="bill-amount">{{ formatCurrency(bill.amount) }}</div>
        </div>
      </TransitionGroup>

      <div v-if="!urgentBills.length" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
        Nenhuma conta urgente
      </div>
    </section>

    <!-- Modals -->
    <CreateEventModal :show="showEventModal" :default-date="todayStr" @close="showEventModal = false" />
    <CreateTaskModal  :show="showTaskModal"  :default-date="todayStr" @close="showTaskModal = false" />
    <CreateBillModal  :show="showBillModal"  @close="showBillModal = false" />

  </main>
</template>
