<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Histori Toilet Siswa</h1>
        <p class="text-sm text-gray-500 mt-1">Riwayat izin toilet siswa per tanggal dengan filter kelas dan status.</p>
      </div>
      <BaseButton variant="outline" @click="loadData" :loading="loading">Refresh Data</BaseButton>
    </div>

    <div class="grid md:grid-cols-4 gap-3">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Total Data</p>
        <p class="text-3xl font-black text-blue-600 mt-1">{{ pagination.totalItems }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Status OUT</p>
        <p class="text-3xl font-black text-amber-600 mt-1">{{ outCount }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Status RETURNED</p>
        <p class="text-3xl font-black text-emerald-600 mt-1">{{ returnedCount }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Update Terakhir</p>
        <p class="text-sm font-semibold text-gray-800 mt-2">{{ lastUpdated ? formatDateTime(lastUpdated, true) : '-' }}</p>
      </div>
    </div>

    <BaseTable
      :columns="columns"
      :data="rows"
      :loading="loading"
      :showActions="true"
      :showPagination="true"
      :total="pagination.totalItems"
      :currentPage="filters.page"
      :perPage="filters.limit"
      :searchQuery="filters.keyword"
      @update:searchQuery="handleSearch"
      @page-change="handlePageChange"
    >
      <template #actions>
        <div class="flex flex-wrap items-center gap-2">
          <input v-model="filters.date" type="date" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm" />
          <select v-model="filters.class_id" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm min-w-40">
            <option value="">Semua Kelas</option>
            <option v-for="klass in classes" :key="klass.id" :value="String(klass.id)">{{ klass.name }}</option>
          </select>
          <select v-model="filters.status" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm min-w-40">
            <option value="">Semua Status</option>
            <option value="OUT">OUT</option>
            <option value="RETURNED">RETURNED</option>
          </select>
          <BaseButton variant="outline" @click="applyFilter">Filter</BaseButton>
          <BaseButton variant="outline" @click="resetFilter">Reset</BaseButton>
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
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import toiletService from '@/services/api/studentToiletRfid.service'
import { classService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { error: showError } = useToast()

const today = new Date().toISOString().slice(0, 10)

const columns = [
  { key: 'student', label: 'Siswa', sortable: false },
  { key: 'class_info', label: 'Kelas', sortable: false },
  { key: 'permission_date', label: 'Tanggal', sortable: false },
  { key: 'exit_at', label: 'Keluar', sortable: false },
  { key: 'return_at', label: 'Kembali', sortable: false },
  { key: 'duration_minutes', label: 'Durasi', sortable: false },
  { key: 'status', label: 'Status', sortable: false }
]

const rows = ref([])
const classes = ref([])
const loading = ref(false)
const lastUpdated = ref(null)
const searchDebounce = ref(null)

const filters = reactive({
  date: today,
  class_id: '',
  status: '',
  keyword: '',
  page: 1,
  limit: 20
})

const pagination = reactive({
  totalItems: 0,
  totalPages: 1
})

const outCount = computed(() => rows.value.filter((item) => item.status === 'OUT').length)
const returnedCount = computed(() => rows.value.filter((item) => item.status === 'RETURNED').length)

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID')
}

const formatDateTime = (value, withDate = false) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID', withDate ? undefined : { hour: '2-digit', minute: '2-digit' })
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

const loadClasses = async () => {
  try {
    const response = await classService.getAll({ page: 1, limit: 300 })
    classes.value = response?.data?.classes || []
  } catch (err) {
    showError('Gagal memuat data kelas')
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      date: filters.date || today,
      class_id: filters.class_id || undefined,
      status: filters.status || undefined,
      keyword: filters.keyword || undefined,
      page: filters.page,
      limit: filters.limit
    }

    const response = await toiletService.getHistory(params)
    const payload = response?.data || {}

    rows.value = payload.permissions || []
    pagination.totalItems = payload.totalItems || 0
    pagination.totalPages = payload.totalPages || 1
    lastUpdated.value = new Date().toISOString()
  } catch (err) {
    showError('Gagal memuat histori toilet siswa')
  } finally {
    loading.value = false
  }
}

const applyFilter = async () => {
  filters.page = 1
  await loadData()
}

const resetFilter = async () => {
  filters.date = today
  filters.class_id = ''
  filters.status = ''
  filters.keyword = ''
  filters.page = 1
  await loadData()
}

const handlePageChange = async (page) => {
  if (page < 1 || page > pagination.totalPages || page === filters.page) return
  filters.page = page
  await loadData()
}

const handleSearch = (value) => {
  filters.keyword = value
  filters.page = 1

  if (searchDebounce.value) clearTimeout(searchDebounce.value)
  searchDebounce.value = setTimeout(() => {
    loadData()
  }, 350)
}

onMounted(async () => {
  await Promise.all([loadClasses(), loadData()])
})

onBeforeUnmount(() => {
  if (searchDebounce.value) clearTimeout(searchDebounce.value)
})
</script>
