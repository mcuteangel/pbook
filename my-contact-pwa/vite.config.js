import { fileURLToPath, URL } from 'node:url'
import path from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('-'),
        },
      },
    }),
    vueDevTools(),
    VitePWA({
      // <-- پیکربندی پایه پلاگین PWA
      registerType: 'autoUpdate', // به محض اینکه سرویس ورکر جدیدی آماده بشه، به طور خودکار آپدیت می‌کنه
      devOptions: {
        enabled: true, // این گزینه مهمه تا بتونی توی حالت dev هم سرویس ورکر رو تست کنی
        logLevel: 'warn', // تنها هشدارها و خطاهای مهم نمایش داده می‌شوند
        navigateFallback: null, // غیرفعال کردن fallback برای navigation
      },
      manifest: {
        // اینجا تنظیمات Web App Manifest رو انجام میدیم
        name: 'دفترچه تلفن پیشرفته', // اسم کامل برنامه
        short_name: 'دفترچه تلفن', // اسم کوتاه (مثلاً برای زیر آیکون)
        description: 'یک برنامه پیشرفته برای مدیریت مخاطبین با قابلیت آفلاین و تاریخ شمسی', // توضیحات برنامه
        theme_color: '#4DBA87', // رنگ تم اصلی (مثلاً برای نوار عنوان در اندروید)
        background_color: '#ffffff', // رنگ پس‌زمینه موقع لود شدن برنامه (splash screen)
        display: 'standalone', // نحوه نمایش برنامه (standalone یعنی مثل یه اپ جدا، بدون UI مرورگر)
        scope: '/', // محدوده ای که PWA کنترل می‌کنه (معمولاً ریشه سایت)
        start_url: '/', // صفحه‌ای که موقع باز شدن PWA از صفحه اصلی لود میشه
        icons: [
          // لیست آیکون‌ها در سایزهای مختلف
          {
            src: 'img/icons/pwa-192x192.png', // مسیر آیکون نسبت به پوشه public
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'img/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'img/icons/pwa-512x512.png', // آیکون برای iOS (apple-touch-icon)
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any', // قبلا maskable بود، any هم برای سازگاری بیشتر خوبه
          },
          {
            src: 'img/icons/maskable-icon-512x512.png', // آیکون maskable برای اندروید که شکلش با تم گوشی هماهنگ میشه
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        skipWaiting: true, // Skip waiting for existing clients to be updated
        clientsClaim: true, // Take control of clients immediately
        runtimeCaching: [
          // استراتژی برای استایل‌ها
          {
            urlPattern: ({ request }) => request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'styles-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
            },
          },
          // استراتژی برای تصاویر براساس destination
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          // استراتژی برای تصاویر: اول کش، بعد شبکه
          // برای فایل‌های تصویری که به صورت داینامیک هم لود میشن یا از public میان
          {
            urlPattern: /\.(?:png|gif|jpg|jpeg|svg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 روز
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // استراتژی برای فونت‌ها: اول کش، بعد شبکه
            // خیلی شبیه تصاویر، چون فونت‌ها هم معمولاً تغییر نمی‌کنن
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/, // Regex برای فایل‌های فونت
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 24 * 60 * 60, // 60 روز اعتبار کش
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // استراتژی برای فایل‌های JS و CSS (مخصوصاً chunk ها یا فایل‌هایی که از CDN میان)
            // `globPatterns` فایل‌های اصلی js/css رو precache می‌کنه.
            // این برای حالتیه که بخوایم کنترل بیشتری روی runtime داشته باشیم یا برای فایل‌های خارج از precache.
            // StaleWhileRevalidate انتخاب خوبیه: سریع از کش میده، در پس‌زمینه آپدیت می‌کنه.
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 24 * 60 * 60, // 1 روز، چون این فایل‌ها ممکنه بیشتر آپدیت بشن
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // استراتژی برای ناوبری (HTML) - برای معماری SPA مهمه
            // این تضمین می‌کنه که خود اپ همیشه در دسترسه، حتی آفلاین
            // `index.html` ما توسط globPatterns پیش‌کش شده، اما این قاعده برای اطمینان بیشتره
            // و همچنین برای زمانی که از سرور، HTML های مختلفی برای مسیرهای مختلف میومد (که اینجا اینطور نیست)
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'navigation-cache',
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      dexie: 'dexie/dist/dexie.mjs',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'vue-i18n'],
          'moment-vendor': ['moment-jalaali'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'vue-i18n', 'moment-jalaali'],
    exclude: ['vue-persian-datetime-picker', 'dexie'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/__tests__/*.test.js'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
  },
})
