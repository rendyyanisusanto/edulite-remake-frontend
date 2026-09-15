<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Kiosk Perijinan</h2>
        <p class="mt-2 text-sm text-gray-600">Ajukan perijinan atau sakit untuk siswa</p>
      </div>

      <!-- Form Card -->
      <div class="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div v-if="successMessage" class="p-8 text-center space-y-4">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900">Pengajuan Berhasil</h3>
          <p class="text-gray-500">{{ successMessage }}</p>
          <button @click="resetForm" class="mt-4 w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Buat Pengajuan Lagi
          </button>
        </div>

        <form v-else @submit.prevent="submitForm" class="p-6 sm:p-8 space-y-6">
          <!-- Student Select -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cari Siswa <span class="text-red-500">*</span></label>
            <BaseSearchSelect
              v-model="form.student_id"
              label=""
              placeholder="Ketik nama atau NIS siswa..."
              :fetch-options="fetchStudentOptions"
              required
            />
          </div>

          <!-- Leave Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Perijinan <span class="text-red-500">*</span></label>
            <div class="grid grid-cols-2 gap-3">
              <label v-for="t in LEAVE_TYPES" :key="t.value" class="relative flex cursor-pointer rounded-xl border bg-white p-3 shadow-sm focus:outline-none" :class="form.leave_type === t.value ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-blue-200'">
                <input type="radio" v-model="form.leave_type" :value="t.value" class="sr-only" required>
                <span class="flex flex-col">
                  <span class="block text-sm font-medium" :class="form.leave_type === t.value ? 'text-blue-900' : 'text-gray-900'">{{ t.label }}</span>
                </span>
              </label>
            </div>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal <span class="text-red-500">*</span></label>
              <input type="date" v-model="form.start_date" required class="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-colors" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sampai <span class="text-red-500">*</span></label>
              <input type="date" v-model="form.end_date" :min="form.start_date" required class="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-colors" />
            </div>
          </div>

          <!-- Reason -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Alasan / Keterangan <span class="text-red-500">*</span></label>
            <textarea v-model="form.reason" rows="3" required class="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-colors" placeholder="Tuliskan alasan perijinan dengan jelas..."></textarea>
          </div>

          <!-- Attachment -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Bukti Foto / Surat <span class="text-red-500">*</span></label>
            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl" :class="{ 'bg-blue-50 border-blue-300': selectedFile }">
              <div class="space-y-1 text-center">
                <svg v-if="!selectedFile" class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div v-else class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-2">
                  <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div class="flex text-sm text-gray-600 justify-center">
                  <label class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500" :class="{ 'bg-transparent': selectedFile }">
                    <span>{{ selectedFile ? 'Ganti File' : 'Upload File' }}</span>
                    <input type="file" @change="handleFileUpload" required accept=".jpg,.jpeg,.png,.pdf" class="sr-only" />
                  </label>
                </div>
                <p class="text-xs text-gray-500" v-if="!selectedFile">PNG, JPG, PDF up to 5MB</p>
                <p class="text-xs font-semibold text-gray-700 mt-1" v-else>{{ selectedFile.name }}</p>
              </div>
            </div>
          </div>

          <!-- Submit -->
          <div>
            <button type="submit" :disabled="submitting" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70">
              <svg v-if="submitting" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              {{ submitting ? 'Mengirim...' : 'Kirim Pengajuan' }}
            </button>
          </div>
        </form>
      </div>

      <div class="mt-6 text-center text-xs text-gray-500">
        &copy; {{ new Date().getFullYear() }} Kiosk Perijinan Siswa.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import BaseSearchSelect from '@/components/forms/BaseSearchSelect.vue'
import studentLeaveRequestService from '@/services/api/studentLeaveRequest.service'
import { useToast } from '@/composables/useToast'

const { error: showError } = useToast()

const LEAVE_TYPES = [
  { value: 'sakit', label: 'Sakit' },
  { value: 'izin', label: 'Izin' },
  { value: 'keperluan_keluarga', label: 'Keperluan Keluarga' },
  { value: 'lainnya', label: 'Lainnya' },
]

const form = reactive({
  student_id: '',
  leave_type: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date().toISOString().split('T')[0],
  reason: ''
})

const selectedFile = ref(null)
const submitting = ref(false)
const successMessage = ref('')

const fetchStudentOptions = async (query) => {
  try {
    const res = await studentLeaveRequestService.searchStudentsPublic({ search: query, limit: 10, page: 1 })
    if (res.success && res.data.students) {
      return res.data.students.map(s => ({ value: s.id, label: s.full_name, description: `NIS: ${s.nis}` }))
    }
    return []
  } catch (e) { return [] }
}

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    showError('Ukuran file maksimal 5MB')
    e.target.value = ''
    selectedFile.value = null
    return
  }
  selectedFile.value = file
}

const submitForm = async () => {
  if (!form.student_id) {
    showError('Pilih siswa terlebih dahulu')
    return
  }
  if (!form.leave_type) {
    showError('Pilih jenis perijinan')
    return
  }
  if (form.start_date > form.end_date) {
    showError('Tanggal selesai tidak valid')
    return
  }
  if (!selectedFile.value) {
    showError('Harap lampirkan bukti foto / surat')
    return
  }

  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('student_id', form.student_id)
    formData.append('leave_type', form.leave_type)
    formData.append('start_date', form.start_date)
    formData.append('end_date', form.end_date)
    formData.append('reason', form.reason)
    formData.append('attachment', selectedFile.value)

    await studentLeaveRequestService.createPublic(formData)
    successMessage.value = 'Pengajuan perijinan telah berhasil dikirim dan menunggu persetujuan.'
  } catch (e) {
    showError(e.response?.data?.message || 'Terjadi kesalahan saat mengirim pengajuan.')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  form.student_id = ''
  form.leave_type = ''
  form.start_date = new Date().toISOString().split('T')[0]
  form.end_date = new Date().toISOString().split('T')[0]
  form.reason = ''
  selectedFile.value = null
  successMessage.value = ''
}
</script>
