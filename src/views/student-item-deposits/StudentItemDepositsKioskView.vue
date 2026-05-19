<template>
  <div class="min-h-screen bg-slate-100 p-4 md:p-6">
    <div class="mx-auto max-w-7xl space-y-4">
      <div class="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
        <h1 class="text-2xl md:text-3xl font-bold text-slate-800">Kiosk Penitipan Barang Siswa</h1>
        <p class="mt-1 text-slate-600">Tempelkan kartu RFID siswa. Sistem akan memproses pinjam atau kembali secara otomatis.</p>

        <div class="mt-4 flex flex-col md:flex-row gap-3">
          <input
            ref="rfidInput"
            v-model="rfid"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Scan RFID di sini"
            @input="onInputScan"
            @keyup.enter="submitScan"
            autofocus
          />
          <button class="rounded-xl bg-slate-700 px-5 py-3 text-white font-medium" @click="submitScan">
            Proses Scan
          </button>
        </div>

        <div v-if="message" class="mt-4 rounded-xl px-4 py-3 text-sm" :class="ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">
          {{ message }}
        </div>
      </div>

      <div class="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
        <h2 class="text-base font-semibold text-slate-800">Hasil Scan Siswa</h2>
        <div v-if="student" class="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
          <div class="flex flex-wrap items-center gap-2 text-sm">
            <span class="inline-flex items-center rounded-full bg-white border border-slate-200 px-2.5 py-1 text-slate-700">
              <span class="text-slate-500 mr-1">Nama</span>
              <span class="font-semibold text-slate-800">{{ student.full_name }}</span>
            </span>
            <span class="inline-flex items-center rounded-full bg-white border border-slate-200 px-2.5 py-1 text-slate-700">
              <span class="text-slate-500 mr-1">Kelas</span>
              <span class="font-semibold text-slate-800">{{ student.class_name }}</span>
            </span>
            <span class="inline-flex items-center rounded-full px-2.5 py-1 border"
              :class="items.length === 0 ? 'bg-slate-100 border-slate-200 text-slate-700' : items.length > 1 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-blue-50 border-blue-200 text-blue-700'">
              <span class="text-slate-500 mr-1">Barang</span>
              <span class="font-semibold">
                <template v-if="items.length === 0">Tidak ada barang aktif</template>
                <template v-else-if="items.length > 1">Lebih dari 1 barang aktif</template>
                <template v-else>{{ items[0].item_name }} ({{ items[0].category_name }})</template>
              </span>
            </span>
          </div>
        </div>
        <div v-else class="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
          Belum ada scan.
        </div>
      </div>

      <div class="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-slate-800">Histori Peminjaman Hari Ini</h2>
          <button class="text-sm rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50" @click="loadTodayHistory">Muat Ulang</button>
        </div>
        <div class="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
          <div class="rounded-xl bg-blue-50 border border-blue-200 px-3 py-2">
            <div class="text-xs text-blue-700">Total Peminjaman</div>
            <div class="text-lg font-bold text-blue-800">{{ todayHistory.total || 0 }}</div>
          </div>
          <div class="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
            <div class="text-xs text-emerald-700">Sudah Kembali</div>
            <div class="text-lg font-bold text-emerald-800">{{ todayHistory.sudah_kembali || 0 }}</div>
          </div>
          <div class="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
            <div class="text-xs text-amber-700">Belum Kembali</div>
            <div class="text-lg font-bold text-amber-800">{{ todayHistory.belum_kembali || 0 }}</div>
          </div>
        </div>
        <div class="mt-3 overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-slate-600 border-b border-slate-200">
                <th class="py-2 pr-3">Nama Siswa</th>
                <th class="py-2 pr-3">NIS</th>
                <th class="py-2 pr-3">Barang</th>
                <th class="py-2 pr-3">Jam Pinjam</th>
                <th class="py-2 pr-3">Jam Kembali</th>
                <th class="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!todayHistory.items || todayHistory.items.length === 0">
                <td colspan="6" class="py-4 text-center text-slate-500">Belum ada transaksi hari ini.</td>
              </tr>
              <tr v-for="row in todayHistory.items || []" :key="row.id" class="border-b border-slate-100">
                <td class="py-2 pr-3">{{ row.student_name }}</td>
                <td class="py-2 pr-3">{{ row.nis }}</td>
                <td class="py-2 pr-3">{{ row.item_name }}</td>
                <td class="py-2 pr-3">{{ formatTime(row.jam_pinjam) }}</td>
                <td class="py-2 pr-3">{{ row.jam_kembali ? formatTime(row.jam_kembali) : '-' }}</td>
                <td class="py-2 pr-3">
                  <span class="text-xs px-2.5 py-1 rounded-full" :class="row.status === 'RETURNED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
                    {{ row.status === 'RETURNED' ? 'Sudah Kembali' : 'Belum Kembali' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import publicApi from '@/services/publicApi'
import { useRfidKiosk } from '@/composables/useRfidKiosk'

const rfid = ref('')
const student = ref(null)
const items = ref([])
const message = ref('')
const ok = ref(true)
const rfidInput = ref(null)
const todayHistory = ref({ total: 0, sudah_kembali: 0, belum_kembali: 0, items: [] })
const { scheduleReset, beep } = useRfidKiosk()
const kioskToken = import.meta.env.VITE_KIOSK_INTERNAL_TOKEN || localStorage.getItem('kiosk_internal_token') || ''
let scanDebounce = null
let globalBuffer = ''
let processing = false
const RESET_DELAY_MS = 1000

const kioskHeaders = () => {
  const headers = {}
  if (kioskToken) headers['x-kiosk-token'] = kioskToken
  return { headers }
}

const formatTime = (val) => {
  if (!val) return '-'
  const dt = new Date(val)
  return dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const resetScreen = async () => {
  rfid.value = ''
  student.value = null
  items.value = []
  message.value = ''
  await nextTick()
  rfidInput.value?.focus()
}

const loadTodayHistory = async () => {
  try {
    const res = await publicApi.get('/kiosk/student-item-deposits/today-history', kioskHeaders())
    todayHistory.value = res?.data || { total: 0, sudah_kembali: 0, belum_kembali: 0, items: [] }
  } catch (e) {
    todayHistory.value = { total: 0, sudah_kembali: 0, belum_kembali: 0, items: [] }
  }
}

const submitScan = async () => {
  if ((rfid.value || '').trim().length < 3 || processing) return
  processing = true
  try {
    const res = await publicApi.post('/kiosk/student-item-deposits/rfid-scan', { rfid_code: rfid.value.trim(), kiosk_token: kioskToken || undefined }, kioskHeaders())
    student.value = res?.data?.student || null
    items.value = res?.data?.items || []
    if (!items.value.length) {
      message.value = 'Tidak ada barang aktif untuk siswa ini.'
      ok.value = true
      beep('success')
      scheduleReset(resetScreen, RESET_DELAY_MS)
      return
    }

    if (items.value.length > 1) {
      message.value = 'Ditemukan lebih dari 1 barang aktif. Silakan proses manual melalui petugas.'
      ok.value = false
      beep('error')
      scheduleReset(resetScreen, RESET_DELAY_MS)
      return
    }

    const item = items.value[0]
    if (item.current_status === 'DEPOSITED') {
      await loan(item.id)
      return
    }
    if (item.current_status === 'BORROWED') {
      await ret(item.id)
      return
    }

    message.value = `Status barang tidak dapat diproses otomatis: ${item.current_status}`
    ok.value = false
    beep('error')
    scheduleReset(resetScreen, RESET_DELAY_MS)
  } catch (e) {
    message.value = e?.message || 'RFID tidak ditemukan'
    ok.value = false
    beep('error')
    scheduleReset(resetScreen, RESET_DELAY_MS)
  } finally {
    processing = false
  }
}

const onInputScan = () => {
  if (scanDebounce) clearTimeout(scanDebounce)
  scanDebounce = setTimeout(() => {
    if ((rfid.value || '').trim().length >= 6) submitScan()
  }, 120)
}

const onGlobalKeydown = (event) => {
  if (event.key === 'Enter') {
    if (!rfid.value && globalBuffer) rfid.value = globalBuffer
    if ((rfid.value || '').trim().length >= 3) submitScan()
    globalBuffer = ''
    return
  }
  if (event.key && event.key.length === 1) {
    globalBuffer += event.key
    if (globalBuffer.length > 64) globalBuffer = globalBuffer.slice(-64)
  }
}

const loan = async (id) => {
  try {
    const res = await publicApi.post(`/kiosk/student-item-deposits/${id}/loan`, { rfid_code: rfid.value.trim(), kiosk_token: kioskToken || undefined }, kioskHeaders())
    message.value = res?.message || 'Barang berhasil dipinjam. Harap dikembalikan sesuai batas waktu.'
    ok.value = true
    beep('success')
  } catch (e) {
    message.value = e?.message || 'Gagal meminjam barang'
    ok.value = false
    beep('error')
  }
  await loadTodayHistory()
  scheduleReset(resetScreen, RESET_DELAY_MS)
}

const ret = async (id) => {
  try {
    const res = await publicApi.post(`/kiosk/student-item-deposits/${id}/return-daily`, { rfid_code: rfid.value.trim(), kiosk_token: kioskToken || undefined }, kioskHeaders())
    message.value = res?.message || 'Barang berhasil dikembalikan.'
    ok.value = true
    beep('success')
  } catch (e) {
    message.value = e?.message || 'Gagal mengembalikan barang'
    ok.value = false
    beep('error')
  }
  await loadTodayHistory()
  scheduleReset(resetScreen, RESET_DELAY_MS)
}

onMounted(async () => {
  window.addEventListener('keydown', onGlobalKeydown)
  rfidInput.value?.focus()
  await loadTodayHistory()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
  if (scanDebounce) clearTimeout(scanDebounce)
})
</script>
