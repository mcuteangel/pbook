import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import './assets/styles/theme.css'
import './assets/styles/glassmorphism.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { useSettingsStore } from '@/store/settings'
import messages from './locales'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const i18n = createI18n({
  legacy: false,
  locale: 'fa',
  fallbackLocale: 'en',
  messages
})

app.use(i18n)

const settingsStore = useSettingsStore(pinia)
settingsStore.loadSettings().then(() => {
  console.log('Settings loaded and store initialized.')
})

app.mount('#app')
