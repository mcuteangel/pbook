import { ref, computed } from 'vue'

/**
 * کامپوزابل برای مدیریت فیلترینگ داده‌ها
 * @param {Ref<Array>} items آرایه آیتم‌های اصلی که باید فیلتر شوند
 * @param {Function} filterFunction تابع فیلتر سفارشی
 * @returns {Object} ابزارها و متغیرهای لازم برای فیلتر کردن
 */
export function useFiltering(items, filterFunction) {
  const filterRules = ref([])
  
  // محاسبه آیتم‌های فیلتر شده بر اساس قوانین فیلتر
  const filteredItems = computed(() => {
    if (filterRules.value.length === 0) return items.value
    return items.value.filter(item => filterFunction(item, filterRules.value))
  })
  
  /**
   * افزودن یک قانون فیلتر جدید
   * @param {Object} rule قانون فیلتر
   */
  function addFilterRule(rule) {
    filterRules.value.push(rule)
  }
  
  /**
   * حذف یک قانون فیلتر با استفاده از شاخص آن
   * @param {Number} index شاخص قانون
   */
  function removeFilterRule(index) {
    filterRules.value.splice(index, 1)
  }
  
  /**
   * پاک کردن تمام قوانین فیلتر
   */
  function clearFilters() {
    filterRules.value = []
  }
  
  // بازگرداندن ابزارها و متغیرهای لازم
  return {
    filterRules,
    filteredItems,
    addFilterRule,
    removeFilterRule,
    clearFilters
  }
}
