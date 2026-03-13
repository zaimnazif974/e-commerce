import { defineStore } from 'pinia'

export interface User {
  id: number;
  name: string;
  role: 'user' | 'admin';
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null as User | null,
    loading: false
  }),
  actions: {
    login(userId: number, role: 'user' | 'admin') {
      this.currentUser = { id: userId, name: role === 'admin' ? 'Admin' : `User ${userId}`, role };
    },
    logout() {
      this.currentUser = null;
    }
  }
})
