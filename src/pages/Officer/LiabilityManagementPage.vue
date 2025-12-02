<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-md">
      <div class="col-12 col-md-6">
        <div class="text-h4 text-primary">Manage All Student Liabilities</div>
        <div class="text-subtitle1 text-grey-7">
          Comprehensive view of all active and paid liabilities in the system.
        </div>
      </div>

      <div class="col-12 col-md-6 text-right">
        <q-btn
          color="green"
          icon="add"
          label="Add New Liability"
          class="q-px-md"
          @click="showAddLiabilityDialog = true"
        />
      </div>
    </div>

    <q-separator class="q-mb-lg" />

    <q-card flat bordered class="q-pa-md q-mb-lg">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-input
            v-model="searchQuery"
            label="Search Student ID or Name"
            dense
            clearable
            @update:model-value="handleFilterChange"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div class="col-6 col-md-3">
          <q-select
            v-model="filterType"
            :options="['All', 'tuition', 'fee', 'fine', 'other']"
            label="Filter by Type"
            dense
            clearable
            @update:model-value="handleFilterChange"
          />
        </div>

        <div class="col-6 col-md-3">
          <q-select
            v-model="filterStatus"
            :options="['All', 'Unpaid', 'Paid', 'Cancelled']"
            label="Filter by Status"
            dense
            clearable
            @update:model-value="handleFilterChange"
          />
        </div>

        <div class="col-12 col-md-2">
          <q-input
            v-model="filterDueDate"
            label="Filter by Due Date"
            type="date"
            dense
            @update:model-value="handleFilterChange"
          />
        </div>
      </div>
    </q-card>

    <q-table
      title="All Liabilities"
      :rows="allLiabilities"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            icon="edit"
            size="sm"
            flat
            dense
            color="primary"
            @click="editLiability(props.row)"
          />
          <q-btn
            v-if="props.row.status === 'Unpaid'"
            icon="paid"
            size="sm"
            flat
            dense
            color="green"
            @click="markAsPaid(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- ADD LIABILITY DIALOG -->
    <q-dialog v-model="showAddLiabilityDialog">
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-section>
          <div class="text-h6">Add New Liability</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="handleCreateLiability">
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
              v-model="newLiability.type"
              :options="typeOptions"
              label="Type *"
              outlined
              class="q-mb-md"
              :rules="[val => !!val || 'Required']"
            />

            <q-input
              v-model.number="newLiability.amount"
              label="Amount *"
              type="number"
              hint="e.g., 150.75"
              :rules="[val => val > 0 || 'Must be greater than 0']"
              outlined
              class="q-mb-md"
            />

            <q-input
              v-model="newLiability.dueDate"
              label="Due Date *"
              type="date"
              :rules="[val => !!val || 'Required']"
              outlined
              class="q-mb-md"
            />

            <div class="row q-gutter-sm">
              <q-btn
                label="Cancel"
                color="grey"
                flat
                v-close-popup
              />
              <q-btn
                type="submit"
                label="Create Liability"
                color="green"
                :loading="creatingLiability"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useLiabilityStore } from 'src/stores/liability-store';
import { BansayService } from 'src/services/bansay-service';
import { storeToRefs } from 'pinia';
import type { QTableProps } from 'quasar';
import { useQuasar } from 'quasar';
import type {
  Liability,
  CreateLiabilityDto,
  StudentDto,
  LiabilityControllerFindAllStatusEnum,
  LiabilityControllerFindAllSortOrderEnum,
} from 'src/services/sdk';

type RequestProp = NonNullable<Parameters<NonNullable<QTableProps['onRequest']>>[0]>;
type MinimalRequestProps = Pick<RequestProp, 'pagination' | 'getCellValue'> & { filter?: unknown };

const columns: QTableProps['columns'] = [
  {
    name: 'studentUsername',
    required: true,
    label: 'Student ID',
    align: 'left',
    field: (row: Liability) => row.student.username,
    sortable: true,
  },
  {
    name: 'studentName',
    required: true,
    label: 'Name',
    align: 'left',
    field: (row: Liability) => `${row.student.firstName} ${row.student.lastName}`,
    sortable: true,
  },
  { name: 'type', label: 'Type', align: 'left', field: 'type', sortable: true },
  {
    name: 'amount',
    label: 'Amount',
    align: 'right',
    field: 'amount',
    sortable: true,
    format: (val: number | string) => {
      const numVal = typeof val === 'string' ? parseFloat(val) : val;
      return `₱ ${numVal.toFixed(2)}`;
    },
  },
  { name: 'status', label: 'Status', align: 'left', field: 'status', sortable: true },
  {
    name: 'dueDate',
    label: 'Due Date',
    align: 'left',
    field: 'dueDate',
    sortable: true,
    format: (val: string) => (val ? new Date(val).toLocaleDateString() : 'N/A'),
  },
  { name: 'actions', label: 'Actions', align: 'center', field: 'actions' },
];

export default defineComponent({
  name: 'LiabilityManagementPage',
  setup() {
    const $q = useQuasar();
    const liabilityStore = useLiabilityStore();
    const { liabilities: allLiabilities, loading } = storeToRefs(liabilityStore);

    // Search and filter state
    const searchQuery = ref('');
    const filterType = ref('All');
    const filterStatus = ref('All');
    const filterDueDate = ref(null);
    const showAddLiabilityDialog = ref(false);

    // Create liability state
    const typeOptions = ['tuition', 'fee', 'fine', 'other'];
    const students = ref<StudentDto[]>([]);
    const filteredStudents = ref<StudentDto[]>([]);
    const selectedStudent = ref<StudentDto | null>(null);
    const loadingStudents = ref(false);
    const creatingLiability = ref(false);

    const newLiability = ref<CreateLiabilityDto>({
      studentUsername: '',
      type: 'fine',
      amount: 0,
      dueDate: '',
    });

    const pagination = ref({
      sortBy: 'createdAt',
      descending: true,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 100,
    });

    // Load students for autocomplete
    onMounted(async () => {
      loadingStudents.value = true;
      try {
        students.value = await BansayService.getInstance().getAllStudents();
        filteredStudents.value = students.value;
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        loadingStudents.value = false;
      }

      // Load initial liabilities
      const minimalProps: MinimalRequestProps = {
        pagination: pagination.value,
        getCellValue: () => null,
      };
      if (onRequest) {
        onRequest(minimalProps as RequestProp);
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
        newLiability.value.studentUsername = student.idNumber;
      }
    };

    const handleCreateLiability = async () => {
      if (!selectedStudent.value) {
        $q.notify({
          type: 'negative',
          message: 'Please select a student',
          position: 'top',
        });
        return;
      }

      creatingLiability.value = true;
      try {
        await liabilityStore.createLiability(newLiability.value);

        $q.notify({
          type: 'positive',
          message: 'Liability created successfully!',
          position: 'top',
          timeout: 2000,
        });

        showAddLiabilityDialog.value = false;
        resetForm();

        // Refresh liabilities list
        const minimalProps: MinimalRequestProps = {
          pagination: pagination.value,
          getCellValue: () => null,
        };
        if (onRequest) {
          onRequest(minimalProps as RequestProp);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create liability';
        const isNotFound = errorMessage.toLowerCase().includes('404') ||
                          errorMessage.toLowerCase().includes('not found');

        $q.notify({
          type: 'negative',
          message: isNotFound ? 'Student not in database' : errorMessage,
          position: 'top',
        });
      } finally {
        creatingLiability.value = false;
      }
    };

    const resetForm = () => {
      newLiability.value = {
        studentUsername: '',
        type: 'fine',
        amount: 0,
        dueDate: '',
      };
      selectedStudent.value = null;
    };

    const fetchLiabilities = (props: { pagination: QTableProps['pagination'] }) => {
      const { sortBy, descending } = props.pagination || {};
      const statusFilterValue = filterStatus.value === 'All' ? undefined : filterStatus.value;
      const sortOrderValue = descending ? 'DESC' : 'ASC';

      const queryParams = {
        sortBy: sortBy as string,
        sortOrder: sortOrderValue as LiabilityControllerFindAllSortOrderEnum,
        studentUsername: searchQuery.value,
        status: statusFilterValue as LiabilityControllerFindAllStatusEnum | undefined,
      };

      liabilityStore
        .fetchAllLiabilities(queryParams)
        .catch((error) => {
          $q.notify({
            type: 'negative',
            message: 'Failed to load liabilities.',
            caption: error.message,
          });
        });
    };

    const onRequest: QTableProps['onRequest'] = (props) => {
      pagination.value = {
        ...(props.pagination || {}),
        rowsNumber: props.pagination?.rowsNumber || pagination.value.rowsNumber,
      };
      fetchLiabilities(props);
    };

    const handleFilterChange = () => {
      pagination.value.page = 1;
      const minimalProps: MinimalRequestProps = {
        pagination: pagination.value,
        getCellValue: () => null,
      };
      onRequest(minimalProps as RequestProp);
    };

    const editLiability = (liability: Liability) => {
      $q.notify({ message: `Editing Liability ID: ${liability.id} (TODO)` });
    };

    const markAsPaid = (liability: Liability) => {
      $q.notify({ message: `Marking Liability ID: ${liability.id} as Paid (TODO)` });
    };

    return {
      columns,
      allLiabilities,
      loading,
      pagination,
      onRequest,
      searchQuery,
      filterType,
      filterStatus,
      filterDueDate,
      handleFilterChange,
      editLiability,
      markAsPaid,
      showAddLiabilityDialog,
      // Create liability
      typeOptions,
      filteredStudents,
      selectedStudent,
      loadingStudents,
      creatingLiability,
      newLiability,
      filterStudents,
      onStudentSelect,
      handleCreateLiability,
    };
  },
});
</script>

<style scoped>
.dashboard-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
