import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useContactStore } from '@/store/contacts'
import { useCustomFieldStore } from '@/store/customFields'
import { useGroupStore } from '@/store/groups'
import { useSettingsStore } from '@/store/settings'
import { useNotification } from '@/services/notification.service'

export function useContactList() {
  const { t } = useI18n()
  const contactStore = useContactStore()
  const customFieldStore = useCustomFieldStore()
  const groupStore = useGroupStore()
  const settingsStore = useSettingsStore()
  const notificationService = useNotification()

  // وضعیت‌های مختلف
  const isFilterSectionVisible = ref(false)
  const isAddingSamples = ref(false)
  const isInitialLoad = ref(true)
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  // متغیرهای جستجو و مرتب‌سازی
  const searchQuery = ref('')
  const sortField = ref('name')
  const sortOrder = ref('asc')

  // Computed
  const isLoading = computed(
    () => contactStore.loading || customFieldStore.loading || groupStore.loading,
  )

  const hasError = computed(() => contactStore.error || customFieldStore.error || groupStore.error)

  const totalPages = computed(() => {
    return Math.ceil(contactStore.filteredAndSortedContacts.length / itemsPerPage.value)
  })

  const paginatedContacts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return contactStore.filteredAndSortedContacts.slice(start, end)
  })

  const hasNoResults = computed(() => paginatedContacts.value.length === 0 && !contactStore.loading)

  const hasActiveFilters = computed(
    () =>
      contactStore.contacts.length > 0 &&
      (contactStore.searchQuery || contactStore.filterRules.length > 0),
  )

  // Methods
  const handleAddSampleContacts = async () => {
    isAddingSamples.value = true
    try {
      const confirmMessage = t('contactList.confirmAddSamples')
      const userConfirmed = window.confirm(confirmMessage)

      if (!userConfirmed) {
        notificationService.info(t('contactList.operationCancelled'))
        return
      }

      const result = await contactStore.addSampleContacts(t)

      if (result && result.success) {
        notificationService.success(result.message || t('contactList.samplesAddedSuccessfully'))
      } else {
        notificationService.error(result?.message || t('contactList.errorAddingSamples'))
      }
    } catch (error) {
      console.error('Error in handleAddSampleContacts:', error)
      notificationService.error(t('contactList.errorAddingSamples'))
    } finally {
      isAddingSamples.value = false
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages.value) {
      currentPage.value = newPage
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleItemsPerPageChange = (newSize) => {
    const size = parseInt(newSize)
    if (!isNaN(size)) {
      itemsPerPage.value = size
      currentPage.value = 1
      contactStore.setItemsPerPage(size)
    }
  }

  const toggleFilterSection = () => {
    isFilterSectionVisible.value = !isFilterSectionVisible.value
  }

  const clearFilters = () => {
    contactStore.clearFilterRules()
    isFilterSectionVisible.value = false
  }

  const loadInitialData = async () => {
    try {
      console.log('Starting to load initial data...')
      const [contactsResult, fieldsResult, groupsResult] = await Promise.all([
        contactStore.loadContacts(),
        customFieldStore.loadFieldDefinitions(),
        groupStore.loadGroups(),
      ])
      console.log('Contacts loaded:', contactsResult)
      console.log('Fields loaded:', fieldsResult)
      console.log('Groups loaded:', groupsResult)
      isInitialLoad.value = false
    } catch (error) {
      console.error('خطا در بارگذاری داده‌های اولیه:', error)
      notificationService.error(t('errors.failedToLoadData'))
    }
  }

  // تابع برای به‌روزرسانی جستجو
  const updateSearchQuery = (query) => {
    searchQuery.value = query
  }

  // تابع برای به‌روزرسانی فیلد مرتب‌سازی
  const updateSortField = (field) => {
    sortField.value = field
  }

  // تابع برای به‌روزرسانی ترتیب مرتب‌سازی
  const updateSortOrder = (order) => {
    sortOrder.value = order
  }

  return {
    // وضعیت‌ها
    isFilterSectionVisible,
    isAddingSamples,
    isInitialLoad,
    currentPage,
    itemsPerPage,

    // Computed
    isLoading,
    hasError,
    totalPages,
    paginatedContacts,
    hasNoResults,
    hasActiveFilters,

    // متغیرهای جستجو و مرتب‌سازی
    searchQuery,
    sortField,
    sortOrder,

    // Methods
    handleAddSampleContacts,
    handlePageChange,
    handleItemsPerPageChange,
    toggleFilterSection,
    clearFilters,
    loadInitialData,
    updateSearchQuery,
    updateSortField,
    updateSortOrder,
  }
}
