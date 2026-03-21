<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <button @click="$router.back()" class="flex items-center text-sm text-gray-500 hover:text-primary mb-2 transition-colors">
          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          Kembali
        </button>
        <h1 class="text-2xl font-bold text-gray-800">{{ isEditing ? 'Edit Kasus Konseling' : 'Buat Kasus Konseling Baru' }}</h1>
        <p class="text-sm text-gray-500 mt-1">{{ isEditing ? 'Perbarui informasi kasus konseling.' : 'Isi formulir untuk mencatat kasus konseling baru.' }}</p>
      </div>
    </div>

    <!-- Loading Detail (edit mode) -->
    <div v-if="detailLoading" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse space-y-4">
      <div class="h-4 bg-gray-200 rounded w-1/3"></div>
      <div class="h-10 bg-gray-100 rounded"></div>
      <div class="h-10 bg-gray-100 rounded"></div>
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <form @submit.prevent="saveData" class="space-y-5">
        <!-- Student -->
        <div>
          <BaseSearchSelect
            v-model="form.student_id"
            :initial-label="form.student_name"
            label="Siswa"
            placeholder="Ketik nama siswa atau NIS..."
            :fetch-options="fetchStudentOptions"
            required
            :disabled="isEditing"
          />
          <p v-if="errors.student_id" class="mt-1 text-xs text-red-500">{{ errors.student_id }}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <!-- Source -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sumber <span class="text-red-500">*</span></label>
            <select v-model="form.source" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" :class="{ 'border-red-400': errors.source }">
              <option value="">Pilih Sumber</option>
              <option v-for="s in SOURCE_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
            <p v-if="errors.source" class="mt-1 text-xs text-red-500">{{ errors.source }}</p>
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kategori <span class="text-red-500">*</span></label>
            <select v-model="form.category" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" :class="{ 'border-red-400': errors.category }">
              <option value="">Pilih Kategori</option>
              <option v-for="c in CATEGORY_OPTIONS" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>
            <p v-if="errors.category" class="mt-1 text-xs text-red-500">{{ errors.category }}</p>
          </div>

          <!-- Level -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Level <span class="text-red-500">*</span></label>
            <select v-model="form.level" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" :class="{ 'border-red-400': errors.level }">
              <option value="">Pilih Level</option>
              <option v-for="l in LEVEL_OPTIONS" :key="l.value" :value="l.value">{{ l.label }}</option>
            </select>
            <p v-if="errors.level" class="mt-1 text-xs text-red-500">{{ errors.level }}</p>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status <span class="text-red-500">*</span></label>
            <select v-model="form.status" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" :class="{ 'border-red-400': errors.status }">
              <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
            <p v-if="errors.status" class="mt-1 text-xs text-red-500">{{ errors.status }}</p>
          </div>
        </div>

        <!-- Issue Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Judul Masalah <span class="text-red-500">*</span></label>
          <input
            v-model="form.issue_title"
            type="text"
            maxlength="150"
            placeholder="Contoh: Sering tidak hadir tanpa keterangan"
            class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
            :class="{ 'border-red-400': errors.issue_title }"
          />
          <p v-if="errors.issue_title" class="mt-1 text-xs text-red-500">{{ errors.issue_title }}</p>
        </div>

        <!-- Issue Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi Masalah <span class="text-red-500">*</span></label>
          <textarea
            v-model="form.issue_description"
            rows="4"
            placeholder="Jelaskan detail masalah, kronologi, atau informasi penting lainnya..."
            class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            :class="{ 'border-red-400': errors.issue_description }"
          ></textarea>
          <p v-if="errors.issue_description" class="mt-1 text-xs text-red-500">{{ errors.issue_description }}</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-2 border-t border-gray-50">
          <BaseButton variant="outline" type="button" @click="$router.back()">Batal</BaseButton>
          <BaseButton type="submit" :loading="saving">{{ isEditing ? 'Simpan Perubahan' : 'Buat Kasus' }}</BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSearchSelect from '@/components/forms/BaseSearchSelect.vue'
import counselingCaseService from '@/services/api/counselingCase.service'
import studentService from '@/services/api/student.service'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const { success, error: showError } = useToast()

const isEditing = computed(() => !!route.params.id)
const detailLoading = ref(false)
const saving = ref(false)

const SOURCE_OPTIONS = [
  { value: 'HOMEROOM_TEACHER', label: 'Wali Kelas' },
  { value: 'SUBJECT_TEACHER', label: 'Guru Mapel' },
  { value: 'PARENT', label: 'Orang Tua' },
  { value: 'STUDENT_SELF_REPORT', label: 'Lapor Diri' },
  { value: 'DISCIPLINE_TEAM', label: 'Tim Kedisiplinan' },
  { value: 'COUNSELOR', label: 'Konselor' },
  { value: 'OTHER', label: 'Lainnya' },
]
const CATEGORY_OPTIONS = [
  { value: 'ACADEMIC', label: 'Akademik' },
  { value: 'BEHAVIOR', label: 'Perilaku' },
  { value: 'DISCIPLINE', label: 'Disiplin' },
  { value: 'SOCIAL', label: 'Sosial' },
  { value: 'EMOTIONAL', label: 'Emosional' },
  { value: 'ATTENDANCE', label: 'Kehadiran' },
  { value: 'FAMILY', label: 'Keluarga' },
  { value: 'OTHER', label: 'Lainnya' },
]
const LEVEL_OPTIONS = [
  { value: 'LOW', label: 'Rendah' },
  { value: 'MEDIUM', label: 'Sedang' },
  { value: 'HIGH', label: 'Tinggi' },
  { value: 'CRITICAL', label: 'Kritis' },
]
const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Terbuka' },
  { value: 'IN_PROGRESS', label: 'Sedang Diproses' },
  { value: 'RESOLVED', label: 'Selesai' },
  { value: 'CLOSED', label: 'Ditutup' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
]

const form = reactive({
  student_id: '',
  student_name: '',
  source: '',
  issue_title: '',
  issue_description: '',
  category: '',
  level: '',
  status: 'OPEN',
})

const errors = reactive({})

const validate = () => {
  Object.keys(errors).forEach(k => delete errors[k])
  let valid = true
  if (!form.student_id) { errors.student_id = 'Siswa wajib dipilih'; valid = false }
  if (!form.source) { errors.source = 'Sumber wajib dipilih'; valid = false }
  if (!form.issue_title) { errors.issue_title = 'Judul masalah wajib diisi'; valid = false }
  if (!form.issue_description) { errors.issue_description = 'Deskripsi masalah wajib diisi'; valid = false }
  if (!form.category) { errors.category = 'Kategori wajib dipilih'; valid = false }
  if (!form.level) { errors.level = 'Level wajib dipilih'; valid = false }
  if (!form.status) { errors.status = 'Status wajib dipilih'; valid = false }
  return valid
}

const fetchStudentOptions = async (query) => {
  try {
    const res = await studentService.getAll({ search: query, limit: 15, page: 1 })
    if (res.success && res.data.students) {
      return res.data.students.map(s => ({ value: s.id, label: s.full_name, description: `NIS: ${s.nis}` }))
    }
    return []
  } catch (e) { return [] }
}

const loadDetail = async () => {
  if (!isEditing.value) return
  detailLoading.value = true
  try {
    const r = await counselingCaseService.getById(route.params.id)
    if (r.success) {
      const d = r.data
      Object.assign(form, {
        student_id: d.student_id,
        student_name: d.student?.full_name || '',
        source: d.source,
        issue_title: d.issue_title,
        issue_description: d.issue_description,
        category: d.category,
        level: d.level,
        status: d.status,
      })
    }
  } catch (e) {
    showError('Gagal memuat data kasus')
  } finally {
    detailLoading.value = false
  }
}

const saveData = async () => {
  if (!validate()) return
  saving.value = true
  try {
    if (isEditing.value) {
      await counselingCaseService.update(route.params.id, form)
      success('Kasus konseling berhasil diperbarui')
      router.push({ name: 'CounselingCaseDetail', params: { id: route.params.id } })
    } else {
      const r = await counselingCaseService.create(form)
      success('Kasus konseling berhasil dibuat')
      router.push({ name: 'CounselingCaseDetail', params: { id: r.data.id } })
    }
  } catch (e) {
    showError('Gagal menyimpan kasus konseling')
  } finally {
    saving.value = false
  }
}

onMounted(loadDetail)
</script>
