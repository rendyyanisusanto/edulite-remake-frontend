<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Absen Tahfidz</h1>
        <p class="text-sm text-gray-500 mt-1">Input kehadiran siswa untuk kegiatan Tahfidz per kelas.</p>
      </div>
    </div>

    <!-- Date Filter -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="max-w-xs">
        <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
        <input
          v-model="filters.date"
          type="date"
          @change="loadClasses"
          class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>
    </div>

    <!-- Classes List Loading State -->
    <div v-if="loadingClasses" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
      <div class="animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
        <div class="h-8 bg-gray-200 rounded mx-auto mb-2"></div>
        <div class="h-8 bg-gray-200 rounded mx-auto"></div>
      </div>
    </div>

    <!-- Classes List -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">No</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Status Absen</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="classes.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-500">Tidak ada data kelas</td>
            </tr>
            <tr v-for="(klass, index) in classes" :key="klass.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ index + 1 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ klass.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span v-if="klass.is_filled" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  <svg class="mr-1.5 h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>
                  Sudah diisi
                </span>
                <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  <svg class="mr-1.5 h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>
                  Belum diisi
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="openAttendanceModal(klass)"
                  title="Proses Absen"
                  class="inline-flex items-center justify-center p-2 text-primary hover:text-white bg-primary/10 hover:bg-primary rounded-lg transition-all duration-200 shadow-sm"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Attendance Modal -->
  <Teleport to="body">
    <div v-if="showAttendanceModal" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Absen Tahfidz - {{ selectedClass?.name }}</h2>
          <p class="text-sm text-gray-500 mt-1">Tanggal: {{ filters.date }}</p>
        </div>
        <button @click="closeAttendanceModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 overflow-y-auto flex-1 bg-gray-50/50">
        <!-- Action Bar -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Total Siswa:</span>
            <span class="font-semibold text-gray-800">{{ students.length }}</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <BaseButton @click="handleDownloadTemplate" variant="outline" size="sm" :loading="downloading">
              <svg v-if="!downloading" class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Unduh Template
            </BaseButton>
            <BaseButton @click="showImportModal = true" variant="outline" size="sm">
              <svg class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12"/>
              </svg>
              Import Absen
            </BaseButton>
            <BaseButton @click="setAllPresent" variant="outline" size="sm" :disabled="saving">
              <svg class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Hadir Semua
            </BaseButton>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loadingStudents" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div class="animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div class="h-8 bg-gray-200 rounded mx-auto mb-2"></div>
            <div class="h-8 bg-gray-200 rounded mx-auto"></div>
          </div>
        </div>

        <!-- Empty Class State -->
        <div v-else-if="students.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <p class="mt-4 text-gray-600 font-medium">Tidak ada siswa di kelas ini</p>
        </div>

        <!-- Table -->
        <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">No</th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Status</th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">Keterangan</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(student, index) in students" :key="student.student_id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ index + 1 }}</td>
                  <td class="px-4 py-3">
                    <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
                    <div class="text-xs text-gray-500">{{ student.nis }}</div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <select
                      v-model="attendanceForm[student.student_id].status"
                      class="block w-full rounded-lg border-gray-200 bg-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      :class="getStatusColor(attendanceForm[student.student_id].status)"
                    >
                      <option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                    </select>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <input
                      v-model="attendanceForm[student.student_id].notes"
                      type="text"
                      placeholder="Opsional..."
                      class="block w-full rounded-lg border-gray-200 bg-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3">
        <BaseButton variant="outline" @click="closeAttendanceModal">Batal</BaseButton>
        <BaseButton @click="submitAttendance" :loading="saving" :disabled="!canCreate || students.length === 0">
          <svg v-if="!saving" class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
          </svg>
          Simpan Absensi
        </BaseButton>
      </div>
    </div>
  </div>
  </Teleport>

  <!-- Import Modal (Higher z-index) -->
  <Teleport to="body">
    <div v-if="showImportModal" class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-800">Import Absen Tahfidz</h3>
        <button @click="closeImportModal" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p class="text-sm text-blue-700">
            <strong>Pastikan</strong> Anda sudah mengunduh template dan mengisi status dengan <strong>H</strong> (Hadir), <strong>I</strong> (Izin), <strong>S</strong> (Sakit), atau <strong>A</strong> (Alpa).
          </p>
        </div>

        <div class="flex items-center gap-2 text-sm text-gray-600">
          <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          Tanggal: <strong>{{ filters.date }}</strong> | Kelas: <strong>{{ selectedClass?.name }}</strong>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">File Excel (.xlsx)</label>
          <div
            class="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
            @click="$refs.importFileInput.click()"
            @dragover.prevent
            @drop.prevent="handleFileDrop"
          >
            <svg class="mx-auto h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p v-if="importFile" class="text-sm font-medium text-primary">{{ importFile.name }}</p>
            <p v-else class="text-sm text-gray-500">Klik atau seret file ke sini</p>
            <p class="text-xs text-gray-400 mt-1">Format: .xlsx (max. 5MB)</p>
          </div>
          <input
            ref="importFileInput"
            type="file"
            accept=".xlsx,.xls"
            class="hidden"
            @change="handleFileSelect"
          />
        </div>

        <div v-if="importResult" class="rounded-lg p-3" :class="importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
          <p class="text-sm font-medium" :class="importResult.success ? 'text-green-700' : 'text-red-700'">{{ importResult.message }}</p>
        </div>
      </div>

      <div class="flex gap-2 mt-6 justify-end">
        <BaseButton variant="outline" @click="closeImportModal" :disabled="importing">Batal</BaseButton>
        <BaseButton @click="executeImport" :loading="importing" :disabled="!importFile || importing">
          Proses Import
        </BaseButton>
      </div>
    </div>
  </div>
  </Teleport>
</template>


<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/ui/BaseButton.vue'
import tahfidzAttendanceService from '@/services/tahfidzAttendance.service'
import { classService } from '@/services/api/academic.service'

const authStore = useAuthStore()
const { success, error } = useToast()

// Permissions
const canCreate = computed(() => authStore.hasPermission('tahfidz_attendance.create'))

// Status options
const STATUS_OPTIONS = [
  { value: 'present', label: 'Hadir' },
  { value: 'permission', label: 'Izin' },
  { value: 'sick', label: 'Sakit' },
  { value: 'absent', label: 'Alpa' }
]

const getToday = () => {
  return new Date().toISOString().split('T')[0]
}

const getStatusColor = (status) => {
  switch (status) {
    case 'present': return 'text-green-700 bg-green-50 border-green-200'
    case 'sick': return 'text-yellow-700 bg-yellow-50 border-yellow-200'
    case 'permission': return 'text-blue-700 bg-blue-50 border-blue-200'
    case 'absent': return 'text-red-700 bg-red-50 border-red-200'
    default: return ''
  }
}

// Reactive state
const filters = reactive({
  date: getToday()
})

const classes = ref([])
const loadingClasses = ref(false)

// Modal & students state
const showAttendanceModal = ref(false)
const selectedClass = ref(null)
const students = ref([])
const loadingStudents = ref(false)
const saving = ref(false)

// Import state
const showImportModal = ref(false)
const importFile = ref(null)
const importing = ref(false)
const importResult = ref(null)
const downloading = ref(false)
const importFileInput = ref(null)

// Attendance form data - keyed by student_id
const attendanceForm = reactive({})

// Methods
const loadClasses = async () => {
  if (!filters.date) return
  
  loadingClasses.value = true
  try {
    const response = await tahfidzAttendanceService.getClasses({ date: filters.date })
    if (response.success) {
      classes.value = response.data || []
    }
  } catch (err) {
    // try fallback to academic service if above fails
    try {
        const response = await classService.getAll({ limit: 300 })
        if (response.success) {
            classes.value = response.data?.classes || []
            // Set is_filled arbitrarily false as fallback doesn't know
            classes.value.forEach(c => c.is_filled = false)
        }
    } catch(e) {
        error('Gagal memuat daftar kelas')
    }
  } finally {
    loadingClasses.value = false
  }
}

const openAttendanceModal = async (klass) => {
  selectedClass.value = klass
  showAttendanceModal.value = true
  await loadStudents()
}

const closeAttendanceModal = () => {
  showAttendanceModal.value = false
  selectedClass.value = null
  students.value = []
  Object.keys(attendanceForm).forEach(key => delete attendanceForm[key])
}

const loadStudents = async () => {
  if (!selectedClass.value || !filters.date) return

  loadingStudents.value = true
  try {
    const response = await tahfidzAttendanceService.getAttendanceByClass(
      selectedClass.value.id,
      filters.date
    )

    if (response.success) {
      const studentData = response.data || []
      initializeForm(studentData)
      students.value = studentData
    }
  } catch (err) {
    error('Gagal memuat data siswa')
  } finally {
    loadingStudents.value = false
  }
}

const initializeForm = (studentData) => {
  // Clear existing form
  Object.keys(attendanceForm).forEach(key => delete attendanceForm[key])

  // Initialize form for each student
  studentData.forEach(student => {
    attendanceForm[student.student_id] = {
      status: student.status || 'present',
      notes: student.notes || '',
      id: student.id || null
    }
  })
}

// Import handlers
const handleDownloadTemplate = async () => {
  if (!selectedClass.value) return
  downloading.value = true
  try {
    const blob = await tahfidzAttendanceService.downloadTemplate(selectedClass.value.id)
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `template_tahfidz_${selectedClass.value.name.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    error('Gagal mengunduh template')
  } finally {
    downloading.value = false
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    importFile.value = file
    importResult.value = null
  }
}

const handleFileDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
    importFile.value = file
    importResult.value = null
  } else {
    error('Hanya file .xlsx atau .xls yang diperbolehkan')
  }
}

const closeImportModal = () => {
  showImportModal.value = false
  importFile.value = null
  importResult.value = null
  if (importFileInput.value) importFileInput.value.value = ''
}

const executeImport = async () => {
  if (!importFile.value || !selectedClass.value) return
  importing.value = true
  importResult.value = null
  try {
    const formData = new FormData()
    formData.append('file', importFile.value)
    formData.append('class_id', selectedClass.value.id)
    formData.append('date', filters.date)

    const response = await tahfidzAttendanceService.importAttendance(formData)
    if (response.success) {
      importResult.value = { success: true, message: response.message || 'Import berhasil!' }
      success('Import absensi Tahfidz berhasil')
      // Reload students to reflect changes
      await loadStudents()
      // Reload classes to update the status tag
      await loadClasses()
      setTimeout(() => closeImportModal(), 1500)
    } else {
      importResult.value = { success: false, message: response.message || 'Import gagal' }
    }
  } catch (err) {
    const errMsg = err?.message || err?.error || 'Terjadi kesalahan saat import'
    importResult.value = { success: false, message: errMsg }
    error(errMsg)
  } finally {
    importing.value = false
  }
}

const setAllPresent = () => {
  Object.keys(attendanceForm).forEach(studentId => {
    if (attendanceForm[studentId]) {
      attendanceForm[studentId].status = 'present'
    }
  })
}

const submitAttendance = async () => {
  if (!canCreate.value) {
    error('Anda tidak memiliki akses untuk menyimpan absensi')
    return
  }

  saving.value = true
  try {
    const payloadData = Object.keys(attendanceForm).map(studentId => ({
      student_id: studentId,
      id: attendanceForm[studentId].id,
      status: attendanceForm[studentId].status,
      notes: attendanceForm[studentId].notes
    }))

    const payload = {
      date: filters.date,
      class_id: selectedClass.value.id,
      students: payloadData
    }

    const response = await tahfidzAttendanceService.bulkUpsertAttendance(payload)

    if (response.success) {
      success('Absensi berhasil disimpan')
      // reload to get updated IDs if any
      await loadStudents()
      // update classes list so 'is_filled' updates
      await loadClasses()
      closeAttendanceModal()
    } else {
      error(response.message || 'Gagal menyimpan absensi')
    }
  } catch (err) {
    error(err.response?.data?.message || 'Gagal menyimpan absensi')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadClasses()
})
</script>
