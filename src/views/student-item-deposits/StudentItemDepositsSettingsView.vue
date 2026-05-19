<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">Pengaturan Penitipan Barang</h1>
      <BaseButton variant="outline" @click="load">Refresh</BaseButton>
    </div>

    <BaseCard title="Konfigurasi Penitipan">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label class="flex items-center gap-2"><input type="checkbox" v-model="form.allow_daily_loan" /> Izinkan Peminjaman Harian</label>
        <BaseInput id="max-loan" type="number" v-model="form.max_active_loans_per_student" label="Maks Pinjaman Aktif" />
        <BaseInput id="loan-start" type="time" v-model="form.loan_start_time" label="Jam Mulai Pinjam" />
        <BaseInput id="loan-end" type="time" v-model="form.loan_end_time" label="Jam Akhir Pinjam" />
        <BaseInput id="deadline" type="time" v-model="form.return_deadline_time" label="Batas Kembali" />
      </div>
      <template #footer>
        <BaseButton @click="save">Simpan Pengaturan</BaseButton>
      </template>
    </BaseCard>
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import svc from '@/services/api/studentItemDeposit.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()
const form = reactive({ id: null, allow_daily_loan: true, max_active_loans_per_student: 1, loan_start_time: '', loan_end_time: '', return_deadline_time: '' })

const load = async () => {
  try {
    const res = await svc.getSettings()
    Object.assign(form, res?.data || {})
  } catch (e) { showError(e.message || 'Gagal memuat pengaturan') }
}

const save = async () => {
  if (!form.id) return
  await svc.updateSettings(form.id, form)
  success('Pengaturan berhasil disimpan')
}

onMounted(load)
</script>
