<template>
  <div class="contact-list-wrapper">
    <h2>لیست مخاطبین</h2>

    <div class="controls-container">
      <div class="search-control">
        <label for="search">جستجو:</label>
        <input
          type="text"
          id="search"
          v-model="contactStore.searchQuery"
          placeholder="جستجو در مخاطبین..."
          class="control-input"
        />
      </div>

      <div class="sort-controls">
        <label for="sortField">مرتب‌سازی بر اساس:</label>
        <select id="sortField" v-model="contactStore.sortField" class="control-select">
          <option
            v-for="option in sortOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>

        <label for="sortOrder">ترتیب:</label>
        <select id="sortOrder" v-model="contactStore.sortOrder" class="control-select">
          <option value="asc">صعودی</option>
          <option value="desc">نزولی</option>
        </select>
      </div>

     <el-button 
    type="info" 
    plain 
    @click="toggleAdvancedFilters" 
    class="advanced-filter-button"
>
    فیلتر پیشرفته
    <el-icon class="el-icon--right">
        <template v-if="!showAdvancedFilters"><ArrowDown /></template>
        <template v-else><ArrowUp /></template>
    </el-icon>
</el-button>
    </div>

    <div v-if="isFilterSectionVisible" class="advanced-filter-section">
      <h3>قوانین فیلتر</h3>

      <div class="add-rule-form">
          <h4>افزودن قانون جدید:</h4>
          <ElSelect
             v-model="newRule.field"
             placeholder="انتخاب فیلد"
             class="rule-control"
             filterable clearable >
              <ElOption
                  v-for="field in filterableFields"
                  :key="field.value"
                  :label="field.label"
                  :value="field.value"
              ></ElOption>
          </ElSelect>

          <ElSelect
             v-model="newRule.operator"
             placeholder="انتخاب عملگر"
             class="rule-control"
             :disabled="!newRule.field" clearable
           >
             <ElOption
                 v-for="operator in availableOperators"
                 :key="operator.value"
                 :label="operator.label"
                 :value="operator.value"
             ></ElOption>
           </ElSelect>

           <template v-if="selectedNewRuleFieldDefinition">
               <ElInput
                   v-if="['text', 'textarea'].includes(selectedNewRuleFieldDefinition.type)"
                   v-model="newRule.value"
                   :placeholder="`مقدار فیلتر (${selectedNewRuleFieldDefinition.label})`"
                   class="rule-control"
                   :disabled="!newRule.operator || newRule.operator === 'isNull' || newRule.operator === 'isNotNull'"
                   :type="selectedNewRuleFieldDefinition.type === 'textarea' ? 'textarea' : 'text'"
               ></ElInput>

               <ElInput
                   v-else-if="selectedNewRuleFieldDefinition.type === 'number'"
                   v-model.number="newRule.value" :placeholder="`مقدار فیلتر عددی (${selectedNewRuleFieldDefinition.label})`"
                   class="rule-control"
                    :disabled="!newRule.operator || newRule.operator === 'isNull' || newRule.operator === 'isNotNull'"
                   type="number"
               ></ElInput>

               <vue-persian-datetime-picker
                   v-else-if="selectedNewRuleFieldDefinition.type === 'date'"
                   v-model="newRule.value"
                   format="jYYYY/jM/jD" display-format="jYYYY/jM/jD" type="date"
                   placeholder="انتخاب تاریخ شمسی"
                   :disabled="!newRule.operator || newRule.operator === 'isNull' || newRule.operator === 'isNotNull'"
                   clearable
                   class="rule-control" ></vue-persian-datetime-picker>


               <ElSelect
                   v-else-if="['select', 'boolean', 'gender', 'group'].includes(selectedNewRuleFieldDefinition.type)"
                   v-model="newRule.value"
                   :placeholder="`انتخاب مقدار (${selectedNewRuleFieldDefinition.label})`"
                   class="rule-control"
                   :disabled="!newRule.operator || newRule.operator === 'isNull' || newRule.operator === 'isNotNull'"
                   clearable
               >
                   <ElOption
                       v-for="option in valueSelectOptions"
                       :key="option.value"
                       :label="option.label"
                       :value="option.value"
                   ></ElOption>
               </ElSelect>

               <ElInput
                   v-else
                   v-model="newRule.value"
                   placeholder="مقدار فیلتر (نوع نامشخص)"
                   class="rule-control"
                   :disabled="!newRule.operator || newRule.operator === 'isNull' || newRule.operator === 'isNotNull'"
               ></ElInput>

           </template>
            <span v-else class="rule-control-placeholder">
                فیلد را انتخاب کنید
           </span>


           <ElButton
             type="primary"
             @click="addNewRule"
             :disabled="!newRule.field || !newRule.operator || ((newRule.operator !== 'isNull' && newRule.operator !== 'isNotNull') && (newRule.value === null || newRule.value === ''))" >
               افزودن قانون
           </ElButton>
      </div>


      <div class="current-rules-list">
          <h4>قوانین فیلتر فعال:</h4>
          <p v-if="currentFilterRules.length === 0" class="no-rules-message">هنوز قانونی اضافه نشده است. برای شروع، فیلد و عملگر را انتخاب کنید.</p>

          <div v-for="(rule, index) in currentFilterRules" :key="index" class="filter-rule-item">
              <p>
                  <span class="rule-field-label">
                       {{ filterableFields.find(f => f.value === rule.field)?.label || rule.field }}: </span>
                 <span class="rule-operator-label">
     {{ getRuleOperatorLabel(rule) }} </span>
                  <span v-if="rule.value !== null && rule.operator !== 'isNull' && rule.operator !== 'isNotNull' && rule.value !== ''" class="rule-value"> "{{ formatRuleValue(rule) }}" </span>
                   <span v-else-if="rule.operator === 'isNull' || rule.operator === 'isNotNull'" class="rule-value-none">
                       (بدون نیاز به مقدار)
                   </span>
              </p>
              <ElButton type="danger" size="small" @click="removeRule(index)">حذف</ElButton>
          </div>
      </div>

      <hr v-if="currentFilterRules.length > 0" class="filter-section-separator">


      <div class="filter-actions">
         <ElButton type="success" @click="applyFilters" :disabled="currentFilterRules.length === 0">اعمال فیلتر</ElButton>
         <ElButton type="danger" @click="clearFilters" :disabled="currentFilterRules.length === 0">پاک کردن همه</ElButton>
      </div>
    </div>

    <hr class="separator" />
     <div v-if="contactStore.loading" class="status-message loading">در حال بارگذاری مخاطبین...</div>
    <div v-else-if="contactStore.error" class="status-message error">{{ contactStore.error }}</div>
    <div v-else-if="paginatedContacts.length === 0" class="status-message no-results">
       هیچ مخاطبی یافت نشد.
       <span v-if="contactStore.contacts.length > 0 && (contactStore.searchQuery || contactStore.filterRules.length > 0)">
         (با معیارهای جستجو/فیلتر مطابقت ندارد.)
       </span>
    </div>

    <ul v-else class="contact-list">
      <li
          v-for="contactItem in contactsPreparedForDisplay"
    :key="contactItem.contact.id"
    class="contact-item"
  >
        <div class="contact-info">
          <router-link
            :to="{ name: 'contact-detail', params: { id: contactItem.contact.id } }"
            class="contact-name-link"
          >
            {{ contactItem.contact.name }} {{ contactItem.contact.lastName }}
          </router-link>

          <p
            v-for="fieldData in contactItem.displayData"
            :key="fieldData.key"
          >
            <strong>{{ fieldData.label }}:</strong> {{ fieldData.value }}
          </p>

          <div v-if="contactItem.contact.additionalPhones && contactItem.contact.additionalPhones.length > 0" class="additional-info">
            <strong>شماره‌های اضافی:</strong>
            <ul>
              <li v-for="(additionalPhone, index) in contactItem.contact.additionalPhones" :key="index">
                {{ displayPhoneType(additionalPhone.type) }}: {{ additionalPhone.number }}
              </li>
            </ul>
          </div>

          <div v-if="contactItem.contact.addresses && contactItem.contact.addresses.length > 0" class="additional-info">
            <strong>آدرس‌ها:</strong>
            <ul>
              <li v-for="(address, index) in contactItem.contact.addresses" :key="index">
                <strong>{{ displayAddressType(address.type) }}</strong
                >:
                {{ address.street ? address.street + ', ' : '' }}
                {{ address.city ? address.city : '' }}
                {{ address.province ? ', ' + address.province : '' }}
                {{ address.country ? ', ' + address.country : '' }}
                {{ address.postalCode ? ' (کد پستی: ' + address.postalCode + ')' : '' }}
                <span v-if="address.notes"> (یادداشت: {{ address.notes }})</span>
              </li>
            </ul>
          </div>
          </div>

       <div class="contact-actions">
         <button
           class="button edit-button"
           @click="startEditingContact(contactItem.contact)"
           :disabled="contactStore.loading"
         >
           ویرایش
         </button>

         <el-button type="danger">
  <el-icon><Delete /></el-icon>
  حذف
</el-button>
       </div>
     </li>
   </ul>

    <div v-if="totalPages > 1" class="pagination-controls">
        <button @click="prevPage" :disabled="currentPage === 1" class="button pagination-button">قبلی</button>
        <span>صفحه {{ currentPage }} از {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="button pagination-button">بعدی</button>

        <div class="page-numbers">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="{ active: currentPage === page }"
            class="button page-number-button"
          >
            {{ page }}
          </button>
        </div>
      </div>

      <div class="total-contacts">
            تعداد کل مخاطبین (بر اساس فیلتر فعلی): {{ totalContactsOnCurrentFilter }}
        </div>

  </div>
</template>

<script setup>
import { computed, ref, watch, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import { useContactStore } from '@/store/contacts';
import { useCustomFieldStore } from '@/store/customFields';
import { useGroupStore } from '@/store/groups';
import { useSettingsStore } from '@/store/settings';
import { useRouter } from 'vue-router';
import { ElButton, ElInput, ElSelect, ElOption, ElMessageBox } from 'element-plus';

import {
  formatGregorianDateToShamsi,
  parseJalaaliStringToGregorianMoment,
  formatCustomFieldValue,
  displayGender,
  displayPhoneType,
  displayAddressType
} from '@/utils/formatters';
import moment from 'moment-jalaali';
import VuePersianDatetimePicker from 'vue3-persian-datetime-picker';

const contactStore = useContactStore();
const customFieldStore = useCustomFieldStore();
const groupStore = useGroupStore();
const settingsStore = useSettingsStore();
const router = useRouter();

const { displayColumns } = storeToRefs(settingsStore);
const { fieldDefinitions } = storeToRefs(customFieldStore);
const { filteredAndSortedContacts } = storeToRefs(contactStore);

const contactsPreparedForDisplay = ref([]);

const standardFieldLabels = {
  phone: 'تلفن ',
  group: 'گروه',
  birthDate: 'تاریخ تولد',
  title: 'سمت / تخصص',
  createdAt: 'تاریخ ایجاد',
  updatedAt: 'آخرین ویرایش',
  'address.city': 'شهر (آدرس)',
  'address.street': 'خیابان (آدرس)',
  notes: 'یادداشت',
  gender: 'جنسیت',
};

const standardFieldTypes = {
  phone: 'text',
  group: 'group',
  birthDate: 'date',
  title: 'text',
  createdAt: 'date',
  updatedAt: 'date',
  'address.city': 'addressPart',
  'address.street': 'addressPart',
  notes: 'textarea',
  gender: 'gender',
};

const isFilterSectionVisible = ref(false);
const toggleFilterSection = () => {
  isFilterSectionVisible.value = !isFilterSectionVisible.value;
};
const currentFilterRules = ref([]);
const newRule = ref({
    field: null,
    operator: null,
    value: null
});

watch(
    () => newRule.value.field,
    (newField, oldField) => {
        if (newField !== oldField) {
            newRule.value.operator = null;
            newRule.value.value = null;
        }
    }
);

const filterableFields = computed(() => {
    const standardFields = [
        { value: 'name', label: 'نام', type: 'text' },
        { value: 'lastName', label: 'نام خانوادگی', type: 'text' },
        { value: 'phone', label: 'تلفن اصلی', type: 'text' },
        { value: 'title', label: 'سمت/تخصص', type: 'text' },
        { value: 'notes', label: 'یادداشت/توضیحات', type: 'textarea' },
        { value: 'createdAt', label: 'تاریخ ایجاد', type: 'date' },
        { value: 'updatedAt', label: 'تاریخ ویرایش', type: 'date' },
        { value: 'birthDate', label: 'تاریخ تولد', type: 'date' },
        { value: 'gender', label: 'جنسیت', type: 'select' },
        { value: 'group', label: 'گروه', type: 'select' },
    ];

    const customFields = fieldDefinitions.value.map(field => ({
        value: field.id,
        label: `فیلد سفارشی: ${field.label}`,
        type: field.type
    }));

    return [...standardFields, ...customFields];
});

const selectedNewRuleFieldDefinition = computed(() => {
    if (!newRule.value.field) return null;
     const field = filterableFields.value.find(f => f.value === newRule.value.field);
     if (field?.value && !standardFieldLabels[field.value]) {
          const customFieldId = field.value;
          return fieldDefinitions.value.find(def => def.id === customFieldId);
     }
    return field;
});

const availableOperators = computed(() => {
    const fieldDef = selectedNewRuleFieldDefinition.value;
    const type = fieldDef?.type;
     const operators = {
        text: [
            { value: 'equals', label: 'مساوی با' }, { value: 'notEquals', label: 'مساوی نباشد با' },
            { value: 'contains', label: 'شامل باشد' }, { value: 'notContains', label: 'شامل نباشد' },
            { value: 'startsWith', label: 'شروع شود با' }, { value: 'endsWith', label: 'پایان یابد با' },
        ],
        textarea: [
            { value: 'equals', label: 'مساوی با' }, { value: 'notEquals', label: 'مساوی نباشد با' },
            { value: 'contains', label: 'شامل باشد' }, { value: 'notContains', label: 'شامل نباشد' },
        ],
        number: [
            { value: 'equals', label: 'مساوی با' }, { value: 'notEquals', label: 'مساوی نباشد با' },
            { value: 'greaterThan', label: 'بزرگتر از' }, { value: 'lessThan', label: 'کوچکتر از' },
            { value: 'greaterThanOrEqual', label: 'بزرگتر یا مساوی' }, { value: 'lessThanOrEqual', label: 'کوچکتر یا مساوی' },
        ],
        date: [
             { value: 'equals', label: 'مساوی با تاریخ' },
             { value: 'notEquals', label: 'مساوی نباشد با تاریخ' },
             { value: 'isBefore', label: 'قبل از تاریخ' },
             { value: 'isAfter', label: 'بعد از تاریخ' },
             { value: 'isSameOrBefore', label: 'مساوی یا قبل از تاریخ' },
             { value: 'isSameOrAfter', label: 'مساوی یا بعد از تاریخ' },
        ],
        boolean: [
            { value: 'equals', label: 'مساوی با (بله/خیر)' }, { value: 'notEquals', label: 'مساوی نباشد با (بله/خیر)' },
        ],
        select: [
            { value: 'equals', label: 'مساوی با' }, { value: 'notEquals', label: 'مساوی نباشد با' },
        ]
    };
     const commonOperators = [
        { value: 'isNull', label: 'مقدار نداشته باشد' },
        { value: 'isNotNull', label: 'مقدار داشته باشد' },
     ];

    const typeOperators = operators[type] || [];
    return [...typeOperators, ...commonOperators];
});

const valueSelectOptions = computed(() => {
    const fieldDef = selectedNewRuleFieldDefinition.value;
    if (!fieldDef) return [];

    const options = [];

    if (fieldDef.type === 'select' || fieldDef.type === 'boolean' || fieldDef.type === 'gender' || fieldDef.type === 'group') {
        if (fieldDef.value === 'gender' || fieldDef.type === 'gender') {
            options.push(
                { label: 'مرد', value: 'male' },
                { label: 'زن', value: 'female' },
                { label: 'دیگر', value: 'other' }
            );
        } else if (fieldDef.value === 'group' || fieldDef.type === 'group') {
             groupStore.groups.forEach(group => {
                 options.push({ label: group.name, value: group.name });
             });
             options.unshift({ label: 'بدون گروه', value: '' });
         }
        else if (fieldDef.id && fieldDef.type === 'select') {
             const customFieldDefinition = fieldDefinitions.value.find(def => def.id === fieldDef.id);
             if (customFieldDefinition && customFieldDefinition.options) {
                 customFieldDefinition.options.forEach(opt => {
                      if (typeof opt === 'string') {
                          options.push({ label: opt, value: opt });
                      } else {
                          options.push({ label: opt.label || opt.value, value: opt.value });
                      }
                 });
             }
         } else if (fieldDef.type === 'boolean') {
            options.push(
                { label: 'بله', value: true },
                { label: 'خیر', value: false }
            );
        }
    }

    return options;
});

const getRuleOperatorLabel = (rule) => {
    if (!rule || rule.operator === null || rule.operator === undefined) {
        return String(rule?.operator || '');
    }

    const fieldDef = filterableFields.value.find(f => f.value === rule.field);
    const type = fieldDef?.type;

     const allPossibleOperators = {
        text: [
            { value: 'equals', label: 'مساوی با' }, { value: 'notEquals', label: 'مساوی نباشد با' },
            { value: 'contains', label: 'شامل باشد' }, { value: 'notContains', label: 'شامل نباشد' },
            { value: 'startsWith', label: 'شروع شود با' }, { value: 'endsWith', label: 'پایان یابد با' },
        ],
        textarea: [
            { value: 'equals', label: 'مساوی با' }, { value: 'notEquals', label: 'مساوی نباشد با' },
            { value: 'contains', label: 'شامل باشد' }, { value: 'notContains', label: 'شامل نباشد' },
        ],
        number: [
            { value: 'equals', label: 'مساوی با' }, { value: 'notEquals', label: 'مساوی نباشد با' },
            { value: 'greaterThan', label: 'بزرگتر از' }, { value: 'lessThan', label: 'کوچکتر از' },
            { value: 'greaterThanOrEqual', label: 'بزرگتر یا مساوی' }, { value: 'lessThanOrEqual', label: 'کوچکتر یا مساوی' },
        ],
        date: [
             { value: 'equals', label: 'مساوی با تاریخ' },
             { value: 'notEquals', label: 'مساوی نباشد با تاریخ' },
             { value: 'isBefore', label: 'قبل از تاریخ' },
             { value: 'isAfter', label: 'بعد از تاریخ' },
             { value: 'isSameOrBefore', label: 'مساوی یا قبل از تاریخ' },
             { value: 'isSameOrAfter', label: 'مساوی یا بعد از تاریخ' },
        ],
        boolean: [
            { value: 'equals', label: 'مساوی با (بله/خیر)' }, { value: 'notEquals', label: 'مساوی نباشد با (بله/خیر)' },
        ],
        select: [
            { value: 'equals', label: 'مساوی با' }, { value: 'notEquals', label: 'مساوی نباشد با' },
        ],
         gender: [
            { value: 'equals', label: 'مساوی با' }, { value: 'notEquals', label: 'مساوی نباشد با' },
             { value: 'isNull', label: 'مقدار نداشته باشد' }, { value: 'isNotNull', label: 'مقدار داشته باشد' },
         ],
         group: [
            { value: 'equals', label: 'مساوی با' }, { value: 'notEquals', label: 'مساوی نباشد با' },
             { value: 'isNull', label: 'مقدار نداشته باشد' }, { value: 'isNotNull', label: 'مقدار داشته باشد' },
         ],
         addressPart: [
             { value: 'equals', label: 'مساوی با' }, { value: 'notEquals', label: 'مساوی نباشد با' },
             { value: 'contains', label: 'شامل باشد' }, { value: 'notContains', label: 'شامل نباشد' },
              { value: 'isNull', label: 'مقدار نداشته باشد' }, { value: 'isNotNull', label: 'مقدار داشته باشد' },
         ],

    };
     const commonOperators = [
        { value: 'isNull', label: 'مقدار نداشته باشد' },
        { value: 'isNotNull', label: 'مقدار داشته باشد' },
     ];

    const typeOperators = allPossibleOperators[type] || [];
     const combinedOperators = [...typeOperators];
     commonOperators.forEach(commonOp => {
         if (!combinedOperators.find(op => op.value === commonOp.value)) {
             combinedOperators.push(commonOp);
         }
     });

    const operatorObj = combinedOperators.find(op => op.value === rule.operator);

    return operatorObj?.label || String(rule.operator);
};

const formatRuleValue = (rule) => {
     if (rule.value === null || rule.value === undefined || rule.value === '') {
          if (rule.operator !== 'isNull' && rule.operator !== 'isNotNull') return '';
     }

     const fieldDef = filterableFields.value.find(f => f.value === rule.field);
     const type = fieldDef?.type || 'text';

     switch (type) {
         case 'date':
             return formatGregorianDateToShamsi(rule.value);
         case 'boolean':
             return rule.value ? 'بله' : 'خیر';
         case 'gender':
            return displayGender(rule.value);
         case 'group':
             return rule.value === '' ? 'بدون گروه' : rule.value;
         case 'select':
              const customSelectDef = fieldDefinitions.value.find(def => def.id === rule.field);
              if (customSelectDef) {
                 const option = customSelectDef.options?.find(opt =>
                      (typeof opt === 'string' && opt === rule.value) ||
                      (typeof opt === 'object' && opt.value === rule.value)
                 );
                 return option ? (option.label || option.value) : rule.value;
              }
             return String(rule.value);
          case 'number':
              return Number(rule.value);
         case 'text':
         case 'textarea':
         default:
             return String(rule.value);
     }
};

const addNewRule = () => {
    const rule = newRule.value;
    const fieldDef = selectedNewRuleFieldDefinition.value;

    if (!rule.field || !rule.operator) {
        alert('لطفاً فیلد و عملگر را انتخاب کنید.');
        return;
    }
    const requiresValue = rule.operator !== 'isNull' && rule.operator !== 'isNotNull';
    if (requiresValue && (rule.value === null || rule.value === '')) {
         alert('لطفاً مقدار فیلتر را وارد کنید.');
         return;
    }

    let valueToStore = rule.value;

    if (requiresValue && fieldDef) {
        switch (fieldDef.type) {
            case 'number':
                valueToStore = Number(rule.value);
                if (isNaN(valueToStore)) {
                    alert('لطفاً یک عدد معتبر وارد کنید.');
                    return;
                }
                break;
            case 'date':
                 const jalaaliMoment = parseJalaaliStringToGregorianMoment(rule.value);
                 if (!jalaaliMoment || !jalaaliMoment.isValid()) {
                      alert('تاریخ شمسی انتخاب شده نامعتبر است.');
                      return;
                 }
                 valueToStore = jalaaliMoment.format('YYYY-MM-DD');
                break;
            case 'boolean':
                valueToStore = rule.value;
                break;
             case 'select':
             case 'gender':
             case 'group':
                 valueToStore = rule.value;
                 break;
            case 'text':
            case 'textarea':
            default:
                valueToStore = String(rule.value);
                break;
        }
    }

    currentFilterRules.value.push({
         field: rule.field,
         operator: rule.operator,
         value: valueToStore
    });

    newRule.value = {
        field: null,
        operator: null,
        value: null
    };
};

const removeRule = (index) => {
     if (index >= 0 && index < currentFilterRules.value.length) {
        currentFilterRules.value.splice(index, 1);
        applyFilters();
     }
};

const applyFilters = () => {
    contactStore.setFilterRules(currentFilterRules.value);
};

const clearFilters = () => {
    currentFilterRules.value = [];
    contactStore.setFilterRules([]);
};

const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalContactsOnCurrentFilter = computed(() => filteredAndSortedContacts.value.length);
const totalPages = computed(() => Math.ceil(totalContactsOnCurrentFilter.value / itemsPerPage.value));
const paginatedContacts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAndSortedContacts.value.slice(start, end);
});
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
     window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
     window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
watch(
  () => [
    contactStore.searchQuery,
    contactStore.sortField,
    contactStore.sortOrder,
    currentFilterRules.value.length
  ],
  () => {
    currentPage.value = 1;
  }
);

watchEffect(() => {
   const contactsLoading = contactStore.loading;
   const customFieldsLoading = customFieldStore.loading;
   const groupsLoading = groupStore.loading;

    const contacts = paginatedContacts.value;

  if (contactsLoading || customFieldsLoading || groupsLoading || !contacts || customFieldStore.fieldDefinitions.length === 0) {
      contactsPreparedForDisplay.value = [];
      return;
  }

  const preparedData = contacts.map(contact => {
    const displayData = [];

    settingsStore.displayColumns.forEach(columnKey => {
      if (columnKey === 'name' || columnKey === 'lastName') {
        return;
      }

      let label = standardFieldLabels[columnKey] || 'فیلد ناشناس';
      let rawValue = undefined;
      let fieldType = standardFieldTypes[columnKey] || 'text';
      let currentFieldDefForFormatter = null;

      if (standardFieldLabels[columnKey]) {
        rawValue = contact[columnKey];
        if (columnKey.startsWith('address.')) {
          const addressPartKey = columnKey.split('.')[1];
          if (Array.isArray(contact.addresses) && contact.addresses.length > 0) {
            rawValue = contact.addresses[0][addressPartKey];
          } else {
            rawValue = undefined;
          }
        }
      } else if (columnKey.startsWith('customFieldDef_')) {
        const fieldIdString = columnKey.split('_')[1];
        if (!customFieldStore.fieldDefinitions || customFieldStore.fieldDefinitions.length === 0) {
          return;
        }

        const fieldId = Number(fieldIdString);
        if (isNaN(fieldId)) {
          return;
        }

        const fieldDef = customFieldStore.fieldDefinitions.find(def => def.id === fieldId);
        currentFieldDefForFormatter = fieldDef;

        if (!fieldDef) {
          return;
        }

        label = fieldDef.label;
        fieldType = fieldDef.type;

        const customFieldData = contact.customFields ? contact.customFields.find(cf => cf.fieldId === fieldId) : null;
        rawValue = customFieldData ? customFieldData.value : undefined;
      } else {
        return;
      }

      let formattedValue = '';
      let shouldDisplay = false;

      switch (fieldType) {
        case 'date':
          formattedValue = rawValue ? formatGregorianDateToShamsi(rawValue) : '';
          shouldDisplay = formattedValue !== '';
          break;
        case 'gender':
          formattedValue = displayGender(rawValue);
          shouldDisplay = formattedValue !== '';
          break;
       case 'group':
          formattedValue = (rawValue === '' || rawValue === null || rawValue === undefined) ? 'بدون گروه' : String(rawValue);
          shouldDisplay = true;
          break;
        case 'addressPart':
          formattedValue = rawValue != null ? String(rawValue) : '';
          shouldDisplay = formattedValue.trim() !== '';
          break;
        case 'boolean':
          formattedValue = formatCustomFieldValue(rawValue, 'boolean');
          shouldDisplay = rawValue === true || rawValue === false;
          break;
        case 'number':
          shouldDisplay = typeof rawValue === 'number' && !isNaN(rawValue);
          formattedValue = shouldDisplay ? String(rawValue) : '';
          break;
        case 'select':
          formattedValue = formatCustomFieldValue(rawValue, 'select', currentFieldDefForFormatter?.options);
          shouldDisplay = rawValue !== undefined && rawValue !== null && String(rawValue).trim() !== '';
          break;
        case 'text':
        case 'textarea':
        default:
          formattedValue = rawValue != null ? String(rawValue) : '';
          shouldDisplay = formattedValue.trim() !== '';
          break;
      }

      if (shouldDisplay) {
        displayData.push({
          label: label,
          value: formattedValue,
          key: columnKey,
        });
      }
    });

    return {
      contact: contact,
      displayData: displayData
    };
  });

  contactsPreparedForDisplay.value = preparedData;
});

const standardSortableOptions = [
  { value: 'lastName', label: 'نام خانوادگی' },
  { value: 'name', label: 'نام' },
  { value: 'phone', label: 'تلفن اصلی' },
  { value: 'createdAt', label: 'تاریخ ایجاد' },
  { value: 'group', label: 'گروه' },
  { value: 'title', label: 'سمت/تخصص' },
   { value: 'birthDate', label: 'تاریخ تولد' },
];
const sortOptions = computed(() => {
  const options = [...standardSortableOptions];
  customFieldStore.sortedFieldDefinitions.forEach(field => {
    options.push({
      value: field.id,
      label: `فیلد سفارشی: ${field.label}`
    });
  });
  return options;
});

const startEditingContact = (contact) => {
  contactStore.setContactToEdit(contact);
  router.push({ name: 'add-contact' });
};

const confirmDeleteContact = async (contactId) => {
  const confirmed = window.confirm('آیا از حذف این مخاطب اطمینان دارید؟');
  if (confirmed) {
    try {
      await contactStore.deleteContact(contactId);
    } catch (error) {
      alert('خطا در حذف مخاطب: ' + (error.message || 'خطای نامشخص در هنگام حذف.'));
    }
  }
};
</script>

<style scoped>
/* **استایل‌های کلی کانتینر صفحه** */
.contact-list-wrapper {
    max-width: 800px;
    margin: 20px auto;
    padding: 0 20px;
}

h2 {
    text-align: center;
    color: var(--color-text-primary); /* تغییر کرد */
    margin-bottom: 20px;
}

/* **استایل‌های کانتینر کنترل‌ها (جستجو، مرتب‌سازی، فیلتر)** */
.controls-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;
    margin-bottom: 20px;
}

/* استایل بخش جستجو و مرتب‌سازی */
.search-control, .sort-controls {
    display: flex;
    align-items: center;
    gap: 10px;
}

/* استایل عمومی برای Input و Select در کنترل‌ها */
.control-input, .control-select {
    padding: 8px;
    border: 1px solid var(--color-border-medium); /* تغییر کرد */
    border-radius: 4px;
    font-size: 1em;
    background-color: var(--color-background-light); /* تغییر کرد */
    color: var(--color-text-primary); /* تغییر کرد */
}

/* استایل دکمه نمایش/پنهان‌سازی فیلتر */
.toggle-filter-button {
  background-color: var(--color-background-darker-light); /* تغییر کرد */
  color: var(--color-text-primary); /* تغییر کرد */
  padding: 8px 15px;
  border: 1px solid var(--color-border-medium); /* تغییر کرد */
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s ease;
  font-family: inherit;
}

.toggle-filter-button:hover {
  background-color: var(--color-border-light); /* تغییر کرد */
}

/* **استایل بخش قابل گسترش فیلتر پیشرفته** */
.advanced-filter-section {
    border: 1px solid var(--color-border-light); /* تغییر کرد */
    padding: 15px;
    border-radius: 8px;
    background-color: var(--color-background-darker-light); /* تغییر کرد */
    margin-bottom: 20px;
}

.advanced-filter-section h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: var(--color-text-secondary); /* تغییر کرد */
    border-bottom: 1px dashed var(--color-border-medium); /* تغییر کرد */
    padding-bottom: 10px;
}

/* استایل فرم اضافه کردن قانون فیلتر */
.add-rule-form {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-bottom: 15px;
    padding: 10px;
    border: 1px dashed var(--color-border-medium); /* تغییر کرد */
    border-radius: 4px;
    background-color: var(--color-background-light); /* تغییر کرد */
}

.add-rule-form h4 {
    width: 100%;
    margin: 0 0 10px 0;
    color: var(--color-text-primary); /* تغییر کرد */
}

/* استایل عمومی برای Input و Select در فرم افزودن قانون */
.advanced-filter-section .el-select,
.advanced-filter-section .el-input,
.advanced-filter-section .el-date-editor,
.advanced-filter-section .vpd-input {
    flex-basis: 180px;
    flex-grow: 1;
    /* Element Plus خودش استایل‌های مربوط به تم رو اعمال می‌کنه */
}

/* استایل placeholder وقتی فیلدی انتخاب نشده */
.rule-control-placeholder {
    flex-basis: 180px;
    flex-grow: 1;
    padding: 8px 12px;
    color: var(--color-text-tertiary); /* تغییر کرد */
    border: 1px solid var(--color-border-light); /* تغییر کرد (استایل پیش‌فرض Element Plus ممکنه اینو override کنه) */
    border-radius: 4px;
    background-color: var(--color-background-light); /* تغییر کرد */
    font-size: 0.9em;
    line-height: 1.5;
}


/* استایل لیست قوانین فیلتر فعال */
.current-rules-list {
    margin-top: 15px;
    padding-top: 15px;
}

.current-rules-list h4 {
    margin: 0 0 10px 0;
    color: var(--color-text-primary); /* تغییر کرد */
}

.no-rules-message {
    text-align: center;
    color: var(--color-text-secondary); /* تغییر کرد */
    font-style: italic;
    margin-top: 10px;
}

/* استایل هر آیتم قانون فیلتر در لیست */
.filter-rule-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    padding: 8px;
    border: 1px solid var(--color-border-light); /* تغییر کرد */
    border-radius: 4px;
    background-color: var(--color-background-light); /* تغییر کرد */
    flex-wrap: wrap;
    justify-content: space-between;
    box-shadow: 0 1px 3px var(--color-shadow); /* اضافه شد برای عمق بیشتر */
}

.filter-rule-item p {
     margin: 0;
     flex-grow: 1;
     word-break: break-word;
}

.rule-field-label {
    font-weight: bold;
    color: var(--color-link-primary); /* تغییر کرد */
}

.rule-operator-label {
    font-style: italic;
    color: var(--color-text-secondary); /* تغییر کرد */
}

.rule-value {
    font-weight: bold;
    color: var(--color-text-primary); /* تغییر کرد */
}

.rule-value-none {
     font-style: italic;
     color: var(--color-text-tertiary); /* تغییر کرد */
}


/* استایل کانتینر دکمه‌های اعمال/پاک کردن فیلتر */
.filter-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
    justify-content: flex-end;
}

.filter-section-separator {
    margin: 15px 0;
    border: none;
    border-top: 1px dashed var(--color-border-medium); /* تغییر کرد */
}


/* **استایل خط جداکننده اصلی** */
.separator {
  margin: 20px 0;
  border: none;
  border-top: 1px solid var(--color-border-light); /* تغییر کرد */
}


/* **استایل پیام‌های وضعیت (لودینگ، خطا، عدم نتیجه)** */
.status-message {
    text-align: center;
    padding: 15px;
    margin-bottom: 20px;
    border-radius: 4px;
}

.status-message.loading {
    background-color: var(--el-color-success-light-9); /* از متغیر Element Plus */
    color: var(--el-color-success); /* از متغیر Element Plus */
    border: 1px solid var(--el-color-success-light-7); /* از متغیر Element Plus */
}

.status-message.error {
    background-color: var(--el-color-danger-light-9); /* از متغیر Element Plus */
    color: var(--el-color-danger); /* از متغیر Element Plus */
    border: 1px solid var(--el-color-danger-light-7); /* از متغیر Element Plus */
}

.status-message.no-results {
     background-color: var(--el-color-warning-light-9); /* از متغیر Element Plus */
     color: var(--el-color-warning); /* از متغیر Element Plus */
     border: 1px solid var(--el-color-warning-light-7); /* از متغیر Element Plus */
}


/* **استایل لیست مخاطبین (ul)** */
.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* **استایل هر آیتم مخاطب (li)** */
.contact-item {
    border: 1px solid var(--color-border-medium); /* تغییر کرد */
    padding: 15px 20px;
    margin-bottom: 15px;
    border-radius: 8px;
    background-color: var(--color-background-light); /* تغییر کرد */
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 15px;
    box-shadow: 0 2px 4px var(--color-shadow); /* تغییر کرد */
}

/* کانتینر اطلاعات مخاطب */
.contact-info {
    flex-grow: 1;
    min-width: 0;
}

/* استایل لینک نام مخاطب */
.contact-name-link {
  color: var(--color-link-primary); /* تغییر کرد */
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
  font-size: 1.1em;
  margin-bottom: 5px;
  display: inline-block;
}

.contact-name-link:hover {
  text-decoration: underline;
}

/* استایل پاراگراف‌های اطلاعات داخل آیتم */
.contact-item p {
  margin: 3px 0;
  font-size: 0.9em;
  color: var(--color-text-secondary); /* تغییر کرد */
  word-break: break-word;
}

/* استایل عنوان‌های فیلد */
.contact-item p strong {
  color: var(--color-text-primary); /* تغییر کرد */
  margin-left: 5px;
}

/* استایل بخش‌های اطلاعات اضافی */
.additional-info {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed var(--color-border-light); /* تغییر کرد */
}

.additional-info strong {
    display: block;
    margin-bottom: 5px;
    color: var(--color-text-primary); /* تغییر کرد */
}

.additional-info ul {
  list-style: disc;
  padding-left: 20px;
  margin-top: 5px;
  margin-bottom: 0;
}

.additional-info ul li {
  font-size: 0.9em;
  color: var(--color-text-secondary); /* تغییر کرد */
  margin-bottom: 3px;
  word-break: break-word;
}

/* استایل برای بخش یادداشت مخاطب */
.contact-notes {
    font-style: italic;
    color: var(--color-text-secondary); /* اضافه شد */
}

/* استایل برای تاریخ‌های ایجاد و ویرایش */
.date-info {
    font-size: 0.8em;
    color: var(--color-text-tertiary); /* تغییر کرد */
}

/* کانتینر دکمه‌های ویرایش و حذف */
.contact-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
}

.advanced-filter-button {
  margin-top: 15px; /* کمی فاصله از بالا */
  width: 100%; /* تمام عرض کانتینر را بگیرد */
  font-weight: bold;
  justify-content: center; /* متن و آیکون وسط‌چین */
}

/* استایل‌های موبایل اگر نیاز بود */
@media (max-width: 768px) {
    .advanced-filter-button {
        padding: 10px 15px; /* پدینگ مناسب‌تر در موبایل */
        font-size: 0.9em; /* فونت کمی کوچکتر */
    }
}


/* استایل عمومی برای دکمه‌ها */
.button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.3s ease, opacity 0.3s ease;
  font-family: inherit;
}

.button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* استایل مخصوص دکمه ویرایش */
.edit-button {
  background-color: var(--el-color-warning); /* از متغیر Element Plus */
  color: var(--el-color-black); /* Element Plus default text color for warning */
}
.edit-button:hover:not(:disabled) {
  background-color: var(--el-color-warning-dark-2); /* از متغیر Element Plus */
}

/* استایل مخصوص دکمه حذف */
.delete-button {
  background-color: var(--el-color-danger); /* از متغیر Element Plus */
  color: var(--el-color-white); /* Element Plus default text color for danger */
}
.delete-button:hover:not(:disabled) {
  background-color: var(--el-color-danger-dark-2); /* از متغیر Element Plus */
}

/* **استایل کنترل‌های صفحه‌بندی** */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
  flex-wrap: wrap;
  direction: rtl; /* حفظ جهت rtl */
}

/* استایل عمومی دکمه‌های صفحه‌بندی */
.pagination-button, .page-number-button {
   padding: 8px 15px;
   border: 1px solid var(--color-border-medium); /* تغییر کرد */
   background-color: var(--color-background-darker-light); /* تغییر کرد */
   color: var(--color-text-primary); /* تغییر کرد */
   cursor: pointer;
   border-radius: 5px;
   transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
   font-family: inherit;
}

.pagination-button:hover:not(:disabled), .page-number-button:hover:not(:disabled) {
  background-color: var(--color-border-light); /* تغییر کرد */
  border-color: var(--color-link-primary); /* تغییر کرد */
  color: var(--color-text-primary); /* برای حفظ رنگ متن در هاور */
}

.pagination-button:disabled, .page-number-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-background-darker-light); /* تغییر کرد */
  color: var(--color-text-tertiary); /* تغییر کرد */
  border-color: var(--color-border-light); /* تغییر کرد */
}

/* استایل دکمه صفحه فعال */
.page-number-button.active {
  background-color: var(--color-link-primary); /* تغییر کرد */
  color: white; /* این ثابت می‌مونه */
  border-color: var(--color-link-primary); /* تغییر کرد */
}

.pagination-controls span {
  font-weight: bold;
  margin: 0 5px;
  color: var(--color-text-primary); /* اضافه شد */
}

/* کانتینر شماره صفحات */
.page-numbers {
  display: flex;
  gap: 5px;
  margin-left: 5px;
}

.page-numbers button {
  min-width: 35px;
  text-align: center;
  justify-content: center;
}

/* ** واکنش‌گرایی برای نمایش بهتر در موبایل ** */
@media (max-width: 600px) {
    .contact-list-wrapper {
        padding: 0 10px;
    }

    .controls-container {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
        padding: 0 10px;
    }

    .search-control, .sort-controls {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
        width: 100%;
    }

    .search-control label, .sort-controls label {
        margin-right: 0;
        margin-bottom: 5px;
    }

     .search-control input[type='text'], .sort-controls select,
     .advanced-filter-section .el-select, .advanced-filter-section .el-input,
     .advanced-filter-section .el-date-editor,
      .advanced-filter-section .vpd-input {
         width: 100%;
         flex-basis: auto;
     }

    .rule-control-placeholder {
         width: 100%;
         flex-basis: auto;
         text-align: center;
    }


    .toggle-filter-button {
        width: 100%;
        text-align: center;
    }

     .advanced-filter-section {
         margin-left: 10px;
         margin-right: 10px;
         width: calc(100% - 20px);
     }

    .add-rule-form {
         flex-direction: column;
         gap: 10px;
    }


    .add-rule-form .el-button {
        width: 100%;
    }


    .filter-rule-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }

    .filter-rule-item p {
         margin-bottom: 5px;
     }
      .filter-rule-item .el-button {
          width: auto;
          align-self: flex-end;
      }


    .filter-actions {
        flex-direction: column;
        gap: 10px;
        align-items: stretch;
    }

     .filter-actions .el-button {
        width: 100%;
     }


    .contact-item {
        flex-direction: column;
        align-items: stretch;
        padding: 15px;
    }

    .contact-actions {
         flex-direction: row;
         justify-content: space-evenly;
         width: 100%;
         gap: 10px;
         margin-top: 10px;
    }

     .contact-actions .button {
        flex-grow: 1;
        text-align: center;
     }

     .pagination-controls {
         flex-direction: column;
         gap: 10px;
     }
      .page-numbers {
        margin-left: 0;
      }
       .pagination-button, .page-number-button {
           width: 100%;
           text-align: center;
       }
        .page-numbers button {
            min-width: auto;
        }
}

</style>