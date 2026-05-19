<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">Anggota Ekskul</h1>
    </div>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-4">
      <div class="rounded-xl border border-gray-200 bg-white p-4 xl:col-span-1">
        <h2 class="mb-3 text-sm font-semibold text-gray-700">Pilih Ekskul</h2>
        <div class="mb-3">
          <label class="mb-1 block text-xs font-medium text-gray-600">Tahun Ajaran</label>
          <select v-model="selectedAcademicYearId" class="w-full rounded border px-3 py-2 text-sm" @change="reloadMembers">
            <option :value="null">Pilih Tahun Ajaran</option>
            <option v-for="year in academicYears" :key="year.id" :value="year.id">{{ year.name }}</option>
          </select>
        </div>

        <BaseInput
          id="search-extracurricular"
          v-model="extracurricularKeyword"
          label="Cari Ekskul"
          placeholder="Nama / kode ekskul"
        />

        <div class="max-h-[500px] space-y-2 overflow-auto pr-1">
          <button
            v-for="item in filteredExtracurriculars"
            :key="item.id"
            class="w-full rounded-lg border px-3 py-3 text-left transition"
            :class="selectedExtracurricularId === item.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'"
            @click="selectExtracurricular(item.id)"
          >
            <p class="text-sm font-semibold text-gray-800">{{ item.name }}</p>
            <p class="text-xs text-gray-500">{{ item.code }}</p>
            <p class="mt-1 text-xs text-gray-400">Kuota: {{ item.max_members || '-' }}</p>
          </button>
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-4 xl:col-span-3">
        <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 class="text-base font-semibold text-gray-800">{{ selectedExtracurricular?.name || 'Pilih ekskul terlebih dahulu' }}</h2>
            <p class="text-sm text-gray-500">
              Anggota aktif: {{ activeMemberCount }}
              <span v-if="selectedExtracurricular?.max_members"> / {{ selectedExtracurricular.max_members }}</span>
            </p>
          </div>
          <div class="w-full md:w-56">
            <label class="mb-1 block text-xs font-medium text-gray-600">Filter Kelas</label>
            <select v-model="selectedClassId" class="w-full rounded border px-3 py-2 text-sm" @change="loadAvailableStudents">
              <option :value="null">Semua Kelas</option>
              <option v-for="item in classes" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div class="rounded-lg border border-gray-200">
            <div class="border-b bg-gray-50 p-3">
              <h3 class="text-sm font-semibold text-gray-700">Siswa Tersedia</h3>
              <BaseInput id="search-available-students" v-model="availableKeyword" placeholder="Cari siswa..." />
              <p v-if="!selectedClassId && !availableKeyword" class="mt-1 text-xs text-amber-600">
                Menampilkan data terbatas untuk semua kelas. Gunakan pencarian atau filter kelas agar lebih spesifik.
              </p>
            </div>
            <div class="max-h-[420px] overflow-auto p-2">
              <div v-if="loadingAvailable" class="p-3 text-sm text-gray-500">Memuat siswa tersedia...</div>
              <div v-else-if="availableStudents.length === 0" class="p-3 text-sm text-gray-400">Tidak ada siswa tersedia.</div>
              <label v-for="student in availableStudents" :key="student.id" class="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-gray-50">
                <input type="checkbox" :value="student.id" v-model="selectedAvailableIds" />
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-gray-800">{{ student.full_name }}</p>
                  <p class="text-xs text-gray-500">{{ student.nis || '-' }} | {{ student.current_class?.name || 'Tanpa kelas' }}</p>
                </div>
              </label>
            </div>
          </div>

          <div class="rounded-lg border border-gray-200">
            <div class="border-b bg-gray-50 p-3">
              <h3 class="text-sm font-semibold text-gray-700">Anggota Ekskul</h3>
              <BaseInput id="search-assigned-members" v-model="assignedKeyword" placeholder="Cari anggota..." />
            </div>
            <div class="max-h-[420px] overflow-auto p-2">
              <div v-if="loadingAssigned" class="p-3 text-sm text-gray-500">Memuat anggota...</div>
              <div v-else-if="assignedMembers.length === 0" class="p-3 text-sm text-gray-400">Belum ada anggota.</div>
              <label v-for="member in assignedMembers" :key="member.id" class="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-gray-50">
                <input type="checkbox" :value="member.id" v-model="selectedAssignedMemberIds" />
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-gray-800">{{ member.student?.full_name }}</p>
                  <p class="text-xs text-gray-500">{{ member.student?.nis || '-' }} | {{ member.status }}</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div class="w-full md:w-64">
            <BaseInput id="join-date" v-model="joinDate" type="date" label="Tanggal Gabung" />
          </div>
          <div class="flex flex-wrap gap-2">
            <BaseButton :loading="bulkAdding" @click="addSelectedStudents">Tambah Terpilih</BaseButton>
            <BaseButton variant="danger" :loading="removingMembers" @click="removeSelectedMembers">Keluarkan Terpilih</BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import { extracurricularService } from '@/services/api/extracurricular.service'
import { academicYearService, classService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { success, error } = useToast()

const extracurriculars = ref([])
const academicYears = ref([])
const classes = ref([])

const extracurricularKeyword = ref('')
const availableKeyword = ref('')
const assignedKeyword = ref('')

const selectedAcademicYearId = ref(null)
const selectedExtracurricularId = ref(null)
const selectedClassId = ref(null)

const availableStudents = ref([])
const assignedMembers = ref([])
const selectedAvailableIds = ref([])
const selectedAssignedMemberIds = ref([])

const loadingAvailable = ref(false)
const loadingAssigned = ref(false)
const bulkAdding = ref(false)
const removingMembers = ref(false)

const joinDate = ref(new Date().toISOString().slice(0, 10))
let availableSearchTimer
let assignedSearchTimer

const selectedExtracurricular = computed(() => extracurriculars.value.find(item => item.id === selectedExtracurricularId.value) || null)
const activeMemberCount = computed(() => assignedMembers.value.filter(item => item.status === 'ACTIVE').length)

const filteredExtracurriculars = computed(() => {
  const keyword = extracurricularKeyword.value.trim().toLowerCase()
  if (!keyword) return extracurriculars.value
  return extracurriculars.value.filter(item =>
    (item.name || '').toLowerCase().includes(keyword) || (item.code || '').toLowerCase().includes(keyword)
  )
})

function canProceed(showError = true) {
  if (!selectedAcademicYearId.value) {
    if (showError) error('Tahun ajaran wajib dipilih')
    return false
  }
  if (!selectedExtracurricularId.value) {
    if (showError) error('Ekskul wajib dipilih')
    return false
  }
  return true
}

async function loadInitData() {
  try {
    const [exRes, yearRes, classRes] = await Promise.all([
      extracurricularService.getExtracurriculars({ limit: 300, is_active: true }),
      academicYearService.getAll({ limit: 200 }),
      classService.getAll({ limit: 500 })
    ])

    extracurriculars.value = exRes.data?.items || []
    academicYears.value = yearRes.data?.academicYears || []
    classes.value = classRes.data?.classes || []

    const activeYear = academicYears.value.find(item => item.is_active)
    selectedAcademicYearId.value = activeYear?.id || academicYears.value[0]?.id || null
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal memuat data awal anggota ekskul')
  }
}

async function selectExtracurricular(id) {
  selectedExtracurricularId.value = id
  selectedAvailableIds.value = []
  selectedAssignedMemberIds.value = []
  await reloadMembers()
}

async function reloadMembers() {
  if (!selectedExtracurricularId.value || !selectedAcademicYearId.value) return
  await Promise.all([loadAvailableStudents(), loadAssignedMembers()])
}

async function loadAvailableStudents() {
  if (!canProceed(false)) return
  loadingAvailable.value = true
  try {
    const isAllClassWithoutKeyword = !selectedClassId.value && !availableKeyword.value
    const response = await extracurricularService.getAvailableStudents(selectedExtracurricularId.value, {
      academic_year_id: selectedAcademicYearId.value,
      class_id: selectedClassId.value || undefined,
      keyword: availableKeyword.value || undefined,
      limit: isAllClassWithoutKeyword ? 80 : 200
    })
    availableStudents.value = response.data || []
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal memuat siswa tersedia')
  } finally {
    loadingAvailable.value = false
  }
}

async function loadAssignedMembers() {
  if (!canProceed(false)) return
  loadingAssigned.value = true
  try {
    const response = await extracurricularService.getAssignedStudents(selectedExtracurricularId.value, {
      academic_year_id: selectedAcademicYearId.value,
      keyword: assignedKeyword.value || undefined,
      status: 'ACTIVE'
    })
    assignedMembers.value = response.data || []
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal memuat anggota ekskul')
  } finally {
    loadingAssigned.value = false
  }
}

async function addSelectedStudents() {
  if (!canProceed()) return
  if (!joinDate.value) {
    error('Tanggal gabung wajib diisi')
    return
  }
  if (!selectedAvailableIds.value.length) {
    error('Pilih minimal satu siswa yang akan ditambahkan')
    return
  }

  bulkAdding.value = true
  try {
    const response = await extracurricularService.createMembersBulk({
      extracurricular_id: selectedExtracurricularId.value,
      academic_year_id: selectedAcademicYearId.value,
      join_date: joinDate.value,
      student_ids: selectedAvailableIds.value
    })

    const summary = response.data || {}
    success(`Berhasil menambahkan ${summary.total_created || 0} dari ${summary.total_requested || selectedAvailableIds.value.length} siswa`)
    selectedAvailableIds.value = []
    await reloadMembers()
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal menambahkan anggota ekskul')
  } finally {
    bulkAdding.value = false
  }
}

async function removeSelectedMembers() {
  if (!selectedAssignedMemberIds.value.length) {
    error('Pilih minimal satu anggota untuk dikeluarkan')
    return
  }

  const ok = window.confirm(`Keluarkan ${selectedAssignedMemberIds.value.length} anggota terpilih dari ekskul ini?`)
  if (!ok) return

  removingMembers.value = true
  try {
    for (const memberId of selectedAssignedMemberIds.value) {
      await extracurricularService.deleteMember(memberId)
    }
    success('Anggota terpilih berhasil dikeluarkan')
    selectedAssignedMemberIds.value = []
    await reloadMembers()
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal mengeluarkan anggota ekskul')
  } finally {
    removingMembers.value = false
  }
}

watch(availableKeyword, () => {
  clearTimeout(availableSearchTimer)
  availableSearchTimer = setTimeout(() => {
    loadAvailableStudents()
  }, 350)
})

watch(assignedKeyword, () => {
  clearTimeout(assignedSearchTimer)
  assignedSearchTimer = setTimeout(() => {
    loadAssignedMembers()
  }, 350)
})

onMounted(async () => {
  await loadInitData()
  if (extracurriculars.value[0]?.id) {
    await selectExtracurricular(extracurriculars.value[0].id)
  }
})
</script>
