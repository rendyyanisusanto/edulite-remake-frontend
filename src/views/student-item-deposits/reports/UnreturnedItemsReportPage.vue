<template>
  <ReportDetailPage
    title="Laporan Barang Belum Kembali"
    description="Menampilkan barang yang sedang dipinjam dan belum dikembalikan."
    type="unreturned-items"
    :columns="columns"
  />
</template>
<script setup>
import ReportDetailPage from './ReportDetailPage.vue'
const columns = [
  { key: 'student_name', label: 'Nama Siswa' }, { key: 'nis', label: 'NIS' }, { key: 'class_name', label: 'Kelas' },
  { key: 'item_name', label: 'Barang' }, { key: 'category_name', label: 'Kategori' }, { key: 'borrowed_at', label: 'Jam Pinjam' },
  { key: 'duration_minutes', label: 'Durasi (menit)' }, { key: 'risk_status', label: 'Status Risiko' }
]
</script>
