<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Master Shift</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola shift kerja untuk pengaturan absensi.</p>
      </div>
      <BaseButton @click="openCreate">
        <svg class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Tambah Shift
      </BaseButton>
    </div>

    <!-- Table -->
    <BaseTable
      :columns="columns" :data="items" :loading="loading"
      :total="total" :currentPage="currentPage" :perPage="limit"
      :searchQuery="search" @update:searchQuery="handleSearch"
      @page-change="handlePageChange"
    >
      <template #cell-clock_in_start="{ item }">
        <span class="font-mono text-sm">{{ item.clock_in_start }} – {{ item.clock_in_end }}</span>
      </template>
      <template #cell-clock_out_start="{ item }">
        <span class="font-mono text-sm text-gray-500">{{ item.clock_out_start ? `${item.clock_out_start} – ${item.clock_out_end}` : '-' }}</span>
      </template>
      <template #cell-late_after="{ item }">
        <span class="font-mono text-sm text-orange-600">{{ item.late_after || '-' }}</span>
      </template>
      <template #cell-is_active="{ item }">
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
          {{ item.is_active ? 'Aktif' : 'Nonaktif' }}
        </span>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex items-center gap-1.5">
          <button @click="openEdit(item)" class="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button @click="handleToggle(item)" class="p-1.5 rounded-lg transition-colors" :class="item.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'" :title="item.is_active ? 'Nonaktifkan' : 'Aktifkan'">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </button>
          <button @click="handleDelete(item)" class="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors" title="Hapus">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </template>
    </BaseTable>

    <!-- Modal -->
    <BaseModal v-model="showModal" :title="editTarget ? 'Edit Shift' : 'Tambah Shift'" maxWidth="lg">
      <form @submit.prevent="handleSave" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Shift <span class="text-red-500">*</span></label>
            <input v-model="form.name" type="text" required class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Contoh: Shift Pagi"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kode</label>
            <input v-model="form.code" type="text" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Contoh: PAGI"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Terlambat Setelah</label>
            <input v-model="form.late_after" type="time" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mulai Clock In <span class="text-red-500">*</span></label>
            <input v-model="form.clock_in_start" type="time" required class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Akhir Clock In <span class="text-red-500">*</span></label>
            <input v-model="form.clock_in_end" type="time" required class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mulai Clock Out</label>
            <input v-model="form.clock_out_start" type="time" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Akhir Clock Out</label>
            <input v-model="form.clock_out_end" type="time" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"/>
          </div>
          <div class="col-span-2 flex items-center gap-2">
            <input v-model="form.is_active" type="checkbox" id="shift_active" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
            <label for="shift_active" class="text-sm font-medium text-gray-700">Shift Aktif</label>
          </div>
        </div>
        <div v-if="formError" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ formError }}</div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="handleSave" :loading="saving">{{ editTarget ? 'Simpan Perubahan' : 'Tambah Shift' }}</BaseButton>
      </template>
    </BaseModal>

    <!-- Confirm Delete -->
    <BaseModal v-model="showConfirm" title="Hapus Shift?" maxWidth="sm">
      <p class="text-sm text-gray-600">Shift <span class="font-semibold">{{ deleteTarget?.name }}</span> akan dihapus permanen.</p>
      <template #footer>
        <BaseButton variant="outline" @click="showConfirm = false" class="mr-3">Batal</BaseButton>
        <BaseButton variant="danger" @click="confirmDelete" :loading="deleting">Hapus</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import attendanceService from '@/services/api/attendance.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()

const columns = [
  { key: 'name', label: 'Nama Shift', sortable: false },
  { key: 'code', label: 'Kode', sortable: false },
  { key: 'clock_in_start', label: 'Jam Masuk', sortable: false },
  { key: 'clock_out_start', label: 'Jam Keluar', sortable: false },
  { key: 'late_after', label: 'Terlambat Setelah', sortable: false },
  { key: 'is_active', label: 'Status', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-28 text-right' }
]

const items = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const limit = ref(15)
const search = ref('')

const showModal = ref(false)
const showConfirm = ref(false)
const editTarget = ref(null)
const deleteTarget = ref(null)
const saving = ref(false)
const deleting = ref(false)
const formError = ref('')

const defaultForm = () => ({ name: '', code: '', clock_in_start: '', clock_in_end: '', clock_out_start: '', clock_out_end: '', late_after: '', is_active: true })
const form = reactive(defaultForm())

const fetchData = async () => {
  loading.value = true
  try {
    const r = await attendanceService.getShifts({ page: currentPage.value, limit: limit.value, search: search.value })
    if (r.success) { items.value = r.data.shifts; total.value = r.data.totalItems }
  } catch (e) { showError('Gagal mengambil data shift') } finally { loading.value = false }
}

let st
const handleSearch = (v) => { search.value = v; clearTimeout(st); st = setTimeout(() => { currentPage.value = 1; fetchData() }, 400) }
const handlePageChange = (p) => { currentPage.value = p; fetchData() }

const openCreate = () => { Object.assign(form, defaultForm()); editTarget.value = null; formError.value = ''; showModal.value = true }
const openEdit = (item) => { Object.assign(form, { ...item }); editTarget.value = item; formError.value = ''; showModal.value = true }

const handleSave = async () => {
  formError.value = ''
  if (!form.name) return (formError.value = 'Nama shift wajib diisi')
  if (!form.clock_in_start || !form.clock_in_end) return (formError.value = 'Jam masuk wajib diisi')
  saving.value = true
  try {
    if (editTarget.value) {
      await attendanceService.updateShift(editTarget.value.id, form)
      success('Shift berhasil diperbarui')
    } else {
      await attendanceService.createShift(form)
      success('Shift berhasil ditambahkan')
    }
    showModal.value = false; fetchData()
  } catch (e) { showError(e?.message || 'Gagal menyimpan shift') } finally { saving.value = false }
}

const handleToggle = async (item) => {
  try {
    await attendanceService.toggleShift(item.id)
    success(`Shift ${item.is_active ? 'dinonaktifkan' : 'diaktifkan'}`)
    fetchData()
  } catch (e) { showError('Gagal mengubah status shift') }
}

const handleDelete = (item) => { deleteTarget.value = item; showConfirm.value = true }
const confirmDelete = async () => {
  deleting.value = true
  try {
    await attendanceService.deleteShift(deleteTarget.value.id)
    success('Shift dihapus'); showConfirm.value = false; fetchData()
  } catch (e) { showError('Gagal menghapus shift') } finally { deleting.value = false }
}

onMounted(fetchData)
</script>
