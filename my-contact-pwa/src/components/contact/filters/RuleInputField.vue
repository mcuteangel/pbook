<template>
  <!-- Text Input -->
  <input
    v-if="isTextInput"
    v-model="inputValue"
    type="text"
    class="rule-control flat-input"
    :placeholder="placeholder"
    :disabled="disabled"
  >

  <!-- Number Input -->
  <input
    v-else-if="isNumberInput"
    v-model.number="inputValue"
    type="number"
    class="rule-control flat-input"
    :placeholder="placeholder"
    :disabled="disabled"
  >

  <!-- Date Picker -->
  <PersianDatePicker
    v-else-if="isDateInput"
    v-model="inputValue"
    :placeholder="placeholder"
    :disabled="disabled"
    clearable
    input-class="rule-control flat-input"
  />

  <!-- Select Input -->
  <select
    v-else-if="isSelectInput"
    v-model="inputValue"
    class="rule-control flat-select"
    :disabled="disabled"
  >
    <option value="" disabled>{{ placeholder }}</option>
    <option v-for="option in selectOptions" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<script setup>
import { computed } from 'vue';
import PersianDatePicker from '@/components/common/PersianDatePicker.vue';

const props = defineProps({
  field: {
    type: String,
    default: null
  },
  value: {
    type: [String, Number, Boolean, Date, Array, Object],
    default: null
  },
  operator: {
    type: String,
    default: ''
  },
  filterableFields: {
    type: Array,
    required: true
  },
  selectOptions: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:value']);

const inputValue = computed({
  get: () => props.value,
  set: (value) => emit('update:value', value)
});

const selectedField = computed(() => {
  if (!props.field) return null;
  return props.filterableFields.find(f => f.value === props.field);
});

const fieldType = computed(() => selectedField.value?.type || 'text');

const isTextInput = computed(() => {
  if (props.operator === 'isNull' || props.operator === 'isNotNull') return false;
  return ['text', 'textarea', 'email', 'tel', 'url'].includes(fieldType.value);
});

const isNumberInput = computed(() => {
  if (props.operator === 'isNull' || props.operator === 'isNotNull') return false;
  return fieldType.value === 'number';
});

const isDateInput = computed(() => {
  if (props.operator === 'isNull' || props.operator === 'isNotNull') return false;
  return fieldType.value === 'date';
});

const isSelectInput = computed(() => {
  if (props.operator === 'isNull' || props.operator === 'isNotNull') return false;
  return ['select', 'boolean', 'gender', 'group'].includes(fieldType.value);
});
</script>
