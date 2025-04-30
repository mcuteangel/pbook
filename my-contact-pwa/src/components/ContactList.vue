<template>
    <div class="contact-list-container">
      <h2>لیست مخاطبین</h2>
      <div class="controls">
        <div class="search-box">
            <label for="search">جستجو:</label>
            <input type="text" id="search" v-model="contactStore.searchQuery" placeholder="جستجو در مخاطبین...">
        </div>

        <div class="sort-controls">
            <label for="sortField">مرتب‌سازی بر اساس:</label>
            <select id="sortField" v-model="contactStore.sortField">
                <option value="lastName">نام خانوادگی</option>
                <option value="name">نام</option>
                <option value="createdAt">تاریخ ایجاد</option>
                <option value="group">گروه</option>
                </select>

            <label for="sortOrder">ترتیب:</label>
             <select id="sortOrder" v-model="contactStore.sortOrder">
                <option value="asc">صعودی (الفبا/جدیدترین)</option>
                <option value="desc">نزولی (الفبا/قدیمی‌ترین)</option>
            </select>
        </div>
    </div>
      <div v-if="contactStore.loading">در حال بارگذاری مخاطبین...</div>
      <hr> <div v-if="contactStore.loading">در حال بارگذاری مخاطبین...</div>
    <div v-else-if="contactStore.error" style="color: red;">{{ contactStore.error }}</div>
    <div v-else-if="contactStore.filteredAndSortedContacts.length === 0">هیچ مخاطبی یافت نشد.</div>
    <ul v-else class="contact-list">
      <li v-for="contact in contactStore.filteredAndSortedContacts" :key="contact.id" class="contact-item">
        <div class="contact-info">
          <strong>{{ contact.name }} {{ contact.lastName }}</strong>
          <p>تلفن: {{ contact.phone }}</p>

          <p v-if="contact.title">سمت: {{ contact.title }}</p>
          <p v-if="contact.gender">جنسیت: {{ displayGender(contact.gender) }}</p>
          <p v-if="contact.group">گروه: {{ contact.group }}</p>
          <p v-if="contact.notes">یادداشت: {{ contact.notes }}</p>

          <div v-if="contact.additionalPhones && contact.additionalPhones.length > 0">
              <p>شماره‌های اضافی:</p>
              <ul>
                  <li v-for="(additionalPhone, index) in contact.additionalPhones" :key="index">
                      {{ displayPhoneType(additionalPhone.type) }}: {{ additionalPhone.number }}
                  </li>
              </ul>
          </div>
  
  
            <p v-if="contact.createdAt">
              ایجاد: {{ formatShamsiDate(contact.createdAt) }}
            </p>
            <p v-if="contact.updatedAt">
              ویرایش: {{ formatShamsiDate(contact.updatedAt) }}
            </p>
          </div>
          <div class="contact-actions">
            <button class="edit-button" @click="contactStore.setContactToEdit(contact)">ویرایش</button>
            <button class="delete-button" @click="confirmDelete(contact.id)">حذف</button>
          </div>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { useContactStore } from '../store/contacts';
  import { useGroupStore } from '../store/groups';
  import persianDate from 'persian-date';
  
  const contactStore = useContactStore();
  const groupStore = useGroupStore();
  
  const confirmDelete = async (contactId) => {
      if (confirm('مطمئنی می‌خوای این مخاطب رو حذف کنی؟')) {
          await contactStore.deleteContact(contactId);
      }
  };
  
  const formatShamsiDate = (gregorianDateString) => {
      if (!gregorianDateString) {
          return 'نامشخص';
      }
      try {
          const date = new persianDate(new Date(gregorianDateString));
          return date.format('YYYY/MM/DD HH:mm');
      } catch (error) {
          console.error('خطا در فرمت تاریخ شمسی:', error);
          return 'خطا در تاریخ';
      }
  };
  
  // تابع کمکی برای نمایش بهتر مقدار جنسیت
  const displayGender = (genderValue) => {
      switch (genderValue) {
          case 'male': return 'آقا';
          case 'female': return 'خانم';
          case 'other': return 'غیره';
          case 'not_specified': return 'نامشخص';
          default: return ''; // اگر مقدار غیرمنتظره بود
      }
  };
  const displayPhoneType = (typeValue) => {
    switch (typeValue) {
        case 'mobile': return 'موبایل';
        case 'home': return 'منزل';
        case 'work': return 'محل کار';
        case 'office': return 'مطب/دفتر';
        case 'fax': return 'فکس';
        case 'other': return 'دیگر';
        default: return 'نامشخص'; // یا می‌تونی '' بذاری که چیزی نمایش نده
    }
};
  
  </script>
  
  
  <style scoped>
  .contact-info ul {
    list-style: disc; /* نشانه دایره‌ای برای لیست */
    padding-left: 20px; /* فاصله از سمت چپ */
    margin-top: 5px;
    margin-bottom: 5px;
}

.contact-info ul li {
    font-size: 0.9em;
    color: #555;
    margin-bottom: 2px;
}

.controls {
    display: flex;
    flex-direction: column; /* آیتم‌ها زیر هم قرار بگیرن */
    gap: 15px; /* فاصله بین آیتم‌ها */
    padding: 0 20px;
    margin: 20px auto;
    max-width: 400px; /* هم‌عرض با فرم */
}

.search-box label, .sort-controls label {
    margin-right: 10px;
    font-weight: bold;
}

.search-box input[type="text"] {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: calc(100% - 70px); /* عرض input با احتساب label */
    box-sizing: border-box;
}

.sort-controls {
    display: flex; /* فیلدها و ترتیب در یک سطر قرار بگیرن */
    gap: 10px; /* فاصله بین فیلدهای مرتب‌سازی */
    align-items: center;
}

.sort-controls select {
     padding: 8px;
     border: 1px solid #ccc;
     border-radius: 4px;
}
  .contact-list-container {
    margin: 20px auto;
    max-width: 400px;
    padding: 0 20px;
  }
  
  .contact-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .contact-item p {
    margin: 3px 0;
    font-size: 0.9em;
    color: #555;
    word-break: break-word; /* اگر متن طولانی بود بشکنه */
}

.contact-info strong {
     display: block;
     margin-bottom: 5px;
}
  
  .contact-actions button {
    margin-left: 5px;
    padding: 5px 10px;
    cursor: pointer;
  }
  .contact-actions button {
  margin-left: 5px;
  padding: 5px 10px;
  cursor: pointer;
  border: none; /* استایل دکمه‌ها رو یکم مرتب‌تر کنیم */
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

/* استایل مخصوص دکمه حذف */
.delete-button {
    background-color: #dc3545; /* رنگ قرمز */
    color: white;
}

.delete-button:hover:not(:disabled) {
    background-color: #c82333; /* قرمز تیره‌تر هنگام هاور */
}

/* استایل مخصوص دکمه ویرایش (اگه اضافه کردی) */
 .edit-button {
    background-color: #ffc107;
    color: #212529;
}
.edit-button:hover:not(:disabled) {
    background-color: #e0a800;
} 
.contact-actions button {
  margin-left: 5px;
  padding: 5px 10px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.delete-button {
    background-color: #dc3545;
    color: white;
}

.delete-button:hover:not(:disabled) {
    background-color: #c82333;
}

/* استایل مخصوص دکمه ویرایش */
.edit-button {
    background-color: #ffc107; /* رنگ زرد/نارنجی */
    color: #212529; /* رنگ متن تیره */
}
.edit-button:hover:not(:disabled) {
    background-color: #e0a800; /* زرد/نارنجی تیره‌تر */
}
.contact-item p { /* استایل برای پاراگراف‌های داخل آیتم لیست */
    margin: 3px 0;
    font-size: 0.9em; /* فونت کوچکتر برای تاریخ‌ها */
    color: #555;
}
  </style>