<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Laporan Presensi Siswa</h1>
        <p class="text-sm text-gray-500 mt-1">Rekap presensi harian dan ranking keterlambatan langsung dari database.</p>
      </div>
      <BaseButton variant="outline" @click="loadData" :loading="loading">Refresh Data</BaseButton>
    </div>

    <div class="grid md:grid-cols-4 gap-3">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Total Data</p>
        <p class="text-3xl font-black text-blue-600 mt-1">{{ summary.total }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Present</p>
        <p class="text-3xl font-black text-emerald-600 mt-1">{{ summary.present }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Late</p>
        <p class="text-3xl font-black text-amber-600 mt-1">{{ summary.late }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Alpha + Incomplete</p>
        <p class="text-3xl font-black text-rose-600 mt-1">{{ summary.alpha + summary.incomplete }}</p>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2">
      <input v-model="filters.date" type="date" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm" />
      <select v-model="filters.class_id" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm min-w-40">
        <option value="">Semua Kelas</option>
        <option v-for="klass in classes" :key="klass.id" :value="String(klass.id)">{{ klass.name }}</option>
      </select>
      <input
        v-model="filters.keyword"
        class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm min-w-56"
        placeholder="Cari siswa / NIS"
      />
      <BaseButton variant="outline" @click="applyFilter">Generate Rekap</BaseButton>
      <BaseButton variant="outline" @click="resetFilter">Reset</BaseButton>
      <p class="text-xs text-gray-500 ml-auto">Update: {{ lastUpdated ? formatDateTime(lastUpdated, true) : '-' }}</p>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h2 class="font-semibold text-gray-800 mb-3">Ranking Siswa Paling Sering Telat</h2>
      <div v-if="lateRanking.length" class="space-y-2">
        <div
          v-for="item in lateRanking"
          :key="item.student_id"
          class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          <div>
            <p class="font-semibold text-gray-900">{{ item.full_name || '-' }}</p>
            <p class="text-xs text-gray-500">NIS: {{ item.nis || '-' }} � {{ item.class_name || '-' }}</p>
          </div>
          <span class="font-semibold text-amber-700">{{ formatLateDuration(item.late_minutes) }}</span>
        </div>
      </div>
      <p v-else class="text-sm text-gray-500">Belum ada data keterlambatan untuk filter ini.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import attendanceService from '@/services/api/studentAttendanceRfid.service'
import { classService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { error: showError } = useToast()

const today = new Date().toISOString().slice(0, 10)
const classes = ref([])
const loading = ref(false)
const lastUpdated = ref(null)

const filters = reactive({ date: today, class_id: '', keyword: '' })
const summary = reactive({ total: 0, present: 0, late: 0, alpha: 0, incomplete: 0 })
const lateRanking = ref([])

const formatDateTime = (value, withDate = false) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID', withDate ? undefined : { hour: '2-digit', minute: '2-digit' })
}

const formatLateDuration = (minutes) => {
  const value = Number(minutes || 0)
  if (value < 1) return '-'
  const hours = Math.floor(value / 60)
  const remainMinutes = value % 60
  if (!hours) return `${remainMinutes} menit`
  if (!remainMinutes) return `${hours} jam`
  return `${hours} jam ${remainMinutes} menit`
}

const loadClasses = async () => {
  try {
    const response = await classService.getAll({ page: 1, limit: 300 })
    classes.value = response?.data?.classes || []
  } catch (err) {
    showError('Gagal memuat data kelas')
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      date: filters.date || today,
      class_id: filters.class_id || undefined,
      keyword: filters.keyword || undefined
    }

    const response = await attendanceService.getReportSummary(params)
    const payload = response?.data || {}

    summary.total = payload.summary?.total || 0
    summary.present = payload.summary?.present || 0
    summary.late = payload.summary?.late || 0
    summary.alpha = payload.summary?.alpha || 0
    summary.incomplete = payload.summary?.incomplete || 0
    lateRanking.value = payload.late_ranking || []
    lastUpdated.value = new Date().toISOString()
  } catch (err) {
    showError('Gagal memuat laporan presensi siswa')
  } finally {
    loading.value = false
  }
}

const applyFilter = async () => {
  await loadData()
}

const resetFilter = async () => {
  filters.date = today
  filters.class_id = ''
  filters.keyword = ''
  await loadData()
}

onMounted(async () => {
  await Promise.all([loadClasses(), loadData()])
})
</script>
