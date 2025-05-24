<template>
  <form @submit.prevent="onSave" class="field-form">
    <h3>{{ isEditing ? 'ویرایش فیلد' : 'افزودن فیلد جدید' }}</h3>
    <div v-if="customFieldStore.error" class="error-message" style="color: red">
      {{ customFieldStore.error }}
    </div>
    <div>
      <label for="fieldLabel">برچسب فیلد:</label>
      <input type="text" id="fieldLabel" v-model="localField.label" required />
    </div>
    <div>
      <label for="fieldType">نوع فیلد:</label>
      <select id="fieldType" v-model="localField.type" required @change="handleTypeChange">
        <option value="text">متن (کوتاه)</option>
        <option value="textarea">متن (بلند)</option>
        <option value="number">عدد</option>
        <option value="date">تاریخ</option>
        <option value="boolean">چک‌باکس (بله/خیر)</option>
        <option value="select">لیست گزینه‌ای</option>
      </select>
    </div>

    <div v-if="localField.type === 'select'" class="options-section">
      <label>گزینه‌ها (برای لیست کشویی):</label>
      <div v-for="(option, index) in localField.options" :key="index" class="option-input">
        <input type="text" v-model="localField.options[index]" placeholder="مقدار گزینه" />
        <button type="button" @click="removeOption(index)" class="remove-option-btn">X</button>
      </div>
      <button type="button" @click="addOption" class="add-option-btn">+ افزودن گزینه</button>
    </div>
    <div>
      <label for="fieldOrder">ترتیب نمایش (اختیاری):</label>
      <input type="number" id="fieldOrder" v-model.number="localField.order" />
    </div>

    <div class="form-actions">
      <button type="submit" :disabled="customFieldStore.loading">
        {{ isEditing ? 'ذخیره تغییرات' : 'افزودن فیلد' }}
      </button>
      <button type="button" v-if="isEditing" @click="onCancel" :disabled="customFieldStore.loading">
        انصراف
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useCustomFieldStore } from '../../store/customFields'

const props = defineProps({
  fieldToEdit: Object, // فیلدی که برای ویرایش پاس داده می‌شود
})

const emit = defineEmits(['save-field', 'cancel-edit'])

const customFieldStore = useCustomFieldStore()

const defaultFieldState = () => ({
  id: null,
  label: '',
  type: 'text',
  options: [],
  order: 0,
})

const localField = reactive(defaultFieldState())
const isEditing = ref(false)

watch(
  () => props.fieldToEdit,
  (newField) => {
    if (newField && newField.id) {
      isEditing.value = true
      localField.id = newField.id
      localField.label = newField.label
      localField.type = newField.type
      localField.options = newField.options ? [...newField.options] : []
      localField.order = newField.order || 0
    } else {
      isEditing.value = false
      Object.assign(localField, defaultFieldState())
    }
    customFieldStore.error = null // Clear previous errors when form state changes
  },
  { immediate: true, deep: true },
)

const handleTypeChange = () => {
  if (localField.type !== 'select') {
    localField.options = []
  } else if (localField.options.length === 0) {
    addOption()
  }
}

const addOption = () => {
  localField.options.push('')
}

const removeOption = (index) => {
  localField.options.splice(index, 1)
}

const onSave = () => {
  if (!localField.label.trim()) {
    customFieldStore.error = 'برچسب فیلد نمی‌تواند خالی باشد.'
    return
  }
  if (localField.type === 'select' && localField.options.every((opt) => !opt.trim())) {
    customFieldStore.error = 'حداقل یک گزینه برای لیست گزینه‌ای باید مقدار داشته باشد.'
    return
  }
  if (localField.type === 'select') {
    localField.options = localField.options.filter((opt) => opt.trim() !== '')
    if (localField.options.length === 0) {
      customFieldStore.error = 'برای فیلد از نوع گزینه‌ای، حداقل یک گزینه معتبر باید تعریف شود.'
      return
    }
  }
  emit('save-field', { ...localField })
}

const onCancel = () => {
  emit('cancel-edit')
  isEditing.value = false
  Object.assign(localField, defaultFieldState())
  customFieldStore.error = null
}

// Initialize form if fieldToEdit is provided on mount
onMounted(() => {
  if (props.fieldToEdit && props.fieldToEdit.id) {
    isEditing.value = true
    localField.id = props.fieldToEdit.id
    localField.label = props.fieldToEdit.label
    localField.type = props.fieldToEdit.type
    localField.options = props.fieldToEdit.options ? [...props.fieldToEdit.options] : []
    localField.order = props.fieldToEdit.order || 0
  } else {
    isEditing.value = false
    Object.assign(localField, defaultFieldState())
  }
})
</script>

<style scoped>
.field-form {
  background-color: var(--color-background-light);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid var(--color-border-light);
  box-shadow: 0 2px 6px var(--color-shadow-light);
}
.field-form div {
  margin-bottom: 15px;
}
.field-form label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: var(--color-text-secondary);
}
.field-form input[type='text'],
.field-form input[type='number'],
.field-form select {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--color-border-medium);
  border-radius: 4px;
  box-sizing: border-box;
  background-color: var(--color-background-input);
  color: var(--color-text-input);
}
.options-section {
  border: 1px dashed var(--color-border-medium);
  padding: 15px;
  border-radius: 4px;
  margin-top: 10px;
  background-color: var(--color-background-darker-light);
}
.option-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.option-input input {
  flex-grow: 1;
  background-color: var(--color-background-input);
  color: var(--color-text-input);
  border: 1px solid var(--color-border-medium);
}
.remove-option-btn,
.add-option-btn {
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
}
.remove-option-btn {
  background-color: var(--color-danger-bg);
  color: var(--color-danger-text);
}
.add-option-btn {
  background-color: var(--color-success-bg);
  color: var(--color-success-text);
  display: block;
  margin-top: 5px;
}

.form-actions button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  background-color: var(--color-link-primary);
  color: var(--color-link-text);
}
.form-actions button:disabled {
  background-color: var(--color-button-disabled-bg);
  color: var(--color-button-disabled-text);
}
.form-actions button[type='button'] {
  background-color: var(--color-text-tertiary);
}
.error-message {
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
  text-align: center;
  background-color: var(--color-danger-light-bg);
  color: var(--color-danger-light-text);
}
</style>
