<template>
  <div class="custom-field-manager-container">
    <h2>مدیریت فیلدهای سفارشی</h2>

    <div v-if="customFieldStore.loading" class="loading-message">در حال پردازش...</div>
    <!-- Global error message for operations like delete, shown when not editing -->
    <div
      v-if="customFieldStore.error && !editingFieldInternal"
      class="error-message"
      style="color: red"
    >
      {{ customFieldStore.error }}
    </div>

    <CustomFieldForm
      :field-to-edit="editingFieldInternal"
      @save-field="handleSaveFieldDefinition"
      @cancel-edit="cancelEdit"
    />

    <hr />

    <h3>لیست فیلدهای تعریف شده</h3>
    <div v-if="!customFieldStore.fieldDefinitions.length && !customFieldStore.loading">
      هیچ فیلد سفارشی تعریف نشده است.
    </div>
    <ul v-else class="field-list">
      <CustomFieldListItem
        v-for="field in customFieldStore.sortedFieldDefinitions"
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
const editingFieldInternal = ref(null) // Renamed to avoid conflict if CustomFieldForm used 'editingField'

onMounted(async () => {
  await customFieldStore.loadFieldDefinitions()
})

const startEdit = (field) => {
  // Ensure we are passing a fresh copy for editing to avoid direct mutation issues if any
  editingFieldInternal.value = { ...field }
  customFieldStore.error = null // Clear global error when starting an edit
}

const cancelEdit = () => {
  editingFieldInternal.value = null
  customFieldStore.error = null // Clear global error on cancel
}

const handleSaveFieldDefinition = async (fieldData) => {
  let success = false
  if (fieldData.id) {
    // ویرایش
    success = await customFieldStore.updateFieldDefinition(fieldData.id, {
      label: fieldData.label,
      type: fieldData.type,
      options: fieldData.options,
      order: fieldData.order,
    })
  } else {
    // افزودن
    const newFieldId = await customFieldStore.addFieldDefinition({
      label: fieldData.label,
      type: fieldData.type,
      options: fieldData.options,
      order: fieldData.order,
    })
    success = !!newFieldId
  }

  if (success && !customFieldStore.error) {
    editingFieldInternal.value = null // Reset form after successful save
    // Data is reloaded by store actions, no need to call loadFieldDefinitions here
  }
  // If not successful, the error is expected to be set in the store by the action
  // and will be displayed by CustomFieldForm or the global error display.
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
