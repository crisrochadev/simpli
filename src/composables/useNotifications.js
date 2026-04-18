import { useEventsStore } from '@/stores/events'
import { useTasksStore } from '@/stores/tasks'
import { useBillsStore } from '@/stores/bills'

export function useNotifications() {
  const supported = typeof window !== 'undefined' && 'Notification' in window

  async function requestPermission() {
    if (!supported) return false
    const result = await Notification.requestPermission()
    return result === 'granted'
  }

  function notify(title, body, tag) {
    if (!supported || Notification.permission !== 'granted') return
    new Notification(title, { body, icon: '/icons/icon.svg', tag })
  }

  function scheduleDaily() {
    if (!supported || Notification.permission !== 'granted') return

    const eventsStore = useEventsStore()
    const tasksStore = useTasksStore()
    const billsStore = useBillsStore()

    eventsStore.todayEvents
      .filter(e => e.startTime)
      .forEach(e =>
        notify(`📅 ${e.title}`, `Hoje às ${e.startTime}`, `event-${e.id}`)
      )

    const pending = tasksStore.todayTasks.filter(t => !t.done)
    if (pending.length > 0) {
      const names = pending.slice(0, 3).map(t => t.title).join(', ')
      notify(
        `✅ ${pending.length} tarefa${pending.length > 1 ? 's' : ''} para hoje`,
        names,
        'daily-tasks'
      )
    }

    const urgent = billsStore.urgentBills
    if (urgent.length > 0) {
      const names = urgent.slice(0, 3).map(b => b.name).join(', ')
      notify(
        `💰 ${urgent.length} conta${urgent.length > 1 ? 's' : ''} próxima${urgent.length > 1 ? 's' : ''} do vencimento`,
        names,
        'urgent-bills'
      )
    }
  }

  return { supported, requestPermission, scheduleDaily }
}
