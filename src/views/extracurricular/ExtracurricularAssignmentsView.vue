<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">Assignment Pelatih Ekskul</h1>
      <BaseButton @click="openModal()">Tambah Assignment</BaseButton>
    </div>

    <BaseTable :columns="columns" :data="items" :loading="loading" :showPagination="false" :showActions="false">
      <template #cell-is_active="{ value }">{{ value ? 'Aktif' : 'Nonaktif' }}</template>
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2">
          <button @click="openModal(item)" class="text-blue-600 hover:text-blue-900 mx-1" title="Edit">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button @click="remove(item)" class="text-red-600 hover:text-red-900 mx-1" title="Hapus">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
          <button
            @click="toggle(item)"
            class="text-amber-600 hover:text-amber-800 mx-1"
            :title="item.is_active ? 'Nonaktifkan' : 'Aktifkan'"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </button>
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="showModal" :title="form.id ? 'Edit Assignment' : 'Tambah Assignment'">
      <div class="space-y-3">
        <div>
          <label class="text-sm font-medium">Ekskul</label>
          <select v-model="form.extracurricular_id" class="w-full border rounded px-3 py-2">
            <option v-for="e in extracurriculars" :key="e.id" :value="e.id">{{ e.code }} - {{ e.name }}</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium">Pelatih</label>
          <select v-model="form.coach_id" class="w-full border rounded px-3 py-2">
            <option v-for="c in coaches" :key="c.id" :value="c.id">{{ c.full_name }} ({{ c.coach_type }})</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium">Role</label>
          <select v-model="form.role" class="w-full border rounded px-3 py-2">
            <option value="KEPALA_PELATIH">KEPALA_PELATIH</option>
            <option value="ASISTEN">ASISTEN</option>
            <option value="PENDAMPING">PENDAMPING</option>
          </select>
        </div>
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
import { extracurricularService } from '@/services/api/extracurricular.service'
import { useToast } from '@/composables/useToast'

const { success, error } = useToast()
const loading = ref(false)
const items = ref([])
const extracurriculars = ref([])
const coaches = ref([])
const showModal = ref(false)
const form = reactive({ id: null, extracurricular_id: null, coach_id: null, role: 'ASISTEN' })

const columns = [
  { key: 'extracurricular.name', label: 'Ekskul' },
  { key: 'coach.full_name', label: 'Pelatih' },
  { key: 'role', label: 'Role' },
  { key: 'is_active', label: 'Status' },
  { key: 'actions', label: 'Aksi' }
]

async function load() {
  loading.value = true
  try {
    const r = await extracurricularService.getAssignments({ limit: 200 })
    items.value = (r.data.items || []).map(it => ({ ...it, 'extracurricular.name': it.extracurricular?.name, 'coach.full_name': it.coach?.full_name }))
  } catch { error('Gagal memuat assignment') }
  finally { loading.value = false }
}

function openModal(item = null) {
  Object.assign(form, item || { id: null, extracurricular_id: null, coach_id: null, role: 'ASISTEN' })
  showModal.value = true
}

async function save() {
  try {
    if (form.id) await extracurricularService.updateAssignment(form.id, form)
    else await extracurricularService.createAssignment(form)
    success('Assignment tersimpan')
    showModal.value = false
    load()
  } catch { error('Gagal simpan assignment') }
}

async function toggle(item) {
  try { await extracurricularService.toggleAssignment(item.id); success('Status diperbarui'); load() } catch { error('Gagal ubah status') }
}

async function remove(item) {
  const ok = window.confirm(`Hapus assignment untuk ${item.coach?.full_name || 'pelatih ini'}?`)
  if (!ok) return
  try {
    await extracurricularService.deleteAssignment(item.id)
    success('Assignment berhasil dihapus')
    load()
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal menghapus assignment')
  }
}

onMounted(async () => {
  await load()
  const [e, c] = await Promise.all([
    extracurricularService.getExtracurriculars({ limit: 200 }),
    extracurricularService.getCoaches({ limit: 200 })
  ])
  extracurriculars.value = e.data?.items || []
  coaches.value = c.data?.items || []
})
</script>
