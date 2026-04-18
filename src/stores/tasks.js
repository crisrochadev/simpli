import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import db from '@/db'
import { sanitize } from '@/utils/sanitize'
import { today } from '@/utils/dateUtils'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref([])
  const loading = ref(false)

  async function loadAll() {
    loading.value = true
    try {
      tasks.value = await db.tasks.orderBy('createdAt').toArray()
    } finally {
      loading.value = false
    }
  }

  async function create(data) {
    const task = {
      title: sanitize(data.title),
      date: data.date,
      done: false,
      createdAt: new Date().toISOString()
    }
    const id = await db.tasks.add(task)
    tasks.value.push({ ...task, id })
  }

  async function toggle(id) {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return
    await db.tasks.update(id, { done: !task.done })
    task.done = !task.done
  }

  async function moveToDate(id, newDate) {
    await db.tasks.update(id, { date: newDate })
    const task = tasks.value.find(t => t.id === id)
    if (task) task.date = newDate
  }

  async function remove(id) {
    await db.tasks.delete(id)
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  const todayTasks = computed(() =>
    tasks.value.filter(t => t.date === today())
  )

  function getByDate(date) {
    return tasks.value.filter(t => t.date === date)
  }

  return { tasks, loading, loadAll, create, toggle, moveToDate, remove, todayTasks, getByDate }
})
