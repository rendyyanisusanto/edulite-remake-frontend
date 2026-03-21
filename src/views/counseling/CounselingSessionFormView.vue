<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <button @click="$router.back()" class="flex items-center text-sm text-gray-500 hover:text-primary mb-2 transition-colors">
          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          Kembali ke Detail Kasus
        </button>
        <h1 class="text-2xl font-bold text-gray-800">{{ isEditing ? 'Edit Sesi Konseling' : 'Tambah Sesi Konseling' }}</h1>
        <p class="text-sm text-gray-500 mt-1">Catat aktivitas dan perkembangan dari kasus konseling ini.</p>
      </div>
    </div>

    <!-- Loading Detail -->
    <div v-if="loading" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse space-y-4">
      <div class="h-4 bg-gray-200 rounded w-1/3"></div>
      <div class="h-10 bg-gray-100 rounded"></div>
      <div class="h-10 bg-gray-100 rounded"></div>
    </div>

    <!-- Form -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <!-- Context Details -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100" v-if="caseDetail">
        <p class="text-sm font-semibold text-gray-700">Terkait Kasus:</p>
        <p class="text-sm text-gray-600 mt-1"><span class="font-medium text-gray-800">{{ caseDetail.student?.full_name }}</span> - {{ caseDetail.issue_title }}</p>
      </div>

      <form @submit.prevent="saveData" class="space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <!-- Session Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal & Waktu Sesi <span class="text-red-500">*</span></label>
            <input
              v-model="form.session_date"
              type="datetime-local"
              class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
              :class="{ 'border-red-400': errors.session_date }"
            />
            <p v-if="errors.session_date" class="mt-1 text-xs text-red-500">{{ errors.session_date }}</p>
          </div>

          <!-- Method -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Metode <span class="text-red-500">*</span></label>
            <select v-model="form.method" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" :class="{ 'border-red-400': errors.method }">
              <option value="">Pilih Metode</option>
              <option v-for="m in METHOD_OPTIONS" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
            <p v-if="errors.method" class="mt-1 text-xs text-red-500">{{ errors.method }}</p>
          </div>

          <!-- Duration -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Durasi (Menit) <span class="text-red-500">*</span></label>
            <input
              v-model.number="form.duration"
              type="number"
              min="1"
              placeholder="Contoh: 30"
              class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
              :class="{ 'border-red-400': errors.duration }"
            />
            <p v-if="errors.duration" class="mt-1 text-xs text-red-500">{{ errors.duration }}</p>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Catatan Sesi <span class="text-red-500">*</span></label>
          <textarea
            v-model="form.notes"
            rows="4"
            placeholder="Jelaskan apa yang dibahas, hasil observasi, atau tindakan yang diambil dalam sesi ini..."
            class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            :class="{ 'border-red-400': errors.notes }"
          ></textarea>
          <p v-if="errors.notes" class="mt-1 text-xs text-red-500">{{ errors.notes }}</p>
        </div>

        <!-- Next Plan -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rencana Tindak Lanjut</label>
          <textarea
            v-model="form.next_plan"
            rows="3"
            placeholder="Opsional. Langkah apa yang akan dilakukan selanjutnya?"
            class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
          ></textarea>
          <p class="mt-1 text-xs text-gray-500">Isi jika butuh pemantauan atau tindakan lanjutan di masa depan.</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-50">
          <BaseButton variant="outline" type="button" @click="$router.back()">Batal</BaseButton>
          <BaseButton type="submit" :loading="saving">{{ isEditing ? 'Simpan Perubahan' : 'Catat Sesi' }}</BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import counselingSessionService from '@/services/api/counselingSession.service'
import counselingCaseService from '@/services/api/counselingCase.service'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const { success, error: showError } = useToast()

const isEditing = computed(() => !!route.params.id)
const caseId = computed(() => isEditing.value ? form.case_id : route.params.caseId)
const loading = ref(false)
const saving = ref(false)
const caseDetail = ref(null)

const METHOD_OPTIONS = [
  { value: 'FACE_TO_FACE', label: 'Tatap Muka' },
  { value: 'HOME_VISIT', label: 'Kunjungan Rumah' },
  { value: 'PHONE_CALL', label: 'Panggilan Telepon' },
  { value: 'ONLINE_MEETING', label: 'Pertemuan Daring' },
  { value: 'PARENT_MEETING', label: 'Pertemuan Orang Tua' },
  { value: 'CLASS_OBSERVATION', label: 'Observasi Kelas' },
  { value: 'REFERRAL', label: 'Rujukan' },
  { value: 'OTHER', label: 'Lainnya' },
]

// To local datetime string format for input type="datetime-local"
const toLocalDatetime = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const form = reactive({
  case_id: '',
  session_date: toLocalDatetime(new Date()),
  method: '',
  duration: 30,
  notes: '',
  next_plan: '',
})

const errors = reactive({})

const validate = () => {
  Object.keys(errors).forEach(k => delete errors[k])
  let valid = true
  if (!form.session_date) { errors.session_date = 'Tanggal wajib diisi'; valid = false }
  if (!form.method) { errors.method = 'Metode wajib dipilih'; valid = false }
  if (!form.duration || form.duration <= 0) { errors.duration = 'Durasi harus valid'; valid = false }
  if (!form.notes) { errors.notes = 'Catatan wajib diisi'; valid = false }
  return valid
}

const fetchCase = async (cId) => {
  try {
    const r = await counselingCaseService.getById(cId)
    if (r.success) caseDetail.value = r.data
  } catch (e) {
    showError('Gagal memuat detail kasus')
  }
}

const loadDetail = async () => {
  loading.value = true
  try {
    if (isEditing.value) {
      const r = await counselingSessionService.getById(route.params.id)
      if (r.success) {
        const d = r.data
        Object.assign(form, {
          case_id: d.case_id,
          session_date: toLocalDatetime(d.session_date || d.created_at),
          method: d.method,
          duration: d.duration,
          notes: d.notes,
          next_plan: d.next_plan || '',
        })
        fetchCase(d.case_id)
      }
    } else {
      form.case_id = route.params.caseId
      fetchCase(form.case_id)
    }
  } catch (e) {
    showError('Gagal memuat data sesi')
  } finally {
    loading.value = false
  }
}

const saveData = async () => {
  if (!validate()) return
  saving.value = true
  try {
    // Convert back to UTC ISO for saving
    const payload = { ...form, session_date: new Date(form.session_date).toISOString() }
    
    if (isEditing.value) {
      await counselingSessionService.update(route.params.id, payload)
      success('Sesi konseling berhasil diperbarui')
    } else {
      await counselingSessionService.create(payload)
      success('Sesi konseling berhasil dicatat')
    }
    router.push({ name: 'CounselingCaseDetail', params: { id: caseId.value } })
  } catch (e) {
    showError('Gagal menyimpan sesi konseling')
  } finally {
    saving.value = false
  }
}

onMounted(loadDetail)
</script>
