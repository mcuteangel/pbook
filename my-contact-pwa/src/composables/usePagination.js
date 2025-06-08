import { ref, computed, watch } from 'vue'

/**
 * کامپوزابل برای مدیریت صفحه‌بندی
 * @param {Ref<Array>} items آرایه آیتم‌هایی که باید صفحه‌بندی شوند
 * @param {Number} itemsPerPage تعداد آیتم در هر صفحه (پیش‌فرض)
 * @returns {Object} ابزارها و متغیرهای لازم برای صفحه‌بندی
 */
export function usePagination(items, itemsPerPage = 10) {
  const currentPage = ref(1)
  const pageSize = ref(itemsPerPage)
  const itemsRef = ref([])

  // به‌روزرسانی itemsRef هر زمان که items تغییر کند
  watch(
    items,
    (newItems) => {
      console.log('Items changed in usePagination:', newItems)
      itemsRef.value = newItems || []
      console.log('Updated itemsRef:', itemsRef.value)
    },
    { immediate: true },
  )

  const totalPages = computed(() => {
    return Math.ceil(itemsRef.value.length / pageSize.value)
  })

  const paginatedItems = computed(() => {
    console.log('Calculating paginated items...')
    console.log('Current page:', currentPage.value)
    console.log('Page size:', pageSize.value)
    console.log('Total items:', itemsRef.value.length)

    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    const result = itemsRef.value.slice(start, end)

    console.log('Start index:', start)
    console.log('End index:', end)
    console.log('Paginated result:', result)

    return result
  })

  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  const nextPage = () => {
    if (hasNextPage.value) {
      currentPage.value++
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevPage = () => {
    if (hasPrevPage.value) {
      currentPage.value--
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const setPageSize = (size) => {
    const newSize = parseInt(size)
    if (!isNaN(newSize) && newSize > 0) {
      pageSize.value = newSize
      currentPage.value = 1 // بازگشت به صفحه اول
    }
  }

  return {
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
  }
}
