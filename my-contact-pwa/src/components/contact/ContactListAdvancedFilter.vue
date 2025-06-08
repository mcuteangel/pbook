<template>
  <div class="advanced-filter-section">
    <slot />
    <h3>
      <!-- آیکون لیست برای عنوان فیلترها -->
      <span class="icon-wrapper">
        <IconWrapper icon="list" prefix="fa-solid" class="filter-title-icon" />
      </span>
      {{ $t('contactList.filterRulesTitle') }}
    </h3>

    <div class="rule-builder">
      <div class="rule-row">
        <!-- Field Selection -->
        <select
          v-model="newRule.field"
          @change="onFieldChange"
          class="rule-control flat-select"
          :disabled="!filterableFields.length"
        >
          <option value="" disabled>{{ $t('contactList.selectFieldPlaceholder') }}</option>
          <option v-for="field in filterableFields" :key="field.value" :value="field.value">
            {{ field.label }}
          </option>
        </select>

        <!-- Operator Selection -->
        <RuleOperatorSelect
          v-model:operator="newRule.operator"
          :field="newRule.field"
          :filterable-fields="filterableFields"
          @change="onOperatorChange"
        />

        <!-- Value Input (Dynamic based on field type) -->
        <RuleInputField
          v-if="selectedNewRuleFieldDefinition"
          v-model:value="newRule.value"
          :field="newRule.field"
          :operator="newRule.operator"
          :filterable-fields="filterableFields"
          :select-options="valueSelectOptions"
          :placeholder="getValuePlaceholder()"
          :disabled="
            !newRule.operator || newRule.operator === 'isNull' || newRule.operator === 'isNotNull'
          "
        />

        <!-- Add Rule Button -->
        <button
          type="button"
          class="button add-rule-button"
          @click="addNewRule"
          :disabled="!canAddRule"
        >
          <!-- آیکون + برای افزودن قانون جدید -->
          <IconWrapper icon="plus" prefix="fa-solid" class="add-icon" />
          {{ $t('contactList.addRuleButton') }}
        </button>
      </div>
    </div>

    <!-- Current Rules List -->
    <div class="current-rules-list">
      <h4>{{ $t('contactList.activeFilterRules') }}:</h4>
      <p v-if="filterRules.length === 0" class="no-rules-message">
        {{ $t('contactList.noRulesMessage') }}
      </p>

      <ul v-else class="rules-list">
        <li v-for="(rule, index) in filterRules" :key="index" class="rule-item">
          <div class="rule-content">
            <span class="rule-text">
              <strong>{{ getFieldLabel(rule.field) }}</strong>
              {{ getRuleOperatorLabel(rule) }}
              <span
                v-if="
                  rule.value !== null &&
                  rule.operator !== 'isNull' &&
                  rule.operator !== 'isNotNull' &&
                  rule.value !== ''
                "
                class="rule-value"
              >
                &quot;{{ formatRuleValue(rule) }}&quot;
              </span>
              <span
                v-else-if="rule.operator === 'isNull' || rule.operator === 'isNotNull'"
                class="rule-value-none"
              >
                ({{ $t('contactList.noValueNeeded') }})
              </span>
              <span class="rule-description" :title="getRuleOperatorDescription(rule)">
                <IconWrapper icon="info-circle" prefix="fa-solid" class="info-icon" />
              </span>
            </span>
            <button
              type="button"
              class="remove-rule-button"
              @click="removeRule(index)"
              :title="$t('contactList.removeRuleTooltip')"
            >
              <!-- آیکون سطل زباله برای حذف قانون -->
              <IconWrapper icon="trash" prefix="fa-solid" class="delete-icon" />
            </button>
          </div>
        </li>
      </ul>
    </div>

    <hr v-if="filterRules.length > 0" class="filter-section-separator" />

    <div class="filter-actions">
      <button
        type="button"
        class="button apply-button"
        @click="applyFilters"
        :disabled="filterRules.length === 0"
      >
        <!-- آیکون تیک برای اعمال فیلتر -->
        <IconWrapper icon="check" prefix="fa-solid" class="apply-icon" />
        {{ $t('contactList.applyFilterButton') }}
      </button>
      <button
        type="button"
        class="button clear-button"
        @click="clearFilters"
        :disabled="filterRules.length === 0"
      >
        <!-- آیکون ضربدر برای پاک کردن فیلترها -->
        <IconWrapper icon="xmark" prefix="fa-solid" class="clear-icon" />
        {{ $t('contactList.clearFilterButton') }}
      </button>
    </div>
  </div>
</template>

<script setup>
/**
 * کامپوننت فیلتر پیشرفته برای لیست مخاطبین
 * امکان ایجاد، حذف و مدیریت قوانین فیلتر را فراهم می‌کند
 */
import { reactive, toRefs, computed } from 'vue'
import { useI18n } from 'vue-i18n'

// کامپوننت‌های مورد نیاز
import IconWrapper from '@/components/common/IconWrapper.vue'
import PersianDatePicker from '@/components/ui/PersianDatePicker.vue'
import { formatDate } from '@/utils/formatters/index'
import moment from 'moment-jalaali'
import { getOperatorsForFieldType } from '@/utils/filterOperators'
import RuleOperatorSelect from '@/components/contact/filters/RuleOperatorSelect.vue'
import RuleInputField from '@/components/contact/filters/RuleInputField.vue'

// تعریف پراپرتی‌های کامپوننت
const props = defineProps({
  /**
   * لیست فیلدهای قابل فیلتر
   * @type {Array<{value: string, label: string, type: string}>}
   */
  filterableFields: {
    type: Array,
    required: true,
    default: () => [],
  },

  /**
   * لیست قوانین فیلتر فعلی
   * @type {Array<{field: string, operator: string, value: any}>}
   */
  modelValue: {
    type: Array,
    required: true,
    default: () => [],
  },
})

// تعریف رویدادهای کامپوننت
const emits = defineEmits([
  /** رویداد به‌روزرسانی قوانین فیلتر */
  'update:modelValue',
  /** رویداد حذف قانون */
  'removeRule',
  /** رویداد افزودن قانون جدید */
  'addRule',
  /** رویداد پاک کردن تمام فیلترها */
  'clearRules',
  /** رویداد اعمال فیلترها */
  'applyFilters',
])

// استفاده از i18n برای ترجمه متون
const { t } = useI18n()

/**
 * مدیریت وضعیت داخلی کامپوننت
 * @property {Object} newRule - قانون جدید در حال ایجاد
 * @property {string|null} newRule.field - فیلد انتخاب شده
 * @property {string|null} newRule.operator - اپراتور انتخاب شده
 * @property {any} newRule.value - مقدار وارد شده
 */
const state = reactive({
  newRule: {
    field: null,
    operator: null,
    value: null,
  },
})

// تبدیل state به refهای واکنش‌پذیر
const { newRule } = toRefs(state)

/**
 * گزینه‌های قابل انتخاب برای مقدار فیلد، در صورتی که فیلد انتخابی باشد
 * @type {import('vue').ComputedRef<Array<{value: any, label: string}>>}
 */
const valueSelectOptions = computed(() => {
  if (!newRule.value.field) {
    return [] // اگر فیلدی انتخاب نشده، گزینه‌ای وجود ندارد
  }

  const fieldDefinition = props.filterableFields.find((f) => f.value === newRule.value.field)

  if (fieldDefinition && fieldDefinition.options && Array.isArray(fieldDefinition.options)) {
    // اگر فیلد انتخاب شده، خودش گزینه‌هایی در پراپرتی options دارد
    return fieldDefinition.options.map((opt) => {
      if (typeof opt === 'object' && opt !== null && 'value' in opt && 'label' in opt) {
        return opt // اگر ساختار {value, label} دارد
      }
      return { value: opt, label: String(opt) } // در غیر این صورت، خود مقدار را به عنوان value و label در نظر بگیر
    })
  }

  // TODO: در اینجا می‌توان منطق بیشتری برای انواع دیگر فیلدهای select اضافه کرد
  // مثلاً اگر گزینه‌ها از یک منبع دیگر یا یک store خاص (مانند گروه‌ها) می‌آیند.
  // برای مثال، اگر فیلد 'group' باشد، می‌توان از groupStore.groups گزینه‌ها را ساخت.
  // if (fieldDefinition && fieldDefinition.value === 'group' && groupStore) {
  //   return groupStore.groups.map(g => ({ value: g.id, label: g.name }));
  // }

  return [] // در غیر این صورت، آرایه خالی
})

/**
 * ایجاد یک رفرنس برای قوانین فیلتر فعلی
 */
const filterRules = computed({
  get: () => props.modelValue,
  set: (value) => emits('update:modelValue', value),
})

/**
 * تعریف فیلد انتخاب شده در قانون جدید
 * @returns {Object|null} تعریف فیلد انتخاب شده یا null در صورت عدم انتخاب
 */
const selectedNewRuleFieldDefinition = computed(() => {
  // بررسی وجود newRule
  if (!newRule.value) return null

  // بررسی انتخاب فیلد
  if (!newRule.value.field) return null

  // یافتن تعریف فیلد مربوطه
  return props.filterableFields.find((field) => field.value === newRule.value.field)
})

/**
 * لیست اپراتورهای در دسترس بر اساس نوع فیلد انتخاب شده
 * @returns {Array<Object>} آرایه‌ای از اپراتورهای قابل استفاده
 */
const availableOperators = computed(() => {
  // اگر فیلدی انتخاب نشده باشد، لیست خالی برگردانده می‌شود
  if (!newRule.value?.field) {
    console.debug('[ContactListAdvancedFilter] No field selected')
    return []
  }

  // یافتن تعریف فیلد انتخاب شده
  const field = props.filterableFields.find((f) => f.value === newRule.value.field)
  if (!field) {
    console.warn(
      `[ContactListAdvancedFilter] Field definition not found for: ${newRule.value.field}`,
    )
    return []
  }

  // تعیین نوع فیلد با پشتیبانی از انواع پیشرفته
  const fieldType = field.type || 'text'

  // دریافت عملگرهای مناسب برای نوع فیلد
  let operators = getOperatorsForFieldType(fieldType)

  // اضافه کردن عملگرهای سفارشی اگر در تعریف فیلد وجود داشته باشند
  if (field.customOperators && Array.isArray(field.customOperators)) {
    operators = [...operators, ...field.customOperators]
  }

  return operators
})

/**
 * دریافت برچسب فیلد بر اساس شناسه فیلد
 * @param {string} fieldId - شناسه فیلد
 * @returns {string} برچسب فیلد
 */
function getFieldLabel(fieldId) {
  const field = props.filterableFields.find((f) => f.value === fieldId)
  return field ? field.label : fieldId
}

/**
 * دریافت برچسب اپراتور بر اساس قانون داده شده
 * @param {Object} rule - قانون فیلتر شامل فیلد و اپراتور
 * @returns {string} برچسب خوانا برای اپراتور
 */
function getRuleOperatorLabel(rule) {
  const fieldDef = props.filterableFields.find((f) => f.value === rule.field)
  if (!fieldDef) {
    console.warn(`[ContactListAdvancedFilter] Field definition not found for: ${rule.field}`)
    return rule.operator
  }

  const fieldType = fieldDef.type || 'text'
  const operators = getOperatorsForFieldType(fieldType)
  const operator = operators.find((op) => op.value === rule.operator)

  if (!operator) {
    console.warn(`[ContactListAdvancedFilter] Operator not found: ${rule.operator}`)
    return rule.operator
  }

  return t(operator.label)
}

/**
 * دریافت توضیحات اپراتور بر اساس قانون داده شده
 * @param {Object} rule - قانون فیلتر شامل فیلد و اپراتور
 * @returns {string} توضیحات اپراتور
 */
function getRuleOperatorDescription(rule) {
  const fieldDef = props.filterableFields.find((f) => f.value === rule.field)
  if (!fieldDef) return ''

  const fieldType = fieldDef.type || 'text'
  const operators = getOperatorsForFieldType(fieldType)
  const operator = operators.find((op) => op.value === rule.operator)

  return operator?.description || ''
}

/**
 * قالب‌بندی مقدار قانون برای نمایش به کاربر
 * @param {Object} rule - قانون فیلتر شامل فیلد، اپراتور و مقدار
 * @returns {string} مقدار قالب‌بندی شده برای نمایش
 */
function formatRuleValue(rule) {
  if (rule.value === null || rule.value === '') return ''

  const fieldDef = props.filterableFields.find((field) => field.value === rule.field)
  if (!fieldDef) return rule.value

  if (fieldDef.type === 'date' && rule.value) {
    return formatDate(rule.value)
  } else if (['select', 'boolean', 'gender', 'group'].includes(fieldDef.type)) {
    const option = valueSelectOptions.value.find((opt) => opt.value === rule.value)
    return option ? option.label : rule.value
  }

  if (fieldDef.type === 'boolean') {
    return rule.value ? t('common.yes') : t('common.no')
  }

  return rule.value
}

/**
 * مدیریت تغییر فیلد در فرم اضافه کردن قانون جدید
 * ریست کردن اپراتور و مقدار هنگام تغییر فیلد
 */
function onFieldChange() {
  console.log(
    '[ContactListAdvancedFilter] onFieldChange started. Current newRule:',
    JSON.parse(JSON.stringify(newRule.value)),
  )
  // ریست کردن operator و value هنگام تغییر فیلد
  newRule.value.operator = null
  newRule.value.value = null
  console.log(
    '[ContactListAdvancedFilter] onFieldChange finished. Updated newRule:',
    JSON.parse(JSON.stringify(newRule.value)),
  )
}

/**
 * مدیریت تغییر اپراتور در فرم اضافه کردن قانون جدید
 * تنظیم مقدار به null برای اپراتورهای isNull/isNotNull
 */
function onOperatorChange() {
  console.log(
    '[ContactListAdvancedFilter] onOperatorChange started. Current newRule:',
    JSON.parse(JSON.stringify(newRule.value)),
  )
  if (newRule.value.operator === 'isNull' || newRule.value.operator === 'isNotNull') {
    console.log(
      '[ContactListAdvancedFilter] Operator is isNull or isNotNull, setting value to null.',
    )
    // تنظیم مقدار به null برای اپراتورهای isNull/isNotNull
    newRule.value.value = null
  } else {
    // اگر اپراتور به چیزی تغییر کرد که نیاز به مقدار دارد، مقدار قبلی رو نگه می‌داریم
    // فیلد ورودی فعال می‌شود و کاربر می‌تواند مقدار جدید را وارد کند
  }
  console.log(
    '[ContactListAdvancedFilter] onOperatorChange finished. Updated newRule:',
    JSON.parse(JSON.stringify(newRule.value)),
  )
}

/**
 * بررسی امکان اضافه کردن قانون جدید
 * @type {import('vue').ComputedRef<boolean>}
 */
const canAddRule = computed(() => {
  if (!newRule.value?.field || !newRule.value?.operator) return false

  // اگر اپراتور isNull یا isNotNull باشد، نیازی به مقدار نیست
  if (newRule.value.operator === 'isNull' || newRule.value.operator === 'isNotNull') return true

  // برای سایر اپراتورها، مقدار باید وجود داشته باشد
  return newRule.value.value !== null && newRule.value.value !== ''
})

/**
 * اضافه کردن قانون جدید به لیست فیلترها
 * انجام اعتبارسنجی‌های لازم قبل از اضافه کردن قانون
 */
function addNewRule() {
  console.log(
    '[ContactListAdvancedFilter] addNewRule called. Current newRule.value:',
    JSON.parse(JSON.stringify(newRule.value)),
  )

  // Basic validation
  if (!newRule.value?.field || !newRule.value?.operator) {
    console.error('[ContactListAdvancedFilter] Validation Failed: Field or Operator is missing.')
    if (!newRule.value?.field) console.error('--- Field is missing or falsy:', newRule.value?.field)
    if (!newRule.value?.operator)
      console.error('--- Operator is missing or falsy:', newRule.value?.operator)
    return
  }

  // Check if value is required and provided
  if (
    newRule.value.operator !== 'isNull' &&
    newRule.value.operator !== 'isNotNull' &&
    (newRule.value.value === null || newRule.value.value === '')
  ) {
    console.error(
      '[ContactListAdvancedFilter] Validation Failed: Value is missing for the selected operator.',
    )
    console.error('--- Operator:', newRule.value.operator)
    console.error('--- Value:', newRule.value.value)
    return
  }

  // Create a clean rule object to emit
  const ruleToAdd = {
    field: newRule.value.field,
    operator: newRule.value.operator,
    value: newRule.value.value,
  }

  console.log('[ContactListAdvancedFilter] Adding new rule:', ruleToAdd)

  // Add the new rule to the existing rules
  const updatedRules = [...filterRules.value, ruleToAdd]
  emits('update:modelValue', updatedRules)

  // Reset the form for the next rule
  newRule.value.field = null
  newRule.value.operator = null
  newRule.value.value = null
}

/**
 * حذف قانون از لیست قوانین فیلتر
 * @param {number} index - ایندکس قانونی که باید حذف شود
 */
function removeRule(index) {
  const updatedRules = [...filterRules.value]
  updatedRules.splice(index, 1)
  emits('update:modelValue', updatedRules)
}

/**
 * اعمال فیلترها
 */
function applyFilters() {
  emits('applyFilters')
}

/**
 * پاک کردن تمام فیلترها
 */
function clearFilters() {
  emits('clearRules')
  emits('update:modelValue', [])
}

/**
 * دریافت متن راهنما برای فیلد ورودی بر اساس نوع فیلد و عملگر
 * @returns {string} متن راهنما
 */
const getValuePlaceholder = () => {
  if (!newRule.field || !newRule.operator) return t('contactList.selectValuePlaceholder')

  const fieldDef = filterableFields.find((f) => f.value === newRule.field)
  if (!fieldDef) return t('contactList.selectValuePlaceholder')

  switch (fieldDef.type) {
    case 'text':
    case 'textarea':
      return t('contactList.enterTextPlaceholder')
    case 'number':
      return t('contactList.enterNumberPlaceholder')
    case 'date':
      return t('contactList.selectDatePlaceholder')
    case 'datetime':
      return t('contactList.selectDateTimePlaceholder')
    case 'select':
    case 'multiselect':
      return t('contactList.selectOptionPlaceholder')
    default:
      return t('contactList.selectValuePlaceholder')
  }
}
</script>

<style scoped>
.advanced-filter-section {
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 15px;
  margin-top: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.add-rule-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}

.rule-control {
  flex: 1;
  min-width: 180px;
}

.rule-control-placeholder {
  flex: 1;
  min-width: 180px;
  color: var(--color-muted);
  font-style: italic;
  padding: 8px;
}

.add-rule-btn {
  background: linear-gradient(120deg, var(--color-success) 60%, transparent 100%);
  color: var(--color-white);
  border: none;
}

.current-rules-list {
  margin-bottom: 20px;
}

.filter-rule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.1);
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.filter-rule-item p {
  margin: 0;
  flex: 1;
}

.rule-field-label {
  font-weight: bold;
  color: var(--color-accent);
}

.rule-operator-label {
  font-style: italic;
}

.rule-value {
  font-family: monospace;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 2px 5px;
  border-radius: 3px;
}

.rule-value-none {
  font-style: italic;
  color: var(--color-muted);
}

.filter-section-separator {
  border: none;
  border-top: 1px dashed rgba(255, 255, 255, 0.2);
  margin: 15px 0;
}

.filter-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.apply-button {
  background: linear-gradient(120deg, var(--color-primary) 60%, transparent 100%);
  color: var(--color-white);
  border: none;
}

.clear-button {
  background: linear-gradient(120deg, var(--color-warning) 60%, transparent 100%);
  color: var(--color-white);
  border: none;
}

.no-rules-message {
  font-style: italic;
  color: var(--color-muted);
  text-align: center;
  padding: 10px;
}

@media (max-width: 768px) {
  .add-rule-form {
    flex-direction: column;
    align-items: stretch;
  }

  .rule-control {
    width: 100%;
    min-width: 0;
  }

  .filter-rule-item {
    flex-direction: column;
    gap: 10px;
  }
}

.rule-description {
  margin-right: 8px;
  cursor: help;
}

.info-icon {
  font-size: 14px;
  color: var(--color-muted);
  transition: color 0.2s ease;
}

.info-icon:hover {
  color: var(--color-primary);
}
</style>
