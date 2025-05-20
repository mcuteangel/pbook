<template>
 <form @submit.prevent="handleSubmit" class="contact-form">
    <h2>{{ contactStore.contactToEdit ? 'ویرایش مخاطب' : 'افزودن مخاطب جدید' }}</h2>

    <div class="form-group">
      <label for="name">نام:</label>
      <input type="text" id="name" v-model="name" required />
    </div>
    <div class="form-group">
      <label for="lastName">نام خانوادگی:</label>
      <input type="text" id="lastName" v-model="lastName" required />
    </div>
    <div class="form-group">
      <label for="phone">تلفن اصلی:</label>
      <input type="text" id="phone" v-model="phone" />
    </div>
    <div class="form-group">
      <label for="title">سمت/تخصص:</label>
      <input type="text" id="title" v-model="title" />
    </div>
    <div class="form-group">
      <label for="gender">جنسیت:</label>
      <select id="gender" v-model="gender">
        <option value="">انتخاب کنید</option>
        <option value="male">آقا</option>
        <option value="female">خانم</option>
        <option value="other">غیره</option>
        <option value="not_specified">ترجیح میدهم نگویم</option>
      </select>
    </div>
    <div class="form-group">
      <label for="group">گروه:</label>
      <select id="group" v-model="contactGroup">
        <option value="">بدون گروه</option>
        <option v-for="g in groupStore.sortedGroups" :key="g.id" :value="g.name">{{ g.name }}</option>
        <option value="__CREATE_NEW__">--- ایجاد گروه جدید ---</option>
      </select>
      <div v-if="isCreatingNewGroup" class="new-group-input">
        <label for="newGroupName">نام گروه جدید:</label>
        <input type="text" id="newGroupName" v-model="newGroupName" placeholder="مثلاً: دوستان" />
      </div>
    </div>

    <div class="form-group">
      <label for="birthDate">تاریخ تولد:</label>
      <date-picker
        v-model="birthDate"
        id="birthDate"
        type="date"
        format="jYYYY/jMM/jDD"
        display-format="jYYYY/jMM/jDD"
        placeholder="تاریخ تولد را انتخاب کنید"
        clearable
      ></date-picker>
    </div>


    <div v-if="sortedCustomFieldDefinitions.length > 0" class="custom-fields-wrapper">
      <h3>فیلدهای سفارشی</h3>
      <div v-for="fieldDef in sortedCustomFieldDefinitions" :key="fieldDef.id" class="form-group custom-field-group">
        <label :for="'custom-field-' + fieldDef.id">{{ fieldDef.label }}:</label>

        <input
          v-if="fieldDef.type === 'text'"
          type="text"
          :id="'custom-field-' + fieldDef.id"
          v-model="customFieldValues[fieldDef.id]"
          class="form-input"
        />
        <textarea
          v-else-if="fieldDef.type === 'textarea'"
          :id="'custom-field-' + fieldDef.id"
          v-model="customFieldValues[fieldDef.id]"
          class="form-textarea"
          rows="3"
        ></textarea>
        <input
          v-else-if="fieldDef.type === 'number'"
          type="number"
          :id="'custom-field-' + fieldDef.id"
          v-model.number="customFieldValues[fieldDef.id]"
          class="form-input"
        />
        <date-picker
          v-else-if="fieldDef.type === 'date'"
          v-model="customFieldValues[fieldDef.id]"
          :id="'custom-field-' + fieldDef.id"
          type="date"
          format="YYYY-MM-DD"   
          display-format="jYYYY/jMM/jDD" 
          placeholder="تاریخ را انتخاب کنید"
          class="form-datepicker"
          clearable
        ></date-picker>
        <div v-else-if="fieldDef.type === 'boolean'" class="checkbox-wrapper">
          <input
            type="checkbox"
            :id="'custom-field-' + fieldDef.id"
            v-model="customFieldValues[fieldDef.id]"
            class="form-checkbox"
          />
          <label :for="'custom-field-' + fieldDef.id" class="checkbox-label">{{ fieldDef.label }}</label>
        </div>
        <select
          v-else-if="fieldDef.type === 'select'"
          :id="'custom-field-' + fieldDef.id"
          v-model="customFieldValues[fieldDef.id]"
          class="form-select"
        >
          <option value="">انتخاب کنید...</option>
          <option v-for="option in fieldDef.options" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
        <small v-else class="unsupported-field-type">نوع فیلد "{{ fieldDef.type }}" پشتیبانی نمی‌شود.</small>
      </div>
    </div>
    <div class="form-section additional-items-section">
        <h4>آدرس‌ها</h4>
        <div v-for="(address, index) in contactAddresses" :key="address.id" class="item-block">
            <select v-model="address.type" class="item-select">
                <option value="">نوع آدرس</option>
                <option value="home">منزل</option>
                <option value="work">محل کار</option>
                <option value="other">دیگر</option>
            </select>
            <input type="text" v-model="address.street" placeholder="خیابان" class="item-input">
            <input type="text" v-model="address.city" placeholder="شهر" class="item-input-sml">
            <input type="text" v-model="address.province" placeholder="استان" class="item-input-sml">
            <input type="text" v-model="address.country" placeholder="کشور" class="item-input-sml">
            <input type="text" v-model="address.postalCode" placeholder="کدپستی" class="item-input-sml">
            <textarea v-model="address.notes" placeholder="یادداشت آدرس" class="item-textarea" rows="2"></textarea>
            <button type="button" @click="removeAddress(address.id)" class="remove-item-btn">X</button>
        </div>
        <button type="button" @click="addAddress" class="add-item-btn">+ افزودن آدرس</button>
    </div>

    <div class="form-section additional-items-section">
        <h4>شماره‌های اضافی</h4>
        <div v-for="(phoneItem, index) in additionalPhones" :key="phoneItem.id" class="item-block">
            <select v-model="phoneItem.type" class="item-select">
                <option value="">نوع شماره</option>
                <option value="mobile">موبایل</option>
                <option value="home">منزل</option>
                <option value="work">محل کار</option>
                <option value="fax">فکس</option>
                <option value="other">دیگر</option>
            </select>
            <input type="text" v-model="phoneItem.number" placeholder="شماره تلفن" class="item-input">
            <button type="button" @click="removeAdditionalPhone(phoneItem.id)" class="remove-item-btn">X</button>
        </div>
        <button type="button" @click="addAdditionalPhone" class="add-item-btn">+ افزودن شماره</button>
    </div>


    <div class="form-group">
      <label for="notes">یادداشت/توضیحات:</label>
      <textarea id="notes" v-model="notes" rows="4" class="form-textarea"></textarea>
    </div>

    <div class="form-actions">
      <button type="submit" :disabled="contactStore.loading || groupStore.loading" class="submit-btn">
        {{ contactStore.contactToEdit ? 'به‌روزرسانی مخاطب' : 'ذخیره مخاطب' }}
      </button>
      <button
        v-if="contactStore.contactToEdit"
        type="button"
        @click="clearForm" 
        class="cancel-btn"
      >
        انصراف (بازگشت به افزودن جدید)
      </button>
    </div>

    <p v-if="contactStore.error" class="error-message">{{ contactStore.error }}</p>
    <p v-if="groupStore.error" class="error-message">{{ groupStore.error }}</p>
  </form>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router'; // برای ناوبری بعد از ذخیره
import { useCustomFieldStore } from '../store/customFields'; // <-- Store فیلدهای سفارشی
import { useContactStore } from '../store/contacts'
import { useGroupStore } from '../store/groups'
import DatePicker from 'vue3-persian-datetime-picker' // <-- این خط رو اصلاح کن
import moment from 'moment-jalaali'

const contactStore = useContactStore()
const groupStore = useGroupStore()
const customFieldStore = useCustomFieldStore(); // <-- نمونه از Store
const router = useRouter();

// --- Local State for Form Fields (فیلدهای اصلی مخاطب) ---
const name = ref('');
const lastName = ref('');
const phone = ref('');
const title = ref('');
const gender = ref('');
const notes = ref('');
const contactGroup = ref('');
const birthDate = ref(''); // برای تاریخ تولد اصلی - مقدار اولیه رشته خالی یا null

// State برای شماره‌های اضافی
const additionalPhones = ref([]); // آرایه‌ای از آبجکت‌های { id (برای key در v-for), type, number }
let phoneIdCounter = 0; // برای تولید ID موقت برای v-for

// State برای آدرس‌ها
const contactAddresses = ref([]); // آرایه‌ای از آبجکت‌های { id (برای key در v-for), type, street, ... }
let addressIdCounter = 0; // برای تولید ID موقت برای v-for

// State برای ایجاد گروه جدید
const isCreatingNewGroup = ref(false);
const newGroupName = ref('');

// --- Local State for Custom Fields ---
const customFieldValues = ref({}); // آبجکتی که مقادیر فیلدهای سفارشی رو نگه میداره: { fieldDefId1: value1, fieldDefId2: value2 }

const sortedCustomFieldDefinitions = computed(() => customFieldStore.sortedFieldDefinitions || []);

// --- Helper Functions ---
const generateUniqueId = () => Date.now() + Math.random().toString(36).substring(2, 9);

// Removed duplicate declaration of addAdditionalPhone
// Duplicate declaration removed

const generateUniqueAddressId = () => {
  addressIdCounter += 1
  return Date.now() + addressIdCounter
}

// تابع برای اضافه کردن یک بلوک آدرس جدید
const addAddress = () => {
  contactAddresses.value.push({
    id: generateUniqueAddressId(),
    type: '',
    street: '',
    city: '',
    province: '',
    country: '',
    postalCode: '',
    notes: '',
  })
}

// تابع برای حذف یک بلوک آدرس
const removeAddress = (idToRemove) => {
  contactAddresses.value = contactAddresses.value.filter((address) => address.id !== idToRemove)
}

// مقدار پیش‌فرض برای هر نوع فیلد سفارشی
const getDefaultValueForCustomFieldType = (type) => {
  switch (type) {
    case 'text':
    case 'textarea':
    case 'select':
    case 'date': // برای DatePicker رشته خالی یا null مناسبه
      return '';
    case 'number':
      return null; // یا 0
    case 'boolean':
      return false;
    default:
      return undefined;
  }
};

// ریست کردن مقادیر فیلدهای سفارشی به پیش‌فرض
const resetCustomFieldValues = () => {
  const newValues = {};
  if (sortedCustomFieldDefinitions.value && Array.isArray(sortedCustomFieldDefinitions.value)) {
    sortedCustomFieldDefinitions.value.forEach(def => {
      newValues[def.id] = getDefaultValueForCustomFieldType(def.type);
    });
  }
  customFieldValues.value = newValues;
  console.log('Custom field values reset:', customFieldValues.value);
};

// تابع برای تولید ID منحصر به فرد برای فیلدهای موقت فرم
const generateUniquePhoneId = () => {
  phoneIdCounter += 1
  return Date.now() + phoneIdCounter // ترکیب زمان فعلی با کانتر برای اطمینان از یونیک بودن
}

// تابع برای اضافه کردن یک فیلد شماره اضافی جدید (با نوع پیش‌فرض خالی)
const addAdditionalPhone = () => {
  additionalPhones.value.push({
    id: generateUniquePhoneId(),
    type: '', // نوع پیش‌فرض
    number: '', // شماره پیش‌فرض
  })
}

// تابع برای حذف یک فیلد شماره اضافی
const removeAdditionalPhone = (idToRemove) => {
  additionalPhones.value = additionalPhones.value.filter((phone) => phone.id !== idToRemove)
}

// پاک کردن کل فرم
const clearForm = () => {
  name.value = '';
  lastName.value = '';
  phone.value = '';
  title.value = '';
  gender.value = '';
  notes.value = '';
  contactGroup.value = '';
  birthDate.value = ''; // یا null

  additionalPhones.value = [];
  contactAddresses.value = [];

  isCreatingNewGroup.value = false;
  newGroupName.value = '';
  groupStore.error = null; // پاک کردن خطای گروه
  contactStore.error = null; // پاک کردن خطای مخاطب

  resetCustomFieldValues(); // <-- ریست کردن فیلدهای سفارشی
  contactStore.clearContactToEdit(); // <-- پاک کردن مخاطب در حال ویرایش از store
};
// --- Watchers & Lifecycle Hooks ---
onMounted(() => {
  // اگر در حالت افزودن جدید هستیم و مخاطبی برای ویرایش انتخاب نشده، فرم و فیلدهای سفارشی رو ریست کن
  if (!contactStore.contactToEdit) {
    clearForm(); // clearForm شامل resetCustomFieldValues هم میشه
  }
  // اگر تعاریف فیلدها هنوز لود نشدن، اینجا می‌تونستی لودشون کنی،
  // ولی فرض ما اینه که در App.vue لود میشن.
});

// استفاده از watch برای واکنش نشان دادن به تغییرات contactStore.contactToEdit
// این watch مهمترین بخش برای مقداردهی فرم در حالت افزودن/ویرایش هست
watch(
  () => contactStore.contactToEdit, // مانیتور کردن مخاطبی که برای ویرایش انتخاب شده
  (contactForEdit) => {
    console.log('ContactForm: contactToEdit watcher triggered. New contact:', contactForEdit);
    if (contactForEdit) {
      // --- حالت ویرایش ---
      name.value = contactForEdit.name || '';
      lastName.value = contactForEdit.lastName || '';
      phone.value = contactForEdit.phone || '';
      title.value = contactForEdit.title || '';
      gender.value = contactForEdit.gender || '';
      notes.value = contactForEdit.notes || '';
      contactGroup.value = contactForEdit.group || '';

      // تاریخ تولد اصلی
      if (contactForEdit.birthDate) {
        birthDate.value = moment(contactForEdit.birthDate).format('jYYYY/jMM/jDD');
      } else {
        birthDate.value = '';
      }

      // شماره‌های اضافی
      additionalPhones.value = contactForEdit.additionalPhones
        ? JSON.parse(JSON.stringify(contactForEdit.additionalPhones)).map(p => ({ ...p, id: generateUniqueId() }))
        : [];

      // آدرس‌ها
      contactAddresses.value = contactForEdit.addresses
        ? JSON.parse(JSON.stringify(contactForEdit.addresses)).map(a => ({ ...a, id: generateUniqueId() }))
        : [];

      // فیلدهای سفارشی
      const newCustomValues = {};
      if (sortedCustomFieldDefinitions.value && Array.isArray(sortedCustomFieldDefinitions.value)) {
        sortedCustomFieldDefinitions.value.forEach(def => {
          const existingCustomField = contactForEdit.customFields?.find(cf => cf.fieldId === def.id);
          if (existingCustomField) {
            if (def.type === 'date' && existingCustomField.value) {
              // مقدار تاریخ از دیتابیس (ISO string) باید به فرمت DatePicker تبدیل بشه
              newCustomValues[def.id] = moment(existingCustomField.value).format('YYYY-MM-DD');
            } else {
              newCustomValues[def.id] = existingCustomField.value;
            }
          } else {
            newCustomValues[def.id] = getDefaultValueForCustomFieldType(def.type);
          }
        });
      }
      customFieldValues.value = newCustomValues;
      console.log('Custom field values loaded for edit:', customFieldValues.value);

      isCreatingNewGroup.value = false;
      newGroupName.value = '';

    } else {
      // --- حالت افزودن جدید ---
      // وقتی از ویرایش به افزودن جدید میریم (یا فرم برای اولین بار برای افزودن باز میشه)
      clearForm();
    }
  },
  { immediate: true, deep: true } // immediate: true برای اجرای اولیه، deep: true برای آبجکت‌های تو در تو
);

// Watch برای تغییر contactGroup و مدیریت input ایجاد گروه جدید
watch(contactGroup, (newValue) => {
  if (newValue === '__CREATE_NEW__') {
    isCreatingNewGroup.value = true;
  } else {
    isCreatingNewGroup.value = false;
    newGroupName.value = ''; // پاک کردن اسم گروه جدید اگر گروه موجود انتخاب شد
  }
});

// تابعی که هنگام ارسال فرم اجرا میشه (حالا هم برای افزودن هم ویرایش)
const handleSubmit = async () => {
  let finalContactGroupName = contactGroup.value // اسم گروه نهایی که توی مخاطب ذخیره میشه، پیش‌فرض همون گروه انتخابی توی Select
  // مرحله 1: مدیریت ایجاد گروه جدید (اگر لازم بود)
  if (isCreatingNewGroup.value) {
    if (newGroupName.value.trim() === '') {
      groupStore.error = 'لطفاً نام گروه جدید را وارد کنید.'
      return // اگه اسم خالیه، متوقف شو
    }
    groupStore.error = null // پاک کردن خطای قبلی

    // گروه جدید رو اضافه کن
    await groupStore.addGroup(newGroupName.value.trim())

    // اگر اضافه کردن گروه خطا داد، متوقف شو (خطا توی groupStore.error هست)
    if (groupStore.error) {
      return
    }

    // اگر گروه با موفقیت اضافه شد، اسمش رو برای ذخیره در مخاطب نهایی کن
    finalContactGroup = newGroupName.value.trim()
    // نیازی به به‌روزرسانی contactGroup.value اینجا نیست، clearForm بعد از ذخیره مخاطب این کار رو می‌کنه.
  }
  // !!! توجه: اگه isCreatingNewGroup.value === false بود، کد از این بلوک if میپره و ادامه پیدا می‌کنه. !!!

   // 2. آماده‌سازی داده‌های فیلدهای سفارشی
  const processedCustomFields = [];
  if (sortedCustomFieldDefinitions.value && Array.isArray(sortedCustomFieldDefinitions.value)) {
    for (const fieldDef of sortedCustomFieldDefinitions.value) {
      const rawValue = customFieldValues.value[fieldDef.id];
      let valueToStore = rawValue;

      // فقط فیلدهایی که مقدار معنی‌دار دارند یا boolean هستند
      if (rawValue !== null && rawValue !== undefined && (rawValue !== '' || fieldDef.type === 'boolean')) {
        if (fieldDef.type === 'date' && rawValue) {
          // تبدیل از فرمت DatePicker (YYYY-MM-DD میلادی) به ISO string برای ذخیره
          valueToStore = moment(rawValue, 'YYYY-MM-DD').toISOString();
        }
        // برای اعداد، مطمئن شویم که عدد هستند (اگر v-model.number استفاده نشده)
        if (fieldDef.type === 'number' && rawValue !== null && rawValue !== '') {
            valueToStore = parseFloat(rawValue);
            if (isNaN(valueToStore)) valueToStore = null; // اگر عدد معتبر نبود
        }

        processedCustomFields.push({
          fieldId: fieldDef.id, // ID از تعریف فیلد
          value: valueToStore,
        });
      }
    }
  }
  console.log('Processed custom fields for saving:', processedCustomFields);


  // 3. آماده‌سازی سایر داده‌های مخاطب
  const contactDataPayload = {
    name: name.value.trim(),
    lastName: lastName.value.trim(),
    phone: phone.value.trim(),
    title: title.value.trim(),
    gender: gender.value,
    notes: notes.value.trim(),
    group: finalContactGroupName === '__CREATE_NEW__' ? '' : finalContactGroupName, // اگر هنوز __CREATE_NEW__ بود، یعنی گروه ایجاد نشد
    birthDate: birthDate.value ? moment(birthDate.value, 'jYYYY/jMM/jDD').toISOString() : null,
    additionalPhones: additionalPhones.value
      .map(p => ({ type: p.type, number: p.number.trim() }))
      .filter(p => p.number),
    addresses: contactAddresses.value
      .map(a => ({
        type: a.type, street: a.street.trim(), city: a.city.trim(),
        province: a.province.trim(), country: a.country.trim(),
        postalCode: a.postalCode.trim(), notes: a.notes.trim()
      }))
      .filter(a => Object.values(a).some(val => typeof val === 'string' && val !== '')),
    customFields: processedCustomFields, // <-- فیلدهای سفارشی پردازش شده
    // createdAt و updatedAt توسط اکشن‌های store مدیریت میشن
  };

  // 4. ذخیره یا به‌روزرسانی مخاطب
  let success = false;
  if (contactStore.contactToEdit) {
    success = await contactStore.updateContact(contactStore.contactToEdit.id, contactDataPayload);
  } else {
    success = await contactStore.addContact(contactDataPayload);
  }

  // 5. اقدامات بعد از ذخیره
  if (success && !contactStore.error) {
    alert(contactStore.contactToEdit ? 'مخاطب با موفقیت به‌روزرسانی شد!' : 'مخاطب با موفقیت اضافه شد!');
    clearForm(); // شامل clearContactToEdit هم میشه
    router.push({ name: 'contact-list' }); // یا هر مسیری که می‌خوای کاربر بهش بره
  } else if (contactStore.error) {
    // خطا توسط store مدیریت شده و در UI نمایش داده میشه
    console.error("Error saving contact:", contactStore.error);
  }
};
</script>

<style scoped>
.additional-phones-section {
  border: 1px dashed var(--color-border-medium); /* تغییر کرد */
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  background-color: var(--color-background-darker-light); /* تغییر کرد */
}

.additional-phones-section > label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
  color: var(--color-text-primary); /* اضافه شد */
  border-bottom: 1px solid var(--color-border-medium); /* تغییر کرد */
  padding-bottom: 5px;
}

.additional-phone-input {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.additional-phone-input select,
.additional-phone-input input[type='text'] {
  flex-grow: 1;
  margin-bottom: 0;
  background-color: var(--color-background-light); /* اضافه شد */
  color: var(--color-text-primary); /* اضافه شد */
  border: 1px solid var(--color-border-medium); /* اضافه شد */
}

.additional-phone-input select {
  flex-basis: 100px;
  flex-grow: 0;
}

.remove-phone-button {
  background-color: var(--el-color-danger); /* از متغیر Element Plus */
  color: var(--el-color-white);
  width: 30px;
  height: 30px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.remove-phone-button:hover {
  background-color: var(--el-color-danger-dark-2); /* از متغیر Element Plus */
}

.add-phone-button {
  background-color: var(--el-color-success); /* از متغیر Element Plus */
  color: var(--el-color-white);
  width: auto;
  padding: 8px 15px;
  align-self: flex-start;
}

.add-phone-button:hover {
  background-color: var(--el-color-success-dark-2); /* از متغیر Element Plus */
}

form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  border: 1px solid var(--color-border-medium); /* تغییر کرد */
  border-radius: 8px;
  max-width: 400px;
  margin: 20px auto;
  background-color: var(--color-background-darker-light); /* اضافه شد */
  box-shadow: 0 2px 8px var(--color-shadow); /* اضافه شد */
}

div {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
  color: var(--color-text-primary); /* اضافه شد */
}

input[type='text'],
select,
textarea {
  padding: 8px;
  border: 1px solid var(--color-border-medium); /* تغییر کرد */
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--color-background-light); /* اضافه شد */
  color: var(--color-text-primary); /* اضافه شد */
}

textarea {
  resize: vertical;
  min-height: 80px;
}

button {
  padding: 10px 15px;
  background-color: var(--color-link-primary); /* تغییر کرد */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-right: 10px;
}

button:hover:not(:disabled) {
  background-color: var(--color-link-hover); /* تغییر کرد */
}

button:disabled {
  background-color: var(--color-button-disabled-bg); /* تغییر کرد */
  cursor: not-allowed;
  color: var(--color-button-disabled-text); /* اضافه شد */
}

button[type='button'] {
  background-color: var(--color-text-tertiary); /* تغییر کرد */
  color: white;
}

button[type='button']:hover:not(:disabled) {
  background-color: var(--color-text-secondary); /* تغییر کرد */
}

.new-group-input {
  margin-top: 10px;
  padding: 10px;
  background-color: var(--color-background-darker-light); /* تغییر کرد */
  border-radius: 5px;
  border: 1px solid var(--color-border-light); /* اضافه شد */
}

.new-group-input label {
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 0.9em;
  color: var(--color-text-primary); /* اضافه شد */
}

.new-group-input input[type='text'] {
  padding: 8px;
  border: 1px solid var(--color-border-medium); /* تغییر کرد */
  border-radius: 4px;
  background-color: var(--color-background-light); /* اضافه شد */
  color: var(--color-text-primary); /* اضافه شد */
}

.addresses-section {
  border: 1px dashed var(--color-border-medium); /* تغییر کرد */
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  background-color: var(--color-background-darker-light); /* تغییر کرد */
}

.addresses-section > label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
  color: var(--color-text-primary); /* اضافه شد */
  border-bottom: 1px solid var(--color-border-medium); /* تغییر کرد */
  padding-bottom: 5px;
}

.address-input-block {
  border: 1px solid var(--color-border-medium); /* تغییر کرد */
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  background-color: var(--color-background-light); /* تغییر کرد */
  position: relative;
  box-shadow: 0 1px 3px var(--color-shadow-light); /* اضافه شد */
}

.address-inputs {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(
    auto-fit,
    minmax(150px, 1fr)
  );
  margin-bottom: 10px;
}

.address-inputs select,
.address-inputs input[type='text'],
.address-inputs textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 8px;
  border: 1px solid var(--color-border-medium); /* تغییر کرد */
  border-radius: 4px;
  background-color: var(--color-background-light); /* اضافه شد */
  color: var(--color-text-primary); /* اضافه شد */
}

.address-inputs textarea {
  grid-column: span 2;
  min-height: 60px;
  resize: vertical;
}

.remove-address-button {
  position: absolute;
  top: 5px;
  left: 5px;
  background-color: var(--el-color-danger); /* از متغیر Element Plus */
  color: var(--el-color-white);
  width: 25px;
  height: 25px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: none;
  font-size: 0.8em;
  line-height: 1;
}

.remove-address-button:hover {
  background-color: var(--el-color-danger-dark-2); /* از متغیر Element Plus */
}

.add-address-button {
  background-color: var(--el-color-info); /* از متغیر Element Plus */
  color: var(--el-color-white);
  width: auto;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-address-button:hover {
  background-color: var(--el-color-info-dark-2); /* از متغیر Element Plus */
}

.contact-form {
  max-width: 600px;
  margin: 20px auto;
  padding: 25px;
  border: 1px solid var(--color-border-medium); /* تغییر کرد */
  border-radius: 10px;
  background-color: var(--color-background-darker-light); /* تغییر کرد */
  box-shadow: 0 2px 8px var(--color-shadow); /* تغییر کرد */
}

.contact-form h2 {
  text-align: center;
  margin-bottom: 25px;
  color: var(--color-text-primary); /* تغییر کرد */
}

.form-group {
  margin-bottom: 20px;
}

.form-group label, .checkbox-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--color-text-secondary); /* تغییر کرد */
  font-size: 0.95em;
}

.form-input,
.form-select,
.form-textarea,
.form-datepicker
 {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border-medium); /* تغییر کرد */
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 1em;
  transition: border-color 0.2s ease-in-out;
  background-color: var(--color-background-light); /* اضافه شد */
  color: var(--color-text-primary); /* اضافه شد */
}
.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--color-link-primary); /* تغییر کرد */
  outline: none;
  box-shadow: 0 0 0 0.2rem var(--color-shadow-focus); /* تغییر کرد */
}

.form-datepicker {
    width: 100%;
}
:deep(.form-datepicker .vpd-input-group input) {
    padding: 10px 12px;
    border: 1px solid var(--color-border-medium); /* تغییر کرد */
    border-radius: 6px;
    font-size: 1em;
    width: 100%;
    box-sizing: border-box;
    background-color: var(--color-background-light); /* اضافه شد */
    color: var(--color-text-primary); /* اضافه شد */
}
:deep(.form-datepicker .vpd-input-group input:focus){
    border-color: var(--color-link-primary); /* تغییر کرد */
    outline: none;
    box-shadow: 0 0 0 0.2rem var(--color-shadow-focus); /* تغییر کرد */
}


.checkbox-wrapper {
  display: flex;
  align-items: center;
}
.form-checkbox {
  margin-right: 8px;
  width: auto;
  transform: scale(1.2);
}
.checkbox-label {
    margin-bottom: 0;
    font-weight: normal;
    color: var(--color-text-primary); /* اضافه شد */
}


.custom-fields-wrapper {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px dashed var(--color-border-medium); /* تغییر کرد */
}
.custom-fields-wrapper h3 {
  margin-bottom: 15px;
  font-size: 1.2em;
  color: var(--color-text-primary); /* تغییر کرد */
}
.custom-field-group {
    background-color: var(--color-background-light); /* تغییر کرد */
    padding: 15px;
    border-radius: 6px;
    border: 1px solid var(--color-border-light); /* تغییر کرد */
    margin-bottom: 15px;
    box-shadow: 0 1px 3px var(--color-shadow-light); /* اضافه شد */
}


.form-section {
    margin-top: 20px;
    padding: 15px;
    border: 1px solid var(--color-border-medium); /* تغییر کرد */
    border-radius: 8px;
    background-color: var(--color-background-light); /* تغییر کرد */
    box-shadow: 0 1px 3px var(--color-shadow-light); /* اضافه شد */
}
.form-section h4 {
    margin-top: 0;
    margin-bottom: 15px;
    color: var(--color-text-primary); /* تغییر کرد */
    border-bottom: 1px solid var(--color-border-light); /* تغییر کرد */
    padding-bottom: 10px;
}
.item-block {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px dotted var(--color-border-light); /* تغییر کرد */
}
.item-block:last-child {
    border-bottom: none;
    margin-bottom: 0;
}
.item-select {
    flex-basis: 120px;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid var(--color-border-medium); /* تغییر کرد */
    background-color: var(--color-background-light); /* اضافه شد */
    color: var(--color-text-primary); /* اضافه شد */
}
.item-input {
    flex-grow: 1;
    min-width: 150px;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid var(--color-border-medium); /* تغییر کرد */
    background-color: var(--color-background-light); /* اضافه شد */
    color: var(--color-text-primary); /* اضافه شد */
}
.item-input-sml {
    flex-basis: 100px;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid var(--color-border-medium); /* تغییر کرد */
    background-color: var(--color-background-light); /* اضافه شد */
    color: var(--color-text-primary); /* اضافه شد */
}
.item-textarea {
    flex-basis: 100%;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid var(--color-border-medium); /* تغییر کرد */
    background-color: var(--color-background-light); /* اضافه شد */
    color: var(--color-text-primary); /* اضافه شد */
}

.add-item-btn, .remove-item-btn {
    padding: 6px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
}
.add-item-btn {
    background-color: var(--el-color-success); /* از متغیر Element Plus */
    color: var(--el-color-white);
}
.remove-item-btn {
    background-color: var(--el-color-danger); /* از متغیر Element Plus */
    color: var(--el-color-white);
    margin-right: auto;
}


.form-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.submit-btn, .cancel-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.submit-btn {
  background-color: var(--color-link-primary); /* تغییر کرد */
  color: white;
}
.submit-btn:hover:not(:disabled) {
  background-color: var(--color-link-hover); /* تغییر کرد */
}
.submit-btn:disabled {
  background-color: var(--color-button-disabled-bg); /* تغییر کرد */
  color: var(--color-button-disabled-text); /* اضافه شد */
}
.cancel-btn {
  background-color: var(--color-text-tertiary); /* تغییر کرد */
  color: white;
}
.cancel-btn:hover {
  background-color: var(--color-text-secondary); /* تغییر کرد */
}

.error-message {
  color: var(--color-error-text); /* تغییر کرد */
  background-color: var(--el-color-danger-light-9); /* از متغیر Element Plus */
  border: 1px solid var(--el-color-danger-light-7); /* از متغیر Element Plus */
  padding: 10px;
  border-radius: 5px;
  margin-top: 15px;
  text-align: center;
}
.unsupported-field-type {
    color: var(--color-text-tertiary); /* تغییر کرد */
    font-style: italic;
}

</style>