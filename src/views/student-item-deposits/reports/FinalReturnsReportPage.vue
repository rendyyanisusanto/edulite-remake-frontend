<template>
  <ReportDetailPage
    title="Laporan Pengambilan Permanen"
    description="Rekap barang yang sudah diambil permanen oleh siswa/orang tua/wali."
    type="final-returns"
    :columns="columns"
  />
</template>
<script setup>
import ReportDetailPage from './ReportDetailPage.vue'
const columns = [
  { key: 'return_date', label: 'Tanggal Ambil' }, { key: 'deposit_code', label: 'Kode' }, { key: 'student_name', label: 'Nama Siswa' },
  { key: 'class_name', label: 'Kelas' }, { key: 'item_name', label: 'Barang' }, { key: 'returned_to', label: 'Diambil Oleh' },
  { key: 'returned_to_type', label: 'Tipe' }, { key: 'handed_by_name', label: 'Petugas' }
]
</script>
