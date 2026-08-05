<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Mata Pelajaran</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola master mata pelajaran umum dan kejuruan untuk kebutuhan jadwal serta pembelajaran.</p>
      </div>
      <BaseButton @click="openCreateModal">Tambah Mata Pelajaran</BaseButton>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="bg-white rounded-xl p-4 shadow-sm"><p class="text-xs text-gray-500">Total Mata Pelajaran</p><p class="text-2xl font-bold text-gray-800">{{ summary.total }}</p></div>
      <div class="bg-white rounded-xl p-4 shadow-sm"><p class="text-xs text-gray-500">Mapel Umum</p><p class="text-2xl font-bold text-gray-800">{{ summary.umum }}</p></div>
      <div class="bg-white rounded-xl p-4 shadow-sm"><p class="text-xs text-gray-500">Mapel Kejuruan</p><p class="text-2xl font-bold text-gray-800">{{ summary.kejuruan }}</p></div>
      <div class="bg-white rounded-xl p-4 shadow-sm"><p class="text-xs text-gray-500">Mapel Aktif</p><p class="text-2xl font-bold text-gray-800">{{ summary.active }}</p></div>
    </div>

    <div class="bg-white rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3 items-end">
      <BaseInput class="xl:col-span-4" id="search-subject" v-model="filters.search" label="Search" placeholder="Kode atau nama mapel" />
      <div class="xl:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Mapel</label>
        <select v-model="filters.subject_type" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50">
          <option value="">Semua</option><option value="UMUM">UMUM</option><option value="KEJURUAN">KEJURUAN</option><option value="MUATAN_LOKAL">MUATAN LOKAL</option><option value="EKSTRA">EKSTRA</option>
        </select>
      </div>
      <div class="xl:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Jurusan</label>
        <select v-model="filters.department_id" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50">
          <option value="">Semua</option><option value="null">Semua Jurusan</option><option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
        </select>
      </div>
      <div class="xl:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select v-model="filters.is_active" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50">
          <option value="">Semua</option><option value="true">Aktif</option><option value="false">Nonaktif</option>
        </select>
      </div>
      <div class="xl:col-span-2">
        <BaseButton variant="outline" class="w-full" @click="resetFilters">Reset Filter</BaseButton>
      </div>
    </div>

    <div v-if="loading" class="bg-white rounded-xl p-6 shadow-sm text-sm text-gray-500">Memuat data mata pelajaran...</div>
    <div v-else-if="loadError" class="bg-white rounded-xl p-6 shadow-sm text-sm text-red-600">Gagal memuat data mata pelajaran. Silakan coba lagi.</div>
    <div v-else-if="subjects.length === 0" class="bg-white rounded-xl p-6 shadow-sm">
      <p class="text-sm text-gray-800">Belum ada data mata pelajaran.</p>
      <p class="text-sm text-gray-500 mt-1">Tambahkan mata pelajaran untuk mulai menyusun kegiatan akademik.</p>
    </div>
    <BaseTable v-else :columns="columns" :data="subjects" :loading="false" :showActions="false" :total="total" :currentPage="currentPage" :perPage="limit" @page-change="handlePageChange" @sort="handleSort" :sortBy="sortBy" :sortDesc="sortDesc">
      <template #cell-no="{ item }">{{ item.no }}</template>
      <template #cell-subject_type="{ item }"><span class="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{{ formatSubjectType(item.subject_type) }}</span></template>
      <template #cell-department="{ item }">{{ item.department?.name || 'Semua Jurusan' }}</template>
      <template #cell-is_active="{ item }"><span :class="item.is_active ? 'text-emerald-700 bg-emerald-50' : 'text-gray-700 bg-gray-100'" class="px-2 py-1 rounded-full text-xs font-semibold">{{ item.is_active ? 'Aktif' : 'Nonaktif' }}</span></template>
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end gap-2">
          <button class="text-blue-600 hover:text-blue-900" title="Edit" @click="openEditModal(item)">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button class="text-amber-600 hover:text-amber-900" :title="item.is_active ? 'Nonaktifkan' : 'Aktifkan'" @click="toggleItem(item)">
            <svg v-if="item.is_active" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6M5 12a7 7 0 1114 0 7 7 0 01-14 0z"/></svg>
            <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-6.518-3.754A1 1 0 007 8.28v7.44a1 1 0 001.234.972l6.518-1.63A1 1 0 0015.5 14.1v-2.064a1 1 0 00-.748-.968z"/></svg>
          </button>
          <button class="text-red-600 hover:text-red-900" title="Hapus" @click="confirmDelete(item)">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="showModal" :title="isEditing ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'" maxWidth="lg">
      <form class="space-y-3">
        <BaseInput id="subject-code" v-model="form.code" label="Kode Mapel" required />
        <BaseInput id="subject-name" v-model="form.name" label="Nama Mata Pelajaran" required />
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Jenis Mapel</label><select v-model="form.subject_type" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50"><option value="UMUM">UMUM</option><option value="KEJURUAN">KEJURUAN</option><option value="MUATAN_LOKAL">MUATAN LOKAL</option><option value="EKSTRA">EKSTRA</option></select></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Jurusan</label><select v-model="form.department_id" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50"><option :value="null">Semua Jurusan</option><option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option></select><p class="mt-1 text-xs text-gray-500">Kosongkan jurusan jika mata pelajaran berlaku untuk semua jurusan.</p></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label><textarea v-model="form.description" rows="3" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50"></textarea></div>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="form.is_active" /> Status Aktif</label>
      </form>
      <template #footer><BaseButton variant="outline" class="mr-2" @click="showModal=false">Batal</BaseButton><BaseButton :loading="saving" @click="saveData">Simpan Data</BaseButton></template>
    </BaseModal>

    <BaseModal v-model="showDeleteModal" title="Konfirmasi Hapus" maxWidth="sm">
      <p class="text-sm text-gray-500">Yakin ingin menghapus <b>{{ currentItem?.name }}</b>?</p>
      <template #footer><BaseButton variant="outline" class="mr-2" @click="showDeleteModal=false">Batal</BaseButton><BaseButton variant="danger" :loading="deleting" @click="deleteData">Ya, Hapus</BaseButton></template>
    </BaseModal>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import { departmentService, subjectService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'
const { success, error: showError } = useToast()
const columns = [
  { key: 'no', label: 'No' },
  { key: 'code', label: 'Kode', sortable: true },
  { key: 'name', label: 'Nama Mata Pelajaran', sortable: true },
  { key: 'subject_type', label: 'Jenis' },
  { key: 'department', label: 'Jurusan' },
  { key: 'is_active', label: 'Status' },
  { key: 'actions', label: 'Aksi', class: 'text-right' }
]
const subjects = ref([]), departments = ref([]), loading = ref(false), loadError = ref(false), total = ref(0), currentPage = ref(1), limit = ref(10), sortBy = ref('name'), sortDesc = ref(false)
const filters = reactive({ search: '', subject_type: '', department_id: '', is_active: '' })
const summary = reactive({ total: 0, umum: 0, kejuruan: 0, active: 0 })
const showModal = ref(false), showDeleteModal = ref(false), isEditing = ref(false), saving = ref(false), deleting = ref(false), currentItem = ref(null)
const form = reactive({ code: '', name: '', subject_type: 'UMUM', department_id: null, description: '', is_active: true })
const formatSubjectType = (v) => (v || '').replace('_', ' ')
const resetForm = () => Object.assign(form, { code: '', name: '', subject_type: 'UMUM', department_id: null, description: '', is_active: true })
const resetFilters = () => { filters.search = ''; filters.subject_type = ''; filters.department_id = ''; filters.is_active = ''; currentPage.value = 1; fetchData() }
const fetchDepartments = async () => { const res = await departmentService.getAll({ page: 1, limit: 200 }); departments.value = res?.data?.departments || [] }
const fetchData = async () => {
  loading.value = true; loadError.value = false
  try {
    const res = await subjectService.getAll({ ...filters, page: currentPage.value, limit: limit.value, sortBy: sortBy.value, sortDesc: sortDesc.value })
    const rows = res?.data?.subjects || []
    subjects.value = rows.map((item, idx) => ({ ...item, no: ((currentPage.value - 1) * limit.value) + idx + 1 }))
    total.value = res?.data?.totalItems || 0
    Object.assign(summary, res?.data?.summary || { total: 0, umum: 0, kejuruan: 0, active: 0 })
  } catch (e) { loadError.value = true; showError(e.message || 'Gagal memuat data mata pelajaran') } finally { loading.value = false }
}
const openCreateModal = () => { isEditing.value = false; currentItem.value = null; resetForm(); showModal.value = true }
const openEditModal = (item) => { isEditing.value = true; currentItem.value = item; Object.assign(form, { code: item.code, name: item.name, subject_type: item.subject_type, department_id: item.department_id, description: item.description || '', is_active: item.is_active }); showModal.value = true }
const confirmDelete = (item) => { currentItem.value = item; showDeleteModal.value = true }
const saveData = async () => { if (!form.code || !form.name || !form.subject_type) return showError('Lengkapi field wajib'); saving.value = true; try { if (isEditing.value) await subjectService.update(currentItem.value.id, form); else await subjectService.create(form); success('Data tersimpan'); showModal.value = false; fetchData() } catch (e) { showError(e.message || 'Gagal menyimpan data') } finally { saving.value = false } }
const toggleItem = async (item) => { try { await subjectService.toggle(item.id); success('Status berhasil diperbarui'); fetchData() } catch (e) { showError(e.message || 'Gagal memperbarui status') } }
const deleteData = async () => { deleting.value = true; try { await subjectService.delete(currentItem.value.id); success('Data dihapus'); showDeleteModal.value = false; fetchData() } catch (e) { showError(e.message || 'Gagal menghapus data') } finally { deleting.value = false } }
const handlePageChange = (page) => { currentPage.value = page; fetchData() }
const handleSort = (key) => { if (sortBy.value === key) sortDesc.value = !sortDesc.value; else { sortBy.value = key; sortDesc.value = false } fetchData() }
let searchTimeout = null
watch(() => [filters.search, filters.subject_type, filters.department_id, filters.is_active], () => { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => { currentPage.value = 1; fetchData() }, 400) })
onMounted(async () => { await fetchDepartments(); await fetchData() })
</script>
