<template>
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
      <select
        :value="phoneItem.type"
        @change="$emit('update:phone', index, { ...phoneItem, type: $event.target.value })"
        class="flat-select item-select"
      >
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
        :value="phoneItem.number"
        @input="$emit('update:phone', index, { ...phoneItem, number: $event.target.value })"
        :placeholder="$t('contactForm.additionalPhonePlaceholder')"
        class="flat-input item-input"
      />
      <button
        type="button"
        @click="$emit('remove:phone', phoneItem.id)"
        class="remove-item-btn"
        :title="$t('contactForm.removePhone')"
      >
        🗑️ {{ $t('contactForm.removePhone') }}
      </button>
    </div>
    <button
      type="button"
      @click="$emit('add:phone')"
      class="add-item-btn flat-input"
      style="margin-top: 0"
      :title="$t('contactForm.addPhone')"
    >
      ➕ {{ $t('contactForm.addPhone') }}
    </button>
  </div>
</template>

<script setup>
import IconWrapper from './icons/IconWrapper.vue'

defineProps({
  additionalPhones: Array, // لیست شماره تلفن‌های اضافه
})

defineEmits(['update:phone', 'remove:phone', 'add:phone'])
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
</style>
