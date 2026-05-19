<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Preview Bukti Penitipan</h1>
        <p class="text-sm text-gray-500">Pilih metode cetak: Web atau PDF</p>
      </div>
      <div class="flex gap-2">
        <button class="px-3 py-2 border rounded text-sm" @click="goBack">Kembali</button>
        <button class="px-3 py-2 border rounded text-sm" @click="printWeb" :disabled="!previewData">Cetak Web</button>
        <button class="px-3 py-2 border rounded bg-black text-white text-sm" @click="printPdf" :disabled="!pdfUrl">Cetak PDF</button>
      </div>
    </div>

    <div class="bg-white border rounded-xl p-8" id="web-print-area" v-if="previewData">
      <div class="text-center border-b pb-4">
        <h2 class="text-lg font-bold">{{ previewData.school_profile?.school_name || 'SEKOLAH' }}</h2>
        <p class="text-sm">{{ previewData.school_profile?.address || '-' }}</p>
        <h3 class="mt-4 text-base font-bold">BUKTI PENITIPAN BARANG SISWA</h3>
      </div>

      <div class="mt-5 text-sm">
        <table class="w-full">
          <tbody>
            <tr><td class="py-1 w-56">Kode Titipan</td><td>: {{ d.code || '-' }}</td></tr>
            <tr><td class="py-1">Tanggal Titip</td><td>: {{ formatDateTime(d.deposit_date) }}</td></tr>
            <tr><td class="py-1">Nama Siswa</td><td>: {{ d.student?.full_name || '-' }}</td></tr>
            <tr><td class="py-1">NIS / NISN</td><td>: {{ d.student?.nis || '-' }} / {{ d.student?.nisn || '-' }}</td></tr>
            <tr><td class="py-1">Kelas</td><td>: {{ d.class?.name || '-' }}</td></tr>
            <tr><td class="py-1">Kategori Barang</td><td>: {{ d.category?.name || '-' }}</td></tr>
            <tr><td class="py-1">Nama Barang</td><td>: {{ d.item_name || '-' }}</td></tr>
            <tr><td class="py-1">Merk / Model</td><td>: {{ d.brand || '-' }} / {{ d.model || '-' }}</td></tr>
            <tr><td class="py-1">Warna</td><td>: {{ d.color || '-' }}</td></tr>
            <tr><td class="py-1">Serial Number / IMEI</td><td>: {{ d.serial_number || '-' }} / {{ d.imei || '-' }}</td></tr>
            <tr><td class="py-1">Kondisi Saat Dititipkan</td><td>: {{ d.condition_in || '-' }}</td></tr>
            <tr><td class="py-1">Kelengkapan</td><td>: {{ d.accessories || '-' }}</td></tr>
            <tr><td class="py-1">Lokasi Penyimpanan</td><td>: {{ d.storage_location || '-' }}</td></tr>
            <tr><td class="py-1">Petugas Penerima</td><td>: {{ d.receivedBy?.name || '-' }}</td></tr>
            <tr><td class="py-1 align-top">Catatan</td><td>: {{ d.notes || '-' }}</td></tr>
          </tbody>
        </table>
      </div>

      <div class="mt-16 grid grid-cols-2 gap-10 text-sm">
        <div class="text-center">
          <p>Siswa</p>
          <div class="h-20"></div>
          <p class="font-semibold">{{ d.student?.full_name || '(........................)' }}</p>
        </div>
        <div class="text-center">
          <p>Petugas</p>
          <div class="h-20"></div>
          <p class="font-semibold">{{ d.receivedBy?.name || '(........................)' }}</p>
        </div>
      </div>
    </div>

    <div v-else class="bg-white border rounded-xl p-8 text-sm text-gray-500">Memuat preview...</div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import svc from '@/services/api/studentItemDeposit.service'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const { error: showError } = useToast()

const previewData = ref(null)
const pdfUrl = ref('')
const d = computed(() => previewData.value?.deposit || {})

const loadData = async () => {
  try {
    const previewRes = await svc.printPreview(route.params.id)
    previewData.value = previewRes?.data || null

    const pdfBlob = await svc.print(route.params.id)
    pdfUrl.value = URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }))
  } catch (e) {
    showError(e.message || 'Gagal memuat data cetak')
  }
}

const printWeb = () => {
  window.print()
}

const printPdf = () => {
  if (!pdfUrl.value) return
  const w = window.open(pdfUrl.value, '_blank')
  if (!w) return
  setTimeout(() => w.print(), 500)
}

const goBack = () => router.back()

const formatDateTime = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(loadData)

onBeforeUnmount(() => {
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
})
</script>

<style scoped>
@media print {
  body * { visibility: hidden; }
  #web-print-area, #web-print-area * { visibility: visible; }
  #web-print-area { position: absolute; left: 0; top: 0; width: 100%; }
}
</style>
