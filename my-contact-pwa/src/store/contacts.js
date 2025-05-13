import { defineStore } from 'pinia' // Pinia رو وارد می‌کنیم
import { db } from '../db' // نمونه دیتابیس Dexie مون رو وارد می‌کنیم
import moment from 'moment-jalaali';
import { useCustomFieldStore } from './customFields'; // مطمئن شو که این خط هست و کامنت نشده

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
  }),

  // ---------- Getters: برای دسترسی راحت به داده‌های پردازش شده ----------
  getters: {
    // Getter برای دریافت لیست فیلتر شده و مرتب شده مخاطبین
    filteredAndSortedContacts: (state) => {
      // مرحله 1: فیلتر کردن
      let filtered = state.contacts // با لیست کامل شروع می‌کنیم
      const query = state.searchQuery.toLowerCase().trim() // عبارت جستجو رو کوچیک و trim می‌کنیم

      if (query) {
        filtered = state.contacts.filter((contact) => {
          // توی فیلدهای مختلف جستجو می‌کنیم (اسم، نام خانوادگی، تلفن اصلی، سمت، یادداشت)
          // می‌تونیم فیلدهای دیگه و شماره‌های اضافی رو هم اضافه کنیم
          const nameMatch = contact.name?.toLowerCase().includes(query)
          const lastNameMatch = contact.lastName?.toLowerCase().includes(query)
          const phoneMatch = contact.phone?.includes(query) // شماره تلفن رو نیازی نیست حتما lowercase کنیم
          const titleMatch = contact.title?.toLowerCase().includes(query)
          const notesMatch = contact.notes?.toLowerCase().includes(query)

          // جستجو در شماره‌های اضافی (آرایه‌ای از اشیاء {type, number})
          const additionalPhonesMatch = contact.additionalPhones?.some(
            (item) => item.number?.includes(query) || item.type?.toLowerCase().includes(query), // هم شماره و هم نوع رو چک می‌کنیم
          )
          // جستجو در آدرس‌ها (آرایه‌ای از اشیاء {type, street, city, ...})
          const addressesMatch = contact.addresses?.some(
            (item) =>
              item.street?.toLowerCase().includes(query) ||
              item.city?.toLowerCase().includes(query) ||
              item.province?.toLowerCase().includes(query) ||
              item.country?.toLowerCase().includes(query) ||
              item.postalCode?.includes(query) ||
              item.notes?.toLowerCase().includes(query) ||
              item.type?.toLowerCase().includes(query), // نوع آدرس رو هم جستجو می‌کنیم
          )
          const customFieldsMatch = contact.customFields?.some(
            (field) => String(field.value || '').toLowerCase().includes(query) // جستجو در مقدار فیلد سفارشی
          );

          const birthDateMatch = contact.birthDate?.includes(query)

          // اگه حداقل یکی از فیلدها با عبارت جستجو مطابقت داشت، این مخاطب رو توی لیست فیلتر شده نگه دار
          return (
            nameMatch ||
            lastNameMatch ||
            phoneMatch ||
            titleMatch ||
            notesMatch ||
            additionalPhonesMatch ||
            addressesMatch ||
            customFieldsMatch
          )
        })
      }

      // مرحله 2: مرتب‌سازی
      const sorted = [...filtered] // از لیست فیلتر شده یه کپی می‌گیریم تا آرایه اصلی تغییر نکنه
      const customFieldStore = useCustomFieldStore(); // **اینجا به استور فیلدهای سفارشی دسترسی پیدا می‌کنیم**


      sorted.sort((a, b) => {
        let valueA, valueB;
        let fieldType = 'text'; // نوع پیش‌فرض برای مقایسه

        // لیست فیلدهای استاندارد که می‌تونیم بر اساسشون مرتب کنیم
        // باید این لیست رو دقیق کنیم و همه فیلدهای استاندارد قابل مرتب‌سازی رو اینجا بیاریم
        const standardSortableFields = ['name', 'lastName', 'phone', 'title', 'createdAt', 'updatedAt', 'birthDate', 'gender']; // مثال: gender رو هم اضافه کردم

        if (standardSortableFields.includes(state.sortField)) {
          // اگر فیلد مورد نظر یک فیلد استاندارد است
          valueA = a[state.sortField];
          valueB = b[state.sortField];


          // تعیین نوع برای فیلدهای استاندارد خاص که نیاز به مقایسه نوعی دارند
          if (['createdAt', 'updatedAt', 'birthDate'].includes(state.sortField)) {
            fieldType = 'date';
          } else if (typeof valueA === 'number' || typeof valueB === 'number') {
            // اگر حداقل یکی از مقادیر عدد است، نوع را عددی در نظر بگیرید (با احتیاط)
            fieldType = 'number';
          } else {
            fieldType = 'text'; // پیش‌فرض برای بیشتر فیلدهای استاندارد
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
            // customFields آرایه‌ای از اشیاء { fieldId, value } است
            const contactAField = a.customFields?.find(cf => cf.fieldId === customFieldId);
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
        // contactData همون شیء مخاطب هست که می‌خوایم ذخیره کنیم
        this.loading = true // وضعیت لودینگ رو true می‌کنیم
        this.error = null // خطا رو ریست می‌کنیم

        try {
          // از Dexie برای اضافه کردن مخاطب به استور 'contacts' استفاده می‌کنیم
          const id = await db.contacts.add(contactData)
          console.log('مخاطب با موفقیت اضافه شد، ID:', id)
          await this.loadContacts()
        } catch (error) {
          console.error('خطا در افزودن مخاطب:', error)
          this.error = 'امکان افزودن مخاطب وجود ندارد.'
        } finally {
          this.loading = false // وضعیت لودینگ رو false می‌کنیم
        }
      },

      // اکشن برای خواندن همه مخاطبین از دیتابیس (بعداً پیاده‌سازی می‌کنیم)
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
        } finally {
          this.loading = false // وضعیت لودینگ رو false می‌کنیم
        }
        // پیاده‌سازی خواندن اطلاعات از db.contacts و به‌روزرسانی state.contacts
      },
      async deleteContact(contactId) {
        this.loading = true // وضعیت لودینگ رو true می‌کنیم
        this.error = null // خطا رو ریست می‌کنیم

        try {
          // از Dexie برای حذف آیتم با ID مشخص از استور 'contacts' استفاده می‌کنیم
          console.log('Attempting to delete contact with ID:', contactId)
          await db.contacts.delete(contactId)
          console.log('Dexie delete operation finished successfully for ID:', contactId)
          console.log('مخاطب با موفقیت حذف شد، ID:', contactId)

          // حالا state.contacts رو به‌روز می‌کنیم تا آیتم حذف شده دیگه نمایش داده نشه
          // به جای لود کردن دوباره همه مخاطبین، می‌تونیم آیتم حذف شده رو از آرایه فیلتر کنیم
          console.log('Contacts state BEFORE filtering:', this.contacts.slice())
          this.contacts = this.contacts.filter((contact) => contact.id !== contactId)
          console.log('Contacts state AFTER filtering:', this.contacts.slice())
          console.log('Contacts array length after deletion attempt:', this.contacts.length)
        } catch (error) {
          console.error('خطا در حذف مخاطب:', error)
          this.error = 'امکان حذف مخاطب وجود ندارد.'
        } finally {
          this.loading = false // وضعیت لودینگ رو false می‌کنیم
        }
      },
      setContactToEdit(contact) {
        this.contactToEdit = contact
      },

      // اکشن جدید: پاک کردن وضعیت ویرایش (وقتی ویرایش تموم شد یا کنسل شد)
      clearContactToEdit() {
        this.contactToEdit = null
      },

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
            // روش اول: شیء به‌روز شده رو کلا جایگزین کنیم (ممکنه نیاز به merge داشته باشه اگه changes فقط بخشی از فیلدها باشه)
            // یا روش دوم: فیلدهای تغییر کرده رو روی شیء موجود اعمال کنیم
            // روش دوم معمولاً بهتره چون reactivity رو حفظ می‌کنه
            Object.assign(this.contacts[index], changes)

            // روش اول جایگزینی کامل (اگه changes شیء کامل مخاطب به‌روز شده باشه):
            // this.contacts[index] = { ...this.contacts[index], ...changes }; // از اسپرد اپراتور برای merge کردن استفاده می‌کنیم
          }
        } catch (error) {
          console.error('خطا در به‌روزرسانی مخاطب:', error)
          this.error = 'امکان به‌روزرسانی مخاطب وجود ندارد.'
        } finally {
          this.loading = false // وضعیت لودینگ رو false می‌کنیم
        }
      },
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
    },
  });
