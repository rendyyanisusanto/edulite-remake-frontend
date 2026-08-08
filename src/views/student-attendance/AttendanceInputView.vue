<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Input Absensi per Kelas</h1>
        <p class="text-sm text-gray-500 mt-1">Input kehadiran siswa untuk satu kelas pada tanggal tertentu.</p>
      </div>
    </div>

    <!-- Selector Card -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
          <input
            v-model="filters.date"
            type="date"
            @change="handleDateOrClassChange"
            class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
          <select
            v-model="filters.class_id"
            @change="handleDateOrClassChange"
            class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="">Pilih Kelas</option>
            <option v-for="klass in classes" :key="klass.id" :value="String(klass.id)">
              {{ klass.name }}
            </option>
          </select>
        </div>
        <div class="flex items-end">
          <BaseButton
            @click="loadStudents"
            :disabled="!filters.class_id || !filters.date"
            class="w-full"
          >
            <svg class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Tampilkan Siswa
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!filters.class_id || !filters.date" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <p class="mt-4 text-gray-600 font-medium">Pilih tanggal dan kelas terlebih dahulu</p>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
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

    <!-- Attendance Form -->
    <div v-else class="space-y-4">
      <!-- Action Bar -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">Total Siswa:</span>
          <span class="font-semibold text-gray-800">{{ students.length }}</span>
        </div>
        <div class="flex gap-2">
          <BaseButton
            @click="setAllPresent"
            variant="outline"
            :disabled="saving"
          >
            <svg class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Hadir Semua
          </BaseButton>
          <BaseButton
            @click="submitAttendance"
            :loading="saving"
            :disabled="submitted"
          >
            <svg v-if="!submitted" class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <svg v-else class="h-4 w-4 mr-1.5 inline-block -mt-0.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            {{ submitted ? 'Berhasil Disimpan!' : 'Simpan Absensi' }}
          </BaseButton>
        </div>
      </div>

      <!-- Students Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">No</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Siswa</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Jam</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(student, index) in students" :key="student.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900 text-center">{{ index + 1 }}</td>
                <td class="px-4 py-3">
                  <div class="flex flex-col">
                    <span class="font-medium text-gray-900">{{ student.full_name }}</span>
                    <span class="text-xs text-gray-500">NIS: {{ student.nis }}</span>
                  </div>
                  <div
                    v-if="attendanceForm[student.id]?.input_method === 'rfid'"
                    class="mt-1 flex items-center gap-1"
                  >
                    <span class="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      RFID
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <select
                    v-model="attendanceForm[student.id].attendance_status"
                    :disabled="saving"
                    class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  >
                    <option v-for="status in STATUS_OPTIONS" :key="status.value" :value="status.value">
                      {{ status.label }}
                    </option>
                  </select>
                </td>
                <td class="px-4 py-3">
                  <input
                    v-model="attendanceForm[student.id].clock_in_at"
                    type="time"
                    :disabled="saving || attendanceForm[student.id].attendance_status === 'IZIN' || attendanceForm[student.id].attendance_status === 'SAKIT' || attendanceForm[student.id].attendance_status === 'ALPA'"
                    class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </td>
                <td class="px-4 py-3">
                  <input
                    v-model="attendanceForm[student.id].notes"
                    type="text"
                    placeholder="Keterangan..."
                    :disabled="saving"
                    class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Info Box -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <svg class="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div class="flex-1">
            <p class="text-sm text-blue-800 font-medium">Informasi</p>
            <ul class="mt-2 text-sm text-blue-700 space-y-1">
              <li>• Status default untuk semua siswa adalah <strong>Hadir</strong></li>
              <li>• Gunakan tombol <strong>"Hadir Semua"</strong> untuk mengatur semua siswa menjadi Hadir dengan cepat</li>
              <li>• Data yang sudah ada (dari RFID/manual/import) akan ditampilkan dan dapat diedit</li>
              <li>• Sistem akan mengupdate data yang sudah ada atau membuat baru jika belum ada</li>
            </ul>
          </div>
        </div>
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
const canCreate = computed(() => authStore.hasPermission('attendance.create'))
const canUpdate = computed(() => authStore.hasPermission('attendance.update'))

// Status options
const STATUS_OPTIONS = [
  { value: 'HADIR', label: 'Hadir' },
  { value: 'TERLAMBAT', label: 'Terlambat' },
  { value: 'IZIN', label: 'Izin' },
  { value: 'SAKIT', label: 'Sakit' },
  { value: 'ALPA', label: 'Alpa' }
]

// Get today's date in YYYY-MM-DD format
const getToday = () => {
  return new Date().toISOString().split('T')[0]
}

// Reactive state
const filters = reactive({
  date: getToday(),
  class_id: ''
})

const students = ref([])
const classes = ref([])
const loading = ref(false)
const saving = ref(false)
const submitted = ref(false)

// Attendance form data - keyed by student_id
const attendanceForm = reactive({})

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

const loadStudents = async () => {
  if (!filters.class_id || !filters.date) return
  if (!canView.value) return

  loading.value = true
  try {
    const response = await studentAttendanceService.getStudentsByClass(
      filters.class_id,
      { date: filters.date }
    )

    if (response.success) {
      students.value = response.data.students || []
      initializeForm(response.data.existing_attendance || [])
    }
  } catch (err) {
    error('Gagal memuat data siswa')
  } finally {
    loading.value = false
  }
}

const initializeForm = (existingAttendance) => {
  // Clear existing form
  Object.keys(attendanceForm).forEach(key => delete attendanceForm[key])

  // Initialize form for each student
  students.value.forEach(student => {
    const existingRecord = existingAttendance.find(e => e.student_id === student.id)

    attendanceForm[student.id] = {
      attendance_status: existingRecord?.attendance_status || 'HADIR',
      clock_in_at: existingRecord?.clock_in_at ? existingRecord.clock_in_at.slice(11, 16) : '',
      notes: existingRecord?.notes || '',
      id: existingRecord?.id || null,
      input_method: existingRecord?.input_method || 'manual'
    }
  })
}

const handleDateOrClassChange = () => {
  students.value = []
  Object.keys(attendanceForm).forEach(key => delete attendanceForm[key])
}

const setAllPresent = () => {
  Object.keys(attendanceForm).forEach(studentId => {
    if (attendanceForm[studentId]) {
      attendanceForm[studentId].attendance_status = 'HADIR'
    }
  })
  success('Semua siswa diatur menjadi Hadir')
}

const submitAttendance = async () => {
  if (!canCreate.value && !canUpdate.value) {
    error('Anda tidak memiliki izin untuk menyimpan absensi')
    return
  }

  saving.value = true
  try {
    const attendances = students.value.map(student => {
      const form = attendanceForm[student.id]
      return {
        student_id: student.id,
        attendance_status: form.attendance_status,
        clock_in_at: form.clock_in_at
          ? `${filters.date}T${form.clock_in_at}:00Z`
          : null,
        notes: form.notes || null,
        id: form.id || null,
        input_method: form.input_method || 'manual'
      }
    })

    const payload = {
      date: filters.date,
      class_id: filters.class_id,
      attendances
    }

    const response = await studentAttendanceService.bulkUpsert(payload)

    if (response.success) {
      success(`Absensi berhasil disimpan! (${response.data.created} baru, ${response.data.updated} update)`)
      submitted.value = true

      // Reload data to get updated IDs
      setTimeout(() => {
        loadStudents()
        submitted.value = false
      }, 2000)
    }
  } catch (err) {
    error('Gagal menyimpan absensi')
  } finally {
    saving.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadClasses()
})
</script>
