<template>
  <TransitionGroup 
    name="toast" 
    tag="div" 
    class="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none w-[calc(100vw-1.5rem)] max-w-[34rem]"
  >
    <div 
      v-for="toast in toasts" 
      :key="toast.id"
      class="pointer-events-auto w-full rounded-xl border shadow-xl overflow-hidden flex"
      :class="{
        'bg-emerald-50 border-emerald-200': toast.type === 'success',
        'bg-red-50 border-red-200': toast.type === 'error',
        'bg-amber-50 border-amber-200': toast.type === 'warning',
        'bg-blue-50 border-blue-200': !['success','error','warning'].includes(toast.type)
      }"
    >
      <div class="p-4 sm:p-5 w-full flex items-start">
        <div class="flex-shrink-0">
          <!-- Icons based on type -->
          <svg v-if="toast.type === 'success'" class="h-6 w-6 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <svg v-else-if="toast.type === 'error'" class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <svg v-else-if="toast.type === 'warning'" class="h-6 w-6 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <svg v-else class="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p class="text-sm sm:text-base font-semibold text-gray-900">{{ toast.title }}</p>
          <p v-if="toast.message" class="mt-1 text-sm sm:text-[15px] leading-5 text-gray-700 break-words">{{ toast.message }}</p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button @click="removeToast(toast.id)" class="rounded-md inline-flex text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <span class="sr-only">Close</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
          </button>
        </div>
      </div>
    </div>
  </TransitionGroup>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

// Method to add a toast, can be exported or pushed to a global store
const addToast = (toast) => {
  const id = toastId++
  toasts.value.push({ ...toast, id })
  
  if (toast.duration !== 0) {
    setTimeout(() => {
      removeToast(id)
    }, toast.duration || 3000)
  }
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

// Expose the methods to be used by parent component or a composable
defineExpose({ addToast, removeToast })
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
