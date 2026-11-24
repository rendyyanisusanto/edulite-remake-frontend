<template>
  <BaseModal :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" maxWidth="4xl" title="Input Presensi Manual (Administrator)">
    <div class="space-y-4">
      <!-- Form Header -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Tahun Ajaran</label>
          <select v-model="form.academic_year_id" @change="loadRoster" class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md">
            <option v-for="y in lookups.academic_years" :key="y.id" :value="y.id">
              {{ y.name }} {{ y.is_active ? '(Aktif)' : '' }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Tanggal Presensi</label>
          <input v-model="form.attendance_date" type="date" :max="lookups.server_date" @change="loadRoster" class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Kelas <span class="text-red-500">*</span></label>
          <select v-model="form.class_id" @change="loadRoster" class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">-- Pilih Kelas --</option>
            <option v-for="c in lookups.classes" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Guru Pengajar <span class="text-red-500">*</span></label>
          <select v-model="form.teacher_id" class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">-- Pilih Guru --</option>
            <option v-for="t in lookups.teachers" :key="t.id" :value="t.id">{{ t.full_name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Mata Pelajaran <span class="text-red-500">*</span></label>
          <select v-model="form.subject_id" class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">-- Pilih Mata Pelajaran --</option>
            <option v-for="s in lookups.subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Catatan Umum</label>
          <input v-model="form.notes" type="text" placeholder="Opsional..." class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md" />
        </div>
      </div>

      <!-- Roster Loading / Error -->
      <div v-if="rosterLoading" class="py-6 text-center text-sm text-gray-500">Memuat jam pelajaran dan daftar siswa aktif...</div>
      <div v-else-if="rosterError" class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
        {{ rosterError }}
      </div>

      <template v-else-if="rosterData">
        <!-- Period Selection Grid -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1.5">Pilih Jam Pelajaran <span class="text-red-500">*</span></label>
          <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
            <label
              v-for="p in rosterData.periods"
              :key="p.id"
              class="flex flex-col p-2 border rounded-lg text-xs transition-colors"
              :class="[
                p.attendance_state !== 'AVAILABLE' ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed' :
                form.lesson_period_ids.includes(p.id) ? 'bg-primary/10 border-primary cursor-pointer' : 'bg-white border-gray-200 hover:bg-gray-50 cursor-pointer'
              ]"
            >
              <div class="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  :value="p.id"
                  v-model="form.lesson_period_ids"
                  :disabled="p.attendance_state !== 'AVAILABLE'"
                  class="rounded text-primary focus:ring-primary"
                />
                <span class="font-semibold">Jam ke-{{ p.period_number }}</span>
              </div>
              <span class="text-[11px] text-gray-500 ml-5">{{ sliceTime(p.start_time) }} - {{ sliceTime(p.end_time) }}</span>
              <span class="ml-5 mt-0.5 text-[10px] font-medium" :class="periodBadgeClass(p.attendance_state)">
                {{ periodStateLabel(p.attendance_state) }}
              </span>
            </label>
          </div>
        </div>

        <!-- Student Table Controls -->
        <div v-if="studentsList.length === 0" class="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          Tidak ada siswa aktif terdaftar pada kelas ini untuk tahun ajaran berjalan.
        </div>

        <template v-else>
          <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200">
            <div class="flex items-center gap-2">
              <input v-model="studentSearch" type="text" placeholder="Cari siswa..." class="px-3 py-1.5 text-xs border border-gray-300 rounded-md w-48" />
              <button type="button" @click="markAllPresent" class="px-2.5 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md hover:bg-emerald-100">
                Tandai Semua Hadir
              </button>
            </div>
            <div class="flex flex-wrap gap-1.5 text-[11px]">
              <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">H: {{ summary.HADIR }}</span>
              <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800">T: {{ summary.TERLAMBAT }}</span>
              <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-800">I: {{ summary.IZIN }}</span>
              <span class="px-2 py-0.5 rounded bg-orange-100 text-orange-800">S: {{ summary.SAKIT }}</span>
              <span class="px-2 py-0.5 rounded bg-red-100 text-red-800">A: {{ summary.ALPA }}</span>
            </div>
          </div>

          <div class="overflow-x-auto border border-gray-200 rounded-lg max-h-72">
            <table class="min-w-full divide-y divide-gray-200 text-xs">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="px-2 py-2 text-center w-10">No</th>
                  <th class="px-2 py-2 text-left w-24">NIS</th>
                  <th class="px-2 py-2 text-left">Nama Siswa</th>
                  <th class="px-2 py-2 text-center w-10">H</th>
                  <th class="px-2 py-2 text-center w-10">T</th>
                  <th class="px-2 py-2 text-center w-10">I</th>
                  <th class="px-2 py-2 text-center w-10">S</th>
                  <th class="px-2 py-2 text-center w-10">A</th>
                  <th class="px-2 py-2 text-left w-44">Catatan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="(st, idx) in filteredStudents" :key="st.student_id" class="hover:bg-gray-50">
                  <td class="px-2 py-1.5 text-center text-gray-500">{{ idx + 1 }}</td>
                  <td class="px-2 py-1.5 font-mono text-gray-600">{{ st.nis || '-' }}</td>
                  <td class="px-2 py-1.5 font-medium text-gray-900">{{ st.full_name }}</td>
                  <td v-for="code in statuses" :key="code" class="px-2 py-1.5 text-center">
                    <input type="radio" :name="`manual-st-${st.student_id}`" :value="code" v-model="st.status" class="text-primary focus:ring-primary cursor-pointer" />
                  </td>
                  <td class="px-2 py-1.5">
                    <input v-model="st.notes" type="text" placeholder="Catatan..." class="w-full px-2 py-1 text-xs border border-gray-200 rounded" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </template>

      <!-- Confirmation step -->
      <div v-if="confirmStep" class="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center justify-between gap-3">
        <span>Konfirmasi simpan presensi manual untuk <strong>{{ form.lesson_period_ids.length }}</strong> jam pelajaran ({{ studentsList.length }} siswa)?</span>
        <div class="flex gap-2 shrink-0">
          <button type="button" @click="confirmStep = false" class="px-2.5 py-1 bg-white border border-gray-300 rounded text-gray-700">Batal</button>
          <button type="button" @click="submitForm" :disabled="submitting" class="px-3 py-1 bg-primary text-white rounded font-medium disabled:opacity-50">
            {{ submitting ? 'Menyimpan...' : 'Ya, Simpan Presensi' }}
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <button type="button" @click="$emit('update:modelValue', false)" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Tutup
        </button>
        <button
          type="button"
          @click="handlePreSubmit"
          :disabled="!canSubmit || submitting"
          class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          Simpan Presensi
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import lessonAttendanceService from '@/services/api/lessonAttendance.service'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  lookups: { type: Object, required: true },
  prefill: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'saved'])
const toast = useToast()
const statuses = ['HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPA']

const form = reactive({
  academic_year_id: '',
  attendance_date: '',
  class_id: '',
  teacher_id: '',
  subject_id: '',
  notes: '',
  lesson_period_ids: []
})

const rosterLoading = ref(false)
const rosterError = ref('')
const rosterData = ref(null)
const studentsList = ref([])
const studentSearch = ref('')
const confirmStep = ref(false)
const submitting = ref(false)

const filteredStudents = computed(() => {
  const q = studentSearch.value.trim().toLowerCase()
  if (!q) return studentsList.value
  return studentsList.value.filter(
    (s) => (s.full_name || '').toLowerCase().includes(q) || (s.nis || '').toLowerCase().includes(q)
  )
})

const summary = computed(() => {
  const counts = { HADIR: 0, TERLAMBAT: 0, IZIN: 0, SAKIT: 0, ALPA: 0 }
  for (const s of studentsList.value) {
    if (counts[s.status] !== undefined) counts[s.status] += 1
  }
  return counts
})

const canSubmit = computed(() => {
  return (
    form.academic_year_id &&
    form.attendance_date &&
    form.class_id &&
    form.teacher_id &&
    form.subject_id &&
    form.lesson_period_ids.length > 0 &&
    studentsList.value.length > 0
  )
})

const loadRoster = async () => {
  if (!form.class_id || !form.attendance_date || !form.academic_year_id) {
    rosterData.value = null
    studentsList.value = []
    return
  }
  rosterLoading.value = true
  rosterError.value = ''
  confirmStep.value = false
  try {
    const res = await lessonAttendanceService.getManualRoster({
      academic_year_id: form.academic_year_id,
      class_id: form.class_id,
      attendance_date: form.attendance_date
    })
    const data = res.data?.data || res.data
    rosterData.value = data
    studentsList.value = (data.students || []).map((s) => ({
      student_id: s.student_id,
      nis: s.nis,
      full_name: s.full_name,
      status: 'HADIR',
      notes: ''
    }))
    if (props.prefill?.lesson_period_id) {
      const target = (data.periods || []).find(
        (p) => Number(p.id) === Number(props.prefill.lesson_period_id) && p.attendance_state === 'AVAILABLE'
      )
      form.lesson_period_ids = target ? [target.id] : []
    } else {
      form.lesson_period_ids = []
    }
  } catch (err) {
    rosterData.value = null
    studentsList.value = []
    rosterError.value = err.response?.data?.message || 'Gagal memuat roster kelas.'
  } finally {
    rosterLoading.value = false
  }
}

watch(() => props.modelValue, (open) => {
  if (open) {
    confirmStep.value = false
    studentSearch.value = ''
    form.academic_year_id = props.prefill?.academic_year_id || props.lookups.active_academic_year?.id || ''
    form.attendance_date = props.prefill?.attendance_date || props.lookups.server_date || ''
    form.class_id = props.prefill?.class_id || ''
    form.teacher_id = ''
    form.subject_id = ''
    form.notes = ''
    form.lesson_period_ids = []
    if (form.class_id) {
      loadRoster()
    } else {
      rosterData.value = null
      studentsList.value = []
      rosterError.value = ''
    }
  }
})

const markAllPresent = () => {
  for (const s of studentsList.value) s.status = 'HADIR'
}

const handlePreSubmit = () => {
  if (!canSubmit.value) return
  confirmStep.value = true
}

const submitForm = async () => {
  submitting.value = true
  try {
    await lessonAttendanceService.createManualAttendance({
      academic_year_id: Number(form.academic_year_id),
      class_id: Number(form.class_id),
      teacher_id: Number(form.teacher_id),
      subject_id: Number(form.subject_id),
      attendance_date: form.attendance_date,
      lesson_period_ids: form.lesson_period_ids.map(Number),
      notes: form.notes || null,
      students: studentsList.value.map((s) => ({
        student_id: s.student_id,
        status: s.status,
        notes: s.notes || null
      }))
    })
    toast.success('Presensi manual berhasil disimpan.')
    emit('saved')
    emit('update:modelValue', false)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Gagal menyimpan presensi manual.')
    confirmStep.value = false
  } finally {
    submitting.value = false
  }
}

const sliceTime = (t) => (t ? String(t).slice(0, 5) : '--:--')
const periodStateLabel = (st) => ({
  AVAILABLE: 'Tersedia',
  ALREADY_SUBMITTED: 'Sudah diabsen',
  CANCELLED: 'Dibatalkan',
  UPCOMING: 'Belum dimulai'
}[st] || st)
const periodBadgeClass = (st) => ({
  AVAILABLE: 'text-emerald-700',
  ALREADY_SUBMITTED: 'text-gray-500',
  CANCELLED: 'text-amber-700',
  UPCOMING: 'text-gray-400'
}[st] || 'text-gray-500')
</script>
