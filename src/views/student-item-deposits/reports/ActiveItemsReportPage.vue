<template>
  <ReportDetailPage
    title="Laporan Barang Aktif"
    description="Menampilkan barang yang masih dititipkan atau sedang dipinjam oleh siswa."
    type="active-items"
    :columns="columns"
  />
</template>
<script setup>
import ReportDetailPage from './ReportDetailPage.vue'
const columns = [
  { key: 'code', label: 'Kode' }, { key: 'student_name', label: 'Nama Siswa' }, { key: 'nis', label: 'NIS' },
  { key: 'class_name', label: 'Kelas' }, { key: 'category_name', label: 'Kategori' }, { key: 'item_name', label: 'Nama Barang' },
  { key: 'deposit_date', label: 'Tanggal Titip' }, { key: 'current_status', label: 'Status' }, { key: 'storage_location', label: 'Lokasi' }
]
</script>
