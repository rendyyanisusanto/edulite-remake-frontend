<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Peserta Prestasi</h1>
      <BaseButton @click="openCreateModal">Tambah Peserta</BaseButton>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-end">
       <div class="w-full sm:w-64">
         <label class="block text-sm font-medium text-gray-700 mb-1">Filter Prestasi</label>
         <BaseSearchSelect
            v-model="filterAchievementId"
            :fetchOptions="fetchAchievementOptions"
            placeholder="Cari prestasi..."
            @change="handleFilterChange"
         />
       </div>
    </div>

    <BaseTable :columns="columns" :data="items" :loading="loading" :total="total" :currentPage="currentPage" :perPage="limit" :searchQuery="search" @update:searchQuery="handleSearch" @page-change="handlePageChange" @sort="handleSort" :sortBy="sortBy" :sortDesc="sortDesc">
      <template #cell-achievement="{ item }">
        <div class="font-medium text-gray-900">{{ item.achievement?.title || '-' }}</div>
        <div class="text-xs text-gray-500">{{ item.achievement?.level || '' }}</div>
      </template>
      <template #cell-participant="{ item }">
        <div v-if="item.student">
           <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-2">Siswa</span>
           {{ item.student.full_name }} ({{ item.student.nis }})
        </div>
        <div v-else-if="item.teacher">
           <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-2">Guru</span>
           {{ item.teacher.full_name }} ({{ item.teacher.nip }})
        </div>
        <span v-else>-</span>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2">
          <button @click="openEditModal(item)" class="text-blue-600 hover:text-blue-900" title="Edit"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
          <button @click="confirmDelete(item)" class="text-red-600 hover:text-red-900" title="Hapus"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="showModal" :title="isEditing ? 'Edit Peserta Prestasi' : 'Tambah Peserta Prestasi'" maxWidth="md">
      <form @submit.prevent="saveData" class="space-y-4">
        
        <div class="mb-4">
           <BaseSearchSelect
              label="Prestasi/Kejuaraan"
              v-model="form.achievement_id"
              :initialLabel="form.achievement_label"
              :fetchOptions="fetchAchievementOptions"
              placeholder="Cari prestasi..."
              required
           />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipe Peserta <span class="text-red-500">*</span></label>
          <select v-model="participantType" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50" @change="handleTypeChange" required>
            <option value="student">Siswa</option>
            <option value="teacher">Guru</option>
          </select>
        </div>

        <div class="mb-4" v-if="participantType === 'student'">
           <BaseSearchSelect
              label="Pilih Siswa"
              v-model="form.student_id"
              :initialLabel="form.student_label"
              :fetchOptions="fetchStudentOptions"
              placeholder="Cari siswa..."
              required
           />
        </div>

        <div class="mb-4" v-else>
           <BaseSearchSelect
              label="Pilih Guru"
              v-model="form.teacher_id"
              :initialLabel="form.teacher_label"
              :fetchOptions="fetchTeacherOptions"
              placeholder="Cari guru..."
              required
           />
        </div>

        <BaseInput id="role" v-model="form.role" label="Peran" placeholder="Contoh: Pembina, Peserta Pribadi, Anggota Tim" />

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
          <textarea v-model="form.notes" rows="2" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" placeholder="Opsional"></textarea>
        </div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="saveData" :loading="saving">Simpan</BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="showDeleteModal" title="Konfirmasi Hapus" maxWidth="sm">
      <p class="text-sm text-gray-500">Yakin ingin menghapus peserta ini?</p>
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

import { achievementService } from '@/services/api/achievement.service'
import studentService from '@/services/api/student.service'
import { teacherService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()
const items = ref([]); const loading = ref(false); const total = ref(0); const currentPage = ref(1); const limit = ref(10); const search = ref(''); const sortBy = ref('id'); const sortDesc = ref(true)
const showModal = ref(false); const showDeleteModal = ref(false); const isEditing = ref(false); const saving = ref(false); const deleting = ref(false); const currentItem = ref(null)

const filterAchievementId = ref('')
const participantType = ref('student')

const defaultForm = { achievement_id: '', student_id: '', teacher_id: '', role: '', notes: '', achievement_label: '', student_label: '', teacher_label: '' }
const form = reactive({ ...defaultForm })

const columns = [
  { key: 'achievement', label: 'Prestasi', sortable: false },
  { key: 'participant', label: 'Peserta', sortable: false },
  { key: 'role', label: 'Peran', sortable: false },
  { key: 'notes', label: 'Keterangan', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-24 text-right' }
]

const fetchAchievementOptions = async (query) => {
  try {
    const res = await achievementService.getAll({ search: query, limit: 10 });
    return res.data?.achievements?.map(item => ({
      value: item.id,
      label: item.title,
      description: item.level
    })) || []
  } catch (error) { return [] }
}

const fetchStudentOptions = async (query) => {
  try {
    const res = await studentService.getAll({ search: query, limit: 10 });
    return res.data?.students?.map(item => ({
      value: item.id,
      label: item.full_name,
      description: `NIS: ${item.nis || '-'}`
    })) || []
  } catch (error) { return [] }
}

const fetchTeacherOptions = async (query) => {
  try {
    const res = await teacherService.getAll({ search: query, limit: 10 });
    return res.data?.teachers?.map(item => ({
      value: item.id,
      label: item.full_name,
      description: `NIP: ${item.nip || '-'}`
    })) || []
  } catch (error) { return [] }
}

const handleTypeChange = () => {
    form.student_id = ''
    form.teacher_id = ''
    form.student_label = ''
    form.teacher_label = ''
}

const handleFilterChange = () => {
    currentPage.value = 1
    fetchData()
}

const fetchData = async () => { 
  loading.value = true; 
  try { 
    const r = await achievementService.getParticipants({ 
      page: currentPage.value, limit: limit.value, search: search.value, sortBy: sortBy.value, sortDesc: sortDesc.value,
      achievement_id: filterAchievementId.value 
    }); 
    if (r.success) { 
      items.value = r.data.participants; 
      total.value = r.data.totalItems; 
    } 
  } catch (e) { 
    showError('Gagal mengambil data peserta') 
  } finally { 
    loading.value = false 
  } 
}

const handlePageChange = (p) => { currentPage.value = p; fetchData() }
let st; const handleSearch = (v) => { search.value = v; clearTimeout(st); st = setTimeout(() => { currentPage.value = 1; fetchData() }, 500) }
const handleSort = (k) => { if (sortBy.value === k) sortDesc.value = !sortDesc.value; else { sortBy.value = k; sortDesc.value = true }; fetchData() }

const openCreateModal = () => { 
    isEditing.value = false; currentItem.value = null; Object.assign(form, defaultForm); 
    participantType.value = 'student';
    showModal.value = true 
}

const openEditModal = (item) => { 
  isEditing.value = true; 
  currentItem.value = item; 
  
  if (item.teacher_id) participantType.value = 'teacher';
  else participantType.value = 'student';

  Object.assign(form, {
      ...item,
      achievement_label: item.achievement?.title,
      student_label: item.student?.full_name,
      teacher_label: item.teacher?.full_name
  });
  showModal.value = true 
}
const confirmDelete = (item) => { currentItem.value = item; showDeleteModal.value = true }

const saveData = async () => { 
  if (!form.achievement_id) return showError('Pilih prestasi!'); 
  if (participantType.value === 'student' && !form.student_id) return showError('Pilih siswa!');
  if (participantType.value === 'teacher' && !form.teacher_id) return showError('Pilih guru!');

  saving.value = true; 
  try { 
    const payload = {
        achievement_id: form.achievement_id,
        student_id: participantType.value === 'student' ? form.student_id : null,
        teacher_id: participantType.value === 'teacher' ? form.teacher_id : null,
        role: form.role,
        notes: form.notes
    };

    if (isEditing.value) await achievementService.updateParticipant(currentItem.value.id, payload); 
    else await achievementService.createParticipant(payload); 
    
    success('Data peserta tersimpan'); 
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
    await achievementService.deleteParticipant(currentItem.value.id); 
    success('Data peserta dihapus'); 
    showDeleteModal.value = false; 
    if (items.value.length === 1 && currentPage.value > 1) currentPage.value--; 
    fetchData() 
  } catch (e) { 
    showError('Gagal menghapus data') 
  } finally { 
    deleting.value = false 
  } 
}

onMounted(() => { fetchData() })
</script>
