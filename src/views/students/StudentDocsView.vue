<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Dokumen Siswa</h1>
      <BaseButton @click="openCreateModal" icon="<svg class='h-5 w-5 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 4v16m8-8H4'/></svg>">
        Upload Dokumen
      </BaseButton>
    </div>

    <!-- Data Table -->
    <BaseTable 
      :columns="columns" 
      :data="documents" 
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
      <template #cell-student="{ item }">
        <span class="font-medium text-gray-900">{{ item.student?.full_name || 'Tidak Diketahui' }}</span>
        <span class="block text-xs text-gray-500">NIS: {{ item.student?.nis || '-' }}</span>
      </template>
      <template #cell-file_url="{ item }">
         <a :href="item.file_url" target="_blank" class="text-primary hover:underline" v-if="item.file_url">Lihat File</a>
         <span v-else class="text-gray-400">-</span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2">
          <button @click="openEditModal(item)" class="text-blue-600 hover:text-blue-900 mx-1">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button @click="confirmDelete(item)" class="text-red-600 hover:text-red-900 mx-1">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </template>
    </BaseTable>

    <!-- Create/Edit Modal -->
    <BaseModal v-model="showModal" :title="isEditing ? 'Edit Dokumen' : 'Upload Dokumen'" maxWidth="lg">
      <form @submit.prevent="saveDocument" class="space-y-4">
        <div class="mb-4">
          <BaseSearchSelect
            v-model="form.student_id"
            :initial-label="form.student_name"
            label="Pilih Siswa"
            placeholder="Ketik nama siswa atau NIS..."
            :fetch-options="fetchStudentOptions"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipe Dokumen <span class="text-red-500">*</span></label>
          <select v-model="form.document_type" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" required>
            <option value="kk">Kartu Keluarga</option>
            <option value="ijazah">Ijazah</option>
            <option value="akta">Akta Kelahiran</option>
            <option value="other">Lainnya</option>
          </select>
        </div>

        <BaseInput id="document_name" v-model="form.document_name" label="Nama Dokumen" required />
        <BaseInput id="file_url" v-model="form.file_url" label="URL Dokumen" placeholder="https://..." hint="Sementara isi URL manual sebelum MinIO aktif" required />

      </form>

      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="saveDocument" :loading="saving">Simpan Data</BaseButton>
      </template>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal v-model="showDeleteModal" title="Konfirmasi Hapus" maxWidth="sm">
      <div class="mt-2 text-center sm:text-left">
        <p class="text-sm text-gray-500">
          Apakah Anda yakin ingin menghapus data dokumen <b>{{ currentDocument?.document_name }}</b>?
        </p>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showDeleteModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton variant="danger" @click="deleteDocument" :loading="deleting">Ya, Hapus</BaseButton>
      </template>
    </BaseModal>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseSearchSelect from '@/components/forms/BaseSearchSelect.vue'
import documentService from '@/services/api/document.service'
import studentService from '@/services/api/student.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()

const documents = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const limit = ref(10)
const search = ref('')
const sortBy = ref('created_at')
const sortDesc = ref(true)

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const currentDocument = ref(null)

const defaultForm = {
  student_id: '',
  student_name: '', // Added for display
  document_type: 'kk',
  document_name: '',
  file_url: ''
}
const form = reactive({ ...defaultForm })

const columns = [
  { key: 'student', label: 'Siswa', sortable: false },
  { key: 'document_type', label: 'Tipe', sortable: true },
  { key: 'document_name', label: 'Nama Dokumen', sortable: true },
  { key: 'file_url', label: 'File URL', sortable: false },
  { key: 'created_at', label: 'Diupload Pada', sortable: true },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-24 text-right' }
]

const fetchDocuments = async () => {
  loading.value = true
  try {
    const params = { page: currentPage.value, limit: limit.value, search: search.value }
    const response = await documentService.getAll(params)
    if (response.success) {
      documents.value = response.data.documents
      total.value = response.data.totalItems
    }
  } catch (err) {
    showError(err.message || 'Gagal mengambil data dokumen')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchDocuments()
}

let searchTimeout
const handleSearch = (val) => {
  search.value = val
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchDocuments()
  }, 500)
}

const handleSort = (key) => {
  if (sortBy.value === key) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = key
    sortDesc.value = true
  }
  fetchDocuments()
}

const openCreateModal = () => {
  isEditing.value = false
  currentDocument.value = null
  Object.assign(form, defaultForm)
  showModal.value = true
}

const openEditModal = (item) => {
  isEditing.value = true
  currentDocument.value = item
  Object.assign(form, item)
  form.student_name = item.student?.full_name || ''
  showModal.value = true
}

// Student Search logic
const fetchStudentOptions = async (searchQuery) => {
  try {
    const response = await studentService.getAll({ 
      search: searchQuery, 
      limit: 15,
      page: 1 
    })
    
    if (response.success && response.data.students) {
      return response.data.students.map(student => ({
        value: student.id,
        label: student.full_name,
        description: `NIS: ${student.nis} - L/P: ${student.gender}`
      }))
    }
    return []
  } catch (err) {
    console.error('Error fetching students for select:', err)
    return []
  }
}

const confirmDelete = (item) => {
  currentDocument.value = item
  showDeleteModal.value = true
}

const saveDocument = async () => {
  if (!form.student_id || !form.document_type || !form.document_name) {
    showError('Lengkapi field wajib!')
    return
  }
  
  saving.value = true
  try {
    if (isEditing.value) {
      await documentService.update(currentDocument.value.id, form)
      success('Data berhasil diperbarui')
    } else {
      await documentService.create(form)
      success('Data baru berhasil ditambahkan')
    }
    showModal.value = false
    fetchDocuments()
  } catch (err) {
    showError(err.message || 'Gagal menyimpan data')
  } finally {
    saving.value = false
  }
}

const deleteDocument = async () => {
  deleting.value = true
  try {
    await documentService.delete(currentDocument.value.id)
    success('Data berhasil dihapus')
    showDeleteModal.value = false
    if (documents.value.length === 1 && currentPage.value > 1) currentPage.value--
    fetchDocuments()
  } catch (err) {
    showError(err.message || 'Gagal menghapus data')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchDocuments()
})
</script>
