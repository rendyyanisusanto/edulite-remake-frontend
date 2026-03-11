<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Aturan Poin Prestasi</h1>
      <BaseButton @click="openCreateModal">Tambah Aturan</BaseButton>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-end">
       <div class="w-full sm:w-64">
         <label class="block text-sm font-medium text-gray-700 mb-1">Cari Kategori/Tingkat</label>
         <BaseInput v-model="search" placeholder="Cari aturan..." @input="handleSearch(search)" />
       </div>
    </div>

    <BaseTable :columns="columns" :data="items" :loading="loading" :total="total" :currentPage="currentPage" :perPage="limit" :searchQuery="search" @update:searchQuery="handleSearch" @page-change="handlePageChange" @sort="handleSort" :sortBy="sortBy" :sortDesc="sortDesc">
      <template #cell-points="{ item }">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          +{{ item.points }} Poin
        </span>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2">
          <button @click="openEditModal(item)" class="text-blue-600 hover:text-blue-900" title="Edit"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
          <button @click="confirmDelete(item)" class="text-red-600 hover:text-red-900" title="Hapus"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="showModal" :title="isEditing ? 'Edit Aturan Poin' : 'Tambah Aturan Poin'" maxWidth="sm">
      <form @submit.prevent="saveData" class="space-y-4">
        
        <BaseInput id="level" v-model="form.level" label="Tingkat (Sekolah/Kota/dll)" placeholder="Contoh: Nasional" required />
        <BaseInput id="rank" v-model="form.rank" label="Peringkat/Juara" placeholder="Contoh: Juara 1" required />
        <BaseInput id="category" v-model="form.category" label="Kategori Lomba" placeholder="Contoh: Akademik, Olahraga" />
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Poin yang didapat <span class="text-red-500">*</span></label>
          <input type="number" v-model="form.points" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50" required placeholder="0" min="0" />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea v-model="form.description" rows="2" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" placeholder="Opsional"></textarea>
        </div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="saveData" :loading="saving">Simpan</BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="showDeleteModal" title="Konfirmasi Hapus" maxWidth="sm">
      <p class="text-sm text-gray-500">Yakin ingin menghapus aturan poin ini?</p>
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

import { achievementService } from '@/services/api/achievement.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()
const items = ref([]); const loading = ref(false); const total = ref(0); const currentPage = ref(1); const limit = ref(10); const search = ref(''); const sortBy = ref('points'); const sortDesc = ref(true)
const showModal = ref(false); const showDeleteModal = ref(false); const isEditing = ref(false); const saving = ref(false); const deleting = ref(false); const currentItem = ref(null)

const defaultForm = { level: '', rank: '', category: '', points: 0, description: '' }
const form = reactive({ ...defaultForm })

const columns = [
  { key: 'level', label: 'Tingkat', sortable: true },
  { key: 'rank', label: 'Peringkat', sortable: true },
  { key: 'category', label: 'Kategori', sortable: true },
  { key: 'points', label: 'Poin', sortable: true },
  { key: 'description', label: 'Deskripsi', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-24 text-right' }
]

const fetchData = async () => { 
  loading.value = true; 
  try { 
    const r = await achievementService.getPointRules({ 
      page: currentPage.value, limit: limit.value, search: search.value, sortBy: sortBy.value, sortDesc: sortDesc.value
    }); 
    if (r.success) { 
      items.value = r.data.rules; 
      total.value = r.data.totalItems; 
    } 
  } catch (e) { 
    showError('Gagal mengambil data aturan poin') 
  } finally { 
    loading.value = false 
  } 
}

const handlePageChange = (p) => { currentPage.value = p; fetchData() }
let st; const handleSearch = (v) => { search.value = v; clearTimeout(st); st = setTimeout(() => { currentPage.value = 1; fetchData() }, 500) }
const handleSort = (k) => { if (sortBy.value === k) sortDesc.value = !sortDesc.value; else { sortBy.value = k; sortDesc.value = true }; fetchData() }

const openCreateModal = () => { 
    isEditing.value = false; currentItem.value = null; Object.assign(form, defaultForm); 
    showModal.value = true 
}

const openEditModal = (item) => { 
  isEditing.value = true; 
  currentItem.value = item; 
  Object.assign(form, item);
  showModal.value = true 
}

const confirmDelete = (item) => { currentItem.value = item; showDeleteModal.value = true }

const saveData = async () => { 
  saving.value = true; 
  try { 
    const payload = { ...form };
    
    if (isEditing.value) await achievementService.updatePointRule(currentItem.value.id, payload); 
    else await achievementService.createPointRule(payload); 
    
    success('Data aturan tersimpan'); 
    showModal.value = false; 
    fetchData() 
  } catch (e) { 
    showError('Gagal menyimpan data') 
  } finally { 
    saving.value = false 
  } 
}

const deleteData = async () => { 
  deleting.value = true; 
  try { 
    await achievementService.deletePointRule(currentItem.value.id); 
    success('Data aturan dihapus'); 
    showDeleteModal.value = false; 
    if (items.value.length === 1 && currentPage.value > 1) currentPage.value--; 
    fetchData() 
  } catch (e) { 
    // Handle specific backend error message
    if (e.response && e.response.data && e.response.data.message) {
      showError(e.response.data.message);
    } else {
      showError('Gagal menghapus data') 
    }
  } finally { 
    deleting.value = false 
  } 
}

onMounted(() => { fetchData() })
</script>
