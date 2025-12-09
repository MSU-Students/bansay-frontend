<template>
  <q-page padding class="bg-grey-2">
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3" v-for="card in summaryCards" :key="card.id">
        <q-card class="q-pa-md dashboard-card" :class="card.color">
          <div class="text-h6 text-white">{{ card.title }}</div>
          <div class="text-h5 text-bold text-white q-mt-sm">{{ card.value }}</div>
        </q-card>
      </div>
    </div>

    <q-table
      :rows="liabilities"
      :columns="columns"
      :loading="loading"
      row-key="id"
      flat
      bordered
      separator="horizontal"
    >
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="getStatusColor(props.row.status)"
            :label="props.row.status"
            class="text-uppercase"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-amount="props">
        <q-td :props="props">
          {{ formatCurrency(props.row.amount) }}
        </q-td>
      </template>
      <template v-slot:body-cell-action="props">
        <q-td align="center">
          <q-btn 
            v-if="props.row.status !== 'Paid'" 
            flat 
            color="primary" 
            label="File Appeal"
            disable 
          >
            <q-tooltip>Appeal feature coming soon</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { BansayService } from 'src/services/bansay-service';
import type { Liability } from 'src/services/sdk';

const loading = ref(false);
const liabilities = ref<Liability[]>([]);
const totalOutstanding = ref(0);

const columns = [
  { name: 'type', label: 'Type', field: 'type', align: 'left' as const, sortable: true },
  { name: 'issuer', label: 'Issuer', field: (row: Liability) => row.issuer?.username || 'System', align: 'left' as const },
  { name: 'amount', label: 'Amount', field: 'amount', align: 'right' as const, sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center' as const, sortable: true },
  { name: 'dueDate', label: 'Due Date', field: 'dueDate', align: 'left' as const, sortable: true },
  { name: 'createdAt', label: 'Date Issued', field: 'createdAt', align: 'left' as const, sortable: true },
  { name: 'action', label: 'Action', field: 'action', align: 'center' as const },
];

const summaryCards = computed(() => {
  const totalCount = liabilities.value.length;
  const unpaidCount = liabilities.value.filter(l => l.status !== 'Paid').length;
  const paidTotal = liabilities.value
    .filter(l => l.status === 'Paid')
    .reduce((sum, l) => sum + Number(l.amount), 0);

  return [
    { id: 1, title: 'Total Liabilities', value: totalCount.toString(), color: 'bg-blue-7' },
    { id: 2, title: 'Unpaid Count', value: unpaidCount.toString(), color: 'bg-indigo-7' },
    { id: 3, title: 'Outstanding Balance', value: formatCurrency(totalOutstanding.value), color: 'bg-grey-7' },
    { id: 4, title: 'Paid Total', value: formatCurrency(paidTotal), color: 'bg-blue-grey-7' },
  ];
});

function formatCurrency(value: number | string | undefined) {
  if (value === undefined) return '₱0.00';
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value));
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Paid': return 'positive';
    case 'Unpaid': return 'warning';
    case 'Cancelled': return 'grey';
    default: return 'grey';
  }
}

async function fetchLiabilities() {
  loading.value = true;
  try {
    const response = await BansayService.getInstance().getMyLiabilities();
    liabilities.value = response.liabilities;
    totalOutstanding.value = response.totalOutstandingBalance;
  } catch (error) {
    console.error('Failed to fetch liabilities:', error);
    
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void fetchLiabilities();
});
</script>

<style scoped>
.dashboard-card {
  border-radius: 14px;
  transition: 0.2s ease;
}
.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}
</style>
