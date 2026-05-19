<template>
  <ReportDetailPage
    title="Histori Per Siswa"
    description="Melihat riwayat penitipan, peminjaman, pengembalian, dan pengambilan permanen per siswa."
    type="student-history"
    :columns="columns"
    :with-student-filter="true"
  />
</template>
<script setup>
import ReportDetailPage from './ReportDetailPage.vue'
const columns = [
  { key: 'loan_date', label: 'Tanggal' }, { key: 'code', label: 'Kode' }, { key: 'item_name', label: 'Barang' },
  { key: 'borrowed_at', label: 'Jam Pinjam' }, { key: 'returned_at', label: 'Jam Kembali' }, { key: 'status', label: 'Status' }
]
</script>
