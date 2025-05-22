import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css' //
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import VuePersianDatetimePicker from 'vue3-persian-datetime-picker'
import './assets/styles/theme.css' // ** اضافه کردن این خط: ایمپورت settingsStore **
import './assets/styles/glassmorphism.css'

import { useSettingsStore } from '@/store/settings'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
// ** حذف این خط: app.use(createPinia()) **
app.use(router)
app.use(ElementPlus)

// ** اینجا استفاده از settingsStore درسته، چون pinia نصب شده و Store ایمپورت شده **
const settingsStore = useSettingsStore(pinia)

// صدا زدن Action loadSettings برای بارگذاری تنظیمات هنگام شروع برنامه
settingsStore.loadSettings().then(() => {
  console.log('Settings loaded and store initialized.')
  // اینجا میتونی کارهای دیگه ای که وابسته به لود شدن تنظیمات هستن انجام بدی
  // مثلاً لود اولیه مخاطبین با فیلتر/مرتب‌سازی پیش‌فرض
})

// رجیستر کردن آیکون‌های Element Plus به صورت سراسری
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// رجیستر کردن کامپوننت تاریخ‌انتخاب‌کن شمسی به صورت سراسری
app.component('VuePersianDatetimePicker', VuePersianDatetimePicker)

app.mount('#app')
