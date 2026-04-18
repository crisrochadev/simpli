import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import db from '@/db'
import { sanitize } from '@/utils/sanitize'
import { today } from '@/utils/dateUtils'

export const useEventsStore = defineStore('events', () => {
  const events = ref([])
  const loading = ref(false)

  async function loadAll() {
    loading.value = true
    try {
      events.value = await db.events.orderBy('date').toArray()
    } finally {
      loading.value = false
    }
  }

  async function create(data) {
    const event = {
      title: sanitize(data.title),
      date: data.date,
      startTime: data.startTime || null,
      endTime: data.endTime || null,
      createdAt: new Date().toISOString()
    }
    const id = await db.events.add(event)
    events.value.push({ ...event, id })
    events.value.sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''))
  }

  async function remove(id) {
    await db.events.delete(id)
    events.value = events.value.filter(e => e.id !== id)
  }

  const todayEvents = computed(() =>
    events.value.filter(e => e.date === today())
  )

  function getByDate(date) {
    return events.value.filter(e => e.date === date)
  }

  return { events, loading, loadAll, create, remove, todayEvents, getByDate }
})
