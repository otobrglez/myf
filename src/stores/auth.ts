import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import {auth} from '@/firebase'
import {onAuthStateChanged, type User} from 'firebase/auth'

export const useAuthStore =
  defineStore('auth', () => {
    const user = ref<User | null>(null)
    const isAuthReady = ref(false)

    // Listen for auth state changes
    onAuthStateChanged(auth, (currentUser) => {
      user.value = currentUser
      isAuthReady.value = true
    })

    const userEmail = computed(() => user.value?.email ?? '')
    const isAuthenticated = computed(() => user.value !== null)
    return {user, isAuthReady, userEmail, isAuthenticated}
  })
