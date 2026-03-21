<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Monitoring Absensi</h1>
        <p class="text-sm text-gray-500 mt-1">Pantau kehadiran harian karyawan secara real-time.</p>
      </div>
      <div class="flex items-center gap-2">
        <input v-model="filters.date" type="date" @change="applyFilters" class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"/>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <div v-for="card in summaryCards" :key="card.label" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p class="text-xs text-gray-500 font-medium">{{ card.label }}</p>
        <p class="text-2xl font-bold mt-1" :class="card.color">
          <span v-if="statsLoading" class="animate-pulse text-base">...</span>
          <span v-else>{{ card.value }}</span>
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <select v-model="filters.attendance_status" @change="applyFilters" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
          <option value="">Semua Status</option>
          <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <select v-model="filters.missing_clock_in" @change="applyFilters" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
          <option value="">Semua Clock In</option>
          <option value="true">Belum Clock In</option>
        </select>
        <select v-model="filters.missing_clock_out" @change="applyFilters" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
          <option value="">Semua Clock Out</option>
          <option value="true">Belum Clock Out</option>
        </select>
        <button v-if="hasActiveFilters" @click="clearFilters" class="text-xs text-red-500 hover:text-red-700 font-medium text-left px-2">Hapus Filter</button>
      </div>
    </div>

    <!-- Table -->
    <BaseTable
      :columns="columns" :data="items" :loading="loading"
      :total="total" :currentPage="currentPage" :perPage="limit"
      :searchQuery="search" @update:searchQuery="handleSearch"
      @page-change="handlePageChange"
    >
      <template #cell-user="{ item }">
        <div>
          <span class="font-medium text-gray-900">{{ item.user?.name || '-' }}</span>
          <span class="block text-xs text-gray-400">{{ item.user?.email || '-' }}</span>
        </div>
      </template>
      <template #cell-shift="{ item }">
        <span class="text-sm text-gray-600">{{ item.shift?.name || '-' }}</span>
      </template>
      <template #cell-clock_in_at="{ item }">
        <span :class="item.clock_in_at ? 'text-gray-800 font-mono text-sm' : 'text-red-400 italic text-sm'">
          {{ item.clock_in_at ? formatTime(item.clock_in_at) : 'Belum' }}
        </span>
      </template>
      <template #cell-clock_out_at="{ item }">
        <span :class="item.clock_out_at ? 'text-gray-800 font-mono text-sm' : 'text-amber-500 italic text-sm'">
          {{ item.clock_out_at ? formatTime(item.clock_out_at) : 'Belum' }}
        </span>
      </template>
      <template #cell-attendance_status="{ item }">
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="getStatusBadge(item.attendance_status)">
          {{ getStatusLabel(item.attendance_status) }}
        </span>
      </template>
      <template #cell-work_duration_minutes="{ item }">
        <span class="text-sm text-gray-600">{{ item.work_duration_minutes ? `${item.work_duration_minutes} mnt` : '-' }}</span>
      </template>
      <template #cell-clock_in_distance_meters="{ item }">
        <span class="text-sm" :class="item.clock_in_distance_meters > 500 ? 'text-red-500' : 'text-gray-600'">
          {{ item.clock_in_distance_meters != null ? `${Math.round(item.clock_in_distance_meters)} m` : '-' }}
        </span>
      </template>
      <template #cell-actions="{ item }">
        <button @click="openDetail(item)" class="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Detail">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        </button>
      </template>
    </BaseTable>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetail" title="Detail Absensi" maxWidth="lg">
      <template v-if="detailItem">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div><span class="text-gray-500">Nama</span><p class="font-semibold">{{ detailItem.user?.name }}</p></div>
          <div><span class="text-gray-500">Tanggal</span><p class="font-semibold">{{ formatDate(detailItem.attendance_date) }}</p></div>
          <div><span class="text-gray-500">Shift</span><p>{{ detailItem.shift?.name || '-' }}</p></div>
          <div><span class="text-gray-500">Status</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="getStatusBadge(detailItem.attendance_status)">{{ getStatusLabel(detailItem.attendance_status) }}</span>
          </div>
          <div><span class="text-gray-500">Clock In</span><p class="font-mono">{{ detailItem.clock_in_at ? formatTime(detailItem.clock_in_at) : '-' }}</p></div>
          <div><span class="text-gray-500">Clock Out</span><p class="font-mono">{{ detailItem.clock_out_at ? formatTime(detailItem.clock_out_at) : '-' }}</p></div>
          <div><span class="text-gray-500">Jarak Masuk</span><p>{{ detailItem.clock_in_distance_meters != null ? `${Math.round(detailItem.clock_in_distance_meters)} m` : '-' }}</p></div>
          <div><span class="text-gray-500">Jarak Keluar</span><p>{{ detailItem.clock_out_distance_meters != null ? `${Math.round(detailItem.clock_out_distance_meters)} m` : '-' }}</p></div>
          <div><span class="text-gray-500">Durasi Kerja</span><p>{{ detailItem.work_duration_minutes ? `${detailItem.work_duration_minutes} menit` : '-' }}</p></div>
          <div><span class="text-gray-500">Metode Masuk</span><p>{{ detailItem.clock_in_method || '-' }}</p></div>
          <div v-if="detailItem.clock_in_note" class="col-span-2"><span class="text-gray-500">Catatan Masuk</span><p>{{ detailItem.clock_in_note }}</p></div>
          <div v-if="detailItem.clock_out_note" class="col-span-2"><span class="text-gray-500">Catatan Keluar</span><p>{{ detailItem.clock_out_note }}</p></div>
          <div v-if="detailItem.note" class="col-span-2"><span class="text-gray-500">Catatan Umum</span><p>{{ detailItem.note }}</p></div>
        </div>
      </template>
      <template #footer>
        <BaseButton variant="outline" @click="showDetail = false">Tutup</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import monitoringService from '@/services/api/attendanceMonitoring.service'
import { useToast } from '@/composables/useToast'

const { error: showError } = useToast()
const today = () => new Date().toISOString().slice(0, 10)

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Hadir' },
  { value: 'LATE', label: 'Terlambat' },
  { value: 'ABSENT', label: 'Tidak Hadir' },
  { value: 'INCOMPLETE', label: 'Tidak Lengkap' },
  { value: 'LEAVE', label: 'Izin' },
]

const columns = [
  { key: 'user', label: 'Karyawan', sortable: false },
  { key: 'shift', label: 'Shift', sortable: false },
  { key: 'clock_in_at', label: 'Clock In', sortable: false },
  { key: 'clock_out_at', label: 'Clock Out', sortable: false },
  { key: 'attendance_status', label: 'Status', sortable: false },
  { key: 'work_duration_minutes', label: 'Durasi', sortable: false },
  { key: 'clock_in_distance_meters', label: 'Jarak Masuk', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-16 text-right' }
]

const items = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const limit = ref(20)
const search = ref('')
const statsLoading = ref(false)
const stats = ref({ total: 0, PRESENT: 0, LATE: 0, INCOMPLETE: 0, ABSENT: 0 })

const showDetail = ref(false)
const detailItem = ref(null)

const filters = reactive({ date: today(), attendance_status: '', missing_clock_in: '', missing_clock_out: '' })
const hasActiveFilters = computed(() => filters.attendance_status || filters.missing_clock_in || filters.missing_clock_out)

const summaryCards = computed(() => [
  { label: 'Total', value: stats.value.total, color: 'text-blue-600' },
  { label: 'Hadir', value: stats.value.PRESENT, color: 'text-green-600' },
  { label: 'Terlambat', value: stats.value.LATE, color: 'text-amber-600' },
  { label: 'Tidak Lengkap', value: stats.value.INCOMPLETE, color: 'text-orange-600' },
  { label: 'Tidak Hadir', value: stats.value.ABSENT, color: 'text-red-600' },
])

const getStatusBadge = (v) => ({ PRESENT: 'bg-green-100 text-green-700', LATE: 'bg-amber-100 text-amber-700', ABSENT: 'bg-red-100 text-red-700', INCOMPLETE: 'bg-orange-100 text-orange-700', LEAVE: 'bg-purple-100 text-purple-700' }[v] || 'bg-gray-100 text-gray-600')
const getStatusLabel = (v) => STATUS_OPTIONS.find(s => s.value === v)?.label || v || '-'
const formatTime = (d) => d ? new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'

const fetchData = async () => {
  loading.value = true
  try {
    const r = await monitoringService.getByDate({ ...filters, page: currentPage.value, limit: limit.value, search: search.value })
    if (r.success) { items.value = r.data.attendances; total.value = r.data.totalItems }
  } catch (e) { showError('Gagal mengambil data monitoring') } finally { loading.value = false }
}

const fetchStats = async () => {
  statsLoading.value = true
  try {
    const r = await monitoringService.getSummary({ date: filters.date })
    if (r.success) stats.value = r.data
  } catch (e) {} finally { statsLoading.value = false }
}

let st
const handleSearch = (v) => { search.value = v; clearTimeout(st); st = setTimeout(() => { currentPage.value = 1; fetchData() }, 400) }
const handlePageChange = (p) => { currentPage.value = p; fetchData() }
const applyFilters = () => { currentPage.value = 1; fetchData(); fetchStats() }
const clearFilters = () => { Object.assign(filters, { attendance_status: '', missing_clock_in: '', missing_clock_out: '' }); applyFilters() }

const openDetail = (item) => { detailItem.value = item; showDetail.value = true }

onMounted(() => { fetchData(); fetchStats() })
</script>


