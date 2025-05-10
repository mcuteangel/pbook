import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
    vue(),
    VitePWA({ // <-- پیکربندی پایه پلاگین PWA
      registerType: 'autoUpdate', // به محض اینکه سرویس ورکر جدیدی آماده بشه، به طور خودکار آپدیت می‌کنه
      devOptions: {
        enabled: true // این گزینه مهمه تا بتونی توی حالت dev هم سرویس ورکر رو تست کنی
      },
      manifest: { // اینجا تنظیمات Web App Manifest رو انجام میدیم
        name: 'دفترچه تلفن پیشرفته', // اسم کامل برنامه
        short_name: 'دفترچه تلفن', // اسم کوتاه (مثلاً برای زیر آیکون)
        description: 'یک برنامه پیشرفته برای مدیریت مخاطبین با قابلیت آفلاین و تاریخ شمسی', // توضیحات برنامه
        theme_color: '#4DBA87', // رنگ تم اصلی (مثلاً برای نوار عنوان در اندروید)
        background_color: '#ffffff', // رنگ پس‌زمینه موقع لود شدن برنامه (splash screen)
        display: 'standalone', // نحوه نمایش برنامه (standalone یعنی مثل یه اپ جدا، بدون UI مرورگر)
        scope: '/', // محدوده ای که PWA کنترل می‌کنه (معمولاً ریشه سایت)
        start_url: '/', // صفحه‌ای که موقع باز شدن PWA از صفحه اصلی لود میشه
        icons: [ // لیست آیکون‌ها در سایزهای مختلف
          {
            src: 'img/icons/pwa-192x192.png', // مسیر آیکون نسبت به پوشه public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'img/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'img/icons/pwa-512x512.png', // آیکون برای iOS (apple-touch-icon)
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any' // قبلا maskable بود، any هم برای سازگاری بیشتر خوبه
          },
          {
            src: 'img/icons/maskable-icon-512x512.png', // آیکون maskable برای اندروید که شکلش با تم گوشی هماهنگ میشه
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: { // تنظیمات Workbox برای Service Worker
        globPatterns: ['**/*.{js,css,html,ico,png,svg,vue,woff,woff2,ttf,eot,json,webmanifest}'], // فایل‌هایی که باید توسط سرویس ورکر کش بشن
        // runtimeCaching: [ // این بخش رو بعداً برای کش کردن داده‌های API (در اینجا IndexedDB) کامل می‌کنیم
        //   {
        //     urlPattern: ({ url }) => url.pathname.startsWith('/api'), // برای مثال
        //     handler: 'NetworkFirst',
        //     options: {
        //       cacheName: 'api-cache',
        //       expiration: {
        //         maxEntries: 10,
        //         maxAgeSeconds: 60 * 60 * 24 // 1 روز
        //       }
        //     }
        //   }
        // ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
