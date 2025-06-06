<template>
  <li class="field-item">
    <div class="field-info">
      <strong>{{ field.label }}</strong> ({{ $t('customFields.fieldType') }}:
      {{ displayFieldType(field.type) }})
      <div v-if="field.type === 'select' && field.options && field.options.length">
        <em>{{ $t('customFields.optionsLabel') }}: {{ field.options.join(', ') }}</em>
      </div>
      <div v-if="field.order">
        <em>{{ $t('customFields.displayOrder') }}: {{ field.order }}</em>
      </div>
    </div>
    <div class="field-actions">
      <button @click="onEdit" class="edit-btn" :disabled="isLoading">
        {{ $t('customFields.editField') }}
      </button>
      <button @click="onDelete" class="delete-btn" :disabled="isLoading">
        {{ $t('contactList.deleteButton') }}
      </button>
    </div>
  </li>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  field: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit-field', 'delete-field'])

const displayFieldType = (type) => {
  const types = {
    text: t('customFields.typeText'),
    textarea: t('customFields.typeTextarea'),
    number: t('customFields.typeNumber'),
    date: t('customFields.typeDate'),
    boolean: t('customFields.typeBoolean'),
    select: t('customFields.typeSelect'),
  }
  return types[type] || type
}

const onEdit = () => {
  emit('edit-field', props.field)
}

const onDelete = () => {
  emit('delete-field', props.field.id)
}
</script>

<style scoped>
.field-item {
  background-color: var(--color-background-light);
  padding: 15px;
  border: 1px solid var(--color-border-light);
  border-radius: 4px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px var(--color-shadow-light);
}
.field-info strong {
  font-size: 1.1em;
  color: var(--color-text-primary);
}
.field-info em {
  font-size: 0.9em;
  color: var(--color-text-secondary);
  display: block;
  margin-top: 5px;
}
.field-actions button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
  color: var(--color-button-text);
}
.edit-btn {
  background-color: var(--color-warning-bg);
  color: var(--color-warning-text);
}
.delete-btn {
  background-color: var(--color-danger-bg);
  color: var(--color-danger-text);
}
</style>
