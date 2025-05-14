<template>
  <div class="contact-list-container">
    <h2>لیست مخاطبین</h2>

    <div class="controls">
      <div class="search-box">
        <label for="search">جستجو:</label>
        <input
          type="text"
          id="search"
          v-model="contactStore.searchQuery"
          placeholder="جستجو در مخاطبین..."
        />
      </div>

      <div class="sort-controls">
    <label for="sortField">مرتب‌سازی بر اساس:</label>
    <select id="sortField" v-model="contactStore.sortField">
      <option
        v-for="option in sortOptions"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <label for="sortOrder">ترتیب:</label>
    <select id="sortOrder" v-model="contactStore.sortOrder">
      <option value="asc">صعودی (الفبا/جدیدترین)</option>
      <option value="desc">نزولی (الفبا/قدیمی‌ترین)</option>
    </select>
  </div>
    </div>
    <hr />

    <div v-if="contactStore.loading">در حال بارگذاری مخاطبین...</div>
    <div v-else-if="contactStore.error" style="color: red">{{ contactStore.error }}</div>
    <div v-else-if="contactStore.filteredAndSortedContacts.length === 0">هیچ مخاطبی یافت نشد.</div>

<ul v-else class="contact-list">
  <li
    v-for="contact in paginatedContacts"
    :key="contact.id"
    class="contact-item"
  >

        <div class="contact-info">
          <router-link
            :to="{ name: 'contact-detail', params: { id: contact.id } }"
            class="contact-name-link"
          >
            {{ contact.name }} {{ contact.lastName }}
          </router-link>
          <p>تلفن: {{ contact.phone }}</p>

          <p v-if="contact.title">سمت: {{ contact.title }}</p>
          <p v-if="contact.gender">جنسیت: {{ displayGender(contact.gender) }}</p>
          <p v-if="contact.group">گروه: {{ contact.group }}</p>
          <p v-if="contact.notes">یادداشت: {{ contact.notes }}</p>
          <p v-if="contact.birthDate">تاریخ تولد: {{ formatShamsiDate(contact.birthDate) }}</p>
          <div v-if="contact.addresses && contact.addresses.length > 0">
            <p>آدرس‌ها:</p>
            <ul>
              <li v-for="(address, index) in contact.addresses" :key="index">
                <strong>{{ displayAddressType(address.type) }}</strong
                >:
                {{ address.street ? address.street + ', ' : '' }}
                {{ address.city ? address.city : '' }}
                {{ address.province ? ', ' + address.province : '' }}
                {{ address.country ? ', ' + address.country : '' }}
                {{ address.postalCode ? ' (کد پستی: ' + address.postalCode + ')' : '' }}
                <span v-if="address.notes"> (یادداشت: {{ address.notes }})</span>
              </li>
            </ul>
          </div>

          <div v-if="contact.additionalPhones && contact.additionalPhones.length > 0">
            <p>شماره‌های اضافی:</p>
            <ul>
              <li v-for="(additionalPhone, index) in contact.additionalPhones" :key="index">
                {{ displayPhoneType(additionalPhone.type) }}: {{ additionalPhone.number }}
              </li>
            </ul>
          </div>

          <p v-if="contact.createdAt">ایجاد: {{ formatShamsiDate(contact.createdAt) }}</p>
          <p v-if="contact.updatedAt">ویرایش: {{ formatShamsiDate(contact.updatedAt) }}</p>
        </div>

        <div class="contact-actions">
          <button
            class="edit-button"
            @click="startEditingContact(contact)"
            :disabled="contactStore.loading"
          >
            ویرایش
          </button>

          <button
            class="delete-button"
            @click="confirmDeleteContact(contact.id)"
            :disabled="contactStore.loading"
          >
            حذف
          </button>
        </div>
      </li>

      <div v-if="totalPages > 1" class="pagination-controls">
  <button @click="prevPage" :disabled="currentPage === 1">قبلی</button>
  <span>صفحه {{ currentPage }} از {{ totalPages }}</span>
  <button @click="nextPage" :disabled="currentPage === totalPages">بعدی</button>

  <div class="page-numbers">
    <button
      v-for="page in totalPages"
      :key="page"
      @click="goToPage(page)"
      :class="{ active: currentPage === page }"
    >
      {{ page }}
    </button>
  </div>
</div>

    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'; // مطمئن شو که watch هم اینجا import شده
import { useContactStore } from '../store/contacts'
import { useGroupStore } from '../store/groups'
import { useCustomFieldStore } from '@/store/customFields'; // **1. Import کردن استور فیلدهای سفارشی**
import { useRouter } from 'vue-router'
import { 
  formatShamsiDate, 
  displayGender, 
  displayPhoneType, 
  displayAddressType 
} from '../utils/formatters'; // مسیر صحیح رو چک کن

const contactStore = useContactStore()
const customFieldStore = useCustomFieldStore(); // **2. استفاده از استور فیلدهای سفارشی**

// Define standard sortable fields with their display labels
// این لیست فیلدهای استاندارد رو نشون میده که میخوایم قابل مرتب‌سازی باشن
// 'value' همون چیزیه که به contactStore.setSortCriteria میفرستیم
const standardSortableOptions = [
  { value: 'lastName', label: 'نام خانوادگی' },
  { value: 'name', label: 'نام' },
  { value: 'createdAt', label: 'تاریخ ایجاد' },
  { value: 'group', label: 'گروه' }, // فرض می‌کنیم فیلد group روی آبجکت مخاطب هست و متنی مقایسه میشه
  { value: 'title', label: 'سمت/تخصص' },
  // اگر فیلدهای استاندارد دیگه ای مثل 'updatedAt', 'birthDate', 'gender'
  // رو هم میخوای توی لیست مرتب‌سازی نمایش بدی، اینجا اضافه کن
];

// **3. ساخت computed property برای ترکیب گزینه‌های استاندارد و سفارشی**
const sortOptions = computed(() => {
  // با گزینه‌های استاندارد شروع می‌کنیم
  const options = [...standardSortableOptions];

  // گزینه‌های فیلدهای سفارشی رو اضافه می‌کنیم
  // از sortedFieldDefinitions استفاده می‌کنیم که احتمالا بر اساس label مرتب شده
  customFieldStore.sortedFieldDefinitions.forEach(field => {
    // برای هر فیلد سفارشی یک گزینه به لیست اضافه می‌کنیم
    options.push({
      value: field.id, // مقدار ارسالی به استور، همون ID فیلد سفارشی است
      label: `فیلد سفارشی: ${field.label}` // متنی که به کاربر نشون میدیم
    });
  });

  return options;
});


const groupStore = useGroupStore()
const router = useRouter()

// --- Pagination State ---
const currentPage = ref(1); // صفحه فعلی
const itemsPerPage = ref(10); // تعداد آیتم‌ها در هر صفحه. می‌تونی بعداً این رو از کاربر هم بگیری.

// computed property برای محاسبه تعداد کل مخاطبین (بعد از فیلتر و مرتب‌سازی)
const totalContactsOnCurrentFilter = computed(() => contactStore.filteredAndSortedContacts.length);

// computed property برای محاسبه تعداد کل صفحات
const totalPages = computed(() => Math.ceil(totalContactsOnCurrentFilter.value / itemsPerPage.value));

const paginatedContacts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return contactStore.filteredAndSortedContacts.slice(start, end);
});

// تابع برای رفتن به یک صفحه خاص
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    // Smooth Scrolling: اسکرول به بالای صفحه/لیست
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }
};

// تابع برای رفتن به صفحه بعدی
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }
};

// تابع برای رفتن به صفحه قبلی
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }
};
// Watch برای تغییرات در جستجو یا مرتب‌سازی و ریست کردن صفحه فعلی به 1
watch(
  () => [contactStore.searchQuery, contactStore.sortField, contactStore.sortOrder],
  () => {
    currentPage.value = 1;
  }
);

const startEditingContact = (contact) => {
  contactStore.setContactToEdit(contact) // گام اول: تنظیم مخاطب در Store
  // گام دوم: ناوبری به صفحه فرم
  // از router.push() برای رفتن به Route فرم استفاده می‌کنیم
  router.push({ name: 'add-contact' }) // <-- ناوبری به Route 'add-contact'
}

const confirmDeleteContact = async (contactId) => {
  // نمایش پیام تایید به کاربر
  const confirmed = window.confirm('آیا از حذف این مخاطب اطمینان دارید؟');

  // اگر کاربر تایید کرد
  if (confirmed) {
    try {
      console.log(`درخواست حذف مخاطب با ID: ${contactId}`);
      // صدا زدن اکشن deleteContact از استور مخاطبین
      await contactStore.deleteContact(contactId);
      console.log(`مخاطب با ID ${contactId} با موفقیت حذف شد.`);
      // می‌تونی اینجا یک پیام موفقیت کوچیک هم به کاربر نشون بدی (اختیاری)
      // alert('مخاطب با موفقیت حذف شد.');

    } catch (error) {
      console.error('خطا در حذف مخاطب:', error);
      // نمایش پیام خطا به کاربر
      alert('خطا در حذف مخاطب: ' + (error.message || 'خطای نامشخص در هنگام حذف.'));
    }
  } else {
      console.log('حذف مخاطب توسط کاربر لغو شد.');
      // می‌تونی یه پیام لغو هم نشون بدی (اختیاری)
  }
}

</script>

<style scoped>
.contact-info ul {
  list-style: disc; /* نشانه دایره‌ای برای لیست */
  padding-left: 20px; /* فاصله از سمت چپ */
  margin-top: 5px;
  margin-bottom: 5px;
}

.contact-info ul li {
  font-size: 0.9em;
  color: #555;
  margin-bottom: 5px; /* فاصله بیشتر بین آدرس‌ها */
  word-break: break-word; /* برای شکستن خطوط طولانی آدرس */
}

.contact-info ul li strong {
  /* استایل برای نوع آدرس */
  color: #333;
  margin-right: 5px;
}

.controls {
  display: flex;
  flex-direction: column; /* آیتم‌ها زیر هم قرار بگیرن */
  gap: 15px; /* فاصله بین آیتم‌ها */
  padding: 0 20px;
  margin: 20px auto;
  max-width: 400px; /* هم‌عرض با فرم */
}

.search-box label,
.sort-controls label {
  margin-right: 10px;
  font-weight: bold;
}

.search-box input[type='text'] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: calc(100% - 70px); /* عرض input با احتساب label */
  box-sizing: border-box;
}

.sort-controls {
  display: flex; /* فیلدها و ترتیب در یک سطر قرار بگیرن */
  gap: 10px; /* فاصله بین فیلدهای مرتب‌سازی */
  align-items: center;
}

.sort-controls select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.contact-list-container {
  margin: 20px auto;
  max-width: 400px;
  padding: 0 20px;
}

.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.contact-item p {
  margin: 3px 0;
  font-size: 0.9em;
  color: #555;
  word-break: break-word; /* اگر متن طولانی بود بشکنه */
}

.contact-info strong {
  display: block;
  margin-bottom: 5px;
}

.contact-actions button {
  margin-left: 5px;
  padding: 5px 10px;
  cursor: pointer;
}
.contact-actions button {
  margin-left: 5px;
  padding: 5px 10px;
  cursor: pointer;
  border: none; /* استایل دکمه‌ها رو یکم مرتب‌تر کنیم */
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

/* استایل مخصوص دکمه حذف */
.delete-button {
  background-color: #dc3545; /* رنگ قرمز */
  color: white;
}

.delete-button:hover:not(:disabled) {
  background-color: #c82333; /* قرمز تیره‌تر هنگام هاور */
}

/* استایل مخصوص دکمه ویرایش (اگه اضافه کردی) */
.edit-button {
  background-color: #ffc107;
  color: #212529;
}
.edit-button:hover:not(:disabled) {
  background-color: #e0a800;
}
.contact-actions button {
  margin-left: 5px;
  padding: 5px 10px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover:not(:disabled) {
  background-color: #c82333;
}

/* استایل مخصوص دکمه ویرایش */
.edit-button {
  background-color: #ffc107; /* رنگ زرد/نارنجی */
  color: #212529; /* رنگ متن تیره */
}
.edit-button:hover:not(:disabled) {
  background-color: #e0a800; /* زرد/نارنجی تیره‌تر */
}
.contact-item p {
  /* استایل برای پاراگراف‌های داخل آیتم لیست */
  margin: 3px 0;
  font-size: 0.9em; /* فونت کوچکتر برای تاریخ‌ها */
  color: #555;
}
.contact-name-link {
  color: #007bff; /* رنگ آبی لینک */
  text-decoration: none; /* بدون خط زیر */
  font-weight: bold; /* ضخیم‌تر */
  cursor: pointer; /* نشانگر ماوس به شکل دست */
}

.contact-name-link:hover {
  text-decoration: underline; /* زیر خط دار شدن موقع هاور */
}
/* Pagination Controls Styling */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px; /* فاصله بین عناصر */
  flex-wrap: wrap; /* اجازه میده دکمه‌ها در صفحه‌های کوچک به خط بعدی برن */
  direction: rtl; /* برای راست به چپ کردن کنترل‌ها */
}

.pagination-controls button {
  padding: 8px 15px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  font-family: inherit; /* استفاده از فونت اصلی برنامه */
}

.pagination-controls button:hover:not(:disabled) {
  background-color: #e0e0e0;
  border-color: #b0b0b0;
}

.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-controls button.active {
  background-color: #007bff; /* رنگ اصلی (مثلاً آبی) */
  color: white;
  border-color: #007bff;
}

.pagination-controls span {
  font-weight: bold;
  margin: 0 10px;
}

.page-numbers {
  display: flex;
  gap: 5px;
  margin-left: 10px; /* فاصله از دکمه‌های قبلی/بعدی */
}

.page-numbers button {
  min-width: 35px; /* حداقل عرض برای دکمه‌های شماره صفحه */
}

</style>
