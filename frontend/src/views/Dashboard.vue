<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const summary = ref({ totalOrders: 0, totalSales: 0 })
const error = ref('')
const loading = ref(true)
const records = ref<any[]>([])

const fetchAnalytics = async () => {
  loading.value = true
  error.value = ''
  try {
    const [summaryRes, recordsRes] = await Promise.all([
      axios.get('http://localhost:15010/api/analytics/summary'),
      axios.get('http://localhost:15010/api/analytics/sales')
    ])
    
    records.value = recordsRes.data
    summary.value = summaryRes.data
  } catch (err: any) {
    error.value = 'Failed to load dashboard data: ' + (err.message || 'Unknown error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAnalytics()
})
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p class="text-slate-500">Monitor e-commerce analytics and sales data.</p>
      </div>
    </div>
    
    <div v-if="error" class="text-destructive font-semibold border-l-4 border-destructive pl-4 py-2">{{ error }}</div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="text-slate-500 text-center py-12">Loading analytics...</div>
          <div v-else class="grid grid-cols-2 gap-4 pt-4">
            <div class="flex flex-col gap-2 rounded-lg border p-4">
              <span class="text-sm font-medium text-slate-500">Total Sales</span>
              <span class="text-3xl font-bold tracking-tight text-green-600">${{ Number(summary.totalSales).toFixed(2) }}</span>
            </div>
            <div class="flex flex-col gap-2 rounded-lg border p-4">
              <span class="text-sm font-medium text-slate-500">Total Orders</span>
              <span class="text-3xl font-bold tracking-tight text-blue-600">{{ summary.totalOrders }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card class="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <p class="text-sm text-slate-500">Live monitoring of system events across microservices.</p>
        </CardHeader>
        <CardContent>
          <Table v-if="!loading && records.length">
            <TableHeader>
              <TableRow>
                <TableHead>Event ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Product ID</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="record in records" :key="record.id">
                <TableCell class="font-medium">#{{ record.id }}</TableCell>
                <TableCell>
                  <Badge :variant="record.eventType === 'payment.success' ? 'default' : (record.eventType === 'order.cancelled' ? 'destructive' : 'secondary')">
                    {{ record.eventType }}
                  </Badge>
                </TableCell>
                <TableCell>User {{ record.userId || '?' }}</TableCell>
                <TableCell>Order #{{ record.orderId }}</TableCell>
                <TableCell>${{ Number(record.amount).toFixed(2) }}</TableCell>
                <TableCell>{{ record.productId || 'N/A' }}</TableCell>
                <TableCell>{{ new Date(record.timestamp).toLocaleString() }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div v-if="!loading && !records.length" class="text-center py-12 text-slate-500">
            No events recorded yet.
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
