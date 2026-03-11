<template>
  <div class="mb-4 relative" ref="dropdownRef">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="relative">
      <!-- Selected State View -->
      <div v-if="displayLabel && !isSearching" class="relative">
        <div class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white flex justify-between items-center cursor-pointer transition-colors hover:border-primary"
             :class="error ? 'border-red-300' : 'border-gray-300'"
             @click="enableSearch">
          <span class="truncate text-gray-900">{{ displayLabel }}</span>
          <button type="button" @click.stop="clearSelection" class="text-gray-400 hover:text-red-500 focus:outline-none">
             <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
             </svg>
          </button>
        </div>
      </div>

      <!-- Searching / Input State -->
      <div v-else class="relative">
        <input 
          type="text" 
          ref="searchInput"
          v-model="searchQuery" 
          @input="onSearchInput"
          @focus="isOpen = true"
          :placeholder="placeholder"
          class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50 backdrop-blur-sm transition-colors"
          :class="error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'"
        />
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg v-if="loading" class="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else-if="!searchQuery" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Dropdown Menu -->
      <Transition 
        enter-active-class="transition duration-100 ease-out" 
        enter-from-class="transform scale-95 opacity-0" 
        enter-to-class="transform scale-100 opacity-100" 
        leave-active-class="transition duration-75 ease-in" 
        leave-from-class="transform scale-100 opacity-100" 
        leave-to-class="transform scale-95 opacity-0">
        <ul v-show="isOpen && isSearching" class="absolute z-[100] mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm">
          <li v-if="options.length === 0 && !loading" class="text-gray-500 cursor-default select-none relative py-2 pl-3 pr-9">
            Tidak ada data ditemukan
          </li>
          <li v-for="option in options" :key="option.value" @click="selectItem(option)" class="text-gray-900 cursor-pointer select-none relative py-2 px-3 hover:bg-blue-50 hover:text-blue-900 transition-colors">
            <span class="block truncate" :class="{'font-medium': option.value === modelValue}">{{ option.label }}</span>
            <span v-if="option.description" class="block truncate text-xs text-gray-500 mt-0.5">{{ option.description }}</span>
          </li>
        </ul>
      </Transition>
    </div>

    <!-- Error/Hint Message -->
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  initialLabel: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Ketik untuk mencari...'
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  fetchOptions: {
    type: Function,
    required: true // (query) => Promise<Array<{value: any, label: string, description?: string}>>
  }
})

const emit = defineEmits(['update:modelValue', 'update:label', 'change'])

const dropdownRef = ref(null)
const searchInput = ref(null)

const isOpen = ref(false)
const isSearching = ref(false)
const loading = ref(false)
const searchQuery = ref('')
const options = ref([])
const displayLabel = ref(props.initialLabel)

// Handle Outside Click
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  if (!props.modelValue) {
    isSearching.value = true
    loadOptions('')
  } else {
    isSearching.value = false
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

watch(() => props.initialLabel, (newVal) => {
  displayLabel.value = newVal
})

watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    clearSelection()
  } else {
    isSearching.value = false
  }
})

const closeDropdown = () => {
  isOpen.value = false
  if (!props.modelValue) {
    searchQuery.value = ''
  } else {
    isSearching.value = false
  }
}

const enableSearch = () => {
  isSearching.value = true
  isOpen.value = true
  searchQuery.value = ''
  loadOptions('')
  nextTick(() => {
    if (searchInput.value) searchInput.value.focus()
  })
}

let searchTimeout = null
const onSearchInput = () => {
  isOpen.value = true
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadOptions(searchQuery.value)
  }, 400)
}

const loadOptions = async (query) => {
  loading.value = true
  try {
    options.value = await props.fetchOptions(query)
  } catch (err) {
    console.error('Failed to fetch options for select', err)
    options.value = []
  } finally {
    loading.value = false
  }
}

const selectItem = (option) => {
  displayLabel.value = option.label
  searchQuery.value = ''
  isSearching.value = false
  isOpen.value = false
  
  emit('update:modelValue', option.value)
  emit('update:label', option.label)
  emit('change', option)
}

const clearSelection = () => {
  displayLabel.value = ''
  searchQuery.value = ''
  isSearching.value = true
  isOpen.value = true
  
  emit('update:modelValue', '')
  emit('update:label', '')
  emit('change', null)
  
  loadOptions('')
  nextTick(() => {
    if (searchInput.value) searchInput.value.focus()
  })
}
</script>
