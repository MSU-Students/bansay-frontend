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
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page padding>

        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">All Student Liabilities</div>

            <q-table
              flat
              bordered
              :rows="rows"
              :columns="columns"
              row-key="id"
              :loading="loading"
              :filter="filter"
            >
              <template v-slot:top-right>
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </template>

              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-chip
                    :color="props.row.status === 'Unpaid' ? 'negative' : 'positive'"
                    text-color="white"
                    dense
                    size="sm"
                  >
                    {{ props.row.status }}
                  </q-chip>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useAuthStore } from 'src/stores/auth-store';
import type { Liability } from 'src/services/sdk';
import type { QTableColumn } from 'quasar';

export default defineComponent({
  name: 'OfficerDashboard',
  setup() {
    const leftDrawer = ref(false);

    function selectCard(name: string) {
      alert(`You clicked ${name}!`);
    }

    const authStore = useAuthStore();
    function logout() {
      authStore.logout();
    }

    const loading = ref(false);
    const rows = ref<Liability[]>([]);
    const filter = ref('');

    const columns: QTableColumn[] = [
      {
        name: 'studentId',
        label: 'Student ID',
        align: 'left',
        field: (row: Liability) => row.student?.username || 'N/A',
        sortable: true
      },
      {
        name: 'name',
        label: 'Name',
        align: 'left',
        field: (row: Liability) => `${row.student?.firstName} ${row.student?.lastName}`,
        sortable: true
      },
      { name: 'type', label: 'Type', align: 'left', field: 'type', sortable: true },
      {
        name: 'amount',
        label: 'Amount',
        align: 'right',
        field: 'amount',
        format: (val: number) => `₱ ${val.toLocaleString()}`,
        sortable: true
      },
      { name: 'status', label: 'Status', align: 'center', field: 'status', sortable: true },
      { name: 'dueDate', label: 'Due Date', align: 'left', field: 'dueDate', sortable: true },
    ];

    return {
      leftDrawer,
      selectCard,
      logout,
      loading,
      rows,
      columns,
      filter
    };
  },
});
</script>

<style scoped>
.dashboard-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}
</style>
