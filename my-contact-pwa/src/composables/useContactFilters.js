import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

export function useContactFilters() {
  const { t } = useI18n()
  
  const isFilterSectionVisible = ref(false)
  
  const toggleFilterSection = () => {
    isFilterSectionVisible.value = !isFilterSectionVisible.value
  }

  const filterableFields = computed(() => {
    return [
      { value: 'name', label: t('contactList.fields.name'), type: 'text' },
      { value: 'phone', label: t('contactList.fields.phone'), type: 'text' },
      { value: 'email', label: t('contactList.fields.email'), type: 'text' },
      { value: 'group', label: t('contactList.fields.group'), type: 'group' },
      { value: 'birthDate', label: t('contactList.fields.birthDate'), type: 'date' },
      { value: 'title', label: t('contactList.fields.title'), type: 'text' },
      { value: 'company', label: t('contactList.fields.company'), type: 'text' },
      { value: 'jobTitle', label: t('contactList.fields.jobTitle'), type: 'text' },
      { value: 'notes', label: t('contactList.fields.notes'), type: 'textarea' },
      { value: 'website', label: t('contactList.fields.website'), type: 'text' },
      { value: 'address.street', label: t('contactList.fields.addressStreet'), type: 'addressPart' },
      { value: 'address.city', label: t('contactList.fields.addressCity'), type: 'addressPart' },
      { value: 'address.state', label: t('contactList.fields.addressState'), type: 'addressPart' },
      { value: 'address.zip', label: t('contactList.fields.addressZip'), type: 'addressPart' },
      { value: 'address.country', label: t('contactList.fields.addressCountry'), type: 'addressPart' },
      { value: 'gender', label: t('contactList.fields.gender'), type: 'gender' },
      { value: 'createdAt', label: t('contactList.fields.createdAt'), type: 'date' },
      { value: 'updatedAt', label: t('contactList.fields.updatedAt'), type: 'date' }
    ]
  })

  return {
    isFilterSectionVisible,
    toggleFilterSection,
    filterableFields
  }
}
