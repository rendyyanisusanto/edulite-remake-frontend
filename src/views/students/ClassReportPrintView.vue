<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Laporan Siswa Per Kelas</h1>
        <p class="text-sm text-gray-500">Pilih metode cetak: Web atau PDF</p>
      </div>
      <div class="flex gap-2">
        <button class="px-3 py-2 border rounded text-sm" @click="goBack">Kembali</button>
        <button class="px-3 py-2 border rounded text-sm" @click="printWeb" :disabled="!htmlContent">Cetak Web</button>
        <button class="px-3 py-2 border rounded bg-black text-white text-sm" @click="printPdf" :disabled="!pdfUrl">Download PDF</button>
      </div>
    </div>

    <div v-if="loading" class="bg-white border rounded-xl p-8 text-center text-sm text-gray-500">
      Memuat data laporan...
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-sm text-red-600">
      {{ error }}
    </div>

    <div v-else-if="htmlContent" class="bg-white border rounded-xl overflow-hidden">
      <iframe
        v-if="htmlContent"
        :srcdoc="htmlContent"
        class="w-full h-[80vh] border-0"
        title="Preview Laporan"
      ></iframe>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import classReportService from '@/services/api/classReport.service'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const { error: showError } = useToast()

const loading = ref(true)
const error = ref('')
const htmlContent = ref('')
const pdfUrl = ref('')

const loadData = async () => {
  try {
    loading.value = true
    error.value = ''

    const classId = route.params.classId
    const academicYearId = route.query.academic_year_id

    if (!academicYearId) {
      throw new Error('Parameter academic_year_id wajib diisi')
    }

    // Get preview HTML
    const previewRes = await classReportService.printPreview(classId, academicYearId)
    htmlContent.value = previewRes?.data || ''

    // Get PDF blob
    const pdfBlob = await classReportService.printPdf(classId, academicYearId)
    pdfUrl.value = URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }))

  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Gagal memuat data laporan'
    showError(error.value)
  } finally {
    loading.value = false
  }
}

const printWeb = () => {
  if (!htmlContent.value) return
  const printWindow = window.open('', '_blank')
  printWindow.document.write(htmlContent.value)
  printWindow.document.close()
  setTimeout(() => printWindow.print(), 500)
}

const printPdf = () => {
  if (!pdfUrl.value) return
  const printWindow = window.open(pdfUrl.value, '_blank')
  if (!printWindow) return
  setTimeout(() => printWindow.print(), 500)
}

const goBack = () => router.back()

onMounted(loadData)

onBeforeUnmount(() => {
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
})
</script>
