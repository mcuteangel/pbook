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
          <option value="lastName">نام خانوادگی</option>
          <option value="name">نام</option>
          <option value="createdAt">تاریخ ایجاد</option>
          <option value="group">گروه</option>
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
        v-for="contact in contactStore.filteredAndSortedContacts"
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
    </ul>
  </div>
</template>

<script setup>
import { useContactStore } from '../store/contacts'
import { useGroupStore } from '../store/groups'
import { useRouter } from 'vue-router'
import { 
  formatShamsiDate, 
  displayGender, 
  displayPhoneType, 
  displayAddressType 
} from '../utils/formatters'; // مسیر صحیح رو چک کن

const contactStore = useContactStore()
const groupStore = useGroupStore()
const router = useRouter()

const startEditingContact = (contact) => {
  contactStore.setContactToEdit(contact) // گام اول: تنظیم مخاطب در Store
  // گام دوم: ناوبری به صفحه فرم
  // از router.push() برای رفتن به Route فرم استفاده می‌کنیم
  router.push({ name: 'add-contact' }) // <-- ناوبری به Route 'add-contact'
}

const confirmDelete = async (contactId) => {
  if (confirm('مطمئنی می‌خوای این مخاطب رو حذف کنی؟')) {
    await contactStore.deleteContact(contactId)
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
</style>
