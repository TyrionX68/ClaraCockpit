import { createRouter, createWebHistory } from 'vue-router'
const routes = [ { path: '/', redirect: '/dashboard' }, { path: '/dashboard', component: () => import('./src/components/ClaraDashboard.vue') } ]
export default createRouter({ history: createWebHistory(), routes })