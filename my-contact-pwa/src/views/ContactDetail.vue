<template>
  <div class="contact-detail-container">
    <h2>جزئیات مخاطب</h2>

      <div v-if="loading" class="loading-message">
      در حال بارگذاری اطلاعات مخاطب...
    </div>
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadContactDetail(parseInt(contactId))">تلاش مجدد</button>
    </div>
    <div v-else-if="contact" class="contact-info-wrapper">
      <div class="contact-header">
        <h3>{{ contact.name }} {{ contact.lastName }}</h3>
        <p v-if="contact.title" class="title-text">سمت: {{ contact.title }}</p>
      </div>

      <div class="detail-section">
        <h4>اطلاعات اصلی</h4>
        <p><strong>تلفن اصلی:</strong> {{ contact.phone }}</p>
        <p v-if="contact.gender"><strong>جنسیت:</strong> {{ displayGender(contact.gender) }}</p>
        <p v-if="contact.group"><strong>گروه:</strong> {{ contact.group }}</p>
        <p v-if="contact.birthDate"><strong>تاریخ تولد:</strong> {{ formatShamsiDate(contact.birthDate) }}</p>
      </div>

      <div v-if="contact.additionalPhones && contact.additionalPhones.length > 0" class="detail-section">
        <h4>شماره‌های اضافی</h4>
        <ul>
          <li v-for="(item, index) in contact.additionalPhones" :key="'phone-' + index">
            <strong>{{ displayPhoneType(item.type) }}:</strong> {{ item.number }}
          </li>
        </ul>
      </div>

      <div v-if="contact.addresses && contact.addresses.length > 0" class="detail-section">
        <h4>آدرس‌ها</h4>
        <ul>
          <li v-for="(address, index) in contact.addresses" :key="'address-' + index" class="address-item">
            <p><strong>{{ displayAddressType(address.type) }}:</strong></p>
            <p v-if="address.street">{{ address.street }}</p>
            <p>
              <span v-if="address.city">{{ address.city }}</span>
              <span v-if="address.city && address.province">، </span>
              <span v-if="address.province">{{ address.province }}</span>
            </p>
            <p v-if="address.country">{{ address.country }}</p>
            <p v-if="address.postalCode">کد پستی: {{ address.postalCode }}</p>
            <p v-if="address.notes" class="address-notes"><em>یادداشت: {{ address.notes }}</em></p>
          </li>
        </ul>
      </div>

      <div v-if="contact.notes" class="detail-section">
        <h4>یادداشت/توضیحات</h4>
        <p class="notes-text">{{ contact.notes }}</p>
      </div>

<div v-if="displayedCustomFields.length > 0" class="mt-6 border-t pt-4">
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">فیلدهای سفارشی</h3>
  <div class="space-y-2">
    <div v-for="field in displayedCustomFields" :key="field.id" class="flex items-center">
      <p class="text-sm font-medium text-gray-700 dark:text-gray-300 w-1/3">{{ field.label }}:</p>
      <p class="text-sm text-gray-800 dark:text-gray-200 w-2/3">{{ field.formattedValue }}</p>
    </div>
  </div>
</div>


      <div class="meta-info detail-section">
        <h4>اطلاعات سیستمی</h4>
        <p v-if="contact.createdAt"><strong>تاریخ ایجاد:</strong> {{ formatShamsiDate(contact.createdAt, true) }}</p>
        <p v-if="contact.updatedAt"><strong>آخرین ویرایش:</strong> {{ formatShamsiDate(contact.updatedAt, true) }}</p>
      </div>

    <div class="actions">
      <button @click="startEditingCurrentContact" class="edit-button">ویرایش این مخاطب</button>
      <button @click="goBack">برگشت به لیست</button>
    </div>
  </div>
  <div v-else class="no-contact-message">
    <p>مخاطبی برای نمایش انتخاب نشده است یا یافت نشد.</p>
  </div>
  </div>

</template>

<script setup>
import { ref, onMounted,computed, watch } from 'vue'
// برای دسترسی به route و پارامترها و ناوبری
import { useRoute, useRouter } from 'vue-router'
import { useCustomFieldStore } from '@/store/customFields'; // این رو اضافه کن

// برای دسترسی به Store مخاطبین و لود اطلاعات
import { useContactStore } from '../store/contacts'
import { 
  formatShamsiDate, 
  formatCustomFieldValue,
  displayGender, 
  displayPhoneType, 
  displayAddressType 
} from '../utils/formatters'; // مسیر صحیح رو چک کن
import { db } from '../db' 

const route = useRoute() // دسترسی به اطلاعات route فعلی
const router = useRouter() // برای ناوبری (مثلاً برگشت به صفحه قبل)
const contactStore = useContactStore()// دسترسی به Store مخاطبین
const customFieldStore = useCustomFieldStore(); // استور فیلدهای سفارشی رو هم اضافه کن

const isLoading = ref(true); 
const contactId = ref(null) // متغیری برای نگهداری ID مخاطب فعلی
const contact = ref(null) // متغیری برای نگهداری اطلاعات مخاطب لود شده
const loading = ref(false) // وضعیت لودینگ این صفحه
const error = ref(null) // پیام خطا در این صفحه

// یه کامپیوتد پروپرتی برای فیلدهای سفارشیِ اون مخاطب خاص تعریف می‌کنیم
const displayedCustomFields = computed(() => {
  console.log('--- محاسبه displayedCustomFields ---');
  console.log('Computed: contact.value موجود است؟', !!contact.value);
  console.log('Computed: customFieldStore.fieldDefinitions موجود است؟', !!customFieldStore.fieldDefinitions);

  if (!contact.value || !customFieldStore.fieldDefinitions) {
        console.log('Computed: یکی از مقادیر contact.value یا fieldDefinitions خالی است. برمی‌گردیم []');

    return [];
  }

  // فیلدهای سفارشی تعریف شده رو با مقادیر ذخیره شده برای این مخاطب ترکیب می‌کنیم
  const result = customFieldStore.fieldDefinitions
    .map(fieldDef => {
      // 👈 تغییر از customFieldsData به customFields و استفاده از find
      const existingCustomField = contact.value.customFields?.find(cf => cf.fieldId === fieldDef.id);
      const value = existingCustomField ? existingCustomField.value : undefined; // مقدار واقعی فیلد

      console.log(`Computed: بررسی فیلد "${fieldDef.label}" (ID: ${fieldDef.id}) - مقدار در مخاطب:`, value);
      if (value !== undefined && value !== null && (typeof value === 'string' ? value.trim() !== '' : true)) { // added check for empty string for non-boolean types
        console.log(`Computed: فیلد "${fieldDef.label}" مقدار دارد، فرمت‌شده:`, formatCustomFieldValue(value, fieldDef.type, fieldDef.options));
        return {
          ...fieldDef,
          value: value,
          formattedValue: formatCustomFieldValue(value, fieldDef.type, fieldDef.options)
        };
      }
      console.log(`Computed: فیلد "${fieldDef.label}" مقدار ندارد یا خالی است.`);
      return null;
    })
    .filter(field => field !== null);
  
  console.log('Computed: نتیجه نهایی displayedCustomFields:', result);
  return result;
});
// --- Hook برای بارگذاری داده‌ها هنگام mount شدن کامپوننت ---
onMounted(async () => {
  isLoading.value = true;

  await contactStore.loadContacts();
  await customFieldStore.loadFieldDefinitions();

  // اینجا contact.value توسط watch و loadContactDetail پر میشه
  // صبر میکنیم تا contact.value مقدار بگیره (اگر هنوز نگرفته)
  await new Promise(resolve => {
    if (contact.value) {
      resolve();
    } else {
      const unwatch = watch(contact, (newContact) => {
        if (newContact) {
          unwatch(); // Stop watching once loaded
          resolve();
        }
      });
    }
  });

    console.log('--- بررسی اطلاعات برای نمایش فیلدهای سفارشی ---');
  console.log('1. مقدار نهایی contact.value در onMounted:', contact.value);
  console.log('2. تعاریف فیلدهای سفارشی (fieldDefinitions) در استور:', customFieldStore.fieldDefinitions);
  if (contact.value) {
      // 👈 تغییر از customFieldsData به customFields
      console.log('3. داده‌های فیلدهای سفارشی (customFields) در مخاطب:', contact.value.customFields); 
  } else {
      console.log('3. مخاطب هنوز لود نشده، customFields قابل دسترسی نیست.');
  }

  isLoading.value = false;
});


const startEditingCurrentContact = () => {
  if (contact.value) {
    contactStore.setContactToEdit(contact.value);
    router.push({ name: 'add-contact' });
  }
};

// تابعی برای لود کردن اطلاعات مخاطب بر اساس ID
const loadContactDetail = async (id) => {
  loading.value = true
  error.value = null
  contact.value = null // اطلاعات قبلی رو پاک می‌کنیم

  // چون contactStore قابلیت جستجوی تک آیتم رو نداره،
  // مستقیماً از Dexie استفاده می‌کنیم برای پیدا کردن مخاطب با ID
  try {
    const loadedContact = await db.contacts.get(id) // <--- فرض بر اینه که 'db' در دسترس هست
    if (loadedContact) {
      contact.value = loadedContact
      console.log('مخاطب با موفقیت برای نمایش جزئیات لود شد:', loadedContact)
    } else {
      error.value = 'مخاطب مورد نظر یافت نشد.'
      console.error('مخاطب با ID', id, 'برای نمایش جزئیات یافت نشد.')
    }
  } catch (err) {
    error.value = 'خطا در بارگذاری جزئیات مخاطب.'
    console.error('خطا در لود جزئیات مخاطب:', err)
  } finally {
    loading.value = false
  }
}

// تابعی برای برگشت به صفحه قبل
const goBack = () => {
  router.back() // برمی‌گرده به صفحه قبلی (که لیست مخاطبین هست)
}

// وقتی کامپوننت mount میشه یا وقتی ID در route تغییر می‌کنه
watch(
  () => route.params.id, // مشاهده تغییرات پارامتر 'id' در route
  (newId) => {
    if (newId) {
      contactId.value = newId // ID رو به‌روز می‌کنیم
      // حالا اطلاعات مخاطب رو بر اساس ID جدید لود می‌کنیم
      // توجه: ID مخاطب در دیتابیس Dexie به صورت Number هست، باید تبدیل کنیم
      loadContactDetail(parseInt(newId))
    } else {
      // اگر ID در route نبود، یعنی وضعیت غیرمنتظره است
      error.value = 'ID مخاطب مشخص نشده است.'
      contactId.value = null
      contact.value = null
    }
  },
  { immediate: true }, // این باعث میشه Watcher بلافاصله بعد از mount هم اجرا بشه
)

</script>

<style scoped>
.contact-detail-container {
  max-width: 700px;
  margin: 20px auto;
  padding: 25px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-family: 'Vazirmatn', sans-serif; /* یا فونت فارسی دلخواه شما */
}

.contact-detail-container h2 {
  text-align: center;
  color: #2c3e50; /* رنگ تیره‌تر برای عنوان اصلی */
  margin-bottom: 25px;
  border-bottom: 2px solid #3498db; /* رنگ آبی برای خط زیر عنوان */
  padding-bottom: 15px;
  font-size: 1.8em;
}

.loading-message,
.error-message,
.no-contact-message {
  text-align: center;
  padding: 20px;
  color: #7f8c8d; /* خاکستری ملایم */
  font-size: 1.1em;
}

.error-message p {
  color: #e74c3c; /* قرمز برای پیام خطا */
  margin-bottom: 15px;
}

.contact-info-wrapper {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.contact-header {
  text-align: center;
  margin-bottom: 20px;
}

.contact-header h3 {
  font-size: 1.6em;
  color: #34495e; /* آبی نفتی */
  margin-bottom: 5px;
}

.title-text {
  font-size: 1em;
  color: #7f8c8d; /* خاکستری برای سمت */
  margin-top: 0;
}

.detail-section {
  margin-bottom: 25px;
  padding: 15px;
  border: 1px solid #ecf0f1; /* بوردر خیلی روشن */
  border-radius: 8px;
  background-color: #fdfdfd; /* پس‌زمینه خیلی کم‌رنگ */
}

.detail-section h4 {
  font-size: 1.2em;
  color: #3498db; /* آبی برای عنوان بخش‌ها */
  margin-top: 0;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.detail-section p,
.detail-section li {
  font-size: 1em;
  color: #555;
  line-height: 1.7;
  margin-bottom: 8px;
}

.detail-section p strong,
.detail-section li strong {
  color: #333;
  margin-left: 5px; /* برای زبان فارسی LTR، اگر RTL هستید از margin-right استفاده کنید */
}

.detail-section ul {
  list-style: none;
  padding-right: 0; /* برای زبان فارسی */
  /* padding-left: 20px; برای زبان انگلیسی */
}

.address-item {
  padding: 10px;
  border-bottom: 1px dashed #eee;
}
.address-item:last-child {
  border-bottom: none;
}
.address-item p {
  margin-bottom: 4px;
}
.address-notes {
  font-size: 0.9em;
  color: #777;
}
.notes-text {
  white-space: pre-wrap; /* برای حفظ فاصله‌ها و خطوط جدید در یادداشت */
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #eee;
}

.meta-info p {
  font-size: 0.9em;
  color: #888;
}

.actions {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.actions button {
  padding: 12px 25px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
  transition: background-color 0.2s ease, transform 0.1s ease;
  margin: 0 10px;
}

.actions button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.back-button {
  background-color: #7f8c8d; /* خاکستری */
  color: white;
}

.back-button:hover {
  background-color: #6c7a7d;
}

.edit-button {
  background-color: #f39c12; /* نارنجی */
  color: white;
}

.edit-button:hover {
  background-color: #e67e22;
}

.error-message button {
   background-color: #3498db;
   color: white;
   padding: 8px 15px;
   border-radius: 4px;
   border: none;
   cursor: pointer;
}
.error-message button:hover {
  background-color: #2980b9;
}
</style>
