<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Monitoring Scan Gerbang Hari Ini</h1>
        <p class="text-sm text-gray-500 mt-1">Pantau aktivitas scan RFID gerbang secara real-time dengan tampilan ringkas.</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium" :class="autoRefresh ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'">
          <span class="h-1.5 w-1.5 rounded-full" :class="autoRefresh ? 'bg-emerald-500' : 'bg-gray-400'"></span>
          {{ autoRefresh ? 'Auto Refresh Aktif' : 'Auto Refresh Nonaktif' }}
        </span>
        <BaseButton variant="outline" @click="loadData" :loading="loading">Refresh Sekarang</BaseButton>
        <BaseButton @click="toggleAutoRefresh" :variant="autoRefresh ? 'outline' : 'primary'">
          {{ autoRefresh ? 'Stop Auto Refresh' : 'Start Auto Refresh' }}
        </BaseButton>
      </div>
    </div>

    <div class="grid md:grid-cols-4 gap-3">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Total Presensi Hari Ini</p>
        <p class="text-3xl font-black text-blue-600 mt-1">{{ todayTotal }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Scan Berhasil</p>
        <p class="text-3xl font-black text-emerald-600 mt-1">{{ successCount }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Scan Gagal</p>
        <p class="text-3xl font-black text-rose-600 mt-1">{{ failedCount }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Update Terakhir</p>
        <p class="text-sm font-semibold text-gray-800 mt-2">{{ lastUpdated ? formatDateTime(lastUpdated) : '-' }}</p>
      </div>
    </div>

    <BaseTable
      :columns="columns"
      :data="filteredLogs"
      :loading="loading"
      :showPagination="false"
      :searchQuery="keyword"
      @update:searchQuery="(v) => (keyword = v)"
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <select v-model="statusFilter" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm">
            <option value="">Semua Status</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="UNKNOWN_CARD">UNKNOWN_CARD</option>
            <option value="NO_SHIFT">NO_SHIFT</option>
            <option value="DUPLICATE">DUPLICATE</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <BaseButton variant="outline" @click="statusFilter = ''">Reset</BaseButton>
        </div>
      </template>
      <template #cell-scanned_at="{ item }">{{ formatDateTime(item.scanned_at) }}</template>
      <template #cell-student="{ item }">{{ item.student?.full_name || 'Kartu Tidak Dikenal' }}</template>
      <template #cell-nis="{ item }">{{ item.student?.nis || '-' }}</template>
      <template #cell-scan_type="{ item }">{{ item.scan_type || 'AUTO' }}</template>
      <template #cell-result_status="{ item }">
        <span class="px-2 py-1 rounded-full text-xs font-semibold" :class="badgeClass(item.result_status)">
          {{ item.result_status || '-' }}
        </span>
      </template>
      <template #cell-punctual_status="{ item }">
        <span class="px-2 py-1 rounded-full text-xs font-semibold" :class="punctualBadgeClass(getPunctualStatus(item))">
          {{ getPunctualStatus(item) }}
        </span>
      </template>
      <template #cell-late_duration="{ item }">{{ getLateDuration(item) }}</template>
      <template #cell-result_message="{ item }">{{ item.result_message || '-' }}</template>
    </BaseTable>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import attendanceService from '@/services/api/studentAttendanceRfid.service'
import { useToast } from '@/composables/useToast'

const { error: showError } = useToast()

const logs = ref([])
const todayTotal = ref(0)
const loading = ref(false)
const autoRefresh = ref(true)
const statusFilter = ref('')
const keyword = ref('')
const lastUpdated = ref(null)
const columns = [
  { key: 'scanned_at', label: 'Waktu', sortable: false },
  { key: 'student', label: 'Siswa', sortable: false },
  { key: 'nis', label: 'NIS', sortable: false },
  { key: 'scan_type', label: 'Tipe', sortable: false },
  { key: 'result_status', label: 'Status', sortable: false },
  { key: 'punctual_status', label: 'Ketepatan', sortable: false },
  { key: 'late_duration', label: 'Durasi Telat', sortable: false },
  { key: 'result_message', label: 'Pesan', sortable: false }
]

let timer = null

const successCount = computed(() => logs.value.filter((item) => item.result_status === 'SUCCESS').length)
const failedCount = computed(() => logs.value.filter((item) => item.result_status !== 'SUCCESS').length)

const filteredLogs = computed(() => {
  const searchText = keyword.value.trim().toLowerCase()
  return logs.value.filter((item) => {
    const matchStatus = !statusFilter.value || item.result_status === statusFilter.value
    if (!matchStatus) return false

    if (!searchText) return true
    const source = [item.student?.full_name, item.student?.nis, item.result_message].filter(Boolean).join(' ').toLowerCase()
    return source.includes(searchText)
  })
})

const formatDateTime = (value) => (value ? new Date(value).toLocaleString('id-ID') : '-')

const badgeClass = (status) => {
  if (status === 'SUCCESS') return 'bg-emerald-100 text-emerald-700'
  if (status === 'UNKNOWN_CARD') return 'bg-rose-100 text-rose-700'
  if (status === 'DUPLICATE') return 'bg-amber-100 text-amber-700'
  if (status === 'NO_SHIFT') return 'bg-orange-100 text-orange-700'
  if (status === 'REJECTED') return 'bg-gray-200 text-gray-700'
  return 'bg-gray-100 text-gray-600'
}

const getPunctualStatus = (item) => {
  if (item?.result_status !== 'SUCCESS') return '-'

  const entryStatus = item?.attendance?.entry_status
  const lateMinutes = Number(item?.attendance?.late_minutes || 0)

  if (entryStatus === 'LATE' || lateMinutes > 0) return 'Terlambat'
  return 'Tepat Waktu'
}

const formatLateMinutes = (minutes) => {
  const value = Number(minutes || 0)
  if (!value || value < 1) return '-'

  const hours = Math.floor(value / 60)
  const remainMinutes = value % 60

  if (!hours) return `${remainMinutes} menit`
  if (!remainMinutes) return `${hours} jam`
  return `${hours} jam ${remainMinutes} menit`
}

const getLateDuration = (item) => {
  if (getPunctualStatus(item) !== 'Terlambat') return '-'
  return formatLateMinutes(item?.attendance?.late_minutes)
}

const punctualBadgeClass = (status) => {
  if (status === 'Tepat Waktu') return 'bg-sky-100 text-sky-700'
  if (status === 'Terlambat') return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-600'
}

const loadData = async () => {
  loading.value = true
  try {
    const [todayRes, logsRes] = await Promise.all([
      attendanceService.getToday({ limit: 500 }),
      attendanceService.getTodayScanLogs({ limit: 200 })
    ])

    todayTotal.value = todayRes.data?.attendances?.length || 0
    logs.value = logsRes.data || []
    lastUpdated.value = new Date().toISOString()
  } catch (err) {
    showError('Gagal memuat data monitoring scan gerbang')
  } finally {
    loading.value = false
  }
}

const startAutoRefresh = () => {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (autoRefresh.value) loadData()
  }, 5000)
}

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
}

onMounted(async () => {
  await loadData()
  startAutoRefresh()
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>
