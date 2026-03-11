<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Data Guru</h1>
      <BaseButton @click="openCreateModal" icon="<svg class='h-5 w-5 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'/></svg>">
        Tambah Guru
      </BaseButton>
    </div>

    <!-- Data Table -->
    <BaseTable 
      :columns="columns" 
      :data="teachers" 
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
      <template #cell-user="{ item }">
        <span v-if="item.user" class="text-green-600 flex items-center text-xs font-semibold">
           <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Terhubung
        </span>
        <span v-else class="text-gray-400 text-xs">-</span>
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
    <BaseModal v-model="showModal" :title="isEditing ? 'Edit Data Guru' : 'Tambah Guru Baru'" maxWidth="2xl">
      <form @submit.prevent="saveData" class="space-y-4">
        
        <div class="bg-blue-50 -mx-6 -mt-4 px-6 py-3 mb-4 border-b border-blue-100 flex items-start">
           <svg class="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           <p class="text-sm text-blue-800">
             Mengisi email dan password akan otomatis membuatkan akun login Sistem bagi Guru ini.
           </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput id="full_name" v-model="form.full_name" label="Nama Lengkap" placeholder="Contoh: Budi Santoso, S.Pd" required />
          <BaseInput id="nip" v-model="form.nip" label="NIP / NUPTK" placeholder="NIP/NUPTK Guru" />
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
            <select v-model="form.gender" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50">
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <BaseInput id="phone" v-model="form.phone" label="No. Telepon" placeholder="08123456789" />

          <div class="sm:col-span-2">
            <h4 class="font-medium text-gray-800 border-b pb-1 mt-2 mb-3">Akun Sistem / Login</h4>
          </div>

          <BaseInput id="email" v-model="form.email" type="email" label="Email" placeholder="guru@sekolah.com" />
          
          <div class="mb-4">
             <label class="block text-sm font-medium text-gray-700 mb-1">
               Password {{ isEditing ? '(Kosongkan jika tidak ingin diubah)' : '' }}
             </label>
             <input v-model="form.password" type="password" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50" :placeholder="isEditing ? 'Biarkan kosong' : 'Default: guru123'" />
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
          Yakin ingin menghapus guru <b>{{ currentItem?.full_name }}</b>?
          <br><br><span class="text-red-500 text-xs">Aksi ini juga akan menghapus akun login-nya di sistem jika ada.</span>
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
import { teacherService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()

const teachers = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const limit = ref(10)
const search = ref('')
const sortBy = ref('full_name')
const sortDesc = ref(false)

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const currentItem = ref(null)

const defaultForm = { nip: '', full_name: '', gender: 'L', phone: '', email: '', password: '' }
const form = reactive({ ...defaultForm })

const columns = [
  { key: 'nip', label: 'NIP/NUPTK', sortable: true },
  { key: 'full_name', label: 'Nama Lengkap', sortable: true },
  { key: 'gender', label: 'L/P', sortable: true },
  { key: 'phone', label: 'No. HP', sortable: false },
  { key: 'user', label: 'Akun Login', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-24 text-right' }
]

const fetchData = async () => {
  loading.value = true
  try {
    const response = await teacherService.getAll({ page: currentPage.value, limit: limit.value, search: search.value, sortBy: sortBy.value, sortDesc: sortDesc.value })
    if (response.success) {
      teachers.value = response.data.teachers
      total.value = response.data.totalItems
    }
  } catch (err) { showError('Gagal mengambil data guru') }
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
const openEditModal = (item) => { 
  isEditing.value = true; currentItem.value = item; 
  Object.assign(form, item); 
  // Map email from nested user object if exists
  form.email = item.user?.email || '';
  form.password = ''; // Don't show password
  showModal.value = true;
}
const confirmDelete = (item) => { currentItem.value = item; showDeleteModal.value = true }

const saveData = async () => {
  if (!form.full_name) return showError('Nama Lengkap wajib diisi!')
  saving.value = true
  try {
    if (isEditing.value) await teacherService.update(currentItem.value.id, form)
    else await teacherService.create(form)
    success('Data tersimpan'); showModal.value = false; fetchData()
  } catch (err) { showError(err.response?.data?.message || 'Gagal menyimpan') }
  finally { saving.value = false }
}

const deleteData = async () => {
  deleting.value = true
  try {
    await teacherService.delete(currentItem.value.id)
    success('Data dihapus'); showDeleteModal.value = false
    if (teachers.value.length === 1 && currentPage.value > 1) currentPage.value--
    fetchData()
  } catch (err) { showError('Gagal menghapus') }
  finally { deleting.value = false }
}

onMounted(() => fetchData())
</script>
