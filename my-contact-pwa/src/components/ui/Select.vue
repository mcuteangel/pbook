<template>
  <div class="select-wrapper" :class="{ 'is-disabled': disabled }">
    <!-- لیبل -->
    <label v-if="label" :for="id" class="select-label">
      {{ label }}
      <span v-if="required" class="required-mark" aria-hidden="true">*</span>
    </label>

    <!-- کانتینر سلکت -->
    <div
      class="select-container"
      :class="{
        'is-open': isOpen,
        'is-disabled': disabled,
        'has-error': error,
        'has-value': modelValue,
      }"
      @click="toggleDropdown"
      @keydown="handleKeydown"
      tabindex="0"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-controls="id + '-listbox'"
      :aria-labelledby="label ? id + '-label' : undefined"
      :aria-activedescendant="activeOptionId"
    >
      <!-- آیکون پیشوند -->
      <IconWrapper
        v-if="prefixIcon"
        :icon="prefixIcon"
        :prefix="iconPrefix"
        class="prefix-icon"
        aria-hidden="true"
      />

      <!-- مقدار انتخاب شده -->
      <div class="selected-value">
        <template v-if="modelValue">
          <slot name="selected" :option="selectedOption">
            {{ selectedOption?.label || selectedOption?.value }}
          </slot>
        </template>
        <span v-else class="placeholder">{{ placeholder }}</span>
      </div>

      <!-- آیکون پسوند -->
      <IconWrapper
        :icon="isOpen ? 'chevron-up' : 'chevron-down'"
        prefix="fa-solid"
        class="suffix-icon"
        :class="{ 'is-open': isOpen }"
        aria-hidden="true"
      />
    </div>

    <!-- لیست گزینه‌ها -->
    <Transition name="slide-fade">
      <div
        v-if="isOpen"
        class="options-container"
        :id="id + '-listbox'"
        role="listbox"
        :aria-label="label || placeholder"
      >
        <!-- جستجو -->
        <div v-if="searchable" class="search-container">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            class="search-input"
            :placeholder="t('select.searchPlaceholder')"
            @click.stop
            @keydown.esc="closeDropdown"
          />
          <IconWrapper icon="search" prefix="fa-solid" class="search-icon" aria-hidden="true" />
        </div>

        <!-- لیست گزینه‌ها -->
        <div class="options-list" @click.stop>
          <template v-if="filteredOptions.length">
            <div
              v-for="(option, index) in filteredOptions"
              :key="option.value"
              :id="id + '-option-' + index"
              class="option"
              :class="{
                'is-selected': isOptionSelected(option),
                'is-focused': index === focusedIndex,
              }"
              role="option"
              :aria-selected="isOptionSelected(option)"
              @click="selectOption(option)"
              @mouseenter="focusedIndex = index"
            >
              <slot name="option" :option="option">
                {{ option.label || option.value }}
              </slot>
            </div>
          </template>
          <div v-else class="no-options">
            {{ t('select.noOptions') }}
          </div>
        </div>
      </div>
    </Transition>

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
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import IconWrapper from '../common/IconWrapper.vue'

// تعریف پراپ‌ها
const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    default: null,
  },
  options: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every((option) => {
        return typeof option === 'object' && 'value' in option
      })
    },
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: () => 'select-' + Math.random().toString(36).substr(2, 9),
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
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
  searchable: {
    type: Boolean,
    default: false,
  },
  prefixIcon: {
    type: String,
    default: '',
  },
  iconPrefix: {
    type: String,
    default: 'fa-solid',
  },
  clearable: {
    type: Boolean,
    default: false,
  },
})

// تعریف emit‌ها
const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur'])

// استفاده از i18n
const { t } = useI18n()

// متغیرهای reactive
const isOpen = ref(false)
const searchQuery = ref('')
const focusedIndex = ref(-1)
const searchInput = ref(null)

// محاسبه‌های computed
const selectedOption = computed(() => {
  if (!props.modelValue) return null
  return props.options.find((option) => option.value === props.modelValue)
})

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options
  }

  const query = searchQuery.value.toLowerCase()
  return props.options.filter((option) => {
    const label = String(option.label || option.value).toLowerCase()
    return label.includes(query)
  })
})

const activeOptionId = computed(() => {
  if (focusedIndex.value === -1) return null
  return props.id + '-option-' + focusedIndex.value
})

// متدها
const toggleDropdown = () => {
  if (props.disabled) return

  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      if (props.searchable && searchInput.value) {
        searchInput.value.focus()
      }
    })
  } else {
    searchQuery.value = ''
  }
}

const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
  focusedIndex.value = -1
}

const selectOption = (option) => {
  if (props.disabled) return

  emit('update:modelValue', option.value)
  emit('change', option)
  closeDropdown()
}

const isOptionSelected = (option) => {
  return props.modelValue === option.value
}

const handleKeydown = (event) => {
  if (props.disabled) return

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (!isOpen.value) {
        toggleDropdown()
      } else if (focusedIndex.value !== -1) {
        selectOption(filteredOptions.value[focusedIndex.value])
      }
      break

    case 'Escape':
      if (isOpen.value) {
        closeDropdown()
      }
      break

    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        toggleDropdown()
      } else {
        focusedIndex.value = Math.min(focusedIndex.value + 1, filteredOptions.value.length - 1)
      }
      break

    case 'ArrowUp':
      event.preventDefault()
      if (isOpen.value) {
        focusedIndex.value = Math.max(focusedIndex.value - 1, 0)
      }
      break

    case 'Tab':
      closeDropdown()
      break
  }
}

// مدیریت کلیک خارج از کامپوننت
const handleClickOutside = (event) => {
  const selectWrapper = event.target.closest('.select-wrapper')
  if (!selectWrapper) {
    closeDropdown()
  }
}

// مدیریت فایل‌های کلیدی
const handleKeyPress = (event) => {
  if (!isOpen.value || !props.searchable) return

  const char = event.key.toLowerCase()
  if (/^[a-z0-9]$/.test(char)) {
    searchQuery.value += char
  }
}

// اضافه کردن event listener‌ها
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyPress)
})

// حذف event listener‌ها
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyPress)
})

// تماشای تغییرات
watch(isOpen, (newValue) => {
  if (newValue) {
    emit('focus')
  } else {
    emit('blur')
  }
})
</script>

<style scoped>
.select-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
}

.select-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.required-mark {
  color: var(--error);
  margin-right: 0.25rem;
}

.select-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 2.5rem;
  padding: 0.5rem 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-blur);
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-container:hover:not(.is-disabled) {
  border-color: var(--primary);
  box-shadow: var(--glass-shadow);
}

.select-container.is-open {
  border-color: var(--primary);
  box-shadow: var(--glass-shadow-active);
}

.select-container.has-error {
  border-color: var(--error);
}

.select-container.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--glass-bg-disabled);
}

.prefix-icon {
  margin-left: 0.5rem;
  color: var(--text-secondary);
}

.suffix-icon {
  margin-right: 0.5rem;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.suffix-icon.is-open {
  transform: rotate(180deg);
}

.selected-value {
  flex: 1;
  min-width: 0;
  padding: 0.25rem 0;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.placeholder {
  color: var(--text-secondary);
}

.options-container {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
  max-height: 15rem;
  overflow-y: auto;
}

.search-container {
  position: relative;
  padding: 0.5rem;
  border-bottom: 1px solid var(--glass-border);
}

.search-input {
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 0.5rem;
  background: var(--glass-bg-input);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: var(--glass-shadow-active);
}

.search-icon {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.options-list {
  padding: 0.5rem 0;
}

.option {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.option:hover {
  background: var(--glass-bg-hover);
}

.option.is-selected {
  background: var(--primary-light);
  color: var(--primary);
}

.option.is-focused {
  background: var(--glass-bg-hover);
}

.no-options {
  padding: 1rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.error-message {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--error);
}

.hint-message {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* انیمیشن‌ها */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* استایل‌های موبایل */
@media (max-width: 640px) {
  .select-container {
    min-height: 2.75rem;
  }

  .options-container {
    max-height: 12rem;
  }
}
</style>
