<template>
  <form @submit.prevent="handleSubmit" class="contact-form glass">
    <h2>
      <el-tooltip
        content="{{ contactStore.contactToEdit ? 'ویرایش مخاطب' : 'افزودن مخاطب جدید' }}"
        placement="top"
      >
        <el-icon style="vertical-align: middle; margin-left: 6px">
          <UserFilled />
        </el-icon>
      </el-tooltip>
      {{ contactStore.contactToEdit ? 'ویرایش مخاطب' : 'افزودن مخاطب جدید' }}
    </h2>

    <div class="main-fields-grid">
      <div class="form-group">
        <label for="name">
          <el-tooltip content="نام الزامی است" placement="top">
            <el-icon style="vertical-align: middle; margin-left: 4px"><EditPen /></el-icon>
          </el-tooltip>
          نام:
          <span class="required-star" title="فیلد اجباری">*</span>
        </label>
        <el-input
          id="name"
          v-model="name"
          required
          maxlength="50"
          class="flat-input"
          size="small"
        />
        <span v-if="nameError" class="field-error">{{ nameError }}</span>
      </div>
      <div class="form-group">
        <label for="lastName">
          <el-tooltip content="نام خانوادگی الزامی است" placement="top">
            <el-icon style="vertical-align: middle; margin-left: 4px"><EditPen /></el-icon>
          </el-tooltip>
          نام خانوادگی:
          <span class="required-star" title="فیلد اجباری">*</span>
        </label>
        <el-input
          id="lastName"
          v-model="lastName"
          required
          maxlength="50"
          class="flat-input"
          size="small"
        />
        <span v-if="lastNameError" class="field-error">{{ lastNameError }}</span>
      </div>
      <div class="form-group">
        <label for="phone">
          <el-tooltip content="شماره تلفن فقط باید شامل عدد و فاصله و + باشد" placement="top">
            <el-icon style="vertical-align: middle; margin-left: 4px"><Phone /></el-icon>
          </el-tooltip>
          تلفن اصلی:
          <span class="required-star" title="فیلد اجباری">*</span>
        </label>
        <el-input
          id="phone"
          v-model="phone"
          required
          maxlength="20"
          class="flat-input"
          size="small"
        />
        <span v-if="phoneError" class="field-error">{{ phoneError }}</span>
      </div>
      <div class="form-group">
        <label for="title">
          <el-icon style="vertical-align: middle; margin-left: 4px"><Briefcase /></el-icon>
          سمت/تخصص:
        </label>
        <el-input id="title" v-model="title" class="flat-input" size="small" />
      </div>
      <div class="form-group">
        <label for="gender">
          <el-icon style="vertical-align: middle; margin-left: 4px"><User /></el-icon>
          جنسیت:
        </label>
        <el-select
          id="gender"
          v-model="gender"
          class="flat-select"
          size="small"
          placeholder="انتخاب کنید"
        >
          <el-option value="" label="انتخاب کنید" />
          <el-option value="male" label="♂️ آقا" />
          <el-option value="female" label="♀️ خانم" />
          <el-option value="other" label="غیره" />
          <el-option value="not_specified" label="ترجیح میدهم نگویم" />
        </el-select>
      </div>
      <div class="form-group">
        <label for="group">
          <el-icon style="vertical-align: middle; margin-left: 4px"><Collection /></el-icon>
          گروه:
        </label>
        <el-select
          id="group"
          v-model="contactGroup"
          class="flat-select"
          size="small"
          placeholder="بدون گروه"
        >
          <el-option value="" label="بدون گروه" />
          <el-option
            v-for="g in groupStore.sortedGroups"
            :key="g.id"
            :value="g.name"
            :label="g.name"
          />
          <el-option value="__CREATE_NEW__" label="--- ایجاد گروه جدید ---" />
        </el-select>
        <div v-if="isCreatingNewGroup" class="new-group-input">
          <label for="newGroupName">
            <el-icon style="vertical-align: middle; margin-left: 4px"><Plus /></el-icon>
            نام گروه جدید:
          </label>
          <el-input
            id="newGroupName"
            v-model="newGroupName"
            placeholder="مثلاً: دوستان"
            class="flat-input"
            size="small"
          />
        </div>
      </div>
      <div class="form-group">
        <label for="birthDate">
          <el-icon style="vertical-align: middle; margin-left: 4px"><Calendar /></el-icon>
          تاریخ تولد:
        </label>
        <date-picker
          v-model="birthDate"
          id="birthDate"
          type="date"
          format="jYYYY/jMM/jDD"
          display-format="jYYYY/jMM/jDD"
          placeholder="تاریخ تولد را انتخاب کنید"
          clearable
          class="flat-input"
        ></date-picker>
      </div>
    </div>

    <div v-if="sortedCustomFieldDefinitions.length > 0" class="custom-fields-wrapper">
      <h3>
        <el-icon style="vertical-align: middle; margin-left: 6px"><Setting /></el-icon>
        فیلدهای سفارشی
      </h3>
      <div
        v-for="fieldDef in sortedCustomFieldDefinitions"
        :key="fieldDef.id"
        class="form-group custom-field-group"
      >
        <label :for="'custom-field-' + fieldDef.id">
          <el-icon v-if="fieldDef.type === 'date'" style="vertical-align: middle; margin-left: 4px"
            ><Calendar
          /></el-icon>
          <el-icon
            v-else-if="fieldDef.type === 'number'"
            style="vertical-align: middle; margin-left: 4px"
            ><Coin
          /></el-icon>
          <el-icon
            v-else-if="fieldDef.type === 'boolean'"
            style="vertical-align: middle; margin-left: 4px"
            ><SwitchButton
          /></el-icon>
          <el-icon
            v-else-if="fieldDef.type === 'select'"
            style="vertical-align: middle; margin-left: 4px"
            ><List
          /></el-icon>
          <el-icon v-else style="vertical-align: middle; margin-left: 4px"><Edit /></el-icon>
          {{ fieldDef.label }}:
        </label>
        <el-input
          v-if="fieldDef.type === 'text'"
          type="text"
          :id="'custom-field-' + fieldDef.id"
          v-model="customFieldValues[fieldDef.id]"
          class="flat-input"
          size="small"
        />
        <el-input
          v-else-if="fieldDef.type === 'textarea'"
          type="textarea"
          :id="'custom-field-' + fieldDef.id"
          v-model="customFieldValues[fieldDef.id]"
          class="flat-input"
          autosize
          rows="3"
        />
        <el-input
          v-else-if="fieldDef.type === 'number'"
          type="number"
          :id="'custom-field-' + fieldDef.id"
          v-model.number="customFieldValues[fieldDef.id]"
          class="flat-input"
          size="small"
        />
        <date-picker
          v-else-if="fieldDef.type === 'date'"
          v-model="customFieldValues[fieldDef.id]"
          :id="'custom-field-' + fieldDef.id"
          type="date"
          format="YYYY-MM-DD"
          display-format="jYYYY/jMM/jDD"
          placeholder="تاریخ را انتخاب کنید"
          class="flat-input"
          clearable
        ></date-picker>
        <div v-else-if="fieldDef.type === 'boolean'" class="checkbox-wrapper">
          <el-checkbox
            :id="'custom-field-' + fieldDef.id"
            v-model="customFieldValues[fieldDef.id]"
            class="flat-checkbox"
          >
            {{ fieldDef.label }}
          </el-checkbox>
        </div>
        <el-select
          v-else-if="fieldDef.type === 'select'"
          :id="'custom-field-' + fieldDef.id"
          v-model="customFieldValues[fieldDef.id]"
          class="flat-select"
          size="small"
          placeholder="انتخاب کنید..."
        >
          <el-option value="" label="انتخاب کنید..." />
          <el-option
            v-for="option in fieldDef.options"
            :key="option"
            :value="option"
            :label="option"
          />
        </el-select>
        <small v-else class="unsupported-field-type"
          >نوع فیلد "{{ fieldDef.type }}" پشتیبانی نمی‌شود.</small
        >
      </div>
    </div>
    <div class="form-section additional-items-section">
      <h4>
        <el-icon style="vertical-align: middle; margin-left: 6px"><Location /></el-icon>
        آدرس‌ها
      </h4>
      <div
        v-for="(address, index) in contactAddresses"
        :key="address.id"
        class="item-block address-grid"
      >
        <div class="address-field">
          <label>
            <el-icon style="vertical-align: middle; margin-left: 2px"><Location /></el-icon>
            نوع آدرس:
          </label>
          <el-select
            v-model="address.type"
            class="flat-select compact-select"
            size="small"
            placeholder="نوع آدرس"
            :popper-append-to-body="false"
          >
            <el-option value="" label="نوع آدرس" />
            <el-option value="home" label="🏠 منزل" />
            <el-option value="work" label="💼 محل کار" />
            <el-option value="other" label="🔗 دیگر" />
          </el-select>
        </div>
        <div class="address-field">
          <label
            ><el-icon style="vertical-align: middle; margin-left: 2px"><EditPen /></el-icon>
            خیابان:</label
          >
          <el-input
            v-model="address.street"
            placeholder="خیابان"
            size="small"
            class="flat-input compact-input"
            :prefix-icon="EditPen"
            clearable
          />
        </div>
        <div class="address-field">
          <label
            ><el-icon style="vertical-align: middle; margin-left: 2px"><Location /></el-icon>
            شهر:</label
          >
          <el-input
            v-model="address.city"
            placeholder="شهر"
            size="small"
            class="flat-input compact-input"
            :prefix-icon="Location"
            clearable
          />
        </div>
        <div class="address-field">
          <label
            ><el-icon style="vertical-align: middle; margin-left: 2px"><Location /></el-icon>
            استان:</label
          >
          <el-input
            v-model="address.province"
            placeholder="استان"
            size="small"
            class="flat-input compact-input"
            :prefix-icon="Location"
            clearable
          />
        </div>
        <div class="address-field">
          <label
            ><el-icon style="vertical-align: middle; margin-left: 2px"><Location /></el-icon>
            کشور:</label
          >
          <el-input
            v-model="address.country"
            placeholder="کشور"
            size="small"
            class="flat-input compact-input"
            :prefix-icon="Location"
            clearable
          />
        </div>
        <div class="address-field">
          <label
            ><el-icon style="vertical-align: middle; margin-left: 2px"><EditPen /></el-icon>
            کدپستی:</label
          >
          <el-input
            v-model="address.postalCode"
            placeholder="کدپستی"
            size="small"
            class="flat-input compact-input"
            :prefix-icon="EditPen"
            clearable
          />
        </div>
        <div class="address-field address-notes-field" style="grid-column: span 3">
          <label
            ><el-icon style="vertical-align: middle; margin-left: 2px"><Document /></el-icon>
            یادداشت آدرس:</label
          >
          <el-input
            v-model="address.notes"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="یادداشت آدرس"
            size="small"
            class="flat-input compact-input"
            :prefix-icon="Document"
            clearable
          />
        </div>
        <button
          type="button"
          @click="removeAddress(address.id)"
          class="remove-item-btn"
          title="حذف آدرس"
        >
          <el-icon><DeleteFilled /></el-icon>
        </button>
      </div>
      <el-button
        type="success"
        size="small"
        @click="addAddress"
        class="add-item-btn flat-input"
        plain
        :icon="Plus"
        style="margin-top: 0"
      >
        افزودن آدرس
      </el-button>
    </div>

    <div class="form-section additional-items-section">
      <h4>
        <el-icon style="vertical-align: middle; margin-left: 6px"><Phone /></el-icon>
        شماره‌های اضافی
      </h4>
      <div
        v-for="(phoneItem, index) in additionalPhones"
        :key="phoneItem.id"
        class="item-block additional-phones-grid"
      >
        <el-select
          v-model="phoneItem.type"
          class="flat-select item-select"
          size="small"
          placeholder="نوع شماره"
        >
          <el-option value="" label="نوع شماره" />
          <el-option value="mobile" label="📱 موبایل" />
          <el-option value="home" label="🏠 منزل" />
          <el-option value="work" label="💼 محل کار" />
          <el-option value="fax" label="📠 فکس" />
          <el-option value="other" label="🔗 دیگر" />
        </el-select>
        <el-input
          type="text"
          v-model="phoneItem.number"
          placeholder="شماره تلفن"
          class="flat-input item-input"
          size="small"
        />
        <button
          type="button"
          @click="removeAdditionalPhone(phoneItem.id)"
          class="remove-item-btn"
          title="حذف شماره"
        >
          <el-icon><DeleteFilled /></el-icon>
        </button>
      </div>
      <el-button
        type="success"
        size="small"
        @click="addAdditionalPhone"
        class="add-item-btn flat-input"
        plain
        :icon="Plus"
        style="margin-top: 0"
      >
        افزودن شماره
      </el-button>
    </div>

    <div class="form-group">
      <label for="notes">
        <el-tooltip content="حداکثر 500 کاراکتر" placement="top">
          <el-icon style="vertical-align: middle; margin-left: 4px"><Document /></el-icon>
        </el-tooltip>
        یادداشت/توضیحات:
      </label>
      <el-input
        id="notes"
        v-model="notes"
        type="textarea"
        rows="4"
        class="flat-input"
        maxlength="500"
        autosize
      />
      <span class="char-counter">({{ notes.length }}/500)</span>
    </div>

    <div class="form-actions">
      <el-button
        type="primary"
        :loading="contactStore.loading || groupStore.loading"
        native-type="submit"
        class="submit-btn"
        :disabled="contactStore.loading || groupStore.loading"
      >
        <el-icon style="vertical-align: middle; margin-left: 4px">
          <Check />
        </el-icon>
        {{ contactStore.contactToEdit ? 'به‌روزرسانی مخاطب' : 'ذخیره مخاطب' }}
      </el-button>
      <el-button
        v-if="contactStore.contactToEdit"
        type="info"
        @click="clearFormAndResetEdit"
        class="cancel-btn"
      >
        <el-icon style="vertical-align: middle; margin-left: 4px"><CloseBold /></el-icon>
        انصراف (بازگشت به افزودن جدید)
      </el-button>
      <el-button
        v-if="!contactStore.contactToEdit"
        type="default"
        @click="router.push({ name: 'contact-list' })"
        class="cancel-btn"
      >
        بازگشت به لیست
      </el-button>
    </div>

    <p v-if="contactStore.error" class="error-message">
      <el-icon style="vertical-align: middle; margin-left: 4px"><WarningFilled /></el-icon>
      {{ contactStore.error }}
    </p>
    <p v-if="groupStore.error" class="error-message">
      <el-icon style="vertical-align: middle; margin-left: 4px"><WarningFilled /></el-icon>
      {{ groupStore.error }}
    </p>
  </form>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router' // برای ناوبری بعد از ذخیره
import { useCustomFieldStore } from '../store/customFields' // <-- Store فیلدهای سفارشی
import { useContactStore } from '../store/contacts'
import { useGroupStore } from '../store/groups'
import DatePicker from 'vue3-persian-datetime-picker' // <-- این خط رو اصلاح کن
import moment from 'moment-jalaali'
import { ElNotification, ElTooltip, ElInput, ElSelect, ElOption, ElCheckbox } from 'element-plus'
import '@/assets/styles/glassmorphism.css'
import {
  UserFilled,
  EditPen,
  Phone,
  Briefcase,
  User,
  Collection,
  Plus,
  Calendar,
  Setting,
  Coin,
  SwitchButton,
  List,
  Location,
  DeleteFilled,
  Document,
  Check,
  CloseBold,
  WarningFilled,
} from '@element-plus/icons-vue'

const contactStore = useContactStore()
const groupStore = useGroupStore()
const customFieldStore = useCustomFieldStore() // <-- نمونه از Store
const router = useRouter()

// --- Local State for Form Fields (فیلدهای اصلی مخاطب) ---
const name = ref('')
const lastName = ref('')
const phone = ref('')
const title = ref('')
const gender = ref('')
const notes = ref('')
const contactGroup = ref('')
const birthDate = ref('') // برای تاریخ تولد اصلی - مقدار اولیه رشته خالی یا null

const nameError = ref('')
const lastNameError = ref('')
const phoneError = ref('')

// State برای شماره‌های اضافی
const additionalPhones = ref([]) // آرایه‌ای از آبجکت‌های { id (برای key در v-for), type, number }
let phoneIdCounter = 0 // برای تولید ID موقت برای v-for

// State برای آدرس‌ها
const contactAddresses = ref([]) // آرایه‌ای از آبجکت‌های { id (برای key در v-for), type, street, ... }
let addressIdCounter = 0 // برای تولید ID موقت برای v-for

// State برای ایجاد گروه جدید
const isCreatingNewGroup = ref(false)
const newGroupName = ref('')

// --- Local State for Custom Fields ---
const customFieldValues = ref({}) // آبجکتی که مقادیر فیلدهای سفارشی رو نگه میداره: { fieldDefId1: value1, fieldDefId2: value2 }

const sortedCustomFieldDefinitions = computed(() => customFieldStore.sortedFieldDefinitions || [])

// --- Helper Functions ---
const generateUniqueId = () => Date.now() + Math.random().toString(36).substring(2, 9)

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
      return ''
    case 'number':
      return null // یا 0
    case 'boolean':
      return false
    default:
      return undefined
  }
}

// ریست کردن مقادیر فیلدهای سفارشی به پیش‌فرض
const resetCustomFieldValues = () => {
  const newValues = {}
  if (sortedCustomFieldDefinitions.value && Array.isArray(sortedCustomFieldDefinitions.value)) {
    sortedCustomFieldDefinitions.value.forEach((def) => {
      newValues[def.id] = getDefaultValueForCustomFieldType(def.type)
    })
  }
  customFieldValues.value = newValues
  console.log('Custom field values reset:', customFieldValues.value)
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

// پاک کردن کل فرم
const clearForm = () => {
  name.value = ''
  lastName.value = ''
  phone.value = ''
  title.value = ''
  gender.value = ''
  notes.value = ''
  contactGroup.value = ''
  birthDate.value = '' // یا null

  additionalPhones.value = []
  contactAddresses.value = []

  isCreatingNewGroup.value = false
  newGroupName.value = ''
  groupStore.error = null // پاک کردن خطای گروه
  contactStore.error = null // پاک کردن خطای مخاطب

  resetCustomFieldValues() // <-- ریست کردن فیلدهای سفارشی
  contactStore.clearContactToEdit() // <-- پاک کردن مخاطب در حال ویرایش از store
}

const clearFormAndResetEdit = () => {
  clearForm()
  contactStore.clearContactToEdit()
}

// --- Watchers & Lifecycle Hooks ---
onMounted(() => {
  // اگر در حالت افزودن جدید هستیم و مخاطبی برای ویرایش انتخاب نشده، فرم و فیلدهای سفارشی رو ریست کن
  if (!contactStore.contactToEdit) {
    clearForm() // clearForm شامل resetCustomFieldValues هم میشه
  }
  // اگر تعاریف فیلدها هنوز لود نشدن، اینجا می‌تونستی لودشون کنی،
  // ولی فرض ما اینه که در App.vue لود میشن.
})

// استفاده از watch برای واکنش نشان دادن به تغییرات contactStore.contactToEdit
// این watch مهمترین بخش برای مقداردهی فرم در حالت افزودن/ویرایش هست
watch(
  () => contactStore.contactToEdit, // مانیتور کردن مخاطبی که برای ویرایش انتخاب شده
  (contactForEdit) => {
    console.log('ContactForm: contactToEdit watcher triggered. New contact:', contactForEdit)
    if (contactForEdit) {
      // --- حالت ویرایش ---
      name.value = contactForEdit.name || ''
      lastName.value = contactForEdit.lastName || ''
      phone.value = contactForEdit.phone || ''
      title.value = contactForEdit.title || ''
      gender.value = contactForEdit.gender || ''
      notes.value = contactForEdit.notes || ''
      contactGroup.value = contactForEdit.group || ''

      // تاریخ تولد اصلی
      if (contactForEdit.birthDate) {
        birthDate.value = moment(contactForEdit.birthDate).format('jYYYY/jMM/jDD')
      } else {
        birthDate.value = ''
      }

      // شماره‌های اضافی
      additionalPhones.value = contactForEdit.additionalPhones
        ? JSON.parse(JSON.stringify(contactForEdit.additionalPhones)).map((p) => ({
            ...p,
            id: generateUniqueId(),
          }))
        : []

      // آدرس‌ها
      contactAddresses.value = contactForEdit.addresses
        ? JSON.parse(JSON.stringify(contactForEdit.addresses)).map((a) => ({
            ...a,
            id: generateUniqueId(),
          }))
        : []

      // فیلدهای سفارشی
      const newCustomValues = {}
      if (sortedCustomFieldDefinitions.value && Array.isArray(sortedCustomFieldDefinitions.value)) {
        sortedCustomFieldDefinitions.value.forEach((def) => {
          const existingCustomField = contactForEdit.customFields?.find(
            (cf) => cf.fieldId === def.id,
          )
          if (existingCustomField) {
            if (def.type === 'date' && existingCustomField.value) {
              // مقدار تاریخ از دیتابیس (ISO string) باید به فرمت DatePicker تبدیل بشه
              newCustomValues[def.id] = moment(existingCustomField.value).format('YYYY-MM-DD')
            } else {
              newCustomValues[def.id] = existingCustomField.value
            }
          } else {
            newCustomValues[def.id] = getDefaultValueForCustomFieldType(def.type)
          }
        })
      }
      customFieldValues.value = newCustomValues
      console.log('Custom field values loaded for edit:', customFieldValues.value)

      isCreatingNewGroup.value = false
      newGroupName.value = ''
    } else {
      // --- حالت افزودن جدید ---
      // وقتی از ویرایش به افزودن جدید میریم (یا فرم برای اولین بار برای افزودن باز میشه)
      clearForm()
    }
  },
  { immediate: true, deep: true }, // immediate: true برای اجرای اولیه، deep: true برای آبجکت‌های تو در تو
)

// Watch برای تغییر contactGroup و مدیریت input ایجاد گروه جدید
watch(contactGroup, (newValue) => {
  if (newValue === '__CREATE_NEW__') {
    isCreatingNewGroup.value = true
  } else {
    isCreatingNewGroup.value = false
    newGroupName.value = '' // پاک کردن اسم گروه جدید اگر گروه موجود انتخاب شد
  }
})

// ریست خودکار فرم ویرایش هنگام خروج از صفحه یا تغییر منو
onBeforeRouteLeave(() => {
  clearForm()
  contactStore.clearContactToEdit()
})

// تابعی که هنگام ارسال فرم اجرا میشه (حالا هم برای افزودن هم ویرایش)
const validateForm = () => {
  nameError.value = name.value.trim() === '' ? 'نام الزامی است.' : ''
  lastNameError.value = lastName.value.trim() === '' ? 'نام خانوادگی الزامی است.' : ''
  phoneError.value =
    phone.value.trim() === ''
      ? 'شماره تلفن الزامی است.'
      : !/^([\d\s+\-()]+)$/.test(phone.value)
        ? 'شماره تلفن فقط باید شامل عدد، فاصله و کاراکترهای مجاز باشد.'
        : ''
  return !nameError.value && !lastNameError.value && !phoneError.value
}

const handleSubmit = async () => {
  if (!validateForm()) return

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
  const processedCustomFields = []
  if (sortedCustomFieldDefinitions.value && Array.isArray(sortedCustomFieldDefinitions.value)) {
    for (const fieldDef of sortedCustomFieldDefinitions.value) {
      const rawValue = customFieldValues.value[fieldDef.id]
      let valueToStore = rawValue

      // فقط فیلدهایی که مقدار معنی‌دار دارند یا boolean هستند
      if (
        rawValue !== null &&
        rawValue !== undefined &&
        (rawValue !== '' || fieldDef.type === 'boolean')
      ) {
        if (fieldDef.type === 'date' && rawValue) {
          // تبدیل از فرمت DatePicker (YYYY-MM-DD میلادی) به ISO string برای ذخیره
          valueToStore = moment(rawValue, 'YYYY-MM-DD').toISOString()
        }
        // برای اعداد، مطمئن شویم که عدد هستند (اگر v-model.number استفاده نشده)
        if (fieldDef.type === 'number' && rawValue !== null && rawValue !== '') {
          valueToStore = parseFloat(rawValue)
          if (isNaN(valueToStore)) valueToStore = null // اگر عدد معتبر نبود
        }

        processedCustomFields.push({
          fieldId: fieldDef.id, // ID از تعریف فیلد
          value: valueToStore,
        })
      }
    }
  }
  console.log('Processed custom fields for saving:', processedCustomFields)

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
      .map((p) => ({ type: p.type, number: p.number.trim() }))
      .filter((p) => p.number),
    addresses: contactAddresses.value
      .map((a) => ({
        type: a.type,
        street: a.street.trim(),
        city: a.city.trim(),
        province: a.province.trim(),
        country: a.country.trim(),
        postalCode: a.postalCode.trim(),
        notes: a.notes.trim(),
      }))
      .filter((a) => Object.values(a).some((val) => typeof val === 'string' && val !== '')),
    customFields: processedCustomFields, // <-- فیلدهای سفارشی پردازش شده
    // createdAt و updatedAt توسط اکشن‌های store مدیریت میشن
  }

  // 4. ذخیره یا به‌روزرسانی مخاطب
  let success = false
  if (contactStore.contactToEdit) {
    success = await contactStore.updateContact(contactStore.contactToEdit.id, contactDataPayload)
  } else {
    success = await contactStore.addContact(contactDataPayload)
  }

  // 5. اقدامات بعد از ذخیره
  if (success && !contactStore.error) {
    ElNotification({
      title: 'موفقیت',
      message: contactStore.contactToEdit
        ? 'مخاطب با موفقیت به‌روزرسانی شد!'
        : 'مخاطب با موفقیت اضافه شد!',
      type: 'success',
      duration: 3500,
      position: 'top-left',
    })
    clearForm() // شامل clearContactToEdit هم میشه
    router.push({ name: 'contact-list' }) // یا هر مسیری که می‌خوای کاربر بهش بره
  } else if (contactStore.error) {
    // خطا توسط store مدیریت شده و در UI نمایش داده میشه
    console.error('Error saving contact:', contactStore.error)
  }
}
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
  padding-bottom: 5px.;
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
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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

.main-fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px 20px;
  margin-bottom: 24px;
  width: 100%;
}

.additional-phones-grid {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: 10px;
  align-items: end;
  width: 100%;
}

@media (max-width: 900px) {
  .main-fields-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .additional-phones-grid {
    grid-template-columns: 1fr 1.5fr auto;
  }
}

@media (max-width: 600px) {
  .main-fields-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .additional-phones-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

.form-group {
  margin-bottom: 20px;
}

.form-group label,
.checkbox-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--color-text-secondary); /* تغییر کرد */
  font-size: 0.95em;
}

.form-input,
.form-select,
.form-textarea,
.form-datepicker {
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
:deep(.form-datepicker .vpd-input-group input:focus) {
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

.add-item-btn,
.remove-item-btn {
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

.submit-btn,
.cancel-btn {
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

.required-star {
  color: var(--el-color-danger);
  margin-right: 2px;
  font-size: 1.1em;
}
.field-error {
  color: var(--el-color-danger);
  font-size: 0.9em;
  margin-top: 2px;
  display: block;
}

.char-counter {
  font-size: 0.85em;
  color: var(--color-text-tertiary);
  margin-top: 2px;
  display: block;
  text-align: left;
}

.address-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px 12px;
  align-items: end;
  margin-bottom: 10px;
  background: none;
  border: none;
  box-shadow: none;
}
.address-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.address-notes-field {
  grid-column: span 3;
}
.compact-select {
  min-width: 0;
  width: 100%;
  font-size: 0.97em;
  padding: 6px 8px;
}
.compact-input {
  min-width: 0;
  font-size: 0.97em;
  padding: 6px 8px;
}
.additional-phones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  align-items: center;
}
@media (max-width: 900px) {
  .address-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .address-notes-field {
    grid-column: span 2;
  }
}
@media (max-width: 600px) {
  .address-grid {
    grid-template-columns: 1fr;
  }
  .address-notes-field {
    grid-column: span 1;
  }
  .form-group,
  .form-section,
  .custom-field-group {
    flex-direction: column;
    padding: 8px !important;
    margin-bottom: 10px !important;
  }
  .item-select,
  .compact-select,
  .item-input,
  .item-input-sml,
  .compact-input {
    font-size: 0.98em;
    padding: 7px 6px;
    min-width: 0;
  }
}
@media (max-width: 600px) {
  .form-group,
  .form-section,
  .custom-field-group {
    padding: 10px !important;
    margin-bottom: 12px !important;
  }
  .form-group label,
  .checkbox-label {
    font-size: 1em !important;
  }
  .form-actions {
    flex-direction: column;
    gap: 8px.;
  }
  .form-group input,
  .form-group select,
  .form-group textarea {
    font-size: 1em;
    padding: 10px 8px;
  }
}

.flat-input,
.flat-select {
  border-radius: 3px !important;
  border: 1px solid var(--color-border-medium) !important;
  background: var(--color-background-light) !important;
  box-shadow: none !important;
  font-size: 0.97em !important;
  padding: 6px 8px !important;
  min-height: 32px !important;
  height: auto !important;
  transition: border-color 0.2s;
}
.flat-input:focus,
.flat-select:focus {
  border-color: var(--color-link-primary) !important;
  outline: none !important;
  box-shadow: none !important;
}
.el-input__inner,
.el-textarea__inner {
  border-radius: 3px !important;
  background: var(--color-background-light) !important;
  font-size: 0.97em !important;
  padding: 6px 8px !important;
  min-height: 32px !important;
  height: auto !important;
  box-shadow: none !important;
}
.el-select .el-input__wrapper {
  border-radius: 3px !important;
  background: var(--color-background-light) !important;
  min-height: 32px !important;
  height: auto !important;
  box-shadow: none !important;
  padding: 0 !important;
}
.el-select-dropdown__item {
  font-size: 0.97em !important;
  padding: 6px 8px !important;
}
.el-input--small .el-input__inner,
.el-select--small .el-input__inner {
  min-height: 32px !important;
  font-size: 0.97em !important;
  padding: 6px 8px !important;
}
.el-textarea__inner {
  min-height: 40px !important;
  resize: vertical !important;
}
@media (max-width: 600px) {
  .flat-input,
  .flat-select,
  .el-input__inner,
  .el-select .el-input__wrapper {
    font-size: 1em !important;
    padding: 7px 6px !important;
    min-height: 28px !important;
  }
}
</style>
