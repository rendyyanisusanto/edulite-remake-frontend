<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Tingkat Kelas</h1>
      <BaseButton @click="openCreateModal" icon="<svg class='h-5 w-5 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 4v16m8-8H4'/></svg>">
        Tambah Tingkat
      </BaseButton>
    </div>

    <!-- Data Table -->
    <BaseTable 
      :columns="columns" 
      :data="grades" 
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
    <BaseModal v-model="showModal" :title="isEditing ? 'Edit Tingkat Kelas' : 'Tambah Tingkat Kelas'" maxWidth="md">
      <form @submit.prevent="saveData" class="space-y-4">
        <BaseInput id="level" v-model="form.level" type="number" label="Tingkat (Angka)" placeholder="Contoh: 10" required hint="Gunakan angka untuk mempermudah pengurutan, misalnya 10 untuk Kelas X." />
        <BaseInput id="name" v-model="form.name" label="Nama Tingkat" placeholder="Contoh: Kelas X" required />
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
          Yakin ingin menghapus tingkat <b>{{ currentItem?.name }}</b>?
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
import { gradeService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()

const grades = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const limit = ref(10)
const search = ref('')
const sortBy = ref('level')
const sortDesc = ref(false)

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const currentItem = ref(null)

const defaultForm = { level: '', name: '' }
const form = reactive({ ...defaultForm })

const columns = [
  { key: 'level', label: 'Tingkat', sortable: true },
  { key: 'name', label: 'Nama Tingkat', sortable: true },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-24 text-right' }
]

const fetchData = async () => {
  loading.value = true
  try {
    const response = await gradeService.getAll({ page: currentPage.value, limit: limit.value, search: search.value, sortBy: sortBy.value, sortDesc: sortDesc.value })
    if (response.success) {
      grades.value = response.data.grades
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
  if (!form.level || !form.name) return showError('Lengkapi Angka Tingkat dan Namanya!')
  saving.value = true
  try {
    if (isEditing.value) await gradeService.update(currentItem.value.id, form)
    else await gradeService.create(form)
    success('Data tersimpan'); showModal.value = false; fetchData()
  } catch (err) { showError(err.message || 'Gagal menyimpan') }
  finally { saving.value = false }
}

const deleteData = async () => {
  deleting.value = true
  try {
    await gradeService.delete(currentItem.value.id)
    success('Data dihapus'); showDeleteModal.value = false
    if (grades.value.length === 1 && currentPage.value > 1) currentPage.value--
    fetchData()
  } catch (err) { showError(err.message || 'Gagal menghapus') }
  finally { deleting.value = false }
}

onMounted(() => fetchData())
</script>
