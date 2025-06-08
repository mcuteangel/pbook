<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="modal-overlay"
        :class="{ 'is-blurred': blurBackground }"
        @click="handleOverlayClick"
      >
        <!-- مودال -->
        <div
          class="modal-container"
          :class="[
            size,
            { 'is-fullscreen': fullscreen },
            { 'is-centered': centered },
            { 'is-scrollable': scrollable },
          ]"
          @click.stop
          role="dialog"
          :aria-modal="true"
          :aria-labelledby="title ? id + '-title' : undefined"
          :aria-describedby="description ? id + '-description' : undefined"
        >
          <!-- هدر -->
          <div v-if="showHeader" class="modal-header">
            <div class="header-content">
              <h2 v-if="title" :id="id + '-title'" class="modal-title">
                <slot name="title">{{ title }}</slot>
              </h2>
              <p v-if="description" :id="id + '-description'" class="modal-description">
                <slot name="description">{{ description }}</slot>
              </p>
            </div>
            <button
              v-if="closeable"
              class="close-button"
              @click="handleClose"
              :aria-label="t('modal.close')"
            >
              <IconWrapper icon="times" prefix="fa-solid" class="close-icon" aria-hidden="true" />
            </button>
          </div>

          <!-- محتوا -->
          <div
            class="modal-content"
            :class="{ 'has-header': showHeader, 'has-footer': showFooter }"
          >
            <slot></slot>
          </div>

          <!-- فوتر -->
          <div v-if="showFooter" class="modal-footer">
            <slot name="footer">
              <div class="default-footer">
                <Button
                  v-if="showCancelButton"
                  variant="secondary"
                  size="medium"
                  @click="handleCancel"
                  :disabled="loading"
                >
                  {{ cancelText }}
                </Button>
                <Button
                  v-if="showConfirmButton"
                  variant="primary"
                  size="medium"
                  @click="handleConfirm"
                  :loading="loading"
                  :disabled="loading"
                >
                  {{ confirmText }}
                </Button>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import IconWrapper from '../common/IconWrapper.vue'
import Button from './Button.vue'

// تعریف پراپ‌ها
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'xlarge'].includes(value),
  },
  fullscreen: {
    type: Boolean,
    default: false,
  },
  centered: {
    type: Boolean,
    default: true,
  },
  scrollable: {
    type: Boolean,
    default: true,
  },
  closeable: {
    type: Boolean,
    default: true,
  },
  closeOnOverlayClick: {
    type: Boolean,
    default: true,
  },
  closeOnEsc: {
    type: Boolean,
    default: true,
  },
  blurBackground: {
    type: Boolean,
    default: true,
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  showCancelButton: {
    type: Boolean,
    default: true,
  },
  showConfirmButton: {
    type: Boolean,
    default: true,
  },
  cancelText: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: () => 'modal-' + Math.random().toString(36).substr(2, 9),
  },
})

// تعریف emit‌ها
const emit = defineEmits(['update:modelValue', 'close', 'cancel', 'confirm', 'opened', 'closed'])

// استفاده از i18n
const { t } = useI18n()

// متدها
const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
  handleClose()
}

const handleConfirm = () => {
  emit('confirm')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    handleClose()
  }
}

const handleKeydown = (event) => {
  if (props.closeOnEsc && event.key === 'Escape' && props.modelValue) {
    handleClose()
  }
}

// مدیریت اسکرول
const lockScroll = () => {
  document.body.style.overflow = 'hidden'
}

const unlockScroll = () => {
  document.body.style.overflow = ''
}

// تماشای تغییرات
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      lockScroll()
      emit('opened')
    } else {
      unlockScroll()
      emit('closed')
    }
  },
)

// مدیریت event listener‌ها
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  unlockScroll()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.modal-overlay.is-blurred {
  backdrop-filter: blur(8px);
}

.modal-container {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  max-height: 100vh;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
  transition: all 0.3s ease;
}

.modal-container.is-centered {
  margin: 1rem;
}

.modal-container.is-scrollable {
  overflow-y: auto;
}

.modal-container.small {
  max-width: 24rem;
}

.modal-container.medium {
  max-width: 32rem;
}

.modal-container.large {
  max-width: 48rem;
}

.modal-container.xlarge {
  max-width: 64rem;
}

.modal-container.is-fullscreen {
  max-width: 100%;
  max-height: 100vh;
  margin: 0;
  border-radius: 0;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--glass-border);
}

.header-content {
  flex: 1;
  min-width: 0;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.5;
}

.modal-description {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  margin: -0.5rem -0.5rem -0.5rem 1rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--glass-bg-hover);
  color: var(--text-primary);
}

.close-icon {
  font-size: 1rem;
}

.modal-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.modal-content.has-header {
  padding-top: 1rem;
}

.modal-content.has-footer {
  padding-bottom: 1rem;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid var(--glass-border);
}

.default-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* انیمیشن‌ها */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.95);
}

/* استایل‌های موبایل */
@media (max-width: 640px) {
  .modal-container {
    margin: 0;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-content {
    padding: 1rem;
  }

  .modal-footer {
    padding: 1rem;
  }

  .modal-title {
    font-size: 1.125rem;
  }
}
</style>
