<template>
  <div class="space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Rombel</h1>
        <p class="text-sm text-gray-500 mt-1">Pengelolaan rombel berdasarkan tahun ajaran aktif.</p>
      </div>
      <div class="flex items-center gap-2">
        <button v-if="selectedAcademicYear" @click="downloadAll" :disabled="downloadingAll" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-60">
          <span v-if="downloadingAll" class="animate-spin">?</span>
          {{ downloadingAll ? 'Mendownload...' : 'Download Semua (ZIP)' }}
        </button>
        <button @click="refreshData" class="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:text-primary hover:bg-primary/5">
          <span :class="{ 'animate-spin': loading }">?</span>
          Refresh
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
      <select v-model="selectedAcademicYear" @change="onFilterChange" class="rounded-lg border border-gray-200 bg-gray-50 text-sm px-3 py-2">
        <option value="">Pilih Tahun Ajaran</option>
        <option v-for="year in academicYears" :key="year.id" :value="year.id">{{ year.name }}</option>
      </select>
      <select v-model="selectedGrade" @change="onFilterChange" class="rounded-lg border border-gray-200 bg-gray-50 text-sm px-3 py-2">
        <option value="">Semua Tingkat</option>
        <option v-for="grade in grades" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
      </select>
      <select v-model="selectedDepartment" @change="onFilterChange" class="rounded-lg border border-gray-200 bg-gray-50 text-sm px-3 py-2">
        <option value="">Semua Jurusan</option>
        <option v-for="department in departments" :key="department.id" :value="department.id">{{ department.name }}</option>
      </select>
      <div class="xl:col-span-2">
        <input v-model="search" @input="onSearch" placeholder="Cari kelas / jurusan / wali kelas..." class="w-full rounded-lg border border-gray-200 bg-gray-50 text-sm px-3 py-2" />
      </div>
    </div>

    <div v-if="!selectedAcademicYear" class="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
      Pilih tahun ajaran terlebih dahulu untuk melihat rombel.
    </div>

    <template v-else>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4"><p class="text-xs text-gray-500">Total Rombel</p><p class="text-2xl font-bold text-gray-800">{{ summary.total_rombel || 0 }}</p></div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4"><p class="text-xs text-gray-500">Total Siswa</p><p class="text-2xl font-bold text-gray-800">{{ summary.total_siswa || 0 }}</p></div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4"><p class="text-xs text-gray-500">Rombel Kosong</p><p class="text-2xl font-bold text-amber-600">{{ summary.rombel_kosong || 0 }}</p></div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4"><p class="text-xs text-gray-500">Belum Punya Kelas</p><p class="text-2xl font-bold text-red-600">{{ summary.siswa_belum_punya_kelas || 0 }}</p></div>
      </div>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="h-44 rounded-xl bg-gray-100 animate-pulse"></div>
      </div>
      <div v-else-if="rombels.length === 0" class="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center text-gray-500">
        Data rombel tidak ditemukan.
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <button
          v-for="rombel in rombels"
          :key="rombel.id"
          @click="openDetail(rombel)"
          class="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 p-4 transition-all duration-200"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <h3 class="text-xl font-bold text-gray-800 tracking-tight">{{ rombel.name }}</h3>
              <p class="text-xs text-gray-500 mt-0.5">{{ rombel.grade?.name || '-' }} • {{ rombel.department?.name || '-' }}</p>
            </div>
            <span class="text-xs px-2.5 py-1 rounded-full font-medium" :class="rombel.status === 'TERISI' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
              {{ rombel.status === 'TERISI' ? 'Terisi' : 'Kosong' }}
            </span>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-2">
            <div class="rounded-xl bg-gray-50 border border-gray-100 p-2.5">
              <p class="text-[11px] text-gray-500">Jumlah Siswa</p>
              <p class="text-base font-semibold text-gray-800">{{ rombel.student_count }}</p>
            </div>
            <div class="rounded-xl bg-gray-50 border border-gray-100 p-2.5">
              <p class="text-[11px] text-gray-500">Wali Kelas</p>
              <p class="text-xs font-medium text-gray-700 truncate">{{ rombel.homeroom_teacher?.full_name || '-' }}</p>
            </div>
          </div>

          <div v-if="rombel.capacity" class="mt-3">
            <div class="flex items-center justify-between mb-1">
              <p class="text-[11px] text-gray-500">Kapasitas</p>
              <p class="text-[11px] text-gray-600">{{ rombel.student_count }}/{{ rombel.capacity }}</p>
            </div>
            <div class="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-300" :class="rombel.student_count >= rombel.capacity ? 'bg-red-500' : 'bg-primary'" :style="{ width: `${Math.min(100, Math.round((rombel.student_count / rombel.capacity) * 100))}%` }"></div>
            </div>
          </div>

          <div class="mt-4">
            <span class="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              Lihat Detail Rombel
              <span class="transform transition-transform group-hover:translate-x-0.5">></span>
            </span>
          </div>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { academicYearService, gradeService, departmentService } from '@/services/api/academic.service'
import classSetupService from '@/services/api/classSetup.service'
import classReportService from '@/services/api/classReport.service'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { success, error: showError } = useToast()

const downloadingAll = ref(false)
const loading = ref(false)
const summary = ref({})
const rombels = ref([])
const academicYears = ref([])
const grades = ref([])
const departments = ref([])
const selectedAcademicYear = ref('')
const selectedGrade = ref('')
const selectedDepartment = ref('')
const search = ref('')
let debounce

const loadMaster = async () => {
  const [yearRes, gradeRes, departmentRes] = await Promise.all([
    academicYearService.getAll(),
    gradeService.getAll(),
    departmentService.getAll()
  ])
  academicYears.value = yearRes?.data?.academicYears || []
  grades.value = gradeRes?.data?.grades || []
  departments.value = departmentRes?.data?.departments || []
  const activeYear = academicYears.value.find((x) => x.is_active)
  if (activeYear) selectedAcademicYear.value = activeYear.id
}

const currentParams = () => ({
  academic_year_id: selectedAcademicYear.value,
  grade_id: selectedGrade.value || undefined,
  department_id: selectedDepartment.value || undefined,
  search: search.value || undefined
})

const loadData = async () => {
  if (!selectedAcademicYear.value) return
  loading.value = true
  try {
    const [summaryRes, listRes] = await Promise.all([
      classSetupService.getRombelSummary(currentParams()),
      classSetupService.getRombels(currentParams())
    ])
    summary.value = summaryRes?.data || {}
    rombels.value = listRes?.data || []
  } catch (err) {
    showError(err.message || 'Gagal memuat data rombel')
  } finally {
    loading.value = false
  }
}

const onFilterChange = () => loadData()
const onSearch = () => {
  clearTimeout(debounce)
  debounce = setTimeout(loadData, 400)
}
const refreshData = () => loadData()

const openDetail = (rombel) => {
  router.push({ name: 'RombelDetail', params: { classId: rombel.id }, query: { academic_year_id: selectedAcademicYear.value } })
}

const downloadAll = async () => {
  if (!selectedAcademicYear.value) return
  try {
    downloadingAll.value = true
    const zipBlob = await classReportService.downloadAllZipped(selectedAcademicYear.value)
    const url = URL.createObjectURL(new Blob([zipBlob], { type: 'application/zip' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `laporan-semua-kelas-${new Date().toISOString().slice(0, 10)}.zip`
    a.click()
    URL.revokeObjectURL(url)
    success('Laporan semua kelas berhasil didownload')
  } catch (err) {
    showError(err.message || 'Gagal mendownload laporan semua kelas')
  } finally {
    downloadingAll.value = false
  }
}

onMounted(async () => {
  await loadMaster()
  await loadData()
})
</script>

