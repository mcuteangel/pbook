<template>
    <form @submit.prevent="handleSubmit">
      <h2>{{ contactStore.contactToEdit ? 'ویرایش مخاطب' : 'افزودن مخاطب جدید' }}</h2>
  
      <div>
        <label for="name">نام:</label>
        <input type="text" id="name" v-model="name" required>
      </div>
      <div>
        <label for="lastName">نام خانوادگی:</label>
        <input type="text" id="lastName" v-model="lastName" required>
      </div>
      <div>
        <label for="phone">تلفن اصلی:</label>
        <input type="text" id="phone" v-model="phone" required>
      </div>
  
      <div>
        <label for="title">سمت/تخصص:</label>
        <input type="text" id="title" v-model="title">
      </div>
  
      <div>
        <label for="gender">جنسیت:</label>
        <select id="gender" v-model="gender">
          <option value="">انتخاب کنید</option>
          <option value="male">آقا</option>
          <option value="female">خانم</option>
          <option value="other">غیره</option>
          <option value="not_specified">ترجیح میدهم نگویم</option>
        </select>
      </div>
  
      <div class="additional-phones-section">
        <label>شماره‌های اضافی:</label>
        <div v-for="(phone, index) in additionalPhones" :key="phone.id" class="additional-phone-input">
            <select v-model="phone.type">
                <option value="">نوع</option>
                <option value="mobile">موبایل</option>
                <option value="home">منزل</option>
                <option value="work">محل کار</option>
                <option value="office">مطب/دفتر</option>
                <option value="fax">فکس</option>
                <option value="other">دیگر</option>
            </select>
            <input type="text" v-model="phone.number" :placeholder="'شماره ' + (index + 1)">
            <button type="button" class="remove-phone-button" @click="removeAdditionalPhone(phone.id)">X</button>
        </div>
        <button type="button" class="add-phone-button" @click="addAdditionalPhone">+ افزودن شماره دیگر</button>
    </div>
  
  
      <div>
        <label for="notes">یادداشت/توضیحات:</label>
        <textarea id="notes" v-model="notes"></textarea>
      </div>
  
  
      <button type="submit" :disabled="contactStore.loading">
        {{ contactStore.loading ? 'در حال پردازش...' : (contactStore.contactToEdit ? 'به‌روزرسانی مخاطب' : 'ذخیره مخاطب') }}
      </button>
  
      <button v-if="contactStore.contactToEdit" type="button" @click="contactStore.clearContactToEdit()">
        انصراف
      </button>
  
      <p v-if="contactStore.error" style="color: red;">{{ contactStore.error }}</p>
    </form>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  import { useContactStore } from '../store/contacts';
  
  const contactStore = useContactStore();
  
  // ساخت متغیرهای واکنشی برای نگهداری مقادیر فیلدهای فرم
  const name = ref('');
  const lastName = ref('');
  const phone = ref('');
  const title = ref('');
  const gender = ref('');
  const notes = ref('');
  // متغیر واکنشی برای شماره‌های اضافی (حالا آرایه‌ای از اشیاء { id, type, number })
const additionalPhones = ref([]);
let phoneIdCounter = 0;

  
  // تابع برای تولید ID منحصر به فرد برای فیلدهای موقت فرم
  const generateUniquePhoneId = () => {
      phoneIdCounter += 1;
      return Date.now() + phoneIdCounter; // ترکیب زمان فعلی با کانتر برای اطمینان از یونیک بودن
  };
  
 // تابع برای اضافه کردن یک فیلد شماره اضافی جدید (با نوع پیش‌فرض خالی)
const addAdditionalPhone = () => {
    additionalPhones.value.push({
        id: generateUniquePhoneId(),
        type: '', // نوع پیش‌فرض
        number: '' // شماره پیش‌فرض
    });
};
  
  // تابع برای حذف یک فیلد شماره اضافی
  const removeAdditionalPhone = (idToRemove) => {
      additionalPhones.value = additionalPhones.value.filter(phone => phone.id !== idToRemove);
  };
  
  
  // تابع برای پاک کردن فرم (به‌روزرسانی شده برای فیلدهای جدید)
  const clearForm = () => {
    name.value = '';
    lastName.value = '';
    phone.value = '';
    title.value = '';
    gender.value = '';
    notes.value = '';
    additionalPhones.value = []; // پاک کردن شماره‌های اضافی
    phoneIdCounter = 0; // ریست کردن کانتر
  };
  
  // استفاده از watch برای واکنش نشان دادن به تغییرات contactStore.contactToEdit
  watch(() => contactStore.contactToEdit, (newContactToEdit) => {
    if (newContactToEdit) {
      // اگر contactToEdit مقدار گرفت (یعنی وارد حالت ویرایش شدیم)
      // فیلدهای فرم رو با اطلاعات اون مخاطب پر می‌کنیم
      name.value = newContactToEdit.name || '';
      lastName.value = newContactToEdit.lastName || '';
      phone.value = newContactToEdit.phone || '';
      title.value = newContactToEdit.title || '';
      gender.value = newContactToEdit.gender || '';
      notes.value = newContactToEdit.notes || '';
  
      // پر کردن شماره‌های اضافی برای ویرایش
       // پر کردن شماره‌های اضافی برای ویرایش (تبدیل اشیاء {type, number} از DB به {id, type, number} برای فرم)
    additionalPhones.value = newContactToEdit.additionalPhones
        ? newContactToEdit.additionalPhones.map(item => ({ // هر آیتم حالا { type, number } هست توی DB
            id: generateUniquePhoneId(), // تولید ID جدید برای فرم
            type: item.type || '', // مقدار type
            number: item.number || '' // مقدار number
        }))
        : []; // اگر additionalPhones وجود نداشت یا خالی بود، آرایه خالی بذار


  } else {
    // اگر contactToEdit null شد (یعنی از حالت ویرایش خارج شدیم)
    // فرم رو پاک می‌کنیم
    clearForm();
    }
  }, { immediate: true });
  
  // تابعی که هنگام ارسال فرم اجرا میشه (حالا هم برای افزودن هم ویرایش)
  const handleSubmit = async () => {
  
     // استخراج شماره‌ها و نوع‌ها از آرایه additionalPhones.value برای ذخیره در DB
    // فقط آیتم‌هایی رو نگه می‌داریم که شماره تلفن خالی نباشه
    const phoneEntries = additionalPhones.value
        .map(item => ({ // هر آیتم فرم { id, type, number } هست، به { type, number } تبدیل می‌کنیم
            type: item.type || '', // مطمئن میشیم type هم هست (حتی اگه خالیه)
            number: item.number.trim() // شماره رو trim می‌کنیم
        }))
        .filter(item => item.number); // فقط آیتم‌هایی که فیلد numberشون خالی نیست رو نگه می‌داریم

  
    const contactData = {
      name: name.value,
      lastName: lastName.value,
      phone: phone.value,
      title: title.value,
      gender: gender.value,
      notes: notes.value,
      additionalPhones: phoneEntries, // اضافه کردن آرایه جدید اشیاء { type, number }
    // فیلدهای دیگه رو هم اینجا اضافه می‌کنیم
    };
  
    if (contactStore.contactToEdit) {
      // اگر در حالت ویرایش هستیم
      const contactId = contactStore.contactToEdit.id;
      contactData.updatedAt = new Date().toISOString(); // به‌روزرسانی تاریخ ویرایش
  
      await contactStore.updateContact(contactId, contactData);
  
      if (!contactStore.error) {
           alert('مخاطب با موفقیت به‌روزرسانی شد!');
           contactStore.clearContactToEdit();
      }
  
    } else {
      // اگر در حالت افزودن هستیم
      contactData.createdAt = new Date().toISOString();
      contactData.updatedAt = new Date().toISOString();
  
      await contactStore.addContact(contactData);
  
      if (!contactStore.error) {
          alert('مخاطب با موفقیت اضافه شد!');
          clearForm();
      }
    }
  };
  </script>
  
  
  <style scoped>
  .additional-phones-section {
    border: 1px dashed #ccc; /* کادر نقطه‌چین */
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 15px;
    background-color: #f1f1f1; /* پس زمینه کمی خاکستری */
}

.additional-phones-section > label { /* استایل Label اصلی بخش */
    display: block;
    margin-bottom: 10px;
    font-weight: bold;
    border-bottom: 1px solid #ccc;
    padding-bottom: 5px;
}

.additional-phone-input {
    display: flex; /* نمایش Input و دکمه در یک سطر */
    gap: 10px; /* فاصله بین Input و دکمه */
    margin-bottom: 10px;
    align-items: center; /* هم‌تراز کردن عمودی آیتم‌ها */
}

/* استایل Select Box و Input در بخش شماره‌های اضافی */
.additional-phone-input select,
.additional-phone-input input[type="text"] {
    flex-grow: 1; /* فضا رو پر کنن */
    margin-bottom: 0; /* فاصله پایین رو بردار */
}

.additional-phone-input select {
    flex-basis: 100px; /* عرض پایه برای Select (می‌تونی تنظیم کنی) */
    flex-grow: 0; /* از رشد بی‌رویه جلوگیری می‌کنه */
}


/* استایل دکمه حذف کنار شماره اضافی */
.remove-phone-button {
    background-color: #dc3545; /* قرمز */
    color: white;
    width: 30px; /* عرض ثابت برای دکمه X */
    height: 30px; /* ارتفاع ثابت */
    padding: 0; /* پدینگ رو برمیداریم */
    border-radius: 50%; /* دایره‌ای کردن دکمه */
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0; /* از کوچک شدن دکمه جلوگیری می‌کنه */
}

.remove-phone-button:hover {
     background-color: #c82333;
}

/* استایل دکمه افزودن شماره اضافی */
.add-phone-button {
    background-color: #28a745; /* سبز */
    color: white;
    width: auto; /* عرض اتوماتیک بر اساس متن */
    padding: 8px 15px; /* پدینگ مناسب */
    align-self: flex-start; /* چسباندن دکمه به سمت چپ */
}

.add-phone-button:hover {
     background-color: #218838;
}

  form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  max-width: 400px;
  margin: 20px auto;
}

div {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
}

input[type="text"], select, textarea { /* استایل input, select و textarea */
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%; /* عرض کامل */
  box-sizing: border-box; /* padding و border جزو عرض حساب بشن */
}

textarea {
    resize: vertical; /* فقط اجازه تغییر اندازه عمودی */
    min-height: 80px; /* حداقل ارتفاع */
}

button {
   padding: 10px 15px;
   background-color: #007bff;
   color: white;
   border: none;
   border-radius: 4px;
   cursor: pointer;
   transition: background-color 0.3s ease;
   margin-right: 10px;
}

button:hover:not(:disabled) {
   background-color: #0056b3;
}

button:disabled {
   background-color: #cccccc;
   cursor: not-allowed;
}

button[type="button"] {
    background-color: #6c757d;
    color: white;
}

button[type="button"]:hover:not(:disabled) {
    background-color: #5a6268;
}


  </style>