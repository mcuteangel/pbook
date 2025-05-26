<template>
  <vue-persian-datetime-picker
    v-model="dateValue"
    :format="format"
    :display-format="displayFormat"
    :type="type"
    :placeholder="$t('shared.datePicker.placeholder')"
    :disabled="disabled"
    :clearable="clearable"
    class="persian-date-picker-wrapper"
    input-class="form-control flat-input rule-control"
    popup-class="glassmorphic-popup"
    @input="updateValue"
  />
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import VuePersianDatetimePicker from 'vue3-persian-datetime-picker'
import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()

const props = defineProps({
  modelValue: {
    // Used for v-model
    type: [String, Date, null],
    default: null,
  },
  format: {
    type: String,
    default: 'jYYYY/jM/jD',
  },
  displayFormat: {
    type: String,
    default: 'jYYYY/jM/jD',
  },
  type: {
    type: String,
    default: 'date', // can be 'date', 'datetime', 'year', 'month'
  },
  placeholder: {
    type: String,
    // default: 'انتخاب تاریخ', // Removed hardcoded default
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  inputClass: {
    type: String,
    default: 'form-control flat-input rule-control',
  },
  popupClass: {
    type: String,
    default: 'glassmorphic-popup',
  },
})

const emit = defineEmits(['update:modelValue'])

const dateValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    dateValue.value = newValue
  },
)

const updateValue = (newValue) => {
  dateValue.value = newValue
  emit('update:modelValue', newValue)
}
</script>

<style scoped>
.persian-date-picker-wrapper {
  width: 100%; /* Ensure it takes full width of its container */
}

/* Styles for the input field itself */
:deep(.vpd-input-group input.vpd-input-custom) {
  /* Using :deep to target child component's classes */
  /* These styles will be similar to other flat-inputs in the project */
  background-color: var(--color-background-input, #fff);
  border: 1px solid var(--color-border-input, #ccc);
  border-radius: var(--border-radius-medium, 4px);
  padding: 8px 12px;
  color: var(--color-text-input, #333);
  font-size: 1rem;
  width: 100%; /* Make input take full width */
  box-sizing: border-box; /* Include padding and border in the element's total width and height */
}

:deep(.vpd-input-group input.vpd-input-custom:focus) {
  border-color: var(--color-primary, #007bff);
  box-shadow: 0 0 0 0.2rem var(--color-primary-shadow, rgba(0, 123, 255, 0.25));
  outline: none;
}

:deep(.vpd-input-group input.vpd-input-custom[disabled]) {
  background-color: var(--color-background-input-disabled, #e9ecef);
  opacity: 0.7;
  cursor: not-allowed;
}

/* Styles for the popup (calendar) - Glassmorphic */
:deep(.vpd-picker) {
  background: var(--glass-bg-picker, rgba(255, 255, 255, 0.3));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--border-radius-large, 8px);
  border: 1px solid var(--glass-border-picker, rgba(255, 255, 255, 0.18));
  box-shadow: 0 4px 30px var(--glass-shadow-picker, rgba(0, 0, 0, 0.1));
  color: var(--color-text-picker, #333); /* Text color inside picker */
}

:deep(.vpd-header) {
  background-color: transparent; /* Make header transparent to show glass effect */
  color: var(--color-text-picker-header, #000);
}

:deep(.vpd-header .vpd-next-month-btn),
:deep(.vpd-header .vpd-prev-month-btn),
:deep(.vpd-header .vpd-current-month) {
  color: var(--color-text-picker-header-controls, #000);
}

:deep(.vpd-header .vpd-next-month-btn:hover),
:deep(.vpd-header .vpd-prev-month-btn:hover) {
  background-color: var(--glass-hover-bg-picker, rgba(255, 255, 255, 0.2));
}

:deep(.vpd-content .vpd-day.selected .vpd-day-text) {
  background-color: var(--color-primary, #007bff);
  color: white;
  border-radius: 50%;
}

:deep(.vpd-content .vpd-day:hover .vpd-day-text) {
  background-color: var(--color-primary-light, #0056b3);
  color: white;
  border-radius: 50%;
}

:deep(.vpd-content .vpd-day.today .vpd-day-text) {
  border: 1px solid var(--color-primary, #007bff);
}

:deep(.vpd-actions .vpd-clear-btn),
:deep(.vpd-actions .vpd-submit-btn) {
  background-color: var(--color-button-picker, #007bff);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: var(--border-radius-small, 4px);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

:deep(.vpd-actions .vpd-clear-btn:hover),
:deep(.vpd-actions .vpd-submit-btn:hover) {
  background-color: var(--color-button-picker-hover, #0056b3);
}

:deep(.vpd-actions .vpd-clear-btn) {
  background-color: var(--color-button-picker-clear, #6c757d);
}

:deep(.vpd-actions .vpd-clear-btn:hover) {
  background-color: var(--color-button-picker-clear-hover, #5a6268);
}
</style>
