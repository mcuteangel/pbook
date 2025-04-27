<template>
  <div>
    <h1>برنامه مدیریت مخاطبین</h1>
    <ContactForm />
    <hr>
    <ContactList />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import ContactForm from './components/ContactForm.vue';
import ContactList from './components/ContactList.vue';
import { useContactStore } from './store/contacts';
import { useGroupStore } from './store/groups'; // Store گروه‌ها رو وارد می‌کنیم


const contactStore = useContactStore();
const groupStore = useGroupStore(); // نمونه از Store گروه‌ها می‌سازیم


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
</style>