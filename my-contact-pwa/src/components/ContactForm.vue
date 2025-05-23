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

    <div class="main-fields-section">
      <div class="main-fields-grid">
        <div class="form-group">
          <label for="name">
            <span :title="$t('contactForm.nameRequired')"
              ><IconWrapper icon="fa-solid fa-signature"
            /></span>
            {{ $t('contactForm.name') }}:
            <span class="required-star" :title="$t('contactForm.requiredField')">*</span>
          </label>
          <input
            id="name"
            v-model="name"
            required
            maxlength="50"
            class="flat-input"
            type="text"
            :placeholder="$t('contactForm.namePlaceholder')"
          />
          <span v-if="nameError" class="field-error">{{ $t(nameError) }}</span>
        </div>
        <div class="form-group">
          <label for="lastName">
            <span :title="$t('contactForm.lastNameRequired')"
              ><IconWrapper icon="fa-solid fa-signature"
            /></span>
            {{ $t('contactForm.lastName') }}:
            <span class="required-star" :title="$t('contactForm.requiredField')">*</span>
          </label>
          <input
            id="lastName"
            v-model="lastName"
            required
            maxlength="50"
            class="flat-input"
            type="text"
            :placeholder="$t('contactForm.lastNamePlaceholder')"
          />
          <span v-if="lastNameError" class="field-error">{{ $t(lastNameError) }}</span>
        </div>
        <div class="form-group">
          <label for="phone">
            <span :title="$t('contactForm.phoneHint')"
              ><IconWrapper icon="fa-solid fa-phone"
            /></span>
            {{ $t('contactForm.phone') }}:
            <span class="required-star" :title="$t('contactForm.requiredField')">*</span>
          </label>
          <input
            id="phone"
            v-model="phone"
            required
            maxlength="20"
            class="flat-input"
            type="text"
            :placeholder="$t('contactForm.phonePlaceholder')"
          />
          <span v-if="phoneError" class="field-error">{{ $t(phoneError) }}</span>
        </div>
        <div class="form-group">
          <label for="title">
            <span><IconWrapper icon="fa-solid fa-briefcase" /></span>
            {{ $t('contactForm.title') }}:
          </label>
          <input
            id="title"
            v-model="title"
            class="flat-input"
            type="text"
            :placeholder="$t('contactForm.titlePlaceholder')"
          />
        </div>
        <div class="form-group">
          <label for="gender">
            <span><IconWrapper icon="fa-solid fa-venus-mars" /></span>
            {{ $t('contactForm.gender') }}:
          </label>
          <select id="gender" v-model="gender" class="flat-select">
            <option value="">{{ $t('contactForm.selectOption') }}</option>
            <option value="male">♂️ {{ $t('contactForm.genderMale') }}</option>
            <option value="female">♀️ {{ $t('contactForm.genderFemale') }}</option>
            <option value="other">{{ $t('contactForm.genderOther') }}</option>
            <option value="not_specified">{{ $t('contactForm.genderNotSpecified') }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="group">
            <span><IconWrapper icon="fa-solid fa-layer-group" /></span>
            {{ $t('contactForm.group') }}:
          </label>
          <select id="group" v-model="contactGroup" class="flat-select">
            <option value="">{{ $t('contactForm.noGroup') }}</option>
            <option v-for="g in groupStore.sortedGroups" :key="g.id" :value="g.name">
              {{ g.name }}
            </option>
            <option value="__CREATE_NEW__">--- {{ $t('contactForm.createNewGroup') }} ---</option>
          </select>
          <div v-if="isCreatingNewGroup" class="new-group-input">
            <label for="newGroupName">
              <span><IconWrapper icon="fa-solid fa-plus" /></span>
              {{ $t('contactForm.newGroupName') }}:
            </label>
            <input
              id="newGroupName"
              v-model="newGroupName"
              :placeholder="$t('contactForm.newGroupPlaceholder')"
              class="flat-input"
              type="text"
            />
          </div>
        </div>
        <div class="form-group">
          <label for="birthDate">
            <span><IconWrapper icon="fa-solid fa-cake-candles" /></span>
            {{ $t('contactForm.birthDate') }}:
          </label>
          <date-picker
            v-model="birthDate"
            id="birthDate"
            type="date"
            format="jYYYY/jMM/jDD"
            display-format="jYYYY/jMM/jDD"
            :placeholder="$t('contactForm.birthDatePlaceholder')"
            clearable
            class="flat-input"
          ></date-picker>
        </div>
      </div>
    </div>

    <div v-if="sortedCustomFieldDefinitions.length > 0" class="custom-fields-wrapper">
      <h3>
        <span><IconWrapper icon="fa-solid fa-cogs" /></span>
        {{ $t('contactForm.customFields') }}
      </h3>
      <div
        v-for="fieldDef in sortedCustomFieldDefinitions"
        :key="fieldDef.id"
        class="form-group custom-field-group"
      >
        <label :for="'custom-field-' + fieldDef.id">
          <span v-if="fieldDef.type === 'date"
            ><IconWrapper icon="fa-solid fa-calendar-days"
          /></span>
          <span v-else-if="fieldDef.type === 'number"
            ><IconWrapper icon="fa-solid fa-hashtag"
          /></span>
          <span v-else-if="fieldDef.type === 'boolean"
            ><IconWrapper icon="fa-solid fa-toggle-on"
          /></span>
          <span v-else-if="fieldDef.type === 'select"><IconWrapper icon="fa-solid fa-list" /></span>
          <span v-else><IconWrapper icon="fa-solid fa-pen" /></span>
          {{ $t(fieldDef.label) }}:
        </label>
        <input
          v-if="fieldDef.type === 'text'"
          type="text"
          :id="'custom-field-' + fieldDef.id"
          v-model="customFieldValues[fieldDef.id]"
          class="flat-input"
          :placeholder="
            fieldDef.placeholder
              ? $t(fieldDef.placeholder)
              : $t('contactForm.customFieldTextPlaceholder')
          "
        />
        <textarea
          v-else-if="fieldDef.type === 'textarea'"
          :id="'custom-field-' + fieldDef.id"
          v-model="customFieldValues[fieldDef.id]"
          class="flat-input"
          rows="3"
          :placeholder="
            fieldDef.placeholder
              ? $t(fieldDef.placeholder)
              : $t('contactForm.customFieldTextareaPlaceholder')
          "
        ></textarea>
        <input
          v-else-if="fieldDef.type === 'number'"
          type="number"
          :id="'custom-field-' + fieldDef.id"
          v-model.number="customFieldValues[fieldDef.id]"
          class="flat-input"
          :placeholder="
            fieldDef.placeholder
              ? $t(fieldDef.placeholder)
              : $t('contactForm.customFieldNumberPlaceholder')
          "
        />
        <date-picker
          v-else-if="fieldDef.type === 'date'"
          v-model="customFieldValues[fieldDef.id]"
          :id="'custom-field-' + fieldDef.id"
          type="date"
          format="YYYY-MM-DD"
          display-format="jYYYY/jMM/jDD"
          :placeholder="
            fieldDef.placeholder
              ? $t(fieldDef.placeholder)
              : $t('contactForm.customFieldDatePlaceholder')
          "
          class="flat-input"
        ></date-picker>
        <div v-else-if="fieldDef.type === 'boolean'" class="checkbox-wrapper">
          <input
            type="checkbox"
            :id="'custom-field-' + fieldDef.id"
            v-model="customFieldValues[fieldDef.id]"
          />
          {{ $t(fieldDef.label) }}
        </div>
        <select
          v-else-if="fieldDef.type === 'select'"
          :id="'custom-field-' + fieldDef.id"
          v-model="customFieldValues[fieldDef.id]"
          class="flat-select"
          :placeholder="
            fieldDef.placeholder ? $t(fieldDef.placeholder) : $t('contactForm.selectOption')
          "
        >
          <option value="">{{ $t('contactForm.selectOption') }}</option>
          <option v-for="option in fieldDef.options" :key="option" :value="option">
            {{ $t(option) }}
          </option>
        </select>
        <small v-else class="unsupported-field-type">{{
          $t('contactForm.unsupportedFieldType', { type: fieldDef.type })
        }}</small>
      </div>
    </div>

    <div class="form-section additional-items-section">
      <h4>
        <span><IconWrapper icon="fa-solid fa-location-dot" /></span>
        {{ $t('contactForm.addresses') }}
      </h4>
      <div
        v-for="(address, index) in contactAddresses"
        :key="address.id"
        class="item-block address-grid"
      >
        <div class="address-field">
          <label>
            <span style="margin-left: 2px"><IconWrapper icon="fa-solid fa-location-dot" /></span>
            {{ $t('contactForm.addressType') }}:
          </label>
          <select v-model="address.type" class="flat-select compact-select">
            <option value="">{{ $t('contactForm.addressTypePlaceholder') }}</option>
            <option value="home">
              <IconWrapper icon="fa-solid fa-house" /> {{ $t('contactForm.addressTypeHome') }}
            </option>
            <option value="work">
              <IconWrapper icon="fa-solid fa-briefcase" /> {{ $t('contactForm.addressTypeWork') }}
            </option>
            <option value="other">
              <IconWrapper icon="fa-solid fa-link" /> {{ $t('contactForm.addressTypeOther') }}
            </option>
          </select>
        </div>
        <div class="address-field">
          <label
            ><span style="margin-left: 2px"><IconWrapper icon="fa-solid fa-road" /></span
            >{{ $t('contactForm.street') }}:</label
          >
          <input
            v-model="address.street"
            :placeholder="$t('contactForm.streetPlaceholder')"
            class="flat-input compact-input"
            type="text"
          />
        </div>
        <div class="address-field">
          <label
            ><span style="margin-left: 2px"><IconWrapper icon="fa-solid fa-city" /></span
            >{{ $t('contactForm.city') }}:</label
          >
          <input
            v-model="address.city"
            :placeholder="$t('contactForm.cityPlaceholder')"
            class="flat-input compact-input"
            type="text"
          />
        </div>
        <div class="address-field">
          <label
            ><span style="margin-left: 2px"><IconWrapper icon="fa-solid fa-mountain" /></span
            >{{ $t('contactForm.province') }}:</label
          >
          <input
            v-model="address.province"
            :placeholder="$t('contactForm.provincePlaceholder')"
            class="flat-input compact-input"
            type="text"
          />
        </div>
        <div class="address-field">
          <label
            ><span style="margin-left: 2px"><IconWrapper icon="fa-solid fa-earth-americas" /></span
            >{{ $t('contactForm.country') }}:</label
          >
          <input
            v-model="address.country"
            :placeholder="$t('contactForm.countryPlaceholder')"
            class="flat-input compact-input"
            type="text"
          />
        </div>
        <div class="address-field">
          <label
            ><span style="margin-left: 2px"><IconWrapper icon="fa-solid fa-barcode" /></span
            >{{ $t('contactForm.postalCode') }}:</label
          >
          <input
            v-model="address.postalCode"
            :placeholder="$t('contactForm.postalCodePlaceholder')"
            class="flat-input compact-input"
            type="text"
          />
        </div>
        <div class="address-field address-notes-field">
          <label
            ><span style="margin-left: 2px"><IconWrapper icon="fa-solid fa-note-sticky" /></span
            >{{ $t('contactForm.addressNotes') }}:</label
          >
          <textarea
            v-model="address.notes"
            :placeholder="$t('contactForm.addressNotesPlaceholder')"
            class="flat-input compact-input"
            rows="2"
          ></textarea>
        </div>
        <button
          type="button"
          @click="removeAddress(address.id)"
          class="remove-item-btn"
          :title="$t('contactForm.removeAddress')"
        >
          🗑️ {{ $t('contactForm.removeAddress') }}
        </button>
      </div>
      <button
        type="button"
        @click="addAddress"
        class="add-item-btn flat-input"
        style="margin-top: 0"
        :title="$t('contactForm.addAddress')"
      >
        ➕ {{ $t('contactForm.addAddress') }}
      </button>
    </div>

    <div class="form-section additional-items-section">
      <h4>
        <span><IconWrapper icon="fa-solid fa-phone" /></span>
        {{ $t('contactForm.additionalPhones') }}
      </h4>
      <div
        v-for="(phoneItem, index) in additionalPhones"
        :key="phoneItem.id"
        class="item-block additional-phones-grid"
      >
        <select v-model="phoneItem.type" class="flat-select item-select">
          <option value="">{{ $t('contactForm.phoneTypePlaceholder') }}</option>
          <option value="mobile">
            <IconWrapper icon="fa-solid fa-mobile-alt" /> {{ $t('contactForm.phoneTypeMobile') }}
          </option>
          <option value="home">
            <IconWrapper icon="fa-solid fa-house" /> {{ $t('contactForm.phoneTypeHome') }}
          </option>
          <option value="work">
            <IconWrapper icon="fa-solid fa-briefcase" /> {{ $t('contactForm.phoneTypeWork') }}
          </option>
          <option value="fax">
            <IconWrapper icon="fa-solid fa-fax" /> {{ $t('contactForm.phoneTypeFax') }}
          </option>
          <option value="other">
            <IconWrapper icon="fa-solid fa-link" /> {{ $t('contactForm.phoneTypeOther') }}
          </option>
        </select>
        <input
          type="text"
          v-model="phoneItem.number"
          :placeholder="$t('contactForm.additionalPhonePlaceholder')"
          class="flat-input item-input"
        />
        <button
          type="button"
          @click="removeAdditionalPhone(phoneItem.id)"
          class="remove-item-btn"
          :title="$t('contactForm.removePhone')"
        >
          🗑️ {{ $t('contactForm.removePhone') }}
        </button>
      </div>
      <button
        type="button"
        @click="addAdditionalPhone"
        class="add-item-btn flat-input"
        style="margin-top: 0"
        :title="$t('contactForm.addPhone')"
      >
        ➕ {{ $t('contactForm.addPhone') }}
      </button>
    </div>

    <div class="form-group">
      <label for="notes">{{ $t('contactForm.notes') }}: </label>
      <textarea
        id="notes"
        v-model="notes"
        rows="4"
        class="flat-input"
        maxlength="500"
        :placeholder="$t('contactForm.notesPlaceholder')"
      ></textarea>
      <span class="char-counter">{{
        $t('contactForm.charCounter', { count: notes.length, max: 500 })
      }}</span>
    </div>

    <div class="form-actions">
      <button
        type="submit"
        class="submit-btn"
        :disabled="contactStore.loading || groupStore.loading"
      >
        {{ $t('contactForm.save') }}
      </button>
      <button
        v-if="contactStore.contactToEdit"
        type="button"
        @click="clearFormAndResetEdit"
        class="cancel-btn"
      >
        {{ $t('contactForm.cancel') }}
      </button>
      <button
        v-if="!contactStore.contactToEdit"
        type="button"
        @click="router.push({ name: 'contact-list' })"
        class="cancel-btn"
      >
        {{ $t('contactForm.backToList') }}
      </button>
    </div>

    <p v-if="contactStore.error" class="error-message">
      {{ $t(contactStore.error) }}
    </p>
    <p v-if="groupStore.error" class="error-message">
      {{ $t(groupStore.error) }}
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
import IconWrapper from './icons/IconWrapper.vue'

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
  nameError.value = name.value.trim() === '' ? 'contactForm.validation.nameRequired' : ''
  lastNameError.value =
    lastName.value.trim() === '' ? 'contactForm.validation.lastNameRequired' : ''
  phoneError.value =
    phone.value.trim() === ''
      ? 'contactForm.validation.phoneRequired'
      : !/^([\d\s+\-()]+)$/.test(phone.value)
        ? 'contactForm.validation.phoneInvalid'
        : ''
  return !nameError.value && !lastNameError.value && !phoneError.value
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
