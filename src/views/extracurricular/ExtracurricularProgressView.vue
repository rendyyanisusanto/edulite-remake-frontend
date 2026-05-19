<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-bold text-gray-800">Perkembangan Ekskul</h1>
      <p class="text-sm text-gray-500">Kelola aspek dan catatan perkembangan siswa per ekstrakurikuler.</p>
    </div>

    <div class="flex items-center justify-end">
      <div class="flex gap-2">
        <BaseButton v-if="canManageAspect" variant="outline" @click="openAspectModal()">Tambah Aspek</BaseButton>
        <BaseButton :disabled="!selectedExtracurricularId" @click="openProgressModal()">
          Input Perkembangan
        </BaseButton>
      </div>
    </div>

    <BaseCard>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-600">Tahun Ajaran</label>
          <select v-model="selectedAcademicYearId" class="w-full rounded border px-3 py-2 text-sm">
            <option :value="null">Semua</option>
            <option v-for="item in academicYears" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-600">Ekskul</label>
          <select v-model="selectedExtracurricularId" class="w-full rounded border px-3 py-2 text-sm" @change="onSelectExtracurricular">
            <option :value="null">Pilih Ekskul</option>
            <option v-for="item in extracurriculars" :key="item.id" :value="item.id">
              {{ item.code }} - {{ item.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-600">Siswa</label>
          <select v-model="filters.student_id" class="w-full rounded border px-3 py-2 text-sm" @change="loadProgress">
            <option :value="null">Semua Siswa</option>
            <option v-for="member in members" :key="member.id" :value="member.student_id">
              {{ member.student?.full_name }}
            </option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-600">Aspek</label>
          <select v-model="filters.aspect_id" class="w-full rounded border px-3 py-2 text-sm" @change="loadProgress">
            <option :value="null">Semua Aspek</option>
            <option v-for="aspect in aspects.filter(a => a.is_active)" :key="aspect.id" :value="aspect.id">
              {{ aspect.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-600">Tanggal Mulai</label>
          <input v-model="filters.date_from" type="date" class="w-full rounded border px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-600">Tanggal Selesai</label>
          <input v-model="filters.date_to" type="date" class="w-full rounded border px-3 py-2 text-sm" />
        </div>
        <div class="lg:col-span-2">
          <label class="mb-1 block text-xs font-semibold text-gray-600">Search</label>
          <input v-model="filters.search" type="text" class="w-full rounded border px-3 py-2 text-sm" placeholder="Nama siswa/aspek/predikat/catatan..." />
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <BaseButton :loading="loadingProgress" @click="applyFilters">Tampilkan</BaseButton>
        <BaseButton variant="outline" @click="resetFilters">Reset</BaseButton>
        <BaseButton variant="outline" :loading="loadingMembers || loadingAspects" @click="reloadProgressData">Refresh Data</BaseButton>
      </div>
    </BaseCard>

    <BaseCard>
      <div class="mb-3 flex items-center justify-between">
        <h2 class="font-semibold">Master Aspek Perkembangan</h2>
        <span v-if="selectedExtracurricular" class="text-sm text-gray-500">
          {{ selectedExtracurricular.name }}
        </span>
      </div>
      <BaseTable :columns="aspectCols" :data="aspects" :loading="loadingAspects" :showPagination="false" :showActions="false">
        <template #cell-name="{ item }">
          <div>
            <p class="font-medium text-gray-800">{{ item.name }}</p>
            <p class="text-xs text-gray-500">{{ item.description || '-' }}</p>
          </div>
        </template>
        <template #cell-extracurricular_name="{ item }">
          {{ item.extracurricular?.name || selectedExtracurricular?.name || '-' }}
        </template>
        <template #cell-is_active="{ item }">
          <span :class="item.is_active ? 'text-green-600' : 'text-gray-500'">
            {{ item.is_active ? 'Aktif' : 'Nonaktif' }}
          </span>
        </template>
        <template #cell-actions="{ item }">
          <div v-if="canManageAspect" class="flex flex-wrap gap-2">
            <BaseButton size="sm" variant="outline" @click="openAspectModal(item)">Edit</BaseButton>
            <BaseButton size="sm" variant="danger" @click="handleDeleteAspect(item)">Delete</BaseButton>
          </div>
          <span v-else class="text-xs text-gray-400">Readonly</span>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseCard>
      <h2 class="mb-3 font-semibold">Data Perkembangan Siswa</h2>
      <BaseTable :columns="progressCols" :data="displayedProgresses" :loading="loadingProgress" :showPagination="false" :showActions="false">
        <template #cell-student_name="{ item }">{{ item.student?.full_name || '-' }}</template>
        <template #cell-extracurricular_name="{ item }">{{ item.extracurricular?.name || '-' }}</template>
        <template #cell-aspect_name="{ item }">{{ item.aspect?.name || '-' }}</template>
        <template #cell-session_name="{ item }">{{ item.session?.session_title || '-' }}</template>
        <template #cell-actions="{ item }">
          <div class="flex flex-wrap gap-2">
            <BaseButton size="sm" variant="outline" @click="openProgressModal(item)">Edit</BaseButton>
            <BaseButton size="sm" variant="danger" @click="handleDeleteProgress(item)">Delete</BaseButton>
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseModal v-model="showAspectModal" :title="aspectForm.id ? 'Edit Aspek' : 'Tambah Aspek'">
      <div class="space-y-3">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Ekskul</label>
          <select v-model="aspectForm.extracurricular_id" class="w-full rounded border px-3 py-2">
            <option v-for="item in extracurriculars" :key="item.id" :value="item.id">
              {{ item.code }} - {{ item.name }}
            </option>
          </select>
        </div>
        <BaseInput v-model="aspectForm.name" label="Nama Aspek" required />
        <BaseInput v-model="aspectForm.description" label="Deskripsi" />
      </div>
      <template #footer>
        <BaseButton variant="outline" class="mr-2" @click="showAspectModal = false">Batal</BaseButton>
        <BaseButton :loading="savingAspect" @click="saveAspect">Simpan</BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="showProgressModal" :title="progressForm.id ? 'Edit Perkembangan' : 'Input Perkembangan'" maxWidth="2xl">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Ekskul</label>
          <select v-model="progressForm.extracurricular_id" class="w-full rounded border px-3 py-2" @change="onProgressExtracurricularChange">
            <option v-for="item in extracurriculars" :key="item.id" :value="item.id">
              {{ item.code }} - {{ item.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Siswa Anggota</label>
          <select v-model="progressForm.student_id" class="w-full rounded border px-3 py-2">
            <option :value="null">Pilih Siswa</option>
            <option v-for="member in formMembers" :key="member.id" :value="member.student_id">
              {{ member.student?.full_name }}
            </option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Tahun Ajaran</label>
          <select v-model="progressForm.academic_year_id" class="w-full rounded border px-3 py-2">
            <option v-for="item in academicYears" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Aspek</label>
          <select v-model="progressForm.aspect_id" class="w-full rounded border px-3 py-2">
            <option :value="null">Pilih Aspek</option>
            <option v-for="item in formAspects.filter(a => a.is_active)" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Session (Opsional)</label>
          <select v-model="progressForm.session_id" class="w-full rounded border px-3 py-2">
            <option :value="null">Tanpa Session</option>
            <option v-for="item in formSessions" :key="item.id" :value="item.id">
              {{ item.session_date }} - {{ item.session_title || item.extracurricular?.name || 'Session' }}
            </option>
          </select>
        </div>
        <BaseInput v-model="progressForm.progress_date" type="date" label="Tanggal Perkembangan" required />
        <BaseInput v-model="progressForm.score" type="number" label="Nilai" />
        <BaseInput v-model="progressForm.predicate" label="Predikat" />
        <BaseInput v-model="progressForm.level" label="Level" />
        <BaseInput v-model="progressForm.note" label="Catatan" />
        <BaseInput v-model="progressForm.recommendation" label="Rekomendasi" />
      </div>
      <template #footer>
        <BaseButton variant="outline" class="mr-2" @click="showProgressModal = false">Batal</BaseButton>
        <BaseButton :loading="savingProgress" @click="saveProgress">Simpan</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import { extracurricularService } from '@/services/api/extracurricular.service'
import { academicYearService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

const { success, error } = useToast()
const authStore = useAuthStore()

const extracurriculars = ref([])
const academicYears = ref([])
const members = ref([])
const aspects = ref([])
const progresses = ref([])
const formMembers = ref([])
const formAspects = ref([])
const formSessions = ref([])

const selectedExtracurricularId = ref(null)
const selectedAcademicYearId = ref(null)

const loadingAspects = ref(false)
const loadingProgress = ref(false)
const loadingMembers = ref(false)
const savingAspect = ref(false)
const savingProgress = ref(false)

const showAspectModal = ref(false)
const showProgressModal = ref(false)

const canManageAspect = computed(() => authStore.hasAnyPermission(['extracurricular.progress.create', 'extracurricular.progress.update']))
const selectedExtracurricular = computed(() => extracurriculars.value.find(item => item.id === selectedExtracurricularId.value) || null)
const displayedProgresses = computed(() => {
  const keyword = (filters.search || '').trim().toLowerCase()
  if (!keyword) return progresses.value

  return progresses.value.filter((item) => {
    const haystack = [
      item.student?.full_name,
      item.aspect?.name,
      item.predicate,
      item.level,
      item.note,
      item.recommendation
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(keyword)
  })
})

const filters = reactive({
  student_id: null,
  aspect_id: null,
  date_from: '',
  date_to: '',
  search: ''
})

const aspectForm = reactive({
  id: null,
  extracurricular_id: null,
  name: '',
  description: ''
})

const progressForm = reactive({
  id: null,
  extracurricular_id: null,
  student_id: null,
  academic_year_id: null,
  session_id: null,
  aspect_id: null,
  progress_date: '',
  score: '',
  predicate: '',
  level: '',
  note: '',
  recommendation: ''
})

const aspectCols = [
  { key: 'extracurricular_name', label: 'Ekskul' },
  { key: 'name', label: 'Aspek' },
  { key: 'is_active', label: 'Status' },
  { key: 'actions', label: 'Aksi' }
]

const progressCols = [
  { key: 'extracurricular_name', label: 'Ekskul' },
  { key: 'student_name', label: 'Siswa' },
  { key: 'aspect_name', label: 'Aspek' },
  { key: 'session_name', label: 'Session' },
  { key: 'score', label: 'Nilai' },
  { key: 'progress_date', label: 'Tanggal' },
  { key: 'actions', label: 'Aksi' }
]

function getErrorMessage(err, fallback) {
  return err?.response?.data?.message || err?.response?.data?.error || fallback
}

function getActiveAcademicYearId() {
  const active = academicYears.value.find(item => item.is_active)
  return active?.id || academicYears.value[0]?.id || null
}

function resetFilters() {
  filters.student_id = null
  filters.aspect_id = null
  filters.date_from = ''
  filters.date_to = ''
  filters.search = ''
  loadProgress()
}

async function applyFilters() {
  await loadProgress()
}

async function loadMembersForSelected() {
  if (!selectedExtracurricularId.value) {
    members.value = []
    return
  }

  loadingMembers.value = true
  try {
    const res = await extracurricularService.getMembersByExtracurricular(selectedExtracurricularId.value, {
      status: 'ACTIVE',
      academic_year_id: selectedAcademicYearId.value || undefined,
      limit: 400
    })
    members.value = res.data?.items || []
  } catch (err) {
    members.value = []
    error(getErrorMessage(err, 'Gagal memuat anggota ekskul'))
  } finally {
    loadingMembers.value = false
  }
}

async function loadAspects() {
  if (!selectedExtracurricularId.value) {
    aspects.value = []
    return
  }

  loadingAspects.value = true
  try {
    const res = await extracurricularService.getProgressAspects({
      extracurricular_id: selectedExtracurricularId.value,
      limit: 300
    })
    aspects.value = res.data || []
  } catch (err) {
    aspects.value = []
    error(getErrorMessage(err, 'Gagal memuat aspek perkembangan'))
  } finally {
    loadingAspects.value = false
  }
}

async function loadProgress() {
  if (!selectedExtracurricularId.value) {
    progresses.value = []
    return
  }

  loadingProgress.value = true
  try {
    const params = {
      extracurricular_id: selectedExtracurricularId.value,
      academic_year_id: selectedAcademicYearId.value || undefined,
      student_id: filters.student_id || undefined,
      aspect_id: filters.aspect_id || undefined,
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
      limit: 500
    }
    const res = await extracurricularService.getStudentProgress(params)
    progresses.value = res.data?.items || []
  } catch (err) {
    progresses.value = []
    error(getErrorMessage(err, 'Gagal memuat data perkembangan'))
  } finally {
    loadingProgress.value = false
  }
}

async function reloadProgressData() {
  await Promise.all([loadMembersForSelected(), loadAspects()])
  await loadProgress()
}

async function onSelectExtracurricular() {
  filters.student_id = null
  filters.aspect_id = null
  await reloadProgressData()
}

function openAspectModal(item = null) {
  const defaults = {
    id: null,
    extracurricular_id: selectedExtracurricularId.value || extracurriculars.value[0]?.id || null,
    name: '',
    description: ''
  }
  Object.assign(aspectForm, defaults, item || {})
  showAspectModal.value = true
}

async function loadProgressFormDependencies(extracurricularId, academicYearId) {
  if (!extracurricularId) return

  const [memberRes, aspectRes, sessionRes] = await Promise.all([
    extracurricularService.getMembersByExtracurricular(extracurricularId, {
      status: 'ACTIVE',
      academic_year_id: academicYearId || undefined,
      limit: 400
    }),
    extracurricularService.getProgressAspects({
      extracurricular_id: extracurricularId,
      limit: 300
    }),
    extracurricularService.getSessions({
      extracurricular_id: extracurricularId,
      academic_year_id: academicYearId || undefined,
      limit: 300
    })
  ])

  formMembers.value = memberRes.data?.items || []
  formAspects.value = aspectRes.data || []
  formSessions.value = sessionRes.data?.items || []
}

async function onProgressExtracurricularChange() {
  progressForm.student_id = null
  progressForm.aspect_id = null
  progressForm.session_id = null
  try {
    await loadProgressFormDependencies(progressForm.extracurricular_id, progressForm.academic_year_id)
  } catch (err) {
    error(getErrorMessage(err, 'Gagal memuat data pendukung form'))
  }
}

async function openProgressModal(item = null) {
  const defaults = {
    id: null,
    extracurricular_id: selectedExtracurricularId.value || extracurriculars.value[0]?.id || null,
    student_id: null,
    academic_year_id: selectedAcademicYearId.value || getActiveAcademicYearId(),
    session_id: null,
    aspect_id: null,
    progress_date: new Date().toISOString().slice(0, 10),
    score: '',
    predicate: '',
    level: '',
    note: '',
    recommendation: ''
  }

  Object.assign(progressForm, defaults)

  if (item) {
    Object.assign(progressForm, {
      id: item.id,
      extracurricular_id: item.extracurricular_id,
      student_id: item.student_id,
      academic_year_id: item.academic_year_id,
      session_id: item.session_id,
      aspect_id: item.aspect_id,
      progress_date: item.progress_date || '',
      score: item.score ?? '',
      predicate: item.predicate || '',
      level: item.level || '',
      note: item.note || '',
      recommendation: item.recommendation || ''
    })
  }

  try {
    await loadProgressFormDependencies(progressForm.extracurricular_id, progressForm.academic_year_id)
    showProgressModal.value = true
  } catch (err) {
    error(getErrorMessage(err, 'Gagal menyiapkan form perkembangan'))
  }
}

async function saveAspect() {
  if (!aspectForm.extracurricular_id) {
    error('Ekskul wajib dipilih')
    return
  }
  if (!aspectForm.name) {
    error('Nama aspek wajib diisi')
    return
  }

  savingAspect.value = true
  try {
    if (aspectForm.id) await extracurricularService.updateProgressAspect(aspectForm.id, aspectForm)
    else await extracurricularService.createProgressAspect(aspectForm)

    success('Aspek perkembangan berhasil disimpan')
    showAspectModal.value = false

    if (selectedExtracurricularId.value === aspectForm.extracurricular_id) {
      await loadAspects()
    }
  } catch (err) {
    error(getErrorMessage(err, 'Gagal menyimpan aspek perkembangan'))
  } finally {
    savingAspect.value = false
  }
}

async function toggleAspect(item) {
  try {
    await extracurricularService.toggleProgressAspect(item.id)
    success('Status aspek berhasil diperbarui')
    await loadAspects()
  } catch (err) {
    error(getErrorMessage(err, 'Gagal mengubah status aspek'))
  }
}

async function handleDeleteAspect(item) {
  const ok = window.confirm(`Hapus aspek "${item.name}"?`)
  if (!ok) return

  try {
    await extracurricularService.deleteProgressAspect(item.id)
    success('Aspek perkembangan berhasil dihapus')
    await loadAspects()
  } catch (err) {
    error(getErrorMessage(err, 'Gagal menghapus aspek perkembangan'))
  }
}

function normalizeNullable(value) {
  if (value === '' || value === undefined) return null
  return value
}

function normalizeScore(value) {
  if (value === '' || value === null || value === undefined) return null
  const casted = Number(value)
  return Number.isNaN(casted) ? null : casted
}

async function saveProgress() {
  if (!progressForm.extracurricular_id) {
    error('Ekskul wajib dipilih')
    return
  }
  if (!progressForm.student_id) {
    error('Siswa wajib dipilih dari anggota ekskul')
    return
  }
  if (!progressForm.academic_year_id) {
    error('Tahun ajaran wajib diisi')
    return
  }
  if (!progressForm.aspect_id) {
    error('Aspek perkembangan wajib dipilih')
    return
  }
  if (!progressForm.progress_date) {
    error('Tanggal perkembangan wajib diisi')
    return
  }

  const payload = {
    extracurricular_id: progressForm.extracurricular_id,
    student_id: progressForm.student_id,
    academic_year_id: progressForm.academic_year_id,
    session_id: normalizeNullable(progressForm.session_id),
    aspect_id: progressForm.aspect_id,
    progress_date: progressForm.progress_date,
    score: normalizeScore(progressForm.score),
    predicate: normalizeNullable(progressForm.predicate),
    level: normalizeNullable(progressForm.level),
    note: normalizeNullable(progressForm.note),
    recommendation: normalizeNullable(progressForm.recommendation)
  }

  savingProgress.value = true
  try {
    if (progressForm.id) await extracurricularService.updateStudentProgress(progressForm.id, payload)
    else await extracurricularService.createStudentProgress(payload)

    success('Data perkembangan siswa berhasil disimpan')
    showProgressModal.value = false

    selectedExtracurricularId.value = payload.extracurricular_id
    selectedAcademicYearId.value = payload.academic_year_id
    await reloadProgressData()
  } catch (err) {
    error(getErrorMessage(err, 'Gagal menyimpan perkembangan siswa'))
  } finally {
    savingProgress.value = false
  }
}

async function handleDeleteProgress(item) {
  const ok = window.confirm(`Hapus data perkembangan siswa "${item.student?.full_name || ''}" pada tanggal ${item.progress_date}?`)
  if (!ok) return

  try {
    await extracurricularService.deleteStudentProgress(item.id)
    success('Data perkembangan siswa berhasil dihapus')
    await loadProgress()
  } catch (err) {
    error(getErrorMessage(err, 'Gagal menghapus data perkembangan'))
  }
}

onMounted(async () => {
  try {
    const [exRes, yearRes] = await Promise.all([
      extracurricularService.getExtracurriculars({ limit: 300, is_active: true }),
      academicYearService.getAll({ limit: 100 })
    ])

    extracurriculars.value = exRes.data?.items || []
    academicYears.value = yearRes.data?.academicYears || []
    selectedAcademicYearId.value = getActiveAcademicYearId()
    selectedExtracurricularId.value = extracurriculars.value[0]?.id || null

    await reloadProgressData()
  } catch (err) {
    error(getErrorMessage(err, 'Gagal memuat halaman perkembangan ekskul'))
  }
})
</script>
