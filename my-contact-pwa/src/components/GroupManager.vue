<template>
  <div class="group-manager-container">
    <h2>مدیریت گروه‌ها</h2>

    <div v-if="groupStore.loading || contactStore.loading">در حال پردازش...</div>
    <div v-else-if="groupStore.error" style="color: red">{{ groupStore.error }}</div>
    <div v-else-if="contactStore.error" style="color: red">{{ contactStore.error }}</div>

    <ul v-else-if="groupStore.sortedGroups.length > 0" class="group-list">
      <li v-for="group in groupStore.sortedGroups" :key="group.id" class="group-item">
        <div class="group-name-section">
          <input
            v-if="editingGroupId === group.id"
            type="text"
            v-model="editingGroupName"
            @keyup.enter="saveEditedGroup(group.id)"
            @blur="cancelEditing"
            ref="editingInput"
          />
          <span v-else class="group-name">{{ group.name }}</span>
        </div>

        <div class="group-actions">
          <button
            v-if="editingGroupId === group.id"
            class="save-button"
            @click="saveEditedGroup(group.id)"
            :disabled="!editingGroupName.trim()"
          >
            ذخیره
          </button>
          <button v-if="editingGroupId === group.id" class="cancel-button" @click="cancelEditing">
            انصراف
          </button>

          <button
            v-else
            class="edit-button"
            @click="startEditing(group)"
            :disabled="groupStore.loading || contactStore.loading"
          >
            ویرایش
          </button>

          <button
            class="delete-button"
            @click="confirmDeleteGroup(group)"
            :disabled="groupStore.loading || contactStore.loading"
          >
            حذف
          </button>
        </div>
      </li>
    </ul>
    <div v-else>هیچ گروهی یافت نشد.</div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue' // nextTick رو هم import می‌کنیم
import { useGroupStore } from '../store/groups'
// contactStore رو هم برای نشون دادن وضعیت لودینگ و خطا لازم داریم
import { useContactStore } from '../store/contacts'

const groupStore = useGroupStore()
const contactStore = useContactStore() // Store مخاطبین رو وارد می‌کنیم

// متغیرهای واکنشی برای مدیریت حالت ویرایش
const editingGroupId = ref(null) // ID گروهی که در حال ویرایش است (null اگر هیچ گروهی در حال ویرایش نیست)
const editingGroupName = ref('') // اسم جدید گروه که در فیلد ورودی نوشته می‌شود
const editingInput = ref(null) // رفرنس به المنت Input در حالت ویرایش برای فوکوس خودکار

// تابع شروع حالت ویرایش
const startEditing = (group) => {
  editingGroupId.value = group.id // تنظیم ID گروهی که در حال ویرایش است
  editingGroupName.value = group.name // پر کردن فیلد ورودی با اسم فعلی گروه

  // استفاده از nextTick برای فوکوس خودکار روی input بعد از ظاهر شدن در DOM
  nextTick(() => {
    if (Array.isArray(editingInput.value) && editingInput.value.length > 0) {
      // فوکوس روی اولین (و تنها) Input در آرایه
      editingInput.value[0].focus() // <-- اینجا اصلاح کن!
    } else {
      console.warn('Could not find the editing input element to focus.') // یه هشدار برای عیب‌یابی
    }
  })
}

// تابع انصراف از ویرایش
const cancelEditing = () => {
  editingGroupId.value = null // پاک کردن ID گروه در حال ویرایش
  editingGroupName.value = '' // پاک کردن محتوای فیلد ورودی
  groupStore.error = null // پاک کردن خطای مربوط به گروه
}

// تابع ذخیره اسم ویرایش شده گروه
const saveEditedGroup = async (groupId) => {
  const newName = editingGroupName.value.trim() // گرفتن اسم جدید (بدون فاصله اضافی)

  // چک کردن که اسم خالی نباشه
  if (!newName) {
    groupStore.error = 'نام گروه نمی‌تواند خالی باشد.'
    return
  }

  // اگر اسم جدید همون اسم قبلیه، نیازی به به‌روزرسانی نیست، فقط حالت ویرایش رو ببند
  const originalGroup = groupStore.groups.find((g) => g.id === groupId)
  if (originalGroup && originalGroup.name === newName) {
    console.log('Group name is the same, cancelling edit.')
    cancelEditing()
    return
  }

  groupStore.error = null // پاک کردن خطای قبلی

  // صدا زدن اکشن updateGroup در Store (این اکشن رو هنوز ننوشتیم!)
  // این اکشن باید اسم گروه و مخاطبین مرتبط رو به‌روز کنه
  await groupStore.updateGroup(groupId, newName)

  // اگر به‌روزرسانی موفقیت‌آمیز بود (یعنی خطایی در groupStore.error ثبت نشد)
  if (!groupStore.error) {
    alert(`نام گروه با موفقیت به "${newName}" تغییر یافت.`)
    cancelEditing() // بستن حالت ویرایش
  }
  // اگر خطا بود، پیام خطا نمایش داده میشه و حالت ویرایش بسته نمیشه تا کاربر بتونه اصلاح کنه
}

// تابع برای تایید و حذف گروه (همون قبلی)
const confirmDeleteGroup = async (groupToDelete) => {
  const groupName = groupToDelete.name
  if (
    confirm(
      `مطمئنی می‌خوای گروه "${groupName}" رو حذف کنی؟ تمام مخاطبین این گروه به "بدون گروه" منتقل میشن.`,
    )
  ) {
    // اگر در حال ویرایش همین گروه بودیم، انصراف از ویرایش
    if (editingGroupId.value === groupToDelete.id) {
      cancelEditing()
    }
    await groupStore.deleteGroup(groupToDelete.id)
  }
}

// هنگام mount شدن کامپوننت، لیست گروه‌ها رو لود می‌کنیم (اگه از App.vue لود نمیشدن)
// ولی چون توی App.vue موقع شروع برنامه لودشون کردیم، اینجا دیگه لازم نیست
// onMounted(async () => {
//     await groupStore.loadGroups();
// });
</script>

<style scoped>
.group-manager-container {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid var(--color-border-medium); /* تغییر کرد */
  border-radius: 8px;
  background-color: var(--color-background-darker-light); /* تغییر کرد */
  box-shadow: 0 2px 8px var(--color-shadow-light); /* اضافه شد */
}

.group-list {
  list-style: none;
  padding: 0;
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--color-border-light); /* تغییر کرد */
  background-color: var(--color-background-light); /* اضافه شد */
  margin-bottom: 8px; /* اضافه شد */
  border-radius: 4px; /* اضافه شد */
  box-shadow: 0 1px 3px var(--color-shadow-light); /* اضافه شد */
}

.group-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.group-name-section {
  flex-grow: 1;
  display: flex;
  align-items: center;
  padding-left: 10px;
  color: var(--color-text-primary); /* اضافه شد */
}

.group-name {
  font-weight: bold;
}

.group-name-section input[type='text'] {
  flex-grow: 1;
  padding: 5px;
  border: 1px solid var(--color-link-primary); /* تغییر کرد */
  border-radius: 4px;
  font-size: 1em;
  background-color: var(--color-background-light); /* اضافه شد */
  color: var(--color-text-primary); /* اضافه شد */
}

.group-actions {
  display: flex;
  gap: 5px;
}

.group-actions button {
  padding: 5px 10px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  font-size: 0.9em;
  color: var(--color-white); /* رنگ متن دکمه‌ها */
}

/* استایل دکمه حذف */
.delete-button {
  background-color: var(--color-danger-bg); /* تغییر کرد */
  color: var(--color-danger-text); /* تغییر کرد */
}

.delete-button:hover:not(:disabled) {
  background-color: var(--color-danger-hover-bg); /* تغییر کرد */
  color: var(--color-danger-hover-text); /* تغییر کرد */
}

/* استایل دکمه ویرایش */
.edit-button {
  background-color: var(--color-warning-bg); /* تغییر کرد */
  color: var(--color-warning-text); /* تغییر کرد */
}
.edit-button:hover:not(:disabled) {
  background-color: var(--color-warning-hover-bg); /* تغییر کرد */
  color: var(--color-warning-hover-text); /* تغییر کرد */
}

/* استایل دکمه ذخیره */
.save-button {
  background-color: var(--color-success-bg); /* تغییر کرد */
  color: var(--color-success-text); /* تغییر کرد */
}
.save-button:hover:not(:disabled) {
  background-color: var(--color-success-hover-bg); /* تغییر کرد */
  color: var(--color-success-hover-text); /* تغییر کرد */
}

/* استایل دکمه انصراف */
.cancel-button {
  background-color: var(--color-secondary-bg); /* تغییر کرد */
  color: var(--color-secondary-text); /* تغییر کرد */
}
.cancel-button:hover:not(:disabled) {
  background-color: var(--color-secondary-hover-bg); /* تغییر کرد */
  color: var(--color-secondary-hover-text); /* تغییر کرد */
}
</style>
