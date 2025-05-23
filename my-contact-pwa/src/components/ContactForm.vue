<template>
  <form @submit.prevent="handleSubmit" class="contact-form glass">
    <h2>
      <span
        class="form-title-icon"
        title="{{ contactStore.contactToEdit ? 'ویرایش مخاطب' : 'افزودن مخاطب جدید' }}"
      >
        <i class="fa-solid fa-user-edit"></i>
      </span>
      {{ contactStore.contactToEdit ? 'ویرایش مخاطب' : 'افزودن مخاطب جدید' }}
    </h2>

    <div class="main-fields-section">
      <div class="main-fields-grid">
        <div class="form-group">
          <label for="name">
            <span title="نام الزامی است"><i class="fa-solid fa-signature"></i></span>
            نام:
            <span class="required-star" title="فیلد اجباری">*</span>
          </label>
          <input id="name" v-model="name" required maxlength="50" class="flat-input" type="text" />
          <span v-if="nameError" class="field-error">{{ nameError }}</span>
        </div>
        <div class="form-group">
          <label for="lastName">
            <span title="نام خانوادگی الزامی است"><i class="fa-solid fa-signature"></i></span>
            نام خانوادگی:
            <span class="required-star" title="فیلد اجباری">*</span>
          </label>
          <input
            id="lastName"
            v-model="lastName"
            required
            maxlength="50"
            class="flat-input"
            type="text"
          />
          <span v-if="lastNameError" class="field-error">{{ lastNameError }}</span>
        </div>
        <div class="form-group">
          <label for="phone">
            <span title="شماره تلفن فقط باید شامل عدد و فاصله و + باشد"
              ><i class="fa-solid fa-phone"></i
            ></span>
            تلفن اصلی:
            <span class="required-star" title="فیلد اجباری">*</span>
          </label>
          <input
            id="phone"
            v-model="phone"
            required
            maxlength="20"
            class="flat-input"
            type="text"
          />
          <span v-if="phoneError" class="field-error">{{ phoneError }}</span>
        </div>
        <div class="form-group">
          <label for="title">
            <span><i class="fa-solid fa-briefcase"></i></span>
            سمت/تخصص:
          </label>
          <input id="title" v-model="title" class="flat-input" type="text" />
        </div>
        <div class="form-group">
          <label for="gender">
            <span><i class="fa-solid fa-venus-mars"></i></span>
            جنسیت:
          </label>
          <select id="gender" v-model="gender" class="flat-select">
            <option value="">انتخاب کنید</option>
            <option value="male">♂️ آقا</option>
            <option value="female">♀️ خانم</option>
            <option value="other">غیره</option>
            <option value="not_specified">ترجیح میدهم نگویم</option>
          </select>
        </div>
        <div class="form-group">
          <label for="group">
            <span><i class="fa-solid fa-layer-group"></i></span>
            گروه:
          </label>
          <select id="group" v-model="contactGroup" class="flat-select">
            <option value="">بدون گروه</option>
            <option v-for="g in groupStore.sortedGroups" :key="g.id" :value="g.name">
              {{ g.name }}
            </option>
            <option value="__CREATE_NEW__">--- ایجاد گروه جدید ---</option>
          </select>
          <div v-if="isCreatingNewGroup" class="new-group-input">
            <label for="newGroupName">
              <span><i class="fa-solid fa-plus"></i></span>
              نام گروه جدید:
            </label>
            <input
              id="newGroupName"
              v-model="newGroupName"
              placeholder="مثلاً: دوستان"
              class="flat-input"
              type="text"
            />
          </div>
        </div>
        <div class="form-group">
          <label for="birthDate">
            <span><i class="fa-solid fa-cake-candles"></i></span>
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
    </div>

    <div v-if="sortedCustomFieldDefinitions.length > 0" class="custom-fields-wrapper">
      <h3>
        <span><i class="fa-solid fa-cogs"></i></span>
        فیلدهای سفارشی
      </h3>
      <div
        v-for="fieldDef in sortedCustomFieldDefinitions"
        :key="fieldDef.id"
        class="form-group custom-field-group"
      >
        <label :for="'custom-field-' + fieldDef.id">
          <span v-if="fieldDef.type === 'date'"><i class="fa-solid fa-calendar-days"></i></span>
          <span v-else-if="fieldDef.type === 'number'"><i class="fa-solid fa-hashtag"></i></span>
          <span v-else-if="fieldDef.type === 'boolean'"><i class="fa-solid fa-toggle-on"></i></span>
          <span v-else-if="fieldDef.type === 'select'"><i class="fa-solid fa-list"></i></span>
          <span v-else><i class="fa-solid fa-pen"></i></span>
          {{ fieldDef.label }}:
        </label>
        <input
          v-if="fieldDef.type === 'text'"
          type="text"
          :id="'custom-field-' + fieldDef.id"
          v-model="customFieldValues[fieldDef.id]"
          class="flat-input"
          :placeholder="fieldDef.placeholder || 'مقدار را وارد کنید'"
        />
        <textarea
          v-else-if="fieldDef.type === 'textarea'"
          :id="'custom-field-' + fieldDef.id"
          v-model="customFieldValues[fieldDef.id]"
          class="flat-input"
          rows="3"
          :placeholder="fieldDef.placeholder || 'متن را وارد کنید'"
        ></textarea>
        <input
          v-else-if="fieldDef.type === 'number'"
          type="number"
          :id="'custom-field-' + fieldDef.id"
          v-model.number="customFieldValues[fieldDef.id]"
          class="flat-input"
          :placeholder="fieldDef.placeholder || 'عدد را وارد کنید'"
        />
        <date-picker
          v-else-if="fieldDef.type === 'date'"
          v-model="customFieldValues[fieldDef.id]"
          :id="'custom-field-' + fieldDef.id"
          type="date"
          format="YYYY-MM-DD"
          display-format="jYYYY/jMM/jDD"
          :placeholder="fieldDef.placeholder || 'تاریخ را انتخاب کنید'"
          class="flat-input"
        ></date-picker>
        <div v-else-if="fieldDef.type === 'boolean'" class="checkbox-wrapper">
          <input
            type="checkbox"
            :id="'custom-field-' + fieldDef.id"
            v-model="customFieldValues[fieldDef.id]"
          />
          {{ fieldDef.label }}
        </div>
        <select
          v-else-if="fieldDef.type === 'select'"
          :id="'custom-field-' + fieldDef.id"
          v-model="customFieldValues[fieldDef.id]"
          class="flat-select"
          :placeholder="fieldDef.placeholder || 'انتخاب کنید...'"
        >
          <option value="">انتخاب کنید...</option>
          <option v-for="option in fieldDef.options" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
        <small v-else class="unsupported-field-type"
          >نوع فیلد "{{ fieldDef.type }}" پشتیبانی نمی‌شود.</small
        >
      </div>
    </div>
    <div class="form-section additional-items-section">
      <h4>
        <span><i class="fa-solid fa-location-dot"></i></span>
        آدرس‌ها
      </h4>
      <div
        v-for="(address, index) in contactAddresses"
        :key="address.id"
        class="item-block address-grid"
      >
        <div class="address-field">
          <label>
            <span style="margin-left: 2px"><i class="fa-solid fa-location-dot"></i></span>
            نوع آدرس:
          </label>
          <select v-model="address.type" class="flat-select compact-select">
            <option value="">نوع آدرس</option>
            <option value="home"><i class="fa-solid fa-house"></i> منزل</option>
            <option value="work"><i class="fa-solid fa-briefcase"></i> محل کار</option>
            <option value="other"><i class="fa-solid fa-link"></i> دیگر</option>
          </select>
        </div>
        <div class="address-field">
          <label
            ><span style="margin-left: 2px"><i class="fa-solid fa-road"></i></span>خیابان:</label
          >
          <input
            v-model="address.street"
            placeholder="خیابان"
            class="flat-input compact-input"
            type="text"
          />
        </div>
        <div class="address-field">
          <label
            ><span style="margin-left: 2px"><i class="fa-solid fa-city"></i></span>شهر:</label
          >
          <input
            v-model="address.city"
            placeholder="شهر"
            class="flat-input compact-input"
            type="text"
          />
        </div>
        <div class="address-field">
          <label
            ><span style="margin-left: 2px"><i class="fa-solid fa-mountain"></i></span>استان:</label
          >
          <input
            v-model="address.province"
            placeholder="استان"
            class="flat-input compact-input"
            type="text"
          />
        </div>
        <div class="address-field">
          <label
            ><span style="margin-left: 2px"><i class="fa-solid fa-earth-americas"></i></span
            >کشور:</label
          >
          <input
            v-model="address.country"
            placeholder="کشور"
            class="flat-input compact-input"
            type="text"
          />
        </div>
        <div class="address-field">
          <label
            ><span style="margin-left: 2px"><i class="fa-solid fa-barcode"></i></span>کدپستی:</label
          >
          <input
            v-model="address.postalCode"
            placeholder="کدپستی"
            class="flat-input compact-input"
            type="text"
          />
        </div>
        <div class="address-field address-notes-field">
          <label
            ><span style="margin-left: 2px"><i class="fa-solid fa-note-sticky"></i></span>یادداشت
            آدرس:</label
          >
          <textarea
            v-model="address.notes"
            placeholder="یادداشت آدرس"
            class="flat-input compact-input"
            rows="2"
          ></textarea>
        </div>
        <button
          type="button"
          @click="removeAddress(address.id)"
          class="remove-item-btn"
          title="حذف آدرس"
        >
          🗑️
        </button>
      </div>
      <button
        type="button"
        @click="addAddress"
        class="add-item-btn flat-input"
        style="margin-top: 0"
      >
        ➕ افزودن آدرس
      </button>
    </div>

    <div class="form-section additional-items-section">
      <h4>
        <span><i class="fa-solid fa-phone"></i></span>
        شماره‌های اضافی
      </h4>
      <div
        v-for="(phoneItem, index) in additionalPhones"
        :key="phoneItem.id"
        class="item-block additional-phones-grid"
      >
        <select v-model="phoneItem.type" class="flat-select item-select">
          <option value="">نوع شماره</option>
          <option value="mobile"><i class="fa-solid fa-mobile-alt"></i> موبایل</option>
          <option value="home"><i class="fa-solid fa-house"></i> منزل</option>
          <option value="work"><i class="fa-solid fa-briefcase"></i> محل کار</option>
          <option value="fax"><i class="fa-solid fa-fax"></i> فکس</option>
          <option value="other"><i class="fa-solid fa-link"></i> دیگر</option>
        </select>
        <input
          type="text"
          v-model="phoneItem.number"
          placeholder="شماره تلفن"
          class="flat-input item-input"
        />
        <button
          type="button"
          @click="removeAdditionalPhone(phoneItem.id)"
          class="remove-item-btn"
          title="حذف شماره"
        >
          🗑️
        </button>
      </div>
      <button
        type="button"
        @click="addAdditionalPhone"
        class="add-item-btn flat-input"
        style="margin-top: 0"
      >
        ➕ افزودن شماره
      </button>
    </div>

    <div class="form-group">
      <label for="notes"> یادداشت/توضیحات: </label>
      <textarea id="notes" v-model="notes" rows="4" class="flat-input" maxlength="500"></textarea>
      <span class="char-counter">({{ notes.length }}/500)</span>
    </div>

    <div class="form-actions">
      <button
        type="submit"
        class="submit-btn"
        :disabled="contactStore.loading || groupStore.loading"
      >
        ذخیره مخاطب
      </button>
      <button
        v-if="contactStore.contactToEdit"
        type="button"
        @click="clearFormAndResetEdit"
        class="cancel-btn"
      >
        انصراف
      </button>
      <button
        v-if="!contactStore.contactToEdit"
        type="button"
        @click="router.push({ name: 'contact-list' })"
        class="cancel-btn"
      >
        بازگشت به لیست
      </button>
    </div>

    <p v-if="contactStore.error" class="error-message">
      {{ contactStore.error }}
    </p>
    <p v-if="groupStore.error" class="error-message">
      {{ groupStore.error }}
    </p>
  </form>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useCustomFieldStore } from '../store/customFields'
import { useContactStore } from '../store/contacts'
import { useGroupStore } from '../store/groups'
import DatePicker from 'vue3-persian-datetime-picker'
import moment from 'moment-jalaali'

const contactStore = useContactStore()
const groupStore = useGroupStore()
const customFieldStore = useCustomFieldStore()
const router = useRouter()

const name = ref('')
const lastName = ref('')
const phone = ref('')
const title = ref('')
const gender = ref('')
const notes = ref('')
const contactGroup = ref('')
const birthDate = ref('')

const nameError = ref('')
const lastNameError = ref('')
const phoneError = ref('')

const additionalPhones = ref([])
let phoneIdCounter = 0

const contactAddresses = ref([])
let addressIdCounter = 0

const isCreatingNewGroup = ref(false)
const newGroupName = ref('')

const customFieldValues = ref({})

const sortedCustomFieldDefinitions = computed(() => customFieldStore.sortedFieldDefinitions || [])

const generateUniqueId = () => Date.now() + Math.random().toString(36).substring(2, 9)

const generateUniqueAddressId = () => {
  addressIdCounter += 1
  return Date.now() + addressIdCounter
}

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

const removeAddress = (idToRemove) => {
  contactAddresses.value = contactAddresses.value.filter((address) => address.id !== idToRemove)
}

const getDefaultValueForCustomFieldType = (type) => {
  switch (type) {
    case 'text':
    case 'textarea':
    case 'select':
    case 'date':
      return ''
    case 'number':
      return null
    case 'boolean':
      return false
    default:
      return undefined
  }
}

const resetCustomFieldValues = () => {
  const newValues = {}
  if (sortedCustomFieldDefinitions.value && Array.isArray(sortedCustomFieldDefinitions.value)) {
    sortedCustomFieldDefinitions.value.forEach((def) => {
      newValues[def.id] = getDefaultValueForCustomFieldType(def.type)
    })
  }
  customFieldValues.value = newValues
}

const generateUniquePhoneId = () => {
  phoneIdCounter += 1
  return Date.now() + phoneIdCounter
}

const addAdditionalPhone = () => {
  additionalPhones.value.push({
    id: generateUniquePhoneId(),
    type: '',
    number: '',
  })
}

const removeAdditionalPhone = (idToRemove) => {
  additionalPhones.value = additionalPhones.value.filter((phone) => phone.id !== idToRemove)
}

const clearForm = () => {
  name.value = ''
  lastName.value = ''
  phone.value = ''
  title.value = ''
  gender.value = ''
  notes.value = ''
  contactGroup.value = ''
  birthDate.value = ''

  additionalPhones.value = []
  contactAddresses.value = []

  isCreatingNewGroup.value = false
  newGroupName.value = ''
  groupStore.error = null
  contactStore.error = null

  resetCustomFieldValues()
  contactStore.clearContactToEdit()
}

const clearFormAndResetEdit = () => {
  clearForm()
  contactStore.clearContactToEdit()
}

onMounted(() => {
  if (!contactStore.contactToEdit) {
    clearForm()
  }
})

watch(
  () => contactStore.contactToEdit,
  (contactForEdit) => {
    if (contactForEdit) {
      name.value = contactForEdit.name || ''
      lastName.value = contactForEdit.lastName || ''
      phone.value = contactForEdit.phone || ''
      title.value = contactForEdit.title || ''
      gender.value = contactForEdit.gender || ''
      notes.value = contactForEdit.notes || ''
      contactGroup.value = contactForEdit.group || ''

      if (contactForEdit.birthDate) {
        birthDate.value = moment(contactForEdit.birthDate).format('jYYYY/jMM/jDD')
      } else {
        birthDate.value = ''
      }

      additionalPhones.value = contactForEdit.additionalPhones
        ? JSON.parse(JSON.stringify(contactForEdit.additionalPhones)).map((p) => ({
            ...p,
            id: generateUniqueId(),
          }))
        : []

      contactAddresses.value = contactForEdit.addresses
        ? JSON.parse(JSON.stringify(contactForEdit.addresses)).map((a) => ({
            ...a,
            id: generateUniqueId(),
          }))
        : []

      const newCustomValues = {}
      if (sortedCustomFieldDefinitions.value && Array.isArray(sortedCustomFieldDefinitions.value)) {
        sortedCustomFieldDefinitions.value.forEach((def) => {
          const existingCustomField = contactForEdit.customFields?.find(
            (cf) => cf.fieldId === def.id,
          )
          if (existingCustomField) {
            if (def.type === 'date' && existingCustomField.value) {
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

      isCreatingNewGroup.value = false
      newGroupName.value = ''
    } else {
      clearForm()
    }
  },
  { immediate: true, deep: true },
)

watch(contactGroup, (newValue) => {
  if (newValue === '__CREATE_NEW__') {
    isCreatingNewGroup.value = true
  } else {
    isCreatingNewGroup.value = false
    newGroupName.value = ''
  }
})

onBeforeRouteLeave(() => {
  clearForm()
  contactStore.clearContactToEdit()
})

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

  let finalContactGroupName = contactGroup.value
  if (isCreatingNewGroup.value) {
    if (newGroupName.value.trim() === '') {
      groupStore.error = 'لطفاً نام گروه جدید را وارد کنید.'
      return
    }
    groupStore.error = null

    await groupStore.addGroup(newGroupName.value.trim())

    if (groupStore.error) {
      return
    }

    finalContactGroup = newGroupName.value.trim()
  }

  const processedCustomFields = []
  if (sortedCustomFieldDefinitions.value && Array.isArray(sortedCustomFieldDefinitions.value)) {
    for (const fieldDef of sortedCustomFieldDefinitions.value) {
      const rawValue = customFieldValues.value[fieldDef.id]
      let valueToStore = rawValue

      if (
        rawValue !== null &&
        rawValue !== undefined &&
        (rawValue !== '' || fieldDef.type === 'boolean')
      ) {
        if (fieldDef.type === 'date' && rawValue) {
          valueToStore = moment(rawValue, 'YYYY-MM-DD').toISOString()
        }
        if (fieldDef.type === 'number' && rawValue !== null && rawValue !== '') {
          valueToStore = parseFloat(rawValue)
          if (isNaN(valueToStore)) valueToStore = null
        }

        processedCustomFields.push({
          fieldId: fieldDef.id,
          value: valueToStore,
        })
      }
    }
  }

  const contactDataPayload = {
    name: name.value.trim(),
    lastName: lastName.value.trim(),
    phone: phone.value.trim(),
    title: title.value.trim(),
    gender: gender.value,
    notes: notes.value.trim(),
    group: finalContactGroupName === '__CREATE_NEW__' ? '' : finalContactGroupName,
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
    customFields: processedCustomFields,
  }

  let success = false
  if (contactStore.contactToEdit) {
    success = await contactStore.updateContact(contactStore.contactToEdit.id, contactDataPayload)
  } else {
    success = await contactStore.addContact(contactDataPayload)
  }

  if (success && !contactStore.error) {
    clearForm()
    router.push({ name: 'contact-list' })
  } else if (contactStore.error) {
    console.error('Error saving contact:', contactStore.error)
  }
}
</script>

<style scoped>
.contact-form {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md);
  background-color: var(--color-background-darker-light);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-lg);
}

.main-fields-section {
  margin-bottom: var(--spacing-lg);
  width: 100%;
}

.main-fields-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-sm);
  width: 100%;
}

@media (min-width: 576px) {
  .main-fields-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
}
@media (min-width: 992px) {
  .main-fields-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-lg);
  }
}

.address-grid,
.additional-phones-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-sm);
}
@media (min-width: 576px) {
  .address-grid,
  .additional-phones-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
}
@media (min-width: 992px) {
  .address-grid,
  .additional-phones-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-lg);
  }
}

.flat-select,
.compact-select,
.item-select {
  min-width: 8ch;
  max-width: var(--dropdown-max-width, 220px);
  width: auto !important;
  font-size: var(--font-size-base);
}
.flat-input,
.compact-input,
.item-input {
  min-width: 8ch;
  max-width: 260px;
  width: auto !important;
  font-size: var(--font-size-base);
}
:deep(.vpd-input-group input) {
  min-width: 10ch;
  max-width: var(--datepicker-width, 160px);
  width: auto !important;
}

/* Button Styles */
.add-item-btn,
.remove-item-btn,
.submit-btn,
.cancel-btn {
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 500;
  min-width: var(--btn-min-width);
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}

.add-item-btn {
  background: linear-gradient(120deg, var(--accent-color) 60%, transparent 100%);
  color: white;
  margin-top: var(--spacing-xs);
  border: none;
  box-shadow: 0 2px 12px 0 rgba(31, 38, 135, 0.1);
}

.add-item-btn:hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 4px 16px rgba(var(--accent-color-rgb, 108, 99, 255), 0.18);
}

.remove-item-btn {
  background: var(--glass-bg);
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
  padding: var(--spacing-xs) var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.remove-item-btn:hover {
  background: rgba(220, 53, 69, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.15);
}

.submit-btn {
  background: linear-gradient(120deg, var(--accent-color) 60%, transparent 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(31, 38, 135, 0.1);
}

.submit-btn:hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 4px 16px rgba(var(--accent-color-rgb, 108, 99, 255), 0.18);
}

.cancel-btn {
  background: var(--glass-bg);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-medium);
}

.cancel-btn:hover {
  background: var(--glass-bg-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

:deep(.vpd-input-group input) {
  box-shadow: var(--shadow-sm) !important;
  border: 1px solid var(--color-border-medium) !important;
  background-color: var(--color-background-light) !important;
  border-radius: var(--radius-base) !important;
  transition: all 0.3s ease;
}

:deep(.vpd-input-group input:hover) {
  border-color: var(--accent-color) !important;
}

:deep(.vpd-input-group input) {
  height: var(--input-height) !important;
  padding: var(--spacing-xs) var(--spacing-sm) !important;
  font-size: var(--font-size-base) !important;
  color: var(--color-text-primary) !important;
}

:deep(.vpd-wrapper) {
  z-index: var(--z-index-datepicker) !important;
  position: fixed !important;
}

:deep(.vpd-container) {
  background: var(--color-background-light) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-lg) !important;
  border: 1px solid var(--color-border-light) !important;
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
}

@media (max-width: 575px) {
  .contact-form {
    padding: var(--spacing-xs);
  }

  .main-fields-section,
  .form-section,
  .custom-fields-wrapper {
    margin-top: var(--spacing-sm);
    padding: var(--spacing-xs);
  }

  .form-actions {
    flex-direction: column;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-md);
  }

  .form-actions .btn {
    width: 100%;
    min-width: auto;
  }
}

@media (min-width: 576px) {
  .main-fields-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
}

@media (min-width: 992px) {
  .main-fields-grid,
  .address-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-lg);
  }
}
</style>
