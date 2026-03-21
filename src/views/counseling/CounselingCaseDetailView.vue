<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <button @click="$router.back()" class="flex items-center text-sm text-gray-500 hover:text-primary mb-2 transition-colors">
          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          Kembali
        </button>
        <h1 class="text-2xl font-bold text-gray-800">Detail Kasus Konseling</h1>
      </div>
      <div class="flex items-center gap-2" v-if="item">
        <BaseButton variant="primary" @click="$router.push({ name: 'CounselingSessionCreate', params: { caseId: item.id } })">
          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Tambah Sesi
        </BaseButton>
        <BaseButton variant="outline" @click="openStatusModal">Ubah Status</BaseButton>
        <BaseButton @click="$router.push({ name: 'CounselingCaseEdit', params: { id: item.id } })">Edit Kasus</BaseButton>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div class="space-y-2">
          <div class="h-3 bg-gray-100 rounded w-3/4"></div>
          <div class="h-3 bg-gray-100 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="!item" class="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
      <svg class="mx-auto h-12 w-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <p class="text-gray-500 font-medium">Data kasus tidak ditemukan</p>
    </div>

    <template v-else>
      <!-- Section 1: Student Info -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Informasi Siswa</h2>
        <div class="flex items-center gap-4">
          <div class="flex-shrink-0 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <span class="text-xl font-bold text-primary">{{ (item.student?.full_name || '?').charAt(0) }}</span>
          </div>
          <div>
            <p class="text-lg font-bold text-gray-800">{{ item.student?.full_name || '-' }}</p>
            <p class="text-sm text-gray-500">NIS: {{ item.student?.nis || '-' }}</p>
            <button @click="$router.push({ name: 'StudentCounselingHistory', params: { studentId: item.student_id } })"
              class="mt-1 text-xs text-primary hover:underline font-medium flex items-center gap-1">
              <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Lihat Riwayat Konseling Siswa
            </button>
          </div>
        </div>
      </div>

      <!-- Section 2: Case Info -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-start justify-between mb-4">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Informasi Kasus</h2>
          <span class="px-3 py-1 rounded-full text-xs font-semibold" :class="getStatusBadge(item.status)">{{ formatStatus(item.status) }}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <p class="text-xs text-gray-400 font-medium mb-0.5">Sumber</p>
            <p class="text-sm font-medium text-gray-700">{{ formatSource(item.source) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 font-medium mb-0.5">Kategori</p>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold inline-block" :class="getCategoryBadge(item.category)">{{ item.category || '-' }}</span>
          </div>
          <div>
            <p class="text-xs text-gray-400 font-medium mb-0.5">Level</p>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold inline-block" :class="getLevelBadge(item.level)">{{ formatLevel(item.level) }}</span>
          </div>
        </div>
        <div class="border-t border-gray-50 pt-4">
          <p class="text-xs text-gray-400 font-medium mb-1">Judul Masalah</p>
          <p class="text-base font-semibold text-gray-800 mb-3">{{ item.issue_title }}</p>
          <p class="text-xs text-gray-400 font-medium mb-1">Deskripsi Masalah</p>
          <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{{ item.issue_description || '-' }}</p>
        </div>
      </div>

      <!-- Section 3: Audit Info -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Informasi Audit</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-gray-400 font-medium mb-0.5">Dibuat Pada</p>
            <p class="text-sm text-gray-700">{{ formatDateTime(item.created_at) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 font-medium mb-0.5">Dibuat Oleh</p>
            <p class="text-sm text-gray-700">{{ item.creator?.name || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 font-medium mb-0.5">Diperbarui Pada</p>
            <p class="text-sm text-gray-700">{{ formatDateTime(item.updated_at) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 font-medium mb-0.5">Diperbarui Oleh</p>
            <p class="text-sm text-gray-700">{{ item.updater?.name || '-' }}</p>
          </div>
        </div>
      </div>

      <!-- Section 4: Counseling Sessions -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Sesi Konseling</h2>
        <div v-if="sessionsLoading" class="animate-pulse space-y-2">
          <div class="h-10 bg-gray-100 rounded w-full"></div>
        </div>
        <div v-else-if="!sessions.length" class="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
          Belum ada sesi konseling yang dicatat.
        </div>
        <div v-else class="space-y-3">
          <div v-for="s in sessions" :key="s.id" class="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
            <div class="flex items-start justify-between">
              <div>
                <p class="font-semibold text-gray-800">{{ formatDateTime(s.session_date || s.created_at) }} - {{ formatMethod(s.method) }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Konselor: <span class="font-medium text-gray-700">{{ s.counselor?.name || '-' }}</span> | Durasi: {{ s.duration }} menit</p>
              </div>
              <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="$router.push({ name: 'CounselingSessionEdit', params: { id: s.id } })" class="text-xs font-medium text-blue-600 hover:text-blue-800">Edit</button>
                <button @click="confirmDeleteSession(s.id)" class="text-xs font-medium text-red-600 hover:text-red-800">Hapus</button>
              </div>
            </div>
            <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-white p-3 rounded border border-gray-100">
                <p class="text-[10px] uppercase font-bold text-gray-400 mb-1">Catatan Sesi</p>
                <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ s.notes }}</p>
              </div>
              <div class="bg-white p-3 rounded border border-gray-100">
                <p class="text-[10px] uppercase font-bold text-gray-400 mb-1">Rencana Tindak Lanjut</p>
                <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ s.next_plan || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 5: Follow-Up Timeline -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Timeline Kasus</h2>
        <div class="relative border-l-2 border-gray-100 ml-4 space-y-8">
          <div v-for="(event, idx) in timeline" :key="idx" class="relative pl-6">
            <div class="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white" :class="getTimelineColor(event.color)"></div>
            <div>
              <p class="text-xs text-gray-400 font-medium mb-1">{{ formatDateTime(event.date) }}</p>
              <p class="text-sm font-bold text-gray-800">{{ event.title }}</p>
              <div class="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                {{ event.description }}
                <div v-if="event.next_plan" class="mt-2 pt-2 border-t border-gray-200">
                  <span class="font-semibold text-xs uppercase text-gray-500 block mb-1">Tindak Lanjut:</span>
                  <span class="text-gray-700">{{ event.next_plan }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 6: Related Cases Preview -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6" v-if="relatedCases.length">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Kasus Lain untuk Siswa Ini</h2>
          <button @click="$router.push({ name: 'StudentCounselingHistory', params: { studentId: item.student_id } })"
            class="text-xs text-primary hover:underline font-medium">Lihat Semua</button>
        </div>
        <ul class="divide-y divide-gray-50">
          <li v-for="c in relatedCases" :key="c.id"
            class="flex items-center justify-between py-2.5 cursor-pointer hover:bg-gray-50 rounded-lg px-1 transition-colors"
            @click="$router.push({ name: 'CounselingCaseDetail', params: { id: c.id } })">
            <div>
              <p class="text-sm font-medium text-gray-800">{{ c.issue_title }}</p>
              <p class="text-xs text-gray-400">{{ formatDate(c.created_at) }}</p>
            </div>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="getStatusBadge(c.status)">{{ formatStatus(c.status) }}</span>
          </li>
        </ul>
      </div>
    </template>

    <!-- Status Modal -->
    <BaseModal v-model="showStatusModal" title="Ubah Status Kasus" maxWidth="sm">
      <div class="space-y-4">
        <p class="text-sm text-gray-600">Kasus: <span class="font-semibold text-gray-800">{{ item?.issue_title }}</span></p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status Baru <span class="text-red-500">*</span></label>
          <select v-model="newStatus" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
            <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showStatusModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="submitStatusChange" :loading="statusSaving">Simpan Status</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import counselingCaseService from '@/services/api/counselingCase.service'
import counselingSessionService from '@/services/api/counselingSession.service'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const { success, error: showError, confirm } = useToast()

const item = ref(null)
const loading = ref(false)
const relatedCases = ref([])
const sessions = ref([])
const timeline = ref([])
const sessionsLoading = ref(false)
const showStatusModal = ref(false)
const newStatus = ref('')
const statusSaving = ref(false)

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Terbuka' },
  { value: 'IN_PROGRESS', label: 'Sedang Diproses' },
  { value: 'RESOLVED', label: 'Selesai' },
  { value: 'CLOSED', label: 'Ditutup' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
]
const METHOD_OPTIONS = [
  { value: 'FACE_TO_FACE', label: 'Tatap Muka' },
  { value: 'HOME_VISIT', label: 'Kunjungan Rumah' },
  { value: 'PHONE_CALL', label: 'Panggilan Telepon' },
  { value: 'ONLINE_MEETING', label: 'Pertemuan Daring' },
  { value: 'PARENT_MEETING', label: 'Pertemuan Orang Tua' },
  { value: 'CLASS_OBSERVATION', label: 'Observasi Kelas' },
  { value: 'REFERRAL', label: 'Rujukan' },
  { value: 'OTHER', label: 'Lainnya' },
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

const formatStatus = (val) => STATUS_OPTIONS.find(s => s.value === val)?.label || val || '-'
const formatSource = (val) => SOURCE_OPTIONS.find(s => s.value === val)?.label || val || '-'
const formatLevel = (val) => LEVEL_OPTIONS.find(l => l.value === val)?.label || val || '-'
const formatDateTime = (d) => d ? new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
const getLevelBadge = (v) => ({ LOW: 'bg-green-100 text-green-700', MEDIUM: 'bg-yellow-100 text-yellow-700', HIGH: 'bg-orange-100 text-orange-700', CRITICAL: 'bg-red-100 text-red-700' }[v] || 'bg-gray-100 text-gray-700')
const getStatusBadge = (v) => ({ OPEN: 'bg-red-100 text-red-700', IN_PROGRESS: 'bg-amber-100 text-amber-700', RESOLVED: 'bg-green-100 text-green-700', CLOSED: 'bg-gray-100 text-gray-700', CANCELLED: 'bg-slate-100 text-slate-500' }[v] || 'bg-gray-100 text-gray-700')
const getCategoryBadge = (v) => ({ ACADEMIC: 'bg-blue-100 text-blue-700', BEHAVIOR: 'bg-purple-100 text-purple-700', DISCIPLINE: 'bg-red-100 text-red-700', SOCIAL: 'bg-teal-100 text-teal-700', EMOTIONAL: 'bg-pink-100 text-pink-700', ATTENDANCE: 'bg-orange-100 text-orange-700', FAMILY: 'bg-indigo-100 text-indigo-700', OTHER: 'bg-gray-100 text-gray-700' }[v] || 'bg-gray-100 text-gray-700')
const formatMethod = (val) => METHOD_OPTIONS.find(m => m.value === val)?.label || val || '-'
const getTimelineColor = (color) => ({ blue: 'bg-blue-500', green: 'bg-green-500', orange: 'bg-orange-500', red: 'bg-red-500', gray: 'bg-gray-500' }[color] || 'bg-gray-500')

const fetchDetail = async () => {
  loading.value = true
  try {
    const r = await counselingCaseService.getById(route.params.id)
    if (r.success) {
      item.value = r.data
      newStatus.value = r.data.status
      fetchRelated(r.data.student_id, r.data.id)
      fetchSessionsAndTimeline(r.data.id)
    }
  } catch (e) {
    showError('Gagal memuat data kasus')
  } finally {
    loading.value = false
  }
}

const fetchRelated = async (studentId, excludeId) => {
  try {
    const r = await counselingCaseService.getByStudent(studentId, { limit: 5 })
    if (r.success) relatedCases.value = r.data.counselingCases.filter(c => c.id !== Number(excludeId)).slice(0, 4)
  } catch (e) {}
}

const fetchSessionsAndTimeline = async (caseId) => {
  sessionsLoading.value = true
  try {
    const [sessRes, timeRes] = await Promise.all([
      counselingSessionService.getByCaseId(caseId, { limit: 100 }),
      counselingSessionService.getCaseTimeline(caseId)
    ])
    if (sessRes.success) sessions.value = sessRes.data.counselingSessions
    if (timeRes.success) timeline.value = timeRes.data
  } catch (e) {
    showError('Gagal memuat sesi dan timeline')
  } finally {
    sessionsLoading.value = false
  }
}

const confirmDeleteSession = async (id) => {
  if (window.confirm('Apakah Anda yakin ingin menghapus sesi ini?')) {
    try {
      await counselingSessionService.delete(id)
      success('Sesi berhasil dihapus')
      fetchSessionsAndTimeline(item.value.id)
    } catch (e) {
      showError('Gagal menghapus sesi')
    }
  }
}

const openStatusModal = () => { showStatusModal.value = true }

const submitStatusChange = async () => {
  statusSaving.value = true
  try {
    await counselingCaseService.updateStatus(item.value.id, newStatus.value)
    success('Status berhasil diubah')
    showStatusModal.value = false
    fetchDetail()
  } catch (e) {
    showError('Gagal mengubah status')
  } finally {
    statusSaving.value = false
  }
}

onMounted(fetchDetail)
</script>
