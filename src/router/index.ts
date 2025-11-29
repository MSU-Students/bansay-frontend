import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'src/stores/auth-store';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // [NEW CODE START] Navigation Guard Implementation
  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // 1. Recover session: If state is empty but token exists in storage, try to fetch user.
    if (!authStore.isAuthenticated && localStorage.getItem('accessToken')) {
      await authStore.fetchCurrentUser();
    }

    // 2. Define public routes that don't need login
    const publicPages = ['/login', '/register', '/'];
    const authRequired = !publicPages.includes(to.path);

    // 3. Block access: If page requires auth & user is not logged in -> Send to Login
    if (authRequired && !authStore.isAuthenticated) {
      return next('/login');
    }

    // 4. Redirect logged-in users away from Login/Register pages -> Send to Dashboard
    if (publicPages.includes(to.path) && authStore.isAuthenticated) {
      return next('/student-dashboard');
    }

    next();
  });

  return Router;
});
