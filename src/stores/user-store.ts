import { defineStore } from 'pinia';
import { BansayService } from 'src/services/bansay-service';
import {
  type User,
  type UserControllerGetUsersRoleEnum,
  type UserControllerGetUsersStatusEnum,
} from 'src/services/sdk';

export interface UserState {
  users: User[];
  loading: boolean;
}

export const useUserStore = defineStore('users', {
  state: (): UserState => ({
    users: [],
    loading: false,
  }),

  actions: {
    // Get the list of users
    async fetchUsers(
      status?: UserControllerGetUsersStatusEnum,
      role?: UserControllerGetUsersRoleEnum,
    ) {
      this.loading = true;
      try {
        const result = await BansayService.getInstance().getAllUsers(status, role);
        this.users = result;
      } finally {
        this.loading = false;
      }
    },
  },
});
