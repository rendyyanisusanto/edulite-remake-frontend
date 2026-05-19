<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <div v-for="item in items" :key="item.label" class="bg-white rounded-xl shadow-sm p-3">
      <p class="text-xs text-gray-500">{{ item.label }}</p>
      <p class="text-lg font-bold text-gray-800">{{ item.value }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({ items: { type: Array, default: () => [] } })
</script>
