<template>
  <div class="test-date-picker-view">
    <h1>🧪 تست انتخاب‌گر تاریخ گلس‌مورفیک 🧪</h1>

    <div class="controls-section">
      <h3>کنترل‌های عمومی</h3>
      <button @click="setRandomDates">تنظیم تاریخ‌های تصادفی</button>
      <button @click="clearAllDates">پاک کردن همه‌ی تاریخ‌ها</button>
    </div>

    <div class="picker-section">
      <h2>۱. انتخاب‌گر تاریخ شمسی (پیش‌فرض)</h2>
      <label for="shamsi-picker">تاریخ شمسی:</label>
      <PersianDatePicker
        id="shamsi-picker"
        v-model="selectedShamsiDate"
        initialView="shamsi"
        placeholder="تاریخ شمسی را انتخاب کنید"
        :inputClass="{ 'custom-input-style': true }"
        :popupClass="'custom-popup-style'"
        @open="logEvent('Shamsi Picker Opened')"
        @close="logEvent('Shamsi Picker Closed')"
        @select="handleDateSelect('شمسی', $event)"
        @view-change="handleViewChange('شمسی', $event)"
      />
      <p>
        مقدار انتخاب‌شده (ISO): <br /><code>{{
          selectedShamsiDate || 'هیچ تاریخی انتخاب نشده'
        }}</code>
      </p>
      <p>نمایش فرمت‌شده (اگر انتخاب شده): {{ formatDisplay(selectedShamsiDate, 'shamsi') }}</p>
    </div>

    <hr />

    <div class="picker-section">
      <h2>۲. انتخاب‌گر تاریخ میلادی</h2>
      <label for="gregorian-picker">تاریخ میلادی:</label>
      <PersianDatePicker
        id="gregorian-picker"
        v-model="selectedGregorianDate"
        initialView="gregorian"
        placeholder="تاریخ میلادی را انتخاب کنید"
        displayFormat="DD/MM/YYYY"
        valueFormat="YYYY-MM-DD"
        @select="handleDateSelect('میلادی', $event)"
      />
      <p>
        مقدار انتخاب‌شده (YYYY-MM-DD): <br /><code>{{
          selectedGregorianDate || 'هیچ تاریخی انتخاب نشده'
        }}</code>
      </p>
      <p>
        نمایش فرمت‌شده (اگر انتخاب شده):
        {{ formatDisplay(selectedGregorianDate, 'gregorian', 'DD/MM/YYYY') }}
      </p>
    </div>

    <hr />

    <div class="picker-section">
      <h2>۳. انتخاب‌گر با تاریخ اولیه و محدودیت</h2>
      <label for="limited-picker">تاریخ با محدودیت (شمسی):</label>
      <PersianDatePicker
        id="limited-picker"
        v-model="limitedDate"
        initialView="shamsi"
        placeholder="بین ۱ هفته قبل و ۱ هفته بعد"
        :minDate="minLimitDate"
        :maxDate="maxLimitDate"
        displayFormat="jYYYY/jMM/jDD HH:mm"
        @select="handleDateSelect('محدود', $event)"
      />
      <p>
        مقدار انتخاب‌شده: <br /><code>{{ limitedDate || 'هیچ تاریخی انتخاب نشده' }}</code>
      </p>
      <p>
        محدودیت‌ها: <br />حداقل: {{ formatDisplay(minLimitDate, 'shamsi', 'jYYYY/jMM/jDD') }}
        <br />حداکثر: {{ formatDisplay(maxLimitDate, 'shamsi', 'jYYYY/jMM/jDD') }}
      </p>
    </div>

    <hr />

    <div class="picker-section">
      <h2>۴. انتخاب‌گر غیرفعال</h2>
      <label for="disabled-picker">تاریخ (غیرفعال):</label>
      <PersianDatePicker
        id="disabled-picker"
        v-model="disabledDate"
        placeholder="این انتخاب‌گر غیرفعال است"
        :disabled="true"
      />
      <p>
        مقدار (باید null بماند): <br /><code>{{ disabledDate || 'هیچ تاریخی انتخاب نشده' }}</code>
      </p>
    </div>

    <hr />

    <div class="event-log-section">
      <h3><i class="fas fa-clipboard-list"></i> لاگ رویدادها:</h3>
      <ul class="event-log">
        <li v-for="(log, index) in eventLogs" :key="index">{{ log }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PersianDatePicker from '@/components/ui/PersianDatePicker.vue'
import moment from 'moment-jalaali'

// --- Refs for Date Values ---
const selectedShamsiDate = ref(null) // '2025-05-31T10:30:00.000Z' فرمت پیش‌فرض خروجی
const selectedGregorianDate = ref('2025-06-15') // مقدار اولیه با فرمت سفارشی valueFormat
const limitedDate = ref(moment().add(2, 'days').toISOString()) // تاریخ اولیه برای انتخاب‌گر محدود
const disabledDate = ref(null)

// --- Event Logging ---
const eventLogs = ref([])
const logEvent = (message) => {
  const now = new Date()
  const timeString = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`
  eventLogs.value.unshift(`[${timeString}] ${message}`)
  if (eventLogs.value.length > 10) {
    eventLogs.value.pop() // Keep log size manageable
  }
  console.log(message)
}

const handleDateSelect = (pickerName, dateValue) => {
  logEvent(`Picker "${pickerName}" selected: ${dateValue}`)
}

const handleViewChange = (pickerName, payload) => {
  logEvent(`Picker "${pickerName}" view changed to: ${payload.currentView}`)
}

// --- Date Limits ---
const minLimitDate = computed(() => moment().subtract(7, 'days').startOf('day').toISOString())
const maxLimitDate = computed(() => moment().add(7, 'days').endOf('day').toISOString())

// --- Helper Functions ---
const formatDisplay = (dateString, calendarType = 'gregorian', customFormat = null) => {
  if (!dateString) return 'N/A'
  const m = moment(dateString)
  if (!m.isValid()) return 'Invalid Date'

  if (customFormat) {
    return m.format(customFormat)
  }

  if (calendarType === 'shamsi') {
    return m.format('jYYYY/jMM/jDD HH:mm:ss')
  }
  return m.format('YYYY/MM/DD HH:mm:ss')
}

const getRandomDate = (start = moment().subtract(1, 'year'), end = moment().add(1, 'year')) => {
  const diff = end.diff(start, 'days')
  const randomDays = Math.floor(Math.random() * diff)
  return moment(start).add(randomDays, 'days').toISOString()
}

const setRandomDates = () => {
  logEvent('Setting random dates...')
  selectedShamsiDate.value = getRandomDate()
  selectedGregorianDate.value = moment(getRandomDate()).format('YYYY-MM-DD') // Match its valueFormat
  limitedDate.value = moment().toISOString() // Reset limited to today within its typical range
}

const clearAllDates = () => {
  logEvent('Clearing all dates...')
  selectedShamsiDate.value = null
  selectedGregorianDate.value = null
  limitedDate.value = null
  // disabledDate remains null
}

// Set an initial date for one of the pickers to see it on load
selectedShamsiDate.value = moment().subtract(3, 'jMonths').add(5, 'days').toISOString()
</script>

<style scoped>
.test-date-picker-view {
  padding: 2rem;
  max-width: 650px;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  font-family: 'Vazirmatn', sans-serif; /* یا فونت پروژه شما */
  color: var(--text-color, #333);
  background-color: var(--page-bg, #f4f7f6); /* پس زمینه برای کنتراست بهتر */
}

h1,
h2,
h3 {
  text-align: center;
  color: var(--header-color, #2c3e50);
}
h1 {
  margin-bottom: 1.5rem;
}
h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color-subtle, #e0e0e0);
  padding-bottom: 0.5rem;
}

.picker-section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  background: var(--glass-bg, rgba(255, 255, 255, 0.15)); /* کمی شفافیت بیشتر */
  border: 1px solid var(--glass-border-color, rgba(255, 255, 255, 0.2));
  border-radius: 1rem; /* یا var(--glass-border-radius-large) */
  padding: 1.5rem;
  backdrop-filter: blur(12px); /* کمی بلور بیشتر */
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); /* سایه واضح‌تر */
}

label {
  font-weight: bold;
  margin-bottom: 0.2rem;
  color: var(--label-color, #555);
  text-align: right;
}

p {
  font-size: 0.9em;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 0.5rem;
  border-radius: 4px;
  word-break: break-all;
  text-align: right;
}
p code {
  font-family: 'Courier New', Courier, monospace;
  color: var(--accent-color, #007bff);
}

hr {
  border: none;
  border-top: 1px dashed var(--border-color-subtle, #ccc);
  margin: 1.5rem 0;
}

.controls-section {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--glass-bg-darker, rgba(0, 0, 0, 0.05));
  border-radius: 0.5rem;
}

.controls-section button {
  padding: 0.5rem 1rem;
  background-color: var(--accent-color, #007bff);
  color: white;
  border: none;
  border-radius: var(--glass-border-radius, 8px);
  cursor: pointer;
  transition: background-color 0.2s;
}
.controls-section button:hover {
  background-color: var(--accent-color-dark, #0056b3);
}

.event-log-section {
  background: var(--glass-bg, rgba(255, 255, 255, 0.1));
  border: 1px solid var(--glass-border-color, rgba(255, 255, 255, 0.15));
  border-radius: 0.5rem;
  padding: 1rem;
  backdrop-filter: blur(8px);
}
.event-log-section h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}
.event-log {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 150px;
  overflow-y: auto;
  font-size: 0.8em;
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  padding: 0.5rem;
}
.event-log li {
  padding: 0.2rem 0;
  border-bottom: 1px dotted #eee;
  color: #444;
}
.event-log li:last-child {
  border-bottom: none;
}

/* استایل‌های سفارشی برای تست inputClass و popupClass */
:deep(.custom-input-style) {
  border: 2px solid var(--accent-color, #007bff) !important;
  box-shadow: 0 0 5px rgba(var(--accent-rgb), 0.5) !important;
}

:global(.custom-popup-style) {
  /* اگر popupClass به عنصری خارج از scope کامپوننت فعلی اعمال می‌شود */
  border: 2px dashed var(--secondary-color, #ffc107) !important;
  background-color: rgba(255, 255, 200, 0.3) !important; /* یک پس‌زمینه متفاوت برای تست */
}
</style>
