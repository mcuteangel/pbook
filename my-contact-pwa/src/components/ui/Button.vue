<template>
  <button
    :class="[
      'glass-button',
      `button-${variant}`,
      `button-${size}`,
      { 'button-loading': loading },
      { 'button-disabled': disabled },
    ]"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <span v-if="loading" class="button-loader">
      <IconWrapper icon="spinner" prefix="fa-solid" animation="fa-spin" />
    </span>
    <span v-else-if="icon" class="button-icon">
      <IconWrapper :icon="icon" :prefix="iconPrefix" />
    </span>
    <span v-if="$slots.default" class="button-text">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import IconWrapper from '../common/IconWrapper.vue'

const props = defineProps({
  // نوع دکمه
  variant: {
    type: String,
    default: 'primary',
    validator: (value) =>
      ['primary', 'secondary', 'success', 'danger', 'warning', 'info'].includes(value),
  },
  // سایز دکمه
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  // آیکون دکمه
  icon: {
    type: String,
    default: '',
  },
  // پیشوند آیکون
  iconPrefix: {
    type: String,
    default: 'fa-solid',
  },
  // وضعیت لودینگ
  loading: {
    type: Boolean,
    default: false,
  },
  // وضعیت غیرفعال
  disabled: {
    type: Boolean,
    default: false,
  },
  // نوع دکمه HTML
  type: {
    type: String,
    default: 'button',
  },
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.glass-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-family: inherit;
  font-weight: var(--font-weight-medium);
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid var(--glass-border);
  background: var(--glass-background);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
  transition: all var(--transition-normal) var(--easing-default);
  position: relative;
  overflow: hidden;
}

/* واریانت‌های دکمه */
.button-primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary-dark);
}

.button-primary:hover {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-glow);
}

.button-secondary {
  background: var(--color-background-soft);
  color: var(--color-text);
}

.button-secondary:hover {
  background: var(--color-background-mute);
}

.button-success {
  background: var(--color-success);
  color: white;
  border-color: var(--color-success);
}

.button-success:hover {
  background: var(--color-success);
  opacity: 0.9;
}

.button-danger {
  background: var(--color-danger);
  color: white;
  border-color: var(--color-danger);
}

.button-danger:hover {
  background: var(--color-danger);
  opacity: 0.9;
}

.button-warning {
  background: var(--color-warning);
  color: white;
  border-color: var(--color-warning);
}

.button-warning:hover {
  background: var(--color-warning);
  opacity: 0.9;
}

.button-info {
  background: var(--color-info);
  color: white;
  border-color: var(--color-info);
}

.button-info:hover {
  background: var(--color-info);
  opacity: 0.9;
}

/* سایزهای دکمه */
.button-sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  border-radius: var(--border-radius-sm);
}

.button-md {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-md);
  border-radius: var(--border-radius-md);
}

.button-lg {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-lg);
  border-radius: var(--border-radius-lg);
}

/* وضعیت‌های دکمه */
.button-loading {
  cursor: wait;
  opacity: 0.8;
}

.button-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.button-loader {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.button-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.button-text {
  display: inline-block;
}

/* افکت‌های تعاملی */
.glass-button:not(.button-disabled):not(.button-loading):hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.glass-button:not(.button-disabled):not(.button-loading):active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* رسپانسیو */
@media (max-width: 480px) {
  .button-lg {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-md);
  }
}
</style>
