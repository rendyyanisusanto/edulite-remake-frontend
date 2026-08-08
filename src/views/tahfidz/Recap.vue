<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Rekap Tahfidz</h1>
        <p class="text-sm text-gray-500 mt-1">Laporan rekapitulasi kehadiran kegiatan Tahfidz siswa.</p>
      </div>
    </div>

    <!-- Filters Card -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
          <input
            v-model="filters.start_date"
            type="date"
            class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai</label>
          <input
            v-model="filters.end_date"
            type="date"
            class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
          <select
            v-model="filters.class_id"
            class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="">Semua Kelas</option>
            <option v-for="klass in classes" :key="klass.id" :value="String(klass.id)">
              {{ klass.name }}
            </option>
          </select>
        </div>
        <div class="flex items-end">
          <BaseButton
            @click="loadRecap"
            :loading="loading"
            class="w-full"
          >
            <svg class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Tampilkan
          </BaseButton>
        </div>
      </div>
    </div>

    <div v-if="hasLoaded">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 border-l-4 border-l-green-500">
          <div class="text-sm font-medium text-gray-500">Hadir</div>
          <div class="mt-1 text-2xl font-semibold text-gray-900">{{ summary.present }}</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 border-l-4 border-l-blue-500">
          <div class="text-sm font-medium text-gray-500">Izin</div>
          <div class="mt-1 text-2xl font-semibold text-gray-900">{{ summary.permission }}</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 border-l-4 border-l-yellow-500">
          <div class="text-sm font-medium text-gray-500">Sakit</div>
          <div class="mt-1 text-2xl font-semibold text-gray-900">{{ summary.sick }}</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 border-l-4 border-l-red-500">
          <div class="text-sm font-medium text-gray-500">Alpa</div>
          <div class="mt-1 text-2xl font-semibold text-gray-900">{{ summary.absent }}</div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div class="animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div class="h-8 bg-gray-200 rounded mx-auto mb-2"></div>
          <div class="h-8 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="records.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p class="mt-4 text-gray-600 font-medium">Tidak ada data absensi untuk filter yang dipilih</p>
      </div>

      <!-- Table -->
      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS / Nama Siswa</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="record in records" :key="record.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(record.attendance_date) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ record.class_info?.name || '-' }}</td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ record.student?.full_name || '-' }}</div>
                  <div class="text-sm text-gray-500">{{ record.student?.nis || '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2.5 py-1 text-xs font-medium rounded-full" :class="getStatusBadgeClass(record.status)">
                    {{ getStatusLabel(record.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ record.notes || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import tahfidzAttendanceService from '@/services/tahfidzAttendance.service'
import { classService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { error } = useToast()

const getToday = () => new Date().toISOString().split('T')[0]

const filters = reactive({
  start_date: getToday(),
  end_date: getToday(),
  class_id: ''
})

const classes = ref([])
const records = ref([])
const summary = reactive({ present: 0, permission: 0, sick: 0, absent: 0 })
const loading = ref(false)
const hasLoaded = ref(false)

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'present': return 'bg-green-100 text-green-800'
    case 'sick': return 'bg-yellow-100 text-yellow-800'
    case 'permission': return 'bg-blue-100 text-blue-800'
    case 'absent': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'present': return 'Hadir'
    case 'sick': return 'Sakit'
    case 'permission': return 'Izin'
    case 'absent': return 'Alpa'
    default: return status
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

const loadClasses = async () => {
  try {
    const response = await tahfidzAttendanceService.getClasses()
    if (response.success) {
      classes.value = response.data || []
    }
  } catch (err) {
    try {
        const response = await classService.getAll({ limit: 300 })
        if (response.success) {
            classes.value = response.data?.classes || []
        }
    } catch(e) {}
  }
}

const loadRecap = async () => {
  loading.value = true
  hasLoaded.value = true
  try {
    const response = await tahfidzAttendanceService.getRecap({
      start_date: filters.start_date,
      end_date: filters.end_date,
      class_id: filters.class_id
    })

    if (response.success) {
      records.value = response.data || []
      const respSummary = response.summary || {}
      summary.present = respSummary.present || 0
      summary.permission = respSummary.permission || 0
      summary.sick = respSummary.sick || 0
      summary.absent = respSummary.absent || 0
    }
  } catch (err) {
    error('Gagal memuat rekap tahfidz')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadClasses()
})
</script>
