import { createRouter, createWebHistory } from 'vue-router'
import ClaraDashboard from './ClaraDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: ClaraDashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router;
