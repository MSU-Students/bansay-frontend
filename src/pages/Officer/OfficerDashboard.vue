<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-green-8 text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="leftDrawer = !leftDrawer" />
        <q-toolbar-title>Officer Dashboard</q-toolbar-title>
        <q-btn flat round icon="logout" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawer" show-if-above bordered class="bg-grey-1">
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <q-card class="dashboard-card q-mb-md">
            <q-card-section>
              <div class="text-h6">Add new liabilities</div>
              <div class="text-caption text-grey-7">Create and assign liabilities to students.</div>
            </q-card-section>
            <q-card-actions align="left">
              <q-btn color="green-8" label="Manage Liabilities" flat />
            </q-card-actions>
          </q-card>
        </div>
        <div class="q-pa-md">
          <q-card class="dashboard-card q-mb-md">
            <q-card-section>
              <div class="text-h6">Verify submitted payments</div>
              <div class="text-caption text-grey-7">
                Review and approve student payment submissions.
              </div>
            </q-card-section>
            <q-card-actions align="left">
              <q-btn color="green-8" label="Manage payments" flat />
            </q-card-actions>
          </q-card>
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page padding>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h4">Liabilities</div>

          <q-btn
            color="primary"
            icon="add"
            label="Add Liability"
            to="/officer/create-liability"
            no-caps
            unelevated
          />
        </div>

        <q-card>
          <q-table
            title="All Student Liabilities"
            :rows="liabilityStore.liabilities"
            :columns="columns"
            row-key="id"
            :loading="liabilityStore.loading"
            :filter="filter"
          >
            <template v-slot:top-right>
              <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>

            <template #body="props">
              <q-tr :props="props">
                <q-td key="id" :props="props">
                  {{ props.row.student?.username || 'N/A' }}
                </q-td>

                <q-td key="student" :props="props">
                  <div>{{ props.row.student?.firstName }} {{ props.row.student?.lastName }}</div>
                </q-td>

                <q-td key="type" :props="props">
                  <q-badge color="blue-grey" :label="props.row.type" />
                </q-td>

                <q-td key="amount" :props="props">
                  {{ formatCurrency(props.row.amount) }}
                </q-td>

                <q-td key="status" :props="props">
                  <q-chip
                    :color="getStatusColor(props.row.status)"
                    text-color="white"
                    dense
                    size="sm"
                  >
                    {{ props.row.status }}
                  </q-chip>
                </q-td>

                <q-td key="dueDate" :props="props">
                  {{ props.row.dueDate }}
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from 'src/stores/auth-store';
import { useLiabilityStore } from 'src/stores/liability-store';
import type { QTableColumn } from 'quasar';
import type { Liability } from 'src/services/sdk';

// State
const leftDrawer = ref(false);
const authStore = useAuthStore();
const liabilityStore = useLiabilityStore();
const filter = ref('');

function logout() {
  authStore.logout();
}

// Columns Definition
const columns: QTableColumn[] = [
  { name: 'id', label: 'Student ID', field: (row: Liability) => row.student?.username, align: 'left', sortable: true },
  { name: 'student', label: 'Name', field: (row: Liability) => row.student?.lastName, align: 'left', sortable: true },
  { name: 'type', label: 'Type', field: 'type', align: 'left', sortable: true },
  { name: 'amount', label: 'Amount', field: 'amount', align: 'right', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
  { name: 'dueDate', label: 'Due Date', field: 'dueDate', align: 'left', sortable: true },
];

// Helpers
function formatCurrency(value: number | undefined) {
  if (value === undefined) return '₱0.00';
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Paid': return 'positive';
    case 'Unpaid': return 'negative';
    case 'Cancelled': return 'grey';
    default: return 'grey';
  }
}

// Logic: Fetch Data on Mount
onMounted(async () => {
  await liabilityStore.fetchAllLiabilities();
});
</script>

<style scoped>
.dashboard-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}
</style>
