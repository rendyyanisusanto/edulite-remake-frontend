<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Catatan Positif Siswa</h1>
      <BaseButton @click="openCreateModal">Catat Poin Positif</BaseButton>
    </div>

    <BaseTable :columns="columns" :data="items" :loading="loading" :total="total" :currentPage="currentPage" :perPage="limit" :searchQuery="search" @update:searchQuery="handleSearch" @page-change="handlePageChange" @sort="handleSort" :sortBy="sortBy" :sortDesc="sortDesc">
      <template #cell-student="{ item }">
        <div>
          <span class="font-medium">{{ item.student?.full_name || '-' }}</span>
          <span class="block text-xs text-gray-500">NIS: {{ item.student?.nis || '-' }}</span>
        </div>
      </template>
      <template #cell-type="{ item }">
        <div>
          <span>{{ item.type?.name || '-' }}</span>
          <span class="ml-2 px-1.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600">{{ item.type?.category || '-' }}</span>
        </div>
      </template>
      <template #cell-points="{ item }">
        <span class="font-bold text-green-600">+{{ item.points || 0 }}</span>
      </template>
      <template #cell-status="{ item }">
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="getStatusBadge(item.status)">{{ item.status || 'APPROVED' }}</span>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2">
          <button @click="openEditModal(item)" class="text-blue-600 hover:text-blue-900"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
          <button @click="confirmDelete(item)" class="text-red-600 hover:text-red-900"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
        </div>
      </template>
    </BaseTable>

    <!-- Create/Edit Modal -->
    <BaseModal v-model="showModal" :title="isEditing ? 'Edit Poin Positif' : 'Catat Poin Positif Baru'" maxWidth="xl">
      <form @submit.prevent="saveData" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <BaseSearchSelect
              v-model="form.student_id"
              :initial-label="form.student_name"
              label="Pilih Siswa"
              placeholder="Ketik nama siswa atau NIS..."
              :fetch-options="fetchStudentOptions"
              required
            />
          </div>

          <div class="mb-4 sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Poin <span class="text-red-500">*</span></label>
            <select v-model="form.type_id" @change="onTypeChange" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50" required>
              <option value="" disabled>Pilih Jenis Poin</option>
              <option v-for="t in typeOptions" :key="t.id" :value="t.id">{{ t.name }} (Poin: +{{ t.points }})</option>
            </select>
          </div>

          <BaseInput id="date" v-model="form.date" type="date" label="Tanggal Kejadian" required />
          <BaseInput id="points" v-model="form.points" type="number" label="Nilai Poin" required />

          <BaseInput id="location" v-model="form.location" label="Lokasi" placeholder="Contoh: Lingkungan Sekolah" />
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select v-model="form.status" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50">
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Disetujui</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </div>

          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Keterangan / Deskripsi</label>
            <textarea v-model="form.description" rows="3" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" placeholder="Deskripsi kejadian..."></textarea>
          </div>
        </div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="saveData" :loading="saving">Simpan</BaseButton>
      </template>
    </BaseModal>

    <!-- Delete Confirmation -->
    <BaseModal v-model="showDeleteModal" title="Konfirmasi Hapus" maxWidth="sm">
      <p class="text-sm text-gray-500">Yakin ingin menghapus data poin positif siswa <b>{{ currentItem?.student?.full_name }}</b>?</p>
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
import BaseSearchSelect from '@/components/forms/BaseSearchSelect.vue'
import { studentPositivePointService, positivePointTypeService } from '@/services/api/positivePoint.service'
import studentService from '@/services/api/student.service'
import { academicYearService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()
const items = ref([]); const typeOptions = ref([]); const academicYears = ref([]); const activeAcademicYearId = ref(null);
const loading = ref(false); const total = ref(0); const currentPage = ref(1); const limit = ref(10); const search = ref(''); const sortBy = ref('date'); const sortDesc = ref(true)
const showModal = ref(false); const showDeleteModal = ref(false); const isEditing = ref(false); const saving = ref(false); const deleting = ref(false); const currentItem = ref(null)

const defaultForm = { student_id: '', student_name: '', type_id: '', academic_year_id: '', date: new Date().toISOString().split('T')[0], points: 0, location: '', description: '', status: 'APPROVED' }
const form = reactive({ ...defaultForm })

const columns = [
  { key: 'date', label: 'Tanggal', sortable: true },
  { key: 'student', label: 'Siswa', sortable: false },
  { key: 'type', label: 'Jenis Catatan', sortable: false },
  { key: 'points', label: 'Poin', sortable: true },
  { key: 'location', label: 'Lokasi', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-24 text-right' }
]

const getStatusBadge = (status) => {
  switch(status) {
    case 'APPROVED': return 'bg-green-100 text-green-800'
    case 'REJECTED': return 'bg-red-100 text-red-800'
    default: return 'bg-yellow-100 text-yellow-800'
  }
}

const fetchData = async () => { loading.value = true; try { const r = await studentPositivePointService.getAll({ page: currentPage.value, limit: limit.value, search: search.value, sortBy: sortBy.value, sortDesc: sortDesc.value }); if (r.success) { items.value = r.data.studentPositivePoints; total.value = r.data.totalItems; } } catch (e) { showError('Gagal mengambil data') } finally { loading.value = false } }

const loadMasterData = async () => { 
  try { 
    const rTypes = await positivePointTypeService.getAll({ limit: 100 }); 
    typeOptions.value = rTypes.data.positivePointTypes || [];
    
    const rYears = await academicYearService.getAll();
    if (rYears.success) {
      academicYears.value = rYears.data.academicYears || [];
      const active = academicYears.value.find(y => y.is_active);
      if (active) activeAcademicYearId.value = active.id;
    }
  } catch(e) {} 
}

const fetchStudentOptions = async (query) => {
  try {
    const res = await studentService.getAll({ search: query, limit: 15, page: 1 })
    if (res.success && res.data.students) {
      return res.data.students.map(s => ({ value: s.id, label: s.full_name, description: `NIS: ${s.nis} - ${s.gender}` }))
    }
    return []
  } catch (e) { return [] }
}

const onTypeChange = () => {
    const type = typeOptions.value.find(t => t.id === form.type_id);
    if (type) {
        form.points = type.points;
    }
}

const handlePageChange = (p) => { currentPage.value = p; fetchData() }
let st; const handleSearch = (v) => { search.value = v; clearTimeout(st); st = setTimeout(() => { currentPage.value = 1; fetchData() }, 500) }
const handleSort = (k) => { if (sortBy.value === k) sortDesc.value = !sortDesc.value; else { sortBy.value = k; sortDesc.value = true }; fetchData() }

const openCreateModal = () => { 
    isEditing.value = false; 
    currentItem.value = null; 
    Object.assign(form, { ...defaultForm, date: new Date().toISOString().split('T')[0], academic_year_id: activeAcademicYearId.value }); 
    showModal.value = true 
}

const openEditModal = (item) => { 
    isEditing.value = true; 
    currentItem.value = item; 
    Object.assign(form, item); 
    form.student_name = item.student?.full_name || ''; 
    showModal.value = true 
}

const confirmDelete = (item) => { currentItem.value = item; showDeleteModal.value = true }

const saveData = async () => { 
  if (!form.student_id || !form.type_id || !form.date || !form.academic_year_id || form.points === null || form.points === undefined) return showError('Lengkapi form dengan benar!'); 
  saving.value = true; 
  try { 
    if (isEditing.value) await studentPositivePointService.update(currentItem.value.id, form); 
    else await studentPositivePointService.create(form); 
    success('Data tersimpan'); 
    showModal.value = false; 
    fetchData() 
  } catch (e) { showError('Gagal menyimpan') } finally { saving.value = false } 
}

const deleteData = async () => { 
  deleting.value = true; 
  try { 
    await studentPositivePointService.delete(currentItem.value.id); 
    success('Data dihapus'); 
    showDeleteModal.value = false; 
    if (items.value.length === 1 && currentPage.value > 1) currentPage.value--; 
    fetchData() 
  } catch (e) { showError('Gagal menghapus') } finally { deleting.value = false } 
}

onMounted(() => { fetchData(); loadMasterData() })
</script>
