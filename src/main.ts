import './assets/main.css'

import {createApp} from 'vue'
import {createPinia} from 'pinia'

import App from './App.vue'
import router from './router'
import firebaseApp from './firebase'

console.debug("Firebase initialized:", firebaseApp.options.projectId);

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
