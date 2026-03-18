<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Buku Tamu</h1>
      <div class="flex flex-wrap gap-2">
        <BaseButton @click="exportPdf" :loading="exportingPdf" variant="outline">Export PDF</BaseButton>
        <BaseButton @click="exportExcel" :loading="exportingExcel" variant="secondary">Export Excel</BaseButton>
        <BaseButton @click="openCreateModal">+ Tambah Tamu</BaseButton>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select v-model="filterStatus" @change="handleFilterChange" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm">
            <option value="">Semua Status</option>
            <option value="CHECKED_IN">CHECKED_IN</option>
            <option value="CHECKED_OUT">CHECKED_OUT</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Jenis Tamu</label>
          <select v-model="filterGuestType" @change="handleFilterChange" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm">
            <option value="">Semua Jenis</option>
            <option v-for="t in guestTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Dari Tanggal</label>
          <input type="date" v-model="filterDateFrom" @change="handleFilterChange" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Sampai Tanggal</label>
          <input type="date" v-model="filterDateTo" @change="handleFilterChange" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm" />
        </div>
      </div>
      <div v-if="hasActiveFilter" class="mt-3 flex justify-end">
        <button @click="resetFilters" class="text-xs text-red-500 hover:text-red-700 font-medium">✕ Reset Filter</button>
      </div>
    </div>

    <!-- Table -->
    <BaseTable :columns="columns" :data="items" :loading="loading" :total="total" :currentPage="currentPage" :perPage="limit" :searchQuery="search" @update:searchQuery="handleSearch" @page-change="handlePageChange" @sort="handleSort" :sortBy="sortBy" :sortDesc="sortDesc">
      <template #cell-visit_date="{ item }">
        <span class="text-gray-700 text-sm">{{ formatDate(item.visit_date) }}</span>
      </template>
      <template #cell-checkin_time="{ item }">
        <span class="text-gray-600 text-xs">{{ formatDateTime(item.checkin_time) || '-' }}</span>
      </template>
      <template #cell-checkout_time="{ item }">
        <span class="text-gray-500 text-xs italic">{{ formatDateTime(item.checkout_time) || '-' }}</span>
      </template>
      <template #cell-purpose="{ item }">
        <span class="text-gray-700 text-sm line-clamp-2 max-w-[160px] block" :title="item.purpose">{{ item.purpose || '-' }}</span>
      </template>
      <template #cell-status="{ item }">
        <span :class="statusBadgeClass(item.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
          <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="statusDotClass(item.status)"></span>
          {{ item.status }}
        </span>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex items-center gap-1 justify-end">
          <button @click="openDetailModal(item)" title="Detail" class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
          <button @click="openEditModal(item)" title="Edit" class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button v-if="item.status === 'CHECKED_IN'" @click="confirmCheckout(item)" title="Checkout" class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          </button>
          <button v-if="item.status === 'CHECKED_IN'" @click="confirmCancel(item)" title="Batalkan" class="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
          </button>
          <button @click="confirmDelete(item)" title="Hapus" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </template>
    </BaseTable>

    <!-- Modal: Create/Edit -->
    <BaseModal v-model="showFormModal" :title="isEditing ? 'Edit Data Tamu' : 'Tambah Tamu Baru'" maxWidth="2xl">
      <form @submit.prevent="saveData" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput id="guest_name" v-model="form.guest_name" label="Nama Tamu" placeholder="Nama lengkap tamu" required />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Tamu</label>
            <select v-model="form.guest_type" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50 text-sm">
              <option value="" disabled>Pilih Jenis Tamu</option>
              <option v-for="t in guestTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <BaseInput id="phone" v-model="form.phone" label="No HP" placeholder="08123456789" />
          <BaseInput id="visit_date" v-model="form.visit_date" type="date" label="Tanggal Kunjungan" required />
          <BaseInput id="related_person" v-model="form.related_person" label="Orang yang Dituju" placeholder="Nama orang yang dituju" class="sm:col-span-2" />
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tujuan Kunjungan <span class="text-red-500">*</span></label>
            <textarea v-model="form.purpose" rows="2" placeholder="Jelaskan tujuan kunjungan" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50 text-sm"></textarea>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <textarea v-model="form.address" rows="2" placeholder="Alamat lengkap tamu" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50 text-sm"></textarea>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
            <textarea v-model="form.note" rows="2" placeholder="Catatan tambahan (opsional)" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50 text-sm"></textarea>
          </div>
        </div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showFormModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="saveData" :loading="saving">{{ isEditing ? 'Simpan Perubahan' : 'Tambah Tamu' }}</BaseButton>
      </template>
    </BaseModal>

    <!-- Modal: Detail -->
    <BaseModal v-model="showDetailModal" title="Detail Kunjungan Tamu" maxWidth="lg">
      <div v-if="currentItem" class="space-y-4">
        <div class="flex items-center justify-between">
          <span :class="statusBadgeClass(currentItem.status)" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold">
            <span class="w-2 h-2 rounded-full mr-2" :class="statusDotClass(currentItem.status)"></span>
            {{ currentItem.status }}
          </span>
          <span class="text-xs text-gray-400">ID #{{ currentItem.id }}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Nama Tamu</p><p class="font-semibold text-gray-900 mt-0.5">{{ currentItem.guest_name || '-' }}</p></div>
          <div><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Jenis Tamu</p><p class="text-gray-900 mt-0.5">{{ currentItem.guest_type || '-' }}</p></div>
          <div><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">No HP</p><p class="text-gray-900 mt-0.5">{{ currentItem.phone || '-' }}</p></div>
          <div><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Tanggal Kunjungan</p><p class="text-gray-900 mt-0.5">{{ formatDate(currentItem.visit_date) }}</p></div>
          <div class="sm:col-span-2"><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Alamat</p><p class="text-gray-900 mt-0.5">{{ currentItem.address || '-' }}</p></div>
          <div class="sm:col-span-2"><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Tujuan Kunjungan</p><p class="text-gray-900 mt-0.5">{{ currentItem.purpose || '-' }}</p></div>
          <div><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Orang yang Dituju</p><p class="text-gray-900 mt-0.5">{{ currentItem.related_person || '-' }}</p></div>
          <div><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Jam Masuk</p><p class="text-gray-900 mt-0.5">{{ formatDateTime(currentItem.checkin_time) || '-' }}</p></div>
          <div><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Jam Keluar</p><p class="text-gray-900 mt-0.5">{{ formatDateTime(currentItem.checkout_time) || '-' }}</p></div>
          <div class="sm:col-span-2"><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Catatan</p><p class="text-gray-900 mt-0.5">{{ currentItem.note || '-' }}</p></div>
          <div v-if="currentItem.creator"><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Dicatat Oleh</p><p class="text-gray-900 mt-0.5">{{ currentItem.creator?.name || '-' }}</p></div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showDetailModal = false">Tutup</BaseButton>
        <BaseButton v-if="currentItem?.status === 'CHECKED_IN'" @click="openCheckoutFromDetail" class="ml-2">Checkout Sekarang</BaseButton>
      </template>
    </BaseModal>

    <!-- Modal: Checkout Confirm -->
    <BaseModal v-model="showCheckoutModal" title="Konfirmasi Checkout" maxWidth="sm">
      <p class="text-sm text-gray-600 text-center py-2">Konfirmasi checkout untuk tamu <b>{{ currentItem?.guest_name }}</b>? Waktu checkout akan dicatat otomatis.</p>
      <template #footer>
        <BaseButton variant="outline" @click="showCheckoutModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="doCheckout" :loading="actionLoading">Ya, Checkout</BaseButton>
      </template>
    </BaseModal>

    <!-- Modal: Cancel Confirm -->
    <BaseModal v-model="showCancelModal" title="Konfirmasi Pembatalan" maxWidth="sm">
      <p class="text-sm text-gray-600 text-center py-2">Batalkan kunjungan tamu <b>{{ currentItem?.guest_name }}</b>? Status akan diubah menjadi CANCELLED.</p>
      <template #footer>
        <BaseButton variant="outline" @click="showCancelModal = false" class="mr-3">Tidak</BaseButton>
        <BaseButton variant="danger" @click="doCancel" :loading="actionLoading">Ya, Batalkan</BaseButton>
      </template>
    </BaseModal>

    <!-- Modal: Delete Confirm -->
    <BaseModal v-model="showDeleteModal" title="Konfirmasi Hapus" maxWidth="sm">
      <p class="text-sm text-gray-600 text-center py-2">Hapus data tamu <b>{{ currentItem?.guest_name }}</b>? Data yang dihapus tidak dapat dikembalikan.</p>
      <template #footer>
        <BaseButton variant="outline" @click="showDeleteModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton variant="danger" @click="doDelete" :loading="actionLoading">Ya, Hapus</BaseButton>
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
import guestbookService from '@/services/api/guestbook.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()

const guestTypes = ['Tamu Umum', 'Orang Tua / Wali', 'Instansi / Dinas', 'Vendor / Supplier', 'Alumni', 'Wartawan / Media', 'Lainnya']

// Table state
const items = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const limit = ref(10)
const search = ref('')
const sortBy = ref('created_at')
const sortDesc = ref(true)

// Filter state
const filterStatus = ref('')
const filterGuestType = ref('')
const filterDateFrom = ref('')
const filterDateTo = ref('')
const hasActiveFilter = computed(() => !!(filterStatus.value || filterGuestType.value || filterDateFrom.value || filterDateTo.value))

// Modal state
const showFormModal = ref(false)
const showDetailModal = ref(false)
const showCheckoutModal = ref(false)
const showCancelModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const actionLoading = ref(false)
const currentItem = ref(null)

// Export state
const exportingExcel = ref(false)
const exportingPdf = ref(false)

// Form state
const defaultForm = { guest_name: '', guest_type: '', phone: '', address: '', purpose: '', related_person: '', visit_date: '', note: '' }
const form = reactive({ ...defaultForm })

// Columns
const columns = [
  { key: 'guest_name', label: 'Nama Tamu', sortable: true },
  { key: 'guest_type', label: 'Jenis Tamu', sortable: true },
  { key: 'phone', label: 'No HP', sortable: false },
  { key: 'purpose', label: 'Tujuan', sortable: false },
  { key: 'related_person', label: 'Orang Dituju', sortable: false },
  { key: 'visit_date', label: 'Tgl Kunjungan', sortable: true },
  { key: 'checkin_time', label: 'Jam Masuk', sortable: true },
  { key: 'checkout_time', label: 'Jam Keluar', sortable: false },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'text-right' }
]

// Helpers
const formatDate = (val) => {
  if (!val) return '-'
  return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
const formatDateTime = (val) => {
  if (!val) return null
  return new Date(val).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
const statusBadgeClass = (s) => {
  if (s === 'CHECKED_IN') return 'bg-green-100 text-green-800'
  if (s === 'CHECKED_OUT') return 'bg-blue-100 text-blue-800'
  if (s === 'CANCELLED') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-600'
}
const statusDotClass = (s) => {
  if (s === 'CHECKED_IN') return 'bg-green-500'
  if (s === 'CHECKED_OUT') return 'bg-blue-500'
  if (s === 'CANCELLED') return 'bg-red-500'
  return 'bg-gray-400'
}

// Fetch
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value, limit: limit.value, search: search.value,
      sortBy: sortBy.value, sortDesc: sortDesc.value,
      status: filterStatus.value || undefined,
      guest_type: filterGuestType.value || undefined,
      date_from: filterDateFrom.value || undefined,
      date_to: filterDateTo.value || undefined
    }
    const res = await guestbookService.getAll(params)
    if (res.success) { items.value = res.data.guestbooks; total.value = res.data.totalItems }
  } catch (err) {
    showError(err.message || 'Gagal mengambil data buku tamu')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => { currentPage.value = page; fetchData() }

let searchTimeout
const handleSearch = (val) => {
  search.value = val
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { currentPage.value = 1; fetchData() }, 500)
}

const handleSort = (key) => {
  if (sortBy.value === key) sortDesc.value = !sortDesc.value
  else { sortBy.value = key; sortDesc.value = true }
  fetchData()
}

const handleFilterChange = () => { currentPage.value = 1; fetchData() }

const resetFilters = () => {
  filterStatus.value = ''; filterGuestType.value = ''
  filterDateFrom.value = ''; filterDateTo.value = ''
  currentPage.value = 1; fetchData()
}

// Modal openers
const openCreateModal = () => {
  isEditing.value = false; currentItem.value = null
  Object.assign(form, defaultForm); showFormModal.value = true
}
const openEditModal = (item) => {
  isEditing.value = true; currentItem.value = item
  Object.assign(form, {
    guest_name: item.guest_name || '', guest_type: item.guest_type || '',
    phone: item.phone || '', address: item.address || '',
    purpose: item.purpose || '', related_person: item.related_person || '',
    visit_date: item.visit_date || '', note: item.note || ''
  })
  showFormModal.value = true
}
const openDetailModal = async (item) => {
  try {
    const res = await guestbookService.getById(item.id)
    if (res.success) currentItem.value = res.data
    else currentItem.value = item
  } catch { currentItem.value = item }
  showDetailModal.value = true
}
const confirmCheckout = (item) => { currentItem.value = item; showCheckoutModal.value = true }
const confirmCancel = (item) => { currentItem.value = item; showCancelModal.value = true }
const confirmDelete = (item) => { currentItem.value = item; showDeleteModal.value = true }
const openCheckoutFromDetail = () => { showDetailModal.value = false; showCheckoutModal.value = true }

// Save
const saveData = async () => {
  if (!form.guest_name?.trim()) return showError('Nama tamu wajib diisi')
  if (!form.visit_date) return showError('Tanggal kunjungan wajib diisi')
  if (!form.purpose?.trim()) return showError('Tujuan kunjungan wajib diisi')
  saving.value = true
  try {
    if (isEditing.value) {
      await guestbookService.update(currentItem.value.id, form)
      success('Data tamu berhasil diperbarui')
    } else {
      await guestbookService.create(form)
      success('Tamu baru berhasil ditambahkan')
    }
    showFormModal.value = false; fetchData()
  } catch (err) {
    showError(err.message || 'Gagal menyimpan data')
  } finally {
    saving.value = false
  }
}

// Actions
const doCheckout = async () => {
  actionLoading.value = true
  try {
    await guestbookService.checkout(currentItem.value.id)
    success('Tamu berhasil checkout')
    showCheckoutModal.value = false; fetchData()
  } catch (err) {
    showError(err.message || 'Gagal melakukan checkout')
  } finally { actionLoading.value = false }
}

const doCancel = async () => {
  actionLoading.value = true
  try {
    await guestbookService.cancel(currentItem.value.id)
    success('Kunjungan berhasil dibatalkan')
    showCancelModal.value = false; fetchData()
  } catch (err) {
    showError(err.message || 'Gagal membatalkan kunjungan')
  } finally { actionLoading.value = false }
}

const doDelete = async () => {
  actionLoading.value = true
  try {
    await guestbookService.delete(currentItem.value.id)
    success('Data tamu berhasil dihapus')
    showDeleteModal.value = false
    if (items.value.length === 1 && currentPage.value > 1) currentPage.value--
    fetchData()
  } catch (err) {
    showError(err.message || 'Gagal menghapus data')
  } finally { actionLoading.value = false }
}

// Export
const exportExcel = async () => {
  exportingExcel.value = true
  try {
    const params = {
      search: search.value, status: filterStatus.value || undefined,
      guest_type: filterGuestType.value || undefined,
      date_from: filterDateFrom.value || undefined,
      date_to: filterDateTo.value || undefined
    }
    const response = await guestbookService.exportExcel(params)
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'buku_tamu.xlsx')
    document.body.appendChild(link); link.click()
    document.body.removeChild(link); window.URL.revokeObjectURL(url)
    success('Data berhasil diexport ke Excel')
  } catch (err) {
    showError('Gagal export Excel')
  } finally { exportingExcel.value = false }
}

const exportPdf = async () => {
  exportingPdf.value = true
  try {
    const params = {
      search: search.value, status: filterStatus.value || undefined,
      guest_type: filterGuestType.value || undefined,
      date_from: filterDateFrom.value || undefined,
      date_to: filterDateTo.value || undefined
    }
    const response = await guestbookService.exportPdf(params)
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'buku_tamu.pdf')
    document.body.appendChild(link); link.click()
    document.body.removeChild(link); window.URL.revokeObjectURL(url)
    success('Data berhasil diexport ke PDF')
  } catch (err) {
    showError('Gagal export PDF')
  } finally { exportingPdf.value = false }
}

onMounted(() => { fetchData() })
</script>
