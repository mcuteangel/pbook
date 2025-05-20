// src/store/settings.js
import { defineStore } from 'pinia';
// ایمپورت کردن instance دیتابیس
import { db } from '@/db';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // تنظیمات نمایش ستون‌ها در لیست مخاطبین
    displayColumns: [
      'name',
      'lastName',
      'phone',
      'gender',
      'group',
    ],
    // وضعیت لودینگ برای نشون دادن اینکه آیا تنظیمات در حال بارگذاری هستن یا نه
    isLoading: false,
    theme: 'light',
  }),
  getters: {
    // Getter برای دریافت لیست ستون‌هایی که باید نمایش داده بشن
    getDisplayColumns: (state) => state.displayColumns,
    // Getter برای دریافت وضعیت لودینگ
    getIsLoading: (state) => state.isLoading,
    // Getter برای دریافت کل تنظیمات (اگر لازم باشه)
    getCurrentTheme: (state) => state.theme,
     
    getAllSettings: (state) => ({
        displayColumns: state.displayColumns,
        theme: state.theme,
    }),
  },
  actions: {
// Helper action (معمولاً با _ شروع میشه) برای اعمال تم به DOM
_applyThemeToDOM(themeValue) {
if (themeValue === 'dark') {
document.documentElement.classList.add('dark');
} else {
document.documentElement.classList.remove('dark');
}
    },
    async setDisplayColumns(columns) {
      this.displayColumns = columns;
      // بعد از تغییر وضعیت، تنظیمات رو در دیتابیس ذخیره می‌کنیم
      await this.saveSettings();
      console.log('Display columns updated in store and save requested:', columns);
    },

    // Action برای ذخیره کل تنظیمات جاری در دیتابیس
 async saveSettings() {
      try {
        await db.settings.put({
          id: 'appSettings',
          displayColumns: [...this.displayColumns],
          theme: this.theme, // <-- 4. ذخیره کردن تم فعلی در دیتابیس
        });
        console.log('Settings (including theme) saved to IndexedDB. Current theme:', this.theme);
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    },
    // Action برای بارگذاری تنظیمات از دیتابیس هنگام شروع برنامه
 async loadSettings() {
      this.isLoading = true;
      let loadedTheme = 'light'; // مقدار پیش‌فرض اولیه برای تم
      try {
        const settings = await db.settings.get('appSettings');

        if (settings) {
          console.log('Settings loaded from IndexedDB:', settings);
          if (settings.displayColumns !== undefined) {
            this.displayColumns = [...settings.displayColumns];
          }
          if (settings.theme !== undefined) { // <-- 5. خوندن تم از دیتابیس
            this.theme = settings.theme;
            loadedTheme = settings.theme; // برای استفاده در _applyThemeToDOM
          }
        } else {
          console.log('No existing settings record found. Using default state and saving defaults.');
          // this.theme از state مقدار 'light' رو داره.
          // displayColumns هم مقدار پیش‌فرض state رو داره.
          await this.saveSettings(); // ذخیره تنظیمات پیش‌فرض (شامل تم 'light')
        }
        
        // اعمال تم خوانده شده (یا پیش‌فرض) به DOM
        this._applyThemeToDOM(this.theme); // یا میتونی از loadedTheme استفاده کنی
        console.log('Theme applied to DOM on load:', this.theme);

      } catch (error) {
        console.error('Failed to load settings:', error);
        // در صورت خطا، تم پیش‌فرض 'light' که در state هست اعمال میشه
        this._applyThemeToDOM('light'); // اطمینان از اعمال تم حتی در صورت خطا
      } finally {
        this.isLoading = false;
      }
    },
 
 async toggleTheme() {
const newTheme = this.theme === 'light' ? 'dark' : 'light';
this.theme = newTheme; // آپدیت وضعیت تم در store
this._applyThemeToDOM(newTheme); // اعمال تم جدید به DOM
await this.saveSettings(); // ذخیره تم جدید در دیتابیس
console.log('Theme toggled to:', newTheme);
},
 
    // Action اختیاری برای برگرداندن تنظیمات به حالت پیش‌فرض
    resetToDefaults() {
      // مقادیر پیش‌فرض اولیه رو مستقیماً ست میکنیم
      this.displayColumns = [
        'name',
        'lastName',
        'phone',
        'gender',
        'group',
      ];
      this.theme = 'light'; // برگرداندن تم به پیش‌فرض

      this._applyThemeToDOM(this.theme); // اعمال تم پیش‌فرض به DOM
      this.saveSettings(); // ذخیره تنظیمات پیش‌فرض
      console.log('Settings reset to defaults (including theme) and save requested');
    }
  },
});