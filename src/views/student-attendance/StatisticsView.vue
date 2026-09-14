<template>
  <div class="space-y-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Menu Laporan dan Statistik Absensi</h1>
        <p class="text-sm text-gray-500 mt-1">Pilih jenis laporan atau statistik absensi yang ingin Anda lihat.</p>
      </div>
      <router-link to="/attendance/recap">
        <button class="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Kembali
        </button>
      </router-link>
    </div>

    <!-- Menu Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <button 
        v-for="(menu, index) in menuList" 
        :key="index"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center text-center gap-3 hover:shadow-md hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 group cursor-pointer h-36"
        @click="openFeature(menu.title)"
      >
        <div class="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300" :class="menu.colorClass">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-html="menu.icon"></svg>
        </div>
        <span class="text-sm font-semibold text-gray-700 group-hover:text-indigo-700 transition-colors">{{ menu.title }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
const { success } = useToast()
const router = useRouter()

const openFeature = (title) => {
    if (title === 'Rekap Laporan') {
        router.push('/attendance-report/recap')
        return
    }
    // Navigate to actual routes when available in the future
    success(`Fitur "${title}" sedang dalam tahap pengembangan.`);
}

const menuList = [
    { 
        title: 'Rekap Laporan', 
        colorClass: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100',
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>' 
    },
    { 
        title: 'Tren Kehadiran Siswa', 
        colorClass: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>' 
    },
    { 
        title: 'Siswa beresiko', 
        colorClass: 'bg-rose-50 text-rose-600 group-hover:bg-rose-100',
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>' 
    }
]
</script>
