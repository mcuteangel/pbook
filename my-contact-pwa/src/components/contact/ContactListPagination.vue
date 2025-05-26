<template>
  <div class="pagination-controls">
    <button @click="$emit('prevPage')" :disabled="currentPage === 1" class="pagination-button">
      <IconWrapper icon="fa-solid fa-arrow-right" /> {{ $t('contactList.paginationPrev') }}
    </button>
    <span>{{
      $t('contactList.paginationPageInfo', { currentPage: currentPage, totalPages: totalPages })
    }}</span>
    <button
      @click="$emit('nextPage')"
      :disabled="currentPage === totalPages"
      class="pagination-button"
    >
      {{ $t('contactList.paginationNext') }} <IconWrapper icon="fa-solid fa-arrow-left" />
    </button>
    <div class="page-numbers">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="$emit('goToPage', page)"
        :class="['page-number-button', { active: currentPage === page }]"
      >
        <span v-if="currentPage === page"><IconWrapper icon="fa-solid fa-circle" /></span>
        {{ page }}
      </button>
    </div>
  </div>
</template>
<script setup>
import { IconWrapper } from '@/components/common/commonComponents'
const props = defineProps({
  currentPage: Number,
  totalPages: Number,
})
const emits = defineEmits(['prevPage', 'nextPage', 'goToPage'])
</script>
