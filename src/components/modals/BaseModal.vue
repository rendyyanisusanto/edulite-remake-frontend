<template>
  <Transition name="modal">
    <div v-if="modelValue" class="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        <!-- Background Overlay -->
        <Transition name="overlay">
          <div v-show="modelValue" class="fixed inset-0 bg-gray-900/60 transition-opacity" @click="closeOnOutside ? $emit('update:modelValue', false) : null" aria-hidden="true"></div>
        </Transition>

        <!-- Centering trick -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <!-- Modal Panel -->
        <Transition name="panel">
          <div v-show="modelValue" :class="[maxWidthClass, 'relative inline-block align-bottom bg-white rounded-xl text-left shadow-2xl transform transition-all sm:my-8 sm:align-middle w-full z-10']">
            
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                <slot name="title">{{ title }}</slot>
              </h3>
              <button v-if="showClose" @click="$emit('update:modelValue', false)" type="button" class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <span class="sr-only">Close</span>
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 pt-5 pb-6">
              <slot></slot>
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="bg-gray-50/80 px-4 py-3 border-t border-gray-100 sm:px-6 sm:flex sm:justify-end rounded-b-xl">
              <slot name="footer"></slot>
            </div>

          </div>
        </Transition>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Modal Title'
  },
  maxWidth: {
    type: String,
    default: 'md', // sm, md, lg, xl, 2xl
    validator: (value) => ['sm', 'md', 'lg', 'xl', '2xl'].includes(value)
  },
  showClose: {
    type: Boolean,
    default: true
  },
  closeOnOutside: {
    type: Boolean,
    default: true
  }
})

defineEmits(['update:modelValue'])

const maxWidthClass = computed(() => {
  switch (props.maxWidth) {
    case 'sm': return 'sm:max-w-sm'
    case 'md': return 'sm:max-w-md'
    case 'lg': return 'sm:max-w-lg'
    case 'xl': return 'sm:max-w-xl'
    case '2xl': return 'sm:max-w-2xl'
    default: return 'sm:max-w-md'
  }
})
</script>

<style scoped>
/* Modal Root Transition (delays leaving so inner transitions finish) */
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Overlay Transition */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Panel Transition */
.panel-enter-active,
.panel-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.95);
}
</style>
