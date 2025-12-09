<template>
  <q-page class="bg-grey-2 flex flex-center">
    <div class="container landscape-container">
      <!-- Left side: Logo and App Info -->
      <div class="left-side">
        <div class="logo-section">
          <img :src="logo" alt="Bansay Logo" class="logo" />
          <h1 class="app-title">Bansay App</h1>
          <p class="app-subtitle">Welcome back to your community</p>
        </div>
      </div>

      <!-- Right side: Login Form -->
      <div class="right-side">
        <q-form @submit.prevent="handleLogin" ref="loginForm" class="form-wrapper">
          <h1 class="login-title">Sign In</h1>
          
          <div class="q-gutter-y-lg">
            <q-input
              filled
              v-model="username"
              label="Username"
              placeholder="Enter your username"
              color="indigo"
              bg-color="indigo-2"
              dense
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account" color="indigo" />
              </template>
              <template v-slot:append>
                <div 
                  v-if="username" 
                  class="cursor-pointer"
                  @click="username = ''"
                  tabindex="-1"
                >
                  <q-icon name="mdi-close" color="indigo" size="xs" />
                </div>
              </template>
            </q-input>
  
            <q-input
              filled
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              placeholder="Enter your password"
              color="indigo"
              bg-color="indigo-2"
              dense
            >
              <template v-slot:prepend>
                <q-icon name="mdi-lock" color="indigo" />
              </template>
              <template v-slot:append>
                <div class="flex items-center">
                  <div 
                    v-if="password" 
                    class="cursor-pointer q-mr-xs"
                    @click="togglePasswordVisibility"
                    tabindex="-1"
                  >
                    <q-icon 
                      :name="showPassword ? 'mdi-eye-off' : 'mdi-eye'" 
                      color="indigo" 
                      size="xs" 
                    />
                  </div>
                  <div 
                    v-if="password" 
                    class="cursor-pointer"
                    @click="password = ''"
                    tabindex="-1"
                  >
                    <q-icon name="mdi-close" color="indigo" size="xs" />
                  </div>
                </div>
              </template>
            </q-input>
            
            <div v-if="hasError" class="flex items-center text-red q-mt-sm q-pa-sm rounded-borders bg-red-1">
              <q-icon name="error" color="red" size="sm"/>
              <span class="q-ml-sm text-body2">Incorrect username or password</span>
            </div>
          </div>

          <div class="forgot-link text-right q-mt-sm">
            <a href="#" class="text-indigo text-caption">Forgot Password?</a>
          </div>

          <div class="q-mt-lg">
            <q-btn 
              type="submit" 
              color="indigo" 
              :label="isLoading ? 'Signing in...' : 'Sign In'" 
              class="full-width"
              :loading="isLoading"
              :disable="isLoading"
              size="lg"
            >
              <template v-slot:loading>
                <q-spinner-hourglass class="on-left" />
                Signing in...
              </template>
            </q-btn>
          </div>

          <div class="q-mt-lg text-center">
            <p class="text-body2">
              Don't have an account?
              <router-link to="/register" class="text-indigo q-ml-xs">Register</router-link>
            </p>
          </div>

          <div class="q-mt-lg text-center">
            <p class="text-caption text-grey-7">Or login with</p>
            <div class="social-icons q-mt-sm">
              <q-btn round color="red" icon="mdi-google" size="sm" />
              <q-btn round color="blue-8" icon="mdi-facebook" size="sm" />
              <q-btn round color="black" icon="mdi-github" size="sm" />
              <q-btn round color="blue-9" icon="mdi-linkedin" size="sm" />
            </div>
          </div>
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import 'src/assets/styles/auth.css';
import { useRouter } from 'vue-router';
import { QBtn, QForm, QIcon, useQuasar } from 'quasar';
import logo from 'src/assets/logo.png';
import { useAuthStore } from 'src/stores/auth-store';

export default defineComponent({
  name: 'LoginPage',
  components: { QBtn, QForm, QIcon },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const $q = useQuasar();

    const username = ref('');
    const password = ref('');
    const loginForm = ref<QForm | null>(null);
    const showPassword = ref(false);
    
    const loginError = ref<string>('');
    const hasError = ref<boolean>(false);
    const isLoading = ref<boolean>(false);

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    const handleLogin = async () => {
      loginError.value = '';
      hasError.value = false;
      isLoading.value = true;

      const valid = await loginForm.value?.validate();
      if (valid !== true) {
        hasError.value = true;
        isLoading.value = false;
        return;
      }

      try {
        const response = await authStore.login({
          username: username.value,
          password: password.value,
        });

        const role = response.user?.role;
        if (role === 'Student') {
          await router.push('/student/dashboard');
        } else if (role === 'Officer') {
          await router.push('/officer/dashboard');
        } else if (role === 'Admin') {
          await router.push('/admin/dashboard');
        } else {
          // Fallback if role doesn't match or is missing
          void router.push('/');
        }
        $q.notify({
          type: 'positive',
          message: 'Login successful',
        });
      } catch (error: unknown) {
        hasError.value = true;
        loginError.value = error instanceof Error && error.message
          ? 'Incorrect username or password'
          : 'Login failed';
          $q.notify({
            type: 'negative',
            message: loginError.value,
            position: 'top',
            timeout: 3000,
        });
      } finally {
        isLoading.value = false;
      }
    };

    return { 
      logo, 
      username, 
      password, 
      loginForm, 
      showPassword,
      togglePasswordVisibility,
      handleLogin, 
      loginError, 
      hasError,
      isLoading 
    };
  },
});
</script>

<style lang="css" scoped>
.q-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #e2e2e2, #c9d6ff);
}
</style>