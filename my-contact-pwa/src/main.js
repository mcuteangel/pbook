import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n' // ایمپورت کردن i18n از فایل جدید
import './assets/styles/theme.css'
import './assets/styles/glassmorphism.css'
import './assets/styles/common-components.css' // استایل‌های مشترک کامپوننت‌ها

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faMagnifyingGlass, 
  faArrowUpAZ, 
  faSliders, 
  faChevronDown,
  faSignature,
  faPhone,
  faBriefcase,
  faVenusMars,
  faLayerGroup,
  faUserTie,
  faCakeCandles,
  faLocationDot,
  faNoteSticky,
  faFloppyDisk,
  faTrash,
  faPlus,
  faXmark,
  faChevronLeft,
  faChevronRight,
  faEllipsisVertical,
  faUserPen,
  faUserPlus,
  faUserMinus,
  faUpload,
  faHouse,
  faLink,
  faRoad,
  faCity,
  faMountain,
  faEarthAmericas,
  faBarcode,
  faMobileScreenButton,
  faFax
} from '@fortawesome/free-solid-svg-icons'

// Add icons to the library
library.add(
  faMagnifyingGlass,
  faArrowUpAZ,
  faSliders,
  faChevronDown,
  faSignature,
  faPhone,
  faBriefcase,
  faVenusMars,
  faLayerGroup,
  faUserTie,
  faCakeCandles,
  faLocationDot,
  faNoteSticky,
  faFloppyDisk,
  faTrash,
  faPlus,
  faXmark,
  faChevronLeft,
  faChevronRight,
  faEllipsisVertical,
  faUserPen,
  faUserPlus,
  faUserMinus,
  faUpload,
  faHouse,
  faLink,
  faRoad,
  faCity,
  faMountain,
  faEarthAmericas,
  faBarcode,
  faMobileScreenButton,
  faFax
)

import { useSettingsStore } from '@/store/settings'

const app = createApp(App)
const pinia = createPinia()

// Configure Vue to reduce console logs and warnings
app.config.productionTip = false
app.config.silent = true
app.config.warnHandler = () => {} // Disable Vue warnings

app.use(pinia)
app.use(router)
app.use(i18n) // استفاده از i18n ایمپورت شده
app.component('font-awesome-icon', FontAwesomeIcon) // ثبت کامپوننت آیکون‌ها

const settingsStore = useSettingsStore(pinia)
settingsStore.loadSettings().then(() => {
  console.log('Settings loaded and store initialized.')
})

app.mount('#app')
