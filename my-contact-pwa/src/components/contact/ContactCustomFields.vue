<template>
  <div v-if="sortedCustomFieldDefinitions.length > 0" class="custom-fields-wrapper">
    <h3>
      <!-- آیکون تنظیمات فیلدهای سفارشی -->
      <span class="icon-wrapper">
        <IconWrapper 
          icon="cogs" 
          prefix="fa-solid" 
          class="custom-fields-icon" 
        />
      </span>
      {{ $t('contactForm.customFields') }}
    </h3>
    <div
      v-for="fieldDef in sortedCustomFieldDefinitions"
      :key="fieldDef.id"
      class="form-group custom-field-group"
    >
      <label :for="'custom-field-' + fieldDef.id">
        <span v-if="fieldDef.type === 'date'">
          <!-- آیکون تاریخ -->
          <IconWrapper 
            icon="calendar" 
            prefix="fa-solid" 
            class="field-icon date-icon" 
          />
        </span>
        <span v-else-if="fieldDef.type === 'text'">
          <!-- آیکون متن ساده -->
          <IconWrapper 
            icon="font" 
            prefix="fa-solid" 
            class="field-icon text-icon" 
          />
        </span>
        <span v-else-if="fieldDef.type === 'number'">
          <!-- آیکون عدد -->
          <IconWrapper 
            icon="hashtag" 
            prefix="fa-solid" 
            class="field-icon number-icon" 
          />
        </span>
        <span v-else-if="fieldDef.type === 'textarea'">
          <!-- آیکون پاراگراف -->
          <IconWrapper 
            icon="paragraph" 
            prefix="fa-solid" 
            class="field-icon textarea-icon" 
          />
        </span>
        <span v-else-if="fieldDef.type === 'checkbox'">
          <!-- آیکون چک باکس -->
          <IconWrapper 
            icon="square-check" 
            prefix="fa-solid" 
            class="field-icon checkbox-icon" 
          />
        </span>
        <span v-else-if="fieldDef.type === 'select'">
          <!-- آیکون لیست کشویی -->
          <IconWrapper 
            icon="list" 
            prefix="fa-solid" 
            class="field-icon select-icon" 
          />
        </span>
        <span v-else-if="fieldDef.type === 'radio'">
          <!-- آیکون دکمه رادیویی -->
          <IconWrapper 
            icon="circle-dot" 
            prefix="fa-solid" 
            class="field-icon radio-icon" 
          />
        </span>
        <span v-else-if="fieldDef.type === 'url'">
          <!-- آیکون لینک -->
          <IconWrapper 
            icon="link" 
            prefix="fa-solid" 
            class="field-icon url-icon" 
          />
        </span>
        <span v-else-if="fieldDef.type === 'email'">
          <!-- آیکون ایمیل -->
          <IconWrapper 
            icon="envelope" 
            prefix="fa-solid" 
            class="field-icon email-icon" 
          />
        </span>
        <span v-else-if="fieldDef.type === 'phone'">
          <!-- آیکون تلفن -->
          <IconWrapper 
            icon="phone" 
            prefix="fa-solid" 
            class="field-icon phone-icon" 
          />
        </span>
        <span v-else-if="fieldDef.type === 'color'">
          <!-- آیکون رنگ‌آمیزی -->
          <IconWrapper 
            icon="palette" 
            prefix="fa-solid" 
            class="field-icon color-icon" 
          />
        </span>
        <span v-else-if="fieldDef.type === 'file'">
          <!-- آیکون فایل -->
          <IconWrapper 
            icon="file" 
            prefix="fa-solid" 
            class="field-icon file-icon" 
          />
        </span>
        <span v-else-if="fieldDef.type === 'range'">
          <!-- آیکون اسلایدر -->
          <IconWrapper 
            icon="sliders" 
            prefix="fa-solid" 
            class="field-icon range-icon" 
          />
        </span>
        <span v-else-if="fieldDef.type === 'time'">
          <!-- آیکون زمان -->
          <IconWrapper 
            icon="clock" 
            prefix="fa-solid" 
            class="field-icon time-icon" 
          />
        </span>
        <span v-else-if="fieldDef.type === 'datetime-local'">
          <!-- آیکون تاریخ و زمان -->
          <IconWrapper 
            icon="calendar-clock" 
            prefix="fa-solid" 
            class="field-icon datetime-icon" 
          />
        </span>
        <span v-else>
          <!-- آیکون پیش‌فرض برای انواع ناشناخته -->
          <IconWrapper 
            icon="circle-question" 
            prefix="fa-solid" 
            class="field-icon unknown-icon" 
          />
        </span>
        {{ fieldDef.name }}:
        <span v-if="fieldDef.required" class="required-star" :title="$t('contactForm.requiredField')">*</span>
      </label>

      <!-- Input types -->
      <input
        v-if="['text', 'number', 'url', 'email', 'phone', 'color', 'range', 'time', 'datetime-local'].includes(fieldDef.type)"
        :id="'custom-field-' + fieldDef.id"
        :type="fieldDef.type"
        :value="customFields[fieldDef.id]"
        @input="$emit('update:customFields', { ...customFields, [fieldDef.id]: $event.target.value })"
        :required="fieldDef.required"
        :placeholder="fieldDef.placeholder || ''"
        class="flat-input"
      />

      <!-- Textarea -->
      <textarea
        v-else-if="fieldDef.type === 'textarea'"
        :id="'custom-field-' + fieldDef.id"
        :value="customFields[fieldDef.id]"
        @input="$emit('update:customFields', { ...customFields, [fieldDef.id]: $event.target.value })"
        :required="fieldDef.required"
        :placeholder="fieldDef.placeholder || ''"
        class="flat-input"
        rows="3"
      ></textarea>

      <!-- Date Picker -->
      <date-picker
        v-else-if="fieldDef.type === 'date'"
        :value="customFields[fieldDef.id]"
        @update:modelValue="$emit('update:customFields', { ...customFields, [fieldDef.id]: $event })"
        :id="'custom-field-' + fieldDef.id"
        type="date"
        format="jYYYY/jMM/jDD"
        display-format="jYYYY/jMM/jDD"
        :placeholder="fieldDef.placeholder || $t('contactForm.birthDatePlaceholder')"
        clearable
        class="flat-input"
      ></date-picker>

      <!-- Checkbox -->
      <div v-else-if="fieldDef.type === 'checkbox'" class="checkbox-group">
        <input
          :id="'custom-field-' + fieldDef.id"
          type="checkbox"
          :checked="customFields[fieldDef.id] === true"
          @change="$emit('update:customFields', { ...customFields, [fieldDef.id]: $event.target.checked })"
          :required="fieldDef.required"
          class="flat-checkbox"
        />
        <label :for="'custom-field-' + fieldDef.id" class="checkbox-label">{{ fieldDef.placeholder || fieldDef.name }}</label>
      </div>

      <!-- Select -->
      <select
        v-else-if="fieldDef.type === 'select'"
        :id="'custom-field-' + fieldDef.id"
        :value="customFields[fieldDef.id]"
        @change="$emit('update:customFields', { ...customFields, [fieldDef.id]: $event.target.value })"
        :required="fieldDef.required"
        class="flat-select"
      >
        <option value="">{{ fieldDef.placeholder || $t('contactForm.selectOption') }}</option>
        <option v-for="option in getSelectOptions(fieldDef, customFields[fieldDef.id])" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <!-- Radio -->
      <div v-else-if="fieldDef.type === 'radio'" class="radio-group">
        <div v-for="option in fieldDef.options" :key="option" class="radio-option">
          <input
            :id="'custom-field-' + fieldDef.id + '-' + option"
            type="radio"
            :value="option"
            :checked="customFields[fieldDef.id] === option"
            @change="$emit('update:customFields', { ...customFields, [fieldDef.id]: $event.target.value })"
            :required="fieldDef.required"
            :name="'custom-field-' + fieldDef.id" <!-- Use name for grouping radio buttons -->
            class="flat-radio"
          />
          <label :for="'custom-field-' + fieldDef.id + '-' + option">{{ option }}</label>
        </div>
      </div>

      <!-- File Input -->
      <input
        v-else-if="fieldDef.type === 'file'"
        :id="'custom-field-' + fieldDef.id"
        type="file"
        @change="$emit('update:customFields', { ...customFields, [fieldDef.id]: $event.target.files[0] })"
        :required="fieldDef.required"
        class="flat-input"
      />

      <!-- Fallback for unknown types -->
      <div v-else>
        <p>{{ $t('contactForm.unknownFieldType') }}: {{ fieldDef.type }}</p>
      </div>

      <!-- Display error if any -->
      <span v-if="customFieldErrors[fieldDef.id]" class="field-error">{{ $t(customFieldErrors[fieldDef.id]) }}</span>
    </div>
  </div>
</template>

<script setup>
// ایمپورت مستقیم کامپوننت IconWrapper
import IconWrapper from '@/components/common/IconWrapper.vue';
import DatePicker from 'vue3-persian-datetime-picker';
import { useI18n } from 'vue-i18n';

defineProps({
  sortedCustomFieldDefinitions: Array, // تعاریف فیلدهای سفارشی
  customFields: Object, // مقادیر فعلی فیلدهای سفارشی
  customFieldErrors: Object // خطاهای فیلدهای سفارشی
});

defineEmits(['update:customFields']);

const { t } = useI18n();

const getSelectOptions = (fieldDef, currentValue) => {
  let options = [...(fieldDef.options || [])]; // Start with a copy of original options
  const valueExistsInOptions = options.some(opt => opt.value === currentValue);

  if (currentValue !== undefined && currentValue !== null && String(currentValue).trim() !== '' && !valueExistsInOptions) {
    // If the current value is not in the options, add it as the first option, marked as previous
    options.unshift({
      value: currentValue,
      label: `${currentValue} (${t('customFields.previousOptionSuffix')})`,
      isPrevious: true, // Optional: for styling or special handling
    });
  }
  return options;
};
</script>

<style scoped>
.custom-fields-wrapper {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}

.custom-fields-wrapper h3 {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-field-group {
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
}

.required-star {
  color: var(--color-danger);
  margin-left: 2px;
}

.flat-input,
.flat-select,
.flat-checkbox,
.flat-radio {
  /* Add basic styling for consistency */
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  background-color: var(--color-background-soft);
  color: var(--color-text);
  font-size: 1em;
  transition: border-color 0.3s ease;
}

.flat-input:focus,
.flat-select:focus {
  border-color: var(--color-primary);
  outline: none;
}

.flat-select {
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22292.362%22 height%3D%22292.362%22 viewBox%3D%220 0 292.362 292.362%22%3E%3Cpath fill%3D%22%23000000%22 d%3D%22M287.9 139.8H4.4c-6.1 0-9.4 7.3-5.1 11.6l139.8 139.8c4.2 4.2 11 4.2 15.2 0l139.8-139.8c4.3-4.3 1-11.6-5.1-11.6z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 10px top 50%;
  background-size: 12px auto;
  padding-right: 30px; /* Make space for the custom arrow */
}

.checkbox-group,
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 5px;
}

.field-error {
  color: var(--color-danger);
  font-size: 0.9em;
  margin-top: 5px;
}
</style>