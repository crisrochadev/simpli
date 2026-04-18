<script setup>
import { ref, computed } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import CreateTaskModal from '@/components/planner/CreateTaskModal.vue'
import { getWeekDates, formatDayShort, formatDayNumber, isToday, toDateString } from '@/utils/dateUtils'

const store = useTasksStore()

const weekRef    = ref(new Date())
const showModal  = ref(false)
const modalDate  = ref('')
const dragTaskId = ref(null)
const dragOver   = ref(null)

const weekDates = computed(() => getWeekDates(weekRef.value))

function prevWeek() {
  const d = new Date(weekRef.value)
  d.setDate(d.getDate() - 7)
  weekRef.value = d
}
function nextWeek() {
  const d = new Date(weekRef.value)
  d.setDate(d.getDate() + 7)
  weekRef.value = d
}
function goToday() { weekRef.value = new Date() }

function openModal(date) {
  modalDate.value = date
  showModal.value = true
}

function colTasks(date) {
  return store.getByDate(date)
}

// ── Drag and drop ──────────────────────────────────────────────────────────
function onDragStart(task, e) {
  dragTaskId.value = task.id
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', String(task.id))
}
function onDragEnd() {
  dragTaskId.value = null
  dragOver.value   = null
}
function onDragOver(date, e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
  dragOver.value = date
}
function onDragLeave(date) {
  if (dragOver.value === date) dragOver.value = null
}
async function onDrop(date, e) {
  e.preventDefault()
  const id = parseInt(e.dataTransfer.getData('text/plain'))
  if (id && !isNaN(id)) await store.moveToDate(id, date)
  dragOver.value   = null
  dragTaskId.value = null
}

const WEEK_LABEL = computed(() => {
  const dates = weekDates.value
  if (!dates.length) return ''
  const a = dates[0].split('-').slice(1).reverse().join('/')
  const b = dates[6].split('-').slice(1).reverse().join('/')
  return `${a} – ${b}`
})
</script>

<template>
  <main class="page">

    <!-- Header -->
    <div class="page-header">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <h1>Planner</h1>
        <button class="btn btn-ghost btn-sm" @click="goToday">Hoje</button>
      </div>

      <div style="display:flex;align-items:center;gap:10px;margin-top:10px">
        <button
          style="width:30px;height:30px;border-radius:50%;background:var(--c-surface-2);display:flex;align-items:center;justify-content:center;color:var(--c-text-2)"
          @click="prevWeek"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span style="font-size:13px;color:var(--c-text-2);flex:1;text-align:center">{{ WEEK_LABEL }}</span>
        <button
          style="width:30px;height:30px;border-radius:50%;background:var(--c-surface-2);display:flex;align-items:center;justify-content:center;color:var(--c-text-2)"
          @click="nextWeek"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>

    <!-- Week columns -->
    <div class="planner-grid">
      <div
        v-for="date in weekDates"
        :key="date"
        class="planner-col"
        :class="{
          'today-col':    isToday(date),
          'drag-target':  dragOver === date
        }"
        @dragover="onDragOver(date, $event)"
        @dragleave="onDragLeave(date)"
        @drop="onDrop(date, $event)"
      >
        <!-- Column header -->
        <div class="planner-col-header">
          <div>
            <div class="planner-col-title">{{ formatDayShort(date) }}</div>
            <div
              class="planner-col-date"
              :style="isToday(date) ? 'color:var(--c-primary-dark);font-weight:700' : ''"
            >
              {{ formatDayNumber(date) }}
            </div>
          </div>
          <button class="btn-add" @click="openModal(date)" style="width:24px;height:24px;font-size:15px">+</button>
        </div>

        <!-- Tasks -->
        <div class="planner-tasks">
          <div
            v-for="task in colTasks(date)"
            :key="task.id"
            class="task-item"
            :class="{ done: task.done, dragging: dragTaskId === task.id }"
            draggable="true"
            @dragstart="onDragStart(task, $event)"
            @dragend="onDragEnd"
          >
            <button
              class="task-check"
              :class="{ checked: task.done }"
              @click="store.toggle(task.id)"
            >
              <svg v-if="task.done" viewBox="0 0 12 12" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="2 6 5 9 10 3"/>
              </svg>
            </button>
            <span class="task-label">{{ task.title }}</span>
            <button class="task-remove" @click="store.remove(task.id)">×</button>
          </div>

          <div
            v-if="colTasks(date).length === 0"
            style="font-size:11px;color:var(--c-text-3);text-align:center;padding:8px 0"
          >
            vazio
          </div>
        </div>
      </div>
    </div>

    <CreateTaskModal :show="showModal" :default-date="modalDate" @close="showModal = false" />
  </main>
</template>
