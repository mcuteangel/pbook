<template>
  <section class="display-settings-section settings-section glass-section">
    <h3>{{ $t('settings.displaySettingsTitle') }}</h3>
    <p>{{ $t('settings.displaySettingsDescription') }}</p>

    <div v-if="settingsStore.isLoading" class="loading-message">
      <!-- آیکون لودینگ تنظیمات با پراپ‌های استاندارد و انیمیشن -->
<IconWrapper icon="spinner" prefix="fa-solid" animation="fa-spin" /> {{ $t('settings.loadingSettings') }}
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
      <!-- آیکون بازنشانی تنظیمات با پراپ‌های استاندارد -->
<IconWrapper icon="undo" prefix="fa-solid" /> {{ $t('settings.resetToDefaults') }}
    </button>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '@/store/settings'
import { useCustomFieldStore } from '@/store/customFields'
import AppSettingsItem from './AppSettingsItem.vue'
import IconWrapper from '@/components/common/IconWrapper.vue'
import { useI18n } from 'vue-i18n' // Import useI18n

const settingsStore = useSettingsStore()
const customFieldStore = useCustomFieldStore()
const { t } = useI18n() // Initialize useI18n

const standardColumns = [
  { label: t('contactList.name'), value: 'name' },
  { label: t('contactList.lastName'), value: 'lastName' },
  { label: t('contactList.phone'), value: 'phone' },
  { label: t('contactList.gender'), value: 'gender' },
  { label: t('contactList.group'), value: 'group' },
  { label: t('contactList.birthDate'), value: 'birthDate' },
  { label: t('contactList.title'), value: 'title' }, // قبلا position بود، به title تغییر کرد
  { label: t('contactList.createdAt'), value: 'createdAt' },
  { label: t('contactList.updatedAt'), value: 'updatedAt' },
  { label: t('contactList.addressCity'), value: 'address.city' }, // مشخص‌تر شد
  { label: t('contactList.addressStreet'), value: 'address.street' }, // مشخص‌تر شد
  { label: t('contactList.notes'), value: 'notes' }, // قبلا note بود
]

const availableColumns = computed(() => {
  const columns = [...standardColumns]
  if (customFieldStore.fieldDefinitions && customFieldStore.fieldDefinitions.length > 0) {
    customFieldStore.fieldDefinitions.forEach((field) => {
      columns.push({
        label: t('settings.customFieldLabel', { label: field.label }),
        value: `customFieldDef_${field.id}`,
      }) // Use translation key with placeholder
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
