import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n' // ایمپورت کردن i18n از فایل جدید
import './assets/styles/theme.css'
import './assets/styles/glassmorphism.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { useSettingsStore } from '@/store/settings'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n) // استفاده از i18n ایمپورت شده

const settingsStore = useSettingsStore(pinia)
settingsStore.loadSettings().then(() => {
  console.log('Settings loaded and store initialized.')
})

app.mount('#app')
