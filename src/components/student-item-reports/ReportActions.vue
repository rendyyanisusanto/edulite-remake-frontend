<template>
  <div class="flex flex-wrap gap-2">
    <BaseButton @click="$emit('apply')" variant="primary">Terapkan Filter</BaseButton>
    <BaseButton variant="secondary" @click="$emit('reset')">Reset</BaseButton>
    <BaseButton variant="ghost" @click="$emit('preview')">
      <span class="inline-flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H3m0 0l4-4m-4 4l4 4M21 5v14"/></svg>
        Preview Web
      </span>
    </BaseButton>
    <BaseButton variant="warning" @click="$emit('pdf')">
      <span class="inline-flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16v-8m0 8l-3-3m3 3l3-3M5 20h14"/></svg>
        Download PDF
      </span>
    </BaseButton>
    <router-link to="/student-item-deposits/reports" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100">
      <span class="inline-flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Kembali ke Daftar Laporan
      </span>
    </router-link>
  </div>
</template>

<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
defineEmits(['apply', 'reset', 'preview', 'pdf'])
</script>
