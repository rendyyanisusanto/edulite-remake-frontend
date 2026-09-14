<template>
  <div class="space-y-6">
    <!-- Header info -->
    <div v-if="loadingBank" class="animate-pulse bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
    
    <div v-else-if="bank" class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-2xl font-bold text-gray-900">{{ bank.name }}</h1>
            <span
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                bank.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              ]"
            >
              {{ bank.status === 'ACTIVE' ? 'Aktif' : 'Arsip' }}
            </span>
          </div>
          <p class="text-gray-600 mb-4">{{ bank.description || 'Tidak ada deskripsi' }}</p>
          
          <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
            <div class="flex items-center gap-1">
                <span class="lucide-book text-gray-400 w-4 h-4 text-center">📖</span>
                {{ bank.Subject?.name }} (Kls: {{ bank.Grade?.level }})
            </div>
            <div class="flex items-center gap-1">
                <span class="lucide-calendar text-gray-400 w-4 h-4 text-center">📅</span>
                T.A: {{ bank.AcademicYear?.name }} ({{ bank.semester }})
            </div>
            <div class="flex items-center gap-1">
                <span class="lucide-user text-gray-400 w-4 h-4 text-center">👤</span>
                Pembuat: {{ bank.creator?.username }}
            </div>
          </div>
        </div>
        
        <div class="flex-shrink-0 flex gap-2">
           <BaseButton
              v-if="canManage"
              variant="primary"
              :icon="icons.plus"
              @click="createNewQuestion"
              :disabled="bank.status === 'ARCHIVED'"
            >
              Tambah Soal
            </BaseButton>
            <BaseButton
              variant="outline"
              @click="$router.push('/cbt/question-banks')"
            >
              Kembali
            </BaseButton>
        </div>
      </div>
      
      <!-- Statistics summary bar -->
      <div class="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Soal</p>
              <p class="text-2xl font-bold text-gray-900">{{ bank.stats?.total || 0 }}</p>
          </div>
          <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Aktif</p>
              <p class="text-2xl font-bold text-green-600">{{ bank.stats?.by_status?.ACTIVE || 0 }}</p>
          </div>
          <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Draft (Menunggu)</p>
              <p class="text-2xl font-bold text-orange-600">{{ bank.stats?.by_status?.DRAFT || 0 }}</p>
          </div>
          <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Pilihan Ganda</p>
              <p class="text-2xl font-bold text-blue-600">{{ (bank.stats?.by_type?.SINGLE_CHOICE || 0) + (bank.stats?.by_type?.MULTIPLE_CHOICE || 0) }}</p>
          </div>
      </div>
    </div>

    <!-- Questions Table -->
    <BaseCard v-if="bank">
      <div class="mb-6 flex flex-col lg:flex-row gap-4">
        <div class="flex-1">
          <BaseInput
            v-model="filters.search"
            type="text"
            placeholder="Cari bagian pertanyaan..."
            :suffixIcon="icons.search"
            @input="debounceSearch"
          />
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
            <select
              v-model="filters.question_type"
              @change="fetchQuestions"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border"
            >
                <option value="">Semua Jenis</option>
                <option value="SINGLE_CHOICE">Pilihan Ganda</option>
                <option value="MULTIPLE_CHOICE">PG Kompleks</option>
                <option value="TRUE_FALSE">Benar / Salah</option>
                <option value="SHORT_ANSWER">Isian Singkat</option>
                <option value="ESSAY">Esai</option>
            </select>
            
            <select
              v-model="filters.difficulty"
              @change="fetchQuestions"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border"
            >
                <option value="">Semua Tingkat</option>
                <option value="EASY">Mudah</option>
                <option value="MEDIUM">Sedang</option>
                <option value="HARD">Sulit</option>
            </select>
        </div>
      </div>

      <div class="relative min-h-[300px]">
        <div v-if="loadingQuestions" class="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>

        <BaseTable
          :columns="columns"
          :data="questions"
          :loading="loadingQuestions"
          :error="errorQuestions"
        >
          <template #cell-question_text="{ row }">
            <div class="max-w-[300px]">
              <!-- We don't render HTML dangerously here in the list, just text preview. So we strip tags roughly -->
              <p class="text-sm text-gray-900 truncate" :title="stripHtml(row.question_text)">
                {{ stripHtml(row.question_text) }}
              </p>
            </div>
          </template>

          <template #cell-question_type="{ row }">
            <span class="text-sm font-medium text-gray-700">
               {{ getTypeName(row.question_type) }}
            </span>
          </template>
          
          <template #cell-difficulty="{ row }">
            <span :class="['text-xs font-medium px-2 py-1 rounded bg-gray-100', getDifficultyColor(row.difficulty)]">
               {{ getDifficultyName(row.difficulty) }}
            </span>
          </template>
          
          <template #cell-default_score="{ row }">
            <span class="text-sm text-gray-600">{{ row.default_score }}</span>
          </template>

          <template #cell-status="{ row }">
            <span
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                row.status === 'ACTIVE' ? 'bg-green-100 text-green-800' 
                : row.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-gray-100 text-gray-800'
              ]"
            >
              {{ row.status }}
            </span>
          </template>

          <template #cell-actions="{ row }">
            <div class="flex items-center justify-end gap-1">
              <BaseButton
                variant="ghost"
                size="sm"
                :icon="icons.eye"
                title="Pratinjau"
                @click="openPreview(row.id)"
              />
              <template v-if="canManage && bank.status !== 'ARCHIVED'">
                  <BaseButton
                    variant="ghost"
                    size="sm"
                    :icon="icons.edit"
                    title="Edit"
                    @click="editQuestion(row.id)"
                  />
                  <BaseButton
                    variant="ghost"
                    size="sm"
                    :icon="icons.copy"
                    title="Gandakan"
                    @click="duplicateQuestion(row.id)"
                  />
                  <BaseButton
                    variant="ghost"
                    size="sm"
                    :icon="row.status === 'ACTIVE' ? icons.archive : icons.checkCircle"
                    :title="row.status === 'ACTIVE' ? 'Arsipkan/Draftkan' : 'Aktifkan'"
                    :class="row.status === 'ACTIVE' ? 'text-orange-600' : 'text-green-600'"
                    @click="toggleQuestionStatus(row)"
                  />
              </template>
            </div>
          </template>
        </BaseTable>
      </div>
    </BaseCard>

    <!-- Preview Modal -->
    <BaseModal
      v-model="previewModal.show"
      title="Pratinjau Soal"
      size="xl"
    >
      <div v-if="previewData" class="space-y-6">
         <!-- Question Content Area -->
         <div class="bg-gray-50 border border-gray-200 rounded p-4 font-serif text-lg leading-relaxed text-gray-900 shadow-inner overflow-x-auto" v-html="previewData.question_text"></div>
         <div v-if="previewData.media_url" class="mt-4">
             <img :src="previewData.media_url" class="max-w-full h-auto max-h-64 rounded shadow" />
         </div>

         <!-- Options or Answers Area -->
         <div v-if="['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(previewData.question_type)" class="space-y-2 mt-4 ml-4">
             <div v-for="(opt, idx) in previewData.options" :key="idx" class="flex gap-4 p-3 border rounded-lg" :class="opt.is_correct ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'">
                 <div class="flex-shrink-0 font-bold mt-1 text-gray-700">{{ opt.option_key }}.</div>
                 <div class="flex-1">
                     <div class="prose max-w-none text-gray-800" v-html="opt.option_text"></div>
                     <img v-if="opt.media_url" :src="opt.media_url" class="mt-2 max-h-32 object-contain border rounded" />
                 </div>
                 <div v-if="opt.is_correct" class="flex-shrink-0">
                     <span class="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-200 text-green-900">
                      KUNCI JAWABAN
                     </span>
                 </div>
             </div>
         </div>
         
         <div v-else-if="previewData.question_type === 'TRUE_FALSE'" class="flex gap-4 mt-4 ml-4">
              <div v-for="(opt, idx) in previewData.options" :key="idx" class="w-1/2 p-4 text-center border rounded-lg font-medium text-lg" :class="opt.is_correct ? 'border-green-400 bg-green-50 text-green-800 shadow' : 'border-gray-200 bg-white text-gray-600'">
                  {{ opt.option_text }}
                  <div v-if="opt.is_correct" class="text-xs text-green-700 mt-2 tracking-widest font-bold">KUNCI JAWABAN</div>
              </div>
         </div>
         
         <div v-else-if="previewData.question_type === 'SHORT_ANSWER'" class="mt-4 bg-yellow-50 p-4 border border-yellow-200 rounded">
             <h4 class="font-bold text-yellow-800 mb-2">Jawaban Diterima:</h4>
             <ul class="list-disc ml-5 text-gray-700 space-y-1">
                 <li v-for="ans in (previewData.answer_key?.acceptedAnswers || [])" :key="ans">{{ ans }}</li>
             </ul>
             <div class="text-xs text-yellow-600 mt-3 font-mono">Sensitif Kapital: {{ previewData.answer_key?.caseSensitive ? 'Ya' : 'Tidak' }}</div>
         </div>
         
         <div v-else-if="previewData.question_type === 'ESSAY'" class="mt-4 bg-indigo-50 p-4 border border-indigo-200 rounded">
             <h4 class="font-bold text-indigo-800 mb-2">Panduan Guru (Model Answer):</h4>
             <p class="text-gray-700 whitespace-pre-wrap">{{ previewData.answer_key?.modelAnswer || 'Tidak ada kunci.' }}</p>
             <h4 class="font-bold text-indigo-800 mt-4 mb-2">Notes Penilaian:</h4>
             <p class="text-gray-700 whitespace-pre-wrap">{{ previewData.answer_key?.gradingNotes || 'Tidak ada catatan.' }}</p>
         </div>

         <!-- Metadata Area -->
         <div class="flex gap-2 justify-end items-center text-sm text-gray-500 pt-4 border-t mt-4 border-gray-200">
            <span>Tipe: <strong class="text-gray-700">{{ getTypeName(previewData.question_type) }}</strong></span> | 
            <span>Kesulitan: <strong class="text-gray-700">{{ getDifficultyName(previewData.difficulty) }}</strong></span> | 
            <span>Bobot: <strong class="text-gray-700">{{ previewData.default_score }}</strong></span>
         </div>
         
         <div v-if="previewData.explanation" class="bg-blue-50 p-4 border border-blue-200 rounded text-sm text-blue-900 mt-2">
            <strong class="block mb-1">Pembahasan:</strong>
            <div v-html="previewData.explanation"></div>
         </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import cbtService from '@/services/api/cbt-question-bank.service'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseModal from '@/components/modals/BaseModal.vue'

const icons = {
  plus: `<svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
  search: `<svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>`,
  eye: `<svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`,
  edit: `<svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
  copy: `<svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`,
  archive: `<svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>`,
  checkCircle: `<svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const bankId = route.params.bankId

const bank = ref(null)
const loadingBank = ref(true)

const questions = ref([])
const loadingQuestions = ref(false)
const errorQuestions = ref(null)

const previewModal = ref({
    show: false,
    loading: false
})
const previewData = ref(null)

const filters = ref({
  search: '',
  question_type: '',
  difficulty: ''
})

const columns = [
  { key: 'question_text', label: 'Cuplikan Pertanyaan' },
  { key: 'question_type', label: 'Tipe' },
  { key: 'difficulty', label: 'Tingkat' },
  { key: 'default_score', label: 'Bobot' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Aksi', align: 'right' }
]

const canManage = computed(() => {
    if (!bank.value) return false
    // Admin with view_all can manage everything
    if (authStore.hasPermission('cbt.question_bank.view_all')) return true;
    // Otherwise only the owner can manage
    return bank.value.created_by === authStore.user?.id;
})

let searchTimeout;
const debounceSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(fetchQuestions, 500);
}

const loadBankData = async () => {
    try {
        loadingBank.value = true
        const res = await cbtService.getQuestionBankDetail(bankId)
        bank.value = res.data
    } catch(err) {
        alert(err.response?.data?.message || 'Gagal memuat info bank soal')
        router.push('/cbt/question-banks')
    } finally {
        loadingBank.value = false
    }
}

const fetchQuestions = async () => {
    try {
        loadingQuestions.value = true
        errorQuestions.value = null
        const params = {
            page: 1, limit: 100, // For test simplicity we push limit a bit
            search: filters.value.search,
            question_type: filters.value.question_type,
            difficulty: filters.value.difficulty
        }
        const res = await cbtService.getQuestions(bankId, params)
        questions.value = res.data?.data || []
    } catch (err) {
        errorQuestions.value = err.response?.data?.message || 'Gagal memuat soal'
    } finally {
        loadingQuestions.value = false
    }
}

// Helpers
const stripHtml = (html) => {
   let doc = new DOMParser().parseFromString(html, 'text/html');
   return doc.body.textContent || "";
}

const getTypeName = (type) => {
    const map = {
        'SINGLE_CHOICE': 'Pilihan Ganda',
        'MULTIPLE_CHOICE': 'PG Kompleks',
        'TRUE_FALSE': 'Benar/Salah',
        'SHORT_ANSWER': 'Isian Singkat',
        'ESSAY': 'Esai'
    }
    return map[type] || type
}

const getDifficultyName = (diff) => {
    const map = { 'EASY': 'Mudah', 'MEDIUM': 'Sedang', 'HARD': 'Sulit' }
    return map[diff] || diff
}

const getDifficultyColor = (diff) => {
    const map = { 'EASY': 'text-green-700', 'MEDIUM': 'text-yellow-700', 'HARD': 'text-red-700' }
    return map[diff] || 'text-gray-700'
}

// Actions
const createNewQuestion = () => {
    router.push(`/cbt/question-banks/${bankId}/questions/create`)
}

const editQuestion = (id) => {
    router.push(`/cbt/question-banks/${bankId}/questions/${id}/edit`)
}

const openPreview = async (id) => {
    try {
        previewModal.value.show = true
        previewData.value = null
        const res = await cbtService.getQuestionDetail(bankId, id)
        previewData.value = res.data
    } catch (err) {
        alert('Gagal memuat pratinjau.')
        previewModal.value.show = false
    }
}

const toggleQuestionStatus = async (row) => {
    let newStatus = row.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE'
    // Draft can be directly activated
    if (row.status === 'DRAFT') newStatus = 'ACTIVE'

    if (!confirm(`Ubah status soal menjadi ${newStatus}?`)) return
    
    try {
        await cbtService.updateQuestionStatus(bankId, row.id, newStatus)
        fetchQuestions() // reload
        loadBankData() // Refresh stats
    } catch (err) {
        alert(err.response?.data?.message || 'Gagal mengubah status soal')
    }
}

const duplicateQuestion = async (id) => {
    if (!confirm('Gandakan soal ini?')) return
    try {
        await cbtService.duplicateQuestion(bankId, id)
        fetchQuestions()
        loadBankData() // Refresh stats
    } catch (err) {
        alert(err.response?.data?.message || 'Gagal menggandakan soal')
    }
}

onMounted(() => {
    loadBankData()
    fetchQuestions()
})
</script>
