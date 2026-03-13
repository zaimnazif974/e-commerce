<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '../store'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const store = useAppStore()

onMounted(() => {
  store.fetchProducts()
})

const buyNow = async (product: any) => {
  try {
    await store.createOrder(product.id, 1, product.price)
    alert(`Order for ${product.name} created successfully! Please check My Orders to pay.`)
  } catch (e) {
    alert("Failed to create order")
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Product Catalog</h1>
      <p class="text-slate-500">Browse and purchase our latest items.</p>
    </div>
    
    <div v-if="store.loading" class="text-slate-500">Loading products...</div>
    <div v-else-if="store.error" class="text-destructive font-semibold">{{ store.error }}</div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <Card v-for="p in store.products" :key="p.id" class="flex flex-col">
        <CardHeader>
          <CardTitle>{{ p.name }}</CardTitle>
          <CardDescription>{{ p.description }}</CardDescription>
        </CardHeader>
        <CardContent class="flex-1">
          <div class="text-2xl font-bold text-green-600">${{ p.price }}</div>
          <div class="text-sm text-slate-500 mt-2">Stock: {{ p.stock }} units</div>
        </CardContent>
        <CardFooter>
          <Button @click="buyNow(p)" :disabled="p.stock <= 0" class="w-full">
            {{ p.stock > 0 ? 'Buy Now' : 'Out of Stock' }}
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>
