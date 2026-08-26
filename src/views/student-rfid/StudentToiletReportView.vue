<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Laporan Toilet Siswa</h1>
        <p class="text-sm text-gray-500 mt-1">Rekap trip, durasi, dan ranking penggunaan toilet langsung dari database.</p>
      </div>
      <div class="flex gap-2">
        <BaseButton variant="outline" @click="exportPDF" :disabled="loading">Export PDF</BaseButton>
        <BaseButton variant="outline" @click="exportExcel" :disabled="loading">Export Excel</BaseButton>
        <BaseButton variant="outline" @click="loadData" :loading="loading">Refresh Data</BaseButton>
      </div>
    </div>

    <div class="grid md:grid-cols-4 gap-3">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Siswa Tercatat</p>
        <p class="text-3xl font-black text-blue-600 mt-1">{{ totalStudents }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Total Trip</p>
        <p class="text-3xl font-black text-emerald-600 mt-1">{{ totalTrips }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Total Durasi</p>
        <p class="text-3xl font-black text-amber-600 mt-1">{{ formatDuration(totalDurationMinutes) }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Sedang OUT</p>
        <p class="text-3xl font-black text-rose-600 mt-1">{{ currentlyOut.length }}</p>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2">
      <select v-model="filters.type" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm">
        <option value="daily">Harian</option>
        <option value="weekly">Mingguan</option>
        <option value="monthly">Bulanan</option>
        <option value="range">Range Tanggal</option>
      </select>

      <input v-if="filters.type === 'daily'" v-model="filters.date" type="date" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm" />
      <input v-else-if="filters.type === 'weekly'" v-model="filters.week" type="week" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm" />
      <input v-else-if="filters.type === 'monthly'" v-model="filters.month" type="month" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm" />
      <div v-else-if="filters.type === 'range'" class="flex items-center gap-2">
        <input v-model="filters.startDate" type="date" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm" />
        <span class="text-sm text-gray-500">s/d</span>
        <input v-model="filters.endDate" type="date" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm" />
      </div>

      <select v-model="filters.class_id" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm min-w-40">
        <option value="">Semua Kelas</option>
        <option v-for="klass in classes" :key="klass.id" :value="String(klass.id)">{{ klass.name }}</option>
      </select>
      <BaseButton variant="outline" @click="applyFilter">Generate Rekap</BaseButton>
      <BaseButton variant="outline" @click="resetFilter">Reset</BaseButton>
      <p class="text-xs text-gray-500 ml-auto">Update: {{ lastUpdated ? formatDateTime(lastUpdated) : '-' }}</p>
    </div>

    <div class="grid md:grid-cols-2 gap-4">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h2 class="font-semibold text-gray-800 mb-3">Ranking Paling Sering</h2>
        <div v-if="rankingTrips.length" class="space-y-2">
          <div v-for="item in rankingTrips" :key="item.student_id" class="flex justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <span class="font-medium">{{ item.full_name || '-' }}</span>
            <span class="font-semibold text-blue-700">{{ item.total_trips }} trip</span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500">Tidak ada data.</p>
      </div>

      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h2 class="font-semibold text-gray-800 mb-3">Ranking Durasi Terlama</h2>
        <div v-if="rankingDuration.length" class="space-y-2">
          <div v-for="item in rankingDuration" :key="item.student_id" class="flex justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <span class="font-medium">{{ item.full_name || '-' }}</span>
            <span class="font-semibold text-amber-700">{{ formatDuration(item.total_duration_minutes) }}</span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500">Tidak ada data.</p>
      </div>
    </div>

    <BaseTable
      :columns="columns"
      :data="currentlyOut"
      :loading="loading"
      :showActions="false"
      :showPagination="false"
    >
      <template #cell-student="{ item }">
        <div>
          <p class="font-semibold text-gray-900">{{ item.student?.full_name || '-' }}</p>
          <p class="text-xs text-gray-500">NIS: {{ item.student?.nis || '-' }}</p>
        </div>
      </template>
      <template #cell-class_info="{ item }">{{ item.class_info?.name || '-' }}</template>
      <template #cell-exit_at="{ item }">{{ formatDateTime(item.exit_at) }}</template>
      <template #cell-duration="{ item }">{{ getOutDuration(item.exit_at) }}</template>
    </BaseTable>
    <div class="mt-8">
      <h2 class="text-lg font-bold text-gray-800 mb-4">Histori Perijinan Toilet</h2>
      <BaseTable
        :columns="historyColumns"
        :data="permissionHistory"
        :loading="loading"
        :showActions="false"
        :showPagination="true"
        :itemsPerPage="10"
      >
        <template #cell-student="{ item }">
          <div>
            <p class="font-semibold text-gray-900">{{ item.student?.full_name || '-' }}</p>
            <p class="text-xs text-gray-500">NIS: {{ item.student?.nis || '-' }}</p>
          </div>
        </template>
        <template #cell-class_info="{ item }">{{ item.class_info?.name || '-' }}</template>
        <template #cell-status="{ item }">
          <span :class="['px-2 py-1 rounded-full text-xs font-medium', item.status === 'OUT' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700']">
            {{ item.status }}
          </span>
        </template>
        <template #cell-exit_at="{ item }">{{ formatDateTime(item.exit_at) }}</template>
        <template #cell-return_at="{ item }">{{ formatDateTime(item.return_at) }}</template>
        <template #cell-duration="{ item }">
          <span v-if="item.status === 'RETURNED'">{{ formatDuration(item.duration_minutes) }}</span>
          <span v-else class="text-gray-400 italic">Sedang keluar...</span>
        </template>
      </BaseTable>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import toiletService from '@/services/api/studentToiletRfid.service'
import { classService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const { error: showError } = useToast()

const getCurrentWeek = () => {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

const getCurrentMonth = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const today = new Date().toISOString().slice(0, 10)
const currentWeek = getCurrentWeek()
const currentMonth = getCurrentMonth()

const loading = ref(false)
const lastUpdated = ref(null)
const classes = ref([])
const byStudent = ref([])
const rankingTrips = ref([])
const rankingDuration = ref([])
const currentlyOut = ref([])
const permissionHistory = ref([])

const filters = reactive({
  type: 'daily',
  date: today,
  week: currentWeek,
  month: currentMonth,
  startDate: today,
  endDate: today,
  class_id: ''
})

const columns = [
  { key: 'student', label: 'Siswa', sortable: false },
  { key: 'class_info', label: 'Kelas', sortable: false },
  { key: 'exit_at', label: 'Keluar', sortable: false },
  { key: 'duration', label: 'Durasi OUT', sortable: false }
]

const historyColumns = [
  { key: 'student', label: 'Siswa', sortable: false },
  { key: 'class_info', label: 'Kelas', sortable: false },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'exit_at', label: 'Keluar', sortable: false },
  { key: 'return_at', label: 'Kembali', sortable: false },
  { key: 'duration', label: 'Durasi', sortable: false }
]

const totalStudents = computed(() => byStudent.value.length)
const totalTrips = computed(() => byStudent.value.reduce((acc, item) => acc + Number(item.total_trips || 0), 0))
const totalDurationMinutes = computed(() => byStudent.value.reduce((acc, item) => acc + Number(item.total_duration_minutes || 0), 0))

const formatDateTime = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID')
}

const formatDuration = (minutes) => {
  const value = Number(minutes || 0)
  if (value < 1) return '0 menit'

  const hours = Math.floor(value / 60)
  const remainMinutes = value % 60

  if (!hours) return `${remainMinutes} menit`
  if (!remainMinutes) return `${hours} jam`
  return `${hours} jam ${remainMinutes} menit`
}

const getOutDuration = (exitAt) => {
  if (!exitAt) return '-'
  const elapsedMs = Date.now() - new Date(exitAt).getTime()
  const elapsedMinutes = Math.max(0, Math.floor(elapsedMs / 60000))
  return formatDuration(elapsedMinutes)
}

const formatDateOnly = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const getWeekStartEnd = (weekStr) => {
  if (!weekStr) return { start: today, end: today }
  const [yearStr, weekNumStr] = weekStr.split('-W')
  const year = parseInt(yearStr, 10)
  const week = parseInt(weekNumStr, 10)
  
  const date = new Date(year, 0, 1 + (week - 1) * 7)
  const day = date.getDay() || 7
  date.setDate(date.getDate() - day + 1)
  
  const end = new Date(date)
  end.setDate(end.getDate() + 6)

  return { start: formatDateOnly(date), end: formatDateOnly(end) }
}

const getMonthStartEnd = (monthStr) => {
  if (!monthStr) return { start: today, end: today }
  const [year, month] = monthStr.split('-')
  const start = new Date(year, parseInt(month) - 1, 1)
  const end = new Date(year, parseInt(month), 0)
  return { start: formatDateOnly(start), end: formatDateOnly(end) }
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
      class_id: filters.class_id || undefined
    }

    if (filters.type === 'daily') {
      params.date = filters.date || today
    } else if (filters.type === 'weekly') {
      const { start, end } = getWeekStartEnd(filters.week)
      params.start_date = start
      params.end_date = end
    } else if (filters.type === 'monthly') {
      const { start, end } = getMonthStartEnd(filters.month)
      params.start_date = start
      params.end_date = end
    } else if (filters.type === 'range') {
      params.start_date = filters.startDate
      params.end_date = filters.endDate
    }

    const response = await toiletService.getSummary(params)
    const payload = response?.data || {}

    byStudent.value = payload.by_student || []
    rankingTrips.value = payload.ranking_most_trips || []
    rankingDuration.value = payload.ranking_longest_duration || []
    currentlyOut.value = payload.currently_out || []
    permissionHistory.value = payload.permission_history || []
    lastUpdated.value = new Date().toISOString()
  } catch (err) {
    showError('Gagal memuat laporan toilet siswa')
  } finally {
    loading.value = false
  }
}

const applyFilter = async () => {
  await loadData()
}

const resetFilter = async () => {
  filters.type = 'daily'
  filters.date = today
  filters.week = currentWeek
  filters.month = currentMonth
  filters.startDate = today
  filters.endDate = today
  filters.class_id = ''
  await loadData()
}

const getPeriodeString = () => {
  if (filters.type === 'daily') return `Tanggal ${filters.date}`
  if (filters.type === 'weekly') return `Minggu ${filters.week}`
  if (filters.type === 'monthly') return `Bulan ${filters.month}`
  return `Periode ${filters.startDate} s_d ${filters.endDate}`
}

const exportPDF = () => {
  if (!permissionHistory.value.length && totalStudents.value === 0) {
    showError('Tidak ada data untuk diexport')
    return
  }

  const doc = new jsPDF()
  const periode = getPeriodeString().replace(/_/g, '/')
  const generatedAt = formatDateTime(new Date().toISOString())
  
  // Header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(33, 37, 41)
  doc.text('LAPORAN TOILET SISWA', 105, 20, { align: 'center' })
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`Periode: ${periode} | Dicetak: ${generatedAt}`, 105, 28, { align: 'center' })
  
  // Line separator
  doc.setDrawColor(200, 200, 200)
  doc.line(14, 32, 196, 32)
  
  let yPos = 40
  
  // STATISTIK RINGKASAN
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(33, 37, 41)
  doc.text('Statistik Ringkasan', 14, yPos)
  yPos += 4
  
  autoTable(doc, {
    startY: yPos,
    head: [['Siswa Tercatat', 'Total Trip', 'Total Durasi', 'Sedang OUT']],
    body: [[
      totalStudents.value.toString(),
      totalTrips.value.toString(),
      formatDuration(totalDurationMinutes.value),
      currentlyOut.value.length.toString()
    ]],
    theme: 'grid',
    styles: { lineColor: [150, 150, 150], lineWidth: 0.1, fontSize: 10 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    bodyStyles: { halign: 'center', fontSize: 11, fontStyle: 'bold' },
    margin: { left: 14, right: 14 }
  })
  yPos = doc.lastAutoTable.finalY + 12
  
  // RANKING 1 (Paling Sering)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('10 Siswa Paling Sering', 14, yPos)
  yPos += 4
  
  const tripRankData = rankingTrips.value.slice(0, 10).map((r, i) => [`${i+1}. ${r.full_name}`, `${r.total_trips} trip`])
  if (tripRankData.length === 0) tripRankData.push(['Tidak ada data', ''])
  
  autoTable(doc, {
    startY: yPos,
    head: [['Nama Siswa', 'Jumlah Trip']],
    body: tripRankData,
    theme: 'grid',
    styles: { lineColor: [150, 150, 150], lineWidth: 0.1, fontSize: 10 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    margin: { left: 14, right: 14 }
  })
  yPos = doc.lastAutoTable.finalY + 12
  
  if (yPos > 240) {
    doc.addPage()
    yPos = 20
  }
  
  // RANKING 2 (Durasi Terlama)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('10 Durasi Terlama', 14, yPos)
  yPos += 4

  const durRankData = rankingDuration.value.slice(0, 10).map((r, i) => [`${i+1}. ${r.full_name}`, formatDuration(r.total_duration_minutes)])
  if (durRankData.length === 0) durRankData.push(['Tidak ada data', ''])
  
  autoTable(doc, {
    startY: yPos,
    head: [['Nama Siswa', 'Total Durasi']],
    body: durRankData,
    theme: 'grid',
    styles: { lineColor: [150, 150, 150], lineWidth: 0.1, fontSize: 10 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    margin: { left: 14, right: 14 }
  })
  yPos = doc.lastAutoTable.finalY + 12
  
  if (yPos > 240) {
    doc.addPage()
    yPos = 20
  }
  
  // HISTORI PERIJINAN
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(33, 37, 41)
  doc.text('Histori Perijinan Toilet', 14, yPos)
  yPos += 4
  
  const historyData = permissionHistory.value.map(item => [
    item.student?.full_name || '-',
    item.class_info?.name || '-',
    item.status,
    formatDateTime(item.exit_at),
    formatDateTime(item.return_at),
    item.status === 'RETURNED' ? formatDuration(item.duration_minutes) : 'OUT'
  ])
  
  autoTable(doc, {
    startY: yPos,
    head: [['Siswa', 'Kelas', 'Status', 'Waktu Keluar', 'Waktu Kembali', 'Durasi']],
    body: historyData.length ? historyData : [['Tidak ada data', '', '', '', '', '']],
    theme: 'grid',
    styles: { lineColor: [150, 150, 150], lineWidth: 0.1, fontSize: 10 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    margin: { left: 14, right: 14 }
  })
  
  // FOOTER
  const pageCount = doc.internal.getNumberOfPages()
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(150, 150, 150)
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(`Halaman ${i} dari ${pageCount}`, 105, 290, { align: 'center' })
  }
  
  doc.save(`Laporan_Toilet_${periode.replace(/[ \/]/g, '_')}.pdf`)
}

const exportExcel = async () => {
  if (!permissionHistory.value.length && totalStudents.value === 0) {
    showError('Tidak ada data untuk diexport')
    return
  }

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Laporan Toilet')
  const periode = getPeriodeString().replace(/_/g, '/')
  
  sheet.addRow(['LAPORAN TOILET SISWA'])
  sheet.addRow([periode])
  sheet.addRow([])
  
  sheet.addRow(['STATISTIK RINGKASAN'])
  sheet.addRow(['Siswa Tercatat', totalStudents.value])
  sheet.addRow(['Total Trip', totalTrips.value])
  sheet.addRow(['Total Durasi', formatDuration(totalDurationMinutes.value)])
  sheet.addRow(['Sedang OUT', currentlyOut.value.length])
  sheet.addRow([])
  
  sheet.addRow(['10 SISWA PALING SERING', '', '', '10 DURASI TERLAMA'])
  sheet.addRow(['Nama Siswa', 'Jumlah Trip', '', 'Nama Siswa', 'Durasi'])
  
  const maxRankLen = Math.max(rankingTrips.value.length, rankingDuration.value.length, 1)
  for (let i = 0; i < Math.min(maxRankLen, 10); i++) {
    const t = rankingTrips.value[i]
    const d = rankingDuration.value[i]
    sheet.addRow([
      t ? t.full_name : '-',
      t ? t.total_trips : '-',
      '',
      d ? d.full_name : '-',
      d ? formatDuration(d.total_duration_minutes) : '-'
    ])
  }
  sheet.addRow([])
  
  sheet.addRow(['HISTORI PERIJINAN'])
  const headerRow = sheet.addRow(['Siswa', 'Kelas', 'Status', 'Keluar', 'Kembali', 'Durasi'])
  headerRow.font = { bold: true }
  
  permissionHistory.value.forEach(item => {
    sheet.addRow([
      item.student?.full_name || '-',
      item.class_info?.name || '-',
      item.status,
      formatDateTime(item.exit_at),
      formatDateTime(item.return_at),
      item.status === 'RETURNED' ? formatDuration(item.duration_minutes) : 'Sedang keluar'
    ])
  })
  
  sheet.columns.forEach(col => { col.width = 20 })
  
  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer]), `Laporan_Toilet_${periode.replace(/[ \/]/g, '_')}.xlsx`)
}

onMounted(async () => {
  await Promise.all([loadClasses(), loadData()])
})
</script>
