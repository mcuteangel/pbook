<template>
  <div>
    <h1>برنامه مدیریت مخاطبین</h1>
    <div class="view-switcher">
        <button @click="currentView = 'contacts'" :disabled="currentView === 'contacts'">مدیریت مخاطبین</button>
        <button @click="currentView = 'groups'" :disabled="currentView === 'groups'">مدیریت گروه‌ها</button>
    </div>
    <hr>

    <div v-if="currentView === 'contacts'">
        <ContactForm />
        <hr>
        <ContactList />
    </div>

    <div v-else-if="currentView === 'groups'">
        <GroupManager />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ContactForm from './components/ContactForm.vue';
import ContactList from './components/ContactList.vue';
import GroupManager from './components/GroupManager.vue'; // کامپوننت جدید رو وارد می‌کنیم
import { useContactStore } from './store/contacts';
import { useGroupStore } from './store/groups'; // Store گروه‌ها رو وارد می‌کنیم


const contactStore = useContactStore();
const groupStore = useGroupStore(); // نمونه از Store گروه‌ها می‌سازیم

// متغیر واکنشی برای نگهداری وضعیت صفحه فعلی ('contacts' یا 'groups')
const currentView = ref('contacts'); // پیش‌فرض، صفحه مدیریت مخاطبین

// وقتی کامپوننت App به DOM اضافه شد، مخاطبین و گروه‌ها رو لود کن
onMounted(async () => {
  console.log('App mounted, loading data...');
  await contactStore.loadContacts(); // لود کردن مخاطبین
  await groupStore.loadGroups(); // <-- لود کردن گروه‌ها
  console.log('Loading finished.');
});

</script>

<style scoped>
/* استایل‌های کلی اینجا اضافه میشن */
h1 {
  text-align: center;
  color: #333;
}

hr {
  margin: 30px auto;
  width: 80%;
  border: none;
  border-top: 1px solid #eee;
}
.view-switcher {
    margin: 20px auto;
    max-width: 600px; /* تنظیم عرض بر اساس نیاز */
    text-align: center;
}

.view-switcher button {
     padding: 10px 15px;
     margin: 0 10px;
     cursor: pointer;
     border: 1px solid #007bff;
     border-radius: 4px;
     background-color: #fff;
     color: #007bff;
     transition: background-color 0.3s ease, color 0.3s ease;
}

.view-switcher button:hover:not(:disabled) {
    background-color: #007bff;
    color: white;
}

.view-switcher button:disabled {
     background-color: #007bff;
     color: white;
     cursor: default;
     opacity: 0.7;
}
</style>