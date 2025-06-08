// src/store/customFields.js
import { toRaw } from 'vue' // این خط رو اضافه کن
import { defineStore } from 'pinia'
import { db } from '../db/index.js' // نمونه دیتابیس Dexie
import i18n from '../plugins/i18n.js';

export const useCustomFieldStore = defineStore('customFieldStore', {
  // <-- Store ID: 'customFieldStore'
  state: () => ({
    fieldDefinitions: [], // آرایه‌ای برای نگهداری تعاریف فیلدهای سفارشی
    loading: false,
    error: null,
  }),
  getters: {
    // گتری برای مرتب‌سازی فیلدها (مثلاً بر اساس order یا label)
    sortedFieldDefinitions: (state) => {
      const sorted = [...state.fieldDefinitions]
      // فعلاً بر اساس label مرتب می‌کنیم، بعداً می‌تونیم order رو هم اضافه کنیم
      return sorted.sort((a, b) =>
        String(a.label || '').localeCompare(String(b.label || ''), 'fa', { sensitivity: 'base' }),
      )
    },
    // گتری برای پیدا کردن یک فیلد خاص با ID
    getFieldDefinitionById: (state) => (id) => {
      // ID ورودی (که از کلیدهای نمایش مثل 'customFieldDef_1' می‌آید) یک رشته است.
      // ID ذخیره شده در field.id (که از دیتابیس می‌آید) یک عدد است.
      // برای مقایسه صحیح، ID ورودی را به عدد تبدیل می‌کنیم.
      const idAsNumber = Number(id) // <-- اضافه کردن تبدیل به عدد

      // اطمینان از اینکه تبدیل به عدد موفق بوده است
      if (isNaN(idAsNumber)) {
        // این هشدار دیگه نباید ظاهر بشه اگه قبلاً کلیدها رو درست کرده باشیم
        // و فقط برای موارد نامعتبریه که نباید پیش بیان
        console.warn(
          `Invalid ID passed to getFieldDefinitionById: ${id}. Conversion to Number failed.`,
        )
        return undefined // یا null برگردانید بر اساس نیاز
      }

      // حالا تعریف را در آرایه پیدا می‌کنیم جایی که field.id عددی، مساوی با ID عددی تبدیل شده ما باشد.
      return state.fieldDefinitions.find((field) => field.id === idAsNumber) // <-- مقایسه عدد با عدد با ===
    },
  },
  actions: {
    async loadFieldDefinitions() {
      this.loading = true
      this.error = null
      try {
        this.fieldDefinitions = await db.customFieldDefinitions.toArray()
        console.log(
          'تعاریف فیلدهای سفارشی با موفقیت از دیتابیس خوانده شدند:',
          this.fieldDefinitions,
        )
      } catch (err) {
        console.error('خطا در خواندن تعاریف فیلدهای سفارشی:', err)
        this.error = 'امکان بارگذاری تعاریف فیلدهای سفارشی وجود ندارد.'
      } finally {
        this.loading = false
      }
    },

    async addFieldDefinition(fieldData) {
      // fieldData باید شامل label, type, و options (اگر type='select') باشه
      // و همچنین order (اختیاری)
      this.loading = true
      this.error = null
      const trimmedLabel = fieldData.label?.trim()

      if (!trimmedLabel) {
        this.error = 'برچسب فیلد نمی‌تواند خالی باشد.'
        this.loading = false
        return null // یا throw error
      }
      if (!fieldData.type) {
        this.error = 'نوع فیلد باید مشخص شود.'
        this.loading = false
        return null
      }
      if (fieldData.type === 'select' && (!fieldData.options || fieldData.options.length === 0)) {
        this.error = 'برای فیلد از نوع گزینه‌ای، حداقل یک گزینه باید تعریف شود.'
        this.loading = false
        return null
      }

      // چک کردن تکراری نبودن برچسب فیلد
      const existingField = await db.customFieldDefinitions
        .where('label')
        .equalsIgnoreCase(trimmedLabel)
        .first()
      if (existingField) {
        this.error = `فیلدی با برچسب "${trimmedLabel}" از قبل وجود دارد.`
        this.loading = false
        return null
      }

      try {
        const optionsToStore =
          fieldData.type === 'select' ? (fieldData.options ? toRaw(fieldData.options) : []) : []
        console.log('Dexie: Attempting to add customFieldDefinition with:')
        console.log('  label:', trimmedLabel)
        console.log('  type:', fieldData.type)
        console.log(
          '  options:',
          optionsToStore,
          `(Type: ${typeof optionsToStore}, Is Array: ${Array.isArray(optionsToStore)})`,
        )
        if (Array.isArray(optionsToStore)) {
          optionsToStore.forEach((item, index) => {
            console.log(`  Option ${index}:`, item, `(Type: ${typeof item})`)
          })
        }
        console.log('  order:', fieldData.order || 0)

        const newFieldId = await db.customFieldDefinitions.add({
          label: trimmedLabel,
          type: fieldData.type,
          options: optionsToStore, // اینجا از optionsToStore استفاده کن
          order: fieldData.order || 0, // مقدار پیش‌فرض برای order
        })
        console.log('فیلد سفارشی جدید اضافه شد، ID:', newFieldId)
        await this.loadFieldDefinitions() // لیست رو دوباره لود کن
        return newFieldId
      } catch (err) {
        console.error('خطا در افزودن تعریف فیلد سفارشی:', err)
        this.error = 'امکان افزودن تعریف فیلد سفارشی وجود ندارد.'
        return null
      } finally {
        this.loading = false
      }
    },

    async updateFieldDefinition(fieldId, updates) {
      this.loading = true;
      this.error = null;
      const trimmedLabel = updates.label?.trim();

      // ۱. واکشی تعریف فعلی فیلد
      const currentField = await db.customFieldDefinitions.get(fieldId);
      if (!currentField) {
        this.error = i18n.global.t('customFields.validation.fieldNotFound');
        this.loading = false;
        return false;
      }

      // ۲. بررسی تلاش برای تغییر نوع فیلد
      // اگر 'type' در 'updates' وجود دارد و با 'currentField.type' متفاوت است، خطا بده
      if (updates.hasOwnProperty('type') && updates.type !== currentField.type) {
        this.error = i18n.global.t('customFields.validation.typeChangeNotAllowed');
        this.loading = false;
        return false;
      }

      // ۳. بررسی تکراری نبودن برچسب جدید (اگر برچسب تغییر کرده)
      if (trimmedLabel && trimmedLabel !== '' && trimmedLabel !== currentField.label) {
        const existingField = await db.customFieldDefinitions
          .where('label')
          .equalsIgnoreCase(trimmedLabel)
          .first();
        if (existingField && existingField.id !== fieldId) {
          this.error = i18n.global.t('customFields.validation.labelDuplicate');
          this.loading = false;
          return false;
        }
      }

      try {
        const dataToUpdate = {};

        // فقط فیلدهایی که اجازه تغییر دارند و در updates آمده‌اند را به dataToUpdate اضافه کن
        if (updates.hasOwnProperty('label') && trimmedLabel && trimmedLabel !== '') {
          dataToUpdate.label = trimmedLabel;
        } else if (updates.hasOwnProperty('label') && !trimmedLabel) {
            // اگر برچسب خالی ارسال شده، خطا می‌دهیم چون برچسب نمی‌تواند خالی باشد
            this.error = i18n.global.t('customFields.validation.labelRequired');
            this.loading = false;
            return false;
        }


        if (updates.hasOwnProperty('order') && typeof updates.order === 'number') {
          dataToUpdate.order = updates.order;
        }

        // مدیریت options فقط برای فیلدهای نوع select
        if (currentField.type === 'select') {
          if (updates.hasOwnProperty('options')) { // فقط اگر options در آپدیت آمده
            if (!updates.options || updates.options.length === 0) {
              this.error = i18n.global.t('customFields.validation.selectOptionRequired');
              this.loading = false;
              return false;
            }
            dataToUpdate.options = toRaw(updates.options.map(opt => typeof opt === 'string' ? { value: opt, label: opt } : opt));
          }
        } else {
          // برای انواع دیگر، options همیشه باید خالی باشد و قابل تغییر نیست
          // اگر به هر دلیلی options در updates برای نوع غیر select آمده بود، آن را نادیده می‌گیریم یا صراحتا خالی می‌کنیم
           if (dataToUpdate.hasOwnProperty('options')) {
             delete dataToUpdate.options; // یا dataToUpdate.options = [];
           }
        }
        
        // اگر هیچ تغییری برای اعمال وجود ندارد (مثلا فقط type ارسال شده که مجاز نیست)
        // یا هیچ فیلد معتبری در updates نبوده
        if (Object.keys(dataToUpdate).length === 0 && !(updates.hasOwnProperty('label') && updates.label === currentField.label && !trimmedLabel) ) {
           // اگر فقط برچسبی مشابه برچسب فعلی اما با فضای خالی ارسال شده بود، اینجا نباید خطا بدهیم
           // اما اگر هیچ آپدیت معناداری نبود
           // this.error = 'هیچ تغییری برای اعمال مشخص نشده است.'; // یا به سادگی true برگردانیم
           // this.loading = false;
           // return true; // یا false بسته به سیاست
           // فعلا اجازه می‌دهیم که اگر dataToUpdate خالی بود، db.update کاری نکند یا خطا بدهد
        }


        if (Object.keys(dataToUpdate).length > 0) {
            await db.customFieldDefinitions.update(fieldId, dataToUpdate);
            console.log(`تعریف فیلد سفارشی با ID ${fieldId} به‌روزرسانی شد.`, dataToUpdate);
        } else {
            console.log(`هیچ تغییری در فیلد سفارشی با ID ${fieldId} اعمال نشد چون داده‌های ارسالی تغییری ایجاد نمی‌کردند.`);
        }
        
        await this.loadFieldDefinitions();
        // TODO: با توجه به اینکه نوع فیلد قابل تغییر نیست، مشکل اصلی داده‌های ناسازگار حل شده.
        // اما اگر گزینه‌های یک فیلد select تغییر کند (مثلا یک گزینه حذف شود یا برچسبش عوض شود)،
        // مقادیر ذخیره شده در مخاطبین که از آن گزینه (با value قدیمی) استفاده می‌کردند، همچنان آن مقدار را خواهند داشت.
        // این مورد هنوز می‌تواند یک بدهی فنی کوچک باشد، اما شدت آن بسیار کمتر است.
        // برای مدیریت بهتر، می‌توان هنگام تغییر options، مقادیر value گزینه‌ها را ثابت نگه داشت و فقط label را تغییر داد.
        // یا اگر value یک گزینه حذف شد، آنگاه مقادیر مرتبط در مخاطبین را پاک کرد.
        return true;
      } catch (err) {
        console.error('خطا در به‌روزرسانی تعریف فیلد سفارشی:', err);
        this.error = 'امکان به‌روزرسانی تعریف فیلد سفارشی وجود ندارد.';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async deleteFieldDefinition(fieldId) {
      this.loading = true
      this.error = null
      try {
        // اول خود تعریف فیلد رو حذف کن
        await db.customFieldDefinitions.delete(fieldId)
        console.log(`تعریف فیلد سفارشی با ID ${fieldId} حذف شد.`)

        // حالا باید این فیلد رو از تمام مخاطبینی که ازش استفاده می‌کردن هم حذف کنیم
        // این بخش مهمه و باید با دقت انجام بشه
        const allContacts = await db.contacts.toArray()
        const updates = []
        for (const contact of allContacts) {
          if (contact.customFields && contact.customFields.some((cf) => cf.fieldId === fieldId)) {
            const newCustomFields = contact.customFields.filter((cf) => cf.fieldId !== fieldId)
            updates.push(db.contacts.update(contact.id, { customFields: newCustomFields }))
          }
        }
        if (updates.length > 0) {
          await Promise.all(updates)
          console.log(`${updates.length} مخاطب به‌روزرسانی شدند (فیلد سفارشی حذف شده از آن‌ها).`)
          // چون state مخاطبین در contactStore هست، باید اونجا هم یه فکری براش بکنیم
          // فعلاً ساده‌ترین راه اینه که بعد از این عملیات، contactStore.loadContacts() رو صدا بزنیم
          // (البته این کار باید از کامپوننتی که این اکشن رو صدا میزنه انجام بشه یا با event bus)
        }

        await this.loadFieldDefinitions() // لیست تعاریف رو دوباره لود کن
        return true
      } catch (err) {
        console.error('خطا در حذف تعریف فیلد سفارشی:', err)
        this.error = 'امکان حذف تعریف فیلد سفارشی وجود ندارد.'
        return false
      } finally {
        this.loading = false
      }
    },
  },
})
