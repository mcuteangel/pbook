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

    </div>
</template>

<script setup>
// تابع exportData رو که توی فایل utility ساختیم اینجا ایمپورت می‌کنیم
import { exportData } from '@/utils/backupRestore';

// تابع async برای مدیریت کلیک روی دکمه Export
const handleExport = async () => {
  try {
    // 1. داده‌ها رو به صورت رشته JSON از تابع exportData می‌گیریم
    const jsonData = await exportData();

    // 2. یه "Blob" (یه جور شیء برای نگهداری داده‌های باینری یا متنی توی حافظه مرورگر) از رشته JSON می‌سازیم
    // نوع MIME رو 'application/json' میذاریم که مرورگر بفهمه این یه فایل JSON هست
    const blob = new Blob([jsonData], { type: 'application/json' });

    // 3. یه URL موقتی برای این Blob توی مرورگر می‌سازیم
    // این URL شبیه فایل عمل می‌کنه و میشه ازش دانلود کرد
    const url = URL.createObjectURL(blob);

    // 4. یه عنصر <a> (لینک) به صورت موقت توی DOM می‌سازیم
    const link = document.createElement('a');
    link.href = url; // آدرس لینک رو URL موقتی Blob میذاریم

    // 5. اسم فایل دانلودی رو مشخص می‌کنیم
    // با اضافه کردن timestamp، اسم فایل هر بار یونیک میشه
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // مثلاً 2023-10-27T10-30-00-000Z
    link.download = `contacts_backup_${timestamp}.json`; // اسم فایل دانلودی

    // 6. لینک رو به صورت مخفی به بدنه صفحه اضافه می‌کنیم و روش کلیک می‌کنیم تا دانلود شروع بشه
    // این روش تضمین می‌کنه که دانلود توی همه مرورگرها کار کنه
    document.body.appendChild(link); // اضافه کردن به DOM (ممکنه ضروری نباشه ولی ایمن تره)
    link.click(); // کلیک کردن روی لینک برای شروع دانلود

    // 7. بعد از یه مکث کوتاه، URL موقتی و عنصر لینک رو پاک می‌کنیم
    // این کار حافظه مرورگر رو آزاد می‌کنه و از شلوغ شدن DOM جلوگیری می‌کنه
    // مکث کوتاه برای اینه که مرورگر فرصت کنه دانلود رو شروع کنه قبل از پاک شدن URL
    setTimeout(() => {
      URL.revokeObjectURL(url); // پاک کردن URL موقتی
      link.remove(); // پاک کردن عنصر لینک از DOM
    }, 100); // 100 میلی‌ثانیه مکث

    console.log('Export file download initiated.');

  } catch (error) {
    // در صورت بروز خطا، پیام رو توی کنسول لاگ می‌کنیم و به کاربر نشون میدیم
    console.error('Error during export:', error);
    alert('خطا در تهیه فایل پشتیبان: ' + error.message);
  }
};

// تابع handleImport رو بعداً برای بخش Import اضافه خواهیم کرد
// const handleImport = (event) => { ... };
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

/* استایل برای input type="file" که بعداً اضافه می‌کنیم */
.settings-container input[type="file"] {
    margin-top: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #fff;
    cursor: pointer; /* اضافه کردن این برای ظاهر بهتر */
}
</style>