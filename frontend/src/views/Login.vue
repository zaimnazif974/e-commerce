<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const router = useRouter()
const authStore = useAuthStore()
const selectedUser = ref('1')

const login = () => {
  if (selectedUser.value === 'admin') {
    authStore.login(999, 'admin')
  } else {
    authStore.login(Number(selectedUser.value), 'user')
  }
  router.push('/')
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[80vh]">
    <Card class="w-[400px]">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Select a mock user to continue.</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-6">
        <div class="grid gap-2">
          <Label>Select User</Label>
          <Select v-model="selectedUser">
            <SelectTrigger>
              <SelectValue placeholder="Select user role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">User 1</SelectItem>
              <SelectItem value="2">User 2</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button class="w-full" @click="login">Login</Button>
      </CardContent>
    </Card>
  </div>
</template>
