<template>
  <q-layout>
    <!-- Use the AppHeader component -->
    <AppHeader
      :user-role="userRole"
      :user-display-name="userDisplayName"
      :user-email="currentUserEmail"
      :user-avatar="userAvatarUrl"
      :app-name="appName"
      :logo="logoPath"
      :show-menu-button="true"
      @toggle-left-drawer="toggleLeftDrawer"
      @profile-clicked="handleProfile"
      @settings-clicked="handleSettings"
      @logout-clicked="handleLogout"
      @logout-confirmed="confirmLogout"
    />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from 'src/stores/auth-store';
import AppHeader from 'src/components/AppHeader.vue';

const leftDrawerOpen = ref(false);
const authStore = useAuthStore();

// User data computed properties
const userRole = computed(() => {
  return authStore.currentUser?.role || 'User';
});

const userDisplayName = computed(() => {
  const name = authStore.currentUser?.username || 'User';
  return name?.split(' ')[0] || 'User';
});

const currentUserEmail = computed(() => {
  return authStore.currentUser?.email || 'user@example.com';
});

const userAvatarUrl = computed(() => {
  return 'https://cdn.quasar.dev/img/avatar.png';
});

// App config
const appName = 'Bansay';
const logoPath = '~assets/logo.png';

// Event handlers
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const handleProfile = () => {
  console.log('Navigate to profile');
  // Or use router: router.push('/profile');
};

const handleSettings = () => {
  console.log('Navigate to settings');
  // Or use router: router.push('/settings');
};

const handleLogout = () => {
  console.log('Logout initiated - showing confirmation dialog');
};

const confirmLogout = () => {
  try {
    authStore.logout();
    // Redirect to login page or handle post-logout
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
</script>