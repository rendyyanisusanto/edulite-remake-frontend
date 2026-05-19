<template>
  <ReportDetailPage
    title="Laporan Barang Bermasalah"
    description="Daftar barang dengan status hilang atau rusak."
    type="problem-items"
    :columns="columns"
  />
</template>
<script setup>
import ReportDetailPage from './ReportDetailPage.vue'
const columns = [
  { key: 'code', label: 'Kode' }, { key: 'student_name', label: 'Nama Siswa' }, { key: 'class_name', label: 'Kelas' },
  { key: 'category_name', label: 'Kategori' }, { key: 'item_name', label: 'Barang' }, { key: 'current_status', label: 'Status' }, { key: 'notes', label: 'Catatan' }
]
</script>
