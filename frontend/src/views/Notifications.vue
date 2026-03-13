<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '../store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Bell } from 'lucide-vue-next'

const store = useAppStore()

onMounted(() => {
  store.fetchNotifications()
})
</script>

<template>
  <div class="space-y-6 max-w-3xl mx-auto">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Notifications</h1>
        <p class="text-slate-500">Stay updated on your orders.</p>
      </div>
      <Button variant="outline" @click="store.fetchNotifications()" :disabled="store.loading">
        {{ store.loading ? 'Refreshing...' : 'Refresh' }}
      </Button>
    </div>
    
    <div v-if="store.notifications.length > 0" class="flex flex-col gap-4">
      <Card v-for="n in store.notifications" :key="n.id" class="flex items-start gap-4 p-4 border-l-4 border-l-blue-500 overflow-hidden">
        <div class="mt-1 bg-blue-100 p-2 rounded-full text-blue-600">
          <Bell class="w-5 h-5" />
        </div>
        <div class="flex-1">
          <p class="text-slate-900 font-medium leading-tight mb-1">{{ n.message }}</p>
          <span class="text-xs text-slate-500">{{ new Date(n.createdAt).toLocaleString() }}</span>
        </div>
      </Card>
    </div>
    <div v-else-if="!store.loading" class="p-12 text-center text-slate-500 border rounded-lg bg-white border-dashed">
      <Bell class="w-8 h-8 mx-auto mb-3 text-slate-400" />
      <p>No new notifications.</p>
    </div>
  </div>
</template>
