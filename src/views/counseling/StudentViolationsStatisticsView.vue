<template>
  <div class="space-y-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Menu Statistik Pelanggaran</h1>
        <p class="text-sm text-gray-500 mt-1">Pilih jenis statistik yang ingin Anda lihat atau analisis.</p>
      </div>
      <router-link to="/student-violations">
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
    if (title === 'Tren Pelanggaran') {
        router.push('/student-violations/statistics/trend')
    } else {
        success(`Fitur "${title}" sedang dalam tahap pengembangan.`);
    }
}

const menuList = [
    { 
        title: 'Tren Pelanggaran', 
        colorClass: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100',
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>' 
    },
    { 
        title: 'Pelanggaran Berdasarkan Jenis', 
        colorClass: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>' 
    },
    { 
        title: 'Poin Pelanggaran Berdasarkan Jenis', 
        colorClass: 'bg-pink-50 text-pink-600 group-hover:bg-pink-100',
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>' 
    },
    { 
        title: 'Pelanggaran Berdasarkan Kelas', 
        colorClass: 'bg-teal-50 text-teal-600 group-hover:bg-teal-100',
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>' 
    },
    { 
        title: 'Siswa dengan Pelanggaran Terbanyak', 
        colorClass: 'bg-rose-50 text-rose-600 group-hover:bg-rose-100',
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>' 
    },
    { 
        title: 'Siswa dengan Poin Pelanggaran Tertinggi', 
        colorClass: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>' 
    },
    { 
        title: 'Siswa Tanpa Pelanggaran', 
        colorClass: 'bg-green-50 text-green-600 group-hover:bg-green-100',
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>' 
    },
    { 
        title: 'Pelanggaran Berdasarkan Hari', 
        colorClass: 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100',
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>' 
    },
    { 
        title: 'Pelanggaran Berdasarkan Tingkat/Kelas', 
        colorClass: 'bg-sky-50 text-sky-600 group-hover:bg-sky-100',
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>' 
    },
    { 
        title: 'Distribusi Tingkat Pelanggaran', 
        colorClass: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>' 
    },
    { 
        title: 'Persentase Siswa Melakukan Pelanggaran', 
        colorClass: 'bg-fuchsia-50 text-fuchsia-600 group-hover:bg-fuchsia-100',
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>' 
    }
]
</script>
