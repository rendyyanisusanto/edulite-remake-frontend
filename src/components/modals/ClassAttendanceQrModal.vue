<template>
  <BaseModal :modelValue="modelValue" @update:modelValue="handleClose" title="QR Code Presensi Kelas" maxWidth="2xl">
    <div class="space-y-5">
      <!-- Class Metadata Card -->
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p class="text-base font-bold text-gray-900">{{ qrData?.class_name || classItem?.name || '-' }}</p>
          <p class="text-xs text-gray-500 mt-0.5">
            Tingkat: {{ qrData?.grade?.name || classItem?.grade?.name || '-' }}
            <span v-if="qrData?.department?.name || classItem?.department?.name">
              &bull; Jurusan: {{ qrData?.department?.name || classItem?.department?.name }}
            </span>
          </p>
        </div>
        <div>
          <span
            v-if="!qrData?.is_configured"
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600"
          >
            Belum dibuat
          </span>
          <span
            v-else-if="qrData.is_active"
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"
          >
            Aktif
          </span>
          <span
            v-else
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"
          >
            Nonaktif
          </span>
        </div>
      </div>

      <!-- Helper text -->
      <div class="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2.5">
        <svg class="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-xs sm:text-sm text-blue-800 leading-relaxed">
          Tempel QR Code ini di ruang kelas. Guru dapat melakukan scan menggunakan kamera HP untuk membuka halaman presensi jam pelajaran.
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="py-10 flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!qrData?.is_configured" class="py-8 text-center border-2 border-dashed border-gray-200 rounded-xl space-y-4">
        <div class="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
          <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-800">QR Code Presensi Belum Tersedia</p>
          <p class="text-xs text-gray-500 mt-1">Buat QR Code unik untuk kelas ini agar guru dapat melakukan presensi per jam pelajaran.</p>
        </div>
        <div v-if="canManage">
          <BaseButton @click="handleGenerate" :loading="submitting" :disabled="submitting">
            Generate QR Code
          </BaseButton>
        </div>
      </div>

      <!-- QR Available State -->
      <div v-else class="space-y-5">
        <div class="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl p-6">
          <div class="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
            <QrcodeVue
              :value="qrData.qr_url"
              :size="220"
              level="M"
              :margin="4"
              background="#ffffff"
              foreground="#000000"
            />
          </div>
          <p v-if="!qrData.is_active" class="mt-3 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
            QR Code sedang dinonaktifkan dan tidak dapat dipakai untuk scan publik.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center justify-center gap-2.5">
          <BaseButton variant="outline" size="sm" @click="copyLink" :disabled="submitting">
            {{ copied ? 'Link Tersalin!' : 'Salin Link' }}
          </BaseButton>
          <BaseButton variant="outline" size="sm" @click="downloadPng" :loading="downloading" :disabled="submitting || downloading">
            Download PNG
          </BaseButton>
          <BaseButton variant="outline" size="sm" @click="printPoster" :disabled="submitting">
            Cetak QR Code
          </BaseButton>
          <template v-if="canManage">
            <BaseButton
              :variant="qrData.is_active ? 'outline' : 'primary'"
              size="sm"
              @click="handleToggleStatus"
              :loading="submitting"
              :disabled="submitting"
            >
              {{ qrData.is_active ? 'Nonaktifkan' : 'Aktifkan' }}
            </BaseButton>
            <BaseButton
              variant="danger"
              size="sm"
              @click="showRegenerateConfirm = true"
              :disabled="submitting"
            >
              Generate Ulang
            </BaseButton>
          </template>
        </div>

        <!-- Regenerate Confirmation -->
        <div v-if="showRegenerateConfirm" class="border border-red-200 bg-red-50 rounded-lg p-4 space-y-3">
          <p class="text-sm font-semibold text-red-900">Konfirmasi Generate Ulang QR Code</p>
          <p class="text-sm text-red-800">
            Generate ulang QR Code akan membuat QR Code sebelumnya tidak berlaku. QR yang sudah ditempel di kelas harus diganti dengan QR Code baru.
          </p>
          <div class="flex justify-end gap-2">
            <BaseButton variant="outline" size="sm" @click="showRegenerateConfirm = false" :disabled="submitting">Batal</BaseButton>
            <BaseButton variant="danger" size="sm" @click="handleRegenerate" :loading="submitting" :disabled="submitting">
              Ya, Generate Ulang
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="outline" @click="handleClose">Tutup</BaseButton>
    </template>
  </BaseModal>

  <!-- Printable A4 Portrait Classroom QR Poster -->
  <Teleport to="body">
    <div v-if="modelValue && qrData?.is_configured" class="lesson-qr-print-sheet hidden print:flex flex-col justify-between bg-white text-black p-10 min-h-screen">
      <!-- Header: School Identity -->
      <div class="flex flex-col items-center text-center border-b-2 border-black pb-6">
        <img
          v-if="schoolProfile?.logo"
          :src="schoolProfile.logo"
          alt="Logo Sekolah"
          class="h-16 w-16 object-contain mb-3 grayscale"
        />
        <p class="text-lg font-bold uppercase tracking-wide">
          {{ schoolProfile?.name || 'SEKOLAH' }}
        </p>
        <h1 class="text-3xl font-extrabold uppercase tracking-wider mt-3">
          PRESENSI JAM PELAJARAN
        </h1>
      </div>

      <!-- Center: Class Name & QR Code -->
      <div class="flex flex-col items-center text-center my-8 space-y-6">
        <div class="border-2 border-black px-8 py-3 rounded-lg">
          <p class="text-xs uppercase tracking-widest font-semibold">KELAS</p>
          <p class="text-4xl font-extrabold mt-1">{{ qrData.class_name }}</p>
        </div>

        <div class="p-4 border-2 border-black bg-white">
          <QrcodeVue
            :value="qrData.qr_url"
            :size="300"
            level="M"
            :margin="4"
            background="#ffffff"
            foreground="#000000"
          />
        </div>
      </div>

      <!-- Instructions -->
      <div class="border border-black rounded-lg p-5 max-w-lg mx-auto w-full">
        <p class="text-sm font-bold uppercase tracking-wide mb-2">Petunjuk Penggunaan:</p>
        <ol class="list-decimal list-inside text-sm space-y-1.5">
          <li>Scan QR Code menggunakan kamera HP.</li>
          <li>Pilih nama guru dan masukkan PIN.</li>
          <li>Pilih mata pelajaran dan jam pelajaran.</li>
          <li>Isi dan simpan presensi siswa.</li>
        </ol>
      </div>

      <!-- Footer -->
      <div class="text-center border-t border-black pt-4 mt-8 text-xs font-medium">
        Edulite &bull; Sistem Informasi Manajemen Sekolah
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import QrcodeVue from 'qrcode.vue'
import QRCode from 'qrcode'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import lessonAttendanceService from '@/services/api/lessonAttendance.service'
import publicApi from '@/services/publicApi'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  classItem: { type: Object, default: null },
  canManage: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'updated'])

const { success, error: showError } = useToast()

const loading = ref(false)
const submitting = ref(false)
const downloading = ref(false)
const qrData = ref(null)
const schoolProfile = ref(null)
const copied = ref(false)
const showRegenerateConfirm = ref(false)

const handleClose = () => {
  showRegenerateConfirm.value = false
  copied.value = false
  emit('update:modelValue', false)
}

const loadQrData = async () => {
  if (!props.classItem?.id) return
  loading.value = true
  try {
    const [qrRes, profileRes] = await Promise.allSettled([
      lessonAttendanceService.getClassAttendanceQr(props.classItem.id),
      publicApi.get('/settings/school-profile/public')
    ])
    if (qrRes.status === 'fulfilled' && qrRes.value?.success) {
      qrData.value = qrRes.value.data
    }
    if (profileRes.status === 'fulfilled' && profileRes.value?.success) {
      schoolProfile.value = profileRes.value.data
    }
  } catch (err) {
    showError(err?.message || 'Gagal memuat data QR presensi kelas.')
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.modelValue, props.classItem?.id],
  ([isOpen]) => {
    if (isOpen && props.classItem?.id) {
      showRegenerateConfirm.value = false
      copied.value = false
      loadQrData()
    }
  }
)

const emitStatusUpdate = () => {
  if (!qrData.value || !props.classItem?.id) return
  emit('updated', {
    classId: props.classItem.id,
    attendance_qr_configured: Boolean(qrData.value.is_configured),
    attendance_qr_active: Boolean(qrData.value.is_active)
  })
}

const handleGenerate = async () => {
  if (!props.classItem?.id || submitting.value) return
  submitting.value = true
  try {
    const res = await lessonAttendanceService.generateClassAttendanceQr(props.classItem.id)
    if (res.success) {
      qrData.value = res.data
      success('QR Code presensi kelas berhasil dibuat.')
      emitStatusUpdate()
    }
  } catch (err) {
    showError(err?.message || 'Gagal membuat QR Code kelas.')
  } finally {
    submitting.value = false
  }
}

const handleRegenerate = async () => {
  if (!props.classItem?.id || submitting.value) return
  submitting.value = true
  try {
    const res = await lessonAttendanceService.regenerateClassAttendanceQr(props.classItem.id)
    if (res.success) {
      qrData.value = res.data
      showRegenerateConfirm.value = false
      success('QR Code presensi kelas berhasil digenerate ulang.')
      emitStatusUpdate()
    }
  } catch (err) {
    showError(err?.message || 'Gagal generate ulang QR Code kelas.')
  } finally {
    submitting.value = false
  }
}

const handleToggleStatus = async () => {
  if (!props.classItem?.id || !qrData.value || submitting.value) return
  submitting.value = true
  try {
    const nextState = !qrData.value.is_active
    const res = await lessonAttendanceService.updateClassAttendanceQrStatus(props.classItem.id, nextState)
    if (res.success) {
      qrData.value = res.data
      success(nextState ? 'QR Code kelas diaktifkan.' : 'QR Code kelas dinonaktifkan.')
      emitStatusUpdate()
    }
  } catch (err) {
    showError(err?.message || 'Gagal mengubah status QR Code kelas.')
  } finally {
    submitting.value = false
  }
}

const copyLink = async () => {
  if (!qrData.value?.qr_url) return
  try {
    await navigator.clipboard.writeText(qrData.value.qr_url)
    copied.value = true
    success('Link QR disalin ke clipboard.')
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    showError('Gagal menyalin link QR.')
  }
}

const sanitizeFilename = (name) => {
  return String(name || 'Kelas')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'Kelas'
}

const downloadPng = async () => {
  if (!qrData.value?.qr_url || downloading.value) return
  downloading.value = true
  try {
    const dataUrl = await QRCode.toDataURL(qrData.value.qr_url, {
      width: 1024,
      margin: 4,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `QR-Presensi-${sanitizeFilename(qrData.value.class_name)}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    success('QR Code PNG berhasil diunduh.')
  } catch {
    showError('Gagal mengunduh QR Code PNG.')
  } finally {
    downloading.value = false
  }
}

const printPoster = () => {
  window.print()
}
</script>

<style>
@media print {
  @page {
    size: A4 portrait;
    margin: 12mm;
  }

  body > *:not(.lesson-qr-print-sheet) {
    display: none !important;
  }

  .lesson-qr-print-sheet {
    display: flex !important;
    width: 100% !important;
    min-height: 100vh !important;
  }
}
</style>
