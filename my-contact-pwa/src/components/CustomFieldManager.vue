<template>
  <div class="custom-field-manager-container">
    <h2>{{ $t('customFieldManager.title') }}</h2>

    <!-- قسمت جستجو -->
    <div class="search-section">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="$t('customFieldManager.searchPlaceholder')"
        class="search-input"
      />
      <select v-model="filterType" class="filter-select">
        <option value="">{{ $t('customFieldManager.allTypes') }}</option>
        <option value="text">{{ $t('customFields.typeText') }}</option>
        <option value="number">{{ $t('customFields.typeNumber') }}</option>
        <option value="date">{{ $t('customFields.typeDate') }}</option>
        <option value="select">{{ $t('customFields.typeSelect') }}</option>
        <option value="boolean">{{ $t('customFields.typeBoolean') }}</option>
      </select>
    </div>

    <!-- قسمت اضافه کردن فیلد جدید -->
    <div class="field-add-section">
      <button @click="showAddFieldDialog = true" class="add-field-button">
        <i class="fas fa-plus"></i> {{ $t('customFields.addNewField') }}
      </button>
    </div>

    <!-- دیالوگ اضافه کردن فیلد -->
    <teleport to="body">
      <div v-if="showAddFieldDialog" class="dialog-overlay">
        <div class="dialog-box">
          <h3>{{ $t('customFieldManager.addNewFieldDialogTitle') }}</h3>
          <div class="form-group">
            <label for="fieldName">{{ $t('customFields.fieldLabel') }}:</label>
            <input
              type="text"
              id="fieldName"
              v-model="newFieldName"
              :placeholder="$t('customFieldManager.fieldNamePlaceholder')"
              required
            />
          </div>
          <div class="form-group">
            <label for="fieldType">{{ $t('customFields.fieldType') }}:</label>
            <select id="fieldType" v-model="newFieldType" required>
              <option value="text">{{ $t('customFields.typeText') }}</option>
              <option value="number">{{ $t('customFields.typeNumber') }}</option>
              <option value="date">{{ $t('customFields.typeDate') }}</option>
              <option value="select">{{ $t('customFields.typeSelect') }}</option>
              <option value="boolean">{{ $t('customFields.typeBoolean') }}</option>
            </select>
          </div>
          <div class="form-group" v-if="newFieldType === 'select'">
            <label for="fieldOptions">{{ $t('customFields.optionsLabel') }}:</label>
            <textarea
              id="fieldOptions"
              v-model="newFieldOptions"
              :placeholder="$t('customFieldManager.fieldOptionsPlaceholder')"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="fieldOrder">{{ $t('customFields.displayOrder') }}:</label>
            <input type="number" id="fieldOrder" v-model="newFieldOrder" min="0" required />
          </div>
          <div class="dialog-actions">
            <button @click="addNewField">{{ $t('customFields.addField') }}</button>
            <button @click="showAddFieldDialog = false">{{ $t('customFields.cancel') }}</button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- وضعیت بارگذاری و خطا -->
    <div v-if="customFieldStore.loading" class="loading-message">
      <i class="fas fa-spinner fa-spin"></i> {{ $t('customFieldManager.loading') }}
    </div>
    <div v-else-if="customFieldStore.error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ customFieldStore.error }}
    </div>

    <!-- فرم ویرایش فیلد -->
    <CustomFieldForm
      v-if="editingFieldInternal"
      :field-to-edit="editingFieldInternal"
      @save-field="handleSaveFieldDefinition"
      @cancel-edit="cancelEdit"
    />

    <hr />

    <!-- لیست فیلدها -->
    <h3>{{ $t('customFieldManager.listTitle') }}</h3>
    <div
      v-if="!customFieldStore.fieldDefinitions.length && !customFieldStore.loading"
      class="empty-state"
    >
      <i class="fas fa-list"></i>
      <p>{{ $t('customFieldManager.emptyStateMessage') }}</p>
      <button @click="showAddFieldDialog = true" class="add-first-field-button">
        {{ $t('customFieldManager.addFirstFieldButton') }}
      </button>
    </div>
    <ul v-else class="field-list">
      <CustomFieldListItem
        v-for="field in filteredFields"
        :key="field.id"
        :field="field"
        :is-loading="customFieldStore.loading"
        @edit-field="startEdit"
        @delete-field="confirmDeleteField"
      />
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCustomFieldStore } from '../store/customFields'
import CustomFieldForm from './customfields/CustomFieldForm.vue'
import CustomFieldListItem from './customfields/CustomFieldListItem.vue'

const customFieldStore = useCustomFieldStore()
const editingFieldInternal = ref(null)

// متغیرهای دیالوگ اضافه کردن فیلد
const showAddFieldDialog = ref(false)
const newFieldName = ref('')
const newFieldType = ref('text')
const newFieldOptions = ref('')
const newFieldOrder = ref(0)
const searchQuery = ref('')
const filterType = ref('')

// محاسبه فیلدهای فیلتر شده
const filteredFields = computed(() => {
  return customFieldStore.fieldDefinitions.filter((field) => {
    const matchesSearch = field.label.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesType = !filterType.value || field.type === filterType.value
    return matchesSearch && matchesType
  })
})

// تابع شروع ویرایش فیلد
const startEdit = (field) => {
  editingFieldInternal.value = { ...field }
  customFieldStore.error = null
}

// تابع انصراف از ویرایش
const cancelEdit = () => {
  editingFieldInternal.value = null
  customFieldStore.error = null
}

// تابع ذخیره تعریف فیلد
const handleSaveFieldDefinition = async (fieldData) => {
  try {
    if (fieldData.id) {
      await customFieldStore.updateFieldDefinition(fieldData.id, {
        label: fieldData.label,
        type: fieldData.type,
        options: fieldData.options,
        order: fieldData.order,
      })
    } else {
      await customFieldStore.addFieldDefinition({
        label: fieldData.label,
        type: fieldData.type,
        options: fieldData.options,
        order: fieldData.order,
      })
    }
    editingFieldInternal.value = null
  } catch (error) {
    customFieldStore.error = error.message || 'خطا در ذخیره فیلد'
  }
}

// تابع اضافه کردن فیلد جدید
const addNewField = async () => {
  const name = newFieldName.value.trim()
  if (!name) {
    customFieldStore.error = $t('customFields.validation.labelRequired')
    return
  }

  try {
    const options =
      newFieldType.value === 'select'
        ? newFieldOptions.value.split('\n').map((opt) => opt.trim())
        : undefined

    await customFieldStore.addFieldDefinition({
      label: name,
      type: newFieldType.value,
      options,
      order: parseInt(newFieldOrder.value) || 0,
    })

    showAddFieldDialog.value = false
    newFieldName.value = ''
    newFieldType.value = 'text'
    newFieldOptions.value = ''
    newFieldOrder.value = 0
  } catch (error) {
    customFieldStore.error = error.message || $t('customFieldManager.errorSavingField')
  }
}

// تابع تایید حذف فیلد
const confirmDeleteField = async (fieldId) => {
  const fieldToDelete = customFieldStore.fieldDefinitions.find((f) => f.id === fieldId)
  if (
    !fieldToDelete ||
    !confirm(
      `آیا از حذف فیلد سفارشی "${fieldToDelete.label}" مطمئن هستید؟ این عمل، این فیلد را از تمام مخاطبین نیز حذف خواهد کرد.`,
    )
  ) {
    return
  }

  try {
    await customFieldStore.deleteFieldDefinition(fieldId)
  } catch (error) {
    customFieldStore.error = error.message || 'خطا در حذف فیلد'
  }
}

// بارگذاری اولیه فیلدها
onMounted(async () => {
  try {
    await customFieldStore.loadFieldDefinitions()
  } catch (error) {
    customFieldStore.error = error.message || 'خطا در بارگذاری فیلدها'
  }
})

// پاک کردن ارور موقعی که کامپوننت از بین میره
// Removed duplicate import of onUnmounted
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
  color: var(--color-text-primary);
  margin-bottom: 15px;
}

.field-list {
  list-style: none;
  padding: 0;
}

/* Styles for loading and error messages are kept here as they are global to this manager component */
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
