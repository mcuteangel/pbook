<template>
  <div class="advanced-filter-section">
    <!-- ...کد فیلتر پیشرفته مشابه ساختار فعلی... -->
    <slot />
    <h3>
      <span style="margin-left: 4px"><IconWrapper icon="fa-solid fa-list" /></span>
      {{ $t('contactList.filterRulesTitle') }}
    </h3>

    <div class="add-rule-form">
      <h4>{{ $t('contactList.addRuleTitle') }}:</h4>
      <select v-model="newRule.field" class="rule-control flat-select">
        <option value="" disabled>{{ $t('contactList.selectFieldPlaceholder') }}</option>
        <option v-for="field in filterableFields" :key="field.value" :value="field.value">
          {{ field.label }}
        </option>
      </select>
      <select
        v-model="newRule.operator"
        class="rule-control flat-select"
        :disabled="!newRule.field"
      >
        <option value="" disabled>{{ $t('contactList.selectOperatorPlaceholder') }}</option>
        <option
          v-for="operator in availableOperators"
          :key="operator.value"
          :value="operator.value"
        >
          {{ operator.label }}
        </option>
      </select>
      <template v-if="selectedNewRuleFieldDefinition">
        <input
          v-if="['text', 'textarea'].includes(selectedNewRuleFieldDefinition.type)"
          v-model="newRule.value"
          :placeholder="
            $t('contactList.filterValuePlaceholder', {
              fieldLabel: selectedNewRuleFieldDefinition.label,
            })
          "
          class="rule-control flat-input"
          :disabled="
            !newRule.operator || newRule.operator === 'isNull' || newRule.operator === 'isNotNull'
          "
          :type="selectedNewRuleFieldDefinition.type === 'textarea' ? 'text' : 'text'"
        />
        <input
          v-else-if="selectedNewRuleFieldDefinition.type === 'number'"
          v-model.number="newRule.value"
          :placeholder="
            $t('contactList.filterNumberValuePlaceholder', {
              fieldLabel: selectedNewRuleFieldDefinition.label,
            })
          "
          class="rule-control flat-input"
          :disabled="
            !newRule.operator || newRule.operator === 'isNull' || newRule.operator === 'isNotNull'
          "
          type="number"
        />
        <PersianDatePicker
          v-else-if="selectedNewRuleFieldDefinition.type === 'date'"
          v-model="newRule.value"
          :placeholder="$t('contactList.selectDatePlaceholder')"
          :disabled="
            !newRule.operator || newRule.operator === 'isNull' || newRule.operator === 'isNotNull'
          "
          clearable
          input-class="rule-control flat-input"
        />
        <select
          v-else-if="
            ['select', 'boolean', 'gender', 'group'].includes(selectedNewRuleFieldDefinition.type)
          "
          v-model="newRule.value"
          class="rule-control flat-select"
          :disabled="
            !newRule.operator || newRule.operator === 'isNull' || newRule.operator === 'isNotNull'
          "
        >
          <option value="" disabled>{{ $t('contactList.selectValue') }}</option>
          <option v-for="option in valueSelectOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <input
          v-else
          v-model="newRule.value"
          :placeholder="$t('contactList.filterValueUnknownPlaceholder')"
          class="rule-control flat-input"
          :disabled="
            !newRule.operator || newRule.operator === 'isNull' || newRule.operator === 'isNotNull'
          "
          type="text"
        />
      </template>
      <span v-else class="rule-control-placeholder">
        {{ $t('contactList.selectFieldPrompt') }}
      </span>
      <button
        type="button"
        class="button add-rule-btn"
        @click="addNewRule"
        :disabled="
          !newRule.field ||
          !newRule.operator ||
          (newRule.operator !== 'isNull' &&
            newRule.operator !== 'isNotNull' &&
            (newRule.value === null || newRule.value === ''))
        "
      >
        ➕ {{ $t('contactList.addRuleButton') }}
      </button>
    </div>

    <div class="current-rules-list">
      <h4>{{ $t('contactList.activeFilterRules') }}:</h4>
      <p v-if="filterRules.length === 0" class="no-rules-message">
        {{ $t('contactList.noRulesMessage') }}
      </p>

      <div v-for="(rule, index) in filterRules" :key="index" class="filter-rule-item">
        <p>
          <span class="rule-field-label">
            {{ filterableFields.find((f) => f.value === rule.field)?.label || rule.field }}:
          </span>
          <span class="rule-operator-label"> {{ getRuleOperatorLabel(rule) }} </span>
          <span
            v-if="
              rule.value !== null &&
              rule.operator !== 'isNull' &&
              rule.operator !== 'isNotNull' &&
              rule.value !== ''
            "
            class="rule-value"
          >
            "{{ formatRuleValue(rule) }}"
          </span>
          <span
            v-else-if="rule.operator === 'isNull' || rule.operator === 'isNotNull'"
            class="rule-value-none"
          >
            ({{ $t('contactList.noValueNeeded') }})
          </span>
        </p>
        <button type="button" class="button delete-button" @click="removeRule(index)">
          🗑️ {{ $t('contactList.deleteRuleButton') }}
        </button>
      </div>
    </div>

    <hr v-if="filterRules.length > 0" class="filter-section-separator" />

    <div class="filter-actions">
      <button
        type="button"
        class="button apply-button"
        @click="applyFilters"
        :disabled="filterRules.length === 0"
      >
        <IconWrapper icon="fa-solid fa-check" /> {{ $t('contactList.applyFilterButton') }}
      </button>
      <button
        type="button"
        class="button clear-button"
        @click="clearFilters"
        :disabled="filterRules.length === 0"
      >
        <IconWrapper icon="fa-solid fa-xmark" /> {{ $t('contactList.clearFilterButton') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { IconWrapper, PersianDatePicker } from '@/components/common/commonComponents'
// import { formatDate } from '@/utils/date' // این خط رو نگه می‌دارم چون فایل date.js رو ساختم و لازمه

// defineProps و defineEmits در <script setup> نیازی به ایمپورت ندارند
// import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  filterRules: {
    type: Array,
    required: true,
  },
  filterableFields: {
    type: Array,
    required: true,
  },
  valueSelectOptions: {
    type: Array,
    required: true,
  },
})

const emits = defineEmits(['addRule', 'removeRule', 'applyFilters', 'clearFilters'])

const newRule = ref({
  field: null,
  operator: null,
  value: null,
})

const selectedNewRuleFieldDefinition = computed(() => {
  if (!newRule.value.field) return null
  return props.filterableFields.find((field) => field.value === newRule.value.field)
})

const availableOperators = computed(() => {
  if (!selectedNewRuleFieldDefinition.value) return []

  const fieldType = selectedNewRuleFieldDefinition.value.type
  const operators = []

  // Text fields (generic text, text area)
  if (['text', 'textarea'].includes(fieldType)) {
    operators.push(
      { value: 'contains', label: 'شامل' },
      { value: 'notContains', label: 'شامل نباشد' },
      { value: 'equals', label: 'برابر با' },
      { value: 'notEquals', label: 'نابرابر با' },
      { value: 'startsWith', label: 'شروع با' },
      { value: 'endsWith', label: 'پایان با' },
    )
  }
  // Numeric fields
  else if (fieldType === 'number') {
    operators.push(
      { value: 'equals', label: 'برابر با' },
      { value: 'notEquals', label: 'نابرابر با' },
      { value: 'greaterThan', label: 'بزرگتر از' },
      { value: 'lessThan', label: 'کوچکتر از' },
      { value: 'greaterThanOrEqual', label: 'بزرگتر یا مساوی' },
      { value: 'lessThanOrEqual', label: 'کوچکتر یا مساوی' },
    )
  }
  // Date fields
  else if (fieldType === 'date') {
    operators.push(
      { value: 'equals', label: 'برابر با' },
      { value: 'notEquals', label: 'نابرابر با' },
      { value: 'before', label: 'قبل از' },
      { value: 'after', label: 'بعد از' },
    )
  }
  // Select, boolean fields
  else if (['select', 'boolean', 'gender', 'group'].includes(fieldType)) {
    operators.push(
      { value: 'equals', label: 'برابر با' },
      { value: 'notEquals', label: 'نابرابر با' },
    )
  }

  // Add isNull/isNotNull for all types
  operators.push({ value: 'isNull', label: 'خالی است' }, { value: 'isNotNull', label: 'خالی نیست' })

  return operators
})

function getRuleOperatorLabel(rule) {
  const operator = availableOperators.value.find((op) => op.value === rule.operator)
  return operator ? operator.label : rule.operator
}

function formatRuleValue(rule) {
  if (rule.value === null || rule.value === '') return ''

  const fieldDef = props.filterableFields.find((field) => field.value === rule.field)
  if (!fieldDef) return rule.value

  if (fieldDef.type === 'date' && rule.value) {
    return formatDate(rule.value)
  } else if (['select', 'boolean', 'gender', 'group'].includes(fieldDef.type)) {
    const option = props.valueSelectOptions.find((opt) => opt.value === rule.value)
    return option ? option.label : rule.value
  }

  return rule.value
}

function addNewRule() {
  if (
    !newRule.value.field ||
    !newRule.value.operator ||
    (newRule.value.operator !== 'isNull' &&
      newRule.value.operator !== 'isNotNull' &&
      (newRule.value.value === null || newRule.value.value === ''))
  ) {
    return
  }

  emits('addRule', { ...newRule.value })

  // Reset form
  newRule.value = {
    field: null,
    operator: null,
    value: null,
  }
}

function removeRule(index) {
  emits('removeRule', index)
}

function applyFilters() {
  emits('applyFilters')
}

function clearFilters() {
  emits('clearFilters')
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
</style>
