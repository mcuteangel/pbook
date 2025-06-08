<template>
  <div class="radio-wrapper" :class="{ 'is-disabled': disabled }">
    <!-- رادیو -->
    <label class="radio-label" :class="{ 'is-disabled': disabled }">
      <input
        type="radio"
        :checked="modelValue === value"
        :disabled="disabled"
        :required="required"
        :name="name"
        :value="value"
        class="radio-input"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <span class="radio-custom" :class="{ 'is-checked': modelValue === value }">
        <span v-if="modelValue === value" class="radio-dot"></span>
      </span>
      <span class="radio-text">
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

// تعریف پراپ‌ها
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: '',
  },
  value: {
    type: [String, Number, Boolean],
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  name: {
    type: String,
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
})

// تعریف emit‌ها
const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur'])

// متدها
const handleChange = (event) => {
  emit('update:modelValue', props.value)
  emit('change', props.value)
}

const handleFocus = (event) => {
  emit('focus', event)
}

const handleBlur = (event) => {
  emit('blur', event)
}
</script>

<style scoped>
.radio-wrapper {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}

.radio-label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.radio-label.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.radio-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-custom {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  margin-left: 0.5rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 50%;
  backdrop-filter: var(--glass-blur);
  transition: all 0.2s ease;
}

.radio-label:hover:not(.is-disabled) .radio-custom {
  border-color: var(--primary);
  box-shadow: var(--glass-shadow);
}

.radio-custom.is-checked {
  border-color: var(--primary);
}

.radio-dot {
  position: absolute;
  width: 0.75rem;
  height: 0.75rem;
  background: var(--primary);
  border-radius: 50%;
  transform: scale(0);
  transition: transform 0.2s ease;
}

.radio-custom.is-checked .radio-dot {
  transform: scale(1);
}

.radio-text {
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
  .radio-custom {
    width: 1.5rem;
    height: 1.5rem;
  }

  .radio-dot {
    width: 1rem;
    height: 1rem;
  }
}
</style>
