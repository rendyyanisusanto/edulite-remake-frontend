<template>
  <ReportDetailPage
    title="Rekap Per Kelas"
    description="Statistik penitipan dan peminjaman barang berdasarkan kelas."
    type="class-summary"
    :columns="columns"
  />
</template>
<script setup>
import ReportDetailPage from './ReportDetailPage.vue'
const columns = [
  { key: 'class_name', label: 'Kelas' }, { key: 'total_students_with_items', label: 'Siswa Menitipkan' },
  { key: 'total_items', label: 'Total Barang' }, { key: 'total_borrowed', label: 'Sedang Dipinjam' },
  { key: 'total_loans', label: 'Total Peminjaman' }, { key: 'total_late_returns', label: 'Terlambat' },
  { key: 'total_lost', label: 'Hilang' }, { key: 'total_damaged', label: 'Rusak' }, { key: 'average_behavior_score', label: 'Rata-rata Skor' }
]
</script>
