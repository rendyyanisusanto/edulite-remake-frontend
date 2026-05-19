<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Presensi Ekskul</h1>
      <p class="mt-1 text-sm text-gray-500">Pantau check-in pembina dari mobile dan kelola presensi siswa per sesi.</p>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-4">
      <div class="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <div class="lg:col-span-3">
          <label class="mb-1 block text-sm font-medium text-gray-700">Pilih Sesi</label>
          <select v-model="sessionId" class="w-full rounded border px-3 py-2" @change="onSessionChange">
            <option :value="null">-- pilih sesi --</option>
            <option v-for="s in sessions" :key="s.id" :value="s.id">
              {{ s.extracurricular?.name || '-' }} | {{ s.session_date }} | {{ s.status }}
            </option>
          </select>
        </div>
        <div class="flex items-end gap-2">
          <BaseButton variant="outline" class="w-full" @click="loadSessions" :loading="loadingSessions">Refresh Sesi</BaseButton>
        </div>
      </div>
    </div>

    <div v-if="selectedSession" class="grid grid-cols-1 gap-3 md:grid-cols-4">
      <div class="rounded-xl border p-4" :class="coachCheckedIn ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Status Pembina</p>
        <p class="mt-1 text-base font-bold" :class="coachCheckedIn ? 'text-green-700' : 'text-amber-700'">
          {{ coachCheckedIn ? 'Sudah Check-in' : 'Belum Check-in' }}
        </p>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Check-in</p>
        <p class="mt-1 text-sm font-semibold text-gray-800">{{ formatDateTime(selectedSession.coach_checkin_at) }}</p>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Check-out</p>
        <p class="mt-1 text-sm font-semibold text-gray-800">{{ formatDateTime(selectedSession.coach_checkout_at) }}</p>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Sesi</p>
        <p class="mt-1">
          <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="statusClass(selectedSession.status)">
            {{ selectedSession.status }}
          </span>
        </p>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-4">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p class="text-sm text-gray-600">
          <span class="font-semibold text-gray-800">Data Siswa:</span>
          {{ rows.length }} anggota
        </p>
        <div class="flex gap-2">
          <BaseButton variant="outline" @click="loadAttendances" :disabled="!sessionId" :loading="loading">Refresh Presensi</BaseButton>
          <BaseButton @click="save" :disabled="!canSave || loading" :loading="saving">Simpan Presensi</BaseButton>
        </div>
      </div>

      <div v-if="selectedSession && !isOpenSession" class="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
        Sesi tidak dalam status OPEN. Presensi siswa hanya bisa disimpan saat sesi OPEN.
      </div>

      <BaseTable :columns="columns" :data="rows" :loading="loading" :showPagination="false" :showActions="false">
        <template #cell-student_name="{ item }">{{ item.student?.full_name }}</template>
        <template #cell-status="{ item }">
          <div class="flex min-w-[220px] gap-1">
            <button
              v-for="opt in quickOptions"
              :key="opt.value"
              type="button"
              class="rounded px-2 py-1 text-xs font-semibold"
              :class="item.attendanceStatus === opt.value ? opt.activeClass : 'border border-gray-300 bg-white text-gray-600'"
              @click="item.attendanceStatus = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </template>
      </BaseTable>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import { extracurricularService } from '@/services/api/extracurricular.service'
import { useToast } from '@/composables/useToast'

const { success, error } = useToast()

const loading = ref(false)
const saving = ref(false)
const loadingSessions = ref(false)
const sessions = ref([])
const sessionId = ref(null)
const rows = ref([])

const columns = [
  { key: 'student_name', label: 'Siswa' },
  { key: 'status', label: 'Status Presensi' }
]

const quickOptions = [
  { label: 'M', value: 'PRESENT', activeClass: 'border border-green-600 bg-green-600 text-white' },
  { label: 'S', value: 'SICK', activeClass: 'border border-blue-600 bg-blue-600 text-white' },
  { label: 'I', value: 'PERMIT', activeClass: 'border border-amber-500 bg-amber-500 text-white' },
  { label: 'A', value: 'ABSENT', activeClass: 'border border-red-600 bg-red-600 text-white' },
  { label: 'T', value: 'LATE', activeClass: 'border border-purple-600 bg-purple-600 text-white' },
  { label: 'E', value: 'EXCUSED', activeClass: 'border border-gray-700 bg-gray-700 text-white' }
]

const selectedSession = computed(() => sessions.value.find(item => item.id === sessionId.value) || null)
const coachCheckedIn = computed(() => Boolean(selectedSession.value?.coach_checkin_at))
const isOpenSession = computed(() => selectedSession.value?.status === 'OPEN')
const canSave = computed(() => Boolean(sessionId.value) && isOpenSession.value && rows.value.length > 0)

function parseErrorMessage(err, fallback) {
  return err?.message || err?.error || fallback
}

function statusClass(status) {
  if (status === 'OPEN') return 'bg-green-100 text-green-700'
  if (status === 'CLOSED') return 'bg-slate-100 text-slate-700'
  if (status === 'CANCELLED') return 'bg-red-100 text-red-700'
  return 'bg-amber-100 text-amber-700'
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('id-ID')
}

async function loadSessions() {
  loadingSessions.value = true
  try {
    const r = await extracurricularService.getSessions({ limit: 200 })
    sessions.value = r?.data?.items || []
    if (!sessionId.value && sessions.value.length > 0) {
      sessionId.value = sessions.value[0].id
      await loadAttendances()
    }
  } catch (err) {
    error(parseErrorMessage(err, 'Gagal memuat sesi'))
  } finally {
    loadingSessions.value = false
  }
}

async function loadAttendances() {
  if (!sessionId.value) {
    rows.value = []
    return
  }

  loading.value = true
  try {
    const r = await extracurricularService.getSessionStudentAttendances(sessionId.value)
    rows.value = (r?.data || []).map((it) => ({
      ...it,
      attendanceStatus: it.attendance?.attendance_status || 'ABSENT'
    }))
  } catch (err) {
    error(parseErrorMessage(err, 'Gagal memuat presensi siswa'))
  } finally {
    loading.value = false
  }
}

async function onSessionChange() {
  await loadAttendances()
}

async function save() {
  if (!canSave.value) {
    error('Presensi hanya bisa disimpan saat sesi OPEN')
    return
  }

  saving.value = true
  try {
    await extracurricularService.bulkSessionStudentAttendances(
      sessionId.value,
      rows.value.map((r) => ({ student_id: r.student_id, attendance_status: r.attendanceStatus }))
    )
    success('Presensi siswa berhasil disimpan')
    await loadAttendances()
    await loadSessions()
  } catch (err) {
    error(parseErrorMessage(err, 'Gagal simpan presensi'))
  } finally {
    saving.value = false
  }
}

loadSessions()
</script>
