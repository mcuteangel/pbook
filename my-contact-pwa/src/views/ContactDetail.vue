<template>
  <div class="contact-detail" role="region" :aria-label="$t('contactDetail.title')">
    <!-- نمایش وضعیت لودینگ -->
    <div v-if="loading" class="loading-message" role="status" aria-live="polite">
      <IconWrapper icon="spinner" prefix="fa-solid" class="loading-icon" animation="fa-spin" />
      {{ $t('contactDetail.loading') }}
    </div>

    <!-- نمایش خطا -->
    <div v-else-if="error" class="error-message" role="alert" aria-live="assertive">
      <IconWrapper icon="exclamation-circle" prefix="fa-solid" class="error-icon" />
      {{ error }}
      <button @click="loadContactDetail" class="retry-button">
        {{ $t('contactDetail.retry') }}
      </button>
    </div>

    <!-- نمایش اطلاعات مخاطب -->
    <div v-else-if="contact" class="contact-info">
      <!-- هدر مخاطب -->
      <div class="contact-header">
        <div class="contact-avatar">
          <IconWrapper icon="user-circle" prefix="fa-solid" class="avatar-icon" />
        </div>
        <div class="contact-title">
          <h1 class="contact-name">{{ contact.name }} {{ contact.lastName }}</h1>
          <p v-if="contact.title" class="contact-position">{{ contact.title }}</p>
        </div>
        <div class="contact-actions">
          <button
            @click="editContact"
            class="action-button edit"
            :title="$t('contactDetail.actions.edit')"
          >
            <IconWrapper icon="edit" prefix="fa-solid" class="button-icon" />
          </button>
          <button
            @click="shareContact"
            class="action-button share"
            :title="$t('contactDetail.actions.share')"
          >
            <IconWrapper icon="share-alt" prefix="fa-solid" class="button-icon" />
          </button>
          <button
            @click="goBack"
            class="action-button back"
            :title="$t('contactDetail.actions.back')"
          >
            <IconWrapper icon="arrow-left" prefix="fa-solid" class="button-icon" />
          </button>
        </div>
      </div>

      <!-- اطلاعات اصلی -->
      <section class="info-card main-info" aria-labelledby="main-info-title">
        <h2 id="main-info-title" class="section-title">
          <IconWrapper icon="user" prefix="fa-solid" class="section-icon" />
          {{ $t('contactDetail.mainInfoTitle') }}
        </h2>

        <div class="info-grid">
          <!-- نام -->
          <div class="info-item">
            <label class="info-label">{{ $t('form.name') }}</label>
            <span class="info-value">{{ contact.name }}</span>
          </div>

          <!-- نام خانوادگی -->
          <div class="info-item">
            <label class="info-label">{{ $t('form.lastName') }}</label>
            <span class="info-value">{{ contact.lastName }}</span>
          </div>

          <!-- عنوان -->
          <div class="info-item">
            <label class="info-label">{{ $t('contactDetail.titleLabel') }}</label>
            <span class="info-value">{{ contact.title }}</span>
          </div>

          <!-- جنسیت -->
          <div class="info-item">
            <label class="info-label">{{ $t('contactDetail.genderLabel') }}</label>
            <span class="info-value">{{ displayGender(contact.gender) }}</span>
          </div>

          <!-- گروه -->
          <div class="info-item">
            <label class="info-label">{{ $t('contactDetail.groupLabel') }}</label>
            <span class="info-value">{{ contact.group }}</span>
          </div>
        </div>
      </section>

      <!-- اطلاعات تماس -->
      <section class="info-card contact-info" aria-labelledby="contact-info-title">
        <h2 id="contact-info-title" class="section-title">
          <IconWrapper icon="address-book" prefix="fa-solid" class="section-icon" />
          {{ $t('contactDetail.contactInfoTitle') }}
        </h2>

        <div class="contact-methods">
          <!-- تلفن‌ها -->
          <div v-if="contact.phones && contact.phones.length" class="contact-method-group">
            <h3 class="method-group-title">
              <IconWrapper icon="phone" prefix="fa-solid" class="method-icon" />
              {{ $t('contactDetail.phonesTitle') }}
            </h3>
            <div class="method-list">
              <div v-for="phone in contact.phones" :key="phone.id" class="method-item">
                <span class="method-type">{{ displayPhoneType(phone.type) }}</span>
                <a :href="'tel:' + cleanPhoneNumber(phone.number)" class="method-value">
                  {{ phone.number }}
                </a>
              </div>
            </div>
          </div>

          <!-- ایمیل‌ها -->
          <div v-if="contact.emails && contact.emails.length" class="contact-method-group">
            <h3 class="method-group-title">
              <IconWrapper icon="envelope" prefix="fa-solid" class="method-icon" />
              {{ $t('contactDetail.emailsTitle') }}
            </h3>
            <div class="method-list">
              <div v-for="email in contact.emails" :key="email.id" class="method-item">
                <span class="method-type">{{ email.type }}</span>
                <a :href="'mailto:' + email.address" class="method-value">
                  {{ email.address }}
                </a>
              </div>
            </div>
          </div>

          <!-- آدرس‌ها -->
          <div v-if="contact.addresses && contact.addresses.length" class="contact-method-group">
            <h3 class="method-group-title">
              <IconWrapper icon="map-marker-alt" prefix="fa-solid" class="method-icon" />
              {{ $t('contactDetail.addressesTitle') }}
            </h3>
            <div class="method-list">
              <div v-for="address in contact.addresses" :key="address.id" class="method-item">
                <span class="method-type">{{ displayAddressType(address.type) }}</span>
                <a :href="getMapUrl(address)" target="_blank" class="method-value">
                  {{ formatAddress(address) }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- فیلدهای سفارشی -->
      <section
        v-if="displayedCustomFields.length"
        class="info-card custom-fields"
        aria-labelledby="custom-fields-title"
      >
        <h2 id="custom-fields-title" class="section-title">
          <IconWrapper icon="list" prefix="fa-solid" class="section-icon" />
          {{ $t('contactDetail.customFieldsTitle') }}
        </h2>

        <div class="custom-fields-grid">
          <div v-for="field in displayedCustomFields" :key="field.id" class="custom-field-item">
            <label class="field-label">{{ field.label }}</label>
            <span class="field-value" :class="getCustomFieldValueClass(field)">
              {{ field.formattedValue }}
            </span>
          </div>
        </div>
      </section>

      <!-- یادداشت‌ها -->
      <section v-if="contact.notes" class="info-card notes-section" aria-labelledby="notes-title">
        <h2 id="notes-title" class="section-title">
          <IconWrapper icon="sticky-note" prefix="fa-solid" class="section-icon" />
          {{ $t('contactDetail.notesTitle') }}
        </h2>
        <div class="notes-content">{{ contact.notes }}</div>
      </section>

      <!-- اطلاعات سیستمی -->
      <section class="info-card system-info" aria-labelledby="system-info-title">
        <h2 id="system-info-title" class="section-title">
          <IconWrapper icon="info-circle" prefix="fa-solid" class="section-icon" />
          {{ $t('contactDetail.systemInfoTitle') }}
        </h2>

        <div class="info-grid">
          <!-- تاریخ ایجاد -->
          <div class="info-item">
            <label class="info-label">{{ $t('contactDetail.createdAtLabel') }}</label>
            <span class="info-value">{{
              formatGregorianDateToShamsi(contact.createdAt, true)
            }}</span>
          </div>

          <!-- تاریخ بروزرسانی -->
          <div class="info-item">
            <label class="info-label">{{ $t('contactDetail.updatedAtLabel') }}</label>
            <span class="info-value">{{
              formatGregorianDateToShamsi(contact.updatedAt, true)
            }}</span>
          </div>
        </div>
      </section>
    </div>

    <!-- پیام عدم وجود مخاطب -->
    <div v-else class="no-contact-message" role="status" aria-live="polite">
      <IconWrapper icon="exclamation-circle" prefix="fa-solid" class="message-icon" />
      {{ $t('contactDetail.noContactFound') }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
// برای دسترسی به route و پارامترها و ناوبری
import { useRoute, useRouter } from 'vue-router'
import { useCustomFieldStore } from '../store/customFields' // این رو اضافه کن
import i18n from '../plugins/i18n' // برای استفاده از $t در اسکریپت
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useContactStore } from '../store/contacts'
import { useGroupStore } from '../store/groups'
import IconWrapper from '../components/common/IconWrapper.vue'
import {
  formatGregorianDateToShamsi,
  formatCustomFieldValue,
  displayGender,
  displayPhoneType,
  displayAddressType,
} from '../utils/formatters/index'
import { db } from '../db/index.js'
import ContactDetailAddresses from '../components/contact/ContactDetailAddresses.vue'

const route = useRoute() // دسترسی به اطلاعات route فعلی
const router = useRouter() // برای ناوبری (مثلاً برگشت به صفحه قبل)
const contactStore = useContactStore() // دسترسی به Store مخاطبین
const customFieldStore = useCustomFieldStore() // استور فیلدهای سفارشی رو هم اضافه کن
const groupStore = useGroupStore()

// تنظیمات اولیه
const { t } = useI18n()

console.log('ContactDetail - Component mounted')
console.log('ContactDetail - Initial route params:', route.params)

const isLoading = ref(true)
const contact = ref(null) // متغیری برای نگهداری اطلاعات مخاطب لود شده
const error = ref(null) // پیام خطا در این صفحه

// تابع برای لود کردن اطلاعات مخاطب
const loadContactDetail = async () => {
  console.log('ContactDetail - loadContactDetail called')
  try {
    isLoading.value = true
    error.value = null

    // دریافت id از route params
    const id = route.params.id
    console.log('ContactDetail - Route params:', route.params)
    console.log('ContactDetail - ID:', id)
    console.log('ContactDetail - ContactStore contacts:', contactStore.contacts)

    if (!id) {
      throw new Error('Contact ID is required')
    }

    // دریافت مخاطب از استور
    const foundContact = contactStore.getContactById(id)
    console.log('ContactDetail - Found contact:', foundContact)

    if (!foundContact) {
      throw new Error('مخاطب مورد نظر یافت نشد')
    }

    contact.value = foundContact
  } catch (err) {
    console.error('ContactDetail - Error loading contact:', err)
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

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
          const optionExists = fieldDef.options?.some((opt) => opt.value === value)
          if (
            !optionExists &&
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ''
          ) {
            // فقط اگر مقداری وجود داشته و نامعتبر شده
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
  console.log('ContactDetail - Component mounted')
  console.log('ContactDetail - Initial route params:', route.params)

  // اطمینان از بارگذاری مخاطبین و فیلدهای سفارشی
  if (!contactStore.contacts.length) {
    await contactStore.loadContacts()
  }
  if (!customFieldStore.fieldDefinitions.length) {
    await customFieldStore.loadFieldDefinitions()
  }

  loadContactDetail()
})

// تماشای تغییرات route params
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadContactDetail()
    }
  },
  { immediate: true },
)

const editContact = () => {
  if (contact.value) {
    contactStore.setContactToEdit(contact.value)
    router.push({ name: 'edit-contact', params: { id: contact.value.id } })
  }
}

const goBack = () => {
  router.push({ name: 'contact-list' })
}

// تابع برای فرمت کردن آدرس
const formatAddress = (address) => {
  const parts = []
  if (address.street) parts.push(address.street)
  if (address.city) parts.push(address.city)
  if (address.province) parts.push(address.province)
  if (address.country) parts.push(address.country)
  if (address.postalCode) parts.push(address.postalCode)
  return parts.join('، ')
}

// تابع برای دریافت کلاس مناسب برای مقدار فیلد سفارشی
const getCustomFieldValueClass = (field) => {
  if (field.type === 'boolean') {
    return field.value ? 'value-true' : 'value-false'
  }
  return ''
}

// تابع برای اشتراک‌گذاری اطلاعات مخاطب
const shareContact = async () => {
  try {
    const contactInfo = {
      name: `${contact.value.name} ${contact.value.lastName}`,
      title: contact.value.title,
      phones: contact.value.phones
        ?.map((p) => `${displayPhoneType(p.type)}: ${p.number}`)
        .join('\n'),
      emails: contact.value.emails?.map((e) => `${e.type}: ${e.address}`).join('\n'),
      addresses: contact.value.addresses
        ?.map((a) => `${displayAddressType(a.type)}: ${formatAddress(a)}`)
        .join('\n'),
    }

    const text = Object.entries(contactInfo)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${t(`contactDetail.share.${key}`)}: ${value}`)
      .join('\n\n')

    if (navigator.share) {
      await navigator.share({
        title: t('contactDetail.share.title', { name: contactInfo.name }),
        text,
      })
    } else {
      await navigator.clipboard.writeText(text)
      notificationService.showSuccess(t('contactDetail.share.copied'))
    }
  } catch (error) {
    console.error('Error sharing contact:', error)
    notificationService.showError(t('contactDetail.share.error'))
  }
}
</script>

<style scoped>
.contact-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.contact-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  position: relative;
  overflow: hidden;
}

.contact-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  z-index: 0;
}

.contact-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.contact-avatar:hover {
  transform: scale(1.05);
}

.avatar-icon {
  font-size: 2rem;
  color: var(--color-primary);
  opacity: 0.8;
}

.contact-title {
  flex: 1;
  min-width: 0;
  padding-right: 1rem;
  position: relative;
  z-index: 1;
}

.contact-name {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-heading);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.contact-position {
  margin: 0.5rem 0 0;
  color: var(--color-text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 1rem;
  opacity: 0.8;
}

.contact-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.action-button {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-button:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.action-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.contact-info {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

.info-section {
  margin-bottom: 2rem;
}

.info-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.9rem;
  color: var(--color-text-light);
  opacity: 0.8;
}

.info-value {
  font-size: 1.1rem;
  color: var(--color-text);
  font-weight: 500;
}

.notes-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.system-info {
  font-size: 0.9rem;
  color: var(--color-text-light);
  opacity: 0.7;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contact-method-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.method-group-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: var(--color-heading);
  font-size: 1.1rem;
}

.method-icon {
  color: var(--color-primary);
}

.method-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background: var(--color-background-mute);
  border-radius: var(--border-radius);
}

.method-type {
  color: var(--color-text-light);
  font-size: 0.9rem;
  min-width: 80px;
}

.method-value {
  color: var(--color-primary);
  text-decoration: none;
}

.method-value:hover {
  text-decoration: underline;
}

.custom-fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.custom-field-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-label {
  color: var(--color-text-light);
  font-size: 0.9rem;
}

.field-value {
  color: var(--color-text);
}

.value-true {
  color: var(--color-success);
}

.value-false {
  color: var(--color-danger);
}

.loading-message,
.error-message,
.no-contact-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  text-align: center;
  color: var(--color-text);
}

.error-message {
  color: var(--color-danger);
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
}

.retry-button:hover {
  background: var(--color-primary-dark);
}

@media (max-width: 600px) {
  .contact-header {
    padding: 1rem;
    gap: 1rem;
  }

  .contact-avatar {
    width: 60px;
    height: 60px;
  }

  .avatar-icon {
    font-size: 1.5rem;
  }

  .contact-name {
    font-size: 1.4rem;
  }

  .contact-position {
    font-size: 0.9rem;
  }

  .action-button {
    width: 40px;
    height: 40px;
  }

  .contact-info {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 400px) {
  .contact-header {
    padding: 0.75rem;
  }

  .contact-avatar {
    width: 50px;
    height: 50px;
  }

  .avatar-icon {
    font-size: 1.25rem;
  }

  .contact-name {
    font-size: 1.2rem;
  }

  .contact-position {
    font-size: 0.8rem;
  }

  .action-button {
    width: 36px;
    height: 36px;
  }

  .contact-info {
    padding: 0.75rem;
  }
}
</style>
