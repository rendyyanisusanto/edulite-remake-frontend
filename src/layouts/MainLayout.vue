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
          
          <!-- Dashboard (always visible if authenticated) -->
          <router-link 
            v-if="canAccess('dashboard.view')"
            to="/dashboard"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors border-l-4 border-transparent hover:border-white w-full"
            active-class="bg-white/15 border-white font-bold"
          >
            <svg class="mr-3 flex-shrink-0 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Dashboard
          </router-link>

          <!-- Loading skeleton -->
          <template v-if="menuLoading">
            <div v-for="i in 4" :key="i" class="animate-pulse">
              <div class="h-10 bg-white/10 rounded-lg mb-2"></div>
            </div>
          </template>

          <!-- Dynamic Menu Groups -->
          <template v-else>
            <div v-for="(group, index) in visibleMenuGroups" :key="group.id || index" class="pt-2">
              <button 
                @click="toggleGroup(group.id || index)"
                class="flex items-center justify-between w-full px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
                :class="{ 'bg-white/5': expandedGroups[group.id || index] }"
              >
                <div class="flex items-center">
                  <svg class="mr-3 flex-shrink-0 h-5 w-5 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getGroupIcon(group.name)" />
                  </svg>
                  <span class="text-white/90">{{ group.name }}</span>
                </div>
                <svg 
                  class="w-4 h-4 transition-transform duration-200" 
                  :class="expandedGroups[group.id || index] ? 'transform rotate-180' : ''" 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <div 
                v-show="expandedGroups[group.id || index]"
                class="mt-1 pl-10 space-y-1 overflow-hidden transition-all duration-300"
              >
                <router-link 
                  v-for="menu in group.menus" 
                  :key="menu.id || menu.route"
                  :to="menu.route"
                  class="flex items-center px-4 py-2 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors border-l-2 border-transparent hover:border-white w-full"
                  active-class="bg-white/10 text-white border-white font-medium"
                >
                  {{ menu.name }}
                </router-link>
              </div>
            </div>
          </template>
          
        </nav>
      </div>

      <!-- User Info & Logout -->
      <div class="p-4 mt-auto shrink-0">
        <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg border border-white/30 truncate shrink-0">
              {{ user?.name?.charAt(0)?.toUpperCase() || 'A' }}
            </div>
            <div class="flex flex-col overflow-hidden">
              <span class="text-sm font-semibold truncate">{{ user?.name || 'Administrator' }}</span>
              <span class="text-xs text-white/70 truncate">{{ userRoles }}</span>
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
        <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl -z-10 pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>
        
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
import { computed, reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import menuService from '@/services/api/menu.service'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const userRoles = computed(() => (authStore.roles || []).join(', ') || 'User')
const currentRouteName = computed(() => route.name ? route.name.toString().replace(/([A-Z])/g, ' $1').trim() : '')

const menuLoading = ref(false)
const dynamicMenuGroups = ref([])

// Expanded state for menu groups
const expandedGroups = reactive({})

const toggleGroup = (key) => {
  expandedGroups[key] = !expandedGroups[key]
}

// Check if user can access a permission
const canAccess = (code) => authStore.hasPermission(code)

// Static fallback menu structure (used when API is unavailable)
const staticMenuGroups = [
  {
    id: 'manajemen-siswa',
    name: 'Manajemen Siswa',
    menus: [
      { name: 'Data Siswa', route: '/students', permission_code: 'student.view' },
      { name: 'Orang Tua / Wali', route: '/parents', permission_code: 'parent.view' },
      { name: 'Dokumen Siswa', route: '/student-docs', permission_code: 'student_document.view' },
      { name: 'Riwayat Kelas', route: '/class-history', permission_code: 'class_history.view' },
      { name: 'Mutasi Siswa', route: '/transfers', permission_code: 'student_transfer.view' },
      { name: 'Kartu Pelajar', route: '/id-cards', permission_code: 'id_card.view' },
    ]
  },
  {
    id: 'akademik',
    name: 'Akademik',
    menus: [
      { name: 'Tahun Ajaran', route: '/academic-years', permission_code: 'academic_year.view' },
      { name: 'Tingkat Kelas', route: '/grades', permission_code: 'grade.view' },
      { name: 'Jurusan', route: '/departments', permission_code: 'department.view' },
      { name: 'Kelas', route: '/classes', permission_code: 'class.view' },
      { name: 'Data Guru', route: '/teachers', permission_code: 'teacher.view' },
    ]
  },
  {
    id: 'prestasi',
    name: 'Prestasi & Kegiatan',
    menus: [
      { name: 'Data Prestasi', route: '/achievements', permission_code: 'achievement.view' },
      { name: 'Peserta Prestasi', route: '/achievement-participants', permission_code: 'achievement_participant.view' },
      { name: 'Hasil Prestasi', route: '/achievement-results', permission_code: 'achievement_result.view' },
      { name: 'Aturan Poin', route: '/achievement-point-rules', permission_code: 'achievement_point_rule.view' },
      { name: 'Piagam / Sertifikat', route: '/certificates', permission_code: 'certificate.view' },
    ]
  },
  {
    id: 'disiplin',
    name: 'Disiplin & Konseling',
    menus: [
      { name: 'Jenis Pelanggaran', route: '/violation-types', permission_code: 'violation_type.view' },
      { name: 'Level Pelanggaran', route: '/violation-levels', permission_code: 'violation_level.view' },
      { name: 'Data Pelanggaran Siswa', route: '/student-violations', permission_code: 'student_violation.view' },
      { name: 'Jenis Catatan Positif', route: '/positive-point-types', permission_code: 'positive_point_type.view' },
      { name: 'Catatan Positif Siswa', route: '/student-positive-points', permission_code: 'student_positive_point.view' },
      { name: 'Kasus Konseling', route: '/counseling-cases', permission_code: 'counseling_case.view' },
      { name: 'Sesi Konseling', route: '/counseling-sessions', permission_code: 'counseling_session.view' },
      { name: 'Tindak Lanjut Konseling', route: '/counseling-followups', permission_code: 'counseling_followup.view' },
      { name: 'Rapor Karakter', route: '/character-reports', permission_code: 'character_report.view' },
    ]
  },
  {
    id: 'administrasi',
    name: 'Administrasi',
    menus: [
      { name: 'Buku Tamu', route: '/guestbooks', permission_code: 'guestbook.view' },
      { name: 'Surat Izin Siswa', route: '/permission-letters', permission_code: 'permission_letter.view' },
      { name: 'Surat Masuk', route: '/incoming-mail', permission_code: 'incoming_mail.view' },
      { name: 'Surat Keluar', route: '/outgoing-mail', permission_code: 'outgoing_mail.view' },
      { name: 'Disposisi Surat', route: '/mail-disposition', permission_code: 'mail_disposition.view' },
    ]
  },
  {
    id: 'sistem',
    name: 'Sistem',
    menus: [
      { name: 'Manajemen Pengguna', route: '/users', permission_code: 'user.view' },
      { name: 'Manajemen Role', route: '/roles', permission_code: 'role.view' },
      { name: 'Hak Akses', route: '/permissions', permission_code: 'permission.view' },
    ]
  }
]

// Group icons map
const groupIconMap = {
  'Manajemen Siswa': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  'Akademik': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  'Prestasi & Kegiatan': 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  'Disiplin & Konseling': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.957 11.957 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  'Administrasi': 'M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76',
  'Sistem': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
}

const getGroupIcon = (name) => {
  return groupIconMap[name] || 'M4 6h16M4 12h16M4 18h16'
}

// Filter menus based on user permissions
const visibleMenuGroups = computed(() => {
  const source = dynamicMenuGroups.value.length > 0 ? dynamicMenuGroups.value : staticMenuGroups

  return source
    .map(group => {
      const visibleMenus = (group.menus || []).filter(menu => {
        if (!menu.permission_code) return true
        return canAccess(menu.permission_code)
      })
      return { ...group, menus: visibleMenus }
    })
    .filter(group => group.menus.length > 0)
})

// Load dynamic menus from API
const loadMenus = async () => {
  menuLoading.value = true
  try {
    const res = await menuService.getMyMenus()
    if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
      dynamicMenuGroups.value = res.data
      // Auto-expand first group
      if (res.data[0]) {
        expandedGroups[res.data[0].id || 0] = true
      }
    } else {
      // Fallback: use static menu with permission filtering
      dynamicMenuGroups.value = []
      if (staticMenuGroups[0]) {
        expandedGroups[staticMenuGroups[0].id] = true
      }
    }
  } catch {
    // Fallback to static menu
    dynamicMenuGroups.value = []
    if (staticMenuGroups[0]) {
      expandedGroups[staticMenuGroups[0].id] = true
    }
  } finally {
    menuLoading.value = false
  }
}

onMounted(() => {
  loadMenus()
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.4); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from { opacity: 0; transform: translateY(4px); }
.fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
