// src/store/contacts.js

import { defineStore } from 'pinia'
import { db } from '../db'
import moment from 'moment-jalaali' // مطمئن شو که moment-jalaali وارد شده
import { useCustomFieldStore } from './customFields' // مطمئن شو که استور فیلدهای سفارشی وارد شده
import { parseJalaaliStringToGregorianMoment } from '../utils/formatters'

// ** تابع ruleMatches - اصلاح شده برای هندل کردن تاریخ‌های میلادی و رشته خالی برای گروه **
// این تابع یک فیلد مخاطب را با یک قانون فیلتر مقایسه می‌کند
function ruleMatches(fieldValue, operator, ruleValue, fieldType) {
  // console.log(`Checking Rule: Field: ${rule.field} (${fieldType}), Op: ${operator}, Rule Value: ${ruleValue}, Contact Value: ${fieldValue}`); // Debug log (optional)

  // **1. مدیریت مقادیر null/undefined برای fieldValue و هندلینگ خاص برای فیلتر گروه 'بدون گروه' **
  // این بخش قبلا اصلاح شده بود و رشته خالی '' را برای گروه بدون مقدار هندل می‌کند
  if (fieldValue == null) {
    // Covers null and undefined
    if (operator === 'isNull' || operator === 'notExists') return true
    if (operator === 'isNotNull' || operator === 'exists') return false

    // اگر فیلد نوع Select است و مقدار قانون رشته خالی '' (بدون گروه) است
    if (fieldType === 'select' && ruleValue === '') {
      if (operator === 'equals') return true // مخاطب بدون گروه (null/undefined) با قانون 'بدون گروه' مطابقت دارد
      if (operator === 'notEquals') return false // مخاطب بدون گروه با قانون 'بدون گروه' نابرابر نیست (چون برابر است)
      // سایر عملگرها مثل contains, startsWith و ... برای مقدار خالی و فیلد null/undefined مطابقت ندارند
    }

    // برای سایر عملگرها، اگر fieldValue null باشد، معمولاً با یک ruleValue مشخص مطابقت ندارد
    return false
  }

  // اگر fieldValue null نیست، پس قاعدتاً با عملگرهای isNull یا notExists مطابقت ندارد
  if (operator === 'isNull' || operator === 'notExists') return false
  // اگر fieldValue null نیست و عملگر isNotNull یا exists هست، مطابقت دارد
  if (operator === 'isNotNull' || operator === 'exists') return true

  // **2. مقایسه بر اساس نوع فیلد و عملگر **
  switch (fieldType) {
    case 'text':
    case 'textarea': // همانند text
    case 'select': // مقدار انتخاب شده در select رو هم مثل متن مقایسه می‌کنیم، به جز حالت 'بدون گروه'
      const textValue = String(fieldValue).toLowerCase() // مقدار فیلد رو به رشته تبدیل و کوچک می‌کنیم
      const ruleTextValue = String(ruleValue || '').toLowerCase() // مقدار قانون رو به رشته تبدیل و کوچک می‌کنیم (ruleValue='' برای بدون گروه)

      // ** هندل کردن فیلتر گروه "بدون گروه" با مقدار '' وقتی fieldValue null نیست **
      // اگر فیلد گروه است و مقدار قانون رشته خالی است
      if (fieldType === 'select' && ruleValue === '') {
        switch (operator) {
          case 'equals':
            return textValue === '' // مخاطب با گروهی که نامش رشته خالی است (اگر چنین چیزی ممکن باشد)
          case 'notEquals':
            return textValue !== '' // مخاطب با گروهی که نامش رشته خالی نیست
          // سایر عملگرها (contains, startsWith) در این حالت معمولاً معنی ندارند و باید false برگردانند
          default:
            return false // یا شاید true بسته به منطق دقیق مورد نیاز برای سایر عملگرها با مقدار خالی
        }
      }

      // مقایسه متنی استاندارد برای سایر موارد (فیلدهای متنی و selectهای با مقدار غیرخالی)
      switch (operator) {
        case 'equals':
          return textValue === ruleTextValue
        case 'notEquals':
          return textValue !== ruleTextValue
        case 'contains':
          return textValue.includes(ruleTextValue)
        case 'notContains':
          return !textValue.includes(ruleTextValue)
        case 'startsWith':
          return textValue.startsWith(ruleTextValue)
        case 'endsWith':
          return textValue.endsWith(ruleTextValue)
        default:
          console.warn(`Unknown text/select operator: ${operator}. Rule ignored.`)
          return true // قانون ناشناخته باعث حذف مخاطب نمی‌شود
      }

    case 'number': // منطق مقایسه عددی قبلاً درست بود
      const numValue = Number(fieldValue)
      const ruleNumValue = Number(ruleValue)

      if (isNaN(numValue) || isNaN(ruleNumValue)) {
        console.warn(
          `Number comparison with NaN value. Field Value: ${fieldValue}, Rule Value: ${ruleValue}`,
        )
        switch (operator) {
          case 'notEquals':
            return !isNaN(numValue) || !isNaN(ruleNumValue)
          case 'equals':
            return isNaN(numValue) && isNaN(ruleNumValue)
          default:
            return false
        }
      }

      switch (operator) {
        case 'equals':
          return numValue === ruleNumValue
        case 'notEquals':
          return numValue !== ruleNumValue
        case 'greaterThan':
          return numValue > ruleNumValue
        case 'lessThan':
          return numValue < ruleNumValue
        case 'greaterThanOrEqual':
          return numValue >= ruleNumValue
        case 'lessThanOrEqual':
          return numValue <= ruleNumValue
        default:
          console.warn(`Unknown number operator: ${operator}. Rule ignored.`)
          return true
      }

    case 'date': // ** اصلاح منطق مقایسه تاریخ برای ورودی‌های میلادی **
      // fieldValue تاریخ از مخاطب است (انتظار می‌رود میلادی باشد یا Date object)
      // ruleValue تاریخ از قانون فیلتر است (حالا به صورت رشته میلادی 'YYYY-MM-DD' ذخیره می‌شود)

      // ** پارس کردن fieldValue (تاریخ مخاطب) - اول میلادی، اگر نشد شمسی (برای سازگاری با دیتای احتمالی قدیمی) **
      let contactDateMoment = moment(fieldValue)
      // اگر پارس میلادی نامعتبر بود و fieldValue یک رشته بود، سعی می‌کنیم به عنوان رشته شمسی پارس کنیم
      if (!contactDateMoment.isValid() && typeof fieldValue === 'string') {
        const jalaaliFieldMoment = parseJalaaliStringToGregorianMoment(fieldValue) // استفاده از تابع کمکی جدید برای پارس شمسی
        if (jalaaliFieldMoment && jalaaliFieldMoment.isValid()) {
          contactDateMoment = jalaaliFieldMoment // اگر پارس شمسی موفق بود، از آن استفاده می‌کنیم
        }
        // اگر با هیچ روشی معتبر نشد، contactDateMoment نامعتبر باقی می‌ماند
      }

      // ** پارس کردن ruleValue (تاریخ قانون) - که به صورت رشته میلادی استاندارد ذخیره شده **
      const ruleValueMoment = moment(ruleValue, 'YYYY-MM-DD') // حتماً با فرمت میلادی YYYY-MM-DD پارس می‌کنیم

      // ** هندل کردن تاریخ‌های نامعتبر برای مقایسه **
      if (
        !contactDateMoment ||
        !contactDateMoment.isValid() ||
        !ruleValueMoment ||
        !ruleValueMoment.isValid()
      ) {
        // console.warn(`Date comparison with invalid date. Field: ${fieldValue}, Rule: ${ruleValue}`);
        switch (operator) {
          case 'notEquals':
            // اگر فقط یکی معتبر باشد، نابرابرند. اگر هر دو نامعتبر باشند هم نابرابر در نظر می‌گیریم.
            return (contactDateMoment?.isValid() || false) !== (ruleValueMoment?.isValid() || false)
          case 'equals':
            // فقط اگر هر دو معتبر باشند و تاریخشان برابر باشد (مقایسه روز)
            return (
              (contactDateMoment?.isValid() || false) &&
              (ruleValueMoment?.isValid() || false) &&
              contactDateMoment.isSame(ruleValueMoment, 'day')
            )
          default:
            // برای >, < و ... اگر یکی یا هر دو نامعتبر باشند، همیشه false
            return false
        }
      }

      // ** انجام مقایسه بر روی Moment objectهای معتبر (که داخلی میلادی هستند) **
      switch (operator) {
        case 'equals':
          return contactDateMoment.isSame(ruleValueMoment, 'day') // مقایسه فقط روز
        case 'notEquals':
          return !contactDateMoment.isSame(ruleValueMoment, 'day')
        case 'isBefore':
          return contactDateMoment.isBefore(ruleValueMoment, 'day')
        case 'isAfter':
          return contactDateMoment.isAfter(ruleValueMoment, 'day')
        case 'isSameOrBefore':
          return contactDateMoment.isSameOrBefore(ruleValueMoment, 'day')
        case 'isSameOrAfter':
          return contactDateMoment.isSameOrAfter(ruleValueMoment, 'day')
        default:
          console.warn(`Unknown date operator: ${operator}. Rule ignored.`)
          return true // عملگر ناشناخته باعث حذف مخاطب نمی‌شود
      }

    case 'boolean': // منطق مقایسه Boolean قبلاً درست بود
      const ruleBoolValue =
        typeof ruleValue === 'string' ? ruleValue.toLowerCase() === 'true' : Boolean(ruleValue)
      switch (operator) {
        case 'equals':
          return Boolean(fieldValue) === ruleBoolValue
        case 'notEquals':
          return Boolean(fieldValue) !== ruleBoolValue
        case 'isNull':
        case 'isNotNull':
          return false
        default:
          console.warn(`Unknown boolean operator: ${operator}. Rule ignored.`)
          return true
      }

    default:
      console.warn(`Unknown field type for filtering: ${fieldType}. Rule ignored.`)
      return true // نوع فیلد ناشناخته باعث حذف مخاطب نمی‌شود
  }
}

// ... بقیه محتوای فایل Contacts.js (State, Getters, Actions) در اینجا قرار می‌گیرد ...
// مطمئن شوید که تابع ruleMatches قبل از export const useContactStore = defineStore قرار دارد

// export const useContactStore = defineStore('contactStore', { ... });

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
      const customFieldStore = useCustomFieldStore()

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
          const customFieldsMatch = contact.customFields?.some((field) =>
            String(field.value || '')
              .toLowerCase()
              .includes(query),
          )

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
        filtered = filtered.filter((contact) => {
          // یک مخاطب باید با *تمام* قوانین فیلتر پیشرفته (با منطق AND) مطابقت داشته باشد
          // از متد every() روی آرایه قوانین استفاده می‌کنیم
          return state.filterRules.every((rule) => {
            // برای هر قانون، مقدار فیلد مربوطه را در مخاطب پیدا می‌کنیم
            // و نوع فیلد را بر اساس تعریف فیلد (برای سفارشی) یا نام فیلد (برای استاندارد) تعیین می‌کنیم.

            // Skip rules that are somehow invalid or incomplete
            if (!rule || !rule.field || !rule.operator) {
              console.warn('Skipping invalid filter rule:', rule)
              return true // قانون نامعتبر باعث حذف مخاطب نمی‌شود
            }

            let fieldValue = null
            let fieldType = 'text' // نوع پیش‌فرض برای مقایسه/ارزیابی

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
            ]

            const standardFieldDef = standardFieldsConfig.find((f) => f.value === rule.field)

            if (standardFieldDef) {
              fieldValue = contact[rule.field]
              fieldType = standardFieldDef.type
              // اگر نوع خاصی برای فیلد استاندارد لازم است، اینجا override می‌کنیم
              if (['phone', 'notes', 'name', 'lastName', 'title'].includes(rule.field)) {
                fieldType = 'text'
              }
            } else {
              // فرض می‌کنیم field شناسه یک فیلد سفارشی است
              const customFieldId = rule.field
              const fieldDefinition = customFieldStore.getFieldDefinitionById(customFieldId) // تعریف فیلد سفارشی را پیدا می‌کنیم

              if (!fieldDefinition) {
                console.warn(
                  `Filter rule on unknown custom field ID: ${customFieldId}. Skipping rule.`,
                )
                return true // اگر تعریف فیلد پیدا نشد، این قانون باعث حذف مخاطب نمی‌شود
              }
              fieldType = fieldDefinition.type // نوع را از تعریف فیلد می‌گیریم

              // مقدار این فیلد سفارشی را در آرایه customFields آن مخاطب پیدا می‌کنیم
              const contactField = contact.customFields?.find((cf) => cf.fieldId === customFieldId)
              fieldValue = contactField ? contactField.value : null
            }

            // ** حالا، با استفاده از تابع کمکی ruleMatches، مقدار فیلد مخاطب را با مقدار قانون و عملگر مقایسه می‌کنیم **
            // چون تابع ruleMatches را قبل از defineStore تعریف کرده‌ایم، اینجا قابل دسترسی است
            const match = ruleMatches(fieldValue, rule.operator, rule.value, fieldType)

            // برای دیباگ کردن قوانین فیلتر، می‌تونید این خط رو فعال کنید
            // console.log(` Rule: Field: ${rule.field}, Op: ${rule.operator}, Val: ${rule.value}, Contact Value: ${fieldValue}, Type: ${fieldType}, Match: ${match}`);

            return match // نتیجه مقایسه را برمی‌گردانیم
          })
        })
      }

      // --- مرحله 2: مرتب‌سازی ---
      const sorted = [...filtered] // از لیست فیلتر شده یه کپی می‌گیریم تا آرایه اصلی تغییر نکنه

      sorted.sort((a, b) => {
        let valueA, valueB
        let fieldType = 'text' // نوع پیش‌فرض برای مقایسه

        // لیست فیلدهای استاندارد که می‌تونیم بر اساسشون مرتب کنیم
        const standardSortableFields = [
          'name',
          'lastName',
          'phone',
          'title',
          'createdAt',
          'updatedAt',
          'birthDate',
          'gender',
          'group',
        ] // گروه هم اضافه شد
        const isStandardField = standardSortableFields.includes(state.sortField)

        if (isStandardField) {
          // اگر فیلد مورد نظر یک فیلد استاندارد است
          valueA = a[state.sortField]
          valueB = b[state.sortField]

          // تعیین نوع برای فیلدهای استاندارد خاص که نیاز به مقایسه نوعی دارند
          if (['createdAt', 'updatedAt', 'birthDate'].includes(state.sortField)) {
            fieldType = 'date'
          } else if (state.sortField === 'gender' || state.sortField === 'group') {
            fieldType = 'select' // برای مرتب‌سازی group و gender از نوع select/text استفاده می‌کنیم
          }
          // اگر فیلدهای عددی استاندارد دارید، اینجا نوع را مشخص کنید
          // else if (typeof valueA === 'number' || typeof valueB === 'number') { fieldType = 'number'; }
          else {
            fieldType = 'text' // پیش‌فرض برای بیشتر فیلدهای استاندارد متنی
          }
        } else {
          // فرض می‌کنیم فیلد مورد نظر، ID یک فیلد سفارشی است
          const customFieldId = state.sortField
          const fieldDefinition = customFieldStore.getFieldDefinitionById(customFieldId) // تعریف فیلد سفارشی رو پیدا می‌کنیم

          if (!fieldDefinition) {
            // اگر ID فیلد در تعاریف سفارشی پیدا نشد (احتمالا یه باگ یا فیلد نامعتبره)
            console.warn(
              `Sorting by unknown field ID: ${state.sortField}. Defaulting to text compare with empty string.`,
            )
            valueA = '' // مقادیر رو خالی در نظر می‌گیریم تا خطا نده
            valueB = ''
            fieldType = 'text' // مقایسه متنی
          } else {
            fieldType = fieldDefinition.type // نوع فیلد رو از تعریفش می‌گیریم

            // مقادیر این فیلد سفارشی رو برای هر دو مخاطب پیدا می‌کنیم
            const contactAField = a.customFields?.find((cf) => cf.fieldId === customFieldId)
            // اینجا یک باگ کوچک در کد قبلی بود، باید از customFieldId استفاده کنیم
            const contactBField = b.customFields?.find((cf) => cf.fieldId === customFieldId)

            // مقدار value رو استخراج می‌کنیم. اگه فیلد برای این مخاطب وجود نداشت، null در نظر می‌گیریم.
            valueA = contactAField ? contactAField.value : null
            valueB = contactBField ? contactBField.value : null
          }
        }

        let comparison = 0

        // حالا مقادیر valueA و valueB رو بر اساس fieldType مقایسه می‌کنیم
        // مقادیر null/undefined رو در نظر می‌گیریم (مثلاً آخر لیست در مرتب‌سازی صعودی)
        if (valueA == null && valueB == null) comparison = 0
        else if (valueA == null)
          comparison = state.sortOrder === 'asc' ? 1 : -1 // A null, B not null -> A comes after B in asc
        else if (valueB == null)
          comparison = state.sortOrder === 'asc' ? -1 : 1 // B null, A not null -> B comes after A in asc
        else {
          switch (fieldType) {
            case 'date':
              // برای مقایسه تاریخ شمسی از moment-jalaali استفاده می‌کنیم
              // فرض می‌کنیم تاریخ‌ها با فرمت 'jYYYY/M/D' ذخیره شدن
              const dateA = moment(valueA, 'jYYYY/M/D')
              const dateB = moment(valueB, 'jYYYY/M/D')

              // اگر تاریخ‌ها نامعتبر بودن، اون‌ها رو هم در نظر می‌گیریم
              if (!dateA.isValid() && !dateB.isValid()) comparison = 0
              else if (!dateA.isValid())
                comparison = state.sortOrder === 'asc' ? 1 : -1 // تاریخ نامعتبر در انتها
              else if (!dateB.isValid())
                comparison = state.sortOrder === 'asc' ? -1 : 1 // تاریخ نامعتبر در انتها
              else {
                if (dateA.isAfter(dateB)) comparison = 1
                else if (dateA.isBefore(dateB)) comparison = -1
                else comparison = 0 // تاریخ‌ها برابرند
              }
              break
            case 'number':
              // مقایسه عددی
              const numA = Number(valueA)
              const numB = Number(valueB)
              // اگر عدد نبودن، اون‌ها رو هم در نظر می‌گیریم
              if (isNaN(numA) && isNaN(numB)) comparison = 0
              else if (isNaN(numA))
                comparison = state.sortOrder === 'asc' ? 1 : -1 // غیر عدد در انتها
              else if (isNaN(numB))
                comparison = state.sortOrder === 'asc' ? -1 : 1 // غیر عدد در انتها
              else {
                if (numA > numB) comparison = 1
                else if (numA < numB) comparison = -1
                else comparison = 0 // عددها برابرند
              }
              break
            case 'boolean': // فرض می‌کنیم مقادیر true یا false هستند
              // False قبل از True می‌آید
              if (valueA === valueB) comparison = 0
              else if (valueA === false && valueB === true) comparison = -1
              else if (valueA === true && valueB === false) comparison = 1
              // اگر مقادیر null/undefined یا غیر boolean بودند؟
              // منطق null/undefined بالا پوشش داده شد. اگر چیز دیگری بود فعلاً به عنوان مساوی در نظر می‌گیریم.
              else comparison = 0 // Fallback for unexpected boolean values
              break
            case 'select': // مرتب‌سازی بر اساس متن گزینه انتخاب شده
              // مثل متن عادی مقایسه می‌کنیم
              comparison = String(valueA || '').localeCompare(String(valueB || ''), 'fa', {
                sensitivity: 'base',
              })
              break
            case 'textarea': // مثل متن عادی
            case 'text': // مقایسه متنی پیش‌فرض
            default: // برای انواع ناشناخته یا جدید
              comparison = String(valueA || '').localeCompare(String(valueB || ''), 'fa', {
                sensitivity: 'base',
              })
              break
          }
        }

        // اعمال ترتیب صعودی یا نزولی
        return state.sortOrder === 'asc' ? comparison : comparison * -1
      })

      return sorted // لیست فیلتر شده و مرتب شده رو برمی‌گردونیم
    },
  },
  actions: {
    // اکشن برای افزودن یک مخاطب جدید
    async addContact(contactData) {
      this.loading = true // وضعیت لودینگ
      this.error = null // خطا

      try {
        // ** اضافه کردن تاریخ ایجاد و ویرایش قبل از ذخیره **
        const timestamp = moment().toISOString() // گرفتن تاریخ و زمان فعلی با فرمت ISO 8601
        const contactToSave = {
          ...contactData, // کپی کردن داده‌های موجود از فرم (name, lastName, etc.)
          createdAt: timestamp, // تنظیم تاریخ ایجاد
          updatedAt: timestamp, // تنظیم تاریخ اولین ویرایش (لحظه ایجاد)
        }
        console.log('Data to save for new contact:', contactToSave)

        // استفاده از Dexie برای اضافه کردن مخاطب به استور 'contacts'
        const id = await db.contacts.add(contactToSave) // ذخیره کردن مخاطب با تاریخ‌ها
        console.log('مخاطب با موفقیت اضافه شد، ID:', id)

        // بعد از افزودن، لیست مخاطبین رو دوباره لود می‌کنیم تا UI به‌روز بشه
        await this.loadContacts() // لود مجدد همه مخاطبین (برای سادگی فعلاً)
      } catch (error) {
        console.error('خطا در افزودن مخاطب:', error)
        this.error = 'امکان افزودن مخاطب وجود ندارد.'
        throw error // پرتاب خطا
      } finally {
        this.loading = false // پایان لودینگ
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
        throw error // خطا رو دوباره پرتاب می‌کنیم
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
        throw error // خطا رو دوباره پرتاب می‌کنیم
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
      this.loading = true
      this.error = null

      try {
        const timestamp = moment().toISOString()
        const changesToApply = {
          ...changes,
          updatedAt: timestamp, // به‌روزرسانی تاریخ ویرایش
        }

        // به‌روزرسانی در دیتابیس Dexie
        await db.contacts.update(id, changesToApply)
        console.log('مخاطب با موفقیت به‌روزرسانی شد، ID:', id)

        // به‌روزرسانی State در Pinia
        const index = this.contacts.findIndex((contact) => contact.id === id)
        if (index !== -1) {
          Object.assign(this.contacts[index], changesToApply)
        }

        // ** نکته مهم: بعد از به‌روزرسانی موفقیت‌آمیز، وضعیت ویرایش را پاک می‌کنیم **
        // این کار باعث می‌شود که دفعه بعد که به صفحه Add/Edit می‌رویم، فرم برای افزودن مخاطب جدید خالی باشد.
        this.clearContactToEdit() // <-- اینجا اکشن clearContactToEdit را صدا می‌زنیم
      } catch (error) {
        console.error('خطا در به‌روزرسانی مخاطب:', error)
        this.error = 'امکان به‌روزرسانی مخاطب وجود ندارد.'
        throw error // پرتاب مجدد خطا
      } finally {
        this.loading = false
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
      this.filterRules = JSON.parse(JSON.stringify(rules))
      console.log('قوانین فیلتر پیشرفته در Store به‌روزرسانی شد:', this.filterRules)
      // گتر filteredAndSortedContacts به صورت خودکار با تغییر filterRules واکنش نشان می‌دهد و لیست را دوباره فیلتر می‌کند
    },
  },
})
