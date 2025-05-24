<template>
  <form @submit.prevent="handleSubmit" class="contact-form glass">
    <h2>
      <span
        class="form-title-icon"
        :title="
          $t(contactStore.contactToEdit ? 'contactForm.editContact' : 'contactForm.addNewContact')
        "
      >
        <IconWrapper icon="fa-solid fa-user-edit" />
      </span>
      {{ $t(contactStore.contactToEdit ? 'contactForm.editContact' : 'contactForm.addNewContact') }}
    </h2>

    <!-- بخش آپلود آواتار - به کامپوننت جداگانه منتقل شده -->
    <ContactAvatarUpload
      v-model="avatarPreview"
      :avatarError="avatarError"
      @update:avatarError="avatarError = $event"
    />

    <!-- بخش فیلدهای اصلی - به کامپوننت جداگانه منتقل شده -->
    <ContactMainFields
      v-model:name="name"
      v-model:lastName="lastName"
      v-model:phone="phone"
      v-model:title="title"
      v-model:gender="gender"
      v-model:contactGroup="contactGroup"
      v-model:position="position"
      v-model:birthDate="birthDate"
      v-model:newGroupName="newGroupName"
      :nameError="nameError"
      :lastNameError="lastNameError"
      :phoneError="phoneError"
      :sortedGroups="groupStore.sortedGroups"
      :isCreatingNewGroup="isCreatingNewGroup"
    />

    <!-- بخش فیلدهای سفارشی - به کامپوننت جداگانه منتقل شده -->
    <ContactCustomFields
      v-if="sortedCustomFieldDefinitions.length > 0"
      :customFieldDefinitions="sortedCustomFieldDefinitions"
      :customFieldValues="customFieldValues"
      @update:customFieldValue="updateCustomFieldValue"
    />

    <!-- بخش آدرس‌ها - به کامپوننت جداگانه منتقل شده -->
    <ContactAddresses
      :contactAddresses="contactAddresses"
      @update:address="updateAddress"
      @remove:address="removeAddress"
      @add:address="addAddress"
    />

    <!-- بخش شماره تلفن‌های اضافه - به کامپوننت جداگانه منتقل شده -->
    <ContactAdditionalPhones
      :additionalPhones="additionalPhones"
      @update:phone="updateAdditionalPhone"
      @remove:phone="removeAdditionalPhone"
      @add:phone="addAdditionalPhone"
    />

    <div class="form-group">
      <label for="notes">
        <span><IconWrapper icon="fa-solid fa-notes" /></span>
        {{ $t('contactForm.notes') }}:
      </label>
      <textarea
        id="notes"
        v-model="notes"
        class="flat-input"
        rows="4"
        :placeholder="$t('contactForm.notesPlaceholder')"
      ></textarea>
    </div>

    <div class="form-actions">
      <button type="submit" class="submit-btn flat-input" :disabled="isSubmitting">
        <span v-if="isSubmitting"><IconWrapper icon="fa-solid fa-spinner fa-spin" /></span>
        <span v-else><IconWrapper icon="fa-solid fa-save" /></span>
        {{
          $t(contactStore.contactToEdit ? 'contactForm.updateContact' : 'contactForm.addContact')
        }}
      </button>
      <button type="button" @click="handleCancel" class="cancel-btn flat-input">
        <IconWrapper icon="fa-solid fa-times" /> {{ $t('contactForm.cancel') }}
      </button>
      <button
        type="button"
        v-if="contactStore.contactToEdit"
        @click="handleDelete"
        class="delete-btn flat-input"
      >
        <IconWrapper icon="fa-solid fa-trash" /> {{ $t('contactForm.deleteContact') }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useContactStore } from '@/store/contacts'
import { useGroupStore } from '@/store/groups'
import { useNotificationStore } from '@/store/notificationStore'
import { useI18n } from 'vue-i18n'
import IconWrapper from './icons/IconWrapper.vue'
import DatePicker from 'vue3-persian-datetime-picker'
import defaultAvatar from '@/assets/default-avatar.png'
import { generateUniqueId } from '@/utils/idGenerator'
import { getDefaultCustomFieldValue } from '@/utils/customFields'
import router from '@/router'

const contactStore = useContactStore()
const groupStore = useGroupStore()
// const router = useRouter() // این خط تکراری بود و حذف شد

const avatarPreview = ref(defaultAvatar) // پیش‌نمایش آواتار
const avatarFile = ref(null) // فایل آواتار انتخاب شده
const avatarError = ref('') // خطای مربوط به آواتار

const name = ref('')
const lastName = ref('')
const phone = ref('')
const title = ref('')
const position = ref('') // Added for position/expertise
const gender = ref('')
const notes = ref('')
const contactGroup = ref('')
const birthDate = ref('')

const nameError = ref('')
const lastNameError = ref('')
const phoneError = ref('')
const avatar = ref(null)
// const avatarPreview = ref('') // این خط تکراری بود و حذف شد
// const avatarError = ref('') // این متغیر هم تکراری بود
// const defaultAvatar = defaultAvatarPath // این متغیر هم تکراری بود

const additionalPhones = ref([])
let phoneIdCounter = 0

const contactAddresses = ref([])
let addressIdCounter = 0

const isCreatingNewGroup = ref(false)
const newGroupName = ref('')

const customFieldValues = ref({})

const sortedCustomFieldDefinitions = computed(() => customFieldStore.sortedFieldDefinitions || [])

// const generateUniqueId = () => Date.now() + Math.random().toString(36).substring(2, 9) // این تابع از utils/idGenerator ایمپورت شده و تعریف داخلی آن تکراری است.

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
  position.value = '' // Added for position/expertise
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
  avatar.value = null
  avatarPreview.value = ''
  avatarError.value = ''
  resetCustomFieldValues()
  contactStore.clearContactToEdit()
  avatarPreview.value = defaultAvatar // Reset preview on clear
  avatar.value = null
  avatarError.value = ''
}

const clearFormAndResetEdit = () => {
  clearForm()
  contactStore.clearContactToEdit()
  avatarPreview.value = defaultAvatar // Reset preview on clear
  avatar.value = null
  avatarError.value = ''
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
      position.value = contactForEdit.position || '' // Added for position/expertise
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
      avatarPreview.value = contactForEdit.avatarUrl || defaultAvatar // Assuming avatarUrl is part of contact data
      avatar.value = null // Reset file input
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
  avatarPreview.value = defaultAvatar // Reset preview on clear
  avatar.value = null
  avatarError.value = ''
})

const validateForm = () => {
  let isValid = true
  nameError.value = name.value.trim() === '' ? 'contactForm.validation.nameRequired' : ''
  if (nameError.value) isValid = false

  lastNameError.value =
    lastName.value.trim() === '' ? 'contactForm.validation.lastNameRequired' : ''
  if (lastNameError.value) isValid = false

  if (phone.value.trim() === '') {
    phoneError.value = 'contactForm.validation.phoneRequired'
    isValid = false
  } else if (!/^([\d\s+\-()]*)$/.test(phone.value)) {
    phoneError.value = 'contactForm.validation.phoneInvalid'
    isValid = false
  } else {
    phoneError.value = ''
  }

  // Basic validation for additional phone numbers (if any)
  additionalPhones.value.forEach((p) => {
    if (p.number.trim() !== '' && !/^([\d\s+\-()]*)$/.test(p.number)) {
      // Ideally, show error next to the specific additional phone input
      // For now, let's set a general error or log it
      console.warn(`Invalid additional phone number: ${p.number}`)
      // You might want to add a more user-facing error message here
      isValid = false
    }
  })

  // Basic validation for birthDate (if provided)
  if (birthDate.value && !moment(birthDate.value, 'jYYYY/jMM/jDD', true).isValid()) {
    // Ideally, show error next to the birth date input
    console.warn(`Invalid birth date: ${birthDate.value}`)
    // You might want to add a more user-facing error message here
    isValid = false
  }

  // Validate new group name if creating a new group
  if (isCreatingNewGroup.value && newGroupName.value.trim() === '') {
    groupStore.error = 'contactForm.validation.groupNameRequired' // This already exists, but good to have it as part of overall validation
    isValid = false
  } else if (isCreatingNewGroup.value) {
    groupStore.error = null // Clear previous error if name is now provided
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  let finalContactGroupName = contactGroup.value
  if (isCreatingNewGroup.value) {
    if (newGroupName.value.trim() === '') {
      groupStore.error = 'contactForm.validation.groupNameRequired'
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
    position: position.value.trim(), // Added for position/expertise
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
    // avatar: avatar.value, // We'll handle actual avatar upload logic later
    createdAt: contactStore.contactToEdit?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
/* استایل‌های کلی فرم */
.contact-form {
  max-width: 800px;
  margin: 20px auto;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--color-text);
}

.contact-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: var(--color-heading);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: var(--color-heading);
  display: flex;
  align-items: center;
  gap: 5px;
}

.required-star {
  color: var(--color-danger);
  margin-left: 4px;
}

.flat-input,
.flat-select {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  background-color: var(--color-background-mute);
  color: var(--color-text);
  font-size: 1em;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.flat-input:focus,
.flat-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 5px rgba(var(--color-primary-rgb), 0.3);
  outline: none;
}

.flat-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='292.362' height='292.362' viewBox='0 0 292.362 292.362'%3E%3Cpath fill='%23000000' d='M287.9 69.4a17.6 17.6 0 0 0-13.1-6.4H17.5a17.6 17.6 0 0 0-13.1 6.4c-1.7 1.7-2.7 4-2.7 6.4s1 4.6 2.7 6.4l131.6 131.6c3.5 3.5 8.1 5.4 13.1 5.4s9.6-1.9 13.1-5.4L287.9 82.2c1.7-1.7 2.7-4 2.7-6.4s-1-4.7-2.7-6.4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px top 50%;
  background-size: 0.6em auto;
  padding-right: 30px; /* Make space for the arrow */
}

.field-error {
  color: var(--color-danger);
  font-size: 0.9em;
  margin-top: 5px;
  display: block;
}

/* استایل‌های بخش آواتار */
/* این استایل‌ها به ContactAvatarUpload.vue منتقل شده‌اند */
/*
.avatar-section {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-upload-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-border);
  background-color: var(--color-background-soft);
}

.avatar-input {
  display: none;
}

.upload-avatar-btn,
.remove-avatar-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.upload-avatar-btn {
  background-color: var(--color-primary);
  color: white;
}

.upload-avatar-btn:hover {
  background-color: var(--color-primary-dark);
}

.remove-avatar-btn {
  background-color: var(--color-danger);
  color: white;
}

.remove-avatar-btn:hover {
  background-color: var(--color-danger-dark);
}
*/

/* استایل‌های بخش فیلدهای اصلی */
/* این استایل‌ها به ContactMainFields.vue منتقل شده‌اند */
/*
.main-fields-section {
  margin-bottom: 30px;
}

.main-fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.new-group-input {
  margin-top: 15px;
  padding: 15px;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background-soft);
}

.new-group-input label {
  font-weight: normal;
  margin-bottom: 5px;
}
*/

/* استایل‌های بخش فیلدهای سفارشی */
/* این استایل‌ها به ContactCustomFields.vue منتقل شده‌اند */
/*
.custom-fields-wrapper {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background-color: var(--color-background-soft);
}

.custom-fields-wrapper h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--color-heading);
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-field-group {
  margin-bottom: 15px;
}

.custom-field-group label {
  font-weight: normal;
}
*/

/* استایل‌های بخش آدرس‌ها و شماره تلفن‌های اضافه */
/* این استایل‌ها به ContactAddresses.vue و ContactAdditionalPhones.vue منتقل شده‌اند */
/*
.additional-items-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background-color: var(--color-background-soft);
}

.additional-items-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--color-heading);
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-block {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: var(--color-background-soft);
  position: relative; /* Needed for absolute positioning of remove button
}
  */


.address-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.additional-phones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.item-select,
.item-input {
  padding: 8px;
  font-size: 0.9em;
}

.remove-item-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--color-danger);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 0.8em;
  transition: background-color 0.3s ease;
}

.remove-item-btn:hover {
  background-color: var(--color-danger-dark);
}

.add-item-btn {
  display: block;
  width: auto; /* Adjust width */
  margin: 15px auto 0 auto; /* Center button */
  padding: 10px 20px;
  background-color: var(--color-success);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-align: center;
}

.add-item-btn:hover {
  background-color: var(--color-success-dark);
}

/* استایل‌های بخش دکمه‌های عملیات */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.submit-btn,
.cancel-btn,
.delete-btn {
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-btn {
  background-color: var(--color-primary);
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.submit-btn:disabled {
  background-color: var(--color-background-mute);
  color: var(--color-text);
  cursor: not-allowed;
}

.cancel-btn {
  background-color: var(--color-secondary);
  color: white;
}

.cancel-btn:hover {
  background-color: var(--color-secondary-dark);
}

.delete-btn {
  background-color: var(--color-danger);
  color: white;
}

.delete-btn:hover {
  background-color: var(--color-danger-dark);
}

/* استایل‌های واکنش‌گرا */
@media (max-width: 768px) {
  .contact-form {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
    gap: 10px;
  }

  .form-actions button {
    width: 100%;
    justify-content: center;
  }
}

</style scoped>