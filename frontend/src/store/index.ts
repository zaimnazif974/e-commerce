import { defineStore } from 'pinia'
import axios from 'axios'

export const useAppStore = defineStore('app', {
  state: () => ({
    userId: 1, // Simulated logged in user
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
      try {
        const res = await axios.post('http://localhost:15005/orders', {
          userId: this.userId,
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
      try {
        const res = await axios.get(`http://localhost:15005/orders/${this.userId}`)
        this.orders = res.data
      } catch (e: any) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    async processPayment(orderId: number, amount: number, paymentMethod: string, productId: number, quantity: number) {
      this.loading = true
      try {
        const res = await axios.post('http://localhost:15007/payments', {
          orderId,
          amount,
          paymentMethod,
          userId: this.userId,
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
      try {
        const res = await axios.get(`http://localhost:15008/notifications/${this.userId}`)
        this.notifications = res.data
      } catch (e: any) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    }
  }
})
