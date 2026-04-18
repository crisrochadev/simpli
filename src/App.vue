<script setup>
import { onMounted } from 'vue'
import { useEventsStore } from '@/stores/events'
import { useTasksStore } from '@/stores/tasks'
import { useBillsStore } from '@/stores/bills'
import { useNotifications } from '@/composables/useNotifications'
import BottomNav from '@/components/common/BottomNav.vue'

const eventsStore = useEventsStore()
const tasksStore  = useTasksStore()
const billsStore  = useBillsStore()
const { runDailySchedule } = useNotifications()

onMounted(async () => {
  await Promise.all([eventsStore.loadAll(), tasksStore.loadAll(), billsStore.loadAll()])
  // Fire today's scheduled notifications once stores are loaded
  runDailySchedule()
})
</script>

<template>
  <div class="app-shell">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
    <BottomNav />
  </div>
</template>
