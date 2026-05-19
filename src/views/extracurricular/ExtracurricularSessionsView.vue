<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">Sesi Ekskul</h1>
      <BaseButton @click="openModal()">Buat Sesi</BaseButton>
    </div>

    <BaseTable :columns="columns" :data="items" :loading="loading" :showPagination="false" :showActions="false">
      <template #cell-extracurricular_name="{ item }">{{ item.extracurricular?.name }}</template>
      <template #cell-status="{ item }">
        <span
          class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
          :class="statusClass(item.status)"
        >
          {{ item.status }}
        </span>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex flex-wrap items-center gap-2">
          <BaseButton size="sm" variant="outline" @click="openModal(item)">Edit</BaseButton>
          <BaseButton
            v-if="item.status === 'OPEN'"
            size="sm"
            variant="warning"
            :loading="isActionLoading(item.id, 'close')"
            @click="closeSession(item)"
          >
            Close
          </BaseButton>
          <BaseButton
            v-else-if="item.status !== 'CANCELED'"
            size="sm"
            :loading="isActionLoading(item.id, 'open')"
            @click="openSession(item)"
          >
            Open
          </BaseButton>
          <BaseButton
            v-if="item.status !== 'CANCELED'"
            size="sm"
            variant="danger"
            :loading="isActionLoading(item.id, 'cancel')"
            @click="cancelSession(item)"
          >
            Cancel
          </BaseButton>
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="showModal" :title="form.id ? 'Edit Sesi' : 'Buat Sesi'">
      <div class="space-y-3">
        <div>
          <label class="text-sm font-medium">Ekskul</label>
          <select v-model="form.extracurricular_id" class="w-full border rounded px-3 py-2">
            <option v-for="e in extracurriculars" :key="e.id" :value="e.id">{{ e.code }} - {{ e.name }}</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium">Tahun Ajaran</label>
          <select v-model="form.academic_year_id" class="w-full border rounded px-3 py-2">
            <option v-for="a in academicYears" :key="a.id" :value="a.id">{{ a.name }}</option>
          </select>
        </div>
        <BaseInput v-model="form.session_title" label="Judul" />
        <BaseInput v-model="form.session_date" type="date" label="Tanggal" />
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
import { academicYearService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { success, error } = useToast()
const loading = ref(false)
const actionLoading = ref({ id: null, type: null })
const items = ref([])
const extracurriculars = ref([])
const academicYears = ref([])
const showModal = ref(false)
const form = reactive({ id: null, extracurricular_id: null, academic_year_id: null, session_title: '', session_date: '', start_time: '', end_time: '' })

const columns = [
  { key: 'extracurricular_name', label: 'Ekskul' },
  { key: 'session_title', label: 'Judul' },
  { key: 'session_date', label: 'Tanggal' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Aksi' }
]

function parseErrorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback
}

function isActionLoading(id, type) {
  return actionLoading.value.id === id && actionLoading.value.type === type
}

function statusClass(status) {
  if (status === 'OPEN') return 'bg-green-100 text-green-700'
  if (status === 'CLOSED') return 'bg-slate-100 text-slate-700'
  if (status === 'CANCELED') return 'bg-red-100 text-red-700'
  return 'bg-amber-100 text-amber-700'
}

async function load() {
  loading.value = true
  try {
    const r = await extracurricularService.getSessions({ limit: 200 })
    items.value = (r.data.items || []).map(it => ({ ...it, extracurricular_name: it.extracurricular?.name || '-' }))
  } catch (err) {
    error(parseErrorMessage(err, 'Gagal memuat sesi'))
  }
  finally { loading.value = false }
}

function openModal(item = null) {
  Object.assign(form, item || { id: null, extracurricular_id: null, academic_year_id: academicYears.value?.[0]?.id || null, session_title: '', session_date: '', start_time: '', end_time: '' })
  showModal.value = true
}

async function save() {
  try {
    if (form.id) await extracurricularService.updateSession(form.id, form)
    else await extracurricularService.createSession(form)
    success('Sesi tersimpan')
    showModal.value = false
    load()
  } catch (err) {
    error(parseErrorMessage(err, 'Gagal simpan sesi'))
  }
}

const openSession = async (item) => {
  actionLoading.value = { id: item.id, type: 'open' }
  try {
    await extracurricularService.openSession(item.id)
    success('Sesi dibuka')
    await load()
  } catch (err) {
    error(parseErrorMessage(err, 'Gagal open sesi'))
  } finally {
    actionLoading.value = { id: null, type: null }
  }
}

const closeSession = async (item) => {
  actionLoading.value = { id: item.id, type: 'close' }
  try {
    await extracurricularService.closeSession(item.id)
    success('Sesi ditutup')
    await load()
  } catch (err) {
    error(parseErrorMessage(err, 'Gagal close sesi'))
  } finally {
    actionLoading.value = { id: null, type: null }
  }
}

const cancelSession = async (item) => {
  const ok = window.confirm(`Batalkan sesi "${item.session_title || '-'}" pada ${item.session_date || '-'}?`)
  if (!ok) return

  actionLoading.value = { id: item.id, type: 'cancel' }
  try {
    await extracurricularService.cancelSession(item.id, {})
    success('Sesi dibatalkan')
    await load()
  } catch (err) {
    error(parseErrorMessage(err, 'Gagal cancel sesi'))
  } finally {
    actionLoading.value = { id: null, type: null }
  }
}

onMounted(async () => {
  try {
    await load()
    const [e, ay] = await Promise.all([
      extracurricularService.getExtracurriculars({ limit: 200 }),
      academicYearService.getAll({ limit: 100 })
    ])
    extracurriculars.value = e.data?.items || []
    academicYears.value = ay.data?.academicYears || []
  } catch (err) {
    error(parseErrorMessage(err, 'Gagal memuat data referensi sesi'))
  }
})
</script>
