<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '../store'

const store = useAppStore()

onMounted(() => {
  store.fetchOrders()
})

</script>

<template>
  <div>
    <h1>My Orders</h1>
    <button @click="store.fetchOrders()" class="refresh">Refresh Status</button>
    <div v-if="store.loading">Loading...</div>
    
    <table v-if="store.orders.length > 0">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Product ID</th>
          <th>Quantity</th>
          <th>Total</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in store.orders" :key="o.id">
          <td>{{ o.id }}</td>
          <td>{{ o.productId }}</td>
          <td>{{ o.quantity }}</td>
          <td>${{ o.totalAmount }}</td>
          <td>
            <span :class="['badge', o.status.toLowerCase()]">{{ o.status }}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>No orders found.</p>
  </div>
</template>

<style scoped>
table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background-color: #f2f2f2; }
.badge { padding: 4px 8px; border-radius: 12px; font-size: 0.8em; font-weight: bold; color: white; }
.badge.pending { background-color: orange; }
.badge.paid { background-color: green; }
.refresh { margin-bottom: 1rem; }
</style>
