
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import VuePersianDatetimePicker from 'vue3-persian-datetime-picker'; // ** وارد کردن کامپوننت تاریخ‌انتخاب‌کن شمسی **

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// رجیستر کردن آیکون‌های Element Plus به صورت سراسری
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// ** رجیستر کردن کامپوننت تاریخ‌انتخاب‌کن شمسی به صورت سراسری **
app.component('VuePersianDatetimePicker', VuePersianDatetimePicker);


app.mount('#app')