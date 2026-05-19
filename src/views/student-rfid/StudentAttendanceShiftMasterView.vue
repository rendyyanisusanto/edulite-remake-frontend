<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Master Shift RFID Siswa</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola shift presensi gerbang siswa dengan format yang lebih rapi.</p>
      </div>
      <BaseButton @click="openCreate">
        <svg class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Tambah Shift
      </BaseButton>
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
    >
      <template #actions>
        <select v-model="statusFilter" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm">
          <option value="">Semua Status</option>
          <option value="true">Aktif</option>
          <option value="false">Nonaktif</option>
        </select>
        <BaseButton variant="outline" @click="applyStatusFilter">Filter</BaseButton>
      </template>

      <template #cell-academic_year_id="{ item }">
        <span class="text-sm text-gray-700">{{ item.academic_year?.name || '-' }}</span>
      </template>
      <template #cell-clock_in_start="{ item }">
        <span class="font-mono text-sm">{{ item.clock_in_start }} - {{ item.clock_in_end }}</span>
      </template>
      <template #cell-clock_out_start="{ item }">
        <span class="font-mono text-sm text-gray-500">{{ item.clock_out_start ? `${item.clock_out_start} - ${item.clock_out_end}` : '-' }}</span>
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
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="showModal" :title="editTargetId ? 'Edit Shift RFID' : 'Tambah Shift RFID'" maxWidth="lg">
      <form @submit.prevent="handleSave" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Shift <span class="text-red-500">*</span></label>
            <input v-model="form.name" type="text" required class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Contoh: Shift Gerbang Pagi" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kode</label>
            <input v-model="form.code" type="text" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Contoh: RFID-PAGI" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
            <select v-model="form.academic_year_id" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
              <option value="">Pilih Tahun Ajaran</option>
              <option v-for="year in academicYears" :key="year.id" :value="String(year.id)">
                {{ year.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mulai Clock In <span class="text-red-500">*</span></label>
            <input v-model="form.clock_in_start" type="time" required class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Akhir Clock In <span class="text-red-500">*</span></label>
            <input v-model="form.clock_in_end" type="time" required class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Terlambat Setelah</label>
            <input v-model="form.late_after" type="time" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mulai Clock Out</label>
            <input v-model="form.clock_out_start" type="time" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Akhir Clock Out</label>
            <input v-model="form.clock_out_end" type="time" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
            <textarea v-model="form.notes" rows="3" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Opsional"></textarea>
          </div>
          <div class="col-span-2 flex flex-wrap items-center gap-4">
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input v-model="form.allow_checkout" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              Izinkan checkout
            </label>
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input v-model="form.is_active" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              Shift Aktif
            </label>
          </div>
        </div>
        <div v-if="formError" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ formError }}</div>
      </form>

      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="handleSave" :loading="saving">{{ editTargetId ? 'Simpan Perubahan' : 'Tambah Shift' }}</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import shiftService from '@/services/api/studentAttendanceRfid.service'
import { academicYearService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()

const columns = [
  { key: 'name', label: 'Nama Shift', sortable: false },
  { key: 'code', label: 'Kode', sortable: false },
  { key: 'academic_year_id', label: 'Tahun Ajaran', sortable: false },
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
const statusFilter = ref('')
const academicYears = ref([])

const showModal = ref(false)
const editTargetId = ref(null)
const saving = ref(false)
const formError = ref('')

const defaultForm = () => ({
  name: '',
  code: '',
  academic_year_id: '',
  clock_in_start: '06:30',
  late_after: '07:00',
  clock_in_end: '07:30',
  clock_out_start: '14:00',
  clock_out_end: '16:00',
  allow_checkout: true,
  is_active: true,
  notes: ''
})

const form = reactive(defaultForm())

const fetchData = async () => {
  loading.value = true
  try {
    const r = await shiftService.getShifts({
      page: currentPage.value,
      limit: limit.value,
      search: search.value,
      is_active: statusFilter.value
    })
    const payload = r?.data || {}
    items.value = payload.shifts || []
    total.value = Number(payload.totalItems || 0)
  } catch (err) {
    showError('Gagal memuat data shift RFID')
  } finally {
    loading.value = false
  }
}

const loadAcademicYears = async () => {
  try {
    const r = await academicYearService.getAll({ page: 1, limit: 100 })
    academicYears.value = r?.data?.academicYears || []
  } catch (err) {
    showError('Gagal memuat daftar tahun ajaran')
  }
}

const getShiftId = (item) => item?.id ?? item?.shift_id ?? null

let searchTimer
const handleSearch = (value) => {
  search.value = value
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    fetchData()
  }, 400)
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

const applyStatusFilter = () => {
  currentPage.value = 1
  fetchData()
}

const openCreate = () => {
  Object.assign(form, defaultForm())
  editTargetId.value = null
  formError.value = ''
  showModal.value = true
}

const openEdit = (item) => {
  const targetId = getShiftId(item)
  if (!targetId) {
    showError('ID shift tidak valid')
    return
  }

  Object.assign(form, {
    name: item.name || '',
    code: item.code || '',
    academic_year_id: item.academic_year_id ? String(item.academic_year_id) : '',
    clock_in_start: item.clock_in_start || '',
    late_after: item.late_after || '',
    clock_in_end: item.clock_in_end || '',
    clock_out_start: item.clock_out_start || '',
    clock_out_end: item.clock_out_end || '',
    allow_checkout: Boolean(item.allow_checkout),
    is_active: Boolean(item.is_active),
    notes: item.notes || ''
  })
  editTargetId.value = targetId
  formError.value = ''
  showModal.value = true
}

const buildPayload = () => ({
  name: form.name,
  code: form.code || null,
  academic_year_id: form.academic_year_id ? Number(form.academic_year_id) : null,
  clock_in_start: form.clock_in_start,
  late_after: form.late_after || null,
  clock_in_end: form.clock_in_end,
  clock_out_start: form.clock_out_start || null,
  clock_out_end: form.clock_out_end || null,
  allow_checkout: Boolean(form.allow_checkout),
  is_active: Boolean(form.is_active),
  notes: form.notes || null
})

const handleSave = async () => {
  formError.value = ''
  if (!form.name) return (formError.value = 'Nama shift wajib diisi')
  if (!form.clock_in_start || !form.clock_in_end) return (formError.value = 'Jam masuk wajib diisi')

  saving.value = true
  try {
    if (editTargetId.value) {
      await shiftService.updateShift(editTargetId.value, buildPayload())
      success('Shift RFID berhasil diperbarui')
    } else {
      await shiftService.createShift(buildPayload())
      success('Shift RFID berhasil ditambahkan')
    }
    showModal.value = false
    fetchData()
  } catch (err) {
    showError(err?.message || 'Gagal menyimpan shift RFID')
  } finally {
    saving.value = false
  }
}

const handleToggle = async (item) => {
  const targetId = getShiftId(item)
  if (!targetId) {
    showError('ID shift tidak valid')
    return
  }

  try {
    await shiftService.toggleShift(targetId)
    success(`Shift ${item.is_active ? 'dinonaktifkan' : 'diaktifkan'}`)
    fetchData()
  } catch (err) {
    showError('Gagal mengubah status shift RFID')
  }
}

onMounted(async () => {
  await Promise.all([fetchData(), loadAcademicYears()])
})
</script>
