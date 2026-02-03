import './assets/main.css'

import {createApp} from 'vue'
import {createI18n} from 'vue-i18n'
import {createPinia} from 'pinia'

import App from './App.vue'
import router from './router'
import firebaseApp from './firebase'

console.debug("Firebase initialized:", firebaseApp.options.projectId);

const i18n = createI18n({
  locale: 'sl-SI',
  fallbackLocale: 'en',
  legacy: false,
  messages: {
    'sl-SI': {
      'logout': 'Odjava',
      'avg_short': 'Pov.',
      'est_short': 'Oc.',
      'total': 'Seštevek',
      'amount_currency': 'Valuta (EUR)',
      'close': 'Zapri',
      'delete': 'Odstrani',
      'save': 'Shrani',
      'add_expense': 'Dodaj strošek',
      'existing_expenses': 'Obstojči stroški',
      'pick_user': 'Izberi uporabnika',
      'transactions': 'Tansakcije',
      'added_by': 'dodal'
    },
    en: {
      'logout': 'Logout',
      'avg_short': 'Avg.',
      'total': 'Total',
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
