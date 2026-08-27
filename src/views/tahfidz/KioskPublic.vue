<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4 font-sans">
    
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center mt-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p class="mt-4 text-gray-600 font-medium">Memuat data kelas...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="w-full max-w-md bg-white p-8 rounded-xl shadow-lg text-center mt-10">
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
        <svg class="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Kiosk Tidak Tersedia</h2>
      <p class="text-gray-600">{{ error }}</p>
    </div>

    <!-- Success State / Kiosk Mode -->
    <div v-else-if="classData" class="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
      <!-- Header -->
      <div :class="[
        'px-6 py-6 text-white text-center relative transition-colors duration-300',
        hasAttendanceToday ? 'bg-emerald-600' : 'bg-rose-600'
      ]">
        <div v-if="hasAttendanceToday" class="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center">
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          SUDAH DIABSEN
        </div>
        <div v-else class="absolute top-4 right-4 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center">
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          BELUM DIABSEN
        </div>
        
        <h1 class="text-3xl font-bold tracking-wider mb-2 mt-2">ABSEN TAHFIDZ</h1>
        <div class="text-indigo-100 text-lg font-medium">
          <p>Kelas: <span class="font-bold text-white">{{ classData.class_name }}</span></p>
          <p>{{ formattedDate }}</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="p-4 sm:p-6 flex-grow flex flex-col">
        <!-- Toolbar -->
        <div class="flex justify-between items-center mb-6 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
          <span class="text-sm font-medium text-indigo-800">Total Siswa: {{ students.length }}</span>
          <button @click="markAllPresent" class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            <svg class="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Hadir Semua
          </button>
        </div>

        <!-- Student List -->
        <div class="space-y-4 mb-8 flex-grow">
          <div v-for="(student, index) in students" :key="student.student_id" 
               class="bg-white border rounded-lg p-4 shadow-sm transition-all hover:shadow-md"
               :class="{
                 'border-green-200': student.status === 'present',
                 'border-blue-200': student.status === 'permission',
                 'border-yellow-200': student.status === 'sick',
                 'border-red-200': student.status === 'absent'
               }">
            
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <!-- Student Info -->
              <div class="flex items-center gap-3 w-full sm:w-auto">
                <div class="flex-shrink-0 w-8 h-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center font-bold text-sm">
                  {{ index + 1 }}
                </div>
                <div class="flex-grow">
                  <h3 class="text-lg font-semibold text-gray-900 leading-tight">{{ student.name }}</h3>
                  <p class="text-xs text-gray-500">{{ student.nis }}</p>
                </div>
              </div>

              <!-- Status Buttons -->
              <div class="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                <button @click="setStatus(student, 'present')" 
                        type="button"
                        class="px-3 py-2 text-sm font-medium rounded-md transition-colors flex-1 sm:flex-none"
                        :class="student.status === 'present' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
                  Hadir
                </button>
                <button @click="setStatus(student, 'permission')" 
                        type="button"
                        class="px-3 py-2 text-sm font-medium rounded-md transition-colors flex-1 sm:flex-none"
                        :class="student.status === 'permission' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
                  Izin
                </button>
                <button @click="setStatus(student, 'sick')" 
                        type="button"
                        class="px-3 py-2 text-sm font-medium rounded-md transition-colors flex-1 sm:flex-none"
                        :class="student.status === 'sick' ? 'bg-yellow-500 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
                  Sakit
                </button>
                <button @click="setStatus(student, 'absent')" 
                        type="button"
                        class="px-3 py-2 text-sm font-medium rounded-md transition-colors flex-1 sm:flex-none"
                        :class="student.status === 'absent' ? 'bg-red-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
                  Alpa
                </button>
              </div>
            </div>
            
            <!-- Optional Notes Field for Non-Present -->
            <div v-if="student.status !== 'present'" class="mt-4 pt-3 border-t border-dashed border-gray-200">
               <div class="relative flex items-center">
                 <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                   </svg>
                 </div>
                 <input v-model="student.notes" type="text" placeholder="Tambahkan keterangan (opsional)..." class="block w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
               </div>
            </div>
          </div>
        </div>

        <!-- Submit Action -->
        <div class="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200 mt-auto">
          <button @click="submitAttendance" :disabled="submitting" 
                  class="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-lg shadow-md text-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            <svg v-if="submitting" class="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="mr-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {{ submitting ? 'MENYIMPAN...' : 'SIMPAN ABSENSI' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const { success: toastSuccess, error: toastError, info: toastInfo } = useToast()

const token = route.params.token
const loading = ref(true)
const error = ref('')
const classData = ref(null)
const students = ref([])
const submitting = ref(false)

const formattedDate = computed(() => {
  if (!classData.value?.date) return ''
  const dateObj = new Date(classData.value.date)
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return dateObj.toLocaleDateString('id-ID', options)
})

const hasAttendanceToday = computed(() => {
  // If at least one student has a non-null id from the backend, 
  // it means there's an attendance record for this class today.
  return students.value.some(s => s.id !== null && s.id !== undefined)
})

const fetchKioskData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // API Public Endpoint
    const response = await api.get(`/v1/public/kiosk/tahfidz/${token}`)
    
    if (response.success) {
      classData.value = response.data
      students.value = response.data.students.map(s => ({
        ...s,
        notes: s.notes || '' // Ensure notes is reactive string
      }))
    }
  } catch (err) {
    if (err.response?.status === 404) {
      error.value = 'QR Code tidak valid atau akses kiosk telah dinonaktifkan.'
    } else {
      error.value = 'Terjadi kesalahan saat memuat data. Silakan coba lagi.'
    }
    console.error(err)
  } finally {
    loading.value = false
  }
}

const setStatus = (student, status) => {
  student.status = status
  if (status === 'present') {
    student.notes = ''
  }
}

const markAllPresent = () => {
  students.value.forEach(s => setStatus(s, 'present'))
  toastInfo('Semua siswa diatur hadir')
}

const submitAttendance = async () => {
  if (students.value.length === 0) return

  submitting.value = true
  
  try {
    const payload = {
      attendance_date: classData.value.date,
      students: students.value.map(s => ({
        student_id: s.student_id,
        status: s.status,
        notes: s.notes
      }))
    }

    const response = await api.post(`/v1/public/kiosk/tahfidz/${token}/attendance`, payload)
    
    if (response.success) {
      toastSuccess('Absensi Tahfidz berhasil disimpan!')
    }
  } catch (err) {
    toastError(err.message || 'Gagal menyimpan absensi')
    console.error(err)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchKioskData()
})
</script>

<style scoped>
/* Optional: Prevent zoom on mobile inputs */
input[type="text"] {
  font-size: 16px;
}
</style>
