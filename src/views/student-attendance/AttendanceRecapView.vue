<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Rekap Absensi Siswa</h1>
        <p class="text-sm text-gray-500 mt-1">Lihat rekap kehadiran siswa dengan berbagai filter.</p>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-6 gap-3">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p class="text-xs text-gray-500 font-medium">Total Siswa</p>
        <p class="text-2xl font-bold mt-1" :class="summaryLoading ? 'animate-pulse text-gray-400' : 'text-blue-600'">
          {{ summaryLoading ? '...' : summary.total }}
        </p>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p class="text-xs text-gray-500 font-medium">Hadir</p>
        <p class="text-2xl font-bold mt-1" :class="summaryLoading ? 'animate-pulse text-gray-400' : 'text-emerald-600'">
          {{ summaryLoading ? '...' : summary.hadir }}
        </p>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p class="text-xs text-gray-500 font-medium">Terlambat</p>
        <p class="text-2xl font-bold mt-1" :class="summaryLoading ? 'animate-pulse text-gray-400' : 'text-amber-600'">
          {{ summaryLoading ? '...' : summary.terlambat }}
        </p>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p class="text-xs text-gray-500 font-medium">Izin</p>
        <p class="text-2xl font-bold mt-1" :class="summaryLoading ? 'animate-pulse text-gray-400' : 'text-blue-600'">
          {{ summaryLoading ? '...' : summary.izin }}
        </p>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p class="text-xs text-gray-500 font-medium">Sakit</p>
        <p class="text-2xl font-bold mt-1" :class="summaryLoading ? 'animate-pulse text-gray-400' : 'text-purple-600'">
          {{ summaryLoading ? '...' : summary.sakit }}
        </p>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p class="text-xs text-gray-500 font-medium">Alpa</p>
        <p class="text-2xl font-bold mt-1" :class="summaryLoading ? 'animate-pulse text-gray-400' : 'text-rose-600'">
          {{ summaryLoading ? '...' : summary.alpa }}
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <input
          v-model="filters.date"
          type="date"
          @change="applyFilters"
          class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <select
          v-model="filters.class_id"
          @change="applyFilters"
          class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="">Semua Kelas</option>
          <option v-for="klass in classes" :key="klass.id" :value="String(klass.id)">
            {{ klass.name }}
          </option>
        </select>
        <select
          v-model="filters.attendance_status"
          @change="applyFilters"
          class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="">Semua Status</option>
          <option v-for="status in STATUS_OPTIONS" :key="status.value" :value="status.value">
            {{ status.label }}
          </option>
        </select>
        <select
          v-model="filters.input_method"
          @change="applyFilters"
          class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="">Semua Metode</option>
          <option v-for="method in INPUT_METHOD_OPTIONS" :key="method.value" :value="method.value">
            {{ method.label }}
          </option>
        </select>
        <div class="flex items-center gap-2">
          <input
            v-model="filters.keyword"
            type="text"
            placeholder="Cari siswa..."
            @input="handleSearch"
            class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="text-xs text-red-500 hover:text-red-700 font-medium whitespace-nowrap"
          >
            Hapus Filter
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <BaseTable
      :columns="columns"
      :data="attendances"
      :loading="loading"
      :total="total"
      :currentPage="currentPage"
      :perPage="limit"
      :searchQuery="filters.keyword"
      @update:searchQuery="filters.keyword = $event"
      @page-change="handlePageChange"
    >
      <template #cell-student="{ item }">
        <div>
          <p class="font-semibold text-gray-900">{{ item.student?.full_name || '-' }}</p>
          <p class="text-xs text-gray-500">NIS: {{ item.student?.nis || '-' }}</p>
        </div>
      </template>

      <template #cell-class_info="{ item }">
        <span class="text-sm font-medium text-gray-800">
          {{ item.class_info?.name || '-' }}
        </span>
      </template>

      <template #cell-attendance_date="{ item }">
        <span class="text-sm font-medium text-gray-800">
          {{ formatDate(item.attendance_date) }}
        </span>
      </template>

      <template #cell-clock_in_at="{ item }">
        <span class="text-sm text-gray-800">
          {{ formatTime(item.clock_in_at) }}
        </span>
      </template>

      <template #cell-attendance_status="{ item }">
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="getStatusBadge(item.attendance_status)">
          {{ getStatusLabel(item.attendance_status) }}
        </span>
      </template>

      <template #cell-input_method="{ item }">
        <span class="px-2 py-0.5 rounded text-xs font-medium" :class="getMethodBadge(item.input_method)">
          {{ getMethodLabel(item.input_method) }}
        </span>
      </template>

      <template #cell-notes="{ item }">
        <span class="text-sm text-gray-600">
          {{ item.notes || '-' }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center gap-1.5">
          <button
            @click="openDetail(item)"
            class="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
            title="Detail"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
          <button
            v-if="canUpdate"
            @click="openEdit(item)"
            class="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Edit"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
        </div>
      </template>
    </BaseTable>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetailModal" title="Detail Absensi" maxWidth="lg">
      <template v-if="detailLoading">
        <div class="animate-pulse space-y-4">
          <div class="h-4 bg-gray-200 rounded w-1/3"></div>
          <div class="h-8 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </template>
      <template v-else-if="detailItem">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500">Nama Siswa</span>
            <p class="font-semibold">{{ detailItem.student?.full_name || '-' }}</p>
          </div>
          <div>
            <span class="text-gray-500">NIS</span>
            <p class="font-semibold">{{ detailItem.student?.nis || '-' }}</p>
          </div>
          <div>
            <span class="text-gray-500">Kelas</span>
            <p class="font-semibold">{{ detailItem.class_info?.name || '-' }}</p>
          </div>
          <div>
            <span class="text-gray-500">Tanggal</span>
            <p class="font-semibold">{{ formatDate(detailItem.attendance_date) }}</p>
          </div>
          <div>
            <span class="text-gray-500">Status</span>
            <p class="font-semibold">
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="getStatusBadge(detailItem.attendance_status)">
                {{ getStatusLabel(detailItem.attendance_status) }}
              </span>
            </p>
          </div>
          <div>
            <span class="text-gray-500">Jam Masuk</span>
            <p class="font-semibold">{{ formatTime(detailItem.clock_in_at) }}</p>
          </div>
          <div>
            <span class="text-gray-500">Metode Input</span>
            <p class="font-semibold">
              <span class="px-2 py-0.5 rounded text-xs font-medium" :class="getMethodBadge(detailItem.input_method)">
                {{ getMethodLabel(detailItem.input_method) }}
              </span>
            </p>
          </div>
          <div>
            <span class="text-gray-500">Keterangan</span>
            <p class="font-semibold">{{ detailItem.notes || '-' }}</p>
          </div>
          <div v-if="detailItem.input_method === 'rfid'">
            <span class="text-gray-500">RFID</span>
            <p class="font-semibold text-amber-600">Data dari RFID</p>
          </div>
          <div>
            <span class="text-gray-500">Dibuat Oleh</span>
            <p class="font-semibold">{{ detailItem.created_by?.name || '-' }}</p>
          </div>
          <div>
            <span class="text-gray-500">Waktu Dibuat</span>
            <p class="font-semibold">{{ formatDateTime(detailItem.created_at) }}</p>
          </div>
          <div>
            <span class="text-gray-500">Terakhir Diperbarui</span>
            <p class="font-semibold">{{ formatDateTime(detailItem.updated_at) }}</p>
          </div>
        </div>
      </template>
      <template #footer>
        <BaseButton variant="outline" @click="showDetailModal = false">Tutup</BaseButton>
        <BaseButton
          v-if="canUpdate && detailItem"
          @click="closeDetailAndEdit"
          class="ml-3"
        >
          Edit
        </BaseButton>
      </template>
    </BaseModal>

    <!-- Edit Modal -->
    <BaseModal
      v-model="showEditModal"
      :title="editItem ? 'Edit Absensi' : 'Edit Absensi'"
      maxWidth="lg"
    >
      <form v-if="editItem" @submit.prevent="saveEdit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Siswa
            </label>
            <input
              :value="`${editItem.student?.full_name} (${editItem.student?.nis})`"
              disabled
              class="block w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              v-model="editForm.attendance_status"
              class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option v-for="status in STATUS_OPTIONS" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Jam Masuk
            </label>
            <input
              v-model="editForm.clock_in_at"
              type="time"
              class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Keterangan
            </label>
            <textarea
              v-model="editForm.notes"
              rows="2"
              class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
            ></textarea>
          </div>
        </div>
        <div v-if="editFormError" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {{ editFormError }}
        </div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showEditModal = false">Batal</BaseButton>
        <BaseButton @click="saveEdit" :loading="saving">
          Simpan Perubahan
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import studentAttendanceService from '@/services/api/studentAttendance.service'
import { classService } from '@/services/api/academic.service'

const authStore = useAuthStore()
const { success, error } = useToast()

// Permissions
const canView = computed(() => authStore.hasPermission('attendance.view'))
const canUpdate = computed(() => authStore.hasPermission('attendance.update'))

// Status options
const STATUS_OPTIONS = [
  { value: 'HADIR', label: 'Hadir' },
  { value: 'TERLAMBAT', label: 'Terlambat' },
  { value: 'IZIN', label: 'Izin' },
  { value: 'SAKIT', label: 'Sakit' },
  { value: 'ALPA', label: 'Alpa' }
]

const INPUT_METHOD_OPTIONS = [
  { value: 'rfid', label: 'RFID' },
  { value: 'manual', label: 'Manual' },
  { value: 'import', label: 'Import' }
]

// Get today's date in YYYY-MM-DD format
const getToday = () => {
  return new Date().toISOString().split('T')[0]
}

// Reactive state
const filters = reactive({
  date: getToday(),
  class_id: '',
  attendance_status: '',
  input_method: '',
  keyword: ''
})

const summary = ref({
  total: 0,
  hadir: 0,
  terlambat: 0,
  izin: 0,
  sakit: 0,
  alpa: 0
})

const attendances = ref([])
const classes = ref([])
const loading = ref(false)
const summaryLoading = ref(false)

// Detail modal
const showDetailModal = ref(false)
const detailItem = ref(null)
const detailLoading = ref(false)

// Edit modal
const showEditModal = ref(false)
const editItem = ref(null)
const editForm = reactive({
  attendance_status: '',
  clock_in_at: '',
  notes: ''
})
const saving = ref(false)
const editFormError = ref('')

// Pagination
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)

// Table columns
const columns = [
  { key: 'student', label: 'Siswa', sortable: false },
  { key: 'class_info', label: 'Kelas', sortable: false },
  { key: 'attendance_date', label: 'Tanggal', sortable: false },
  { key: 'clock_in_at', label: 'Jam Masuk', sortable: false },
  { key: 'attendance_status', label: 'Status', sortable: false },
  { key: 'input_method', label: 'Metode', sortable: false },
  { key: 'notes', label: 'Keterangan', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-16 text-right' }
]

// Computed
const hasActiveFilters = computed(() =>
  filters.class_id || filters.attendance_status || filters.input_method || filters.keyword
)

// Methods
const getStatusBadge = (status) => {
  const badges = {
    HADIR: 'bg-emerald-100 text-emerald-700',
    TERLAMBAT: 'bg-amber-100 text-amber-700',
    IZIN: 'bg-blue-100 text-blue-700',
    SAKIT: 'bg-purple-100 text-purple-700',
    ALPA: 'bg-rose-100 text-rose-700'
  }
  return badges[status] || 'bg-gray-100 text-gray-600'
}

const getStatusLabel = (status) => {
  const option = STATUS_OPTIONS.find(s => s.value === status)
  return option?.label || status || '-'
}

const getMethodBadge = (method) => {
  const badges = {
    rfid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    manual: 'bg-blue-50 text-blue-700 border border-blue-200',
    import: 'bg-purple-50 text-purple-700 border border-purple-200'
  }
  return badges[method] || 'bg-gray-50 text-gray-700 border border-gray-200'
}

const getMethodLabel = (method) => {
  const option = INPUT_METHOD_OPTIONS.find(m => m.value === method)
  return option?.label || method || '-'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchData = async () => {
  if (!canView.value) return

  loading.value = true
  try {
    const params = {
      date: filters.date,
      class_id: filters.class_id,
      attendance_status: filters.attendance_status,
      input_method: filters.input_method,
      keyword: filters.keyword,
      page: currentPage.value,
      limit: limit.value
    }

    const response = await studentAttendanceService.getList(params)
    if (response.success) {
      attendances.value = response.data.attendances
      total.value = response.data.totalItems
    }
  } catch (err) {
    error('Gagal memuat data absensi')
  } finally {
    loading.value = false
  }
}

const fetchSummary = async () => {
  if (!canView.value) return

  summaryLoading.value = true
  try {
    const params = {
      date: filters.date,
      class_id: filters.class_id
    }

    const response = await studentAttendanceService.getSummary(params)
    if (response.success) {
      summary.value = response.data
    }
  } catch (err) {
    // Silently fail for summary
  } finally {
    summaryLoading.value = false
  }
}

const loadClasses = async () => {
  try {
    const response = await classService.getAll({ limit: 300 })
    if (response.success) {
      classes.value = response.data?.classes || []
    }
  } catch (err) {
    // Silently fail
  }
}

const openDetail = async (item) => {
  detailItem.value = null
  showDetailModal.value = true
  detailLoading.value = true

  try {
    const response = await studentAttendanceService.getById(item.id)
    if (response.success) {
      detailItem.value = response.data
    }
  } catch (err) {
    error('Gagal memuat detail absensi')
    showDetailModal.value = false
  } finally {
    detailLoading.value = false
  }
}

const openEdit = (item) => {
  editItem.value = item
  editForm.attendance_status = item.attendance_status
  editForm.clock_in_at = item.clock_in_at ? item.clock_in_at.slice(11, 16) : ''
  editForm.notes = item.notes || ''
  editFormError.value = ''
  showEditModal.value = true
}

const closeDetailAndEdit = () => {
  showDetailModal.value = false
  if (detailItem.value) {
    openEdit(detailItem.value)
  }
}

const saveEdit = async () => {
  editFormError.value = ''

  if (!editForm.attendance_status) {
    editFormError.value = 'Status wajib diisi'
    return
  }

  saving.value = true
  try {
    const payload = {
      attendance_status: editForm.attendance_status,
      clock_in_at: editForm.clock_in_at ? `${filters.date}T${editForm.clock_in_at}:00Z` : null,
      notes: editForm.notes,
      input_method: editItem.value.input_method
    }

    await studentAttendanceService.update(editItem.value.id, payload)
    success('Absensi berhasil diperbarui')
    showEditModal.value = false
    fetchData()
    fetchSummary()
  } catch (err) {
    error('Gagal memperbarui absensi')
  } finally {
    saving.value = false
  }
}

const applyFilters = () => {
  currentPage.value = 1
  fetchData()
  fetchSummary()
}

const clearFilters = () => {
  filters.class_id = ''
  filters.attendance_status = ''
  filters.input_method = ''
  filters.keyword = ''
  applyFilters()
}

let searchTimeout = null
const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchData()
  }, 500)
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

// Lifecycle
onMounted(() => {
  loadClasses()
  fetchData()
  fetchSummary()
})
</script>
