<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Override Shift per Siswa</h1>
        <p class="text-sm text-gray-500 mt-1">Atur shift khusus siswa berdasarkan tahun ajaran dan periode aktif.</p>
      </div>
      <BaseButton @click="openCreateModal">
        <svg class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Tambah Override
      </BaseButton>
    </div>

    <BaseTable
      :columns="columns"
      :data="items"
      :loading="loading"
      :showPagination="false"
      :searchQuery="search"
      @update:searchQuery="handleSearch"
    >
      <template #actions>
        <select v-model="filterAcademicYearId" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm min-w-48">
          <option value="">Semua Tahun Ajaran</option>
          <option v-for="year in academicYears" :key="year.id" :value="String(year.id)">{{ year.name }}</option>
        </select>
        <BaseButton variant="outline" @click="applyFilter">Filter</BaseButton>
      </template>

      <template #cell-academic_year="{ item }">{{ item.academic_year?.name || '-' }}</template>
      <template #cell-student="{ item }">{{ item.student?.full_name || '-' }}</template>
      <template #cell-shift="{ item }">{{ item.shift?.name || '-' }} <span class="text-xs text-gray-500">({{ item.shift?.code || '-' }})</span></template>
      <template #cell-period="{ item }">{{ item.start_date || '-' }} - {{ item.end_date || '-' }}</template>
      <template #cell-actions="{ item }">
        <div class="flex items-center gap-1.5">
          <button @click="openEditModal(item)" class="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button @click="confirmDelete(item)" class="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors" title="Hapus">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="showModal" :title="isEditing ? 'Edit Override Shift' : 'Tambah Override Shift'" maxWidth="lg">
      <form @submit.prevent="saveOverride" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran <span class="text-red-500">*</span></label>
            <select v-model="form.academic_year_id" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm" required>
              <option value="">Pilih Tahun Ajaran</option>
              <option v-for="year in academicYears" :key="year.id" :value="String(year.id)">{{ year.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Siswa <span class="text-red-500">*</span></label>
            <BaseSearchSelect
              v-model="form.student_id"
              v-model:label="studentLabel"
              :initial-label="studentLabel"
              :hideSelectedDisplay="true"
              label=""
              placeholder="Cari nama/NIS siswa..."
              :fetch-options="fetchStudentOptions"
              required
            />
            <p v-if="studentLabel" class="mt-1 text-xs text-gray-600">Terpilih: {{ studentLabel }}</p>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Shift <span class="text-red-500">*</span></label>
            <select v-model="form.shift_id" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm" required>
              <option value="">Pilih Shift</option>
              <option v-for="shift in shifts" :key="shift.id" :value="String(shift.id)">{{ shift.name }} ({{ shift.code || '-' }})</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
            <input v-model="form.start_date" type="date" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
            <input v-model="form.end_date" type="date" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
            <textarea v-model="form.notes" rows="3" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm" placeholder="Opsional"></textarea>
          </div>
        </div>
        <div v-if="formError" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ formError }}</div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="saveOverride" :loading="saving">{{ isEditing ? 'Simpan Perubahan' : 'Simpan Override' }}</BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="showDeleteModal" title="Hapus Override?" maxWidth="sm">
      <p class="text-sm text-gray-600">Override untuk siswa <span class="font-semibold">{{ deleteTarget?.student?.full_name || '-' }}</span> akan dihapus.</p>
      <template #footer>
        <BaseButton variant="outline" @click="showDeleteModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton variant="danger" @click="removeOverride" :loading="deleting">Hapus</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseSearchSelect from '@/components/forms/BaseSearchSelect.vue'
import attendanceService from '@/services/api/studentAttendanceRfid.service'
import studentService from '@/services/api/student.service'
import { academicYearService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()

const columns = [
  { key: 'academic_year', label: 'Tahun Ajaran', sortable: false },
  { key: 'student', label: 'Siswa', sortable: false },
  { key: 'shift', label: 'Shift', sortable: false },
  { key: 'period', label: 'Periode', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-24 text-right' }
]

const items = ref([])
const loading = ref(false)
const search = ref('')
const filterAcademicYearId = ref('')

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const deleteTarget = ref(null)
const formError = ref('')

const academicYears = ref([])
const shifts = ref([])
const studentLabel = ref('')

const form = reactive({
  id: null,
  academic_year_id: '',
  student_id: '',
  shift_id: '',
  start_date: '',
  end_date: '',
  notes: ''
})

const fetchStudentOptions = async (query) => {
  try {
    const response = await studentService.getAll({ search: query, page: 1, limit: 20 })
    const rows = response?.data?.students || []
    return rows.map((item) => ({
      value: String(item.id),
      label: item.full_name,
      description: `Kelas: ${item.class_history?.[0]?.class_info?.name || '-'}`
    }))
  } catch (error) {
    return []
  }
}

const loadDependencies = async () => {
  try {
    const [yearsRes, shiftsRes] = await Promise.all([
      academicYearService.getAll({ page: 1, limit: 100 }),
      attendanceService.getShifts({ page: 1, limit: 200, is_active: true })
    ])
    academicYears.value = yearsRes?.data?.academicYears || []
    shifts.value = shiftsRes?.data?.shifts || []
  } catch (error) {
    showError('Gagal memuat data referensi override')
  }
}

const applyClientFilter = (rows = []) => {
  const text = search.value.trim().toLowerCase()
  return rows.filter((item) => {
    const matchYear = !filterAcademicYearId.value || String(item.academic_year_id) === filterAcademicYearId.value
    if (!matchYear) return false
    if (!text) return true

    const source = [
      item.academic_year?.name,
      item.student?.full_name,
      item.student?.nis,
      item.shift?.name,
      item.shift?.code
    ].filter(Boolean).join(' ').toLowerCase()

    return source.includes(text)
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const response = await attendanceService.getStudentOverrides({
      academic_year_id: filterAcademicYearId.value || undefined
    })
    const rows = response.data || []
    items.value = applyClientFilter(rows)
  } catch (error) {
    showError('Gagal memuat override shift siswa')
  } finally {
    loading.value = false
  }
}

const handleSearch = (value) => {
  search.value = value
  loadData()
}

const applyFilter = async () => {
  await loadData()
}

const resetForm = () => {
  form.id = null
  form.academic_year_id = ''
  form.student_id = ''
  form.shift_id = ''
  form.start_date = ''
  form.end_date = ''
  form.notes = ''
  studentLabel.value = ''
  formError.value = ''
}

const openCreateModal = () => {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

const openEditModal = (item) => {
  isEditing.value = true
  form.id = item.id
  form.academic_year_id = String(item.academic_year_id || '')
  form.student_id = String(item.student_id || '')
  form.shift_id = String(item.shift_id || '')
  form.start_date = item.start_date || ''
  form.end_date = item.end_date || ''
  form.notes = item.notes || ''
  studentLabel.value = item.student?.full_name || ''
  formError.value = ''
  showModal.value = true
}

const saveOverride = async () => {
  formError.value = ''
  if (!form.academic_year_id || !form.student_id || !form.shift_id) {
    formError.value = 'Tahun ajaran, siswa, dan shift wajib diisi'
    return
  }

  saving.value = true
  try {
    const payload = {
      academic_year_id: Number(form.academic_year_id),
      student_id: Number(form.student_id),
      shift_id: Number(form.shift_id),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      notes: form.notes || null
    }

    if (isEditing.value && form.id) {
      await attendanceService.updateStudentOverride(form.id, payload)
    } else {
      await attendanceService.upsertStudentOverride(payload)
    }

    success(isEditing.value ? 'Override berhasil diperbarui' : 'Override berhasil disimpan')
    showModal.value = false
    await loadData()
  } catch (error) {
    showError(error?.message || 'Gagal menyimpan override shift')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item) => {
  deleteTarget.value = item
  showDeleteModal.value = true
}

const removeOverride = async () => {
  if (!deleteTarget.value?.id) {
    showError('ID override tidak valid')
    return
  }

  deleting.value = true
  try {
    await attendanceService.deleteStudentOverride(deleteTarget.value.id)
    success('Override berhasil dihapus')
    showDeleteModal.value = false
    await loadData()
  } catch (error) {
    showError(error?.message || 'Gagal menghapus override shift')
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadDependencies(), loadData()])
})
</script>
