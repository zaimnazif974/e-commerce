<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '../store'

const store = useAppStore()

onMounted(() => {
  store.fetchNotifications()
})
</script>

<template>
  <div>
    <h1>Notifications</h1>
    <button @click="store.fetchNotifications()" class="refresh">Refresh Notifications</button>
    
    <div v-if="store.loading">Loading...</div>
    
    <div v-if="store.notifications.length > 0" class="notification-list">
      <div v-for="n in store.notifications" :key="n.id" class="notification-item">
        <i class="icon">🔔</i>
        <div class="content">
          <p class="message">{{ n.message }}</p>
          <span class="time">{{ new Date(n.createdAt).toLocaleString() }}</span>
        </div>
      </div>
    </div>
    <p v-else>No new notifications.</p>
  </div>
</template>

<style scoped>
.notification-list { display: flex; flex-direction: column; gap: 10px; margin-top: 1rem; }
.notification-item { display: flex; align-items: center; padding: 15px; border-left: 4px solid #007bff; background: #f8f9fa; border-radius: 4px; }
.icon { font-size: 1.5rem; margin-right: 15px; }
.message { margin: 0; font-weight: 500; }
.time { font-size: 0.8em; color: gray; }
.refresh { margin-bottom: 1rem; padding: 6px 12px;}
</style>
