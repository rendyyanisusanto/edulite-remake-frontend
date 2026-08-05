<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Jam Pelajaran</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola template dan susunan jam pembelajaran untuk kebutuhan jadwal serta presensi per mata pelajaran.</p>
      </div>
      <div class="flex gap-2">
        <BaseButton variant="outline" @click="openTemplateModal()">Tambah Template</BaseButton>
        <BaseButton @click="openPeriodModal()" :disabled="!selectedTemplate">Tambah Jam Pelajaran</BaseButton>
      </div>
    </div>

    <div v-if="loading" class="bg-white rounded-xl p-6 shadow-sm text-sm text-gray-500">Memuat data jam pelajaran...</div>
    <div v-else-if="loadError" class="bg-white rounded-xl p-6 shadow-sm text-sm text-red-600">Gagal memuat data jam pelajaran. Silakan coba lagi.</div>
    <div v-if="!loading && !loadError" class="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <div class="xl:col-span-4 space-y-3">
        <div class="bg-white rounded-xl p-3 shadow-sm">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Daftar Template</p>
        </div>
        <div v-for="item in templates" :key="item.id" class="rounded-xl p-4 bg-white shadow-sm cursor-pointer" :class="selectedTemplate?.id === item.id ? 'ring-2 ring-primary' : ''" @click="selectTemplate(item)">
          <div class="flex items-center justify-between"><p class="font-semibold text-gray-800">{{ item.name }}</p><span class="text-xs text-gray-500">{{ item.period_count }} periode</span></div>
          <p class="text-xs text-gray-500">Kode: {{ item.code }}</p>
          <div class="mt-2 flex items-center gap-2"><span v-if="item.is_default" class="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">Default</span><span :class="item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'" class="px-2 py-1 rounded-full text-xs font-semibold">{{ item.is_active ? 'Aktif' : 'Nonaktif' }}</span></div>
          <div class="mt-3 flex gap-2 text-xs">
            <button class="text-blue-600 hover:text-blue-900" title="Edit Template" @click.stop="openTemplateModal(item)">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
            <button class="text-amber-600 hover:text-amber-900" :title="item.is_active ? 'Nonaktifkan Template' : 'Aktifkan Template'" @click.stop="toggleTemplate(item)">
              <svg v-if="item.is_active" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6M5 12a7 7 0 1114 0 7 7 0 01-14 0z"/></svg>
              <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-6.518-3.754A1 1 0 007 8.28v7.44a1 1 0 001.234.972l6.518-1.63A1 1 0 0015.5 14.1v-2.064a1 1 0 00-.748-.968z"/></svg>
            </button>
            <button class="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed" title="Jadikan Default" @click.stop="setDefault(item)" :disabled="!item.is_active || item.is_default">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.08 3.322a1 1 0 00.95.69h3.493c.969 0 1.371 1.24.588 1.81l-2.826 2.054a1 1 0 00-.364 1.118l1.08 3.322c.3.921-.755 1.688-1.54 1.118l-2.826-2.054a1 1 0 00-1.176 0l-2.826 2.054c-.784.57-1.838-.197-1.539-1.118l1.08-3.322a1 1 0 00-.364-1.118L2.938 8.75c-.783-.57-.38-1.81.588-1.81h3.493a1 1 0 00.95-.69l1.08-3.322z"/></svg>
            </button>
          </div>
        </div>
        <div v-if="!loading && templates.length === 0" class="bg-white rounded-xl p-6 shadow-sm">
          <p class="text-sm text-gray-800">Belum ada template jam pelajaran.</p>
          <p class="text-sm text-gray-500 mt-1">Tambahkan template untuk mulai menyusun waktu pembelajaran.</p>
        </div>
      </div>

      <div class="xl:col-span-8">
        <div v-if="selectedTemplate" class="bg-white rounded-xl p-4 shadow-sm mb-3 flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-gray-800">{{ selectedTemplate.name }}</p>
            <p class="text-xs text-gray-500">Kode: {{ selectedTemplate.code }} - {{ periods.length }} periode</p>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="selectedTemplate.is_default" class="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">Default</span>
            <span :class="selectedTemplate.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'" class="px-2 py-1 rounded-full text-xs font-semibold">{{ selectedTemplate.is_active ? 'Aktif' : 'Nonaktif' }}</span>
          </div>
        </div>
        <div v-if="selectedTemplate && loadingPeriods" class="bg-white rounded-xl p-6 shadow-sm text-sm text-gray-500">Memuat data jam pelajaran...</div>
        <div v-else-if="selectedTemplate && periods.length === 0" class="bg-white rounded-xl p-6 shadow-sm">
          <p class="text-sm text-gray-800">Belum ada detail jam pada template ini.</p>
          <p class="text-sm text-gray-500 mt-1">Tambahkan jam pelajaran untuk mulai membuat susunan waktu.</p>
        </div>
        <BaseTable v-else-if="selectedTemplate" :columns="columns" :data="periods" :loading="false" :showActions="false" :showPagination="false">
          <template #cell-period_number="{ item }">{{ item.period_number || '-' }}</template>
          <template #cell-period_type="{ item }"><span :class="periodTypeBadge(item.period_type)" class="px-2 py-1 rounded-full text-xs font-semibold">{{ periodTypeLabel(item.period_type) }}</span></template>
          <template #cell-time="{ item }">{{ item.start_time?.slice(0,5) }} - {{ item.end_time?.slice(0,5) }}</template>
          <template #cell-is_attendance_enabled="{ item }">{{ item.is_attendance_enabled ? 'Ya' : 'Tidak' }}</template>
          <template #cell-is_active="{ item }"><span :class="item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'" class="px-2 py-1 rounded-full text-xs font-semibold">{{ item.is_active ? 'Aktif' : 'Nonaktif' }}</span></template>
          <template #cell-actions="{ item }"><div class="flex gap-2 justify-end"><button class="text-blue-600 hover:text-blue-900" title="Edit" @click="openPeriodModal(item)"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button><button class="text-amber-600 hover:text-amber-900" :title="item.is_active ? 'Nonaktifkan' : 'Aktifkan'" @click="togglePeriod(item)"><svg v-if="item.is_active" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6M5 12a7 7 0 1114 0 7 7 0 01-14 0z"/></svg><svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-6.518-3.754A1 1 0 007 8.28v7.44a1 1 0 001.234.972l6.518-1.63A1 1 0 0015.5 14.1v-2.064a1 1 0 00-.748-.968z"/></svg></button><button class="text-red-600 hover:text-red-900" title="Hapus" @click="deletePeriod(item)"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div></template>
        </BaseTable>
        <div v-else class="bg-white rounded-xl p-6 shadow-sm text-sm text-gray-500">Pilih template terlebih dahulu untuk melihat susunan jam.</div>
      </div>
    </div>

    <BaseModal v-model="showTemplateModal" :title="editingTemplate ? 'Edit Template Jam' : 'Tambah Template Jam'" maxWidth="lg">
      <form class="space-y-3">
        <BaseInput id="template-name" v-model="templateForm.name" label="Nama Template" required />
        <BaseInput id="template-code" v-model="templateForm.code" label="Kode Template" required />
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label><textarea v-model="templateForm.description" rows="3" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50"></textarea></div>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="templateForm.is_default" /> Jadikan Default</label>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="templateForm.is_active" /> Status Aktif</label>
      </form>
      <template #footer><BaseButton variant="outline" class="mr-2" @click="showTemplateModal=false">Batal</BaseButton><BaseButton :loading="savingTemplate" @click="saveTemplate">Simpan Data</BaseButton></template>
    </BaseModal>

    <BaseModal v-model="showPeriodModal" :title="editingPeriod ? 'Edit Jam Pelajaran' : 'Tambah Jam Pelajaran'" maxWidth="lg">
      <form class="space-y-3">
        <BaseInput id="period-order" v-model="periodForm.period_order" type="number" label="Urutan" required />
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Jenis Waktu</label><select v-model="periodForm.period_type" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50"><option value="LESSON">Pelajaran</option><option value="BREAK">Istirahat</option><option value="ASSEMBLY">Apel</option><option value="PRAYER">Sholat</option><option value="ACTIVITY">Kegiatan</option></select></div>
        <BaseInput id="period-number" v-model="periodForm.period_number" type="number" label="Jam Ke" :required="periodForm.period_type === 'LESSON'" />
        <BaseInput id="period-name" v-model="periodForm.name" label="Nama Jam" required />
        <div class="grid grid-cols-2 gap-3"><BaseInput id="period-start" v-model="periodForm.start_time" type="time" label="Waktu Mulai" required /><BaseInput id="period-end" v-model="periodForm.end_time" type="time" label="Waktu Selesai" required /></div>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="periodForm.is_attendance_enabled" /> Digunakan untuk presensi pembelajaran</label>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="periodForm.is_active" /> Status Aktif</label>
      </form>
      <template #footer>
        <BaseButton variant="outline" class="mr-2" @click="showPeriodModal=false">Batal</BaseButton>
        <BaseButton variant="outline" class="mr-2" :loading="savingPeriod" @click="savePeriodAndContinue">Simpan & Tambah Lagi</BaseButton>
        <BaseButton :loading="savingPeriod" @click="savePeriod">Simpan Data</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import { lessonPeriodService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'
const { success, error: showError } = useToast()
const columns = [
  { key: 'period_order', label: 'Urutan' },
  { key: 'period_number', label: 'Jam Ke' },
  { key: 'name', label: 'Nama' },
  { key: 'period_type', label: 'Jenis' },
  { key: 'time', label: 'Waktu' },
  { key: 'is_attendance_enabled', label: 'Presensi' },
  { key: 'is_active', label: 'Status' },
  { key: 'actions', label: 'Aksi', class: 'text-right' }
]
const templates = ref([]), selectedTemplate = ref(null), periods = ref([]), loading = ref(false), loadingPeriods = ref(false), loadError = ref(false)
const showTemplateModal = ref(false), editingTemplate = ref(null), savingTemplate = ref(false), templateForm = reactive({ name: '', code: '', description: '', is_default: false, is_active: true })
const showPeriodModal = ref(false), editingPeriod = ref(null), savingPeriod = ref(false), periodForm = reactive({ template_id: null, period_order: 1, period_number: '', name: '', period_type: 'LESSON', start_time: '', end_time: '', is_attendance_enabled: true, is_active: true })
const periodTypeLabel = (v) => ({ LESSON: 'Pelajaran', BREAK: 'Istirahat', ASSEMBLY: 'Apel', PRAYER: 'Sholat', ACTIVITY: 'Kegiatan' }[v] || v)
const periodTypeBadge = (v) => ({ LESSON: 'bg-blue-50 text-blue-700', BREAK: 'bg-green-50 text-green-700', ASSEMBLY: 'bg-violet-50 text-violet-700', PRAYER: 'bg-teal-50 text-teal-700', ACTIVITY: 'bg-orange-50 text-orange-700' }[v] || 'bg-gray-100 text-gray-700')
const fetchTemplates = async () => { loading.value = true; loadError.value = false; try { const res = await lessonPeriodService.getTemplates(); templates.value = res?.data || []; if (!selectedTemplate.value && templates.value.length) selectTemplate(templates.value[0]); if (selectedTemplate.value) { const found = templates.value.find((i) => i.id === selectedTemplate.value.id); if (found) selectedTemplate.value = found } } catch (e) { loadError.value = true; showError(e.message || 'Gagal memuat data jam pelajaran') } finally { loading.value = false } }
const fetchPeriods = async () => { if (!selectedTemplate.value) return; loadingPeriods.value = true; try { const res = await lessonPeriodService.getPeriods(selectedTemplate.value.id); periods.value = res?.data || [] } catch (e) { showError(e.message || 'Gagal memuat detail jam') } finally { loadingPeriods.value = false } }
const selectTemplate = (item) => { selectedTemplate.value = item; fetchPeriods() }
const openTemplateModal = (item = null) => { editingTemplate.value = item; Object.assign(templateForm, item ? { name: item.name, code: item.code, description: item.description || '', is_default: item.is_default, is_active: item.is_active } : { name: '', code: '', description: '', is_default: false, is_active: true }); showTemplateModal.value = true }
const saveTemplate = async () => { if (!templateForm.name || !templateForm.code) return showError('Lengkapi field wajib'); savingTemplate.value = true; try { if (editingTemplate.value) await lessonPeriodService.updateTemplate(editingTemplate.value.id, templateForm); else await lessonPeriodService.createTemplate(templateForm); success('Template tersimpan'); showTemplateModal.value = false; await fetchTemplates(); if (selectedTemplate.value) await fetchPeriods() } catch (e) { showError(e.message || 'Gagal menyimpan template') } finally { savingTemplate.value = false } }
const toggleTemplate = async (item) => { try { await lessonPeriodService.toggleTemplate(item.id); success('Status template diperbarui'); await fetchTemplates(); if (selectedTemplate.value) await fetchPeriods() } catch (e) { showError(e.message || 'Gagal memperbarui status') } }
const setDefault = async (item) => { try { await lessonPeriodService.setDefaultTemplate(item.id); success('Template default diperbarui'); await fetchTemplates() } catch (e) { showError(e.message || 'Gagal mengubah template default') } }
const openPeriodModal = (item = null) => { if (!selectedTemplate.value) return showError('Pilih template terlebih dahulu'); editingPeriod.value = item; Object.assign(periodForm, item ? { template_id: item.template_id, period_order: item.period_order, period_number: item.period_number || '', name: item.name, period_type: item.period_type, start_time: item.start_time?.slice(0,5), end_time: item.end_time?.slice(0,5), is_attendance_enabled: item.is_attendance_enabled, is_active: item.is_active } : { template_id: selectedTemplate.value.id, period_order: 1, period_number: '', name: '', period_type: 'LESSON', start_time: '', end_time: '', is_attendance_enabled: true, is_active: true }); showPeriodModal.value = true }
const buildPeriodPayload = () => ({ ...periodForm, template_id: selectedTemplate.value.id, period_number: periodForm.period_type === 'LESSON' ? periodForm.period_number : null })
const validatePeriodForm = () => {
  if (!periodForm.period_order || !periodForm.name || !periodForm.start_time || !periodForm.end_time) { showError('Lengkapi field wajib'); return false }
  if (periodForm.period_type === 'LESSON' && !periodForm.period_number) { showError('Jam ke wajib untuk jenis Pelajaran'); return false }
  return true
}
const savePeriod = async () => {
  if (!validatePeriodForm()) return
  savingPeriod.value = true
  try {
    const payload = buildPeriodPayload()
    if (editingPeriod.value) await lessonPeriodService.updatePeriod(editingPeriod.value.id, payload)
    else await lessonPeriodService.createPeriod(payload)
    success('Detail jam tersimpan')
    showPeriodModal.value = false
    fetchPeriods()
    fetchTemplates()
  } catch (e) { showError(e.message || 'Gagal menyimpan detail jam') } finally { savingPeriod.value = false }
}
const savePeriodAndContinue = async () => {
  if (!validatePeriodForm()) return
  savingPeriod.value = true
  try {
    const payload = buildPeriodPayload()
    if (editingPeriod.value) {
      await lessonPeriodService.updatePeriod(editingPeriod.value.id, payload)
      success('Detail jam diperbarui')
      showPeriodModal.value = false
    } else {
      await lessonPeriodService.createPeriod(payload)
      success('Detail jam tersimpan, lanjut tambah berikutnya')
      periodForm.period_order = Number(periodForm.period_order || 0) + 1
      if (periodForm.period_type === 'LESSON') periodForm.period_number = Number(periodForm.period_number || 0) + 1
      periodForm.name = periodForm.period_type === 'LESSON' ? `JP ${periodForm.period_number}` : periodForm.name
    }
    fetchPeriods()
    fetchTemplates()
  } catch (e) { showError(e.message || 'Gagal menyimpan detail jam') } finally { savingPeriod.value = false }
}
const togglePeriod = async (item) => { try { await lessonPeriodService.togglePeriod(item.id); success('Status detail jam diperbarui'); fetchPeriods() } catch (e) { showError(e.message || 'Gagal memperbarui status') } }
const deletePeriod = async (item) => { try { await lessonPeriodService.deletePeriod(item.id); success('Detail jam dihapus'); fetchPeriods(); fetchTemplates() } catch (e) { showError(e.message || 'Gagal menghapus detail jam') } }
watch(() => periodForm.period_type, (val) => { if (val === 'LESSON') periodForm.is_attendance_enabled = true; else if (!editingPeriod.value) periodForm.is_attendance_enabled = false })
onMounted(async () => { await fetchTemplates(); if (selectedTemplate.value) await fetchPeriods() })
</script>
