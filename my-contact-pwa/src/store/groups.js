import { defineStore } from 'pinia';
import { db } from '../db'; // نمونه دیتابیس Dexie مون رو وارد می‌کنیم
import { useContactStore } from './contacts'; // <-- Store مخاطبین رو وارد می‌کنیم
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
// اکشن جدید: حذف گروه و به‌روزرسانی مخاطبین مرتبط
async deleteGroup(groupId) {
  this.loading = true;
  this.error = null;

  // برای دسترسی به Storeهای دیگه در Pinia، داخل Actions می‌تونیم از متد this.$डून() استفاده کنیم
  // این متد Store مورد نظر رو برمی‌گردونه
  const contactStore = useContactStore(); // <-- دسترسی به Store مخاطبین

  try {
      // گام 1: پیدا کردن و به‌روزرسانی مخاطبین مرتبط با این گروه
      // از Dexie برای پیدا کردن همه مخاطبینی که فیلد groupشون برابر اسم این گروهه استفاده می‌کنیم
      // اول اسم گروه رو پیدا می‌کنیم چون مخاطبین اسم گروه رو ذخیره می‌کنن نه ID
      const groupToDelete = this.groups.find(group => group.id === groupId);
      if (!groupToDelete) {
           this.error = 'گروه مورد نظر برای حذف یافت نشد.';
           return;
      }
      const groupName = groupToDelete.name;

      // پیدا کردن همه مخاطبین با این اسم گروه در دیتابیس
      const contactsInGroup = await db.contacts.where('group').equals(groupName).toArray();
      console.log(`پیدا شد ${contactsInGroup.length} مخاطب در گروه "${groupName}"`);

      // به‌روزرسانی فیلد group این مخاطبین به null یا رشته خالی
      // از Dexie bulkPut یا transaction برای به‌روزرسانی بهینه استفاده می‌کنیم
      const updates = contactsInGroup.map(contact => ({
           ...contact, // کپی بقیه اطلاعات مخاطب
           group: null // فیلد گروه رو خالی می‌کنیم
      }));

      if (updates.length > 0) {
           // با استفاده از transaction و bulkPut به صورت اتمیک و سریع به‌روز می‌کنیم
           await db.transaction('rw', db.contacts, async () => {
               await db.contacts.bulkPut(updates);
               console.log(`${updates.length} مخاطب مرتبط با گروه "${groupName}" به‌روزرسانی شدند.`);

               // همچنین باید State مخاطبین رو هم توی contactStore به‌روز کنیم
               // بهترین راه اینه که یا loadContacts رو صدا بزنیم یا آیتم‌های به‌روز شده رو توی آرایه contacts در State پیدا کنیم و تغییر بدیم
               // صدا زدن loadContacts ساده‌تره فعلاً، مخصوصاً اگه تعداد مخاطبین زیاد نباشه
               await contactStore.loadContacts(); // <-- لود مجدد لیست مخاطبین برای به‌روزرسانی UI

           });
      } else {
          console.log(`هیچ مخاطبی در گروه "${groupName}" یافت نشد.`);
      }


      // گام 2: حذف خود گروه از دیتابیس
      await db.groups.delete(groupId);
      console.log(`گروه با موفقیت حذف شد، ID: ${groupId}, Name: "${groupName}"`);

      // گام 3: به‌روزرسانی State گروه‌ها
      // ساده‌ترین راه اینه که لیست گروه‌ها رو دوباره از دیتابیس لود کنیم
      await this.loadGroups(); // <-- لود مجدد لیست گروه‌ها برای به‌روزرسانی UI


  } catch (error) {
      console.error('خطا در حذف گروه:', error);
      this.error = 'امکان حذف گروه وجود ندارد.';
  } finally {
      this.loading = false;
  }
    },
    async updateGroup(groupId, newName) { /* ... */ },
  }
});