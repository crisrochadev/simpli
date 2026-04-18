import { useEventsStore } from '@/stores/events'
import { useTasksStore } from '@/stores/tasks'
import { useBillsStore } from '@/stores/bills'
import { today } from '@/utils/dateUtils'

const STORAGE_KEY = 'simpli-notified-date'

export function useNotifications() {
  const supported = typeof window !== 'undefined' && 'Notification' in window
  const permission = supported ? Notification.permission : 'denied'

  async function requestPermission() {
    if (!supported) return false
    const result = await Notification.requestPermission()
    return result === 'granted'
  }

  function fire(title, body, tag) {
    if (!supported || Notification.permission !== 'granted') return
    new Notification(title, {
      body,
      icon: '/icons/icon.svg',
      badge: '/icons/favicon.svg',
      tag,
      renotify: false
    })
  }

  function scheduleEventReminders(eventsStore) {
    eventsStore.todayEvents
      .filter(e => e.startTime)
      .forEach(e => {
        const [h, m] = e.startTime.split(':').map(Number)
        const notifyAt = new Date()
        notifyAt.setHours(h, m - 15, 0, 0) // 15 min before
        const delay = notifyAt.getTime() - Date.now()
        if (delay > 0) {
          setTimeout(() =>
            fire(`📅 ${e.title} em 15 minutos`, `Às ${e.startTime}`, `event-remind-${e.id}`)
          , delay)
        }
      })
  }

  function notifyTasks(tasksStore) {
    const pending = tasksStore.todayTasks.filter(t => !t.done)
    if (!pending.length) return
    const body = pending.slice(0, 3).map(t => t.title).join(' · ')
    setTimeout(() =>
      fire(
        `✅ ${pending.length} tarefa${pending.length > 1 ? 's' : ''} para hoje`,
        body,
        'daily-tasks'
      )
    , 1500)
  }

  function notifyBills(billsStore) {
    const urgent = billsStore.urgentBills
    if (!urgent.length) return
    const body = urgent.slice(0, 3).map(b => b.name).join(' · ')
    setTimeout(() =>
      fire(
        `💰 ${urgent.length} conta${urgent.length > 1 ? 's' : ''} próxima${urgent.length > 1 ? 's' : ''} do vencimento`,
        body,
        'urgent-bills'
      )
    , 3000)
  }

  function runDailySchedule() {
    if (!supported || Notification.permission !== 'granted') return

    // Only notify once per calendar day
    const last = localStorage.getItem(STORAGE_KEY)
    const todayStr = today()
    if (last === todayStr) return
    localStorage.setItem(STORAGE_KEY, todayStr)

    const eventsStore = useEventsStore()
    const tasksStore  = useTasksStore()
    const billsStore  = useBillsStore()

    scheduleEventReminders(eventsStore)
    notifyTasks(tasksStore)
    notifyBills(billsStore)
  }

  return {
    supported,
    permission: supported ? Notification.permission : 'denied',
    requestPermission,
    runDailySchedule
  }
}
