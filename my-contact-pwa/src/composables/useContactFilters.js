import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useContactStore } from '@/store/contacts'
import { useCustomFieldStore } from '@/store/customFields'
import { useGroupStore } from '@/store/groups'
import { formatGregorianDateToShamsi, displayGender } from '@/utils/formatters/index'

export function useContactFilters() {
  const { t } = useI18n()
  const contactStore = useContactStore()
  const customFieldStore = useCustomFieldStore()
  const groupStore = useGroupStore()

  const isFilterSectionVisible = ref(false)

  const toggleFilterSection = () => {
    isFilterSectionVisible.value = !isFilterSectionVisible.value
  }

  const filterableFields = computed(() => {
    const fields = [
      { key: 'name', label: t('form.name'), type: 'text' },
      { key: 'lastName', label: t('form.lastName'), type: 'text' },
      { key: 'email', label: t('form.email'), type: 'text' },
      { key: 'phone', label: t('form.phone'), type: 'text' },
      { key: 'mobile', label: t('form.mobile'), type: 'text' },
      { key: 'address', label: t('form.address'), type: 'text' },
      { key: 'notes', label: t('form.notes'), type: 'text' },
      { key: 'group', label: t('form.group'), type: 'select' },
    ]

    customFieldStore.fieldDefinitions.forEach((field) => {
      fields.push({
        key: field.key,
        label: field.label,
        type: field.type,
      })
    })

    return fields
  })

  const getOperatorsForField = (fieldType) => {
    switch (fieldType) {
      case 'text':
        return [
          { value: 'contains', label: t('filters.operators.contains') },
          { value: 'equals', label: t('filters.operators.equals') },
          { value: 'startsWith', label: t('filters.operators.startsWith') },
          { value: 'endsWith', label: t('filters.operators.endsWith') },
        ]
      case 'number':
        return [
          { value: 'equals', label: t('filters.operators.equals') },
          { value: 'greaterThan', label: t('filters.operators.greaterThan') },
          { value: 'lessThan', label: t('filters.operators.lessThan') },
        ]
      case 'date':
        return [
          { value: 'equals', label: t('filters.operators.equals') },
          { value: 'before', label: t('filters.operators.before') },
          { value: 'after', label: t('filters.operators.after') },
        ]
      case 'select':
        return [
          { value: 'equals', label: t('filters.operators.equals') },
          { value: 'notEquals', label: t('filters.operators.notEquals') },
        ]
      default:
        return [{ value: 'equals', label: t('filters.operators.equals') }]
    }
  }

  const formatFilterValue = (value, fieldType) => {
    if (!value) return ''
    switch (fieldType) {
      case 'number':
        return Number(value)
      case 'date':
        return new Date(value)
      default:
        return String(value)
    }
  }

  const defaultFilters = [
    {
      field: 'name',
      operator: 'contains',
      value: '',
    },
  ]

  const filterRules = ref([...defaultFilters])

  const applyFilters = (rules) => {
    filterRules.value = rules
  }

  const clearFilters = () => {
    filterRules.value = [...defaultFilters]
  }

  return {
    isFilterSectionVisible,
    toggleFilterSection,
    filterableFields,
    getOperatorsForField,
    formatFilterValue,
    defaultFilters,
    filterRules,
    applyFilters,
    clearFilters,
  }
}
