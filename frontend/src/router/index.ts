import { createRouter, createWebHistory } from 'vue-router'
import Catalog from '../views/Catalog.vue'
import Orders from '../views/Orders.vue'
import Login from '../views/Login.vue'
import { useAuthStore } from '../store/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'catalog', component: Catalog, meta: { requiresAuth: true } },
    { path: '/orders', name: 'orders', component: Orders, meta: { requiresAuth: true } },
    { path: '/payment/:orderId', component: () => import('../views/Payment.vue'), props: true, meta: { requiresAuth: true } }, // Modified to lazy load, kept props: true
    { path: '/notifications', component: () => import('../views/Notifications.vue'), meta: { requiresAuth: true } }, // Modified to lazy load
    { path: '/dashboard', name: 'dashboard', component: () => import('../views/Dashboard.vue'), meta: { requiresAuth: true, requiresAdmin: true } }, // Added dashboard route
    { path: '/login', name: 'login', component: Login }
  ]
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.currentUser) {
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.currentUser) {
    next({ name: 'catalog' })
  } else if (to.meta.requiresAdmin && authStore.currentUser && authStore.currentUser.role !== 'admin') {
    next({ name: 'catalog' }) // Redirect non-admins to catalog
  } else {
    next()
  }
})

export default router
