<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Rekap Tahfidz</h1>
        <p class="text-sm text-gray-500 mt-1">Laporan rekapitulasi kehadiran kegiatan Tahfidz siswa.</p>
      </div>
      <div v-if="hasLoaded && tableData.students.length > 0" class="flex gap-2">
        <BaseButton @click="exportExcel" :loading="excelLoading" variant="outline" class="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
          <svg class="w-4 h-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Excel
        </BaseButton>
        <BaseButton @click="exportPDF" :loading="pdfLoading" variant="outline" class="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
          <svg class="w-4 h-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Cetak PDF
        </BaseButton>
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
      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto max-h-[600px] relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table id="recap-table" class="min-w-full border-collapse">
            <thead class="bg-gray-50/95 backdrop-blur sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <tr>
                <th scope="col" class="border-b border-r border-gray-200 px-3 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-50/95 z-30 min-w-[45px] backdrop-blur">No</th>
                <th scope="col" class="border-b border-r border-gray-200 px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-[45px] bg-gray-50/95 z-30 min-w-[200px] backdrop-blur shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Nama</th>
                <th scope="col" class="border-b border-r border-gray-200 px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kelas</th>
                <th v-for="date in tableData.dates" :key="date" scope="col" class="border-b border-r border-gray-200 px-1.5 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[36px]">
                  {{ new Date(date).getDate() }}
                </th>
                <th scope="col" class="border-b border-r border-gray-200 px-3 py-2.5 text-center text-xs font-semibold text-green-700 uppercase tracking-wider bg-green-50/95">M</th>
                <th scope="col" class="border-b border-gray-200 px-3 py-2.5 text-center text-xs font-semibold text-red-700 uppercase tracking-wider bg-red-50/95">TM</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="(row, index) in tableData.students" :key="row.student?.id || index" class="hover:bg-blue-50/60 even:bg-gray-50/40 transition-colors group">
                <td class="border-r border-gray-200 px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-center sticky left-0 bg-white group-hover:bg-blue-50/90 group-even:bg-gray-50/90 z-10 transition-colors">{{ index + 1 }}</td>
                <td class="border-r border-gray-200 px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-800 sticky left-[45px] bg-white group-hover:bg-blue-50/90 group-even:bg-gray-50/90 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors">{{ row.student?.full_name || '-' }}</td>
                <td class="border-r border-gray-200 px-4 py-2 whitespace-nowrap text-sm text-gray-600">{{ row.class_info?.name || '-' }}</td>
                <td v-for="date in tableData.dates" :key="date" class="border-r border-gray-200 px-1.5 py-2 whitespace-nowrap text-center text-sm">
                  <template v-if="row.attendances[date] === 'present'">
                    <span class="text-green-600 font-bold text-base leading-none inline-block">✓</span>
                  </template>
                  <template v-else-if="row.attendances[date] === 'sick'">
                    <span class="text-yellow-600 font-semibold">S</span>
                  </template>
                  <template v-else-if="row.attendances[date] === 'permission'">
                    <span class="text-blue-600 font-semibold">I</span>
                  </template>
                  <template v-else-if="row.attendances[date] === 'absent'">
                    <span class="text-red-600 font-semibold">A</span>
                  </template>
                  <template v-else>
                    <span class="text-gray-400 font-semibold">X</span>
                  </template>
                </td>
                <td class="border-r border-gray-200 px-3 py-2 whitespace-nowrap text-center text-sm font-semibold text-green-700 bg-green-50/40">
                  {{ row.summary.m }}
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-center text-sm font-semibold text-red-700 bg-red-50/40">
                  {{ row.summary.tm }}
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
import { ref, reactive, onMounted, computed } from 'vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
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
const pdfLoading = ref(false)
const excelLoading = ref(false)

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

const formatDayDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit'
  }).format(date)
}

const getDatesBetween = (start, end) => {
  const dates = []
  let curr = new Date(start)
  const endD = new Date(end)
  while (curr <= endD) {
    dates.push(curr.toISOString().split('T')[0])
    curr.setDate(curr.getDate() + 1)
  }
  return dates
}

const tableData = computed(() => {
  if (!records.value || records.value.length === 0) {
    return { dates: [], students: [] }
  }
  
  const dates = getDatesBetween(filters.start_date, filters.end_date)
  
  const studentsMap = {}
  records.value.forEach(record => {
    const studentKey = record.student?.id || record.student?.nis || record.student_id;
    if (!studentKey) return;
    
    if (!studentsMap[studentKey]) {
      studentsMap[studentKey] = {
        student: record.student,
        class_info: record.class_info,
        attendances: {}
      };
    }
    const dateStr = record.attendance_date ? record.attendance_date.split('T')[0] : null
    if (dateStr) {
      studentsMap[studentKey].attendances[dateStr] = record.status;
    }
  });
  
  const students = Object.values(studentsMap).map(student => {
    let m = 0;
    let tm = 0;
    dates.forEach(date => {
      const status = student.attendances[date];
      if (status === 'present') {
        m++;
      } else {
        tm++;
      }
    });
    return { ...student, summary: { m, tm } };
  }).sort((a, b) => {
    // Group by class first, then sort by student name within each class
    const classA = a.class_info?.name || '';
    const classB = b.class_info?.name || '';
    const classCompare = classA.localeCompare(classB, 'id');
    if (classCompare !== 0) return classCompare;
    return (a.student?.full_name || '').localeCompare(b.student?.full_name || '', 'id');
  });

  return {
    dates,
    students
  };
})

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

const exportExcel = async () => {
  if (!records.value || records.value.length === 0) return
  excelLoading.value = true
  
  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Rekap Tahfidz')

    // Columns definition
    const columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama', key: 'nama', width: 25 },
      { header: 'Kelas', key: 'kelas', width: 15 }
    ]
    
    tableData.value.dates.forEach(d => {
      columns.push({ header: formatDayDate(d), key: d, width: 6 })
    })
    
    columns.push({ header: 'M', key: 'm', width: 6 })
    columns.push({ header: 'TM', key: 'tm', width: 6 })

    worksheet.columns = columns

    // Header styling
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FF000000' } }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3F4F6' } // bg-gray-100
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })

    // Add Rows
    tableData.value.students.forEach((row, idx) => {
      const rowData = {
        no: idx + 1,
        nama: row.student?.full_name || '-',
        kelas: row.class_info?.name || '-'
      }
      
      tableData.value.dates.forEach(date => {
        const status = row.attendances[date]
        if (status === 'present') rowData[date] = '✓'
        else if (status === 'sick') rowData[date] = 'S'
        else if (status === 'permission') rowData[date] = 'I'
        else if (status === 'absent') rowData[date] = 'A'
        else rowData[date] = 'X'
      })
      
      rowData.m = row.summary.m
      rowData.tm = row.summary.tm
      
      const wsRow = worksheet.addRow(rowData)
      
      // Style cells
      wsRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
        cell.alignment = { vertical: 'middle', horizontal: colNumber === 2 || colNumber === 3 ? 'left' : 'center' }
        
        // Colors for specific statuses
        if (columns[colNumber - 1].key === 'm') {
          cell.font = { bold: true, color: { argb: 'FF16A34A' } }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAF7EC' } }
        } else if (columns[colNumber - 1].key === 'tm') {
          cell.font = { bold: true, color: { argb: 'FFDC2626' } }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }
        } else if (colNumber > 3) {
          const val = cell.value
          if (val === '✓') cell.font = { bold: true, color: { argb: 'FF16A34A' } }
          else if (val === 'S') cell.font = { bold: true, color: { argb: 'FFCA8A04' } }
          else if (val === 'I') cell.font = { bold: true, color: { argb: 'FF2563EB' } }
          else if (val === 'A') cell.font = { bold: true, color: { argb: 'FFDC2626' } }
          else if (val === 'X') cell.font = { bold: true, color: { argb: 'FF9CA3AF' } }
        }
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buffer]), `Rekap_Tahfidz_${filters.start_date}_${filters.end_date}.xlsx`)
  } catch (err) {
    error('Gagal mengekspor file Excel')
  } finally {
    excelLoading.value = false
  }
}

const exportPDF = async () => {
  if (!records.value || records.value.length === 0) return
  
  pdfLoading.value = true
  
  try {
    let className = "Semua Kelas"
    if (filters.class_id) {
      const cls = classes.value.find(c => String(c.id) === String(filters.class_id))
      if (cls) className = cls.name
    }

    const doc = new jsPDF('landscape')
    
    // Header - Professional look
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(17, 24, 39) // gray-900
    doc.text('LAPORAN REKAPITULASI KEHADIRAN TAHFIDZ', doc.internal.pageSize.width / 2, 16, { align: 'center' })
    
    // Line separator
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.line(14, 22, doc.internal.pageSize.width - 14, 22)
    
    // Metadata
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(75, 85, 99) // gray-600
    doc.text(`Periode  : ${formatDate(filters.start_date)} s/d ${formatDate(filters.end_date)}`, 14, 28)
    doc.text(`Kelas    : ${className}`, 14, 33)

    // Data prep
    const head = [['No', 'Nama', 'Kelas']]
    tableData.value.dates.forEach(d => {
      head[0].push(new Date(d).getDate().toString())
    })
    head[0].push('M', 'TM')

    const body = []
    tableData.value.students.forEach((row, idx) => {
      const rowData = [
        idx + 1,
        row.student?.full_name || '-',
        row.class_info?.name || '-'
      ]
      
      tableData.value.dates.forEach(date => {
        const status = row.attendances[date]
        if (status === 'present') rowData.push('present') // special marker for drawing checkmark
        else if (status === 'sick') rowData.push('S')
        else if (status === 'permission') rowData.push('I')
        else if (status === 'absent') rowData.push('A')
        else rowData.push('X')
      })
      
      rowData.push(row.summary.m)
      rowData.push(row.summary.tm)
      
      body.push(rowData)
    })

    autoTable(doc, {
      head: head,
      body: body,
      startY: 38,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 7.5,
        halign: 'center',
        valign: 'middle',
        cellPadding: 1.2,
        lineWidth: 0.1,
        lineColor: [229, 231, 235], // subtle grid lines (gray-200)
        textColor: [55, 65, 81] // gray-700
      },
      headStyles: {
        fillColor: [30, 58, 138], // Dark Blue (blue-900)
        textColor: 255, // White
        fontStyle: 'bold',
        lineWidth: 0.1,
        lineColor: [30, 58, 138]
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251] // gray-50
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'left', cellWidth: 35, fontStyle: 'bold', textColor: [17, 24, 39] }, // Nama
        2: { halign: 'left', cellWidth: 18 }  // Kelas
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index > 2) {
          const val = data.cell.raw
          
          if (val === 'present') {
            data.cell.text = ['']; // Empty text, will draw checkmark later
          }
          else if (val === 'S') { data.cell.styles.textColor = [202, 138, 4]; data.cell.styles.fontStyle = 'bold' }
          else if (val === 'I') { data.cell.styles.textColor = [37, 99, 235]; data.cell.styles.fontStyle = 'bold' }
          else if (val === 'A') { data.cell.styles.textColor = [220, 38, 38]; data.cell.styles.fontStyle = 'bold' }
          else if (val === 'X') { data.cell.styles.textColor = [156, 163, 175]; data.cell.styles.fontStyle = 'bold' } // Changed to gray-400
          
          if (data.column.index === head[0].length - 2) { // M column
            data.cell.styles.textColor = [22, 163, 74]
            data.cell.styles.fillColor = [240, 253, 244]
            data.cell.styles.fontStyle = 'bold'
          } else if (data.column.index === head[0].length - 1) { // TM column
            data.cell.styles.textColor = [220, 38, 38]
            data.cell.styles.fillColor = [254, 242, 242]
            data.cell.styles.fontStyle = 'bold'
          }
        }
      },
      didDrawCell: function (data) {
        if (data.section === 'body' && data.column.index > 2) {
          if (data.cell.raw === 'present') {
            const x = data.cell.x;
            const y = data.cell.y;
            const w = data.cell.width;
            const h = data.cell.height;
            
            doc.setDrawColor(22, 163, 74); // green-600
            doc.setLineWidth(0.4);
            
            const cx = x + w / 2;
            const cy = y + h / 2;
            
            // Draw a checkmark using two lines
            doc.line(cx - 1.2, cy + 0.2, cx - 0.2, cy + 1.2);
            doc.line(cx - 0.2, cy + 1.2, cx + 1.5, cy - 1.2);
          }
        }
      }
    })

    // ── Statistics Table ──────────────────────────────────────────────────
    // Build per-class stats: { className: { m, i, s, a, total } }
    const statsMap = {}
    tableData.value.students.forEach(row => {
      const cls = row.class_info?.name || 'Tidak Diketahui'
      if (!statsMap[cls]) statsMap[cls] = { m: 0, i: 0, s: 0, a: 0, studentCount: 0 }
      const stat = statsMap[cls]
      stat.studentCount++
      Object.values(row.attendances).forEach(status => {
        if (status === 'present')         stat.m++
        else if (status === 'permission') stat.i++
        else if (status === 'sick')       stat.s++
        else if (status === 'absent')     stat.a++
      })
    })

    const statsAfterY = (doc.lastAutoTable.finalY || 38) + 10

    // Section title
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(17, 24, 39)
    doc.text('Statistik Kehadiran per Kelas', 14, statsAfterY)

    const statsHead = [['Kelas', 'Hadir (M)', 'Izin (I)', 'Sakit (S)', 'Alpa (A)', 'Rata-rata Pertemuan/Siswa']]
    const statsBody = Object.entries(statsMap).map(([cls, s]) => {
      const total = s.m + s.i + s.s + s.a
      const avg = s.studentCount > 0 ? (total / s.studentCount).toFixed(1) : '0'
      return [cls, s.m, s.i, s.s, s.a, avg]
    })
    // Totals row
    const totM = statsBody.reduce((acc, r) => acc + r[1], 0)
    const totI = statsBody.reduce((acc, r) => acc + r[2], 0)
    const totS = statsBody.reduce((acc, r) => acc + r[3], 0)
    const totA = statsBody.reduce((acc, r) => acc + r[4], 0)
    const totStudents = Object.values(statsMap).reduce((acc, s) => acc + s.studentCount, 0)
    const totRecords = totM + totI + totS + totA
    const totAvg = totStudents > 0 ? (totRecords / totStudents).toFixed(1) : '0'
    statsBody.push(['TOTAL', totM, totI, totS, totA, totAvg])

    autoTable(doc, {
      head: statsHead,
      body: statsBody,
      startY: statsAfterY + 4,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        halign: 'center',
        valign: 'middle',
        cellPadding: 1.5,
        lineWidth: 0.1,
        lineColor: [229, 231, 235],
        textColor: [55, 65, 81]
      },
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontStyle: 'bold',
        lineWidth: 0.1,
        lineColor: [30, 58, 138]
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 35, fontStyle: 'bold', textColor: [17, 24, 39] },
        1: { textColor: [22, 163, 74],  fillColor: [240, 253, 244], fontStyle: 'bold' }, // M - green
        2: { textColor: [37, 99, 235],  fillColor: [239, 246, 255], fontStyle: 'bold' }, // I - blue
        3: { textColor: [202, 138, 4],  fillColor: [254, 252, 232], fontStyle: 'bold' }, // S - yellow
        4: { textColor: [220, 38, 38],  fillColor: [254, 242, 242], fontStyle: 'bold' }, // A - red
        5: { fontStyle: 'bold' }
      },
      didParseCell: function (data) {
        // Bold + different bg for the TOTAL row
        if (data.section === 'body' && data.row.index === statsBody.length - 1) {
          data.cell.styles.fillColor = [243, 244, 246] // gray-100
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.textColor = [17, 24, 39]
        }
      }
    })

    // Footer
    const finalY = doc.lastAutoTable.finalY || 28
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`Dicetak pada: ${formatDate(new Date().toISOString().split('T')[0])}`, doc.internal.pageSize.width - 14, finalY + 8, { align: 'right' })

    doc.save(`Rekap_Tahfidz_${filters.start_date}_${filters.end_date}.pdf`)
    
  } catch (err) {
    console.error(err)
    error('Gagal membuat PDF: ' + err.message)
  } finally {
    pdfLoading.value = false
  }
}

onMounted(() => {
  loadClasses()
})
</script>
