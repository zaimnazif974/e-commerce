import { defineStore } from 'pinia'
import axios from 'axios'

import { useAuthStore } from './auth'

export const useAppStore = defineStore('app', {
  state: () => ({
    products: [] as any[],
    orders: [] as any[],
    notifications: [] as any[],
    loading: false,
    error: null as string | null
  }),
  actions: {
    async fetchProducts() {
      this.loading = true
      try {
        const res = await axios.get('http://localhost:15006/products')
        this.products = res.data
      } catch (e: any) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    async createOrder(productId: number, quantity: number, totalAmount: number) {
      this.loading = true
      const auth = useAuthStore()
      try {
        const res = await axios.post('http://localhost:15005/orders', {
          userId: auth.currentUser?.id,
          productId,
          quantity,
          totalAmount
        })
        return res.data
      } catch (e: any) {
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    },
    async fetchOrders() {
       this.loading = true
       const auth = useAuthStore()
      try {
        const res = await axios.get(`http://localhost:15005/orders/${auth.currentUser?.id}`)
        this.orders = res.data
      } catch (e: any) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    async processPayment(orderId: number, amount: number, paymentMethod: string, productId: number, quantity: number) {
      this.loading = true
      const auth = useAuthStore()
      try {
        const res = await axios.post('http://localhost:15007/payments', {
          orderId,
          amount,
          paymentMethod,
          userId: auth.currentUser?.id,
          productId,
          quantity
        })
        return res.data
      } catch (e: any) {
         this.error = e.message
         throw e
      } finally {
        this.loading = false
      }
    },
    async fetchNotifications() {
       this.loading = true
       const auth = useAuthStore()
      try {
        const res = await axios.get(`http://localhost:15008/notifications/${auth.currentUser?.id}`)
        this.notifications = res.data
      } catch (e: any) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    async cancelOrder(orderId: number) {
      this.loading = true
      try {
        const res = await axios.patch(`http://localhost:15005/orders/${orderId}/cancel`)
        return res.data
      } catch (e: any) {
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    }
  }
})
