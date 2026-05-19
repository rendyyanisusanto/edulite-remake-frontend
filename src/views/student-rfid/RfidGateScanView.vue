<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0984e3] via-[#1d94ea] to-[#5dade2] text-white p-8">
    <div class="max-w-6xl mx-auto h-full flex flex-col">
      <div class="flex items-center justify-between mb-8">
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-blue-100">Kiosk Gerbang</p>
          <h1 class="text-4xl md:text-6xl font-black mt-2">SCAN KARTU RFID SISWA</h1>
        </div>
        <div class="text-right">
          <p class="text-5xl font-black tabular-nums">{{ liveTime }}</p>
          <p class="text-xl text-blue-100 mt-1">{{ liveDate }}</p>
        </div>
      </div>

      <div class="grid md:grid-cols-[1.45fr_1fr] gap-4">
        <div class="rounded-3xl bg-white border border-slate-200 shadow-xl p-5 flex flex-col justify-center text-slate-800">
          <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Status Scan</p>
          <p class="text-3xl md:text-4xl font-black mt-2" :class="statusClass">{{ statusTitle }}</p>
          <p class="text-sm md:text-base mt-2 text-slate-700">{{ statusMessage }}</p>

          <div class="mt-4 grid md:grid-cols-2 gap-3 text-sm">
            <div class="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p class="text-slate-500 text-sm">Nama</p>
              <p class="font-semibold text-lg">{{ result.student_name || '-' }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p class="text-slate-500 text-sm">Kelas</p>
              <p class="font-semibold text-lg">{{ result.class_name || '-' }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p class="text-slate-500 text-sm">Jenis Scan</p>
              <p class="font-semibold text-lg">{{ result.scan_mode || '-' }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p class="text-slate-500 text-sm">Status</p>
              <p class="font-semibold text-lg">{{ result.entry_status || result.exit_status || '-' }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-3xl bg-white border border-slate-200 shadow-xl p-4 flex flex-col gap-3 text-slate-800">
          <div class="rounded-xl border border-blue-200 bg-blue-50 p-3 text-center text-base font-bold text-blue-800">
            {{ isSubmitting ? 'Memproses...' : 'Siap Scan' }}
          </div>

          <form @submit.prevent="submitScan" class="space-y-2">
            <label class="text-xs text-slate-600">Input RFID</label>
            <input
              ref="rfidInput"
              v-model="rfidCode"
              type="text"
              autocomplete="off"
              spellcheck="false"
              @keydown.enter.prevent="submitScan"
              @input="handleRfidInput"
              class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-xl font-bold tracking-widest text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-200"
              placeholder="Tap Kartu..."
              :disabled="isSubmitting"
            />
            <p class="text-xs text-slate-500">Scan otomatis diproses tanpa tombol.</p>
          </form>

          <div class="flex gap-2">
            <button class="flex-1 rounded-lg border border-slate-300 bg-white py-2 text-sm text-slate-700 hover:bg-slate-50" @click="enterFullscreen">Fullscreen</button>
            <button class="flex-1 rounded-lg border border-slate-300 bg-white py-2 text-sm text-slate-700 hover:bg-slate-50" @click="refreshPage">Refresh</button>
          </div>
        </div>
      </div>

      <div class="mt-4 rounded-3xl bg-white border border-slate-200 shadow-xl p-6 text-slate-800 flex-1 min-h-[50vh]">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Histori Absen</p>
            <h2 class="text-xl md:text-2xl font-black text-slate-900 mt-1">SCAN SISWA HARI INI</h2>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="rounded-full bg-blue-50 border border-blue-200 px-2 py-1 text-blue-700">Total: {{ historyStats.totalScans }}</span>
            <span class="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-1 text-emerald-700">Sukses: {{ historyStats.totalSuccess }}</span>
            <span class="text-slate-500">{{ historyRefreshLabel }}</span>
          </div>
        </div>

        <div class="mt-4 h-[52vh] overflow-y-auto pr-1 space-y-2">
          <div
            v-for="item in scanHistory"
            :key="item.id"
            class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-slate-900">{{ item.student?.full_name || 'Kartu Tidak Dikenal' }}</p>
                <p class="text-xs text-slate-500">NIS: {{ item.student?.nis || '-' }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-slate-500">{{ formatClock(item.scanned_at) }}</p>
                <p class="text-xs font-semibold" :class="getResultClass(item.result_status)">
                  {{ item.result_status || '-' }} • {{ item.scan_type || 'AUTO' }}
                </p>
              </div>
            </div>
            <p class="text-xs text-slate-600 mt-1">{{ item.result_message || '-' }}</p>
          </div>

          <div v-if="historyLoading" class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
            Memuat histori scan...
          </div>
          <div v-if="!historyLoading && scanHistory.length === 0" class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
            Belum ada histori scan hari ini.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, reactive, ref, nextTick } from 'vue'
import attendanceRfidService from '@/services/api/studentAttendanceRfid.service'
import { useRfidKiosk } from '@/composables/useRfidKiosk'

const kioskToken = import.meta.env.VITE_RFID_GATE_KIOSK_TOKEN || ''

const rfidInput = ref(null)
const rfidCode = ref('')
const isSubmitting = ref(false)
const statusType = ref('idle')
const statusMessage = ref('Tempel kartu RFID pada reader')
const result = reactive({
  student_name: '',
  class_name: '',
  scan_mode: '',
  entry_status: '',
  exit_status: ''
})

const now = ref(new Date())
let clockTimer = null
let autoSubmitTimer = null
let historyTimer = null

const scanHistory = ref([])
const historyLoading = ref(false)
const historyUpdatedAt = ref(null)
const historyStats = reactive({
  totalScans: 0,
  totalSuccess: 0
})

const { beep, scheduleReset } = useRfidKiosk()

const liveTime = computed(() => now.value.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
const liveDate = computed(() => now.value.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }))
const historyRefreshLabel = computed(() => {
  if (!historyUpdatedAt.value) return 'Belum update'
  return `Update ${historyUpdatedAt.value.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
})

const statusTitle = computed(() => {
  if (statusType.value === 'success-in') return 'BERHASIL MASUK'
  if (statusType.value === 'success-out') return 'BERHASIL PULANG'
  if (statusType.value === 'error') return 'SCAN GAGAL'
  return 'MENUNGGU SCAN'
})

const statusClass = computed(() => {
  if (statusType.value === 'success-in') return 'text-emerald-600'
  if (statusType.value === 'success-out') return 'text-cyan-600'
  if (statusType.value === 'error') return 'text-rose-600'
  return 'text-slate-800'
})

const focusInput = () => {
  nextTick(() => {
    rfidInput.value?.focus()
    rfidInput.value?.select()
  })
}

const resetScreen = () => {
  rfidCode.value = ''
  statusType.value = 'idle'
  statusMessage.value = 'Tempel kartu RFID pada reader'
  result.student_name = ''
  result.class_name = ''
  result.scan_mode = ''
  result.entry_status = ''
  result.exit_status = ''
  focusInput()
}

const submitScan = async () => {
  if (isSubmitting.value || !rfidCode.value) return

  isSubmitting.value = true
  try {
    const response = await attendanceRfidService.scanGate({
      rfid_code: rfidCode.value.trim(),
      kiosk_token: kioskToken
    })

    if (response.success) {
      result.student_name = response.data?.student?.full_name || '-'
      result.class_name = response.data?.student?.class_name || '-'
      result.scan_mode = response.data?.scan_mode || '-'
      result.entry_status = response.data?.attendance?.entry_status || ''
      result.exit_status = response.data?.attendance?.exit_status || ''

      statusType.value = response.data?.scan_mode === 'OUT' ? 'success-out' : 'success-in'
      statusMessage.value = response.message || 'Scan berhasil'
      beep('success')
    } else {
      statusType.value = 'error'
      statusMessage.value = response.message || 'Scan gagal'
      beep('error')
    }
  } catch (error) {
    statusType.value = 'error'
    statusMessage.value = error?.message || error?.response?.data?.message || 'Scan gagal'
    beep('error')
  } finally {
    isSubmitting.value = false
    if (autoSubmitTimer) {
      clearTimeout(autoSubmitTimer)
      autoSubmitTimer = null
    }
    loadTodayScanHistory()
    scheduleReset(resetScreen, 2600)
  }
}

const handleRfidInput = () => {
  if (isSubmitting.value) return
  if (autoSubmitTimer) clearTimeout(autoSubmitTimer)

  autoSubmitTimer = setTimeout(() => {
    if (!isSubmitting.value && rfidCode.value.trim()) {
      submitScan()
    }
  }, 140)
}

const enterFullscreen = async () => {
  if (document.fullscreenElement) return
  await document.documentElement.requestFullscreen?.()
}

const refreshPage = () => {
  window.location.reload()
}

const loadTodayScanHistory = async () => {
  historyLoading.value = true
  try {
    const response = await attendanceRfidService.getTodayScanLogsPublic({
      kiosk_token: kioskToken,
      limit: 10
    })
    scanHistory.value = (response?.data?.logs || []).slice(0, 10)
    historyStats.totalScans = Number(response?.data?.total_scans || 0)
    historyStats.totalSuccess = Number(response?.data?.total_success || 0)
    historyUpdatedAt.value = new Date()
  } catch (error) {
    // Keep kiosk stable when history endpoint is unavailable.
  } finally {
    historyLoading.value = false
  }
}

const formatClock = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const getResultClass = (status) => {
  if (status === 'SUCCESS') return 'text-emerald-600'
  if (status === 'UNKNOWN_CARD') return 'text-amber-600'
  return 'text-rose-600'
}

onMounted(() => {
  focusInput()
  clockTimer = setInterval(() => {
    now.value = new Date()
  }, 1000)
  loadTodayScanHistory()
  historyTimer = setInterval(() => {
    loadTodayScanHistory()
  }, 12000)

  window.addEventListener('click', focusInput)
})

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
  if (autoSubmitTimer) clearTimeout(autoSubmitTimer)
  if (historyTimer) clearInterval(historyTimer)
  window.removeEventListener('click', focusInput)
})
</script>

