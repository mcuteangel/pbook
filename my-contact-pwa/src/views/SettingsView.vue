<template>
  <div class="settings-container">
    <h2>تنظیمات</h2>
    <form>
      <div class="form-item">
        <label>تم برنامه</label>
        <input type="checkbox" v-model="isDarkMode" :checked="isDarkMode" />
        <span>{{ isDarkMode ? 'تاریک' : 'روشن' }}</span>
      </div>

      <section class="display-settings-section">
        <h3>تنظیمات نمایش لیست مخاطبین</h3>
        <p>ستون‌هایی را که می‌خواهید در لیست اصلی مخاطبین نمایش داده شوند، انتخاب کنید.</p>

        <div v-if="settingsStore.isLoading" class="loading-message">در حال بارگذاری تنظیمات...</div>

        <div class="checkbox-group">
          <div v-for="column in availableColumns" :key="column.value" class="checkbox-item">
            <input
              type="checkbox"
              :value="column.value"
              v-model="settingsStore.displayColumns"
              @change="handleColumnSelectionChange"
            />
            <label>{{ column.label }}</label>
          </div>
        </div>

        <button type="button" @click="settingsStore.resetToDefaults" class="reset-button">
          بازنشانی به پیش‌فرض
        </button>
      </section>

      <section class="backup-section">
        <h3>پشتیبان‌گیری (Export)</h3>
        <p>برای گرفتن خروجی از تمام مخاطبین، گروه‌ها و فیلدهای سفارشی، روی دکمه زیر کلیک کنید.</p>
        <button type="button" @click="handleExport">دریافت فایل پشتیبان (JSON)</button>
      </section>

      <section class="restore-section">
        <h3>بازیابی (Import)</h3>
        <p>برای بازیابی اطلاعات از فایل پشتیبان JSON، فایل مورد نظر را انتخاب کنید.</p>
        <input type="file" accept=".json" @change="handleImport" />
      </section>
    </form>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { exportData } from '@/utils/backupRestore'
import { importData } from '@/utils/backupRestore'

import { useContactStore } from '@/store/contacts'
import { useGroupStore } from '@/store/groups'
import { useCustomFieldStore } from '@/store/customFields'
import { useSettingsStore } from '@/store/settings'

const contactStore = useContactStore()
const groupStore = useGroupStore()
const customFieldStore = useCustomFieldStore()
const settingsStore = useSettingsStore()

const isDarkMode = computed({
  get: () => settingsStore.theme === 'dark',
  set: () => settingsStore.toggleTheme(),
})

const { fieldDefinitions } = storeToRefs(customFieldStore)

const standardColumns = [
  { label: 'نام', value: 'name' },
  { label: 'نام خانوادگی', value: 'lastName' },
  { label: 'تلفن ', value: 'phone' },
  { label: 'جنسیت', value: 'gender' },
  { label: 'گروه', value: 'group' },
  { label: 'تاریخ تولد', value: 'birthDate' },
  { label: 'سمت / تخصص', value: 'title' },
  { label: 'تاریخ ایجاد', value: 'createdAt' },
  { label: 'آخرین ویرایش', value: 'updatedAt' },
  { label: 'شهر (آدرس)', value: 'address.city' },
  { label: 'خیابان (آدرس)', value: 'address.street' },
  { label: 'یادداشت', value: 'notes' },
]

const availableColumns = computed(() => {
  const columns = [...standardColumns]
  fieldDefinitions.value.forEach((field) => {
    columns.push({ label: `فیلد سفارشی: ${field.label}`, value: `customFieldDef_${field.id}` })
  })
  return columns
})

const handleColumnSelectionChange = (selectedValues) => {
  console.log('Selected columns changed:', selectedValues)
  settingsStore.setDisplayColumns(selectedValues)
}

const handleExport = async () => {
  try {
    const jsonData = await exportData()
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    link.download = `contacts_backup_${timestamp}.json`
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      URL.revokeObjectURL(url)
      link.remove()
    }, 100)
    console.log('Export file download initiated.')
  } catch (error) {
    console.error('Error during export:', error)
    alert('خطا در تهیه فایل پشتیبان: ' + error.message)
  }
}

const handleImport = async (event) => {
  console.log('فایلی برای بازیابی انتخاب شد.')
  const file = event.target.files[0]

  if (!file) {
    console.log('فایلی انتخاب نشد.')
    return
  }

  console.log('فایل انتخاب شده:', file.name, file.type, file.size, 'بایت')

  if (file.type !== 'application/json') {
    alert('لطفاً یک فایل با فرمت JSON انتخاب کنید.')
    event.target.value = null
    return
  }

  const reader = new FileReader()

  reader.onload = async (e) => {
    const fileContent = e.target.result
    console.log('محتوای فایل با موفقیت خوانده شد. در حال پارس کردن JSON...')
    let importedData = null
    try {
      importedData = JSON.parse(fileContent)
      console.log('JSON با موفقیت پارس شد.')

      if (
        !importedData ||
        typeof importedData !== 'object' ||
        importedData.version !== 1 ||
        !importedData.data ||
        typeof importedData.data !== 'object' ||
        !Array.isArray(importedData.data.contacts) ||
        !Array.isArray(importedData.data.customFieldDefinitions) ||
        !Array.isArray(importedData.data.groups)
      ) {
        throw new Error('ساختار فایل پشتیبان نامعتبر است یا ورژن آن پشتیبانی نمی‌شود.')
      }

      console.log('ساختار فایل پشتیبان معتبر است. در حال وارد کردن داده‌ها به دیتابیس...')
      await importData(importedData.data)
      console.log('بازیابی اطلاعات دیتابیس با موفقیت انجام شد.')

      console.log('Reloading Pinia stores...')
      await contactStore.loadContacts()
      await groupStore.loadGroups()
      await customFieldStore.loadFieldDefinitions()
      console.log('Stores reloaded. UI should update.')

      alert('بازیابی اطلاعات با موفقیت انجام شد!')
    } catch (error) {
      console.error('خطا در پردازش یا اعتبارسنجی فایل پشتیبان:', error)
      alert('خطا در پردازش یا اعتبارسنجی فایل پشتیبان: ' + error.message)
    } finally {
      event.target.value = null
    }
  }

  reader.onerror = (error) => {
    console.error('خطا در خواندن فایل:', error)
    alert('خطا در خواندن فایل پشتیبان.')
    event.target.value = null
  }

  reader.readAsText(file)
}
</script>

<style scoped>
.settings-container {
  padding: 20px;
  max-width: 600px;
  margin: 20px auto;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.settings-container h2,
.settings-container h3 {
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.display-settings-section {
  margin-bottom: 30px;
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 8px;
  background-color: #fff;
}

.display-settings-section h3 {
  margin-top: 0;
  padding-bottom: 5px;
  border-bottom: 1px dashed #ddd;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.checkbox-item {
  margin-right: 0 !important;
  flex-basis: calc(50% - 5px);
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.checkbox-item label {
  flex-grow: 1;
  padding-left: 5px;
}

.loading-message {
  color: #007bff;
  font-style: italic;
  margin-bottom: 15px;
}

.reset-button {
  margin-top: 10px;
}

.backup-section,
.restore-section {
  margin-bottom: 30px;
}

.settings-container button {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.settings-container button:hover {
  background-color: #0056b3;
}

.settings-container input[type='file'] {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  cursor: pointer;
  display: block;
  width: 100%;
  box-sizing: border-box;
}
</style>
