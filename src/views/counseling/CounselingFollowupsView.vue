<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Pemantauan Tindak Lanjut</h1>
        <p class="text-sm text-gray-500 mt-1">Monitor siswa yang membutuhkan perhatian lebih lanjut berdasarkan rencana kasus.</p>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4" v-if="stats">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:border-gray-200 transition-all"
           :class="{ 'ring-2 ring-primary border-transparent': currentFilter === 'all' }"
           @click="setFilter('all')">
        <p class="text-sm font-medium text-gray-500">Total Kasus</p>
        <p class="text-2xl font-bold text-gray-800 mt-1">{{ stats.totalCases }}</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:border-blue-200 transition-all"
           :class="{ 'ring-2 ring-blue-500 border-transparent': currentFilter === 'pending_follow_up' }"
           @click="setFilter('pending_follow_up')">
        <p class="text-sm font-medium text-blue-600">Butuh Tindak Lanjut</p>
        <p class="text-2xl font-bold text-blue-700 mt-1">{{ stats.pendingFollowUpCases }}</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:border-yellow-200 transition-all"
           :class="{ 'ring-2 ring-yellow-500 border-transparent': currentFilter === 'no_session' }"
           @click="setFilter('no_session')">
        <p class="text-sm font-medium text-yellow-600">Belum Ada Sesi</p>
        <p class="text-2xl font-bold text-yellow-700 mt-1">{{ stats.noSessionYet }}</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:border-green-200 transition-all"
           :class="{ 'ring-2 ring-green-500 border-transparent': currentFilter === 'resolved' }"
           @click="setFilter('resolved')">
        <p class="text-sm font-medium text-green-600">Kasus Selesai</p>
        <p class="text-2xl font-bold text-green-700 mt-1">{{ stats.resolvedCases }}</p>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center text-gray-400">
        <div class="animate-pulse space-y-4">
          <div v-for="n in 5" :key="n" class="h-12 bg-gray-100 rounded"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!processedItems.length" class="p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <p class="text-gray-500 font-medium">Tidak ada data untuk ditampilkan</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Siswa</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kasus</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sesi Terakhir</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tindak Lanjut</th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in processedItems" :key="item.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <p class="text-sm font-bold text-gray-800">{{ item.student?.full_name }}</p>
                <p class="text-xs text-gray-500">NIS: {{ item.student?.nis }}</p>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm font-medium text-gray-800 mb-1 max-w-xs truncate" :title="item.issue_title">{{ item.issue_title }}</p>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="getStatusBadge(item.status)">{{ formatStatus(item.status) }}</span>
              </td>
              <td class="px-6 py-4">
                <template v-if="item.latest_session">
                  <p class="text-sm font-medium text-gray-800">{{ formatDateTime(item.latest_session.session_date || item.latest_session.created_at) }}</p>
                  <p class="text-xs text-gray-500 mt-1">Oleh: {{ item.latest_session.counselor?.name || '-' }}</p>
                </template>
                <template v-else>
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-100">Belum Ada Sesi</span>
                </template>
              </td>
              <td class="px-6 py-4">
                <template v-if="item.latest_session?.next_plan">
                  <p class="text-sm text-gray-700 max-w-xs line-clamp-2" :title="item.latest_session.next_plan">{{ item.latest_session.next_plan }}</p>
                </template>
                <template v-else-if="item.latest_session">
                  <p class="text-sm text-gray-400 italic">Tidak ada rencana</p>
                </template>
                <template v-else>
                  <p class="text-sm text-gray-400">-</p>
                </template>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <button @click="$router.push({ name: 'CounselingCaseDetail', params: { id: item.id } })"
                  class="text-blue-600 hover:text-blue-900 text-sm font-medium inline-flex items-center gap-1">
                  Lihat Detail
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-gray-500">
          Menampilkan <span class="font-medium">{{ (currentPage - 1) * limit + 1 }}</span> sampai <span class="font-medium">{{ Math.min(currentPage * limit, stats?.totalCases || 0) }}</span> dari total data (Filter tidak mempengaruhi pagination backend)
        </p>
        <div v-if="totalPages > 1" class="flex gap-2">
          <button v-for="p in totalPages" :key="p" @click="changePage(p)"
            class="w-8 h-8 rounded text-sm font-medium transition-colors"
            :class="p === currentPage ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'">
            {{ p }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import counselingCaseService from '@/services/api/counselingCase.service'
import { useToast } from '@/composables/useToast'

const { error: showError } = useToast()
const items = ref([])
const stats = ref(null)
const loading = ref(false)
const currentPage = ref(1)
const limit = ref(20)
const totalPages = ref(1)
const currentFilter = ref('pending_follow_up') // all, pending_follow_up, no_session, resolved

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Terbuka' },
  { value: 'IN_PROGRESS', label: 'Sedang Diproses' },
  { value: 'RESOLVED', label: 'Selesai' },
  { value: 'CLOSED', label: 'Ditutup' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
]

const formatStatus = (val) => STATUS_OPTIONS.find(s => s.value === val)?.label || val || '-'
const getStatusBadge = (v) => ({ OPEN: 'bg-red-100 text-red-700', IN_PROGRESS: 'bg-amber-100 text-amber-700', RESOLVED: 'bg-green-100 text-green-700', CLOSED: 'bg-gray-100 text-gray-700', CANCELLED: 'bg-slate-100 text-slate-500' }[v] || 'bg-gray-100 text-gray-700')
const formatDateTime = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

const fetchFollowups = async () => {
  loading.value = true
  try {
    const res = await counselingCaseService.getFollowups({ page: currentPage.value, limit: limit.value })
    if (res.success) {
      items.value = res.data.followups
      stats.value = res.data.stats
      totalPages.value = res.data.totalPages
    }
  } catch (e) {
    showError('Gagal memuat data pantauan')
  } finally {
    loading.value = false
  }
}

const processedItems = computed(() => {
  return items.value
    .map(c => ({
      ...c,
      latest_session: c.sessions?.[0] || null
    }))
    .filter(c => {
      if (currentFilter.value === 'all') return true;
      if (currentFilter.value === 'resolved') return ['RESOLVED', 'CLOSED'].includes(c.status);
      
      const isResolved = ['RESOLVED', 'CLOSED'].includes(c.status);
      if (isResolved) return false;

      if (currentFilter.value === 'no_session') return !c.latest_session;
      if (currentFilter.value === 'pending_follow_up') return c.latest_session?.next_plan;
      return true;
    })
})

const setFilter = (filter) => {
  currentFilter.value = filter
}

const changePage = (p) => {
  currentPage.value = p
  fetchFollowups()
}

onMounted(fetchFollowups)
</script>
