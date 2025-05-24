<template>
  <div class="form-item">
    <label>{{ label }}</label>
    <slot></slot>
    <span v-if="description">{{ description }}</span>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  label: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.form-item {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--border-radius-medium);
  background-color: var(--color-background-soft);
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: var(--color-text-primary);
}

.form-item span {
  display: block;
  font-size: 0.9em;
  color: var(--color-text-secondary);
  margin-top: 5px;
}
</style>
