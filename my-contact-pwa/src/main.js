import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/theme.css'
import './assets/styles/glassmorphism.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { useSettingsStore } from '@/store/settings'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const settingsStore = useSettingsStore(pinia)
settingsStore.loadSettings().then(() => {
  console.log('Settings loaded and store initialized.')
})

app.mount('#app')
