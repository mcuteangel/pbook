<template>
    <div class="group-manager-container">
        <h2>مدیریت گروه‌ها</h2>

        <div v-if="groupStore.loading">در حال بارگذاری گروه‌ها...</div>
        <div v-else-if="groupStore.error" style="color: red;">{{ groupStore.error }}</div>

        <ul v-else-if="groupStore.sortedGroups.length > 0" class="group-list">
            <li v-for="group in groupStore.sortedGroups" :key="group.id" class="group-item">
                <div class="group-name">{{ group.name }}</div>
                <div class="group-actions">
                    <button class="delete-button" @click="confirmDeleteGroup(group)">حذف</button>
                </div>
            </li>
        </ul>
         <div v-else>هیچ گروهی یافت نشد.</div>

        </div>
</template>

<script setup>
import { useGroupStore } from '../store/groups'; // Store گروه‌ها رو وارد می‌کنیم

const groupStore = useGroupStore();

// تابع برای تایید و حذف گروه
const confirmDeleteGroup = async (groupToDelete) => {
    const groupName = groupToDelete.name;
    // یه پیام تایید به کاربر نشون میدیم
    if (confirm(`مطمئنی می‌خوای گروه "${groupName}" رو حذف کنی؟ تمام مخاطبین این گروه به "بدون گروه" منتقل میشن.`)) {
        // اگه تایید کرد، اکشن deleteGroup رو صدا می‌زنیم
        await groupStore.deleteGroup(groupToDelete.id);
        // Store گروه‌ها خودش بعد از حذف، لیست رو دوباره لود می‌کنه یا به‌روز می‌کنه
    }
};

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
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #f9f9f9;
}

.group-list {
    list-style: none;
    padding: 0;
}

.group-item {
    display: flex;
    justify-content: space-between; /* نام و دکمه‌ها رو از هم جدا می‌کنه */
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #eee;
}

.group-item:last-child {
    border-bottom: none; /* خط زیر آخرین آیتم رو حذف می‌کنه */
}

.group-name {
    font-weight: bold;
    flex-grow: 1; /* اسم گروه فضا رو پر کنه */
}

.group-actions button {
    margin-left: 5px;
    padding: 5px 10px;
    cursor: pointer;
    border: none;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

/* استایل دکمه حذف */
.delete-button {
    background-color: #dc3545;
    color: white;
}

.delete-button:hover:not(:disabled) {
    background-color: #c82333;
}

/* استایل دکمه ویرایش (اگه اضافه کردی) */
.edit-button {
    background-color: #ffc107;
    color: #212529;
}
.edit-button:hover:not(:disabled) {
    background-color: #e0a800;
}

</style>