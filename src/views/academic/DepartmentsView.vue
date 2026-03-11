<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Jurusan (Program Studi)</h1>
      <BaseButton @click="openCreateModal" icon="<svg class='h-5 w-5 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 4v16m8-8H4'/></svg>">
        Tambah Jurusan
      </BaseButton>
    </div>

    <!-- Data Table -->
    <BaseTable 
      :columns="columns" 
      :data="departments" 
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
    <BaseModal v-model="showModal" :title="isEditing ? 'Edit Jurusan' : 'Tambah Jurusan'" maxWidth="md">
      <form @submit.prevent="saveData" class="space-y-4">
        <BaseInput id="code" v-model="form.code" label="Kode Jurusan" placeholder="Contoh: RPL" required />
        <BaseInput id="name" v-model="form.name" label="Nama Jurusan" placeholder="Rekayasa Perangkat Lunak" required />
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea v-model="form.description" rows="3" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" placeholder="Opsional"></textarea>
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
          Yakin ingin menghapus <b>{{ currentItem?.name }}</b>?
        </p>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showDeleteModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton variant="danger" @click="deleteData" :loading="deleting">Ya, Hapus</BaseButton>
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
import { departmentService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()

const departments = ref([])
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

const defaultForm = { code: '', name: '', description: '' }
const form = reactive({ ...defaultForm })

const columns = [
  { key: 'code', label: 'Kode', sortable: true },
  { key: 'name', label: 'Nama Jurusan', sortable: true },
  { key: 'description', label: 'Deskripsi', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-24 text-right' }
]

const fetchData = async () => {
  loading.value = true
  try {
    const response = await departmentService.getAll({ page: currentPage.value, limit: limit.value, search: search.value, sortBy: sortBy.value, sortDesc: sortDesc.value })
    if (response.success) {
      departments.value = response.data.departments
      total.value = response.data.totalItems
    }
  } catch (err) { showError(err.message || 'Gagal mengambil data') }
  finally { loading.value = false }
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

const openCreateModal = () => { isEditing.value = false; currentItem.value = null; Object.assign(form, defaultForm); showModal.value = true }
const openEditModal = (item) => { isEditing.value = true; currentItem.value = item; Object.assign(form, item); showModal.value = true }
const confirmDelete = (item) => { currentItem.value = item; showDeleteModal.value = true }

const saveData = async () => {
  if (!form.code || !form.name) return showError('Lengkapi Kode dan Nama!')
  saving.value = true
  try {
    if (isEditing.value) await departmentService.update(currentItem.value.id, form)
    else await departmentService.create(form)
    success('Data tersimpan'); showModal.value = false; fetchData()
  } catch (err) { showError(err.message || 'Gagal menyimpan') }
  finally { saving.value = false }
}

const deleteData = async () => {
  deleting.value = true
  try {
    await departmentService.delete(currentItem.value.id)
    success('Data dihapus'); showDeleteModal.value = false
    if (departments.value.length === 1 && currentPage.value > 1) currentPage.value--
    fetchData()
  } catch (err) { showError(err.message || 'Gagal menghapus') }
  finally { deleting.value = false }
}

onMounted(() => fetchData())
</script>
