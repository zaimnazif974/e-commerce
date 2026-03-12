import { createRouter, createWebHistory } from 'vue-router'
import Catalog from '../views/Catalog.vue'
import Orders from '../views/Orders.vue'
import Payment from '../views/Payment.vue'
import Notifications from '../views/Notifications.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'catalog', component: Catalog },
    { path: '/orders', name: 'orders', component: Orders },
    { path: '/payment/:orderId', name: 'payment', component: Payment, props: true },
    { path: '/notifications', name: 'notifications', component: Notifications }
  ]
})

export default router
