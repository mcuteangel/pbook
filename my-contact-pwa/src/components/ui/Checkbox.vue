<template>
  <div class="checkbox-wrapper" :class="{ 'is-disabled': disabled }">
    <!-- چک‌باکس -->
    <label class="checkbox-label" :class="{ 'is-disabled': disabled }">
      <input
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        :required="required"
        :name="name"
        :value="value"
        class="checkbox-input"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <span class="checkbox-custom" :class="{ 'is-checked': modelValue }">
        <IconWrapper
          v-if="modelValue"
          icon="check"
          prefix="fa-solid"
          class="check-icon"
          aria-hidden="true"
        />
      </span>
      <span class="checkbox-text">
        <slot>{{ label }}</slot>
      </span>
    </label>

    <!-- پیام خطا -->
    <div v-if="error" class="error-message" role="alert">
      {{ error }}
    </div>

    <!-- راهنما -->
    <div v-if="hint && !error" class="hint-message">
      {{ hint }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import IconWrapper from '../common/IconWrapper.vue'

// تعریف پراپ‌ها
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  value: {
    type: [String, Number, Boolean],
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  indeterminate: {
    type: Boolean,
    default: false,
  },
})

// تعریف emit‌ها
const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur'])

// متدها
const handleChange = (event) => {
  emit('update:modelValue', event.target.checked)
  emit('change', event.target.checked)
}

const handleFocus = (event) => {
  emit('focus', event)
}

const handleBlur = (event) => {
  emit('blur', event)
}
</script>

<style scoped>
.checkbox-wrapper {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.checkbox-label.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-custom {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  margin-left: 0.5rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  backdrop-filter: var(--glass-blur);
  transition: all 0.2s ease;
}

.checkbox-label:hover:not(.is-disabled) .checkbox-custom {
  border-color: var(--primary);
  box-shadow: var(--glass-shadow);
}

.checkbox-custom.is-checked {
  background: var(--primary);
  border-color: var(--primary);
}

.check-icon {
  color: white;
  font-size: 0.75rem;
  transform: scale(0);
  transition: transform 0.2s ease;
}

.checkbox-custom.is-checked .check-icon {
  transform: scale(1);
}

.checkbox-text {
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.5;
}

.error-message {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--error);
}

.hint-message {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* استایل‌های موبایل */
@media (max-width: 640px) {
  .checkbox-custom {
    width: 1.5rem;
    height: 1.5rem;
  }

  .check-icon {
    font-size: 0.875rem;
  }
}
</style>
