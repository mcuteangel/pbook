<template>
  <div class="controls-container">
    <div class="search-control">
      <label for="search">
        <!-- آیکون ذره‌بین برای جستجو -->
        <span class="icon-wrapper">
          <IconWrapper 
            icon="magnifying-glass" 
            prefix="fa-solid" 
            class="search-icon" 
          />
        </span>
        {{ $t('contactList.searchLabel') }}
      </label>
      <input
        id="search"
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        :placeholder="$t('contactList.searchPlaceholder')"
        class="control-input flat-input"
        type="text"
      />
    </div>
    <div class="sort-controls">
      <label for="sortField">
        <!-- آیکون مرتب‌سازی -->
        <span class="icon-wrapper">
          <IconWrapper 
            icon="arrow-up-a-z" 
            prefix="fa-solid" 
            class="sort-icon" 
          />
        </span>
        {{ $t('contactList.sortByLabel') }}
      </label>
      <select 
        id="sortField" 
        :value="sortField" 
        @change="$emit('update:sortField', $event.target.value)" 
        class="control-select flat-select"
      >
        <option v-for="option in sortOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <label for="sortOrder">{{ $t('contactList.sortOrderLabel') }}</label>
      <select 
        id="sortOrder" 
        :value="sortOrder" 
        @change="$emit('update:sortOrder', $event.target.value)" 
        class="control-select flat-select"
      >
        <option value="asc">{{ $t('contactList.sortOrderAsc') }}</option>
        <option value="desc">{{ $t('contactList.sortOrderDesc') }}</option>
      </select>
    </div>
    <button
      type="button"
      @click="$emit('toggleFilterSection')"
      class="advanced-filter-button flat-input"
    >
      <!-- آیکون تنظیمات فیلتر پیشرفته -->
      <span class="icon-wrapper">
        <IconWrapper 
          icon="sliders" 
          prefix="fa-solid" 
          class="filter-icon" 
        />
      </span>
      {{ $t('contactList.filterRulesTitle') }}
      <!-- آیکون فلش بالا/پایین -->
      <span class="icon-wrapper">
        <IconWrapper 
          :icon="isFilterSectionVisible ? 'chevron-up' : 'chevron-down'" 
          prefix="fa-solid" 
          class="toggle-icon" 
        />
      </span>
    </button>
  </div>
</template>
<script setup>
// ایمپورت مستقیم IconWrapper
import IconWrapper from '@/components/common/IconWrapper.vue'
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
  'toggle',
  'add',
])
</script>
