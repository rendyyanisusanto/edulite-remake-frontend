<template>
  <button
    :type="type"
    class="inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
    :class="[variantClasses, sizeClasses, block ? 'w-full' : '', customClass]"
    :disabled="disabled || loading"
  >
    <!-- Loading Spinner -->
    <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    
    <!-- Left Icon (if provided & not loading) -->
    <span v-if="icon && !loading" class="mr-2 -ml-1 h-5 w-5" v-html="icon"></span>
    
    <!-- Button Content -->
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary', // primary, secondary, outline, danger, ghost
    validator: (value) => ['primary', 'secondary', 'outline', 'danger', 'ghost'].includes(value)
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  block: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: '' // SVG HTML string
  },
  customClass: {
    type: String,
    default: ''
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'border-transparent text-white bg-primary hover:bg-blue-600 focus:ring-primary'
    case 'secondary':
      return 'border-transparent text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500'
    case 'outline':
      return 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary'
    case 'danger':
      return 'border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500'
    case 'ghost':
      return 'border-transparent text-gray-600 bg-transparent hover:bg-gray-100 focus:ring-gray-500 shadow-none'
    default:
      return 'border-transparent text-white bg-primary hover:bg-blue-600 focus:ring-primary'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-xs'
    case 'md':
      return 'px-4 py-2 text-sm'
    case 'lg':
      return 'px-6 py-3 text-base'
    default:
      return 'px-4 py-2 text-sm'
  }
})
</script>
