import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',        component: () => import('@/pages/HomePage.vue') },
    { path: '/agenda',  component: () => import('@/pages/AgendaPage.vue') },
    { path: '/planner', component: () => import('@/pages/PlannerPage.vue') },
    { path: '/bills',   component: () => import('@/pages/BillsPage.vue') }
  ]
})

export default router
