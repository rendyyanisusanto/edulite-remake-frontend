<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Manajemen Kelas</h1>
      <BaseButton @click="openCreateModal" icon="<svg class='h-5 w-5 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 4v16m8-8H4'/></svg>">
        Tambah Kelas
      </BaseButton>
    </div>

    <!-- Data Table -->
    <BaseTable 
      :columns="columns" 
      :data="classes" 
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
      <template #cell-grade="{ item }">
        {{ item.grade?.name || '-' }}
      </template>
      <template #cell-department="{ item }">
        {{ item.department?.name || '-' }}
      </template>
      <template #cell-homeroom_teacher="{ item }">
        {{ item.homeroom_teacher?.full_name || '-' }}
      </template>
      <template #cell-attendance_qr="{ item }">
        <span
          v-if="!item.attendance_qr_configured"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
        >
          Belum dibuat
        </span>
        <span
          v-else-if="item.attendance_qr_active"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
        >
          Aktif
        </span>
        <span
          v-else
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
        >
          Nonaktif
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-2">
          <button
            v-if="canViewQr"
            @click="openQrModal(item)"
            title="Kelola QR Presensi"
            class="text-indigo-600 hover:text-indigo-900 mx-1"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </button>
          <button @click="openEditModal(item)" title="Edit Kelas" class="text-blue-600 hover:text-blue-900 mx-1">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button @click="confirmDelete(item)" title="Hapus Kelas" class="text-red-600 hover:text-red-900 mx-1">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </template>
    </BaseTable>

    <!-- Create/Edit Modal -->
    <BaseModal v-model="showModal" :title="isEditing ? 'Edit Kelas' : 'Tambah Kelas'" maxWidth="xl">
      <form @submit.prevent="saveData" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput id="name" v-model="form.name" label="Nama Kelas" placeholder="Contoh: X RPL 1" required class="sm:col-span-2" />
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tingkat <span class="text-red-500">*</span></label>
            <select v-model="form.grade_id" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50" required>
              <option value="" disabled>Pilih Tingkat</option>
              <option v-for="grade in gradeOptions" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Jurusan <span class="text-red-500">*</span></label>
            <select v-model="form.department_id" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50" required>
              <option value="" disabled>Pilih Jurusan</option>
              <option v-for="dept in departmentOptions" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
            </select>
          </div>

          <div class="mb-4 sm:col-span-2 mt-4 space-y-4">
             <label class="block text-sm font-medium text-gray-700 mb-1 border-b pb-1">Setelan Lanjutan (Opsional)</label>
             
             <BaseSearchSelect
                v-model="form.homeroom_teacher_id"
                :initial-label="form.teacher_name"
                label="Wali Kelas"
                placeholder="Cari nama guru..."
                :fetch-options="fetchTeacherOptions"
             />
             
          </div>
        </div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="saveData" :loading="saving">Simpan Data</BaseButton>
      </template>
    </BaseModal>

    <!-- Delete Confirmation -->
    <BaseModal v-model="showDeleteModal" title="Konfirmasi Hapus" maxWidth="sm">
      <div class="mt-2 text-center sm:text-left">
        <p class="text-sm text-gray-500">
          Yakin ingin menghapus kelas <b>{{ currentItem?.name }}</b>?
        </p>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showDeleteModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton variant="danger" @click="deleteData" :loading="deleting">Ya, Hapus</BaseButton>
      </template>
    </BaseModal>

    <!-- Classroom Attendance QR Modal -->
    <ClassAttendanceQrModal
      v-model="showQrModal"
      :class-item="qrClassItem"
      :can-manage="canManageQr"
      @updated="handleQrUpdated"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseSearchSelect from '@/components/forms/BaseSearchSelect.vue'
import ClassAttendanceQrModal from '@/components/modals/ClassAttendanceQrModal.vue'
import { classService, gradeService, departmentService, teacherService } from '@/services/api/academic.service'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const authStore = useAuthStore()
const { success, error: showError } = useToast()

const canViewQr = computed(() => authStore.hasAnyPermission(['lesson_attendance.class_qr.view', 'lesson_attendance.class_qr.manage']))
const canManageQr = computed(() => authStore.hasPermission('lesson_attendance.class_qr.manage'))

const classes = ref([])
const gradeOptions = ref([])
const departmentOptions = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const limit = ref(10)
const search = ref('')
const sortBy = ref('name')
const sortDesc = ref(false)

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const currentItem = ref(null)

const defaultForm = { name: '', grade_id: '', department_id: '', homeroom_teacher_id: '', teacher_name: '' }
const form = reactive({ ...defaultForm })

const showQrModal = ref(false)
const qrClassItem = ref(null)

const openQrModal = (item) => {
  qrClassItem.value = item
  showQrModal.value = true
}

const handleQrUpdated = ({ classId, attendance_qr_configured, attendance_qr_active }) => {
  const row = classes.value.find((c) => c.id === classId)
  if (row) {
    row.attendance_qr_configured = attendance_qr_configured
    row.attendance_qr_active = attendance_qr_active
  }
}

const columns = [
  { key: 'name', label: 'Nama Kelas', sortable: true },
  { key: 'grade', label: 'Tingkat', sortable: false },
  { key: 'department', label: 'Jurusan', sortable: false },
  { key: 'homeroom_teacher', label: 'Wali Kelas', sortable: false },
  { key: 'attendance_qr', label: 'QR Presensi', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-28 text-right' }
]

const fetchData = async () => {
  loading.value = true
  try {
    const response = await classService.getAll({ page: currentPage.value, limit: limit.value, search: search.value, sortBy: sortBy.value, sortDesc: sortDesc.value })
    if (response.success) {
      classes.value = response.data.classes
      total.value = response.data.totalItems
    }
  } catch (err) { showError('Gagal mengambil data kelas') }
  finally { loading.value = false }
}

const loadDependencies = async () => {
  try {
    const [grades, depts] = await Promise.all([
      gradeService.getAll({ limit: 100 }),
      departmentService.getAll({ limit: 100 })
    ])
    gradeOptions.value = grades.data.grades || []
    departmentOptions.value = depts.data.departments || []
  } catch (e) { console.error('Error loading dependencies', e) }
}

const fetchTeacherOptions = async (query) => {
  try {
    const res = await teacherService.getAll({ search: query, limit: 15 })
    if (res.success && res.data.teachers) {
       return res.data.teachers.map(t => ({
         value: t.id,
         label: t.full_name,
         description: `NIP: ${t.nip || '-'}`
       }))
    }
    return []
  } catch (e) { return [] }
}

const handlePageChange = (page) => { currentPage.value = page; fetchData() }
let searchTimeout;
const handleSearch = (val) => {
  search.value = val; clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { currentPage.value = 1; fetchData() }, 500)
}
const handleSort = (key) => {
  if (sortBy.value === key) { sortDesc.value = !sortDesc.value }
  else { sortBy.value = key; sortDesc.value = true }
  fetchData()
}

const openCreateModal = () => { Object.assign(form, defaultForm); isEditing.value = false; currentItem.value = null; showModal.value = true }
const openEditModal = (item) => { 
  isEditing.value = true; currentItem.value = item; 
  Object.assign(form, item); 
  form.teacher_name = item.homeroom_teacher?.full_name || '';
  showModal.value = true;
}
const confirmDelete = (item) => { currentItem.value = item; showDeleteModal.value = true }

const saveData = async () => {
  if (!form.name || !form.grade_id || !form.department_id) return showError('Lengkapi field wajib (*) !')
  saving.value = true
  try {
    if (isEditing.value) await classService.update(currentItem.value.id, form)
    else await classService.create(form)
    success('Data tersimpan'); showModal.value = false; fetchData()
  } catch (err) { showError('Gagal menyimpan') }
  finally { saving.value = false }
}

const deleteData = async () => {
  deleting.value = true
  try {
    await classService.delete(currentItem.value.id)
    success('Data dihapus'); showDeleteModal.value = false
    if (classes.value.length === 1 && currentPage.value > 1) currentPage.value--
    fetchData()
  } catch (err) { showError('Gagal menghapus') }
  finally { deleting.value = false }
}

onMounted(() => {
  fetchData()
  loadDependencies()
})
</script>
