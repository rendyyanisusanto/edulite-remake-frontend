<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Pengaturan Absensi</h1>
      <p class="text-sm text-gray-500 mt-1">Konfigurasi lokasi sekolah, radius, dan aturan absensi.</p>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <svg class="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
    </div>

    <form v-else @submit.prevent="handleSave" class="space-y-6">
      <!-- Location Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          Lokasi & Radius Sekolah
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Pengaturan</label>
            <input v-model="form.name" type="text" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Default Setting"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Latitude Pusat <span class="text-red-500">*</span></label>
            <input v-model="form.center_lat" type="number" step="any" required class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="-6.2088"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Longitude Pusat <span class="text-red-500">*</span></label>
            <input v-model="form.center_lng" type="number" step="any" required class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="106.8456"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Radius (meter) <span class="text-red-500">*</span></label>
            <input v-model="form.radius_meters" type="number" min="10" required class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="100"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Akurasi GPS Min. (meter)</label>
            <input v-model="form.min_gps_accuracy_meters" type="number" step="0.01" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="100"/>
          </div>
        </div>
      </div>

      <!-- Shift & Tolerance -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Shift & Toleransi Waktu
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Shift Aktif</label>
            <select v-model="form.active_shift_id" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
              <option :value="null">— Tidak ada —</option>
              <option v-for="s in shifts" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Toleransi Clock In (menit)</label>
            <input v-model="form.clock_in_tolerance_minutes" type="number" min="0" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="0"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Toleransi Clock Out (menit)</label>
            <input v-model="form.clock_out_tolerance_minutes" type="number" min="0" class="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="0"/>
          </div>
        </div>
      </div>

      <!-- Toggles -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-800 mb-4">Kebijakan Absensi</h2>
        <div class="space-y-3">
          <label class="flex items-center gap-3 cursor-pointer">
            <input v-model="form.allow_outside_radius" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
            <div>
              <span class="text-sm font-medium text-gray-700">Izinkan Absensi di Luar Radius</span>
              <p class="text-xs text-gray-500">Karyawan dapat absen meski berada di luar area sekolah</p>
            </div>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input v-model="form.require_selfie" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
            <div>
              <span class="text-sm font-medium text-gray-700">Wajib Selfie</span>
              <p class="text-xs text-gray-500">Karyawan harus mengunggah foto saat absensi</p>
            </div>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input v-model="form.require_note_outside_radius" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
            <div>
              <span class="text-sm font-medium text-gray-700">Wajib Catatan di Luar Radius</span>
              <p class="text-xs text-gray-500">Karyawan harus mengisi catatan jika absen di luar area</p>
            </div>
          </label>
        </div>
      </div>

      <div v-if="formError" class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{{ formError }}</div>

      <div class="flex justify-end">
        <BaseButton type="submit" :loading="saving">
          <svg class="h-4 w-4 mr-1.5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          Simpan Pengaturan
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import attendanceService from '@/services/api/attendance.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()
const loading = ref(true)
const saving = ref(false)
const formError = ref('')
const shifts = ref([])

const form = reactive({
  name: 'Default Setting',
  center_lat: '',
  center_lng: '',
  radius_meters: 100,
  min_gps_accuracy_meters: 100,
  active_shift_id: null,
  clock_in_tolerance_minutes: 0,
  clock_out_tolerance_minutes: 0,
  allow_outside_radius: false,
  require_selfie: false,
  require_note_outside_radius: true
})

const fetchData = async () => {
  loading.value = true
  try {
    const [settingRes, shiftRes] = await Promise.all([
      attendanceService.getSettings(),
      attendanceService.getActiveShifts()
    ])
    if (shiftRes?.success) shifts.value = shiftRes.data
    if (settingRes?.success && settingRes.data) {
      const s = settingRes.data
      Object.assign(form, {
        name: s.name, center_lat: s.center_lat, center_lng: s.center_lng,
        radius_meters: s.radius_meters, min_gps_accuracy_meters: s.min_gps_accuracy_meters,
        active_shift_id: s.active_shift_id, clock_in_tolerance_minutes: s.clock_in_tolerance_minutes,
        clock_out_tolerance_minutes: s.clock_out_tolerance_minutes,
        allow_outside_radius: s.allow_outside_radius, require_selfie: s.require_selfie,
        require_note_outside_radius: s.require_note_outside_radius
      })
    }
  } catch (e) { showError('Gagal memuat pengaturan') } finally { loading.value = false }
}

const handleSave = async () => {
  formError.value = ''
  if (!form.center_lat || !form.center_lng) return (formError.value = 'Koordinat pusat wajib diisi')
  if (!form.radius_meters) return (formError.value = 'Radius wajib diisi')
  saving.value = true
  try {
    await attendanceService.saveSettings(form)
    success('Pengaturan berhasil disimpan')
  } catch (e) { showError(e?.message || 'Gagal menyimpan pengaturan') } finally { saving.value = false }
}

onMounted(fetchData)
</script>


