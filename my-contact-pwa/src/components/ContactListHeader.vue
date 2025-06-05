<template>
  <h1>این کامپوننت هدر لیست مخاطبین نسخه جدید است!!!!</h1>
  <div class="controls-container">
    <div class="search-control">
      <label for="search">
        <span style="margin-left: 2px"><IconWrapper icon="fa-solid fa-magnifying-glass" /></span>
        {{ $t('contactList.search') }}:
      </label>
      <input
        id="search"
        v-model="searchQuery"
        :placeholder="$t('contactList.searchPlaceholder')"
        class="control-input flat-input"
        type="text"
      />
    </div>
    <div class="sort-controls">
      <label for="sortField">
        <span style="margin-left: 2px"><IconWrapper icon="fa-solid fa-arrow-up-a-z" /></span>
        {{ $t('contactList.sortBy') }}:
      </label>
      <select id="sortField" v-model="sortField" class="control-select flat-select">
        <option v-for="option in sortOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <label for="sortOrder">{{ $t('contactList.sortOrder') }}:</label>
      <select id="sortOrder" v-model="sortOrder" class="control-select flat-select">
        <option value="asc">{{ $t('contactList.sortOrderAsc') }}</option>
        <option value="desc">{{ $t('contactList.sortOrderDesc') }}</option>
      </select>
    </div>
    <button
      type="button"
      @click="$emit('toggleFilterSection')"
      class="advanced-filter-button flat-input"
    >
      <span style="margin-left: 4px"><IconWrapper icon="fa-solid fa-sliders" /></span>
      {{ $t('contactList.advancedFilter') }}
      <span v-if="!isFilterSectionVisible"><IconWrapper icon="fa-solid fa-chevron-down" /></span>
      <span v-else><IconWrapper icon="fa-solid fa-chevron-up" /></span>
    </button>
  </div>
</template>
<script setup>
console.log('اسکریپت ContactListHeader.vue نسخه جدید اجرا شد!')
import IconWrapper from './icons/IconWrapper.vue'
const props = defineProps({
  searchQuery: String,
  sortField: String,
  sortOrder: String,
  sortOptions: Array,
  isFilterSectionVisible: Boolean,
})
const emits = defineEmits([
  'update:searchQuery',
  'update:sortField',
  'update:sortOrder',
  'toggleFilterSection',
  'add',

])
</script>
