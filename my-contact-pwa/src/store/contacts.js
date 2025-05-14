// src/store/contacts.js

import { defineStore } from 'pinia';
import { db } from '../db';
import moment from 'moment-jalaali'; // مطمئن شو که moment-jalaali وارد شده
import { useCustomFieldStore } from './customFields'; // مطمئن شو که استور فیلدهای سفارشی وارد شده


// ** تابع کمکی ruleMatches رو قبل از defineStore تعریف می‌کنیم **
// این تابع مقدار یک فیلد مخاطب رو با مقدار قانون فیلتر مقایسه می‌کنه
function ruleMatches(fieldValue, operator, ruleValue, fieldType) {
    // نکته: fieldValue می‌تواند null یا undefined باشد اگر مخاطب مقداری برای آن فیلد نداشته باشد

    // **1. مدیریت مقادیر null/undefined برای fieldValue**
    if (fieldValue == null) { // از == استفاده می‌کنیم تا null و undefined هر دو پوشش داده بشن
        // عملگرهایی که مستقیماً با null یا نبود مقدار کار می‌کنند
        if (operator === 'isNull' || operator === 'notExists') return true; // اگر مقدار null یا undefined است و قانون می‌گوید مقدار نباشد، مطابقت دارد
        if (operator === 'isNotNull' || operator === 'exists') return false; // اگر مقدار null یا undefined است و قانون می‌گوید مقدار باشد، مطابقت ندارد
        // برای سایر عملگرها، اگر fieldValue null باشد، معمولاً با یک ruleValue مشخص مطابقت ندارد
        return false;
    }

     // اگر fieldValue null نیست، پس قاعدتاً با عملگرهای isNull یا notExists مطابقت ندارد
     if (operator === 'isNull' || operator === 'notExists') return false;
     // اگر fieldValue null نیست و عملگر isNotNull یا exists هست، مطابقت دارد
     if (operator === 'isNotNull' || operator === 'exists') return true;


    // **2. مقایسه بر اساس نوع فیلد و عملگر**
    switch (fieldType) {
        case 'text':
        case 'textarea': // فیلدهای متنی و چند خطی رو مثل متن عادی مقایسه می‌کنیم
        case 'select': // مقدار انتخاب شده در select رو هم مثل متن مقایسه می‌کنیم
            // مطمئن میشیم که مقادیر رشته هستند و برای مقایسه‌های بدون حساسیت به حروف بزرگ/کوچک، اون‌ها رو کوچک می‌کنیم
            const textValue = String(fieldValue || '').toLowerCase();
            const ruleTextValue = String(ruleValue || '').toLowerCase();
            switch (operator) {
                case 'equals': return textValue === ruleTextValue;
                case 'notEquals': return textValue !== ruleTextValue;
                case 'contains': return textValue.includes(ruleTextValue); // شامل متن باشد
                case 'notContains': return !textValue.includes(ruleTextValue); // شامل متن نباشد
                case 'startsWith': return textValue.startsWith(ruleTextValue); // با متن شروع شود
                case 'endsWith': return textValue.endsWith(ruleTextValue); // با متن تمام شود
                // می‌تونیم عملگرهای متنی دیگه رو هم اینجا اضافه کنیم
                default:
                    console.warn(`Unknown text operator: ${operator}. Rule ignored.`);
                    return true; // اگر عملگر ناشناخته بود، این قانون فیلتر اعمال نشود (مخاطب شامل فیلتر شود)
            }

        case 'number':
            const numValue = Number(fieldValue); // تبدیل به عدد
            const ruleNumValue = Number(ruleValue);
            // مدیریت حالتی که مقادیر عدد معتبری نیستند (NaN - Not a Number)
            if (isNaN(numValue) || isNaN(ruleNumValue)) {
                 console.warn(`Number comparison with NaN value. Field Value: ${fieldValue}, Rule Value: ${ruleValue}`);
                // رفتار پیش‌فرض برای مقایسه با NaN این است که بیشتر مقایسه‌ها (>, <, ==) false می‌شوند.
                // اگر یکی NaN و دیگری عدد باشد، برابر نیستند. اگر هر دو NaN باشند، با == هم برابر نیستند (در JS).
                // رفتار مد نظر ما چیست؟ مثلاً NaN با عدد برابر نیست.
                 switch(operator) {
                     // اگر یکی عدد معتبر و دیگری نامعتبر باشد، نابرابرند. اگر هر دو نامعتبر باشند، نابرابرند (طبق !== جاوااسکریپت).
                     case 'notEquals': return !isNaN(numValue) || !isNaN(ruleNumValue);
                     // فقط وقتی هر دو NaN باشند برابرند (رفتار دلخواه برای فیلتر 'equals' روی NaN)
                     case 'equals': return isNaN(numValue) && isNaN(ruleNumValue);
                     default: return false; // برای > , <, <=, >= اگر یکی یا هر دو NaN باشند، همیشه false برمی‌گردانیم
                 }
             }

            switch (operator) {
                case 'equals': return numValue === ruleNumValue;
                case 'notEquals': return numValue !== ruleNumValue;
                case 'greaterThan': return numValue > ruleNumValue; // بزرگتر از
                case 'lessThan': return numValue < ruleNumValue; // کوچکتر از
                case 'greaterThanOrEqual': return numValue >= ruleNumValue; // بزرگتر یا مساوی
                case 'lessThanOrEqual': return numValue <= ruleNumValue; // کوچکتر یا مساوی
                // می‌تونیم عملگر 'between' (بین دو عدد) رو هم بعداً اضافه کنیم (نیاز به دو مقدار در ruleValue داره)
                default:
                     console.warn(`Unknown number operator: ${operator}. Rule ignored.`);
                     return true;
            }

        case 'date':
            // فرض می‌کنیم تاریخ‌ها با فرمت 'jYYYY/jM/jD' (شمسی) ذخیره شدن
            const dateValueMoment = moment(fieldValue, 'jYYYY/jM/jD');
            const ruleValueMoment = moment(ruleValue, 'jYYYY/jM/jD');

            // مدیریت تاریخ‌های نامعتبر
             if (!dateValueMoment.isValid() || !ruleValueMoment.isValid()) {
                 console.warn(`Date comparison with invalid date. Field Value: ${fieldValue}, Rule Value: ${ruleValue}`);
                // رفتار برای تاریخ‌های نامعتبر: معمولاً مقایسه‌های زمانی معنی ندارند.
                 switch(operator) {
                     // تاریخ معتبر با نامعتبر برابر نیست
                     case 'notEquals': return dateValueMoment.isValid() !== ruleValueMoment.isValid();
                     // فقط وقتی هر دو معتبر باشند و تاریخشان یکسان باشد (مقایسه فقط روز) برابرند
                     case 'equals': return dateValueMoment.isValid() && ruleValueMoment.isValid() && dateValueMoment.isSame(ruleValueMoment, 'day');
                     default: return false; // برای >, < و ... اگر یکی نامعتبر باشد، false
                 }
             }


            switch (operator) {
                case 'equals': return dateValueMoment.isSame(ruleValueMoment, 'day'); // مقایسه فقط روز (بدون ساعت)
                case 'notEquals': return !dateValueMoment.isSame(ruleValueMoment, 'day');
                case 'isBefore': return dateValueMoment.isBefore(ruleValueMoment, 'day'); // قبل از تاریخ باشد
                case 'isAfter': return dateValueMoment.isAfter(ruleValueMoment, 'day'); // بعد از تاریخ باشد
                case 'isSameOrBefore': return dateValueMoment.isSameOrBefore(ruleValueMoment, 'day'); // قبل یا مساوی باشد
                case 'isSameOrAfter': return dateValueMoment.isSameOrAfter(ruleValueMoment, 'day'); // بعد یا مساوی باشد
                 // می‌تونیم عملگر 'between' (بین دو تاریخ) رو هم بعداً اضافه کنیم
                default:
                    console.warn(`Unknown date operator: ${operator}. Rule ignored.`);
                    return true;
            }

        case 'boolean': // فرض می‌کنیم مقادیر true یا false هستند (برای چک‌باکس)
            // مقدار قانون (ruleValue) هم باید به Boolean تبدیل شود (شاید از UI به صورت رشته 'true'/'false' بیاید)
             const ruleBoolValue = (typeof ruleValue === 'string') ? ruleValue.toLowerCase() === 'true' : Boolean(ruleValue);

            switch (operator) {
                case 'equals': return Boolean(fieldValue) === ruleBoolValue; // مقایسه مقادیر Boolean
                case 'notEquals': return Boolean(fieldValue) !== ruleBoolValue;
                // عملگرهای دیگه مثل >, < برای Boolean معنی ندارند
                 // عملگرهای null/notNull بالا مدیریت شده‌اند
                 return false; // عملگر نامعتبر برای Boolean
                default:
                    console.warn(`Unknown boolean operator: ${operator}. Rule ignored.`);
                    return true;
            }

        default:
            console.warn(`Unknown field type for filtering: ${fieldType}. Rule ignored.`);
            return true; // اگر نوع فیلد ناشناخته بود، این قانون فیلتر اعمال نشود
    }
}


export const useContactStore = defineStore('contactStore', {
  // ---------- State: وضعیت برنامه ----------
  state: () => ({
    contacts: [], // آرایه‌ای برای نگهداری مخاطبینی که از دیتابیس خوندیم
    loading: false, // وضعیت لودینگ اطلاعات
    error: null, // برای نگهداری پیام خطا در صورت بروز مشکل
    contactToEdit: null, // null یعنی هیچ مخاطبی در حال حاضر برای ویرایش انتخاب نشده
    // وضعیت جدید برای جستجو و مرتب‌سازی
    searchQuery: '', // عبارت جستجوی فعلی
    sortField: 'lastName', // فیلدی که بر اساس اون مرتب میشه (پیش‌فرض نام خانوادگی)
    sortOrder: 'asc', // ترتیب مرتب‌سازی ('asc' برای صعودی، 'desc' برای نزولی)
    filterRules: [], // آرایه‌ای برای نگهداری قوانین فیلتر پیشرفته
  }),

  // ---------- Getters: برای دسترسی راحت به داده‌های پردازش شده ----------
  getters: {
    // Getter برای دریافت لیست فیلتر شده (بر اساس جستجو و فیلتر پیشرفته) و مرتب شده مخاطبین
    filteredAndSortedContacts: (state) => {
      // اینجا به استورهای دیگه مثل customFieldStore دسترسی داریم
      const customFieldStore = useCustomFieldStore();

      // --- مرحله 1: فیلتر کردن ---
      let filtered = state.contacts // با لیست کامل شروع می‌کنیم
      const query = state.searchQuery.toLowerCase().trim() // عبارت جستجوی متنی

      // 1a: فیلتر کردن بر اساس جستجوی متنی (منطق قبلی)
      if (query) {
        filtered = filtered.filter((contact) => {
          const nameMatch = contact.name?.toLowerCase().includes(query)
          const lastNameMatch = contact.lastName?.toLowerCase().includes(query)
          const phoneMatch = contact.phone?.includes(query)
          const titleMatch = contact.title?.toLowerCase().includes(query)
          const notesMatch = contact.notes?.toLowerCase().includes(query)

          const additionalPhonesMatch = contact.additionalPhones?.some(
            (item) => item.number?.includes(query) || item.type?.toLowerCase().includes(query),
          )
          const addressesMatch = contact.addresses?.some(
            (item) =>
              item.street?.toLowerCase().includes(query) ||
              item.city?.toLowerCase().includes(query) ||
              item.province?.toLowerCase().includes(query) ||
              item.country?.toLowerCase().includes(query) ||
              item.postalCode?.includes(query) ||
              item.notes?.toLowerCase().includes(query) ||
              item.type?.toLowerCase().includes(query),
          )
          const customFieldsMatch = contact.customFields?.some(
            (field) => String(field.value || '').toLowerCase().includes(query)
          );

          // جستجو در تاریخ تولد (اگر به صورت رشته ذخیره شده)
          const birthDateMatch = contact.birthDate?.includes(query)


          return (
            nameMatch ||
            lastNameMatch ||
            phoneMatch ||
            titleMatch ||
            notesMatch ||
            additionalPhonesMatch ||
            addressesMatch ||
            customFieldsMatch ||
            birthDateMatch
          )
        })
      }

         // ** 1b: فیلتر کردن بر اساس قوانین فیلتر پیشرفته (با استفاده از state.filterRules و تابع ruleMatches) **
      // این فیلتر بعد از فیلتر جستجوی متنی اعمال می‌شود
      if (state.filterRules && state.filterRules.length > 0) {
          filtered = filtered.filter(contact => {
              // یک مخاطب باید با *تمام* قوانین فیلتر پیشرفته (با منطق AND) مطابقت داشته باشد
              // از متد every() روی آرایه قوانین استفاده می‌کنیم
              return state.filterRules.every(rule => {
                  // برای هر قانون، مقدار فیلد مربوطه را در مخاطب پیدا می‌کنیم
                  // و نوع فیلد را بر اساس تعریف فیلد (برای سفارشی) یا نام فیلد (برای استاندارد) تعیین می‌کنیم.

                  // Skip rules that are somehow invalid or incomplete
                  if (!rule || !rule.field || !rule.operator) {
                      console.warn('Skipping invalid filter rule:', rule);
                      return true; // قانون نامعتبر باعث حذف مخاطب نمی‌شود
                  }

                  let fieldValue = null;
                  let fieldType = 'text'; // نوع پیش‌فرض برای مقایسه/ارزیابی

                  // تعیین اینکه قانون روی فیلد استاندارد است یا سفارشی
                   const standardFieldsConfig = [
                        { value: 'name', type: 'text' },
                        { value: 'lastName', type: 'text' },
                        { value: 'phone', type: 'text' },
                        { value: 'title', type: 'text' },
                        { value: 'notes', type: 'textarea' },
                        { value: 'createdAt', type: 'date' },
                        { value: 'updatedAt', type: 'date' },
                        { value: 'birthDate', type: 'date' },
                        { value: 'gender', type: 'select' },
                        { value: 'group', type: 'select' },
                    ];

                  const standardFieldDef = standardFieldsConfig.find(f => f.value === rule.field);


                  if (standardFieldDef) {
                      fieldValue = contact[rule.field];
                      fieldType = standardFieldDef.type;
                       // اگر نوع خاصی برای فیلد استاندارد لازم است، اینجا override می‌کنیم
                       if (['phone', 'notes', 'name', 'lastName', 'title'].includes(rule.field)) {
                            fieldType = 'text';
                        }


                  } else {
                      // فرض می‌کنیم field شناسه یک فیلد سفارشی است
                      const customFieldId = rule.field;
                      const fieldDefinition = customFieldStore.getFieldDefinitionById(customFieldId); // تعریف فیلد سفارشی را پیدا می‌کنیم

                      if (!fieldDefinition) {
                          console.warn(`Filter rule on unknown custom field ID: ${customFieldId}. Skipping rule.`);
                          return true; // اگر تعریف فیلد پیدا نشد، این قانون باعث حذف مخاطب نمی‌شود
                      }
                      fieldType = fieldDefinition.type; // نوع را از تعریف فیلد می‌گیریم

                      // مقدار این فیلد سفارشی را در آرایه customFields آن مخاطب پیدا می‌کنیم
                      const contactField = contact.customFields?.find(cf => cf.fieldId === customFieldId);
                      fieldValue = contactField ? contactField.value : null;
                  }

                  // ** حالا، با استفاده از تابع کمکی ruleMatches، مقدار فیلد مخاطب را با مقدار قانون و عملگر مقایسه می‌کنیم **
                   // چون تابع ruleMatches را قبل از defineStore تعریف کرده‌ایم، اینجا قابل دسترسی است
                   const match = ruleMatches(fieldValue, rule.operator, rule.value, fieldType);

                   // برای دیباگ کردن قوانین فیلتر، می‌تونید این خط رو فعال کنید
                   // console.log(` Rule: Field: ${rule.field}, Op: ${rule.operator}, Val: ${rule.value}, Contact Value: ${fieldValue}, Type: ${fieldType}, Match: ${match}`);

                   return match; // نتیجه مقایسه را برمی‌گردانیم
              });
          });
      }

      // --- مرحله 2: مرتب‌سازی ---
      const sorted = [...filtered] // از لیست فیلتر شده یه کپی می‌گیریم تا آرایه اصلی تغییر نکنه


      sorted.sort((a, b) => {
        let valueA, valueB;
        let fieldType = 'text'; // نوع پیش‌فرض برای مقایسه

        // لیست فیلدهای استاندارد که می‌تونیم بر اساسشون مرتب کنیم
        const standardSortableFields = ['name', 'lastName', 'phone', 'title', 'createdAt', 'updatedAt', 'birthDate', 'gender', 'group']; // گروه هم اضافه شد
        const isStandardField = standardSortableFields.includes(state.sortField);

        if (isStandardField) {
          // اگر فیلد مورد نظر یک فیلد استاندارد است
          valueA = a[state.sortField];
          valueB = b[state.sortField];

          // تعیین نوع برای فیلدهای استاندارد خاص که نیاز به مقایسه نوعی دارند
          if (['createdAt', 'updatedAt', 'birthDate'].includes(state.sortField)) {
            fieldType = 'date';
          } else if (state.sortField === 'gender' || state.sortField === 'group') {
               fieldType = 'select'; // برای مرتب‌سازی group و gender از نوع select/text استفاده می‌کنیم
          }
           // اگر فیلدهای عددی استاندارد دارید، اینجا نوع را مشخص کنید
          // else if (typeof valueA === 'number' || typeof valueB === 'number') { fieldType = 'number'; }
           else {
            fieldType = 'text'; // پیش‌فرض برای بیشتر فیلدهای استاندارد متنی
          }


        } else {
          // فرض می‌کنیم فیلد مورد نظر، ID یک فیلد سفارشی است
          const customFieldId = state.sortField;
          const fieldDefinition = customFieldStore.getFieldDefinitionById(customFieldId); // تعریف فیلد سفارشی رو پیدا می‌کنیم


          if (!fieldDefinition) {
            // اگر ID فیلد در تعاریف سفارشی پیدا نشد (احتمالا یه باگ یا فیلد نامعتبره)
            console.warn(`Sorting by unknown field ID: ${state.sortField}. Defaulting to text compare with empty string.`);
            valueA = ''; // مقادیر رو خالی در نظر می‌گیریم تا خطا نده
            valueB = '';
            fieldType = 'text'; // مقایسه متنی
          } else {
            fieldType = fieldDefinition.type; // نوع فیلد رو از تعریفش می‌گیریم


            // مقادیر این فیلد سفارشی رو برای هر دو مخاطب پیدا می‌کنیم
            const contactAField = a.customFields?.find(cf => cf.fieldId === customFieldId);
            // اینجا یک باگ کوچک در کد قبلی بود، باید از customFieldId استفاده کنیم
            const contactBField = b.customFields?.find(cf => cf.fieldId === customFieldId);


            // مقدار value رو استخراج می‌کنیم. اگه فیلد برای این مخاطب وجود نداشت، null در نظر می‌گیریم.
            valueA = contactAField ? contactAField.value : null;
            valueB = contactBField ? contactBField.value : null;
          }
        }


        let comparison = 0;


        // حالا مقادیر valueA و valueB رو بر اساس fieldType مقایسه می‌کنیم
        // مقادیر null/undefined رو در نظر می‌گیریم (مثلاً آخر لیست در مرتب‌سازی صعودی)
        if (valueA == null && valueB == null) comparison = 0;
        else if (valueA == null) comparison = state.sortOrder === 'asc' ? 1 : -1; // A null, B not null -> A comes after B in asc
        else if (valueB == null) comparison = state.sortOrder === 'asc' ? -1 : 1; // B null, A not null -> B comes after A in asc
        else {
          switch (fieldType) {
            case 'date':
              // برای مقایسه تاریخ شمسی از moment-jalaali استفاده می‌کنیم
              // فرض می‌کنیم تاریخ‌ها با فرمت 'jYYYY/jM/jD' ذخیره شدن
              const dateA = moment(valueA, 'jYYYY/jM/jD');
              const dateB = moment(valueB, 'jYYYY/jM/jD');


              // اگر تاریخ‌ها نامعتبر بودن، اون‌ها رو هم در نظر می‌گیریم
              if (!dateA.isValid() && !dateB.isValid()) comparison = 0;
              else if (!dateA.isValid()) comparison = state.sortOrder === 'asc' ? 1 : -1; // تاریخ نامعتبر در انتها
              else if (!dateB.isValid()) comparison = state.sortOrder === 'asc' ? -1 : 1; // تاریخ نامعتبر در انتها
              else {
                if (dateA.isAfter(dateB)) comparison = 1;
                else if (dateA.isBefore(dateB)) comparison = -1;
                else comparison = 0; // تاریخ‌ها برابرند
              }
              break;
            case 'number':
              // مقایسه عددی
              const numA = Number(valueA);
              const numB = Number(valueB);
              // اگر عدد نبودن، اون‌ها رو هم در نظر می‌گیریم
              if (isNaN(numA) && isNaN(numB)) comparison = 0;
              else if (isNaN(numA)) comparison = state.sortOrder === 'asc' ? 1 : -1; // غیر عدد در انتها
              else if (isNaN(numB)) comparison = state.sortOrder === 'asc' ? -1 : 1; // غیر عدد در انتها
              else {
                if (numA > numB) comparison = 1;
                else if (numA < numB) comparison = -1;
                else comparison = 0; // عددها برابرند
              }
              break;
            case 'boolean': // فرض می‌کنیم مقادیر true یا false هستند
              // False قبل از True می‌آید
              if (valueA === valueB) comparison = 0;
              else if (valueA === false && valueB === true) comparison = -1;
              else if (valueA === true && valueB === false) comparison = 1;
              // اگر مقادیر null/undefined یا غیر boolean بودند؟
              // منطق null/undefined بالا پوشش داده شد. اگر چیز دیگری بود فعلاً به عنوان مساوی در نظر می‌گیریم.
              else comparison = 0; // Fallback for unexpected boolean values
              break;
            case 'select': // مرتب‌سازی بر اساس متن گزینه انتخاب شده
              // مثل متن عادی مقایسه می‌کنیم
              comparison = String(valueA || '').localeCompare(String(valueB || ''), 'fa', { sensitivity: 'base' });
              break;
            case 'textarea': // مثل متن عادی
            case 'text': // مقایسه متنی پیش‌فرض
            default: // برای انواع ناشناخته یا جدید
              comparison = String(valueA || '').localeCompare(String(valueB || ''), 'fa', { sensitivity: 'base' });
              break;
          }
        }


        // اعمال ترتیب صعودی یا نزولی
        return state.sortOrder === 'asc' ? comparison : comparison * -1;
      });


        return sorted; // لیست فیلتر شده و مرتب شده رو برمی‌گردونیم
      }
    },
    actions: {
      // اکشن برای افزودن یک مخاطب جدید
      async addContact(contactData) {
        this.loading = true // وضعیت لودینگ رو true می‌کنیم
        this.error = null // خطا رو ریست می‌کنیم

        try {
          // از Dexie برای اضافه کردن مخاطب به استور 'contacts' استفاده می‌کنیم
          const id = await db.contacts.add(contactData)
          console.log('مخاطب با موفقیت اضافه شد، ID:', id)
          // بعد از افزودن، لیست مخاطبین رو دوباره لود می‌کنیم تا UI به‌روز بشه
          await this.loadContacts()
        } catch (error) {
          console.error('خطا در افزودن مخاطب:', error)
          this.error = 'امکان افزودن مخاطب وجود ندارد.'
           throw error; // خطا رو دوباره پرتاب می‌کنیم تا کامپوننت بتونه Catch کنه و پیام مناسب نشون بده
        } finally {
          this.loading = false // وضعیت لودینگ رو false می‌کنیم
        }
      },

      // اکشن برای خواندن همه مخاطبین از دیتابیس
      async loadContacts() {
        this.loading = true // وضعیت لودینگ رو true می‌کنیم
        this.error = null // خطا رو ریست می‌کنیم
        try {
          // از Dexie برای خواندن همه آیتم‌ها از استور 'contacts' استفاده می‌کنیم
          const allContacts = await db.contacts.toArray()
          console.log('مخاطبین با موفقیت از دیتابیس خوانده شدند:', allContacts)
          // اطلاعات خوانده شده رو توی State ذخیره می‌کنیم
          this.contacts = allContacts
        } catch (error) {
          console.error('خطا در خواندن مخاطبین:', error)
          this.error = 'امکان خواندن مخاطبین وجود ندارد.'
           throw error; // خطا رو دوباره پرتاب می‌کنیم
        } finally {
          this.loading = false // وضعیت لودینگ رو false می‌کنیم
        }
      },

      // اکشن برای حذف یک مخاطب
      async deleteContact(contactId) {
        this.loading = true // وضعیت لودینگ رو true می‌کنیم
        this.error = null // خطا رو ریست می‌کنیم

        try {
          // از Dexie برای حذف آیتم با ID مشخص از استور 'contacts' استفاده می‌کنیم
          console.log('Attempting to delete contact with ID:', contactId)
          await db.contacts.delete(contactId)
          console.log('مخاطب با موفقیت حذف شد، ID:', contactId)

          // حالا state.contacts رو به‌روز می‌کنیم تا آیتم حذف شده دیگه نمایش داده نشه
          // به جای لود کردن دوباره همه مخاطبین (که ممکنه کند باشه)، می‌تونیم آیتم حذف شده رو از آرایه State فیلتر کنیم
          this.contacts = this.contacts.filter((contact) => contact.id !== contactId)
        } catch (error) {
          console.error('خطا در حذف مخاطب:', error)
          this.error = 'امکان حذف مخاطب وجود ندارد.'
           throw error; // خطا رو دوباره پرتاب می‌کنیم
        } finally {
          this.loading = false // وضعیت لودینگ رو false می‌کنیم
        }
      },

      // اکشن برای تنظیم مخاطب در حال ویرایش
      setContactToEdit(contact) {
        this.contactToEdit = contact
      },

      // اکشن جدید: پاک کردن وضعیت ویرایش (وقتی ویرایش تموم شد یا کنسل شد)
      clearContactToEdit() {
        this.contactToEdit = null
      },

      // اکشن برای به‌روزرسانی یک مخاطب موجود
      async updateContact(id, changes) {
        this.loading = true // وضعیت لودینگ رو true می‌کنیم
        this.error = null // خطا رو ریست می‌کنیم

        try {
          // از Dexie برای به‌روزرسانی آیتم با ID مشخص در استور 'contacts' استفاده می‌کنیم
          // changes همون شیءی هست که فیلدهای به‌روز شده رو داره
          await db.contacts.update(id, changes)
          console.log('مخاطب با موفقیت به‌روزرسانی شد، ID:', id)

          // حالا state.contacts رو به‌روز می‌کنیم تا تغییرات توی لیست نمایش داده بشه
          // بهترین راه اینه که آیتم به‌روز شده رو توی آرایه پیدا کنیم و خودش رو یا فیلدهاش رو به‌روز کنیم
          const index = this.contacts.findIndex((contact) => contact.id === id)
          if (index !== -1) {
            // از Object.assign استفاده می‌کنیم تا تغییرات (changes) رو روی شیء موجود توی آرایه State اعمال کنیم
            // این کار reactivity رو حفظ می‌کنه و Vue متوجه تغییر میشه
            Object.assign(this.contacts[index], changes)
          }
        } catch (error) {
          console.error('خطا در به‌روزرسانی مخاطب:', error)
          this.error = 'امکان به‌روزرسانی مخاطب وجود ندارد.'
           throw error; // خطا رو دوباره پرتاب می‌کنیم
        } finally {
          this.loading = false // وضعیت لودینگ رو false می‌کنیم
        }
      },

      // اکشن برای به‌روزرسانی عبارت جستجو
      setSearchQuery(query) {
        this.searchQuery = query
        // نیازی به loadContacts دوباره نیست، چون getter خودش reactive هست و با تغییر searchQuery به‌روز میشه
      },

      // اکشن جدید: به‌روزرسانی معیار مرتب‌سازی
      setSortCriteria(field, order) {
        this.sortField = field
        this.sortOrder = order
        // نیازی به loadContacts دوباره نیست، چون getter خودش reactive هست و با تغییر sortField یا sortOrder به‌روز میشه
      },

       // اکشن جدید: به‌روزرسانی قوانین فیلتر پیشرفته
       setFilterRules(rules) {
        // rules باید آرایه‌ای از قوانین فیلتر باشد که از UI دریافت می‌شود
        // برای اطمینان از اینکه Store یک کپی مستقل از آرایه قوانین UI داشته باشد
        // و تغییرات بعدی در UI روی قوانین Store تاثیر نگذارند، یک Deep Copy انجام می‌دهیم.
        this.filterRules = JSON.parse(JSON.stringify(rules));
        console.log('قوانین فیلتر پیشرفته در Store به‌روزرسانی شد:', this.filterRules);
        // گتر filteredAndSortedContacts به صورت خودکار با تغییر filterRules واکنش نشان می‌دهد و لیست را دوباره فیلتر می‌کند
    },

    },
});