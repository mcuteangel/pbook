<template>
  <div
    class="rule-input-field"
    :class="{
      'has-error': !!errorMessage,
      'is-loading': isLoading,
      'is-touched': isTouched,
      'is-focused': isFocused,
    }"
  >
    <!-- Text Input -->
    <div v-if="isTextInput" class="input-wrapper">
      <input
        v-model="inputValue"
        :type="inputType"
        :inputmode="inputMode"
        class="form-control"
        :class="{
          'is-invalid': errorMessage,
          'is-valid': isTouched && !errorMessage,
        }"
        :placeholder="placeholder || t('common.enterValue')"
        :disabled="disabled || isLoading"
        :required="required"
        :maxlength="maxLength"
        :aria-invalid="!!errorMessage"
        :aria-describedby="errorMessage ? `${field}-error` : null"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
      />

      <!-- Character Counter -->
      <span
        v-if="showCharCounter && maxLength"
        class="char-counter"
        :class="{ 'text-danger': isCharLimitReached }"
      >
        {{ charCount }}/{{ maxLength }}
      </span>

      <!-- Loading Indicator -->
      <div v-if="isLoading" class="input-loading">
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <span class="visually-hidden">{{ t('common.loading') }}...</span>
      </div>
    </div>

    <!-- Number Input -->
    <div v-else-if="isNumberInput" class="input-wrapper">
      <input
        v-model.number="inputValue"
        type="number"
        class="form-control"
        :class="{
          'is-invalid': errorMessage,
          'is-valid': isTouched && !errorMessage,
        }"
        :placeholder="placeholder || t('common.enterNumber')"
        :disabled="disabled || isLoading"
        :required="required"
        :min="minValue"
        :max="maxValue"
        :step="step"
        :aria-invalid="!!errorMessage"
        :aria-describedby="errorMessage ? `${field}-error` : null"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
      />

      <!-- Loading Indicator -->
      <div v-if="isLoading" class="input-loading">
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      </div>
    </div>

    <!-- Select Input -->
    <div v-else-if="isSelectInput" class="select-wrapper">
      <select
        v-model="inputValue"
        class="form-select"
        :class="{
          'is-invalid': errorMessage,
          'is-valid': isTouched && !errorMessage,
        }"
        :disabled="disabled || isLoading"
        :required="required"
        :aria-invalid="!!errorMessage"
        :aria-describedby="errorMessage ? `${field}-error` : null"
        @change="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      >
        <option v-if="!required" :value="null">
          {{ placeholder || t('common.selectOption') }}
        </option>
        <option
          v-for="option in availableOptions"
          :key="String(option.value)"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>

      <!-- Loading Indicator -->
      <div v-if="isLoading" class="input-loading">
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      </div>
    </div>

    <!-- Date Picker -->
    <div v-else-if="isDateInput" class="date-picker-wrapper">
      <PersianDatePicker
        v-model="inputValue"
        :placeholder="placeholder || t('common.selectDate')"
        :disabled="disabled || isLoading"
        :required="required"
        :input-class="[
          'form-control',
          {
            'is-invalid': errorMessage,
            'is-valid': isTouched && !errorMessage,
          },
        ]"
        :aria-invalid="!!errorMessage"
        :aria-describedby="errorMessage ? `${field}-error` : null"
        @update:model-value="
          (val) => {
            inputValue = val
            validateInput(val)
          }
        "
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <!-- Clear Button -->
      <button
        v-if="inputValue && !disabled && !isLoading"
        type="button"
        class="btn-clear"
        :title="t('common.clear')"
        @click="handleClear"
      >
        <span aria-hidden="true">&times;</span>
        <span class="visually-hidden">{{ t('common.clear') }}</span>
      </button>

      <!-- Loading Indicator -->
      <div v-if="isLoading" class="input-loading">
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="errorMessage"
      :id="`${field}-error`"
      class="invalid-feedback d-block"
      role="alert"
      aria-live="assertive"
    >
      <i class="icon-error"></i> {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
/**
 * کامپوننت ورودی مقادیر فیلتر
 * @component
 * @property {string} field - نام فیلد انتخاب شده
 * @property {any} value - مقدار فعلی فیلد
 * @property {string} operator - اپراتور انتخاب شده
 * @property {Array} filterableFields - لیست فیلدهای قابل فیلتر
 * @property {Array} selectOptions - گزینه‌های انتخابی برای فیلدهای نوع select
 * @property {string} placeholder - متن راهنما
 * @property {boolean} disabled - غیرفعال کردن فیلد
 * @property {boolean} required - آیا فیلد الزامی است
 * @property {number} maxLength - حداکثر طول مجاز برای ورودی متنی
 * @property {number} minLength - حداقل طول مجاز برای ورودی متنی
 * @property {number} minValue - حداقل مقدار مجاز برای ورودی عددی
 * @property {number} maxValue - حداکثر مقدار مجاز برای ورودی عددی
 * @property {number|string} step - گام تغییر مقدار برای ورودی عددی
 * @property {boolean} trim - حذف فاصله‌های اضافی از ابتدا و انتهای متن
 * @property {string} pattern - الگوی اعتبارسنجی برای فیلدهای متنی
 * @property {string} inputMode - حالت ورودی (text, numeric, tel, email, url, search)
 * @property {boolean} showCharCounter - نمایش شمارنده کاراکترها
 * @property {boolean} isLoading - وضعیت در حال بارگذاری
 * @emits {any} update:value - رویداد ارسالی هنگام تغییر مقدار
 * @emits {boolean} validate - رویداد ارسالی برای وضعیت اعتبارسنجی
 * @emits {Event} blur - رویداد ارسالی هنگام خارج شدن از فیلد
 * @emits {Event} input - رویداد ارسالی هنگام تغییر مقدار فیلد
 * @emits {Event} enter - رویداد ارسالی هنگام فشردن دکمه Enter
 */
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import PersianDatePicker from '@/components/ui/PersianDatePicker.vue'
import moment from 'moment-jalaali'
import { useValidation } from '@/services/validation.service'

// تعریف تایپ‌های TypeScript برای بهبود هوش کد
/**
 * @typedef {Object} FieldOption
 * @property {string|number} value - مقدار گزینه
 * @property {string} label - برچسب نمایشی گزینه
 * @property {boolean} [disabled] - غیرفعال بودن گزینه
 */

/**
 * @typedef {Object} FilterableField
 * @property {string} value - مقدار فیلتر
 * @property {string} label - برچسب نمایشی فیلتر
 * @property {string} type - نوع فیلد (text, number, date, select, etc.)
 * @property {string} [pattern] - الگوی اعتبارسنجی اختیاری
 */

const { t } = useI18n()
const errorMessage = ref('')
const isTouched = ref(false)
const isFocused = ref(false)
const internalValue = ref('')

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
   * مقدار فعلی فیلد
   * @type {string|number|boolean|Date|Array|Object}
   */
  value: {
    type: [String, Number, Boolean, Date, Array, Object],
    default: null,
  },

  /**
   * اپراتور انتخاب شده
   * @type {string}
   */
  operator: {
    type: String,
    default: '',
  },

  /**
   * لیست فیلدهای قابل فیلتر
   * @type {FilterableField[]}
   */
  filterableFields: {
    type: Array,
    required: true,
    validator: (fields) => {
      return fields.every(
        (field) =>
          field &&
          typeof field === 'object' &&
          'value' in field &&
          'label' in field &&
          'type' in field,
      )
    },
  },

  /**
   * گزینه‌های انتخابی برای فیلدهای نوع select
   * @type {FieldOption[]}
   */
  selectOptions: {
    type: Array,
    default: () => [],
    validator: (options) => {
      return options.every(
        (option) => option && typeof option === 'object' && 'value' in option && 'label' in option,
      )
    },
  },

  /**
   * متن راهنما
   * @type {string}
   */
  placeholder: {
    type: String,
    default: '',
  },

  /**
   * غیرفعال کردن فیلد
   * @type {boolean}
   */
  disabled: {
    type: Boolean,
    default: false,
  },

  /**
   * الزامی بودن فیلد
   * @type {boolean}
   */
  required: {
    type: Boolean,
    default: false,
  },

  /**
   * حداکثر طول مجاز برای ورودی متنی
   * @type {number}
   */
  maxLength: {
    type: Number,
    default: null,
  },

  /**
   * حداقل طول مجاز برای ورودی متنی
   * @type {number}
   */
  minLength: {
    type: Number,
    default: null,
  },

  /**
   * حداقل مقدار مجاز برای ورودی عددی
   * @type {number}
   */
  minValue: {
    type: Number,
    default: null,
  },

  /**
   * حداکثر مقدار مجاز برای ورودی عددی
   * @type {number}
   */
  maxValue: {
    type: Number,
    default: null,
  },

  /**
   * گام تغییر مقدار برای ورودی عددی
   * @type {number|string}
   */
  step: {
    type: [Number, String],
    default: 1,
  },

  /**
   * حذف فاصله‌های اضافی از ابتدا و انتهای متن
   * @type {boolean}
   */
  trim: {
    type: Boolean,
    default: true,
  },

  /**
   * الگوی اعتبارسنجی برای فیلدهای متنی
   * @type {string}
   */
  pattern: {
    type: String,
    default: null,
  },

  /**
   * حالت ورودی (text, numeric, tel, email, url, search)
   * @type {'text'|'numeric'|'tel'|'email'|'url'|'search'}
   */
  inputMode: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'numeric', 'tel', 'email', 'url', 'search'].includes(value),
  },

  /**
   * نمایش شمارنده کاراکترها
   * @type {boolean}
   */
  showCharCounter: {
    type: Boolean,
    default: false,
  },

  /**
   * وضعیت در حال بارگذاری
   * @type {boolean}
   */
  isLoading: {
    type: Boolean,
    default: false,
  },

  /**
   * اعتبارسنجی سفارشی
   * @type {Function}
   * @param {any} value - مقدار فیلد
   * @returns {string|boolean} پیام خطا یا true در صورت معتبر بودن
   */
  customValidator: {
    type: Function,
    default: null,
  },
})

const emit = defineEmits([
  /**
   * رویداد ارسالی هنگام تغییر مقدار
   * @property {any} value - مقدار جدید
   */
  'update:value',

  /**
   * رویداد ارسالی هنگام تغییر معتبر
   * @property {boolean} isValid - وضعیت اعتبارسنجی
   */
  'validate',

  /**
   * رویداد ارسالی هنگام تغییر فیلد
   * @property {Event} event - رویداد تغییر
   */
  'input',

  /**
   * رویداد ارسالی هنگام خارج شدن از فیلد
   * @property {Event} event - رویداد بلور
   */
  'blur',

  /**
   * رویداد ارسالی هنگام فشردن دکمه Enter
   * @property {Event} event - رویداد کیبورد
   */
  'enter',

  /**
   * رویداد ارسالی هنگام تغییر اعتبارسنجی
   * @property {Object} validation - وضعیت اعتبارسنجی
   * @property {boolean} validation.isValid - آیا مقدار معتبر است
   * @property {string} [validation.message] - پیام خطا در صورت وجود
   */
  'validation-change',
])

const { validateText, validateEmail, validatePhone, validateNumber, validateDate, validateSelect } =
  useValidation()

// ==================== Computed Properties ====================

/**
 * مقدار ورودی
 * @type {import('vue').WritableComputedRef<any>}
 */
const inputValue = computed({
  get: () => props.value,
  set: (value) => {
    // اعمال trim در صورت فعال بودن
    const newValue = props.trim && typeof value === 'string' ? value.trim() : value
    emit('update:value', newValue)
    emit('input', newValue)

    // اعتبارسنجی در صورتی که فیلد لمس شده باشد
    if (isTouched.value) {
      validateInput(newValue)
    }
  },
})

/**
 * فیلد انتخاب شده
 * @type {import('vue').ComputedRef<FilterableField|undefined>}
 */
const selectedField = computed(() => {
  if (!props.field) return undefined
  return props.filterableFields.find((f) => f.value === props.field)
})

/**
 * نوع فیلد انتخاب شده
 * @type {import('vue').ComputedRef<string>}
 */
const fieldType = computed(() => selectedField.value?.type || 'text')

/**
 * نوع ورودی بر اساس نوع فیلد
 * @type {import('vue').ComputedRef<string>}
 */
const inputType = computed(() => {
  if (fieldType.value === 'email') return 'email'
  if (fieldType.value === 'tel') return 'tel'
  if (fieldType.value === 'url') return 'url'
  if (fieldType.value === 'number') return 'number'
  return 'text'
})

/**
 * آیا فیلد متنی است؟
 * @type {import('vue').ComputedRef<boolean>}
 */
const isTextInput = computed(() => {
  if (['isNull', 'isNotNull'].includes(props.operator)) return false
  return ['text', 'textarea', 'email', 'tel', 'url'].includes(fieldType.value)
})

/**
 * آیا فیلد عددی است؟
 * @type {import('vue').ComputedRef<boolean>}
 */
const isNumberInput = computed(() => {
  if (['isNull', 'isNotNull'].includes(props.operator)) return false
  return fieldType.value === 'number'
})

/**
 * آیا فیلد تاریخ است؟
 * @type {import('vue').ComputedRef<boolean>}
 */
const isDateInput = computed(() => {
  if (['isNull', 'isNotNull'].includes(props.operator)) return false
  return fieldType.value === 'date'
})

/**
 * آیا فیلد انتخابی است؟
 * @type {import('vue').ComputedRef<boolean>}
 */
const isSelectInput = computed(() => {
  if (['isNull', 'isNotNull'].includes(props.operator)) return false

  // اگر selectOptions داریم، حتماً فیلد انتخابی است
  if (Array.isArray(props.selectOptions) && props.selectOptions.length > 0) {
    return true
  }

  // اگر فیلد انتخاب شده دارای گزینه‌های انتخابی است
  if (
    selectedField.value?.options &&
    Array.isArray(selectedField.value.options) &&
    selectedField.value.options.length > 0
  ) {
    return true
  }

  // بررسی نوع فیلد
  return ['select', 'boolean', 'gender', 'group'].includes(fieldType.value)
})

/**
 * گزینه‌های قابل نمایش در منوی کشویی
 * @type {import('vue').ComputedRef<Array<{value: any, label: string, disabled?: boolean}>>}
 */
const availableOptions = computed(() => {
  // اگر selectOptions مستقیماً تنظیم شده باشد، از آن استفاده می‌کنیم
  if (Array.isArray(props.selectOptions) && props.selectOptions.length > 0) {
    return props.selectOptions
  }

  // اگر فیلد انتخاب شده گزینه‌هایی دارد، از آن‌ها استفاده می‌کنیم
  if (selectedField.value?.options && Array.isArray(selectedField.value.options)) {
    return selectedField.value.options.map((opt) => ({
      value: opt.value ?? opt,
      label: opt.label ?? String(opt),
      disabled: opt.disabled ?? false,
    }))
  }

  // اگر هیچ گزینه‌ای پیدا نشد، آرایه خالی برمی‌گردانیم
  return []
})

/**
 * تعداد کاراکترهای وارد شده
 * @type {import('vue').ComputedRef<number>}
 */
const charCount = computed(() => {
  if (inputValue.value === null || inputValue.value === undefined) return 0
  return String(inputValue.value).length
})

/**
 * آیا به حد مجاز کاراکترها رسیده‌ایم؟
 * @type {import('vue').ComputedRef<boolean>}
 */
const isCharLimitReached = computed(() => {
  if (!props.maxLength) return false
  return charCount.value >= props.maxLength
})

/**
 * آیا باید شمارنده کاراکترها نمایش داده شود؟
 * @type {import('vue').ComputedRef<boolean>}
 */
const showCharCounter = computed(() => {
  return props.showCharCounter && props.maxLength > 0 && isTextInput.value
})

// ==================== Methods ====================

/**
 * اعتبارسنجی ورودی
 * @param {string|number} value - مقدار ورودی برای اعتبارسنجی
 * @returns {boolean} - آیا مقدار معتبر است
 */
const validateInput = (value) => {
  // اگر فیلد غیرفعال است یا اجباری نیست و خالی است، اعتبارسنجی نکن
  if (props.disabled || (!props.required && !value)) {
    emitValidationResult(true)
    return
  }

  let isValid = true
  let message = ''

  // اعتبارسنجی بر اساس نوع فیلد
  switch (props.type) {
    case 'text':
    case 'textarea':
      const textValidation = validateText(value, {
        required: props.required,
        minLength: props.minLength,
        maxLength: props.maxLength,
        pattern: props.pattern,
      })
      isValid = textValidation.isValid
      message = textValidation.message
      break

    case 'email':
      const emailValidation = validateEmail(value, { required: props.required })
      isValid = emailValidation.isValid
      message = emailValidation.message
      break

    case 'tel':
      const phoneValidation = validatePhone(value, { required: props.required })
      isValid = phoneValidation.isValid
      message = phoneValidation.message
      break

    case 'number':
      const numberValidation = validateNumber(value, {
        required: props.required,
        min: props.minValue,
        max: props.maxValue,
        step: props.step,
      })
      isValid = numberValidation.isValid
      message = numberValidation.message
      break

    case 'date':
      const dateValidation = validateDate(value, {
        required: props.required,
        format: props.format,
      })
      isValid = dateValidation.isValid
      message = dateValidation.message
      break

    case 'select':
      const selectValidation = validateSelect(value, {
        required: props.required,
        options: props.options,
      })
      isValid = selectValidation.isValid
      message = selectValidation.message
      break
  }

  // اجرای اعتبارسنجی سفارشی اگر تعریف شده باشد
  if (isValid && typeof props.customValidator === 'function') {
    const customValidation = props.customValidator(value)
    if (typeof customValidation === 'string') {
      isValid = false
      message = customValidation
    } else if (customValidation === false) {
      isValid = false
      message = t('validation.invalid')
    }
  }

  // ارسال نتیجه اعتبارسنجی
  emitValidationResult(isValid, message)
}

/**
 * تنظیم پیام خطا و ارسال وضعیت اعتبارسنجی
 * @param {string} message - پیام خطا
 */
const setError = (message) => {
  errorMessage.value = message
  emitValidationResult(false, message)
}

/**
 * ارسال نتیجه اعتبارسنجی به کامپوننت والد
 * @param {boolean} isValid - آیا مقدار معتبر است
 * @param {string} [message] - پیام خطا در صورت وجود
 */
const emitValidationResult = (isValid, message = '') => {
  emit('validate', isValid)
  emit('validation-change', { isValid, message })
}

// ==================== Event Handlers ====================

/**
 * مدیریت رویداد فشردن کلید
 * @param {KeyboardEvent} event - رویداد کیبورد
 */
const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    emit('enter', event)
  }
}

/**
 * مدیریت رویداد تغییر فیلد
 * @param {Event} event - رویداد تغییر
 */
const handleInput = (event) => {
  inputValue.value = event.target.value
}

/**
 * مدیریت رویداد بلور فیلد
 * @param {Event} event - رویداد بلور
 */
const handleBlur = (event) => {
  isTouched.value = true
  isFocused.value = false

  // اعتبارسنجی در هنگام خارج شدن از فیلد
  validateInput(inputValue.value)

  emit('blur', event)
}

/**
 * مدیریت رویداد فوکوس فیلد
 */
const handleFocus = () => {
  isFocused.value = true
}

// Add the clear handler method
const handleClear = () => {
  inputValue.value = null
  validateInput(null)
}

// ==================== Lifecycle Hooks ====================

/**
 * اعتبارسنجی اولیه در هنگام نصب کامپوننت
 */
onMounted(() => {
  // اعتبارسنجی مقدار اولیه
  if (props.value !== null && props.value !== undefined && props.value !== '') {
    validateInput(props.value)
  }
})

/**
 * رصد تغییرات فیلد و اپراتور برای اعتبارسنجی مجدد
 */
watch([() => props.field, () => props.operator], () => {
  if (isTouched.value) {
    validateInput(inputValue.value)
  }
})

/**
 * رصد تغییرات مقدار برای اعتبارسنجی در صورت لمس شده بودن فیلد
 */
watch(
  () => props.value,
  (newVal) => {
    if (isTouched.value) {
      validateInput(newVal)
    }
  },
)
</script>

<style scoped>
.rule-input-field {
  position: relative;
  width: 100%;
  margin-bottom: 1rem;

  /* RTL Support */
  &[dir='rtl'],
  :global([dir='rtl']) & {
    text-align: right;
  }
}

/* Input Wrapper */
.input-wrapper,
.select-wrapper,
.date-picker-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Form Controls */
.form-control,
.form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;

  /* Focus State */
  &:focus {
    color: #495057;
    background-color: #fff;
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  /* Disabled State */
  &:disabled,
  &[readonly] {
    background-color: #e9ecef;
    opacity: 1;
  }

  /* Invalid State */
  &.is-invalid,
  .was-validated &:invalid {
    border-color: #dc3545;
    padding-right: calc(1.5em + 0.75rem);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23dc3545' viewBox='0 0 12 12'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right calc(0.375em + 0.1875rem) center;
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);

    &:focus {
      border-color: #dc3545;
      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
    }

    /* RTL Adjustment */
    [dir='rtl'] &,
    :global([dir='rtl']) & {
      padding-right: 0.75rem;
      padding-left: calc(1.5em + 0.75rem);
      background-position: left calc(0.375em + 0.1875rem) center;
    }
  }

  /* Valid State */
  &.is-valid,
  .was-validated &:valid {
    border-color: #28a745;
    padding-right: calc(1.5em + 0.75rem);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3e%3cpath fill='%2328a745' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right calc(0.375em + 0.1875rem) center;
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);

    &:focus {
      border-color: #28a745;
      box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
    }

    /* RTL Adjustment */
    [dir='rtl'] &,
    :global([dir='rtl']) & {
      padding-right: 0.75rem;
      padding-left: calc(1.5em + 0.75rem);
      background-position: left calc(0.375em + 0.1875rem) center;
    }
  }
}

/* Select Specific Styles */
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5' viewBox='0 0 4 5'%3e%3cpath fill='%23343a40' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 8px 10px;

  /* RTL Adjustment */
  [dir='rtl'] &,
  :global([dir='rtl']) & {
    background-position: left 0.75rem center;
  }

  /* Hide default arrow in IE10+ */
  &::-ms-expand {
    display: none;
  }
}

/* Loading Indicator */
.input-loading {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;

  /* RTL Adjustment */
  [dir='rtl'] &,
  :global([dir='rtl']) & {
    right: auto;
    left: 0.75rem;
  }

  .spinner-border {
    width: 1rem;
    height: 1rem;
    border-width: 0.2em;
  }
}

/* Clear Button */
.btn-clear {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  padding: 0.25rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.15s ease-in-out;

  &:hover {
    opacity: 1;
    color: #dc3545;
  }

  /* RTL Adjustment */
  [dir='rtl'] &,
  :global([dir='rtl']) & {
    right: auto;
    left: 0.75rem;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}

/* Character Counter */
.char-counter {
  font-size: 0.75rem;
  color: #6c757d;
  text-align: right;
  margin-top: 0.25rem;

  &.text-danger {
    color: #dc3545;
    font-weight: bold;
  }

  /* RTL Adjustment */
  [dir='rtl'] &,
  :global([dir='rtl']) & {
    text-align: left;
  }
}

/* Error Message */
.invalid-feedback {
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
  display: block;

  .icon-error {
    margin-left: 0.25rem;

    /* RTL Adjustment */
    [dir='rtl'] &,
    :global([dir='rtl']) & {
      margin-left: 0;
      margin-right: 0.25rem;
    }
  }
}

/* Loading State */
.is-loading {
  opacity: 0.7;
  pointer-events: none;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.7);
    z-index: 10;
    border-radius: 0.25rem;
  }
}

/* Focus State */
.is-focused {
  .form-control,
  .form-select {
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
}

/* Error State */
.has-error {
  .form-control,
  .form-select {
    border-color: #dc3545;

    &:focus {
      border-color: #dc3545;
      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
    }
  }
}

/* Responsive Adjustments */
@media (max-width: 575.98px) {
  .form-control,
  .form-select {
    font-size: 1rem; /* Larger touch target on mobile */
    padding: 0.625rem 0.75rem;
  }

  .btn-clear {
    padding: 0.375rem;
  }
}

/* Print Styles */
@media print {
  .input-loading,
  .btn-clear,
  .char-counter {
    display: none !important;
  }

  .form-control,
  .form-select {
    border: 1px solid #dee2e6;
    background-color: transparent !important;
  }
}

.input-container {
  position: relative;
  width: 100%;
}

.error-message {
  display: block;
  color: #ff4444;
  font-size: 0.8rem;
  margin-top: 4px;
  position: absolute;
  bottom: -20px;
  right: 0;
  white-space: nowrap;
}

.rule-control {
  width: 100%;
}
</style>
