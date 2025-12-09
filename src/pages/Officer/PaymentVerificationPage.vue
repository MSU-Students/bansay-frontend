<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-md">
      <div class="col-12">
        <div class="text-h4 text-primary">Verify Student Payments</div>
        <div class="text-subtitle1 text-grey-7">
          Review and validate proof of payments submitted by students for liability clearance.
        </div>
      </div>
    </div>

    <q-separator class="q-mb-lg" />

    <q-card flat bordered class="q-pa-md q-mb-lg">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-input
            v-model="searchQuery"
            label="Search Student ID or Transaction ID"
            dense
            clearable
            @update:model-value="handleFilterChange"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div class="col-6 col-md-4">
          <q-select
            v-model="filterStatus"
            :options="['Pending', 'Verified', 'Rejected']"
            label="Filter by Status"
            dense
            clearable
            @update:model-value="handleFilterChange"
          />
        </div>

        <div class="col-6 col-md-4">
          <q-select
            v-model="filterChannel"
            :options="['All', 'GCash', 'Maya', 'Bank Transfer', 'Over-the-Counter']"
            label="Filter by Payment Channel"
            dense
            clearable
            @update:model-value="handleFilterChange"
          />
        </div>
      </div>
    </q-card>

    <q-table
      title="Payment Submissions"
      :rows="submissions"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
    >
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.row.status)">
            {{ props.row.status }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            icon="fact_check"
            size="sm"
            flat
            dense
            color="secondary"
            label="Verify"
            @click="openReviewDialog(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showReviewDialog">
      <q-card style="width: 900px; max-width: 90vw">
        <div v-if="currentSubmission">
          <q-card-section class="bg-secondary text-white">
            <div class="text-h6">Verify Payment Submission #{{ currentSubmission.id }}</div>
            <div class="text-subtitle1">
              {{ currentSubmission.studentName }} - Amount: ₱{{
                currentSubmission.amount.toFixed(2)
              }}
            </div>
          </q-card-section>

          <q-card-section class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="text-subtitle1 text-primary q-mb-sm">Transaction Details</div>
              <q-list bordered separator dense>
                <q-item>
                  <q-item-section avatar>Transaction ID:</q-item-section>
                  <q-item-section>{{ currentSubmission.transactionId }}</q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>Payment Channel:</q-item-section>
                  <q-item-section>{{ currentSubmission.channel }}</q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>Liability ID:</q-item-section>
                  <q-item-section>{{ currentSubmission.liabilityId }}</q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>Submission Date:</q-item-section>
                  <q-item-section>{{
                    new Date(currentSubmission.submissionDate).toLocaleString()
                  }}</q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="col-12 col-md-6">
              <div class="text-subtitle1 text-primary q-mb-sm">Proof of Payment</div>
              <q-img
                v-if="currentSubmission.proofUrl"
                :src="currentSubmission.proofUrl"
                spinner-color="primary"
                style="height: 200px; max-width: 100%"
                fit="contain"
                alt="Proof of Payment Screenshot"
                class="q-mb-sm"
              />
              <q-btn
                icon="download"
                label="Download Proof"
                color="accent"
                dense
                flat
                target="_blank"
                :href="currentSubmission.proofUrl"
              />
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="text-subtitle2">Officer Remarks (Required for Reject/Verify):</div>
            <q-input
              v-model="officerRemarks"
              type="textarea"
              filled
              dense
              rows="2"
              placeholder="Add verification notes or reason for rejection."
            />
          </q-card-section>
        </div>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            label="Reject Proof"
            color="red"
            @click="processSubmission('Rejected')"
            :disable="!officerRemarks || !currentSubmission"
          />
          <q-btn
            label="Verify Payment"
            color="green"
            @click="processSubmission('Verified')"
            :disable="!officerRemarks || !currentSubmission"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import type { QTableProps } from 'quasar';
import { useQuasar } from 'quasar';

// --- TYPE DEFINITIONS FOR FIXING ERRORS ---
type RequestProp = NonNullable<Parameters<NonNullable<QTableProps['onRequest']>>[0]>;
type MinimalRequestProps = Pick<RequestProp, 'pagination' | 'getCellValue'> & { filter?: unknown };

// Placeholder interface matching the required table structure
interface SubmissionRecord {
  id: number;
  transactionId: string;
  studentId: string;
  studentName: string;
  liabilityId: number;
  amount: number;
  channel: string;
  proofUrl: string; // URL to the hosted image/file
  submissionDate: string;
  status: 'Pending' | 'Verified' | 'Rejected';
}

// Table columns for Q-Table
const columns: QTableProps['columns'] = [
  { name: 'id', label: 'ID', align: 'left', field: 'id', sortable: true },
  { name: 'studentId', label: 'Student ID', align: 'left', field: 'studentId', sortable: true },
  {
    name: 'studentName',
    label: 'Student Name',
    align: 'left',
    field: 'studentName',
    sortable: true,
  },
  { name: 'liabilityId', label: 'Liab. ID', align: 'left', field: 'liabilityId', sortable: true },
  {
    name: 'amount',
    label: 'Amount',
    align: 'right',
    field: 'amount',
    sortable: true,
    format: (val: number) => `₱ ${val.toFixed(2)}`,
  },
  { name: 'channel', label: 'Channel', align: 'left', field: 'channel', sortable: true },
  {
    name: 'submissionDate',
    label: 'Submitted On',
    align: 'left',
    field: 'submissionDate',
    sortable: true,
    format: (val: string) => new Date(val).toLocaleDateString(),
  },
  { name: 'status', label: 'Status', align: 'center', field: 'status', sortable: true },
  { name: 'actions', label: 'Actions', align: 'center', field: 'actions' },
];

export default defineComponent({
  name: 'PaymentVerificationPage',
  setup() {
    const $q = useQuasar();
    // Placeholder data (Replace with Pinia store logic in Sprint 3)
    const submissions = ref<SubmissionRecord[]>([
      {
        id: 201,
        transactionId: 'GC20230101',
        studentId: 'S12345',
        studentName: 'Juan Dela Cruz',
        liabilityId: 5,
        amount: 500.0,
        channel: 'GCash',
        proofUrl:
          'https://i.kym-cdn.com/entries/icons/original/000/055/084/coco-martin-sir-tapos-na-po.jpg',
        submissionDate: new Date().toISOString(),
        status: 'Pending',
      },
      {
        id: 202,
        transactionId: 'BT20230105',
        studentId: 'S67890',
        studentName: 'Maria Santos',
        liabilityId: 10,
        amount: 2500.5,
        channel: 'Bank Transfer',
        proofUrl:
          'https://images.steamusercontent.com/ugc/1889849524274052650/DEE7DF6CD02879BDA98076DB022A732244059639/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false',
        submissionDate: new Date().toISOString(),
        status: 'Pending',
      },
      {
        id: 203,
        transactionId: 'OT20230110',
        studentId: 'S11223',
        studentName: 'Chris Evans',
        liabilityId: 12,
        amount: 100.0,
        channel: 'Over-the-Counter',
        proofUrl: 'https://i.pinimg.com/1200x/0f/1f/60/0f1f60328d56b0904a7777c7f21e0f57.jpg',
        submissionDate: new Date().toISOString(),
        status: 'Verified',
      },
    ]);

    // State for Filter/Search
    const searchQuery = ref('');
    const filterStatus = ref('Pending'); // Focus is often on Pending submissions first
    const filterChannel = ref('All');

    // State for Dialog
    const showReviewDialog = ref(false);
    const currentSubmission = ref<SubmissionRecord | null>(null);
    const officerRemarks = ref('');

    // State for Table
    const loading = ref(false);
    const pagination = ref({
      sortBy: 'submissionDate',
      descending: true,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 3,
    });

    // Helper to determine badge color
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'Pending':
          return 'orange';
        case 'Verified':
          return 'green';
        case 'Rejected':
          return 'red';
        default:
          return 'grey';
      }
    };

    // Function to open the dialog and load submission details
    const openReviewDialog = (submission: SubmissionRecord) => {
      currentSubmission.value = submission;
      officerRemarks.value = ''; // Clear previous remarks
      showReviewDialog.value = true;
    };

    // Function to process the verification/rejection action
    const processSubmission = (action: 'Verified' | 'Rejected') => {
      if (!currentSubmission.value) return;

      if (!officerRemarks.value) {
        $q.notify({ type: 'negative', message: `Remarks are required to process the submission.` });
        return;
      }

      // TODO: CALL API HERE (Sprint 3)
      $q.notify({
        type: 'info',
        message: `Processing Submission ${currentSubmission.value.id} as ${action}...`,
      });

      // Update local status for immediate visual feedback (Mock only)
      const index = submissions.value.findIndex((s) => s.id === currentSubmission.value?.id);

      if (index !== -1) {
        const submissionToUpdate = submissions.value[index];
        if (submissionToUpdate) {
          submissionToUpdate.status = action;
        }
      }

      // LOGIC: The API will update the submission status and, if verified, update the corresponding liability status

      showReviewDialog.value = false;
      officerRemarks.value = '';
    };

    // Placeholder function for data loading
    const fetchSubmissions = () => {
      // Implementation for API call goes here

      loading.value = true;
      setTimeout(() => {
        loading.value = false;
      }, 500);
    };

    const onRequest: QTableProps['onRequest'] = (props) => {
      pagination.value = {
        ...(props.pagination || {}),
        rowsNumber: props.pagination?.rowsNumber || pagination.value.rowsNumber,
      };
      fetchSubmissions();
    };

    const handleFilterChange = () => {
      pagination.value.page = 1;

      const minimalProps: MinimalRequestProps = {
        pagination: pagination.value,
        getCellValue: () => null,
      };
      onRequest(minimalProps as RequestProp);
    };

    // Load initial data upon mounting
    onMounted(() => {
      const minimalProps: MinimalRequestProps = {
        pagination: pagination.value,
        getCellValue: () => null,
      };
      onRequest(minimalProps as RequestProp);
    });

    return {
      submissions,
      columns,
      loading,
      pagination,
      searchQuery,
      filterStatus,
      filterChannel,
      getStatusColor,
      openReviewDialog,
      processSubmission,
      showReviewDialog,
      currentSubmission,
      officerRemarks,
      onRequest,
      handleFilterChange,
    };
  },
});
</script>
