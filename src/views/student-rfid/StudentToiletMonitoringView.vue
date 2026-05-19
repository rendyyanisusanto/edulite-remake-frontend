<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Monitoring Toilet Hari Ini</h1>
        <p class="text-sm text-gray-500 mt-1">Pantau aktivitas izin toilet siswa real-time dengan status OUT dan RETURNED.</p>
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
        <p class="text-xs text-gray-500">Total Izin Hari Ini</p>
        <p class="text-3xl font-black text-blue-600 mt-1">{{ totalPermissions }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Sedang OUT</p>
        <p class="text-3xl font-black text-amber-600 mt-1">{{ outCount }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Sudah RETURNED</p>
        <p class="text-3xl font-black text-emerald-600 mt-1">{{ returnedCount }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Update Terakhir</p>
        <p class="text-sm font-semibold text-gray-800 mt-2">{{ lastUpdated ? formatDateTime(lastUpdated) : '-' }}</p>
      </div>
    </div>

    <BaseTable
      :columns="columns"
      :data="filteredRows"
      :loading="loading"
      :showPagination="false"
      :searchQuery="keyword"
      @update:searchQuery="(value) => (keyword = value)"
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <select v-model="statusFilter" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm">
            <option value="">Semua Status</option>
            <option value="OUT">OUT</option>
            <option value="RETURNED">RETURNED</option>
          </select>
          <BaseButton variant="outline" @click="statusFilter = ''">Reset</BaseButton>
        </div>
      </template>

      <template #cell-student="{ item }">
        <div>
          <p class="font-semibold text-gray-900">{{ item.student?.full_name || '-' }}</p>
          <p class="text-xs text-gray-500">NIS: {{ item.student?.nis || '-' }}</p>
        </div>
      </template>
      <template #cell-class_info="{ item }">{{ item.class_info?.name || '-' }}</template>
      <template #cell-permission_date="{ item }">{{ formatDate(item.permission_date) }}</template>
      <template #cell-exit_at="{ item }">{{ formatDateTime(item.exit_at) }}</template>
      <template #cell-return_at="{ item }">{{ formatDateTime(item.return_at) }}</template>
      <template #cell-duration_minutes="{ item }">{{ formatDuration(item.duration_minutes, item.status) }}</template>
      <template #cell-status="{ item }">
        <span class="px-2 py-1 rounded-full text-xs font-semibold" :class="statusBadgeClass(item.status)">
          {{ item.status || '-' }}
        </span>
      </template>
    </BaseTable>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import toiletService from '@/services/api/studentToiletRfid.service'
import { useToast } from '@/composables/useToast'

const { error: showError } = useToast()

const rows = ref([])
const loading = ref(false)
const autoRefresh = ref(true)
const statusFilter = ref('')
const keyword = ref('')
const lastUpdated = ref(null)

const columns = [
  { key: 'student', label: 'Siswa', sortable: false },
  { key: 'class_info', label: 'Kelas', sortable: false },
  { key: 'permission_date', label: 'Tanggal', sortable: false },
  { key: 'exit_at', label: 'Keluar', sortable: false },
  { key: 'return_at', label: 'Kembali', sortable: false },
  { key: 'duration_minutes', label: 'Durasi', sortable: false },
  { key: 'status', label: 'Status', sortable: false }
]

let timer = null

const totalPermissions = computed(() => rows.value.length)
const outCount = computed(() => rows.value.filter((item) => item.status === 'OUT').length)
const returnedCount = computed(() => rows.value.filter((item) => item.status === 'RETURNED').length)

const filteredRows = computed(() => {
  const searchText = keyword.value.trim().toLowerCase()
  return rows.value.filter((item) => {
    const matchStatus = !statusFilter.value || item.status === statusFilter.value
    if (!matchStatus) return false

    if (!searchText) return true
    const source = [item.student?.full_name, item.student?.nis, item.class_info?.name].filter(Boolean).join(' ').toLowerCase()
    return source.includes(searchText)
  })
})

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID')
}

const formatDateTime = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID')
}

const formatDuration = (minutes, status) => {
  if (status === 'OUT') return 'Masih di toilet'

  const value = Number(minutes || 0)
  if (value < 1) return '-'

  const hours = Math.floor(value / 60)
  const remainMinutes = value % 60

  if (!hours) return `${remainMinutes} menit`
  if (!remainMinutes) return `${hours} jam`
  return `${hours} jam ${remainMinutes} menit`
}

const statusBadgeClass = (status) => {
  if (status === 'OUT') return 'bg-amber-100 text-amber-700'
  if (status === 'RETURNED') return 'bg-emerald-100 text-emerald-700'
  return 'bg-gray-100 text-gray-600'
}

const loadData = async () => {
  loading.value = true
  try {
    const response = await toiletService.getToday({ limit: 500 })
    rows.value = response.data?.permissions || []
    lastUpdated.value = new Date().toISOString()
  } catch (err) {
    showError('Gagal memuat data monitoring toilet')
  } finally {
    loading.value = false
  }
}

const startAutoRefresh = () => {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (autoRefresh.value) loadData()
  }, 7000)
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
