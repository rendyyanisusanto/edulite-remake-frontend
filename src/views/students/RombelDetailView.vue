<template>
  <div class="space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
      <div>
        <button @click="$router.push('/rombels')" class="text-sm text-gray-500 hover:text-primary mb-1">← Kembali ke Rombel</button>
        <h1 class="text-2xl font-bold text-gray-800">{{ detail.name || 'Detail Rombel' }}</h1>
        <p class="text-sm text-gray-500">{{ detail.academic_year?.name || '-' }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="printReport" :disabled="printing" class="px-3 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 self-start disabled:opacity-60">
          {{ printing ? 'Mendownload...' : 'Cetak Laporan' }}
        </button>
        <button @click="showAddModal = true" class="px-3 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 self-start">Tambah Siswa</button>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
      <div><p class="text-gray-400">Tingkat</p><p class="font-semibold text-gray-800">{{ detail.grade?.name || '-' }}</p></div>
      <div><p class="text-gray-400">Jurusan</p><p class="font-semibold text-gray-800">{{ detail.department?.name || '-' }}</p></div>
      <div><p class="text-gray-400">Wali Kelas</p><p class="font-semibold text-gray-800">{{ detail.homeroom_teacher?.full_name || '-' }}</p></div>
      <div><p class="text-gray-400">Status</p><p class="font-semibold" :class="detail.status === 'TERISI' ? 'text-green-600' : 'text-gray-600'">{{ detail.status === 'TERISI' ? 'Terisi' : 'Kosong' }}</p></div>
      <div><p class="text-gray-400">Jumlah Siswa</p><p class="font-semibold text-gray-800">{{ detail.student_count || 0 }} siswa</p></div>
      <div v-if="detail.capacity"><p class="text-gray-400">Kapasitas</p><p class="font-semibold text-gray-800">{{ detail.capacity }}</p></div>
      <div v-if="detail.capacity"><p class="text-gray-400">Sisa Kapasitas</p><p class="font-semibold text-gray-800">{{ detail.remaining_capacity }}</p></div>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 class="text-base font-semibold text-gray-800">Anggota Rombel</h2>
          <p class="text-xs text-gray-500 mt-0.5">{{ totalStudents }} siswa ditemukan</p>
        </div>
        <input v-model="search" @input="onSearch" placeholder="Cari nama / NIS / NISN..." class="w-full sm:max-w-xs rounded-lg border border-gray-200 bg-gray-50 text-sm px-3 py-2" />
      </div>
      <div v-if="loadingStudents" class="p-4 space-y-2"><div v-for="i in 8" :key="i" class="h-10 rounded bg-gray-100 animate-pulse"></div></div>
      <div v-else-if="students.length === 0" class="p-10 text-center text-gray-500">
        <p>Belum ada siswa pada rombel ini.</p>
        <p class="text-sm text-gray-400 mt-1">Tambahkan siswa untuk mulai mengisi anggota rombel.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-600">
            <tr>
              <th class="px-3 py-2 text-left">No</th><th class="px-3 py-2 text-left">Nama</th><th class="px-3 py-2 text-left">NIS</th><th class="px-3 py-2 text-left">NISN</th><th class="px-3 py-2 text-left">L/P</th><th class="px-3 py-2 text-left">Tanggal Masuk</th><th class="px-3 py-2 text-left">Status</th><th class="px-3 py-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(student, index) in students" :key="student.history_id" class="border-t border-gray-100">
              <td class="px-3 py-2">{{ (page - 1) * limit + index + 1 }}</td>
              <td class="px-3 py-2">
                <div class="flex items-center gap-2">
                  <img v-if="student.photo" :src="student.photo" alt="Avatar siswa" class="w-8 h-8 rounded-full object-cover border border-gray-200" />
                  <div v-else class="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center border border-primary/20">
                    {{ student.full_name?.charAt(0)?.toUpperCase() || '?' }}
                  </div>
                  <span class="font-medium text-gray-800">{{ student.full_name }}</span>
                </div>
              </td>
              <td class="px-3 py-2">{{ student.nis || '-' }}</td>
              <td class="px-3 py-2">{{ student.nisn || '-' }}</td>
              <td class="px-3 py-2">
                <span class="px-2 py-1 rounded-full text-xs font-medium" :class="student.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'">
                  {{ student.gender || '-' }}
                </span>
              </td>
              <td class="px-3 py-2">{{ formatDate(student.assigned_at) }}</td>
              <td class="px-3 py-2"><span class="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Aktif</span></td>
              <td class="px-3 py-2 text-right">
                <router-link :to="`/students`" class="text-primary hover:underline mr-3">Lihat Profil</router-link>
                <button @click="confirmRemove(student)" class="text-red-600 hover:underline">Keluarkan</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="totalPages > 1" class="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
        <p class="text-gray-500">Halaman {{ page }} dari {{ totalPages }}</p>
        <div class="flex items-center gap-2">
          <button @click="prevPage" :disabled="page <= 1 || loadingStudents" class="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-50">Sebelumnya</button>
          <button @click="nextPage" :disabled="page >= totalPages || loadingStudents" class="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-50">Berikutnya</button>
        </div>
      </div>
    </div>

    <BaseModal v-model="showAddModal" title="Tambah Siswa ke Rombel" maxWidth="lg">
      <div class="space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <input v-model="unassignedSearch" @input="onUnassignedSearch" placeholder="Cari siswa..." class="w-full rounded-lg border border-gray-200 bg-gray-50 text-sm px-3 py-2" />
          <div class="flex items-center gap-2 shrink-0">
            <button @click="toggleSelectAllUnassigned" type="button" class="px-2.5 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
              {{ allUnassignedSelected ? 'Reset Pilih Semua' : 'Pilih Semua' }}
            </button>
          </div>
        </div>
        <p class="text-xs text-gray-500">{{ selectedStudentIds.length }} siswa dipilih</p>
        <div class="max-h-80 overflow-y-auto border border-gray-100 rounded-lg">
          <label v-for="student in unassignedStudents" :key="student.id" class="flex items-center gap-2 p-2 border-b border-gray-100 last:border-0 hover:bg-gray-50">
            <input type="checkbox" :value="student.id" v-model="selectedStudentIds" />
            <span class="text-sm text-gray-800">{{ student.full_name }}</span>
            <span class="text-xs text-gray-500 ml-auto">{{ student.nis || '-' }}</span>
          </label>
          <div v-if="!loadingUnassigned && unassignedStudents.length === 0" class="p-5 text-center text-sm text-gray-500">Tidak ada siswa tersedia.</div>
        </div>
      </div>
      <template #footer>
        <button @click="showAddModal = false" class="px-3 py-2 border border-gray-200 rounded-lg text-sm mr-2">Batal</button>
        <button @click="submitAddStudents" :disabled="saving || selectedStudentIds.length === 0" class="px-3 py-2 bg-primary text-white rounded-lg text-sm disabled:opacity-60">Simpan</button>
      </template>
    </BaseModal>

    <BaseModal v-model="showRemoveModal" title="Keluarkan Siswa?" maxWidth="sm">
      <p class="text-sm text-gray-600">Siswa akan dikeluarkan dari rombel pada tahun ajaran ini, tetapi riwayat kelas tetap tersimpan.</p>
      <template #footer>
        <button @click="showRemoveModal = false" class="px-3 py-2 border border-gray-200 rounded-lg text-sm mr-2">Batal</button>
        <button @click="submitRemoveStudent" :disabled="removing" class="px-3 py-2 bg-red-600 text-white rounded-lg text-sm">Keluarkan</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseModal from '@/components/modals/BaseModal.vue'
import classSetupService from '@/services/api/classSetup.service'
import classReportService from '@/services/api/classReport.service'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const { success, error: showError } = useToast()
const academicYearId = ref(route.query.academic_year_id || '')
const classId = ref(route.params.classId)

const detail = ref({})
const students = ref([])
const totalStudents = ref(0)
const totalPages = ref(1)
const page = ref(1)
const limit = ref(20)
const search = ref('')
const loadingStudents = ref(false)
const printing = ref(false)

const showAddModal = ref(false)
const unassignedStudents = ref([])
const unassignedSearch = ref('')
const loadingUnassigned = ref(false)
const selectedStudentIds = ref([])
const saving = ref(false)

const showRemoveModal = ref(false)
const removing = ref(false)
const selectedMember = ref(null)
let debounce
const allUnassignedSelected = computed(() => unassignedStudents.value.length > 0 && unassignedStudents.value.every((student) => selectedStudentIds.value.includes(student.id)))

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const loadDetail = async () => {
  try {
    const res = await classSetupService.getRombelDetail(classId.value, { academic_year_id: academicYearId.value })
    detail.value = res.data || {}
  } catch (err) {
    showError(err.message || 'Gagal memuat detail rombel')
  }
}

const loadStudents = async () => {
  loadingStudents.value = true
  try {
    const res = await classSetupService.getRombelStudents(classId.value, {
      academic_year_id: academicYearId.value,
      search: search.value || undefined,
      page: page.value,
      limit: limit.value
    })
    students.value = res?.data?.students || []
    totalStudents.value = Number(res?.data?.totalItems || 0)
    totalPages.value = Number(res?.data?.totalPages || 1)
  } catch (err) {
    showError(err.message || 'Gagal memuat anggota rombel')
  } finally {
    loadingStudents.value = false
  }
}

const loadUnassigned = async () => {
  loadingUnassigned.value = true
  try {
    const res = await classSetupService.getUnassignedStudents({
      academic_year_id: academicYearId.value,
      search: unassignedSearch.value || undefined,
      limit: 100
    })
    unassignedStudents.value = res?.data?.students || []
  } catch (err) {
    showError(err.message || 'Gagal memuat siswa belum kelas')
  } finally {
    loadingUnassigned.value = false
  }
}

const onSearch = () => {
  clearTimeout(debounce)
  debounce = setTimeout(() => {
    page.value = 1
    loadStudents()
  }, 350)
}

const onUnassignedSearch = () => {
  clearTimeout(debounce)
  debounce = setTimeout(loadUnassigned, 350)
}

const prevPage = () => {
  if (page.value <= 1) return
  page.value -= 1
  loadStudents()
}

const nextPage = () => {
  if (page.value >= totalPages.value) return
  page.value += 1
  loadStudents()
}

const toggleSelectAllUnassigned = () => {
  if (allUnassignedSelected.value) {
    selectedStudentIds.value = selectedStudentIds.value.filter((id) => !unassignedStudents.value.some((student) => student.id === id))
    return
  }
  selectedStudentIds.value = Array.from(new Set([...selectedStudentIds.value, ...unassignedStudents.value.map((student) => student.id)]))
}

const submitAddStudents = async () => {
  saving.value = true
  try {
    await classSetupService.bulkAssign({
      academic_year_id: academicYearId.value,
      grade_id: detail.value.grade?.id,
      class_id: classId.value,
      student_ids: selectedStudentIds.value
    })
    success('Siswa berhasil ditambahkan ke rombel')
    showAddModal.value = false
    selectedStudentIds.value = []
    await Promise.all([loadDetail(), loadStudents(), loadUnassigned()])
  } catch (err) {
    showError(err.message || 'Gagal menambahkan siswa')
  } finally {
    saving.value = false
  }
}

const confirmRemove = (student) => {
  selectedMember.value = student
  showRemoveModal.value = true
}

const submitRemoveStudent = async () => {
  if (!selectedMember.value) return
  removing.value = true
  try {
    await classSetupService.removeAssignment(selectedMember.value.history_id)
    success('Siswa berhasil dikeluarkan dari rombel')
    showRemoveModal.value = false
    await Promise.all([loadDetail(), loadStudents(), loadUnassigned()])
  } catch (err) {
    showError(err.message || 'Gagal mengeluarkan siswa')
  } finally {
    removing.value = false
  }
}

const printReport = async () => {
  try {
    printing.value = true
    const pdfBlob = await classReportService.printPdf(classId.value, academicYearId.value)
    const url = URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `laporan-siswa-${detail.value.name || 'kelas'}-${new Date().toISOString().slice(0, 10)}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    success('Laporan berhasil didownload')
  } catch (err) {
    showError(err.response?.data?.message || err.message || 'Gagal mendownload laporan')
  } finally {
    printing.value = false
  }
}

watch(showAddModal, (open) => {
  if (open) {
    selectedStudentIds.value = []
    loadUnassigned()
  }
})

onMounted(async () => {
  if (!academicYearId.value) {
    showError('academic_year_id wajib dikirim dari halaman rombel')
    return
  }
  await Promise.all([loadDetail(), loadStudents()])
})
</script>
