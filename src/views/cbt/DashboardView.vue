<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Dashboard CBT</h1>
        <p class="text-sm text-gray-500 mt-1">Ringkasan aktivitas Computer Based Test</p>
      </div>
      <div>
        <BaseButton @click="loadData" :loading="loading" variant="outline" class="font-medium text-sm">
          <template #icon>
            <svg class="h-4 w-4 mr-1" :class="{'animate-spin': loading}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </template>
          Muat Ulang
        </BaseButton>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex justify-between items-center">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">
            Gagal memuat data dari server. Silakan coba lagi.
          </p>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <div class="glass p-6 rounded-xl flex items-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group bg-white">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
        <div class="p-3 rounded-xl bg-blue-100 text-blue-600 mr-4 z-10">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        </div>
        <div class="z-10">
          <p class="text-sm font-medium text-gray-500">Bank Soal</p>
          <div class="flex items-end">
            <span v-if="loading" class="h-8 w-16 bg-gray-200 animate-pulse rounded block mt-1"></span>
            <p v-else class="text-2xl font-bold text-gray-800">{{ data.questionBanks || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="glass p-6 rounded-xl flex items-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group bg-white">
         <div class="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
        <div class="p-3 rounded-xl bg-indigo-100 text-indigo-600 mr-4 z-10">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div class="z-10">
          <p class="text-sm font-medium text-gray-500">Total Soal</p>
          <div class="flex items-end">
             <span v-if="loading" class="h-8 w-16 bg-gray-200 animate-pulse rounded block mt-1"></span>
             <p v-else class="text-2xl font-bold text-gray-800">{{ data.questions || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="glass p-6 rounded-xl flex items-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group bg-white">
         <div class="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
        <div class="p-3 rounded-xl bg-purple-100 text-purple-600 mr-4 z-10">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <div class="z-10">
          <p class="text-sm font-medium text-gray-500">Paket Ujian</p>
          <div class="flex items-end">
            <span v-if="loading" class="h-8 w-16 bg-gray-200 animate-pulse rounded block mt-1"></span>
            <p v-else class="text-2xl font-bold text-gray-800">{{ data.exams || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="glass p-6 rounded-xl flex items-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group bg-white">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
        <div class="p-3 rounded-xl bg-amber-100 text-amber-600 mr-4 z-10">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <div class="z-10">
          <p class="text-sm font-medium text-gray-500">Jadwal Ujian</p>
          <div class="flex items-end">
            <span v-if="loading" class="h-8 w-16 bg-gray-200 animate-pulse rounded block mt-1"></span>
            <p v-else class="text-2xl font-bold text-gray-800">{{ data.schedules || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="glass p-6 rounded-xl flex items-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group bg-white">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-teal-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
        <div class="p-3 rounded-xl bg-teal-100 text-teal-600 mr-4 z-10">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        </div>
        <div class="z-10">
          <p class="text-sm font-medium text-gray-500">Peserta Ujian</p>
          <div class="flex items-end">
            <span v-if="loading" class="h-8 w-16 bg-gray-200 animate-pulse rounded block mt-1"></span>
            <p v-else class="text-2xl font-bold text-gray-800">{{ data.participants || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="glass p-6 rounded-xl flex items-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group bg-white">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
        <div class="p-3 rounded-xl bg-green-100 text-green-600 mr-4 z-10">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div class="z-10">
          <p class="text-sm font-medium text-gray-500">Ujian Aktif</p>
          <div class="flex items-end">
            <span v-if="loading" class="h-8 w-16 bg-gray-200 animate-pulse rounded block mt-1"></span>
            <p v-else class="text-2xl font-bold text-gray-800">{{ data.activeExams || 0 }}</p>
          </div>
        </div>
      </div>

    </div>

    <!-- Master CBT Stats -->
    <h3 class="text-xl font-bold text-gray-800 mt-8 mb-4">Master Data CBT</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- Penugasan Guru -->
      <div class="glass p-6 rounded-xl flex items-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group bg-white">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-cyan-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
        <div class="p-3 rounded-xl bg-cyan-100 text-cyan-600 mr-4 z-10">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        </div>
        <div class="z-10">
          <p class="text-sm font-medium text-gray-500">Penugasan Guru</p>
          <div class="flex items-end">
            <span v-if="loading" class="h-8 w-16 bg-gray-200 animate-pulse rounded block mt-1"></span>
            <p v-else class="text-2xl font-bold text-gray-800">{{ data.teacherAssignments || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Akun Peserta Aktif -->
      <div class="glass p-6 rounded-xl flex items-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group bg-white">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
        <div class="p-3 rounded-xl bg-emerald-100 text-emerald-600 mr-4 z-10">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div class="z-10">
          <p class="text-sm font-medium text-gray-500">Akun Peserta Aktif</p>
          <div class="flex items-end">
            <span v-if="loading" class="h-8 w-16 bg-gray-200 animate-pulse rounded block mt-1"></span>
            <p v-else class="text-2xl font-bold text-gray-800">{{ data.activeStudentAccounts || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Siswa Tanpa Akun -->
      <div class="glass p-6 rounded-xl flex items-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group bg-white">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-red-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
        <div class="p-3 rounded-xl bg-red-100 text-red-600 mr-4 z-10">
           <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <div class="z-10">
          <p class="text-sm font-medium text-gray-500">Siswa Tanpa Akun</p>
          <div class="flex items-end">
            <span v-if="loading" class="h-8 w-16 bg-gray-200 animate-pulse rounded block mt-1"></span>
            <p v-else class="text-2xl font-bold text-gray-800">{{ data.studentsWithoutAccounts || 0 }}</p>
          </div>
        </div>
      </div>

    </div>

    <!-- Empty State for Features yet to be developed -->
    <div class="bg-gray-50 rounded-xl border border-gray-100 p-8 text-center shadow-inner mt-8">
      <div class="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 mb-4 border border-gray-100">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
      </div>
      <h3 class="text-lg font-medium text-gray-800 mb-1">Fitur Sedang Dikembangkan</h3>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Modul dan menu lainnya pada Computer Based Test masih dalam tahap pengembangan (Sprint berikutnya).
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import cbtService from '@/services/api/cbt.service'

const loading = ref(true)
const error = ref(false)
const data = ref({
  questionBanks: 0,
  questions: 0,
  exams: 0,
  schedules: 0,
  participants: 0,
  activeExams: 0,
  teacherAssignments: 0,
  activeStudentAccounts: 0,
  studentsWithoutAccounts: 0
})

const loadData = async () => {
  loading.value = true
  error.value = false
  try {
    const res = await cbtService.getDashboardSummary()
    if (res.success) {
      data.value = res.data
    } else {
      error.value = true
    }
  } catch (err) {
    console.error('Failed to load CBT summary:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
