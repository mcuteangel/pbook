<template>
  <div class="form-group avatar-section">
    <label for="avatar">{{ $t('contactForm.avatar') }}:</label>
    <div class="avatar-upload-wrapper">
      <img
        :src="avatarPreview || defaultAvatar"
        alt="Avatar Preview"
        class="avatar-preview"
        @error="onAvatarError"
      />
      <input
        type="file"
        id="avatar"
        @change="handleAvatarChange"
        accept="image/*"
        class="avatar-input"
        ref="avatarInput"
      />
      <button type="button" @click="triggerAvatarUpload" class="upload-avatar-btn">
        <IconWrapper icon="fa-solid fa-upload" /> {{ $t('contactForm.uploadAvatar') }}
      </button>
      <button
        type="button"
        v-if="avatarPreview && avatarPreview !== defaultAvatar"
        @click="removeAvatar"
        class="remove-avatar-btn"
      >
        <IconWrapper icon="fa-solid fa-trash" /> {{ $t('contactForm.removeAvatar') }}
      </button>
    </div>
    <span v-if="avatarError" class="field-error">{{ $t(avatarError) }}</span>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import IconWrapper from '@/components/icons/IconWrapper.vue'
import defaultAvatar from '@/assets/img/icons/default-avatar.svg' // مسیر آواتار پیش‌فرض

const props = defineProps({
  modelValue: {
    // آواتار به صورت Base64 یا URL
    type: String,
    default: null,
  },
  avatarError: {
    // خطای مربوط به آواتار
    type: String,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'update:avatarError'])

const avatarPreview = ref(props.modelValue)
const avatarInput = ref(null)

// به‌روزرسانی پیش‌نمایش وقتی modelValue تغییر می‌کند
watch(
  () => props.modelValue,
  (newValue) => {
    avatarPreview.value = newValue
  },
)

const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 1024 * 1024) {
      // محدودیت حجم فایل (مثلاً 1 مگابایت)
      emit('update:avatarError', 'contactForm.avatarSizeError')
      avatarPreview.value = defaultAvatar
      emit('update:modelValue', null)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
      emit('update:modelValue', e.target.result) // ارسال Base64 به والد
      emit('update:avatarError', null) // پاک کردن خطا در صورت موفقیت
    }
    reader.onerror = () => {
      emit('update:avatarError', 'contactForm.avatarReadError')
      avatarPreview.value = defaultAvatar
      emit('update:modelValue', null)
    }
    reader.readAsDataURL(file)
  } else {
    removeAvatar() // اگر فایلی انتخاب نشد، آواتار را پاک کن
  }
}

const triggerAvatarUpload = () => {
  avatarInput.value.click()
}

const removeAvatar = () => {
  avatarPreview.value = defaultAvatar
  emit('update:modelValue', null) // ارسال null به والد
  emit('update:avatarError', null) // پاک کردن خطا
  if (avatarInput.value) {
    avatarInput.value.value = '' // ریست کردن input file
  }
}

const onAvatarError = (event) => {
  // اگر بارگذاری آواتار اصلی (مثلاً از Base64 ذخیره شده) با خطا مواجه شد، آواتار پیش‌فرض را نمایش بده
  event.target.src = defaultAvatar
  // نیازی به emit کردن خطا به والد نیست مگر اینکه بخواهیم وضعیت خطا را در والد هم نمایش دهیم
}

// در صورت نیاز به اکسپوز کردن متدها به والد
defineExpose({
  removeAvatar, // مثلاً برای ریست کردن فرم از بیرون
})
</script>

<style scoped>
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-border);
}

.avatar-input {
  display: none; /* مخفی کردن input file اصلی */
}

.upload-avatar-btn,
.remove-avatar-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
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

.field-error {
  color: var(--color-danger);
  font-size: 0.9em;
  margin-top: 5px;
}
</style>
