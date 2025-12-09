<template>
  <q-page class="bg-grey-2 flex flex-center">
    <div class="container landscape-container">
      <!-- Left side: Logo and App Info -->
      <div class="left-side">
        <div class="logo-section">
          <img :src="logo" alt="Bansay Logo" class="logo" />
          <h1 class="app-title">Bansay App</h1>
          <p class="app-subtitle">Join our community today</p>
        </div>
      </div>

      <!-- Right side: Registration Form -->
      <div class="right-side">
        <q-form @submit.prevent="handleRegister" ref="registerForm" class="form-wrapper">
          <h1 class="register-title">Create Account</h1>
          
          <div class="q-gutter-y-sm">
            <div class="row q-gutter-sm">
              <div class="col">
                <q-input
                  filled
                  v-model="firstName"
                  label="First Name"
                  placeholder="Enter first name"
                  color="indigo"
                  bg-color="indigo-2"
                  dense
                  :rules="[val => !!val || 'First name is required']"
                  lazy-rules
                >
                  <template v-slot:prepend>
                    <q-icon name="mdi-account" color="indigo" />
                  </template>
                  <template v-slot:append>
                    <div 
                      v-if="firstName" 
                      class="cursor-pointer"
                      @click="firstName = ''"
                      tabindex="-1"
                    >
                      <q-icon name="mdi-close" color="grey-9" size="xs" />
                    </div>
                  </template>
                </q-input>
              </div>
              <div class="col">
                <q-input
                  filled
                  v-model="lastName"
                  label="Last Name"
                  placeholder="Enter last name"
                  color="indigo"
                  bg-color="indigo-2"
                  dense
                  :rules="[val => !!val || 'Last name is required']"
                  lazy-rules
                >
                  <template v-slot:prepend>
                    <q-icon name="mdi-account" color="indigo" />
                  </template>
                  <template v-slot:append>
                    <div 
                      v-if="lastName" 
                      class="cursor-pointer"
                      @click="lastName = ''"
                      tabindex="-1"
                    >
                      <q-icon name="mdi-close" color="grey-9" size="xs" />
                    </div>
                  </template>
                </q-input>
              </div>
            </div>
            
            <q-input
              filled
              v-model="username"
              label="Username"
              placeholder="Enter username"
              color="indigo"
              bg-color="indigo-2"
              dense
              :rules="[val => !!val || 'Username is required']"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account-circle" color="indigo" />
              </template>
              <template v-slot:append>
                <div 
                  v-if="username" 
                  class="cursor-pointer"
                  @click="username = ''"
                  tabindex="-1"
                >
                  <q-icon name="mdi-close" color="grey-9" size="xs" />
                </div>
              </template>
            </q-input>
            
            <q-input
              filled
              v-model="email"
              label="Email"
              placeholder="Enter email"
              type="email"
              color="indigo"
              bg-color="indigo-2"
              dense
              :rules="[
                val => !!val || 'Email is required',
                val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Please enter a valid email address'
              ]"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="mdi-email" color="indigo" />
              </template>
              <template v-slot:append>
                <div 
                  v-if="email" 
                  class="cursor-pointer"
                  @click="email = ''"
                  tabindex="-1"
                >
                  <q-icon name="mdi-close" color="grey-9" size="xs" />
                </div>
              </template>
            </q-input>
            
            <q-input
              filled
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              placeholder="Enter password"
              color="indigo"
              bg-color="indigo-2"
              dense
              :rules="[
                val => !!val || 'Password is required',
                val => val.length >= 8 || 'Password must be at least 8 characters',
                val => /[A-Z]/.test(val) || 'Must contain at least one uppercase letter',
                val => /[a-z]/.test(val) || 'Must contain at least one lowercase letter',
                val => /[0-9]/.test(val) || 'Must contain at least one number',
                val => /[!@#$%^&*(),.?:{}|<>]/.test(val) || 'Must contain at least one special character'
              ]"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="mdi-lock" color="indigo" />
              </template>
              <template v-slot:append>
                <div class="flex items-center">
                  <q-tooltip 
                    v-if="password"
                    anchor="top middle" 
                    self="bottom middle"
                    class="password-tooltip"
                  >
                    <div class="text-caption">
                      <div class="text-weight-medium q-mb-xs">Password Requirements:</div>
                      <ul class="q-ma-sm q-pl-sm">
                        <li :class="{'text-positive': password.length >= 8}">
                          At least 8 characters {{ password.length >= 8 ? '✓' : '' }}
                        </li>
                        <li :class="{'text-positive': /[A-Z]/.test(password)}">
                          One uppercase letter {{ /[A-Z]/.test(password) ? '✓' : '' }}
                        </li>
                        <li :class="{'text-positive': /[a-z]/.test(password)}">
                          One lowercase letter {{ /[a-z]/.test(password) ? '✓' : '' }}
                        </li>
                        <li :class="{'text-positive': /[0-9]/.test(password)}">
                          One number {{ /[0-9]/.test(password) ? '✓' : '' }}
                        </li>
                        <li :class="{'text-positive': /[!@#$%^&*(),.?:{}|<>]/.test(password)}">
                          One special character {{ /[!@#$%^&*(),.?:{}|<>]/.test(password) ? '✓' : '' }}
                        </li>
                      </ul>
                    </div>
                  </q-tooltip>
                  <div 
                    v-if="password" 
                    class="cursor-pointer q-mr-xs"
                    @click="togglePasswordVisibility"
                    tabindex="-1"
                  >
                    <q-icon 
                      :name="showPassword ? 'mdi-eye-off' : 'mdi-eye'" 
                      color="grey-9" 
                      size="xs" 
                    />
                  </div>
                  <div 
                    v-if="password" 
                    class="cursor-pointer"
                    @click="password = ''"
                    tabindex="-1"
                  >
                    <q-icon name="mdi-close" color="grey-9" size="xs" />
                  </div>
                </div>
              </template>
            </q-input>
          
            <q-input
              filled
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              label="Retype Password"
              placeholder="Confirm password"
              color="indigo"
              bg-color="indigo-2"
              dense
              :rules="[
                val => !!val || 'Please confirm your password',
                val => val === password || 'Passwords do not match'
              ]"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="mdi-lock-check" color="indigo" />
              </template>
              <template v-slot:append>
                <div class="flex items-center">
                  <div 
                    v-if="confirmPassword" 
                    class="cursor-pointer q-mr-xs"
                    @click="toggleConfirmPasswordVisibility"
                    tabindex="-1"
                  >
                    <q-icon 
                      :name="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'" 
                      color="grey-9" 
                      size="xs" 
                    />
                  </div>
                  <div 
                    v-if="confirmPassword" 
                    class="cursor-pointer"
                    @click="confirmPassword = ''"
                    tabindex="-1"
                  >
                    <q-icon name="mdi-close" color="grey-9" size="xs" />
                  </div>
                </div>
              </template>
            </q-input>
            
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
              :rules="[val => !!val || 'Please select a role']"
              lazy-rules
              style="height: 56px;"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account-switch" color="indigo"/>
              </template>
              <template v-slot:append>
                <div 
                  v-if="selectedRole" 
                  class="cursor-pointer"
                  @click="selectedRole = null"
                  tabindex="-1"
                >
                  <q-icon name="mdi-close" color="grey-9" size="xs" />
                </div>
              </template>
            </q-select>
          </div>

          <div class="q-mt-sm">
            <q-btn 
              type="submit" 
              color="indigo" 
              label="Register" 
              class="full-width"
              :loading="isLoading"
              size="lg"
            >
              <template v-slot:loading>
                <q-spinner-hourglass class="on-left" />
                Registering...
              </template>
            </q-btn>
          </div>

          <div class="q-mt-md text-center">
            <p class="text-body2">
              Already have an account?
              <router-link to="/login" class="text-indigo q-ml-xs">Login</router-link>
            </p>
          </div>

          <div class="q-mt-sm text-center">
            <p class="text-caption text-grey-7">Or register with</p>
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

<script lang="ts" setup>
import { ref } from 'vue';
import 'src/assets/styles/auth.css';
import { useRouter } from 'vue-router';
import { QBtn, QForm, QTooltip } from 'quasar';
import logo from 'src/assets/logo.png';
import { UserRegisterDtoRoleEnum } from 'src/services/sdk';
import { useAuthStore } from 'src/stores/auth-store';
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const firstName = ref('');
const lastName = ref('');
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const selectedRole = ref<UserRegisterDtoRoleEnum | null>(null);
const registerForm = ref<QForm | null>(null);
const isLoading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const roles = [
  { label: 'Student', value: UserRegisterDtoRoleEnum.Student },
  { label: 'Officer', value: UserRegisterDtoRoleEnum.Officer },
  { label: 'Admin', value: UserRegisterDtoRoleEnum.Admin },
];

async function handleRegister() {
  // Validate form before proceeding
  const valid = await registerForm.value?.validate();
  if (valid !== true) {
    // Form validation failed
    $q.notify({
      type: 'negative',
      message: 'Please fill in all required fields correctly',
      position: 'top',
      timeout: 3000,
    });
    return;
  }

  isLoading.value = true;

  try {
    await authStore.register({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
      role: selectedRole.value as unknown as UserRegisterDtoRoleEnum,
      username: username.value,
    });

    $q.notify({
      type: 'positive',
      message: 'Registration successful! Your account is pending approval.',
      position: 'top',
      timeout: 5000,
      icon: 'check_circle',
    });

    // Clear form
    firstName.value = '';
    lastName.value = '';
    email.value = '';
    username.value = '';
    password.value = '';
    confirmPassword.value = '';
    selectedRole.value = null;
    
    // Reset form validation state
    registerForm.value?.resetValidation();

    setTimeout(() => {
      void router.push('/login');
    }, 2000);
  } catch (error: unknown) {
    let errorMessage = 'Registration failed. Please try again.';
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 5000,
      icon: 'error',
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.password-tooltip {
  max-width: 250px;
  padding: 10px;
}

.password-tooltip ul li {
  margin-bottom: 2px;
}
</style>

<style lang="css" scoped>
.q-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #e2e2e2, #c9d6ff);
}
</style>