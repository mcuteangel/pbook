<template>
  <div class="pagination-controls">
    <button @click="$emit('prevPage')" :disabled="currentPage === 1" class="pagination-button">
      <!-- آیکون فلش به چپ برای رفتن به صفحه قبل -->
      <IconWrapper 
        icon="arrow-right" 
        prefix="fa-solid" 
        class="pagination-icon" 
      />
      {{ $t('contactList.paginationPrev') }}
    </button>
    <span>{{
      $t('contactList.paginationPageInfo', { currentPage: currentPage, totalPages: totalPages })
    }}</span>
    <button
      @click="$emit('nextPage')"
      :disabled="currentPage === totalPages"
      class="pagination-button"
    >
      {{ $t('contactList.paginationNext') }}
      <!-- آیکون فلش به راست برای رفتن به صفحه بعد -->
      <IconWrapper 
        icon="arrow-left" 
        prefix="fa-solid" 
        class="pagination-icon" 
      />
    </button>
    <div class="page-numbers">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="$emit('goToPage', page)"
        :class="['page-number-button', { active: currentPage === page }]"
      >
        <span v-if="currentPage === page">
          <!-- آیکون دایره برای نمایش صفحه فعلی -->
          <IconWrapper 
            icon="circle" 
            prefix="fa-solid" 
            class="current-page-icon" 
          />
        </span>
        {{ page }}
      </button>
    </div>
  </div>
</template>
<script setup>
import { watch } from 'vue'
// ایمپورت مستقیم کامپوننت IconWrapper
import IconWrapper from '@/components/common/IconWrapper.vue'

const props = defineProps({
  currentPage: Number,
  totalPages: Number,
})
const emits = defineEmits(['prevPage', 'nextPage', 'goToPage'])
watch(() => props.currentPage, (newVal) => {
  if (newVal > props.totalPages) {
    emits('goToPage', Math.max(1, props.totalPages))
  }
})
</script>
