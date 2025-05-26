import { ref, computed } from 'vue'

/**
 * کامپوزابل برای مدیریت صفحه‌بندی
 * @param {Ref<Array>} items آرایه آیتم‌هایی که باید صفحه‌بندی شوند
 * @param {Number} defaultItemsPerPage تعداد آیتم در هر صفحه (پیش‌فرض)
 * @returns {Object} ابزارها و متغیرهای لازم برای صفحه‌بندی
 */
export function usePagination(items, defaultItemsPerPage = 10) {
  // متغیرهای پایه
  const currentPage = ref(1)
  const itemsPerPage = ref(defaultItemsPerPage)
  
  // محاسبه تعداد کل صفحات
  const totalPages = computed(() => {
    return Math.ceil(items.value.length / itemsPerPage.value) || 1
  })
  
  // محاسبه آیتم‌های صفحه فعلی
  const paginatedItems = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage.value
    const endIndex = startIndex + itemsPerPage.value
    return items.value.slice(startIndex, endIndex)
  })
  
  /**
   * رفتن به صفحه مشخص
   * @param {Number} page شماره صفحه
   */
  function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }
  
  /**
   * رفتن به صفحه بعدی
   */
  function nextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }
  
  /**
   * رفتن به صفحه قبلی
   */
  function prevPage() {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }
  
  /**
   * تغییر تعداد آیتم‌ها در هر صفحه
   * @param {Number} count تعداد جدید
   */
  function setItemsPerPage(count) {
    itemsPerPage.value = count
    // بازگشت به صفحه اول برای جلوگیری از مشکلات محدوده
    currentPage.value = 1
  }
  
  // بازگرداندن ابزارها و متغیرهای لازم
  return {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    setItemsPerPage
  }
}
