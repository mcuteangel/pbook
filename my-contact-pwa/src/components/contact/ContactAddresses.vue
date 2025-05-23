<template>
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
        <select
          :value="address.type"
          @change="$emit('update:address', index, { ...address, type: $event.target.value })"
          class="flat-select compact-select"
        >
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
          :value="address.street"
          @input="$emit('update:address', index, { ...address, street: $event.target.value })"
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
          :value="address.city"
          @input="$emit('update:address', index, { ...address, city: $event.target.value })"
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
          :value="address.province"
          @input="$emit('update:address', index, { ...address, province: $event.target.value })"
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
          :value="address.country"
          @input="$emit('update:address', index, { ...address, country: $event.target.value })"
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
          :value="address.postalCode"
          @input="$emit('update:address', index, { ...address, postalCode: $event.target.value })"
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
          :value="address.notes"
          @input="$emit('update:address', index, { ...address, notes: $event.target.value })"
          :placeholder="$t('contactForm.addressNotesPlaceholder')"
          class="flat-input compact-input"
          rows="2"
        ></textarea>
      </div>
      <button
        type="button"
        @click="$emit('remove:address', address.id)"
        class="remove-item-btn"
        :title="$t('contactForm.removeAddress')"
      >
        🗑️ {{ $t('contactForm.removeAddress') }}
      </button>
    </div>
    <button
      type="button"
      @click="$emit('add:address')"
      class="add-item-btn flat-input"
      style="margin-top: 0"
      :title="$t('contactForm.addAddress')"
    >
      ➕ {{ $t('contactForm.addAddress') }}
    </button>
  </div>
</template>

<script setup>
import IconWrapper from './icons/IconWrapper.vue'

defineProps({
  contactAddresses: Array, // لیست آدرس‌ها
})

defineEmits(['update:address', 'remove:address', 'add:address'])
</script>

<style scoped>
.additional-items-section h4 {
  margin-bottom: 15px;
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
  position: relative; /* Needed for absolute positioning of remove button */
}

.address-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.address-field {
  display: flex;
  flex-direction: column;
}

.address-field label {
  margin-bottom: 5px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
}

.compact-select,
.compact-input {
  padding: 8px;
  font-size: 0.9em;
}

.address-notes-field {
  grid-column: span full-width; /* Make notes field span across columns */
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
</style>
