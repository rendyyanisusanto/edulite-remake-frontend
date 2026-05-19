<template>
  <div class="space-y-6">
    <ReportHeader :breadcrumbs="'Kesiswaan / Penitipan Barang / Laporan'" :title="title" :description="description" />

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input v-model="filters.search" class="w-full rounded-md px-3 py-2 text-sm bg-gray-100 focus:bg-white focus:outline-none" placeholder="Cari..." @keyup.enter="load" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Dari</label>
          <input v-model="filters.date_from" type="date" class="w-full rounded-md px-3 py-2 text-sm bg-gray-100 focus:bg-white focus:outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Sampai</label>
          <input v-model="filters.date_to" type="date" class="w-full rounded-md px-3 py-2 text-sm bg-gray-100 focus:bg-white focus:outline-none" />
        </div>
        <div v-if="withStudentFilter">
          <label class="block text-sm font-medium text-gray-700 mb-1">ID Siswa</label>
          <input v-model="filters.student_id" class="w-full rounded-md px-3 py-2 text-sm bg-gray-100 focus:bg-white focus:outline-none" />
        </div>
      </div>
      <div class="mt-3">
        <ReportActions @apply="load" @reset="reset" @preview="preview" @pdf="pdf" />
      </div>
    </div>

    <BaseTable
      :columns="columns"
      :data="dataRows"
      :loading="loading"
      :total="totalItems"
      :currentPage="filters.page"
      :perPage="filters.limit"
      :showActions="false"
      @page-change="onPageChange"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import ReportHeader from '@/components/student-item-reports/ReportHeader.vue'
import ReportActions from '@/components/student-item-reports/ReportActions.vue'
import reportSvc from '@/services/api/studentItemReport.service'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  title: String,
  description: String,
  type: String,
  columns: Array,
  withStudentFilter: { type: Boolean, default: false }
})

const { error: showError } = useToast()
const loading = ref(false)
const filters = ref({ search: '', date_from: '', date_to: '', student_id: '', page: 1, limit: 20 })
const dataRows = ref([])
const totalItems = ref(0)

const endpoint = () => {
  if (props.type === 'student-history') return `/student-item-reports/student-history/${filters.value.student_id || 0}`
  return `/student-item-reports/${props.type}`
}

const load = async () => {
  loading.value = true
  try {
    if (props.type === 'student-history' && !filters.value.student_id) {
      dataRows.value = []
      totalItems.value = 0
      return
    }
    const methodMap = {
      'active-items': reportSvc.activeItems,
      'daily-loans': reportSvc.dailyLoans,
      'unreturned-items': reportSvc.unreturnedItems,
      'final-returns': reportSvc.finalReturns,
      'problem-items': reportSvc.problemItems,
      'student-behavior': reportSvc.studentBehavior,
      'class-summary': reportSvc.classSummary
    }
    if (props.type === 'student-history') {
      const res = await reportSvc.studentHistory(filters.value.student_id, filters.value)
      const loans = res?.data?.loan_history || []
      dataRows.value = loans.map((x) => ({
        loan_date: x.loan_date,
        code: x.deposit?.code || '-',
        item_name: x.deposit?.item_name || '-',
        borrowed_at: x.borrowed_at || '-',
        returned_at: x.returned_at || '-',
        status: x.status || '-'
      }))
      totalItems.value = dataRows.value.length
    } else {
      const res = await methodMap[props.type](filters.value)
      dataRows.value = res?.data?.items || []
      totalItems.value = res?.data?.totalItems || 0
    }
  } catch (e) {
    showError(e?.message || 'Gagal memuat laporan')
  } finally {
    loading.value = false
  }
}

const reset = async () => { filters.value = { search: '', date_from: '', date_to: '', student_id: '', page: 1, limit: 20 }; await load() }
const onPageChange = async (p) => { filters.value.page = p; await load() }
const preview = async () => { if (props.type === 'student-history' && !filters.value.student_id) return; await reportSvc.openPreview(`${endpoint()}/preview`, filters.value) }
const pdf = async () => { if (props.type === 'student-history' && !filters.value.student_id) return; await reportSvc.downloadPdf(`${endpoint()}/pdf`, filters.value, `laporan-${props.type}.pdf`) }

onMounted(load)
</script>
