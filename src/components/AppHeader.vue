<template>
  <!-- Header -->
  <q-header elevated class="bg-primary text-white">
    <q-toolbar>
      <!-- Left Drawer Toggle Button -->
      <q-btn 
        v-if="showMenuButton" 
        flat 
        dense 
        round 
        icon="menu" 
        aria-label="Menu" 
        @click="drawer = !drawer" 
      />

      <!-- Logo -->
      <q-avatar class="q-ml-sm">
        <img :src="Bansaylogo">
      </q-avatar>

      <!-- Title -->
      <q-toolbar-title>
        {{ userRole }} {{ appName }}
      </q-toolbar-title>
      
      <!-- Profile Dropdown -->
      <div class="q-ml-md">
        <q-btn-dropdown
          flat
          no-caps
          :menu-offset="[0, 8]"
        >
          <!-- Profile -->
          <template #label>
            <div class="row items-center no-wrap">
              <q-avatar 
                size="38px" 
                class="q-mr-sm"
              >
                <img 
                  :src="userAvatar || 'https://cdn.quasar.dev/img/avatar.png'"
                  :alt="userDisplayName"
                />
              </q-avatar>
              <div class="text-left profile-info" v-if="$q.screen.gt.xs">
                <div class="text-weight-medium">{{ userDisplayName }}</div>
                <div class="text-caption text-white-8">{{ userRole }}</div>
              </div>
            </div>
          </template>

          <!-- Dropdown Menu -->
          <q-list style="min-width: 200px">
            <!-- User Info Section -->
            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ userDisplayName }}</q-item-label>
                <q-item-label caption lines="2">{{ userEmail }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-separator spaced />

            <!-- Menu Items -->
            <q-item clickable v-close-popup @click="$emit('profile-clicked')">
              <q-item-section avatar>
                <q-icon name="account_circle" />
              </q-item-section>
              <q-item-section>
                <q-item-label>My Profile</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="$emit('settings-clicked')">
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Settings</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator spaced />

            <!-- Logout -->
            <q-item clickable v-close-popup @click="handleLogoutClick" class="text-negative">
              <q-item-section avatar>
                <q-icon name="logout" color="negative" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Logout</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </q-toolbar>
  </q-header>

  <!-- Dynamic Sidebar based on User Role -->
  <q-drawer
    v-model="drawer"
    show-if-above

    :mini="miniState"
    @mouseenter="miniState = false"
    @mouseleave="miniState = true"

    :width="250"
    :breakpoint="500"
    bordered
    :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
  >
    <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: '0' }">
      <q-list padding>
        <template v-for="(item, index) in menuItems" :key="index">
          <!-- Separator -->
          <q-separator v-if="item.separator" :key="`separator-${index}`" />
          
          <!-- Menu Item -->
          <q-item 
            v-else
            clickable 
            v-ripple
            :to="item.route"
            :active="isActiveRoute(item.route)"
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>

            <q-item-section>
              {{ item.label }}
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-scroll-area>
  </q-drawer>

  <!-- Logout Confirmation Dialog -->
  <q-dialog v-model="showLogoutDialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">Confirm Logout</div>
        <div class="text-body1 q-mt-md">Are you sure you want to logout?</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn label="Logout" color="negative" @click="confirmLogout" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router';
import { getMenuForRole, type MenuItem } from 'src/data/sidebarMenu';
import Bansaylogo from 'assets/logo.png';

interface Props {
  // User data
  userRole?: string;
  userDisplayName?: string;
  userEmail?: string;
  userAvatar?: string;
  
  // App config
  appName?: string;
  
  // Features
  showMenuButton?: boolean;
}

interface Emits {
  (e: 'toggle-left-drawer'): void;
  (e: 'profile-clicked'): void;
  (e: 'settings-clicked'): void;
  (e: 'logout-clicked'): void;
  (e: 'logout-confirmed'): void;
}

const props = withDefaults(defineProps<Props>(), {
  userRole: 'User',
  userDisplayName: 'User',
  userEmail: 'user@example.com',
  userAvatar: '',
  appName: 'Bansay',
  showMenuButton: true,
});

const emit = defineEmits<Emits>();

const $q = useQuasar();
const route = useRoute();
const showLogoutDialog = ref(false);
const drawer = ref(false);
const miniState = ref(true);

// Get menu items based on user role
const menuItems = computed<MenuItem[]>(() => {
  return getMenuForRole(props.userRole);
});

// Check if route is active
const isActiveRoute = (itemRoute?: string) => {
  if (!itemRoute) return false;
  return route.path === itemRoute || route.path.startsWith(itemRoute);
};

// Default computed properties (can be overridden by props)
const userRole = computed(() => props.userRole);
const userDisplayName = computed(() => props.userDisplayName);
const userEmail = computed(() => props.userEmail);
const userAvatar = computed(() => props.userAvatar);

const confirmLogout = () => {
  emit('logout-confirmed');
  showLogoutDialog.value = false;
};

// Handle logout button click (opens confirmation dialog)
const handleLogoutClick = () => {
  showLogoutDialog.value = true;
  emit('logout-clicked');
};

// Make sure to handle logout click
defineExpose({
  showLogoutDialog,
  confirmLogout,
});
</script>

<style scoped>
.profile-info {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #ffffff;
}

.text-white-8 {
  color: rgba(255, 255, 255, 0.8);
}

.q-btn-dropdown__arrow {
  color: white;
}

.q-avatar:hover {
  opacity: 0.9;
  cursor: pointer;
}
</style>