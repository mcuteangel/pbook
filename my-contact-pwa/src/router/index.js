import { createRouter, createWebHistory } from 'vue-router'
// مسیر import کامپوننت‌ها رو اصلاح کن!
// import ContactList from '../components/ContactList.vue' // <-- در components هست
// import GroupManager from '../components/GroupManager.vue' // <-- در components هست
// import ContactForm from '../components/ContactForm.vue' // <-- در components هست
// کامپوننت جزئیات درسته
// import ContactDetail from '../views/ContactDetail.vue' // <-- در views هست
// import CustomFieldManager from '../components/CustomFieldManager.vue'; // یا مسیر صحیح اگر در views هست
// import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // استفاده از BASE_URL

  // ... history و سایر routes
  routes: [
    // ... بقیه route ها
    {
      path: '/custom-fields',
      name: 'custom-field-manager',
      component: () => import('../components/CustomFieldManager.vue'),
    },

    {
      path: '/', // مسیر ریشه
      name: 'contact-list', // اسم مسیر
      component: () => import('../components/contact/ContactList.vue'), // کامپوننت مربوط به این مسیر
    },
    {
      path: '/groups', // مسیر مدیریت گروه‌ها
      name: 'group-manager',
      component: () => import('../components/GroupManager.vue'),
    },
    // Route برای صفحه افزودن مخاطب
    {
      path: '/add',
      name: 'add-contact',
      component: () => import('../components/ContactForm.vue'), // نمایش کامپوننت فرم
      // نیازی به props: true اینجا نیست چون برای افزودن ID در مسیر نداریم
    },
    // Route برای نمایش جزئیات مخاطب
    {
      path: '/contact/:id', // مسیر با پارامتر ID مخاطب
      name: 'contact-detail', // اسم مسیر
      component: () => import('../views/ContactDetail.vue'), // نمایش کامپوننت جزئیات
      props: true, // این گزینه باعث میشه پارامترهای مسیر (مثل id) به عنوان props به کامپوننت ContactDetail ارسال بشن (اختیاری ولی خوبه)
    },

    {
      path: '/settings', // آدرسی که می‌خوایم صفحه تنظیمات باهاش باز بشه
      name: 'settings', // یه اسم منحصر به فرد برای این مسیر (مفید برای ناوبری با نام)
      component: () => import('../views/SettingsView.vue'), // کامپوننتی که باید برای این مسیر نمایش داده بشه
    },
    // می‌تونی Routes دیگه هم اینجا اضافه کنی
  ],
})

export default router
