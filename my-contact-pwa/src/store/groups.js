import { defineStore } from 'pinia';
import { db } from '../db'; // نمونه دیتابیس Dexie مون رو وارد می‌کنیم

// تعریف یک Store جدید با اسم منحصر به فرد 'groupStore'
export const useGroupStore = defineStore('groupStore', {
  // ---------- State: وضعیت گروه‌ها ----------
  state: () => ({
    groups: [], // آرایه‌ای برای نگهداری گروه‌ها
    loading: false, // وضعیت لودینگ اطلاعات گروه‌ها
    error: null, // برای نگهداری پیام خطا
  }),

  // ---------- Getters: برای دسترسی راحت به داده‌های پردازش شده ----------
  getters: {
    // Getter برای دریافت لیست گروه‌ها مرتب شده بر اساس الفبا
    sortedGroups: (state) => {
      const sorted = [...state.groups]; // از لیست گروه‌ها کپی می‌گیریم
      sorted.sort((a, b) => {
        // مرتب‌سازی بر اساس نام گروه با استفاده از localeCompare برای الفبای فارسی
        return String(a.name || '').localeCompare(String(b.name || ''), 'fa', { sensitivity: 'base' });
      });
      return sorted; // لیست گروه‌های مرتب شده رو برمی‌گردونیم
    },
  },

  // ---------- Actions: برای انجام عملیات غیرهمزمان و تغییر State ----------
  actions: {
    // اکشن برای خواندن همه گروه‌ها از دیتابیس
    async loadGroups() {
      this.loading = true;
      this.error = null;
      try {
        // از Dexie برای خواندن همه آیتم‌ها از استور 'groups' استفاده می‌کنیم
        const allGroups = await db.groups.toArray();
        console.log('گروه‌ها با موفقیت از دیتابیس خوانده شدند:', allGroups);
        // اطلاعات خوانده شده رو توی State ذخیره می‌کنیم
        this.groups = allGroups;

      } catch (error) {
        console.error('خطا در خواندن گروه‌ها:', error);
        this.error = 'امکان خواندن گروه‌ها وجود ندارد.';
      } finally {
        this.loading = false;
      }
    },

    // اکشن برای افزودن یک گروه جدید
    async addGroup(groupName) {
        if (!groupName || groupName.trim() === '') {
            this.error = 'نام گروه نمی‌تواند خالی باشد.';
            return;
        }

        // چک می‌کنیم گروه با این اسم قبلاً وجود نداشته باشه (چون توی schema هم Unique گذاشتیم، ولی اینجا هم چک می‌کنیم)
        const existingGroup = this.groups.find(group => group.name === groupName.trim());
        if (existingGroup) {
            this.error = `گروهی با نام "${groupName.trim()}" قبلاً وجود دارد.`;
            return;
        }


        this.loading = true;
        this.error = null;

        try {
            // از Dexie برای اضافه کردن گروه جدید به استور 'groups' استفاده می‌کنیم
            const id = await db.groups.add({ name: groupName.trim() });
            console.log('گروه با موفقیت اضافه شد، ID:', id);

            // بعد از اضافه کردن موفقیت‌آمیز، لیست گروه‌ها رو دوباره لود می‌کنیم
            await this.loadGroups();
            // می‌تونستیم آیتم جدید رو به آرایه this.groups هم اضافه کنیم، ولی loadContacts ساده‌تره فعلاً

        } catch (error) {
            console.error('خطا در افزودن گروه:', error);
            this.error = 'امکان افزودن گروه وجود ندارد.';
             // اگه خطا مربوط به Unique بودن نام در Dexie باشه، پیام خطا خودش واضح خواهد بود
        } finally {
            this.loading = false;
        }
    },

    // اکشن‌های دیگه برای حذف، ویرایش گروه (بعداً پیاده‌سازی میشن)
    async deleteGroup(groupId) { /* ... */ },
    async updateGroup(groupId, newName) { /* ... */ },
  }
});