<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Mapping Shift per Kelas</h1>
        <p class="text-sm text-gray-500 mt-1">Atur shift aktif untuk tiap kelas berdasarkan tahun ajaran.</p>
      </div>
      <BaseButton @click="openCreateModal">
        <svg class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Tambah Mapping
      </BaseButton>
    </div>

    <BaseTable
      :columns="columns"
      :data="mappings"
      :loading="loading"
      :showPagination="false"
      :showActions="true"
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

      <template #cell-academic_year="{ item }">
        <span>{{ item.academic_year?.name || '-' }}</span>
      </template>
      <template #cell-class_info="{ item }">
        <span>{{ item.class_info?.name || '-' }}</span>
      </template>
      <template #cell-shift="{ item }">
        <span>{{ item.shift?.name || '-' }} <span class="text-xs text-gray-500">({{ item.shift?.code || '-' }})</span></span>
      </template>
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

    <BaseModal v-model="showModal" :title="isEditing ? 'Edit Mapping Shift Kelas' : 'Tambah Mapping Shift Kelas'" maxWidth="lg">
      <form @submit.prevent="saveMapping" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran <span class="text-red-500">*</span></label>
            <select v-model="form.academic_year_id" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm" required>
              <option value="">Pilih Tahun Ajaran</option>
              <option v-for="year in academicYears" :key="year.id" :value="String(year.id)">{{ year.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kelas <span class="text-red-500">*</span></label>
            <select v-model="form.class_id" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm" required>
              <option value="">Pilih Kelas</option>
              <option v-for="klass in classes" :key="klass.id" :value="String(klass.id)">{{ klass.name }}</option>
            </select>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Shift <span class="text-red-500">*</span></label>
            <select v-model="form.shift_id" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm" required>
              <option value="">Pilih Shift</option>
              <option v-for="shift in shifts" :key="shift.id" :value="String(shift.id)">
                {{ shift.name }} ({{ shift.code || '-' }})
              </option>
            </select>
          </div>
        </div>
        <div v-if="formError" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ formError }}</div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="saveMapping" :loading="saving">{{ isEditing ? 'Simpan Perubahan' : 'Simpan Mapping' }}</BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="showDeleteModal" title="Hapus Mapping?" maxWidth="sm">
      <p class="text-sm text-gray-600">Mapping untuk kelas <span class="font-semibold">{{ deleteTarget?.class_info?.name || '-' }}</span> akan dihapus.</p>
      <template #footer>
        <BaseButton variant="outline" @click="showDeleteModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton variant="danger" @click="removeMapping" :loading="deleting">Hapus</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import attendanceService from '@/services/api/studentAttendanceRfid.service'
import { academicYearService, classService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()

const columns = [
  { key: 'academic_year', label: 'Tahun Ajaran', sortable: false },
  { key: 'class_info', label: 'Kelas', sortable: false },
  { key: 'shift', label: 'Shift', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-24 text-right' }
]

const allMappings = ref([])
const mappings = ref([])
const academicYears = ref([])
const classes = ref([])
const shifts = ref([])
const loading = ref(false)

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const deleteTarget = ref(null)
const formError = ref('')

const form = reactive({
  id: null,
  academic_year_id: '',
  class_id: '',
  shift_id: ''
})

const search = ref('')
const filterAcademicYearId = ref('')

const normalizedSearch = computed(() => search.value.trim().toLowerCase())

const applyClientFilter = () => {
  const searchText = normalizedSearch.value
  mappings.value = (allMappings.value || []).filter((item) => {
    const matchYear = !filterAcademicYearId.value || String(item.academic_year_id) === filterAcademicYearId.value
    if (!searchText) return matchYear

    const source = [
      item.academic_year?.name,
      item.class_info?.name,
      item.shift?.name,
      item.shift?.code
    ].filter(Boolean).join(' ').toLowerCase()

    return matchYear && source.includes(searchText)
  })
}

const loadMappings = async () => {
  loading.value = true
  try {
    const response = await attendanceService.getClassMappings({
      academic_year_id: filterAcademicYearId.value || undefined
    })
    allMappings.value = response.data || []
    applyClientFilter()
  } catch (err) {
    showError('Gagal memuat mapping shift kelas')
  } finally {
    loading.value = false
  }
}

const loadDependencies = async () => {
  try {
    const [yearsRes, classesRes, shiftsRes] = await Promise.all([
      academicYearService.getAll({ page: 1, limit: 100 }),
      classService.getAll({ page: 1, limit: 200 }),
      attendanceService.getShifts({ page: 1, limit: 200, is_active: true })
    ])

    academicYears.value = yearsRes?.data?.academicYears || []
    classes.value = classesRes?.data?.classes || []
    shifts.value = shiftsRes?.data?.shifts || []
  } catch (err) {
    showError('Gagal memuat data referensi (tahun ajaran/kelas/shift)')
  }
}

const resetForm = () => {
  form.id = null
  form.academic_year_id = ''
  form.class_id = ''
  form.shift_id = ''
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
  form.class_id = String(item.class_id || '')
  form.shift_id = String(item.shift_id || '')
  formError.value = ''
  showModal.value = true
}

const saveMapping = async () => {
  formError.value = ''
  if (!form.academic_year_id || !form.class_id || !form.shift_id) {
    formError.value = 'Tahun ajaran, kelas, dan shift wajib diisi'
    return
  }

  saving.value = true
  try {
    const payload = {
      academic_year_id: Number(form.academic_year_id),
      class_id: Number(form.class_id),
      shift_id: Number(form.shift_id)
    }

    if (isEditing.value && form.id) {
      await attendanceService.updateClassMapping(form.id, payload)
    } else {
      await attendanceService.upsertClassMapping(payload)
    }

    success(isEditing.value ? 'Mapping berhasil diperbarui' : 'Mapping berhasil disimpan')
    showModal.value = false
    await loadMappings()
  } catch (err) {
    showError(err?.message || 'Gagal menyimpan mapping shift kelas')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item) => {
  deleteTarget.value = item
  showDeleteModal.value = true
}

const removeMapping = async () => {
  if (!deleteTarget.value?.id) {
    showError('ID mapping tidak valid')
    return
  }

  deleting.value = true
  try {
    await attendanceService.deleteClassMapping(deleteTarget.value.id)
    success('Mapping berhasil dihapus')
    showDeleteModal.value = false
    await loadMappings()
  } catch (err) {
    showError(err?.message || 'Gagal menghapus mapping shift kelas')
  } finally {
    deleting.value = false
  }
}

const handleSearch = (value) => {
  search.value = value
  applyClientFilter()
}

const applyFilter = async () => {
  await loadMappings()
}

onMounted(async () => {
  await Promise.all([loadDependencies(), loadMappings()])
})
</script>
