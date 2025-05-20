<template>
  <div class="settings-container">
    <h2>تنظیمات </h2>
  <el-form label-position="top">
  <el-form-item label="تم برنامه">
    <el-switch 
    v-model="isDarkMode"
    active-text="تاریک"
    inactive-text="روشن" />
  </el-form-item>

    <section class="display-settings-section">
      <h3>تنظیمات نمایش لیست مخاطبین</h3>
      <p>ستون‌هایی را که می‌خواهید در لیست اصلی مخاطبین نمایش داده شوند، انتخاب کنید.</p>

      <div v-if="settingsStore.isLoading" class="loading-message">
          در حال بارگذاری تنظیمات...
      </div>

      <el-checkbox-group v-model="settingsStore.displayColumns" @change="handleColumnSelectionChange">
  <el-checkbox
    v-for="column in availableColumns"
    :key="column.value"
    :value="column.value"  border
  >
    {{ column.label }}
  </el-checkbox>
</el-checkbox-group>

      <el-button
        type="info"
        plain
        size="small"
        @click="settingsStore.resetToDefaults"
        class="reset-button"
      >
        بازنشانی به پیش‌فرض
      </el-button>

    </section>

    <section class="backup-section">
      <h3>پشتیبان‌گیری (Export)</h3>
      <p>برای گرفتن خروجی از تمام مخاطبین، گروه‌ها و فیلدهای سفارشی، روی دکمه زیر کلیک کنید.</p>
      <el-button type="primary" @click="handleExport">
        <el-icon><Download /></el-icon>
        دریافت فایل پشتیبان (JSON)
      </el-button>
    </section>

    <section class="restore-section">
      <h3>بازیابی (Import)</h3>
      <p>برای بازیابی اطلاعات از فایل پشتیبان JSON، فایل مورد نظر را انتخاب کنید.</p>
      <input type="file" accept=".json" @change="handleImport">
      </section>

  </el-form>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia'; // برای استفاده از state به صورت Reactive
import { exportData } from '@/utils/backupRestore';
import { importData } from '@/utils/backupRestore';

// ایمپورت Storeهای مورد نیاز
import { useContactStore } from '@/store/contacts';
import { useGroupStore } from '@/store/groups';
import { useCustomFieldStore } from '@/store/customFields';
import { useSettingsStore } from '@/store/settings'; // <-- ایمپورت Store تنظیمات

// گرفتن نمونه استورها
const contactStore = useContactStore();
const groupStore = useGroupStore();
const customFieldStore = useCustomFieldStore();
const settingsStore = useSettingsStore(); // <-- گرفتن نمونه settings Store

const isDarkMode = computed({
    get: () => settingsStore.theme === 'dark',
    set: () => settingsStore.toggleTheme()
  });
// گرفتن تعریف فیلدهای سفارشی به صورت reactive از store
const { fieldDefinitions } = storeToRefs(customFieldStore); // فرض بر این است که fieldDefinitions در customFieldStore وجود دارد

// تعریف لیست ستون‌های استاندارد قابل نمایش با لیبل فارسی و کلید (value)
const standardColumns = [
  { label: 'نام', value: 'name' },
  { label: 'نام خانوادگی', value: 'lastName' },
  { label: 'تلفن ', value: 'phone' },
  { label: 'جنسیت', value: 'gender' },
  { label: 'گروه', value: 'group' },
  { label: 'تاریخ تولد', value: 'birthDate' },
  { label: 'سمت / تخصص', value: 'title' },
  { label: 'تاریخ ایجاد', value: 'createdAt' },
  { label: 'آخرین ویرایش', value: 'updatedAt' },
  // مثال برای بخش‌هایی از آدرس (می‌توانید موارد بیشتری اضافه کنید)
  { label: 'شهر (آدرس)', value: 'address.city' },
  { label: 'خیابان (آدرس)', value: 'address.street' },
  { label: 'یادداشت', value: 'notes' },
];

// Computed Property برای ترکیب ستون‌های استاندارد و فیلدهای سفارشی
// این لیست چک‌باکس‌ها را در UI تولید می‌کند
const availableColumns = computed(() => {
  // شروع با ستون‌های استاندارد
  const columns = [...standardColumns];

  // اضافه کردن فیلدهای سفارشی به لیست
  // استفاده از id فیلد سفارشی در value برای اطمینان از یونیک بودن و عدم وابستگی به تغییر لیبل
  fieldDefinitions.value.forEach(field => {
    columns.push({ label: `فیلد سفارشی: ${field.label}`, value: `customFieldDef_${field.id}` });
  });

  return columns;
});


// تابع مدیریت تغییر در انتخاب چک‌باکس‌های ستون‌ها
const handleColumnSelectionChange = (selectedValues) => {
  console.log('Selected columns changed:', selectedValues);
  // صدا زدن Action در settingsStore برای به‌روزرسانی و ذخیره
  settingsStore.setDisplayColumns(selectedValues);
};


// --- کدهای قبلی مربوط به Export/Import ---

// تابع async برای مدیریت کلیک روی دکمه Export
const handleExport = async () => {
  try {
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

// تابع مدیریت انتخاب فایل Import
const handleImport = async (event) => {
  console.log('فایلی برای بازیابی انتخاب شد.');
  const file = event.target.files[0];

  if (!file) {
    console.log('فایلی انتخاب نشد.');
    return;
  }

  console.log('فایل انتخاب شده:', file.name, file.type, file.size, 'بایت');

  if (file.type !== 'application/json') {
      alert('لطفاً یک فایل با فرمت JSON انتخاب کنید.');
      event.target.value = null;
      return;
  }

  const reader = new FileReader();

  reader.onload = async (e) => {
    const fileContent = e.target.result;
    console.log('محتوای فایل با موفقیت خوانده شد. در حال پارس کردن JSON...');
    let importedData = null;
    try {
      importedData = JSON.parse(fileContent);
      console.log('JSON با موفقیت پارس شد.');

      // اعتبارسنجی ساختار (می‌توانید این بخش را دقیق‌تر کنید)
      if (
          !importedData ||
          typeof importedData !== 'object' ||
          importedData.version !== 1 || // چک کردن ورژن فرمت Export
          !importedData.data ||
          typeof importedData.data !== 'object' ||
          !Array.isArray(importedData.data.contacts) ||
          !Array.isArray(importedData.data.customFieldDefinitions) ||
          !Array.isArray(importedData.data.groups)
      ) {
          throw new Error('ساختار فایل پشتیبان نامعتبر است یا ورژن آن پشتیبانی نمی‌شود.');
      }

      console.log('ساختار فایل پشتیبان معتبر است. در حال وارد کردن داده‌ها به دیتابیس...');
      await importData(importedData.data);
      console.log('بازیابی اطلاعات دیتابیس با موفقیت انجام شد.');

      // رفرش کردن داده‌ها در استورها
      console.log('Reloading Pinia stores...');
      // قبل از لود کردن، مطمئن شو که لودینگ Storeها تموم شده یا از isLoadingشون استفاده کن
      // برای سادگی، اینجا مستقیماً صدا میزنیم
      await contactStore.loadContacts();
      await groupStore.loadGroups();
      await customFieldStore.loadFieldDefinitions();
      console.log('Stores reloaded. UI should update.');

      alert('بازیابی اطلاعات با موفقیت انجام شد!');

    } catch (error) {
      console.error('خطا در پردازش یا اعتبارسنجی فایل پشتیبان:', error);
      alert('خطا در پردازش یا اعتبارسنجی فایل پشتیبان: ' + error.message);
    } finally {
      event.target.value = null;
    }
  };

  reader.onerror = (error) => {
    console.error('خطا در خواندن فایل:', error);
    alert('خطا در خواندن فایل پشتیبان.');
    event.target.value = null;
  };

  reader.readAsText(file);
};

</script>

<style scoped>
/* استایل‌های قبلی شما */
.settings-container {
  padding: 20px;
  max-width: 600px;
  margin: 20px auto;
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

/* استایل جدید برای بخش تنظیمات نمایش */
.display-settings-section {
    margin-bottom: 30px;
    border: 1px solid #ddd;
    padding: 15px;
    border-radius: 8px;
    background-color: #fff;
}

.display-settings-section h3 {
    margin-top: 0;
    padding-bottom: 5px;
    border-bottom: 1px dashed #eee;
}

.display-settings-section .el-checkbox-group {
  display: flex; /* استفاده از فلکس باکس برای چیدمان چک‌باکس‌ها */
  flex-wrap: wrap; /* اجازه شکستن خط */
  gap: 10px; /* فاصله بین چک‌باکس‌ها */
  margin-bottom: 15px;
}

/* استایل برای چک‌باکس‌های تکی Element Plus با border=true */
.display-settings-section .el-checkbox.is-bordered {
    margin-right: 0 !important; /* خنثی کردن margin راست پیش‌فرض Element Plus */
    flex-basis: calc(50% - 5px); /* هر چک‌باکس نصف عرض کانتینر + فاصله */
    box-sizing: border-box; /* محاسبه padding و border در عرض */
    display: flex; /* برای تراز کردن محتوا داخل چک‌باکس */
    justify-content: flex-start; /* محتوا از چپ شروع بشه */
    align-items: center; /* محتوا در مرکز عمودی قرار بگیره */
}

.display-settings-section .el-checkbox.is-bordered .el-checkbox__label {
    flex-grow: 1; /* لیبل فضای موجود رو پر کنه */
    padding-left: 5px; /* فاصله بین چک‌باکس و لیبل */
}


.loading-message {
    color: #007bff;
    font-style: italic;
    margin-bottom: 15px;
}

.reset-button {
    margin-top: 10px;
}


/* استایل‌های قبلی شما برای Export/Import */
.backup-section, .restore-section {
  margin-bottom: 30px;
}

.settings-container button {
  /* این استایل برای دکمه‌های Export و احتمالا Import استفاده میشه */
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s ease;
  display: inline-flex; /* استفاده از فلکس باکس برای کنار هم قرار دادن آیکون و متن */
  align-items: center; /* تراز عمودی */
  gap: 5px; /* فاصله بین آیکون و متن */
}

.settings-container button:hover {
  background-color: #0056b3;
}

/* استایل برای input type="file" */
.settings-container input[type="file"] {
    margin-top: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #fff;
    cursor: pointer;
    display: block;
    width: 100%;
    box-sizing: border-box;
}
</style>