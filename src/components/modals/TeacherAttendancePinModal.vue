<template>
  <BaseModal :modelValue="modelValue" @update:modelValue="handleClose" title="Kelola PIN Presensi Guru" maxWidth="lg">
    <div class="space-y-5">
      <!-- Teacher Info Card -->
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-gray-900">{{ teacher?.full_name || '-' }}</p>
          <p class="text-xs text-gray-500 mt-0.5">NIP/NUPTK: {{ teacher?.nip || '-' }}</p>
        </div>
        <div>
          <span
            v-if="pinConfigured"
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"
          >
            Aktif / Sudah dibuat
          </span>
          <span
            v-else
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600"
          >
            Belum dibuat
          </span>
        </div>
      </div>

      <!-- Helper text -->
      <div class="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2.5">
        <svg class="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-xs sm:text-sm text-blue-800 leading-relaxed">
          PIN digunakan oleh guru untuk melakukan presensi siswa per jam pelajaran melalui QR Code kelas tanpa perlu login akun Edulite.
        </p>
      </div>

      <!-- Loading Initial Status -->
      <div v-if="loadingStatus" class="py-6 flex justify-center">
        <div class="animate-spin rounded-full h-7 w-7 border-b-2 border-primary"></div>
      </div>

      <template v-else>
        <!-- Generated PIN One-Time Display -->
        <div v-if="generatedPin" class="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-amber-800">PIN Presensi Baru</p>
              <p class="text-xs text-amber-700 mt-0.5">
                PIN ini hanya diperlihatkan satu kali. Segera salin dan berikan kepada guru yang bersangkutan.
              </p>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-amber-200 rounded-md px-4 py-3">
            <span class="font-mono text-2xl sm:text-3xl font-bold tracking-widest text-gray-900 select-all">
              {{ formattedGeneratedPin }}
            </span>
            <BaseButton size="sm" variant="outline" @click="copyGeneratedPin">
              {{ copied ? 'Tersalin!' : 'Salin PIN' }}
            </BaseButton>
          </div>
        </div>

        <!-- Mode Selector / Actions (when canManage) -->
        <div v-if="canManage && !activeConfirm" class="space-y-4">
          <div class="flex flex-wrap gap-2">
            <BaseButton
              v-if="!pinConfigured"
              @click="handleAutoGenerate"
              :loading="submitting"
              :disabled="submitting"
            >
              Generate PIN Otomatis
            </BaseButton>
            <BaseButton
              v-if="pinConfigured"
              @click="activeConfirm = 'reset'"
              :disabled="submitting"
            >
              Reset PIN Otomatis
            </BaseButton>
            <BaseButton
              variant="outline"
              @click="toggleManualForm"
              :disabled="submitting"
            >
              {{ showManualForm ? 'Tutup Form Manual' : (pinConfigured ? 'Ubah PIN Manual' : 'Buat PIN Manual') }}
            </BaseButton>
            <BaseButton
              v-if="pinConfigured"
              variant="danger"
              @click="activeConfirm = 'remove'"
              :disabled="submitting"
            >
              Hapus PIN
            </BaseButton>
          </div>

          <!-- Manual PIN Form -->
          <form v-if="showManualForm" @submit.prevent="submitManualPin" class="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50/50">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-gray-800">
                {{ pinConfigured ? 'Ubah PIN Manual' : 'Buat PIN Manual' }}
              </h4>
              <button
                type="button"
                @click="showPinText = !showPinText"
                class="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                {{ showPinText ? 'Sembunyikan PIN' : 'Tampilkan PIN' }}
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="manual-pin" class="block text-sm font-medium text-gray-700 mb-1">
                  PIN Baru (6 digit) <span class="text-red-500">*</span>
                </label>
                <input
                  id="manual-pin"
                  :value="manualPin"
                  @input="onPinInput('manualPin', $event)"
                  :type="showPinText ? 'text' : 'password'"
                  inputmode="numeric"
                  autocomplete="off"
                  maxlength="6"
                  placeholder="Contoh: 038521"
                  class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white font-mono tracking-widest text-sm focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label for="confirm-pin" class="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi PIN Baru <span class="text-red-500">*</span>
                </label>
                <input
                  id="confirm-pin"
                  :value="confirmPin"
                  @input="onPinInput('confirmPin', $event)"
                  :type="showPinText ? 'text' : 'password'"
                  inputmode="numeric"
                  autocomplete="off"
                  maxlength="6"
                  placeholder="Ulangi 6 digit PIN"
                  class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white font-mono tracking-widest text-sm focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <p v-if="manualValidationError" class="text-xs text-red-600">
              {{ manualValidationError }}
            </p>
            <p v-else class="text-xs text-gray-500">
              Gunakan 6 digit angka (angka nol di depan diperbolehkan, hindari pola mudah ditebak seperti 123456).
            </p>

            <div class="flex justify-end gap-2">
              <BaseButton type="button" variant="outline" size="sm" @click="resetManualForm" :disabled="submitting">
                Batal
              </BaseButton>
              <BaseButton type="submit" size="sm" :loading="submitting" :disabled="!isManualValid || submitting">
                Simpan PIN
              </BaseButton>
            </div>
          </form>
        </div>

        <!-- Inline Confirmation Dialogs -->
        <div v-if="activeConfirm === 'reset'" class="border border-amber-200 bg-amber-50 rounded-lg p-4 space-y-3">
          <p class="text-sm font-semibold text-amber-900">Konfirmasi Reset PIN</p>
          <p class="text-sm text-amber-800">
            PIN presensi lama tidak akan berlaku setelah PIN baru dibuat. Guru harus menggunakan PIN baru untuk melakukan presensi.
          </p>
          <div class="flex justify-end gap-2">
            <BaseButton variant="outline" size="sm" @click="activeConfirm = null" :disabled="submitting">Batal</BaseButton>
            <BaseButton size="sm" @click="confirmAutoReset" :loading="submitting" :disabled="submitting">Ya, Reset PIN</BaseButton>
          </div>
        </div>

        <div v-if="activeConfirm === 'remove'" class="border border-red-200 bg-red-50 rounded-lg p-4 space-y-3">
          <p class="text-sm font-semibold text-red-900">Konfirmasi Hapus PIN</p>
          <p class="text-sm text-red-800">
            Guru tidak akan dapat melakukan presensi jam pelajaran melalui QR Code sampai PIN baru dibuat. Apakah Anda yakin ingin menghapus PIN?
          </p>
          <div class="flex justify-end gap-2">
            <BaseButton variant="outline" size="sm" @click="activeConfirm = null" :disabled="submitting">Batal</BaseButton>
            <BaseButton variant="danger" size="sm" @click="confirmRemovePin" :loading="submitting" :disabled="submitting">Ya, Hapus PIN</BaseButton>
          </div>
        </div>

        <div v-if="!canManage" class="text-xs text-gray-500 italic">
          Anda hanya memiliki akses melihat status PIN presensi guru.
        </div>
      </template>
    </div>

    <template #footer>
      <BaseButton variant="outline" @click="handleClose">Tutup</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import lessonAttendanceService from '@/services/api/lessonAttendance.service'
import { useToast } from '@/composables/useToast'

const WEAK_PINS = new Set([
  '000000', '111111', '222222', '333333', '444444',
  '555555', '666666', '777777', '888888', '999999',
  '123456', '654321', '012345', '543210'
])

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  teacher: { type: Object, default: null },
  canManage: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'updated'])

const { success, error: showError } = useToast()

const loadingStatus = ref(false)
const submitting = ref(false)
const pinConfigured = ref(false)
const generatedPin = ref('')
const copied = ref(false)
const showManualForm = ref(false)
const showPinText = ref(false)
const manualPin = ref('')
const confirmPin = ref('')
const activeConfirm = ref(null) // 'reset' | 'remove' | null

const formattedGeneratedPin = computed(() => {
  if (!generatedPin.value) return ''
  return `${generatedPin.value.slice(0, 3)} ${generatedPin.value.slice(3)}`
})

const manualValidationError = computed(() => {
  if (!manualPin.value && !confirmPin.value) return ''
  if (!/^\d{6}$/.test(manualPin.value)) return 'PIN harus terdiri dari tepat 6 digit angka.'
  if (WEAK_PINS.has(manualPin.value)) return 'PIN terlalu mudah ditebak. Gunakan kombinasi angka yang lain.'
  if (confirmPin.value && manualPin.value !== confirmPin.value) return 'Konfirmasi PIN tidak cocok.'
  return ''
})

const isManualValid = computed(() => {
  return (
    /^\d{6}$/.test(manualPin.value) &&
    !WEAK_PINS.has(manualPin.value) &&
    manualPin.value === confirmPin.value
  )
})

const clearSensitiveState = () => {
  generatedPin.value = ''
  copied.value = false
  manualPin.value = ''
  confirmPin.value = ''
  showPinText.value = false
  showManualForm.value = false
  activeConfirm.value = null
}

const handleClose = () => {
  clearSensitiveState()
  emit('update:modelValue', false)
}

const loadPinStatus = async () => {
  if (!props.teacher?.id) return
  loadingStatus.value = true
  try {
    const res = await lessonAttendanceService.getTeacherAttendancePinStatus(props.teacher.id)
    if (res.success) {
      pinConfigured.value = Boolean(res.data.attendance_pin_configured)
    }
  } catch (err) {
    pinConfigured.value = Boolean(props.teacher?.attendance_pin_configured)
  } finally {
    loadingStatus.value = false
  }
}

watch(
  () => [props.modelValue, props.teacher?.id],
  ([isOpen]) => {
    if (isOpen && props.teacher?.id) {
      clearSensitiveState()
      pinConfigured.value = Boolean(props.teacher.attendance_pin_configured)
      loadPinStatus()
    } else if (!isOpen) {
      clearSensitiveState()
    }
  }
)

const onPinInput = (field, event) => {
  const digitsOnly = String(event.target.value || '').replace(/\D/g, '').slice(0, 6)
  if (field === 'manualPin') manualPin.value = digitsOnly
  else confirmPin.value = digitsOnly
}

const toggleManualForm = () => {
  showManualForm.value = !showManualForm.value
  if (!showManualForm.value) resetManualForm()
}

const resetManualForm = () => {
  manualPin.value = ''
  confirmPin.value = ''
  showPinText.value = false
  showManualForm.value = false
}

const handleAutoGenerate = async () => {
  if (!props.teacher?.id || submitting.value) return
  submitting.value = true
  try {
    const res = await lessonAttendanceService.generateTeacherAttendancePin(props.teacher.id)
    if (res.success) {
      generatedPin.value = res.data.pin
      pinConfigured.value = true
      showManualForm.value = false
      success('PIN presensi berhasil dibuat.')
      emit('updated', { teacherId: props.teacher.id, attendance_pin_configured: true })
    }
  } catch (err) {
    showError(err?.message || 'Gagal membuat PIN presensi.')
  } finally {
    submitting.value = false
  }
}

const confirmAutoReset = async () => {
  if (!props.teacher?.id || submitting.value) return
  submitting.value = true
  try {
    const res = await lessonAttendanceService.generateTeacherAttendancePin(props.teacher.id)
    if (res.success) {
      generatedPin.value = res.data.pin
      pinConfigured.value = true
      activeConfirm.value = null
      showManualForm.value = false
      success('PIN presensi guru berhasil direset.')
      emit('updated', { teacherId: props.teacher.id, attendance_pin_configured: true })
    }
  } catch (err) {
    showError(err?.message || 'Gagal mereset PIN presensi.')
  } finally {
    submitting.value = false
  }
}

const submitManualPin = async () => {
  if (!isManualValid.value || !props.teacher?.id || submitting.value) return
  submitting.value = true
  try {
    const res = await lessonAttendanceService.setTeacherAttendancePin(props.teacher.id, manualPin.value)
    if (res.success) {
      pinConfigured.value = true
      generatedPin.value = ''
      resetManualForm()
      success('PIN presensi guru berhasil disimpan.')
      emit('updated', { teacherId: props.teacher.id, attendance_pin_configured: true })
    }
  } catch (err) {
    showError(err?.message || 'Gagal menyimpan PIN presensi.')
  } finally {
    submitting.value = false
  }
}

const confirmRemovePin = async () => {
  if (!props.teacher?.id || submitting.value) return
  submitting.value = true
  try {
    const res = await lessonAttendanceService.removeTeacherAttendancePin(props.teacher.id)
    if (res.success) {
      pinConfigured.value = false
      generatedPin.value = ''
      activeConfirm.value = null
      resetManualForm()
      success('PIN presensi guru berhasil dihapus.')
      emit('updated', { teacherId: props.teacher.id, attendance_pin_configured: false })
    }
  } catch (err) {
    showError(err?.message || 'Gagal menghapus PIN presensi.')
  } finally {
    submitting.value = false
  }
}

const copyGeneratedPin = async () => {
  if (!generatedPin.value) return
  try {
    await navigator.clipboard.writeText(generatedPin.value)
    copied.value = true
    success('PIN disalin ke clipboard.')
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    showError('Gagal menyalin PIN.')
  }
}
</script>
