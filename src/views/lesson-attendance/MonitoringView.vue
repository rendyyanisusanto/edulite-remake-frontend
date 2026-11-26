<template>
  <div class="space-y-4">
    <!-- Breadcrumb & Header -->
    <div>
      <nav class="text-xs text-gray-500 mb-1">
        <router-link to="/dashboard" class="hover:text-primary">Beranda</router-link>
        <span class="mx-1.5">/</span>
        <span>Presensi Jam Pelajaran</span>
        <span class="mx-1.5">/</span>
        <span class="text-gray-800 font-medium">Monitoring</span>
      </nav>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Monitoring Presensi Jam Pelajaran</h1>
          <p class="text-sm text-gray-600">Pantau status pengisian presensi per kelas dan jam pelajaran secara operasional.</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="handleExportPdf"
            :disabled="loading || exportingPdf || !monitoring"
            class="px-3 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {{ exportingPdf ? 'Menyiapkan PDF...' : 'Cetak PDF' }}
          </button>
          <button
            type="button"
            @click="refreshSilent"
            :disabled="loading || refreshing"
            class="px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 disabled:opacity-50"
          >
            <svg class="w-4 h-4" :class="{ 'animate-spin': refreshing }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Filter Toolbar -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Tanggal</label>
          <input v-model="filters.attendance_date" type="date" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Tahun Ajaran</label>
          <select v-model="filters.academic_year_id" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option v-for="y in lookups.academic_years" :key="y.id" :value="y.id">
              {{ y.name }} {{ y.is_active ? '(Aktif)' : '' }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Tingkat</label>
          <select v-model="filters.grade_id" @change="filters.class_id = ''" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua Tingkat</option>
            <option v-for="g in lookups.grades" :key="g.id" :value="g.id">{{ g.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Jurusan</label>
          <select v-model="filters.department_id" @change="filters.class_id = ''" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua Jurusan</option>
            <option v-for="d in lookups.departments" :key="d.id" :value="d.id">{{ d.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Kelas</label>
          <select v-model="filters.class_id" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua Kelas</option>
            <option v-for="c in filteredClassOptions" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Status Presensi</label>
          <select v-model="filters.status" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua Status</option>
            <option value="SUBMITTED">Sudah Diabsen</option>
            <option value="NOT_RECORDED">Belum Diabsen</option>
            <option value="UPCOMING">Belum Dimulai</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Cari Kelas</label>
          <input v-model="filters.search" type="text" placeholder="Nama kelas..." @keyup.enter="applyFilters" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md" />
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div class="flex items-center gap-2">
          <button type="button" @click="applyFilters" class="px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90">
            Terapkan Filter
          </button>
          <button type="button" @click="resetFilters" class="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
            Reset Filter
          </button>
        </div>
        <div v-if="monitoring?.is_today" class="text-xs text-gray-500">
          Auto-refresh setiap 60 detik aktif
        </div>
      </div>
    </div>

    <!-- Compact Summary -->
    <div v-if="monitoring" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <span class="text-xs text-gray-500 block">Kelas Dipantau</span>
        <span class="text-xl font-bold text-gray-900">{{ monitoring.summary.total_classes }}</span>
      </div>
      <div class="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
        <span class="text-xs text-emerald-700 block">Jam Sudah Diabsen</span>
        <span class="text-xl font-bold text-emerald-700">{{ monitoring.summary.submitted_count }}</span>
      </div>
      <div class="bg-white p-3 rounded-xl border border-red-200 shadow-sm">
        <span class="text-xs text-red-700 block">Jam Belum Diabsen</span>
        <span class="text-xl font-bold text-red-700">{{ monitoring.summary.not_recorded_count }}</span>
      </div>
      <div class="bg-white p-3 rounded-xl border border-amber-200 shadow-sm">
        <span class="text-xs text-amber-700 block">Jam Dibatalkan</span>
        <span class="text-xl font-bold text-amber-700">{{ monitoring.summary.cancelled_count }}</span>
      </div>
    </div>

    <!-- Operational Note & Legend -->
    <div v-if="monitoring" class="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600 bg-blue-50/60 border border-blue-100 rounded-lg px-3 py-2">
      <span>{{ monitoring.note }}</span>
      <div class="flex flex-wrap items-center gap-3 font-medium">
        <span class="inline-flex items-center gap-1"><span class="w-4 h-4 rounded bg-emerald-100 text-emerald-800 inline-flex items-center justify-center">✓</span> Sudah</span>
        <span class="inline-flex items-center gap-1"><span class="w-4 h-4 rounded bg-red-100 text-red-800 inline-flex items-center justify-center">–</span> Belum</span>
        <span class="inline-flex items-center gap-1"><span class="w-4 h-4 rounded bg-gray-100 text-gray-500 inline-flex items-center justify-center">◷</span> Belum Mulai</span>
        <span class="inline-flex items-center gap-1"><span class="w-4 h-4 rounded bg-amber-100 text-amber-800 inline-flex items-center justify-center">✕</span> Dibatalkan</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="errorMsg" class="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
      {{ errorMsg }}
    </div>

    <!-- Matrix Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="loading" class="p-8 space-y-3 animate-pulse">
        <div v-for="i in 5" :key="i" class="h-8 bg-gray-100 rounded"></div>
      </div>

      <div v-else-if="!monitoring || monitoring.rows.length === 0" class="p-10 text-center text-gray-500 text-sm">
        Tidak ada kelas atau transaksi presensi yang sesuai dengan filter pada tanggal ini.
      </div>

      <div v-else class="overflow-x-auto max-h-[65vh]">
        <table class="min-w-full border-collapse text-xs">
          <thead class="bg-gray-50 sticky top-0 z-20 shadow-sm">
            <tr>
              <th class="sticky left-0 z-30 bg-gray-50 px-4 py-2.5 text-left font-semibold text-gray-700 border-b border-r border-gray-200 min-w-[160px]">
                Kelas
              </th>
              <th
                v-for="p in monitoring.periods"
                :key="p.period_number"
                class="px-2.5 py-2 text-center font-semibold text-gray-700 border-b border-r border-gray-200 min-w-[78px]"
                :title="`${p.name} (${sliceTime(p.start_time)} - ${sliceTime(p.end_time)})`"
              >
                <div>J{{ p.period_number }}</div>
                <div class="text-[10px] font-normal text-gray-500">{{ sliceTime(p.start_time) }}</div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="row in monitoring.rows" :key="row.class_id" class="hover:bg-blue-50/30">
              <td class="sticky left-0 z-10 bg-white px-4 py-2 font-medium text-gray-900 border-r border-gray-200 whitespace-nowrap">
                <div>{{ row.class_name }}</div>
                <div class="text-[10px] text-gray-500" v-if="row.active_student_count > 0">
                  {{ row.active_student_count }} siswa aktif
                </div>
              </td>
              <td
                v-for="p in monitoring.periods"
                :key="p.period_number"
                class="p-1.5 text-center border-r border-gray-200"
              >
                <button
                  type="button"
                  @click="handleCellClick(row, p, row.cells[p.period_number])"
                  :title="cellTooltip(row.cells[p.period_number])"
                  class="w-full h-9 rounded-md font-semibold flex items-center justify-center transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  :class="cellClass(row.cells[p.period_number]?.status)"
                >
                  <span v-if="row.cells[p.period_number]?.status === 'SUBMITTED'">✓</span>
                  <span v-else-if="row.cells[p.period_number]?.status === 'NOT_RECORDED'">–</span>
                  <span v-else-if="row.cells[p.period_number]?.status === 'UPCOMING'">◷</span>
                  <span v-else-if="row.cells[p.period_number]?.status === 'CANCELLED'">✕</span>
                  <span v-else>?</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Cell Info Modal (for NOT_RECORDED / UPCOMING / CANCELLED / SUBMITTED quick drawer) -->
    <BaseModal v-model="cellModalOpen" maxWidth="md" :title="cellModalTitle">
      <div v-if="selectedCell" class="space-y-3 text-sm">
        <div class="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs space-y-1">
          <div><span class="text-gray-500">Kelas:</span> <strong>{{ selectedCell.row.class_name }}</strong></div>
          <div><span class="text-gray-500">Tanggal:</span> <strong>{{ monitoring?.attendance_date }}</strong></div>
          <div><span class="text-gray-500">Jam Pelajaran:</span> <strong>Jam ke-{{ selectedCell.period.period_number }} ({{ sliceTime(selectedCell.period.start_time) }} - {{ sliceTime(selectedCell.period.end_time) }})</strong></div>
        </div>

        <template v-if="selectedCell.cell.status === 'SUBMITTED'">
          <div class="text-xs space-y-1">
            <div><span class="text-gray-500">Guru:</span> <strong>{{ selectedCell.cell.teacher_name }}</strong></div>
            <div><span class="text-gray-500">Mata Pelajaran:</span> <strong>{{ selectedCell.cell.subject_name }}</strong></div>
            <div><span class="text-gray-500">Metode:</span> <strong>{{ selectedCell.cell.input_method }}</strong></div>
            <div class="flex flex-wrap gap-1.5 pt-2">
              <span class="px-2 py-0.5 rounded bg-gray-100 text-gray-800">Total: {{ selectedCell.cell.total_students }}</span>
              <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">H: {{ selectedCell.cell.hadir }}</span>
              <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800">T: {{ selectedCell.cell.terlambat }}</span>
              <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-800">I: {{ selectedCell.cell.izin }}</span>
              <span class="px-2 py-0.5 rounded bg-orange-100 text-orange-800">S: {{ selectedCell.cell.sakit }}</span>
              <span class="px-2 py-0.5 rounded bg-red-100 text-red-800">A: {{ selectedCell.cell.alpa }}</span>
            </div>
          </div>
        </template>

        <template v-else-if="selectedCell.cell.status === 'NOT_RECORDED'">
          <p class="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            Presensi jam pelajaran ini belum tercatat.
          </p>
        </template>

        <template v-else-if="selectedCell.cell.status === 'UPCOMING'">
          <p class="text-xs text-gray-700 bg-gray-100 border border-gray-200 rounded-lg p-3">
            Jam pelajaran ini belum dimulai sehingga belum dapat dicatat sebagai presensi final.
          </p>
        </template>

        <template v-else-if="selectedCell.cell.status === 'CANCELLED'">
          <div class="text-xs bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1 text-amber-900">
            <div><strong>Transaksi Dibatalkan</strong></div>
            <div>Alasan: {{ selectedCell.cell.cancellation_reason || '-' }}</div>
            <div v-if="selectedCell.cell.cancelled_by_name">Oleh: {{ selectedCell.cell.cancelled_by_name }}</div>
          </div>
        </template>

        <template v-else>
          <p class="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
            Informasi jadwal historis untuk jam ini tidak tersedia.
          </p>
        </template>
      </div>

      <template #footer>
        <div class="flex flex-wrap justify-end gap-2 w-full">
          <button
            v-if="selectedCell?.cell?.session_id && canViewData"
            type="button"
            @click="openDetailFromCell"
            class="px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Lihat Detail
          </button>
          <button
            v-if="selectedCell?.cell?.status === 'SUBMITTED' && canCorrect"
            type="button"
            @click="openCorrectFromCell"
            class="px-3 py-1.5 text-sm font-medium bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Koreksi Presensi
          </button>
          <button
            v-if="selectedCell?.cell?.status === 'NOT_RECORDED' && canCreate && monitoring?.is_today"
            type="button"
            @click="openManualFromCell"
            class="px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Input Presensi Manual
          </button>
          <button
            v-if="selectedCell?.cell?.status === 'CANCELLED' && canRestore"
            type="button"
            @click="openRestoreFromCell"
            class="px-3 py-1.5 text-sm font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Pulihkan Presensi
          </button>
          <button type="button" @click="cellModalOpen = false" class="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-md">
            Tutup
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- Modals -->
    <SessionDetailModal
      v-model="detailModalOpen"
      :sessionId="activeSessionId"
      @request-correct="onRequestCorrect"
      @request-cancel="onRequestCancel"
      @request-restore="onRequestRestore"
    />
    <ManualAttendanceModal
      v-model="manualModalOpen"
      :lookups="lookups"
      :prefill="manualPrefill"
      @saved="refreshSilent"
    />
    <CorrectionModal
      v-model="correctModalOpen"
      :sessionId="activeSessionId"
      :lookups="lookups"
      @saved="refreshSilent"
    />
    <CancelRestoreModal
      v-model="cancelRestoreOpen"
      :mode="cancelRestoreMode"
      :session="cancelRestoreSession"
      @saved="refreshSilent"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import lessonAttendanceService from '@/services/api/lessonAttendance.service'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BaseModal from '@/components/modals/BaseModal.vue'
import SessionDetailModal from '@/components/lesson-attendance/SessionDetailModal.vue'
import ManualAttendanceModal from '@/components/lesson-attendance/ManualAttendanceModal.vue'
import CorrectionModal from '@/components/lesson-attendance/CorrectionModal.vue'
import CancelRestoreModal from '@/components/lesson-attendance/CancelRestoreModal.vue'

const authStore = useAuthStore()
const toast = useToast()

const canViewData = computed(() => authStore.hasPermission('lesson_attendance.data.view'))
const canCreate = computed(() => authStore.hasPermission('lesson_attendance.data.create'))
const canCorrect = computed(() => authStore.hasPermission('lesson_attendance.data.correct'))
const canRestore = computed(() => authStore.hasPermission('lesson_attendance.data.restore'))

const lookups = ref({ academic_years: [], grades: [], departments: [], classes: [], teachers: [], subjects: [], server_date: '' })
const filters = reactive({
  attendance_date: '',
  academic_year_id: '',
  grade_id: '',
  department_id: '',
  class_id: '',
  status: '',
  search: ''
})

const loading = ref(true)
const refreshing = ref(false)
const exportingPdf = ref(false)
const errorMsg = ref('')
const monitoring = ref(null)

const cellModalOpen = ref(false)
const selectedCell = ref(null)

const detailModalOpen = ref(false)
const activeSessionId = ref(null)
const manualModalOpen = ref(false)
const manualPrefill = ref({})
const correctModalOpen = ref(false)
const cancelRestoreOpen = ref(false)
const cancelRestoreMode = ref('cancel')
const cancelRestoreSession = ref(null)

let timerId = null

const filteredClassOptions = computed(() => {
  return (lookups.value.classes || []).filter((c) => {
    if (filters.grade_id && Number(c.grade_id) !== Number(filters.grade_id)) return false
    if (filters.department_id && Number(c.department_id) !== Number(filters.department_id)) return false
    return true
  })
})

const cellModalTitle = computed(() => {
  if (!selectedCell.value) return 'Informasi Jam Pelajaran'
  return `${selectedCell.value.row.class_name} — Jam ke-${selectedCell.value.period.period_number}`
})

const fetchLookups = async () => {
  const res = await lessonAttendanceService.getLookups()
  lookups.value = res.data?.data || res.data
  if (!filters.attendance_date) filters.attendance_date = lookups.value.server_date
  if (!filters.academic_year_id && lookups.value.active_academic_year) {
    filters.academic_year_id = lookups.value.active_academic_year.id
  }
}

const fetchMonitoring = async (silent = false) => {
  if (silent && (loading.value || refreshing.value)) return
  if (silent) refreshing.value = true
  else loading.value = true
  errorMsg.value = ''

  try {
    const params = {}
    if (filters.attendance_date) params.attendance_date = filters.attendance_date
    if (filters.academic_year_id) params.academic_year_id = filters.academic_year_id
    if (filters.grade_id) params.grade_id = filters.grade_id
    if (filters.department_id) params.department_id = filters.department_id
    if (filters.class_id) params.class_id = filters.class_id
    if (filters.status) params.status = filters.status
    if (filters.search.trim()) params.search = filters.search.trim()

    const res = await lessonAttendanceService.getMonitoring(params)
    monitoring.value = res.data?.data || res.data
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal memuat data monitoring presensi.'
    if (!silent) toast.error(errorMsg.value)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const applyFilters = () => fetchMonitoring(false)
const refreshSilent = () => fetchMonitoring(true)

const handleExportPdf = async () => {
  if (!monitoring.value || exportingPdf.value) return
  exportingPdf.value = true
  try {
    const params = {}
    if (filters.attendance_date) params.attendance_date = filters.attendance_date
    if (filters.academic_year_id) params.academic_year_id = filters.academic_year_id
    if (filters.grade_id) params.grade_id = filters.grade_id
    if (filters.department_id) params.department_id = filters.department_id
    if (filters.class_id) params.class_id = filters.class_id
    if (filters.status) params.status = filters.status
    if (filters.search.trim()) params.search = filters.search.trim()

    const res = await lessonAttendanceService.exportMonitoringPdf(params)
    const fallbackName = `Monitoring-Presensi-Jam-Pelajaran-${monitoring.value.attendance_date || 'hari-ini'}.pdf`
    let blob
    let filename = fallbackName
    if (res instanceof Blob) {
      blob = res
    } else {
      const m = (res?.headers?.['content-disposition'] || '').match(/filename="?([^"]+)"?/i)
      if (m?.[1]) filename = m[1]
      blob = res?.data instanceof Blob ? res.data : new Blob([res?.data ?? res], { type: 'application/pdf' })
    }
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
    toast.success('Export PDF monitoring berhasil diunduh.')
  } catch (err) {
    let msg = 'Gagal mencetak PDF monitoring.'
    const errBlob = err instanceof Blob ? err : (err?.response?.data instanceof Blob ? err.response.data : null)
    if (errBlob) {
      try { msg = JSON.parse(await errBlob.text()).message || msg } catch { /* keep default */ }
    } else if (err?.response?.data?.message) {
      msg = err.response.data.message
    } else if (err?.message) {
      msg = err.message
    }
    toast.error(msg)
  } finally {
    exportingPdf.value = false
  }
}

const resetFilters = () => {
  filters.attendance_date = lookups.value.server_date
  filters.academic_year_id = lookups.value.active_academic_year?.id || ''
  filters.grade_id = ''
  filters.department_id = ''
  filters.class_id = ''
  filters.status = ''
  filters.search = ''
  fetchMonitoring(false)
}

const handleCellClick = (row, period, cell) => {
  selectedCell.value = { row, period, cell: cell || { status: 'UNKNOWN' } }
  cellModalOpen.value = true
}

const openDetailFromCell = () => {
  activeSessionId.value = selectedCell.value.cell.session_id
  cellModalOpen.value = false
  detailModalOpen.value = true
}

const openCorrectFromCell = () => {
  activeSessionId.value = selectedCell.value.cell.session_id
  cellModalOpen.value = false
  correctModalOpen.value = true
}

const openManualFromCell = () => {
  manualPrefill.value = {
    academic_year_id: filters.academic_year_id,
    attendance_date: monitoring.value?.attendance_date,
    class_id: selectedCell.value.row.class_id,
    lesson_period_id: selectedCell.value.period.lesson_period_id
  }
  cellModalOpen.value = false
  manualModalOpen.value = true
}

const openRestoreFromCell = () => {
  const c = selectedCell.value.cell
  cancelRestoreMode.value = 'restore'
  cancelRestoreSession.value = {
    id: c.session_id,
    class_name: selectedCell.value.row.class_name,
    attendance_date: monitoring.value?.attendance_date,
    period_number: c.period_number,
    teacher_name: c.teacher_name,
    subject_name: c.subject_name
  }
  cellModalOpen.value = false
  cancelRestoreOpen.value = true
}

const onRequestCorrect = (detail) => {
  activeSessionId.value = detail.session.id
  detailModalOpen.value = false
  correctModalOpen.value = true
}

const onRequestCancel = (session) => {
  cancelRestoreMode.value = 'cancel'
  cancelRestoreSession.value = session
  detailModalOpen.value = false
  cancelRestoreOpen.value = true
}

const onRequestRestore = (session) => {
  cancelRestoreMode.value = 'restore'
  cancelRestoreSession.value = session
  detailModalOpen.value = false
  cancelRestoreOpen.value = true
}

const sliceTime = (t) => (t ? String(t).slice(0, 5) : '--:--')

const cellClass = (st) => ({
  SUBMITTED: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
  NOT_RECORDED: 'bg-red-100 text-red-800 hover:bg-red-200',
  UPCOMING: 'bg-gray-100 text-gray-500 hover:bg-gray-200',
  CANCELLED: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  UNKNOWN: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
}[st] || 'bg-gray-100 text-gray-500')

const cellTooltip = (cell) => {
  if (!cell) return ''
  if (cell.status === 'SUBMITTED') {
    return `${cell.teacher_name} | ${cell.subject_name} | Total: ${cell.total_students} (H:${cell.hadir} T:${cell.terlambat} I:${cell.izin} S:${cell.sakit} A:${cell.alpa})`
  }
  if (cell.status === 'NOT_RECORDED') return 'Belum diabsen'
  if (cell.status === 'UPCOMING') return 'Jam pelajaran belum dimulai'
  if (cell.status === 'CANCELLED') return `Dibatalkan: ${cell.cancellation_reason || '-'}`
  return 'Tidak diketahui'
}

const startAutoRefresh = () => {
  timerId = setInterval(() => {
    if (document.visibilityState === 'visible' && monitoring.value?.is_today) {
      refreshSilent()
    }
  }, 60000)
}

onMounted(async () => {
  try {
    await fetchLookups()
    await fetchMonitoring(false)
    startAutoRefresh()
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal memuat inisialisasi halaman.'
    loading.value = false
  }
})

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})
</script>
