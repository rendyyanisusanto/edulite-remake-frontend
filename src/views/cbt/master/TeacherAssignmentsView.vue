<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Master Penugasan Guru CBT</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola data penugasan guru, mata pelajaran, dan kelas</p>
      </div>
      <div class="mt-4 sm:mt-0">
        <BaseButton @click="openCreateModal" variant="primary">
          <template #icon>
            <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          </template>
          Tambah Penugasan
        </BaseButton>
      </div>
    </div>

    <BaseTable 
      :columns="columns" 
      :data="items" 
      :loading="loading" 
      v-model:searchQuery="queryParams.search"
      @update:searchQuery="onSearch"
      :total="totalData"
      :currentPage="queryParams.page"
      :perPage="queryParams.limit"
      @page-change="onPageChange"
      @sort="onSort"
    >
      <template #cell-teacher_name="{ item }">
        <div class="font-medium text-gray-900">{{ item.Teacher?.name || '-' }}</div>
        <div class="text-xs text-gray-500">NIP: {{ item.Teacher?.nip || '-' }}</div>
      </template>
      <template #cell-subject="{ item }">
        <div class="text-gray-900">{{ item.Subject?.name || '-' }}</div>
        <div class="text-xs text-gray-500">{{ item.Subject?.code || '-' }}</div>
      </template>
      <template #cell-class="{ item }">
        <div>{{ item.Class?.name || '-' }}</div>
        <div class="text-xs text-gray-500">
          T: {{ item.Class?.Grade?.name || '-' }} | J: {{ item.Class?.Department?.name || '-' }}
        </div>
      </template>
      <template #cell-academic="{ item }">
        <div>{{ item.AcademicYear?.name || '-' }}</div>
        <div class="text-xs text-gray-500">Semester: {{ item.semester }}</div>
      </template>
      <template #cell-is_active="{ item }">
        <span 
          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
          :class="item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
        >
          {{ item.is_active ? 'Aktif' : 'Nonaktif' }}
        </span>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2">
          <button @click="openEditModal(item)" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded" title="Edit">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          </button>
          <button @click="toggleStatus(item)" class="p-1.5 rounded" :class="item.is_active ? 'text-amber-600 hover:text-amber-900 bg-amber-50 hover:bg-amber-100' : 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100'" :title="item.is_active ? 'Nonaktifkan' : 'Aktifkan'">
            <svg v-if="item.is_active" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
            <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </button>
          <button @click="confirmDelete(item)" class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 rounded" title="Hapus">
             <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </template>
    </BaseTable>

    <!-- Modal Form -->
    <BaseModal v-model="showModal" :title="formTitle">
        <form @submit.prevent="saveData" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BaseSearchSelect 
              v-model="form.academic_year_id" 
              label="Tahun Ajaran" 
              :required="true"
              :fetchOptions="fetchAcademicYears"
              :initialLabel="form.academic_year_name"
              @update:label="val => form.academic_year_name = val"
            />
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Semester <span class="text-red-500">*</span></label>
              <select v-model="form.semester" class="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary sm:text-sm bg-white" required>
                 <option value="" disabled>Pilih Semester</option>
                 <option value="GANJIL">Ganjil</option>
                 <option value="GENAP">Genap</option>
              </select>
            </div>
            
            <BaseSearchSelect 
              class="sm:col-span-2"
              v-model="form.teacher_id" 
              label="Guru" 
              :required="true"
              :fetchOptions="fetchTeachers"
              :initialLabel="form.teacher_name"
              @update:label="val => form.teacher_name = val"
            />
            
            <BaseSearchSelect 
              class="sm:col-span-2"
              v-model="form.subject_id" 
              label="Mata Pelajaran" 
              :required="true"
              :fetchOptions="fetchSubjects"
              :initialLabel="form.subject_name"
              @update:label="val => form.subject_name = val"
            />
            
            <BaseSearchSelect 
              class="sm:col-span-2"
              v-model="form.class_id" 
              label="Kelas" 
              :required="true"
              :fetchOptions="fetchClasses"
              :initialLabel="form.class_name"
              @update:label="val => form.class_name = val"
            />

            <!-- Status (For edit only) -->
            <div v-if="isEditing" class="mb-4 sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div class="flex items-center space-x-4 mt-2">
                 <label class="flex items-center text-sm">
                   <input type="radio" v-model="form.is_active" :value="true" class="h-4 w-4 text-primary border-gray-300 focus:ring-primary">
                   <span class="ml-2 text-gray-700">Aktif</span>
                 </label>
                 <label class="flex items-center text-sm">
                   <input type="radio" v-model="form.is_active" :value="false" class="h-4 w-4 text-primary border-gray-300 focus:ring-primary">
                   <span class="ml-2 text-gray-700">Nonaktif</span>
                 </label>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
             <BaseButton type="button" variant="outline" @click="showModal = false" :disabled="saving">Batal</BaseButton>
             <BaseButton type="submit" variant="primary" :loading="saving">Simpan</BaseButton>
          </div>
        </form>
    </BaseModal>

    <!-- Confirmation Delete Modal -->
    <BaseModal v-model="showDeleteModal" title="Hapus Penugasan">
        <p class="text-sm text-gray-600 mb-4">
          Apakah Anda yakin ingin menghapus penugasan <b>{{ selectedItem?.Teacher?.name || '' }}</b> untuk kelas <b>{{ selectedItem?.Class?.name || '' }}</b>?
          <br><br>
          <span class="text-red-500 text-xs mt-1">Data yang sudah terhubung dengan ujian tidak dapat dihapus. Sangat disarankan untuk mengubah status menjadi nonaktif daripada menghapus data.</span>
        </p>
        <div class="flex justify-end space-x-3 mt-6">
             <BaseButton variant="outline" @click="showDeleteModal = false" :disabled="deleting">Batal</BaseButton>
             <BaseButton variant="danger" @click="proceedDelete" :loading="deleting">Ya, Hapus</BaseButton>
        </div>
    </BaseModal>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseSearchSelect from '@/components/forms/BaseSearchSelect.vue'
import cbtMasterService from '@/services/api/cbt-master.service'
import { useToast } from '@/composables/useToast'

const toast = useToast()

const columns = [
  { key: 'teacher_name', label: 'Guru & NIP', sortable: true },
  { key: 'subject', label: 'Mapel & Kode', sortable: false },
  { key: 'class', label: 'Kelas & Tingkat', sortable: false },
  { key: 'academic', label: 'Tahun Ajaran', sortable: false },
  { key: 'is_active', label: 'Status', sortable: true },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'text-right' }
]

const items = ref([])
const totalData = ref(0)
const loading = ref(false)

const queryParams = ref({
  page: 1,
  limit: 10,
  search: '',
  sort_by: 'created_at',
  sort_order: 'DESC'
})

const loadData = async () => {
    loading.value = true
    try {
        const res = await cbtMasterService.getTeacherAssignments(queryParams.value)
        if (res.success) {
            items.value = res.data.data
            totalData.value = res.data.total
        }
    } catch (e) {
        toast.error('Gagal memuat data penugasan guru')
    } finally {
        loading.value = false
    }
}

let searchTimeout = null;
const onSearch = (val) => {
    queryParams.value.search = val
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        queryParams.value.page = 1
        loadData()
    }, 500)
}

const onPageChange = (page) => {
    queryParams.value.page = page
    loadData()
}

const onSort = (key) => {
    if (queryParams.value.sort_by === key) {
        queryParams.value.sort_order = queryParams.value.sort_order === 'ASC' ? 'DESC' : 'ASC'
    } else {
        queryParams.value.sort_by = key
        queryParams.value.sort_order = 'ASC'
    }
    loadData()
}

// Modal handling
const showModal = ref(false)
const isEditing = ref(false)
const formTitle = ref('')
const form = ref({})
const saving = ref(false)

const openCreateModal = () => {
    isEditing.value = false
    formTitle.value = 'Tambah Penugasan Guru'
    form.value = { 
        academic_year_id: '', academic_year_name: '',
        semester: '',
        teacher_id: '', teacher_name: '',
        subject_id: '', subject_name: '',
        class_id: '', class_name: '',
        is_active: true
    }
    showModal.value = true
}

const openEditModal = (item) => {
    isEditing.value = true
    formTitle.value = 'Edit Penugasan Guru'
    form.value = {
        id: item.id,
        academic_year_id: item.academic_year_id, academic_year_name: item.AcademicYear?.name || '',
        semester: item.semester,
        teacher_id: item.teacher_id, teacher_name: item.Teacher?.name || '',
        subject_id: item.subject_id, subject_name: item.Subject?.name || '',
        class_id: item.class_id, class_name: item.Class?.name || '',
        is_active: item.is_active
    }
    showModal.value = true
}

const saveData = async () => {
    if (!form.value.teacher_id || !form.value.subject_id || !form.value.class_id || !form.value.academic_year_id || !form.value.semester) {
        toast.error('Gagal', 'Mohon lengkapi seluruh field wajib')
        return
    }
    saving.value = true
    try {
        if (isEditing.value) {
            const fd = {...form.value}
            await cbtMasterService.updateTeacherAssignment(form.value.id, fd)
            toast.success('Berhasil memperbarui penugasan guru')
        } else {
            await cbtMasterService.createTeacherAssignment(form.value)
            toast.success('Berhasil menambahkan penugasan guru')
        }
        showModal.value = false
        loadData()
    } catch (e) {
        const msg = e.response?.data?.message || 'Terjadi kesalahan sistem'
        toast.error(msg)
    } finally {
        saving.value = false
    }
}

const toggleStatus = async (item) => {
    const nextStatus = !item.is_active
    try {
        await cbtMasterService.updateTeacherAssignmentStatus(item.id, nextStatus)
        toast.success(`Berhasil ${nextStatus ? 'mengaktifkan' : 'menonaktifkan'} penugasan`)
        loadData()
    } catch (e) {
        toast.error('Gagal mengubah status. ' + (e.response?.data?.message || ''))
    }
}

// Delete handling
const showDeleteModal = ref(false)
const selectedItem = ref(null)
const deleting = ref(false)

const confirmDelete = (item) => {
    selectedItem.value = item
    showDeleteModal.value = true
}

const proceedDelete = async () => {
    deleting.value = true
    try {
        await cbtMasterService.deleteTeacherAssignment(selectedItem.value.id)
        toast.success('Berhasil menghapus penugasan')
        showDeleteModal.value = false
        loadData()
    } catch (e) {
        toast.error(e.response?.data?.message || 'Gagal menghapus penugasan')
    } finally {
        deleting.value = false
    }
}

// Lookup functions for async selects
const fetchTeachers = async (query) => {
    const res = await cbtMasterService.getLookups('teachers', { search: query, limit: 30 })
    return res.data?.map(o => ({ value: o.id, label: o.name, description: o.nip ? 'NIP: ' + o.nip : '' })) || []
}

const fetchSubjects = async (query) => {
    const res = await cbtMasterService.getLookups('subjects', { search: query, limit: 30 })
    return res.data?.map(o => ({ value: o.id, label: o.name, description: o.code })) || []
}

const fetchClasses = async (query) => {
    // Classes doesn't ideally search by text broadly but we'll fetch all matching grade/deps if necessary. 
    // Since we pass empty, the controller limits some.
    const res = await cbtMasterService.getLookups('classes', { include_relations: 'true' })
    return res.data?.map(o => ({ value: o.id, label: o.name, description: `${o.grade?.name || ''} ${o.department?.name || ''}` })) || []
}

const fetchAcademicYears = async () => {
    const res = await cbtMasterService.getLookups('academic-years', {})
    return res.data?.map(o => ({ value: o.id, label: o.name, description: o.is_active ? 'Tahun Aktif' : '' })) || []
}

onMounted(() => {
    loadData()
})
</script>
