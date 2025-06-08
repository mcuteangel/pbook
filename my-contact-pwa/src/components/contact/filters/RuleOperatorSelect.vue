<template>
  <select
    v-model="selectedOperator"
    @change="onChange"
    class="rule-control flat-select"
    :disabled="!field"
  >
    <option value="" disabled>{{ t('contactList.selectOperatorPlaceholder') }}</option>
    <option v-for="op in availableOperators" :key="op.value" :value="op.value">
      {{ t(op.label) }}
    </option>
  </select>
</template>

<script setup>
/**
 * کامپوننت انتخاب اپراتور برای فیلترها
 * @component
 * @property {string} field - نام فیلد انتخاب شده
 * @property {string} operator - اپراتور انتخاب شده فعلی
 * @property {Array} filterableFields - لیست فیلدهای قابل فیلتر
 * @emits {string} update:operator - رویداد ارسالی هنگام تغییر اپراتور
 * @emits {string} change - رویداد ارسالی برای تغییرات
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getOperatorsForFieldType } from '@/utils/filterOperators'

const { t } = useI18n()

const props = defineProps({
  /**
   * نام فیلد انتخاب شده
   * @type {string}
   */
  field: {
    type: String,
    default: null,
  },

  /**
   * اپراتور انتخاب شده فعلی
   * @type {string}
   */
  operator: {
    type: String,
    default: '',
  },

  /**
   * لیست فیلدهای قابل فیلتر
   * @type {Array<{value: string, label: string, type: string}>}
   */
  filterableFields: {
    type: Array,
    required: true,
    validator: (fields) => {
      return fields.every(
        (field) => field && typeof field === 'object' && 'value' in field && 'label' in field,
      )
    },
  },
})

const emit = defineEmits([
  /**
   * رویداد ارسالی هنگام تغییر اپراتور
   * @property {string} operator - اپراتور جدید
   */
  'update:operator',

  /**
   * رویداد تغییر اپراتور
   * @property {string} operator - اپراتور جدید
   */
  'change',
])

/**
 * مقدار انتخاب شده اپراتور
 * @type {import('vue').ComputedRef<string>}
 */
const selectedOperator = computed({
  get: () => props.operator,
  set: (value) => emit('update:operator', value),
})

/**
 * لیست اپراتورهای موجود بر اساس نوع فیلد
 * @type {import('vue').ComputedRef<Array<{value: string, label: string}>>}
 */
const availableOperators = computed(() => {
  if (!props.field) return []

  const field = props.filterableFields.find((f) => f.value === props.field)
  if (!field) return []

  const fieldType = field.type || 'text'
  const operators = getOperatorsForFieldType(fieldType)

  // اضافه کردن عملگرهای سفارشی اگر در تعریف فیلد وجود داشته باشند
  if (field.customOperators && Array.isArray(field.customOperators)) {
    return [...operators, ...field.customOperators]
  }

  return operators
})

/**
 * مدیریت تغییر اپراتور
 * @param {Event} event - رویداد تغییر
 */
function onChange(event) {
  const newValue = event?.target?.value || ''
  selectedOperator.value = newValue
  emit('change', newValue)
}
</script>
