<template>
  <q-page class="q-pa-md">
    <div class="user-management">
      <div class="management-content">
        <q-card class="users-section">
          <q-card-section>
            <div class="section-header">
              <div class="text-h5 text-primary">System Users</div>
              <div class="header-controls">
                <div class="search-container">
                  <q-input
                    v-model="searchQuery"
                    outlined
                    dense
                    placeholder="Search users..."
                    class="search-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                </div>
                <q-btn
                  color="primary"
                  label="Refresh"
                  icon="refresh"
                  no-caps
                  @click="fetchUsers"
                  :loading="loading"
                />
              </div>
            </div>

            <div class="users-table q-mt-md">
              <q-table
                flat
                bordered
                :rows="filteredRows"
                :columns="columns"
                row-key="id"
                :loading="loading"
                :rows-per-page-options="[5, 10, 20]"
              >
                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-chip
                      :color="props.row.status === 'Active' ? 'positive' : 'warning'"
                      text-color="white"
                      dense
                      size="sm"
                    >
                      {{ props.row.status ? props.row.status.toUpperCase() : 'N/A' }}
                    </q-chip>
                  </q-td>
                </template>
                <template v-slot:body>
                  <q-tr v-if="filteredRows.length === 0 && !loading">
                    <q-td colspan="100%" class="text-center text-grey-6">
                      No users found
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { api } from 'src/boot/axios';
import type { User } from 'src/services/sdk';

const searchQuery = ref('')
const loading = ref(false);
const rows = ref<User[]>([]);

const filteredRows = computed(() => {
  if (!searchQuery.value) return rows.value;
  const query = searchQuery.value.toLowerCase();
  return rows.value.filter(user =>
    (user.firstName && user.firstName.toLowerCase().includes(query)) ||
    (user.lastName && user.lastName.toLowerCase().includes(query)) ||
    (user.email && user.email.toLowerCase().includes(query)) ||
    (user.role && user.role.toLowerCase().includes(query))
  );
});

const columns = [
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'left' as const,
    field: (row: User) => `${row.firstName} ${row.lastName}`,
    sortable: true
  },
  {
    name: 'email',
    label: 'Email',
    align: 'left' as const,
    field: 'email',
    sortable: true
  },
  {
    name: 'role',
    label: 'Role',
    align: 'left' as const,
    field: 'role',
    sortable: true
  },
  {
    name: 'status',
    label: 'Account Status',
    align: 'left' as const,
    field: 'status',
    sortable: true
  },
  {
    name: 'joined',
    label: 'Joined',
    align: 'left' as const,
    field: 'createdAt',
    sortable: true,
    format: (val: string) => new Date(val).toLocaleDateString()
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'center' as const,
    field: 'actions'
  }
]

const fetchUsers = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/user');
    rows.value = data as unknown as User[];
  } catch (error) {
    console.error('Failed to fetch users:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUsers);
</script>

<style scoped>
.user-management {
  max-width: 1200px;
  margin: 0 auto;
}

.users-section {
  border: 1px solid #e0e0e0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-container {
  min-width: 250px;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    width: 100%;
  }
}
</style>
