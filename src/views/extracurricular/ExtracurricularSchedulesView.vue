<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">Jadwal Ekskul</h1>
      <BaseButton @click="openModal()">Tambah Jadwal</BaseButton>
    </div>

    <BaseTable :columns="columns" :data="items" :loading="loading" :showPagination="false" :showActions="false">
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2">
          <button @click="openModal(item)" class="text-blue-600 hover:text-blue-900 mx-1" title="Edit">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="showModal" :title="form.id ? 'Edit Jadwal' : 'Tambah Jadwal'">
      <div class="space-y-3">
        <div>
          <label class="text-sm font-medium">Ekskul</label>
          <select v-model="form.extracurricular_id" class="w-full border rounded px-3 py-2">
            <option v-for="e in extracurriculars" :key="e.id" :value="e.id">{{ e.code }} - {{ e.name }}</option>
          </select>
        </div>
        <BaseInput v-model="form.title" label="Judul" />
        <div>
          <label class="text-sm font-medium">Hari</label>
          <select v-model="form.day_of_week" class="w-full border rounded px-3 py-2">
            <option v-for="d in days" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
        <BaseInput v-model="form.start_time" type="time" label="Jam Mulai" />
        <BaseInput v-model="form.end_time" type="time" label="Jam Selesai" />
      </div>
      <template #footer>
        <BaseButton variant="outline" class="mr-2" @click="showModal = false">Batal</BaseButton>
        <BaseButton @click="save">Simpan</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import { extracurricularService } from '@/services/api/extracurricular.service'
import { useToast } from '@/composables/useToast'

const { success, error } = useToast()
const loading = ref(false)
const items = ref([])
const extracurriculars = ref([])
const showModal = ref(false)
const days = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']
const form = reactive({ id: null, extracurricular_id: null, title: '', day_of_week: 'MONDAY', start_time: '', end_time: '' })

const columns = [
  { key: 'extracurricular_name', label: 'Ekskul' },
  { key: 'title', label: 'Judul' },
  { key: 'day_of_week', label: 'Hari' },
  { key: 'start_time', label: 'Mulai' },
  { key: 'end_time', label: 'Selesai' },
  { key: 'actions', label: 'Aksi' }
]

async function load() {
  loading.value = true
  try {
    const r = await extracurricularService.getSchedules({ limit: 300 })
    items.value = (r.data || []).map(it => ({ ...it, extracurricular_name: it.extracurricular?.name || '-' }))
  } catch { error('Gagal memuat jadwal') }
  finally { loading.value = false }
}

function openModal(item = null) {
  Object.assign(form, item || { id: null, extracurricular_id: null, title: '', day_of_week: 'MONDAY', start_time: '', end_time: '' })
  showModal.value = true
}

async function save() {
  try {
    if (form.id) await extracurricularService.updateSchedule(form.id, form)
    else await extracurricularService.createSchedule(form)
    success('Jadwal tersimpan')
    showModal.value = false
    load()
  } catch { error('Gagal simpan jadwal') }
}

onMounted(async () => {
  await load()
  const e = await extracurricularService.getExtracurriculars({ limit: 200 })
  extracurriculars.value = e.data?.items || []
})
</script>
