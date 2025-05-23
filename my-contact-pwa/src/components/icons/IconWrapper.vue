<template>
  <component :is="iconComponent" v-bind="iconProps" />
</template>

<script setup>
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
const props = defineProps({
  icon: {
    type: [String, Array],
    required: true,
  },
  size: {
    type: String,
    default: '1x',
  },
  color: {
    type: String,
    default: '',
  },
  // ...other props as needed
})

const iconComponent = computed(() => FontAwesomeIcon)
const iconProps = computed(() => ({
  icon: props.icon,
  size: props.size,
  color: props.color,
  // ...other props
}))
</script>
