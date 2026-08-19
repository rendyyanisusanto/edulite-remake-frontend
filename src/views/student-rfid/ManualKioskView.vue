<template>
  <div class="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden font-sans">
    
    <!-- Background Decor -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div class="absolute top-40 -left-40 w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-40 left-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>

    <!-- Main Content -->
    <div class="z-10 w-full max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      
      <!-- Header -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 border border-slate-700 shadow-xl mb-6">
          <svg class="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-400 font-bold mb-2">Kiosk Manual</p>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">CARI NAMA SISWA</h1>
        <p class="text-slate-400 mt-4 text-lg max-w-xl mx-auto">Silakan cari dan pilih nama Anda, lalu tekan tombol aksi yang sesuai.</p>
      </div>

      <!-- Search Section -->
      <div class="w-full max-w-2xl mx-auto bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl p-6 md:p-8 transition-all duration-500">
        
        <div v-if="!selectedStudent" class="space-y-6">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              ref="searchInput"
              v-model="searchQuery" 
              @input="handleSearch"
              type="text" 
              class="block w-full pl-12 pr-4 py-4 md:py-5 bg-slate-900/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg md:text-xl transition-all shadow-inner"
              placeholder="Ketik nama atau NIS Anda di sini..."
              autocomplete="off"
            >
            <div v-if="isSearching" class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <div class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          </div>

          <!-- Search Results -->
          <div v-if="searchResults.length > 0 && searchQuery" class="mt-4 bg-slate-900/80 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
            <ul class="max-h-60 overflow-y-auto custom-scrollbar">
              <li 
                v-for="student in searchResults" 
                :key="student.id"
                @click="selectStudent(student)"
                class="px-6 py-4 border-b border-slate-700/50 hover:bg-slate-700/50 cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div>
                  <p class="text-white font-semibold text-lg group-hover:text-blue-400 transition-colors">{{ student.full_name }}</p>
                  <p class="text-slate-400 text-sm mt-1">NIS: {{ student.nis || '-' }}</p>
                </div>
                <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </li>
            </ul>
          </div>
          
          <div v-else-if="searchQuery && !isSearching" class="mt-4 px-6 py-8 bg-slate-900/50 rounded-2xl border border-slate-700 text-center">
            <svg class="mx-auto h-12 w-12 text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-slate-300 font-medium">Siswa tidak ditemukan.</p>
            <p class="text-slate-500 text-sm mt-1">Coba gunakan nama panggilan atau NIS yang benar.</p>
          </div>
        </div>

        <!-- Action Selection -->
        <div v-else class="space-y-8 animate-fade-in-up">
          <div class="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-slate-400 uppercase tracking-wider">Siswa Terpilih</p>
                <p class="text-xl font-bold text-white">{{ selectedStudent.full_name }}</p>
              </div>
            </div>
            <button @click="resetSelection" class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors tooltip" title="Ganti Siswa">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              @click="handleAction('attendance')" 
              :disabled="isSubmitting"
              class="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-xl hover:shadow-emerald-500/20 border border-emerald-400/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
            >
              <div class="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div class="relative z-10 flex flex-col items-center justify-center text-center space-y-3">
                <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span class="text-xl font-bold tracking-wide">ABSEN<br>MASUK / PULANG</span>
              </div>
            </button>

            <button 
              @click="handleAction('toilet')" 
              :disabled="isSubmitting"
              class="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-xl hover:shadow-sky-500/20 border border-sky-400/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
            >
              <div class="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div class="relative z-10 flex flex-col items-center justify-center text-center space-y-3">
                <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span class="text-xl font-bold tracking-wide">IZIN<br>TOILET</span>
              </div>
            </button>
          </div>
        </div>

      </div>

      <!-- Result Message -->
      <div 
        v-if="resultMessage" 
        class="mt-8 w-full max-w-2xl transform transition-all duration-500 animate-bounce-in"
      >
        <div 
          :class="[
            'px-6 py-5 rounded-2xl border flex items-center justify-between shadow-2xl backdrop-blur-md',
            resultType === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100' : 'bg-red-500/20 border-red-500/50 text-red-100'
          ]"
        >
          <div class="flex items-center space-x-4">
            <div :class="[
              'w-12 h-12 rounded-full flex items-center justify-center',
              resultType === 'success' ? 'bg-emerald-500/40' : 'bg-red-500/40'
            ]">
              <svg v-if="resultType === 'success'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p class="font-bold text-lg">{{ resultType === 'success' ? 'BERHASIL' : 'GAGAL' }}</p>
              <p class="opacity-90">{{ resultMessage }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Currently in Toilet Panel -->
      <div class="mt-8 w-full max-w-2xl">
        <div class="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
                <svg class="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="text-white font-bold text-sm uppercase tracking-wider">Siswa di Toilet</span>
              <span v-if="toiletStudents.length > 0" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold">{{ toiletStudents.length }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <div v-if="isLoadingToilet" class="animate-spin h-4 w-4 border-2 border-sky-500 border-t-transparent rounded-full"></div>
              <button @click="fetchToiletStudents" class="text-slate-400 hover:text-sky-400 transition-colors" title="Refresh">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          <div v-if="toiletStudents.length === 0 && !isLoadingToilet" class="px-6 py-8 text-center">
            <svg class="mx-auto h-10 w-10 text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-slate-500 text-sm">Tidak ada siswa yang sedang di toilet</p>
          </div>

          <ul v-else class="max-h-64 overflow-y-auto custom-scrollbar divide-y divide-slate-700/50">
            <li 
              v-for="student in toiletStudents" 
              :key="student.id"
              class="flex items-center justify-between px-6 py-3 hover:bg-slate-700/30 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <div class="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p class="text-white font-semibold text-sm">{{ student.full_name }}</p>
                  <p class="text-slate-400 text-xs">{{ student.class_name }} &bull; NIS: {{ student.nis || '-' }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {{ formatElapsed(student.exit_at) }}
                </span>
                <button
                  @click="returnFromToilet(student)"
                  :disabled="returningToiletId === student.student_id"
                  class="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/40 hover:text-emerald-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div v-if="returningToiletId === student.student_id" class="animate-spin h-3 w-3 border-2 border-emerald-300 border-t-transparent rounded-full"></div>
                  <svg v-else class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span>{{ returningToiletId === student.id ? '...' : 'Balik' }}</span>
                </button>
              </div>
            </li>
          </ul>

          <!-- Toilet Notif Banner -->
          <div
            v-if="toiletNotif.message"
            :class="[
              'mx-4 mb-3 mt-2 px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-2 animate-fade-in-up',
              toiletNotif.type === 'success'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-red-500/20 border border-red-500/40 text-red-300'
            ]"
          >
            <svg v-if="toiletNotif.type === 'success'" class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>{{ toiletNotif.message }}</span>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import publicApi from '@/services/publicApi'
import { useRfidKiosk } from '@/composables/useRfidKiosk'

const searchInput = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const selectedStudent = ref(null)
const isSubmitting = ref(false)

const resultMessage = ref('')
const resultType = ref('')
let resultTimer = null

const { beep } = useRfidKiosk()

const toiletStudents = ref([])
const isLoadingToilet = ref(false)
const returningToiletId = ref(null)
const toiletNotif = ref({ message: '', type: '' })
let toiletNotifTimer = null
let toiletPollInterval = null

// Use the internal kiosk token. It should match the environment setup.
const kioskToken = import.meta.env.VITE_KIOSK_INTERNAL_TOKEN || import.meta.env.VITE_RFID_GATE_KIOSK_TOKEN || ''

let searchTimeout = null

const handleSearch = () => {
  clearTimeout(searchTimeout)
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    isSearching.value = false
    return
  }

  isSearching.value = true
  searchTimeout = setTimeout(async () => {
    try {
      const response = await publicApi.get('/public/kiosk/manual/students/search', {
        params: { q: searchQuery.value.trim(), kiosk_token: kioskToken }
      })
      searchResults.value = response.data || []
    } catch (error) {
      console.error('Search error', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 500)
}

const selectStudent = (student) => {
  selectedStudent.value = student
  searchQuery.value = ''
  searchResults.value = []
  clearResult()
}

const resetSelection = () => {
  selectedStudent.value = null
  clearResult()
  nextTick(() => {
    searchInput.value?.focus()
  })
}

const clearResult = () => {
  resultMessage.value = ''
  resultType.value = ''
  clearTimeout(resultTimer)
}

const showResult = (message, type) => {
  resultMessage.value = message
  resultType.value = type
  if (type === 'success') {
    beep('success')
  } else {
    beep('error')
  }

  clearTimeout(resultTimer)
  resultTimer = setTimeout(() => {
    resetSelection()
  }, 3500)
}

const handleAction = async (actionType) => {
  if (!selectedStudent.value || isSubmitting.value) return

  isSubmitting.value = true
  clearResult()

  const endpoint = actionType === 'attendance' 
    ? '/public/kiosk/manual/student-attendances/scan'
    : '/public/kiosk/manual/student-toilet-permissions/scan'

  try {
    const response = await publicApi.post(endpoint, {
      student_id: selectedStudent.value.id,
      kiosk_token: kioskToken
    })

    if (response.success) {
      showResult(response.message || 'Berhasil diproses', 'success')
      if (actionType === 'toilet') fetchToiletStudents()
    } else {
      showResult(response.message || 'Gagal memproses permintaan', 'error')
    }
  } catch (error) {
    console.error(`Error processing ${actionType}:`, error)
    showResult(error.message || 'Terjadi kesalahan sistem', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const fetchToiletStudents = async () => {
  isLoadingToilet.value = true
  try {
    const res = await publicApi.get('/public/kiosk/manual/toilet/currently-out', {
      params: { kiosk_token: kioskToken }
    })
    toiletStudents.value = res.data || []
  } catch (e) {
    console.error('Fetch toilet students error', e)
  } finally {
    isLoadingToilet.value = false
  }
}

const returnFromToilet = async (student) => {
  if (returningToiletId.value) return
  returningToiletId.value = student.student_id
  try {
    const res = await publicApi.post('/public/kiosk/manual/student-toilet-permissions/scan', {
      student_id: student.student_id,
      kiosk_token: kioskToken
    })
    if (res.success) {
      beep('success')
      showToiletNotif(res.message || `${student.full_name} sudah kembali`, 'success')
      await fetchToiletStudents()
    } else {
      beep('error')
      showToiletNotif(res.message || 'Gagal memproses', 'error')
    }
  } catch (e) {
    console.error('Return from toilet error', e)
    beep('error')
    showToiletNotif(e.message || 'Terjadi kesalahan', 'error')
  } finally {
    returningToiletId.value = null
  }
}

const showToiletNotif = (message, type) => {
  clearTimeout(toiletNotifTimer)
  toiletNotif.value = { message, type }
  toiletNotifTimer = setTimeout(() => {
    toiletNotif.value = { message: '', type: '' }
  }, 3000)
}

const formatElapsed = (exitAt) => {
  if (!exitAt) return '-'
  const diff = Math.floor((Date.now() - new Date(exitAt).getTime()) / 1000)
  if (diff < 60) return `${diff}d`
  const mins = Math.floor(diff / 60)
  const secs = diff % 60
  return `${mins}m ${secs}d`
}

onMounted(() => {
  searchInput.value?.focus()
  fetchToiletStudents()
  toiletPollInterval = setInterval(fetchToiletStudents, 15000)
})

onUnmounted(() => {
  clearInterval(toiletPollInterval)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5); 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(71, 85, 105, 0.8); 
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 1); 
}

@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-bounce-in {
  animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes bounceIn {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}
</style>
