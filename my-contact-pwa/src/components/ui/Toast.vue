<template>
  <Teleport to="body">
    <TransitionGroup
      tag="div"
      name="toast"
      class="toast-container"
      :class="[position, { 'is-rtl': isRtl }]"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item"
        :class="[toast.type, { 'is-closing': toast.isClosing }, { 'is-paused': toast.isPaused }]"
        role="alert"
        :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
        @mouseenter="pauseTimer(toast)"
        @mouseleave="resumeTimer(toast)"
      >
        <!-- آیکون -->
        <div class="toast-icon">
          <IconWrapper
            :icon="getIconForType(toast.type)"
            prefix="fa-solid"
            :class="toast.type"
            aria-hidden="true"
          />
        </div>

        <!-- محتوا -->
        <div class="toast-content">
          <div v-if="toast.title" class="toast-title">
            {{ toast.title }}
          </div>
          <div class="toast-message">
            {{ toast.message }}
          </div>
        </div>

        <!-- دکمه بستن -->
        <button
          v-if="toast.closeable"
          class="toast-close"
          @click="closeToast(toast)"
          :aria-label="t('toast.close')"
        >
          <IconWrapper icon="times" prefix="fa-solid" aria-hidden="true" />
        </button>

        <!-- نوار پیشرفت -->
        <div
          v-if="toast.progress"
          class="toast-progress"
          :style="{ width: toast.progress + '%' }"
        />
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import IconWrapper from '../common/IconWrapper.vue'

// تعریف پراپ‌ها
const props = defineProps({
  position: {
    type: String,
    default: 'top-right',
    validator: (value) =>
      [
        'top-right',
        'top-left',
        'bottom-right',
        'bottom-left',
        'top-center',
        'bottom-center',
      ].includes(value),
  },
  maxToasts: {
    type: Number,
    default: 5,
  },
  duration: {
    type: Number,
    default: 5000,
  },
  isRtl: {
    type: Boolean,
    default: false,
  },
})

// تعریف emit‌ها
const emit = defineEmits(['close'])

// استفاده از i18n
const { t } = useI18n()

// متغیرهای reactive
const toasts = ref([])
let toastCounter = 0

// متدها
const getIconForType = (type) => {
  const icons = {
    success: 'check-circle',
    error: 'exclamation-circle',
    warning: 'exclamation-triangle',
    info: 'info-circle',
  }
  return icons[type] || 'info-circle'
}

const addToast = (toast) => {
  const id = ++toastCounter
  const newToast = {
    id,
    type: toast.type || 'info',
    title: toast.title,
    message: toast.message,
    duration: toast.duration || props.duration,
    closeable: toast.closeable !== false,
    progress: 100,
    isClosing: false,
    isPaused: false,
  }

  // اضافه کردن به لیست
  toasts.value.unshift(newToast)

  // محدود کردن تعداد toast‌ها
  if (toasts.value.length > props.maxToasts) {
    toasts.value = toasts.value.slice(0, props.maxToasts)
  }

  // شروع تایمر
  startTimer(newToast)

  return id
}

const closeToast = (toast) => {
  toast.isClosing = true
  setTimeout(() => {
    const index = toasts.value.findIndex((t) => t.id === toast.id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
      emit('close', toast)
    }
  }, 300) // زمان انیمیشن خروج
}

const startTimer = (toast) => {
  if (toast.duration === 0) return

  const startTime = Date.now()
  const endTime = startTime + toast.duration

  const updateProgress = () => {
    if (toast.isPaused) return

    const now = Date.now()
    const remaining = endTime - now
    const progress = (remaining / toast.duration) * 100

    if (progress <= 0) {
      closeToast(toast)
    } else {
      toast.progress = progress
      requestAnimationFrame(updateProgress)
    }
  }

  requestAnimationFrame(updateProgress)
}

const pauseTimer = (toast) => {
  toast.isPaused = true
}

const resumeTimer = (toast) => {
  toast.isPaused = false
  startTimer(toast)
}

// متدهای کمکی برای نمایش انواع مختلف toast
const showSuccess = (message, title = '') => {
  return addToast({ type: 'success', message, title })
}

const showError = (message, title = '') => {
  return addToast({ type: 'error', message, title })
}

const showWarning = (message, title = '') => {
  return addToast({ type: 'warning', message, title })
}

const showInfo = (message, title = '') => {
  return addToast({ type: 'info', message, title })
}

// ارائه متدها به کامپوننت‌های دیگر
defineExpose({
  showSuccess,
  showError,
  showWarning,
  showInfo,
  closeToast,
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  pointer-events: none;
}

.toast-container.top-right {
  top: 0;
  right: 0;
}

.toast-container.top-left {
  top: 0;
  left: 0;
}

.toast-container.bottom-right {
  bottom: 0;
  right: 0;
}

.toast-container.bottom-left {
  bottom: 0;
  left: 0;
}

.toast-container.top-center {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.toast-container.bottom-center {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.toast-container.is-rtl {
  direction: rtl;
}

.toast-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-width: 20rem;
  max-width: 32rem;
  padding: 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
  pointer-events: auto;
  overflow: hidden;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.toast-icon.success {
  color: var(--success);
}

.toast-icon.error {
  color: var(--error);
}

.toast-icon.warning {
  color: var(--warning);
}

.toast-icon.info {
  color: var(--info);
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.toast-message {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.toast-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toast-close:hover {
  background: var(--glass-bg-hover);
  color: var(--text-primary);
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: currentColor;
  opacity: 0.2;
  transition: width 0.1s linear;
}

/* انیمیشن‌ها */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(1rem);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-1rem);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* استایل‌های موبایل */
@media (max-width: 640px) {
  .toast-container {
    padding: 0.5rem;
  }

  .toast-item {
    min-width: 0;
    width: 100%;
  }
}
</style>
