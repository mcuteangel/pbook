<template>
  <li class="contact-item">
    <div class="contact-info">
      <router-link
        :to="{ name: 'contact-detail', params: { id: contact.contact.id } }"
        class="contact-name-link"
      >
        <IconWrapper icon="fa-solid fa-user" />
        {{ contact.contact.name }} {{ contact.contact.lastName }}
      </router-link>
      <p v-for="fieldData in contact.displayData" :key="fieldData.key">
        <strong>{{ fieldData.label }}:</strong> {{ fieldData.value }}
      </p>
      <div
        v-if="contact.contact.additionalPhones && contact.contact.additionalPhones.length > 0"
        class="additional-info"
      >
        <strong>{{ $t('contactListItem.additionalPhones') }}:</strong>
        <ul>
          <li v-for="(additionalPhone, index) in contact.contact.additionalPhones" :key="index">
            {{ displayPhoneType(additionalPhone.type) }}: {{ additionalPhone.number }}
          </li>
        </ul>
      </div>
      <div
        v-if="contact.contact.addresses && contact.contact.addresses.length > 0"
        class="additional-info"
      >
        <strong>{{ $t('contactListItem.addresses') }}:</strong>
        <ul>
          <li v-for="(address, index) in contact.contact.addresses" :key="index">
            <strong>{{ displayAddressType(address.type) }}</strong
            >:
            {{ address.street ? address.street + ', ' : '' }}
            {{ address.city ? address.city : '' }}
            {{ address.province ? ', ' + address.province : '' }}
            {{ address.country ? ', ' + address.country : '' }}
            {{
              address.postalCode
                ? $t('contactListItem.postalCode') + ': ' + address.postalCode + ')'
                : ''
            }}
            <span v-if="address.notes">
              ({{ $t('contactListItem.notes') }}: {{ address.notes }})</span
            >
          </li>
        </ul>
      </div>
    </div>
    <div class="contact-actions">
      <button
        class="button edit-button"
        type="button"
        @click="$emit('edit', contact.contact)"
        :disabled="loading"
      >
        <IconWrapper icon="fa-solid fa-pen-to-square" /> {{ $t('contactListItem.edit') }}
      </button>
      <button
        class="button delete-button"
        type="button"
        @click="$emit('delete', contact.contact.id)"
      >
        <IconWrapper icon="fa-solid fa-trash" /> {{ $t('contactListItem.delete') }}
      </button>
    </div>
  </li>
</template>
<script setup>
import IconWrapper from './icons/IconWrapper.vue'
import { displayPhoneType, displayAddressType } from '@/utils/formatters/index'
const props = defineProps({
  contact: Object,
  loading: Boolean,
})
</script>
