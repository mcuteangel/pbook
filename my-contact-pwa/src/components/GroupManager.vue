<template>
  <div class="group-manager-container">
    <h2>{{ $t('groupManager.title') }}</h2>

    <!-- قسمت اضافه کردن گروه جدید -->
    <div class="group-add-section">
      <button @click="showAddGroupDialog = true" class="add-group-button">
        <i class="fas fa-plus"></i> {{ $t('groupManager.addNewGroup') }}
      </button>
    </div>

    <!-- دیالوگ اضافه کردن گروه -->
    <teleport to="body">
      <div v-if="showAddGroupDialog" class="dialog-overlay">
        <div class="dialog-box">
          <h3>{{ $t('groupManager.addNewGroupDialogTitle') }}</h3>
          <div class="form-group">
            <label for="newGroupName">{{ $t('groupManager.groupName') }}:</label>
            <input
              type="text"
              id="newGroupName"
              v-model="newGroupName"
              :placeholder="$t('groupManager.groupNamePlaceholder')"
              required
            />
          </div>
          <div class="form-group">
            <label for="parentGroup">{{ $t('groupManager.parentGroup') }}:</label>
            <select
              id="parentGroup"
              v-model="newGroupParent"
            >
              <option value="">{{ $t('groupManager.noParent') }}</option>
              <option
                v-for="group in groupStore.sortedGroups"
                :key="group.id"
                :value="group.id"
              >
                {{ group.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="groupColor">{{ $t('groupManager.groupColor') }}:</label>
            <input
              type="color"
              id="groupColor"
              v-model="newGroupColor"
            />
          </div>
          <div class="dialog-actions">
            <button @click="addNewGroup">{{ $t('form.save') }}</button>
            <button @click="showAddGroupDialog = false">{{ $t('form.cancel') }}</button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- لیست گروه‌ها -->
    <div v-if="groupStore.loading || contactStore.loading" class="loading-message">
      <i class="fas fa-spinner fa-spin"></i> {{ $t('customFieldManager.loading') }}
    </div>
    <div v-else-if="groupStore.error || contactStore.error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ groupStore.error || contactStore.error }}
    </div>
    <div v-else>
      <div v-if="groupStore.sortedGroups.length > 0" class="groups-container">
        <div class="group-tree">
          <div v-for="group in getTopLevelGroups" :key="group.id" class="group-node">
            <div class="group-header" @click="toggleGroup(group.id)">
              <i class="fas" :class="group.expanded ? 'fa-minus-square' : 'fa-plus-square'" v-if="hasChildren(group)"></i>
              <div class="group-name-section">
                <input
                  v-if="editingGroupId === group.id"
                  type="text"
                  v-model="editingGroupName"
                  @keyup.enter="saveEditedGroup(group.id)"
                  @blur="cancelEditing"
                  ref="editingInput"
                  :style="{ color: group.color }"
                  class="group-edit-input"
                />
                <span v-else class="group-name" :style="{ color: group.color }">
                  {{ group.name }}
                </span>
              </div>
              <div class="group-actions">
                <button
                  v-if="editingGroupId === group.id"
                  class="save-button"
                  @click="saveEditedGroup(group.id)"
                  :disabled="!editingGroupName.trim()"
                >
                  <i class="fas fa-save"></i> {{ $t('form.save') }}
                </button>
                <button v-if="editingGroupId === group.id" class="cancel-button" @click="cancelEditing">
                  <i class="fas fa-times"></i> {{ $t('form.cancel') }}
                </button>
                <button
                  v-else
                  class="edit-button"
                  @click="startEditing(group)"
                  :disabled="groupStore.loading || contactStore.loading"
                >
                  <i class="fas fa-edit"></i> {{ $t('shared.contactListItem.edit') }}
                </button>
                <button
                  class="delete-button"
                  @click="confirmDeleteGroup(group)"
                  :disabled="groupStore.loading || contactStore.loading"
                >
                  <i class="fas fa-trash"></i> {{ $t('shared.contactListItem.delete') }}
                </button>
              </div>
            </div>
            <div v-if="group.expanded" class="group-children">
              <div v-for="child in getChildren(group.id)" :key="child.id" class="group-node">
                <div class="group-header">
                  <div class="group-name-section">
                    <input
                      v-if="editingGroupId === child.id"
                      type="text"
                      v-model="editingGroupName"
                      @keyup.enter="saveEditedGroup(child.id)"
                      @blur="cancelEditing"
                      ref="editingInput"
                      :style="{ color: child.color }"
                      class="group-edit-input"
                    />
                    <span v-else class="group-name" :style="{ color: child.color }">
                      {{ child.name }}
                    </span>
                  </div>
                  <div class="group-actions">
                    <button
                      v-if="editingGroupId === child.id"
                      class="save-button"
                      @click="saveEditedGroup(child.id)"
                      :disabled="!editingGroupName.trim()"
                    >
                      <i class="fas fa-save"></i> {{ $t('form.save') }}
                    </button>
                    <button v-if="editingGroupId === child.id" class="cancel-button" @click="cancelEditing">
                      <i class="fas fa-times"></i> {{ $t('form.cancel') }}
                    </button>
                    <button
                      v-else
                      class="edit-button"
                      @click="startEditing(child)"
                      :disabled="groupStore.loading || contactStore.loading"
                    >
                      <i class="fas fa-edit"></i> {{ $t('shared.contactListItem.edit') }}
                    </button>
                    <button
                      class="delete-button"
                      @click="confirmDeleteGroup(child)"
                      :disabled="groupStore.loading || contactStore.loading"
                    >
                      <i class="fas fa-trash"></i> {{ $t('shared.contactListItem.delete') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <i class="fas fa-users"></i>
        <p>{{ $t('groupManager.emptyStateMessage') }}</p>
        <button @click="showAddGroupDialog = true" class="add-first-group-button">
          {{ $t('groupManager.addFirstGroupButton') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useGroupStore } from '../store/groups'
import { useContactStore } from '../store/contacts'

const groupStore = useGroupStore()
const contactStore = useContactStore()

// متغیرهای واکنشی برای مدیریت حالت ویرایش
const editingGroupId = ref(null)
const editingGroupName = ref('')
const editingInput = ref(null)
const newGroupParent = ref('')
const expandedGroups = ref(new Set())

// متغیرهای دیالوگ اضافه کردن گروه
const newGroupColor = ref('#4CAF50') // رنگ پیش‌فرض

// تابع شروع حالت ویرایش
const startEditing = (group) => {
  editingGroupId.value = group.id
  editingGroupName.value = group.name
  nextTick(() => {
    if (editingInput.value) {
      editingInput.value.focus()
    }
  })
}

// تابع انصراف از ویرایش
const cancelEditing = () => {
  editingGroupId.value = null
  editingGroupName.value = ''
  groupStore.error = null
}

// تابع ذخیره اسم ویرایش شده گروه
const saveEditedGroup = async (groupId) => {
  const name = editingGroupName.value.trim()
  if (!name) {
    groupStore.error = $t('groupManager.groupNameRequired')
    return
  }

  try {
    await groupStore.updateGroup(groupId, { name: newName })
    cancelEditing()
  } catch (error) {
    groupStore.error = error.message || $t('groupManager.errorSavingGroup')
  }
}

// تابع اضافه کردن گروه جدید
const addNewGroup = async () => {
  const name = newGroupName.value.trim()
  if (!name) {
    groupStore.error = $t('groupManager.groupNameRequired')
    return
  }

  try {
    const groupData = {
      name,
      color: newGroupColor.value,
      parent_id: newGroupParent.value || null
    }
    await groupStore.addGroup(groupData)
    showAddGroupDialog.value = false
    newGroupName.value = ''
    newGroupColor.value = '#4CAF50'
    newGroupParent.value = ''
  } catch (error) {
    groupStore.error = error.message || $t('groupManager.errorAddingGroup')
  }
}

// تابع برای گرفتن گروه‌های سطح اول
const getTopLevelGroups = computed(() => {
  return groupStore.sortedGroups.filter(group => !group.parent_id)
})

// تابع برای گرفتن فرزندان یک گروه
const getChildren = (parentId) => {
  return groupStore.sortedGroups.filter(group => group.parent_id === parentId)
}

// تابع برای بررسی وجود فرزندان
const hasChildren = (group) => {
  return groupStore.sortedGroups.some(child => child.parent_id === group.id)
}

// تابع برای فعال/غیرفعال کردن گروه
const toggleGroup = (groupId) => {
  if (expandedGroups.value.has(groupId)) {
    expandedGroups.value.delete(groupId)
  } else {
    expandedGroups.value.add(groupId)
  }
}

// تابع تایید حذف گروه
const confirmDeleteGroup = async (group) => {
  if (!confirm(`آیا از حذف گروه "${group.name}" مطمئن هستید؟`)) {
    return
  }

  try {
    await groupStore.deleteGroup(group.id)
  } catch (error) {
    groupStore.error = error.message || 'خطا در حذف گروه'
  }
}

// هنگام mount شدن کامپوننت، لیست گروه‌ها رو لود می‌کنیم
onMounted(async () => {
  try {
    await groupStore.loadGroups()
  } catch (error) {
    groupStore.error = error.message || 'خطا در بارگذاری گروه‌ها'
  }
})
</script>    groupStore.error = 'نام گروه نمی‌تواند خالی باشد.'
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
  border-radius: var(--radius-base);
  transition: all 0.3s ease;
  font-size: 0.9em;
  backdrop-filter: blur(8px);
}

/* Edit Button */
.edit-button {
  background: linear-gradient(120deg, var(--color-warning) 60%, transparent 100%);
  color: var(--color-black);
  border: none;
  box-shadow: 0 2px 12px 0 rgba(31, 38, 135, 0.1);
}

.edit-button:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 4px 16px rgba(255, 193, 7, 0.2);
}

/* Delete Button */
.delete-button {
  background: linear-gradient(120deg, var(--color-danger) 60%, transparent 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(31, 38, 135, 0.1);
}

.delete-button:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 4px 16px rgba(220, 53, 69, 0.2);
}

/* Save Button */
.save-button {
  background: linear-gradient(120deg, var(--color-success) 60%, transparent 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(31, 38, 135, 0.1);
}

.save-button:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 4px 16px rgba(40, 167, 69, 0.2);
}

/* Cancel Button */
.cancel-button {
  background: var(--glass-bg);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-medium);
}

.cancel-button:hover:not(:disabled) {
  background: var(--glass-bg-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Disabled State */
.group-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>
