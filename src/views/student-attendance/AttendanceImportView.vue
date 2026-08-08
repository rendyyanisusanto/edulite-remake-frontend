<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Import Absensi per Kelas</h1>
        <p class="text-sm text-gray-500 mt-1">Import data absensi dari file Excel atau CSV.</p>
      </div>
      <BaseButton
        @click="downloadTemplate"
        variant="outline"
      >
        <svg class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        Download Template
      </BaseButton>
    </div>

    <!-- Format Requirements -->
    <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <svg class="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div class="flex-1">
          <p class="text-sm text-amber-800 font-medium">Format File Import</p>
          <div class="mt-3 bg-white rounded-lg border border-amber-200 p-3">
            <table class="text-sm">
              <thead>
                <tr class="border-b border-amber-200">
                  <th class="text-left py-2 px-3 font-semibold text-amber-900">Kolom</th>
                  <th class="text-left py-2 px-3 font-semibold text-amber-900">Wajib</th>
                  <th class="text-left py-2 px-3 font-semibold text-amber-900">Keterangan</th>
                </tr>
              </thead>
              <tbody class="text-amber-800">
                <tr>
                  <td class="py-2 px-3 font-mono text-xs">NIS</td>
                  <td class="py-2 px-3">Ya</td>
                  <td class="py-2 px-3">Nomor Induk Siswa</td>
                </tr>
                <tr>
                  <td class="py-2 px-3 font-mono text-xs">Status</td>
                  <td class="py-2 px-3">Ya</td>
                  <td class="py-2 px-3">HADIR/TERLAMBAT/IZIN/SAKIT/ALPA</td>
                </tr>
                <tr>
                  <td class="py-2 px-3 font-mono text-xs">Jam_Masuk</td>
                  <td class="py-2 px-3">Tidak</td>
                  <td class="py-2 px-3">Format HH:MM (contoh: 07:15)</td>
                </tr>
                <tr>
                  <td class="py-2 px-3 font-mono text-xs">Keterangan</td>
                  <td class="py-2 px-3">Tidak</td>
                  <td class="py-2 px-3">Catatan opsional</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Selector Card -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
          <input
            v-model="filters.date"
            type="date"
            class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
          <select
            v-model="filters.class_id"
            class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="">Pilih Kelas</option>
            <option v-for="klass in classes" :key="klass.id" :value="String(klass.id)">
              {{ klass.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- File Upload Section -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
      <div class="flex items-center gap-3">
        <input
          ref="fileInputRef"
          type="file"
          accept=".xlsx,.xls,.csv"
          @change="handleFileSelect"
          class="hidden"
        />
        <BaseButton
          @click="openFilePicker"
          variant="outline"
          :disabled="!filters.class_id || !filters.date"
        >
          <svg class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
          </svg>
          Pilih File
        </BaseButton>
        <div v-if="selectedFile" class="flex-1">
          <span class="text-sm text-gray-800 font-medium">{{ selectedFile.name }}</span>
          <span class="text-xs text-gray-500 ml-2">({{ formatFileSize(selectedFile.size) }})</span>
        </div>
        <div v-else class="flex-1 text-sm text-gray-500">
          Belum ada file dipilih
        </div>
      </div>

      <!-- File Format Info -->
      <div v-if="selectedFile" class="mt-4 flex items-center gap-2">
        <svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <span class="text-sm text-green-700">File valid: {{ selectedFile.name }}</span>
      </div>
    </div>

    <!-- Validation Section -->
    <div v-if="selectedFile" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-800">Validasi Import</h3>
        <BaseButton
          @click="validateFile"
          :loading="validating"
          variant="outline"
        >
          <svg class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Validasi File
        </BaseButton>
      </div>

      <!-- Validation Results -->
      <div v-if="validationResult" class="space-y-4">
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-xs text-green-600 font-medium">Valid</p>
            <p class="text-2xl font-bold text-green-700 mt-1">{{ validationResult.valid_count }}</p>
          </div>
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-xs text-red-600 font-medium">Error</p>
            <p class="text-2xl font-bold text-red-700 mt-1">{{ validationResult.error_count }}</p>
          </div>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-xs text-blue-600 font-medium">Total Baris</p>
            <p class="text-2xl font-bold text-blue-700 mt-1">{{ validationResult.rows?.length || 0 }}</p>
          </div>
          <div class="flex items-end">
            <BaseButton
              v-if="hasValidRecords"
              @click="importFile"
              :loading="importing"
              class="w-full"
            >
              <svg class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Import Data
            </BaseButton>
          </div>
        </div>

        <!-- Error Details -->
        <div v-if="hasErrors" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-red-800 mb-2">Detail Error</h4>
          <div class="max-h-48 overflow-y-auto space-y-1">
            <div
              v-for="(err, index) in validationResult.errors"
              :key="index"
              class="text-xs text-red-700"
            >
              Baris {{ err.row }} (NIS: {{ err.nis }}): {{ err.error }}
            </div>
          </div>
        </div>

        <!-- Preview Table -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <div class="overflow-x-auto max-h-96">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Baris</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Status</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Error</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="row in validationResult.rows"
                  :key="row.row_num"
                  :class="row.status === 'error' ? 'bg-red-50' : 'bg-green-50'"
                >
                  <td class="px-3 py-2 text-sm text-gray-900">{{ row.row_num }}</td>
                  <td class="px-3 py-2 text-sm font-mono text-gray-900">{{ row.nis }}</td>
                  <td class="px-3 py-2 text-sm text-gray-900">{{ row.student_name }}</td>
                  <td class="px-3 py-2 text-sm text-gray-900">{{ row.attendance_status }}</td>
                  <td class="px-3 py-2 text-sm text-gray-900">{{ row.clock_in_at || '-' }}</td>
                  <td class="px-3 py-2 text-sm text-gray-900">{{ row.notes || '-' }}</td>
                  <td class="px-3 py-2">
                    <span
                      class="px-2 py-0.5 rounded text-xs font-medium"
                      :class="row.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'"
                    >
                      {{ row.status === 'error' ? 'Error' : 'Valid' }}
                    </span>
                  </td>
                  <td class="px-3 py-2 text-sm text-red-600">{{ row.error || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="importSuccess" class="bg-green-50 border border-green-200 rounded-lg p-4">
      <div class="flex items-center gap-3">
        <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div class="flex-1">
          <p class="text-sm font-semibold text-green-800">Import Berhasil!</p>
          <p class="text-sm text-green-700 mt-1">{{ importSuccessMessage }}</p>
        </div>
        <BaseButton
          @click="resetForm"
          variant="outline"
          class="shrink-0"
        >
          Import Lagi
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/ui/BaseButton.vue'
import studentAttendanceService from '@/services/api/studentAttendance.service'
import { classService } from '@/services/api/academic.service'

const authStore = useAuthStore()
const { success, error } = useToast()

// Permissions
const canView = computed(() => authStore.hasPermission('attendance.view'))
const canImport = computed(() => authStore.hasPermission('attendance.import'))

// Get today's date in YYYY-MM-DD format
const getToday = () => {
  return new Date().toISOString().split('T')[0]
}

// Reactive state
const filters = reactive({
  date: getToday(),
  class_id: ''
})

const classes = ref([])
const fileInputRef = ref(null)
const selectedFile = ref(null)
const validating = ref(false)
const importing = ref(false)
const validationResult = ref(null)
const importSuccess = ref(false)
const importSuccessMessage = ref('')

// Computed
const hasValidRecords = computed(() =>
  validationResult.value?.valid_count > 0
)

const hasErrors = computed(() =>
  validationResult.value?.error_count > 0
)

// Methods
const loadClasses = async () => {
  try {
    const response = await classService.getAll({ limit: 300 })
    if (response.success) {
      classes.value = response.data?.classes || []
    }
  } catch (err) {
    // Silently fail
  }
}

const openFilePicker = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ]

  if (!validTypes.includes(file.type)) {
    error('File harus berupa Excel (.xlsx, .xls) atau CSV')
    return
  }

  selectedFile.value = file
  validationResult.value = null
  importSuccess.value = false
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const validateFile = async () => {
  if (!selectedFile.value) {
    error('Pilih file terlebih dahulu')
    return
  }

  if (!filters.class_id) {
    error('Pilih kelas terlebih dahulu')
    return
  }

  if (!canImport.value) {
    error('Anda tidak memiliki izin untuk import data')
    return
  }

  validating.value = true
  try {
    const response = await studentAttendanceService.validateImport(
      selectedFile.value,
      {
        date: filters.date,
        class_id: filters.class_id
      }
    )

    if (response.success) {
      validationResult.value = response.data
    }
  } catch (err) {
    error('Gagal memvalidasi file')
  } finally {
    validating.value = false
  }
}

const importFile = async () => {
  if (!hasValidRecords.value) return
  if (!canImport.value) {
    error('Anda tidak memiliki izin untuk import data')
    return
  }

  importing.value = true
  try {
    const response = await studentAttendanceService.import(
      selectedFile.value,
      {
        date: filters.date,
        class_id: filters.class_id
      }
    )

    if (response.success) {
      importSuccessMessage.value = response.message
      importSuccess.value = true
      success('Import berhasil!')

      // Reset form after delay
      setTimeout(() => {
        resetForm()
      }, 3000)
    }
  } catch (err) {
    error('Gagal mengimpor data')
  } finally {
    importing.value = false
  }
}

const downloadTemplate = async () => {
  try {
    const response = await studentAttendanceService.downloadTemplate()

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `template_absensi_siswa_${new Date().getTime()}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    success('Template berhasil diunduh')
  } catch (err) {
    error('Gagal mengunduh template')
  }
}

const resetForm = () => {
  selectedFile.value = null
  validationResult.value = null
  importSuccess.value = false
  importSuccessMessage.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// Lifecycle
onMounted(() => {
  loadClasses()
})
</script>
