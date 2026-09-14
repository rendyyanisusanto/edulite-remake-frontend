<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ isEdit ? 'Edit Soal' : 'Buat Soal Baru' }}</h1>
        <p class="text-sm text-gray-500">Tentukan tipe pertanyaan dan siapkan kunci jawabannya di sini.</p>
      </div>
      <div>
        <BaseButton variant="outline" @click="$router.push(`/cbt/question-banks/${bankId}/questions`)">Batal</BaseButton>
      </div>
    </div>

    <form @submit.prevent="submitForm">
      <BaseCard>
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100 pb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Soal <span class="text-red-500">*</span></label>
                <select
                  v-model="form.question_type"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border bg-gray-50"
                  @change="handleTypeChange"
                >
                  <option value="SINGLE_CHOICE">Pilihan Ganda</option>
                  <option value="MULTIPLE_CHOICE">Pilihan Ganda Kompleks</option>
                  <option value="TRUE_FALSE">Benar atau Salah</option>
                  <option value="SHORT_ANSWER">Isian Singkat</option>
                  <option value="ESSAY">Esai</option>
                </select>
              </div>
              <div class="flex gap-4">
                  <div class="flex-1">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Tingkat Kesulitan <span class="text-red-500">*</span></label>
                      <select v-model="form.difficulty" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 py-2 px-3 border">
                          <option value="EASY">Mudah</option>
                          <option value="MEDIUM">Sedang</option>
                          <option value="HARD">Sulit</option>
                      </select>
                  </div>
                  <div class="flex-1">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Bobot (Skor) <span class="text-red-500">*</span></label>
                      <input type="number" step="0.5" min="0" v-model="form.default_score" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 py-2 px-3 border" />
                  </div>
              </div>
          </div>

          <!-- Main Question Box -->
          <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Pertanyaan / Instruksi <span class="text-red-500">*</span></label>
              <textarea
                v-model="form.question_text"
                rows="5"
                required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 py-2 px-3 border font-serif"
                placeholder="Tuliskan isi pertanyaan di sini..."
              ></textarea>
              <div class="mt-2 flex items-center gap-2">
                <input type="url" v-model="form.media_url" placeholder="URL Gambar (Opsional)" class="text-sm py-1 px-2 border rounded flex-1">
                <input type="file" ref="questionMediaInput" @change="uploadMedia($event, 'question')" class="hidden" accept="image/jpeg,image/png,image/webp">
                <BaseButton type="button" size="sm" variant="outline" @click="$refs.questionMediaInput.click()" :icon="icons.image">Upload</BaseButton>
              </div>
              <div v-if="form.media_url" class="mt-2 relative inline-block">
                 <img :src="form.media_url" class="max-h-32 object-contain border rounded" />
                 <button type="button" @click="form.media_url = ''" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">x</button>
              </div>
          </div>

          <!-- Options Editor Base on Type -->
          
          <div v-if="['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(form.question_type)" class="space-y-4 pt-4 border-t border-gray-200">
             <div class="flex justify-between items-center bg-gray-50 p-2 rounded">
                <h3 class="font-bold text-gray-700">Pilihan Jawaban</h3>
                <BaseButton type="button" size="sm" variant="primary" @click="addOption" :icon="icons.plus" class="py-1">Tambah Opsi</BaseButton>
             </div>
             
             <div v-for="(opt, index) in form.options" :key="index" class="flex gap-4 p-4 border rounded-lg" :class="opt.is_correct ? 'border-primary-300 bg-primary-50' : 'border-gray-200 bg-white'">
                 
                 <div class="flex flex-col items-center justify-start gap-2 pt-2">
                     <span class="font-bold text-gray-500">{{ String.fromCharCode(65 + index) }}</span>
                     <input 
                       :type="form.question_type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'" 
                       :name="form.question_type === 'SINGLE_CHOICE' ? 'correct_ans' : `correct_ans_${index}`"
                       :checked="opt.is_correct"
                       @change="setCorrectOption(index, $event.target.checked)"
                       class="w-5 h-5 text-primary-600 focus:ring-primary-500 cursor-pointer"
                       title="Tandai sebagai jawaban benar"
                     />
                     <span class="text-xs text-gray-400 font-medium tracking-tight h-4">{{ opt.is_correct ? 'KUNCI' : '' }}</span>
                 </div>
                 
                 <div class="flex-1 flex flex-col gap-2">
                     <textarea v-model="opt.option_text" rows="2" class="block w-full text-sm rounded border-gray-300 shadow-sm focus:border-primary-500 py-1.5 px-2 border" placeholder="Teks pilihan..."></textarea>
                     
                     <div class="flex items-center gap-2">
                        <input type="url" v-model="opt.media_url" placeholder="URL Gambar Opsi" class="text-xs py-1 px-2 border rounded flex-1">
                        <input type="file" :id="`opt-file-${index}`" @change="uploadMedia($event, 'option', index)" class="hidden" accept="image/jpeg,image/png,image/webp">
                        <BaseButton type="button" size="sm" variant="outline" @click="triggerOptionUpload(index)" class="py-0 px-2 text-xs h-7">Img</BaseButton>
                     </div>
                     <div v-if="opt.media_url" class="relative inline-block mt-1">
                         <img :src="opt.media_url" class="max-h-20 object-contain border rounded" />
                         <button type="button" @click="opt.media_url = ''" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">x</button>
                     </div>
                 </div>
                 
                 <div class="flex-shrink-0 pt-2 flex flex-col gap-1">
                     <button type="button" @click="moveOption(index, -1)" :disabled="index === 0" class="text-gray-400 hover:text-gray-700 disabled:opacity-30">▲</button>
                     <button type="button" @click="moveOption(index, 1)" :disabled="index === form.options.length - 1" class="text-gray-400 hover:text-gray-700 disabled:opacity-30">▼</button>
                     <button type="button" @click="removeOption(index)" :disabled="form.options.length <= 2" class="text-red-400 hover:text-red-700 disabled:opacity-30 mt-2" title="Hapus opsi">✕</button>
                 </div>
             </div>
             <p v-if="form.question_type === 'SINGLE_CHOICE'" class="text-xs text-orange-600 font-medium">* Pilihan ganda hanya mengizinkan 1 kunci jawaban yang benar.</p>
             <p v-else class="text-xs text-orange-600 font-medium">* Pilihan ganda kompleks wajib memiliki setidaknya 1 kunci jawaban yang benar.</p>
          </div>

          <div v-else-if="form.question_type === 'TRUE_FALSE'" class="space-y-4 pt-4 border-t border-gray-200">
              <h3 class="font-bold text-gray-700 mb-2 bg-gray-50 p-2 rounded">Format Benar atau Salah</h3>
              <div class="flex gap-4">
                  <div 
                    class="flex-1 p-6 border rounded-lg cursor-pointer text-center flex flex-col items-center justify-center transition-all"
                    :class="form.options[0]?.is_correct ? 'border-green-500 bg-green-50 shadow-md ring-2 ring-green-200' : 'border-gray-300 bg-white hover:bg-gray-50'"
                    @click="setCorrectOption(0, true)"
                  >
                      <span class="text-2xl font-bold mb-2">BENAR</span>
                      <span v-if="form.options[0]?.is_correct" class="text-sm font-bold text-green-700 tracking-widest bg-green-200 px-3 rounded-full">JAWABAN</span>
                      <span v-else class="text-sm text-gray-400">Pilih sebagai jawaban</span>
                  </div>
                  
                  <div 
                    class="flex-1 p-6 border rounded-lg cursor-pointer text-center flex flex-col items-center justify-center transition-all"
                    :class="form.options[1]?.is_correct ? 'border-red-500 bg-red-50 shadow-md ring-2 ring-red-200' : 'border-gray-300 bg-white hover:bg-gray-50'"
                    @click="setCorrectOption(1, true)"
                  >
                      <span class="text-2xl font-bold mb-2">SALAH</span>
                      <span v-if="form.options[1]?.is_correct" class="text-sm font-bold text-red-700 tracking-widest bg-red-200 px-3 rounded-full">JAWABAN</span>
                      <span v-else class="text-sm text-gray-400">Pilih sebagai jawaban</span>
                  </div>
              </div>
          </div>

          <div v-else-if="form.question_type === 'SHORT_ANSWER'" class="space-y-4 pt-4 border-t border-gray-200">
               <h3 class="font-bold text-gray-700 bg-gray-50 p-2 rounded">Kunci Isian Singkat</h3>
               <p class="text-sm text-gray-500 mb-2">Pemisah tiap kunci menggunakan garis baru (Enter). Masukkan variasi yang dimaklumi benar.</p>
               
               <textarea 
                  v-model="shortAnswerText" 
                  rows="4" 
                  class="block w-full border font-mono text-sm border-gray-300 rounded p-2"
                  placeholder="jawaban baku&#10;jawaban alternatif 1&#10;jawaban alternatif 2"
               ></textarea>

               <div class="flex items-center gap-4 mt-2">
                   <label class="flex items-center gap-2 text-sm text-gray-700">
                       <input type="checkbox" v-model="form.answer_key.caseSensitive" class="rounded text-primary-600 focus:ring-primary-500">
                       Case Sensitive (Perhatikan Huruf Besar/Kecil)
                   </label>
               </div>
          </div>

          <div v-else-if="form.question_type === 'ESSAY'" class="space-y-4 pt-4 border-t border-gray-200">
               <h3 class="font-bold text-gray-700 bg-gray-50 p-2 rounded">Pedoman Esai (Opsional)</h3>
               <div>
                   <label class="block text-sm font-medium text-gray-700 mb-1">Model Jawaban (Referensi)</label>
                   <textarea v-model="form.answer_key.modelAnswer" rows="4" class="block w-full border border-gray-300 rounded p-2 text-sm" placeholder="Contoh jawaban ideal..."></textarea>
               </div>
               <div>
                   <label class="block text-sm font-medium text-gray-700 mb-1">Catatan Penilaian (Rubrik)</label>
                   <textarea v-model="form.answer_key.gradingNotes" rows="3" class="block w-full border border-gray-300 rounded p-2 text-sm" placeholder="Contoh: Kurangi 1 poin jika tidak menyebutkan satuan meter..."></textarea>
               </div>
          </div>

          <!-- Pembahasan -->
          <div class="pt-4 border-t border-gray-200 mt-6">
              <label class="block text-sm font-medium text-gray-700 mb-1">Penjelasan / Pembahasan (Opsional)</label>
              <textarea
                v-model="form.explanation"
                rows="3"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 py-2 px-3 border"
                placeholder="Penjelasan muncul setelah ujian selesai (jika diizinkan sistem)..."
              ></textarea>
          </div>

          <div class="mt-8 pt-4 border-t border-gray-100 flex justify-end gap-3">
              <span v-if="saving" class="text-primary-600 text-sm flex items-center pr-4">Menyimpan...</span>
              <BaseButton variant="outline" type="submit" @click="willActivate = false" :disabled="saving">
                Simpan sebagai Draft
              </BaseButton>
              <BaseButton variant="primary" type="submit" @click="willActivate = true" :disabled="saving">
                Simpan & Aktifkan
              </BaseButton>
          </div>
        </div>
      </BaseCard>
    </form>
    
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import cbtService from '@/services/api/cbt-question-bank.service'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'

const icons = {
  image: `<svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
  plus: `<svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`
}

const router = useRouter()
const route = useRoute()
const bankId = route.params.bankId
const questionId = route.params.questionId
const isEdit = computed(() => !!questionId)

const saving = ref(false)
const willActivate = ref(false)

const form = ref({
    question_type: 'SINGLE_CHOICE',
    question_text: '',
    media_url: '',
    difficulty: 'MEDIUM',
    default_score: 1.0,
    explanation: '',
    options: [
        { option_text: '', is_correct: false, media_url: '' },
        { option_text: '', is_correct: false, media_url: '' },
        { option_text: '', is_correct: false, media_url: '' },
        { option_text: '', is_correct: false, media_url: '' }
    ],
    answer_key: {
        caseSensitive: false,
        modelAnswer: '',
        gradingNotes: '',
        acceptedAnswers: []
    }
})

// Specifically string handler for short answer UI
const shortAnswerText = ref('')

watch(shortAnswerText, (val) => {
    if (form.value.question_type === 'SHORT_ANSWER') {
        form.value.answer_key.acceptedAnswers = val.split('\n').map(l => l.trim()).filter(l => l !== '')
    }
})

const handleTypeChange = (e) => {
    const type = e.target.value
    // If we have content, we should ideally ask for confirmation, 
    // but Vue triggers this automatically. Muted the confirmation for fluidness, 
    // it will be replaced natively by the system on Save.
    
    if (type === 'TRUE_FALSE') {
        form.value.options = [
            { option_text: 'Benar', is_correct: false },
            { option_text: 'Salah', is_correct: false }
        ]
    } else if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(type) && form.value.options.length < 2) {
        form.value.options = [
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false }
        ]
    }
}

// Options management
const addOption = () => {
    form.value.options.push({ option_text: '', is_correct: false, media_url: '' })
}

const removeOption = (index) => {
    form.value.options.splice(index, 1)
}

const moveOption = (index, direction) => {
    const arr = form.value.options
    if (index + direction < 0 || index + direction >= arr.length) return
    const temp = arr[index]
    arr[index] = arr[index + direction]
    arr[index + direction] = temp
}

const setCorrectOption = (index, value) => {
    if (['SINGLE_CHOICE', 'TRUE_FALSE'].includes(form.value.question_type)) {
        // Reset others to false
        form.value.options.forEach((opt, i) => {
            opt.is_correct = (i === index) && value
        })
    } else {
        form.value.options[index].is_correct = value
    }
}

// Media upload system using our direct cbtUpload Api
const triggerOptionUpload = (index) => {
    document.getElementById(`opt-file-${index}`).click()
}

const uploadMedia = async (event, target, index = -1) => {
    const file = event.target.files[0]
    if (!file) return
    
    saving.value = true // Re-use saving state as loading block
    try {
        const res = await cbtService.uploadMedia(file)
        if (target === 'question') {
            form.value.media_url = res.data.url
        } else if (target === 'option' && index >= 0) {
            form.value.options[index].media_url = res.data.url
        }
    } catch(err) {
        alert(err.response?.data?.message || 'Gagal mengunggah media.')
    } finally {
        saving.value = false
        // Reset input value to allow uploading same file again if aborted
        event.target.value = ''
    }
}

const fetchEditingData = async () => {
    try {
        const res = await cbtService.getQuestionDetail(bankId, questionId)
        const q = res.data
        form.value.question_type = q.question_type
        form.value.question_text = q.question_text
        form.value.media_url = q.media_url || ''
        form.value.difficulty = q.difficulty
        form.value.default_score = q.default_score
        form.value.explanation = q.explanation || ''
        
        if (q.options && q.options.length > 0) {
            form.value.options = q.options.map(o => ({
                option_text: o.option_text,
                is_correct: o.is_correct,
                media_url: o.media_url || ''
            }))
        } else {
             // For types that didn't have options but user might switch tabs
             form.value.options = [
                 { option_text: '', is_correct: false },
                 { option_text: '', is_correct: false }
             ]
        }
        
        if (q.answer_key) {
            form.value.answer_key = {
                caseSensitive: q.answer_key.caseSensitive || false,
                modelAnswer: q.answer_key.modelAnswer || '',
                gradingNotes: q.answer_key.gradingNotes || '',
                acceptedAnswers: q.answer_key.acceptedAnswers || []
            }
            if (q.question_type === 'SHORT_ANSWER' && Array.isArray(q.answer_key.acceptedAnswers)) {
                shortAnswerText.value = q.answer_key.acceptedAnswers.join('\n')
            }
        }
    } catch (err) {
        alert('Gagal memuat soal')
        router.push(`/cbt/question-banks/${bankId}/questions`)
    }
}

const submitForm = async () => {
    try {
        saving.value = true
        
        let savedQuestion;
        
        if (isEdit.value) {
            // First we issue the PUT to update data
            const res = await cbtService.updateQuestion(bankId, questionId, form.value)
            savedQuestion = res.data
            // If they also want to activate, we fire the status patch
            if (willActivate.value && savedQuestion.status !== 'ACTIVE') {
                 await cbtService.updateQuestionStatus(bankId, questionId, 'ACTIVE')
            } else if (!willActivate.value && savedQuestion.status === 'ACTIVE') { // they want it draft
                 await cbtService.updateQuestionStatus(bankId, questionId, 'DRAFT')
            }
        } else {
            const res = await cbtService.createQuestion(bankId, form.value)
            savedQuestion = res.data
            if (willActivate.value) {
                 await cbtService.updateQuestionStatus(bankId, savedQuestion.id, 'ACTIVE')
            }
        }
        
        router.push(`/cbt/question-banks/${bankId}/questions`)
    } catch (err) {
        alert(err.response?.data?.message || 'Gagal menyimpan soal. Pastikan semua persyaratan jenis soal terpenuhi (misal: panjang opsi atau minimal ada 1 jawaban benar).')
    } finally {
        saving.value = false
    }
}

onMounted(() => {
    if (isEdit.value) {
        fetchEditingData()
    }
})
</script>
