<template>
  <form @submit.prevent="onSave" class="field-form">
    <h3>{{ isEditing ? $t('customFields.editField') : $t('customFields.addNewField') }}</h3>
    <div v-if="customFieldStore.error" class="error-message" style="color: red">
      {{ customFieldStore.error }}
    </div>
    <div>
      <label for="fieldLabel">{{ $t('customFields.fieldLabel') }}</label>
      <input type="text" id="fieldLabel" v-model="localField.label" required />
    </div>
    <div>
      <label for="fieldType">{{ $t('customFields.fieldType') }}</label>
      <select id="fieldType" v-model="localField.type" required @change="handleTypeChange" :disabled="isEditing">
        <option value="text">{{ $t('customFields.typeText') }}</option>
        <option value="textarea">{{ $t('customFields.typeTextarea') }}</option>
        <option value="number">{{ $t('customFields.typeNumber') }}</option>
        <option value="date">{{ $t('customFields.typeDate') }}</option>
        <option value="boolean">{{ $t('customFields.typeBoolean') }}</option>
        <option value="select">{{ $t('customFields.typeSelect') }}</option>
      </select>
      <div v-if="isEditing" class="info-message" style="font-size: 0.9em; color: var(--color-text-secondary); margin-top: 5px;">
        {{ $t('customFields.warningTypeNotEditable') }}
      </div>
    </div>

    <div v-if="localField.type === 'select'" class="options-section">
      <label>{{ $t('customFields.optionsLabel') }}</label>
      <div v-for="(option, index) in localField.options" :key="index" class="option-input-group">
        <div class="option-inputs">
          <input
            type="text"
            v-model="localField.options[index].value"
            :placeholder="$t('customFields.optionValuePlaceholder')" 
            class="option-value-input"
          />
          <input
            type="text"
            v-model="localField.options[index].label"
            :placeholder="$t('customFields.optionLabelPlaceholder')" 
            class="option-label-input"
          />
        </div>
        <button type="button" @click="removeOption(index)" class="remove-option-btn">X</button>
      </div>
      <button type="button" @click="addOption" class="add-option-btn">
        {{ $t('customFields.addOption') }}
      </button>
    </div>
    <div>
      <label for="fieldOrder">{{ $t('customFields.displayOrder') }}</label>
      <input type="number" id="fieldOrder" v-model.number="localField.order" />
    </div>

    <div class="form-actions">
      <button type="submit" :disabled="customFieldStore.loading">
        {{ isEditing ? $t('customFields.saveChanges') : $t('customFields.addField') }}
      </button>
      <button type="button" v-if="isEditing" @click="onCancel" :disabled="customFieldStore.loading">
        {{ $t('customFields.cancel') }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCustomFieldStore } from '../../store/customFields'

const props = defineProps({
  fieldToEdit: Object, // {{ $t('customFields.fieldToEditComment') }}
})

const emit = defineEmits(['save-field', 'cancel-edit'])

const customFieldStore = useCustomFieldStore();
const { t } = useI18n();

const defaultFieldState = () => ({
  id: null,
  label: '',
  type: 'text',
  options: [], // Array of { value: '', label: '' }
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
      localField.label = newField.label;
      localField.type = newField.type;
      if (newField.options && newField.options.length > 0) {
        if (typeof newField.options[0] === 'string') {
          // Migrate old string array to new {value, label} structure
          localField.options = newField.options.map(optStr => ({ value: optStr, label: optStr }));
        } else {
          // Already new structure, ensure deep copy
          localField.options = JSON.parse(JSON.stringify(newField.options));
        }
      } else {
        localField.options = [];
      }
      localField.order = newField.order || 0;
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
  localField.options.push({ value: '', label: '' });
};

const removeOption = (index) => {
  localField.options.splice(index, 1)
}

const onSave = () => {
  if (!localField.label || !localField.label.trim()) {
    customFieldStore.error = t('customFields.validation.labelRequired');
    return;
  }

  if (localField.type === 'select') {
    // Filter out options where value is empty or only whitespace
    let validOptions = localField.options.filter(opt => opt.value && opt.value.trim() !== '');

    // Ensure labels are set, defaulting to value if label is empty or only whitespace
    validOptions.forEach(opt => {
      if (!opt.label || opt.label.trim() === '') {
        opt.label = opt.value;
      }
    });

    // Check for duplicate values
    const valueSet = new Set();
    for (const opt of validOptions) {
      if (valueSet.has(opt.value)) {
        customFieldStore.error = t('customFields.validation.duplicateOptionValues');
        return;
      }
      valueSet.add(opt.value);
    }

    if (validOptions.length === 0) {
      customFieldStore.error = t('customFields.validation.selectValidOptionRequired');
      return;
    }
    localField.options = validOptions; // Assign the processed valid options back
  }

  // Clear error if all validations pass for select or other types
  customFieldStore.error = null;
  emit('save-field', { ...localField });
};

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
    localField.label = props.fieldToEdit.label;
    localField.type = props.fieldToEdit.type;
    if (props.fieldToEdit.options && props.fieldToEdit.options.length > 0) {
      if (typeof props.fieldToEdit.options[0] === 'string') {
        localField.options = props.fieldToEdit.options.map(optStr => ({ value: optStr, label: optStr }));
      } else {
        localField.options = JSON.parse(JSON.stringify(props.fieldToEdit.options));
      }
    } else {
      localField.options = [];
    }
    localField.order = props.fieldToEdit.order || 0;
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
  background-color: var(--color-danger);
  color: white;
}
.add-option-btn {
  background-color: var(--color-primary);
  color: white;
}
.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.form-actions button {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-weight: bold;
}
.form-actions button[type='submit'] {
  background-color: var(--color-success);
  color: white;
}
.form-actions button[type='button'] {
  background-color: var(--color-secondary);
  color: white;
}
.form-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.error-message {
  margin-bottom: 15px;
  padding: 10px;
  background-color: var(--color-danger-light);
  border: 1px solid var(--color-danger);
  border-radius: 4px;
  color: var(--color-danger-dark);
}
</style>
