<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'

const store = useAppStore()
const router = useRouter()

onMounted(() => {
  store.fetchProducts()
})

const buyNow = async (product: any) => {
  try {
    const order = await store.createOrder(product.id, 1, product.price)
    router.push(`/payment/${order.id}?amount=${product.price}&productId=${product.id}&quantity=1`)
  } catch (e) {
    alert("Failed to create order")
  }
}
</script>

<template>
  <div>
    <h1>Product Catalog</h1>
    <div v-if="store.loading">Loading...</div>
    <div v-if="store.error" class="error">{{ store.error }}</div>
    
    <div class="product-grid">
      <div v-for="p in store.products" :key="p.id" class="card">
        <h3>{{ p.name }}</h3>
        <p>{{ p.description }}</p>
        <p class="price">${{ p.price }}</p>
        <p class="stock">Stock: {{ p.stock }}</p>
        <button @click="buyNow(p)" :disabled="p.stock <= 0">
          {{ p.stock > 0 ? 'Buy Now' : 'Out of Stock' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}
.card {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
  background: white;
}
.price { font-weight: bold; color: green; }
.stock { color: gray; font-size: 0.9em; }
button {
  background: #007bff; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;
}
button:disabled { background: #ccc; cursor: not-allowed; }
</style>
