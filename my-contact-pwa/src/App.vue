<template>
  <div>
    <header class="app-header">
      <h1>برنامه مدیریت مخاطبین</h1>
      <nav>
        <RouterLink :to="{ name: 'contact-list' }" active-class="active-link">
          لیست مخاطبین
        </RouterLink>
        <RouterLink :to="{ name: 'group-manager' }" active-class="active-link">
          مدیریت گروه‌ها
        </RouterLink>
        <RouterLink :to="{ name: 'add-contact' }" active-class="active-link">
          افزودن مخاطب جدید
        </RouterLink>
        <RouterLink :to="{ name: 'custom-field-manager' }" active-class="active-link">
          مدیریت فیلدهای سفارشی
        </RouterLink>
        <RouterLink :to="{ name: 'settings' }" active-class="active-link">
          تنظیمات
        </RouterLink>
      </nav>
    </header>

    <hr />

    <RouterView></RouterView>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
// ایمپورت کردن از @ که به src اشاره داره، روش استاندارد Vite/Vue هست
import { useContactStore } from '@/store/contacts'
import { useGroupStore } from '@/store/groups'
import { useCustomFieldStore } from '@/store/customFields';


const contactStore = useContactStore()
const groupStore = useGroupStore()
const customFieldStore = useCustomFieldStore();


// لود کردن اطلاعات اولیه در زمان mount شدن برنامه
onMounted(async () => {
  console.log('App mounted, loading data...');
  await contactStore.loadContacts();
  await groupStore.loadGroups();
  await customFieldStore.loadFieldDefinitions();
  console.log('Loading finished.');
});
</script>

<style scoped>
/* استایل‌های بهبود یافته برای هدر و ناوبری */
.app-header {
  background-color: #f8f9fa; /* رنگ پس‌زمینه روشن برای هدر */
  padding: 15px 20px; /* فاصله داخلی */
  border-bottom: 1px solid #e7e7e7; /* خط جداکننده پایین هدر */
  display: flex; /* استفاده از فلکس‌باکس برای چیدمان افقی */
  justify-content: space-between; /* پخش کردن عناصر با فاصله مساوی */
  align-items: center; /* تراز عمودی عناصر در وسط */
  flex-wrap: wrap; /* اجازه شکست خط در صفحات کوچک */
  gap: 10px; /* فاصله بین آیتم‌های فلکس (عنوان و nav) */
}

.app-header h1 {
  margin: 0; /* حذف margin پیش‌فرض h1 */
  font-size: 1.6em; /* اندازه فونت عنوان */
  color: #333; /* رنگ عنوان */
}

.app-header nav {
  display: flex; /* استفاده از فلکس‌باکس برای لینک‌های ناوبری */
  gap: 20px; /* فاصله بین لینک‌ها */
  flex-wrap: wrap; /* اجازه شکست خط لینک‌ها */
  padding: 0; /* حذف padding پیش‌فرض nav */
  margin: 0; /* حذف margin پیش‌فرض nav */
}

.app-header nav a {
  text-decoration: none; /* حذف خط زیر لینک */
  color: #007bff; /* رنگ اصلی لینک */
  font-weight: bold; /* فونت پررنگ */
  padding-bottom: 3px; /* فاصله برای خط زیر فعال */
  border-bottom: 2px solid transparent; /* خط زیر نامرئی برای انیمیشن */
  transition: color 0.2s ease, border-bottom-color 0.2s ease; /* انیمیشن برای تغییر رنگ و خط زیر */
}

.app-header nav a:hover {
  color: #0056b3; /* رنگ لینک در حالت هاور */
  border-bottom-color: #0056b3; /* نمایش خط زیر در حالت هاور */
}

.app-header nav a.active-link {
  color: #0056b3; /* رنگ لینک فعال */
  border-bottom-color: #007bff; /* رنگ خط زیر لینک فعال */
}

/* اضافه کردن padding به محتوای اصلی صفحه برای فاصله با هدر */
.app-main {
  padding: 20px;
}

/* اگر hr رو نگه داشتی، می‌تونی استایلشو اینجا تنظیم کنی */
hr {
  margin: 0; /* حذف margin پیش‌فرض hr */
  border: none;
  border-top: 1px solid #e7e7e7; /* خط هم‌رنگ با border هدر */
}

</style>