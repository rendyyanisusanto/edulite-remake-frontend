<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Penitipan Barang</h1>
        <p class="text-sm text-gray-500 mt-0.5">Kelola penitipan, peminjaman harian, dan pengembalian barang siswa</p>
      </div>
      <div class="flex gap-2">
        <router-link to="/student-item-deposits/monitoring" class="inline-flex items-center px-3 py-2 border text-sm rounded-md hover:bg-gray-50">Monitoring</router-link>
        <router-link to="/student-item-deposits/categories" class="inline-flex items-center px-3 py-2 border text-sm rounded-md hover:bg-gray-50">Master Kategori</router-link>
        <router-link to="/student-item-deposits/settings" class="inline-flex items-center px-3 py-2 border text-sm rounded-md hover:bg-gray-50">Setting</router-link>
        <BaseButton variant="outline" @click="loadDeposits">Refresh</BaseButton>
        <BaseButton @click="openCreateModal">+ Tambah Penitipan</BaseButton>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <BaseInput id="sid-search" v-model="filters.search" label="Search" placeholder="Kode, siswa, barang" @keyup.enter="loadDeposits" />
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Kategori</label>
          <select v-model="filters.category_id" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm">
            <option value="">Semua</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select v-model="filters.current_status" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm">
            <option value="">Semua</option>
            <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
          </select>
        </div>
        <BaseInput id="date-from" v-model="filters.deposit_date_from" type="date" label="Tanggal Dari" />
        <BaseInput id="date-to" v-model="filters.deposit_date_to" type="date" label="Tanggal Sampai" />
      </div>
      <div class="mt-3 flex gap-2 justify-end">
        <BaseButton variant="outline" @click="resetFilters">Reset</BaseButton>
        <BaseButton @click="loadDeposits">Terapkan</BaseButton>
      </div>
    </div>

    <BaseTable
      :columns="columns"
      :data="deposits.items"
      :loading="loading"
      :total="deposits.totalItems"
      :currentPage="deposits.currentPage"
      :perPage="limit"
      :showActions="false"
      @page-change="onPageChange"
    >
      <template #cell-deposit_date="{ item }">
        {{ formatDateTime(item.deposit_date) }}
      </template>
      <template #cell-student_name="{ item }">
        <div>
          <p class="font-medium text-sm text-gray-800">{{ item.student?.full_name || '-' }}</p>
          <p class="text-xs text-gray-500">{{ item.class?.name || '-' }}</p>
        </div>
      </template>
      <template #cell-item_info="{ item }">
        <div>
          <p class="font-medium text-sm text-gray-800">{{ item.item_name || '-' }}</p>
          <p class="text-xs text-gray-500">{{ item.category?.name || '-' }} | {{ item.storage_location || '-' }}</p>
        </div>
      </template>
      <template #cell-status="{ item }">
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" :class="statusBadge(item.current_status)">{{ item.current_status }}</span>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end gap-2 min-w-[170px]">
          <button class="text-blue-600 hover:text-blue-900 mx-1" @click="openEditModal(item)" title="Edit">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button class="text-indigo-600 hover:text-indigo-900 mx-1" @click="printReceipt(item)" title="Cetak Bukti">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z"/></svg>
          </button>
          <select class="text-xs border rounded-md px-2 py-1.5 bg-white min-w-[130px]" @change="onActionSelect(item, $event)">
            <option value="">Pilih Aksi</option>
            <option value="loan" v-if="item.current_status==='DEPOSITED'">Pinjam</option>
            <option value="return" v-if="item.current_status==='BORROWED'">Kembalikan</option>
            <option value="final" v-if="item.current_status==='DEPOSITED'">Ambil Permanen</option>
            <option value="lost">Tandai Hilang</option>
            <option value="damaged">Tandai Rusak</option>
            <option value="cancel" v-if="item.current_status==='DEPOSITED'">Batalkan</option>
          </select>
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="showModal" :title="isEditing ? 'Edit Penitipan Barang' : 'Tambah Penitipan Barang'" maxWidth="3xl">
      <form @submit.prevent="saveDeposit" class="space-y-4">
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
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kategori <span class="text-red-500">*</span></label>
            <select v-model="form.category_id" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm" required>
              <option value="">Pilih Kategori</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <BaseInput id="item_name" v-model="form.item_name" label="Nama Barang" required />
          <BaseInput id="brand" v-model="form.brand" label="Merk" />
          <BaseInput id="model" v-model="form.model" label="Model" />
          <BaseInput id="color" v-model="form.color" label="Warna" />
          <BaseInput id="serial_number" v-model="form.serial_number" label="Serial Number" />
          <BaseInput id="imei" v-model="form.imei" label="IMEI" />
          <BaseInput id="storage_location" v-model="form.storage_location" label="Lokasi Penyimpanan" />
          <BaseInput id="deposit_date" v-model="form.deposit_date" type="datetime-local" label="Tanggal Titip" disabled />
        </div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="saveDeposit" :loading="saving">{{ isEditing ? 'Simpan Perubahan' : 'Simpan Penitipan' }}</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseSearchSelect from '@/components/forms/BaseSearchSelect.vue'
import { useToast } from '@/composables/useToast'
import svc from '@/services/api/studentItemDeposit.service'
import studentService from '@/services/api/student.service'

const { success, error: showError } = useToast()
const router = useRouter()

const statuses = ['DEPOSITED', 'BORROWED', 'RETURNED', 'LOST', 'DAMAGED', 'CANCELLED']

const columns = [
  { key: 'code', label: 'Kode' },
  { key: 'deposit_date', label: 'Tanggal Titip' },
  { key: 'student_name', label: 'Siswa' },
  { key: 'item_info', label: 'Barang' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Aksi', class: 'w-44 text-right' }
]

const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const currentId = ref(null)
const limit = ref(10)

const filters = reactive({
  search: '',
  category_id: '',
  current_status: '',
  deposit_date_from: '',
  deposit_date_to: '',
  page: 1,
  limit: 10
})

const deposits = reactive({ items: [], totalItems: 0, totalPages: 1, currentPage: 1 })
const categories = ref([])
const studentSearchLabel = ref('')
const form = reactive({
  student_id: '',
  category_id: '',
  item_name: '',
  brand: '',
  model: '',
  color: '',
  serial_number: '',
  imei: '',
  storage_location: '',
  deposit_date: ''
})

const toLocalDatetime = (date = new Date()) => {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const statusBadge = (status) => {
  if (status === 'DEPOSITED') return 'bg-blue-100 text-blue-700'
  if (status === 'BORROWED') return 'bg-amber-100 text-amber-700'
  if (status === 'RETURNED') return 'bg-emerald-100 text-emerald-700'
  if (status === 'LOST') return 'bg-red-100 text-red-700'
  if (status === 'DAMAGED') return 'bg-orange-100 text-orange-700'
  return 'bg-slate-100 text-slate-700'
}

const resetForm = () => {
  Object.assign(form, {
    student_id: '', category_id: '', item_name: '', brand: '', model: '', color: '', serial_number: '', imei: '', storage_location: '', deposit_date: toLocalDatetime()
  })
  studentSearchLabel.value = ''
}

const openCreateModal = () => {
  isEditing.value = false
  currentId.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = async (item) => {
  isEditing.value = true
  currentId.value = item.id
  Object.assign(form, {
    student_id: item.student_id,
    category_id: item.category_id,
    item_name: item.item_name || '',
    brand: item.brand || '',
    model: item.model || '',
    color: item.color || '',
    serial_number: item.serial_number || '',
    imei: item.imei || '',
    storage_location: item.storage_location || '',
    deposit_date: item.deposit_date ? String(item.deposit_date).slice(0, 16) : ''
  })
  studentSearchLabel.value = item.student?.full_name ? `${item.student.full_name} (${item.student?.nis || '-'})` : ''
  showModal.value = true
}

const fetchStudentOptions = async (query = '') => {
  try {
    const response = await studentService.getAll({ search: query, page: 1, limit: 20 })
    const rows = response?.data?.students || []
    return rows.map((student) => ({
      value: student.id,
      label: `${student.full_name} (${student.nis || '-'})`,
      description: `NISN: ${student.nisn || '-'}`
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

const loadDeposits = async () => {
  loading.value = true
  try {
    const res = await svc.getDeposits(filters)
    const data = res?.data || {}
    deposits.items = data.items || []
    deposits.totalItems = data.totalItems || 0
    deposits.totalPages = data.totalPages || 1
    deposits.currentPage = data.currentPage || 1
  } catch (e) {
    showError(e.message || 'Gagal memuat data penitipan')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  const res = await svc.getCategories({ is_active: true })
  categories.value = res?.data || []
}

const saveDeposit = async () => {
  if (!form.student_id || !form.category_id || !form.item_name) {
    showError('Siswa, kategori, dan nama barang wajib diisi')
    return
  }

  saving.value = true
  try {
    const payload = { ...form }
    if (isEditing.value && currentId.value) {
      await svc.updateDeposit(currentId.value, payload)
      success('Penitipan berhasil diperbarui')
    } else {
      await svc.createDeposit(payload)
      success('Penitipan berhasil dibuat')
    }
    showModal.value = false
    await loadDeposits()
  } catch (e) {
    showError(e.message || 'Gagal menyimpan penitipan')
  } finally {
    saving.value = false
  }
}

const loan = async (row) => {
  await svc.loan(row.id, { borrow_method: 'MANUAL' })
  success('Barang berhasil dipinjam')
  await loadDeposits()
}

const ret = async (row) => {
  await svc.returnDaily(row.id, { return_method: 'MANUAL' })
  success('Barang berhasil dikembalikan')
  await loadDeposits()
}

const finalReturn = async (row) => {
  const returnedTo = window.prompt('Diserahkan kepada:')
  if (!returnedTo) return
  await svc.finalReturn(row.id, { returned_to: returnedTo, returned_to_type: 'STUDENT' })
  success('Barang diambil permanen')
  await loadDeposits()
}

const markLost = async (row) => {
  await svc.markLost(row.id, { note: 'Ditandai dari menu aksi' })
  success('Barang ditandai hilang')
  await loadDeposits()
}

const markDamaged = async (row) => {
  await svc.markDamaged(row.id, { note: 'Ditandai dari menu aksi' })
  success('Barang ditandai rusak')
  await loadDeposits()
}

const cancelDeposit = async (row) => {
  await svc.cancel(row.id, { note: 'Dibatalkan dari menu aksi' })
  success('Penitipan dibatalkan')
  await loadDeposits()
}

const printReceipt = async (row) => {
  router.push(`/student-item-deposits/print/${row.id}`)
}

const onPageChange = async (page) => {
  filters.page = page
  await loadDeposits()
}

const onActionSelect = async (row, event) => {
  const action = event.target.value
  event.target.value = ''
  if (!action) return
  if (action === 'loan') return loan(row)
  if (action === 'return') return ret(row)
  if (action === 'final') return finalReturn(row)
  if (action === 'lost') return markLost(row)
  if (action === 'damaged') return markDamaged(row)
  if (action === 'cancel') return cancelDeposit(row)
}

const resetFilters = async () => {
  Object.assign(filters, { search: '', category_id: '', current_status: '', deposit_date_from: '', deposit_date_to: '', page: 1, limit: limit.value })
  await loadDeposits()
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
  await Promise.all([loadDeposits(), loadCategories()])
})
</script>
