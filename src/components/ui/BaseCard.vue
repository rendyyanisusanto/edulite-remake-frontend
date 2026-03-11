<template>
  <div class="glass rounded-xl shadow-sm border border-gray-100 overflow-hidden" :class="[noPadding ? '' : 'p-6', customClass]">
    <div v-if="$slots.header || title" class="border-b border-gray-100/50 pb-4 mb-4" :class="{ 'px-6 pt-6': noPadding }">
      <slot name="header">
        <h3 class="text-lg leading-6 font-medium text-gray-900">{{ title }}</h3>
        <p v-if="subtitle" class="mt-1 text-sm text-gray-500">{{ subtitle }}</p>
      </slot>
    </div>
    
    <div :class="{ 'px-6 pb-6': noPadding }">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="border-t border-gray-100/50 mt-4 pt-4" :class="{ 'px-6 pb-6': noPadding }">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  noPadding: {
    type: Boolean,
    default: false
  },
  customClass: {
    type: String,
    default: ''
  }
})
</script>
