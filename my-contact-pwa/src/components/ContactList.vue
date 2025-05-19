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

      <button class="toggle-filter-button" @click="toggleFilterSection">
        فیلتر پیشرفته {{ isFilterSectionVisible ? '▲ بستن' : '▼ باز کردن' }}
      </button>
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

         <button
           class="button delete-button"
           @click="confirmDeleteContact(contactItem.contact.id)"
           :disabled="contactStore.loading"
         >
           حذف
         </button>
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
import { useSettingsStore } from '@/store/settings'; // <-- ایمپورت Store تنظیمات
import { useRouter } from 'vue-router';
import { ElButton, ElInput, ElSelect, ElOption, ElMessageBox } from 'element-plus';

// Import توابع کمکی فرمت‌دهی
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


// گرفتن نمونه استورها
const contactStore = useContactStore();
const customFieldStore = useCustomFieldStore();
const groupStore = useGroupStore();
const settingsStore = useSettingsStore(); // <-- گرفتن نمونه settings Store
const router = useRouter();

// گرفتن state های مورد نیاز به صورت reactive از store ها
// displayColumns از settingsStore
const { displayColumns } = storeToRefs(settingsStore);
// fieldDefinitions از customFieldStore (نیاز داریم برای اطلاعات فیلدهای سفارشی)
const { fieldDefinitions } = storeToRefs(customFieldStore);
// filteredAndSortedContacts از contactStore (برای نمایش در لیست صفحه بندی شده)
const { filteredAndSortedContacts } = storeToRefs(contactStore);

const contactsPreparedForDisplay = ref([]); // با یک آرایه خالی مقداردهی اولیه میکنیم

// ** تعریف یک Map برای لیبل فیلدهای استاندارد (همانند SettingsView) **
// این کمک میکنه که لیبل فارسی فیلدها رو داشته باشیم
const standardFieldLabels = {
  phone: 'تلفن ', // کلید صحیح 'primaryPhone' هست
  group: 'گروه',
  birthDate: 'تاریخ تولد',
  title: 'سمت / تخصص',
  createdAt: 'تاریخ ایجاد',
  updatedAt: 'آخرین ویرایش',
  'address.city': 'شهر (آدرس)',
  'address.street': 'خیابان (آدرس)',
  notes: 'یادداشت',
  gender: 'جنسیت', // کلید صحیح 'gender' هست
};

// Map برای تعیین نوع فیلدهای استاندارد برای کمک به فرمت‌دهی و تصمیم نمایش
const standardFieldTypes = {
  phone: 'text',
  group: 'group', // نوع خاص برای گروه
  birthDate: 'date',
  title: 'text',
  createdAt: 'date',
  updatedAt: 'date',
  'address.city': 'addressPart', // نوع خاص برای بخش آدرس
  'address.street': 'addressPart', // نوع خاص برای بخش آدرس
  notes: 'textarea',
  gender: 'gender', // نوع خاص برای جنسیت
  // Add other standard fields and their types as needed
};


// watchEffect برای آماده‌سازی داده‌های نمایشی هر زمان که مخاطبین یا تعاریف فیلدهای سفارشی تغییر کنند



// **متغیر Reactive برای مدیریت وضعیت نمایش بخش فیلتر پیشرفته**
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
        { value: 'phone', label: 'تلفن اصلی', type: 'text' }, // key should be 'phone' not 'primaryPhone' here for filtering
        { value: 'title', label: 'سمت/تخصص', type: 'text' },
        { value: 'notes', label: 'یادداشت/توضیحات', type: 'textarea' },
        { value: 'createdAt', label: 'تاریخ ایجاد', type: 'date' },
        { value: 'updatedAt', label: 'تاریخ ویرایش', type: 'date' },
        { value: 'birthDate', label: 'تاریخ تولد', type: 'date' },
        { value: 'gender', label: 'جنسیت', type: 'select' }, // type select for filtering UI
        { value: 'group', label: 'گروه', type: 'select' },   // type select for filtering UI
    ];

    const customFields = fieldDefinitions.value.map(field => ({
        value: field.id, // استفاده از id فیلد سفارشی برای فیلتر
        label: `فیلد سفارشی: ${field.label}`,
        type: field.type // نوع فیلد سفارشی
    }));

    return [...standardFields, ...customFields];
});

// Adjusted logic to find definition for both standard and custom fields for filtering UI
const selectedNewRuleFieldDefinition = computed(() => {
    if (!newRule.value.field) return null;
    // پیدا کردن تعریف فیلد در لیست filterableFields
     const field = filterableFields.value.find(f => f.value === newRule.value.field);

     // اگر فیلد پیدا شد و یک فیلد سفارشی بود (id دارد)، تعریف کامل آن را از fieldDefinitions بگیریم
     if (field?.value && !standardFieldLabels[field.value]) { // اگر کلید در standardFieldLabels نبود، احتمالا سفارشی است
          const customFieldId = field.value; // value برای فیلدهای سفارشی همان id است
          return fieldDefinitions.value.find(def => def.id === customFieldId); // برگرداندن تعریف کامل فیلد سفارشی
     }
    // در غیر این صورت، همان شیء استاندارد را برگردانیم (شامل value, label, type)
    return field;
});


const availableOperators = computed(() => {
    const fieldDef = selectedNewRuleFieldDefinition.value;
    const type = fieldDef?.type;
    // ... بقیه منطق availableOperators (کد قبلی) ...
     const operators = {
        text: [
            { value: 'equals', label: 'مساوی با' }, { value: 'notEquals', label: 'مساوی نباشد با' },
            { value: 'contains', label: 'شامل باشد' }, { value: 'notContains', label: 'شامل نباشد' },
            { value: 'startsWith', label: 'شروع شود با' }, { value: 'endsWith', label: 'پایان یابد با' },
        ],
        textarea: [ // همانند text
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

    if (fieldDef.type === 'select' || fieldDef.type === 'boolean' || fieldDef.type === 'gender' || fieldDef.type === 'group') { // اضافه کردن انواع خاص که Select دارند
        if (fieldDef.value === 'gender' || fieldDef.type === 'gender') { // هندل کردن جنسیت
            options.push(
                { label: 'مرد', value: 'male' },
                { label: 'زن', value: 'female' },
                { label: 'دیگر', value: 'other' }
            );
        } else if (fieldDef.value === 'group' || fieldDef.type === 'group') { // هندل کردن گروه
             groupStore.groups.forEach(group => {
                 options.push({ label: group.name, value: group.name });
             });
             options.unshift({ label: 'بدون گروه', value: '' });
         }
        else if (fieldDef.id && fieldDef.type === 'select') { // فیلد سفارشی از نوع Select
             const customFieldDefinition = fieldDefinitions.value.find(def => def.id === fieldDef.id); // پیدا کردن تعریف کامل
             if (customFieldDefinition && customFieldDefinition.options) {
                 customFieldDefinition.options.forEach(opt => {
                      if (typeof opt === 'string') {
                          options.push({ label: opt, value: opt });
                      } else {
                          options.push({ label: opt.label || opt.value, value: opt.value });
                      }
                 });
             }
         } else if (fieldDef.type === 'boolean') { // هندل کردن Boolean
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
         gender: [ // عملگرهای جنسیت
            { value: 'equals', label: 'مساوی با' }, { value: 'notEquals', label: 'مساوی نباشد با' },
             { value: 'isNull', label: 'مقدار نداشته باشد' }, { value: 'isNotNull', label: 'مقدار داشته باشد' },
         ],
         group: [ // عملگرهای گروه
            { value: 'equals', label: 'مساوی با' }, { value: 'notEquals', label: 'مساوی نباشد با' },
             { value: 'isNull', label: 'مقدار نداشته باشد' }, { value: 'isNotNull', label: 'مقدار داشته باشد' },
         ],
         addressPart: [ // عملگرهای بخش آدرس
             { value: 'equals', label: 'مساوی با' }, { value: 'notEquals', label: 'مساوی نباشد با' },
             { value: 'contains', label: 'شامل باشد' }, { value: 'notContains', label: 'شامل نباشد' },
              { value: 'isNull', label: 'مقدار نداشته باشد' }, { value: 'isNotNull', label: 'مقدار داشته باشد' },
         ],

    };
     const commonOperators = [ // عملگرهای مشترک که ممکن است قبلا تعریف شده باشند
        { value: 'isNull', label: 'مقدار نداشته باشد' },
        { value: 'isNotNull', label: 'مقدار داشته باشد' },
     ];

    // ترکیب عملگرها بر اساس نوع
    // ابتدا عملگرهای خاص نوع، سپس عملگرهای مشترک (اگر قبلا اضافه نشده باشند)
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
          // اگر مقدار null/undefined/'' بود و عملگر null/notNull نبود، رشته خالی برگردان
          if (rule.operator !== 'isNull' && rule.operator !== 'isNotNull') return '';
     }


     const fieldDef = filterableFields.value.find(f => f.value === rule.field);
     const type = fieldDef?.type || 'text'; // استفاده از نوع از filterableFields

     switch (type) {
         case 'date':
             return formatGregorianDateToShamsi(rule.value); // مقدار ذخیره شده میلادی، نمایش شمسی
         case 'boolean':
             return rule.value ? 'بله' : 'خیر';
         case 'gender': // هندل کردن جنسیت
            return displayGender(rule.value);
         case 'group': // هندل کردن گروه
             return rule.value === '' ? 'بدون گروه' : rule.value;
         case 'select': // فیلد سفارشی Select
              const customSelectDef = fieldDefinitions.value.find(def => def.id === rule.field); // پیدا کردن تعریف با rule.field (که id است)
              if (customSelectDef) {
                 const option = customSelectDef.options?.find(opt =>
                      (typeof opt === 'string' && opt === rule.value) ||
                      (typeof opt === 'object' && opt.value === rule.value)
                 );
                 return option ? (option.label || option.value) : rule.value;
              }
             return String(rule.value); // Fallback
          case 'number':
              return Number(rule.value); // نمایش عدد به صورت عدد
         case 'text':
         case 'textarea':
         default:
             return String(rule.value);
     }
};


const addNewRule = () => {
    console.log('Attempting to add new rule:', newRule.value);
    const rule = newRule.value;
    const fieldDef = selectedNewRuleFieldDefinition.value; // استفاده از selectedNewRuleFieldDefinition

    // 1. اعتبارسنجی پایه
    if (!rule.field || !rule.operator) {
        alert('لطفاً فیلد و عملگر را انتخاب کنید.');
        return;
    }
    const requiresValue = rule.operator !== 'isNull' && rule.operator !== 'isNotNull';
    if (requiresValue && (rule.value === null || rule.value === '')) {
         // اگر مقدار نیاز است و مقدار واقعاً خالی/null/undefined است
         alert('لطفاً مقدار فیلتر را وارد کنید.');
         return;
    }


    // 1b. اعتبارسنجی و تبدیل نوع مقدار برای ذخیره‌سازی
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
                 valueToStore = jalaaliMoment.format('YYYY-MM-DD'); // ذخیره میلادی
                 console.log('Storing Gregorian date for filter rule:', valueToStore);
                break;
            case 'boolean':
                 // مقدار بولین از UI (true/false) می‌آید
                valueToStore = rule.value;
                break;
             case 'select':
             case 'gender':
             case 'group':
                 // مقدار این‌ها از Dropdown می‌آید (رشته یا '' برای گروه)
                 valueToStore = rule.value;
                 break;
            case 'text':
            case 'textarea':
            default:
                valueToStore = String(rule.value);
                break;
        }
    }


     // TODO: چک کنیم که آیا همین قانون دقیقاً قبلاً اضافه شده است؟ (نیاز به تابع کمکی مقایسه قوانین)

    // 2. اضافه کردن قانون معتبر (با مقدار تبدیل شده) به آرایه currentFilterRules
    currentFilterRules.value.push({
         field: rule.field,
         operator: rule.operator,
         value: valueToStore // استفاده از مقدار تبدیل شده
    });
    console.log('Rule added to currentFilterRules:', currentFilterRules.value);

    // 3. ریست کردن فرم newRule
    newRule.value = {
        field: null,
        operator: null,
        value: null
    };

    // 4. (اختیاری) پیام موفقیت
};


const removeRule = (index) => {
     console.log('Attempting to remove rule at index:', index);
     if (index >= 0 && index < currentFilterRules.value.length) {
        currentFilterRules.value.splice(index, 1);
        // پس از حذف، فیلترها را مجدداً اعمال می‌کنیم
        applyFilters();
     } else {
         console.warn('Invalid index for removing rule:', index);
     }
};

const applyFilters = () => {
     console.log('Applying filters:', currentFilterRules.value);
    // اعمال قوانین ذخیره شده در currentFilterRules.value به Store
    contactStore.setFilterRules(currentFilterRules.value);
    console.log('Filters applied to store.');
};

const clearFilters = () => {
    console.log('Clearing all filters');
    currentFilterRules.value = [];
    contactStore.setFilterRules([]); // پاک کردن قوانین فیلتر در Store
    console.log('Filters cleared in store.');
};


// --- Pagination State (کدهای قبلی شما) ---
const currentPage = ref(1);
const itemsPerPage = ref(10); // مثلاً 10 آیتم در هر صفحه
const totalContactsOnCurrentFilter = computed(() => filteredAndSortedContacts.value.length); // استفاده از filteredAndSortedContacts که از StoreToRefs گرفته شده
const totalPages = computed(() => Math.ceil(totalContactsOnCurrentFilter.value / itemsPerPage.value));
const paginatedContacts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAndSortedContacts.value.slice(start, end); // استفاده از filteredAndSortedContacts
});
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' }); // اسکرول به بالا هنگام تغییر صفحه
  }
};
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
     window.scrollTo({ top: 0, behavior: 'smooth' }); // اسکرول به بالا هنگام تغییر صفحه
  }
};
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
     window.scrollTo({ top: 0, behavior: 'smooth' }); // اسکرول به بالا هنگام تغییر صفحه
  }
};
// Watch برای تغییرات در جستجو، مرتب‌سازی یا فیلتر و ریست کردن صفحه فعلی به 1
watch(
  () => [
    contactStore.searchQuery,
    contactStore.sortField,
    contactStore.sortOrder,
    // تغییر تعداد قوانین فیلتر در Store باعث ریست صفحه می‌شود
    // حالا که setFilterRules قوانین currentFilterRules.value را در Store کپی می‌کند،
    // باید به تغییرات خود currentFilterRules.value در UI هم واکنش نشان دهیم
    currentFilterRules.value.length
  ],
  () => {
    currentPage.value = 1;
  }
);

watchEffect(() => {
  // به صورت صریح به وابستگی‌ها دسترسی پیدا میکنیم
  // const contacts = paginatedContacts.value; // الان paginatedContacts اینجا تعریف شده
  // ... بقیه کد watchEffect ...

   // دسترسی به پرچم‌های لودینگ Store ها (مطمئن شو که اینها در Store ها اضافه شدن)
   const contactsLoading = contactStore.loading;
   const customFieldsLoading = customFieldStore.loading;
   const groupsLoading = groupStore.loading;

    const contacts = paginatedContacts.value; // اینجا بهش دسترسی پیدا میکنیم

  console.log('[watchEffect - contactsPreparedForDisplay] شروع محاسبه مجدد...');
  console.log('[watchEffect - contactsPreparedForDisplay] وضعیت لودینگ Store ها: مخاطبین=', contactsLoading, ', فیلدهای سفارشی=', customFieldsLoading, ', گروه‌ها=', groupsLoading);
  console.log('[watchEffect - contactsPreparedForDisplay] تعداد مخاطبین:', contacts ? contacts.length : 0);
  console.log('[watchEffect - contactsPreparedForDisplay] تعداد تعاریف فیلد سفارشی:', customFieldStore.fieldDefinitions ? customFieldStore.fieldDefinitions.length : 0); // از customFieldStore مستقیما استفاده کن

  // اگر در حال لودینگ هستیم یا داده‌های اولیه (مخاطبین و تعاریف فیلد سفارشی) لود نشده‌اند، منتظر می‌مانیم
  if (contactsLoading || customFieldsLoading || groupsLoading || !contacts || customFieldStore.fieldDefinitions.length === 0) { // چک طول فیلد سفارشی
      console.log('[watchEffect - contactsPreparedForDisplay] داده‌ها هنوز در حال بارگذاری هستند یا کامل نیستند. watchEffect منتظر می‌ماند.');
      contactsPreparedForDisplay.value = []; // آرایه نمایش رو خالی نگه دار تا داده‌ها کامل شن
      return; // از watchEffect خارج شو
  }


  console.log('[watchEffect - contactsPreparedForDisplay] تمام وابستگی‌های لازم لود شده‌اند. ادامه آماده‌سازی داده‌ها...');
  // ... بقیه منطق آماده‌سازی داده‌ها (map روی contacts و ساخت displayData) ...

  const preparedData = contacts.map(contact => {
    const displayData = []; // آرایه برای نگهداری داده‌های نمایشی *این مخاطب*

    console.log(`[watchEffect - contactsPreparedForDisplay] >>> شروع پردازش مخاطب با ID: ${contact.id}`);
    if (contact.customFields) {
      console.log(`[watchEffect - contactsPreparedForDisplay]     محتوای اولیه contact.customFields برای مخاطب ${contact.id}:`, JSON.parse(JSON.stringify(contact.customFields)));
    } else {
      console.log(`[watchEffect - contactsPreparedForDisplay]     مخاطب ${contact.id} پراپرتی contact.customFields را ندارد یا null است.`);
    }


    // از settingsStore.displayColumns و customFieldStore.fieldDefinitions مستقیما استفاده کن
    settingsStore.displayColumns.forEach(columnKey => {
      // نام و نام خانوادگی جداگانه نمایش داده می‌شوند
      if (columnKey === 'name' || columnKey === 'lastName') {
        return;
      }

      let label = standardFieldLabels[columnKey] || 'فیلد ناشناس';
      let rawValue = undefined;
      let fieldType = standardFieldTypes[columnKey] || 'text'; // نوع پیش‌فرض
      let currentFieldDefForFormatter = null; // برای پاس دادن options به formatCustomFieldValue

      // ۱. پیدا کردن مقدار خام (rawValue) و نوع دقیق (fieldType)
      if (standardFieldLabels[columnKey]) { // اگر فیلد استاندارد بود
        rawValue = contact[columnKey];
        // مدیریت خاص برای بخش‌های آدرس
        if (columnKey.startsWith('address.')) {
          const addressPartKey = columnKey.split('.')[1];
          if (Array.isArray(contact.addresses) && contact.addresses.length > 0) {
            rawValue = contact.addresses[0][addressPartKey]; // فرض بر اولین آدرس
          } else {
            rawValue = undefined;
          }
        }
         console.log(`[watchEffect - contactsPreparedForDisplay]     فیلد استاندارد: ${columnKey}, مقدار خام:`, rawValue);


      } else if (columnKey.startsWith('customFieldDef_')) { // اگر فیلد سفارشی بود
        const fieldIdString = columnKey.split('_')[1];
        console.log(`[watchEffect - contactsPreparedForDisplay]     پردازش فیلد سفارشی با columnKey: ${columnKey}, استخراج شده fieldIdString: ${fieldIdString}`);


        // اینجا از customFieldStore.fieldDefinitions استفاده می‌کنیم
        // این شرط دیگه با شرط اصلی بالا پوشش داده میشه ولی برای اطمینان میتونه اینجا هم بمونه
        if (!customFieldStore.fieldDefinitions || customFieldStore.fieldDefinitions.length === 0) {
           console.warn(`[watchEffect - contactsPreparedForDisplay] (داخل حلقه) برای ${columnKey}: تعاریف فیلدهای سفارشی (fieldDefinitionsValue) خالی یا لود نشده. از این ستون صرف‌نظر می‌شود.`);
          return; // از ادامه این تکرار forEach صرف‌نظر کن
        }

        const fieldId = Number(fieldIdString);
        if (isNaN(fieldId)) {
          console.warn(`[watchEffect - contactsPreparedForDisplay]     خطا: ID فیلد سفارشی نامعتبر در displayColumns: '${fieldIdString}' برای کلید ${columnKey}.`);
          return;
        }

        const fieldDef = customFieldStore.fieldDefinitions.find(def => def.id === fieldId);
        currentFieldDefForFormatter = fieldDef; // برای استفاده در فرمت‌دهنده

        if (!fieldDef) {
          console.warn(`[watchEffect - contactsPreparedForDisplay]     هشدار: تعریف فیلد سفارشی با ID ${fieldId} (از کلید ${columnKey}) برای نمایش پیدا نشد.`);
          return;
        }

        label = fieldDef.label;
        fieldType = fieldDef.type;

         console.log(`[watchEffect - contactsPreparedForDisplay]     برای مخاطب ID ${contact.id}، جستجو برای فیلد سفارشی ID ${fieldId} ('${label}').`);
        console.log(`[watchEffect - contactsPreparedForDisplay]     محتوای contact.customFields برای این مخاطب:`, contact.customFields ? JSON.parse(JSON.stringify(contact.customFields)) : 'contact.customFields تعریف نشده/null است');


        const customFieldData = contact.customFields ? contact.customFields.find(cf => cf.fieldId === fieldId) : null;
        console.log(`[watchEffect - contactsPreparedForDisplay]     آبجکت customFieldData پیدا شده:`, customFieldData ? JSON.parse(JSON.stringify(customFieldData)) : 'پیدا نشد');


        rawValue = customFieldData ? customFieldData.value : undefined;
         console.log(`[watchEffect - contactsPreparedForDisplay]     مقدار خام (rawValue) برای فیلد '${label}':`, rawValue);


      } else {
        console.warn(`[watchEffect - contactsPreparedForDisplay]     هشدار: کلید ستون ناشناس برای نمایش: ${columnKey}`);
        return;
      }

      let formattedValue = '';
      let shouldDisplay = false;

      // ۲. فرمت‌دهی مقدار و تصمیم برای نمایش
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
          shouldDisplay = true; // گروه همیشه نمایش داده شود اگر انتخاب شده
          break;
        case 'addressPart':
          formattedValue = rawValue != null ? String(rawValue) : '';
          shouldDisplay = formattedValue.trim() !== '';
          break;
        case 'boolean':
          formattedValue = formatCustomFieldValue(rawValue, 'boolean');
          // shouldDisplay باید برای true و false نمایش داده شود
          shouldDisplay = rawValue === true || rawValue === false;
          break;
        case 'number':
          shouldDisplay = typeof rawValue === 'number' && !isNaN(rawValue);
          formattedValue = shouldDisplay ? String(rawValue) : '';
          break;
        case 'select':
          // پاس دادن options از fieldDef مربوط به این فیلد سفارشی
          // اطمینان حاصل کنید که currentFieldDefForFormatter معتبر است قبل از دسترسی به options
          formattedValue = formatCustomFieldValue(rawValue, 'select', currentFieldDefForFormatter?.options);
          // باید نمایش داده شود اگر مقدار اولیه (rawValue) وجود داشته
           shouldDisplay = rawValue !== undefined && rawValue !== null && String(rawValue).trim() !== '';

          break;
        case 'text':
        case 'textarea':
        default:
          formattedValue = rawValue != null ? String(rawValue) : '';
          shouldDisplay = formattedValue.trim() !== '';
          break;
      }

      console.log(`[watchEffect - contactsPreparedForDisplay]     برای فیلد '${label}' (کلید: ${columnKey}, نوع: ${fieldType}): مقدار فرمت‌شده: '${formattedValue}', باید نمایش داده شود: ${shouldDisplay}`);


      // ۳. اگر باید نمایش داده شود، به آرایه displayData اضافه کن
      if (shouldDisplay) {
        displayData.push({
          label: label,
          value: formattedValue,
          key: columnKey, // استفاده از columnKey به عنوان key منحصر به فرد
        });
      }
    }); // پایان forEach برای ستون‌ها

    console.log(`[watchEffect - contactsPreparedForDisplay] <<< پایان پردازش مخاطب ID ${contact.id}. آرایه displayData نهایی برای این مخاطب:`, JSON.parse(JSON.stringify(displayData)));


    return { // آبجکت نهایی برای این آیتم در لیست map شده
      contact: contact,       // خود آبجکت اصلی مخاطب
      displayData: displayData // آرایه داده‌های آماده نمایش برای این مخاطب
    };
  }); // پایان map روی contacts

  // نتیجه نهایی را در متغیر واکنشی ذخیره کنید
  contactsPreparedForDisplay.value = preparedData;
  console.log('[watchEffect - contactsPreparedForDisplay] آماده‌سازی داده‌ها به پایان رسید.');
});

// --- Sorting Options (کدهای قبلی شما) ---
const standardSortableOptions = [
  { value: 'lastName', label: 'نام خانوادگی' },
  { value: 'name', label: 'نام' },
  { value: 'phone', label: 'تلفن اصلی' },
  { value: 'createdAt', label: 'تاریخ ایجاد' },
  { value: 'group', label: 'گروه' },
  { value: 'title', label: 'سمت/تخصص' },
   { value: 'birthDate', label: 'تاریخ تولد' }, // تاریخ تولد هم قابل مرتب‌سازی است
];
const sortOptions = computed(() => {
  const options = [...standardSortableOptions];
  // اضافه کردن فیلدهای سفارشی قابل مرتب‌سازی
  customFieldStore.sortedFieldDefinitions.forEach(field => {
    options.push({
      value: field.id, // استفاده از id فیلد سفارشی برای مرتب‌سازی
      label: `فیلد سفارشی: ${field.label}`
    });
  });
  return options;
});


// --- Contact Actions (کدهای قبلی شما) ---
// از router.push مستقیما استفاده میکنیم بجای تابع wrappers
// const goToContactDetail = (id) => {
//     router.push({ name: 'contact-detail', params: { id } });
// };

const startEditingContact = (contact) => {
  contactStore.setContactToEdit(contact);
  router.push({ name: 'add-contact' });
};

const confirmDeleteContact = async (contactId) => {
  const confirmed = window.confirm('آیا از حذف این مخاطب اطمینان دارید؟');
  if (confirmed) {
    try {
      await contactStore.deleteContact(contactId);
      console.log(`مخاطب با ID ${contactId} حذف شد.`);
    } catch (error) {
      console.error('خطا در حذف مخاطب:', error);
      alert('خطا در حذف مخاطب: ' + (error.message || 'خطای نامشخص در هنگام حذف.'));
    }
  } else {
      console.log('حذف مخاطب توسط کاربر لغو شد.');
  }
};

// --- Lifecycle Hooks ---
// لود کردن اولیه مخاطبین و فیلدهای سفارشی و گروه ها
// این قسمت احتمالا توی App.vue هندل میشه یا در main.js پس اینجا نیازی نیست دوباره لود کنیم
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
    color: #333;
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
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1em;
}

/* استایل دکمه نمایش/پنهان‌سازی فیلتر */
.toggle-filter-button {
  background-color: #f0f0f0;
  color: #333;
  padding: 8px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s ease;
  font-family: inherit;
}

.toggle-filter-button:hover {
  background-color: #e0e0e0;
}

/* **استایل بخش قابل گسترش فیلتر پیشرفته** */
.advanced-filter-section {
    border: 1px solid #eee;
    padding: 15px;
    border-radius: 8px;
    background-color: #f9f9f9;
    margin-bottom: 20px;
}

.advanced-filter-section h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #555;
    border-bottom: 1px dashed #ccc;
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
    border: 1px dashed #ccc;
    border-radius: 4px;
    background-color: #fff;
}

.add-rule-form h4 {
    width: 100%;
    margin: 0 0 10px 0;
    color: #333;
}

/* استایل عمومی برای Input و Select در فرم افزودن قانون */
/* Element Plus components generate their own classes like el-select, el-input, el-date-editor */
.advanced-filter-section .el-select,
.advanced-filter-section .el-input,
.advanced-filter-section .el-date-editor,
 .advanced-filter-section .vpd-input { /* اضافه شد */
    flex-basis: 180px;
    flex-grow: 1;
}

/* استایل دکمه افزودن قانون */
/* .add-rule-form .el-button { }  این بلوک خالی باعث خطا میشد و پاک شد */


/* استایل placeholder وقتی فیلدی انتخاب نشده */
.rule-control-placeholder {
    flex-basis: 180px;
    flex-grow: 1;
    padding: 8px 12px; /* هم اندازه با پدینگ input ها */
    color: #a8a8a8; /* رنگ خاکستری ملایم */
    border: 1px solid #dcdfe6; /* حاشیه پیش‌فرض Element Plus Input */
    border-radius: 4px;
    background-color: #fff;
    font-size: 0.9em;
    line-height: 1.5; /* هم اندازه با lineHeight Input */
}


/* استایل لیست قوانین فیلتر فعال */
.current-rules-list {
    margin-top: 15px;
    padding-top: 15px;
    /*border-top: 1px dashed #ccc;*/ /* از خط جداکننده جداگانه استفاده می‌کنیم */
}

.current-rules-list h4 {
    margin: 0 0 10px 0;
    color: #333;
}

.no-rules-message {
    text-align: center;
    color: #777;
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
    border: 1px solid #eee;
    border-radius: 4px;
    background-color: #fff;
    flex-wrap: wrap;
    justify-content: space-between; /* فاصله بین متن قانون و دکمه حذف */
}

.filter-rule-item p {
     margin: 0;
     flex-grow: 1; /* متن قانون فضای بیشتری بگیرد */
     word-break: break-word;
}

.rule-field-label {
    font-weight: bold;
    color: #007bff;
}

.rule-operator-label {
    font-style: italic;
    color: #555;
}

.rule-value {
    font-weight: bold;
    color: #333;
}

.rule-value-none {
     font-style: italic;
     color: #777;
}


/* استایل کانتینر دکمه‌های اعمال/پاک کردن فیلتر */
.filter-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
    justify-content: flex-end; /* چیدن دکمه‌ها در سمت راست */
}

.filter-section-separator {
    margin: 15px 0;
    border: none;
    border-top: 1px dashed #ccc; /* خط جداکننده نقطه‌چین */
}


/* **استایل خط جداکننده اصلی** */
.separator {
  margin: 20px 0;
  border: none;
  border-top: 1px solid #eee;
}


/* **استایل پیام‌های وضعیت (لودینگ، خطا، عدم نتیجه)** */
.status-message {
    text-align: center;
    padding: 15px;
    margin-bottom: 20px;
    border-radius: 4px;
}

.status-message.loading {
    background-color: #e9f7ef;
    color: #28a745;
    border: 1px solid #d0e9c6;
}

.status-message.error {
    background-color: #f8d7da;
    color: #dc3545;
    border: 1px solid #f5c6cb;
}

.status-message.no-results {
     background-color: #fff3cd;
     color: #856404;
     border: 1px solid #ffeeba;
}


/* **استایل لیست مخاطبین (ul)** */
.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* **استایل هر آیتم مخاطب (li)** */
.contact-item {
    border: 1px solid #ddd;
    padding: 15px 20px;
    margin-bottom: 15px;
    border-radius: 8px;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* کانتینر اطلاعات مخاطب */
.contact-info {
    flex-grow: 1;
    min-width: 0;
}

/* استایل لینک نام مخاطب */
.contact-name-link {
  color: #007bff;
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
  color: #555;
  word-break: break-word;
}

/* استایل عنوان‌های فیلد */
.contact-item p strong {
  color: #333;
  margin-left: 5px;
}

/* استایل بخش‌های اطلاعات اضافی */
.additional-info {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed #eee;
}

.additional-info strong {
    display: block;
    margin-bottom: 5px;
    color: #333;
}

.additional-info ul {
  list-style: disc;
  padding-left: 20px;
  margin-top: 5px;
  margin-bottom: 0;
}

.additional-info ul li {
  font-size: 0.9em;
  color: #555;
  margin-bottom: 3px;
  word-break: break-word;
}

/* استایل برای بخش یادداشت مخاطب */
.contact-notes {
    font-style: italic;
}

/* استایل برای تاریخ‌های ایجاد و ویرایش */
.date-info {
    font-size: 0.8em;
    color: #777;
}

/* کانتینر دکمه‌های ویرایش و حذف */
.contact-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
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
  background-color: #ffc107;
  color: #212529;
}
.edit-button:hover:not(:disabled) {
  background-color: #e0a800;
}

/* استایل مخصوص دکمه حذف */
.delete-button {
  background-color: #dc3545;
  color: white;
}
.delete-button:hover:not(:disabled) {
  background-color: #c82333;
}

/* **استایل کنترل‌های صفحه‌بندی** */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
  flex-wrap: wrap;
  direction: rtl;
}

/* استایل عمومی دکمه‌های صفحه‌بندی */
.pagination-button, .page-number-button {
   padding: 8px 15px;
   border: 1px solid #ccc;
   background-color: #f0f0f0;
   cursor: pointer;
   border-radius: 5px;
   transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
   font-family: inherit;
}

.pagination-button:hover:not(:disabled), .page-number-button:hover:not(:disabled) {
  background-color: #e0e0e0;
  border-color: #b0b0b0;
}

.pagination-button:disabled, .page-number-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* استایل دکمه صفحه فعال */
.page-number-button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.pagination-controls span {
  font-weight: bold;
  margin: 0 5px;
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
      .advanced-filter-section .vpd-input { /* اضافه شد */
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