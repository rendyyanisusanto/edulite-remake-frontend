<template>
  <div class="min-h-screen bg-slate-100 p-4 md:p-6 flex items-center justify-center">
    <div class="w-full max-w-2xl space-y-4">
      <div class="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-slate-800">Pengajuan Perijinan Siswa</h1>
          <p class="text-sm text-slate-500 mt-1">Silakan isi formulir di bawah ini dengan lengkap dan benar.</p>
        </div>

        <form @submit.prevent="submitForm" class="space-y-6">
          <!-- Siswa Selection -->
          <div>
            <BaseSearchSelect
              v-model="form.student_id"
              label="Nama Siswa"
              placeholder="Cari nama siswa atau NIS..."
              :fetch-options="fetchStudentOptions"
              required
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Perijinan <span class="text-red-500">*</span></label>
              <select v-model="form.leave_type" required class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
                <option value="" disabled>Pilih Jenis</option>
                <option value="sakit">Sakit</option>
                <option value="izin">Izin</option>
                <option value="keperluan_keluarga">Keperluan Keluarga</option>
                <option value="keperluan_sekolah">Keperluan Sekolah</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai <span class="text-red-500">*</span></label>
              <input type="date" v-model="form.start_date" required class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai <span class="text-red-500">*</span></label>
              <input type="date" v-model="form.end_date" :min="form.start_date" required class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Alasan Lengkap <span class="text-red-500">*</span></label>
            <textarea v-model="form.reason" rows="3" required class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Tuliskan alasan pengajuan..."></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Bukti Lampiran <span class="text-red-500">*</span></label>
            <input type="file" @change="handleFileUpload" required accept=".jpg,.jpeg,.png,.pdf" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            <p class="mt-1 text-xs text-slate-500">Maksimal 2MB. Format yang didukung: JPG, PNG, PDF.</p>
          </div>

          <div class="pt-4 flex justify-end">
            <BaseButton type="submit" :loading="saving" class="w-full sm:w-auto text-base py-2.5 px-6">
              Kirim Pengajuan
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSearchSelect from '@/components/forms/BaseSearchSelect.vue'
import publicApi from '@/services/publicApi'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()
const saving = ref(false)
const selectedFile = ref(null)

const form = reactive({
  student_id: '',
  leave_type: '',
  start_date: '',
  end_date: '',
  reason: ''
})

const kioskToken = import.meta.env.VITE_KIOSK_INTERNAL_TOKEN || localStorage.getItem('kiosk_internal_token') || ''

const kioskHeaders = () => {
  const headers = {}
  if (kioskToken) headers['x-kiosk-token'] = kioskToken
  headers['Content-Type'] = 'multipart/form-data'
  return { headers }
}

const fetchStudentOptions = async (query) => {
  try {
    const res = await publicApi.get('/public/students', { params: { search: query, limit: 15 } })
    if (res.success && res.data) {
      return res.data.map(s => ({ value: s.id, label: s.full_name, description: `NIS: ${s.nis} | Kelas: ${s.class_name || '-'}` }))
    }
    return []
  } catch (e) {
    // If public student API doesn't exist, try the authenticated one or handle appropriately.
    // For now we'll assume there is a public way to get students, or we will just use the standard API with kiosk token
    try {
      const resFallback = await publicApi.get('/students', { params: { search: query, limit: 15 }, headers: kioskHeaders().headers })
      if (resFallback.success && resFallback.data.students) {
         return resFallback.data.students.map(s => ({ value: s.id, label: s.full_name, description: `NIS: ${s.nis}` }))
      }
    } catch (err) {}
    return []
  }
}

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    showError('Ukuran file maksimal 2MB')
    e.target.value = ''
    selectedFile.value = null
    return
  }
  selectedFile.value = file
}

const submitForm = async () => {
  if (form.start_date > form.end_date) {
    showError('Tanggal selesai tidak valid')
    return
  }
  
  if (!form.student_id || !form.leave_type || !form.start_date || !form.end_date || !form.reason || !selectedFile.value) {
    showError('Mohon lengkapi semua data dan lampiran')
    return
  }

  saving.value = true
  try {
    const formData = new FormData()
    formData.append('student_id', form.student_id)
    formData.append('leave_type', form.leave_type)
    formData.append('start_date', form.start_date)
    formData.append('end_date', form.end_date)
    formData.append('reason', form.reason)
    formData.append('attachment', selectedFile.value)

    await publicApi.post('/kiosk/student-leave-requests', formData, kioskHeaders())
    
    success('Pengajuan perijinan berhasil dikirim')
    
    // Reset Form
    Object.assign(form, {
      student_id: '',
      leave_type: '',
      start_date: '',
      end_date: '',
      reason: ''
    })
    selectedFile.value = null
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) fileInput.value = ''

  } catch (e) {
    showError(e.response?.data?.message || 'Gagal mengirim pengajuan')
  } finally {
    saving.value = false
  }
}
</script>
