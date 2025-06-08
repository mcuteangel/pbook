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
      v-model:searchQuery="searchQuery"
      v-model:sortField="sortField"
      v-model:sortOrder="sortOrder"
      :is-filter-section-visible="isFilterSectionVisible"
      :sort-options="sortOptions"
      @toggleFilterSection="isFilterSectionVisible = !isFilterSectionVisible"
      @add="addNewContact"
    />

    <!-- فیلتر پیشرفته -->
    <ContactListAdvancedFilter
      v-if="isFilterSectionVisible"
      v-model:modelValue="filterRules"
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
        :key="item.id"
        role="listitem"
        class="contact-list-item"
      >
        <ContactListItem
          :contact="item"
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
// ایمپورت‌های Vue و کامپوزابل‌ها
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

// سرویس‌ها
import { useNotification } from '../../services/notification.service'

// استورها
import { useContactStore } from '../../store/contacts'
import { useCustomFieldStore } from '../../store/customFields'
import { useGroupStore } from '../../store/groups'
import { useSettingsStore } from '../../store/settings'

// کامپوننت‌ها
import IconWrapper from '../common/IconWrapper.vue'
import ContactListHeader from './ContactListHeader.vue'
import ContactListAdvancedFilter from './ContactListAdvancedFilter.vue'
import ContactListItem from './ContactListItem.vue'
import ContactListPagination from './ContactListPagination.vue'
import { useContactList } from '@/composables/useContactList'
import { useContactFilters } from '@/composables/useContactFilters'
import { usePagination } from '@/composables/usePagination'
import { formatCustomFieldValue } from '@/utils/formatters/index'

// تنظیمات اولیه
const { t } = useI18n()
const router = useRouter()

// استفاده از استورها و سرویس‌ها
const contactStore = useContactStore()
const customFieldStore = useCustomFieldStore()
const groupStore = useGroupStore()
const settingsStore = useSettingsStore()

// Refs از استورها برای استفاده در computed properties
const { groups: allGroups } = storeToRefs(groupStore)
const { fieldDefinitions: customFieldDefinitions } = storeToRefs(customFieldStore)
const notificationService = useNotification()

// استفاده از کامپوزابل‌ها
const {
  isFilterSectionVisible,
  isAddingSamples,
  isLoading,
  hasError,
  hasNoResults,
  hasActiveFilters,
  handleAddSampleContacts,
  loadInitialData,
  searchQuery,
  sortField,
  sortOrder,
  updateSearchQuery,
  updateSortField,
  updateSortOrder,
} = useContactList()

const {
  filterableFields,
  getOperatorsForField,
  formatFilterValue,
  defaultFilters,
  filterRules,
  applyFilters,
  clearFilters,
} = useContactFilters()

const {
  currentPage,
  pageSize,
  totalPages,
  paginatedItems,
  hasNextPage,
  hasPrevPage,
  nextPage,
  prevPage,
  goToPage,
  setPageSize,
} = usePagination(computed(() => contactStore.filteredAndSortedContacts))

// تعریف گزینه‌های مرتب‌سازی
const sortOptions = computed(() => [
  { value: 'firstName', label: t('contactList.sortBy.firstName') },
  { value: 'lastName', label: t('contactList.sortBy.lastName') },
  { value: 'email', label: t('contactList.sortBy.email') },
  { value: 'phone', label: t('contactList.sortBy.phone') },
  { value: 'createdAt', label: t('contactList.sortBy.createdAt') },
  { value: 'updatedAt', label: t('contactList.sortBy.updatedAt') },
])

// دریافت مقادیر از استور
const { filteredAndSortedContacts } = storeToRefs(contactStore)

// Refs از استورها
const { displayColumns } = storeToRefs(settingsStore)

// چرخه حیات
onMounted(() => {
  loadInitialData()
})

onUnmounted(() => {
  // حذف فیلترها و جستجو
  clearFilters()
  updateSearchQuery('')
})

/**
 * لیست نهایی مخاطبین برای نمایش
 * @type {import('vue').ComputedRef<Array>}
 */
const contactsPreparedForDisplay = computed(() => {
  console.log('isLoading:', isLoading.value)
  console.log('paginatedItems:', paginatedItems.value)

  if (isLoading.value || !paginatedItems.value) {
    return []
  }

  const result = paginatedItems.value.map((contact) => {
    console.log('Processing contact:', contact)
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
      ...contact,
      displayData,
    }
  })

  console.log('Final result:', result)
  return result
})

/**
 * تعداد کل مخاطبین با توجه به فیلترهای اعمال شده
 * @type {import('vue').ComputedRef<number>}
 */
const totalContactsOnCurrentFilter = computed(() => {
  return filteredAndSortedContacts.value.length
})

// ===============================
// 1. توابع مدیریت مخاطبین
// ===============================

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
    const confirmed = await notificationService.showConfirm(
      t('contactList.confirmDelete'),
      t('common.warning'),
    )

    if (confirmed) {
      await contactStore.deleteContact(contactId)
      notificationService.showSuccess(t('contactList.contactDeleted'))
    }
  }, 'خطا در حذف مخاطب')
}

// ===============================
// 4. فیلتر پیشرفته
// ===============================

// اضافه کردن قانون فیلتر جدید
function addNewRule() {
  const newRules = [
    ...filterRules.value,
    {
      field: '',
      operator: 'contains',
      value: '',
    },
  ]
  filterRules.value = newRules
}

// حذف قانون فیلتر
function removeRule(index) {
  const newRules = [...filterRules.value]
  newRules.splice(index, 1)
  filterRules.value = newRules
}

// ===============================
// 10. مدیریت به‌روزرسانی‌ها
// ===============================

/**
 * بررسی خالی بودن نتایج جستجو
 * @type {import('vue').ComputedRef<boolean>}
 */
const isEmptyResults = computed(() => {
  return !isLoading.value && !hasError.value && contactsPreparedForDisplay.value.length === 0
})

// اضافه کردن تابع addNewContact
const addNewContact = () => {
  router.push({ name: 'add-contact' })
}
</script>
