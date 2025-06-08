<template>
  <div class="glass-date-picker-wrapper" :class="{ disabled: disabled }">
    <div class="input-container" :class="inputClass">
      <input
        type="text"
        :value="formattedInputValue"
        :placeholder="placeholder"
        :disabled="disabled"
        readonly
        class="flat-input glass-date-picker-input"
        @click="togglePopup"
        ref="inputRef"
        aria-haspopup="dialog"
        :aria-expanded="isPopupOpen"
        aria-label="{{ $t('datePicker.aria.datePickerInput') }}"
      />
      <span class="icon-container" @click="togglePopup">
        <i class="fas fa-calendar"></i>
      </span>
      <span
        v-if="modelValue && !disabled"
        class="clear-icon-container"
        @click.stop="clearDate"
        role="button"
        aria-label="{{ $t('datePicker.aria.clearDate') }}"
      >
        <i class="fas fa-times"></i>
      </span>
    </div>

    <transition name="fade-scale">
      <div
        v-if="isPopupOpen"
        class="glass-date-picker-popup-overlay"
        @click="closePopupOnClickOutside"
        ref="overlayRef"
      >
        <div
          class="glass-date-picker-popup glass"
          :class="popupClass"
          ref="popupRef"
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-header-title"
          @keydown.esc="closePopup"
        >
          <div class="calendar-header">
            <div class="view-switch">
              <button
                @click="switchToView('shamsi')"
                :class="{ active: currentCalendarView === 'shamsi' }"
                class="glass-button"
                :aria-current="currentCalendarView === 'shamsi' ? 'page' : false"
              >
                {{ $t('datePicker.shamsi') }}
              </button>
              <button
                @click="switchToView('gregorian')"
                :class="{ active: currentCalendarView === 'gregorian' }"
                class="glass-button"
                :aria-current="currentCalendarView === 'gregorian' ? 'page' : false"
              >
                {{ $t('datePicker.gregorian') }}
              </button>
            </div>
            <div class="navigation">
              <button
                @click="prevYear"
                class="nav-button glass-button"
                aria-label="{{ $t('datePicker.aria.previousYear') }}"
              >
                <i class="fas fa-angle-double-left"></i>
              </button>
              <button
                @click="prevMonth"
                class="nav-button glass-button"
                aria-label="{{ $t('datePicker.aria.previousMonth') }}"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
            </div>
            <div id="calendar-header-title" class="current-month-year" aria-live="polite">
              {{ currentMonthYearDisplay }}
            </div>
            <div class="navigation">
              <button
                @click="nextMonth"
                class="nav-button glass-button"
                aria-label="{{ $t('datePicker.aria.nextMonth') }}"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
              <button
                @click="nextYear"
                class="nav-button glass-button"
                aria-label="{{ $t('datePicker.aria.nextYear') }}"
              >
                <i class="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>

          <div
            class="calendar-body"
            role="grid"
            :aria-label="$t('datePicker.aria.calendar', { calendarView: currentCalendarView })"
          >
            <div class="day-names" role="row">
              <span v-for="dayName in dayNames" :key="dayName" class="day-name" role="columnheader">
                {{ dayName }}
              </span>
            </div>
            <div class="days-grid" role="rowgroup">
              <button
                v-for="(day, index) in daysGrid"
                :key="index"
                :class="getDayClasses(day)"
                @click="selectDate(day)"
                :disabled="day.isDisabled || !day.isCurrentMonth"
                role="gridcell"
                :aria-label="getDayAriaLabel(day)"
                :aria-selected="day.isSelected"
                :aria-disabled="day.isDisabled || !day.isCurrentMonth"
                ref="dayRefs"
                :tabindex="isFocusableDay(day) ? 0 : -1"
                @keydown="handleDayKeyDown($event, day, index)"
              >
                {{ day.text }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import moment from 'moment-jalaali'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Initialize moment-jalaali
moment.loadPersian({
  usePersianDigits: true,
  dialect: 'persian-modern',
})

// --- Props ---
const props = defineProps({
  modelValue: {
    type: [String, Date, null] as any,
    default: null,
  },
  initialView: {
    type: String,
    default: 'shamsi', // 'shamsi' or 'gregorian'
    validator: (value: string) => ['shamsi', 'gregorian'].includes(value),
  },
  displayFormat: {
    type: String,
    default: '', // Default will be set based on view
  },
  valueFormat: {
    type: String,
    default: 'YYYY-MM-DDTHH:mm:ss.sssZ', // ISO 8601
  },
  placeholder: {
    type: String,
    default: '{{ $t("datePicker.placeholder") }}',
  },
  minDate: {
    type: [String, Date, null] as any,
    default: null,
  },
  maxDate: {
    type: [String, Date, null] as any,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  inputClass: {
    type: [String, Array, Object],
    default: '',
  },
  popupClass: {
    type: [String, Array, Object],
    default: '',
  },
})

// --- Emits ---
const emit = defineEmits(['update:modelValue', 'select', 'open', 'close', 'view-change'])

// --- Reactive State ---
const isPopupOpen = ref(false)
const currentCalendarView = ref(props.initialView) // 'shamsi' or 'gregorian'
const viewDate = ref(moment()) // The month/year currently being viewed in the calendar
const selectedDateInternal = ref<moment.Moment | null>(null)

const inputRef = ref<HTMLInputElement | null>(null)
const popupRef = ref<HTMLDivElement | null>(null)
const overlayRef = ref<HTMLDivElement | null>(null)
const dayRefs = ref<HTMLButtonElement[]>([])

// --- Utility Functions ---
const parseDate = (date: string | Date | null): moment.Moment | null => {
  if (!date) return null
  const mDate = moment(date)
  return mDate.isValid() ? mDate : null
}

const formatDate = (date: moment.Moment | null, format: string): string => {
  if (!date) return ''
  if (currentCalendarView.value === 'shamsi') {
    return date.format(format || 'jYYYY/jMM/jDD')
  }
  return date.format(format || 'YYYY/MM/DD')
}

// --- Computed Properties ---
const minMoment = computed(() => parseDate(props.minDate))
const maxMoment = computed(() => parseDate(props.maxDate))

const actualDisplayFormat = computed(() => {
  if (props.displayFormat) return props.displayFormat
  return currentCalendarView.value === 'shamsi' ? 'jYYYY/jMM/jDD' : 'YYYY/MM/DD'
})

const formattedInputValue = computed(() => {
  if (!selectedDateInternal.value) return ''
  return formatDate(selectedDateInternal.value, actualDisplayFormat.value)
})

const currentMonthYearDisplay = computed(() => {
  if (currentCalendarView.value === 'shamsi') {
    return viewDate.value.format('jMMMM jYYYY')
  }
  return viewDate.value.format('MMMM YYYY')
})

const dayNames = computed(() => {
  moment.locale(currentCalendarView.value === 'shamsi' ? 'fa' : 'en')
  if (currentCalendarView.value === 'shamsi') {
    // moment-jalaali uses Saturday as the first day for 'fa' locale with jWeek()
    // Standard Shamsi calendar starts with Shanbeh
    return [
      t('datePicker.weekdays.sh'),
      t('datePicker.weekdays.ye'),
      t('datePicker.weekdays.do'),
      t('datePicker.weekdays.se'),
      t('datePicker.weekdays.ch'),
      t('datePicker.weekdays.pa'),
      t('datePicker.weekdays.jo'),
    ]
  } else {
    // Standard Gregorian calendar often starts with Sunday or Monday.
    // For consistency with typical date pickers, let's use Su Mo Tu We Th Fr Sa
    // Moment's localeData().weekdaysMin() depends on locale's firstDayOfWeek.
    // We'll use a fixed order for simplicity or adjust based on moment's output.
    const m = moment().locale('en')
    const weekdays = []
    for (let i = 0; i < 7; i++) {
      // Sunday to Saturday
      weekdays.push(t(`datePicker.weekdays.${m.weekday(i).format('dd').toLowerCase()}`))
    }
    return weekdays // Sa Su Mo Tu We Th Fr
  }
})

const daysGrid = computed(() => {
  const days = []
  const currentMonth = viewDate.value.get(
    currentCalendarView.value === 'shamsi' ? 'jMonth' : 'month',
  )
  const currentYear = viewDate.value.get(currentCalendarView.value === 'shamsi' ? 'jYear' : 'year')

  const m = moment(viewDate.value) // clone
  if (currentCalendarView.value === 'shamsi') {
    m.jDate(1)
  } else {
    m.date(1)
  }

  // Day of the week (0 for Sunday, ..., 6 for Saturday for gregorian; for shamsi, moment-jalaali's jDay() is 0 for Shanbeh)
  let firstDayOfWeek =
    currentCalendarView.value === 'shamsi' ? moment(m).startOf('jMonth').day() : m.day()

  // Adjust for Shamsi if library uses different start (e.g. moment-jalaali jDay() 0 is Shanbe)
  // Our dayNames array for Shamsi starts with Shanbe, so if jDay() is 0, it's the first column.

  const daysInPrevMonth =
    currentCalendarView.value === 'shamsi'
      ? moment(m).subtract(1, 'jMonth').jDaysInMonth()
      : moment(m).subtract(1, 'month').daysInMonth()

  // Add days from previous month
  for (let i = 0; i < firstDayOfWeek; i++) {
    const dayNum = daysInPrevMonth - firstDayOfWeek + 1 + i
    const date = moment(m)
      .subtract(1, currentCalendarView.value === 'shamsi' ? 'jMonth' : 'month')
      .set(currentCalendarView.value === 'shamsi' ? 'jDate' : 'date', dayNum)
    days.push({
      text: currentCalendarView.value === 'shamsi' ? date.format('jD') : date.format('D'),
      momentDate: date,
      isCurrentMonth: false,
      isToday: false, // Today check only for current month days
      isSelected: false,
      isDisabled: true, // Days outside current month are typically not interactive or styled differently
    })
  }

  const daysInCurrentMonth =
    currentCalendarView.value === 'shamsi' ? m.jDaysInMonth() : m.daysInMonth()
  const today = moment()

  for (let i = 1; i <= daysInCurrentMonth; i++) {
    const date = moment(m).set(currentCalendarView.value === 'shamsi' ? 'jDate' : 'date', i)
    const isToday = date.isSame(today, 'day')
    const isSelected = selectedDateInternal.value
      ? date.isSame(selectedDateInternal.value, 'day')
      : false

    let isDisabled = false
    if (minMoment.value && date.isBefore(minMoment.value, 'day')) {
      isDisabled = true
    }
    if (maxMoment.value && date.isAfter(maxMoment.value, 'day')) {
      isDisabled = true
    }

    days.push({
      text: currentCalendarView.value === 'shamsi' ? date.format('jD') : date.format('D'),
      momentDate: date,
      isCurrentMonth: true,
      isToday,
      isSelected,
      isDisabled,
    })
  }

  // Add days from next month to fill the grid (usually 6 rows * 7 columns = 42 cells)
  const totalCells = Math.ceil(days.length / 7) * 7 // Ensure full weeks
  const remainingCells =
    totalCells > days.length
      ? totalCells - days.length
      : days.length % 7 === 0
        ? 0
        : 7 - (days.length % 7)

  for (let i = 1; i <= remainingCells; i++) {
    const date = moment(m)
      .add(1, currentCalendarView.value === 'shamsi' ? 'jMonth' : 'month')
      .set(currentCalendarView.value === 'shamsi' ? 'jDate' : 'date', i)
    days.push({
      text: currentCalendarView.value === 'shamsi' ? date.format('jD') : date.format('D'),
      momentDate: date,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isDisabled: true,
    })
  }
  return days.slice(0, 42) // Ensure max 42 cells for 6 weeks
})

// --- Methods ---
const setInitialDate = () => {
  const initialDate = parseDate(props.modelValue)
  if (initialDate && initialDate.isValid()) {
    selectedDateInternal.value = initialDate
    viewDate.value = moment(initialDate) // Open to the month of the selected date
  } else {
    selectedDateInternal.value = null
    viewDate.value = moment() // Open to current month
  }
  // Ensure viewDate reflects currentCalendarView (e.g. if initial is Shamsi, viewDate should be based on jMonth/jYear)
  if (currentCalendarView.value === 'shamsi') {
    viewDate.value.locale('fa') // moment-jalaali handles this
  } else {
    viewDate.value.locale('en')
  }
}

const openPopup = async () => {
  if (props.disabled || isPopupOpen.value) return
  isPopupOpen.value = true
  emit('open')
  await nextTick()
  focusFirstFocusableElementInPopup()
}

const closePopup = () => {
  if (!isPopupOpen.value) return
  isPopupOpen.value = false
  emit('close')
  inputRef.value?.focus()
}

const togglePopup = () => {
  if (isPopupOpen.value) {
    closePopup()
  } else {
    openPopup()
  }
}

const closePopupOnClickOutside = (event: MouseEvent) => {
  if (
    popupRef.value &&
    !popupRef.value.contains(event.target as Node) &&
    inputRef.value &&
    !inputRef.value.contains(event.target as Node) &&
    overlayRef.value === event.target // ensure click is on overlay itself
  ) {
    closePopup()
  }
}

const selectDate = (day: any) => {
  if (day.isDisabled || !day.isCurrentMonth) return
  selectedDateInternal.value = day.momentDate
  const outputValue = day.momentDate.utc().format(props.valueFormat)
  emit('update:modelValue', outputValue)
  emit('select', outputValue)
  closePopup()
}

const clearDate = () => {
  selectedDateInternal.value = null
  emit('update:modelValue', null)
  // Optionally emit 'select' with null or a specific 'clear' event
  // emit('select', null); // if clear should also trigger select
  closePopup() // Or keep it open if desired
}

const prevMonth = () => {
  viewDate.value = moment(viewDate.value).subtract(
    1,
    currentCalendarView.value === 'shamsi' ? 'jMonth' : 'month',
  )
}

const nextMonth = () => {
  viewDate.value = moment(viewDate.value).add(
    1,
    currentCalendarView.value === 'shamsi' ? 'jMonth' : 'month',
  )
}

const prevYear = () => {
  viewDate.value = moment(viewDate.value).subtract(
    1,
    currentCalendarView.value === 'shamsi' ? 'jYear' : 'year',
  )
}

const nextYear = () => {
  viewDate.value = moment(viewDate.value).add(
    1,
    currentCalendarView.value === 'shamsi' ? 'jYear' : 'year',
  )
}

const switchToView = (view: 'shamsi' | 'gregorian') => {
  if (currentCalendarView.value === view) return
  currentCalendarView.value = view
  // Adjust viewDate to reflect the new calendar system correctly
  // For example, if currently viewing Khordad 1403, switch to Gregorian should show ~June 2024
  // moment handles this conversion implicitly if the underlying timestamp is the same.
  // We may need to reset the day to the 1st of the month to avoid issues if the current day doesn't exist in the target month
  viewDate.value = moment(viewDate.value).set(view === 'shamsi' ? 'jDate' : 'date', 1)

  emit('view-change', { currentView: view })
  nextTick(() => {
    // Re-focus if necessary after view changes
    focusFirstFocusableElementInPopup()
  })
}

const getDayClasses = (day: any) => {
  return {
    'day-cell': true,
    today: day.isToday && day.isCurrentMonth,
    selected: day.isSelected && day.isCurrentMonth,
    'other-month': !day.isCurrentMonth,
    'disabled-day': day.isDisabled || !day.isCurrentMonth, // Also disable days not in current month for interaction
  }
}

const getDayAriaLabel = (day: any): string => {
  if (day.isSelected) {
    return `${useI18n().t('datePicker.aria.selectedDate')}: ${formatDate(day.momentDate, actualDisplayFormat.value)}`
  } else if (day.isToday) {
    return `${useI18n().t('datePicker.aria.today')}: ${formatDate(day.momentDate, actualDisplayFormat.value)}`
  } else if (day.isDisabled) {
    return `${useI18n().t('datePicker.aria.disabledDate')}: ${formatDate(day.momentDate, actualDisplayFormat.value)}`
  }
  return formatDate(day.momentDate, actualDisplayFormat.value)
}

// --- Accessibility: Keyboard Navigation ---
const focusFirstFocusableElementInPopup = () => {
  const focusableDay = dayRefs.value.find((btn) => btn && !btn.disabled && btn.tabIndex === 0)
  if (focusableDay) {
    focusableDay.focus()
  } else {
    // Fallback to first nav button or other focusable element
    const firstNavButton = popupRef.value?.querySelector(
      '.navigation button:not(:disabled)',
    ) as HTMLElement
    firstNavButton?.focus()
  }
}

const isFocusableDay = (day: any): boolean => {
  if (!day.isCurrentMonth || day.isDisabled) return false
  if (day.isSelected) return true
  if (!selectedDateInternal.value && day.isToday) return true
  // If no selection and not today, make the first day of the month focusable
  if (
    !selectedDateInternal.value &&
    !daysGrid.value.some((d) => d.isToday && d.isCurrentMonth) &&
    parseInt(day.text) === 1
  )
    return true
  return false
}

const handleDayKeyDown = (event: KeyboardEvent, day: any, index: number) => {
  if (
    ![
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Enter',
      ' ',
      'PageUp',
      'PageDown',
      'Home',
      'End',
    ].includes(event.key)
  ) {
    return
  }
  event.preventDefault() // Prevent page scroll

  let newIndex = index
  const daysInRow = 7

  switch (event.key) {
    case 'ArrowUp':
      newIndex = Math.max(0, index - daysInRow)
      break
    case 'ArrowDown':
      newIndex = Math.min(daysGrid.value.length - 1, index + daysInRow)
      break
    case 'ArrowLeft':
      newIndex = Math.max(0, index - 1)
      if (index % daysInRow === 0) prevMonth() // Move to prev month if at start of row
      break
    case 'ArrowRight':
      newIndex = Math.min(daysGrid.value.length - 1, index + 1)
      if ((index + 1) % daysInRow === 0) nextMonth() // Move to next month if at end of row
      break
    case 'Enter':
    case ' ':
      if (!day.isDisabled && day.isCurrentMonth) {
        selectDate(day)
      }
      return // Don't try to focus after selection + close
    case 'PageUp':
      event.altKey ? prevYear() : prevMonth()
      break
    case 'PageDown':
      event.altKey ? nextYear() : nextMonth()
      break
    case 'Home': // Go to first day of current month view
      newIndex = daysGrid.value.findIndex((d) => d.isCurrentMonth && parseInt(d.text) === 1)
      break
    case 'End': // Go to last day of current month view
      const lastDay = daysGrid.value
        .slice()
        .reverse()
        .find((d) => d.isCurrentMonth)
      newIndex = daysGrid.value.findIndex((d) => d.momentDate.isSame(lastDay?.momentDate, 'day'))
      break
  }

  nextTick(() => {
    const targetDayButton = dayRefs.value[newIndex]
    if (targetDayButton && !targetDayButton.disabled) {
      targetDayButton.focus()
    } else {
      // If target is disabled, try to find nearest enabled
      // This logic can be complex, for now, just focusing if available
      const firstEnabled = dayRefs.value.find((btn) => btn && !btn.disabled)
      firstEnabled?.focus()
    }
  })
}

// --- Lifecycle Hooks ---
onMounted(() => {
  setInitialDate()
  if (currentCalendarView.value === 'shamsi') {
    moment.locale('fa') // Ensure jalaali default for moment
  } else {
    moment.locale('en')
  }
  document.addEventListener('keydown', handleGlobalKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleGlobalKeyDown)
})

const handleGlobalKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isPopupOpen.value) {
    closePopup()
  }
}

// --- Watchers ---
watch(
  () => props.modelValue,
  (newValue) => {
    const newDate = parseDate(newValue)
    if (
      newDate &&
      selectedDateInternal.value &&
      newDate.isSame(selectedDateInternal.value, 'day')
    ) {
      // No change if dates are the same day, avoids potential view jumps if only time changed
      return
    }
    setInitialDate() // Re-initialize if modelValue changes from outside
  },
  { deep: true },
)

watch(currentCalendarView, () => {
  // When calendar view changes, ensure the day names and grid re-render correctly
  // The `viewDate` and `selectedDateInternal` should remain consistent (moment objects are timezone/calendar agnostic)
  // Formatting, however, will change.
  // This is mostly handled by computed properties reacting to currentCalendarView.
})

watch(isPopupOpen, (isOpen) => {
  if (isOpen) {
    // When popup opens, ensure viewDate is set to selected date's month or current month
    if (selectedDateInternal.value) {
      viewDate.value = moment(selectedDateInternal.value)
    } else {
      viewDate.value = moment() // Reset to current month if no date is selected
    }
    // Ensure viewDate respects the current calendar view
    if (currentCalendarView.value === 'shamsi') {
      viewDate.value.locale('fa')
    } else {
      viewDate.value.locale('en')
    }
  }
})
</script>

<style scoped>
/* Assuming glassmorphism.css and theme.css are globally available or imported */
/* You might need to adjust paths or ensure they are loaded in main.js */

.glass-date-picker-wrapper {
  position: relative;
  display: inline-block;
  font-family: sans-serif; /* Or your project's font */
}

.glass-date-picker-wrapper.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.glass-date-picker-input {
  /* Assuming .flat-input provides base styling */
  /* Add specific styles for date picker input */
  padding-right: 50px; /* Space for icons */
  padding-left: 10px;
  cursor: pointer;
  width: 100%; /* Or a fixed width */
  background-color: var(
    --glass-bg-color,
    rgba(255, 255, 255, 0.1)
  ); /* Example from glassmorphism */
  border: 1px solid var(--glass-border-color, rgba(255, 255, 255, 0.2));
  color: var(--text-color, #333); /* Adjust for light/dark themes */
  border-radius: var(--glass-border-radius, 8px);
}

.glass-date-picker-input:disabled {
  cursor: not-allowed;
  background-color: var(--disabled-bg-color, rgba(200, 200, 200, 0.1));
}

.icon-container,
.clear-icon-container {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  padding: 0 8px;
  cursor: pointer;
  color: var(--icon-color, #555);
}
.icon-container {
  right: 25px; /* Position for calendar icon */
}
.clear-icon-container {
  right: 5px; /* Position for clear icon */
  font-size: 0.9em;
}
.clear-icon-container:hover i {
  color: var(--accent-color, #ff0000);
}

.glass-date-picker-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3); /* Semi-transparent overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px); /* Optional: blur effect on overlay */
}

.glass-date-picker-popup {
  /* Assuming .glass provides base glassmorphism styling */
  min-width: 300px;
  max-width: 340px;
  padding: 15px;
  border-radius: var(--glass-border-radius-large, 12px); /* Larger radius for popup */
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37); /* Example shadow */
  z-index: 1001;
  color: var(--text-color-popup, #333); /* Ensure text is readable on glass */
}

/* Animations */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--glass-border-color, rgba(255, 255, 255, 0.2));
}

.current-month-year {
  font-weight: bold;
  font-size: 1.1em;
  text-align: center;
  flex-grow: 1;
  color: var(--header-text-color, inherit);
}

.view-switch {
  display: flex;
  gap: 5px;
  position: absolute; /* Or adjust flex layout */
  top: -5px;
  left: 15px;
}
.view-switch button {
  padding: 4px 8px;
  font-size: 0.8em;
  opacity: 0.7;
}
.view-switch button.active {
  opacity: 1;
  font-weight: bold;
  background-color: var(--accent-color-soft, rgba(var(--accent-rgb), 0.3)); /* Soft accent */
}

.navigation {
  display: flex;
}
.nav-button {
  /* .glass-button or custom */
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  font-size: 1.1em;
  color: var(--icon-nav-color, inherit);
  transition:
    background-color 0.2s,
    transform 0.1s;
}
.nav-button:hover:not(:disabled) {
  background-color: var(--glass-hover-bg-color, rgba(255, 255, 255, 0.2));
  border-radius: 50%;
}
.nav-button:active:not(:disabled) {
  transform: scale(0.9);
}
.nav-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.calendar-body {
  text-align: center;
}

.day-names {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
  font-size: 0.9em;
  font-weight: bold;
  color: var(--dayname-color, #777);
}
.day-name {
  padding: 5px 0;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px; /* Gap between day cells */
}

.day-cell {
  padding: 8px 0; /* Adjust for desired cell size */
  border: 1px solid transparent;
  border-radius: var(--glass-border-radius, 8px);
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
  font-size: 0.95em;
  background: none;
  color: var(--text-color-popup, inherit);
  position: relative; /* For 'today' indicator */
}

.day-cell:not(.disabled-day):not(.other-month):hover {
  background-color: var(--glass-hover-bg-color, rgba(255, 255, 255, 0.15));
  border-color: var(--accent-color-soft, rgba(var(--accent-rgb), 0.4));
}
.day-cell:focus {
  outline: 2px solid var(--focus-ring-color, var(--accent-color));
  outline-offset: 1px;
}

.day-cell.other-month {
  color: var(--other-month-color, #aaa);
  cursor: default;
  opacity: 0.6;
}
.day-cell.other-month:hover {
  background-color: transparent;
  border-color: transparent;
}

.day-cell.today:not(.selected) {
  /* Subtle border or background for today */
  border: 1px solid var(--accent-color, #007bff);
  font-weight: bold;
}
/* Alternative: dot indicator for today */
/*
.day-cell.today::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: var(--accent-color);
}
*/

.day-cell.selected {
  background-color: var(--accent-color, #007bff);
  color: var(--accent-text-color, #fff);
  font-weight: bold;
  box-shadow: 0 0 8px rgba(var(--accent-rgb), 0.5); /* Glow effect */
}

.day-cell.disabled-day {
  color: var(--disabled-text-color, #ccc);
  cursor: not-allowed;
  opacity: 0.5;
  text-decoration: line-through; /* Optional */
}
.day-cell.disabled-day:hover {
  background-color: transparent;
  border-color: transparent;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .glass-date-picker-popup {
    min-width: 280px;
    max-width: calc(100vw - 20px); /* Full width with some margin */
    padding: 10px;
  }
  .day-cell {
    padding: 6px 0;
    font-size: 0.9em;
  }
  .nav-button {
    padding: 6px;
    font-size: 1em;
  }
  .current-month-year {
    font-size: 1em;
  }
  .view-switch {
    top: -2px;
    left: 10px;
  }
  .view-switch button {
    padding: 3px 6px;
    font-size: 0.75em;
  }
}

/* General Glass Button Style (if not in global CSS) */
.glass-button {
  background-color: var(--glass-bg-color-button, rgba(255, 255, 255, 0.15));
  border: 1px solid var(--glass-border-color-button, rgba(255, 255, 255, 0.25));
  color: var(--text-color-button, inherit);
  padding: 6px 12px;
  border-radius: var(--glass-border-radius, 8px);
  cursor: pointer;
  transition:
    background-color 0.2s,
    box-shadow 0.2s;
}
.glass-button:hover:not(:disabled) {
  background-color: var(--glass-hover-bg-color-button, rgba(255, 255, 255, 0.25));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.glass-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
