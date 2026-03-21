<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Laporan Absensi</h1>
        <p class="text-sm text-gray-500 mt-1">Ringkasan dan statistik kehadiran karyawan.</p>
      </div>
      <BaseButton @click="exportExcel" :loading="exporting" variant="outline">
        <svg class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
        Export Excel
      </BaseButton>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Dari Tanggal</label>
          <input type="date" v-model="filters.date_from" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"/>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Sampai Tanggal</label>
          <input type="date" v-model="filters.date_to" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"/>
        </div>
        <div class="flex items-end">
          <BaseButton @click="fetchData" class="w-full">Tampilkan</BaseButton>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div v-if="!loading" class="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <div v-for="card in summaryCards" :key="card.label" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p class="text-xs text-gray-500 font-medium">{{ card.label }}</p>
        <p class="text-2xl font-bold mt-1" :class="card.color">{{ card.value }}</p>
      </div>
    </div>

    <!-- Per-user Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="font-semibold text-gray-800">Statistik Per Karyawan</h3>
      </div>
      <div v-if="loading" class="flex justify-center py-12">
        <svg class="animate-spin h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      </div>
      <div v-else-if="perUser.length === 0" class="flex flex-col items-center py-12 text-gray-400">
        <svg class="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        <p class="text-sm">Tidak ada data untuk periode ini</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">No</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-green-600 uppercase tracking-wider">Hadir</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-amber-600 uppercase tracking-wider">Terlambat</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-orange-600 uppercase tracking-wider">Tdk Lengkap</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-red-600 uppercase tracking-wider">Tidak Hadir</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="(row, i) in perUser" :key="row.user_id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-3 text-gray-400">{{ i + 1 }}</td>
              <td class="px-6 py-3 font-medium text-gray-900">{{ row.user_name }}</td>
              <td class="px-4 py-3 text-center text-gray-600">{{ row.total }}</td>
              <td class="px-4 py-3 text-center"><span class="font-semibold text-green-600">{{ row.present }}</span></td>
              <td class="px-4 py-3 text-center"><span class="font-semibold text-amber-600">{{ row.late }}</span></td>
              <td class="px-4 py-3 text-center"><span class="font-semibold text-orange-600">{{ row.incomplete }}</span></td>
              <td class="px-4 py-3 text-center"><span class="font-semibold text-red-600">{{ row.absent }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import reportService from '@/services/api/attendanceReport.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()
const loading = ref(false)
const exporting = ref(false)
const summary = ref({ total: 0, present: 0, late: 0, absent: 0, incomplete: 0, pending_requests: 0 })
const perUser = ref([])

// Default to current month
const now = new Date()
const filters = reactive({
  date_from: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
  date_to: new Date().toISOString().slice(0, 10)
})

const summaryCards = computed(() => [
  { label: 'Total Records', value: summary.value.total, color: 'text-blue-600' },
  { label: 'Hadir', value: summary.value.present, color: 'text-green-600' },
  { label: 'Terlambat', value: summary.value.late, color: 'text-amber-600' },
  { label: 'Tidak Lengkap', value: summary.value.incomplete, color: 'text-orange-600' },
  { label: 'Pengajuan Pending', value: summary.value.pending_requests, color: 'text-purple-600' },
])

const fetchData = async () => {
  loading.value = true
  try {
    const r = await reportService.getSummary(filters)
    if (r.success) { summary.value = r.data.summary; perUser.value = r.data.per_user }
  } catch (e) { showError('Gagal mengambil data laporan') } finally { loading.value = false }
}

const exportExcel = async () => {
  exporting.value = true
  try {
    const blob = await reportService.exportExcel(filters)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `laporan_absensi_${filters.date_from}_${filters.date_to}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    success('File berhasil diunduh')
  } catch (e) { showError('Gagal mengekspor laporan') } finally { exporting.value = false }
}

onMounted(fetchData)
</script>


