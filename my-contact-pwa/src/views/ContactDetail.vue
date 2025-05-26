<template>
  <div class="contact-detail-container">
    <div v-if="loading" class="loading-message">
      {{ $t('contactDetail.loading') }}
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <div v-else-if="error" class="error-message">
      <p>Error loading contact: {{ error }}</p>
      <v-btn @click="fetchContactDetail" color="primary">{{
        $t('contactDetail.retryButton')
      }}</v-btn>
    </div>
    <div v-else-if="contact" class="contact-details">
      <h1 class="page-title">{{ $t('contactDetail.title') }}</h1>

      <!-- Basic Info -->
      <v-card class="mb-4">
        <v-card-title>{{ $t('contactDetail.mainInfoTitle') }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <p>
                <strong>{{ $t('contactForm.name') }}:</strong> {{ contact.name }}
              </p>
              <p>
                <strong>{{ $t('contactForm.lastName') }}:</strong> {{ contact.lastName }}
              </p>
              <p v-if="contact.title">
                <strong>{{ $t('contactDetail.titleLabel') }}:</strong> {{ contact.title }}
              </p>
              <p v-if="contact.mainPhone">
                <strong>{{ $t('contactDetail.mainPhoneLabel') }}:</strong>
                {{ contact.mainPhone }}
              </p>
              <p v-if="contact.gender">
                <strong>{{ $t('contactDetail.genderLabel') }}:</strong> {{ contact.gender }}
              </p>
              <p v-if="contact.group">
                <strong>{{ $t('contactDetail.groupLabel') }}:</strong> {{ contact.group.name }}
              </p>
              <p v-if="contact.birthDate">
                <strong>{{ $t('contactDetail.birthDateLabel') }}:</strong>
                {{ formatDate(contact.birthDate) }}
              </p>
            </v-col>
            <v-col cols="12" md="6" class="text-center">
              <v-avatar size="128">
                <v-img :src="contact.avatar || defaultAvatar"></v-img>
              </v-avatar>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Additional Phones -->
      <v-card v-if="contact.additionalPhones && contact.additionalPhones.length > 0" class="mb-4">
        <v-card-title>{{ $t('contactDetail.additionalPhonesTitle') }}</v-card-title>
        <v-card-text>
          <p v-for="(phone, index) in contact.additionalPhones" :key="index">
            <strong>{{ phone.type }}:</strong> {{ phone.number }}
          </p>
        </v-card-text>
      </v-card>

      <!-- Addresses -->
      <ContactDetailAddresses :addresses="contact.addresses" />

      <!-- Notes -->
      <v-card v-if="contact.notes" class="mb-4">
        <v-card-title>{{ $t('contactDetail.notesTitle') }}</v-card-title>
        <v-card-text>
          <p>{{ contact.notes }}</p>
        </v-card-text>
      </v-card>

      <!-- Custom Fields -->
      <v-card v-if="displayedCustomFields.length > 0" class="mb-4">
        <v-card-title>{{ $t('contactDetail.customFieldsTitle') }}</v-card-title>
        <v-card-text>
          <div v-for="processedField in displayedCustomFields" :key="processedField.id">
            <p>
              <strong>{{ processedField.label }}:</strong> {{ processedField.formattedValue }}
            </p>
          </div>
        </v-card-text>
      </v-card>

      <!-- System Info -->
      <v-card class="mb-4">
        <v-card-title>{{ $t('contactDetail.systemInfoTitle') }}</v-card-title>
        <v-card-text>
          <p>
            <strong>{{ $t('contactDetail.createdAtLabel') }}:</strong>
            {{ formatDate(contact.createdAt) }}
          </p>
          <p>
            <strong>{{ $t('contactDetail.updatedAtLabel') }}:</strong>
            {{ formatDate(contact.updatedAt) }}
          </p>
        </v-card-text>
      </v-card>

      <!-- Actions -->
      <div class="actions">
        <v-btn color="primary" @click="editContact">{{
          $t('contactDetail.editContactButton')
        }}</v-btn>
        <v-btn @click="backToList">{{ $t('contactDetail.backToListButton') }}</v-btn>
      </div>
    </div>
    <div v-else class="no-contact-message">
      {{ $t('contactDetail.noContactFound') }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
// برای دسترسی به route و پارامترها و ناوبری
import { useRoute, useRouter } from 'vue-router'
import { useCustomFieldStore } from '@/store/customFields' // این رو اضافه کن
import i18n from '@/plugins/i18n'; // برای استفاده از $t در اسکریپت

// برای دسترسی به Store مخاطبین و لود اطلاعات
import { useContactStore } from '../store/contacts'
import {
  formatGregorianDateToShamsi,
  formatCustomFieldValue,
  displayGender,
  displayPhoneType,
  displayAddressType,
} from '@/utils/formatters'
import { db } from '../db'
import ContactDetailAddresses from '@/components/contact/ContactDetailAddresses.vue'

const route = useRoute() // دسترسی به اطلاعات route فعلی
const router = useRouter() // برای ناوبری (مثلاً برگشت به صفحه قبل)
const contactStore = useContactStore() // دسترسی به Store مخاطبین
const customFieldStore = useCustomFieldStore() // استور فیلدهای سفارشی رو هم اضافه کن

const isLoading = ref(true)
const contactId = ref(null) // متغیری برای نگهداری ID مخاطب فعلی
const contact = ref(null) // متغیری برای نگهداری اطلاعات مخاطب لود شده
const loading = ref(false) // وضعیت لودینگ این صفحه
const error = ref(null) // پیام خطا در این صفحه
// تابع برای تمیز کردن شماره تلفن از کاراکترهای اضافی
const cleanPhoneNumber = (number) => {
  if (!number) return ''
  // فقط ارقام رو نگه می‌داره
  return String(number).replace(/\D/g, '')
}

// تابع برای ساخت لینک نقشه گوگل از آبجکت آدرس
const getMapUrl = (address) => {
  if (!address) return '#'
  const addressParts = []
  if (address.street) addressParts.push(address.street)
  if (address.city) addressParts.push(address.city)
  if (address.province) addressParts.push(address.province)
  if (address.country) addressParts.push(address.country)
  if (address.postalCode) addressParts.push(address.postalCode)

  const fullAddress = addressParts.join(', ')
  if (!fullAddress.trim()) return '#' // اگر آدرس خالی بود، لینک نده

  // استفاده از Google Maps Search API
  // encodeURIComponent برای اطمینان از اینکه کاراکترهای خاص در URL مشکلی ایجاد نکنند
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
}

// یه کامپیوتد پروپرتی برای فیلدهای سفارشیِ اون مخاطب خاص تعریف می‌کنیم
// src/views/ContactDetail.vue - بخش script setup - Computed Property displayedCustomFields با لاگ‌های دیباگ

const displayedCustomFields = computed(() => {
  if (!contact.value || !customFieldStore.fieldDefinitions) {
    return []
  }

  const result = customFieldStore.fieldDefinitions
    .map((fieldDef) => {
      // پیدا کردن مقدار این فیلد سفارشی در مخاطب
      const existingCustomField = contact.value.customFields?.find(
        (cf) => cf.fieldId === fieldDef.id,
      )
      const value = existingCustomField ? existingCustomField.value : undefined // مقدار واقعی

      // چک می‌کنیم که آیا فیلد مقداری دارد که باید نمایش داده شود
      // (undefined، null، یا رشته خالی/whitespace را نادیده می‌گیریم مگر اینکه نوع بولین باشد که undefined/null هم مهم باشد)
      const hasDisplayableValue =
        value !== undefined &&
        value !== null &&
        (typeof value === 'string' ? value.trim() !== '' : true)

      if (hasDisplayableValue) {
        // ** اینجا مقدار را با استفاده از formatCustomFieldValue فرمت می‌کنیم **
        let formattedDisplay = formatCustomFieldValue(value, fieldDef.type, fieldDef.options)

        // اگر فیلد از نوع select است و مقدار ذخیره شده در گزینه‌های فعلی موجود نیست، پسوند اضافه کن
        if (fieldDef.type === 'select') {
          const optionExists = fieldDef.options?.some(opt => opt.value === value)
          if (!optionExists && value !== undefined && value !== null && String(value).trim() !== '') { // فقط اگر مقداری وجود داشته و نامعتبر شده
            formattedDisplay += ` ${i18n.global.t('customFields.optionNoLongerValid')}`
          }
        }

        return {
          ...fieldDef, // کپی کردن خصوصیات تعریف فیلد (مثل id, label, type, options)
          value: value, // ذخیره مقدار خام هم (اختیاری)
          formattedValue: formattedDisplay, // ** ذخیره مقدار فرمت شده برای نمایش در Template **
        }
      }

      return null // اگر مقداری نداشت، این آیتم را در نهایت فیلتر می‌کنیم
    })
    .filter((field) => field !== null) // حذف آیتم‌های null (فیلدهایی که مقداری نداشتند)

  return result
})
// --- Hook برای بارگذاری داده‌ها هنگام mount شدن کامپوننت ---
onMounted(async () => {
  isLoading.value = true

  await contactStore.loadContacts()
  await customFieldStore.loadFieldDefinitions()

  // اینجا contact.value توسط watch و loadContactDetail پر میشه
  // صبر میکنیم تا contact.value مقدار بگیره (اگر هنوز نگرفته)
  await new Promise((resolve) => {
    if (contact.value) {
      resolve()
    } else {
      const unwatch = watch(contact, (newContact) => {
        if (newContact) {
          unwatch() // Stop watching once loaded
          resolve()
        }
      })
    }
  })

  isLoading.value = false
})

const editContact = () => {
  if (contact.value) {
    contactStore.setContactToEdit(contact.value)
    router.push({ name: 'edit-contact', params: { id: contact.value.id } })
  }
}

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
    } else {
      error.value = 'مخاطب مورد نظر یافت نشد.'
    }
  } catch (err) {
    error.value = 'خطا در بارگذاری جزئیات مخاطب.'
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
  border: 1px solid var(--color-border-medium); /* تغییر کرد */
  border-radius: 10px;
  background-color: var(--color-background-light); /* تغییر کرد */
  box-shadow: 0 4px 12px var(--color-shadow-detail); /* تغییر کرد */
  font-family: 'Vazirmatn', sans-serif;
}

.contact-detail-container h2 {
  text-align: center;
  color: var(--color-text-primary); /* تغییر کرد */
  margin-bottom: 25px;
  border-bottom: 2px solid var(--color-link-primary); /* تغییر کرد */
  padding-bottom: 15px;
  font-size: 1.8em;
}

.loading-message,
.error-message,
.no-contact-message {
  text-align: center;
  padding: 20px;
  color: var(--color-text-tertiary); /* تغییر کرد */
  font-size: 1.1em;
}

.error-message p {
  color: var(--color-error-text); /* تغییر کرد */
  margin-bottom: 15px;
}

.contact-info-wrapper {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.contact-header {
  text-align: center;
  margin-bottom: 20px;
}

.contact-header h3 {
  font-size: 1.6em;
  color: var(--color-text-primary); /* تغییر کرد */
  margin-bottom: 5px;
}

.title-text {
  font-size: 1em;
  color: var(--color-text-tertiary); /* تغییر کرد */
  margin-top: 0;
}

.detail-section {
  margin-bottom: 25px;
  padding: 15px;
  border: 1px solid var(--color-border-light); /* تغییر کرد */
  border-radius: 8px;
  background-color: var(--color-background-darker-light); /* تغییر کرد */
}

.detail-section h4 {
  font-size: 1.2em;
  color: var(--color-link-primary); /* تغییر کرد */
  margin-top: 0;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border-medium); /* تغییر کرد */
}

.detail-section p,
.detail-section li {
  font-size: 1em;
  color: var(--color-text-secondary); /* تغییر کرد */
  line-height: 1.7;
  margin-bottom: 8px;
}

.detail-section p strong,
.detail-section li strong {
  color: var(--color-text-primary); /* تغییر کرد */
  margin-left: 5px;
}

.detail-section ul {
  list-style: none;
  padding-right: 0;
}

.address-item {
  padding: 10px;
  border-bottom: 1px dashed var(--color-border-light); /* تغییر کرد */
}
.address-item:last-child {
  border-bottom: none;
}
.address-item p {
  margin-bottom: 4px;
}
.address-notes {
  font-size: 0.9em;
  color: var(--color-text-secondary); /* تغییر کرد */
}
.notes-text {
  white-space: pre-wrap;
  background-color: var(--color-background-light); /* تغییر کرد */
  padding: 10px;
  border-radius: 4px;
  border: 1px solid var(--color-border-light); /* تغییر کرد */
}

.meta-info p {
  font-size: 0.9em;
  color: var(--color-text-tertiary); /* تغییر کرد */
}

.actions {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border-medium); /* تغییر کرد */
}

.actions button {
  padding: 12px 25px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
  margin: 0 10px;
}

.actions button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px var(--color-shadow);
}

.back-button {
  background-color: var(--color-text-tertiary);
  color: white;
}

.back-button:hover {
  background-color: var(--color-text-secondary);
}

.edit-button {
  background-color: var(--color-warning);
  color: white;
}

.edit-button:hover {
  background-color: var(--color-warning-dark);
}

.error-message button {
  background-color: var(--color-link-primary); /* تغییر کرد */
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}
.error-message button:hover {
  background-color: var(--color-link-hover); /* تغییر کرد */
}
.phone-link,
.address-link {
  color: var(--color-link-primary); /* تغییر کرد */
  text-decoration: none;
  cursor: pointer;
}

.phone-link:hover,
.address-link:hover {
  text-decoration: underline;
  color: var(--color-link-hover); /* تغییر کرد */
}
</style>
