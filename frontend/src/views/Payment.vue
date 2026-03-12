<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../store'

const store = useAppStore()
const router = useRouter()
const route = useRoute()

const orderId = Number(route.params.orderId)
const amount = Number(route.query.amount)
const productId = Number(route.query.productId)
const quantity = Number(route.query.quantity)

const paymentMethod = ref('Credit Card')
const paymentStatus = ref('')

const pay = async () => {
  paymentStatus.value = 'Processing...'
  try {
    await store.processPayment(orderId, amount, paymentMethod.value, productId, quantity)
    paymentStatus.value = 'Payment Successful! Redirecting...'
    setTimeout(() => {
      router.push('/orders')
    }, 2000)
  } catch (e: any) {
    paymentStatus.value = 'Payment Failed: ' + store.error
  }
}
</script>

<template>
  <div class="payment-container">
    <h2>Checkout Details</h2>
    <div class="summary">
      <p><strong>Order ID:</strong> {{ orderId }}</p>
      <p><strong>Total Amount:</strong> ${{ amount }}</p>
    </div>
    
    <div class="payment-method">
      <label>Select Payment Method:</label>
      <select v-model="paymentMethod">
        <option>Credit Card</option>
        <option>PayPal</option>
        <option>Bank Transfer</option>
      </select>
    </div>
    
    <button @click="pay" :disabled="store.loading" class="pay-btn">
      {{ store.loading ? 'Processing...' : `Pay $${amount}` }}
    </button>
    
    <p v-if="paymentStatus" :class="{'success': paymentStatus.includes('Successful'), 'error': paymentStatus.includes('Failed')}">
      {{ paymentStatus }}
    </p>
  </div>
</template>

<style scoped>
.payment-container { max-width: 400px; margin: 0 auto; padding: 2rem; border: 1px solid #eee; border-radius: 8px; }
.summary { background: #f9f9f9; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; }
.payment-method { margin-bottom: 1.5rem; }
select { width: 100%; padding: 8px; margin-top: 5px; }
.pay-btn { width: 100%; padding: 10px; background: #28a745; color: white; border: none; border-radius: 4px; font-size: 1.1em; cursor: pointer; }
.pay-btn:disabled { background: #6c757d; cursor: not-allowed; }
.success { color: green; margin-top: 1rem; font-weight: bold; text-align: center; }
.error { color: red; margin-top: 1rem; font-weight: bold; text-align: center; }
</style>
