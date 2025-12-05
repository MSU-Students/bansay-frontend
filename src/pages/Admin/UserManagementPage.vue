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
                    placeholder="Search users"
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
                  @click="refreshUsers"
                />
              </div>
            </div>

            <div class="users-table q-mt-md">
              <q-table
                flat
                bordered
                :rows="filteredUsers"
                :columns="columns"
                row-key="id"
                :rows-per-page-options="[5, 10, 20]"
              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="name" :props="props">{{
                      props.row.firstName + ' ' + props.row.lastName
                    }}</q-td>
                    <q-td key="email" :props="props">{{ props.row.email }}</q-td>
                    <q-td key="role" :props="props">{{ props.row.role }}</q-td>
                    <q-td key="joined" :props="props">{{ props.row.createdAt }}</q-td>
                    <q-td key="status" :props="props">{{ props.row.status }}</q-td>
                    <q-td key="actions" :props="props">
                      <!-- Add actions here for the users -->
                    </q-td>
                  </q-tr>
                </template>

                <template v-slot:no-data>
                  <div class="full-width text-center q-pa-md text-grey-6">No users found</div>
                </template>
              </q-table>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useUserStore } from 'src/stores/user-store';
import { type User } from 'src/services/sdk';

const searchQuery = ref('');
const userStore = useUserStore();

onMounted(async () => {
  await userStore.fetchUsers();
});

const filteredUsers = computed(() => {
  if (!searchQuery.value) return userStore.users;

  const query = searchQuery.value.toLowerCase();
  return userStore.users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(query);
  });
});

const refreshUsers = async () => {
  await userStore.fetchUsers();
};

const columns = [
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'left' as const,
    field: (row: User) => `${row.firstName} ${row.lastName}`,
    sortable: true,
  },
  {
    name: 'email',
    label: 'Email',
    align: 'left' as const,
    field: 'email',
    sortable: true,
  },
  {
    name: 'role',
    label: 'Role',
    align: 'left' as const,
    field: 'role',
    sortable: true,
  },
  {
    name: 'joined',
    label: 'Joined',
    align: 'left' as const,
    field: 'joined',
    sortable: true,
  },
  {
    name: 'status',
    label: 'Status',
    align: 'left' as const,
    field: 'status',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'center' as const,
    field: 'actions',
  },
];
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
