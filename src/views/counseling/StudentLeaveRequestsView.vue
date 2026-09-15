<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Perijinan Siswa</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola data permohonan ijin dan sakit siswa.</p>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <button @click="openCreateModal" class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Ijin
        </button>
        <a href="/kiosk/leave-request" target="_blank" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl shadow-sm transition-all">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Buka Kiosk
        </a>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <select v-model="filters.status" @change="applyFilters" class="col-span-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
        <select v-model="filters.leave_type" @change="applyFilters" class="col-span-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
          <option value="">Semua Jenis</option>
          <option v-for="t in LEAVE_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
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
      @page-change="handlePageChange"
    >
      <template #cell-student="{ item }">
        <div>
          <span class="font-medium text-gray-900">{{ item.student?.full_name || '-' }}</span>
          <span class="block text-xs text-gray-500">NIS: {{ item.student?.nis || '-' }}</span>
        </div>
      </template>

      <template #cell-class="{ item }">
        <span class="text-sm text-gray-600">{{ item.student?.class_history?.[0]?.class_info?.name || '-' }}</span>
      </template>

      <template #cell-leave_type="{ item }">
        <span class="text-sm font-medium text-gray-800">{{ formatLeaveType(item.leave_type) }}</span>
      </template>

      <template #cell-date_range="{ item }">
        <div class="text-sm">
          <span class="text-gray-800">{{ formatDate(item.start_date) }}</span>
          <span v-if="item.start_date !== item.end_date" class="text-gray-500"> s/d </span>
          <span v-if="item.start_date !== item.end_date" class="text-gray-800">{{ formatDate(item.end_date) }}</span>
        </div>
      </template>

      <template #cell-status="{ item }">
        <span class="px-2 py-1 rounded-full text-xs font-semibold" :class="getStatusBadge(item.status)">{{ formatStatus(item.status) }}</span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center gap-1.5 justify-end">
          <template v-if="item.status === 'pending'">
            <!-- Approve -->
            <button v-if="hasPermission('counseling.leave_requests.approve')" @click="confirmActionDirect('approved', item)"
              class="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Setujui">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            </button>
            <!-- Reject -->
            <button v-if="hasPermission('counseling.leave_requests.approve')" @click="confirmActionDirect('rejected', item)"
              class="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors" title="Tolak">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </template>

          <template v-if="item.status === 'approved'">
            <!-- Print PDF -->
            <button @click="generatePdf(item)" title="Cetak PDF" :disabled="currentPdfItem === item.id" class="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40">
              <svg v-if="currentPdfItem === item.id" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2v4h10z"/></svg>
            </button>
          </template>

          <!-- View Detail -->
          <button @click="openDetailModal(item)"
            class="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Lihat Detail">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
          
          <template v-if="item.status === 'pending'">
            <!-- Delete -->
            <button v-if="hasPermission('counseling.leave_requests.delete')" @click="confirmDelete(item)"
              class="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors" title="Hapus">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </template>
        </div>
      </template>
    </BaseTable>

    <!-- Delete Confirmation Modal -->
    <BaseModal v-model="showDeleteModal" title="Hapus Pengajuan" maxWidth="sm">
      <div class="p-2">
        <p class="text-sm text-gray-600">Apakah Anda yakin ingin menghapus pengajuan ini? Data yang dihapus tidak dapat dikembalikan.</p>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showDeleteModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="executeDelete" :loading="isDeleting" class="bg-red-600 hover:bg-red-700 text-white border-transparent">Ya, Hapus</BaseButton>
      </template>
    </BaseModal>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetailModal" title="Detail Perijinan" maxWidth="3xl">
      <div v-if="loadingDetail" class="flex justify-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
      <div v-else-if="detailItem" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <p class="text-xs text-gray-500 mb-1">Informasi Siswa</p>
              <p class="font-medium text-gray-900">{{ detailItem.student?.full_name || '-' }}</p>
              <p class="text-sm text-gray-600">NIS: {{ detailItem.student?.nis || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">Jenis Perijinan</p>
              <p class="font-medium text-gray-900">{{ formatLeaveType(detailItem.leave_type) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">Tanggal</p>
              <p class="font-medium text-gray-900">{{ formatDate(detailItem.start_date) }} <span v-if="detailItem.start_date !== detailItem.end_date">s/d {{ formatDate(detailItem.end_date) }}</span></p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">Alasan</p>
              <p class="text-sm text-gray-800 whitespace-pre-wrap">{{ detailItem.reason }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">Status</p>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold" :class="getStatusBadge(detailItem.status)">
                {{ formatStatus(detailItem.status) }}
              </span>
            </div>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-2">Bukti Lampiran</p>
            <div v-if="detailItem.attachment" class="mt-2">
              <div v-if="isImage(detailItem.attachment)" class="rounded-lg overflow-hidden border border-gray-200">
                <img :src="getAssetUrl(detailItem.attachment)" alt="Lampiran" class="w-full h-auto cursor-pointer object-cover max-h-64" @click="openImage(getAssetUrl(detailItem.attachment))" />
              </div>
              <div v-else>
                <a :href="getAssetUrl(detailItem.attachment)" target="_blank" class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                  Lihat Dokumen
                </a>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 italic">
              Tidak ada lampiran.
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex flex-col sm:flex-row justify-between w-full gap-3">
          <div class="flex gap-2">
            <template v-if="detailItem && detailItem.status === 'pending' && hasPermission('counseling.leave_requests.approve')">
              <BaseButton @click="processApproval('approved')" class="bg-green-600 hover:bg-green-700 text-white border-transparent">Setujui</BaseButton>
              <BaseButton @click="processApproval('rejected')" class="bg-red-600 hover:bg-red-700 text-white border-transparent">Tolak</BaseButton>
            </template>
            <BaseButton v-if="detailItem && detailItem.status === 'approved'" @click="generatePdf(detailItem)" variant="outline" class="flex items-center border-blue-200 text-blue-600 hover:bg-blue-50" :disabled="currentPdfItem === detailItem.id">
              <svg v-if="currentPdfItem === detailItem.id" class="h-4 w-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              <svg v-else class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2v4h10z"/></svg>
              Cetak Bukti PDF
            </BaseButton>
          </div>
          <BaseButton variant="outline" @click="showDetailModal = false">Tutup</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Action Confirmation Modal -->
    <BaseModal v-model="showActionModal" :title="actionType === 'approved' ? 'Setujui Pengajuan' : 'Tolak Pengajuan'" maxWidth="sm">
      <div class="p-2">
        <p class="text-sm text-gray-600">Apakah Anda yakin ingin {{ actionType === 'approved' ? 'menyetujui' : 'menolak' }} pengajuan ini?</p>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showActionModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="executeAction" :loading="isProcessingAction" :class="actionType === 'approved' ? 'bg-green-600 hover:bg-green-700 text-white border-transparent' : 'bg-red-600 hover:bg-red-700 text-white border-transparent'">Ya, Lanjutkan</BaseButton>
      </template>
    </BaseModal>

    <!-- Create/Edit Form Modal -->
    <BaseModal v-model="showFormModal" :title="isEdit ? 'Edit Perijinan' : 'Tambah Perijinan'" maxWidth="md">
      <form @submit.prevent="submitForm" class="space-y-4 p-2">
        <div v-if="!isEdit">
          <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Siswa <span class="text-red-500">*</span></label>
          <BaseSearchSelect
            v-model="form.student_id"
            placeholder="Cari nama atau NIS siswa..."
            :fetch-options="fetchStudentOptions"
            required
          />
        </div>
        <div v-else>
          <label class="block text-sm font-medium text-gray-700 mb-1">Siswa</label>
          <input type="text" :value="form.student_name" disabled class="block w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 cursor-not-allowed" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Perijinan <span class="text-red-500">*</span></label>
          <select v-model="form.leave_type" required class="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
            <option value="" disabled>Pilih Jenis</option>
            <option v-for="t in LEAVE_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mulai <span class="text-red-500">*</span></label>
            <input type="date" v-model="form.start_date" required class="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Selesai <span class="text-red-500">*</span></label>
            <input type="date" v-model="form.end_date" :min="form.start_date" required class="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Alasan <span class="text-red-500">*</span></label>
          <textarea v-model="form.reason" rows="3" required class="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Lampiran {{ isEdit ? '' : '(Wajib)' }}</label>
          <input type="file" @change="handleFileUpload" accept=".jpg,.jpeg,.png,.pdf" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          <p v-if="isEdit && existingAttachment && !selectedFile" class="mt-1 text-xs text-gray-500">
            Ada lampiran tersimpan. Upload baru untuk mengganti.
          </p>
        </div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showFormModal = false" class="mr-3" :disabled="saving">Batal</BaseButton>
        <BaseButton @click="submitForm" :loading="saving">Simpan Data</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseSearchSelect from '@/components/forms/BaseSearchSelect.vue'
import studentLeaveRequestService from '@/services/api/studentLeaveRequest.service'
import schoolProfileService from '@/services/api/schoolProfile.service'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { success, error: showError } = useToast()
const authStore = useAuthStore()

const hasPermission = (perm) => authStore.hasPermission(perm) || true // Simplified for demo, replace with actual check

// --- Constants ---
const LEAVE_TYPES = [
  { value: 'sakit', label: 'Sakit' },
  { value: 'izin', label: 'Izin' },
  { value: 'keperluan_keluarga', label: 'Keperluan Keluarga' },
  { value: 'keperluan_sekolah', label: 'Keperluan Sekolah' },
  { value: 'lainnya', label: 'Lainnya' },
]

// --- State ---
const items = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const limit = ref(10)

const filters = reactive({ status: '', leave_type: '', date_from: '', date_to: '' })
const hasActiveFilters = computed(() => Object.values(filters).some(v => v !== ''))

const columns = [
  { key: 'student', label: 'Siswa' },
  { key: 'class', label: 'Kelas' },
  { key: 'leave_type', label: 'Jenis' },
  { key: 'date_range', label: 'Tanggal' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Aksi', class: 'w-28 text-right' },
]

// --- Formatters ---
const formatLeaveType = (val) => LEAVE_TYPES.find(t => t.value === val)?.label || val
const formatStatus = (val) => {
    if (val === 'approved') return 'Disetujui'
    if (val === 'rejected') return 'Ditolak'
    return 'Pending'
}
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
const getStatusBadge = (v) => ({ pending: 'bg-amber-100 text-amber-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' }[v] || 'bg-gray-100 text-gray-700')

// --- Data fetching ---
const fetchData = async () => {
  loading.value = true
  try {
    const r = await studentLeaveRequestService.getAll({
      page: currentPage.value,
      limit: limit.value,
      ...filters,
    })
    if (r.data?.success || r.success) {
      const dataObj = r.data?.data || r.data
      items.value = dataObj.studentLeaveRequests || []
      total.value = dataObj.totalItems || 0
    }
  } catch (e) {
    showError('Gagal mengambil data perijinan')
  } finally {
    loading.value = false
  }
}

// --- Handlers ---
const handlePageChange = (p) => { currentPage.value = p; fetchData() }
const applyFilters = () => { currentPage.value = 1; fetchData() }
const clearFilters = () => { Object.assign(filters, { status: '', leave_type: '', date_from: '', date_to: '' }); applyFilters() }

const showDeleteModal = ref(false)
const itemToDelete = ref(null)
const isDeleting = ref(false)

const confirmDelete = (item) => {
  itemToDelete.value = item
  showDeleteModal.value = true
}

const executeDelete = async () => {
  if (!itemToDelete.value) return
  isDeleting.value = true
  try {
    await studentLeaveRequestService.delete(itemToDelete.value.id)
    success('Pengajuan berhasil dihapus')
    showDeleteModal.value = false
    fetchData()
  } catch (e) {
    showError(e.response?.data?.message || 'Gagal menghapus pengajuan')
  } finally {
    isDeleting.value = false
    itemToDelete.value = null
  }
}
// --- Detail & Action Logic ---
const showDetailModal = ref(false)
const detailItem = ref(null)
const loadingDetail = ref(false)

const openDetailModal = async (item) => {
  showDetailModal.value = true
  loadingDetail.value = true
  detailItem.value = null
  try {
    const r = await studentLeaveRequestService.getById(item.id)
    detailItem.value = r.data?.data || r.data
  } catch (e) {
    showError('Gagal memuat detail perijinan')
    showDetailModal.value = false
  } finally {
    loadingDetail.value = false
  }
}

const showActionModal = ref(false)
const actionType = ref('')
const isProcessingAction = ref(false)

const confirmActionDirect = (status, item) => {
  detailItem.value = item
  processApproval(status)
}

const processApproval = (status) => {
  actionType.value = status
  showActionModal.value = true
}

const executeAction = async () => {
  isProcessingAction.value = true
  try {
    if (actionType.value === 'approved') {
      await studentLeaveRequestService.approve(detailItem.value.id)
      success('Pengajuan berhasil disetujui')
    } else {
      await studentLeaveRequestService.reject(detailItem.value.id)
      success('Pengajuan berhasil ditolak')
    }
    showActionModal.value = false
    // Refresh detail & list
    if (showDetailModal.value) {
      const r = await studentLeaveRequestService.getById(detailItem.value.id)
      detailItem.value = r.data?.data || r.data
    }
    fetchData()
  } catch (e) {
    showError(e.response?.data?.message || 'Gagal memproses pengajuan')
  } finally {
    isProcessingAction.value = false
  }
}

// --- PDF & Profile State ---
const currentPdfItem = ref(null)
const schoolProfile = ref(null)

const loadSchoolProfile = async () => {
  try {
    const r = await schoolProfileService.get()
    if (r?.data) schoolProfile.value = r.data
  } catch (e) {}
}

let _headerImgCache = null
const loadHeaderImage = async () => {
  if (_headerImgCache) return _headerImgCache
  try {
    const apiUrl = import.meta.env.VITE_API_URL || '/api'
    const base = apiUrl.replace(/\/$/, '')
    const imgUrl = `${base}/public/header.png`
    
    const resp = await fetch(imgUrl)
    if (!resp.ok) return null
    const blob = await resp.blob()
    
    if (!blob.type.startsWith('image/')) return null
    
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => { _headerImgCache = reader.result; resolve(reader.result) }
      reader.readAsDataURL(blob)
    })
  } catch { return null }
}

const generatePdf = async (item) => {
  currentPdfItem.value = item.id
  try {
    // Fetch full detail
    const r = await studentLeaveRequestService.getById(item.id)
    const d = r?.data?.data || r?.data || item

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.width
    const margin = 22.6

    // ── Kop Surat ─────────────────────────────────────────────────────────
    const headerImg = await loadHeaderImage()
    let startY = 10

    if (headerImg) {
      const contentW = pageW - margin * 2
      doc.addImage(headerImg, 'PNG', margin, 0, contentW, 0)
      startY = 28
    } else {
      const sp = schoolProfile.value
      const schoolName = sp?.school_name || 'SEKOLAH'
      const schoolAddress = sp?.address || ''
      const schoolPhone = sp?.phone || ''
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(17, 24, 39)
      doc.text(schoolName.toUpperCase(), pageW / 2, 14, { align: 'center' })
      if (schoolAddress) {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(75, 85, 99)
        const addrLine = schoolPhone ? `${schoolAddress}  |  Telp. ${schoolPhone}` : schoolAddress
        doc.text(addrLine, pageW / 2, 20, { align: 'center' })
      }
      startY = 26
    }

    // ── Document Title ────────────────────────────────────────────────────
    const titleY = startY + 20
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(17, 24, 39)
    doc.text('BUKTI PERIJINAN SISWA', pageW / 2, titleY, { align: 'center' })

    const noSurat = `No. ${String(d.id).padStart(4, '0')}/${new Date(d.start_date || d.created_at || new Date()).getFullYear()}`
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(75, 85, 99)
    doc.text(noSurat, pageW / 2, titleY + 6, { align: 'center' })

    // ── Info Section ──────────────────────────────────────────────────────
    const tableBody = [
      ['Nama Siswa', d.student?.full_name || '-'],
      ['NIS / NISN', `${d.student?.nis || '-'} / ${d.student?.nisn || '-'}`],
      ['Kelas', d.student?.class_history?.[0]?.class_info?.name || '-'],
      ['Jenis Perijinan', formatLeaveType(d.leave_type)],
      ['Tanggal Mulai', formatDate(d.start_date)],
      ['Tanggal Selesai', formatDate(d.end_date)],
      ['Alasan', d.reason || '-'],
      ['Status Pengajuan', formatStatus(d.status).toUpperCase()],
    ]

    autoTable(doc, {
      body: tableBody,
      startY: titleY + 13,
      theme: 'plain',
      styles: { font: 'helvetica', fontSize: 10, valign: 'top', cellPadding: { top: 2, bottom: 2, left: 2, right: 2 }, textColor: [31, 41, 55] },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: 'bold', textColor: [55, 65, 81] },
        1: { cellWidth: 'auto' }
      },
      didDrawRow: function (data) {
        if (data.section === 'body') {
          const x = data.row.cells[0].x + data.row.cells[0].width
          const y = data.row.cells[0].y + data.row.cells[0].height / 2 + 1
          doc.setTextColor(55, 65, 81)
          doc.setFontSize(10)
          doc.text(':', x - 3, y)
        }
      }
    })

    const afterY = doc.lastAutoTable.finalY + 15
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(31, 41, 55)
    
    // Add text explaining it is an official leave proof
    const textLines = doc.splitTextToSize(
      `Demikian surat bukti perijinan ini dicetak secara otomatis oleh sistem, untuk dapat dipergunakan sebagaimana mestinya. Siswa yang bersangkutan dinyatakan sah meninggalkan kegiatan belajar mengajar pada tanggal tersebut di atas.`,
      pageW - margin * 2
    )
    doc.text(textLines, margin, afterY)

    // ── Verification QR ──────────────────────────────
    const signY = afterY + textLines.length * 5 + 10

    const verifyUrl = `${window.location.origin}/verify?type=leave&id=${d.id}`
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, scale: 5 })
    
    const qrSize = 25
    const rightEdge = pageW - margin
    
    doc.addImage(qrDataUrl, 'PNG', rightEdge - qrSize, signY, qrSize, qrSize)
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(75, 85, 99)
    doc.text('Tertanda tangani dan terverifikasi secara elektronik', rightEdge, signY + qrSize + 6, { align: 'right' })
    doc.text('Scan QR Code untuk verifikasi keaslian.', rightEdge, signY + qrSize + 11, { align: 'right' })

    // ── Footer ────────────────────────────────────────────────────────────
    doc.setFontSize(7.5)
    doc.setTextColor(150, 150, 150)
    doc.text(`Dicetak pada: ${formatDate(new Date().toISOString().split('T')[0])}`, margin, 285, { align: 'left' })

    const studentName = (d.student?.full_name || 'siswa').replace(/\s+/g, '_')
    const dateStr = (d.start_date || '').substring(0, 10).replace(/-/g, '')
    doc.save(`Perijinan_${studentName}_${dateStr}.pdf`)

  } catch (e) {
    showError('Gagal membuat PDF: ' + (e.message || ''))
  } finally {
    currentPdfItem.value = null
  }
}

const getAssetUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const baseUrl = import.meta.env.VITE_API_URL || '/api'
  const safeBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const safePath = path.startsWith('/') ? path : `/${path}`
  return `${safeBase}${safePath}`
}

const isImage = (path) => {
  if (!path) return false
  const p = path.toLowerCase()
  return p.endsWith('.jpg') || p.endsWith('.jpeg') || p.endsWith('.png') || p.endsWith('.gif') || p.endsWith('.webp')
}

const openImage = (url) => {
  if (url) window.open(url, '_blank')
}

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    showError('Ukuran file maksimal 5MB')
    e.target.value = ''
    selectedFile.value = null
    return
  }
  selectedFile.value = file
}

const isEdit = ref(false)
const editId = ref(null)
const selectedFile = ref(null)
const existingAttachment = ref(null)
const saving = ref(false)
const showFormModal = ref(false)
const form = reactive({
  student_id: '',
  student_name: '',
  leave_type: '',
  start_date: '',
  end_date: '',
  reason: ''
})

const openCreateModal = () => {
  isEdit.value = false
  editId.value = null
  selectedFile.value = null
  existingAttachment.value = null
  Object.assign(form, {
    student_id: '',
    student_name: '',
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: ''
  })
  showFormModal.value = true
}

const fetchStudentOptions = async (query) => {
  try {
    const res = await studentLeaveRequestService.searchStudentsPublic({ search: query, limit: 10, page: 1 })
    if (res.success && res.data.students) {
      return res.data.students.map(s => ({ value: s.id, label: s.full_name, description: `NIS: ${s.nis}` }))
    }
    return []
  } catch (e) { return [] }
}

const openEditModal = async (item) => {
  isEdit.value = true
  editId.value = item.id
  selectedFile.value = null
  
  try {
    const r = await studentLeaveRequestService.getById(item.id)
    const data = r.data?.data || r.data
    form.student_id = data.student_id
    form.student_name = data.student?.full_name || ''
    form.leave_type = data.leave_type
    
    form.start_date = data.start_date ? data.start_date.substring(0, 10) : ''
    form.end_date = data.end_date ? data.end_date.substring(0, 10) : ''
    form.reason = data.reason
    existingAttachment.value = data.attachment
    
    if (data.status !== 'pending') {
      showError('Hanya data pending yang dapat diedit')
      return
    }
    showFormModal.value = true
  } catch (e) {
    showError('Gagal mengambil detail pengajuan')
  }
}

const submitForm = async () => {
  if (form.start_date > form.end_date) {
    showError('Tanggal selesai tidak valid')
    return
  }
  
  if (!form.student_id || !form.leave_type || !form.start_date || !form.end_date || !form.reason) {
    showError('Mohon isi semua field wajib')
    return
  }

  saving.value = true
  try {
    const formData = new FormData()
    formData.append('student_id', form.student_id)
    formData.append('leave_type', form.leave_type)
    formData.append('start_date', form.start_date)
    formData.append('end_date', form.end_date)
    formData.append('reason', form.reason)
    if (selectedFile.value) {
      formData.append('attachment', selectedFile.value)
    }

    if (isEdit.value) {
      await studentLeaveRequestService.update(editId.value, formData)
      success('Pengajuan berhasil diupdate')
    } else {
      await studentLeaveRequestService.create(formData)
      success('Pengajuan berhasil dibuat')
    }
    showFormModal.value = false
    fetchData()
  } catch (e) {
    showError(e.response?.data?.message || 'Gagal menyimpan pengajuan')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadSchoolProfile()
  fetchData()
})
</script>
