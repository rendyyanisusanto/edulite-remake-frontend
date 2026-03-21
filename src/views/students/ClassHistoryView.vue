<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Riwayat Kelas Siswa</h1>
        <p class="text-sm text-gray-500 mt-1">Daftar semua penempatan kelas siswa per tahun ajaran</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <router-link to="/class-setup">
          <BaseButton icon="<svg class='h-5 w-5 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'/></svg>">
            Setup Kelas
          </BaseButton>
        </router-link>
        <BaseButton @click="openCreateModal" variant="outline" icon="<svg class='h-5 w-5 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 4v16m8-8H4'/></svg>">
          Tambah Manual
        </BaseButton>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Tahun Ajaran</label>
          <select v-model="filterAcademicYear" @change="applyFilters" class="block w-full rounded-lg border-gray-200 text-sm px-3 py-2 border bg-gray-50 focus:border-primary focus:ring-1 focus:ring-primary">
            <option value="">Semua Tahun Ajaran</option>
            <option v-for="year in academicYears" :key="year.id" :value="year.id">
              {{ year.name }} {{ year.is_active ? '(Aktif)' : '' }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Tingkat</label>
          <select v-model="filterGrade" @change="onGradeFilterChange" class="block w-full rounded-lg border-gray-200 text-sm px-3 py-2 border bg-gray-50 focus:border-primary focus:ring-1 focus:ring-primary">
            <option value="">Semua Tingkat</option>
            <option v-for="grade in grades" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Kelas</label>
          <select v-model="filterClass" @change="applyFilters" class="block w-full rounded-lg border-gray-200 text-sm px-3 py-2 border bg-gray-50 focus:border-primary focus:ring-1 focus:ring-primary">
            <option value="">Semua Kelas</option>
            <option v-for="cls in filteredClasses" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Tipe Penempatan</label>
          <select v-model="filterAssignmentType" @change="applyFilters" class="block w-full rounded-lg border-gray-200 text-sm px-3 py-2 border bg-gray-50 focus:border-primary focus:ring-1 focus:ring-primary">
            <option value="">Semua Tipe</option>
            <option value="MANUAL">Manual</option>
            <option value="AUTO">Otomatis</option>
          </select>
        </div>
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
      <template #cell-assignment_type="{ item }">
        <span :class="item.assignment_type === 'AUTO'
          ? 'bg-purple-100 text-purple-800'
          : 'bg-green-100 text-green-800'"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
          {{ item.assignment_type === 'AUTO' ? 'Otomatis' : 'Manual' }}
        </span>
      </template>
      <template #cell-assigner.name="{ item }">
        <span class="text-sm text-gray-600">{{ item.assigner?.name || '-' }}</span>
      </template>
      <template #cell-created_at="{ item }">
        <span class="text-sm text-gray-500">{{ formatDate(item.created_at) }}</span>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2 justify-end">
          <button @click="openDetailModal(item)" class="text-blue-600 hover:text-blue-900 mx-1" title="Lihat Detail">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
          <button @click="confirmDelete(item)" class="text-red-600 hover:text-red-900 mx-1" title="Hapus">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </template>
    </BaseTable>

    <!-- Create Modal -->
    <BaseModal v-model="showModal" title="Tambah Penempatan Kelas Manual" maxWidth="lg">
      <form @submit.prevent="saveHistory" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Siswa <span class="text-red-500">*</span></label>
          <select v-model="form.student_id" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" required>
            <option value="" disabled>Pilih Siswa</option>
            <option v-for="student in studentsList" :key="student.id" :value="student.id">
              {{ student.nis }} - {{ student.full_name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran <span class="text-red-500">*</span></label>
          <select v-model="form.academic_year_id" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" required>
            <option value="" disabled>Pilih Tahun Ajaran</option>
            <option v-for="year in academicYears" :key="year.id" :value="year.id">
              {{ year.name }} {{ year.is_active ? '(Aktif)' : '' }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tingkat <span class="text-red-500">*</span></label>
            <select v-model="form.grade_id" @change="loadClassesByGrade" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" required>
              <option value="" disabled>Pilih Tingkat</option>
              <option v-for="grade in grades" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kelas <span class="text-red-500">*</span></label>
            <select v-model="form.class_id" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" required :disabled="!form.grade_id">
              <option value="" disabled>Pilih Kelas</option>
              <option v-for="cls in modalFilteredClasses" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipe Penempatan</label>
          <select v-model="form.assignment_type" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50">
            <option value="MANUAL">Manual</option>
            <option value="AUTO">Otomatis / Kenaikan Kelas</option>
          </select>
        </div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="saveHistory" :loading="saving">Simpan</BaseButton>
      </template>
    </BaseModal>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetailModal" title="Detail Riwayat Kelas" maxWidth="lg">
      <div v-if="currentHistory" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-gray-500">Nama Siswa</p>
            <p class="font-semibold text-gray-800">{{ currentHistory.student?.full_name }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">NIS / NISN</p>
            <p class="font-semibold text-gray-800">{{ currentHistory.student?.nis }} / {{ currentHistory.student?.nisn || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Tahun Ajaran</p>
            <p class="font-semibold text-gray-800">{{ currentHistory.academic_year?.name }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Tingkat</p>
            <p class="font-semibold text-gray-800">{{ currentHistory.grade?.name }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Kelas</p>
            <p class="font-semibold text-gray-800">{{ currentHistory.class_info?.name }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Tipe Penempatan</p>
            <span :class="currentHistory.assignment_type === 'AUTO' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
              {{ currentHistory.assignment_type === 'AUTO' ? 'Otomatis' : 'Manual' }}
            </span>
          </div>
          <div>
            <p class="text-xs text-gray-500">Ditempatkan Oleh</p>
            <p class="font-semibold text-gray-800">{{ currentHistory.assigner?.name || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Tanggal Penempatan</p>
            <p class="font-semibold text-gray-800">{{ formatDate(currentHistory.created_at) }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showDetailModal = false">Tutup</BaseButton>
      </template>
    </BaseModal>

    <!-- Delete Modal -->
    <BaseModal v-model="showDeleteModal" title="Konfirmasi Hapus" maxWidth="sm">
      <p class="text-sm text-gray-500">
        Hapus penempatan kelas <span class="font-bold text-gray-900">{{ currentHistory?.student?.full_name }}</span> dari kelas
        <span class="font-bold text-gray-900">{{ currentHistory?.class_info?.name }}</span>?
        Data yang dihapus tidak dapat dikembalikan.
      </p>
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
const limit = ref(15)
const search = ref('')
const sortBy = ref('created_at')
const sortDesc = ref(true)

// Filters
const filterAcademicYear = ref('')
const filterGrade = ref('')
const filterClass = ref('')
const filterAssignmentType = ref('')

// Related Data
const studentsList = ref([])
const academicYears = ref([])
const grades = ref([])
const allClasses = ref([])

// Modal State
const showModal = ref(false)
const showDetailModal = ref(false)
const showDeleteModal = ref(false)
const saving = ref(false)
const deleting = ref(false)
const currentHistory = ref(null)

// Form State
const defaultForm = { student_id: '', academic_year_id: '', grade_id: '', class_id: '', assignment_type: 'MANUAL' }
const form = reactive({ ...defaultForm })

// Computed
const filteredClasses = computed(() =>
  filterGrade.value ? allClasses.value.filter(c => c.grade_id == filterGrade.value) : allClasses.value
)
const modalFilteredClasses = computed(() =>
  form.grade_id ? allClasses.value.filter(c => c.grade_id == form.grade_id) : []
)

// Columns
const columns = [
  { key: 'student.full_name', label: 'Nama Siswa', sortable: false },
  { key: 'academic_year.name', label: 'Tahun Ajaran', sortable: false },
  { key: 'grade.name', label: 'Tingkat', sortable: false },
  { key: 'class_info.name', label: 'Kelas', sortable: false },
  { key: 'assignment_type', label: 'Tipe', sortable: true },
  { key: 'assigner.name', label: 'Oleh', sortable: false },
  { key: 'created_at', label: 'Tanggal', sortable: true },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-24 text-right' }
]

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Data Fetch
const fetchHistories = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value, limit: limit.value, search: search.value,
      academic_year_id: filterAcademicYear.value || undefined,
      grade_id: filterGrade.value || undefined,
      class_id: filterClass.value || undefined,
      assignment_type: filterAssignmentType.value || undefined
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
    const [resStudents, resYears, resGrades, resClasses] = await Promise.all([
      studentService.getAll({ limit: 500 }),
      academicYearService.getAll(),
      gradeService.getAll(),
      classService.getAll()
    ])
    if (resStudents.success) studentsList.value = resStudents.data.students || []
    if (resYears.success) academicYears.value = resYears.data.academicYears || []
    if (resGrades.success) grades.value = resGrades.data.grades || []
    if (resClasses.success) allClasses.value = resClasses.data.classes || []

    // Default to active academic year
    const activeYear = academicYears.value.find(y => y.is_active)
    if (activeYear) filterAcademicYear.value = activeYear.id
    fetchHistories()
  } catch (err) {
    console.error('Error loading master data:', err)
    fetchHistories()
  }
}

// Handlers
const applyFilters = () => { currentPage.value = 1; fetchHistories() }
const onGradeFilterChange = () => { filterClass.value = ''; applyFilters() }
const handlePageChange = (page) => { currentPage.value = page; fetchHistories() }
let searchTimeout
const handleSearch = (val) => {
  search.value = val
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { currentPage.value = 1; fetchHistories() }, 500)
}
const handleSort = (key) => {
  if (sortBy.value === key) sortDesc.value = !sortDesc.value
  else { sortBy.value = key; sortDesc.value = true }
  fetchHistories()
}

// Modal Actions
const openCreateModal = () => {
  Object.assign(form, defaultForm)
  const activeYear = academicYears.value.find(y => y.is_active)
  if (activeYear) form.academic_year_id = activeYear.id
  showModal.value = true
}
const openDetailModal = (history) => { currentHistory.value = history; showDetailModal.value = true }
const confirmDelete = (history) => { currentHistory.value = history; showDeleteModal.value = true }
const loadClassesByGrade = () => { form.class_id = '' }

// API Actions
const saveHistory = async () => {
  if (!form.student_id || !form.academic_year_id || !form.grade_id || !form.class_id) {
    showError('Harap lengkapi semua field wajib!')
    return
  }
  saving.value = true
  try {
    await studentClassHistoryService.create(form)
    success('Penempatan kelas berhasil ditambahkan')
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
    success('Data penempatan kelas berhasil dihapus')
    showDeleteModal.value = false
    if (histories.value.length === 1 && currentPage.value > 1) currentPage.value--
    fetchHistories()
  } catch (err) {
    showError(err.message || 'Gagal menghapus data')
  } finally {
    deleting.value = false
  }
}

onMounted(() => { loadMasterData() })
</script>
