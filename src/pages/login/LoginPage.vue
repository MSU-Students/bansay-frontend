<template>
  <q-page class="bg-grey-2 flex flex-center">
    <div class="container">
      <q-form @submit.prevent="handleLogin" ref="loginForm">
        <div class="logo-header">
          <img :src="logo" alt="Bansay Logo" class="logo" />
          <h2 class="app-title">Bansay App</h2>
        </div>

        <h1 class="login-title">Login</h1>

        <div class="input-box">
          <q-input
            filled
            v-model="username"
            label="Username"
            placeholder="Enter your username"
            color="indigo"
            bg-color="indigo-2"
            dense
            clearable
            :rules="[(val) => !!val || 'Please enter your username']"
          >
            <template v-slot:append>
              <q-icon name="mdi-account" color="indigo" />
            </template>
          </q-input>
        </div>

        <div class="input-box">
          <q-input
            filled
            v-model="password"
            label="Password"
            placeholder="Enter your password"
            type="password"
            color="indigo"
            bg-color="indigo-2"
            dense
            clearable
            :rules="[(val) => !!val || 'Please enter your password']"
          >
            <template v-slot:append>
              <q-icon name="mdi-lock" color="indigo" />
            </template>
          </q-input>
        </div>

        <div class="input-box">
          <q-select
            filled
            v-model="selectedRole"
            label="Select Role"
            :options="roles"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            color="indigo"
            bg-color="indigo-2"
            dense
            clearable
            :rules="[(val) => !!val || 'Please select a role']"
          >
            <template v-slot:append>
              <q-icon name="mdi-account-switch" color="indigo" />
            </template>
          </q-select>
        </div>

        <div class="forgot-link">
          <a href="#">Forgot Password?</a>
        </div>

        <q-btn type="submit" color="indigo" label="Login" class="full-width" />

        <p>
          Don’t have an account?
          <router-link to="/register">Register</router-link>
        </p>
        <p>Or login with</p>
        <div class="social-icons">
          <q-btn round color="red" icon="mdi-google" size="10px" />
          <q-btn round color="blue-8" icon="mdi-facebook" size="10px" />
          <q-btn round color="black" icon="mdi-github" size="10px" />
          <q-btn round color="blue-9" icon="mdi-linkedin" size="10px" />
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import '../../assets/styles/auth.css';
import { useRouter } from 'vue-router';
import { QBtn, QForm, QIcon } from 'quasar';
import logo from '../../assets/logo.png';
// add
import type { UserRegisterDtoRoleEnum } from 'src/services/sdk';
import { useAuthStore } from 'src/stores/auth-store';
import { useQuasar } from 'quasar';

type RoleType = 'student' | 'officer' | 'admin';

export default defineComponent({
  name: 'LoginPage',
  components: { QBtn, QForm, QIcon },
  setup() {
    const router = useRouter();
    const $q = useQuasar();
    const authStore = useAuthStore();

    const username = ref('');
    const password = ref('');
    const selectedRole = ref<RoleType | null>(null);
    const loginForm = ref<QForm | null>(null);

    const roles = [
      { label: 'Student', value: 'student' },
      { label: 'Officer', value: 'officer' },
      { label: 'Admin', value: 'admin' },
    ];

    // Function na magre-redirect sa tamang dashboard base sa role.
    const redirectToDashboard = (role: RoleType) => {
      if (role === 'student') void router.push('/student-dashboard');
      else if (role === 'officer') void router.push('/officer-dashboard');
      else if (role === 'admin') void router.push('/admin-dashboard');
    };

    const handleLogin = async () => {
      // Unahin muna i-validate ang form inputs.
      const valid = await loginForm.value?.validate();
      if (valid !== true) return;

      try {
        // TAWAGIN ang login action sa Pinia store.
        await authStore.login({
          id: username.value,
          password: password.value,
          role: selectedRole.value as UserRegisterDtoRoleEnum,
        });

        // Kung SUCCESSFUL ang login: Ipakita ang positive notification.
        $q.notify({
          type: 'positive',
          message: 'Login successful!',
          position: 'top',
          timeout: 2000,
        });

        // I-REDIRECT ang user gamit ang role na na-save sa Pinia.
        redirectToDashboard(authStore.role as RoleType);
      } catch (error: any) {
        // Kung FAILED ang login: Kunin ang error message at ipakita.
        let errorMessage = 'Login failed. Please try again.';

        if (error.response?.data?.message) {
          // Kunin ang specific message galing sa NestJS API (e.g., "Invalid credentials").
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        $q.notify({
          type: 'negative',
          message: errorMessage,
          position: 'top',
          timeout: 3000,
        });
      }
    };
    return { logo, username, password, selectedRole, roles, loginForm, handleLogin };
  },
});
</script>
