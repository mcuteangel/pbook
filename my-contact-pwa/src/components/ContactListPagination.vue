<template>
  <div class="pagination-controls">
    <button @click="$emit('prevPage')" :disabled="currentPage === 1" class="pagination-button">
      <!-- آیکون فلش قبلی با پراپ‌های استاندارد -->
<IconWrapper icon="arrow-right" prefix="fa-solid" /> {{ $t('contactListPagination.previous') }}
    </button>
    <span
      >{{ $t('contactListPagination.page') }} {{ currentPage }}
      {{ $t('contactListPagination.of') }} {{ totalPages }}</span
    >
    <button
      @click="$emit('nextPage')"
      :disabled="currentPage === totalPages"
      class="pagination-button"
    >
      {{ $t('contactListPagination.next') }} <!-- آیکون فلش بعدی با پراپ‌های استاندارد -->
<IconWrapper icon="arrow-left" prefix="fa-solid" />
    </button>
    <div class="page-numbers">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="$emit('goToPage', page)"
        :class="['page-number-button', { active: currentPage === page }]"
      >
        <span v-if="currentPage === page"><!-- آیکون دایره صفحه جاری با پراپ‌های استاندارد -->
<IconWrapper icon="circle" prefix="fa-solid" /></span>
        {{ page }}
      </button>
    </div>
  </div>
</template>
<script setup>
import IconWrapper from '@/components/common/IconWrapper.vue'
const props = defineProps({
  currentPage: Number,
  totalPages: Number,
})
const emits = defineEmits(['prevPage', 'nextPage', 'goToPage'])
</script>
