<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'

const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
    <header v-if="authStore.currentUser" class="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div class="font-bold text-xl flex items-center gap-2">
        <span class="text-blue-600">E-</span>Commerce
      </div>
      <nav class="flex items-center gap-6">
        <RouterLink to="/" class="hover:text-blue-600 transition-colors" exact-active-class="text-blue-600 font-semibold">Catalog</RouterLink>
        <RouterLink v-if="authStore.currentUser.role !== 'admin'" to="/orders" class="hover:text-blue-600 transition-colors" exact-active-class="text-blue-600 font-semibold">My Orders</RouterLink>
        <RouterLink v-if="authStore.currentUser.role !== 'admin'" to="/notifications" class="hover:text-blue-600 transition-colors" exact-active-class="text-blue-600 font-semibold">Notifications</RouterLink>
        <RouterLink v-if="authStore.currentUser.role === 'admin'" to="/dashboard" class="hover:text-blue-600 transition-colors" exact-active-class="text-blue-600 font-semibold">Dashboard</RouterLink>
      </nav>
      <div class="flex items-center gap-4">
        <span class="text-sm text-slate-500">Logged in as <strong class="text-slate-800">{{ authStore.currentUser.name }}</strong></span>
        <Button variant="outline" size="sm" @click="logout">Logout</Button>
      </div>
    </header>

    <main class="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col">
      <RouterView />
    </main>
  </div>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
</style>
