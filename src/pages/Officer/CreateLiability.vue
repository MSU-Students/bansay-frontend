<template>
  <div class="q-pa-md">
    <h5>Create Liability</h5>

    <q-form @submit="handleSubmit">
      <q-select
        v-model="selectedStudent"
        :options="filteredStudents"
        option-label="idNumber"
        label="Student Username *"
        hint="Start typing to search students"
        use-input
        input-debounce="300"
        @filter="filterStudents"
        @update:model-value="onStudentSelect"
        :rules="[val => !!val || 'Required']"
        outlined
        class="q-mb-md"
        :loading="loadingStudents"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No students found
            </q-item-section>
          </q-item>
        </template>
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>{{ scope.opt.idNumber }}</q-item-label>
              <q-item-label caption>{{ scope.opt.fullName }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template v-slot:selected-item="scope">
          <span>{{ scope.opt.idNumber }} - {{ scope.opt.fullName }}</span>
        </template>
      </q-select>

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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useLiabilityStore } from 'src/stores/liability-store';
import { BansayService } from 'src/services/bansay-service';
import type { CreateLiabilityDto, StudentDto } from 'src/services/sdk';

const $q = useQuasar();
const liabilityStore = useLiabilityStore();

const typeOptions = ['tuition', 'fee', 'fine', 'other'];

const students = ref<StudentDto[]>([]);
const filteredStudents = ref<StudentDto[]>([]);
const selectedStudent = ref<StudentDto | null>(null);
const loadingStudents = ref(false);

const form = ref<CreateLiabilityDto>({
  studentUsername: '',
  type: 'fine',
  amount: 0,
  dueDate: '',
});

const loading = ref(false);
const error = ref('');

onMounted(async () => {
  // Load all students
  loadingStudents.value = true;
  try {
    students.value = await BansayService.getInstance().getAllStudents();
    filteredStudents.value = students.value;
  } catch (err) {
    console.error('Failed to load students:', err);
  } finally {
    loadingStudents.value = false;
  }
});

const filterStudents = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    const needle = val.toLowerCase();
    filteredStudents.value = students.value.filter(
      s => s.idNumber.toLowerCase().includes(needle) ||
          s.fullName.toLowerCase().includes(needle)
    );
  });
};

const onStudentSelect = (student: StudentDto | null) => {
  if (student) {
    form.value.studentUsername = student.idNumber;
  }
};

const handleSubmit = async () => {
  if (!selectedStudent.value) {
    error.value = 'Please select a student';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await liabilityStore.createLiability(form.value);

    // Show success notification
    $q.notify({
      type: 'positive',
      message: 'Liability created successfully!',
      position: 'top',
      timeout: 2000,
    });

    resetForm();
  } catch (err: unknown) {
    // Check if it's a 404 error (student not found)
    if (err instanceof Error) {
      const errorMessage = err.message.toLowerCase();
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        error.value = 'Student not in database';
      } else {
        error.value = err.message;
      }
    } else {
      error.value = 'Failed to create liability';
    }
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
  selectedStudent.value = null;
};
</script>
