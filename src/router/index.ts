import {createRouter, createWebHistory} from 'vue-router'
import {auth} from '@/firebase'
import LoginView from "@/views/LoginView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/GridView.vue'),
      meta: {requiresAuth: true}
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {requiresGuest: true}
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe()
        resolve(user)
      }, reject)
    })
  }

  const user = await getCurrentUser()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  if (requiresAuth && !user) {
    // Redirect to login if trying to access protected page while logged out
    next('/login')
  } else if (requiresGuest && user) {
    // Redirect to root if trying to access login while already logged in
    next('/')
  } else {
    next()
  }
})

export default router
