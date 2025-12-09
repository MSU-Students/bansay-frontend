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

    <q-dialog v-model="showAddLiabilityDialog">
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Create New Student Liability</div>
        </q-card-section>

        <q-form @submit.prevent="saveNewLiability">
          <q-card-section class="q-pt-none q-gutter-md">
            <q-input
              v-model="newLiability.studentUsername"
              label="Student ID (Username)"
              required
              filled
              hint="e.g., S12345. Use the official student username."
            />

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="newLiability.type"
                  :options="['tuition', 'fee', 'fine', 'other']"
                  label="Liability Type"
                  required
                  filled
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="newLiability.amount"
                  label="Amount (₱)"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  filled
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="newLiability.status"
                  :options="['Unpaid', 'Paid', 'Cancelled']"
                  label="Initial Status"
                  required
                  filled
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="newLiability.dueDate"
                  label="Due Date"
                  type="date"
                  mask="date"
                  required
                  filled
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="newLiability.dueDate" mask="YYYY-MM-DD" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <q-input
              v-model="newLiability.details"
              label="Description / Details"
              type="textarea"
              rows="3"
              filled
              hint="Provide clear details regarding the reason for this liability (e.g., 'Laboratory Fee - Spring 2025')."
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Cancel" color="primary" v-close-popup />
            <q-btn label="Save Liability" color="green" type="submit" :loading="isSaving" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useLiabilityStore } from 'src/stores/liability-store';
import { storeToRefs } from 'pinia';
import type { QTableProps } from 'quasar';
import { useQuasar } from 'quasar';
import type {
  Liability,
  LiabilityControllerFindAllStatusEnum,
  LiabilityControllerFindAllSortOrderEnum,
} from 'src/services/sdk';

// --- TYPE DEFINITIONS ---

// Define the precise type for the columns array
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
    format: (val: number) => `₱ ${val.toFixed(2)}`,
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

// Define types for QTable onRequest props and minimal request props
type RequestProp = NonNullable<Parameters<NonNullable<QTableProps['onRequest']>>[0]>;
type MinimalRequestProps = Pick<RequestProp, 'pagination' | 'getCellValue'> & { filter?: unknown };

// NEW: Interface for the new liability form data (matches required API payload)
interface NewLiabilityForm {
  studentUsername: string;
  type: string; // e.g., 'tuition', 'fine'
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'Unpaid' | 'Paid' | 'Cancelled';
  details: string;
}

// Initial state for the new liability form
const initialNewLiability: NewLiabilityForm = {
  studentUsername: '',
  type: 'tuition',
  amount: 0,
  dueDate: '',
  status: 'Unpaid',
  details: '',
};

export default defineComponent({
  name: 'LiabilityManagementPage',
  setup() {
    const $q = useQuasar();
    const liabilityStore = useLiabilityStore();
    const { liabilities: allLiabilities, loading } = storeToRefs(liabilityStore);

    // State for Search and Filter
    const searchQuery = ref('');
    const filterType = ref('All');
    const filterStatus = ref('All');
    const filterDueDate = ref(null);

    const showAddLiabilityDialog = ref(false);

    // NEW: State for the New Liability Form
    const newLiability = ref<NewLiabilityForm>({ ...initialNewLiability });
    const isSaving = ref(false);

    // State for pagination
    const pagination = ref({
      sortBy: 'createdAt',
      descending: true,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 100, // Initialize with a number
    });

    const fetchLiabilities = (props: { pagination: QTableProps['pagination'] }) => {
      const { page, rowsPerPage, sortBy, descending } = props.pagination || {};

      const statusFilterValue = filterStatus.value === 'All' ? undefined : filterStatus.value;
      const sortOrderValue = descending ? 'DESC' : 'ASC';

      const queryParams = {
        page: page || 1,
        limit: rowsPerPage || 10,
        sortBy: sortBy as string,

        sortOrder: sortOrderValue as LiabilityControllerFindAllSortOrderEnum,

        studentUsername: searchQuery.value,
        status: statusFilterValue as LiabilityControllerFindAllStatusEnum | undefined,
      };

      // Call the store action to fetch data (Sprint 3)
      // liabilityStore.fetchAllLiabilities(queryParams)
      console.log('Fetching liabilities with params:', queryParams);
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
      $q.notify({ message: `Editing Liability ID: ${liability.id}` });
      // TODO: Populate a form with liability data (Sprint 3)
    };

    const markAsPaid = (liability: Liability) => {
      $q.notify({ message: `Marking Liability ID: ${liability.id} as Paid (TODO: API Call)` });
      // TODO: Implement API call to update status (Sprint 3)
    };

    // NEW: Function to handle form submission
    const saveNewLiability = () => {
      isSaving.value = true;

      // TODO: 1. Input Validation (e.g., check amount > 0)

      // TODO: 2. CALL API (POST /liabilities)
      console.log('Attempting to save new liability:', newLiability.value);

      // Mock API call success/failure
      setTimeout(() => {
        isSaving.value = false;
        $q.notify({
          type: 'positive',
          message: `Liability for ${newLiability.value.studentUsername} created successfully.`,
        });

        // 3. Reset state and close dialog
        newLiability.value = { ...initialNewLiability };
        showAddLiabilityDialog.value = false;

        // 4. Refresh table data
        handleFilterChange();
      }, 1500);
    };

    // Fetch initial data on component load
    onMounted(() => {
      const minimalProps: MinimalRequestProps = {
        pagination: pagination.value,
        getCellValue: () => null,
      };
      onRequest(minimalProps as RequestProp);
    });

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

      // NEW return properties
      newLiability,
      saveNewLiability,
      isSaving,
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
