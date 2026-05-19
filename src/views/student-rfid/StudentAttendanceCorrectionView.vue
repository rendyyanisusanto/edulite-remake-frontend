<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Koreksi Presensi Siswa</h1>
        <p class="text-sm text-gray-500 mt-1">Review pengajuan koreksi clock in/clock out siswa.</p>
      </div>
      <BaseButton variant="outline" @click="loadData" :loading="loading">Refresh Data</BaseButton>
    </div>

    <div class="grid md:grid-cols-4 gap-3">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Total Pengajuan</p>
        <p class="text-3xl font-black text-blue-600 mt-1">{{ pagination.totalItems }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Pending</p>
        <p class="text-3xl font-black text-amber-600 mt-1">{{ pendingCount }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Approved</p>
        <p class="text-3xl font-black text-emerald-600 mt-1">{{ approvedCount }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Rejected</p>
        <p class="text-3xl font-black text-rose-600 mt-1">{{ rejectedCount }}</p>
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
          <select v-model="filters.status" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm min-w-40">
            <option value="">Semua Status</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
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
      <template #cell-class_info="{ item }">{{ item.attendance?.class_info?.name || '-' }}</template>
      <template #cell-attendance_date="{ item }">{{ formatDate(item.attendance?.attendance_date) }}</template>
      <template #cell-request_type="{ item }">{{ item.request_type || '-' }}</template>
      <template #cell-requested_time="{ item }">
        <div class="text-xs space-y-0.5">
          <p>In: {{ formatDateTime(item.requested_clock_in_at) }}</p>
          <p>Out: {{ formatDateTime(item.requested_clock_out_at) }}</p>
        </div>
      </template>
      <template #cell-status="{ item }">
        <span class="px-2 py-1 rounded-full text-xs font-semibold" :class="statusBadgeClass(item.status)">
          {{ item.status || '-' }}
        </span>
      </template>
      <template #cell-reviewed_by="{ item }">{{ item.reviewer?.name || '-' }}</template>
      <template #cell-actions="{ item }">
        <div v-if="item.status === 'PENDING'" class="flex items-center gap-2">
          <BaseButton
            size="sm"
            variant="outline"
            :loading="reviewingId === item.id && reviewingStatus === 'APPROVED'"
            :disabled="reviewingId === item.id"
            @click="review(item, 'APPROVED')"
          >
            Approve
          </BaseButton>
          <BaseButton
            size="sm"
            variant="danger"
            :loading="reviewingId === item.id && reviewingStatus === 'REJECTED'"
            :disabled="reviewingId === item.id"
            @click="review(item, 'REJECTED')"
          >
            Reject
          </BaseButton>
        </div>
        <span v-else class="text-xs text-gray-500">Sudah direview</span>
      </template>
    </BaseTable>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import attendanceService from '@/services/api/studentAttendanceRfid.service'
import { useToast } from '@/composables/useToast'

const { success, error } = useToast()

const rows = ref([])
const loading = ref(false)
const reviewingId = ref(null)
const reviewingStatus = ref('')
const searchDebounce = ref(null)

const columns = [
  { key: 'student', label: 'Siswa', sortable: false },
  { key: 'class_info', label: 'Kelas', sortable: false },
  { key: 'attendance_date', label: 'Tanggal', sortable: false },
  { key: 'request_type', label: 'Tipe Koreksi', sortable: false },
  { key: 'requested_time', label: 'Usulan Waktu', sortable: false },
  { key: 'reason', label: 'Alasan', sortable: false, class: 'max-w-xs truncate' },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'reviewed_by', label: 'Reviewer', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false }
]

const filters = reactive({ status: '', keyword: '', page: 1, limit: 20 })
const pagination = reactive({ totalItems: 0, totalPages: 1 })

const pendingCount = computed(() => rows.value.filter((item) => item.status === 'PENDING').length)
const approvedCount = computed(() => rows.value.filter((item) => item.status === 'APPROVED').length)
const rejectedCount = computed(() => rows.value.filter((item) => item.status === 'REJECTED').length)

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID')
}

const formatDateTime = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
}

const statusBadgeClass = (status) => {
  if (status === 'PENDING') return 'bg-amber-100 text-amber-700'
  if (status === 'APPROVED') return 'bg-emerald-100 text-emerald-700'
  if (status === 'REJECTED') return 'bg-rose-100 text-rose-700'
  return 'bg-gray-100 text-gray-600'
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      status: filters.status || undefined,
      keyword: filters.keyword || undefined,
      page: filters.page,
      limit: filters.limit
    }

    const response = await attendanceService.getCorrections(params)
    const payload = response.data || {}

    rows.value = payload.corrections || []
    pagination.totalItems = payload.totalItems || 0
    pagination.totalPages = payload.totalPages || 1
  } catch (err) {
    error('Gagal memuat data koreksi')
  } finally {
    loading.value = false
  }
}

const review = async (item, status) => {
  reviewingId.value = item.id
  reviewingStatus.value = status

  try {
    await attendanceService.reviewCorrection(item.id, { status, review_note: `${status} by admin` })
    success(`Koreksi ${status === 'APPROVED' ? 'disetujui' : 'ditolak'}`)
    await loadData()
  } catch (err) {
    error('Gagal review koreksi')
  } finally {
    reviewingId.value = null
    reviewingStatus.value = ''
  }
}

const applyFilter = async () => {
  filters.page = 1
  await loadData()
}

const resetFilter = async () => {
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

onMounted(loadData)

onBeforeUnmount(() => {
  if (searchDebounce.value) clearTimeout(searchDebounce.value)
})
</script>
