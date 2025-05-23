<template>
  <div class="controls-container">
    <div class="search-control">
      <label for="search">
        <span style="margin-left: 2px"><IconWrapper icon="fa-solid fa-magnifying-glass" /></span>
        جستجو:
      </label>
      <input
        id="search"
        v-model="searchQuery"
        placeholder="جستجو در مخاطبین..."
        class="control-input flat-input"
        type="text"
      />
    </div>
    <div class="sort-controls">
      <label for="sortField">
        <span style="margin-left: 2px"><IconWrapper icon="fa-solid fa-arrow-up-a-z" /></span>
        مرتب‌سازی بر اساس:
      </label>
      <select id="sortField" v-model="sortField" class="control-select flat-select">
        <option v-for="option in sortOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <label for="sortOrder">ترتیب:</label>
      <select id="sortOrder" v-model="sortOrder" class="control-select flat-select">
        <option value="asc">صعودی</option>
        <option value="desc">نزولی</option>
      </select>
    </div>
    <button
      type="button"
      @click="$emit('toggleFilterSection')"
      class="advanced-filter-button flat-input"
    >
      <span style="margin-left: 4px"><IconWrapper icon="fa-solid fa-sliders" /></span>
      فیلتر پیشرفته
      <span v-if="!isFilterSectionVisible"><IconWrapper icon="fa-solid fa-chevron-down" /></span>
      <span v-else><IconWrapper icon="fa-solid fa-chevron-up" /></span>
    </button>
  </div>
</template>
<script setup>
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
])
</script>
