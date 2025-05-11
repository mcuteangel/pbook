<template>
  <div>
    <h1>برنامه مدیریت مخاطبین</h1>
    <nav>
      <router-link :to="{ name: 'contact-list' }" active-class="active-link"
        >لیست مخاطبین</router-link
      >
      <router-link :to="{ name: 'group-manager' }" active-class="active-link"
        >مدیریت گروه‌ها</router-link
      >
      <router-link :to="{ name: 'add-contact' }" active-class="active-link"
        >افزودن مخاطب جدید</router-link
      >
      <router-link :to="{ name: 'custom-field-manager' }" active-class="active-link"
        >مدیریت فیلدهای سفارشی</router-link
      >
    </nav>

    <hr />

    <router-view></router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useContactStore } from './store/contacts'
import { useGroupStore } from './store/groups'
import { useCustomFieldStore } from './store/customFields'; // اضافه کن

// دیگه لازم نیست کامپوننت‌های ContactList, ContactForm, GroupManager رو اینجا import کنی
// چون Router اونها رو لود می‌کنه

const contactStore = useContactStore()
const groupStore = useGroupStore()
const customFieldStore = useCustomFieldStore(); // اضافه کن


// منطق دستی نمایش کامپوننت‌ها و متغیر currentView رو حذف می‌کنیم

// اکشن‌های لود اولیه اطلاعات در زمان mount شدن برنامه رو نگه می‌داریم
onMounted(async () => {
  console.log('App mounted, loading data...');
  await contactStore.loadContacts();
  await groupStore.loadGroups();
  await customFieldStore.loadFieldDefinitions(); // اضافه کن
  console.log('Loading finished.');
});
</script>

<style scoped>
/* استایل‌های ساده برای ناوبری */
nav {
  margin-bottom: 20px;
  padding: 0 20px;
  text-align: center;
}

nav a {
  margin: 0 10px;
  text-decoration: none;
  color: #333;
  font-weight: bold;
  padding-bottom: 2px; /* برای فضای خط زیر فعال */
}

nav a:hover {
  color: #007bff;
}

.active-link {
  color: #007bff; /* هایلایت کردن لینک فعال */
  border-bottom: 2px solid #007bff; /* خط زیر برای لینک فعال */
}
</style>
