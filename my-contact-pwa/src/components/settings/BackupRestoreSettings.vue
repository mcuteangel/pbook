<template>
  <section class="backup-restore-section settings-section glass-section">
    <h3>پشتیبان‌گیری و بازیابی اطلاعات</h3>
    <p>
      از اطلاعات مخاطبین، گروه‌ها و فیلدهای سفارشی خود پشتیبان تهیه کنید یا اطلاعات قبلی را بازیابی
      نمایید.
    </p>

    <div class="backup-actions action-group">
      <h4>تهیه پشتیبان</h4>
      <AppSettingsItem label="پشتیبان‌گیری از مخاطبین">
        <button @click="backupContactsHandler" class="action-button glass-btn">
          <IconWrapper icon="fa-solid fa-download" /> دانلود فایل پشتیبان مخاطبین
        </button>
      </AppSettingsItem>
      <AppSettingsItem label="پشتیبان‌گیری از گروه‌ها">
        <button @click="backupGroupsHandler" class="action-button glass-btn">
          <IconWrapper icon="fa-solid fa-download" /> دانلود فایل پشتیبان گروه‌ها
        </button>
      </AppSettingsItem>
      <AppSettingsItem label="پشتیبان‌گیری از فیلدهای سفارشی">
        <button @click="backupCustomFieldsHandler" class="action-button glass-btn">
          <IconWrapper icon="fa-solid fa-download" /> دانلود فایل پشتیبان فیلدهای سفارشی
        </button>
      </AppSettingsItem>
      <AppSettingsItem label="پشتیبان‌گیری کامل (همه اطلاعات)">
        <button @click="backupAllDataHandler" class="action-button glass-btn primary-action">
          <IconWrapper icon="fa-solid fa-archive" /> دانلود فایل پشتیبان کامل
        </button>
      </AppSettingsItem>
    </div>

    <div class="restore-actions action-group">
      <h4>بازیابی اطلاعات</h4>
      <p class="warning-text">
        <IconWrapper icon="fa-solid fa-triangle-exclamation" /> توجه: بازیابی اطلاعات، اطلاعات فعلی
        را بازنویسی خواهد کرد. لطفاً قبل از اقدام، از اطلاعات فعلی خود پشتیبان تهیه کنید.
      </p>
      <AppSettingsItem label="بازیابی مخاطبین از فایل">
        <input
          type="file"
          @change="(e) => handleFileUpload(e, 'contacts')"
          accept=".json"
          class="file-input"
        />
        <button
          @click="restoreContactsHandler"
          :disabled="!uploadedFiles.contacts"
          class="action-button glass-btn"
        >
          <IconWrapper icon="fa-solid fa-upload" /> بازیابی مخاطبین
        </button>
      </AppSettingsItem>
      <AppSettingsItem label="بازیابی گروه‌ها از فایل">
        <input
          type="file"
          @change="(e) => handleFileUpload(e, 'groups')"
          accept=".json"
          class="file-input"
        />
        <button
          @click="restoreGroupsHandler"
          :disabled="!uploadedFiles.groups"
          class="action-button glass-btn"
        >
          <IconWrapper icon="fa-solid fa-upload" /> بازیابی گروه‌ها
        </button>
      </AppSettingsItem>
      <AppSettingsItem label="بازیابی فیلدهای سفارشی از فایل">
        <input
          type="file"
          @change="(e) => handleFileUpload(e, 'customFields')"
          accept=".json"
          class="file-input"
        />
        <button
          @click="restoreCustomFieldsHandler"
          :disabled="!uploadedFiles.customFields"
          class="action-button glass-btn"
        >
          <IconWrapper icon="fa-solid fa-upload" /> بازیابی فیلدهای سفارشی
        </button>
      </AppSettingsItem>
      <AppSettingsItem label="بازیابی کامل (همه اطلاعات) از فایل">
        <input
          type="file"
          @change="(e) => handleFileUpload(e, 'all')"
          accept=".json"
          class="file-input"
        />
        <button
          @click="restoreAllDataHandler"
          :disabled="!uploadedFiles.all"
          class="action-button glass-btn primary-action"
        >
          <IconWrapper icon="fa-solid fa-upload" /> بازیابی همه اطلاعات
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
import { useSettingsStore } from '@/store/settings'
import AppSettingsItem from './AppSettingsItem.vue'
import IconWrapper from '@/components/icons/IconWrapper.vue'

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
