<template>
  <div class="contact-list-wrapper" role="region" :aria-label="$t('contactList.ariaLabel')">
    <!-- هدر لیست مخاطبین -->
    <div class="header-container">
      <div class="header-row">
        <h1 class="page-title">
          <IconWrapper icon="address-book" prefix="fa-solid" class="title-icon" />
          {{ $t('contactList.title') }}
        </h1>
        <button
          @click="handleAddSampleContacts"
          class="add-sample-btn"
          :disabled="isAddingSamples"
          :aria-busy="isAddingSamples"
          :aria-label="$t('contactList.ariaAddSampleContacts')"
        >
          <IconWrapper icon="plus" prefix="fa-solid" class="btn-icon" />
          {{
            isAddingSamples ? $t('contactList.addingSamples') : $t('contactList.addSampleContacts')
          }}
        </button>
      </div>
    </div>

    <!-- هدر جستجو و مرتب‌سازی -->
    <ContactListHeader
      :search-query="searchQuery"
      :sort-field="sortField"
      :sort-order="sortOrder"
      :is-filter-section-visible="isFilterSectionVisible"
      :sort-options="sortOptions"
      @update:searchQuery="updateSearchQuery"
      @update:sortField="updateSortField"
      @update:sortOrder="updateSortOrder"
 @toggleFilterSection="isFilterSectionVisible = !isFilterSectionVisible"
      @add="addNewContact"
    />

    <!-- فیلتر پیشرفته -->
    <ContactListAdvancedFilter
      v-if="isFilterSectionVisible"
      v-model:modelValue="storeFilterRules"
      :filterable-fields="filterableFields"
      @apply="applyFilters"
      @clear="clearFilters"
    />

    <hr class="separator" aria-hidden="true" />

    <!-- وضعیت‌های مختلف نمایش -->
    <div v-if="isLoading" class="status-message loading" role="status" aria-live="polite">
      <IconWrapper icon="spinner" prefix="fa-solid" class="status-icon" animation="fa-spin" />
      {{ $t('contactList.loadingContacts') }}
    </div>

    <div v-else-if="hasError" class="status-message error" role="alert" aria-live="assertive">
      <IconWrapper icon="exclamation-circle" prefix="fa-solid" class="status-icon" />
      {{ contactStore.error }}
    </div>

    <div
      v-else-if="hasNoResults"
      class="status-message no-results"
      role="status"
      aria-live="polite"
    >
      <IconWrapper icon="info-circle" prefix="fa-solid" class="status-icon" />
      {{ $t('contactList.noContactsFound') }}
      <span v-if="hasActiveFilters" class="filter-hint">
        {{ $t('contactList.noMatchCriteria') }}
      </span>
    </div>

    <!-- لیست مخاطبین -->
    <ul v-else class="contact-list" role="list">
      <li
        v-for="item in contactsPreparedForDisplay"
        :key="item.contact.id"
        role="listitem"
        class="contact-list-item"
      >
        <ContactListItem
          :contact="item.contact"
          :loading="contactStore.loading"
          @edit="startEditingContact"
          @delete="confirmDeleteContact"
        />
      </li>
    </ul>

    <!-- صفحه‌بندی -->
    <ContactListPagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-items="totalContactsOnCurrentFilter"
      @prev-page="prevPage"
      @next-page="nextPage"
      @go-to-page="goToPage"
    />

    <!-- شمارشگر کل مخاطبین -->
    <div class="total-contacts" aria-live="polite">
      {{ $t('contactList.totalContacts', { count: totalContactsOnCurrentFilter }) }}
    </div>
  </div>
</template>

<script setup>
// فقط ایمپورت‌های مورد نیاز را نگه می‌داریم
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useContactStore } from '@/store/contacts'
import { useCustomFieldStore } from '@/store/customFields'
import { useGroupStore } from '@/store/groups'
import { useSettingsStore } from '@/store/settings'
import { useNotificationStore } from '@/store/notificationStore'
import { useErrorHandling } from '@/composables/useErrorHandling'
import IconWrapper from '@/components/common/IconWrapper.vue'
// این ایمپورت‌ها به نظر می‌رسه که در کامپوننت‌های فرزند استفاده می‌شن و می‌تونن حذف بشن
// import { formatGregorianDateToShamsi } from '@/utils/formatters'
// import { parseJalaaliStringToGregorianMoment } from '@/utils/formatters'
// import { formatCustomFieldValue } from '@/utils/formatters'
// import { displayGender } from '@/utils/formatters'
// import { displayPhoneType } from '@/utils/formatters'
// import { displayAddressType } from '@/utils/formatters'
// import moment from 'moment-jalaali'
// import { PersianDatePicker } from '@/components/common/commonComponents'
// import { sanitizeInput } from '@/utils/security'
import ContactListHeader from './ContactListHeader.vue'
import ContactListAdvancedFilter from './ContactListAdvancedFilter.vue'
import ContactListItem from './ContactListItem.vue'
import ContactListPagination from './ContactListPagination.vue'
// تنظیمات اولیه
const { t } = useI18n()
const router = useRouter()

// تعریف متغیرهای مربوط به فیلتر
const isFilterSectionVisible = ref(false)
const filterableFields = ref([])

// تعریف گزینه‌های مرتب‌سازی
const sortOptions = computed(() => [
  { value: 'firstName', label: t('contactList.sortBy.firstName') },
  { value: 'lastName', label: t('contactList.sortBy.lastName') },
  { value: 'email', label: t('contactList.sortBy.email') },
  { value: 'phone', label: t('contactList.sortBy.phone') },
  { value: 'createdAt', label: t('contactList.sortBy.createdAt') },
  { value: 'updatedAt', label: t('contactList.sortBy.updatedAt') },
])

// تابع تغییر وضعیت نمایش بخش فیلتر
function toggleFilterSection() {
  isFilterSectionVisible.value = !isFilterSectionVisible.value
}

// استفاده از استورها
const contactStore = useContactStore()
const customFieldStore = useCustomFieldStore()
const groupStore = useGroupStore()
const settingsStore = useSettingsStore()
const notificationStore = useNotificationStore()
const { handleAsyncError } = useErrorHandling()

// وضعیت‌های مختلف
const isInitialLoad = ref(true)

// Refs
const isAddingSamples = ref(false)

// Refs از استورها
const { displayColumns } = storeToRefs(settingsStore)
const { fieldDefinitions } = storeToRefs(customFieldStore)

// دریافت مقادیر از استور
const {
  filteredAndSortedContacts,
  filterRules: storeFilterRules,
  searchQuery: storeSearchQuery,
  sortField: storeSortField,
  sortOrder: storeSortOrder,
} = storeToRefs(contactStore)

// ===============================
// 1. وضعیت و داده‌های اصلی
// ===============================

/**
 * وضعیت در حال بارگذاری
 * @type {import('vue').ComputedRef<boolean>}
 */
const isLoading = computed(
  () => contactStore.loading || customFieldStore.loading || groupStore.loading,
)

/**
 * وجود خطا
 * @type {import('vue').ComputedRef<boolean>}
 */
const hasError = computed(() => contactStore.error || customFieldStore.error || groupStore.error)

// ===============================
// 8. مدیریت صفحه‌بندی
// ===============================
const itemsPerPage = ref(parseInt(contactStore.itemsPerPage) || 10)
const currentPage = ref(1)

// محاسبه تعداد کل صفحات
const totalPages = computed(() => {
  return Math.ceil(filteredAndSortedContacts.value.length / itemsPerPage.value)
})

// محاسبه لیست صفحه‌بندی شده
const paginatedContacts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredAndSortedContacts.value.slice(start, end)
})

// مدیریت تغییر صفحه
const handlePageChange = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    currentPage.value = newPage
  }
}

// مدیریت تغییر تعداد آیتم در هر صفحه
const handleItemsPerPageChange = (newSize) => {
  const size = parseInt(newSize)
  if (!isNaN(size)) {
    itemsPerPage.value = size
    currentPage.value = 1 // بازگشت به صفحه اول
    contactStore.setItemsPerPage(size)
  }
}

/**
 * لیست نهایی مخاطبین برای نمایش
 * @type {import('vue').ComputedRef<Array>}
 */
const contactsPreparedForDisplay = computed(() => {
  if (contactStore.loading || !contactStore.paginatedContacts) {
    return []
  }

  return contactStore.paginatedContacts.map((contact) => {
    const displayData = []

    // اضافه کردن فیلدهای استاندارد
    if (settingsStore.displayColumns.includes('name')) {
      displayData.push({
        key: 'name',
        label: t('form.name'),
        value: contact.name || '',
      })
    }

    if (settingsStore.displayColumns.includes('lastName')) {
      displayData.push({
        key: 'lastName',
        label: t('form.lastName'),
        value: contact.lastName || '',
      })
    }

    // اضافه کردن فیلدهای سفارشی
    settingsStore.displayColumns.forEach((columnKey) => {
      // از فیلدهای استاندارد که قبلاً اضافه شدند رد شو
      if (['name', 'lastName'].includes(columnKey)) {
        return
      }

      // پیدا کردن تعریف فیلد
      const fieldDef = customFieldStore.fieldDefinitions.find((f) => f.key === columnKey)
      if (!fieldDef) return

      // مقدار فیلد را از مخاطب بگیر
      const fieldValue = contact.customFields?.[columnKey]

      // فرمت کردن مقدار بر اساس نوع فیلد
      let displayValue = formatCustomFieldValue(fieldValue, fieldDef.type)

      displayData.push({
        key: columnKey,
        label: fieldDef.label,
        value: displayValue,
      })
    })

    return {
      contact: {
        ...contact,
        displayData,
      },
    }
  })
})

/**
 * تعداد کل مخاطبین با توجه به فیلترهای اعمال شده
 * @type {import('vue').ComputedRef<number>}
 */
const totalContactsOnCurrentFilter = computed(() => {
  return filteredAndSortedContacts.value.length
})

// توابع nextPage و prevPage از usePagination استفاده می‌شوند

/**
 * رفتن به صفحه خاص
 * @param {number} page - شماره صفحه مورد نظر
 */
function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// بررسی خالی بودن نتایج
const hasNoResults = computed(() => paginatedContacts.value.length === 0 && !contactStore.loading)

// بررسی فعال‌بودن فیلترها
const hasActiveFilters = computed(
  () =>
    contactStore.contacts.length > 0 &&
    (storeSearchQuery.value || storeFilterRules.value.length > 0),
)

// قوانین فیلتر جاری
const currentFilterRules = computed(() => storeFilterRules.value)

// ===============================
// 1. توابع مدیریت مخاطبین
// ===============================

/**
 * اضافه کردن مخاطبین نمونه
 * @async
 */
const handleAddSampleContacts = async () => {
  isAddingSamples.value = true
  try {
    const result = await contactStore.addSampleContacts(t)
    
    // اگر کاربر عملیات را لغو کرده یا نتیجه تعریف نشده باشد
    if (!result) {
      notificationStore.showNotification({
        type: 'info',
        message: t('contactList.operationCancelled')
      })
      return
    }
    
    // اگر نتیجه موفقیت‌آمیز بود
    if (result.success) {
      notificationStore.showNotification({
        type: 'success',
        message: result.message || t('contactList.samplesAddedSuccessfully')
      })
    } else {
      // اگر خطایی رخ داده باشد
      notificationStore.showError({
        message: result.message || t('contactList.errorAddingSamples'),
        error: result.error
      })
    }
  } catch (error) {
    // اگر خطای غیرمنتظره‌ای رخ داده باشد
    console.error('Error in handleAddSampleContacts:', error)
    notificationStore.showError({
      message: t('contactList.errorAddingSamples'),
      error: error.message
    })
  } finally {
    isAddingSamples.value = false
  }
}

/**
 * شروع ویرایش مخاطب
 * @param {Object} contact - شیء مخاطب برای ویرایش
 */
const startEditingContact = (contact) => {
  router.push({ name: 'edit-contact', params: { id: contact.id } })
}

/**
 * تایید حذف مخاطب
 * @param {string} contactId - شناسه مخاطب برای حذف
 */
const confirmDeleteContact = async (contactId) => {
  await handleAsyncError(async () => {
    const confirmed = await notificationStore.showConfirm(
      t('contactList.confirmDelete'),
      t('common.warning'),
    )

    if (confirmed) {
      await contactStore.deleteContact(contactId)
      notificationStore.showSuccess(t('contactList.contactDeleted'))
    }
  }, 'خطا در حذف مخاطب')
}

// ===============================
// 4. فیلتر پیشرفته
// ===============================

// اضافه کردن قانون فیلتر جدید
function addNewRule() {
  const newRules = [
    ...storeFilterRules.value,
    {
      field: '',
      operator: 'contains',
      value: '',
    },
  ]
  contactStore.setFilterRules(newRules)
}

// حذف قانون فیلتر
function removeRule(index) {
  const newRules = [...storeFilterRules.value]
  newRules.splice(index, 1)
  contactStore.setFilterRules(newRules)
}

/**
 * اعمال فیلترها
 */
const applyFilters = () => {
  contactStore.applyFilters()
}

/**
 * پاک کردن تمام فیلترها
 */
const clearFilters = () => {
  contactStore.clearFilterRules()
  isFilterSectionVisible.value = false
}

// ===============================
// 3. صفحه‌بندی و اسکرول
// ===============================

/**
 * رفتن به صفحه بعدی همراه با اسکرول به بالای صفحه
 */
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    handlePageChange(currentPage.value + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

/**
 * رفتن به صفحه قبلی همراه با اسکرول به بالای صفحه
 */
const prevPage = () => {
  if (currentPage.value > 1) {
    handlePageChange(currentPage.value - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// ===============================
// 5. محاسبه‌شده‌های اضافی
// ===============================
// (کد به بخش 2 منتقل شد)

// ===============================
// 6. چرخه حیات
// ===============================

// بارگذاری اولیه داده‌ها
onMounted(async () => {
  try {
    await Promise.all([
      contactStore.loadContacts(),
      customFieldStore.loadFieldDefinitions(),
      groupStore.loadGroups(),
    ])
    isInitialLoad.value = false
  } catch (error) {
    console.error('خطا در بارگذاری داده‌های اولیه:', error)
    notificationStore.showError(t('errors.failedToLoadData'))
  }
})

// پاک‌سازی منابع در هنگام از بین رفتن کامپوننت
onUnmounted(() => {
  // پاک کردن فیلترها و جستجو هنگام ترک صفحه
  contactStore.clearFilterRules()
  contactStore.setSearchQuery('')
})
// filterableFields از useContactFilters ایمپورت شده و در آنجا تعریف می‌شود.

const availableOperators = computed(() => {
  const fieldDef = selectedNewRuleFieldDefinition.value
  const type = fieldDef?.type
  const operators = {
    text: [
      { value: 'equals', label: t('contactList.operators.equals') },
      { value: 'notEquals', label: t('contactList.operators.notEquals') },
      { value: 'contains', label: t('contactList.operators.contains') },
      { value: 'notContains', label: t('contactList.operators.notContains') },
      { value: 'startsWith', label: t('contactList.operators.startsWith') },
      { value: 'endsWith', label: t('contactList.operators.endsWith') },
    ],
    textarea: [
      { value: 'equals', label: t('contactList.operators.equals') },
      { value: 'notEquals', label: t('contactList.operators.notEquals') },
      { value: 'contains', label: t('contactList.operators.contains') },
      { value: 'notContains', label: t('contactList.operators.notContains') },
    ],
    number: [
      { value: 'equals', label: t('contactList.operators.equals') },
      { value: 'notEquals', label: t('contactList.operators.notEquals') },
      { value: 'greaterThan', label: t('contactList.operators.greaterThan') },
      { value: 'lessThan', label: t('contactList.operators.lessThan') },
      { value: 'greaterThanOrEqual', label: t('contactList.operators.greaterThanOrEqual') },
      { value: 'lessThanOrEqual', label: t('contactList.operators.lessThanOrEqual') },
    ],
    date: [
      { value: 'equals', label: t('contactList.operators.dateEquals') },
      { value: 'notEquals', label: t('contactList.operators.dateNotEquals') },
      { value: 'isBefore', label: t('contactList.operators.isBefore') },
      { value: 'isAfter', label: t('contactList.operators.isAfter') },
      { value: 'isSameOrBefore', label: t('contactList.operators.isSameOrBefore') },
      { value: 'isSameOrAfter', label: t('contactList.operators.isSameOrAfter') },
    ],
    boolean: [
      { value: 'equals', label: t('contactList.operators.booleanEquals') },
      { value: 'notEquals', label: t('contactList.operators.booleanNotEquals') },
    ],
    select: [
      { value: 'equals', label: t('contactList.operators.equals') },
      { value: 'notEquals', label: t('contactList.operators.notEquals') },
    ],
  }
  const commonOperators = [
    { value: 'isNull', label: t('contactList.operators.isNull') },
    { value: 'isNotNull', label: t('contactList.operators.isNotNull') },
  ]

  const typeOperators = operators[type] || []
  return [...typeOperators, ...commonOperators]
})

/**
 * گزینه‌های مقدار برای فیلدهای انتخاب شده
 */
const valueSelectOptions = computed(() => {
  const fieldDef = selectedNewRuleFieldDefinition.value
  if (!fieldDef) return []

  const options = []

  if (
    fieldDef.type === 'select' ||
    fieldDef.type === 'boolean' ||
    fieldDef.type === 'gender' ||
    fieldDef.type === 'group'
  ) {
    if (fieldDef.value === 'gender' || fieldDef.type === 'gender') {
      options.push(
        { label: 'مرد', value: 'male' },
        { label: 'زن', value: 'female' },
        { label: 'دیگر', value: 'other' },
      )
    } else if (fieldDef.value === 'group' || fieldDef.type === 'group') {
      groupStore.groups.forEach((group) => {
        options.push({ label: group.name, value: group.id })
      })
      options.unshift({ label: 'بدون گروه', value: '' })
    } else if (fieldDef.id && fieldDef.type === 'select') {
      const customFieldDefinition = fieldDefinitions.value.find((def) => def.id === fieldDef.id)
      if (customFieldDefinition?.options) {
        customFieldDefinition.options.forEach((opt) => {
          if (typeof opt === 'string') {
            options.push({ label: opt, value: opt })
          } else {
            options.push({ label: opt.label || opt.value, value: opt.value })
          }
        })
      }
    } else if (fieldDef.type === 'boolean') {
      options.push({ label: t('common.yes'), value: true }, { label: t('common.no'), value: false })
    }
  }

  return options
})

const getRuleOperatorLabel = (rule) => {
  if (!rule || rule.operator === null || rule.operator === undefined) {
    return String(rule?.operator || '')
  }

  const fieldDef = filterableFields.value.find((f) => f.value === rule.field)
  const type = fieldDef?.type

  const allPossibleOperators = {
    text: [
      { value: 'equals', label: t('contactList.operators.equals') },
      { value: 'notEquals', label: t('contactList.operators.notEquals') },
      { value: 'contains', label: t('contactList.operators.contains') },
      { value: 'notContains', label: t('contactList.operators.notContains') },
      { value: 'startsWith', label: t('contactList.operators.startsWith') },
      { value: 'endsWith', label: t('contactList.operators.endsWith') },
    ],
    textarea: [
      { value: 'equals', label: t('contactList.operators.equals') },
      { value: 'notEquals', label: t('contactList.operators.notEquals') },
      { value: 'contains', label: t('contactList.operators.contains') },
      { value: 'notContains', label: t('contactList.operators.notContains') },
    ],
    number: [
      { value: 'equals', label: t('contactList.operators.equals') },
      { value: 'notEquals', label: t('contactList.operators.notEquals') },
      { value: 'greaterThan', label: t('contactList.operators.greaterThan') },
      { value: 'lessThan', label: t('contactList.operators.lessThan') },
      { value: 'greaterThanOrEqual', label: t('contactList.operators.greaterThanOrEqual') },
      { value: 'lessThanOrEqual', label: t('contactList.operators.lessThanOrEqual') },
    ],
    date: [
      { value: 'equals', label: t('contactList.operators.dateEquals') },
      { value: 'notEquals', label: t('contactList.operators.dateNotEquals') },
      { value: 'isBefore', label: t('contactList.operators.isBefore') },
      { value: 'isAfter', label: t('contactList.operators.isAfter') },
      { value: 'isSameOrBefore', label: t('contactList.operators.isSameOrBefore') },
      { value: 'isSameOrAfter', label: t('contactList.operators.isSameOrAfter') },
    ],
    boolean: [
      { value: 'equals', label: t('contactList.operators.booleanEquals') },
      { value: 'notEquals', label: t('contactList.operators.booleanNotEquals') },
    ],
    select: [
      { value: 'equals', label: t('contactList.operators.equals') },
      { value: 'notEquals', label: t('contactList.operators.notEquals') },
    ],
    gender: [
      { value: 'equals', label: t('contactList.operators.equals') },
      { value: 'notEquals', label: t('contactList.operators.notEquals') },
      { value: 'isNull', label: t('contactList.operators.isNull') },
      { value: 'isNotNull', label: t('contactList.operators.isNotNull') },
    ],
    group: [
      { value: 'equals', label: t('contactList.operators.equals') },
      { value: 'notEquals', label: t('contactList.operators.notEquals') },
      { value: 'isNull', label: t('contactList.operators.isNull') },
      { value: 'isNotNull', label: t('contactList.operators.isNotNull') },
    ],
    addressPart: [
      { value: 'equals', label: t('contactList.operators.equals') },
      { value: 'notEquals', label: t('contactList.operators.notEquals') },
      { value: 'contains', label: t('contactList.operators.contains') },
      { value: 'notContains', label: t('contactList.operators.notContains') },
      { value: 'isNull', label: t('contactList.operators.isNull') },
      { value: 'isNotNull', label: t('contactList.operators.isNotNull') },
    ],
  }
  const commonOperators = [
    { value: 'isNull', label: t('contactList.operators.isNull') },
    { value: 'isNotNull', label: t('contactList.operators.isNotNull') },
  ]

  const typeOperators = allPossibleOperators[type] || []
  const combinedOperators = [...typeOperators]
  commonOperators.forEach((commonOp) => {
    if (!combinedOperators.find((op) => op.value === commonOp.value)) {
      combinedOperators.push(commonOp)
    }
  })

  const operatorObj = combinedOperators.find((op) => op.value === rule.operator)

  return operatorObj?.label || String(rule.operator)
}

const formatRuleValue = (rule) => {
  if (rule.value === null || rule.value === undefined || rule.value === '') {
    if (rule.operator !== 'isNull' && rule.operator !== 'isNotNull') return ''
  }

  const fieldDef = filterableFields.value.find((f) => f.value === rule.field)
  const type = fieldDef?.type

  switch (type) {
    case 'date':
      return formatGregorianDateToShamsi(rule.value)
    case 'boolean':
      return rule.value ? t('contactList.booleanOptions.yes') : t('contactList.booleanOptions.no')
    case 'gender':
      return displayGender(rule.value)
    case 'group':
      return rule.value === '' ? t('contactList.noGroup') : rule.value
    case 'select':
      const customSelectDef = customFieldStore.fieldDefinitions.find((def) => def.id === rule.field)
      if (customSelectDef) {
        const option = customSelectDef.options?.find(
          (opt) =>
            (typeof opt === 'string' && opt === rule.value) ||
            (typeof opt === 'object' && opt.value === rule.value),
        )
        return option ? option.label || option.value : rule.value
      }
      return String(rule.value)
    case 'number':
      return Number(rule.value)
    case 'text':
    case 'textarea':
    default:
      return String(rule.value)
  }
}

// ===============================
// 9. محاسبه‌شده‌های وضعیت نمایش
// ===============================

/**
 * بررسی خالی بودن نتایج جستجو
 * @type {import('vue').ComputedRef<boolean>}
 */
const isEmptyResults = computed(() => {
  return !isLoading.value && !hasError.value && contactsPreparedForDisplay.value.length === 0
})

// ===============================
// 10. مدیریت به‌روزرسانی‌ها
// ===============================

/**
 * مدیریت به‌روزرسانی عبارت جستجو
 * @param {string} newValue - مقدار جدید برای جستجو
 */
function handleSearchQueryUpdate(newValue) {
  contactStore.setSearchQuery(newValue)
}

/**
 * مدیریت به‌روزرسانی فیلد مرتب‌سازی
 * @param {string} newValue - فیلد جدید برای مرتب‌سازی
 */
function handleSortFieldUpdate(newValue) {
  contactStore.setSortCriteria(newValue, contactStore.sortOrder)
}

/**
 * مدیریت به‌روزرسانی جهت مرتب‌سازی
 * @param {string} newValue - جهت جدید برای مرتب‌سازی ('asc' یا 'desc')
 */
function handleSortOrderUpdate(newValue) {
  contactStore.setSortCriteria(contactStore.sortField, newValue)
}

// ===============================
// 11. اکسپورت‌ها
// ===============================

// اکسپورت متغیرها و توابع برای استفاده در تمپلیت
// ... existing code ...
</script>
