<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0984e3] via-[#1d94ea] to-[#5dade2] text-white p-8">
    <div class="max-w-6xl mx-auto h-full flex flex-col">
      <div class="flex items-center justify-between mb-8">
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-blue-100/95">Kiosk Toilet</p>
          <h1 class="text-4xl md:text-6xl font-black mt-2 text-white">SCAN RFID IZIN TOILET</h1>
        </div>
        <div class="text-right">
          <p class="text-5xl font-black tabular-nums text-white">{{ liveTime }}</p>
          <p class="text-xl text-blue-100 mt-1">{{ liveDate }}</p>
        </div>
      </div>

      <div class="grid md:grid-cols-[3fr_1.15fr] gap-6 flex-1">
        <div class="rounded-3xl bg-white border border-slate-200 shadow-xl p-6 flex flex-col min-h-[60vh] text-slate-800">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-[0.24em] text-slate-500">Panel Histori</p>
              <h2 class="text-2xl md:text-3xl font-black mt-1 text-slate-900">SISWA SEDANG KE TOILET</h2>
            </div>
          </div>

          <p class="text-xs text-slate-500 mt-2">{{ lastOutRefreshLabel }}</p>

          <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
              <p class="text-[11px] uppercase tracking-[0.12em] text-amber-700">Sedang Keluar</p>
              <p class="text-2xl font-black text-amber-700 mt-1">{{ stats.currentlyOutCount }}</p>
            </div>
            <div class="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 shadow-sm">
              <p class="text-[11px] uppercase tracking-[0.12em] text-sky-700">Siswa ke Toilet Hari Ini</p>
              <p class="text-2xl font-black text-sky-700 mt-1">{{ stats.totalStudentsToday }}</p>
            </div>
            <div class="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 shadow-sm">
              <p class="text-[11px] uppercase tracking-[0.12em] text-cyan-700">Total Trip Hari Ini</p>
              <p class="text-2xl font-black text-cyan-700 mt-1">{{ stats.totalTripsToday }}</p>
            </div>
          </div>

          <div class="mt-4 flex-1 overflow-y-auto pr-1 space-y-2">
            <div
              v-for="item in currentlyOut"
              :key="item.id"
              class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 shadow-sm"
            >
              <div class="flex items-center justify-between gap-2">
                <div>
                  <p class="text-base font-bold text-slate-900 leading-tight">{{ item.student?.full_name || '-' }}</p>
                  <p class="text-xs text-slate-500 mt-0.5">{{ item.class_info?.name || '-' }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-slate-500">Keluar</p>
                  <p class="text-sm font-semibold text-slate-900">{{ formatTime(item.exit_at) }}</p>
                </div>
                <div class="text-right min-w-24">
                  <p class="text-xs text-slate-500">Durasi</p>
                  <p class="text-sm font-semibold text-amber-700">{{ getOngoingDurationLabel(item.exit_at) }}</p>
                </div>
              </div>
            </div>

            <div v-if="loadingOut" class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Memuat histori siswa yang sedang ke toilet...
            </div>
            <div v-if="!loadingOut && currentlyOut.length === 0" class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              Tidak ada siswa yang sedang ke toilet.
            </div>
          </div>
        </div>

        <div class="rounded-3xl bg-white border border-slate-200 shadow-xl p-6 flex flex-col gap-4 text-slate-800">
          <div class="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center text-lg font-bold text-blue-800">
            {{ isSubmitting ? 'Memproses...' : 'Siap Scan' }}
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <p class="text-[11px] uppercase tracking-[0.16em] text-slate-500">Status Scan</p>
            <p class="text-lg font-black mt-1" :class="statusClass">{{ statusTitle }}</p>
            <p class="text-xs text-slate-600 mt-1">{{ statusMessage }}</p>
            <p v-if="result.student_name" class="text-sm font-semibold text-slate-900 mt-2">
              {{ result.student_name }} • {{ result.class_name || '-' }}
            </p>
          </div>

          <form @submit.prevent="submitScan" class="space-y-3">
            <label class="text-sm text-slate-700">Input RFID</label>
            <input
              ref="rfidInput"
              v-model="rfidCode"
              type="text"
              autocomplete="off"
              spellcheck="false"
              @keydown.enter.prevent="submitScan"
              @input="handleRfidInput"
              class="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-2xl font-bold tracking-widest text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-200"
              placeholder="Tap Kartu..."
              :disabled="isSubmitting"
            />
            <p class="text-xs text-slate-500">Scan otomatis diproses tanpa tombol.</p>
          </form>

          <div class="flex gap-2">
            <button class="flex-1 rounded-xl border border-slate-300 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="enterFullscreen">Fullscreen</button>
            <button class="flex-1 rounded-xl border border-slate-300 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="refreshPage">Refresh</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, reactive, ref, nextTick } from 'vue'
import toiletRfidService from '@/services/api/studentToiletRfid.service'
import { useRfidKiosk } from '@/composables/useRfidKiosk'

const kioskToken = import.meta.env.VITE_RFID_TOILET_KIOSK_TOKEN || ''

const rfidInput = ref(null)
const rfidCode = ref('')
const isSubmitting = ref(false)
const statusType = ref('idle')
const statusMessage = ref('Tempel kartu RFID pada reader toilet')
const result = reactive({
  student_name: '',
  class_name: '',
  scan_mode: '',
  duration_minutes: 0,
  total_trips_today: 0
})

const now = ref(new Date())
let clockTimer = null
let autoSubmitTimer = null
let outRefreshTimer = null

const currentlyOut = ref([])
const loadingOut = ref(false)
const lastOutRefreshAt = ref(null)
const stats = reactive({
  currentlyOutCount: 0,
  totalStudentsToday: 0,
  totalTripsToday: 0
})

const { beep, scheduleReset } = useRfidKiosk()

const liveTime = computed(() => now.value.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
const liveDate = computed(() => now.value.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }))
const lastOutRefreshLabel = computed(() => {
  if (!lastOutRefreshAt.value) return 'Belum update'
  return `Update ${lastOutRefreshAt.value.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
})

const statusTitle = computed(() => {
  if (statusType.value === 'success-out') return 'KELUAR TOILET'
  if (statusType.value === 'success-return') return 'KEMBALI TOILET'
  if (statusType.value === 'error') return 'SCAN GAGAL'
  return 'MENUNGGU SCAN'
})

const statusClass = computed(() => {
  if (statusType.value === 'success-out') return 'text-amber-600'
  if (statusType.value === 'success-return') return 'text-emerald-600'
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
  statusMessage.value = 'Tempel kartu RFID pada reader toilet'
  result.student_name = ''
  result.class_name = ''
  result.scan_mode = ''
  result.duration_minutes = 0
  result.total_trips_today = 0
  focusInput()
}

const submitScan = async () => {
  if (isSubmitting.value || !rfidCode.value) return

  isSubmitting.value = true
  try {
    const response = await toiletRfidService.scanToilet({
      rfid_code: rfidCode.value.trim(),
      kiosk_token: kioskToken
    })

    if (response.success) {
      result.student_name = response.data?.student?.full_name || '-'
      result.class_name = response.data?.student?.class_name || '-'
      result.scan_mode = response.data?.scan_mode || '-'
      result.duration_minutes = response.data?.toilet_permission?.duration_minutes || 0
      result.total_trips_today = response.data?.summary_today?.total_trips || 0

      statusType.value = response.data?.scan_mode === 'RETURN' ? 'success-return' : 'success-out'
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
    loadCurrentlyOut()
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

const getTodayDate = () => new Date().toISOString().slice(0, 10)

const loadCurrentlyOut = async () => {
  loadingOut.value = true
  try {
    const response = await toiletRfidService.getCurrentlyOutPublic({
      date: getTodayDate(),
      kiosk_token: kioskToken
    })
    currentlyOut.value = response?.data?.currently_out || []
    stats.currentlyOutCount = Number(response?.data?.currently_out_count || 0)
    stats.totalStudentsToday = Number(response?.data?.total_students_today || 0)
    stats.totalTripsToday = Number(response?.data?.total_trips_today || 0)
    lastOutRefreshAt.value = new Date()
  } catch (error) {
    // Keep kiosk stable even when network is intermittent.
  } finally {
    loadingOut.value = false
  }
}

const formatTime = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const getOngoingDurationLabel = (exitAt) => {
  if (!exitAt) return '-'
  const diffMs = now.value.getTime() - new Date(exitAt).getTime()
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60000))

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (!hours) return `${minutes} menit`
  if (!minutes) return `${hours} jam`
  return `${hours} jam ${minutes} menit`
}

const enterFullscreen = async () => {
  if (document.fullscreenElement) return
  await document.documentElement.requestFullscreen?.()
}

const refreshPage = () => {
  window.location.reload()
}

onMounted(() => {
  focusInput()
  clockTimer = setInterval(() => {
    now.value = new Date()
  }, 1000)
  loadCurrentlyOut()
  outRefreshTimer = setInterval(() => {
    loadCurrentlyOut()
  }, 12000)

  window.addEventListener('click', focusInput)
})

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
  if (autoSubmitTimer) clearTimeout(autoSubmitTimer)
  if (outRefreshTimer) clearInterval(outRefreshTimer)
  window.removeEventListener('click', focusInput)
})
</script>

