<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../store'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

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
  <div class="flex items-center justify-center min-h-[60vh]">
    <Card class="w-[450px]">
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
        <CardDescription>Complete your payment for Order #{{ orderId }}</CardDescription>
      </CardHeader>
      
      <CardContent class="grid gap-6">
        <div class="bg-slate-50 p-4 rounded-lg flex items-center justify-between border">
          <span class="font-medium text-slate-500">Total Amount</span>
          <span class="text-2xl font-bold text-slate-900">${{ amount }}</span>
        </div>
        
        <div class="grid gap-3">
          <Label>Payment Method</Label>
          <Select v-model="paymentMethod">
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Credit Card">Credit Card</SelectItem>
              <SelectItem value="PayPal">PayPal</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div v-if="paymentStatus" 
             :class="['text-sm p-3 rounded-md text-center font-medium', 
                      paymentStatus.includes('Successful') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200']">
          {{ paymentStatus }}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button @click="pay" :disabled="store.loading" class="w-full text-lg h-12">
          {{ store.loading ? 'Processing...' : `Pay $${amount}` }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
