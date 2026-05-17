import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/',
    redirect: '/dashboard',
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/family',
    name: 'Family',
    component: () => import('../views/Family.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/medications',
    name: 'Medications',
    component: () => import('../views/Medications.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/medications/add',
    name: 'AddMedication',
    component: () => import('../views/AddMedication.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reminders',
    name: 'Reminders',
    component: () => import('../views/Reminders.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/consult',
    name: 'Consult',
    component: () => import('../views/Consult.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
