<template>
  <div class="space-y-6">
    <ReportHeader
      breadcrumbs="Kesiswaan / Penitipan Barang / Laporan"
      title="Laporan Penitipan Barang"
      description="Pilih jenis laporan yang ingin dilihat atau dicetak."
    />

    <ReportSummaryCards :items="quickStats" />

    <div class="bg-white rounded-xl shadow-sm p-4 space-y-3">
      <input v-model="search" class="w-full rounded-md px-3 py-2 text-sm bg-gray-100 focus:bg-white focus:outline-none" placeholder="Cari laporan..." />
      <div class="flex flex-wrap gap-2">
        <button v-for="chip in chips" :key="chip" class="px-3 py-1.5 rounded-full text-xs" :class="activeCategory===chip ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'" @click="activeCategory = chip">
          {{ chip }}
        </button>
      </div>
    </div>

    <div v-if="filteredReports.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <ReportCard
        v-for="r in filteredReports"
        :key="r.route"
        :title="r.title"
        :description="r.description"
        :icon="r.icon"
        :category="r.category"
        :route="r.route"
        :isHighlighted="r.isHighlighted"
      />
    </div>
    <div v-else class="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
      Tidak ada laporan yang cocok dengan pencarian.
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import ReportHeader from '@/components/student-item-reports/ReportHeader.vue'
import ReportCard from '@/components/student-item-reports/ReportCard.vue'
import ReportSummaryCards from '@/components/student-item-reports/ReportSummaryCards.vue'
import reportSvc from '@/services/api/studentItemReport.service'

const search = ref('')
const activeCategory = ref('Semua')
const quickStats = ref([
  { label: 'Barang Aktif', value: 0 },
  { label: 'Sedang Dipinjam', value: 0 },
  { label: 'Belum Kembali', value: 0 },
  { label: 'Peminjaman Hari Ini', value: 0 }
])

const chips = ['Semua', 'Operasional', 'Peminjaman', 'Pengambilan', 'Masalah', 'Statistik & Behavior']
const reports = [
  { title: 'Laporan Barang Aktif', description: 'Menampilkan barang siswa yang masih aktif dititipkan atau sedang dipinjam.', category: 'Operasional', route: '/student-item-deposits/reports/active-items', icon: 'BX', keywords: ['barang', 'aktif', 'titipan', 'dipinjam'] },
  { title: 'Laporan Peminjaman Harian', description: 'Rekap transaksi pinjam-kembali barang berdasarkan tanggal.', category: 'Peminjaman', route: '/student-item-deposits/reports/daily-loans', icon: 'CL', keywords: ['pinjam', 'harian', 'kembali', 'transaksi'] },
  { title: 'Laporan Barang Belum Kembali', description: 'Menampilkan barang yang sedang dipinjam dan belum dikembalikan.', category: 'Peminjaman', route: '/student-item-deposits/reports/unreturned-items', icon: 'AL', keywords: ['belum kembali', 'terlambat', 'dipinjam', 'telat'], isHighlighted: true },
  { title: 'Laporan Pengambilan Permanen', description: 'Rekap barang yang sudah diambil permanen oleh siswa, orang tua, atau wali.', category: 'Pengambilan', route: '/student-item-deposits/reports/final-returns', icon: 'CK', keywords: ['ambil', 'permanen', 'pulang'] },
  { title: 'Laporan Barang Bermasalah', description: 'Daftar barang dengan status hilang atau rusak.', category: 'Masalah', route: '/student-item-deposits/reports/problem-items', icon: 'MS', keywords: ['hilang', 'rusak', 'masalah'] },
  { title: 'Behavior Siswa', description: 'Indikator kedisiplinan siswa dalam meminjam dan mengembalikan barang.', category: 'Statistik & Behavior', route: '/student-item-deposits/reports/student-behavior', icon: 'BH', keywords: ['behavior', 'disiplin', 'skor', 'terlambat', 'telat'], isHighlighted: true },
  { title: 'Rekap Per Kelas', description: 'Statistik penitipan dan peminjaman barang berdasarkan kelas.', category: 'Statistik & Behavior', route: '/student-item-deposits/reports/class-summary', icon: 'KL', keywords: ['kelas', 'rekap', 'statistik'] },
  { title: 'Histori Per Siswa', description: 'Melihat riwayat penitipan, peminjaman, pengembalian, dan pengambilan permanen per siswa.', category: 'Operasional', route: '/student-item-deposits/reports/student-history', icon: 'SW', keywords: ['siswa', 'histori', 'riwayat'] }
]

const filteredReports = computed(() => {
  const q = search.value.trim().toLowerCase()
  return reports.filter((r) => {
    const categoryOk = activeCategory.value === 'Semua' || r.category === activeCategory.value
    const text = `${r.title} ${r.description} ${(r.keywords || []).join(' ')}`.toLowerCase()
    const searchOk = !q || text.includes(q)
    return categoryOk && searchOk
  })
})

onMounted(async () => {
  try {
    const res = await reportSvc.summary()
    const s = res?.data?.summary || {}
    quickStats.value = [
      { label: 'Barang Aktif', value: s.total_active_items || 0 },
      { label: 'Sedang Dipinjam', value: s.total_borrowed || 0 },
      { label: 'Belum Kembali', value: s.total_active_loans || 0 },
      { label: 'Peminjaman Hari Ini', value: s.total_today_loans || 0 }
    ]
  } catch (e) {}
})
</script>
