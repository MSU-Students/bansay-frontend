import { defineStore, acceptHMRUpdate } from 'pinia';
import { BansayService } from 'src/services/bansay-service';
import type { UserLoginDto, UserRegisterDto, UserInfoDto } from 'src/services/sdk';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null as UserInfoDto | null
  }),

  getters: {
    isAuthenticated: (state) => !!state.currentUser,
  },

  actions: {
    async fetchCurrentUser() {
      if (this.currentUser) {
        return this.currentUser;
      }
      // Fetch user data from backend instead of localStorage for data privacy
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const user = await BansayService.getInstance().getCurrentUser();
          this.currentUser = user as unknown as UserInfoDto;
        } catch (error) {
          console.error('Failed to fetch current user:', error);
          this.currentUser = null;
        }
      }
    },

    async login(payload: UserLoginDto) {
      const response = await BansayService.getInstance().loginUser(payload);
      if (response.user) {
        this.currentUser = response.user;
      }
      return response;
    },
    
    async register(data: UserRegisterDto) {
      return await BansayService.getInstance().registerUser(data);
    },

    logout() {
      try {
        // Call the logout method on the service
        BansayService.getInstance().logout();
      } catch (error) {
        console.error('Error during logout:', error);
      } finally {
        // Clear local state regardless of API call success
        this.currentUser = null;
        
        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user_role');
        
        // Force reload to clear any cached state
        window.location.href = '/auth/login';
      }
    }
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}