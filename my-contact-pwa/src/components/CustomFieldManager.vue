<template>
  <div class="custom-field-manager-container">
    <h2>مدیریت فیلدهای سفارشی</h2>

    <div v-if="customFieldStore.loading" class="loading-message">در حال پردازش...</div>
    <div v-if="customFieldStore.error" class="error-message" style="color: red">
      {{ customFieldStore.error }}
    </div>

    <form @submit.prevent="handleSaveFieldDefinition" class="field-form">
      <h3>{{ editingField ? 'ویرایش فیلد' : 'افزودن فیلد جدید' }}</h3>
      <div>
        <label for="fieldLabel">برچسب فیلد:</label>
        <input type="text" id="fieldLabel" v-model="currentField.label" required />
      </div>
      <div>
        <label for="fieldType">نوع فیلد:</label>
        <select id="fieldType" v-model="currentField.type" required @change="handleTypeChange">
          <option value="text">متن (کوتاه)</option>
          <option value="textarea">متن (بلند)</option>
          <option value="number">عدد</option>
          <option value="date">تاریخ</option>
          <option value="boolean">چک‌باکس (بله/خیر)</option>
          <option value="select">لیست گزینه‌ای</option>
        </select>
      </div>

      <div v-if="currentField.type === 'select'" class="options-section">
        <label>گزینه‌ها (برای لیست کشویی):</label>
        <div v-for="(option, index) in currentField.options" :key="index" class="option-input">
          <input type="text" v-model="currentField.options[index]" placeholder="مقدار گزینه" />
          <button type="button" @click="removeOption(index)" class="remove-option-btn">X</button>
        </div>
        <button type="button" @click="addOption" class="add-option-btn">+ افزودن گزینه</button>
      </div>
      <div>
        <label for="fieldOrder">ترتیب نمایش (اختیاری):</label>
        <input type="number" id="fieldOrder" v-model.number="currentField.order" />
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="customFieldStore.loading">
          {{ editingField ? 'ذخیره تغییرات' : 'افزودن فیلد' }}
        </button>
        <button
          type="button"
          v-if="editingField"
          @click="cancelEdit"
          :disabled="customFieldStore.loading"
        >
          انصراف
        </button>
      </div>
    </form>

    <hr />

    <h3>لیست فیلدهای تعریف شده</h3>
    <div v-if="!customFieldStore.fieldDefinitions.length && !customFieldStore.loading">
      هیچ فیلد سفارشی تعریف نشده است.
    </div>
    <ul v-else class="field-list">
      <li
        v-for="field in customFieldStore.sortedFieldDefinitions"
        :key="field.id"
        class="field-item"
      >
        <div class="field-info">
          <strong>{{ field.label }}</strong> (نوع: {{ displayFieldType(field.type) }})
          <div v-if="field.type === 'select' && field.options && field.options.length">
            <em>گزینه‌ها: {{ field.options.join(', ') }}</em>
          </div>
          <div v-if="field.order">
            <em>ترتیب: {{ field.order }}</em>
          </div>
        </div>
        <div class="field-actions">
          <button @click="startEdit(field)" class="edit-btn" :disabled="customFieldStore.loading">
            ویرایش
          </button>
          <button
            @click="confirmDeleteField(field.id)"
            class="delete-btn"
            :disabled="customFieldStore.loading"
          >
            حذف
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useCustomFieldStore } from '../store/customFields'
// اگر قرار است بعد از حذف فیلد، لیست مخاطبین رفرش شود:
// import { useContactStore } from '../store/contacts';

const customFieldStore = useCustomFieldStore()
// const contactStore = useContactStore(); // در صورت نیاز

const defaultFieldState = () => ({
  id: null,
  label: '',
  type: 'text', // نوع پیش‌فرض
  options: [],
  order: 0,
})

const currentField = reactive(defaultFieldState())
const editingField = ref(null) // آبجکت فیلدی که در حال ویرایش است

onMounted(async () => {
  await customFieldStore.loadFieldDefinitions()
})

const displayFieldType = (type) => {
  const types = {
    text: 'متن کوتاه',
    textarea: 'متن بلند',
    number: 'عدد',
    date: 'تاریخ',
    boolean: 'بله/خیر',
    select: 'لیست گزینه‌ای',
  }
  return types[type] || type
}

const handleTypeChange = () => {
  // اگر نوع فیلد دیگر 'select' نیست، گزینه‌ها را پاک کن
  if (currentField.type !== 'select') {
    currentField.options = []
  } else if (currentField.options.length === 0) {
    // اگر select شد و گزینه‌ای نداشت، یکی خالی اضافه کن
    addOption()
  }
}

const addOption = () => {
  currentField.options.push('')
}

const removeOption = (index) => {
  currentField.options.splice(index, 1)
}

const resetForm = () => {
  Object.assign(currentField, defaultFieldState())
  editingField.value = null
  customFieldStore.error = null // پاک کردن خطای قبلی
}

const startEdit = (field) => {
  editingField.value = field
  currentField.id = field.id
  currentField.label = field.label
  currentField.type = field.type
  currentField.options = field.options ? [...field.options] : []
  currentField.order = field.order || 0
  customFieldStore.error = null
}

const cancelEdit = () => {
  resetForm()
}

const handleSaveFieldDefinition = async () => {
  if (!currentField.label.trim()) {
    customFieldStore.error = 'برچسب فیلد نمی‌تواند خالی باشد.'
    return
  }
  if (currentField.type === 'select' && currentField.options.every((opt) => !opt.trim())) {
    customFieldStore.error = 'حداقل یک گزینه برای لیست گزینه‌ای باید مقدار داشته باشد.'
    return
  }
  // پاک کردن گزینه‌های خالی از آرایه options
  if (currentField.type === 'select') {
    currentField.options = currentField.options.filter((opt) => opt.trim() !== '')
    if (currentField.options.length === 0) {
      customFieldStore.error = 'برای فیلد از نوع گزینه‌ای، حداقل یک گزینه معتبر باید تعریف شود.'
      return
    }
  }

  let success = false
  if (editingField.value) {
    // ویرایش
    success = await customFieldStore.updateFieldDefinition(editingField.value.id, {
      label: currentField.label,
      type: currentField.type,
      options: currentField.options,
      order: currentField.order,
    })
  } else {
    // افزودن
    const newFieldId = await customFieldStore.addFieldDefinition({
      label: currentField.label,
      type: currentField.type,
      options: currentField.options,
      order: currentField.order,
    })
    success = !!newFieldId
  }

  if (success && !customFieldStore.error) {
    resetForm()
    // نیازی به لود مجدد نیست چون خود اکشن‌ها این کار رو انجام میدن
  }
}

const confirmDeleteField = async (fieldId) => {
  const fieldToDelete = customFieldStore.fieldDefinitions.find((f) => f.id === fieldId)
  if (
    fieldToDelete &&
    confirm(
      `آیا از حذف فیلد سفارشی "${fieldToDelete.label}" مطمئن هستید؟ این عمل، این فیلد را از تمام مخاطبین نیز حذف خواهد کرد.`,
    )
  ) {
    const success = await customFieldStore.deleteFieldDefinition(fieldId)
    if (success) {
      alert('فیلد سفارشی با موفقیت حذف شد.')
      // اگر نیاز به رفرش لیست مخاطبین دارید، اینجا contactStore.loadContacts() را صدا بزنید
      // await contactStore.loadContacts();
    }
  }
}

// پاک کردن ارور موقعی که کامپوننت از بین میره
import { onUnmounted } from 'vue'
onUnmounted(() => {
  customFieldStore.error = null
})
</script>

<style scoped>
.custom-field-manager-container {
  max-width: 700px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid var(--color-border-medium); /* تغییر کرد */
  border-radius: 8px;
  background-color: var(--color-background-darker-light); /* تغییر کرد */
  box-shadow: 0 4px 12px var(--color-shadow); /* اضافه شد */
}
.custom-field-manager-container h2,
.custom-field-manager-container h3 {
  text-align: center;
  color: var(--color-text-primary); /* تغییر کرد */
  margin-bottom: 15px;
}
.field-form {
  background-color: var(--color-background-light); /* تغییر کرد */
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid var(--color-border-light); /* تغییر کرد */
  box-shadow: 0 2px 6px var(--color-shadow-light); /* اضافه شد */
}
.field-form div {
  margin-bottom: 15px;
}
.field-form label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: var(--color-text-secondary); /* اضافه شد */
}
.field-form input[type='text'],
.field-form input[type='number'],
.field-form select {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--color-border-medium); /* تغییر کرد */
  border-radius: 4px;
  box-sizing: border-box;
  background-color: var(--color-background-light); /* اضافه شد */
  color: var(--color-text-primary); /* اضافه شد */
}
.options-section {
  border: 1px dashed var(--color-border-medium); /* تغییر کرد */
  padding: 15px;
  border-radius: 4px;
  margin-top: 10px;
  background-color: var(--color-background-darker-light); /* اضافه شد */
}
.option-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.option-input input {
  flex-grow: 1;
  background-color: var(--color-background-light); /* اضافه شد */
  color: var(--color-text-primary); /* اضافه شد */
  border: 1px solid var(--color-border-medium); /* اضافه شد */
}
.remove-option-btn,
.add-option-btn {
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  border: none; /* تغییر کرد */
}
.remove-option-btn {
  background-color: var(--color-danger-bg); /* تغییر کرد */
  color: var(--color-danger-text); /* تغییر کرد */
}
.add-option-btn {
  background-color: var(--color-success-bg); /* تغییر کرد */
  color: var(--color-success-text); /* تغییر کرد */
  display: block;
  margin-top: 5px;
}

.form-actions button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  background-color: var(--color-link-primary); /* تغییر کرد */
  color: var(--color-link-text); /* تغییر کرد */
}
.form-actions button:disabled {
  background-color: var(--color-button-disabled-bg); /* تغییر کرد */
  color: var(--color-button-disabled-text); /* اضافه شد */
}
.form-actions button[type='button'] {
  background-color: var(--color-text-tertiary); /* تغییر کرد */
}

.field-list {
  list-style: none;
  padding: 0;
}
.field-item {
  background-color: var(--color-background-light); /* تغییر کرد */
  padding: 15px;
  border: 1px solid var(--color-border-light); /* تغییر کرد */
  border-radius: 4px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px var(--color-shadow-light); /* اضافه شد */
}
.field-info strong {
  font-size: 1.1em;
  color: var(--color-text-primary); /* اضافه شد */
}
.field-info em {
  font-size: 0.9em;
  color: var(--color-text-secondary); /* تغییر کرد */
  display: block;
  margin-top: 5px;
}
.field-actions button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
  color: var(--color-button-text); /* تغییر کرد */
}
.edit-btn {
  background-color: var(--color-warning-bg); /* تغییر کرد */
  color: var(--color-warning-text); /* تغییر کرد */
}
.delete-btn {
  background-color: var(--color-danger-bg); /* تغییر کرد */
  color: var(--color-danger-text); /* تغییر کرد */
}
.loading-message,
.error-message {
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
  text-align: center;
}
.loading-message {
  background-color: var(--color-primary-light-bg); /* تغییر کرد */
  color: var(--color-primary-light-text); /* تغییر کرد */
}
.error-message {
  background-color: var(--color-danger-light-bg); /* تغییر کرد */
  color: var(--color-danger-light-text); /* تغییر کرد */
}
</style>
