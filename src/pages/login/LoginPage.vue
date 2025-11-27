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

        <div class="forgot-link">
          <a href="#">Forgot Password?</a>
        </div>

        <q-btn type="submit" color="indigo" label="Login" class="full-width" />

        <p>
          Don't have an account?
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
import { QBtn, QForm, QIcon, useQuasar } from 'quasar';
import logo from '../../assets/logo.png';
import { type UserRegisterDtoRoleEnum } from 'src/services/sdk';
import { useAuthStore } from 'src/stores/auth-store';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'LoginPage',
  components: { QBtn, QForm, QIcon },
  setup() {
    const router = useRouter();
    const $q = useQuasar();
    const authStore = useAuthStore();
    const username = ref('');
    const password = ref('');
    const selectedRole = ref('');
    const loginForm = ref<QForm | null>(null);

    const roles = [
    { label: 'Student', value: 'Student' },
    { label: 'Officer', value: 'Officer' },
    { label: 'Admin', value: 'Admin' },
    ];

    const handleLogin = async () => {
      /* uncomment if you want to skip actual login logic (for testing purposes)
      const valid = await loginForm.value?.validate();
      if (valid !== true) return;

      if (selectedRole.value === 'student') void router.push('/student-dashboard');
      else if (selectedRole.value === 'officer') void router.push('/officer-dashboard');
      else if (selectedRole.value === 'admin') void router.push('/admin-dashboard');
      */

      // Actual login logic (comment if want to test ui)
      try {
        const response = await authStore.login({
          username: username.value,
          password: password.value,
          role: selectedRole.value as UserRegisterDtoRoleEnum,
        });

        if (selectedRole.value == 'Student' && response.user.role != 'Student' ||
        selectedRole.value == 'Officer' && response.user.role != 'Officer' ||
        selectedRole.value == 'Admin' && response.user.role != 'Admin') {
          $q.notify({
            type: 'negative',
            message: 'Incorrect Role. Please select the correct role.',
            position: 'top',
            timeout: 3000,
          });
          return;
        }

        $q.notify({
          type: 'positive',
          message: 'Login successful',
        });

        if (response.user.role === 'Student') void router.push('/student-dashboard');
        else if (response.user.role === 'Officer') void router.push('/officer-dashboard');
        else if (response.user.role === 'Admin') void router.push('/admin-dashboard');

      } catch (error: unknown) {
          const errorMessage =
          error instanceof Error && error.message
          ? 'Wrong username or password'
          : 'Login failed';
          $q.notify({
            type: 'negative',
            message: errorMessage,
            position: 'top',
            timeout: 3000,
          });
        }
      };
    return { logo, username, password, selectedRole, roles, loginForm, handleLogin };
  }
})
</script>
