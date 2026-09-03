<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Laporan Pelanggaran</h1>
        <p class="text-sm text-gray-500 mt-1">Rekapitulasi dan ekspor data pelanggaran siswa.</p>
      </div>
      <div class="flex gap-2">
        <BaseButton @click="exportExcel" :loading="exportingExcel" variant="outline" class="text-green-700 border-green-200 hover:bg-green-50">
          <svg class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Cetak Excel
        </BaseButton>
        <BaseButton @click="exportPdf" :loading="exportingPdf" variant="outline" class="text-red-700 border-red-200 hover:bg-red-50">
          <svg class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Cetak PDF
        </BaseButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div class="flex gap-2 mb-4">
        <button @click="setQuickFilter('today')" class="px-3 py-1 text-xs font-medium rounded-full transition-colors border" :class="activeQuickFilter === 'today' ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'">Hari Ini</button>
        <button @click="setQuickFilter('month')" class="px-3 py-1 text-xs font-medium rounded-full transition-colors border" :class="activeQuickFilter === 'month' ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'">Bulan Ini</button>
        <button @click="setQuickFilter('semester')" class="px-3 py-1 text-xs font-medium rounded-full transition-colors border" :class="activeQuickFilter === 'semester' ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'">Semester Aktif</button>
        <button @click="setQuickFilter('custom')" class="px-3 py-1 text-xs font-medium rounded-full transition-colors border" :class="activeQuickFilter === 'custom' ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'">Kustom</button>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div class="md:col-span-1">
          <label class="block text-xs font-medium text-gray-500 mb-1">Dari Tanggal</label>
          <input type="date" v-model="filters.date_from" :disabled="activeQuickFilter !== 'custom'" @change="fetchData" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"/>
        </div>
        <div class="md:col-span-1">
          <label class="block text-xs font-medium text-gray-500 mb-1">Sampai Tanggal</label>
          <input type="date" v-model="filters.date_to" :disabled="activeQuickFilter !== 'custom'" @change="fetchData" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"/>
        </div>
        
        <div class="md:col-span-1">
          <label class="block text-xs font-medium text-gray-500 mb-1">Kelas</label>
          <select v-model="filters.class_id" @change="fetchData" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
            <option value="">Semua Kelas</option>
            <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div class="md:col-span-2">
          <label class="block text-xs font-medium text-gray-500 mb-1">Siswa</label>
          <BaseSearchSelect
            v-model="filters.student_id"
            initial-label="Semua Siswa"
            placeholder="Ketik nama / NIS..."
            :fetch-options="fetchStudentOptions"
            @update:modelValue="fetchData"
            class="text-sm"
          />
        </div>
      </div>
    </div>

    <!-- Preview Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 class="font-semibold text-gray-800">Preview Data</h3>
        <span class="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-md">{{ items.length }} Data Ditemukan</span>
      </div>
      
      <div v-if="loading" class="flex justify-center py-12">
        <svg class="animate-spin h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      </div>
      <div v-else-if="items.length === 0" class="flex flex-col items-center py-12 text-gray-400">
        <svg class="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        <p class="text-sm">Tidak ada data pelanggaran untuk filter ini</p>
      </div>
      <div v-else class="overflow-x-auto max-h-[600px]">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
            <tr>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tgl Kejadian</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Siswa</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kelas</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jenis Pelanggaran</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Poin</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-3 font-medium text-gray-700 whitespace-nowrap">{{ formatDate(item.date) }}</td>
              <td class="px-6 py-3">
                <div class="font-medium text-gray-900">{{ item.student?.full_name || '-' }}</div>
                <div class="text-xs text-gray-500">{{ item.student?.nis || '-' }}</div>
              </td>
              <td class="px-4 py-3 text-gray-600">{{ item.student?.class_history?.[0]?.class_info?.name || '-' }}</td>
              <td class="px-4 py-3">
                <div class="text-gray-800">{{ item.type?.name || '-' }}</div>
                <div class="text-xs text-gray-500 mt-0.5">{{ item.type?.level?.name || '-' }}</div>
              </td>
              <td class="px-4 py-3 text-center font-bold text-red-600">{{ item.type?.point || '-' }}</td>
              <td class="px-4 py-3 text-center">
                <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold" :class="getStatusBadge(item.status)">{{ item.status || 'PENDING' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSearchSelect from '@/components/forms/BaseSearchSelect.vue'
import { studentViolationService } from '@/services/api/violation.service'
import studentService from '@/services/api/student.service'
import { classService } from '@/services/api/academic.service'
import { academicYearService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const { success, error: showError } = useToast()
const loading = ref(false)
const exportingExcel = ref(false)
const exportingPdf = ref(false)
const items = ref([])
const classes = ref([])
const activeAcademicYear = ref(null)

const activeQuickFilter = ref('month')

const today = new Date()
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
  date_to: formatYMD(today),
  student_id: '',
  class_id: '',
  academic_year_id: ''
})

const setQuickFilter = (type) => {
    activeQuickFilter.value = type
    const now = new Date()
    
    if (type === 'today') {
        filters.date_from = formatYMD(now)
        filters.date_to = formatYMD(now)
        fetchData()
    } else if (type === 'month') {
        filters.date_from = getFirstDayOfMonth()
        filters.date_to = formatYMD(now)
        fetchData()
    } else if (type === 'semester') {
        filters.date_from = ''
        filters.date_to = ''
        fetchData()
    }
}

const loadDependencies = async () => {
    try {
        const [classRes, yearRes] = await Promise.all([
            classService.getAll({ limit: 100 }),
            academicYearService.getAll({ limit: 100 })
        ])
        classes.value = classRes.data.classes || []
        
        const years = yearRes.data.academicYears || []
        const active = years.find(y => y.is_active)
        if (active) {
            activeAcademicYear.value = active
            filters.academic_year_id = active.id
        }
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
    // We use a high limit to get all data for the report
    const r = await studentViolationService.getAll({ 
        limit: 5000, 
        page: 1,
        date_from: filters.date_from,
        date_to: filters.date_to,
        student_id: filters.student_id,
        class_id: filters.class_id,
        academic_year_id: filters.academic_year_id,
        sortBy: 'date',
        sortDesc: 'true'
    })
    if (r.success) { 
        items.value = r.data.studentViolations || []
    }
  } catch (e) { 
      showError('Gagal mengambil data laporan') 
  } finally { 
      loading.value = false 
  }
}

const formatDate = (val) => {
  if (!val) return '-'
  return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const getStatusBadge = (status) => {
  switch(status) {
    case 'APPROVED': return 'bg-green-100 text-green-800'
    case 'REJECTED': return 'bg-red-100 text-red-800'
    default: return 'bg-yellow-100 text-yellow-800'
  }
}

const exportExcel = async () => {
    if (items.value.length === 0) return showError('Tidak ada data untuk di-export')
    exportingExcel.value = true
    try {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Laporan Pelanggaran')

        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Tanggal', key: 'date', width: 15 },
            { header: 'NIS', key: 'nis', width: 15 },
            { header: 'Nama Siswa', key: 'name', width: 30 },
            { header: 'Jenis Pelanggaran', key: 'type', width: 30 },
            { header: 'Tingkat', key: 'level', width: 15 },
            { header: 'Poin', key: 'point', width: 10 },
            { header: 'Lokasi', key: 'location', width: 20 },
            { header: 'Keterangan', key: 'desc', width: 30 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Dicatat Oleh', key: 'creator', width: 20 }
        ]

        // Header Styling
        worksheet.getRow(1).font = { bold: true }
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }

        items.value.forEach((item, index) => {
            worksheet.addRow({
                no: index + 1,
                date: item.date,
                nis: item.student?.nis || '-',
                name: item.student?.full_name || '-',
                type: item.type?.name || '-',
                level: item.type?.level?.name || '-',
                point: item.type?.point || 0,
                location: item.location || '-',
                desc: item.description || '-',
                status: item.status || 'PENDING',
                creator: item.creator?.name || '-'
            })
        })

        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        saveAs(blob, `Laporan_Pelanggaran_${formatYMD(new Date())}.xlsx`)
        success('Excel berhasil di-download')
    } catch(e) {
        showError('Gagal export Excel')
    } finally {
        exportingExcel.value = false
    }
}

const exportPdf = () => {
    if (items.value.length === 0) return showError('Tidak ada data untuk di-export')
    exportingPdf.value = true
    try {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
        
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('LAPORAN PELANGGARAN SISWA', doc.internal.pageSize.width / 2, 15, { align: 'center' })
        
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        
        let subtitle = ''
        if (filters.date_from && filters.date_to) subtitle = `Periode: ${formatDate(filters.date_from)} - ${formatDate(filters.date_to)}`
        else if (filters.date_from) subtitle = `Mulai: ${formatDate(filters.date_from)}`
        else if (filters.date_to) subtitle = `Hingga: ${formatDate(filters.date_to)}`
        else subtitle = `Tahun Ajaran: ${activeAcademicYear.value?.name || '-'}`
        
        doc.text(subtitle, doc.internal.pageSize.width / 2, 21, { align: 'center' })

        const tableData = items.value.map((item, index) => [
            index + 1,
            formatDate(item.date),
            item.student?.nis || '-',
            item.student?.full_name || '-',
            item.type?.name || '-',
            item.type?.level?.name || '-',
            item.type?.point || '0',
            item.location || '-',
            item.status || 'PENDING'
        ])

        autoTable(doc, {
            head: [['No', 'Tanggal', 'NIS', 'Nama Siswa', 'Jenis Pelanggaran', 'Tingkat', 'Poin', 'Lokasi', 'Status']],
            body: tableData,
            startY: 28,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                1: { cellWidth: 20 },
                2: { cellWidth: 20 },
                3: { cellWidth: 40 },
                4: { cellWidth: 'auto' },
                5: { cellWidth: 20 },
                6: { halign: 'center', cellWidth: 12 },
                7: { cellWidth: 30 },
                8: { halign: 'center', cellWidth: 20 }
            }
        })

        doc.save(`Laporan_Pelanggaran_${formatYMD(new Date())}.pdf`)
        success('PDF berhasil di-download')
    } catch(e) {
        showError('Gagal export PDF')
    } finally {
        exportingPdf.value = false
    }
}

onMounted(async () => {
    await loadDependencies()
    fetchData()
})
</script>
