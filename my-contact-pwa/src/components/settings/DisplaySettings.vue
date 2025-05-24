<template>
  <section class="display-settings-section settings-section glass-section">
    <h3>تنظیمات نمایش لیست مخاطبین</h3>
    <p>ستون‌هایی را که می‌خواهید در لیست اصلی مخاطبین نمایش داده شوند، انتخاب کنید.</p>

    <div v-if="settingsStore.isLoading" class="loading-message">
      <IconWrapper icon="fa-solid fa-spinner fa-spin" /> در حال بارگذاری تنظیمات...
    </div>

    <div class="checkbox-group">
      <AppSettingsItem v-for="column in availableColumns" :key="column.value" :label="column.label">
        <input
          type="checkbox"
          :id="`col-${column.value}`"
          :value="column.value"
          v-model="selectedColumnsModel"
        />
      </AppSettingsItem>
    </div>

    <button type="button" @click="settingsStore.resetToDefaults" class="reset-button glass-btn">
      <IconWrapper icon="fa-solid fa-undo" /> بازنشانی به پیش‌فرض
    </button>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '@/store/settings'
import { useCustomFieldStore } from '@/store/customFields'
import AppSettingsItem from './AppSettingsItem.vue'
import IconWrapper from '@/components/icons/IconWrapper.vue'

const settingsStore = useSettingsStore()
const customFieldStore = useCustomFieldStore()

const standardColumns = [
  { label: 'نام', value: 'name' },
  { label: 'نام خانوادگی', value: 'lastName' },
  { label: 'تلفن ', value: 'phone' },
  { label: 'جنسیت', value: 'gender' },
  { label: 'گروه', value: 'group' },
  { label: 'تاریخ تولد', value: 'birthDate' },
  { label: 'سمت / تخصص', value: 'title' }, // قبلا position بود، به title تغییر کرد
  { label: 'تاریخ ایجاد', value: 'createdAt' },
  { label: 'آخرین ویرایش', value: 'updatedAt' },
  { label: 'شهر (آدرس اصلی)', value: 'address.city' }, // مشخص‌تر شد
  { label: 'خیابان (آدرس اصلی)', value: 'address.street' }, // مشخص‌تر شد
  { label: 'یادداشت‌ها', value: 'notes' }, // قبلا note بود
]

const availableColumns = computed(() => {
  const columns = [...standardColumns]
  if (customFieldStore.fieldDefinitions && customFieldStore.fieldDefinitions.length > 0) {
    customFieldStore.fieldDefinitions.forEach((field) => {
      columns.push({ label: `فیلد سفارشی: ${field.label}`, value: `customFieldDef_${field.id}` })
    })
  }
  return columns.sort((a, b) => a.label.localeCompare(b.label, 'fa')) // مرتب‌سازی بر اساس حروف الفبا
})

// This computed property with a setter is used for v-model on the checkboxes
const selectedColumnsModel = computed({
  get: () => settingsStore.displayColumns,
  set: (newVal) => {
    settingsStore.setDisplayColumns(newVal)
  },
})
</script>

<style scoped>
.settings-section {
  margin-bottom: 25px;
  padding: 20px;
}

.display-settings-section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--color-text-primary);
  font-size: 1.3em;
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: 10px;
}

.display-settings-section p {
  margin-bottom: 20px;
  font-size: 0.95em;
  color: var(--color-text-secondary);
}

.loading-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 15px;
  background-color: var(--color-background-info);
  color: var(--color-text-info);
  border-radius: var(--border-radius-medium);
  margin-bottom: 20px;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

/* Styling for AppSettingsItem will be handled within its own component */
/* but we can add specific adjustments if needed here */

.reset-button {
  /* Styles for glass-btn are assumed to be global or defined elsewhere */
  padding: 10px 20px;
  font-size: 1em;
}

.reset-button .fa-undo {
  margin-right: 8px;
}
</style>
