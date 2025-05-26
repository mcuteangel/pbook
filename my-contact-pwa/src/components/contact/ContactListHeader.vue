<template>
  <div class="controls-container">
    <div class="search-control">
      <label for="search">
        <span style="margin-left: 2px"><IconWrapper icon="fa-solid fa-magnifying-glass" /></span>
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
        <span style="margin-left: 2px"><IconWrapper icon="fa-solid fa-arrow-up-a-z" /></span>
        {{ $t('contactList.sortByLabel') }}
      </label>
      <select id="sortField" :value="sortField" @change="$emit('update:sortField', $event.target.value)" class="control-select flat-select">
        <option v-for="option in sortOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <label for="sortOrder">{{ $t('contactList.sortOrderLabel') }}</label>
      <select id="sortOrder" :value="sortOrder" @change="$emit('update:sortOrder', $event.target.value)" class="control-select flat-select">
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
      {{ $t('contactList.filterRulesTitle') }}
      <span v-if="!isFilterSectionVisible"><IconWrapper icon="fa-solid fa-chevron-down" /></span>
      <span v-else><IconWrapper icon="fa-solid fa-chevron-up" /></span>
    </button>
  </div>
</template>
<script setup>
import { IconWrapper } from '@/components/common/commonComponents'
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
