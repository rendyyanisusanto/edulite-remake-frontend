<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Cetak Rapor Karakter</h1>
      <p class="text-sm text-gray-500">Pilih siswa untuk melihat ringkasan prestasi dan pelanggarannya.</p>
    </div>

    <!-- Data Table -->
    <BaseTable 
      :columns="columns" 
      :data="students" 
      :loading="loading" 
      :total="total" 
      :currentPage="currentPage" 
      :perPage="limit"
      :searchQuery="search"
      @update:searchQuery="handleSearch"
      @page-change="handlePageChange"
      @sort="handleSort"
      :sortBy="sortBy"
      :sortDesc="sortDesc"
    >
      <!-- Action Buttons Slot -->
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2 justify-end">
          <router-link :to="`/students/${item.id}/character-report`" class="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors" title="Lihat Rapor">
            <svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Buka Rapor
          </router-link>
        </div>
      </template>
    </BaseTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import studentService from '@/services/api/student.service'
import { useToast } from '@/composables/useToast'

const { error: showError } = useToast()

// Table State
const students = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const limit = ref(10)
const search = ref('')
const sortBy = ref('created_at')
const sortDesc = ref(true)

// Table Columns
const columns = [
  { key: 'nis', label: 'NIS', sortable: true },
  { key: 'nisn', label: 'NISN', sortable: true },
  { key: 'full_name', label: 'Nama Lengkap', sortable: true },
  { key: 'gender', label: 'L/P', sortable: true },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-32 text-right' }
]

// Methods
const fetchStudents = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: limit.value,
      search: search.value,
    }
    const response = await studentService.getAll(params)
    if (response.success) {
      students.value = response.data.students
      total.value = response.data.totalItems
    }
  } catch (err) {
    showError(err.message || 'Gagal mengambil data siswa')
  } finally {
    loading.value = false
  }
}

// Handlers
const handlePageChange = (page) => {
  currentPage.value = page
  fetchStudents()
}

// Debounced search
let searchTimeout
const handleSearch = (val) => {
  search.value = val
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchStudents()
  }, 500)
}

const handleSort = (key) => {
  if (sortBy.value === key) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = key
    sortDesc.value = true
  }
  fetchStudents()
}

// Lifecycle
onMounted(() => {
  fetchStudents()
})
</script>
