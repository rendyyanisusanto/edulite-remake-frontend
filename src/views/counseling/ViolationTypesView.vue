<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Jenis Pelanggaran</h1>
      <BaseButton @click="openCreateModal">Tambah Jenis</BaseButton>
    </div>

    <BaseTable :columns="columns" :data="items" :loading="loading" :total="total" :currentPage="currentPage" :perPage="limit" :searchQuery="search" @update:searchQuery="handleSearch" @page-change="handlePageChange" @sort="handleSort" :sortBy="sortBy" :sortDesc="sortDesc">
      <template #cell-level="{ item }">
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="getLevelBadgeClass(item.level?.name)">
          {{ item.level?.name || '-' }}
        </span>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2">
          <button @click="openEditModal(item)" class="text-blue-600 hover:text-blue-900"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
          <button @click="confirmDelete(item)" class="text-red-600 hover:text-red-900"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="showModal" :title="isEditing ? 'Edit Jenis Pelanggaran' : 'Tambah Jenis Pelanggaran'" maxWidth="lg">
      <form @submit.prevent="saveData" class="space-y-4">
        <BaseInput id="name" v-model="form.name" label="Nama Jenis Pelanggaran" placeholder="Contoh: Terlambat Masuk Sekolah" required />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Level Pelanggaran <span class="text-red-500">*</span></label>
            <select v-model="form.level_id" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50" required>
              <option value="" disabled>Pilih Level</option>
              <option v-for="lvl in levelOptions" :key="lvl.id" :value="lvl.id">{{ lvl.name }}</option>
            </select>
          </div>
          <BaseInput id="point" v-model="form.point" type="number" label="Poin Pelanggaran" placeholder="Contoh: 5" required />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea v-model="form.description" rows="3" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" placeholder="Deskripsi pelanggaran (opsional)"></textarea>
        </div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="saveData" :loading="saving">Simpan</BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="showDeleteModal" title="Konfirmasi Hapus" maxWidth="sm">
      <p class="text-sm text-gray-500">Yakin ingin menghapus jenis pelanggaran <b>{{ currentItem?.name }}</b>?</p>
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
import { violationTypeService, violationLevelService } from '@/services/api/violation.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()
const items = ref([]); const levelOptions = ref([]); const loading = ref(false); const total = ref(0); const currentPage = ref(1); const limit = ref(10); const search = ref(''); const sortBy = ref('name'); const sortDesc = ref(false)
const showModal = ref(false); const showDeleteModal = ref(false); const isEditing = ref(false); const saving = ref(false); const deleting = ref(false); const currentItem = ref(null)
const defaultForm = { name: '', level_id: '', point: 0, description: '' }
const form = reactive({ ...defaultForm })

const columns = [
  { key: 'name', label: 'Jenis Pelanggaran', sortable: true },
  { key: 'level', label: 'Level', sortable: false },
  { key: 'point', label: 'Poin', sortable: true },
  { key: 'description', label: 'Deskripsi', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-24 text-right' }
]

const getLevelBadgeClass = (name) => {
  if (!name) return 'bg-gray-100 text-gray-800'
  const n = name.toLowerCase()
  if (n.includes('ringan') || n.includes('light')) return 'bg-green-100 text-green-800'
  if (n.includes('sedang') || n.includes('medium')) return 'bg-yellow-100 text-yellow-800'
  if (n.includes('berat') || n.includes('heavy')) return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}

const fetchData = async () => { loading.value = true; try { const r = await violationTypeService.getAll({ page: currentPage.value, limit: limit.value, search: search.value, sortBy: sortBy.value, sortDesc: sortDesc.value }); if (r.success) { items.value = r.data.violationTypes; total.value = r.data.totalItems; } } catch (e) { showError('Gagal mengambil data') } finally { loading.value = false } }
const loadLevels = async () => { try { const r = await violationLevelService.getAll({ limit: 100 }); levelOptions.value = r.data.violationLevels || [] } catch(e) {} }

const handlePageChange = (p) => { currentPage.value = p; fetchData() }
let st; const handleSearch = (v) => { search.value = v; clearTimeout(st); st = setTimeout(() => { currentPage.value = 1; fetchData() }, 500) }
const handleSort = (k) => { if (sortBy.value === k) sortDesc.value = !sortDesc.value; else { sortBy.value = k; sortDesc.value = true }; fetchData() }
const openCreateModal = () => { isEditing.value = false; currentItem.value = null; Object.assign(form, defaultForm); showModal.value = true }
const openEditModal = (item) => { isEditing.value = true; currentItem.value = item; Object.assign(form, item); showModal.value = true }
const confirmDelete = (item) => { currentItem.value = item; showDeleteModal.value = true }
const saveData = async () => { if (!form.name || !form.level_id) return showError('Lengkapi nama dan level!'); saving.value = true; try { if (isEditing.value) await violationTypeService.update(currentItem.value.id, form); else await violationTypeService.create(form); success('Data tersimpan'); showModal.value = false; fetchData() } catch (e) { showError('Gagal menyimpan') } finally { saving.value = false } }
const deleteData = async () => { deleting.value = true; try { await violationTypeService.delete(currentItem.value.id); success('Data dihapus'); showDeleteModal.value = false; if (items.value.length === 1 && currentPage.value > 1) currentPage.value--; fetchData() } catch (e) { showError('Gagal menghapus') } finally { deleting.value = false } }
onMounted(() => { fetchData(); loadLevels() })
</script>
