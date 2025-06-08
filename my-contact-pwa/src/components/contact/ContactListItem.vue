<template>
  <li v-if="contact" class="contact-item">
    <div class="contact-info">
      <a
        @click.prevent="handleNameClick"
        class="contact-name-link"
        :aria-label="$t('contactList.viewContactDetails', { name: contact.name })"
      >
        <IconWrapper icon="user" prefix="fa-solid" class="contact-icon" />
        <span class="contact-name"> {{ contact.name || '' }} {{ contact.lastName || '' }} </span>
      </a>
      <p v-for="fieldData in contact.displayData" :key="fieldData.key">
        <strong>{{ fieldData.label }}:</strong> {{ fieldData.value }}
      </p>
      <div
        v-if="contact.additionalPhones && contact.additionalPhones.length > 0"
        class="additional-info"
      >
        <strong>{{ $t('contactList.additionalPhonesLabel') }}:</strong>
        <ul>
          <li v-for="(additionalPhone, index) in contact.additionalPhones" :key="index">
            {{ displayPhoneType(additionalPhone.type) }}: {{ additionalPhone.number }}
          </li>
        </ul>
      </div>
      <div v-if="contact.addresses && contact.addresses.length > 0" class="additional-info">
        <strong>{{ $t('contactList.addressesLabel') }}:</strong>
        <ul>
          <li v-for="(address, index) in contact.addresses" :key="index">
            <strong>{{ displayAddressType(address.type) }}</strong
            >:
            {{ formatAddress(address) }}
            {{
              address.postalCode
                ? $t('contactList.postalCodeLabel', { postalCode: address.postalCode })
                : ''
            }}
            <span v-if="address.notes">
              {{ $t('contactList.notesLabel', { notes: address.notes }) }}</span
            >
          </li>
        </ul>
      </div>
    </div>
    <div class="contact-actions">
      <button
        class="button edit-button"
        type="button"
        @click="$emit('edit', contact)"
        :disabled="loading"
        :aria-label="$t('contactList.editButton')"
      >
        <IconWrapper icon="pen-to-square" prefix="fa-solid" class="action-icon" />
        {{ $t('contactList.editButton') }}
      </button>
      <button
        class="button delete-button"
        type="button"
        @click="$emit('delete', contact.id)"
        :aria-label="$t('contactList.deleteButton')"
      >
        <IconWrapper icon="trash" prefix="fa-solid" class="action-icon" />
        {{ $t('contactList.deleteButton') }}
      </button>
    </div>
  </li>
  <li v-else class="contact-item loading">
    <div class="contact-info">
      <div class="skeleton-loader">
        <div class="skeleton-name"></div>
        <div class="skeleton-field"></div>
        <div class="skeleton-field"></div>
      </div>
    </div>
  </li>
</template>

<script setup>
import IconWrapper from '@/components/common/IconWrapper.vue'
import { displayPhoneType, displayAddressType, formatAddress } from '@/utils/formatters/index'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

const props = defineProps({
  contact: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

// اضافه کردن console.log برای دیباگ
console.log('ContactListItem - Full contact object:', props.contact)
console.log('ContactListItem - Contact ID:', props.contact?.id)
console.log('ContactListItem - Contact name:', props.contact?.name)

// اضافه کردن تابع برای هندل کردن کلیک روی نام
const handleNameClick = () => {
  console.log('ContactListItem - Name clicked')
  console.log('ContactListItem - Navigating to contact:', props.contact?.id)
  router.push({ name: 'contact-detail', params: { id: props.contact?.id } })
}
</script>

<style scoped>
.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  margin-bottom: 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
  transition: all 0.3s ease;
}

.contact-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--glass-shadow-hover);
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-name-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.contact-name-link:hover {
  color: var(--primary);
}

.contact-icon {
  font-size: 1.25rem;
  color: var(--primary);
}

.contact-name {
  font-size: 1.125rem;
}

.additional-info {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.additional-info ul {
  list-style: none;
  padding: 0;
  margin: 0.25rem 0 0;
}

.additional-info li {
  margin-bottom: 0.25rem;
}

.contact-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
}

.button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-button {
  background: var(--primary);
  color: white;
}

.edit-button:hover {
  background: var(--primary-dark);
}

.delete-button {
  background: var(--error);
  color: white;
}

.delete-button:hover {
  background: var(--error-dark);
}

.action-icon {
  font-size: 1rem;
}

/* استایل‌های loading */
.contact-item.loading {
  pointer-events: none;
}

.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-name {
  width: 60%;
  height: 1.5rem;
  background: var(--glass-bg-hover);
  border-radius: var(--radius-md);
  animation: pulse 1.5s infinite;
}

.skeleton-field {
  width: 80%;
  height: 1rem;
  background: var(--glass-bg-hover);
  border-radius: var(--radius-md);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
}

/* استایل‌های موبایل */
@media (max-width: 640px) {
  .contact-item {
    flex-direction: column;
  }

  .contact-actions {
    margin: 1rem 0 0;
    width: 100%;
  }

  .button {
    flex: 1;
    justify-content: center;
  }
}
</style>
