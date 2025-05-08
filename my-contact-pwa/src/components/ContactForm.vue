<template>
  <form @submit.prevent="handleSubmit">
    <h2>{{ contactStore.contactToEdit ? 'ویرایش مخاطب' : 'افزودن مخاطب جدید' }}</h2>

    <div>
      <label for="name">نام:</label>
      <input type="text" id="name" v-model="name" required />
    </div>
    <div>
      <label for="lastName">نام خانوادگی:</label>
      <input type="text" id="lastName" v-model="lastName" required />
    </div>
    <div>
      <label for="phone">تلفن اصلی:</label>
      <input type="text" id="phone" v-model="phone" required />
    </div>

    <div>
      <label for="title">سمت/تخصص:</label>
      <input type="text" id="title" v-model="title" />
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

    <div>
      <label for="group">گروه:</label>
      <select id="group" v-model="contactGroup">
        <option value="">بدون گروه</option>
        <option v-for="group in groupStore.sortedGroups" :key="group.id" :value="group.name">
          {{ group.name }}
        </option>
        <option value="__CREATE_NEW__">--- ایجاد گروه جدید ... ---</option>
      </select>

      <div v-if="isCreatingNewGroup" class="new-group-input">
        <label for="newGroupName">نام گروه جدید:</label>
        <input type="text" id="newGroupName" v-model="newGroupName" placeholder="مثلاً: خانواده" />
      </div>
    </div>
    <div class="addresses-section">
      <label>آدرس‌ها:</label>
      <div
        v-for="(address, index) in contactAddresses"
        :key="address.id"
        class="address-input-block"
      >
        <div class="address-inputs">
          <select v-model="address.type">
            <option value="">نوع</option>
            <option value="home">منزل</option>
            <option value="work">محل کار</option>
            <option value="other">دیگر</option>
          </select>
          <input type="text" v-model="address.street" placeholder="خیابان/کوچه" />
          <input type="text" v-model="address.city" placeholder="شهر" />
          <input type="text" v-model="address.province" placeholder="استان" />
          <input type="text" v-model="address.country" placeholder="کشور" />
          <input type="text" v-model="address.postalCode" placeholder="کد پستی" />
          <textarea v-model="address.notes" placeholder="یادداشت آدرس"></textarea>
        </div>
        <button type="button" class="remove-address-button" @click="removeAddress(address.id)">
          X
        </button>
      </div>
      <button type="button" class="add-address-button" @click="addAddress">
        + افزودن آدرس دیگر
      </button>
    </div>

    <div class="additional-phones-section">
      <label>شماره‌های اضافی:</label>
      <div
        v-for="(phone, index) in additionalPhones"
        :key="phone.id"
        class="additional-phone-input"
      >
        <select v-model="phone.type">
          <option value="">نوع</option>
          <option value="mobile">موبایل</option>
          <option value="home">منزل</option>
          <option value="work">محل کار</option>
          <option value="office">مطب/دفتر</option>
          <option value="fax">فکس</option>
          <option value="other">دیگر</option>
        </select>
        <input type="text" v-model="phone.number" :placeholder="'شماره ' + (index + 1)" />
        <button type="button" class="remove-phone-button" @click="removeAdditionalPhone(phone.id)">
          X
        </button>
      </div>
      <button type="button" class="add-phone-button" @click="addAdditionalPhone">
        + افزودن شماره دیگر
      </button>
    </div>

    <div>
      <label for="birthDate">تاریخ تولد:</label>
      <date-picker
        v-model="birthDate"
        type="date"
        placeholder="انتخاب تاریخ تولد"
        locale="fa"
        calendar="persian"
        auto-submit
        no-input
      >
        <template #trigger>
          <input type="text" :value="birthDate" readonly placeholder="انتخاب تاریخ تولد" />
        </template>
      </date-picker>
    </div>

    <div>
      <label for="notes">یادداشت/توضیحات:</label>
      <textarea id="notes" v-model="notes"></textarea>
    </div>

    <button type="submit" :disabled="contactStore.loading || groupStore.loading">
      {{
        contactStore.loading || groupStore.loading
          ? 'در حال پردازش...'
          : contactStore.contactToEdit
            ? 'به‌روزرسانی مخاطب'
            : 'ذخیره مخاطب'
      }}
    </button>

    <button
      v-if="contactStore.contactToEdit"
      type="button"
      @click="contactStore.clearContactToEdit()"
    >
      انصراف
    </button>

    <p v-if="contactStore.error" style="color: red">{{ contactStore.error }}</p>
    <p v-if="groupStore.error" style="color: red">{{ groupStore.error }}</p>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useContactStore } from '../store/contacts'
import { useGroupStore } from '../store/groups'
import DatePicker from 'vue3-persian-datetime-picker' // <-- این خط رو اصلاح کن
import moment from 'moment-jalaali'
const contactStore = useContactStore()
const groupStore = useGroupStore()
const contactAddresses = ref([]) // متغیر واکنشی برای آدرس‌ها
let addressIdCounter = 0 // برای تولید ID موقت آدرس
const name = ref('')
const lastName = ref('')
const phone = ref('')
const title = ref('')
const gender = ref('')
const notes = ref('')
const additionalPhones = ref([])
let phoneIdCounter = 0
const contactGroup = ref('')
const isCreatingNewGroup = ref(false) // آیا در حال ایجاد گروه جدید هستیم؟
const newGroupName = ref('') // اسم گروه جدید که کاربر وارد می‌کنه
const birthDate = ref(null) // <-- متغیر جدید برای تاریخ تولد (null یعنی خالی)
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

// تابع برای پاک کردن فرم (به‌روزرسانی شده برای فیلدهای جدید)
const clearForm = () => {
  name.value = ''
  lastName.value = ''
  phone.value = ''
  title.value = ''
  gender.value = ''
  notes.value = ''
  additionalPhones.value = [] // پاک کردن شماره‌های اضافی
  phoneIdCounter = 0 // ریست کردن کانتر
  contactGroup.value = ''
  isCreatingNewGroup.value = false // <-- ریست وضعیت
  newGroupName.value = '' // <-- ریست اسم گروه جدید
  groupStore.error = null
  contactAddresses.value = [] // <-- پاک کردن آدرس‌ها
  addressIdCounter = 0 // <-- ریست کردن کانتر
  birthDate.value = null // <-- پاک کردن فیلد تاریخ تولد
}

// استفاده از watch برای واکنش نشان دادن به تغییرات contactStore.contactToEdit
watch(
  () => contactStore.contactToEdit,
  (newContactToEdit) => {
    console.log('Watcher triggered. Contact to edit:', newContactToEdit)
    if (newContactToEdit) {
      console.log('In edit mode. Loaded birthDate raw:', newContactToEdit.birthDate)

      name.value = newContactToEdit.name || ''
      lastName.value = newContactToEdit.lastName || ''
      phone.value = newContactToEdit.phone || ''
      title.value = newContactToEdit.title || ''
      gender.value = newContactToEdit.gender || ''
      notes.value = newContactToEdit.notes || ''
      additionalPhones.value = newContactToEdit.additionalPhones
        ? newContactToEdit.additionalPhones.map((item) => ({
            // هر آیتم حالا { type, number } هست توی DB
            id: generateUniquePhoneId(), // تولید ID جدید برای فرم
            type: item.type || '', // مقدار type
            number: item.number || '', // مقدار number
          }))
        : [] // اگر additionalPhones وجود نداشت یا خالی بود، آرایه خالی بذار

      contactGroup.value = newContactToEdit.group || ''
      isCreatingNewGroup.value = false // در حالت ویرایش همیشه فرض می‌کنیم در حال ایجاد گروه جدید نیستیم
      newGroupName.value = ''
      groupStore.error = null
      contactAddresses.value = newContactToEdit.addresses
        ? newContactToEdit.addresses.map((item) => ({
            // هر آیتم حالا { type, street, city, ... } هست توی DB
            id: generateUniqueAddressId(), // تولید ID جدید برای فرم
            type: item.type || '',
            street: item.street || '',
            city: item.city || '',
            province: item.province || '',
            country: item.country || '',
            postalCode: item.postalCode || '',
            notes: item.notes || '',
          }))
        : [] // اگر addresses وجود نداشت یا خالی بود، آرایه خالی بذار
      if (newContactToEdit.birthDate) {
        try {
          // Attempt to parse the saved Gregorian ISO string with Moment
          const momentObj = moment(newContactToEdit.birthDate)

          // If parsing results in a valid Moment object
          if (momentObj.isValid()) {
            // *** تبدیل به رشته SHAMSI در فرمت 'jYYYY/jMM/jDD' برای v-model پیکر ***
            const formattedShamsiDate = momentObj.format('jYYYY/jMM/jDD') // <-- تبدیل به رشته شمسی
            birthDate.value = formattedShamsiDate // <-- تخصیص رشته شمسی به v-model پیکر
            console.log(
              'Loaded birthDate formatted for picker (Shamsi jYYYY/jMM/jDD):',
              birthDate.value,
            ) // لاگ نهایی
          } else {
            console.error(
              'Loaded birthDate string resulted in invalid Moment object during check:',
              newContactToEdit.birthDate,
            )
            birthDate.value = null // Set to null if invalid
          }
        } catch (e) {
          console.error('Error processing loaded birthDate string:', e)
          birthDate.value = null // Set to null on error
        }
      } else {
        console.log('No birthDate found on loaded contact.')
        birthDate.value = null
      }
    } else {
      console.log('Watcher: Not in edit mode, clearing form.')
      clearForm()
    }
  },
  { immediate: true },
)

watch(contactGroup, (newValue) => {
  if (newValue === '__CREATE_NEW__') {
    isCreatingNewGroup.value = true // گزینه "ایجاد گروه جدید" انتخاب شده، input رو نمایش بده
    newGroupName.value = '' // اسم گروه جدید رو برای ورودی کاربر خالی کن
    // نیازی نیست contactGroup رو اینجا تغییر بدی، v-model این کار رو کرده
  } else {
    isCreatingNewGroup.value = false // یه گروه موجود یا "بدون گروه" انتخاب شده، input رو پنهان کن
    newGroupName.value = '' // اسم گروه جدید رو پاک کن
    groupStore.error = null // خطای گروه رو پاک کن
  }
})

// تابعی که هنگام ارسال فرم اجرا میشه (حالا هم برای افزودن هم ویرایش)
const handleSubmit = async () => {
  let finalContactGroup = contactGroup.value // اسم گروه نهایی که توی مخاطب ذخیره میشه، پیش‌فرض همون گروه انتخابی توی Select
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

  // مرحله 2: آماده‌سازی داده‌های مخاطب
  const phoneEntries = additionalPhones.value
    .map((item) => ({ type: item.type || '', number: item.number.trim() }))
    .filter((item) => item.number)

  const addressEntries = contactAddresses.value
    .map((item) => ({
      // هر آیتم فرم { id, type, street, ... } هست، به { type, street, ... } تبدیل می‌کنیم
      type: item.type || '',
      street: item.street || '',
      city: item.city || '',
      province: item.province || '',
      country: item.country || '',
      postalCode: item.postalCode || '',
      notes: item.notes || '',
    }))
    .filter((item) => item.street || item.city) // فقط آدرس‌هایی که خیابان یا شهرشون خالی نیست رو نگه می‌داریم
  // تبدیل تاریخ تولد از فرمت DatePicker به فرمت استاندارد میلادی برای ذخیره
  let gregorianBirthDate = null
  if (birthDate.value) {
    try {
      console.log('--- Date Conversion Debug (Moment-Jalaali) ---')
      console.log(
        'BirthDate value from picker:',
        birthDate.value,
        '| Type:',
        typeof birthDate.value,
      ) // 1. مقدار و نوع ورودی

      // استفاده از moment() برای ساخت شیء Moment از رشته شمسی و فرمت 'jYYYY/jMM/jDD'
      const momentObj = moment(birthDate.value, 'jYYYY/jMM/jDD')

      console.log('Moment object after parsing:', momentObj) // 2. شیء Moment

      // اعتبارسنجی شیء Moment
      if (momentObj.isValid()) {
        // 3. استفاده از متد isValid() Moment
        console.log('Moment object is valid.') // 4. معتبر بودن

        // تبدیل به رشته میلادی با فرمت YYYY-MM-DD
        const gregorianString = momentObj.format('YYYY-MM-DD') // 5. تبدیل به رشته میلادی
        console.log('Converted Gregorian YYYY-MM-DD string:', gregorianString)

        // برای ذخیره در دیتابیس، بهتره از ISO string استفاده کنیم.
        // moment().toISOString() به طور پیش‌فرض به ISO string تبدیل می‌کنه
        // اما برای اطمینان بیشتر از منطقه زمانی، می‌تونیم UTC کنیم:
        gregorianBirthDate = momentObj.toISOString() // یا momentObj.utc().toISOString(); برای UTC
        // اگر فقط YYYY-MM-DD بدون زمان نیازه، میتونیم از format استفاده کنیم:
        // gregorianBirthDate = momentObj.format('YYYY-MM-DD'); // برای ذخیره به صورت رشته YYYY-MM-DD

        console.log('Final Gregorian ISO string for saving:', gregorianBirthDate) // 6. رشته نهایی برای ذخیره
      } else {
        console.error('Moment-Jalaali could not parse date:', birthDate.value) // 7. مشکل در parsing
        contactStore.error = 'فرمت تاریخ تولد صحیح نیست.'
        // return; // موقتاً return رو برداشتم
      }
    } catch (e) {
      console.error('Error caught during date conversion process (Moment-Jalaali):', e) // 8. خطایی در try/catch
      contactStore.error = 'مشکل داخلی در پردازش تاریخ تولد.'
      // return; // موقتاً return رو برداشتم
    }
  } else {
    console.log('BirthDate value is null or empty.')
  }
  console.log('--- End Date Conversion Debug (Moment-Jalaali) ---')

  const contactData = {
    name: name.value,
    lastName: lastName.value,
    phone: phone.value,
    title: title.value,
    gender: gender.value,
    notes: notes.value,
    additionalPhones: phoneEntries,
    group: finalContactGroup, // <-- استفاده از اسم گروه نهایی شده
    addresses: addressEntries,
    birthDate: gregorianBirthDate, // <-- ذخیره تاریخ تولد میلادی استاندارد
    createdAt: contactStore.contactToEdit
      ? contactStore.contactToEdit.createdAt
      : new Date().toISOString(), // تاریخ ایجاد رو در حالت ویرایش حفظ کن
    updatedAt: new Date().toISOString(),
    // ... فیلدهای دیگه ...
  }

  // پاک کردن خطای گروه اگر در حالت ایجاد گروه جدید نبودیم و خطا وجود داشت
  // (این خطا ممکنه از تلاش برای ایجاد گروه تکراری در گذشته مونده باشه)
  if (groupStore.error && !isCreatingNewGroup.value) {
    groupStore.error = null
  }

  // مرحله 3: اضافه یا به‌روزرسانی مخاطب
  if (contactStore.contactToEdit) {
    // اگر در حالت ویرایش هستیم
    const contactId = contactStore.contactToEdit.id
    contactData.updatedAt = new Date().toISOString()

    await contactStore.updateContact(contactId, contactData)

    if (!contactStore.error) {
      alert('مخاطب با موفقیت به‌روزرسانی شد!')
      contactStore.clearContactToEdit() // این تابع وضعیت ایجاد گروه جدید رو هم ریست می‌کنه
    }
  } else {
    // اگر در حالت افزودن هستیم
    contactData.createdAt = new Date().toISOString()
    contactData.updatedAt = new Date().toISOString()

    await contactStore.addContact(contactData)

    if (!contactStore.error) {
      alert('مخاطب با موفقیت اضافه شد!')
      clearForm() // این تابع وضعیت ایجاد گروه جدید رو هم ریست می‌کنه
    }
  }
}
</script>

<style scoped>
.additional-phones-section {
  border: 1px dashed #ccc; /* کادر نقطه‌چین */
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  background-color: #f1f1f1; /* پس زمینه کمی خاکستری */
}

.additional-phones-section > label {
  /* استایل Label اصلی بخش */
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
.additional-phone-input input[type='text'] {
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

input[type='text'],
select,
textarea {
  /* استایل input, select و textarea */
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

button[type='button'] {
  background-color: #6c757d;
  color: white;
}

button[type='button']:hover:not(:disabled) {
  background-color: #5a6268;
}
/* استایل برای فیلد ورودی اسم گروه جدید */
.new-group-input {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
}

.new-group-input label {
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 0.9em; /* کوچکتر از label اصلی */
}

.new-group-input input[type='text'] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.addresses-section {
  border: 1px dashed #a0a0a0; /* کادر نقطه‌چین */
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  background-color: #f8f8f8; /* پس زمینه کمی خاکستری روشن */
}

.addresses-section > label {
  /* استایل Label اصلی بخش */
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
  border-bottom: 1px solid #a0a0a0;
  padding-bottom: 5px;
}

.address-input-block {
  border: 1px solid #ddd; /* کادر برای هر بلوک آدرس */
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  background-color: #fff; /* پس زمینه سفید برای هر آدرس */
  position: relative; /* برای موقعیت‌دهی دکمه حذف */
}

.address-inputs {
  display: grid; /* استفاده از Grid برای چیدمان فیلدهای آدرس */
  gap: 10px; /* فاصله بین فیلدها */
  /* تعریف ستون‌ها - می‌تونی بر اساس نیاز و طراحی تغییر بدی */
  grid-template-columns: repeat(
    auto-fit,
    minmax(150px, 1fr)
  ); /* حداقل عرض 150px، هر چقدر جا بود ستون اضافه کنه */
  margin-bottom: 10px; /* فاصله پایین از دکمه حذف */
}

.address-inputs select,
.address-inputs input[type='text'],
.address-inputs textarea {
  width: 100%; /* عرض کامل در سلول گرید */
  box-sizing: border-box;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.address-inputs textarea {
  grid-column: span 2; /* Textarea دو ستون رو بگیره (میتونی تنظیم کنی) */
  min-height: 60px;
  resize: vertical;
}

/* استایل دکمه حذف کنار هر بلوک آدرس */
.remove-address-button {
  position: absolute; /* موقعیت مطلق */
  top: 5px; /* فاصله از بالا */
  left: 5px; /* فاصله از چپ (برای زبان RTL) */
  background-color: #dc3545;
  color: white;
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
  line-height: 1; /* برای هم‌تراز شدن متن X */
}

.remove-address-button:hover {
  background-color: #c82333;
}

/* استایل دکمه افزودن آدرس جدید */
.add-address-button {
  background-color: #17a2b8; /* رنگ آبی فیروزه‌ای */
  color: white;
  width: auto;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-address-button:hover {
  background-color: #138496;
}
</style>
