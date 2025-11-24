<template>
  <div class="q-pa-md">
    <h5>Create Liability</h5>

    <q-form @submit="handleSubmit">
      <q-input
        v-model="form.studentUsername"
        label="Student Username *"
        hint="e.g., mangorangca"
        :rules="[val => !!val || 'Required']"
        outlined
        class="q-mb-md"
      />

      <q-select
        v-model="form.type"
        :options="typeOptions"
        label="Type *"
        outlined
        class="q-mb-md"
        :rules="[val => !!val || 'Required']"
      />

      <q-input
        v-model.number="form.amount"
        label="Amount *"
        type="number"
        hint="e.g., 150.75"
        :rules="[val => val > 0 || 'Must be greater than 0']"
        outlined
        class="q-mb-md"
      />

      <q-input
        v-model="form.dueDate"
        label="Due Date *"
        type="date"
        :rules="[val => !!val || 'Required']"
        outlined
        class="q-mb-md"
      />

      <q-btn
        type="submit"
        label="Create"
        color="primary"
        :loading="loading"
        class="q-mr-sm"
      />
      <q-btn
        label="Clear"
        color="grey"
        @click="resetForm"
        flat
      />
    </q-form>

    <q-banner v-if="error" class="bg-negative text-white q-mt-md">
      {{ error }}
    </q-banner>

    <q-banner v-if="success" class="bg-positive text-white q-mt-md">
      Liability created!
    </q-banner>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLiabilityStore } from 'src/stores/liability-store';
import type { CreateLiabilityDto } from 'src/services/sdk';

const liabilityStore = useLiabilityStore();

const typeOptions = ['tuition', 'fee', 'fine', 'other'];

const form = ref<CreateLiabilityDto>({
  studentUsername: '',
  type: 'fine',
  amount: 0,
  dueDate: '',
});

const loading = ref(false);
const error = ref('');
const success = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  success.value = false;

  try {
    await liabilityStore.createLiability(form.value);
    success.value = true;
    resetForm();

    setTimeout(() => {
      success.value = false;
    }, 3000);
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to create liability';
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    studentUsername: '',
    type: 'fine',
    amount: 0,
    dueDate: '',
  };
};
</script>
