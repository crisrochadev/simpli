<script setup>
import { ref, computed } from 'vue'
import { useEventsStore } from '@/stores/events'
import CreateEventModal from '@/components/agenda/CreateEventModal.vue'
import {
  today, toDateString, getWeekDates, getMonthGrid,
  formatMonthYear, formatDayShort, formatDayNumber,
  isToday, sameMonth, formatFullDate
} from '@/utils/dateUtils'

const store = useEventsStore()

const view         = ref('month')
const selectedDate = ref(today())
const showModal    = ref(false)

const now     = new Date()
const calYear = ref(now.getFullYear())
const calMonth= ref(now.getMonth())

// ── Month view ─────────────────────────────────────────────────────────────
const monthGrid  = computed(() => getMonthGrid(calYear.value, calMonth.value))
const monthLabel = computed(() => formatMonthYear(calYear.value, calMonth.value))

function prevMonth() {
  if (calMonth.value === 0) { calMonth.value = 11; calYear.value-- }
  else calMonth.value--
}
function nextMonth() {
  if (calMonth.value === 11) { calMonth.value = 0; calYear.value++ }
  else calMonth.value++
}
function selectDay(date) {
  selectedDate.value = date
  view.value = 'day'
}
function eventCountOn(date) {
  return store.getByDate(date).length
}

// ── Week view ──────────────────────────────────────────────────────────────
const weekDates = computed(() => getWeekDates(new Date(selectedDate.value)))
const weekRef   = ref(new Date())

function prevWeek() {
  const d = new Date(weekRef.value)
  d.setDate(d.getDate() - 7)
  weekRef.value = d
  selectedDate.value = toDateString(d)
}
function nextWeek() {
  const d = new Date(weekRef.value)
  d.setDate(d.getDate() + 7)
  weekRef.value = d
  selectedDate.value = toDateString(d)
}

const weekEventsRows = computed(() =>
  weekDates.value.map(date => ({
    date,
    dayName: formatDayShort(date),
    dayNum:  formatDayNumber(date),
    events:  store.getByDate(date),
    isToday: isToday(date)
  }))
)

// ── Day view ───────────────────────────────────────────────────────────────
const dayEvents   = computed(() => store.getByDate(selectedDate.value))
const dayLabel    = computed(() => formatFullDate(selectedDate.value))

function prevDay() {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() - 1)
  selectedDate.value = toDateString(d)
}
function nextDay() {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + 1)
  selectedDate.value = toDateString(d)
}

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
</script>

<template>
  <main class="page">

    <!-- Header -->
    <div class="page-header">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <h1>Agenda</h1>
        <button class="btn btn-primary btn-sm" @click="showModal = true">+ Evento</button>
      </div>
      <div class="mt-8">
        <div class="view-toggle">
          <button :class="{ active: view === 'month' }" @click="view = 'month'">Mês</button>
          <button :class="{ active: view === 'week'  }" @click="view = 'week'">Semana</button>
          <button :class="{ active: view === 'day'   }" @click="view = 'day'">Dia</button>
        </div>
      </div>
    </div>

    <!-- ── MONTH VIEW ─────────────────────────────────────────────────────── -->
    <template v-if="view === 'month'">
      <div class="cal-nav">
        <button @click="prevMonth">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="cal-nav-title">{{ monthLabel }}</span>
        <button @click="nextMonth">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div class="cal-weekdays">
        <div v-for="d in WEEKDAYS" :key="d" class="cal-weekday">{{ d }}</div>
      </div>

      <div class="cal-grid">
        <div
          v-for="date in monthGrid"
          :key="date"
          class="cal-cell"
          :class="{
            outside:  !sameMonth(date, calYear, calMonth),
            today:     isToday(date) && sameMonth(date, calYear, calMonth),
            selected:  selectedDate === date && !isToday(date)
          }"
          @click="selectDay(date)"
        >
          <div class="cal-day">{{ parseInt(date.split('-')[2]) }}</div>
          <div v-if="eventCountOn(date) > 0" class="cal-dots">
            <div v-for="i in Math.min(eventCountOn(date), 3)" :key="i" class="cal-dot" />
          </div>
        </div>
      </div>
    </template>

    <!-- ── WEEK VIEW ──────────────────────────────────────────────────────── -->
    <template v-else-if="view === 'week'">
      <div class="cal-nav">
        <button @click="prevWeek">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="cal-nav-title">Semana</span>
        <button @click="nextWeek">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div class="section" v-for="row in weekEventsRows" :key="row.date">
        <div
          class="section-header"
          style="cursor:pointer"
          @click="selectedDate = row.date; view = 'day'"
        >
          <span class="section-title" :style="row.isToday ? 'color:var(--c-primary-dark)' : ''">
            {{ row.dayName }} {{ row.dayNum }}
            <span v-if="row.isToday" style="font-size:10px;background:var(--c-primary-light);color:var(--c-primary-dark);padding:2px 6px;border-radius:20px;margin-left:4px">hoje</span>
          </span>
          <button class="btn-add" @click.stop="selectedDate = row.date; showModal = true">+</button>
        </div>

        <div v-if="row.events.length === 0" style="font-size:13px;color:var(--c-text-3);padding:4px 0 8px">
          Sem eventos
        </div>
        <div v-else>
          <div v-for="event in row.events" :key="event.id" class="event-item">
            <div class="event-dot" />
            <div class="event-info">
              <div class="event-title">{{ event.title }}</div>
              <div v-if="event.startTime" class="event-time">{{ event.startTime }}{{ event.endTime ? ' – ' + event.endTime : '' }}</div>
            </div>
            <button class="event-remove" @click="store.remove(event.id)">×</button>
          </div>
        </div>
      </div>
    </template>

    <!-- ── DAY VIEW ───────────────────────────────────────────────────────── -->
    <template v-else>
      <div class="cal-nav">
        <button @click="prevDay">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="cal-nav-title" style="font-size:14px;text-transform:capitalize">{{ dayLabel }}</span>
        <button @click="nextDay">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div class="section">
        <TransitionGroup name="slide-up" tag="div">
          <div v-for="event in dayEvents" :key="event.id" class="event-item">
            <div class="event-dot" />
            <div class="event-info">
              <div class="event-title">{{ event.title }}</div>
              <div v-if="event.startTime" class="event-time">{{ event.startTime }}{{ event.endTime ? ' – ' + event.endTime : '' }}</div>
            </div>
            <button class="event-remove" @click="store.remove(event.id)">×</button>
          </div>
        </TransitionGroup>

        <div v-if="!dayEvents.length" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Nenhum evento neste dia
        </div>

        <button class="btn btn-ghost mt-12" style="width:100%;justify-content:center" @click="showModal = true">
          + Adicionar evento
        </button>
      </div>
    </template>

    <CreateEventModal :show="showModal" :default-date="selectedDate" @close="showModal = false" />
  </main>
</template>
