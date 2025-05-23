<template>
  <div class="main-fields-section">
    <div class="main-fields-grid">
      <div class="form-group">
        <label for="name">
          <span :title="$t('contactForm.nameRequired')">
            <IconWrapper icon="fa-solid fa-signature" />
          </span>
          {{ $t('contactForm.name') }}:
          <span class="required-star" :title="$t('contactForm.requiredField')">*</span>
        </label>
        <input
          id="name"
          :value="name"
          @input="$emit('update:name', $event.target.value)"
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
          <span :title="$t('contactForm.lastNameRequired')">
            <IconWrapper icon="fa-solid fa-signature" />
          </span>
          {{ $t('contactForm.lastName') }}:
          <span class="required-star" :title="$t('contactForm.requiredField')">*</span>
        </label>
        <input
          id="lastName"
          :value="lastName"
          @input="$emit('update:lastName', $event.target.value)"
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
          <span :title="$t('contactForm.phoneHint')">
            <IconWrapper icon="fa-solid fa-phone" />
          </span>
          {{ $t('contactForm.phone') }}:
          <span class="required-star" :title="$t('contactForm.requiredField')">*</span>
        </label>
        <input
          id="phone"
          :value="phone"
          @input="$emit('update:phone', $event.target.value)"
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
          :value="title"
          @input="$emit('update:title', $event.target.value)"
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
        <select
          id="gender"
          :value="gender"
          @change="$emit('update:gender', $event.target.value)"
          class="flat-select"
        >
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
        <select
          id="group"
          :value="contactGroup"
          @change="$emit('update:contactGroup', $event.target.value)"
          class="flat-select"
        >
          <option value="">{{ $t('contactForm.noGroup') }}</option>
          <option v-for="g in sortedGroups" :key="g.id" :value="g.name">
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
            :value="newGroupName"
            @input="$emit('update:newGroupName', $event.target.value)"
            :placeholder="$t('contactForm.newGroupPlaceholder')"
            class="flat-input"
            type="text"
          />
        </div>
      </div>
      <div class="form-group">
        <label for="position">
          <span><IconWrapper icon="fa-solid fa-user-tie" /></span>
          {{ $t('contactForm.position') }}:
        </label>
        <input
          id="position"
          :value="position"
          @input="$emit('update:position', $event.target.value)"
          class="flat-input"
          type="text"
          :placeholder="$t('contactForm.positionPlaceholder')"
        />
      </div>
      <div class="form-group">
        <label for="birthDate">
          <span><IconWrapper icon="fa-solid fa-cake-candles" /></span>
          {{ $t('contactForm.birthDate') }}:
        </label>
        <date-picker
          :value="birthDate"
          @update:modelValue="$emit('update:birthDate', $event)"
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
</template>

<script setup>
import IconWrapper from './icons/IconWrapper.vue'
import DatePicker from 'vue3-persian-datetime-picker'

defineProps({
  name: String,
  lastName: String,
  phone: String,
  title: String,
  gender: String,
  contactGroup: String,
  position: String,
  birthDate: String,
  nameError: String,
  lastNameError: String,
  phoneError: String,
  sortedGroups: Array,
  isCreatingNewGroup: Boolean,
  newGroupName: String,
})

defineEmits([
  'update:name',
  'update:lastName',
  'update:phone',
  'update:title',
  'update:gender',
  'update:contactGroup',
  'update:position',
  'update:birthDate',
  'update:newGroupName',
])
</script>

<style scoped>
.main-fields-section {
  margin-bottom: 20px;
}

.main-fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
}

.required-star {
  color: var(--color-danger);
  margin-left: 2px;
}

.flat-input,
.flat-select {
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  background-color: var(--color-background-soft);
  color: var(--color-text);
  font-size: 1em;
  transition: border-color 0.3s ease;
}

.flat-input:focus,
.flat-select:focus {
  border-color: var(--color-primary);
  outline: none;
}

.flat-select {
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22292.362%22 height%3D%22292.362%22 viewBox%3D%220 0 292.362 292.362%22%3E%3Cpath fill%3D%22%23000000%22 d%3D%22M287.9 139.8H4.4c-6.1 0-9.4 7.3-5.1 11.6l139.8 139.8c4.2 4.2 11 4.2 15.2 0l139.8-139.8c4.3-4.3 1-11.6-5.1-11.6z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 10px top 50%;
  background-size: 12px auto;
  padding-right: 30px; /* Make space for the custom arrow */
}

.new-group-input {
  margin-top: 10px;
  padding: 10px;
  border: 1px dashed var(--color-border);
  border-radius: 5px;
  background-color: var(--color-background-mute);
}

.new-group-input label {
  font-weight: normal;
  margin-bottom: 5px;
}

.field-error {
  color: var(--color-danger);
  font-size: 0.9em;
  margin-top: 5px;
}
</style>
