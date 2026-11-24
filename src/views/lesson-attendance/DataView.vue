<template>
  <div class="space-y-4">
    <!-- Breadcrumb & Header -->
    <div>
      <nav class="text-xs text-gray-500 mb-1">
        <router-link to="/dashboard" class="hover:text-primary">Beranda</router-link>
        <span class="mx-1.5">/</span>
        <span>Presensi Jam Pelajaran</span>
        <span class="mx-1.5">/</span>
        <span class="text-gray-800 font-medium">Data Presensi</span>
      </nav>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Data Presensi Jam Pelajaran</h1>
          <p class="text-sm text-gray-600">Kelola transaksi presensi per jam pelajaran, input manual, koreksi, dan pembatalan.</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="canCreate"
            type="button"
            @click="openManualModal"
            class="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 shadow-sm"
          >
            + Input Presensi
          </button>
          <button
            type="button"
            @click="fetchSessions"
            :disabled="loading"
            class="px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Tahun Ajaran</label>
          <select v-model="filters.academic_year_id" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua Tahun Ajaran</option>
            <option v-for="y in lookups.academic_years" :key="y.id" :value="y.id">{{ y.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Tanggal Mulai</label>
          <input v-model="filters.date_from" type="date" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Tanggal Selesai</label>
          <input v-model="filters.date_to" type="date" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Kelas</label>
          <select v-model="filters.class_id" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua Kelas</option>
            <option v-for="c in lookups.classes" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Guru</label>
          <select v-model="filters.teacher_id" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua Guru</option>
            <option v-for="t in lookups.teachers" :key="t.id" :value="t.id">{{ t.full_name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Mata Pelajaran</label>
          <select v-model="filters.subject_id" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua Mapel</option>
            <option v-for="s in lookups.subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Jam ke-</label>
          <select v-model="filters.period_number" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua Jam</option>
            <option v-for="p in lookups.lesson_periods" :key="p.id" :value="p.period_number">Jam ke-{{ p.period_number }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Metode Input</label>
          <select v-model="filters.input_method" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua</option>
            <option value="QR">QR Code</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Status Transaksi</label>
          <select v-model="filters.status" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="active">Aktif</option>
            <option value="cancelled">Dibatalkan</option>
            <option value="all">Semua</option>
          </select>
        </div>
        <div class="sm:col-span-2 lg:col-span-2">
          <label class="block text-xs font-medium text-gray-600 mb-1">Pencarian</label>
          <input v-model="filters.search" type="text" placeholder="Cari kelas, guru, mapel, catatan..." @keyup.enter="applyFilters" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md" />
        </div>
        <div class="flex items-end gap-2">
          <button type="button" @click="applyFilters" class="px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90">
            Terapkan
          </button>
          <button type="button" @click="resetFilters" class="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
            Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
      {{ errorMsg }}
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-xs">
          <thead class="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th class="px-3 py-2.5 text-center font-semibold text-gray-600 w-10">No</th>
              <th @click="toggleSort('attendance_date')" class="px-3 py-2.5 text-left font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 whitespace-nowrap">
                Tanggal {{ sortIcon('attendance_date') }}
              </th>
              <th @click="toggleSort('class_name')" class="px-3 py-2.5 text-left font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 whitespace-nowrap">
                Kelas {{ sortIcon('class_name') }}
              </th>
              <th @click="toggleSort('period_number')" class="px-3 py-2.5 text-center font-semibold text-gray-600 cursor-pointer hover:bg-gray-100">
                Jam {{ sortIcon('period_number') }}
              </th>
              <th @click="toggleSort('subject_name')" class="px-3 py-2.5 text-left font-semibold text-gray-600 cursor-pointer hover:bg-gray-100">
                Mata Pelajaran {{ sortIcon('subject_name') }}
              </th>
              <th @click="toggleSort('teacher_name')" class="px-3 py-2.5 text-left font-semibold text-gray-600 cursor-pointer hover:bg-gray-100">
                Guru {{ sortIcon('teacher_name') }}
              </th>
              <th class="px-2 py-2.5 text-right font-semibold text-gray-600">Siswa</th>
              <th class="px-2 py-2.5 text-right font-semibold text-emerald-700">H</th>
              <th class="px-2 py-2.5 text-right font-semibold text-amber-700">T</th>
              <th class="px-2 py-2.5 text-right font-semibold text-blue-700">I</th>
              <th class="px-2 py-2.5 text-right font-semibold text-orange-700">S</th>
              <th class="px-2 py-2.5 text-right font-semibold text-red-700">A</th>
              <th class="px-3 py-2.5 text-center font-semibold text-gray-600">Metode</th>
              <th class="px-3 py-2.5 text-center font-semibold text-gray-600">Status</th>
              <th class="px-3 py-2.5 text-center font-semibold text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <template v-if="loading">
              <tr v-for="i in 5" :key="i" class="animate-pulse">
                <td colspan="15" class="px-4 py-3"><div class="h-4 bg-gray-100 rounded"></div></td>
              </tr>
            </template>
            <tr v-else-if="sessions.length === 0">
              <td colspan="15" class="px-4 py-10 text-center text-gray-500">Tidak ada data transaksi presensi yang sesuai.</td>
            </tr>
            <tr v-else v-for="(row, idx) in sessions" :key="row.id" class="hover:bg-blue-50/40" :class="{ 'bg-amber-50/40': row.is_cancelled }">
              <td class="px-3 py-2 text-center text-gray-500">{{ (pagination.page - 1) * pagination.limit + idx + 1 }}</td>
              <td class="px-3 py-2 whitespace-nowrap font-medium text-gray-900">{{ formatDate(row.attendance_date) }}</td>
              <td class="px-3 py-2 whitespace-nowrap font-semibold text-gray-900">{{ row.class_name }}</td>
              <td class="px-3 py-2 text-center font-medium">J{{ row.period_number }}</td>
              <td class="px-3 py-2 text-gray-800">{{ row.subject_name }}</td>
              <td class="px-3 py-2 text-gray-800">{{ row.teacher_name }}</td>
              <td class="px-2 py-2 text-right font-medium">{{ row.total_students }}</td>
              <td class="px-2 py-2 text-right text-emerald-700 font-medium">{{ row.hadir }}</td>
              <td class="px-2 py-2 text-right text-amber-700 font-medium">{{ row.terlambat }}</td>
              <td class="px-2 py-2 text-right text-blue-700 font-medium">{{ row.izin }}</td>
              <td class="px-2 py-2 text-right text-orange-700 font-medium">{{ row.sakit }}</td>
              <td class="px-2 py-2 text-right text-red-700 font-medium">{{ row.alpa }}</td>
              <td class="px-3 py-2 text-center">
                <span class="px-2 py-0.5 rounded text-[11px] font-medium" :class="row.input_method === 'QR' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'">
                  {{ row.input_method }}
                </span>
              </td>
              <td class="px-3 py-2 text-center">
                <span class="px-2 py-0.5 rounded-full text-[11px] font-medium" :class="row.is_cancelled ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'">
                  {{ row.is_cancelled ? 'Dibatalkan' : 'Aktif' }}
                </span>
              </td>
              <td class="px-3 py-2 text-center whitespace-nowrap">
                <div class="inline-flex items-center gap-1">
                  <button type="button" @click="openDetail(row.id, 'students')" class="px-2 py-1 text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-800 rounded" title="Lihat Detail">
                    Detail
                  </button>
                  <button v-if="canAudit" type="button" @click="openDetail(row.id, 'audit')" class="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded" title="Riwayat Perubahan">
                    Log
                  </button>
                  <button v-if="!row.is_cancelled && canCorrect" type="button" @click="openCorrect(row.id)" class="px-2 py-1 text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-800 rounded" title="Koreksi">
                    Koreksi
                  </button>
                  <button v-if="!row.is_cancelled && canCancel" type="button" @click="openCancel(row)" class="px-2 py-1 text-[11px] bg-red-100 hover:bg-red-200 text-red-800 rounded" title="Batalkan">
                    Batal
                  </button>
                  <button v-if="row.is_cancelled && canRestore" type="button" @click="openRestore(row)" class="px-2 py-1 text-[11px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded" title="Pulihkan">
                    Pulihkan
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
        <div>
          Menampilkan halaman <strong>{{ pagination.page }}</strong> dari <strong>{{ pagination.total_pages }}</strong> (Total {{ pagination.total }} transaksi)
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Sebelumnya
          </button>
          <button
            type="button"
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.total_pages"
            class="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <SessionDetailModal
      v-model="detailModalOpen"
      :sessionId="activeSessionId"
      :initialTab="detailInitialTab"
      @request-correct="onRequestCorrect"
      @request-cancel="openCancel"
      @request-restore="openRestore"
    />
    <ManualAttendanceModal
      v-model="manualModalOpen"
      :lookups="lookups"
      @saved="fetchSessions"
    />
    <CorrectionModal
      v-model="correctModalOpen"
      :sessionId="activeSessionId"
      :lookups="lookups"
      @saved="fetchSessions"
    />
    <CancelRestoreModal
      v-model="cancelRestoreOpen"
      :mode="cancelRestoreMode"
      :session="cancelRestoreSession"
      @saved="fetchSessions"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import lessonAttendanceService from '@/services/api/lessonAttendance.service'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import SessionDetailModal from '@/components/lesson-attendance/SessionDetailModal.vue'
import ManualAttendanceModal from '@/components/lesson-attendance/ManualAttendanceModal.vue'
import CorrectionModal from '@/components/lesson-attendance/CorrectionModal.vue'
import CancelRestoreModal from '@/components/lesson-attendance/CancelRestoreModal.vue'

const authStore = useAuthStore()
const toast = useToast()

const canCreate = computed(() => authStore.hasPermission('lesson_attendance.data.create'))
const canCorrect = computed(() => authStore.hasPermission('lesson_attendance.data.correct'))
const canCancel = computed(() => authStore.hasPermission('lesson_attendance.data.cancel'))
const canRestore = computed(() => authStore.hasPermission('lesson_attendance.data.restore'))
const canAudit = computed(() => authStore.hasPermission('lesson_attendance.data.audit'))

const lookups = ref({ academic_years: [], classes: [], teachers: [], subjects: [], lesson_periods: [], server_date: '' })
const filters = reactive({
  academic_year_id: '',
  date_from: '',
  date_to: '',
  class_id: '',
  teacher_id: '',
  subject_id: '',
  period_number: '',
  input_method: '',
  status: 'active',
  search: '',
  sort_by: 'attendance_date',
  sort_order: 'DESC',
  page: 1,
  limit: 25
})

const loading = ref(true)
const errorMsg = ref('')
const sessions = ref([])
const pagination = ref({ page: 1, limit: 25, total: 0, total_pages: 1 })

const detailModalOpen = ref(false)
const detailInitialTab = ref('students')
const activeSessionId = ref(null)
const manualModalOpen = ref(false)
const correctModalOpen = ref(false)
const cancelRestoreOpen = ref(false)
const cancelRestoreMode = ref('cancel')
const cancelRestoreSession = ref(null)

const fetchLookups = async () => {
  const res = await lessonAttendanceService.getLookups()
  lookups.value = res.data?.data || res.data
  if (!filters.academic_year_id && lookups.value.active_academic_year) {
    filters.academic_year_id = lookups.value.active_academic_year.id
  }
  if (!filters.date_from) filters.date_from = lookups.value.server_date
  if (!filters.date_to) filters.date_to = lookups.value.server_date
}

const fetchSessions = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const params = {}
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) params[k] = v
    })
    const res = await lessonAttendanceService.listSessions(params)
    sessions.value = res.data?.data || []
    pagination.value = res.data?.pagination || { page: 1, limit: 25, total: 0, total_pages: 1 }
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal memuat data transaksi presensi.'
    toast.error(errorMsg.value)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  filters.page = 1
  fetchSessions()
}

const resetFilters = () => {
  filters.academic_year_id = lookups.value.active_academic_year?.id || ''
  filters.date_from = lookups.value.server_date
  filters.date_to = lookups.value.server_date
  filters.class_id = ''
  filters.teacher_id = ''
  filters.subject_id = ''
  filters.period_number = ''
  filters.input_method = ''
  filters.status = 'active'
  filters.search = ''
  filters.page = 1
  fetchSessions()
}

const toggleSort = (col) => {
  if (filters.sort_by === col) {
    filters.sort_order = filters.sort_order === 'ASC' ? 'DESC' : 'ASC'
  } else {
    filters.sort_by = col
    filters.sort_order = 'DESC'
  }
  fetchSessions()
}

const sortIcon = (col) => {
  if (filters.sort_by !== col) return ''
  return filters.sort_order === 'ASC' ? '↑' : '↓'
}

const changePage = (newPage) => {
  if (newPage < 1 || newPage > pagination.value.total_pages) return
  filters.page = newPage
  fetchSessions()
}

const openManualModal = () => {
  manualModalOpen.value = true
}

const openDetail = (id, tab = 'students') => {
  activeSessionId.value = id
  detailInitialTab.value = tab
  detailModalOpen.value = true
}

const openCorrect = (id) => {
  activeSessionId.value = id
  correctModalOpen.value = true
}

const onRequestCorrect = (detail) => {
  activeSessionId.value = detail.session.id
  detailModalOpen.value = false
  correctModalOpen.value = true
}

const openCancel = (row) => {
  detailModalOpen.value = false
  cancelRestoreMode.value = 'cancel'
  cancelRestoreSession.value = row
  cancelRestoreOpen.value = true
}

const openRestore = (row) => {
  detailModalOpen.value = false
  cancelRestoreMode.value = 'restore'
  cancelRestoreSession.value = row
  cancelRestoreOpen.value = true
}

const formatDate = (val) => {
  if (!val) return '-'
  return new Date(`${String(val).slice(0, 10)}T00:00:00`).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

onMounted(async () => {
  try {
    await fetchLookups()
    await fetchSessions()
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal memuat halaman.'
    loading.value = false
  }
})
</script>
