import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import type { User } from 'src/services/sdk';

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[],
    loading: false,
  }),
  actions: {
    async fetchUsers() {
      this.loading = true;
      try {
        // Calling the API service via the store
        const { data } = await api.get('/user');
        this.users = data as unknown as User[];
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        this.loading = false;
      }
    },
  },
});
