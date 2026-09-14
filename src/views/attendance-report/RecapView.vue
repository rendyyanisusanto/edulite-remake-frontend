<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Rekap Absensi Siswa</h1>
        <p class="text-sm text-gray-500 mt-1">Laporan rekap kehadiran siswa dalam bentuk matriks.</p>
      </div>
      <router-link to="/attendance/statistics">
        <BaseButton variant="outline">
          Kembali
        </BaseButton>
      </router-link>
    </div>
    
    <!-- Filter Section -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        
        <!-- Period Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Periode</label>
          <select v-model="filters.periodType" @change="handlePeriodChange" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
            <option value="daily">Harian</option>
            <option value="monthly">Bulanan</option>
            <option value="semester">Semester</option>
            <option value="range">Range Tanggal</option>
          </select>
        </div>

        <!-- Period Inputs -->
        <div v-if="filters.periodType === 'daily'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
          <input type="date" v-model="filters.singleDate" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>

        <div v-else-if="filters.periodType === 'monthly'" class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
            <select v-model="filters.month" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
              <option v-for="(m, i) in months" :key="i" :value="i">{{ m }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
            <input type="number" v-model="filters.year" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>

        <div v-else-if="filters.periodType === 'semester'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
          <select v-model="filters.academicYearId" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
            <option value="">Pilih Tahun Ajaran</option>
            <option v-for="ay in academicYears" :key="ay.id" :value="ay.id">{{ ay.name }}</option>
          </select>
        </div>

        <div v-else-if="filters.periodType === 'range'" class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Dari</label>
            <input type="date" v-model="filters.startDate" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sampai</label>
            <input type="date" v-model="filters.endDate" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>

        <!-- Class Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
          <select v-model="filters.classId" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
            <option value="">Semua Kelas</option>
            <option v-for="klass in classes" :key="klass.id" :value="klass.id">{{ klass.name }}</option>
          </select>
        </div>

        <!-- Checkbox Tahfidz & Button -->
        <div class="flex flex-col gap-2 md:col-span-4 lg:col-span-1 md:items-start lg:items-end w-full lg:ml-auto justify-end">
          <label class="flex items-center gap-2 text-sm text-gray-700 mb-1 cursor-pointer">
            <input type="checkbox" v-model="filters.compareTahfidz" class="rounded border-gray-300 text-primary focus:ring-primary" />
            Bandingkan Tahfidz
          </label>
          <div class="flex gap-2 w-full lg:w-auto justify-end">
            <BaseButton @click="loadData" :loading="loading" class="w-full lg:w-auto">
              Tampilkan
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Table Matrix -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 class="font-semibold text-gray-800">Hasil Rekapitulasi</h3>
        <div class="flex gap-2">
          <BaseButton variant="outline" size="sm" @click="exportExcel" :disabled="!hasData || exportLoading">
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Export Excel
          </BaseButton>
          <BaseButton variant="outline" size="sm" @click="exportPdf" :disabled="!hasData || exportLoading">
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            Export PDF
          </BaseButton>
        </div>
      </div>

      <div class="overflow-x-auto max-h-[600px] relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" id="recap-table-container">
        <div v-if="loading" class="p-8 text-center text-gray-500">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          Memuat data...
        </div>
        
        <div v-else-if="!hasData" class="p-8 text-center text-gray-500">
          {{ initialLoad ? 'Silakan pilih filter dan klik Tampilkan.' : 'Tidak ada data untuk filter yang dipilih.' }}
        </div>

        <table v-else id="recap-table" class="min-w-full border-collapse">
          <thead class="bg-gray-50/95 backdrop-blur sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <tr>
              <th scope="col" class="border-b border-r border-gray-200 px-3 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-50/95 z-30 min-w-[45px] backdrop-blur">No</th>
              <th scope="col" class="border-b border-r border-gray-200 px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-[45px] bg-gray-50/95 z-30 min-w-[200px] backdrop-blur shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Nama Siswa</th>
              <th scope="col" class="border-b border-r border-gray-200 px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kelas</th>
              <th v-for="date in matrixDates" :key="date" scope="col" class="border-b border-r border-gray-200 px-1.5 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[36px]">
                {{ formatDayNumber(date) }}
              </th>
              <th scope="col" class="border-b border-r border-gray-200 px-3 py-2.5 text-center text-xs font-semibold text-green-700 uppercase tracking-wider bg-green-50/95">M</th>
              <th scope="col" class="border-b border-gray-200 px-3 py-2.5 text-center text-xs font-semibold text-red-700 uppercase tracking-wider bg-red-50/95">TM</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="(student, index) in matrixStudents" :key="student.id" class="hover:bg-blue-50/60 even:bg-gray-50/40 transition-colors group">
              <td class="border-r border-gray-200 px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-center sticky left-0 bg-white group-hover:bg-blue-50/90 group-even:bg-gray-50/90 z-10 transition-colors">{{ index + 1 }}</td>
              <td class="border-r border-gray-200 px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-800 sticky left-[45px] bg-white group-hover:bg-blue-50/90 group-even:bg-gray-50/90 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors">{{ student.full_name }}</td>
              <td class="border-r border-gray-200 px-4 py-2 whitespace-nowrap text-sm text-gray-600">{{ student.class_name }}</td>
              <td v-for="date in matrixDates" :key="date" class="border-r border-gray-200 px-1.5 py-2 whitespace-nowrap text-center text-sm" :class="getCellClass(student.attendances[date])">
                <template v-if="student.attendances[date] === 'H'">
                  <span class="text-green-600 font-bold text-base leading-none inline-block">✓</span>
                </template>
                <template v-else-if="student.attendances[date] === 'S'">
                  <span class="text-yellow-600 font-semibold">S</span>
                </template>
                <template v-else-if="student.attendances[date] === 'I'">
                  <span class="text-blue-600 font-semibold">I</span>
                </template>
                <template v-else-if="student.attendances[date] === 'A'">
                  <span class="text-red-600 font-semibold">A</span>
                </template>
                <template v-else-if="student.attendances[date] === 'HA'">
                  <span class="text-yellow-900 font-bold">HA</span>
                </template>
                <template v-else>
                  <span class="text-gray-400 font-semibold">X</span>
                </template>
              </td>
              <td class="border-r border-gray-200 px-3 py-2 whitespace-nowrap text-center text-sm font-semibold text-green-700 bg-green-50/40">
                {{ calculateTotal(student.attendances, ['H', 'HA']) }}
              </td>
              <td class="px-3 py-2 whitespace-nowrap text-center text-sm font-semibold text-red-700 bg-red-50/40">
                {{ calculateTotal(student.attendances, ['I', 'S', 'A']) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Legend -->
      <div v-if="hasData" class="p-4 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-4 text-xs text-gray-600">
        <div class="flex items-center gap-1.5">
          <span class="w-4 h-4 bg-emerald-100 flex items-center justify-center rounded font-bold text-emerald-700">H</span> Hadir
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-4 h-4 bg-blue-100 flex items-center justify-center rounded font-bold text-blue-700">I</span> Izin
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-4 h-4 bg-purple-100 flex items-center justify-center rounded font-bold text-purple-700">S</span> Sakit
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-4 h-4 bg-rose-100 flex items-center justify-center rounded font-bold text-rose-700">A</span> Alpa
        </div>
        <div v-if="filters.compareTahfidz" class="flex items-center gap-1.5">
          <span class="w-6 h-4 bg-yellow-200 flex items-center justify-center rounded font-bold text-yellow-800">HA</span> Hadir Sekolah, Tidak Absen Tahfidz
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { classService, academicYearService } from '@/services/api/academic.service'
import studentAttendanceService from '@/services/api/studentAttendance.service'
import { useToast } from '@/composables/useToast'

const { error, success } = useToast()

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

// State
const classes = ref([])
const academicYears = ref([])
const loading = ref(false)
const exportLoading = ref(false)
const initialLoad = ref(true)

const matrixDates = ref([])
const matrixStudents = ref([])

const getToday = () => {
  return new Date().toISOString().split('T')[0]
}

const currentMonth = new Date().getMonth()
const currentYear = new Date().getFullYear()

const filters = reactive({
  periodType: 'monthly',
  singleDate: getToday(),
  month: currentMonth,
  year: currentYear,
  academicYearId: '',
  startDate: getToday(),
  endDate: getToday(),
  classId: '',
  compareTahfidz: false
})

const hasData = computed(() => matrixDates.value.length > 0 && matrixStudents.value.length > 0)

const formatDayNumber = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).getDate().toString().padStart(2, '0')
}

const calculateTotal = (attendances, statuses) => {
  return Object.values(attendances || {}).filter(s => statuses.includes(s)).length
}

const getCellClass = (status) => {
  if (status === 'HA') return 'bg-yellow-200'
  return ''
}

const handlePeriodChange = () => {
  // reset academic year if changed
}

const loadFiltersData = async () => {
  try {
    const [classesRes, ayRes] = await Promise.all([
      classService.getAll({ limit: 300 }),
      academicYearService.getAll()
    ])
    
    if (classesRes.success) classes.value = classesRes.data?.classes || []
    if (ayRes.success) {
      academicYears.value = ayRes.data || []
      const activeAy = academicYears.value.find(ay => ay.is_active)
      if (activeAy) {
        filters.academicYearId = activeAy.id
      }
    }
  } catch (err) {
    console.error('Failed to load filters data', err)
  }
}

const calculateDateRange = () => {
  let start, end;
  
  if (filters.periodType === 'daily') {
    start = filters.singleDate
    end = filters.singleDate
  } else if (filters.periodType === 'monthly') {
    const firstDay = new Date(filters.year, filters.month, 1)
    const lastDay = new Date(filters.year, filters.month + 1, 0)
    
    // adjust for timezone issues, force YYYY-MM-DD
    const pad = (n) => n.toString().padStart(2, '0')
    start = `${filters.year}-${pad(filters.month + 1)}-01`
    end = `${filters.year}-${pad(filters.month + 1)}-${pad(lastDay.getDate())}`
  } else if (filters.periodType === 'semester') {
    if (!filters.academicYearId) throw new Error('Pilih tahun ajaran terlebih dahulu')
    const ay = academicYears.value.find(a => a.id === filters.academicYearId)
    if (!ay || !ay.start_date || !ay.end_date) throw new Error('Data tahun ajaran tidak valid')
    start = ay.start_date
    end = ay.end_date
  } else {
    start = filters.startDate
    end = filters.endDate
  }
  
  if (!start || !end) throw new Error('Pilih rentang tanggal yang valid')
  if (new Date(start) > new Date(end)) throw new Error('Tanggal mulai tidak boleh lebih dari tanggal sampai')
  
  // Prevent too long ranges
  const diffTime = Math.abs(new Date(end) - new Date(start))
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays > 185) { // Roughly half year
    throw new Error('Rentang tanggal maksimal 6 bulan untuk menghindari beban server terlalu tinggi')
  }

  return { start, end }
}

const loadData = async () => {
  try {
    const { start, end } = calculateDateRange()
    
    loading.value = true
    initialLoad.value = false
    
    const res = await studentAttendanceService.getRecapMatrix({
      startDate: start,
      endDate: end,
      class_id: filters.classId,
      compare_tahfidz: filters.compareTahfidz
    })
    
    if (res.success) {
      matrixDates.value = res.data.dates
      matrixStudents.value = res.data.students
    }
  } catch (err) {
    error(err.message || 'Gagal memuat data laporan')
    matrixDates.value = []
    matrixStudents.value = []
  } finally {
    loading.value = false
  }
}

const exportExcel = async () => {
  if (!hasData.value) return
  
  exportLoading.value = true
  try {
    // Dynamic import to avoid chunk loading issues if not used
    const ExcelJS = await import('exceljs')
    const { saveAs } = await import('file-saver')
    
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Rekap Absensi')
    
    // Header
    const headers = ['No', 'Nama Siswa', 'NIS', 'Kelas', ...matrixDates.value.map(d => formatDayNumber(d)), 'M', 'TM']
    worksheet.addRow(headers)
    
    // Header formatting
    worksheet.getRow(1).font = { bold: true }
    
    // Data rows
    matrixStudents.value.forEach((student, index) => {
      const row = [
        index + 1,
        student.full_name,
        student.nis,
        student.class_name
      ]
      matrixDates.value.forEach(d => {
        row.push(student.attendances[d] || '-')
      })
      row.push(calculateTotal(student.attendances, ['H', 'HA']))
      row.push(calculateTotal(student.attendances, ['I', 'S', 'A']))
      worksheet.addRow(row)
    })
    
    // Adjust column widths
    worksheet.columns.forEach((column, i) => {
      if (i === 1) column.width = 30 // Nama
      else if (i === 2) column.width = 15 // NIS
      else if (i === 3) column.width = 15 // Kelas
      else column.width = 10 // Dates and No
    })
    
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `Rekap_Absensi_Siswa_${new Date().getTime()}.xlsx`)
    success('Berhasil export ke Excel')
  } catch (err) {
    error('Gagal export ke Excel')
    console.error(err)
  } finally {
    exportLoading.value = false
  }
}

const exportPdf = async () => {
  if (!hasData.value) return
  
  exportLoading.value = true
  try {
    success('Menyiapkan dokumen PDF...')
    const html2pdf = (await import('html2pdf.js')).default
    
    // Create a printable clone
    const element = document.getElementById('recap-table-container').cloneNode(true)
    
    // Remove fixed heights and scrollbars from clone for PDF
    element.className = 'w-full text-sm'
    
    // Create a container with title
    const container = document.createElement('div')
    container.innerHTML = `
      <div style="margin-bottom: 20px; text-align: center;">
        <h2 style="margin: 0; padding: 0;">Rekap Absensi Siswa</h2>
        <p style="margin: 5px 0 0 0; color: #666;">Periode: ${matrixDates.value[0]} s/d ${matrixDates.value[matrixDates.value.length-1]}</p>
      </div>
    `
    container.appendChild(element)
    
    const opt = {
      margin:       [10, 10, 10, 10],
      filename:     `Rekap_Absensi_Siswa_${new Date().getTime()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    }
    
    await html2pdf().set(opt).from(container).save()
    success('Berhasil export ke PDF')
  } catch (err) {
    error('Gagal export ke PDF')
    console.error(err)
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  loadFiltersData()
})
</script>
