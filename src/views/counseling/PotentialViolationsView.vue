<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">Potensi Pelanggaran</h1>
        <p class="text-sm text-gray-500 mt-1">Daftar siswa yang tidak hadir di absensi RFID dan Tahfidz pada tanggal tertentu.</p>
      </div>
      <div>
        <BaseButton @click="openConvertModal" :disabled="selectedStudents.length === 0" class="shadow-sm">
          Konversi Pelanggaran ({{ selectedStudents.length }})
        </BaseButton>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-end gap-5">
      <div class="w-full sm:w-auto">
        <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Tanggal</label>
        <input 
          id="date-filter" 
          v-model="selectedDate" 
          type="date" 
          @change="applyFilter" 
          class="block w-full sm:w-48 rounded-lg border-gray-300 px-3 py-2.5 border bg-white focus:ring-primary focus:border-primary sm:text-sm transition-colors duration-200"
        />
      </div>
      
      <div class="w-full sm:w-auto">
        <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Kelas</label>
        <select 
          v-model="selectedClass" 
          @change="applyFilter" 
          class="block w-full sm:w-48 rounded-lg border-gray-300 px-3 py-2.5 border bg-white focus:ring-primary focus:border-primary sm:text-sm transition-colors duration-200"
        >
          <option value="">Semua Kelas</option>
          <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      
      <div class="w-full sm:w-auto">
        <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Jenis Kelamin</label>
        <div class="flex items-center gap-5 bg-gray-50/80 px-4 py-2 rounded-lg border border-gray-200 h-[42px]">
          <label class="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" v-model="selectedGenderL" @change="applyFilter" class="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 transition-colors">
            <span class="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">Putra</span>
          </label>
          <div class="w-px h-4 bg-gray-300"></div>
          <label class="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" v-model="selectedGenderP" @change="applyFilter" class="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 transition-colors">
            <span class="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">Putri</span>
          </label>
        </div>
      </div>
    </div>

    <!-- We use a custom table for selection or standard BaseTable if it supports checkboxes.
         For simplicity, we'll build a standard table or extend BaseTable -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-500">
        Memuat data...
      </div>
      <div v-else-if="items.length === 0" class="p-8 text-center text-gray-500">
        Tidak ada potensi pelanggaran untuk tanggal yang dipilih.
      </div>
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
              <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="rounded border-gray-300 text-primary focus:ring-primary" />
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absen Harian</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absen Tahfidz</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in items" :key="item.id" class="hover:bg-primary/5 transition-colors duration-150 cursor-pointer" @click="toggleSelect(item.id)">
            <td class="px-6 py-4 whitespace-nowrap">
              <input type="checkbox" :value="item.id" v-model="selectedStudents" @click.stop class="rounded border-gray-300 text-primary focus:ring-primary" />
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="font-medium text-gray-900">{{ item.full_name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500">
              {{ item.nis || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500">
              {{ item.class_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500">
              <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                {{ item.daily_status || 'Alpha' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500">
              <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                {{ item.tahfidz_status || 'Alpha' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pagination Controls -->
      <div v-if="totalItems > 0" class="px-6 py-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-sm text-gray-600">
          Menampilkan <span class="font-bold text-gray-900">{{ (currentPage - 1) * pageSize + 1 }}</span> hingga 
          <span class="font-bold text-gray-900">{{ Math.min(currentPage * pageSize, totalItems) }}</span> dari 
          <span class="font-bold text-gray-900">{{ totalItems }}</span> hasil
        </div>
        <div class="flex gap-2">
          <button 
            class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold bg-white text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 shadow-sm"
            :disabled="currentPage === 1" 
            @click="prevPage"
          >
            Sebelumnya
          </button>
          <button 
            class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold bg-white text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 shadow-sm"
            :disabled="currentPage === totalPages" 
            @click="nextPage"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>

    <!-- Convert Modal -->
    <BaseModal v-model="showModal" title="Konversi ke Pelanggaran" maxWidth="xl">
      <form @submit.prevent="submitConversion" class="space-y-4">
        <p class="text-sm text-gray-600 mb-4">
          Akan membuat rekaman pelanggaran untuk <strong>{{ selectedStudents.length }}</strong> siswa pada tanggal <strong>{{ selectedDate }}</strong>.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <BaseSearchSelect
              v-model="form.type_id"
              :initial-label="form.type_name"
              label="Jenis Pelanggaran"
              placeholder="Ketik nama jenis pelanggaran..."
              :fetch-options="fetchViolationTypeOptions"
              required
            />
          </div>

          <BaseInput id="date" v-model="selectedDate" type="date" label="Tanggal Kejadian" disabled />
          <BaseInput id="location" v-model="form.location" label="Lokasi" placeholder="Contoh: Halaman Sekolah" />

          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Keterangan / Kronologi</label>
            <textarea 
              v-model="form.description" 
              rows="3" 
              class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" 
              placeholder="Deskripsi kejadian..."
            ></textarea>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
            <select v-model="form.academic_year_id" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50">
              <option value="">Otomatis (Tahun Aktif)</option>
              <option v-for="y in academicYears" :key="y.id" :value="y.id">{{ y.name }}</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select v-model="form.status" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50">
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Disetujui</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </div>
        </div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="submitConversion" :loading="saving">Simpan Konversi</BaseButton>
      </template>
    </BaseModal>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseSearchSelect from '@/components/forms/BaseSearchSelect.vue'
import { studentViolationService, violationTypeService } from '@/services/api/violation.service'
import classSetupService from '@/services/api/classSetup.service'
import { academicYearService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()

const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedClass = ref('')
const selectedGenderL = ref(true)
const selectedGenderP = ref(true)
const classes = ref([])
const academicYears = ref([])

const items = ref([])
const totalItems = ref(0)
const allIds = ref([])
const loading = ref(false)
const selectedStudents = ref([])

// Pagination state
const currentPage = ref(1)
const pageSize = ref(20)

const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchData()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchData()
  }
}

const applyFilter = () => {
  currentPage.value = 1
  fetchData(true)
}

const showModal = ref(false)
const saving = ref(false)
const form = reactive({
  type_id: '',
  type_name: '',
  location: '',
  academic_year_id: '',
  status: 'PENDING',
  description: 'Dikonversi dari ketidakhadiran (Tanpa Keterangan)'
})

const isAllSelected = computed(() => {
  if (items.value.length === 0) return false
  return items.value.every(item => selectedStudents.value.includes(item.id))
})

const toggleSelectAll = (e) => {
  if (e.target.checked) {
    items.value.forEach(item => {
      if (!selectedStudents.value.includes(item.id)) {
        selectedStudents.value.push(item.id)
      }
    })
  } else {
    items.value.forEach(item => {
      const index = selectedStudents.value.indexOf(item.id)
      if (index !== -1) {
        selectedStudents.value.splice(index, 1)
      }
    })
  }
}

const toggleSelect = (id) => {
  const index = selectedStudents.value.indexOf(id)
  if (index === -1) {
    selectedStudents.value.push(id)
  } else {
    selectedStudents.value.splice(index, 1)
  }
}

const loadClasses = async () => {
  try {
    const res = await classSetupService.getAll({ limit: 100 })
    if (res.success) {
      classes.value = res.data.classes || []
    }
  } catch (e) {
    console.error('Failed to load classes', e)
  }
}

const loadAcademicYears = async () => {
  try {
    const r = await academicYearService.getAll({ limit: 100 })
    if (r.success) {
      academicYears.value = r.data.academicYears || []
    }
  } catch (e) {}
}

const fetchData = async (resetSelection = false) => {
  loading.value = true
  
  let genderParam = ''
  if (selectedGenderL.value && selectedGenderP.value) {
    genderParam = 'L,P'
  } else if (selectedGenderL.value) {
    genderParam = 'L'
  } else if (selectedGenderP.value) {
    genderParam = 'P'
  } else {
    items.value = []
    totalItems.value = 0
    loading.value = false
    return
  }

  try {
    const res = await studentViolationService.getPotentialViolations({
      date: selectedDate.value,
      class_id: selectedClass.value,
      gender: genderParam,
      page: currentPage.value,
      limit: pageSize.value
    })
    if (res.success) {
      items.value = res.data?.data || []
      totalItems.value = res.data?.total || 0
      allIds.value = res.data?.allIds || []
      
      if (resetSelection) {
        selectedStudents.value = []
      }
    }
  } catch (e) {
    showError('Gagal mengambil data potensi pelanggaran')
  } finally {
    loading.value = false
  }
}

const fetchViolationTypeOptions = async (query) => {
  try {
    const r = await violationTypeService.getAll({ search: query, limit: 30 })
    const types = r.data.violationTypes || []
    return types.map(t => ({
      value: t.id,
      label: t.name,
      description: `Poin: ${t.point} — ${t.level?.name || 'Tanpa Level'}`
    }))
  } catch (e) { return [] }
}

const openConvertModal = () => {
  if (selectedStudents.value.length === 0) return
  form.type_id = ''
  form.type_name = ''
  form.location = ''
  form.academic_year_id = ''
  form.status = 'PENDING'
  form.description = 'Dikonversi dari ketidakhadiran (Tanpa Keterangan)'
  showModal.value = true
}

const submitConversion = async () => {
  if (!form.type_id) return showError('Pilih jenis pelanggaran terlebih dahulu!')
  
  saving.value = true
  try {
    await studentViolationService.convertPotentialViolations({
      student_ids: selectedStudents.value,
      date: selectedDate.value,
      type_id: form.type_id,
      description: form.description,
      location: form.location,
      academic_year_id: form.academic_year_id,
      status: form.status
    })
    success('Berhasil mengonversi pelanggaran')
    showModal.value = false
    fetchData(true)
  } catch (e) {
    showError('Gagal melakukan konversi pelanggaran')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadClasses()
  loadAcademicYears()
  fetchData(true)
})
</script>
