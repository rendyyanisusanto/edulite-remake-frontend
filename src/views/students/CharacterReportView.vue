<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <BaseButton variant="outline" @click="goBack" class="p-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg></BaseButton>
        <h1 class="text-2xl font-bold text-gray-800">Rapor Karakter Siswa</h1>
      </div>
      <BaseButton @click="openExportModal" :loading="exporting">
        <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
        Export PDF
      </BaseButton>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="animate-pulse space-y-6">
      <div class="h-48 bg-gray-200 rounded-xl"></div>
      <div class="h-32 bg-gray-200 rounded-xl"></div>
      <div class="h-64 bg-gray-200 rounded-xl"></div>
    </div>

    <template v-else-if="reportData">
      <!-- Identitas Siswa -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start">
        <div class="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
          <img v-if="reportData.student.photo" :src="getImageUrl(reportData.student.photo)" class="w-full h-full object-cover" alt="Foto Siswa">
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>
          </div>
        </div>
        <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
          <div>
            <p class="text-sm text-gray-500">Nama Lengkap</p>
            <p class="font-semibold text-gray-900 text-lg">{{ reportData.student.name }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">NIS</p>
            <p class="font-semibold text-gray-900 text-lg">{{ reportData.student.nis || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Kelas Saat Ini</p>
            <p class="font-medium text-gray-800">{{ reportData.student.class_name || '-' }}</p>
          </div>
        </div>
      </div>

      <!-- Ringkasan Poin -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div class="bg-green-50 rounded-xl p-5 border border-green-100 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-green-800 font-semibold text-sm">Prestasi</h3>
            <span class="bg-green-200 text-green-800 text-[10px] font-bold px-2 py-1 rounded-full">{{ reportData.summary.total_achievements }} Data</span>
          </div>
          <p class="text-2xl font-bold text-green-600">+{{ reportData.summary.total_achievement_points }}</p>
          <p class="text-[10px] text-green-700 mt-1">Total Poin Prestasi</p>
        </div>

        <div class="bg-teal-50 rounded-xl p-5 border border-teal-100 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-teal-800 font-semibold text-sm">Catatan Positif</h3>
            <span class="bg-teal-200 text-teal-800 text-[10px] font-bold px-2 py-1 rounded-full">{{ reportData.summary.total_positive_notes }} Data</span>
          </div>
          <p class="text-2xl font-bold text-teal-600">+{{ reportData.summary.total_positive_points }}</p>
          <p class="text-[10px] text-teal-700 mt-1">Total Poin Positif</p>
        </div>
        
        <div class="bg-red-50 rounded-xl p-5 border border-red-100 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-red-800 font-semibold text-sm">Pelanggaran</h3>
            <span class="bg-red-200 text-red-800 text-[10px] font-bold px-2 py-1 rounded-full">{{ reportData.summary.total_violations }} Kasus</span>
          </div>
          <p class="text-2xl font-bold text-red-600">-{{ reportData.summary.total_violation_points }}</p>
          <p class="text-[10px] text-red-700 mt-1">Total Poin Pelanggaran</p>
        </div>

        <div class="bg-blue-50 rounded-xl p-5 border border-blue-100 shadow-sm relative overflow-hidden">
          <div class="absolute -right-4 -bottom-4 opacity-10">
            <svg class="w-24 h-24 text-blue-800" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
          </div>
          <h3 class="text-blue-800 font-semibold mb-2 text-sm">Nilai Karakter</h3>
          <p class="text-2xl font-extrabold text-blue-700">{{ reportData.summary.final_score }}</p>
          <p class="text-[10px] text-blue-700 mt-1">Total Akhir</p>
        </div>
      </div>

      <!-- Detail Tables (Full Width Stacked) -->
      <div class="space-y-6">
        
        <!-- Tabel Catatan Positif -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div class="bg-teal-50 px-4 py-3 border-b border-teal-100 flex justify-between items-center">
            <h3 class="font-semibold text-teal-800">Daftar Catatan Positif</h3>
            <span class="text-xs text-teal-600">{{ reportData.positiveNotes.length }} catatan</span>
          </div>
          <div class="p-0 overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl</th>
                  <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
                  <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th scope="col" class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Poin</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr v-for="item in reportData.positiveNotes" :key="item.id" class="hover:bg-gray-50">
                  <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{{ item.date ? new Date(item.date).toLocaleDateString('id-ID') : '-' }}</td>
                  <td class="px-3 py-2 text-sm text-gray-900">
                    <div class="font-medium">{{ item.type }}</div>
                    <div class="text-xs text-gray-500 mt-0.5 line-clamp-2" v-if="item.description">{{ item.description }}</div>
                  </td>
                  <td class="px-3 py-2 text-sm text-gray-600">{{ item.category || '-' }}</td>
                  <td class="px-3 py-2 whitespace-nowrap text-sm font-semibold text-teal-600 text-right">+{{ item.points }}</td>
                </tr>
                <tr v-if="reportData.positiveNotes.length === 0">
                  <td colspan="4" class="px-4 py-8 text-center text-sm text-gray-500 italic">Belum ada catatan positif</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabel Prestasi -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div class="bg-green-50 px-4 py-3 border-b border-green-100 flex justify-between items-center">
            <h3 class="font-semibold text-green-800">Daftar Prestasi</h3>
            <span class="text-xs text-green-600">{{ reportData.achievements.length }} riwayat</span>
          </div>
          <div class="p-0 overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl</th>
                  <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama / Judul Acara</th>
                  <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Juara</th>
                  <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tingkat</th>
                  <th scope="col" class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Poin</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr v-for="item in reportData.achievements" :key="item.id" class="hover:bg-gray-50">
                  <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{{ item.date ? new Date(item.date).toLocaleDateString('id-ID') : '-' }}</td>
                  <td class="px-3 py-2 text-sm text-gray-900">
                    <div class="font-medium">{{ item.title }}</div>
                    <div class="text-xs text-gray-500 mt-0.5" v-if="item.location || item.organizer">{{ item.organizer || item.location }}</div>
                  </td>
                  <td class="px-3 py-2 text-sm text-gray-600 font-medium">{{ item.rank || '-' }}</td>
                  <td class="px-3 py-2 text-sm text-gray-600">{{ item.level }}</td>
                  <td class="px-3 py-2 whitespace-nowrap text-sm font-semibold text-green-600 text-right">+{{ item.points }}</td>
                </tr>
                <tr v-if="reportData.achievements.length === 0">
                  <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-500 italic">Belum ada data prestasi</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabel Pelanggaran -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div class="bg-red-50 px-4 py-3 border-b border-red-100 flex justify-between items-center">
            <h3 class="font-semibold text-red-800">Daftar Pelanggaran</h3>
            <span class="text-xs text-red-600">{{ reportData.violations.length }} kasus</span>
          </div>
          <div class="p-0 overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl</th>
                  <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Pelanggaran</th>
                  <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th scope="col" class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Poin</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr v-for="item in reportData.violations" :key="item.id" class="hover:bg-gray-50">
                  <td class="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{{ item.date ? new Date(item.date).toLocaleDateString('id-ID') : '-' }}</td>
                  <td class="px-3 py-2 text-sm text-gray-900 line-clamp-2">{{ item.type }}</td>
                  <td class="px-3 py-2 text-sm text-gray-600">{{ item.level }}</td>
                  <td class="px-3 py-2 whitespace-nowrap text-sm font-semibold text-red-600 text-right">-{{ item.points }}</td>
                </tr>
                <tr v-if="reportData.violations.length === 0">
                  <td colspan="4" class="px-4 py-8 text-center text-sm text-gray-500 italic">Tidak ada catatan pelanggaran</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
    
    <div v-else class="text-center py-12 text-gray-500">
      Gagal memuat data rapor karakteristik.
    </div>

    <!-- Export Setup Modal -->
    <BaseModal v-model="showExportModal" title="Pengaturan Ekspor PDF" maxWidth="md">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Catatan Pembinaan (Opsional)</label>
          <textarea v-model="exportNotes" rows="4" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" placeholder="Masukkan catatan khusus untuk rapor siswa ini. Biarkan kosong jika ingin menulis tangan secara manual."></textarea>
          <p class="mt-1 text-xs text-gray-500">Catatan ini akan langsung tercetak di dalam dokumen PDF.</p>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showExportModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="exportPdf" :loading="exporting">
          <svg class="h-4 w-4 mr-2" inline-block fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Proses Export
        </BaseButton>
      </template>
    </BaseModal>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import studentService from '@/services/api/student.service'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const { error: showError } = useToast()

const studentId = route.params.id
const loading = ref(true)
const exporting = ref(false)
const reportData = ref(null)

const showExportModal = ref(false)
const exportNotes = ref('')

const openExportModal = () => {
    exportNotes.value = ''
    showExportModal.value = true
}

const getImageUrl = (filename) => {
    return filename ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${filename}` : ''
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await studentService.getCharacterReport(studentId)
    if (res.success) {
      reportData.value = res.data
    } else {
      showError('Gagal memuat data rapor.')
    }
  } catch (err) {
    showError(err.response?.data?.message || 'Gagal tersambung ke server.')
  } finally {
    loading.value = false
  }
}

const exportPdf = async () => {
    exporting.value = true
    try {
        const response = await studentService.downloadCharacterReportPdf(studentId, exportNotes.value)
        
        // Handle Blob download directly because api.js already returns response.data
        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')
        link.href = url
        const studentName = reportData.value?.student?.name || studentId
        link.setAttribute('download', `Rapor Karakter Siswa - ${studentName}.pdf`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        showExportModal.value = false
        
    } catch (err) {
        showError('Gagal mengunduh dokumen PDF')
    } finally {
        exporting.value = false
    }
}

const goBack = () => {
    router.push('/students')
}

onMounted(() => {
    if (studentId) fetchData()
})
</script>
