<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Laporan Penitipan Barang</h1>
        <p class="text-sm text-gray-500 mt-0.5">Ringkasan operasional, behavior siswa, dan rekap per kelas</p>
      </div>
      <BaseButton variant="outline" @click="loadData">Refresh</BaseButton>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <BaseInput id="report-search" v-model="filters.search" label="Search" placeholder="Cari siswa / barang / kode" @keyup.enter="loadData" />
        <BaseInput id="report-date-from" v-model="filters.date_from" type="date" label="Tanggal Dari" />
        <BaseInput id="report-date-to" v-model="filters.date_to" type="date" label="Tanggal Sampai" />
        <BaseInput id="report-student-id" v-model="filters.student_id" label="ID Siswa" />
        <BaseInput id="report-class-id" v-model="filters.class_id" label="ID Kelas" />
        <BaseInput id="report-category-id" v-model="filters.category_id" label="ID Kategori" />
      </div>
      <div class="mt-3 flex flex-wrap gap-2">
        <BaseButton @click="loadData">Terapkan</BaseButton>
        <BaseButton variant="outline" @click="resetFilter">Reset</BaseButton>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div class="flex flex-wrap gap-2">
        <button v-for="tab in tabs" :key="tab.key" class="px-3 py-1.5 rounded-md text-sm border" :class="activeTab === tab.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'" @click="setTab(tab.key)">
          {{ tab.label }}
        </button>
      </div>
      <div class="mt-3 flex gap-2">
        <BaseButton variant="outline" @click="previewCurrent" :disabled="activeTab==='summary'">Preview</BaseButton>
        <BaseButton variant="outline" @click="downloadCurrentPdf" :disabled="activeTab==='summary'">Download PDF</BaseButton>
      </div>
    </div>

    <div v-if="activeTab === 'summary'" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-3" v-for="card in summaryCards" :key="card.label">
        <p class="text-xs text-gray-500">{{ card.label }}</p>
        <p class="text-lg font-bold text-gray-800">{{ card.value }}</p>
      </div>
    </div>

    <BaseTable
      :columns="headers.map((h, i) => ({ key: `c${i}`, label: h }))"
      :data="tableData"
      :loading="loading"
      :total="totalItems"
      :currentPage="filters.page"
      :perPage="filters.limit"
      :showActions="false"
      @page-change="onPageChange"
    >
      <template v-for="(h, idx) in headers" :key="`slot-${idx}`" #[`cell-c${idx}`]="{ item }">
        {{ item[`c${idx}`] }}
      </template>
    </BaseTable>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import reportSvc from '@/services/api/studentItemReport.service'
import { useToast } from '@/composables/useToast'

const { error: showError } = useToast()
const loading = ref(false)
const activeTab = ref('summary')
const headers = ref([])
const tableData = ref([])
const totalItems = ref(0)
const summaryCards = ref([])
const filters = ref({ search: '', date_from: '', date_to: '', student_id: '', class_id: '', category_id: '', page: 1, limit: 20 })

const tabs = [
  { key: 'summary', label: 'Ringkasan Statistik' },
  { key: 'active-items', label: 'Barang Aktif' },
  { key: 'daily-loans', label: 'Peminjaman Harian' },
  { key: 'unreturned-items', label: 'Belum Kembali' },
  { key: 'final-returns', label: 'Pengambilan Permanen' },
  { key: 'problem-items', label: 'Barang Bermasalah' },
  { key: 'student-behavior', label: 'Behavior Siswa' },
  { key: 'class-summary', label: 'Rekap Per Kelas' },
  { key: 'student-history', label: 'Histori Siswa' }
]

const endpointByTab = () => ({
  'summary': '/student-item-reports/summary',
  'active-items': '/student-item-reports/active-items',
  'daily-loans': '/student-item-reports/daily-loans',
  'unreturned-items': '/student-item-reports/unreturned-items',
  'final-returns': '/student-item-reports/final-returns',
  'problem-items': '/student-item-reports/problem-items',
  'student-behavior': '/student-item-reports/student-behavior',
  'class-summary': '/student-item-reports/class-summary',
  'student-history': `/student-item-reports/student-history/${filters.value.student_id || 0}`
}[activeTab.value])

const normalizeRows = (rows) => rows.map((r) => {
  const obj = {}
  r.forEach((v, i) => { obj[`c${i}`] = v })
  return obj
})

const mapTable = (data) => {
  const items = data?.items || []
  totalItems.value = data?.totalItems || items.length || 0
  if (activeTab.value === 'active-items') {
    headers.value = ['Kode', 'Siswa', 'NIS', 'Kelas', 'Kategori', 'Barang', 'Status']
    tableData.value = normalizeRows(items.map((x) => [x.code, x.student_name, x.nis, x.class_name, x.category_name, x.item_name, x.current_status])); return
  }
  if (activeTab.value === 'daily-loans') {
    headers.value = ['Tanggal', 'Siswa', 'Barang', 'Pinjam', 'Kembali', 'Status']
    tableData.value = normalizeRows(items.map((x) => [x.loan_date, x.student_name, x.item_name, x.borrowed_at, x.returned_at || '-', x.status])); return
  }
  if (activeTab.value === 'unreturned-items') {
    headers.value = ['Siswa', 'Barang', 'Durasi', 'Deadline', 'Risiko']
    tableData.value = normalizeRows(items.map((x) => [x.student_name, x.item_name, `${x.duration_minutes} menit`, x.return_deadline_time || '-', x.risk_status])); return
  }
  if (activeTab.value === 'final-returns') {
    headers.value = ['Tanggal', 'Kode', 'Siswa', 'Barang', 'Diambil Oleh']
    tableData.value = normalizeRows(items.map((x) => [x.return_date, x.deposit_code, x.student_name, x.item_name, x.returned_to])); return
  }
  if (activeTab.value === 'problem-items') {
    headers.value = ['Kode', 'Siswa', 'Barang', 'Status', 'Catatan']
    tableData.value = normalizeRows(items.map((x) => [x.code, x.student_name, x.item_name, x.current_status, x.notes])); return
  }
  if (activeTab.value === 'student-behavior') {
    headers.value = ['Siswa', 'Kelas', 'Total Pinjam', 'Terlambat', 'Skor', 'Label']
    tableData.value = normalizeRows(items.map((x) => [x.student_name, x.class_name, x.total_loans, x.total_late_returns, x.behavior_score, x.behavior_label])); return
  }
  if (activeTab.value === 'class-summary') {
    headers.value = ['Kelas', 'Siswa Menitipkan', 'Total Barang', 'Sedang Dipinjam', 'Total Pinjam', 'Skor Rata-rata']
    tableData.value = normalizeRows(items.map((x) => [x.class_name, x.total_students_with_items, x.total_items, x.total_borrowed, x.total_loans, x.average_behavior_score])); return
  }
  headers.value = ['Info']
  tableData.value = normalizeRows([['Tidak ada data']])
}

const loadSummary = async () => {
  const res = await reportSvc.summary(filters.value)
  const s = res?.data?.summary || {}
  summaryCards.value = [
    { label: 'Total Barang Aktif', value: s.total_active_items || 0 },
    { label: 'Sedang Dipinjam', value: s.total_borrowed || 0 },
    { label: 'Belum Kembali', value: s.total_active_loans || 0 },
    { label: 'Peminjaman Hari Ini', value: s.total_today_loans || 0 },
    { label: 'Rata-rata Durasi', value: `${s.average_loan_duration_minutes || 0} menit` },
    { label: 'Ketepatan Pengembalian', value: `${s.on_time_return_rate || 0}%` }
  ]
  headers.value = ['Kategori', 'Total']
  const cat = res?.data?.category_summary || []
  tableData.value = normalizeRows(cat.map((x) => [x.category?.name || '-', x.dataValues?.total || x.total || 0]))
  totalItems.value = cat.length
}

const loadData = async () => {
  loading.value = true
  try {
    if (activeTab.value === 'summary') {
      await loadSummary()
      return
    }
    if (activeTab.value === 'student-history' && !filters.value.student_id) {
      headers.value = ['Info']
      tableData.value = normalizeRows([['Isi ID siswa untuk membuka histori']])
      totalItems.value = 1
      return
    }
    let data
    if (activeTab.value === 'active-items') data = (await reportSvc.activeItems(filters.value)).data
    else if (activeTab.value === 'daily-loans') data = (await reportSvc.dailyLoans(filters.value)).data
    else if (activeTab.value === 'unreturned-items') data = (await reportSvc.unreturnedItems(filters.value)).data
    else if (activeTab.value === 'final-returns') data = (await reportSvc.finalReturns(filters.value)).data
    else if (activeTab.value === 'problem-items') data = (await reportSvc.problemItems(filters.value)).data
    else if (activeTab.value === 'student-behavior') data = (await reportSvc.studentBehavior(filters.value)).data
    else if (activeTab.value === 'class-summary') data = (await reportSvc.classSummary(filters.value)).data
    else if (activeTab.value === 'student-history') {
      const res = await reportSvc.studentHistory(filters.value.student_id, filters.value)
      data = { items: res?.data?.loan_history || [], totalItems: (res?.data?.loan_history || []).length }
      headers.value = ['Tanggal', 'Kode', 'Barang', 'Pinjam', 'Kembali', 'Status']
      tableData.value = normalizeRows(data.items.map((x) => [x.loan_date, x.deposit?.code || '-', x.deposit?.item_name || '-', x.borrowed_at, x.returned_at || '-', x.status]))
      totalItems.value = data.totalItems
      return
    }
    mapTable(data || {})
  } catch (e) {
    showError(e?.message || 'Gagal memuat laporan')
  } finally {
    loading.value = false
  }
}

const setTab = async (key) => { activeTab.value = key; filters.value.page = 1; await loadData() }
const resetFilter = async () => { filters.value = { search: '', date_from: '', date_to: '', student_id: '', class_id: '', category_id: '', page: 1, limit: 20 }; await loadData() }
const onPageChange = async (p) => { filters.value.page = p; await loadData() }

const previewCurrent = async () => {
  if (activeTab.value === 'summary') return
  const path = `${endpointByTab()}/preview`
  await reportSvc.openPreview(path, filters.value)
}

const downloadCurrentPdf = async () => {
  if (activeTab.value === 'summary') return
  const path = `${endpointByTab()}/pdf`
  await reportSvc.downloadPdf(path, filters.value, `laporan-${activeTab.value}.pdf`)
}

onMounted(loadData)
</script>
