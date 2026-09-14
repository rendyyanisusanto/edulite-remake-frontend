<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Bank Soal</h1>
        <p class="text-sm text-gray-500">Kelola kumpulan soal berdasarkan mata pelajaran dan tingkat kelas.</p>
      </div>
      <div class="flex gap-2">
        <BaseButton
          variant="outline"
          :icon="icons.refresh"
          @click="fetchQuestionBanks"
          :disabled="loading"
        >
          Muat Ulang
        </BaseButton>
        <BaseButton
          v-if="hasCreateAccess"
          variant="primary"
          :icon="icons.plus"
          @click="openCreateModal"
        >
          Tambah Bank Soal
        </BaseButton>
      </div>
    </div>

    <BaseCard>
      <div class="mb-6 flex flex-col lg:flex-row gap-4">
        <div class="flex-1">
          <BaseInput
            v-model="filters.search"
            type="text"
            placeholder="Cari nama bank soal..."
            :suffixIcon="icons.search"
            @input="debounceSearch"
          />
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
            <BaseSearchSelect
                v-model="filters.status"
                :options="statusOptions"
                placeholder="Semua Status"
                @change="fetchQuestionBanks"
            />
        </div>
      </div>

      <div class="relative min-h-[400px]">
        <div v-if="loading" class="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>

        <BaseTable
          :columns="columns"
          :data="questionBanks"
          :loading="loading"
          :error="error"
        >
          <template #cell-name="{ row }">
            <div>
              <p class="font-medium text-gray-900 group-hover:text-primary-600 truncate max-w-[200px]" :title="row.name">
                {{ row.name }}
              </p>
              <p class="text-xs text-gray-500 truncate max-w-[200px]" :title="row.description || '-'">
                {{ row.description || 'Tidak ada deskripsi' }}
              </p>
            </div>
          </template>

          <template #cell-subject="{ row }">
            <div>
              <p class="font-medium text-gray-900">{{ row.Subject?.name || '-' }}</p>
              <p class="text-xs text-gray-500">
                Kls: {{ row.Grade?.level || '-' }} • Sem: {{ row.semester }}
              </p>
            </div>
          </template>
          
          <template #cell-creator="{ row }">
            <span class="text-sm text-gray-600">{{ row.creator?.username || 'Sistem' }}</span>
          </template>

          <template #cell-total_questions="{ row }">
            <span class="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ row.total_questions }} Soal
            </span>
          </template>

          <template #cell-status="{ row }">
            <span
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                row.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              ]"
            >
              {{ row.status === 'ACTIVE' ? 'Aktif' : 'Arsip' }}
            </span>
          </template>

          <template #cell-actions="{ row }">
            <div class="flex items-center justify-end gap-2">
              <BaseButton
                variant="outline"
                size="sm"
                :icon="icons.folderOpen"
                @click="goToQuestions(row.id)"
                title="Buka Bank Soal"
              >
                Buka
              </BaseButton>
              
              <!-- Action Dropdown for Edit / Archive (Can just use horizontal buttons for simplicity) -->
              <BaseButton
                v-if="canManage(row)"
                variant="ghost"
                size="sm"
                :icon="icons.edit"
                @click="openEditModal(row)"
                title="Edit"
              />
              <BaseButton
                v-if="canManage(row)"
                variant="ghost"
                size="sm"
                :icon="row.status === 'ACTIVE' ? icons.archive : icons.checkCircle"
                :title="row.status === 'ACTIVE' ? 'Arsipkan' : 'Aktifkan'"
                :class="row.status === 'ACTIVE' ? 'text-orange-600' : 'text-green-600'"
                @click="toggleStatus(row)"
              />
            </div>
          </template>
        </BaseTable>

        <!-- Pagination could be implemented here as standard Edulite pages -->
      </div>
    </BaseCard>

    <!-- Modal Form -->
    <BaseModal
      v-model="modal.show"
      :title="modal.isEdit ? 'Edit Bank Soal' : 'Tambah Bank Soal'"
      size="md"
    >
      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Bank Soal <span class="text-red-500">*</span></label>
          <BaseInput
            v-model="form.name"
            required
            placeholder="Contoh: UTS Matematika 2026"
          />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran <span class="text-red-500">*</span></label>
              <BaseSearchSelect
                v-model="form.subject_id"
                :fetch-options="fetchSubjects"
                placeholder="Pilih Mapel..."
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tingkat Kelas <span class="text-red-500">*</span></label>
              <BaseSearchSelect
                v-model="form.grade_id"
                :fetch-options="fetchGrades"
                placeholder="Pilih Tingkat..."
                required
              />
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran <span class="text-red-500">*</span></label>
              <BaseSearchSelect
                v-model="form.academic_year_id"
                :fetch-options="fetchAcademicYears"
                placeholder="Pilih Tahun..."
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Semester <span class="text-red-500">*</span></label>
              <select
                v-model="form.semester"
                required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border"
              >
                <option value="GANJIL">GANJIL</option>
                <option value="GENAP">GENAP</option>
              </select>
            </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi & Catatan</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3"
            placeholder="Opsional"
          ></textarea>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <BaseButton variant="outline" type="button" @click="modal.show = false">
            Batal
          </BaseButton>
          <BaseButton variant="primary" type="submit" :loading="modal.submitting">
            Simpan
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import cbtQuestionBankService from '@/services/api/cbt-question-bank.service'
import cbtMasterService from '@/services/api/cbt-master.service'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseSearchSelect from '@/components/forms/BaseSearchSelect.vue'
import BaseModal from '@/components/modals/BaseModal.vue'

const icons = {
  refresh: `<svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`,
  plus: `<svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
  search: `<svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>`,
  folderOpen: `<svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"/></svg>`,
  edit: `<svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
  archive: `<svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>`,
  checkCircle: `<svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
}

const router = useRouter()
const authStore = useAuthStore()

// State
const questionBanks = ref([])
const loading = ref(false)
const error = ref(null)

const filters = ref({
  search: '',
  status: ''
})

const statusOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'ARCHIVED', label: 'Diarsipkan' }
]

const columns = [
  { key: 'name', label: 'Nama Bank Soal' },
  { key: 'subject', label: 'Mapel & Tingkat' },
  { key: 'creator', label: 'Pembuat' },
  { key: 'total_questions', label: 'Jml Soal', align: 'center' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Aksi', align: 'right' }
]

const modal = ref({
  show: false,
  isEdit: false,
  id: null,
  submitting: false
})

const form = ref({
  name: '',
  subject_id: null,
  grade_id: null,
  academic_year_id: null,
  semester: 'GANJIL',
  description: ''
})

// Permissions Helpers
const hasCreateAccess = authStore.hasPermission('cbt.question_bank.create')

const canManage = (row) => {
    // Admin with view_all can manage everything
    if (authStore.hasPermission('cbt.question_bank.view_all')) return true;
    // Otherwise only the owner can manage
    return row.created_by === authStore.user?.id;
}

// Fetch Logic
let searchTimeout;
const debounceSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(fetchQuestionBanks, 500);
}

const fetchQuestionBanks = async () => {
    try {
        loading.value = true
        error.value = null
        const params = {
            page: 1, limit: 25,
            search: filters.value.search,
            status: filters.value.status
        }
        const res = await cbtQuestionBankService.getQuestionBanks(params)
        questionBanks.value = res.data?.data || []
    } catch (err) {
        error.value = err.response?.data?.message || 'Gagal memuat bank soal'
    } finally {
        loading.value = false
    }
}

// Lookups for Forms
const fetchSubjects = async (search) => {
    const res = await cbtMasterService.getLookups('subjects', { search })
    return res.data?.map(item => ({ value: item.id, label: item.name })) || []
}

const fetchGrades = async () => {
    const res = await cbtMasterService.getLookups('grades')
    return res.data?.map(item => ({ value: item.id, label: item.name })) || []
}

const fetchAcademicYears = async () => {
    const res = await cbtMasterService.getLookups('academic-years')
    return res.data?.map(item => ({ value: item.id, label: item.name })) || []
}

// Actions
const goToQuestions = (id) => {
    router.push(`/cbt/question-banks/${id}/questions`)
}

const resetForm = () => {
    form.value = {
        name: '',
        subject_id: null,
        grade_id: null,
        academic_year_id: null,
        semester: 'GANJIL',
        description: ''
    }
}

const openCreateModal = () => {
    resetForm()
    modal.value = { show: true, isEdit: false, id: null, submitting: false }
}

const openEditModal = (row) => {
    form.value = {
        name: row.name,
        subject_id: row.subject_id,
        grade_id: row.grade_id,
        academic_year_id: row.academic_year_id,
        semester: row.semester || 'GANJIL',
        description: row.description || ''
    }
    modal.value = { show: true, isEdit: true, id: row.id, submitting: false }
}

const toggleStatus = async (row) => {
    if (!confirm(`Apakah Anda yakin ingin ${row.status==='ACTIVE'?'mengarsipkan':'mengaktifkan'} bank soal ini?`)) return
    
    try {
        const payload = row.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
        await cbtQuestionBankService.updateQuestionBankStatus(row.id, payload)
        // Auto toast typically handled by generic or just re-fetch
        fetchQuestionBanks()
    } catch (err) {
        alert(err.response?.data?.message || 'Gagal mengubah status')
    }
}

const submitForm = async () => {
    try {
        modal.value.submitting = true
        if (modal.value.isEdit) {
            await cbtQuestionBankService.updateQuestionBank(modal.value.id, form.value)
        } else {
            await cbtQuestionBankService.createQuestionBank(form.value)
        }
        modal.value.show = false
        fetchQuestionBanks()
    } catch (err) {
        alert(err.response?.data?.message || 'Gagal menyimpan bank soal. Cek validasi penugasan/field.')
    } finally {
        modal.value.submitting = false
    }
}

onMounted(() => {
    fetchQuestionBanks()
})
</script>
