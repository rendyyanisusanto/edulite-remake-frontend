<template>
  <ReportDetailPage
    title="Laporan Peminjaman Harian"
    description="Rekap transaksi pinjam-kembali barang berdasarkan tanggal."
    type="daily-loans"
    :columns="columns"
  />
</template>
<script setup>
import ReportDetailPage from './ReportDetailPage.vue'
const columns = [
  { key: 'loan_date', label: 'Tanggal' }, { key: 'student_name', label: 'Nama Siswa' }, { key: 'class_name', label: 'Kelas' },
  { key: 'deposit_code', label: 'Kode' }, { key: 'item_name', label: 'Barang' }, { key: 'borrowed_at', label: 'Jam Pinjam' },
  { key: 'returned_at', label: 'Jam Kembali' }, { key: 'duration_minutes', label: 'Durasi (menit)' }, { key: 'status', label: 'Status' }
]
</script>
