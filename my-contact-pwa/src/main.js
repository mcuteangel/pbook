import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import NotificationService from '@/services/notification.service'
import './assets/styles/theme.css'
import './assets/styles/glassmorphism.css'
import './assets/styles/common-components.css'

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faMagnifyingGlass,
  faArrowUpAZ,
  faSliders,
  faChevronDown,
  faChevronUp,
  faList,
  faCheck,
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
  faFax,
  faArrowRight,
  faArrowLeft,
  faCircle,
  faInfoCircle,
  faSpinner,
  faAddressBook,
  faExclamationCircle,
  faCalendarAlt,
  faTimes,
  faAngleLeft,
  faAngleRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
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
  faFax,
  faArrowRight,
  faArrowLeft,
  faCircle,
  faInfoCircle,
  faSpinner,
  faAddressBook,
  faExclamationCircle,
  faChevronUp,
  faList,
  faCheck,
  faCalendarAlt,
  faTimes,
  faAngleLeft,
  faAngleRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
)

import { useSettingsStore } from './store/settings'

const app = createApp(App)
const pinia = createPinia()

// Configure Vue to reduce console logs and warnings
app.config.productionTip = false
app.config.silent = true
app.config.warnHandler = () => {} // Disable Vue warnings

// نصب پلاگین‌های اصلی
app.use(pinia)
app.use(router)
app.use(i18n)

// نصب پلاگین toastification
const toastOptions = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: true,
  transition: 'Vue-Toastification__fade',
  maxToasts: 5,
  newestOnTop: true
}

app.use(Toast, toastOptions)

// نصب سرویس اعلان‌های اختصاصی
app.use(NotificationService)

// کامپوننت‌های سراسری
app.component('font-awesome-icon', FontAwesomeIcon)

const settingsStore = useSettingsStore(pinia)
settingsStore.loadSettings().then(() => {
  console.log('Settings loaded and store initialized.')
})

app.mount('#app')
