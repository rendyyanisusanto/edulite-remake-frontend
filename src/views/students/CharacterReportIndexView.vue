<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Cetak Rapor Karakter</h1>
        <p class="text-sm text-gray-500">Pilih siswa untuk melihat ringkasan prestasi dan pelanggarannya.</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-end">
      <div class="flex-1 w-full">
        <label class="block text-xs font-medium text-gray-500 uppercase mb-1 ml-1">Cari Siswa</label>
        <div class="relative">
          <input 
            type="text" 
            v-model="search" 
            @input="handleSearch($event.target.value)"
            placeholder="Cari nama, NIS, atau NISN..." 
            class="block w-full rounded-lg border-gray-200 pl-10 focus:border-primary focus:ring-primary sm:text-sm bg-gray-50/50 py-2.5"
          >
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>
      </div>
      <div class="w-full sm:w-64">
        <label class="block text-xs font-medium text-gray-500 uppercase mb-1 ml-1">Filter Kelas</label>
        <select 
          v-model="selectedClass" 
          @change="fetchStudents"
          class="block w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary sm:text-sm bg-gray-50/50 py-2.5"
        >
          <option value="">Semua Kelas</option>
          <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
    </div>

    <!-- Data Table -->
    <BaseTable 
      :columns="columns" 
      :data="students" 
      :loading="loading" 
      :total="total" 
      :currentPage="currentPage" 
      :perPage="limit"
      @page-change="handlePageChange"
      @sort="handleSort"
      :sortBy="sortBy"
      :sortDesc="sortDesc"
    >
      <!-- Class Slot -->
      <template #cell-class="{ item }">
        <span class="text-gray-700">
          {{ item.class_history && item.class_history.length > 0 && item.class_history[0].class_info ? item.class_history[0].class_info.name : '-' }}
        </span>
      </template>

      <!-- Action Buttons Slot -->
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2 justify-end">
          <button 
            @click="openExportModal(item)" 
            class="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors border border-blue-100" 
            title="Export PDF"
          >
            <svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export
          </button>
          <router-link :to="`/students/${item.id}/character-report`" class="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors" title="Lihat Rapor">
            <svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Detail
          </router-link>
        </div>
      </template>
    </BaseTable>

    <!-- Export Setup Modal -->
    <BaseModal v-model="showExportModal" title="Pengaturan Ekspor PDF" maxWidth="md">
      <div v-if="selectedStudentForExport" class="space-y-4">
        <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <p class="text-xs text-blue-600 uppercase font-bold mb-1">Eksport Untuk</p>
          <p class="text-sm font-bold text-blue-900">{{ selectedStudentForExport.full_name }}</p>
          <p class="text-xs text-blue-700">NIS: {{ selectedStudentForExport.nis || '-' }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Catatan Pembinaan (Opsional)</label>
          <textarea v-model="exportNotes" rows="4" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" placeholder="Masukkan catatan khusus untuk rapor siswa ini."></textarea>
          <p class="mt-1 text-xs text-gray-500">Catatan ini akan langsung tercetak di dalam dokumen PDF.</p>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showExportModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="exportPdf" :loading="exporting">
          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Proses Export
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import studentService from '@/services/api/student.service'
import { classService } from '@/services/api/academic.service'
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

// Filter State
const classes = ref([])
const selectedClass = ref('')

// Export State
const showExportModal = ref(false)
const exportNotes = ref('')
const selectedStudentForExport = ref(null)
const exporting = ref(false)

// Table Columns
const columns = [
  { key: 'nis', label: 'NIS', sortable: true },
  { key: 'full_name', label: 'Nama Lengkap', sortable: true },
  { key: 'class', label: 'Kelas', sortable: false },
  { key: 'gender', label: 'L/P', sortable: true },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-48 text-right' }
]

// Methods
const fetchClasses = async () => {
  try {
    const response = await classService.getAll({ limit: 100 })
    if (response.success) {
      classes.value = response.data.classes
    }
  } catch (err) {
    console.error('Gagal mengambil data kelas:', err)
  }
}

const fetchStudents = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: limit.value,
      search: search.value,
      class_id: selectedClass.value
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

// Export Methods
const openExportModal = (student) => {
    selectedStudentForExport.value = student
    exportNotes.value = ''
    showExportModal.value = true
}

const exportPdf = async () => {
    if (!selectedStudentForExport.value) return
    
    exporting.value = true
    try {
        const student = selectedStudentForExport.value
        const response = await studentService.downloadCharacterReportPdf(student.id, exportNotes.value)
        
        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `Rapor Karakter Siswa - ${student.full_name}.pdf`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        showExportModal.value = false
    } catch (err) {
        showError('Gagal mengunduh dokumen PDF')
    } finally {
        exporting.value = false
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
  fetchClasses()
  fetchStudents()
})
</script>
