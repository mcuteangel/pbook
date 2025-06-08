<template>
  <div
    :class="[
      'glass-card',
      `card-${variant}`,
      { 'card-hoverable': hoverable },
      { 'card-loading': loading },
    ]"
  >
    <!-- هدر کارت -->
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">
          <IconWrapper v-if="icon" :icon="icon" :prefix="iconPrefix" class="card-icon" />
          {{ title }}
        </h3>
      </slot>
    </div>

    <!-- محتوای کارت -->
    <div class="card-body">
      <div v-if="loading" class="card-loading-overlay">
        <IconWrapper icon="spinner" prefix="fa-solid" animation="fa-spin" />
      </div>
      <slot></slot>
    </div>

    <!-- فوتر کارت -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import IconWrapper from '../common/IconWrapper.vue'

defineProps({
  // عنوان کارت
  title: {
    type: String,
    default: '',
  },
  // آیکون کارت
  icon: {
    type: String,
    default: '',
  },
  // پیشوند آیکون
  iconPrefix: {
    type: String,
    default: 'fa-solid',
  },
  // نوع کارت
  variant: {
    type: String,
    default: 'default',
    validator: (value) =>
      ['default', 'primary', 'success', 'warning', 'danger', 'info'].includes(value),
  },
  // قابلیت هاور
  hoverable: {
    type: Boolean,
    default: false,
  },
  // وضعیت لودینگ
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.glass-card {
  background: var(--glass-background);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--glass-shadow);
  transition: all var(--transition-normal) var(--easing-default);
  overflow: hidden;
}

/* واریانت‌های کارت */
.card-default {
  background: var(--glass-background);
}

.card-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: white;
}

.card-success {
  background: linear-gradient(135deg, var(--color-success), var(--color-success));
  color: white;
}

.card-warning {
  background: linear-gradient(135deg, var(--color-warning), var(--color-warning));
  color: white;
}

.card-danger {
  background: linear-gradient(135deg, var(--color-danger), var(--color-danger));
  color: white;
}

.card-info {
  background: linear-gradient(135deg, var(--color-info), var(--color-info));
  color: white;
}

/* بخش‌های کارت */
.card-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.card-icon {
  font-size: 1.2em;
  opacity: 0.8;
}

.card-body {
  padding: var(--spacing-lg);
  position: relative;
}

.card-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

/* وضعیت‌های کارت */
.card-hoverable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.card-loading {
  position: relative;
  pointer-events: none;
}

.card-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* رسپانسیو */
@media (max-width: 768px) {
  .card-header,
  .card-body,
  .card-footer {
    padding: var(--spacing-md);
  }

  .card-title {
    font-size: var(--font-size-lg);
  }
}

@media (max-width: 480px) {
  .card-header,
  .card-body,
  .card-footer {
    padding: var(--spacing-sm);
  }

  .card-title {
    font-size: var(--font-size-md);
  }
}
</style>
