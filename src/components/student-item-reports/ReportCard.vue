<template>
  <div class="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3" :class="isHighlighted ? 'ring-1 ring-amber-300' : ''">
    <div class="flex items-start justify-between">
      <div class="h-10 w-10 rounded-lg bg-gray-100/80 flex items-center justify-center text-gray-700 font-bold">{{ iconText }}</div>
      <span class="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{{ category }}</span>
    </div>
    <div>
      <h3 class="text-base font-semibold text-gray-800">{{ title }}</h3>
      <p class="text-sm text-gray-500 mt-1">{{ description }}</p>
    </div>
    <p class="text-xs text-gray-500">Output: Web Preview + PDF</p>
    <router-link :to="route" class="inline-flex items-center justify-center px-3 py-2 rounded-md bg-primary text-white text-sm hover:bg-blue-600">Buka Laporan</router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  title: String,
  description: String,
  icon: String,
  category: String,
  route: String,
  isHighlighted: Boolean
})
const iconText = computed(() => (props.icon || 'R').slice(0, 2).toUpperCase())
</script>
