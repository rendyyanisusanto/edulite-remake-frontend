<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <button @click="$router.back()" class="flex items-center text-sm text-gray-500 hover:text-primary mb-2 transition-colors">
          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          Kembali
        </button>
        <h1 class="text-2xl font-bold text-gray-800">Riwayat Konseling Siswa</h1>
        <p class="text-sm text-gray-500 mt-1">Semua kasus konseling yang terkait dengan siswa ini.</p>
      </div>
    </div>

    <!-- Student Info -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5" v-if="studentInfo">
      <div class="flex items-center gap-4">
        <div class="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <span class="text-lg font-bold text-primary">{{ (studentInfo.full_name || '?').charAt(0) }}</span>
        </div>
        <div>
          <p class="font-bold text-gray-800 text-lg">{{ studentInfo.full_name }}</p>
          <p class="text-sm text-gray-500">NIS: {{ studentInfo.nis || '-' }}</p>
        </div>
        <BaseButton class="ml-auto" @click="$router.push({ name: 'CounselingCaseCreate' })">
          Buat Kasus Baru
        </BaseButton>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4" v-if="!loading">
      <div v-for="stat in statusSummary" :key="stat.label"
        class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
        <p class="text-2xl font-bold" :class="stat.color">{{ stat.count }}</p>
        <p class="text-xs text-gray-500 font-medium mt-1">{{ stat.label }}</p>
      </div>
    </div>

    <!-- Loading  -->
    <div v-if="loading" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse space-y-3">
      <div v-for="n in 4" :key="n" class="h-16 bg-gray-100 rounded-lg"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!items.length" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
      <svg class="mx-auto h-12 w-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
      <p class="text-gray-500 font-medium">Belum ada kasus konseling untuk siswa ini</p>
    </div>

    <!-- Case List -->
    <div v-else class="space-y-3">
      <div
        v-for="c in items" :key="c.id"
        @click="$router.push({ name: 'CounselingCaseDetail', params: { id: c.id } })"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-blue-100 transition-all group"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="getStatusBadge(c.status)">{{ formatStatus(c.status) }}</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="getLevelBadge(c.level)">{{ formatLevel(c.level) }}</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="getCategoryBadge(c.category)">{{ c.category || '-' }}</span>
            </div>
            <p class="font-semibold text-gray-800 group-hover:text-primary transition-colors line-clamp-1">{{ c.issue_title }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ formatSource(c.source) }} · {{ formatDateTime(c.created_at) }}</p>
          </div>
          <svg class="h-4 w-4 text-gray-300 group-hover:text-primary flex-shrink-0 mt-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center gap-2 pt-2">
      <button v-for="p in totalPages" :key="p" @click="changePage(p)"
        class="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
        :class="p === currentPage ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'">
        {{ p }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import counselingCaseService from '@/services/api/counselingCase.service'
import studentService from '@/services/api/student.service'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const { error: showError } = useToast()

const items = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const limit = ref(20)
const totalPages = computed(() => Math.ceil(total.value / limit.value))
const studentInfo = ref(null)

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Terbuka' },
  { value: 'IN_PROGRESS', label: 'Sedang Diproses' },
  { value: 'RESOLVED', label: 'Selesai' },
  { value: 'CLOSED', label: 'Ditutup' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
]
const SOURCE_OPTIONS = [
  { value: 'HOMEROOM_TEACHER', label: 'Wali Kelas' },
  { value: 'SUBJECT_TEACHER', label: 'Guru Mapel' },
  { value: 'PARENT', label: 'Orang Tua' },
  { value: 'STUDENT_SELF_REPORT', label: 'Lapor Diri' },
  { value: 'DISCIPLINE_TEAM', label: 'Tim Kedisiplinan' },
  { value: 'COUNSELOR', label: 'Konselor' },
  { value: 'OTHER', label: 'Lainnya' },
]
const LEVEL_OPTIONS = [
  { value: 'LOW', label: 'Rendah' },
  { value: 'MEDIUM', label: 'Sedang' },
  { value: 'HIGH', label: 'Tinggi' },
  { value: 'CRITICAL', label: 'Kritis' },
]

const statusSummary = computed(() => {
  const counts = {}
  items.value.forEach(c => { counts[c.status] = (counts[c.status] || 0) + 1 })
  const colorMap = { OPEN: 'text-red-600', IN_PROGRESS: 'text-amber-600', RESOLVED: 'text-green-600', CLOSED: 'text-gray-500', CANCELLED: 'text-slate-400' }
  return STATUS_OPTIONS.map(s => ({ label: s.label, count: counts[s.value] || 0, color: colorMap[s.value] })).filter(s => s.count > 0)
})

const formatStatus = (val) => STATUS_OPTIONS.find(s => s.value === val)?.label || val || '-'
const formatSource = (val) => SOURCE_OPTIONS.find(s => s.value === val)?.label || val || '-'
const formatLevel = (val) => LEVEL_OPTIONS.find(l => l.value === val)?.label || val || '-'
const formatDateTime = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
const getLevelBadge = (v) => ({ LOW: 'bg-green-100 text-green-700', MEDIUM: 'bg-yellow-100 text-yellow-700', HIGH: 'bg-orange-100 text-orange-700', CRITICAL: 'bg-red-100 text-red-700' }[v] || 'bg-gray-100 text-gray-700')
const getStatusBadge = (v) => ({ OPEN: 'bg-red-100 text-red-700', IN_PROGRESS: 'bg-amber-100 text-amber-700', RESOLVED: 'bg-green-100 text-green-700', CLOSED: 'bg-gray-100 text-gray-700', CANCELLED: 'bg-slate-100 text-slate-500' }[v] || 'bg-gray-100 text-gray-700')
const getCategoryBadge = (v) => ({ ACADEMIC: 'bg-blue-100 text-blue-700', BEHAVIOR: 'bg-purple-100 text-purple-700', DISCIPLINE: 'bg-red-100 text-red-700', SOCIAL: 'bg-teal-100 text-teal-700', EMOTIONAL: 'bg-pink-100 text-pink-700', ATTENDANCE: 'bg-orange-100 text-orange-700', FAMILY: 'bg-indigo-100 text-indigo-700', OTHER: 'bg-gray-100 text-gray-700' }[v] || 'bg-gray-100 text-gray-700')

const fetchData = async () => {
  loading.value = true
  try {
    const r = await counselingCaseService.getByStudent(route.params.studentId, { page: currentPage.value, limit: limit.value })
    if (r.success) {
      items.value = r.data.counselingCases
      total.value = r.data.totalItems
    }
  } catch (e) {
    showError('Gagal memuat riwayat konseling')
  } finally {
    loading.value = false
  }
}

const fetchStudent = async () => {
  try {
    const r = await studentService.getById(route.params.studentId)
    if (r.success) studentInfo.value = r.data
  } catch (e) {}
}

const changePage = (p) => { currentPage.value = p; fetchData() }

onMounted(() => { fetchData(); fetchStudent() })
</script>
