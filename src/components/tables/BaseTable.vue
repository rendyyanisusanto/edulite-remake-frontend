<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- Search and Actions Bar -->
    <div v-if="showActions" class="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30">
        <div class="relative w-full sm:w-64">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
                type="text" 
                :value="searchQuery"
                @input="$emit('update:searchQuery', $event.target.value)"
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm" 
                placeholder="Search..." 
            />
        </div>
        <div class="flex space-x-2">
            <slot name="actions"></slot>
        </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto min-h-[300px] relative">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 z-10 sticky top-0">
          <tr>
            <th 
              v-for="col in columns" 
              :key="col.key" 
              scope="col" 
              class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
              :class="[col.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : '', col.class]"
              @click="col.sortable ? handleSort(col.key) : null"
            >
              <div class="flex items-center space-x-1">
                <span>{{ col.label }}</span>
                <span v-if="col.sortable && sortBy === col.key">
                  <svg v-if="sortDesc" class="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                  <svg v-else class="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                </span>
                <span v-else-if="col.sortable" class="text-gray-300">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>
                </span>
              </div>
            </th>
          </tr>
        </thead>
        
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- Skeleton Loading State -->
          <template v-if="loading">
            <tr v-for="i in 5" :key="`skeleton-${i}`" class="animate-pulse">
              <td v-for="col in columns" :key="`skel-col-${col.key}`" class="px-6 py-4 whitespace-nowrap">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              </td>
            </tr>
          </template>
          
          <!-- Empty State -->
          <tr v-else-if="!data || data.length === 0">
            <td :colspan="columns.length" class="px-6 py-10 whitespace-nowrap text-center">
              <div class="flex flex-col items-center justify-center text-gray-500">
                <svg class="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                <p class="text-base font-medium">No Data Available</p>
                <p class="text-sm mt-1">There are no matching records found.</p>
              </div>
            </td>
          </tr>
          
          <!-- Data Rows -->
          <template v-else>
            <tr v-for="(item, index) in data" :key="index" class="hover:bg-blue-50/50 transition-colors">
              <td 
                v-for="col in columns" 
                :key="col.key" 
                class="px-6 py-4 whitespace-nowrap text-sm"
                :class="col.class"
              >
                  <slot :name="`cell-${col.key}`" :item="item" :value="item[col.key]">
                    <span class="text-gray-900">{{ item[col.key] || '-' }}</span>
                  </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="showPagination" class="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Showing <span class="font-medium">{{ Math.max(1, (currentPage - 1) * perPage + 1) }}</span> to <span class="font-medium">{{ Math.min(total, currentPage * perPage) }}</span> of <span class="font-medium">{{ total }}</span> results
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button 
              @click="$emit('page-change', currentPage - 1)" 
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <span class="sr-only">Previous</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
            </button>
            
            <button 
                v-for="page in totalPages" 
                :key="page"
                @click="$emit('page-change', page)"
                :class="[
                  page === currentPage ? 'z-10 bg-primary/10 border-primary text-primary font-bold' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                ]"
                v-show="Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages"
            >
                <template v-if="Math.abs(page - currentPage) === 2 && page !== 1 && page !== totalPages">
                    ...
                </template>
                <template v-else>
                    {{ page }}
                </template>
            </button>

            <button 
              @click="$emit('page-change', currentPage + 1)" 
              :disabled="currentPage === totalPages || totalPages === 0"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <span class="sr-only">Next</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  columns: {
    type: Array, // Array of objects: { key: 'name', label: 'Name', sortable: true, class: '' }
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  showActions: {
    type: Boolean,
    default: true
  },
  searchQuery: {
    type: String,
    default: ''
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  total: {
    type: Number,
    default: 0
  },
  currentPage: {
    type: Number,
    default: 1
  },
  perPage: {
    type: Number,
    default: 10
  },
  sortBy: {
    type: String,
    default: ''
  },
  sortDesc: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:searchQuery', 'page-change', 'sort'])

const totalPages = computed(() => {
  return Math.ceil(props.total / props.perPage) || 1
})

const handleSort = (key) => {
  emit('sort', key)
}
</script>
