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
                   v-else-if="['select', 'boolean'].includes(selectedNewRuleFieldDefinition.type)"
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
                       {{ availableOperators.find(op => op.value === rule.operator)?.label || rule.operator }} </span>
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

    <hr class="separator" /> <div v-if="contactStore.loading" class="status-message loading">در حال بارگذاری مخاطبین...</div>
    <div v-else-if="contactStore.error" class="status-message error">{{ contactStore.error }}</div>
    <div v-else-if="paginatedContacts.length === 0" class="status-message no-results">
       هیچ مخاطبی یافت نشد.
       <span v-if="contactStore.contacts.length > 0 && (contactStore.searchQuery || contactStore.filterRules.length > 0)">
         (با معیارهای جستجو/فیلتر مطابقت ندارد.)
       </span>
    </div>

    <ul v-else class="contact-list">
      <li
        v-for="contact in paginatedContacts"
        :key="contact.id"
        class="contact-item"
      >
        <div class="contact-info">
          <router-link
            :to="{ name: 'contact-detail', params: { id: contact.id } }"
            class="contact-name-link"
          >
            {{ contact.name }} {{ contact.lastName }}
          </router-link>

          <p v-if="contact.phone"><strong>تلفن:</strong> {{ contact.phone }}</p>
          <p v-if="contact.title"><strong>سمت:</strong> {{ contact.title }}</p>
          <p v-if="contact.gender"><strong>جنسیت:</strong> {{ displayGender(contact.gender) }}</p>
          <p v-if="contact.group"><strong>گروه:</strong> {{ contact.group }}</p>
          <p v-if="contact.birthDate"><strong>تاریخ تولد:</strong> {{ formatGregorianDateToShamsi(contact.birthDate) }}</p>
           <p v-if="contact.notes" class="contact-notes"><strong>یادداشت:</strong> {{ contact.notes }}</p>

          <div v-if="contact.additionalPhones && contact.additionalPhones.length > 0" class="additional-info">
            <strong>شماره‌های اضافی:</strong>
            <ul>
              <li v-for="(additionalPhone, index) in contact.additionalPhones" :key="index">
                {{ displayPhoneType(additionalPhone.type) }}: {{ additionalPhone.number }}
              </li>
            </ul>
          </div>

          <div v-if="contact.addresses && contact.addresses.length > 0" class="additional-info">
            <strong>آدرس‌ها:</strong>
            <ul>
              <li v-for="(address, index) in contact.addresses" :key="index">
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

           <p v-if="contact.createdAt" class="date-info"><strong>ایجاد:</strong> {{ formatGregorianDateToShamsi(contact.createdAt) }}</p>
           <p v-if="contact.updatedAt" class="date-info"><strong>ویرایش:</strong> {{ formatGregorianDateToShamsi(contact.updatedAt) }}</p>

           <div v-if="contact.customFields && contact.customFields.length > 0" class="additional-info">
               <strong>فیلدهای سفارشی:</strong>
               <ul>
                   <li v-for="(customField, index) in contact.customFields" :key="index">
                       <span v-if="customFieldStore.getFieldDefinitionById(customField.fieldId)">
                            <strong>{{ customFieldStore.getFieldDefinitionById(customField.fieldId).label }}:</strong>
                            {{ formatCustomFieldValue(customField.value, customFieldStore.getFieldDefinitionById(customField.fieldId).type, customFieldStore.getFieldDefinitionById(customField.fieldId).options) }}
                       </span>
                       <span v-else>
                            <strong>فیلد ناشناس ({{ customField.fieldId }}):</strong>
                            {{ customField.value }} </span>
                   </li>
               </ul>
           </div>
        </div>

        <div class="contact-actions">
          <button
            class="button edit-button"
            @click="startEditingContact(contact)"
            :disabled="contactStore.loading"
          >
            ویرایش
          </button>

          <button
            class="button delete-button"
            @click="confirmDeleteContact(contact.id)"
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

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useContactStore } from '@/store/contacts';
import { useCustomFieldStore } from '@/store/customFields'; // مطمئن شو این هم Import شده
import { useGroupStore } from '@/store/groups';
import { useRouter } from 'vue-router';
// ** این خط Import رو به صورت کامل و صحیح اصلاح کن **
import {
  formatGregorianDateToShamsi,     // برای نمایش تاریخ‌های استاندارد در قالب
  parseJalaaliStringToGregorianMoment, // برای پارس تاریخ شمسی ورودی فیلتر
  formatCustomFieldValue,         // <-- این تابع قبلاً جا افتاده بود، حالا اضافه شد!
  displayGender,                  // برای نمایش جنسیت
  displayPhoneType,               // برای نمایش نوع تلفن
  displayAddressType              // برای نمایش نوع آدرس
} from '@/utils/formatters';
import moment from 'moment-jalaali'; // برای کار با تاریخ
import VuePersianDatetimePicker from 'vue3-persian-datetime-picker'; // کامپوننت تاریخ‌انتخاب‌کن


// Element Plus components are auto-imported


const contactStore = useContactStore();
const customFieldStore = useCustomFieldStore();
const groupStore = useGroupStore();
const router = useRouter();

// **متغیر Reactive برای مدیریت وضعیت نمایش بخش فیلتر پیشرفته**
const isFilterSectionVisible = ref(false);

// **تابع برای Toggle کردن وضعیت نمایش بخش فیلتر**
const toggleFilterSection = () => {
  isFilterSectionVisible.value = !isFilterSectionVisible.value;
};

// **متغیر Reactive برای نگهداری لیست قوانین فیلتر که کاربر در UI اضافه کرده**
// این لیست با قوانین Store فرق دارد، قوانین اینجا قبل از اعمال نهایی به Store هستند.
const currentFilterRules = ref([]);

// **متغیر Reactive برای نگهداری اطلاعات قانون فیلتر در حال ساخت در فرم**
const newRule = ref({
    field: null,
    operator: null,
    value: null
});

// --- Watcher برای newRule.field to reset operator و value وقتی فیلد جدید انتخاب می‌شود ---
watch(
    () => newRule.value.field,
    (newField, oldField) => {
        if (newField !== oldField) {
            newRule.value.operator = null; // ریست کردن عملگر
            newRule.value.value = null; // ریست کردن مقدار
        }
    }
);


// --- Pagination State ---
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalContactsOnCurrentFilter = computed(() => contactStore.filteredAndSortedContacts.length);
const totalPages = computed(() => Math.ceil(totalContactsOnCurrentFilter.value / itemsPerPage.value));
const paginatedContacts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return contactStore.filteredAndSortedContacts.slice(start, end);
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
// Watch برای تغییرات در جستجو، مرتب‌سازی یا فیلتر و ریست کردن صفحه فعلی به 1
watch(
  () => [
    contactStore.searchQuery,
    contactStore.sortField,
    contactStore.sortOrder,
    contactStore.filterRules.length // با تغییر تعداد قوانین فیلتر Store هم ریست می‌شود
  ],
  () => {
    currentPage.value = 1;
  }
);


// --- Sorting Options ---
const standardSortableOptions = [
  { value: 'lastName', label: 'نام خانوادگی' },
  { value: 'name', label: 'نام' },
  { value: 'createdAt', label: 'تاریخ ایجاد' },
  { value: 'group', label: 'گروه' },
  { value: 'title', label: 'سمت/تخصص' },
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


// ** --- Advanced Filter Logic UI --- **

// **Computed property برای لیست فیلدهایی (استاندارد + سفارشی) که می‌توان بر اساس آنها فیلتر کرد**
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

    const customFields = customFieldStore.fieldDefinitions.map(field => ({
        value: field.id,
        label: `فیلد سفارشی: ${field.label}`,
        type: field.type
    }));

    return [...standardFields, ...customFields];
});

// Computed property برای پیدا کردن تعریف (شامل نوع) فیلدی که در حال حاضر در newRule انتخاب شده
const selectedNewRuleFieldDefinition = computed(() => {
    if (!newRule.value.field) return null;
    return filterableFields.value.find(f => f.value === newRule.value.field);
});


// **Computed property برای لیست عملگرهای موجود بر اساس نوع فیلد انتخاب شده**
const availableOperators = computed(() => {
    const type = selectedNewRuleFieldDefinition.value?.type;
    const operators = {
        text: [
            { value: 'equals', label: 'مساوی با' },
            { value: 'notEquals', label: 'مساوی نباشد با' },
            { value: 'contains', label: 'شامل باشد' },
            { value: 'notContains', label: 'شامل نباشد' },
            { value: 'startsWith', label: 'شروع شود با' },
            { value: 'endsWith', label: 'پایان یابد با' },
        ],
        textarea: [ // همانند text
            { value: 'equals', label: 'مساوی با' },
            { value: 'notEquals', label: 'مساوی نباشد با' },
            { value: 'contains', label: 'شامل باشد' },
            { value: 'notContains', label: 'شامل نباشد' },
        ],
        number: [
            { value: 'equals', label: 'مساوی با' },
            { value: 'notEquals', label: 'مساوی نباشد با' },
            { value: 'greaterThan', label: 'بزرگتر از' },
            { value: 'lessThan', label: 'کوچکتر از' },
            { value: 'greaterThanOrEqual', label: 'بزرگتر یا مساوی' },
            { value: 'lessThanOrEqual', label: 'کوچکتر یا مساوی' },
        ],
        date: [
             { value: 'equals', label: 'مساوی با تاریخ' }, // مقایسه فقط روز
             { value: 'notEquals', label: 'مساوی نباشد با تاریخ' },
             { value: 'isBefore', label: 'قبل از تاریخ' },
             { value: 'isAfter', label: 'بعد از تاریخ' },
             { value: 'isSameOrBefore', label: 'مساوی یا قبل از تاریخ' },
             { value: 'isSameOrAfter', label: 'مساوی یا بعد از تاریخ' },
        ],
        boolean: [ // برای چک‌باکس
            { value: 'equals', label: 'مساوی با (بله/خیر)' },
            { value: 'notEquals', label: 'مساوی نباشد با (بله/خیر)' },
        ],
        select: [ // برای Dropdownها / گروه‌ها / جنسیت
            { value: 'equals', label: 'مساوی با' },
            { value: 'notEquals', label: 'مساوی نباشد با' },
        ]
    };

    const commonOperators = [
        { value: 'isNull', label: 'مقدار نداشته باشد' },
        { value: 'isNotNull', label: 'مقدار داشته باشد' },
    ];

    const typeOperators = operators[type] || [];
    return [...typeOperators, ...commonOperators];
});


// ** Computed property برای تولید گزینه‌های Dropdown مقدار فیلتر (برای انواع Select و Boolean) **
const valueSelectOptions = computed(() => {
    const fieldDef = selectedNewRuleFieldDefinition.value;
    if (!fieldDef) return [];

    const options = [];

    if (fieldDef.type === 'select') {
        if (fieldDef.value === 'gender') {
            options.push(
                { label: 'مرد', value: 'male' },
                { label: 'زن', value: 'female' },
                { label: 'دیگر', value: 'other' }
            );
        } else if (fieldDef.value === 'group') {
             groupStore.groups.forEach(group => {
                 options.push({ label: group.name, value: group.name });
             });
             // استفاده از رشته خالی '' به جای null برای حل اخطار Element Plus
             options.unshift({ label: 'بدون گروه', value: '' });
         }
        else if (fieldDef.value.startsWith('customField_')) {
             const customFieldDefinition = customFieldStore.getFieldDefinitionById(fieldDef.value);
             if (customFieldDefinition && customFieldDefinition.options) {
                 customFieldDefinition.options.forEach(opt => {
                      if (typeof opt === 'string') {
                          options.push({ label: opt, value: opt });
                      } else {
                          options.push({ label: opt.label || opt.value, value: opt.value });
                      }
                 });
             }
         }

    } else if (fieldDef.type === 'boolean') {
        options.push(
            { label: 'بله', value: true },
            { label: 'خیر', value: false }
        );
    }

    return options;
});


// ** Helper function برای فرمت دهی مقدار قانون در لیست نمایش قوانین **
const formatRuleValue = (rule) => {
     if (rule.value === null || rule.value === undefined || rule.value === '') return '';

     const fieldDef = filterableFields.value.find(f => f.value === rule.field);
     const type = fieldDef?.type || 'text';

     switch (type) {
         case 'date':
             // ** مقدار ذخیره شده برای تاریخ حالا رشته میلادی 'YYYY-MM-DD' است **
             // از فرمتر جدید که میلادی می‌گیرد و شمسی نمایش می‌دهد استفاده می‌کنیم
             return formatGregorianDateToShamsi(rule.value); // ارسال رشته میلادی ذخیره شده
         case 'boolean':
             return rule.value ? 'بله' : 'خیر';
         case 'select':
              if (rule.field === 'gender') {
                  return displayGender(rule.value);
              } else if (rule.field === 'group') {
                  return rule.value; // نام گروه ذخیره شده نمایش داده می‌شود
              } else { // Select سفارشی
                  const customFieldDef = customFieldStore.getFieldDefinitionById(rule.field);
                   const option = customFieldDef?.options?.find(opt =>
                        (typeof opt === 'string' && opt === rule.value) ||
                        (typeof opt === 'object' && opt.value === rule.value)
                   );
                   return option ? (option.label || option.value) : rule.value;
              }
          case 'number':
              return Number(rule.value);
         case 'text':
         case 'textarea':
         default:
             return String(rule.value);
     }
};


// **متدهای مدیریت قوانین فیلتر**
const addNewRule = () => {
    console.log('Attempting to add new rule:', newRule.value);

    const rule = newRule.value;
    const fieldDef = selectedNewRuleFieldDefinition.value;

    // 1. اعتبارسنجی پایه
    if (!rule.field || !rule.operator) {
        alert('لطفاً فیلد و عملگر را انتخاب کنید.');
        return;
    }

    const requiresValue = rule.operator !== 'isNull' && rule.operator !== 'isNotNull';

    if (requiresValue && (rule.value === null || rule.value === '')) {
         alert('لطفاً مقدار فیلتر را وارد کنید.');
         return;
    }

    // ** 1b. اعتبارسنجی و تبدیل نوع مقدار برای ذخیره‌سازی (میلادی برای تاریخ) **
    let valueToStore = rule.value; // مقدار پیش‌فرض برای ذخیره‌سازی

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
                 // مقدار از Date Picker شمسی یک رشته شمسی است (مثلاً '1404/2/25').
                 // ** باید این رشته شمسی را به Moment object تبدیل کرده و سپس به فرمت میلادی استاندارد ('YYYY-MM-DD') برای ذخیره‌سازی در قانون فیلتر تبدیل کنیم **
                 const jalaaliMoment = parseJalaaliStringToGregorianMoment(rule.value);

                 if (!jalaaliMoment || !jalaaliMoment.isValid()) {
                      alert('تاریخ شمسی انتخاب شده نامعتبر است.');
                      return;
                 }
                 // ** ذخیره کردن تاریخ به فرمت رشته میلادی استاندارد ISO 8601 **
                 valueToStore = jalaaliMoment.format('YYYY-MM-DD');
                 console.log('Storing Gregorian date for filter rule:', valueToStore);


                break;
            case 'boolean':
                valueToStore = Boolean(rule.value);
                break;
             case 'select':
                 valueToStore = rule.value; // مقدار از Dropdown می‌آید (رشته نام گروه یا مقدار گزینه سفارشی)
                 break;
            case 'text':
            case 'textarea':
                valueToStore = String(rule.value);
                break;
        }
    }

     // TODO: چک کنیم که آیا همین قانون دقیقاً قبلاً اضافه شده است؟

    // 2. اضافه کردن قانون معتبر (با مقدار تبدیل شده - میلادی برای تاریخ) به آرایه currentFilterRules
    currentFilterRules.value.push({
         field: rule.field,
         operator: rule.operator,
         value: valueToStore // ذخیره کردن مقدار تبدیل شده (رشته میلادی برای تاریخ)
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
        applyFilters();
     } else {
         console.warn('Invalid index for removing rule:', index);
     }
};

const applyFilters = () => {
     console.log('Applying filters:', currentFilterRules.value);
    contactStore.setFilterRules(currentFilterRules.value);
    console.log('Filters applied to store.');
};

const clearFilters = () => {
    console.log('Clearing all filters');
    currentFilterRules.value = [];
    contactStore.setFilterRules([]);
    console.log('Filters cleared in store.');
};


// --- Contact Actions ---
const goToContactDetail = (id) => {
    router.push({ name: 'contact-detail', params: { id } });
};

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
// Loding logic is in App.vue
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