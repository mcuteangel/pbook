<template>
  <div class="settings-container">
    <h2>تنظیمات و پشتیبان‌گیری</h2>

    <section class="backup-section">
      <h3>پشتیبان‌گیری (Export)</h3>
      <p>برای گرفتن خروجی از تمام مخاطبین، گروه‌ها و فیلدهای سفارشی، روی دکمه زیر کلیک کنید.</p>
      <button @click="handleExport">
        دریافت فایل پشتیبان (JSON)
      </button>
    </section>

    <section class="restore-section">
      <h3>بازیابی (Import)</h3>
      <p>برای بازیابی اطلاعات از فایل پشتیبان JSON، فایل مورد نظر را انتخاب کنید.</p>
      <input type="file" accept=".json" @change="handleImport">
      </section>
  </div>
</template>

<script setup>
import { exportData } from '@/utils/backupRestore';
import { importData } from '@/utils/backupRestore';
import { useContactStore } from '@/store/contacts';
import { useGroupStore } from '@/store/groups';
import { useCustomFieldStore } from '@/store/customFields';

// گرفتن نمونه استورها برای صدا زدن تابع لود بعد از Import
const contactStore = useContactStore();
const groupStore = useGroupStore();
const customFieldStore = useCustomFieldStore();


// تابع async برای مدیریت کلیک روی دکمه Export
const handleExport = async () => {
  try {
    // ... منطق Export ...
    const jsonData = await exportData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `contacts_backup_${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      link.remove();
    }, 100);
    console.log('Export file download initiated.');
  } catch (error) {
    console.error('Error during export:', error);
    alert('خطا در تهیه فایل پشتیبان: ' + error.message);
  }
};

// **تابع مدیریت انتخاب فایل Import - حالا با قابلیت خواندن محتوا**
const handleImport = async (event) => {
  console.log('فایلی برای بازیابی انتخاب شد.');
  const file = event.target.files[0]; // گرفتن اولین فایل انتخاب شده

  if (!file) {
    console.log('فایلی انتخاب نشد.');
    return; // اگر فایلی انتخاب نشده، کاری انجام نمیشه
  }

  console.log('فایل انتخاب شده:', file.name, file.type, file.size, 'بایت');

  // **یک چک ساده برای اینکه مطمئن بشیم فرمت فایل JSON هست**
  if (file.type !== 'application/json') {
      alert('لطفاً یک فایل با فرمت JSON انتخاب کنید.');
      // input رو ریست می‌کنیم تا بشه دوباره فایل انتخاب کرد بعد از خطا
      event.target.value = null;
      return;
  }


  // **ایجاد یک نمونه FileReader جدید**
  const reader = new FileReader();

  // **تعریف تابعی که وقتی FileReader فایل رو با موفقیت خوند، اجرا میشه**
reader.onload = async (e) => {
    const fileContent = e.target.result; // محتوای فایل به صورت رشته JSON

    console.log('محتوای فایل با موفقیت خوانده شد. در حال پارس کردن JSON...');

    let importedData = null;
    try {
      // **1. پارس کردن رشته JSON به یک شیء جاوااسکریپت**
      importedData = JSON.parse(fileContent);
      console.log('JSON با موفقیت پارس شد.');
      // console.log('Parsed data structure:', importedData); // میتونی ساختارش رو اینجا ببینی


      // **2. اعتبارسنجی ساختار کلی داده‌های پارس شده**
      // چک می‌کنیم که شیء اصلی و پراپرتی‌های اصلی (version, data, data.contacts, ...) وجود داشته باشن
      // و همچنین ورژن فرمت رو چک می‌کنیم
      if (
          !importedData || // شیء خالی نباشه
          typeof importedData !== 'object' || // حتماً شیء باشه
          importedData.version !== 1 || // ورژن فرمت Export رو چک می‌کنیم (ورژن ۱)
          !importedData.data || // پراپرتی data وجود داشته باشه
          typeof importedData.data !== 'object' || // پراپرتی data شیء باشه
          !Array.isArray(importedData.data.contacts) || // contacts توی data آرایه باشه
          !Array.isArray(importedData.data.customFieldDefinitions) || // customFieldDefinitions آرایه باشه
          !Array.isArray(importedData.data.groups) // groups آرایه باشه
      ) {
          // اگر ساختار معتبر نبود، یک خطا پرتاب می‌کنیم
          throw new Error('ساختار فایل پشتیبان نامعتبر است.');
      }

      console.log('ساختار فایل پشتیبان معتبر است. در حال وارد کردن داده‌ها به دیتابیس...');

      // **حالا تابع importData رو صدا می‌زنیم و منتظر می‌مونیم تا کارش تموم بشه**
      await importData(importedData.data);

      console.log('بازیابی اطلاعات دیتابیس با موفقیت انجام شد.');

      // **گام مهم: رفرش کردن داده‌ها در استورهای Pinia برای به‌روزرسانی UI**
      // بعد از اینکه اطلاعات جدید وارد دیتابیس شد، باید استورها رو صدا بزنیم
      // تا داده‌های جدید رو از دیتابیس بخونن و توی UI نمایش بدن.
      console.log('Reloading Pinia stores...');
      await contactStore.loadContacts();
      await groupStore.loadGroups();
      await customFieldStore.loadFieldDefinitions();
      console.log('Stores reloaded. UI should update.');


      alert('بازیابی اطلاعات با موفقیت انجام شد!'); // پیام موفقیت نهایی
      
    } catch (error) {
      // اگر در حین پارس کردن JSON یا اعتبارسنجی خطا رخ داد
      console.error('خطا در پردازش یا اعتبارسنجی فایل پشتیبان:', error);
      alert('خطا در پردازش یا اعتبارسنجی فایل پشتیبان: ' + error.message); // پیام خطا به کاربر
    } finally {
      // در نهایت، input رو ریست می‌کنیم تا بتونه دوباره فایل انتخاب کنه
      event.target.value = null;
    }
  };

  // **تعریف تابعی که اگر در حین خواندن فایل خطایی پیش اومد، اجرا میشه**
  reader.onerror = (error) => {
    console.error('خطا در خواندن فایل:', error);
    alert('خطا در خواندن فایل پشتیبان.');
    // input رو هم در صورت خطا ریست می‌کنیم
    event.target.value = null;
  };

  // **شروع عملیات خواندن فایل به صورت متنی**
  // چون فایل JSON ما متنی هست، از readAsText استفاده می‌کنیم
  reader.readAsText(file);

  // **نکته:** می‌تونید اینجا یه وضعیت لودینگ (مثلاً یک Spinners یا پیام) نمایش بدید
  // و input فایل رو غیرفعال کنید تا کاربر دوباره فایل انتخاب نکنه
  // و در توابع onload و onerror اون وضعیت لودینگ رو بردارید و input رو فعال کنید.
};


// ... بقیه script setup و style ...
</script>

<style scoped>
/* استایل‌های پایه برای صفحه تنظیمات */
.settings-container {
  padding: 20px;
  max-width: 600px; /* عرض صفحه رو محدود می‌کنیم برای خوانایی بهتر */
  margin: 20px auto; /* وسط چین کردن صفحه */
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.settings-container h2, .settings-container h3 {
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.backup-section, .restore-section {
  margin-bottom: 30px;
}

.settings-container button {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s ease; /* انیمیشن کوچک برای هاور */
}

.settings-container button:hover {
  background-color: #0056b3;
}

/* استایل برای input type="file" که اضافه کردیم */
.settings-container input[type="file"] {
    margin-top: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #fff;
    cursor: pointer;
    display: block; /* اضافه کردن این خط */
    width: 100%; /* اضافه کردن این خط */
    box-sizing: border-box; /* اضافه کردن این خط */
}
</style>