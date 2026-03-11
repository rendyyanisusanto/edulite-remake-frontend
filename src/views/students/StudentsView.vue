<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Manajemen Data Siswa</h1>
      <div class="flex flex-wrap gap-2">
        <input type="file" ref="fileInput" @change="handleFileUpload" class="hidden" accept=".xlsx, .xls" />
        <BaseButton @click="downloadTemplate" variant="ghost" class="text-gray-500 hover:text-gray-800" icon="<svg class='h-5 w-5 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'/></svg>">
          Template
        </BaseButton>
        <BaseButton @click="$refs.fileInput.click()" :loading="importing" variant="outline" icon="<svg class='h-5 w-5 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'/></svg>">
          Import Excel
        </BaseButton>
        <BaseButton @click="exportExcel" :loading="exporting" variant="secondary" icon="<svg class='h-5 w-5 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'/></svg>">
          Export Excel
        </BaseButton>
        <BaseButton @click="openCreateModal" icon="<svg class='h-5 w-5 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 4v16m8-8H4'/></svg>">
          Tambah Siswa
        </BaseButton>
      </div>
    </div>

    <!-- Data Table -->
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
      @sort="handleSort"
      :sortBy="sortBy"
      :sortDesc="sortDesc"
    >
      <!-- Action Buttons Slot -->
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2 justify-end">
          <router-link :to="`/students/${item.id}/character-report`" class="text-green-600 hover:text-green-900 mx-1 tooltip" title="Rapor Karakter">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </router-link>
          <button @click="openEditModal(item)" class="text-blue-600 hover:text-blue-900 mx-1 tooltip" title="Edit">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button @click="confirmDelete(item)" class="text-red-600 hover:text-red-900 mx-1 tooltip" title="Delete">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </template>
    </BaseTable>

    <!-- Create/Edit Modal Form -->
    <BaseModal v-model="showModal" :title="isEditing ? 'Edit Data Siswa' : 'Tambah Siswa Baru'" maxWidth="2xl">
      <form @submit.prevent="saveStudent" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput id="nis" v-model="form.nis" label="NIS" placeholder="Nomor Induk Siswa" required />
          <BaseInput id="nisn" v-model="form.nisn" label="NISN" placeholder="Nomor Induk Siswa Nasional" />
          <BaseInput id="full_name" v-model="form.full_name" label="Nama Lengkap" placeholder="Nama Lengkap Siswa" required class="sm:col-span-2" />
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin <span class="text-red-500">*</span></label>
            <select v-model="form.gender" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" required>
              <option value="" disabled>Pilih Jenis Kelamin</option>
              <option value="L">Laki-Laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          
          <BaseInput id="date_of_birth" v-model="form.date_of_birth" type="date" label="Tanggal Lahir" required />
          
          <div class="mb-4 sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
            <textarea v-model="form.address" rows="3" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" placeholder="Alamat domisili lengkap"></textarea>
          </div>
        </div>
      </form>

      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="saveStudent" :loading="saving">Simpan Data</BaseButton>
      </template>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal v-model="showDeleteModal" title="Konfirmasi Hapus" maxWidth="sm">
      <div class="mt-2 text-center sm:text-left">
        <p class="text-sm text-gray-500">
          Apakah Anda yakin ingin menghapus data siswa <span class="font-bold text-gray-900">{{ currentStudent?.full_name }}</span>? Data yang dihapus tidak dapat dikembalikan.
        </p>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showDeleteModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton variant="danger" @click="deleteStudent" :loading="deleting">Ya, Hapus</BaseButton>
      </template>
    </BaseModal>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import studentService from '@/services/api/student.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()

// State for Export/Import
const fileInput = ref(null)
const importing = ref(false)
const exporting = ref(false)

// Table State
const students = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const limit = ref(10)
const search = ref('')
const sortBy = ref('created_at')
const sortDesc = ref(true)

// Modal State
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const currentStudent = ref(null)

// Form State
const defaultForm = {
  nis: '',
  nisn: '',
  full_name: '',
  gender: '',
  date_of_birth: '',
  address: ''
}
const form = reactive({ ...defaultForm })

// Table Columns
const columns = [
  { key: 'nis', label: 'NIS', sortable: true },
  { key: 'nisn', label: 'NISN', sortable: true },
  { key: 'full_name', label: 'Nama Lengkap', sortable: true },
  { key: 'gender', label: 'L/P', sortable: true },
  { key: 'date_of_birth', label: 'Tgl Lahir', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-24 text-right' }
]

// Methods
const fetchStudents = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: limit.value,
      search: search.value,
    }
    const response = await studentService.getAll(params)
    if (response.success) {
      students.value = response.data.students
      total.value = response.data.totalItems
    }
  } catch (err) {
    showError(err.message || 'Gagal mengambil data siswa')
  } finally {
    loading.value = false
  }
}

// Handlers
const handlePageChange = (page) => {
  currentPage.value = page
  fetchStudents()
}

// Debounced search
let searchTimeout
const handleSearch = (val) => {
  search.value = val
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchStudents()
  }, 500)
}

const handleSort = (key) => {
  if (sortBy.value === key) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = key
    sortDesc.value = true
  }
  fetchStudents()
}

// Modal Actions
const openCreateModal = () => {
  isEditing.value = false
  currentStudent.value = null
  Object.assign(form, defaultForm)
  showModal.value = true
}

const openEditModal = (student) => {
  isEditing.value = true
  currentStudent.value = student
  Object.assign(form, student)
  showModal.value = true
}

const confirmDelete = (student) => {
  currentStudent.value = student
  showDeleteModal.value = true
}

// API Actions
const saveStudent = async () => {
  if (!form.nis || !form.full_name || !form.gender) {
    showError('Harap lengkapi semua field wajib (*) !')
    return
  }
  
  saving.value = true
  try {
    if (isEditing.value) {
      await studentService.update(currentStudent.value.id, form)
      success('Data siswa berhasil diperbarui')
    } else {
      await studentService.create(form)
      success('Siswa baru berhasil ditambahkan')
    }
    showModal.value = false
    fetchStudents()
  } catch (err) {
    showError(err.message || 'Gagal menyimpan data')
  } finally {
    saving.value = false
  }
}

const deleteStudent = async () => {
  deleting.value = true
  try {
    await studentService.delete(currentStudent.value.id)
    success('Data siswa berhasil dihapus')
    showDeleteModal.value = false
    
    // If last item on page, go back one page
    if (students.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }
    fetchStudents()
  } catch (err) {
    showError(err.message || 'Gagal menghapus data')
  } finally {
    deleting.value = false
  }
}

// Export/Import Actions
const downloadTemplate = async () => {
  try {
    const response = await studentService.downloadTemplate()
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'template_siswa.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    showError('Gagal mengunduh template')
  }
}

const exportExcel = async () => {
  exporting.value = true
  try {
    const params = { search: search.value, sortBy: sortBy.value, sortDesc: sortDesc.value }
    const response = await studentService.exportExcel(params)
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'data_siswa.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    success('Data berhasil diexport')
  } catch (err) {
    showError('Gagal export data')
  } finally {
    exporting.value = false
  }
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  importing.value = true
  try {
    const res = await studentService.importExcel(file)
    success(res.message || 'Import data berhasil')
    currentPage.value = 1
    fetchStudents()
  } catch (err) {
    showError(err.message || 'Gagal import data')
  } finally {
    importing.value = false
    event.target.value = '' // Reset input
  }
}

// Lifecycle
onMounted(() => {
  fetchStudents()
})
</script>
