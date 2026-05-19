<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-bold text-gray-800">Laporan Ekstrakurikuler</h1>
      <p class="text-sm text-gray-500">Rekap anggota, presensi, perkembangan, sesi, ranking, dan dashboard ekskul.</p>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-4">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="rounded-lg px-3 py-2 text-sm font-semibold transition"
          :class="activeTab === tab.key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-4">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-600">Tahun Ajaran</label>
          <select v-model="filters.academic_year_id" class="w-full rounded border px-3 py-2 text-sm">
            <option :value="null">Semua</option>
            <option v-for="item in academicYears" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-600">Ekskul</label>
          <select v-model="filters.extracurricular_id" class="w-full rounded border px-3 py-2 text-sm">
            <option :value="null">Semua</option>
            <option v-for="item in extracurriculars" :key="item.id" :value="item.id">{{ item.code }} - {{ item.name }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-600">Kelas</label>
          <select v-model="filters.class_id" class="w-full rounded border px-3 py-2 text-sm">
            <option :value="null">Semua</option>
            <option v-for="item in classes" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-600">Pelatih</label>
          <select v-model="filters.coach_id" class="w-full rounded border px-3 py-2 text-sm">
            <option :value="null">Semua</option>
            <option v-for="item in coaches" :key="item.id" :value="item.id">{{ item.full_name }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-600">Start Date</label>
          <input v-model="filters.start_date" type="date" class="w-full rounded border px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-600">End Date</label>
          <input v-model="filters.end_date" type="date" class="w-full rounded border px-3 py-2 text-sm" />
        </div>
        <div class="lg:col-span-2">
          <label class="mb-1 block text-xs font-semibold text-gray-600">Search</label>
          <input v-model="filters.search" type="text" class="w-full rounded border px-3 py-2 text-sm" placeholder="Nama siswa/pelatih/ekskul..." />
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <BaseButton @click="applyFilters" :loading="loading">Tampilkan</BaseButton>
        <BaseButton variant="outline" @click="resetFilters">Reset</BaseButton>
        <BaseButton variant="outline" @click="exportExcel" :loading="exportingExcel">Export Excel</BaseButton>
        <BaseButton variant="outline" @click="exportPdf" :loading="exportingPdf">Export PDF</BaseButton>
      </div>
    </div>

    <div v-if="activeTab === 'dashboard'" class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      <div class="rounded-xl border border-gray-200 bg-white p-4" v-for="metric in dashboardMetrics" :key="metric.label">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ metric.label }}</p>
        <p class="mt-1 text-lg font-bold text-gray-800">{{ metric.value }}</p>
      </div>
    </div>

    <div v-else class="rounded-xl border border-gray-200 bg-white">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th v-for="column in activeColumns" :key="column.key" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td :colspan="activeColumns.length" class="px-4 py-8 text-center text-gray-500">Memuat laporan...</td>
            </tr>
            <tr v-else-if="rows.length === 0">
              <td :colspan="activeColumns.length" class="px-4 py-8 text-center text-gray-400">Tidak ada data laporan</td>
            </tr>
            <tr v-for="(row, idx) in rows" :key="idx" class="border-t border-gray-100">
              <td v-for="column in activeColumns" :key="column.key" class="px-4 py-3 text-gray-700">
                {{ formatCell(row[column.key], column.key) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <p class="text-xs text-gray-500">Total {{ pagination.totalItems }} data</p>
        <div class="flex items-center gap-2">
          <BaseButton size="sm" variant="outline" :disabled="pagination.currentPage <= 1 || loading" @click="changePage(pagination.currentPage - 1)">Prev</BaseButton>
          <span class="text-xs text-gray-600">Hal {{ pagination.currentPage }} / {{ pagination.totalPages || 1 }}</span>
          <BaseButton size="sm" variant="outline" :disabled="pagination.currentPage >= pagination.totalPages || loading" @click="changePage(pagination.currentPage + 1)">Next</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import extracurricularReportService from '@/services/api/extracurricularReport.service'
import { extracurricularService } from '@/services/api/extracurricular.service'
import { academicYearService, classService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { success, error } = useToast()

const tabs = [
  { key: 'members', label: 'Laporan Anggota' },
  { key: 'student-attendance', label: 'Presensi Siswa' },
  { key: 'coach-attendance', label: 'Presensi Pelatih' },
  { key: 'student-progress', label: 'Perkembangan' },
  { key: 'sessions', label: 'Laporan Sesi' },
  { key: 'ranking', label: 'Ranking' },
  { key: 'dashboard', label: 'Dashboard' }
]

const columnMap = {
  members: [
    { key: 'extracurricular_name', label: 'Ekskul' },
    { key: 'student_name', label: 'Siswa' },
    { key: 'class_name', label: 'Kelas' },
    { key: 'join_date', label: 'Join Date' },
    { key: 'status', label: 'Status' }
  ],
  'student-attendance': [
    { key: 'student_name', label: 'Siswa' },
    { key: 'extracurricular_name', label: 'Ekskul' },
    { key: 'total_present', label: 'Hadir' },
    { key: 'total_absent', label: 'Alfa' },
    { key: 'total_sick', label: 'Sakit' },
    { key: 'total_permit', label: 'Izin' },
    { key: 'attendance_percentage', label: '%' }
  ],
  'coach-attendance': [
    { key: 'coach_name', label: 'Pelatih' },
    { key: 'extracurricular_name', label: 'Ekskul' },
    { key: 'total_sessions', label: 'Total Sesi' },
    { key: 'total_present', label: 'Hadir' },
    { key: 'total_late', label: 'Terlambat' },
    { key: 'total_absent', label: 'Absen' }
  ],
  'student-progress': [
    { key: 'student_name', label: 'Siswa' },
    { key: 'extracurricular_name', label: 'Ekskul' },
    { key: 'aspect_name', label: 'Aspek' },
    { key: 'score', label: 'Nilai' },
    { key: 'predicate', label: 'Predikat' },
    { key: 'note', label: 'Catatan' }
  ],
  sessions: [
    { key: 'session_date', label: 'Tanggal' },
    { key: 'extracurricular_name', label: 'Ekskul' },
    { key: 'coach_name', label: 'Pelatih' },
    { key: 'total_students', label: 'Total Siswa' },
    { key: 'total_present', label: 'Total Hadir' },
    { key: 'material', label: 'Materi' },
    { key: 'notes', label: 'Catatan' }
  ],
  ranking: [
    { key: 'student_name', label: 'Siswa' },
    { key: 'extracurricular_name', label: 'Ekskul' },
    { key: 'attendance_percentage', label: '%' },
    { key: 'ranking_position', label: 'Ranking' }
  ]
}

const activeTab = ref('members')
const loading = ref(false)
const exportingExcel = ref(false)
const exportingPdf = ref(false)
const rows = ref([])
const dashboard = ref({})
const pagination = reactive({ totalItems: 0, totalPages: 1, currentPage: 1 })

const filters = reactive({
  academic_year_id: null,
  extracurricular_id: null,
  class_id: null,
  coach_id: null,
  start_date: null,
  end_date: null,
  search: '',
  page: 1,
  limit: 20
})

const academicYears = ref([])
const extracurriculars = ref([])
const classes = ref([])
const coaches = ref([])

const activeColumns = computed(() => columnMap[activeTab.value] || [])
const dashboardMetrics = computed(() => ([
  { label: 'Total Ekstrakurikuler', value: dashboard.value.total_extracurricular ?? '-' },
  { label: 'Total Anggota', value: dashboard.value.total_members ?? '-' },
  { label: 'Ekskul Terpopuler', value: dashboard.value.most_popular_extracurricular ?? '-' },
  { label: 'Ekskul Teraktif', value: dashboard.value.most_active_extracurricular ?? '-' },
  { label: 'Total Sesi', value: dashboard.value.total_sessions ?? '-' },
  { label: 'Total Presensi Hari Ini', value: dashboard.value.total_attendance_today ?? '-' }
]))

function sanitizeParams() {
  return {
    academic_year_id: filters.academic_year_id || undefined,
    extracurricular_id: filters.extracurricular_id || undefined,
    class_id: filters.class_id || undefined,
    coach_id: filters.coach_id || undefined,
    start_date: filters.start_date || undefined,
    end_date: filters.end_date || undefined,
    search: filters.search || undefined,
    page: filters.page,
    limit: filters.limit
  }
}

function parseErrorMessage(err, fallback) {
  return err?.message || fallback
}

function formatCell(value, key) {
  if (value === null || value === undefined || value === '') return '-'
  if (key.includes('date')) return String(value).slice(0, 10)
  return value
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.setAttribute('download', filename)
  a.click()
  URL.revokeObjectURL(url)
}

function endpointByTab(tab) {
  return {
    members: extracurricularReportService.getMembers,
    'student-attendance': extracurricularReportService.getStudentAttendance,
    'coach-attendance': extracurricularReportService.getCoachAttendance,
    'student-progress': extracurricularReportService.getStudentProgress,
    sessions: extracurricularReportService.getSessions,
    ranking: extracurricularReportService.getRanking,
    dashboard: extracurricularReportService.getDashboard
  }[tab]
}

function exportExcelByTab(tab) {
  return {
    members: extracurricularReportService.exportMembersExcel,
    'student-attendance': extracurricularReportService.exportStudentAttendanceExcel,
    'coach-attendance': extracurricularReportService.exportCoachAttendanceExcel,
    'student-progress': extracurricularReportService.exportStudentProgressExcel,
    sessions: extracurricularReportService.exportSessionsExcel,
    ranking: extracurricularReportService.exportRankingExcel,
    dashboard: extracurricularReportService.exportDashboardExcel
  }[tab]
}

function exportPdfByTab(tab) {
  return {
    members: extracurricularReportService.exportMembersPdf,
    'student-attendance': extracurricularReportService.exportStudentAttendancePdf,
    'coach-attendance': extracurricularReportService.exportCoachAttendancePdf,
    'student-progress': extracurricularReportService.exportStudentProgressPdf,
    sessions: extracurricularReportService.exportSessionsPdf,
    ranking: extracurricularReportService.exportRankingPdf,
    dashboard: extracurricularReportService.exportDashboardPdf
  }[tab]
}

async function fetchData() {
  loading.value = true
  try {
    const apiFn = endpointByTab(activeTab.value)
    const result = await apiFn(sanitizeParams())
    const data = result?.data || {}

    if (activeTab.value === 'dashboard') {
      dashboard.value = data
      rows.value = []
      pagination.totalItems = 0
      pagination.totalPages = 1
      pagination.currentPage = 1
    } else {
      rows.value = data.items || []
      pagination.totalItems = data.totalItems || 0
      pagination.totalPages = data.totalPages || 1
      pagination.currentPage = data.currentPage || 1
    }
  } catch (err) {
    error(parseErrorMessage(err, 'Gagal memuat data laporan'))
  } finally {
    loading.value = false
  }
}

async function exportExcel() {
  exportingExcel.value = true
  try {
    const exportFn = exportExcelByTab(activeTab.value)
    const blob = await exportFn(sanitizeParams())
    saveBlob(blob, `laporan_ekskul_${activeTab.value}_${Date.now()}.xlsx`)
    success('Export Excel berhasil')
  } catch (err) {
    error(parseErrorMessage(err, 'Gagal export Excel'))
  } finally {
    exportingExcel.value = false
  }
}

async function exportPdf() {
  exportingPdf.value = true
  try {
    const exportFn = exportPdfByTab(activeTab.value)
    const blob = await exportFn(sanitizeParams())
    saveBlob(blob, `laporan_ekskul_${activeTab.value}_${Date.now()}.pdf`)
    success('Export PDF berhasil')
  } catch (err) {
    error(parseErrorMessage(err, 'Gagal export PDF'))
  } finally {
    exportingPdf.value = false
  }
}

async function applyFilters() {
  filters.page = 1
  await fetchData()
}

async function resetFilters() {
  filters.academic_year_id = null
  filters.extracurricular_id = null
  filters.class_id = null
  filters.coach_id = null
  filters.start_date = null
  filters.end_date = null
  filters.search = ''
  filters.page = 1
  await fetchData()
}

async function switchTab(tab) {
  activeTab.value = tab
  filters.page = 1
  await fetchData()
}

async function changePage(page) {
  filters.page = page
  await fetchData()
}

async function loadFilterReferences() {
  try {
    const [yearRes, exRes, classRes, coachRes] = await Promise.all([
      academicYearService.getAll({ limit: 200 }),
      extracurricularService.getExtracurriculars({ limit: 300 }),
      classService.getAll({ limit: 500 }),
      extracurricularService.getCoaches({ limit: 300 })
    ])

    academicYears.value = yearRes?.data?.academicYears || []
    extracurriculars.value = exRes?.data?.items || []
    classes.value = classRes?.data?.classes || []
    coaches.value = coachRes?.data?.items || []

    const activeYear = academicYears.value.find((item) => item.is_active)
    if (activeYear) filters.academic_year_id = activeYear.id
  } catch (err) {
    error(parseErrorMessage(err, 'Gagal memuat data filter laporan'))
  }
}

onMounted(async () => {
  await loadFilterReferences()
  await fetchData()
})
</script>
