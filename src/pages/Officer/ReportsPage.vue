<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-md">
      <div class="col-12">
        <div class="text-h4 text-primary">System Reports & Analytics</div>
        <div class="text-subtitle1 text-grey-7">
          Generate financial summaries, liability breakdowns, and export historical data.
        </div>
      </div>
    </div>

    <q-separator class="q-mb-lg" />

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="q-pa-md dashboard-card bg-red-1">
          <div class="text-h6 text-red-9">Total Unpaid Amount</div>
          <div class="text-h3 text-red-10">₱{{ totalUnpaidAmount.toLocaleString('en-PH') }}</div>
          <div class="text-caption text-grey-7">Across all pending student accounts.</div>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="q-pa-md dashboard-card bg-green-1">
          <div class="text-h6 text-green-9">Total Paid (YTD)</div>
          <div class="text-h3 text-green-10">₱{{ totalPaidAmount.toLocaleString('en-PH') }}</div>
          <div class="text-caption text-grey-7">Revenue verified this year.</div>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="q-pa-md dashboard-card bg-blue-1">
          <div class="text-h6 text-blue-9">Pending Officer Actions</div>
          <div class="text-h3 text-blue-10">{{ pendingActionsCount }}</div>
          <div class="text-caption text-grey-7">Appeals and payments awaiting review.</div>
        </q-card>
      </div>
    </div>

    <q-card flat bordered class="q-pa-md">
      <div class="text-h5 text-secondary q-mb-md">Report Generation Tools</div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-select
            v-model="reportType"
            :options="reportOptions"
            label="Select Report Type"
            dense
          />
        </div>

        <div class="col-12 col-md-4">
          <q-input :model-value="dateRangeLabel" dense label="Select Date Range" readonly>
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="dateRange" range mask="YYYY/MM/DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-2">
          <q-select
            v-model="exportFormat"
            :options="['CSV', 'PDF', 'XLSX']"
            label="Export Format"
            dense
          />
        </div>

        <div class="col-12 col-md-2">
          <q-btn
            label="Generate & Export"
            color="primary"
            icon="download"
            class="full-width"
            @click="generateReport"
            :disable="!reportType || !dateRange || !exportFormat"
          />
        </div>
      </div>

      <q-separator class="q-my-md" />

      <div class="text-h6 q-mt-md">Report Preview: {{ reportType }}</div>
      <q-card flat bordered class="q-pa-lg bg-grey-1" style="height: 300px">
        <div class="text-center text-grey-6 q-mt-xl">
          Detailed Report Preview will appear here after generation (API Integration needed).
        </div>
      </q-card>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'; // Import 'computed'
import { useQuasar } from 'quasar';

// Define the shape for the date range model
interface DateRange {
  from: string;
  to: string;
}

export default defineComponent({
  name: 'ReportsPage',
  setup() {
    const $q = useQuasar();

    // --- State for KPI Cards (Mock Data) ---
    const totalUnpaidAmount = ref(2000.5);
    const totalPaidAmount = ref(34900.0);
    const pendingActionsCount = ref(15);

    // --- State for Report Generation Parameters ---
    const reportType = ref('Liability Status Summary');

    // 1. Keep the internal date range model as an object
    const dateRange = ref<DateRange>({
      from: '2024/01/01',
      to: new Date().toISOString().substring(0, 10).replace(/-/g, '/'),
    });

    const exportFormat = ref('CSV');

    const reportOptions = [
      'Liability Status Summary',
      'Detailed Transactions Report',
      'Officer Activity Log',
      'Pending Appeals & Verifications',
    ];

    // 2. NEW: Create a computed property for display in the q-input
    const dateRangeLabel = computed(() => {
      // Return a clean string representation for the q-input field
      if (dateRange.value.from && dateRange.value.to) {
        return `${dateRange.value.from} to ${dateRange.value.to}`;
      }
      if (dateRange.value.from) {
        return dateRange.value.from;
      }
      return ''; // Return an empty string if no date is selected
    });

    // --- Core Logic ---

    const fetchKpis = () => {
      console.log('Fetching key performance indicators...');
    };

    const generateReport = () => {
      // NOTE: Ensure we check the internal dateRange object, not the label
      if (!reportType.value || !dateRange.value.from || !exportFormat.value) {
        $q.notify({ type: 'negative', message: 'Please select all report parameters.' });
        return;
      }

      $q.notify({
        type: 'info',
        message: `Generating ${reportType.value}...`,
        caption: `Exporting to ${exportFormat.value} for range ${dateRange.value.from} to ${dateRange.value.to}`,
      });
    };

    // --- Hooks ---
    onMounted(() => {
      fetchKpis();
    });

    return {
      totalUnpaidAmount,
      totalPaidAmount,
      pendingActionsCount,
      reportType,
      dateRange, // Keep this for the q-date component's v-model
      dateRangeLabel, // Add this for the q-input component's display
      exportFormat,
      reportOptions,
      generateReport,
      fetchKpis,
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

<style scoped>
.dashboard-card {
  /* Ensuring cards match the style of LiabilityManagementPage */
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
