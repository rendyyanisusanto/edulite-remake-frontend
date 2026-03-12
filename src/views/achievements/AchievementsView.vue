<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Daftar Prestasi</h1>
      <BaseButton @click="openCreateModal">Tambah Prestasi</BaseButton>
    </div>

    <BaseTable :columns="columns" :data="items" :loading="loading" :total="total" :currentPage="currentPage" :perPage="limit" :searchQuery="search" @update:searchQuery="handleSearch" @page-change="handlePageChange" @sort="handleSort" :sortBy="sortBy" :sortDesc="sortDesc">
      <template #cell-event_date="{ item }">
        {{ formatDate(item.event_date) }}
      </template>
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2">
          <button @click="openEditModal(item)" class="text-blue-600 hover:text-blue-900" title="Edit"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
          <button @click="confirmDelete(item)" class="text-red-600 hover:text-red-900" title="Hapus"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="showModal" :title="isEditing ? 'Edit Prestasi' : 'Tambah Prestasi'" maxWidth="2xl">
      <form @submit.prevent="saveData" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput id="title" v-model="form.title" label="Nama Prestasi/Kejuaraan" placeholder="Contoh: Juara 1 Lomba Pidato" required />
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran <span class="text-red-500">*</span></label>
            <select v-model="form.academic_year_id" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50" required>
              <option value="" disabled>Pilih Tahun Ajaran</option>
              <option v-for="year in academicYears" :key="year.id" :value="year.id">{{ year.name }}</option>
            </select>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tingkat Prestasi <span class="text-red-500">*</span></label>
            <select v-model="form.level" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50" required>
              <option value="" disabled>Pilih Tingkat</option>
              <option value="Sekolah">Sekolah</option>
              <option value="Kecamatan">Kecamatan</option>
              <option value="Kabupaten/Kota">Kabupaten/Kota</option>
              <option value="Provinsi">Provinsi</option>
              <option value="Nasional">Nasional</option>
              <option value="Internasional">Internasional</option>
            </select>
          </div>
          <BaseInput id="organizer" v-model="form.organizer" label="Penyelenggara" placeholder="Contoh: Dinas Pendidikan Provinsi" required />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Kegiatan <span class="text-red-500">*</span></label>
            <select v-model="form.event_type" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50" required>
              <option value="" disabled>Pilih Jenis</option>
              <option value="Akademik">Akademik</option>
              <option value="Olahraga">Olahraga</option>
              <option value="Seni Budaya">Seni Budaya</option>
              <option value="Keagamaan">Keagamaan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <BaseInput id="event_date" v-model="form.event_date" type="date" label="Tanggal Pelaksanaan" required />
        </div>

        <BaseInput id="location" v-model="form.location" label="Lokasi" placeholder="Contoh: Jakarta" required />

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi/Keterangan</label>
          <textarea v-model="form.description" rows="3" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" placeholder="Opsional"></textarea>
        </div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="saveData" :loading="saving">Simpan</BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="showDeleteModal" title="Konfirmasi Hapus" maxWidth="sm">
      <p class="text-sm text-gray-500">Yakin ingin menghapus prestasi <b>{{ currentItem?.title }}</b>?</p>
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
import { academicYearService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()
const items = ref([]); const loading = ref(false); const total = ref(0); const currentPage = ref(1); const limit = ref(10); const search = ref(''); const sortBy = ref('event_date'); const sortDesc = ref(true)
const showModal = ref(false); const showDeleteModal = ref(false); const isEditing = ref(false); const saving = ref(false); const deleting = ref(false); const currentItem = ref(null)

const academicYears = ref([])

const defaultForm = { title: '', level: '', organizer: '', location: '', event_type: '', event_date: '', description: '', academic_year_id: '' }
const form = reactive({ ...defaultForm })

const columns = [
  { key: 'title', label: 'Nama Kejuaraan', sortable: true },
  { key: 'level', label: 'Tingkat', sortable: true },
  { key: 'event_type', label: 'Jenis', sortable: true },
  { key: 'organizer', label: 'Penyelenggara', sortable: true },
  { key: 'event_date', label: 'Tanggal', sortable: true },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-24 text-right' }
]

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
}

const fetchData = async () => { 
  loading.value = true; 
  try { 
    const r = await achievementService.getAll({ page: currentPage.value, limit: limit.value, search: search.value, sortBy: sortBy.value, sortDesc: sortDesc.value }); 
    if (r.success) { 
      items.value = r.data.achievements; 
      total.value = r.data.totalItems; 
    } 
  } catch (e) { 
    showError('Gagal mengambil data prestasi') 
  } finally { 
    loading.value = false 
  } 
}

const handlePageChange = (p) => { currentPage.value = p; fetchData() }
let st; const handleSearch = (v) => { search.value = v; clearTimeout(st); st = setTimeout(() => { currentPage.value = 1; fetchData() }, 500) }
const handleSort = (k) => { if (sortBy.value === k) sortDesc.value = !sortDesc.value; else { sortBy.value = k; sortDesc.value = true }; fetchData() }

const openCreateModal = () => { isEditing.value = false; currentItem.value = null; Object.assign(form, defaultForm); showModal.value = true }
const openEditModal = (item) => { 
  isEditing.value = true; 
  currentItem.value = item; 
  Object.assign(form, item);
  showModal.value = true 
}
const confirmDelete = (item) => { currentItem.value = item; showDeleteModal.value = true }

const saveData = async () => { 
  if (!form.title || !form.level || !form.event_type || !form.event_date || !form.academic_year_id) return showError('Lengkapi form yang wajib diisi!'); 
  saving.value = true; 
  try { 
    if (isEditing.value) await achievementService.update(currentItem.value.id, form); 
    else await achievementService.create(form); 
    success('Data prestasi tersimpan'); 
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
    await achievementService.delete(currentItem.value.id); 
    success('Data prestasi dihapus'); 
    showDeleteModal.value = false; 
    if (items.value.length === 1 && currentPage.value > 1) currentPage.value--; 
    fetchData() 
  } catch (e) { 
    showError('Gagal menghapus data') 
  } finally { 
    deleting.value = false 
  } 
}

onMounted(async () => {
  fetchData(); 
  try {
    const res = await academicYearService.getAll({ limit: 100 });
    if(res.data?.academicYears) {
      academicYears.value = res.data.academicYears;
    }
  } catch (err) {}
})
</script>
