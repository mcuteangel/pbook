<template>
  <div class="input-wrapper" :class="{ 'input-error': error }">
    <label v-if="label" :for="id" class="input-label">
      {{ label }}
      <span v-if="required" class="input-required">*</span>
    </label>

    <div class="input-container">
      <span v-if="prefixIcon" class="input-icon input-prefix">
        <IconWrapper :icon="prefixIcon" :prefix="iconPrefix" />
      </span>

      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :autocomplete="autocomplete"
        class="input-field"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <span v-if="suffixIcon" class="input-icon input-suffix">
        <IconWrapper :icon="suffixIcon" :prefix="iconPrefix" />
      </span>

      <button
        v-if="clearable && modelValue"
        type="button"
        class="input-clear"
        @click="handleClear"
        :aria-label="$t('common.clear')"
      >
        <IconWrapper icon="times" prefix="fa-solid" />
      </button>
    </div>

    <div v-if="error || hint" class="input-message" :class="{ 'input-error-message': error }">
      {{ error || hint }}
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import IconWrapper from '../common/IconWrapper.vue'

const props = defineProps({
  // مقدار ورودی
  modelValue: {
    type: [String, Number],
    default: '',
  },
  // برچسب ورودی
  label: {
    type: String,
    default: '',
  },
  // نوع ورودی
  type: {
    type: String,
    default: 'text',
  },
  // شناسه ورودی
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substr(2, 9)}`,
  },
  // متن راهنما
  placeholder: {
    type: String,
    default: '',
  },
  // متن خطا
  error: {
    type: String,
    default: '',
  },
  // متن راهنمای اضافی
  hint: {
    type: String,
    default: '',
  },
  // آیکون پیشوند
  prefixIcon: {
    type: String,
    default: '',
  },
  // آیکون پسوند
  suffixIcon: {
    type: String,
    default: '',
  },
  // پیشوند آیکون
  iconPrefix: {
    type: String,
    default: 'fa-solid',
  },
  // غیرفعال
  disabled: {
    type: Boolean,
    default: false,
  },
  // فقط خواندنی
  readonly: {
    type: Boolean,
    default: false,
  },
  // اجباری
  required: {
    type: Boolean,
    default: false,
  },
  // قابل پاک کردن
  clearable: {
    type: Boolean,
    default: false,
  },
  // حداقل مقدار
  min: {
    type: [String, Number],
    default: undefined,
  },
  // حداکثر مقدار
  max: {
    type: [String, Number],
    default: undefined,
  },
  // گام
  step: {
    type: [String, Number],
    default: undefined,
  },
  // تکمیل خودکار
  autocomplete: {
    type: String,
    default: 'off',
  },
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'clear'])

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleFocus = (event) => {
  emit('focus', event)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.input-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.input-required {
  color: var(--color-danger);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-field {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  padding-left: var(--spacing-xl);
  padding-right: var(--spacing-xl);
  background: var(--glass-background);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  color: var(--color-text);
  font-size: var(--font-size-md);
  transition: all var(--transition-normal) var(--easing-default);
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}

.input-field::placeholder {
  color: var(--color-text-lighter);
}

.input-field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-field:read-only {
  background: var(--color-background-mute);
}

.input-icon {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-light);
  pointer-events: none;
}

.input-prefix {
  left: var(--spacing-md);
}

.input-suffix {
  right: var(--spacing-md);
}

.input-clear {
  position: absolute;
  right: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  color: var(--color-text-light);
  cursor: pointer;
  transition: all var(--transition-fast) var(--easing-default);
}

.input-clear:hover {
  color: var(--color-danger);
}

.input-message {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  min-height: 1.2em;
}

.input-error .input-field {
  border-color: var(--color-danger);
}

.input-error-message {
  color: var(--color-danger);
}

/* رسپانسیو */
@media (max-width: 480px) {
  .input-field {
    font-size: var(--font-size-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }

  .input-icon {
    font-size: var(--font-size-sm);
  }

  .input-clear {
    width: 16px;
    height: 16px;
  }
}
</style>
