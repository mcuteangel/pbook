<template>
    <div class="contact-detail-container">
      <h2>جزئیات مخاطب</h2>
      <p>اینجا صفحه نمایش جزئیات مخاطب با ID: {{ contactId }} خواهد بود.</p>
  
      <button @click="goBack">برگشت به لیست</button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  // برای دسترسی به route و پارامترها و ناوبری
  import { useRoute, useRouter } from 'vue-router';
  // برای دسترسی به Store مخاطبین و لود اطلاعات
  import { useContactStore } from '../store/contacts';
  
  
  const route = useRoute(); // دسترسی به اطلاعات route فعلی
  const router = useRouter(); // برای ناوبری (مثلاً برگشت به صفحه قبل)
  const contactStore = useContactStore(); // دسترسی به Store مخاطبین
  
  
  const contactId = ref(null); // متغیری برای نگهداری ID مخاطب فعلی
  const contact = ref(null); // متغیری برای نگهداری اطلاعات مخاطب لود شده
  const loading = ref(false); // وضعیت لودینگ این صفحه
  const error = ref(null); // پیام خطا در این صفحه
  
  
  // تابعی برای لود کردن اطلاعات مخاطب بر اساس ID
  const loadContactDetail = async (id) => {
      loading.value = true;
      error.value = null;
      contact.value = null; // اطلاعات قبلی رو پاک می‌کنیم
  
      // چون contactStore قابلیت جستجوی تک آیتم رو نداره،
      // مستقیماً از Dexie استفاده می‌کنیم برای پیدا کردن مخاطب با ID
      try {
          const loadedContact = await db.contacts.get(id); // <--- فرض بر اینه که 'db' در دسترس هست
          if (loadedContact) {
               contact.value = loadedContact;
               console.log('مخاطب با موفقیت برای نمایش جزئیات لود شد:', loadedContact);
          } else {
               error.value = 'مخاطب مورد نظر یافت نشد.';
               console.error('مخاطب با ID', id, 'برای نمایش جزئیات یافت نشد.');
          }
      } catch (err) {
           error.value = 'خطا در بارگذاری جزئیات مخاطب.';
           console.error('خطا در لود جزئیات مخاطب:', err);
      } finally {
           loading.value = false;
      }
  };
  
  // تابعی برای برگشت به صفحه قبل
  const goBack = () => {
      router.back(); // برمی‌گرده به صفحه قبلی (که لیست مخاطبین هست)
  };
  
  
  // وقتی کامپوننت mount میشه یا وقتی ID در route تغییر می‌کنه
  watch(
      () => route.params.id, // مشاهده تغییرات پارامتر 'id' در route
      (newId) => {
          if (newId) {
              contactId.value = newId; // ID رو به‌روز می‌کنیم
              // حالا اطلاعات مخاطب رو بر اساس ID جدید لود می‌کنیم
              // توجه: ID مخاطب در دیتابیس Dexie به صورت Number هست، باید تبدیل کنیم
              loadContactDetail(parseInt(newId));
          } else {
              // اگر ID در route نبود، یعنی وضعیت غیرمنتظره است
               error.value = 'ID مخاطب مشخص نشده است.';
               contactId.value = null;
               contact.value = null;
          }
      },
      { immediate: true } // این باعث میشه Watcher بلافاصله بعد از mount هم اجرا بشه
  );
  
  
  // فرض بر اینه که 'db' در دسترس هست. اگه نبود باید اینجا import بشه
  import { db } from '../db'; // <-- مطمئن شو db اینجا import شده
   // و همچنین import { useRoute, useRouter } from 'vue-router'; و import { useContactStore } from '../store/contacts';
  
  </script>
  
  
  <style scoped>
  .contact-detail-container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .contact-detail-container h2 {
      text-align: center;
      color: #333;
      margin-bottom: 20px;
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;
  }
  
  .contact-detail-container p {
      text-align: center;
      color: #666;
  }
  
  .contact-detail-container button {
      display: block;
      width: auto;
      margin: 20px auto 0;
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1em;
  }
  
  .contact-detail-container button:hover {
      background-color: #0056b3;
  }
  </style>