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
    // اینجا میتونیم تنظیمات دیگه مثل تم، زبان و ... رو هم اضافه کنیم
    // theme: 'light',
  }),
  getters: {
    // Getter برای دریافت لیست ستون‌هایی که باید نمایش داده بشن
    getDisplayColumns: (state) => state.displayColumns,
    // Getter برای دریافت وضعیت لودینگ
    getIsLoading: (state) => state.isLoading,
    // Getter برای دریافت کل تنظیمات (اگر لازم باشه)
    getAllSettings: (state) => ({
        displayColumns: state.displayColumns,
        // theme: state.theme,
    }),
  },
  actions: {
    // Action برای تنظیم ستون‌های نمایشی و ذخیره آن‌ها
    async setDisplayColumns(columns) {
      this.displayColumns = columns;
      // بعد از تغییر وضعیت، تنظیمات رو در دیتابیس ذخیره می‌کنیم
      await this.saveSettings();
      console.log('Display columns updated in store and save requested:', columns);
    },

    // Action برای ذخیره کل تنظیمات جاری در دیتابیس
  async saveSettings() {
    try {
      // ** استفاده از spread syntax برای ساختن یک کپی ساده (Plain) از آرایه Reactive **
      await db.settings.put({
        id: 'appSettings',
        displayColumns: [...this.displayColumns], // <-- اینجا تغییرش دادیم
        // هر تنظیمات دیگه‌ای که به state اضافه می‌کنی رو اینجا هم باید ذخیره کنی
        // theme: this.theme,
      });
      console.log('Settings saved to IndexedDB');
    } catch (error) {
      // لاگ کردن کامل خطا برای debugging
      console.error('Failed to save settings:', error);
      // می‌توانید اینجا یه پیام خطا هم به کاربر نشون بدی
    }
  },
    // Action برای بارگذاری تنظیمات از دیتابیس هنگام شروع برنامه
  async loadSettings() {
    this.isLoading = true; // شروع لودینگ
    try {
      // تلاش برای خواندن رکورد تنظیمات با id 'appSettings'
      const settings = await db.settings.get('appSettings');

      if (settings) {
        // اگر تنظیمات در دیتابیس پیدا شد، وضعیت Store رو با اون آپدیت می‌کنیم
        console.log('Settings loaded from IndexedDB:', settings);
        // مطمئن میشیم فقط پراپرتی‌هایی رو آپدیت می‌کنیم که توی شیء خونده شده وجود دارن
        if (settings.displayColumns !== undefined) {
           // ** استفاده از spread syntax برای اطمینان از اینکه آرایه Reactive Pinia با یک آرایه Plain از دیتابیس پر میشه **
           this.displayColumns = [...settings.displayColumns]; // <-- اینجا هم کپی می‌گیریم
        }
        // اگر تنظیمات دیگه ای داشتی هم اینجا باید آپدیتشون کنی
        // if (settings.theme !== undefined) {
        //   this.theme = settings.theme;
        // }
      } else {
         // اگر رکوردی با id 'appSettings' پیدا نشد (اولین بار یا بعد از حذف دیتابیس)
         // وضعیت پیش‌فرض که توی state تعریف شده استفاده میشه.
         console.log('No existing settings record found in IndexedDB. Using default state.');
         // ** نکته مهم: حالا تنظیمات پیش‌فرض رو بلافاصله در دیتابیس ذخیره می‌کنیم تا رکوردش ساخته بشه **
         // این کار اطمینان میده که در اجراهای بعدی، رکورد پیدا میشه.
         // چون در saveSettings هم از put استفاده میکنیم، اگه upgrade هم همزمان رکورد رو اضافه کنه، تداخلی پیش نمیاد.
         await this.saveSettings(); // <-- صدا زدن saveSettings برای ایجاد رکورد پیش فرض
         console.log('Default settings saved to IndexedDB on first load.'); // لاگ اضافه
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      // اگر خطایی در لود کردن پیش اومد، وضعیت پیش‌فرض حفظ میشه
    } finally {
      this.isLoading = false; // پایان لودینگ
    }
  },
    // Action اختیاری برای برگرداندن تنظیمات به حالت پیش‌فرض
    resetToDefaults() {
       // تنظیم state به مقادیر پیش‌فرض اولیه
       this.$reset(); // Pinia's built-in method to reset state to initial value
       // سپس این وضعیت پیش‌فرض رو هم ذخیره می‌کنیم
       this.saveSettings();
       console.log('Settings reset to defaults and save requested');
    }
  },
});