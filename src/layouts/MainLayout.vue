<template>
  <div class="flex h-screen bg-background overflow-hidden relative">
    
    <!-- Sidebar / Navigation -->
    <aside class="w-72 bg-[#130f40] flex-shrink-0 z-10 flex flex-col text-white shadow-xl">
      <div class="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <img class="h-8 w-auto mr-3 brightness-0 invert" src="@/assets/logo_white.png" alt="Edulite Logo" />
        <span class="text-xl font-bold tracking-wider">EDULITE</span>
      </div>
      
      <div class="p-4 flex-1 overflow-y-auto custom-scrollbar">
        <nav class="space-y-2">
          
          <!-- Single Menu Items -->
          <router-link 
            to="/dashboard"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors border-l-4 border-transparent hover:border-white w-full"
            active-class="bg-white/15 border-white font-bold"
          >
            <svg class="mr-3 flex-shrink-0 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Dashboard
          </router-link>

          <!-- Grouped Menu Items -->
          <div v-for="(group, index) in menuGroups" :key="index" class="pt-2">
            <button 
              @click="toggleGroup(index)"
              class="flex items-center justify-between w-full px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
              :class="{ 'bg-white/5': expandedGroups[index] }"
            >
              <div class="flex items-center">
                <svg class="mr-3 flex-shrink-0 h-5 w-5 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="group.icon" />
                </svg>
                <span class="text-white/90">{{ group.name }}</span>
              </div>
              <svg 
                class="w-4 h-4 transition-transform duration-200" 
                :class="expandedGroups[index] ? 'transform rotate-180' : ''" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <!-- Submenu Items (Animated expansion) -->
            <div 
              v-show="expandedGroups[index]"
              class="mt-1 pl-10 space-y-1 overflow-hidden transition-all duration-300"
            >
              <router-link 
                v-for="sub in group.children" 
                :key="sub.route"
                :to="sub.route"
                class="flex items-center px-4 py-2 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors border-l-2 border-transparent hover:border-white w-full"
                active-class="bg-white/10 text-white border-white font-medium"
              >
                {{ sub.name }}
              </router-link>
            </div>
          </div>
          
        </nav>
      </div>

      <!-- Transparent Card (User Info & Logout) -->
      <div class="p-4 mt-auto shrink-0">
        <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg border border-white/30 truncate shrink-0">
              {{ user?.name?.charAt(0)?.toUpperCase() || 'A' }}
            </div>
            <div class="flex flex-col overflow-hidden">
              <span class="text-sm font-semibold truncate">{{ user?.name || 'Administrator' }}</span>
              <span class="text-xs text-white/70 truncate">{{ user?.email || 'admin@edulite.local' }}</span>
            </div>
          </div>
          <button @click="handleLogout" class="w-full mt-2 py-2 px-4 text-sm font-medium text-white bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors flex items-center justify-center gap-2 border border-red-500/50 shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Logout
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden relative z-0">
      
      <!-- Top header -->
      <header class="bg-white/70 backdrop-blur-md h-16 flex items-center justify-between px-6 z-10 border-b border-gray-200 shadow-sm shrink-0">
        <div class="flex items-center">
            <h2 class="text-xl font-semibold text-gray-800">{{ currentRouteName }}</h2>
        </div>
        <div class="flex items-center space-x-4">
          <button class="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
            <span class="sr-only">View notifications</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </header>
      
      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-6 z-0 relative">
        <!-- Abstract Background Elements for Aesthetic -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl -z-10 pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>
        
        <!-- Transition wrapper for smooth page changes -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
// Improve route name formatting (e.g., 'StudentDocs' -> 'Student Docs')
const currentRouteName = computed(() => route.name ? route.name.toString().replace(/([A-Z])/g, ' $1').trim() : '')

// Reactive object to track which menu groups are expanded
const expandedGroups = reactive({
  0: true, // Default open the first group
})

const toggleGroup = (index) => {
  expandedGroups[index] = !expandedGroups[index]
}

// PRD Defined Menu Groups Structure
const menuGroups = [
  {
    name: 'Manajemen Siswa',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    children: [
      { name: 'Data Siswa', route: '/students' },
      { name: 'Orang Tua / Wali', route: '/parents' },
      { name: 'Dokumen Siswa', route: '/student-docs' },
      { name: 'Riwayat Kelas', route: '/class-history' },
      { name: 'Mutasi Siswa', route: '/transfers' },
      { name: 'Kartu Pelajar', route: '/id-cards' },
    ]
  },
  {
    name: 'Akademik',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    children: [
      { name: 'Tahun Ajaran', route: '/academic-years' },
      { name: 'Tingkat Kelas', route: '/grades' },
      { name: 'Jurusan', route: '/departments' },
      { name: 'Kelas', route: '/classes' },
      { name: 'Data Guru', route: '/teachers' },
    ]
  },
  {
    name: 'Prestasi & Kegiatan',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    children: [
      { name: 'Data Prestasi', route: '/achievements' },
      { name: 'Peserta Prestasi', route: '/achievement-participants' },
      { name: 'Hasil Prestasi', route: '/achievement-results' },
      { name: 'Aturan Poin', route: '/achievement-point-rules' },
      { name: 'Piagam / Sertifikat', route: '/certificates' },
    ]
  },
  {
    name: 'Disiplin & Konseling',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.957 11.957 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    children: [
      { name: 'Jenis Pelanggaran', route: '/violation-types' },
      { name: 'Level Pelanggaran', route: '/violation-levels' },
      { name: 'Data Pelanggaran Siswa', route: '/student-violations' },
      { name: 'Jenis Catatan Positif', route: '/positive-point-types' },
      { name: 'Catatan Positif Siswa', route: '/student-positive-points' },
      { name: 'Kasus Konseling', route: '/counseling-cases' },
      { name: 'Sesi Konseling', route: '/counseling-sessions' },
      { name: 'Tindak Lanjut Konseling', route: '/counseling-followups' },
      { name: 'Rapor Karakter', route: '/character-reports' },
    ]
  },
  {
    name: 'Administrasi',
    icon: 'M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76',
    children: [
      { name: 'Buku Tamu', route: '/guestbooks' },
      { name: 'Surat Masuk', route: '/incoming-mail' },
      { name: 'Surat Keluar', route: '/outgoing-mail' },
      { name: 'Disposisi Surat', route: '/mail-disposition' },
    ]
  },
  {
    name: 'Sistem',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    children: [
      { name: 'Manajemen Pengguna', route: '/users' },
      { name: 'Manajemen Role', route: '/roles' },
      { name: 'Hak Akses', route: '/permissions' },
    ]
  }
]

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* Custom scrollbar for sidebar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.4);
}

/* Page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
