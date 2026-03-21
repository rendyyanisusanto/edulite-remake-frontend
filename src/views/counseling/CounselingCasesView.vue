<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Kasus Konseling</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola dan pantau kasus konseling siswa secara terstruktur.</p>
      </div>
      <BaseButton @click="$router.push({ name: 'CounselingCaseCreate' })">
        <svg class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Buat Kasus Baru
      </BaseButton>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="card in summaryCards" :key="card.label"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <div class="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center" :class="card.bg">
          <component :is="card.icon" class="h-5 w-5" :class="card.color" />
        </div>
        <div>
          <p class="text-xs text-gray-500 font-medium">{{ card.label }}</p>
          <p class="text-xl font-bold" :class="card.color">
            <span v-if="statsLoading" class="animate-pulse">...</span>
            <span v-else>{{ card.value }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <select v-model="filters.source" @change="applyFilters" class="col-span-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
          <option value="">Semua Sumber</option>
          <option v-for="s in SOURCE_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <select v-model="filters.category" @change="applyFilters" class="col-span-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
          <option value="">Semua Kategori</option>
          <option v-for="c in CATEGORY_OPTIONS" :key="c.value" :value="c.value">{{ c.label }}</option>
        </select>
        <select v-model="filters.level" @change="applyFilters" class="col-span-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
          <option value="">Semua Level</option>
          <option v-for="l in LEVEL_OPTIONS" :key="l.value" :value="l.value">{{ l.label }}</option>
        </select>
        <select v-model="filters.status" @change="applyFilters" class="col-span-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
          <option value="">Semua Status</option>
          <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <input type="date" v-model="filters.date_from" @change="applyFilters" placeholder="Dari Tanggal" class="col-span-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        <input type="date" v-model="filters.date_to" @change="applyFilters" placeholder="Sampai Tanggal" class="col-span-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
      </div>
      <div v-if="hasActiveFilters" class="mt-2 flex justify-end">
        <button @click="clearFilters" class="text-xs text-red-500 hover:text-red-700 font-medium">Hapus Filter</button>
      </div>
    </div>

    <!-- Table -->
    <BaseTable
      :columns="columns"
      :data="items"
      :loading="loading"
      :total="total"
      :currentPage="currentPage"
      :perPage="limit"
      :searchQuery="search"
      @update:searchQuery="handleSearch"
      @page-change="handlePageChange"
      @sort="handleSort"
      :sortBy="sortBy"
      :sortDesc="sortDesc"
    >
      <template #cell-student="{ item }">
        <div>
          <span class="font-medium text-gray-900">{{ item.student?.full_name || '-' }}</span>
          <span class="block text-xs text-gray-500">NIS: {{ item.student?.nis || '-' }}</span>
        </div>
      </template>

      <template #cell-issue_title="{ item }">
        <span class="font-medium text-gray-800 line-clamp-1 max-w-xs">{{ item.issue_title || '-' }}</span>
      </template>

      <template #cell-source="{ item }">
        <span class="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{{ formatSource(item.source) }}</span>
      </template>

      <template #cell-category="{ item }">
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="getCategoryBadge(item.category)">{{ item.category || '-' }}</span>
      </template>

      <template #cell-level="{ item }">
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="getLevelBadge(item.level)">{{ item.level || '-' }}</span>
      </template>

      <template #cell-status="{ item }">
        <span class="px-2 py-1 rounded-full text-xs font-semibold" :class="getStatusBadge(item.status)">{{ formatStatus(item.status) }}</span>
      </template>

      <template #cell-created_at="{ item }">
        <span class="text-xs text-gray-500">{{ formatDate(item.created_at) }}</span>
      </template>

      <template #cell-creator="{ item }">
        <span class="text-xs text-gray-500">{{ item.creator?.name || '-' }}</span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center gap-1.5">
          <!-- View Detail -->
          <button @click="$router.push({ name: 'CounselingCaseDetail', params: { id: item.id } })"
            class="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Lihat Detail">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
          <!-- Edit -->
          <button @click="$router.push({ name: 'CounselingCaseEdit', params: { id: item.id } })"
            class="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <!-- Change Status -->
          <button @click="openStatusModal(item)"
            class="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors" title="Ubah Status">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </button>
          <!-- Student History -->
          <button @click="$router.push({ name: 'StudentCounselingHistory', params: { studentId: item.student_id } })"
            class="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors" title="Riwayat Siswa">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </button>
        </div>
      </template>
    </BaseTable>

    <!-- Quick Status Modal -->
    <BaseModal v-model="showStatusModal" title="Ubah Status Kasus" maxWidth="sm">
      <div class="space-y-4">
        <p class="text-sm text-gray-600">
          Kasus: <span class="font-semibold text-gray-800">{{ statusTarget?.issue_title }}</span>
        </p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status Baru <span class="text-red-500">*</span></label>
          <select v-model="newStatus" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
            <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showStatusModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="submitStatusChange" :loading="statusSaving">Simpan Status</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import counselingCaseService from '@/services/api/counselingCase.service'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { success, error: showError } = useToast()

// --- Constants ---
const SOURCE_OPTIONS = [
  { value: 'HOMEROOM_TEACHER', label: 'Wali Kelas' },
  { value: 'SUBJECT_TEACHER', label: 'Guru Mapel' },
  { value: 'PARENT', label: 'Orang Tua' },
  { value: 'STUDENT_SELF_REPORT', label: 'Lapor Diri' },
  { value: 'DISCIPLINE_TEAM', label: 'Tim Kedisiplinan' },
  { value: 'COUNSELOR', label: 'Konselor' },
  { value: 'OTHER', label: 'Lainnya' },
]
const CATEGORY_OPTIONS = [
  { value: 'ACADEMIC', label: 'Akademik' },
  { value: 'BEHAVIOR', label: 'Perilaku' },
  { value: 'DISCIPLINE', label: 'Disiplin' },
  { value: 'SOCIAL', label: 'Sosial' },
  { value: 'EMOTIONAL', label: 'Emosional' },
  { value: 'ATTENDANCE', label: 'Kehadiran' },
  { value: 'FAMILY', label: 'Keluarga' },
  { value: 'OTHER', label: 'Lainnya' },
]
const LEVEL_OPTIONS = [
  { value: 'LOW', label: 'Rendah' },
  { value: 'MEDIUM', label: 'Sedang' },
  { value: 'HIGH', label: 'Tinggi' },
  { value: 'CRITICAL', label: 'Kritis' },
]
const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Terbuka' },
  { value: 'IN_PROGRESS', label: 'Sedang Diproses' },
  { value: 'RESOLVED', label: 'Selesai' },
  { value: 'CLOSED', label: 'Ditutup' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
]

// --- State ---
const items = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const limit = ref(10)
const search = ref('')
const sortBy = ref('created_at')
const sortDesc = ref(true)

const statsLoading = ref(false)
const stats = ref({ total: 0, open: 0, inProgress: 0, resolved: 0 })

const filters = reactive({ source: '', category: '', level: '', status: '', date_from: '', date_to: '' })
const hasActiveFilters = computed(() => Object.values(filters).some(v => v !== ''))

const showStatusModal = ref(false)
const statusTarget = ref(null)
const newStatus = ref('')
const statusSaving = ref(false)

// --- Icons as inline components ---
const IconTotal = { render() { return h('svg', { class: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' })]) } }
const IconOpen = { render() { return h('svg', { class: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })]) } }
const IconProgress = { render() { return h('svg', { class: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' })]) } }
const IconResolved = { render() { return h('svg', { class: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' })]) } }

const summaryCards = computed(() => [
  { label: 'Total Kasus', value: stats.value.total, color: 'text-blue-600', bg: 'bg-blue-50', icon: IconTotal },
  { label: 'Terbuka', value: stats.value.open, color: 'text-red-600', bg: 'bg-red-50', icon: IconOpen },
  { label: 'Sedang Diproses', value: stats.value.inProgress, color: 'text-amber-600', bg: 'bg-amber-50', icon: IconProgress },
  { label: 'Selesai', value: stats.value.resolved, color: 'text-green-600', bg: 'bg-green-50', icon: IconResolved },
])

const columns = [
  { key: 'student', label: 'Siswa', sortable: false },
  { key: 'source', label: 'Sumber', sortable: true },
  { key: 'issue_title', label: 'Judul Masalah', sortable: true },
  { key: 'category', label: 'Kategori', sortable: true },
  { key: 'level', label: 'Level', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'created_at', label: 'Dibuat', sortable: true },
  { key: 'creator', label: 'Oleh', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-32 text-right' },
]

// --- Formatters ---
const formatSource = (val) => SOURCE_OPTIONS.find(s => s.value === val)?.label || val || '-'
const formatStatus = (val) => STATUS_OPTIONS.find(s => s.value === val)?.label || val || '-'
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

const getLevelBadge = (v) => ({ LOW: 'bg-green-100 text-green-700', MEDIUM: 'bg-yellow-100 text-yellow-700', HIGH: 'bg-orange-100 text-orange-700', CRITICAL: 'bg-red-100 text-red-700' }[v] || 'bg-gray-100 text-gray-700')
const getStatusBadge = (v) => ({ OPEN: 'bg-red-100 text-red-700', IN_PROGRESS: 'bg-amber-100 text-amber-700', RESOLVED: 'bg-green-100 text-green-700', CLOSED: 'bg-gray-100 text-gray-700', CANCELLED: 'bg-slate-100 text-slate-500' }[v] || 'bg-gray-100 text-gray-700')
const getCategoryBadge = (v) => ({ ACADEMIC: 'bg-blue-100 text-blue-700', BEHAVIOR: 'bg-purple-100 text-purple-700', DISCIPLINE: 'bg-red-100 text-red-700', SOCIAL: 'bg-teal-100 text-teal-700', EMOTIONAL: 'bg-pink-100 text-pink-700', ATTENDANCE: 'bg-orange-100 text-orange-700', FAMILY: 'bg-indigo-100 text-indigo-700', OTHER: 'bg-gray-100 text-gray-700' }[v] || 'bg-gray-100 text-gray-700')

// --- Data fetching ---
const fetchData = async () => {
  loading.value = true
  try {
    const r = await counselingCaseService.getAll({
      page: currentPage.value,
      limit: limit.value,
      search: search.value,
      sortBy: sortBy.value,
      sortDesc: sortDesc.value,
      ...filters,
    })
    if (r.success) {
      items.value = r.data.counselingCases
      total.value = r.data.totalItems
    }
  } catch (e) {
    showError('Gagal mengambil data kasus konseling')
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  statsLoading.value = true
  try {
    const r = await counselingCaseService.getStats()
    if (r.success) stats.value = r.data
  } catch (e) {} finally {
    statsLoading.value = false
  }
}

// --- Handlers ---
const handlePageChange = (p) => { currentPage.value = p; fetchData() }
let st
const handleSearch = (v) => { search.value = v; clearTimeout(st); st = setTimeout(() => { currentPage.value = 1; fetchData() }, 500) }
const handleSort = (k) => { if (sortBy.value === k) sortDesc.value = !sortDesc.value; else { sortBy.value = k; sortDesc.value = true }; fetchData() }
const applyFilters = () => { currentPage.value = 1; fetchData() }
const clearFilters = () => { Object.assign(filters, { source: '', category: '', level: '', status: '', date_from: '', date_to: '' }); applyFilters() }

const openStatusModal = (item) => { statusTarget.value = item; newStatus.value = item.status || 'OPEN'; showStatusModal.value = true }
const submitStatusChange = async () => {
  if (!newStatus.value) return showError('Pilih status terlebih dahulu')
  statusSaving.value = true
  try {
    await counselingCaseService.updateStatus(statusTarget.value.id, newStatus.value)
    success('Status berhasil diubah')
    showStatusModal.value = false
    fetchData()
    fetchStats()
  } catch (e) {
    showError('Gagal mengubah status')
  } finally {
    statusSaving.value = false
  }
}

onMounted(() => { fetchData(); fetchStats() })
</script>
