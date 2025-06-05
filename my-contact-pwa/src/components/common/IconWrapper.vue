<template>
  <!--
    این عنصر <i> برای نمایش آیکون Font Awesome استفاده میشه
    کلاس‌ها و استایل‌ها به صورت داینامیک بر اساس پراپ‌ها ست میشن
  -->
  <i :class="iconClasses" :style="iconStyle" aria-hidden="true"></i>
</template>

<script setup>
// ایمپورت توابع مورد نیاز از Vue
import { computed } from 'vue'

// تعریف پراپ‌های ورودی کامپوننت با تایپ و مقدار پیش‌فرض
const props = defineProps({
  /**
   * نام آیکون (بدون پیشوند fa-)، مثلاً 'user' یا 'address-book'
   */
  icon: {
    type: String,
    required: true
  },
  /**
   * اندازه آیکون (مثلاً 'lg'، '2x' و ...)
   */
  size: {
    type: String,
    default: null
  },
  /**
   * رنگ آیکون (کد رنگ CSS یا نام رنگ)
   */
  color: {
    type: String,
    default: null
  },
  /**
   * انیمیشن Font Awesome (مثلاً 'fa-spin' یا 'fa-pulse')
   */
  animation: {
    type: String,
    default: null
  },
  /**
   * پیشوند کلاس Font Awesome (مثلاً 'fas', 'far', 'fab')
   * solid پیش‌فرض:  'fas'
   */
  prefix: {
    type: String,
    default: 'fas',
    validator: (val) => ['fas', 'far', 'fab', 'fal', 'fad'].includes(val)
  }
})

// محاسبه کلاس‌های نهایی آیکون
const iconClasses = computed(() => {
  let classes = `${props.prefix} fa-${props.icon}`
  if (props.size) {
    classes += ` fa-${props.size}`
  }
  if (props.animation) {
    classes += ` ${props.animation}`
  }
  return classes
})

// محاسبه استایل‌های داینامیک آیکون
const iconStyle = computed(() => {
  const style = {}
  if (props.color) {
    style.color = props.color
  }
  return style
})
</script>

<style scoped>
/* استایل پایه‌ای برای آیکون‌ها (در صورت نیاز می‌تونی سفارشی‌ترش کنی) */
</style>
