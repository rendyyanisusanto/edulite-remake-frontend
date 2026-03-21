<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Pengajuan Absensi</h1>
      <p class="text-sm text-gray-500 mt-1">Tinjau dan persetujuan pengajuan absensi karyawan.</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <select v-model="filters.request_status" @change="applyFilters" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
          <option value="">Semua Status</option>
          <option value="PENDING">Menunggu</option>
          <option value="APPROVED">Disetujui</option>
          <option value="REJECTED">Ditolak</option>
        </select>
        <select v-model="filters.request_type" @change="applyFilters" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
          <option value="">Semua Tipe</option>
          <option value="CLOCK_IN">Clock In</option>
          <option value="CLOCK_OUT">Clock Out</option>
          <option value="BOTH">Keduanya</option>
          <option value="CORRECTION">Koreksi</option>
        </select>
        <input type="date" v-model="filters.date_from" @change="applyFilters" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"/>
        <input type="date" v-model="filters.date_to" @change="applyFilters" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"/>
      </div>
      <div v-if="hasActiveFilters" class="mt-2 flex justify-end">
        <button @click="clearFilters" class="text-xs text-red-500 hover:text-red-700 font-medium">Hapus Filter</button>
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
          <span class="font-medium text-gray-900 text-sm">{{ item.user?.name || '-' }}</span>
          <span class="block text-xs text-gray-400">{{ item.user?.email }}</span>
        </div>
      </template>
      <template #cell-attendance_date="{ item }">
        <span class="text-sm font-medium">{{ formatDate(item.attendance_date) }}</span>
      </template>
      <template #cell-request_type="{ item }">
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{{ formatType(item.request_type) }}</span>
      </template>
      <template #cell-request_status="{ item }">
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="getStatusBadge(item.request_status)">
          {{ formatStatus(item.request_status) }}
        </span>
      </template>
      <template #cell-created_at="{ item }">
        <span class="text-xs text-gray-500">{{ formatDate(item.created_at) }}</span>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex items-center gap-1.5">
          <button @click="openDetail(item)" class="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Detail">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
          <template v-if="item.request_status === 'PENDING'">
            <button @click="promptAction(item, 'approve')" class="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Setujui">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            </button>
            <button @click="promptAction(item, 'reject')" class="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors" title="Tolak">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </template>
        </div>
      </template>
    </BaseTable>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetail" title="Detail Pengajuan" maxWidth="xl">
      <template v-if="detailItem">
        <div class="space-y-4">
          <!-- Status Bar -->
          <div class="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
            <div>
              <span class="text-sm text-gray-500">Pemohon:</span>
              <span class="ml-2 font-semibold text-gray-800">{{ detailItem.user?.name }}</span>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-semibold" :class="getStatusBadge(detailItem.request_status)">{{ formatStatus(detailItem.request_status) }}</span>
          </div>

          <!-- Side by Side: Original vs Requested -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Original -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Data Absensi Asli</h4>
              <template v-if="detailItem.attendance">
                <dl class="space-y-2 text-sm">
                  <div class="flex justify-between"><dt class="text-gray-500">Clock In</dt><dd class="font-mono font-medium">{{ detailItem.attendance.clock_in_at ? formatTime(detailItem.attendance.clock_in_at) : '—' }}</dd></div>
                  <div class="flex justify-between"><dt class="text-gray-500">Clock Out</dt><dd class="font-mono font-medium">{{ detailItem.attendance.clock_out_at ? formatTime(detailItem.attendance.clock_out_at) : '—' }}</dd></div>
                  <div class="flex justify-between"><dt class="text-gray-500">Status</dt><dd>{{ detailItem.attendance.attendance_status || '—' }}</dd></div>
                </dl>
              </template>
              <p v-else class="text-sm text-gray-400 italic">Belum ada record absensi</p>
            </div>

            <!-- Requested -->
            <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h4 class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Data Pengajuan</h4>
              <dl class="space-y-2 text-sm">
                <div class="flex justify-between"><dt class="text-gray-500">Tipe</dt><dd class="font-semibold text-blue-700">{{ formatType(detailItem.request_type) }}</dd></div>
                <div class="flex justify-between"><dt class="text-gray-500">Tanggal</dt><dd>{{ formatDate(detailItem.attendance_date) }}</dd></div>
                <div v-if="detailItem.requested_clock_in_at" class="flex justify-between"><dt class="text-gray-500">Clock In</dt><dd class="font-mono font-medium text-blue-700">{{ formatTime(detailItem.requested_clock_in_at) }}</dd></div>
                <div v-if="detailItem.requested_clock_out_at" class="flex justify-between"><dt class="text-gray-500">Clock Out</dt><dd class="font-mono font-medium text-blue-700">{{ formatTime(detailItem.requested_clock_out_at) }}</dd></div>
              </dl>
            </div>
          </div>

          <!-- Reason -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-1">Alasan Pengajuan</h4>
            <p class="text-sm bg-gray-50 rounded-lg px-3 py-2 text-gray-700">{{ detailItem.reason }}</p>
          </div>

          <!-- Review info if reviewed -->
          <template v-if="detailItem.request_status !== 'PENDING'">
            <div class="border-t border-gray-100 pt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Catatan Reviewer</h4>
              <p class="text-sm text-gray-600">{{ detailItem.review_note || 'Tidak ada catatan' }}</p>
              <p class="text-xs text-gray-400 mt-1">Oleh: {{ detailItem.reviewer?.name }} · {{ detailItem.reviewed_at ? formatDate(detailItem.reviewed_at) : '' }}</p>
            </div>
          </template>

          <!-- Action buttons if pending -->
          <template v-if="detailItem.request_status === 'PENDING'">
            <div class="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <BaseButton variant="outline" class="border-red-300 text-red-600 hover:bg-red-50" @click="promptAction(detailItem, 'reject'); showDetail = false">Tolak</BaseButton>
              <BaseButton @click="promptAction(detailItem, 'approve'); showDetail = false">Setujui</BaseButton>
            </div>
          </template>
        </div>
      </template>
      <template #footer>
        <BaseButton variant="outline" @click="showDetail = false">Tutup</BaseButton>
      </template>
    </BaseModal>

    <!-- Approve / Reject Confirm Modal -->
    <BaseModal v-model="showAction" :title="actionType === 'approve' ? 'Setujui Pengajuan' : 'Tolak Pengajuan'" maxWidth="md">
      <div class="space-y-3">
        <p class="text-sm text-gray-600">
          <span v-if="actionType === 'approve'">Pengajuan dari <span class="font-semibold">{{ actionTarget?.user?.name }}</span> akan disetujui dan data absensi akan diperbarui secara otomatis.</span>
          <span v-else>Pengajuan dari <span class="font-semibold">{{ actionTarget?.user?.name }}</span> akan ditolak.</span>
        </p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Catatan Reviewer <span v-if="actionType === 'reject'" class="text-red-500">*</span>
          </label>
          <textarea v-model="reviewNote" rows="3" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" :placeholder="actionType === 'approve' ? 'Catatan opsional...' : 'Tulis alasan penolakan...'"></textarea>
        </div>
        <div v-if="actionError" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ actionError }}</div>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showAction = false" class="mr-3">Batal</BaseButton>
        <BaseButton
          :class="actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''"
          @click="submitAction" :loading="actionLoading"
        >{{ actionType === 'approve' ? 'Setujui' : 'Tolak' }}</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import requestService from '@/services/api/attendanceRequest.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()

const columns = [
  { key: 'user', label: 'Karyawan', sortable: false },
  { key: 'attendance_date', label: 'Tanggal', sortable: false },
  { key: 'request_type', label: 'Tipe', sortable: false },
  { key: 'request_status', label: 'Status', sortable: false },
  { key: 'created_at', label: 'Diajukan', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-28 text-right' }
]

const items = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const limit = ref(15)
const search = ref('')

const showDetail = ref(false)
const detailItem = ref(null)
const showAction = ref(false)
const actionTarget = ref(null)
const actionType = ref('approve')
const reviewNote = ref('')
const actionError = ref('')
const actionLoading = ref(false)

const filters = reactive({ request_status: 'PENDING', request_type: '', date_from: '', date_to: '' })
const hasActiveFilters = computed(() => filters.request_type || filters.date_from || filters.date_to || filters.request_status !== 'PENDING')

const getStatusBadge = (v) => ({ PENDING: 'bg-amber-100 text-amber-700', APPROVED: 'bg-green-100 text-green-700', REJECTED: 'bg-red-100 text-red-700' }[v] || 'bg-gray-100 text-gray-600')
const formatStatus = (v) => ({ PENDING: 'Menunggu', APPROVED: 'Disetujui', REJECTED: 'Ditolak' }[v] || v)
const formatType = (v) => ({ CLOCK_IN: 'Clock In', CLOCK_OUT: 'Clock Out', BOTH: 'Keduanya', CORRECTION: 'Koreksi' }[v] || v)
const formatTime = (d) => d ? new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

const fetchData = async () => {
  loading.value = true
  try {
    const r = await requestService.getAll({ ...filters, page: currentPage.value, limit: limit.value, search: search.value })
    if (r.success) { items.value = r.data.requests; total.value = r.data.totalItems }
  } catch (e) { showError('Gagal mengambil data pengajuan') } finally { loading.value = false }
}

let st
const handleSearch = (v) => { search.value = v; clearTimeout(st); st = setTimeout(() => { currentPage.value = 1; fetchData() }, 400) }
const handlePageChange = (p) => { currentPage.value = p; fetchData() }
const applyFilters = () => { currentPage.value = 1; fetchData() }
const clearFilters = () => { Object.assign(filters, { request_status: 'PENDING', request_type: '', date_from: '', date_to: '' }); applyFilters() }

const openDetail = (item) => { detailItem.value = item; showDetail.value = true }

const promptAction = (item, type) => {
  actionTarget.value = item
  actionType.value = type
  reviewNote.value = ''
  actionError.value = ''
  showAction.value = true
}

const submitAction = async () => {
  actionError.value = ''
  if (actionType.value === 'reject' && !reviewNote.value.trim()) {
    return (actionError.value = 'Catatan wajib diisi untuk penolakan')
  }
  actionLoading.value = true
  try {
    if (actionType.value === 'approve') {
      await requestService.approve(actionTarget.value.id, { review_note: reviewNote.value })
      success('Pengajuan berhasil disetujui')
    } else {
      await requestService.reject(actionTarget.value.id, { review_note: reviewNote.value })
      success('Pengajuan berhasil ditolak')
    }
    showAction.value = false
    fetchData()
  } catch (e) { actionError.value = e?.message || 'Terjadi kesalahan' } finally { actionLoading.value = false }
}

onMounted(fetchData)
</script>


