<template>
  <BaseModal :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" maxWidth="md" :title="mode === 'cancel' ? 'Batalkan Transaksi Presensi' : 'Pulihkan Transaksi Presensi'">
    <div v-if="session" class="space-y-4 text-sm">
      <div v-if="mode === 'cancel'" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs">
        Presensi yang dibatalkan tidak akan dihitung dalam laporan kehadiran. Seluruh data dan riwayat perubahan tetap tersimpan.
      </div>
      <div v-else class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs">
        Transaksi yang dipulihkan akan kembali dihitung dalam laporan kehadiran valid menggunakan ID transaksi yang sama.
      </div>

      <div class="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs space-y-1">
        <div><span class="text-gray-500">Kelas:</span> <strong>{{ session.class_name }}</strong></div>
        <div><span class="text-gray-500">Tanggal / Jam:</span> <strong>{{ session.attendance_date }} — Jam ke-{{ session.period_number }}</strong></div>
        <div><span class="text-gray-500">Guru:</span> <strong>{{ session.teacher_name }}</strong></div>
        <div><span class="text-gray-500">Mata Pelajaran:</span> <strong>{{ session.subject_name }}</strong></div>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">
          {{ mode === 'cancel' ? 'Alasan Pembatalan' : 'Alasan Pemulihan' }} <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="reason"
          rows="3"
          placeholder="Masukkan alasan (minimal 3 karakter)..."
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
        ></textarea>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <button type="button" @click="$emit('update:modelValue', false)" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Tutup
        </button>
        <button
          type="button"
          @click="submitAction"
          :disabled="reason.trim().length < 3 || submitting"
          class="px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50"
          :class="mode === 'cancel' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'"
        >
          {{ submitting ? 'Memproses...' : (mode === 'cancel' ? 'Ya, Batalkan Presensi' : 'Ya, Pulihkan Presensi') }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import lessonAttendanceService from '@/services/api/lessonAttendance.service'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  mode: { type: String, default: 'cancel' },
  session: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'saved'])
const toast = useToast()

const reason = ref('')
const submitting = ref(false)

watch(() => props.modelValue, (open) => {
  if (open) reason.value = ''
})

const submitAction = async () => {
  if (!props.session?.id || reason.value.trim().length < 3) return
  submitting.value = true
  try {
    if (props.mode === 'cancel') {
      await lessonAttendanceService.cancelSession(props.session.id, reason.value.trim())
      toast.success('Transaksi presensi berhasil dibatalkan.')
    } else {
      await lessonAttendanceService.restoreSession(props.session.id, reason.value.trim())
      toast.success('Transaksi presensi berhasil dipulihkan.')
    }
    emit('saved')
    emit('update:modelValue', false)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Gagal memproses transaksi.')
  } finally {
    submitting.value = false
  }
}
</script>
