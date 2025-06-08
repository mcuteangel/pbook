<template>
  <section class="backup-restore-section settings-section glass-section">
    <h3>{{ $t('settings.backupRestore.title') }}</h3>
    <p>
      {{ $t('settings.backupRestore.description') }}
    </p>

    <div class="backup-actions action-group">
      <h4>{{ $t('settings.backupRestore.backupTitle') }}</h4>
      <AppSettingsItem :label="$t('settings.backupRestore.backupContactsLabel')">
        <!-- دکمه دانلود مخاطبین با آیکون استاندارد و کامنت فارسی -->
<button @click="backupContactsHandler" class="action-button glass-btn">
  <IconWrapper icon="download" prefix="fa-solid" />
  {{ $t('settings.backupRestore.backupContactsButton') }}
</button>
      </AppSettingsItem>
      <AppSettingsItem :label="$t('settings.backupRestore.backupGroupsLabel')">
        <!-- دکمه دانلود گروه‌ها با آیکون استاندارد و کامنت فارسی -->
<button @click="backupGroupsHandler" class="action-button glass-btn">
  <IconWrapper icon="download" prefix="fa-solid" />
  {{ $t('settings.backupRestore.backupGroupsButton') }}
</button>
      </AppSettingsItem>
      <AppSettingsItem :label="$t('settings.backupRestore.backupCustomFieldsLabel')">
        <!-- دکمه دانلود فیلدهای سفارشی با آیکون استاندارد و کامنت فارسی -->
<button @click="backupCustomFieldsHandler" class="action-button glass-btn">
  <IconWrapper icon="download" prefix="fa-solid" />
  {{ $t('settings.backupRestore.backupCustomFieldsButton') }}
</button>
      </AppSettingsItem>
      <AppSettingsItem :label="$t('settings.backupRestore.backupAllLabel')">
        <button @click="backupAllDataHandler" class="action-button glass-btn primary-action">
          <!-- آیکون آرشیو با پراپ‌های استاندارد -->
<IconWrapper icon="archive" prefix="fa-solid" />
          {{ $t('settings.backupRestore.backupAllButton') }}
        </button>
      </AppSettingsItem>
    </div>

    <div class="restore-actions action-group">
      <h4>{{ $t('settings.backupRestore.restoreTitle') }}</h4>
      <p class="warning-text">
        <!-- آیکون هشدار با پراپ‌های استاندارد -->
<IconWrapper icon="triangle-exclamation" prefix="fa-solid" />
        {{ $t('settings.backupRestore.restoreWarning') }}
      </p>
      <AppSettingsItem :label="$t('settings.backupRestore.restoreContactsLabel')">
        <input
          type="file"
          @change="(e) => handleFileUpload(e, 'contacts')"
          accept=".json"
          class="file-input"
        />
        <!-- دکمه آپلود مخاطبین با آیکون استاندارد و کامنت فارسی -->
<button
  @click="restoreContactsHandler"
  :disabled="!uploadedFiles.contacts"
  class="action-button glass-btn"
>
  <IconWrapper icon="upload" prefix="fa-solid" />
  {{ $t('settings.backupRestore.restoreContactsButton') }}
</button>
      </AppSettingsItem>
      <AppSettingsItem :label="$t('settings.backupRestore.restoreGroupsLabel')">
        <input
          type="file"
          @change="(e) => handleFileUpload(e, 'groups')"
          accept=".json"
          class="file-input"
        />
        <!-- دکمه آپلود گروه‌ها با آیکون استاندارد و کامنت فارسی -->
<button
  @click="restoreGroupsHandler"
  :disabled="!uploadedFiles.groups"
  class="action-button glass-btn"
>
  <IconWrapper icon="upload" prefix="fa-solid" />
  {{ $t('settings.backupRestore.restoreGroupsButton') }}
</button>
      </AppSettingsItem>
      <AppSettingsItem :label="$t('settings.backupRestore.restoreCustomFieldsLabel')">
        <input
          type="file"
          @change="(e) => handleFileUpload(e, 'customFields')"
          accept=".json"
          class="file-input"
        />
        <!-- دکمه آپلود فیلدهای سفارشی با آیکون استاندارد و کامنت فارسی -->
<button
  @click="restoreCustomFieldsHandler"
  :disabled="!uploadedFiles.customFields"
  class="action-button glass-btn"
>
  <IconWrapper icon="upload" prefix="fa-solid" />
  {{ $t('settings.backupRestore.restoreCustomFieldsButton') }}
</button>
      </AppSettingsItem>
      <AppSettingsItem :label="$t('settings.backupRestore.restoreAllLabel')">
        <input
          type="file"
          @change="(e) => handleFileUpload(e, 'all')"
          accept=".json"
          class="file-input"
        />
        <!-- دکمه آپلود همه داده‌ها با آیکون استاندارد و کامنت فارسی -->
<button
  @click="restoreAllDataHandler"
  :disabled="!uploadedFiles.all"
  class="action-button glass-btn primary-action"
>
  <IconWrapper icon="upload" prefix="fa-solid" />
  {{ $t('settings.backupRestore.restoreAllButton') }}
</button>
      </AppSettingsItem>
    </div>

    <div v-if="restoreMessage" :class="['restore-message', `restore-message-${restoreStatus}`]">
      {{ restoreMessage }}
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '../../store/settings'
import AppSettingsItem from './AppSettingsItem.vue'
import IconWrapper from '../common/IconWrapper.vue'

const settingsStore = useSettingsStore()

const uploadedFiles = ref({
  contacts: null,
  groups: null,
  customFields: null,
  all: null,
})

const restoreMessage = ref('')
const restoreStatus = ref('') // 'success' or 'error'

const handleFileUpload = (event, type) => {
  const file = event.target.files[0]
  if (file) {
    uploadedFiles.value[type] = file
    restoreMessage.value = '' // Clear previous messages
  }
}

const showRestoreMessage = (message, status) => {
  restoreMessage.value = message
  restoreStatus.value = status
  setTimeout(() => {
    restoreMessage.value = ''
  }, 5000) // Message disappears after 5 seconds
}

const backupContactsHandler = async () => {
  await settingsStore.backupData('contacts')
  showRestoreMessage('پشتیبان مخاطبین با موفقیت ایجاد شد.', 'success')
}

const backupGroupsHandler = async () => {
  await settingsStore.backupData('groups')
  showRestoreMessage('پشتیبان گروه‌ها با موفقیت ایجاد شد.', 'success')
}

const backupCustomFieldsHandler = async () => {
  await settingsStore.backupData('customFields')
  showRestoreMessage('پشتیبان فیلدهای سفارشی با موفقیت ایجاد شد.', 'success')
}

const backupAllDataHandler = async () => {
  await settingsStore.backupData('all')
  showRestoreMessage('پشتیبان کامل اطلاعات با موفقیت ایجاد شد.', 'success')
}

const restoreContactsHandler = async () => {
  if (uploadedFiles.value.contacts) {
    try {
      await settingsStore.restoreData(uploadedFiles.value.contacts, 'contacts')
      showRestoreMessage('مخاطبین با موفقیت بازیابی شدند.', 'success')
      uploadedFiles.value.contacts = null // Reset file input
    } catch (error) {
      console.error('Error restoring contacts:', error)
      showRestoreMessage(`خطا در بازیابی مخاطبین: ${error.message}`, 'error')
    }
  }
}

const restoreGroupsHandler = async () => {
  if (uploadedFiles.value.groups) {
    try {
      await settingsStore.restoreData(uploadedFiles.value.groups, 'groups')
      showRestoreMessage('گروه‌ها با موفقیت بازیابی شدند.', 'success')
      uploadedFiles.value.groups = null
    } catch (error) {
      console.error('Error restoring groups:', error)
      showRestoreMessage(`خطا در بازیابی گروه‌ها: ${error.message}`, 'error')
    }
  }
}

const restoreCustomFieldsHandler = async () => {
  if (uploadedFiles.value.customFields) {
    try {
      await settingsStore.restoreData(uploadedFiles.value.customFields, 'customFields')
      showRestoreMessage('فیلدهای سفارشی با موفقیت بازیابی شدند.', 'success')
      uploadedFiles.value.customFields = null
    } catch (error) {
      console.error('Error restoring custom fields:', error)
      showRestoreMessage(`خطا در بازیابی فیلدهای سفارشی: ${error.message}`, 'error')
    }
  }
}

const restoreAllDataHandler = async () => {
  if (uploadedFiles.value.all) {
    try {
      await settingsStore.restoreData(uploadedFiles.value.all, 'all')
      showRestoreMessage('تمام اطلاعات با موفقیت بازیابی شد.', 'success')
      uploadedFiles.value.all = null
    } catch (error) {
      console.error('Error restoring all data:', error)
      showRestoreMessage(`خطا در بازیابی اطلاعات: ${error.message}`, 'error')
    }
  }
}
</script>

<style scoped>
.settings-section {
  margin-bottom: 25px;
  padding: 20px;
}

.backup-restore-section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--color-text-primary);
  font-size: 1.3em;
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: 10px;
}

.backup-restore-section p {
  margin-bottom: 20px;
  font-size: 0.95em;
  color: var(--color-text-secondary);
}

.action-group {
  margin-bottom: 30px;
  padding: 15px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--border-radius-medium);
  background-color: var(
    --color-background-soft-hover
  ); /* Slightly different background for groups */
}

.action-group h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--color-text-primary);
  font-size: 1.1em;
}

.action-button {
  /* Styles for glass-btn are assumed to be global or defined elsewhere */
  padding: 8px 15px;
  font-size: 0.95em;
  margin-top: 5px; /* Add some space if label is above */
}

.action-button .fa-solid {
  margin-right: 8px;
}

.primary-action {
  background-color: var(--color-primary) !important;
  color: white !important;
}

.primary-action:hover {
  background-color: var(--color-primary-dark) !important;
}

.file-input {
  display: block;
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid var(--color-border-input);
  border-radius: var(--border-radius-small);
  background-color: var(--color-background-input);
  color: var(--color-text-input);
  width: calc(100% - 18px); /* Adjust width to fit padding and border */
}

.warning-text {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background-color: var(--color-background-warning-soft);
  color: var(--color-text-warning);
  border: 1px solid var(--color-border-warning);
  border-radius: var(--border-radius-medium);
  margin-bottom: 15px;
  font-size: 0.9em;
}

.restore-message {
  padding: 10px 15px;
  border-radius: var(--border-radius-medium);
  margin-top: 15px;
  text-align: center;
  font-weight: 500;
}

.restore-message-success {
  background-color: var(--color-background-success-soft);
  color: var(--color-text-success);
  border: 1px solid var(--color-border-success);
}

.restore-message-error {
  background-color: var(--color-background-error-soft);
  color: var(--color-text-error);
  border: 1px solid var(--color-border-error);
}
</style>
