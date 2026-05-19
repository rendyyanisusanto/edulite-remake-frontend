<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
    <div>
      <p class="text-xs text-gray-500">{{ breadcrumbs }}</p>
      <h1 class="text-2xl font-bold text-gray-800">{{ title }}</h1>
      <p class="text-sm text-gray-500 mt-0.5">{{ description }}</p>
    </div>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  breadcrumbs: { type: String, default: '' }
})
</script>
