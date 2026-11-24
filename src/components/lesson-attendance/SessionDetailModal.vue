<template>
  <BaseModal :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" maxWidth="4xl" :title="modalTitle">
    <div v-if="loading" class="py-12 text-center text-gray-500">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
      <p class="text-sm">Memuat detail transaksi presensi...</p>
    </div>

    <div v-else-if="errorMsg" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      {{ errorMsg }}
    </div>

    <div v-else-if="detail" class="space-y-4">
      <!-- Cancelled Banner -->
      <div v-if="detail.session.is_cancelled" class="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-sm flex items-center justify-between">
        <div>
          <span class="font-semibold">Transaksi Dibatalkan</span> — Dibatalkan pada {{ formatDateTime(detail.session.cancelled_at) }}. Data tidak dihitung dalam laporan valid.
        </div>
      </div>

      <!-- Session Header Info -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-lg border border-gray-200 text-xs">
        <div>
          <span class="text-gray-500 block">Kelas</span>
          <span class="font-semibold text-gray-900">{{ detail.session.class_name }}</span>
        </div>
        <div>
          <span class="text-gray-500 block">Tanggal</span>
          <span class="font-semibold text-gray-900">{{ formatDate(detail.session.attendance_date) }}</span>
        </div>
        <div>
          <span class="text-gray-500 block">Jam Pelajaran</span>
          <span class="font-semibold text-gray-900">Jam ke-{{ detail.session.period_number }} ({{ sliceTime(detail.session.period_start_time) }} - {{ sliceTime(detail.session.period_end_time) }})</span>
        </div>
        <div>
          <span class="text-gray-500 block">Tahun Ajaran</span>
          <span class="font-semibold text-gray-900">{{ detail.session.academic_year_name }}</span>
        </div>
        <div>
          <span class="text-gray-500 block">Mata Pelajaran</span>
          <span class="font-semibold text-gray-900">{{ detail.session.subject_name }}</span>
        </div>
        <div>
          <span class="text-gray-500 block">Guru Pengajar</span>
          <span class="font-semibold text-gray-900">{{ detail.session.teacher_name }}</span>
        </div>
        <div>
          <span class="text-gray-500 block">Metode Input</span>
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" :class="detail.session.input_method === 'QR' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'">
            {{ detail.session.input_method === 'QR' ? 'QR Code' : 'Admin' }}
          </span>
        </div>
        <div>
          <span class="text-gray-500 block">Waktu Simpan</span>
          <span class="font-semibold text-gray-900">{{ formatDateTime(detail.session.created_at) }}</span>
        </div>
      </div>

      <div v-if="detail.session.notes" class="text-xs bg-blue-50/60 border border-blue-100 rounded-lg px-3 py-2 text-gray-700">
        <span class="font-semibold">Catatan Sesi:</span> {{ detail.session.notes }}
      </div>

      <!-- Tabs: Detail Siswa | Riwayat Perubahan -->
      <div class="border-b border-gray-200 flex space-x-6">
        <button
          type="button"
          @click="activeTab = 'students'"
          class="pb-2 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === 'students' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
          Daftar Siswa ({{ detail.summary.total_students }})
        </button>
        <button
          v-if="canAudit"
          type="button"
          @click="switchToAuditTab"
          class="pb-2 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === 'audit' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
          Riwayat Perubahan
        </button>
      </div>

      <!-- Tab 1: Students -->
      <div v-if="activeTab === 'students'" class="space-y-3">
        <!-- Summary Badges -->
        <div class="flex flex-wrap gap-2 text-xs">
          <span class="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">Total: {{ detail.summary.total_students }}</span>
          <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">Hadir: {{ detail.summary.HADIR }}</span>
          <span class="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">Terlambat: {{ detail.summary.TERLAMBAT }}</span>
          <span class="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">Izin: {{ detail.summary.IZIN }}</span>
          <span class="px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 font-medium">Sakit: {{ detail.summary.SAKIT }}</span>
          <span class="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-medium">Alpa: {{ detail.summary.ALPA }}</span>
        </div>

        <!-- Search & Filter -->
        <div class="flex flex-col sm:flex-row gap-2">
          <input
            v-model="studentSearch"
            type="text"
            placeholder="Cari NIS atau nama siswa..."
            class="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
          />
          <select
            v-model="studentStatusFilter"
            class="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">Semua Status</option>
            <option value="HADIR">HADIR</option>
            <option value="TERLAMBAT">TERLAMBAT</option>
            <option value="IZIN">IZIN</option>
            <option value="SAKIT">SAKIT</option>
            <option value="ALPA">ALPA</option>
          </select>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto border border-gray-200 rounded-lg max-h-80">
          <table class="min-w-full divide-y divide-gray-200 text-xs">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-3 py-2 text-center font-semibold text-gray-600 w-10">No</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 w-28">NIS</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600">Nama Siswa</th>
                <th class="px-3 py-2 text-center font-semibold text-gray-600 w-28">Status</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600">Catatan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-if="filteredStudents.length === 0">
                <td colspan="5" class="px-3 py-6 text-center text-gray-500">Tidak ada siswa yang sesuai filter.</td>
              </tr>
              <tr v-for="(s, idx) in filteredStudents" :key="s.student_id" class="hover:bg-gray-50">
                <td class="px-3 py-2 text-center text-gray-500">{{ idx + 1 }}</td>
                <td class="px-3 py-2 font-mono text-gray-700">{{ s.nis || '-' }}</td>
                <td class="px-3 py-2 font-medium text-gray-900">
                  {{ s.full_name }}
                  <span v-if="s.student_status && s.student_status !== 'ACTIVE'" class="ml-1 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                    {{ s.student_status }}
                  </span>
                </td>
                <td class="px-3 py-2 text-center">
                  <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold" :class="statusBadgeClass(s.status)">
                    {{ s.status }}
                  </span>
                </td>
                <td class="px-3 py-2 text-gray-600">{{ s.notes || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 2: Audit Trail Timeline -->
      <div v-else-if="activeTab === 'audit'" class="space-y-3">
        <div v-if="logsLoading" class="py-8 text-center text-sm text-gray-500">Memuat riwayat perubahan...</div>
        <div v-else-if="logsError" class="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">{{ logsError }}</div>
        <div v-else-if="logs.length === 0" class="py-8 text-center text-sm text-gray-500">Belum ada catatan riwayat perubahan.</div>
        <ol v-else class="relative border-l border-gray-200 ml-3 space-y-4 py-1 max-h-96 overflow-y-auto pr-2">
          <li v-for="log in logs" :key="log.id" class="ml-5">
            <span class="absolute -left-2 flex items-center justify-center w-4 h-4 rounded-full ring-4 ring-white" :class="logDotClass(log.action)"></span>
            <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs space-y-1.5">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="font-semibold text-gray-900">{{ formatActionTitle(log.action) }}</span>
                <span class="text-gray-500">{{ formatDateTime(log.created_at) }}</span>
              </div>
              <div class="text-gray-600">
                Oleh: <span class="font-medium text-gray-800">{{ formatActor(log) }}</span>
              </div>
              <div v-if="log.description" class="text-gray-700">
                <span class="font-medium">Keterangan:</span> {{ log.description }}
              </div>
              <!-- Readable diff for corrections -->
              <div v-if="log.action === 'ATTENDANCE_CORRECTED'" class="mt-2 pt-2 border-t border-gray-200 space-y-1">
                <div v-if="log.old_data?.teacher_id !== undefined" class="text-gray-700">
                  Guru pengajar diubah (ID {{ log.old_data.teacher_id }} → ID {{ log.new_data?.teacher_id }})
                </div>
                <div v-if="log.old_data?.subject_id !== undefined" class="text-gray-700">
                  Mata pelajaran diubah (ID {{ log.old_data.subject_id }} → ID {{ log.new_data?.subject_id }})
                </div>
                <div v-if="log.old_data?.notes !== undefined" class="text-gray-700">
                  Catatan sesi: "{{ log.old_data.notes || '-' }}" → "{{ log.new_data?.notes || '-' }}"
                </div>
                <div v-if="Array.isArray(log.new_data?.students) && log.new_data.students.length > 0" class="space-y-1">
                  <div v-for="(st, idx) in log.new_data.students" :key="st.student_id" class="flex flex-wrap items-center gap-1.5 text-gray-800">
                    <span class="font-medium">{{ st.student_name || `Siswa #${st.student_id}` }}:</span>
                    <span class="px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">{{ log.old_data?.students?.[idx]?.status || '-' }}</span>
                    <span>→</span>
                    <span class="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">{{ st.status }}</span>
                    <span v-if="st.notes !== log.old_data?.students?.[idx]?.notes" class="text-gray-500 italic">
                      (catatan: "{{ log.old_data?.students?.[idx]?.notes || '-' }}" → "{{ st.notes || '-' }}")
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ol>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-wrap justify-end gap-2 w-full">
        <button
          v-if="detail && !detail.session.is_cancelled && canCorrect"
          type="button"
          @click="$emit('request-correct', detail)"
          class="px-3 py-1.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md"
        >
          Koreksi Presensi
        </button>
        <button
          v-if="detail && !detail.session.is_cancelled && canCancel"
          type="button"
          @click="$emit('request-cancel', detail.session)"
          class="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
        >
          Batalkan Presensi
        </button>
        <button
          v-if="detail && detail.session.is_cancelled && canRestore"
          type="button"
          @click="$emit('request-restore', detail.session)"
          class="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md"
        >
          Pulihkan Presensi
        </button>
        <button
          type="button"
          @click="$emit('update:modelValue', false)"
          class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Tutup
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import lessonAttendanceService from '@/services/api/lessonAttendance.service'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  sessionId: { type: [String, Number], default: null },
  initialTab: { type: String, default: 'students' }
})

defineEmits(['update:modelValue', 'request-correct', 'request-cancel', 'request-restore'])

const authStore = useAuthStore()
const canCorrect = computed(() => authStore.hasPermission('lesson_attendance.data.correct'))
const canCancel = computed(() => authStore.hasPermission('lesson_attendance.data.cancel'))
const canRestore = computed(() => authStore.hasPermission('lesson_attendance.data.restore'))
const canAudit = computed(() => authStore.hasPermission('lesson_attendance.data.audit'))

const loading = ref(false)
const errorMsg = ref('')
const detail = ref(null)
const activeTab = ref('students')
const studentSearch = ref('')
const studentStatusFilter = ref('')

const logsLoading = ref(false)
const logsError = ref('')
const logs = ref([])

const modalTitle = computed(() => {
  if (!detail.value) return 'Detail Transaksi Presensi'
  return `Detail Presensi — ${detail.value.session.class_name} (Jam ke-${detail.value.session.period_number})`
})

const filteredStudents = computed(() => {
  if (!detail.value?.students) return []
  const q = studentSearch.value.trim().toLowerCase()
  return detail.value.students.filter((s) => {
    if (studentStatusFilter.value && s.status !== studentStatusFilter.value) return false
    if (q) {
      return (s.full_name || '').toLowerCase().includes(q) || (s.nis || '').toLowerCase().includes(q)
    }
    return true
  })
})

const loadDetail = async () => {
  if (!props.sessionId) return
  loading.value = true
  errorMsg.value = ''
  detail.value = null
  logs.value = []
  try {
    const res = await lessonAttendanceService.getSessionDetail(props.sessionId)
    detail.value = res.data?.data || res.data
    if (props.initialTab === 'audit' && canAudit.value) {
      activeTab.value = 'audit'
      await loadLogs()
    } else {
      activeTab.value = 'students'
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal memuat detail transaksi.'
  } finally {
    loading.value = false
  }
}

const loadLogs = async () => {
  if (!props.sessionId || !canAudit.value) return
  logsLoading.value = true
  logsError.value = ''
  try {
    const res = await lessonAttendanceService.getSessionLogs(props.sessionId)
    logs.value = res.data?.data || res.data || []
  } catch (err) {
    logsError.value = err.response?.data?.message || 'Gagal memuat riwayat perubahan.'
  } finally {
    logsLoading.value = false
  }
}

const switchToAuditTab = () => {
  activeTab.value = 'audit'
  if (logs.value.length === 0 && !logsLoading.value) {
    loadLogs()
  }
}

watch(() => [props.modelValue, props.sessionId], ([open, id]) => {
  if (open && id) {
    studentSearch.value = ''
    studentStatusFilter.value = ''
    loadDetail()
  }
})

const formatDate = (val) => {
  if (!val) return '-'
  return new Date(`${String(val).slice(0, 10)}T00:00:00`).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

const formatDateTime = (val) => {
  if (!val) return '-'
  return new Date(val).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) + ' WIB'
}

const sliceTime = (t) => (t ? String(t).slice(0, 5) : '--:--')

const statusBadgeClass = (st) => ({
  HADIR: 'bg-emerald-100 text-emerald-800',
  TERLAMBAT: 'bg-amber-100 text-amber-800',
  IZIN: 'bg-blue-100 text-blue-800',
  SAKIT: 'bg-orange-100 text-orange-800',
  ALPA: 'bg-red-100 text-red-800'
}[st] || 'bg-gray-100 text-gray-800')

const logDotClass = (action) => ({
  ATTENDANCE_SUBMITTED: 'bg-emerald-500',
  ATTENDANCE_MANUAL_CREATED: 'bg-purple-500',
  ATTENDANCE_CORRECTED: 'bg-amber-500',
  ATTENDANCE_CANCELLED: 'bg-red-500',
  ATTENDANCE_RESTORED: 'bg-blue-500'
}[action] || 'bg-gray-400')

const formatActionTitle = (action) => ({
  ATTENDANCE_SUBMITTED: 'Presensi dibuat melalui QR Code',
  ATTENDANCE_MANUAL_CREATED: 'Presensi manual dibuat oleh Administrator',
  ATTENDANCE_CORRECTED: 'Koreksi presensi',
  ATTENDANCE_CANCELLED: 'Presensi dibatalkan',
  ATTENDANCE_RESTORED: 'Presensi dipulihkan'
}[action] || action)

const formatActor = (log) => {
  if (log.actor_user) return log.actor_user.name
  if (log.teacher) return log.teacher.full_name
  return 'Sistem'
}
</script>
