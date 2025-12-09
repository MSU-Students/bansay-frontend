<template>
  <q-page class="q-pa-md">
    <q-card class="form-container">
      <q-card-section class="header-section">
        <div class="text-h5 text-primary text-weight-bold">Pending User Registrations</div>
      </q-card-section>

      <q-card-section class="content-area">
        <div v-if="loading" class="text-center">
          <q-spinner color="primary" size="50px" />
        </div>

        <div v-else-if="pendingUsers.length === 0" class="text-center text-grey">
          No pending users
        </div>

        <div v-else class="users-container">
          <q-list bordered separator>
            <q-item v-for="user in pendingUsers" :key="user.username">
              <q-item-section>
                <q-item-label>{{ user.username }}</q-item-label>
                <q-item-label caption>
                  {{ user.firstName }} {{ user.lastName }} - {{ user.role }}
                </q-item-label>
                <q-item-label caption>{{ user.email }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="q-gutter-sm">
                  <q-btn
                    label="Approve"
                    color="positive"
                    size="sm"
                    @click="approveUser(user.username)"
                    :loading="approvingUserId === user.username"
                  />
                  <q-btn
                    label="Reject"
                    color="negative"
                    size="sm"
                    @click="rejectUser(user.username)"
                    :loading="rejectingUserId === user.username"
                    flat
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { BansayService } from 'src/services/bansay-service';
import type { PendingUser } from 'src/services/bansay-service';
const pendingUsers = ref<PendingUser[]>([]);
const $q = useQuasar();
const loading = ref(false);
const approvingUserId = ref<string | null>(null);
const rejectingUserId = ref<string | null>(null);

onMounted(async () => {
  await fetchPendingUsers();
});

const fetchPendingUsers = async () => {
  loading.value = true;
  try {
    const result = await BansayService.getInstance().getUsers('Pending');
    pendingUsers.value = (result as unknown as { data: PendingUser[] }).data;
  } catch (err) {
    console.error('Failed to fetch pending users:', err);
    $q.notify({
      type: 'negative',
      message: 'Failed to load pending users',
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
};

const approveUser = async (userId: string) => {
  approvingUserId.value = userId;
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const result = await BansayService.getInstance().patchUser(String(userId), { status: 'Active' });

    $q.notify({
      type: 'positive',
      message: 'User approved successfully!',
      position: 'top',
    });

    await fetchPendingUsers();
  } catch (err) {
    console.error('Failed to approve user:', err);
    $q.notify({
      type: 'negative',
      message: 'Failed to approve user',
      position: 'top',
    });
  } finally {
    approvingUserId.value = null;
  }
};

const rejectUser = async (userId: string) => {
  rejectingUserId.value = userId;
  try {
    await BansayService.getInstance().patchUser(userId, { status: 'Disabled' });

    $q.notify({
      type: 'positive',
      message: 'User rejected',
      position: 'top',
    });

    // Refresh list
    await fetchPendingUsers();
  } catch (err) {
    console.error('Failed to reject user:', err);
    $q.notify({
      type: 'negative',
      message: 'Failed to reject user',
      position: 'top',
    });
  } finally {
    rejectingUserId.value = null;
  }
};
</script>

<style scoped>
.form-container {
  max-width: 1000px;
  margin: 0 auto;
}

.header-section {
  border-bottom: 1px solid #e0e0e0;
}

.content-area {
  min-height: 400px;
}
</style>
