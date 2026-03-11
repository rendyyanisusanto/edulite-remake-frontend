<template>
  <div class="h-full w-full">
    <router-view></router-view>
    <BaseToast ref="toastRef" />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import BaseToast from '@/components/ui/BaseToast.vue'
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()
const toastRef = ref(null)

watch(toasts, (newToasts) => {
  if (toastRef.value && newToasts.length > 0) {
    const latestToast = newToasts[newToasts.length - 1]
    toastRef.value.addToast(latestToast)
    // Clean up so it doesn't get re-added
    toasts.splice(0, toasts.length)
  }
}, { deep: true })
</script>
