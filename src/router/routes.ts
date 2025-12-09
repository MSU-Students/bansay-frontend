import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '', redirect: { name: 'login' } },

      {
        path: 'login',
        component: () => import('pages/Auth/login/LoginPage.vue'),
        name: 'login',
      },
      {
        path: 'register',
        component: () => import('pages/Auth/register/RegisterPage.vue'),
        name: 'register',
      },

      // These dashboard routes are redundant and removed to avoid conflict:
      // { path: 'student-dashboard', component: () => import('pages/student/StudentDashboard.vue') },
      // { path: 'officer-dashboard', component: () => import('pages/Officer/OfficerDashboard.vue') },
      // {
      //   path: 'student-dashboard',
      //   component: () => import('pages/student/StudentDashboard.vue'),
      //   meta: { requiresAuth: true, roles: ['Student'] },
      // },
    ],
  },

  // =================================================================
  // STUDENT ROUTES (Fixed to support layout links)
  // =================================================================
  {
    path: '/student',
    component: () => import('layouts/StudentLayout.vue'),
    meta: { requiresAuth: true, roles: ['Student'] },
    children: [
      {
        path: '', redirect: { name: 'student-dashboard' }
      },
      {
        path: 'dashboard',
        component: () => import('pages/student/StudentDashboard.vue'),
        name: 'student-dashboard'
      },
      {
        path: 'liability',
        component: () => import('pages/student/LiabilitiesSummary.vue'),
        name: 'student-liability'
      },
      {
        path: 'payment',
        component: () => import('pages/student/SettlePaymentPage.vue'),
        name: 'student-payment'
      },
      {
        path: 'appeal',
        component: () => import('pages/student/AppealSubmissionPage.vue'),
        name: 'student-appeal'
      }

    ]
  },

  // =================================================================
  // OFFICER ROUTES (NEW: Added OfficerLayout.vue)
  // =================================================================
  {
    path: '/officer',
    component: () => import('layouts/OfficerLayout.vue'), // << New Officer Layout
    children: [
      {
        path: '', redirect: { name: 'officer-dashboard' }
      },
      {
        path: 'dashboard',
        component: () => import('pages/Officer/OfficerDashboard.vue'),
        name: 'officer-dashboard'
      },
      {
        path: 'management',
        name: 'officer-liability-management',
        component: () => import('pages/Officer/LiabilityManagementPage.vue'), // Placeholder
      },
      {
        path: 'appeals',
        name: 'officer-appeal-review',
        component: () => import('pages/Officer/AppealReviewPage.vue'), // Placeholder
      },
      {
        path: 'officer-verify',
        name: 'payment-verification',
        component: () => import('pages/Officer/PaymentVerificationPage.vue'), // Placeholder
      },
      {
        path: 'officer-reports',
        name: 'officer-reports',
        component: () => import('pages/Officer/ReportsPage.vue'), // Placeholder
      },
    ],
  },

  // =================================================================
  // ADMIN ROUTES (Existing Structure - Added name for consistency)
  // =================================================================
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['Admin'] },
    children: [
      {
        path: '', redirect: { name: 'admin-dashboard' }
      },
      {
        path: 'dashboard',
        component: () => import('pages/Admin/AdminDashboard.vue'),
        name: 'admin-dashboard',
      },
      {
        path: 'user-management',
        component: () => import('pages/Admin/UserManagementPage.vue'),
        name: 'admin-user-management',
      },
      {
        path: 'pending-approval',
        name: 'pending-approval',
        component: () => import('pages/Admin/PendingApprovalPage.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
