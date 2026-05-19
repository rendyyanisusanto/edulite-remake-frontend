<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Mapping RFID Siswa</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola kode RFID, status aktif, dan tanggal assign per siswa.</p>
      </div>
    </div>

    <BaseTable
      :columns="columns"
      :data="students"
      :loading="loading"
      :total="total"
      :currentPage="currentPage"
      :perPage="limit"
      :searchQuery="search"
      @update:searchQuery="handleSearch"
      @page-change="handlePageChange"
    >
      <template #actions>
        <select v-model="classFilter" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm min-w-44">
          <option value="">Semua Kelas</option>
          <option v-for="klass in classOptions" :key="klass.id" :value="String(klass.id)">{{ klass.name }}</option>
        </select>
        <select v-model="withoutRfid" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm">
          <option value="">Semua</option>
          <option value="true">Belum punya RFID</option>
        </select>
        <BaseButton variant="outline" @click="applyFilter">Filter</BaseButton>
      </template>

      <template #cell-class_name="{ item }">
        <span>{{ item.class_history?.[0]?.class_info?.name || '-' }}</span>
      </template>
      <template #cell-rfid_code="{ item }">
        <span class="font-mono text-xs">{{ item.rfid_code || '-' }}</span>
      </template>
      <template #cell-rfid_is_active="{ item }">
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="item.rfid_is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
          {{ item.rfid_is_active ? 'Aktif' : 'Nonaktif' }}
        </span>
      </template>
      <template #cell-rfid_assigned_at="{ item }">
        <span>{{ formatDateTime(item.rfid_assigned_at) }}</span>
      </template>
      <template #cell-actions="{ item }">
        <button @click="openEditModal(item)" class="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit RFID">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </button>
      </template>
    </BaseTable>

    <BaseModal v-model="showModal" title="Edit Mapping RFID" maxWidth="md">
      <form @submit.prevent="saveRfid" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Siswa</label>
          <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">{{ selectedStudent?.full_name || '-' }} (NIS: {{ selectedStudent?.nis || '-' }})</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Kode RFID</label>
          <input v-model="form.rfid_code" type="text" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono" placeholder="Contoh: 04A1BC90" />
        </div>
        <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input v-model="form.rfid_is_active" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
          RFID Aktif
        </label>
        <div class="text-xs text-gray-500">Jika kode RFID baru diisi, tanggal assign akan diisi otomatis saat disimpan.</div>
        <div v-if="formError" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ formError }}</div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton variant="outline" @click="clearRfid" class="mr-3" :disabled="saving">Kosongkan RFID</BaseButton>
        <BaseButton @click="saveRfid" :loading="saving">Simpan</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import { classService } from '@/services/api/academic.service'
import studentService from '@/services/api/student.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()

const columns = [
  { key: 'full_name', label: 'Nama Siswa', sortable: false },
  { key: 'nis', label: 'NIS', sortable: false },
  { key: 'class_name', label: 'Kelas', sortable: false },
  { key: 'rfid_code', label: 'RFID', sortable: false },
  { key: 'rfid_is_active', label: 'Status RFID', sortable: false },
  { key: 'rfid_assigned_at', label: 'Assigned At', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-20 text-right' }
]

const loading = ref(false)
const students = ref([])
const total = ref(0)
const currentPage = ref(1)
const limit = ref(20)
const search = ref('')
const classFilter = ref('')
const withoutRfid = ref('')
const classOptions = ref([])

const showModal = ref(false)
const selectedStudent = ref(null)
const saving = ref(false)
const formError = ref('')
const form = reactive({
  rfid_code: '',
  rfid_is_active: true
})

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('id-ID')
}

const loadClasses = async () => {
  try {
    const response = await classService.getAll({ page: 1, limit: 200 })
    classOptions.value = response?.data?.classes || []
  } catch (error) {
    showError('Gagal memuat daftar kelas')
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const response = await studentService.getAll({
      search: search.value,
      class_id: classFilter.value || undefined,
      page: currentPage.value,
      limit: limit.value
    })

    const payload = response?.data || {}
    let rows = payload.students || []
    if (withoutRfid.value === 'true') {
      rows = rows.filter((item) => !item.rfid_code)
    }

    students.value = rows
    total.value = Number(payload.totalItems || 0)
  } catch (error) {
    showError('Gagal memuat data siswa')
  } finally {
    loading.value = false
  }
}

let searchTimer
const handleSearch = (value) => {
  search.value = value
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadData()
  }, 400)
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadData()
}

const applyFilter = () => {
  currentPage.value = 1
  loadData()
}

const openEditModal = (student) => {
  selectedStudent.value = student
  form.rfid_code = student.rfid_code || ''
  form.rfid_is_active = typeof student.rfid_is_active === 'boolean' ? student.rfid_is_active : true
  formError.value = ''
  showModal.value = true
}

const saveRfid = async () => {
  if (!selectedStudent.value?.id) {
    showError('Siswa tidak valid')
    return
  }

  saving.value = true
  formError.value = ''
  try {
    const trimmedCode = String(form.rfid_code || '').trim()
    await studentService.update(selectedStudent.value.id, {
      rfid_code: trimmedCode || null,
      rfid_is_active: trimmedCode ? Boolean(form.rfid_is_active) : false,
      rfid_assigned_at: trimmedCode
        ? (selectedStudent.value.rfid_assigned_at || new Date().toISOString())
        : null
    })

    success('Mapping RFID berhasil disimpan')
    showModal.value = false
    await loadData()
  } catch (error) {
    showError(error?.message || 'Gagal menyimpan mapping RFID')
  } finally {
    saving.value = false
  }
}

const clearRfid = () => {
  form.rfid_code = ''
  form.rfid_is_active = false
}

onMounted(async () => {
  await Promise.all([loadClasses(), loadData()])
})
</script>