<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'


const store = useAppStore()
const router = useRouter()

onMounted(() => {
  store.fetchOrders()
})

const getStatusVariant = (status: string) => {
  if (status === 'PAID' || status === 'COMPLETE' || status === 'SUCCESS') return 'default';
  if (status === 'PENDING' || status === 'WAITING_FOR_PAYMENT') return 'secondary';
}

const payOrder = (order: any) => {
  router.push(`/payment/${order.id}?amount=${order.totalAmount}&productId=${order.productId}&quantity=${order.quantity}`)
}

const cancelOrder = async (order: any) => {
  if (confirm(`Are you sure you want to cancel Order #${order.id}?`)) {
    try {
      await store.cancelOrder(order.id)
      await store.fetchOrders() // refresh data
    } catch(e) {
      alert("Failed to cancel order")
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">My Orders</h1>
        <p class="text-slate-500">View and manage your recent orders.</p>
      </div>
      <Button variant="outline" @click="store.fetchOrders()" :disabled="store.loading">
        {{ store.loading ? 'Refreshing...' : 'Refresh Status' }}
      </Button>
    </div>
    
    <div v-if="store.error" class="text-destructive font-semibold">{{ store.error }}</div>
    
    <div class="border rounded-md bg-white">
      <Table v-if="store.orders.length > 0">
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Product ID</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="o in store.orders" :key="o.id">
            <TableCell class="font-medium">#{{ o.id }}</TableCell>
            <TableCell>{{ o.productId }}</TableCell>
            <TableCell>{{ o.quantity }}</TableCell>
            <TableCell>${{ o.totalAmount }}</TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(o.status) as any">{{ o.status }}</Badge>
            </TableCell>
            <TableCell class="text-right flex gap-2 justify-end">
              <Button v-if="o.status === 'WAITING_FOR_PAYMENT' || o.status === 'PENDING'" size="sm" @click="payOrder(o)">Pay Now</Button>
              <Button v-if="o.status === 'WAITING_FOR_PAYMENT' || o.status === 'PENDING'" size="sm" variant="destructive" @click="cancelOrder(o)">Cancel</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div v-else-if="!store.loading" class="p-8 text-center text-slate-500">
        No orders found. Start shopping!
      </div>
    </div>
  </div>
</template>
