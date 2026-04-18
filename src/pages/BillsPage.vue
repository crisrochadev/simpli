<script setup>
import { ref, computed } from 'vue'
import { useBillsStore } from '@/stores/bills'
import CreateBillModal from '@/components/bills/CreateBillModal.vue'
import { formatMonthYear, formatCurrency, isPast, isToday, daysDiff } from '@/utils/dateUtils'

const store = useBillsStore()

const now        = new Date()
const selYear    = ref(now.getFullYear())
const selMonth   = ref(now.getMonth())
const showModal  = ref(false)

const monthLabel = computed(() => formatMonthYear(selYear.value, selMonth.value))

const monthBills = computed(() =>
  store.getByMonth(selYear.value, selMonth.value)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
)

const totalMonth    = computed(() => monthBills.value.reduce((s, b) => s + b.amount, 0))
const totalPaid     = computed(() => monthBills.value.filter(b => b.paid).reduce((s, b) => s + b.amount, 0))
const totalPending  = computed(() => monthBills.value.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0))

function prevMonth() {
  if (selMonth.value === 0) { selMonth.value = 11; selYear.value-- }
  else selMonth.value--
}
function nextMonth() {
  if (selMonth.value === 11) { selMonth.value = 0; selYear.value++ }
  else selMonth.value++
}

function billClass(bill) {
  if (bill.paid) return 'paid'
  if (isPast(bill.dueDate)) return 'overdue'
  if (daysDiff(bill.dueDate) <= 3) return 'due-soon'
  return ''
}

function billBadge(bill) {
  if (bill.paid)               return { label: 'pago',        cls: 'badge-success' }
  const d = daysDiff(bill.dueDate)
  if (d < 0)                   return { label: 'vencida',     cls: 'badge-danger' }
  if (d === 0)                 return { label: 'vence hoje',  cls: 'badge-warning' }
  if (d <= 3)                  return { label: `${d}d`,       cls: 'badge-warning' }
  return                              { label: 'pendente',    cls: 'badge-neutral' }
}
</script>

<template>
  <main class="page">

    <!-- Header -->
    <div class="page-header">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <h1>Contas</h1>
        <button class="btn btn-primary btn-sm" @click="showModal = true">+ Conta</button>
      </div>
    </div>

    <!-- Month nav -->
    <div class="cal-nav" style="padding:0 20px 12px">
      <button @click="prevMonth">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span class="cal-nav-title">{{ monthLabel }}</span>
      <button @click="nextMonth">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>

    <!-- Summary cards -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:0 20px 20px">
      <div class="card" style="text-align:center;padding:12px 8px">
        <div style="font-size:11px;color:var(--c-text-2);font-weight:600;margin-bottom:4px">TOTAL</div>
        <div style="font-size:14px;font-weight:700">{{ formatCurrency(totalMonth) }}</div>
      </div>
      <div class="card" style="text-align:center;padding:12px 8px;border-color:var(--c-sage)">
        <div style="font-size:11px;color:var(--c-text-2);font-weight:600;margin-bottom:4px">PAGO</div>
        <div style="font-size:14px;font-weight:700;color:#2E7D52">{{ formatCurrency(totalPaid) }}</div>
      </div>
      <div class="card" style="text-align:center;padding:12px 8px;border-color:var(--c-danger)">
        <div style="font-size:11px;color:var(--c-text-2);font-weight:600;margin-bottom:4px">PENDENTE</div>
        <div style="font-size:14px;font-weight:700;color:var(--c-danger)">{{ formatCurrency(totalPending) }}</div>
      </div>
    </div>

    <!-- Bills list -->
    <div class="section">
      <TransitionGroup name="slide-up" tag="div">
        <div
          v-for="bill in monthBills"
          :key="bill.id"
          class="bill-item"
          :class="billClass(bill)"
        >
          <button
            class="bill-status"
            :class="{ 'paid-status': bill.paid }"
            @click="store.togglePaid(bill.id)"
            aria-label="Marcar pago"
          >
            <svg v-if="bill.paid" viewBox="0 0 14 14" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="2 7 6 11 12 3"/>
            </svg>
          </button>

          <div class="bill-info">
            <div class="bill-name">{{ bill.name }}</div>
            <div class="bill-meta">
              <span>{{ bill.dueDate.split('-').reverse().join('/') }}</span>
              <span :class="['badge', billBadge(bill).cls]">{{ billBadge(bill).label }}</span>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
            <div class="bill-amount">{{ formatCurrency(bill.amount) }}</div>
            <button
              style="font-size:11px;color:var(--c-text-3);padding:2px"
              @click="store.remove(bill.id)"
              aria-label="Remover"
            >×</button>
          </div>
        </div>
      </TransitionGroup>

      <div v-if="!monthBills.length" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
        Nenhuma conta neste mês
        <br />
        <button class="btn btn-ghost btn-sm mt-8" @click="showModal = true">Adicionar conta</button>
      </div>
    </div>

    <CreateBillModal :show="showModal" @close="showModal = false" />
  </main>
</template>
