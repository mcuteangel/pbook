<template>
  <div class="contact-list-wrapper">
    <h2>
      <span style="margin-left: 6px"><IconWrapper icon="fa-solid fa-magnifying-glass" /></span>
      {{ $t('contactList.title') }}
    </h2>

    <ContactListHeader
      v-model:searchQuery="contactStore.searchQuery"
      v-model:sortField="contactStore.sortField"
      v-model:sortOrder="contactStore.sortOrder"
      :sortOptions="sortOptions"
      :isFilterSectionVisible="isFilterSectionVisible"
      @toggleFilterSection="toggleFilterSection"
    />

    <ContactListAdvancedFilter
      v-if="isFilterSectionVisible"
      :filterRules="currentFilterRules"
      :filterableFields="filterableFields"
      :valueSelectOptions="valueSelectOptions"
      @addRule="addNewRule"
      @removeRule="removeRule"
      @applyFilters="applyFilters"
      @clearFilters="clearFilters"
    />

    <hr class="separator" />
    <div v-if="contactStore.loading" class="status-message loading">
      <span style="font-size: 1.2em">⏳</span> {{ $t('contactList.loadingContacts') }}
    </div>
    <div v-else-if="contactStore.error" class="status-message error">
      <span style="font-size: 1.2em">❗</span>
      {{ contactStore.error }}
    </div>
    <div v-else-if="paginatedContacts.length === 0" class="status-message no-results">
      <span style="font-size: 1.2em">⚠️</span> {{ $t('contactList.noContactsFound') }}
      <span
        v-if="
          contactStore.contacts.length > 0 &&
          (contactStore.searchQuery || contactStore.filterRules.length > 0)
        "
      >
        ({{ $t('contactList.noMatchCriteria') }})
      </span>
    </div>

    <ul v-else class="contact-list">
      <ContactListItem
        v-for="contactItem in contactsPreparedForDisplay"
        :key="contactItem.contact.id"
        :contact="contactItem"
        :loading="contactStore.loading"
        @edit="startEditingContact"
        @delete="confirmDeleteContact"
      />
    </ul>

    <ContactListPagination
      v-if="totalPages > 1"
      :currentPage="currentPage"
      :totalPages="totalPages"
      @prevPage="prevPage"
      @nextPage="nextPage"
      @goToPage="goToPage"
    />

    <div class="total-contacts">
      {{ $t('contactList.totalContacts') }}: {{ totalContactsOnCurrentFilter }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useFiltering } from '@/composables/useFiltering'
import { usePagination } from '@/composables/usePagination'
import { useContactStore } from '@/store/contacts'
import { useCustomFieldStore } from '@/store/customFields'
import { useGroupStore } from '@/store/groups'
import { useSettingsStore } from '@/store/settings'
import { useRouter } from 'vue-router'
import {
  formatGregorianDateToShamsi,
  parseJalaaliStringToGregorianMoment,
  formatCustomFieldValue,
  displayGender,
  displayPhoneType,
  displayAddressType,
} from '@/utils/formatters'
import moment from 'moment-jalaali'
import { IconWrapper, PersianDatePicker } from '@/components/common/commonComponents'
import ContactListHeader from './ContactListHeader.vue'
import ContactListAdvancedFilter from './ContactListAdvancedFilter.vue'
import ContactListItem from './ContactListItem.vue'
import ContactListPagination from './ContactListPagination.vue'

const contactStore = useContactStore()
const customFieldStore = useCustomFieldStore()
const groupStore = useGroupStore()
const settingsStore = useSettingsStore()
const router = useRouter()
const { t } = useI18n()

const { displayColumns } = storeToRefs(settingsStore)
const { fieldDefinitions } = storeToRefs(customFieldStore)
const { filteredAndSortedContacts } = storeToRefs(contactStore)

const contactsPreparedForDisplay = ref([])

const standardFieldLabels = computed(() => ({
  phone: t('contactList.fields.phone'),
  group: t('contactList.fields.group'),
  birthDate: t('contactList.fields.birthDate'),
  title: t('contactList.fields.title'),
  createdAt: t('contactList.fields.createdAt'),
  updatedAt: t('contactList.fields.updatedAt'),
  'address.city': t('contactList.fields.addressCity'),
  'address.street': t('contactList.fields.addressStreet'),
  notes: t('contactList.fields.notes'),
  gender: t('contactList.fields.gender'),
}))

const standardFieldTypes = {
  phone: 'text',
  group: 'group',
  birthDate: 'date',
  title: 'text',
  createdAt: 'date',
  updatedAt: 'date',
  'address.city': 'addressPart',
  'address.street': 'addressPart',
  notes: 'textarea',
  gender: 'gender',
}

const isFilterSectionVisible = ref(false)
const toggleFilterSection = () => {
  isFilterSectionVisible.value = !isFilterSectionVisible.value
}

// استفاده از کامپوزابل فیلترینگ
const filterContacts = (contact, rules) => {
  return rules.every(rule => {
    // منطق فیلتر کردن مخاطبین براساس قوانین فیلتر
    // این منطق با منطق قبلی یکسان است و فقط به صورت منسجم‌تر در اینجا قرار می‌گیرد
    return contactStore.filterContact(contact, rule);
  });
};

const {
  filterRules: currentFilterRules,
  addFilterRule,
  removeFilterRule,
  clearFilters: clearFilterRules
} = useFiltering(contactStore.contacts, filterContacts);

const newRule = ref({
  field: null,
  operator: null,
  value: null,
})

watch(
  () => newRule.value.field,
  (newField, oldField) => {
    if (newField !== oldField) {
      newRule.value.operator = null
      newRule.value.value = null
    }
  },
)

const filterableFields = computed(() => {
  const standardFields = [
    { value: 'name', label: this.$t('contactList.fields.name'), type: 'text' },
    { value: 'lastName', label: this.$t('contactList.fields.lastName'), type: 'text' },
    { value: 'phone', label: this.$t('contactList.fields.phone'), type: 'text' },
    { value: 'title', label: this.$t('contactList.fields.title'), type: 'text' },
    { value: 'notes', label: this.$t('contactList.fields.notes'), type: 'textarea' },
    { value: 'createdAt', label: this.$t('contactList.fields.createdAt'), type: 'date' },
    { value: 'updatedAt', label: this.$t('contactList.fields.updatedAt'), type: 'date' },
    { value: 'birthDate', label: this.$t('contactList.fields.birthDate'), type: 'date' },
    { value: 'gender', label: this.$t('contactList.fields.gender'), type: 'select' },
    { value: 'group', label: this.$t('contactList.fields.group'), type: 'select' },
  ]

  const customFields = fieldDefinitions.value.map((field) => ({
    value: field.id,
    label: `فیلد سفارشی: ${field.label}`,
    type: field.type,
  }))

  return [...standardFields, ...customFields]
})

const selectedNewRuleFieldDefinition = computed(() => {
  if (!newRule.value.field) return null
  const field = filterableFields.value.find((f) => f.value === newRule.value.field)
  if (field?.value && !standardFieldLabels[field.value]) {
    const customFieldId = field.value
    return fieldDefinitions.value.find((def) => def.id === customFieldId)
  }
  return field
})

const availableOperators = computed(() => {
  const fieldDef = selectedNewRuleFieldDefinition.value
  const type = fieldDef?.type
  const operators = {
    text: [
      { value: 'equals', label: this.$t('contactList.operators.equals') },
      { value: 'notEquals', label: this.$t('contactList.operators.notEquals') },
      { value: 'contains', label: this.$t('contactList.operators.contains') },
      { value: 'notContains', label: this.$t('contactList.operators.notContains') },
      { value: 'startsWith', label: this.$t('contactList.operators.startsWith') },
      { value: 'endsWith', label: this.$t('contactList.operators.endsWith') },
    ],
    textarea: [
      { value: 'equals', label: this.$t('contactList.operators.equals') },
      { value: 'notEquals', label: this.$t('contactList.operators.notEquals') },
      { value: 'contains', label: this.$t('contactList.operators.contains') },
      { value: 'notContains', label: this.$t('contactList.operators.notContains') },
    ],
    number: [
      { value: 'equals', label: this.$t('contactList.operators.equals') },
      { value: 'notEquals', label: this.$t('contactList.operators.notEquals') },
      { value: 'greaterThan', label: this.$t('contactList.operators.greaterThan') },
      { value: 'lessThan', label: this.$t('contactList.operators.lessThan') },
      { value: 'greaterThanOrEqual', label: this.$t('contactList.operators.greaterThanOrEqual') },
      { value: 'lessThanOrEqual', label: this.$t('contactList.operators.lessThanOrEqual') },
    ],
    date: [
      { value: 'equals', label: this.$t('contactList.operators.dateEquals') },
      { value: 'notEquals', label: this.$t('contactList.operators.dateNotEquals') },
      { value: 'isBefore', label: this.$t('contactList.operators.isBefore') },
      { value: 'isAfter', label: this.$t('contactList.operators.isAfter') },
      { value: 'isSameOrBefore', label: this.$t('contactList.operators.isSameOrBefore') },
      { value: 'isSameOrAfter', label: this.$t('contactList.operators.isSameOrAfter') },
    ],
    boolean: [
      { value: 'equals', label: this.$t('contactList.operators.booleanEquals') },
      { value: 'notEquals', label: this.$t('contactList.operators.booleanNotEquals') },
    ],
    select: [
      { value: 'equals', label: this.$t('contactList.operators.equals') },
      { value: 'notEquals', label: this.$t('contactList.operators.notEquals') },
    ],
  }
  const commonOperators = [
    { value: 'isNull', label: this.$t('contactList.operators.isNull') },
    { value: 'isNotNull', label: this.$t('contactList.operators.isNotNull') },
  ]

  const typeOperators = operators[type] || []
  return [...typeOperators, ...commonOperators]
})

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
        options.push({ label: group.name, value: group.name })
      })
      options.unshift({ label: 'بدون گروه', value: '' })
    } else if (fieldDef.id && fieldDef.type === 'select') {
      const customFieldDefinition = fieldDefinitions.value.find((def) => def.id === fieldDef.id)
      if (customFieldDefinition && customFieldDefinition.options) {
        customFieldDefinition.options.forEach((opt) => {
          if (typeof opt === 'string') {
            options.push({ label: opt, value: opt })
          } else {
            options.push({ label: opt.label || opt.value, value: opt.value })
          }
        })
      }
    } else if (fieldDef.type === 'boolean') {
      options.push({ label: 'بله', value: true }, { label: 'خیر', value: false })
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
      { value: 'equals', label: this.$t('contactList.operators.equals') },
      { value: 'notEquals', label: this.$t('contactList.operators.notEquals') },
      { value: 'contains', label: this.$t('contactList.operators.contains') },
      { value: 'notContains', label: this.$t('contactList.operators.notContains') },
      { value: 'startsWith', label: this.$t('contactList.operators.startsWith') },
      { value: 'endsWith', label: this.$t('contactList.operators.endsWith') },
    ],
    textarea: [
      { value: 'equals', label: this.$t('contactList.operators.equals') },
      { value: 'notEquals', label: this.$t('contactList.operators.notEquals') },
      { value: 'contains', label: this.$t('contactList.operators.contains') },
      { value: 'notContains', label: this.$t('contactList.operators.notContains') },
    ],
    number: [
      { value: 'equals', label: this.$t('contactList.operators.equals') },
      { value: 'notEquals', label: this.$t('contactList.operators.notEquals') },
      { value: 'greaterThan', label: this.$t('contactList.operators.greaterThan') },
      { value: 'lessThan', label: this.$t('contactList.operators.lessThan') },
      { value: 'greaterThanOrEqual', label: this.$t('contactList.operators.greaterThanOrEqual') },
      { value: 'lessThanOrEqual', label: this.$t('contactList.operators.lessThanOrEqual') },
    ],
    date: [
      { value: 'equals', label: this.$t('contactList.operators.dateEquals') },
      { value: 'notEquals', label: this.$t('contactList.operators.dateNotEquals') },
      { value: 'isBefore', label: this.$t('contactList.operators.isBefore') },
      { value: 'isAfter', label: this.$t('contactList.operators.isAfter') },
      { value: 'isSameOrBefore', label: this.$t('contactList.operators.isSameOrBefore') },
      { value: 'isSameOrAfter', label: this.$t('contactList.operators.isSameOrAfter') },
    ],
    boolean: [
      { value: 'equals', label: this.$t('contactList.operators.booleanEquals') },
      { value: 'notEquals', label: this.$t('contactList.operators.booleanNotEquals') },
    ],
    select: [
      { value: 'equals', label: this.$t('contactList.operators.equals') },
      { value: 'notEquals', label: this.$t('contactList.operators.notEquals') },
    ],
    gender: [
      { value: 'equals', label: this.$t('contactList.operators.equals') },
      { value: 'notEquals', label: this.$t('contactList.operators.notEquals') },
      { value: 'isNull', label: this.$t('contactList.operators.isNull') },
      { value: 'isNotNull', label: this.$t('contactList.operators.isNotNull') },
    ],
    group: [
      { value: 'equals', label: this.$t('contactList.operators.equals') },
      { value: 'notEquals', label: this.$t('contactList.operators.notEquals') },
      { value: 'isNull', label: this.$t('contactList.operators.isNull') },
      { value: 'isNotNull', label: this.$t('contactList.operators.isNotNull') },
    ],
    addressPart: [
      { value: 'equals', label: this.$t('contactList.operators.equals') },
      { value: 'notEquals', label: this.$t('contactList.operators.notEquals') },
      { value: 'contains', label: this.$t('contactList.operators.contains') },
      { value: 'notContains', label: this.$t('contactList.operators.notContains') },
      { value: 'isNull', label: this.$t('contactList.operators.isNull') },
      { value: 'isNotNull', label: this.$t('contactList.operators.isNotNull') },
    ],
  }
  const commonOperators = [
    { value: 'isNull', label: this.$t('contactList.operators.isNull') },
    { value: 'isNotNull', label: this.$t('contactList.operators.isNotNull') },
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
  const type = fieldDef?.type || 'text'

  switch (type) {
    case 'date':
      return formatGregorianDateToShamsi(rule.value)
    case 'boolean':
      return rule.value
        ? this.$t('contactList.booleanOptions.yes')
        : this.$t('contactList.booleanOptions.no')
    case 'gender':
      return displayGender(rule.value)
    case 'group':
      return rule.value === '' ? this.$t('contactList.noGroup') : rule.value
    case 'select':
      const customSelectDef = fieldDefinitions.value.find((def) => def.id === rule.field)
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

const addNewRule = () => {
  const rule = newRule.value
  const fieldDef = selectedNewRuleFieldDefinition.value

  if (!rule.field || !rule.operator) {
    alert(this.$t('contactList.selectFieldAndOperatorAlert'))
    return
  }
  const requiresValue = rule.operator !== 'isNull' && rule.operator !== 'isNotNull'
  if (requiresValue && (rule.value === null || rule.value === '')) {
    alert(this.$t('contactList.enterFilterValueAlert'))
    return
  }

  let valueToStore = rule.value

  if (requiresValue && fieldDef) {
    switch (fieldDef.type) {
      case 'number':
        valueToStore = Number(rule.value)
        if (isNaN(valueToStore)) {
          alert(this.$t('contactList.invalidNumberAlert'))
          return
        }
        break
      case 'date':
        const jalaaliMoment = parseJalaaliStringToGregorianMoment(rule.value)
        if (!jalaaliMoment || !jalaaliMoment.isValid()) {
          alert(this.$t('contactList.invalidDateAlert'))
          return
        }
        valueToStore = jalaaliMoment.format('YYYY-MM-DD')
        break
      case 'boolean':
        valueToStore = rule.value
        break
      case 'select':
      case 'gender':
      case 'group':
        valueToStore = rule.value
        break
      case 'text':
      case 'textarea':
      default:
        valueToStore = String(rule.value)
        break
    }
  }

  // استفاده از تابع addFilterRule از کامپوزابل
  addFilterRule({
    field: rule.field,
    operator: rule.operator,
    value: valueToStore,
  })

  newRule.value = {
    field: null,
    operator: null,
    value: null,
  }
}

// استفاده از تابع removeFilterRule از کامپوزابل
const removeRule = (index) => {
  removeFilterRule(index)
  applyFilters()
}

const applyFilters = () => {
  contactStore.setFilterRules(currentFilterRules.value)
}

const clearFilters = () => {
  clearFilterRules()
  contactStore.setFilterRules([])
}

// استفاده از کامپوزابل صفحه‌بندی
const {
  currentPage,
  itemsPerPage,
  totalPages,
  paginatedItems: paginatedContacts,
  goToPage: baseGoToPage,
  nextPage: baseNextPage,
  prevPage: basePrevPage
} = usePagination(filteredAndSortedContacts, 10)

const totalContactsOnCurrentFilter = computed(() => filteredAndSortedContacts.value.length)

// افزودن امکان اسکرول به بالای صفحه هنگام تغییر صفحه
const goToPage = (page) => {
  baseGoToPage(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const nextPage = () => {
  baseNextPage()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const prevPage = () => {
  basePrevPage()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(
  () => [
    contactStore.searchQuery,
    contactStore.sortField,
    contactStore.sortOrder,
    currentFilterRules.value.length,
  ],
  () => {
    currentPage.value = 1
  },
)

watchEffect(() => {
  const contactsLoading = contactStore.loading
  const customFieldsLoading = customFieldStore.loading
  const groupsLoading = groupStore.loading

  const contacts = paginatedContacts.value

  if (
    contactsLoading ||
    customFieldsLoading ||
    groupsLoading ||
    !contacts ||
    customFieldStore.fieldDefinitions.length === 0
  ) {
    contactsPreparedForDisplay.value = []
    return
  }

  const preparedData = contacts.map((contact) => {
    const displayData = []

    settingsStore.displayColumns.forEach((columnKey) => {
      if (columnKey === 'name' || columnKey === 'lastName') {
        return
      }

      let label = standardFieldLabels[columnKey] || this.$t('contactList.unknownField')
      let rawValue = undefined
      let fieldType = standardFieldTypes[columnKey] || 'text'
      let currentFieldDefForFormatter = null

      if (standardFieldLabels[columnKey]) {
        rawValue = contact[columnKey]
        if (columnKey.startsWith('address.')) {
          const addressPartKey = columnKey.split('.')[1]
          if (Array.isArray(contact.addresses) && contact.addresses.length > 0) {
            rawValue = contact.addresses[0][addressPartKey]
          } else {
            rawValue = undefined
          }
        }
      } else if (columnKey.startsWith('customFieldDef_')) {
        const fieldIdString = columnKey.split('_')[1]
        if (!customFieldStore.fieldDefinitions || customFieldStore.fieldDefinitions.length === 0) {
          return
        }

        const fieldId = Number(fieldIdString)
        if (isNaN(fieldId)) {
          return
        }

        const fieldDef = customFieldStore.fieldDefinitions.find((def) => def.id === fieldId)
        currentFieldDefForFormatter = fieldDef

        if (!fieldDef) {
          return
        }

        label = fieldDef.label
        fieldType = fieldDef.type

        const customFieldData = contact.customFields
          ? contact.customFields.find((cf) => cf.fieldId === fieldId)
          : null
        rawValue = customFieldData ? customFieldData.value : undefined
      } else {
        return
      }

      let formattedValue = ''
      let shouldDisplay = false

      switch (fieldType) {
        case 'date':
          formattedValue = rawValue ? formatGregorianDateToShamsi(rawValue) : ''
          shouldDisplay = formattedValue !== ''
          break
        case 'gender':
          formattedValue = displayGender(rawValue)
          shouldDisplay = formattedValue !== ''
          break
        case 'group':
          formattedValue =
            rawValue === '' || rawValue === null || rawValue === undefined
              ? 'بدون گروه'
              : String(rawValue)
          shouldDisplay = true
          break
        case 'addressPart':
          formattedValue = rawValue != null ? String(rawValue) : ''
          shouldDisplay = formattedValue.trim() !== ''
          break
        case 'boolean':
          formattedValue = formatCustomFieldValue(rawValue, 'boolean')
          shouldDisplay = rawValue === true || rawValue === false
          break
        case 'number':
          shouldDisplay = typeof rawValue === 'number' && !isNaN(rawValue)
          formattedValue = shouldDisplay ? String(rawValue) : ''
          break
        case 'select':
          formattedValue = formatCustomFieldValue(
            rawValue,
            'select',
            currentFieldDefForFormatter?.options,
          )
          shouldDisplay =
            rawValue !== undefined && rawValue !== null && String(rawValue).trim() !== ''
          break
        case 'text':
        case 'textarea':
        default:
          formattedValue = rawValue != null ? String(rawValue) : ''
          shouldDisplay = formattedValue.trim() !== ''
          break
      }

      if (shouldDisplay) {
        displayData.push({
          label: label,
          value: formattedValue,
          key: columnKey,
        })
      }
    })

    return {
      contact: contact,
      displayData: displayData,
    }
  })

  contactsPreparedForDisplay.value = preparedData
})

const standardSortableOptions = [
  { value: 'lastName', label: this.$t('contactList.fields.lastName') },
  { value: 'name', label: this.$t('contactList.fields.name') },
  { value: 'phone', label: this.$t('contactList.fields.phone') },
  { value: 'createdAt', label: this.$t('contactList.fields.createdAt') },
  { value: 'group', label: this.$t('contactList.fields.group') },
  { value: 'title', label: this.$t('contactList.fields.title') },
  { value: 'birthDate', label: this.$t('contactList.fields.birthDate') },
]
const sortOptions = computed(() => {
  const options = [...standardSortableOptions]
  customFieldStore.sortedFieldDefinitions.forEach((field) => {
    options.push({
      value: field.id,
      label: `فیلد سفارشی: ${field.label}`,
    })
  })
  return options
})

const startEditingContact = (contact) => {
  contactStore.setContactToEdit(contact)
  router.push({ name: 'add-contact' })
}

const confirmDeleteContact = async (contactId) => {
  const confirmed = window.confirm('آیا از حذف این مخاطب اطمینان دارید؟')
  if (confirmed) {
    try {
      await contactStore.deleteContact(contactId)
    } catch (error) {
      this.notificationStore.showNotification(this.$t('contactList.deleteError'), 'error')
    }
  }
}
</script>

<style scoped>
/* **استایل‌های کلی کانتینر صفحه** */
.contact-list-wrapper {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
}

h2 {
  text-align: center;
  color: var(--color-text-primary); /* تغییر کرد */
  margin-bottom: 20px;
}

/* **استایل‌های کانتینر کنترل‌ها (جستجو، مرتب‌سازی، فیلتر)** */
.controls-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

/* استایل بخش جستجو و مرتب‌سازی */
.search-control,
.sort-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* استایل عمومی برای Input و Select در کنترل‌ها */
.control-input,
.control-select {
  padding: 8px;
  border: 1px solid var(--color-border-medium); /* تغییر کرد */
  border-radius: 4px;
  font-size: 1em;
  background-color: var(--color-background-light); /* تغییر کرد */
  color: var(--color-text-primary); /* تغییر کرد */
}

/* استایل دکمه نمایش/پنهان‌سازی فیلتر */
.toggle-filter-button {
  background: var(--glass-bg);
  color: var(--color-text-primary);
  padding: 8px 15px;
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 1em;
  transition: all 0.2s ease;
  font-family: inherit;
  backdrop-filter: blur(8px);
}

.toggle-filter-button:hover {
  background: var(--glass-bg-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* **استایل بخش قابل گسترش فیلتر پیشرفته** */
.advanced-filter-section {
  border: 1px solid var(--color-border-light); /* تغییر کرد */
  padding: 15px;
  border-radius: 8px;
  background-color: var(--color-background-darker-light); /* تغییر کرد */
  margin-bottom: 20px;
}

.advanced-filter-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--color-text-secondary); /* تغییر کرد */
  border-bottom: 1px dashed var(--color-border-medium); /* تغییر کرد */
  padding-bottom: 10px;
}

/* استایل فرم اضافه کردن قانون فیلتر */
.add-rule-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  border: 1px dashed var(--color-border-medium); /* تغییر کرد */
  border-radius: 4px;
  background-color: var(--color-background-light); /* تغییر کرد */
  flex-direction: column;
}

.add-rule-form h4 {
  width: 100%;
  margin: 0 0 10px 0;
  color: var(--color-text-primary); /* تغییر کرد */
}

.add-rule-form .btn {
  width: 100%;
}

/* استایل عمومی برای Input و Select در فرم افزودن قانون */
.rule-control {
  flex-basis: 180px;
  flex-grow: 1;
}

/* استایل placeholder وقتی فیلدی انتخاب نشده */
.rule-control-placeholder {
  flex-basis: 180px;
  flex-grow: 1;
  padding: 8px 12px;
  color: var(--color-text-tertiary); /* تغییر کرد */
  border: 1px solid var(--color-border-light); /* تغییر کرد */
  border-radius: 4px;
  background-color: var(--color-background-light); /* تغییر کرد */
  font-size: 0.9em;
  line-height: 1.5;
}

/* استایل لیست قوانین فیلتر فعال */
.current-rules-list {
  margin-top: 15px;
  padding-top: 15px;
}

.current-rules-list h4 {
  margin: 0 0 10px 0;
  color: var(--color-text-primary); /* تغییر کرد */
}

.no-rules-message {
  text-align: center;
  color: var(--color-text-secondary); /* تغییر کرد */
  font-style: italic;
  margin-top: 10px;
}

/* استایل هر آیتم قانون فیلتر در لیست */
.filter-rule-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid var(--color-border-light); /* تغییر کرد */
  border-radius: 4px;
  background-color: var(--color-background-light); /* تغییر کرد */
  flex-wrap: wrap;
  justify-content: space-between;
  box-shadow: 0 1px 3px var(--color-shadow); /* اضافه شد برای عمق بیشتر */
  flex-direction: column;
  align-items: flex-start;
}

.filter-rule-item p {
  margin: 0;
  flex-grow: 1;
  word-break: break-word;
  margin-bottom: 5px;
}

.filter-rule-item .btn {
  width: auto;
  align-self: flex-end;
}

.rule-field-label {
  font-weight: bold;
  color: var(--color-link-primary); /* تغییر کرد */
}

.rule-operator-label {
  font-style: italic;
  color: var(--color-text-secondary); /* تغییر کرد */
}

.rule-value {
  font-weight: bold;
  color: var(--color-text-primary); /* تغییر کرد */
}

.rule-value-none {
  font-style: italic;
  color: var(--color-text-tertiary); /* تغییر کرد */
}

/* استایل کانتینر دکمه‌های اعمال/پاک کردن فیلتر */
.filter-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
  flex-direction: column;
  align-items: stretch;
}

.filter-actions .btn {
  width: 100%;
}

.filter-section-separator {
  margin: 15px 0;
  border: none;
  border-top: 1px dashed var(--color-border-medium); /* تغییر کرد */
}

/* **استایل خط جداکننده اصلی** */
.separator {
  margin: 20px 0;
  border: none;
  border-top: 1px solid var(--color-border-light); /* تغییر کرد */
}

/* **استایل پیام‌های وضعیت (لودینگ، خطا، عدم نتیجه)** */
.status-message {
  text-align: center;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.status-message.loading {
  background-color: var(--color-success-light); /* تغییر کرد */
  color: var(--color-success); /* تغییر کرد */
  border: 1px solid var(--color-success-dark); /* تغییر کرد */
}

.status-message.error {
  background-color: var(--color-danger-light); /* تغییر کرد */
  color: var(--color-danger); /* تغییر کرد */
  border: 1px solid var(--color-danger-dark); /* تغییر کرد */
}

.status-message.no-results {
  background-color: var(--color-warning-light); /* تغییر کرد */
  color: var(--color-warning); /* تغییر کرد */
  border: 1px solid var(--color-warning-dark); /* تغییر کرد */
}

/* **استایل لیست مخاطبین (ul)** */
.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* **استایل هر آیتم مخاطب (li)** */
.contact-item {
  background: var(--glass-bg, rgba(255, 255, 255, 0.18));
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border-radius: 18px;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  transition:
    box-shadow 0.3s,
    border 0.3s,
    background 0.3s;
  margin-bottom: 18px;
  padding: 18px 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: flex-start;
  position: relative;
  flex-direction: column;
  align-items: stretch;
}
.contact-item:hover {
  box-shadow: 0 12px 32px 0 rgba(31, 38, 135, 0.22);
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  background: var(--glass-bg-hover, rgba(255, 255, 255, 0.24));
}

/* کانتینر اطلاعات مخاطب */
.contact-info {
  flex-grow: 1;
  min-width: 0;
}

/* استایل لینک نام مخاطب */
.contact-name-link {
  color: var(--color-link-primary); /* تغییر کرد */
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
  font-size: 1.1em;
  margin-bottom: 5px;
  display: inline-block;
}

.contact-name-link:hover {
  text-decoration: underline;
}

/* استایل پاراگراف‌های اطلاعات داخل آیتم */
.contact-item p {
  margin: 3px 0;
  font-size: 0.9em;
  color: var(--color-text-secondary); /* تغییر کرد */
  word-break: break-word;
}

/* استایل عنوان‌های فیلد */
.contact-item p strong {
  color: var(--color-text-primary); /* تغییر کرد */
  margin-left: 5px;
}

/* استایل بخش‌های اطلاعات اضافی */
.additional-info {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--color-border-light); /* تغییر کرد */
}

.additional-info strong {
  display: block;
  margin-bottom: 5px;
  color: var(--color-text-primary); /* تغییر کرد */
}

.additional-info ul {
  list-style: disc;
  padding-left: 20px;
  margin-top: 5px;
  margin-bottom: 0;
}

.additional-info ul li {
  font-size: 0.9em;
  color: var(--color-text-secondary); /* تغییر کرد */
  margin-bottom: 3px;
  word-break: break-word;
}

/* استایل برای بخش یادداشت مخاطب */
.contact-notes {
  font-style: italic;
  color: var(--color-text-secondary); /* اضافه شد */
}

/* استایل برای تاریخ‌های ایجاد و ویرایش */
.date-info {
  font-size: 0.8em;
  color: var(--color-text-tertiary); /* تغییر کرد */
}

/* کانتینر دکمه‌های ویرایش و حذف */
.contact-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

/* Button Styles */
.button {
  padding: 8px 15px;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.9em;
  transition:
    background-color 0.3s ease,
    opacity 0.3s ease,
    transform 0.2s ease;
  font-family: inherit;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Action Buttons */
.edit-button {
  background: linear-gradient(120deg, var(--color-warning) 60%, transparent 100%);
  color: var(--color-black);
  border: none;
  box-shadow: 0 2px 12px 0 rgba(31, 38, 135, 0.1);
}

.edit-button:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 4px 16px rgba(255, 193, 7, 0.2);
}

.delete-button {
  background: linear-gradient(120deg, var(--color-danger) 60%, transparent 100%);
  color: var(--color-white);
  border: none;
  box-shadow: 0 2px 12px 0 rgba(31, 38, 135, 0.1);
}

.delete-button:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 4px 16px rgba(220, 53, 69, 0.2);
}

/* Filter Rules */
.add-rule-btn {
  background: linear-gradient(120deg, var(--accent-color) 60%, transparent 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-rule-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 4px 16px rgba(var(--accent-color-rgb, 108, 99, 255), 0.18);
}

.add-rule-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Pagination Controls */
.pagination-button,
.page-number-button {
  background: var(--glass-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-medium);
  padding: 8px 15px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}

.pagination-button:hover:not(:disabled),
.page-number-button:hover:not(:disabled) {
  background: var(--glass-bg-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.pagination-button:disabled,
.page-number-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* استایل‌های موبایل اگر نیاز بود */
@media (max-width: 768px) {
  .advanced-filter-button {
    padding: 10px 15px; /* پدینگ مناسب‌تر در موبایل */
    font-size: 0.9em; /* فونت کمی کوچکتر */
  }
}

/* **استایل کنترل‌های صفحه‌بندی** */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
  flex-wrap: wrap;
  direction: rtl; /* حفظ جهت rtl */
}

/* استایل عمومی دکمه‌های صفحه‌بندی */
.pagination-button,
.page-number-button {
  padding: 8px 15px;
  border: 1px solid var(--color-border-medium); /* تغییر کرد */
  background-color: var(--color-background-darker-light); /* تغییر کرد */
  color: var(--color-text-primary); /* تغییر کرد */
  cursor: pointer;
  border-radius: 5px;
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
  font-family: inherit;
}

.pagination-button:hover:not(:disabled),
.page-number-button:hover:not(:disabled) {
  background-color: var(--color-border-light); /* تغییر کرد */
  border-color: var(--color-link-primary); /* تغییر کرد */
  color: var(--color-text-primary); /* برای حفظ رنگ متن در هاور */
}

.pagination-button:disabled,
.page-number-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-background-darker-light); /* تغییر کرد */
  color: var(--color-text-tertiary); /* تغییر کرد */
  border-color: var(--color-border-light); /* تغییر کرد */
}

/* استایل دکمه صفحه فعال */
.page-number-button.active {
  background-color: var(--color-link-primary); /* تغییر کرد */
  color: white; /* این ثابت می‌مونه */
  border-color: var(--color-link-primary); /* تغییر کرد */
}

.pagination-controls span {
  font-weight: bold;
  margin: 0 5px;
  color: var(--color-text-primary); /* اضافه شد */
}

/* کانتینر شماره صفحات */
.page-numbers {
  display: flex;
  gap: 5px;
  margin-left: 5px;
}

.page-numbers button {
  min-width: 35px;
  text-align: center;
  justify-content: center;
}

/* ** واکنش‌گرایی برای نمایش بهتر در موبایل ** */
@media (max-width: 600px) {
  .contact-list-wrapper {
    padding: 0 10px;
  }

  .controls-container {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
    padding: 0 10px;
  }

  .search-control,
  .sort-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    width: 100%;
  }

  .search-control label,
  .sort-controls label {
    margin-right: 0;
    margin-bottom: 5px;
  }

  .search-control input[type='text'],
  .sort-controls select {
    width: 100%;
    flex-basis: auto;
  }

  .rule-control-placeholder {
    width: 100%;
    flex-basis: auto;
    text-align: center;
  }

  .toggle-filter-button {
    width: 100%;
    text-align: center;
  }

  .advanced-filter-section {
    margin-left: 10px;
    margin-right: 10px;
    width: calc(100% - 20px);
  }

  .add-rule-form {
    flex-direction: column;
    gap: 10px;
  }

  .add-rule-form .btn {
    width: 100%;
  }

  .filter-rule-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .filter-rule-item p {
    margin-bottom: 5px;
  }
  .filter-rule-item .btn {
    width: auto;
    align-self: flex-end;
  }

  .filter-actions {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .filter-actions .btn {
    width: 100%;
  }

  .contact-item {
    flex-direction: column;
    align-items: stretch;
    padding: 15px;
  }

  .contact-actions {
    flex-direction: row;
    justify-content: space-evenly;
    width: 100%;
    gap: 10px;
    margin-top: 10px;
  }

  .contact-actions .button {
    flex-grow: 1;
    text-align: center;
  }

  .pagination-controls {
    flex-direction: column;
    gap: 10px;
  }
  .page-numbers {
    margin-left: 0;
  }
  .pagination-button,
  .page-number-button {
    width: 100%;
    text-align: center;
  }
  .page-numbers button {
    min-width: auto;
  }
}
</style>
