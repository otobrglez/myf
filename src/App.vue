<script setup lang="ts">
import {RouterLink, RouterView, useRouter} from 'vue-router'
import {signOut} from 'firebase/auth'
import {auth} from './firebase'
import {useAuthStore} from "@/stores/auth.ts";

const router = useRouter()
const authStore = useAuthStore()

async function logout(event: Event) {
  event.preventDefault()
  try {
    await signOut(auth)
    console.debug('User logged out successfully')
    await router.push('/login')
  } catch (error) {
    console.error('Error logging out:', error)
  }
}
</script>

<template>
  <header>
    <nav v-if="authStore.isAuthenticated">
      <RouterLink to="/" class="my-f">myf</RouterLink>
      <span>{{ authStore.userEmail }}</span> |
      <RouterLink to="/transactions">{{ $t('transactions') }}</RouterLink>
      |
      <a @click.prevent="logout($event)">{{ $t('logout') }}</a>
    </nav>
  </header>

  <div>
    <RouterView/>
  </div>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

nav a {
  cursor: pointer;
}

.my-f {
  font-weight: 300;
  background-color: hsl(0, 43%, 31%);
  color: #fff;
  padding: 0.5rem;
  margin-right: 10px;
}

</style>
