<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Mutasi Siswa</h1>
        <p class="text-sm text-gray-500 mt-0.5">Kelola proses mutasi masuk/keluar siswa secara lengkap</p>
      </div>
      <div class="flex gap-2">
        <BaseButton variant="outline" @click="loadReport">Refresh Laporan</BaseButton>
        <BaseButton @click="openCreateModal">+ Buat Mutasi</BaseButton>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Jenis Mutasi</label>
          <select v-model="filters.mutation_type" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm" @change="handleFilterChange">
            <option value="">Semua</option>
            <option value="IN">Masuk</option>
            <option value="OUT">Keluar</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select v-model="filters.status" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm" @change="handleFilterChange">
            <option value="">Semua</option>
            <option v-for="status in mutationStatuses" :key="status" :value="status">{{ status }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Tanggal Mutasi Dari</label>
          <input v-model="filters.mutation_date_from" type="date" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm" @change="handleFilterChange" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Tanggal Mutasi Sampai</label>
          <input v-model="filters.mutation_date_to" type="date" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm" @change="handleFilterChange" />
        </div>
      </div>
      <div class="mt-3 flex justify-end">
        <button class="text-xs text-red-500 hover:text-red-700 font-medium" @click="resetFilters">Reset Filter</button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <div class="bg-white border border-gray-100 rounded-xl p-4">
        <p class="text-xs text-gray-500">Total Mutasi</p>
        <p class="text-2xl font-bold text-gray-800">{{ reportSummary.total_mutations }}</p>
      </div>
      <div class="bg-white border border-gray-100 rounded-xl p-4">
        <p class="text-xs text-gray-500">Mutasi Masuk</p>
        <p class="text-2xl font-bold text-emerald-700">{{ reportSummary.total_mutation_in }}</p>
      </div>
      <div class="bg-white border border-gray-100 rounded-xl p-4">
        <p class="text-xs text-gray-500">Mutasi Keluar</p>
        <p class="text-2xl font-bold text-amber-700">{{ reportSummary.total_mutation_out }}</p>
      </div>
      <div class="bg-white border border-gray-100 rounded-xl p-4">
        <p class="text-xs text-gray-500">Approved</p>
        <p class="text-2xl font-bold text-blue-700">{{ reportSummary.total_approved }}</p>
      </div>
      <div class="bg-white border border-gray-100 rounded-xl p-4">
        <p class="text-xs text-gray-500">Completed</p>
        <p class="text-2xl font-bold text-purple-700">{{ reportSummary.total_completed }}</p>
      </div>
    </div>

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
      <template #cell-student_name="{ item }">
        <div>
          <p class="font-medium text-sm text-gray-800">{{ item.student?.full_name || '-' }}</p>
          <p class="text-xs text-gray-400">NIS: {{ item.student?.nis || '-' }} | NISN: {{ item.student?.nisn || '-' }}</p>
        </div>
      </template>
      <template #cell-mutation_type="{ item }">
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" :class="item.mutation_type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
          {{ item.mutation_type }}
        </span>
      </template>
      <template #cell-origin_destination="{ item }">
        <p class="text-xs text-gray-700">Asal: {{ item.origin_school || '-' }}</p>
        <p class="text-xs text-gray-700">Tujuan: {{ item.destination_school || '-' }}</p>
      </template>
      <template #cell-status="{ item }">
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" :class="statusBadgeClass(item.status)">
          {{ item.status }}
        </span>
      </template>
      <template #cell-document_file="{ item }">
        <a v-if="item.document_file" :href="item.document_file" target="_blank" class="text-xs text-blue-600 hover:underline">Lihat Dokumen</a>
        <span v-else class="text-xs text-gray-400">-</span>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex items-center gap-1 justify-end">
          <button @click="openDetailModal(item)" class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Detail">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7"/></svg>
          </button>
          <button v-if="item.status === 'DRAFT'" @click="openEditModal(item)" class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Edit">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button v-if="item.status === 'DRAFT'" @click="openActionModal('submit', item)" class="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Submit">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </button>
          <button v-if="item.status === 'SUBMITTED'" @click="openActionModal('approve', item)" class="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Approve">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          </button>
          <button v-if="item.status === 'SUBMITTED'" @click="openActionModal('reject', item)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Reject">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <button v-if="item.status === 'APPROVED'" @click="openActionModal('complete', item)" class="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg" title="Complete">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </button>
          <button v-if="['DRAFT','SUBMITTED'].includes(item.status)" @click="openActionModal('cancel', item)" class="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg" title="Cancel">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"/></svg>
          </button>
          <button v-if="['APPROVED','COMPLETED'].includes(item.status)" @click="printMutation(item.id)" class="p-1.5 text-gray-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg" title="Print">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z"/></svg>
          </button>
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="showFormModal" :title="isEditing ? 'Edit Mutasi Siswa' : 'Buat Mutasi Siswa'" maxWidth="3xl">
      <form @submit.prevent="saveMutation" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <BaseSearchSelect
              v-model="form.student_id"
              label="Siswa"
              :required="true"
              :initialLabel="studentSearchLabel"
              placeholder="Ketik nama siswa atau NIS..."
              :fetchOptions="fetchStudentOptions"
              @change="onStudentChange"
            />
            <p class="text-xs text-gray-500 mt-1">Hanya siswa dengan status ACTIVE yang disarankan untuk mutasi baru.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Mutasi <span class="text-red-500">*</span></label>
            <select v-model="form.mutation_type" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm">
              <option value="">Pilih Jenis</option>
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kategori Mutasi <span class="text-red-500">*</span></label>
            <select v-model="form.mutation_category" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm">
              <option value="">Pilih Kategori</option>
              <option v-for="category in mutationCategories" :key="category" :value="category">{{ category }}</option>
            </select>
          </div>
          <BaseInput id="mutation_date" v-model="form.mutation_date" type="date" label="Tanggal Mutasi" required />
          <BaseInput id="effective_date" v-model="form.effective_date" type="date" label="Tanggal Efektif" required />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
            <select v-model="form.academic_year_id" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm">
              <option value="">Pilih Tahun Ajaran</option>
              <option v-for="year in academicYearOptions" :key="year.id" :value="year.id">
                {{ year.name }}{{ year.is_active ? ' (Aktif)' : '' }}
              </option>
            </select>
          </div>
          <BaseInput id="document_number" v-model="form.document_number" label="Nomor Dokumen" placeholder="Opsional" />

          <BaseInput v-if="form.mutation_type === 'IN'" id="origin_school" v-model="form.origin_school" label="Sekolah Asal" placeholder="Wajib untuk mutasi masuk" />
          <BaseInput v-if="form.mutation_type !== 'IN'" id="origin_school_optional" v-model="form.origin_school" label="Sekolah Asal" placeholder="Opsional" />

          <BaseInput v-if="form.mutation_type === 'OUT'" id="destination_school" v-model="form.destination_school" label="Sekolah Tujuan" placeholder="Disarankan untuk mutasi keluar" />
          <BaseInput v-if="form.mutation_type !== 'OUT'" id="destination_school_optional" v-model="form.destination_school" label="Sekolah Tujuan" placeholder="Opsional" />

          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Alasan <span class="text-red-500">*</span></label>
            <textarea v-model="form.reason" rows="2" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm" placeholder="Alasan mutasi"></textarea>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea v-model="form.description" rows="2" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm" placeholder="Deskripsi tambahan"></textarea>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
            <textarea v-model="form.notes" rows="2" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm" placeholder="Catatan internal"></textarea>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Dokumen Pendukung</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" @change="onFileSelected" class="block w-full text-sm text-gray-700" />
            <p v-if="form.document_file_name" class="text-xs text-gray-500 mt-1">File dipilih: {{ form.document_file_name }}</p>
            <a v-if="isEditing && form.document_file" :href="form.document_file" target="_blank" class="text-xs text-blue-600 hover:underline">Lihat dokumen saat ini</a>
          </div>
        </div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showFormModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="saveMutation" :loading="saving">{{ isEditing ? 'Simpan Perubahan' : 'Buat Mutasi' }}</BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="showDetailModal" title="Detail Mutasi Siswa" maxWidth="3xl">
      <div v-if="detailItem" class="space-y-4 text-sm">
        <div class="flex items-center justify-between">
          <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold" :class="statusBadgeClass(detailItem.status)">{{ detailItem.status }}</span>
          <button v-if="['APPROVED','COMPLETED'].includes(detailItem.status)" @click="printMutation(detailItem.id)" class="text-xs text-blue-600 hover:underline">Print PDF</button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div><span class="text-gray-500">Siswa:</span> <span class="font-medium">{{ detailItem.student?.full_name || '-' }}</span></div>
          <div><span class="text-gray-500">NIS/NISN:</span> <span class="font-medium">{{ detailItem.student?.nis || '-' }} / {{ detailItem.student?.nisn || '-' }}</span></div>
          <div><span class="text-gray-500">Jenis:</span> <span class="font-medium">{{ detailItem.mutation_type }}</span></div>
          <div><span class="text-gray-500">Kategori:</span> <span class="font-medium">{{ detailItem.mutation_category }}</span></div>
          <div><span class="text-gray-500">Tanggal Mutasi:</span> <span class="font-medium">{{ formatDate(detailItem.mutation_date) }}</span></div>
          <div><span class="text-gray-500">Tanggal Efektif:</span> <span class="font-medium">{{ formatDate(detailItem.effective_date) }}</span></div>
          <div><span class="text-gray-500">Sekolah Asal:</span> <span class="font-medium">{{ detailItem.origin_school || '-' }}</span></div>
          <div><span class="text-gray-500">Sekolah Tujuan:</span> <span class="font-medium">{{ detailItem.destination_school || '-' }}</span></div>
          <div class="sm:col-span-2"><span class="text-gray-500">Alasan:</span> <span class="font-medium">{{ detailItem.reason || '-' }}</span></div>
          <div class="sm:col-span-2"><span class="text-gray-500">Deskripsi:</span> <span class="font-medium">{{ detailItem.description || '-' }}</span></div>
          <div class="sm:col-span-2"><span class="text-gray-500">Catatan:</span> <span class="font-medium">{{ detailItem.notes || '-' }}</span></div>
        </div>

        <div v-if="detailItem.document_file">
          <a :href="detailItem.document_file" target="_blank" class="text-blue-600 hover:underline">Buka Dokumen Pendukung</a>
        </div>

        <div>
          <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Riwayat Aktivitas</p>
          <div v-if="!detailItem.logs || detailItem.logs.length === 0" class="text-xs text-gray-500">Belum ada log.</div>
          <div v-else class="space-y-2 max-h-52 overflow-y-auto">
            <div v-for="log in detailItem.logs" :key="log.id" class="rounded border border-gray-200 px-3 py-2">
              <p class="text-xs font-semibold text-gray-700">{{ log.action }} - {{ log.actor?.name || '-' }}</p>
              <p class="text-xs text-gray-500">{{ formatDateTime(log.created_at) }}</p>
              <p v-if="log.action_note" class="text-xs text-gray-600 mt-1">{{ log.action_note }}</p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>

    <BaseModal v-model="showActionModal" :title="actionConfig.title" maxWidth="sm">
      <div class="space-y-3">
        <p class="text-sm text-gray-600">{{ actionConfig.message }}</p>
        <div v-if="['reject', 'cancel', 'complete', 'approve', 'submit'].includes(pendingAction)">
          <label class="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
          <textarea v-model="actionNotes" rows="3" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm" placeholder="Catatan aksi"></textarea>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showActionModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton :variant="actionConfig.variant" @click="executeAction" :loading="actionLoading">{{ actionConfig.confirmLabel }}</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseSearchSelect from '@/components/forms/BaseSearchSelect.vue'
import studentMutationService from '@/services/api/studentMutation.service'
import studentService from '@/services/api/student.service'
import { academicYearService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()

const mutationStatuses = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED']
const mutationCategories = ['TRANSFER', 'DROPOUT', 'GRADUATED', 'OTHER']

const items = ref([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const limit = ref(10)
const search = ref('')
const sortBy = ref('created_at')
const sortDesc = ref(true)

const filters = reactive({
  mutation_type: '',
  status: '',
  mutation_date_from: '',
  mutation_date_to: ''
})

const reportSummary = reactive({
  total_mutations: 0,
  total_mutation_in: 0,
  total_mutation_out: 0,
  total_approved: 0,
  total_completed: 0,
  total_rejected: 0
})

const showFormModal = ref(false)
const showDetailModal = ref(false)
const showActionModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const actionLoading = ref(false)
const pendingAction = ref('')
const actionNotes = ref('')
const currentItem = ref(null)
const detailItem = ref(null)

const academicYearOptions = ref([])
const studentSearchLabel = ref('')

const defaultForm = {
  student_id: '',
  academic_year_id: '',
  mutation_type: '',
  mutation_category: '',
  mutation_date: '',
  effective_date: '',
  origin_school: '',
  destination_school: '',
  reason: '',
  description: '',
  document_number: '',
  document_file: '',
  document_file_name: '',
  notes: ''
}

const form = reactive({ ...defaultForm })
const selectedDocumentFile = ref(null)

const columns = [
  { key: 'student_name', label: 'Siswa', sortable: false },
  { key: 'mutation_type', label: 'Jenis', sortable: false },
  { key: 'mutation_category', label: 'Kategori', sortable: false },
  { key: 'mutation_date', label: 'Tgl Mutasi', sortable: false },
  { key: 'effective_date', label: 'Tgl Efektif', sortable: false },
  { key: 'origin_destination', label: 'Asal/Tujuan', sortable: false },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'document_file', label: 'Dokumen', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-52 text-right' }
]

const actionConfig = computed(() => {
  const map = {
    submit: { title: 'Submit Mutasi', message: 'Ajukan mutasi ini untuk proses persetujuan?', confirmLabel: 'Submit', variant: 'primary' },
    approve: { title: 'Approve Mutasi', message: 'Setujui mutasi ini?', confirmLabel: 'Approve', variant: 'primary' },
    reject: { title: 'Reject Mutasi', message: 'Tolak mutasi ini?', confirmLabel: 'Reject', variant: 'danger' },
    complete: { title: 'Complete Mutasi', message: 'Finalisasi mutasi ini? Status siswa akan ikut berubah.', confirmLabel: 'Complete', variant: 'primary' },
    cancel: { title: 'Cancel Mutasi', message: 'Batalkan proses mutasi ini?', confirmLabel: 'Cancel', variant: 'danger' }
  }
  return map[pendingAction.value] || { title: 'Aksi', message: '', confirmLabel: 'Simpan', variant: 'primary' }
})

const buildListParams = () => ({
  page: currentPage.value,
  limit: limit.value,
  search: search.value,
  ...filters,
  sortBy: sortBy.value,
  sortDesc: sortDesc.value
})

const fetchMutations = async () => {
  loading.value = true
  try {
    const response = await studentMutationService.getAll(buildListParams())
    items.value = response.data?.mutations || []
    total.value = response.data?.totalItems || 0
  } catch (error) {
    showError(error.message || 'Gagal memuat data mutasi siswa')
  } finally {
    loading.value = false
  }
}

const loadReport = async () => {
  try {
    const response = await studentMutationService.getReport({ ...filters, search: search.value })
    const summary = response.data?.summary || {}
    Object.assign(reportSummary, {
      total_mutations: summary.total_mutations || 0,
      total_mutation_in: summary.total_mutation_in || 0,
      total_mutation_out: summary.total_mutation_out || 0,
      total_approved: summary.total_approved || 0,
      total_completed: summary.total_completed || 0,
      total_rejected: summary.total_rejected || 0
    })
  } catch (error) {
    showError(error.message || 'Gagal memuat laporan mutasi')
  }
}

let searchTimer = null
const handleSearch = (value) => {
  search.value = value
  clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    currentPage.value = 1
    await fetchMutations()
    await loadReport()
  }, 400)
}

const handlePageChange = async (page) => {
  currentPage.value = page
  await fetchMutations()
}

const handleSort = async (key) => {
  if (sortBy.value === key) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = key
    sortDesc.value = true
  }
  await fetchMutations()
}

const handleFilterChange = async () => {
  currentPage.value = 1
  await fetchMutations()
  await loadReport()
}

const resetFilters = async () => {
  Object.assign(filters, {
    mutation_type: '',
    status: '',
    mutation_date_from: '',
    mutation_date_to: ''
  })
  search.value = ''
  currentPage.value = 1
  await fetchMutations()
  await loadReport()
}

const resetForm = () => {
  Object.assign(form, { ...defaultForm })
  selectedDocumentFile.value = null
  studentSearchLabel.value = ''
}

const onFileSelected = (event) => {
  const file = event.target.files?.[0]
  selectedDocumentFile.value = file || null
  form.document_file_name = file?.name || ''
}

const openCreateModal = () => {
  isEditing.value = false
  currentItem.value = null
  resetForm()
  showFormModal.value = true
}

const openEditModal = async (item) => {
  isEditing.value = true
  currentItem.value = item
  resetForm()
  try {
    const response = await studentMutationService.getById(item.id)
    const detail = response.data
    Object.assign(form, {
      student_id: detail.student_id,
      academic_year_id: detail.academic_year_id || '',
      mutation_type: detail.mutation_type || '',
      mutation_category: detail.mutation_category || '',
      mutation_date: detail.mutation_date || '',
      effective_date: detail.effective_date || '',
      origin_school: detail.origin_school || '',
      destination_school: detail.destination_school || '',
      reason: detail.reason || '',
      description: detail.description || '',
      document_number: detail.document_number || '',
      document_file: detail.document_file || '',
      notes: detail.notes || ''
    })
    studentSearchLabel.value = detail.student?.full_name
      ? `${detail.student.full_name} (${detail.student.nis || '-'})`
      : ''
    showFormModal.value = true
  } catch (error) {
    showError(error.message || 'Gagal memuat detail mutasi')
  }
}

const fetchStudentOptions = async (query = '') => {
  try {
    const response = await studentService.getAll({ search: query, limit: 20 })
    const students = response.data?.students || []
    return students.map((student) => ({
      value: student.id,
      label: `${student.full_name} (${student.nis || '-'})`,
      description: `NISN: ${student.nisn || '-'} | Status: ${student.student_status || 'ACTIVE'}`
    }))
  } catch (error) {
    return []
  }
}

const onStudentChange = (option) => {
  if (!option) {
    form.student_id = ''
    studentSearchLabel.value = ''
    return
  }
  form.student_id = option.value
  studentSearchLabel.value = option.label
}

const loadAcademicYearOptions = async () => {
  try {
    const response = await academicYearService.getAll({ limit: 200, sortBy: 'start_date', sortDesc: 'true' })
    academicYearOptions.value = response.data?.academicYears || []
  } catch (error) {
    academicYearOptions.value = []
  }
}

const buildFormData = () => {
  const data = new FormData()
  const fields = [
    'student_id',
    'academic_year_id',
    'mutation_type',
    'mutation_category',
    'mutation_date',
    'effective_date',
    'origin_school',
    'destination_school',
    'reason',
    'description',
    'document_number',
    'notes'
  ]

  fields.forEach((field) => {
    const value = form[field]
    if (value !== undefined && value !== null && value !== '') {
      data.append(field, value)
    }
  })

  if (selectedDocumentFile.value) {
    data.append('document_file', selectedDocumentFile.value)
  }

  return data
}

const saveMutation = async () => {
  if (!form.student_id || !form.mutation_type || !form.mutation_category || !form.mutation_date || !form.effective_date || !form.reason) {
    showError('Lengkapi semua field wajib mutasi')
    return
  }

  saving.value = true
  try {
    const payload = buildFormData()
    if (isEditing.value) {
      await studentMutationService.update(currentItem.value.id, payload)
      success('Mutasi siswa berhasil diperbarui')
    } else {
      await studentMutationService.create(payload)
      success('Mutasi siswa berhasil dibuat')
    }
    showFormModal.value = false
    await fetchMutations()
    await loadReport()
  } catch (error) {
    showError(error.message || 'Gagal menyimpan mutasi siswa')
  } finally {
    saving.value = false
  }
}

const openDetailModal = async (item) => {
  try {
    const response = await studentMutationService.getById(item.id)
    detailItem.value = response.data
    showDetailModal.value = true
  } catch (error) {
    showError(error.message || 'Gagal memuat detail mutasi')
  }
}

const openActionModal = (action, item) => {
  pendingAction.value = action
  currentItem.value = item
  actionNotes.value = ''
  showActionModal.value = true
}

const executeAction = async () => {
  if (!currentItem.value?.id || !pendingAction.value) return

  if (pendingAction.value === 'reject' && !actionNotes.value.trim()) {
    showError('Catatan wajib diisi untuk reject')
    return
  }

  actionLoading.value = true
  try {
    const payload = { notes: actionNotes.value || undefined }
    const id = currentItem.value.id

    if (pendingAction.value === 'submit') await studentMutationService.submit(id, payload)
    if (pendingAction.value === 'approve') await studentMutationService.approve(id, payload)
    if (pendingAction.value === 'reject') await studentMutationService.reject(id, payload)
    if (pendingAction.value === 'complete') await studentMutationService.complete(id, payload)
    if (pendingAction.value === 'cancel') await studentMutationService.cancel(id, payload)

    success(`Aksi ${pendingAction.value.toUpperCase()} berhasil`)
    showActionModal.value = false
    pendingAction.value = ''
    await fetchMutations()
    await loadReport()
    if (detailItem.value?.id === id) {
      const detailResponse = await studentMutationService.getById(id)
      detailItem.value = detailResponse.data
    }
  } catch (error) {
    showError(error.message || 'Gagal mengeksekusi aksi mutasi')
  } finally {
    actionLoading.value = false
  }
}

const printMutation = async (id) => {
  try {
    const blob = await studentMutationService.print(id)
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 30000)
  } catch (error) {
    showError('Gagal memuat PDF mutasi')
  }
}

const statusBadgeClass = (status) => {
  const map = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SUBMITTED: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-blue-100 text-blue-700',
    REJECTED: 'bg-red-100 text-red-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-slate-100 text-slate-700'
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const formatDateTime = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await loadAcademicYearOptions()
  await fetchMutations()
  await loadReport()
})
</script>
