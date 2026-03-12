<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <header>
      <nav>
        <RouterLink to="/">Catalog</RouterLink>
        <RouterLink to="/orders">My Orders</RouterLink>
        <RouterLink to="/notifications">Notifications</RouterLink>
      </nav>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
header {
  background-color: #f8f9fa;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

nav {
  display: flex;
  gap: 1rem;
}

nav a {
  text-decoration: none;
  font-weight: bold;
  color: #333;
}

nav a.router-link-exact-active {
  color: #007bff;
}

.content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
