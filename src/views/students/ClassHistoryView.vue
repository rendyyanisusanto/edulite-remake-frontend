<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Riwayat Kelas Siswa</h1>
      <div class="flex flex-wrap gap-2">
        <BaseButton @click="openCreateModal" icon="<svg class='h-5 w-5 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 4v16m8-8H4'/></svg>">
          Tentukan Kelas Siswa
        </BaseButton>
      </div>
    </div>

    <!-- Data Table -->
    <BaseTable 
      :columns="columns" 
      :data="histories" 
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
      <template #cell-student.full_name="{ item }">
        <div class="font-medium text-gray-900">{{ item.student?.full_name || '-' }}</div>
        <div class="text-xs text-gray-500">{{ item.student?.nis || '-' }}</div>
      </template>
      <template #cell-academic_year.name="{ item }">
        {{ item.academic_year?.name || '-' }}
      </template>
      <template #cell-grade.name="{ item }">
        {{ item.grade?.name || '-' }}
      </template>
      <template #cell-class_info.name="{ item }">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {{ item.class_info?.name || '-' }}
        </span>
      </template>
      
      <!-- Action Buttons Slot -->
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2 justify-end">
          <button @click="openEditModal(item)" class="text-blue-600 hover:text-blue-900 mx-1 tooltip" title="Edit">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button @click="confirmDelete(item)" class="text-red-600 hover:text-red-900 mx-1 tooltip" title="Hapus">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </template>
    </BaseTable>

    <!-- Create/Edit Modal Form -->
    <BaseModal v-model="showModal" :title="isEditing ? 'Edit Riwayat Kelas' : 'Tentukan Kelas Baru'" maxWidth="lg">
      <form @submit.prevent="saveHistory" class="space-y-4">
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Siswa <span class="text-red-500">*</span></label>
          <select v-model="form.student_id" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" required :disabled="isEditing">
            <option value="" disabled>Pilih Siswa</option>
            <option v-for="student in studentsList" :key="student.id" :value="student.id">
              {{ student.nis }} - {{ student.full_name }}
            </option>
          </select>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran <span class="text-red-500">*</span></label>
          <select v-model="form.academic_year_id" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" required>
            <option value="" disabled>Pilih Tahun Ajaran</option>
            <option v-for="year in academicYears" :key="year.id" :value="year.id">
              {{ year.name }} {{ year.is_active ? '(Aktif)' : '' }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tingkat Kelas <span class="text-red-500">*</span></label>
            <select v-model="form.grade_id" @change="loadClassesByGrade" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" required>
              <option value="" disabled>Pilih Tingkat</option>
              <option v-for="grade in grades" :key="grade.id" :value="grade.id">
                {{ grade.name }}
              </option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Kelas <span class="text-red-500">*</span></label>
            <select v-model="form.class_id" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" required :disabled="!form.grade_id">
              <option value="" disabled>Pilih Kelas</option>
              <option v-for="cls in filteredClasses" :key="cls.id" :value="cls.id">
                {{ cls.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipe Penentuan</label>
          <select v-model="form.assignment_type" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50">
            <option value="MANUAL">Manual</option>
            <option value="AUTO">Otomatis / Kenaikan Kelas</option>
          </select>
        </div>
      </form>

      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="saveHistory" :loading="saving">Simpan Data</BaseButton>
      </template>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal v-model="showDeleteModal" title="Konfirmasi Hapus" maxWidth="sm">
      <div class="mt-2 text-center sm:text-left">
        <p class="text-sm text-gray-500">
          Apakah Anda yakin ingin menghapus data riwayat kelas 
          <span class="font-bold text-gray-900">{{ currentHistory?.student?.full_name }}</span> dari kelas 
          <span class="font-bold text-gray-900">{{ currentHistory?.class_info?.name }}</span>? Data yang dihapus tidak dapat dikembalikan.
        </p>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showDeleteModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton variant="danger" @click="deleteHistory" :loading="deleting">Ya, Hapus</BaseButton>
      </template>
    </BaseModal>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import studentClassHistoryService from '@/services/api/studentClassHistory.service'
import studentService from '@/services/api/student.service'
import { academicYearService, gradeService, classService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()

// Table State
const histories = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const limit = ref(10)
const search = ref('')
const sortBy = ref('created_at')
const sortDesc = ref(true)

// Related Data State
const studentsList = ref([])
const academicYears = ref([])
const grades = ref([])
const allClasses = ref([])
const filteredClasses = ref([])

// Modal State
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const currentHistory = ref(null)

// Form State
const defaultForm = {
  student_id: '',
  academic_year_id: '',
  grade_id: '',
  class_id: '',
  assignment_type: 'MANUAL'
}
const form = reactive({ ...defaultForm })

// Table Columns
const columns = [
  { key: 'student.full_name', label: 'Nama Siswa', sortable: false },
  { key: 'academic_year.name', label: 'Tahun Ajaran', sortable: false },
  { key: 'grade.name', label: 'Tingkat', sortable: false },
  { key: 'class_info.name', label: 'Kelas', sortable: false },
  { key: 'assignment_type', label: 'Tipe', sortable: true },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-24 text-right' }
]

// Methods
const fetchHistories = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: limit.value,
      search: search.value,
    }
    const response = await studentClassHistoryService.getAll(params)
    if (response.success) {
      histories.value = response.data.histories
      total.value = response.data.totalItems
    }
  } catch (err) {
    showError(err.message || 'Gagal mengambil data riwayat kelas')
  } finally {
    loading.value = false
  }
}

const loadMasterData = async () => {
  try {
    // For large databases, we might need a search select for students, 
    // but for simplicity we fetch all or top 500 here if minimal.
    // Assuming studentService.getAll without limits fetches a lot, we may just fetch 500 max for dropdown
    const resStudents = await studentService.getAll({ limit: 500 })
    if (resStudents.success) studentsList.value = resStudents.data.students || []

    const resYears = await academicYearService.getAll()
    if (resYears.success) academicYears.value = resYears.data.academicYears || []

    const resGrades = await gradeService.getAll()
    if (resGrades.success) grades.value = resGrades.data.grades || []

    const resClasses = await classService.getAll()
    if (resClasses.success) allClasses.value = resClasses.data.classes || []
  } catch (err) {
    console.error('Error loading master data:', err)
  }
}

const loadClassesByGrade = () => {
  if (form.grade_id) {
    filteredClasses.value = allClasses.value.filter(c => c.grade_id === form.grade_id)
    // reset class_id if not in new list
    if (!filteredClasses.value.find(c => c.id === form.class_id)) {
      form.class_id = ''
    }
  } else {
    filteredClasses.value = []
  }
}

// Handlers
const handlePageChange = (page) => {
  currentPage.value = page
  fetchHistories()
}

let searchTimeout
const handleSearch = (val) => {
  search.value = val
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchHistories()
  }, 500)
}

const handleSort = (key) => {
  if (sortBy.value === key) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = key
    sortDesc.value = true
  }
  fetchHistories()
}

// Modal Actions
const openCreateModal = () => {
  isEditing.value = false
  currentHistory.value = null
  Object.assign(form, defaultForm)
  // Set default active academic year if exists
  const activeYear = academicYears.value.find(y => y.is_active)
  if (activeYear) form.academic_year_id = activeYear.id
  
  filteredClasses.value = []
  showModal.value = true
}

const openEditModal = (history) => {
  isEditing.value = true
  currentHistory.value = history
  Object.assign(form, history)
  loadClassesByGrade()
  showModal.value = true
}

const confirmDelete = (history) => {
  currentHistory.value = history
  showDeleteModal.value = true
}

// API Actions
const saveHistory = async () => {
  if (!form.student_id || !form.academic_year_id || !form.grade_id || !form.class_id) {
    showError('Harap lengkapi semua field wajib (*) !')
    return
  }
  
  saving.value = true
  try {
    if (isEditing.value) {
      await studentClassHistoryService.update(currentHistory.value.id, form)
      success('Riwayat kelas berhasil diperbarui')
    } else {
      await studentClassHistoryService.create(form)
      success('Riwayat kelas baru berhasil ditambahkan')
    }
    showModal.value = false
    fetchHistories()
  } catch (err) {
    showError(err.message || 'Gagal menyimpan data')
  } finally {
    saving.value = false
  }
}

const deleteHistory = async () => {
  deleting.value = true
  try {
    await studentClassHistoryService.delete(currentHistory.value.id)
    success('Data riwayat kelas berhasil dihapus')
    showDeleteModal.value = false
    
    if (histories.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }
    fetchHistories()
  } catch (err) {
    showError(err.message || 'Gagal menghapus data')
  } finally {
    deleting.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchHistories()
  loadMasterData()
})
</script>
