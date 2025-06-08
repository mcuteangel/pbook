<template>
  <div class="detail-section" v-if="addresses && addresses.length > 0">
    <h4>{{ $t('contactForm.addresses') }}</h4>
    <ul>
      <li v-for="(address, index) in addresses" :key="'address-' + index">
        <strong>{{ displayAddressType(address.type) }}</strong
        >:
        {{ address.street ? address.street + ', ' : '' }}
        {{ address.city ? address.city : '' }}
        {{ address.province ? ', ' + address.province : '' }}
        {{ address.country ? ', ' + address.country : '' }}
        {{
          address.postalCode
            ? ' (' + $t('contactForm.postalCode') + ': ' + address.postalCode + ')'
            : ''
        }}
        <span v-if="address.notes">
          ({{ $t('contactForm.addressNotes') }}: {{ address.notes }})</span
        >
        <a v-if="address.geo" :href="geoLink(address)" target="_blank" class="map-link">{{
          $t('contactForm.viewOnMap')
        }}</a>
      </li>
    </ul>
  </div>
</template>
<script setup>
import { displayAddressType } from '@/utils/formatters/index'
const props = defineProps({
  addresses: Array,
})
function geoLink(address) {
  if (address.geo && address.geo.lat && address.geo.lng) {
    return `https://www.google.com/maps?q=${address.geo.lat},${address.geo.lng}`
  }
  return ''
}
</script>
