import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'
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

import { useSettingsStore } from '@/store/settings'

const app = createApp(App)
const pinia = createPinia()

// Configure Vue to reduce console logs and warnings
app.config.productionTip = false
app.config.silent = true
app.config.warnHandler = () => {} // Disable Vue warnings

app.use(pinia)
app.use(router)
app.use(i18n)
app.component('font-awesome-icon', FontAwesomeIcon)

const settingsStore = useSettingsStore(pinia)
settingsStore.loadSettings().then(() => {
  console.log('Settings loaded and store initialized.')
})

app.mount('#app')
