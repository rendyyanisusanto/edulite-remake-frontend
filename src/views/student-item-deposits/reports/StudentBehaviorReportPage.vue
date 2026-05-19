<template>
  <ReportDetailPage
    title="Indikator Kedisiplinan Pengembalian Barang"
    description="Indikator kedisiplinan siswa dalam meminjam dan mengembalikan barang."
    type="student-behavior"
    :columns="columns"
  />
</template>
<script setup>
import ReportDetailPage from './ReportDetailPage.vue'
const columns = [
  { key: 'student_name', label: 'Nama Siswa' }, { key: 'nis', label: 'NIS' }, { key: 'class_name', label: 'Kelas' },
  { key: 'total_loans', label: 'Total Pinjam' }, { key: 'total_late_returns', label: 'Terlambat' }, { key: 'total_unreturned', label: 'Belum Kembali' },
  { key: 'behavior_score', label: 'Skor' }, { key: 'behavior_label', label: 'Label' }
]
</script>
