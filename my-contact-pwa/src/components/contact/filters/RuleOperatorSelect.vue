<template>
  <select
    v-model="selectedOperator"
    @change="onChange"
    class="rule-control flat-select"
    :disabled="!field"
  >
    <option value="" disabled>{{ $t('contactList.selectOperatorPlaceholder') }}</option>
    <option v-for="op in availableOperators" :key="op.value" :value="op.value">
      {{ op.label }}
    </option>
  </select>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  field: {
    type: String,
    default: null
  },
  operator: {
    type: String,
    default: ''
  },
  filterableFields: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:operator']);

const selectedOperator = computed({
  get: () => props.operator,
  set: (value) => emit('update:operator', value)
});

const availableOperators = computed(() => {
  if (!props.field) return [];
  
  const field = props.filterableFields.find(f => f.value === props.field);
  if (!field) return [];
  
  const fieldType = field.type || 'text';
  const operators = [];

  // Text fields (generic text, text area)
  if (['text', 'textarea'].includes(fieldType)) {
    operators.push(
      { value: 'contains', label: 'شامل' },
      { value: 'notContains', label: 'شامل نباشد' },
      { value: 'equals', label: 'برابر با' },
      { value: 'notEquals', label: 'نابرابر با' },
      { value: 'startsWith', label: 'شروع با' },
      { value: 'endsWith', label: 'پایان با' }
    );
  }
  // Numeric fields
  else if (fieldType === 'number') {
    operators.push(
      { value: 'equals', label: 'برابر با' },
      { value: 'notEquals', label: 'نابرابر با' },
      { value: 'greaterThan', label: 'بزرگتر از' },
      { value: 'lessThan', label: 'کوچکتر از' },
      { value: 'greaterThanOrEqual', label: 'بزرگتر یا مساوی' },
      { value: 'lessThanOrEqual', label: 'کوچکتر یا مساوی' }
    );
  }
  // Date fields
  else if (fieldType === 'date') {
    operators.push(
      { value: 'equals', label: 'برابر با' },
      { value: 'notEquals', label: 'نابرابر با' },
      { value: 'before', label: 'قبل از' },
      { value: 'after', label: 'بعد از' }
    );
  }
  // Select, boolean fields (like gender, group)
  else if (['select', 'boolean', 'gender', 'group'].includes(fieldType)) {
    operators.push(
      { value: 'equals', label: 'برابر با' },
      { value: 'notEquals', label: 'نابرابر با' }
    );
  } else {
    // Default operators for unknown types
    operators.push(
      { value: 'contains', label: 'شامل' },
      { value: 'equals', label: 'برابر با' },
      { value: 'notEquals', label: 'نابرابر با' }
    );
  }

  // Add isNull/isNotNull for all types
  operators.push(
    { value: 'isNull', label: 'خالی است' },
    { value: 'isNotNull', label: 'خالی نیست' }
  );

  return operators;
});

function onChange() {
  emit('change', selectedOperator.value);
}
</script>
