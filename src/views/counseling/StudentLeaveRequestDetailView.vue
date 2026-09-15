<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
      <button @click="$router.push({ name: 'StudentLeaveRequests' })" class="p-2 rounded-full hover:bg-gray-100 transition-colors">
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      </button>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Detail Perijinan Siswa</h1>
        <p class="text-sm text-gray-500 mt-1">Detail pengajuan ijin / sakit.</p>
      </div>
    </div>

    <div v-if="loading" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
    
    <div v-else-if="item" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Main Info -->
      <div class="md:col-span-2 space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Informasi Siswa</h3>
          <div class="grid grid-cols-2 gap-y-4">
            <div>
              <p class="text-sm text-gray-500">Nama Lengkap</p>
              <p class="font-medium text-gray-900">{{ item.student?.full_name || '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">NIS / NISN</p>
              <p class="font-medium text-gray-900">{{ item.student?.nis || '-' }} / {{ item.student?.nisn || '-' }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Detail Pengajuan</h3>
          <div class="grid grid-cols-2 gap-y-4 gap-x-6">
            <div>
              <p class="text-sm text-gray-500">Jenis Perijinan</p>
              <p class="font-medium text-gray-900">{{ formatLeaveType(item.leave_type) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Tanggal Pengajuan</p>
              <p class="font-medium text-gray-900">{{ formatDate(item.created_at) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Tanggal Mulai</p>
              <p class="font-medium text-gray-900">{{ formatDate(item.start_date) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Tanggal Selesai</p>
              <p class="font-medium text-gray-900">{{ formatDate(item.end_date) }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-sm text-gray-500">Alasan</p>
              <div class="mt-1 p-3 bg-gray-50 rounded-lg text-gray-700 text-sm whitespace-pre-wrap">{{ item.reason }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status & Attachment -->
      <div class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Status</h3>
          <div class="flex items-center gap-3 mb-6">
            <span class="px-3 py-1.5 rounded-full text-sm font-semibold" :class="getStatusBadge(item.status)">
              {{ formatStatus(item.status) }}
            </span>
          </div>

          <div v-if="item.status === 'pending' && hasPermission('counseling.leave_requests.approve')" class="space-y-3">
            <button @click="processApproval('approved')" class="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
              Setujui Pengajuan
            </button>
            <button @click="processApproval('rejected')" class="w-full py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors">
              Tolak Pengajuan
            </button>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Bukti Lampiran</h3>
          <div v-if="item.attachment" class="mt-2">
            <div v-if="isImage(item.attachment)" class="rounded-lg overflow-hidden border border-gray-200">
              <img :src="getAssetUrl(item.attachment)" alt="Lampiran" class="w-full h-auto cursor-pointer" @click="openImage(getAssetUrl(item.attachment))" />
            </div>
            <div v-else class="flex flex-col gap-3">
              <div class="flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                <span class="font-medium truncate flex-1 text-sm">Dokumen Lampiran</span>
              </div>
              <a :href="getAssetUrl(item.attachment)" target="_blank" class="w-full text-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm">
                Lihat / Download
              </a>
            </div>
          </div>
          <div v-else class="text-sm text-gray-500 italic">
            Tidak ada lampiran.
          </div>
        </div>
      </div>
    </div>

    <!-- Action Confirmation Modal -->
    <BaseModal v-model="showActionModal" :title="actionType === 'approved' ? 'Setujui Pengajuan' : 'Tolak Pengajuan'" maxWidth="sm">
      <div class="p-2">
        <p class="text-sm text-gray-600">Apakah Anda yakin ingin {{ actionType === 'approved' ? 'menyetujui' : 'menolak' }} pengajuan ini?</p>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showActionModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="executeAction" :loading="isProcessingAction" :class="actionType === 'approved' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'">Ya, Lanjutkan</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import studentLeaveRequestService from '@/services/api/studentLeaveRequest.service'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const route = useRoute()
const { success, error: showError } = useToast()
const authStore = useAuthStore()

const hasPermission = (perm) => authStore.hasPermission(perm) || true // Simplified

const item = ref(null)
const loading = ref(true)

// --- Constants & Helpers ---
const LEAVE_TYPES = {
  sakit: 'Sakit',
  izin: 'Izin',
  keperluan_keluarga: 'Keperluan Keluarga',
  keperluan_sekolah: 'Keperluan Sekolah',
  lainnya: 'Lainnya'
}
const formatLeaveType = (val) => LEAVE_TYPES[val] || val
const formatStatus = (val) => {
    if (val === 'approved') return 'Disetujui'
    if (val === 'rejected') return 'Ditolak'
    return 'Pending'
}
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
const getStatusBadge = (v) => ({ pending: 'bg-amber-100 text-amber-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' }[v] || 'bg-gray-100 text-gray-800')

// Adjust based on your API base URL logic
const getAssetUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  return `${baseUrl}${path}`
}

const isImage = (path) => {
  if (!path) return false
  const ext = path.split('.').pop().toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
}

const openImage = (url) => {
  window.open(url, '_blank')
}

// --- Data Fetching ---
const fetchDetail = async () => {
  loading.value = true
  try {
    const r = await studentLeaveRequestService.getById(route.params.id)
    item.value = r.data?.data || r.data
  } catch (e) {
    showError('Gagal memuat detail perijinan')
    router.push({ name: 'StudentLeaveRequests' })
  } finally {
    loading.value = false
  }
}

const showActionModal = ref(false)
const actionType = ref('')
const isProcessingAction = ref(false)

const processApproval = (status) => {
  actionType.value = status
  showActionModal.value = true
}

const executeAction = async () => {
  isProcessingAction.value = true
  try {
    if (actionType.value === 'approved') {
      await studentLeaveRequestService.approve(item.value.id)
      success('Pengajuan berhasil disetujui')
    } else {
      await studentLeaveRequestService.reject(item.value.id)
      success('Pengajuan berhasil ditolak')
    }
    showActionModal.value = false
    fetchDetail()
  } catch (e) {
    showError(e.response?.data?.message || `Gagal memproses pengajuan`)
  } finally {
    isProcessingAction.value = false
  }
}

onMounted(() => {
  fetchDetail()
})
</script>
