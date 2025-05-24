import { defineStore } from 'pinia'
import { db } from '../db'
import { useContactStore } from './contacts' // Store مخاطبین رو وارد می‌کنیم

export const useGroupStore = defineStore('groupStore', {
  state: () => ({
    groups: [],
    loading: false,
    error: null,
  }),
  getters: {
    sortedGroups: (state) => {
      const sorted = [...state.groups]
      // مرتب‌سازی بر اساس اسم فارسی
      sorted.sort((a, b) => {
        return String(a.name || '').localeCompare(String(b.name || ''), 'fa', {
          sensitivity: 'base',
        })
      })
      return sorted
    },
  },

  actions: {
    async loadGroups() {
      this.loading = true
      this.error = null
      try {
        this.groups = await db.groups.toArray()
        console.log('گروه‌ها با موفقیت از دیتابیس خوانده شدند:', this.groups)
      } catch (error) {
        console.error('خطا در خواندن گروه‌ها:', error)
        this.error = 'امکان بارگذاری گروه‌ها وجود ندارد.'
      } finally {
        this.loading = false
      }
    },

    async addGroup(groupName) {
      this.loading = true
      this.error = null
      const trimmedGroupName = groupName.trim()

      // چک کردن خالی نبودن اسم
      if (!trimmedGroupName) {
        this.error = 'نام گروه نمی‌تواند خالی باشد.'
        this.loading = false
        return
      }

      // چک کردن تکراری نبودن اسم گروه قبل از افزودن
      const existingGroup = await db.groups.where('name').equalsIgnoreCase(trimmedGroupName).first()
      if (existingGroup) {
        this.error = `گروهی با نام "${trimmedGroupName}" از قبل وجود دارد.`
        this.loading = false
        return
      }

      try {
        const newGroupId = await db.groups.add({ name: trimmedGroupName })
        console.log('گروه جدید اضافه شد، ID:', newGroupId)
        await this.loadGroups() // لیست گروه‌ها رو دوباره لود کن
      } catch (error) {
        console.error('خطا در افزودن گروه:', error)
        this.error = 'امکان افزودن گروه وجود ندارد.'
      } finally {
        this.loading = false
      }
    },

    async deleteGroup(groupId) {
      this.loading = true
      this.error = null

      const contactStore = useContactStore()

      try {
        // گام 1: پیدا کردن اسم گروه قبل از حذف
        const groupToDelete = this.groups.find((group) => group.id === groupId)
        if (!groupToDelete) {
          this.error = 'گروه مورد نظر برای حذف یافت نشد.'
          this.loading = false
          return
        }
        const groupName = groupToDelete.name

        // گام 2: پیدا کردن و به‌روزرسانی مخاطبین مرتبط
        const contactsInGroup = await db.contacts
          .where('group')
          .equalsIgnoreCase(groupName)
          .toArray() // استفاده از ignoreCase
        console.log(`پیدا شد ${contactsInGroup.length} مخاطب در گروه "${groupName}"`)

        if (contactsInGroup.length > 0) {
          const updates = contactsInGroup.map((contact) => ({
            ...contact,
            group: null, // فیلد گروه رو خالی می‌کنیم
          }))

          await db.transaction('rw', db.contacts, async () => {
            await db.contacts.bulkPut(updates)
            console.log(`${updates.length} مخاطب مرتبط با گروه "${groupName}" به‌روزرسانی شدند.`)
            await contactStore.loadContacts() // لود مجدد لیست مخاطبین برای به‌روزرسانی UI
          })
        } else {
          console.log(`هیچ مخاطبی در گروه "${groupName}" یافت نشد.`)
        }

        // گام 3: حذف خود گروه از دیتابیس
        await db.groups.delete(groupId)
        console.log(`گروه با موفقیت حذف شد، ID: ${groupId}, Name: "${groupName}"`)

        // گام 4: به‌روزرسانی State گروه‌ها
        await this.loadGroups()
      } catch (error) {
        console.error('خطا در حذف گروه:', error)
        this.error = 'امکان حذف گروه وجود ندارد.'
      } finally {
        this.loading = false
      }
    },

    // اکشن جدید: به‌روزرسانی گروه و مخاطبین مرتبط
    async updateGroup(groupId, newName) {
      this.loading = true
      this.error = null
      const trimmedNewName = newName.trim()

      // چک کردن خالی نبودن اسم جدید
      if (!trimmedNewName) {
        this.error = 'نام گروه نمی‌تواند خالی باشد.'
        this.loading = false
        return
      }

      // چک کردن تکراری نبودن اسم جدید (به جز خودش)
      const existingGroupWithNewName = await db.groups
        .where('name')
        .equalsIgnoreCase(trimmedNewName)
        .first()
      if (existingGroupWithNewName && existingGroupWithNewName.id !== groupId) {
        this.error = `گروهی با نام "${trimmedNewName}" از قبل وجود دارد.`
        this.loading = false
        return
      }

      const contactStore = useContactStore()

      try {
        // گام 1: پیدا کردن اسم قدیمی گروه
        const oldGroup = this.groups.find((group) => group.id === groupId)
        if (!oldGroup) {
          this.error = 'گروه مورد نظر برای ویرایش یافت نشد.'
          this.loading = false
          return
        }
        const oldName = oldGroup.name

        // گام 2: به‌روزرسانی اسم گروه در دیتابیس
        await db.groups.update(groupId, { name: trimmedNewName })
        console.log(
          `نام گروه با موفقیت از "${oldName}" به "${trimmedNewName}" تغییر یافت. ID: ${groupId}`,
        )

        // گام 3: پیدا کردن و به‌روزرسانی مخاطبین مرتبط با اسم قدیمی گروه
        // از ignoreCase برای پیدا کردن مخاطبین بر اساس اسم قدیمی استفاده می‌کنیم
        const contactsInOldGroup = await db.contacts
          .where('group')
          .equalsIgnoreCase(oldName)
          .toArray()
        console.log(`پیدا شد ${contactsInOldGroup.length} مخاطب در گروه قدیمی "${oldName}"`)

        if (contactsInOldGroup.length > 0) {
          // به‌روزرسانی فیلد group این مخاطبین به اسم جدید گروه
          const updates = contactsInOldGroup.map((contact) => ({
            ...contact, // کپی بقیه اطلاعات مخاطب
            group: trimmedNewName, // فیلد گروه رو به اسم جدید تغییر می‌دهیم
          }))

          // با استفاده از transaction و bulkPut به صورت اتمیک و سریع به‌روز می‌کنیم
          await db.transaction('rw', db.contacts, async () => {
            await db.contacts.bulkPut(updates)
            console.log(
              `${updates.length} مخاطب مرتبط با گروه "${oldName}" به‌روزرسانی شدند به گروه "${trimmedNewName}".`,
            )

            // همچنین باید State مخاطبین رو هم توی contactStore به‌روز کنیم
            await contactStore.loadContacts() // لود مجدد لیست مخاطبین برای به‌روزرسانی UI
          })
        } else {
          console.log(`هیچ مخاطبی در گروه قدیمی "${oldName}" یافت نشد.`)
        }

        // گام 4: به‌روزرسانی State گروه‌ها
        // ساده‌ترین راه اینه که لیست گروه‌ها رو دوباره از دیتابیس لود کنیم
        await this.loadGroups()
      } catch (error) {
        console.error('خطا در به‌روزرسانی گروه:', error)
        this.error = 'امکان به‌روزرسانی گروه وجود ندارد.'
        // اگه خطا مربوط به تکراری بودن اسم نبود، جزئیات خطا رو هم شاید نشون بدیم
        if (!this.error.includes('از قبل وجود دارد.')) {
          this.error = `امکان به‌روزرسانی گروه وجود ندارد. جزئیات: ${error.message}`
        }
      } finally {
        this.loading = false
      }
    },
  },
})
