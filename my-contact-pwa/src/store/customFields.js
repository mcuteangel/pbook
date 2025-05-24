// src/store/customFields.js
import { toRaw } from 'vue' // این خط رو اضافه کن
import { defineStore } from 'pinia'
import { db } from '../db' // نمونه دیتابیس Dexie

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
      // updates شامل label, type, options, order قابل تغییر
      this.loading = true
      this.error = null
      const trimmedLabel = updates.label?.trim()

      if (trimmedLabel && trimmedLabel !== '') {
        // چک کردن تکراری نبودن برچسب جدید (به جز خودش)
        const existingField = await db.customFieldDefinitions
          .where('label')
          .equalsIgnoreCase(trimmedLabel)
          .first()
        if (existingField && existingField.id !== fieldId) {
          this.error = `فیلدی با برچسب "${trimmedLabel}" از قبل وجود دارد.`
          this.loading = false
          return false
        }
      }

      try {
        const dataToUpdate = { ...updates }
        if (trimmedLabel) dataToUpdate.label = trimmedLabel // فقط اگه تغییر کرده و خالی نیست، آپدیت کن
        if (updates.type === 'select') {
          if (!updates.options || updates.options.length === 0) {
            this.error = 'برای فیلد از نوع گزینه‌ای، حداقل یک گزینه باید تعریف شود.'
            this.loading = false
            return false
          }
          dataToUpdate.options = toRaw(updates.options) // اینجا هم toRaw رو اضافه کن
        } else {
          // اگر نوع فیلد دیگر select نیست، options رو پاک کن
          dataToUpdate.options = []
        }

        await db.customFieldDefinitions.update(fieldId, dataToUpdate)
        console.log(`تعریف فیلد سفارشی با ID ${fieldId} به‌روزرسانی شد.`)
        await this.loadFieldDefinitions()
        // TODO: اگر label یا type فیلد تغییر کرد، باید مقادیر ذخیره شده در customFields مخاطبین هم بررسی و احتمالاً آپدیت/پاک بشن. این بخش پیچیده است و فعلاً ازش صرف‌نظر می‌کنیم.
        return true
      } catch (err) {
        console.error('خطا در به‌روزرسانی تعریف فیلد سفارشی:', err)
        this.error = 'امکان به‌روزرسانی تعریف فیلد سفارشی وجود ندارد.'
        return false
      } finally {
        this.loading = false
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
