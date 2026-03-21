<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Riwayat Absensi</h1>
      <p class="text-sm text-gray-500 mt-1">Lihat riwayat absensi karyawan berdasarkan rentang waktu.</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <input type="date" v-model="filters.date_from" @change="applyFilters" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Dari Tanggal"/>
        <input type="date" v-model="filters.date_to" @change="applyFilters" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Sampai Tanggal"/>
        <select v-model="filters.attendance_status" @change="applyFilters" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
          <option value="">Semua Status</option>
          <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
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
      <template #cell-attendance_date="{ item }">
        <span class="text-sm font-medium text-gray-800">{{ formatDate(item.attendance_date) }}</span>
      </template>
      <template #cell-user="{ item }">
        <div>
          <span class="font-medium text-gray-900 text-sm">{{ item.user?.name || '-' }}</span>
          <span class="block text-xs text-gray-400">{{ item.user?.email }}</span>
        </div>
      </template>
      <template #cell-shift="{ item }">
        <span class="text-sm text-gray-600">{{ item.shift?.name || '-' }}</span>
      </template>
      <template #cell-clock_in_at="{ item }">
        <span class="font-mono text-sm">{{ item.clock_in_at ? formatTime(item.clock_in_at) : '-' }}</span>
      </template>
      <template #cell-clock_out_at="{ item }">
        <span class="font-mono text-sm">{{ item.clock_out_at ? formatTime(item.clock_out_at) : '-' }}</span>
      </template>
      <template #cell-attendance_status="{ item }">
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="getStatusBadge(item.attendance_status)">
          {{ getStatusLabel(item.attendance_status) }}
        </span>
      </template>
      <template #cell-work_duration_minutes="{ item }">
        <span class="text-sm text-gray-600">{{ item.work_duration_minutes ? `${item.work_duration_minutes} mnt` : '-' }}</span>
      </template>
      <template #cell-actions="{ item }">
        <button @click="openDetail(item)" class="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        </button>
      </template>
    </BaseTable>

    <!-- Detail -->
    <BaseModal v-model="showDetail" title="Detail Riwayat Absensi" maxWidth="lg">
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
          <div><span class="text-gray-500">Status Clock In</span><p>{{ detailItem.clock_in_status || '-' }}</p></div>
          <div><span class="text-gray-500">Jarak Masuk</span><p>{{ detailItem.clock_in_distance_meters != null ? `${Math.round(detailItem.clock_in_distance_meters)} m` : '-' }}</p></div>
          <div><span class="text-gray-500">Durasi Kerja</span><p>{{ detailItem.work_duration_minutes ? `${detailItem.work_duration_minutes} menit` : '-' }}</p></div>
          <div v-if="detailItem.note" class="col-span-2"><span class="text-gray-500">Catatan</span><p>{{ detailItem.note }}</p></div>
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
import reportService from '@/services/api/attendanceReport.service'
import { useToast } from '@/composables/useToast'

const { error: showError } = useToast()

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Hadir' },
  { value: 'LATE', label: 'Terlambat' },
  { value: 'ABSENT', label: 'Tidak Hadir' },
  { value: 'INCOMPLETE', label: 'Tidak Lengkap' },
  { value: 'LEAVE', label: 'Izin' },
]

const columns = [
  { key: 'attendance_date', label: 'Tanggal', sortable: false },
  { key: 'user', label: 'Karyawan', sortable: false },
  { key: 'shift', label: 'Shift', sortable: false },
  { key: 'clock_in_at', label: 'Clock In', sortable: false },
  { key: 'clock_out_at', label: 'Clock Out', sortable: false },
  { key: 'attendance_status', label: 'Status', sortable: false },
  { key: 'work_duration_minutes', label: 'Durasi', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-16 text-right' }
]

const items = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const limit = ref(15)
const search = ref('')
const showDetail = ref(false)
const detailItem = ref(null)

const filters = reactive({ date_from: '', date_to: '', attendance_status: '' })
const hasActiveFilters = computed(() => Object.values(filters).some(v => v))

const getStatusBadge = (v) => ({ PRESENT: 'bg-green-100 text-green-700', LATE: 'bg-amber-100 text-amber-700', ABSENT: 'bg-red-100 text-red-700', INCOMPLETE: 'bg-orange-100 text-orange-700', LEAVE: 'bg-purple-100 text-purple-700' }[v] || 'bg-gray-100 text-gray-600')
const getStatusLabel = (v) => STATUS_OPTIONS.find(s => s.value === v)?.label || v || '-'
const formatTime = (d) => d ? new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

const fetchData = async () => {
  loading.value = true
  try {
    const r = await reportService.getHistory({ ...filters, page: currentPage.value, limit: limit.value, search: search.value })
    if (r.success) { items.value = r.data.attendances; total.value = r.data.totalItems }
  } catch (e) { showError('Gagal mengambil riwayat absensi') } finally { loading.value = false }
}

let st
const handleSearch = (v) => { search.value = v; clearTimeout(st); st = setTimeout(() => { currentPage.value = 1; fetchData() }, 400) }
const handlePageChange = (p) => { currentPage.value = p; fetchData() }
const applyFilters = () => { currentPage.value = 1; fetchData() }
const clearFilters = () => { Object.assign(filters, { date_from: '', date_to: '', attendance_status: '' }); applyFilters() }
const openDetail = (item) => { detailItem.value = item; showDetail.value = true }

onMounted(fetchData)
</script>


