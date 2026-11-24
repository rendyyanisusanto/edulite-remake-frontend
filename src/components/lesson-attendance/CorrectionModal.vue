<template>
  <BaseModal :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" maxWidth="4xl" title="Koreksi Presensi Jam Pelajaran">
    <div v-if="loading" class="py-10 text-center text-sm text-gray-500">Memuat data transaksi...</div>

    <div v-else-if="session" class="space-y-4">
      <!-- Fixed immutable info -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
        <div><span class="text-gray-500 block">Kelas</span><span class="font-semibold">{{ session.class_name }}</span></div>
        <div><span class="text-gray-500 block">Tanggal</span><span class="font-semibold">{{ session.attendance_date }}</span></div>
        <div><span class="text-gray-500 block">Jam Pelajaran</span><span class="font-semibold">Jam ke-{{ session.period_number }}</span></div>
        <div><span class="text-gray-500 block">Metode Asli</span><span class="font-semibold">{{ session.input_method }}</span></div>
      </div>

      <!-- Editable header fields -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Guru Pengajar</label>
          <select v-model="form.teacher_id" class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md">
            <option v-for="t in lookups.teachers" :key="t.id" :value="t.id">{{ t.full_name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Mata Pelajaran</label>
          <select v-model="form.subject_id" class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md">
            <option v-for="s in lookups.subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Catatan Umum</label>
          <input v-model="form.notes" type="text" class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md" />
        </div>
      </div>

      <!-- Change counter -->
      <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
        <input v-model="studentSearch" type="text" placeholder="Cari siswa..." class="px-3 py-1.5 border border-gray-300 rounded-md w-56" />
        <span class="px-2.5 py-1 rounded-full font-medium" :class="changedCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'">
          {{ changedCount }} perubahan terdeteksi
        </span>
      </div>

      <!-- Editable student table -->
      <div class="overflow-x-auto border border-gray-200 rounded-lg max-h-72">
        <table class="min-w-full divide-y divide-gray-200 text-xs">
          <thead class="bg-gray-50 sticky top-0">
            <tr>
              <th class="px-2 py-2 text-center w-10">No</th>
              <th class="px-2 py-2 text-left">Siswa</th>
              <th class="px-2 py-2 text-center w-24">Status Awal</th>
              <th class="px-2 py-2 text-center w-32">Status Baru</th>
              <th class="px-2 py-2 text-left">Catatan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr
              v-for="(st, idx) in filteredStudents"
              :key="st.student_id"
              :class="isRowChanged(st) ? 'bg-amber-50/70' : 'hover:bg-gray-50'"
            >
              <td class="px-2 py-1.5 text-center text-gray-500">{{ idx + 1 }}</td>
              <td class="px-2 py-1.5">
                <div class="font-medium text-gray-900">{{ st.full_name }}</div>
                <div class="text-[11px] text-gray-500 font-mono">{{ st.nis || '-' }}</div>
              </td>
              <td class="px-2 py-1.5 text-center">
                <span class="px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-700">{{ st.original_status }}</span>
              </td>
              <td class="px-2 py-1.5 text-center">
                <select v-model="st.status" class="px-2 py-1 border border-gray-300 rounded text-xs">
                  <option v-for="code in statuses" :key="code" :value="code">{{ code }}</option>
                </select>
              </td>
              <td class="px-2 py-1.5">
                <input v-model="st.notes" type="text" placeholder="Catatan..." class="w-full px-2 py-1 border border-gray-200 rounded text-xs" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mandatory Correction Reason -->
      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">Alasan Koreksi <span class="text-red-500">*</span></label>
        <textarea
          v-model="form.reason"
          rows="2"
          placeholder="Jelaskan alasan koreksi presensi (minimal 3 karakter)..."
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
        ></textarea>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <button type="button" @click="$emit('update:modelValue', false)" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Batal
        </button>
        <button
          type="button"
          @click="submitCorrection"
          :disabled="!canSubmit || submitting"
          class="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:opacity-50"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan Koreksi' }}
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
  sessionId: { type: [String, Number], default: null },
  lookups: { type: Object, required: true }
})

const emit = defineEmits(['update:modelValue', 'saved'])
const toast = useToast()
const statuses = ['HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPA']

const loading = ref(false)
const submitting = ref(false)
const session = ref(null)
const studentSearch = ref('')

const form = reactive({
  teacher_id: '',
  subject_id: '',
  notes: '',
  reason: '',
  expected_updated_at: '',
  students: []
})

const isRowChanged = (st) => st.status !== st.original_status || (st.notes || '') !== (st.original_notes || '')

const changedCount = computed(() => {
  if (!session.value) return 0
  let count = 0
  if (Number(form.teacher_id) !== Number(session.value.teacher_id)) count += 1
  if (Number(form.subject_id) !== Number(session.value.subject_id)) count += 1
  if ((form.notes || '') !== (session.value.notes || '')) count += 1
  for (const st of form.students) {
    if (isRowChanged(st)) count += 1
  }
  return count
})

const filteredStudents = computed(() => {
  const q = studentSearch.value.trim().toLowerCase()
  if (!q) return form.students
  return form.students.filter(
    (s) => (s.full_name || '').toLowerCase().includes(q) || (s.nis || '').toLowerCase().includes(q)
  )
})

const canSubmit = computed(() => changedCount.value > 0 && form.reason.trim().length >= 3)

const loadDetail = async () => {
  if (!props.sessionId) return
  loading.value = true
  try {
    const res = await lessonAttendanceService.getSessionDetail(props.sessionId)
    const data = res.data?.data || res.data
    session.value = data.session
    form.teacher_id = data.session.teacher_id
    form.subject_id = data.session.subject_id
    form.notes = data.session.notes || ''
    form.reason = ''
    form.expected_updated_at = data.session.updated_at
    form.students = (data.students || []).map((s) => ({
      student_id: s.student_id,
      nis: s.nis,
      full_name: s.full_name,
      original_status: s.status,
      original_notes: s.notes || '',
      status: s.status,
      notes: s.notes || ''
    }))
  } catch (err) {
    toast.error(err.response?.data?.message || 'Gagal memuat data transaksi untuk koreksi.')
    emit('update:modelValue', false)
  } finally {
    loading.value = false
  }
}

watch(() => [props.modelValue, props.sessionId], ([open, id]) => {
  if (open && id) {
    studentSearch.value = ''
    loadDetail()
  }
})

const submitCorrection = async () => {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    await lessonAttendanceService.correctSession(props.sessionId, {
      teacher_id: Number(form.teacher_id),
      subject_id: Number(form.subject_id),
      notes: form.notes || null,
      reason: form.reason.trim(),
      expected_updated_at: form.expected_updated_at,
      students: form.students.map((s) => ({
        student_id: s.student_id,
        status: s.status,
        notes: s.notes || null
      }))
    })
    toast.success('Koreksi presensi berhasil disimpan.')
    emit('saved')
    emit('update:modelValue', false)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Gagal menyimpan koreksi presensi.')
  } finally {
    submitting.value = false
  }
}
</script>
