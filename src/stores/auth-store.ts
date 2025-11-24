import { defineStore, acceptHMRUpdate } from 'pinia';
import { BansayService } from 'src/services/bansay-service';
import type { UserLoginDto, UserRegisterDto, UserLoginResponseDto } from 'src/services/sdk';

// Kunin agad ang token at role galing sa local storage para sa session restoration.
const initialRole = localStorage.getItem('user-role') as UserLoginResponseDto['role'] | null;
const initialToken = localStorage.getItem('user-token');

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null as unknown | null,
    // Ito ang gagamitin para malaman kung sino ang naka-login
    token: initialToken,
    role: initialRole,
  }),

  getters: {
    // True kung may token, ibig sabihin naka-login nna.
    isAuthenticated: (state) => !!state.token,
    // Ibalik ang role ng user.
    userRole: (state) => state.role,
  },

  actions: {
    async login(payload: UserLoginDto) {
      try {
        // TAWAGIN ang NestJS API sa pamamagitan ng service.
        const response: UserLoginResponseDto = await BansayService.getInstance().loginUser(payload);

        // I-SAVE ang token at role sa global state.
        this.token = response.token;
        this.role = response.role;

        // I-SAVE sa local storage para hindi mawala ang session kahit mag-refresh ang user.
        localStorage.setItem('user-token', response.token);
        localStorage.setItem('user-role', response.role);

        this.currentUser = response.user;

        return response; // Ibalik ang successful response
      } catch (error) {
        // May error galing sa API (e.g., 401 Unauthorized, 403 Forbidden).
        // I-THROW ulit para ma-catch ito sa component at maipakita ang error message.
        throw error;
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
