<template>
  <div class="space-y-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
            <router-link to="/student-violations/statistics" class="text-indigo-600 hover:text-indigo-800 transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            </router-link>
            <h1 class="text-2xl font-bold text-gray-800">Pelanggaran Berdasarkan Jenis</h1>
        </div>
        <p class="text-sm text-gray-500 mt-1 ml-7">Statistik perbandingan jumlah kasus di setiap jenis pelanggaran.</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div class="md:col-span-1">
          <label class="block text-xs font-medium text-gray-500 mb-1">Dari Tanggal</label>
          <input type="date" v-model="filters.date_from" @change="fetchData" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"/>
        </div>
        <div class="md:col-span-1">
          <label class="block text-xs font-medium text-gray-500 mb-1">Sampai Tanggal</label>
          <input type="date" v-model="filters.date_to" @change="fetchData" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"/>
        </div>
        
        <div class="md:col-span-1">
          <label class="block text-xs font-medium text-gray-500 mb-1">Kelas</label>
          <select v-model="filters.class_id" @change="fetchData" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500">
            <option value="">Semua Kelas</option>
            <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div class="md:col-span-1">
          <label class="block text-xs font-medium text-gray-500 mb-1">Siswa</label>
          <BaseSearchSelect
            v-model="filters.student_id"
            initial-label="Semua Siswa"
            placeholder="Cari Siswa..."
            :fetch-options="fetchStudentOptions"
            @update:modelValue="fetchData"
            class="text-sm"
          />
        </div>
      </div>
    </div>

    <!-- Chart Section -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col" style="min-height: 500px;">
        <div v-if="loading" class="flex-1 flex justify-center items-center">
            <svg class="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        </div>
        <div v-else-if="chartData.labels.length === 0" class="flex-1 flex flex-col justify-center items-center text-gray-400">
            <svg class="h-12 w-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            <p>Tidak ada data pelanggaran di rentang waktu ini</p>
        </div>
        <div v-else class="flex-1 relative w-full" :style="{ minHeight: Math.max(300, chartData.labels.length * 40) + 'px' }">
            <Bar :data="chartData" :options="chartOptions" />
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import BaseSearchSelect from '@/components/forms/BaseSearchSelect.vue'
import { studentViolationService } from '@/services/api/violation.service'
import studentService from '@/services/api/student.service'
import { classService, academicYearService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const { error: showError } = useToast()
const loading = ref(false)
const rawData = ref([])
const classes = ref([])

const formatYMD = (d) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return (new Date(d - tzOffset)).toISOString().slice(0, 10);
}

const getFirstDayOfMonth = () => {
    const d = new Date()
    d.setDate(1)
    return formatYMD(d)
}

const filters = reactive({
  date_from: getFirstDayOfMonth(),
  date_to: formatYMD(new Date()),
  student_id: '',
  class_id: '',
  academic_year_id: ''
})

const loadDependencies = async () => {
    try {
        const [classRes, yearRes] = await Promise.all([
            classService.getAll({ limit: 100 }),
            academicYearService.getAll({ limit: 100 })
        ])
        classes.value = classRes.data.classes || []
        
        const years = yearRes.data.academicYears || []
        const active = years.find(y => y.is_active)
        if (active) filters.academic_year_id = active.id
    } catch (e) {
        showError('Gagal memuat data filter')
    }
}

const fetchStudentOptions = async (query) => {
  try {
    const res = await studentService.getAll({ search: query, limit: 20, page: 1 })
    if (res.success && res.data.students) {
      return res.data.students.map(s => ({ value: s.id, label: s.full_name, description: `NIS: ${s.nis}` }))
    }
    return []
  } catch (e) { return [] }
}

const fetchData = async () => {
  loading.value = true
  try {
    const r = await studentViolationService.getTypeStatistics({ 
        date_from: filters.date_from,
        date_to: filters.date_to,
        student_id: filters.student_id,
        class_id: filters.class_id,
        academic_year_id: filters.academic_year_id
    })
    if (r.success) { 
        rawData.value = r.data || []
    }
  } catch (e) { 
      showError('Gagal mengambil data statistik') 
  } finally { 
      loading.value = false 
  }
}

const chartData = computed(() => {
    const labels = rawData.value.map(t => t.type?.name || 'Lainnya')
    const data = rawData.value.map(t => parseInt(t.total) || 0)

    return {
        labels,
        datasets: [
            {
                label: 'Jumlah Pelanggaran',
                backgroundColor: 'rgba(168, 85, 247, 0.8)', // Purple-500
                hoverBackgroundColor: 'rgba(147, 51, 234, 1)', // Purple-600
                borderRadius: 4,
                data: data,
            }
        ]
    }
})

const chartOptions = {
    indexAxis: 'y', // makes it a horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            titleFont: { size: 13, family: "'Inter', sans-serif" },
            bodyFont: { size: 14, family: "'Inter', sans-serif", weight: 'bold' },
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
                label: function(context) {
                    return `${context.parsed.x} Kasus`;
                }
            }
        }
    },
    scales: {
        x: {
            beginAtZero: true,
            grid: {
                color: 'rgba(243, 244, 246, 1)', // gray-100
                drawBorder: false
            },
            ticks: {
                stepSize: 1,
                font: { family: "'Inter', sans-serif", size: 11 },
                color: '#6B7280'
            }
        },
        y: {
            grid: {
                display: false,
                drawBorder: false
            },
            ticks: {
                font: { family: "'Inter', sans-serif", size: 12, weight: '500' },
                color: '#374151' // gray-700
            }
        }
    }
}

onMounted(async () => {
    await loadDependencies()
    fetchData()
})
</script>
