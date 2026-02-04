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
      'grid': 'Mreža',
      'added_by': 'dodal',
      'categories': 'Kategorije',
      'categories_hint': 'Urejajte kategorije, ki se prikažejo v mreži in vnosih.',
      'new_category_placeholder': 'Nova kategorija',
      'add_category': 'Dodaj kategorijo',
      'loading_categories': 'Nalaganje kategorij...',
      'category_name': 'Ime',
      'category_id': 'ID',
      'actions': 'Dejanja',
      'categories_empty': 'Ni kategorij.',
      'categories_error': 'Napaka pri shranjevanju kategorij.',
      'category_name_required': 'Ime kategorije je obvezno.',
      'delete_category_confirm': 'Izbrisati kategorijo "{name}"? Obstoječi stroški bodo ostali brez kategorije.',
      'unknown_category': 'Neznana kategorija'
    },
    en: {
      'logout': 'Logout',
      'avg_short': 'Avg.',
      'total': 'Total',
      'categories': 'Categories',
      'categories_hint': 'Manage the categories used in the grid and expense entries.',
      'new_category_placeholder': 'New category name',
      'add_category': 'Add category',
      'loading_categories': 'Loading categories...',
      'category_name': 'Name',
      'category_id': 'ID',
      'actions': 'Actions',
      'categories_empty': 'No categories yet.',
      'categories_error': "Couldn't save categories.",
      'category_name_required': 'Category name is required.',
      'delete_category_confirm': 'Delete category "{name}"? Existing expenses will keep their category id.',
      'unknown_category': 'Unknown category'
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
