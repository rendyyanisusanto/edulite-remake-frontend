<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Laporan Toilet Siswa</h1>
        <p class="text-sm text-gray-500 mt-1">Rekap trip, durasi, dan ranking penggunaan toilet langsung dari database.</p>
      </div>
      <BaseButton variant="outline" @click="loadData" :loading="loading">Refresh Data</BaseButton>
    </div>

    <div class="grid md:grid-cols-4 gap-3">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Siswa Tercatat</p>
        <p class="text-3xl font-black text-blue-600 mt-1">{{ totalStudents }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Total Trip</p>
        <p class="text-3xl font-black text-emerald-600 mt-1">{{ totalTrips }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Total Durasi</p>
        <p class="text-3xl font-black text-amber-600 mt-1">{{ formatDuration(totalDurationMinutes) }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="text-xs text-gray-500">Sedang OUT</p>
        <p class="text-3xl font-black text-rose-600 mt-1">{{ currentlyOut.length }}</p>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2">
      <input v-model="filters.date" type="date" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm" />
      <select v-model="filters.class_id" class="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm min-w-40">
        <option value="">Semua Kelas</option>
        <option v-for="klass in classes" :key="klass.id" :value="String(klass.id)">{{ klass.name }}</option>
      </select>
      <BaseButton variant="outline" @click="applyFilter">Generate Rekap</BaseButton>
      <BaseButton variant="outline" @click="resetFilter">Reset</BaseButton>
      <p class="text-xs text-gray-500 ml-auto">Update: {{ lastUpdated ? formatDateTime(lastUpdated) : '-' }}</p>
    </div>

    <div class="grid md:grid-cols-2 gap-4">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h2 class="font-semibold text-gray-800 mb-3">Ranking Paling Sering</h2>
        <div v-if="rankingTrips.length" class="space-y-2">
          <div v-for="item in rankingTrips" :key="item.student_id" class="flex justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <span class="font-medium">{{ item.full_name || '-' }}</span>
            <span class="font-semibold text-blue-700">{{ item.total_trips }} trip</span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500">Tidak ada data.</p>
      </div>

      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h2 class="font-semibold text-gray-800 mb-3">Ranking Durasi Terlama</h2>
        <div v-if="rankingDuration.length" class="space-y-2">
          <div v-for="item in rankingDuration" :key="item.student_id" class="flex justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <span class="font-medium">{{ item.full_name || '-' }}</span>
            <span class="font-semibold text-amber-700">{{ formatDuration(item.total_duration_minutes) }}</span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500">Tidak ada data.</p>
      </div>
    </div>

    <BaseTable
      :columns="columns"
      :data="currentlyOut"
      :loading="loading"
      :showActions="false"
      :showPagination="false"
    >
      <template #cell-student="{ item }">
        <div>
          <p class="font-semibold text-gray-900">{{ item.student?.full_name || '-' }}</p>
          <p class="text-xs text-gray-500">NIS: {{ item.student?.nis || '-' }}</p>
        </div>
      </template>
      <template #cell-class_info="{ item }">{{ item.class_info?.name || '-' }}</template>
      <template #cell-exit_at="{ item }">{{ formatDateTime(item.exit_at) }}</template>
      <template #cell-duration="{ item }">{{ getOutDuration(item.exit_at) }}</template>
    </BaseTable>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import toiletService from '@/services/api/studentToiletRfid.service'
import { classService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { error: showError } = useToast()

const today = new Date().toISOString().slice(0, 10)
const loading = ref(false)
const lastUpdated = ref(null)
const classes = ref([])
const byStudent = ref([])
const rankingTrips = ref([])
const rankingDuration = ref([])
const currentlyOut = ref([])

const filters = reactive({
  date: today,
  class_id: ''
})

const columns = [
  { key: 'student', label: 'Siswa', sortable: false },
  { key: 'class_info', label: 'Kelas', sortable: false },
  { key: 'exit_at', label: 'Keluar', sortable: false },
  { key: 'duration', label: 'Durasi OUT', sortable: false }
]

const totalStudents = computed(() => byStudent.value.length)
const totalTrips = computed(() => byStudent.value.reduce((acc, item) => acc + Number(item.total_trips || 0), 0))
const totalDurationMinutes = computed(() => byStudent.value.reduce((acc, item) => acc + Number(item.total_duration_minutes || 0), 0))

const formatDateTime = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID')
}

const formatDuration = (minutes) => {
  const value = Number(minutes || 0)
  if (value < 1) return '0 menit'

  const hours = Math.floor(value / 60)
  const remainMinutes = value % 60

  if (!hours) return `${remainMinutes} menit`
  if (!remainMinutes) return `${hours} jam`
  return `${hours} jam ${remainMinutes} menit`
}

const getOutDuration = (exitAt) => {
  if (!exitAt) return '-'
  const elapsedMs = Date.now() - new Date(exitAt).getTime()
  const elapsedMinutes = Math.max(0, Math.floor(elapsedMs / 60000))
  return formatDuration(elapsedMinutes)
}

const loadClasses = async () => {
  try {
    const response = await classService.getAll({ page: 1, limit: 300 })
    classes.value = response?.data?.classes || []
  } catch (err) {
    showError('Gagal memuat data kelas')
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      date: filters.date || today,
      class_id: filters.class_id || undefined
    }

    const response = await toiletService.getSummary(params)
    const payload = response?.data || {}

    byStudent.value = payload.by_student || []
    rankingTrips.value = payload.ranking_most_trips || []
    rankingDuration.value = payload.ranking_longest_duration || []
    currentlyOut.value = payload.currently_out || []
    lastUpdated.value = new Date().toISOString()
  } catch (err) {
    showError('Gagal memuat laporan toilet siswa')
  } finally {
    loading.value = false
  }
}

const applyFilter = async () => {
  await loadData()
}

const resetFilter = async () => {
  filters.date = today
  filters.class_id = ''
  await loadData()
}

onMounted(async () => {
  await Promise.all([loadClasses(), loadData()])
})
</script>
