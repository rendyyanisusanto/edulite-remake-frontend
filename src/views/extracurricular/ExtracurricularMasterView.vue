<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">Master Ekskul</h1>
      <div class="flex gap-2">
        <BaseButton variant="outline" @click="openCategoryModal()">Tambah Kategori</BaseButton>
        <BaseButton @click="openExtracurricularModal()">Tambah Ekskul</BaseButton>
      </div>
    </div>

    <BaseCard>
      <h2 class="font-semibold mb-3">Kategori Ekskul</h2>
      <BaseTable :columns="categoryColumns" :data="categories" :loading="loadingCategory" :showPagination="false" :showActions="false">
        <template #cell-actions="{ item }">
          <button class="text-blue-600" @click="openCategoryModal(item)">Edit</button>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseCard>
      <h2 class="font-semibold mb-3">Daftar Ekskul</h2>
      <BaseTable
        :columns="columns"
        :data="items"
        :loading="loading"
        :total="total"
        :currentPage="page"
        :perPage="limit"
        :searchQuery="search"
        @update:searchQuery="onSearch"
        @page-change="onPage"
      >
        <template #cell-is_active="{ value }">
          <span :class="value ? 'text-green-600' : 'text-gray-500'">{{ value ? 'Aktif' : 'Nonaktif' }}</span>
        </template>
        <template #cell-actions="{ item }">
          <div class="flex gap-2">
            <button class="text-blue-600" @click="openExtracurricularModal(item)">Edit</button>
            <button class="text-amber-600" @click="toggle(item)">{{ item.is_active ? 'Nonaktifkan' : 'Aktifkan' }}</button>
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseModal v-model="showCategoryModal" :title="categoryForm.id ? 'Edit Kategori' : 'Tambah Kategori'">
      <div class="space-y-3">
        <BaseInput v-model="categoryForm.name" label="Nama" required />
        <BaseInput v-model="categoryForm.description" label="Deskripsi" />
      </div>
      <template #footer>
        <BaseButton variant="outline" class="mr-2" @click="showCategoryModal = false">Batal</BaseButton>
        <BaseButton @click="saveCategory">Simpan</BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="showModal" :title="form.id ? 'Edit Ekskul' : 'Tambah Ekskul'" maxWidth="2xl">
      <div class="grid grid-cols-2 gap-3">
        <BaseInput v-model="form.code" label="Kode" required />
        <BaseInput v-model="form.name" label="Nama" required />
        <div>
          <label class="text-sm font-medium">Kategori</label>
          <select v-model="form.category_id" class="w-full border rounded px-3 py-2">
            <option :value="null">-</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium">Tahun Ajaran</label>
          <select v-model="form.academic_year_id" class="w-full border rounded px-3 py-2">
            <option v-for="a in academicYears" :key="a.id" :value="a.id">{{ a.name }}</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium">Tipe</label>
          <select v-model="form.type" class="w-full border rounded px-3 py-2">
            <option value="WAJIB">WAJIB</option>
            <option value="PILIHAN">PILIHAN</option>
            <option value="PRESTASI">PRESTASI</option>
          </select>
        </div>
        <BaseInput v-model="form.location" label="Lokasi" />
        <BaseInput v-model="form.max_members" type="number" label="Maks Anggota" />
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
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import { extracurricularService } from '@/services/api/extracurricular.service'
import { academicYearService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { success, error } = useToast()
const loading = ref(false)
const loadingCategory = ref(false)
const items = ref([])
const categories = ref([])
const academicYears = ref([])
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const search = ref('')
const showModal = ref(false)
const showCategoryModal = ref(false)

const form = reactive({ id: null, category_id: null, academic_year_id: null, code: '', name: '', type: 'PILIHAN', location: '', max_members: '' })
const categoryForm = reactive({ id: null, name: '', description: '' })

const columns = [
  { key: 'code', label: 'Kode' },
  { key: 'name', label: 'Nama' },
  { key: 'type', label: 'Tipe' },
  { key: 'is_active', label: 'Status' },
  { key: 'actions', label: 'Aksi' }
]
const categoryColumns = [
  { key: 'name', label: 'Nama' },
  { key: 'description', label: 'Deskripsi' },
  { key: 'actions', label: 'Aksi' }
]

async function loadCategories() {
  loadingCategory.value = true
  try { const r = await extracurricularService.getCategories(); categories.value = r.data || [] } catch { error('Gagal memuat kategori') }
  finally { loadingCategory.value = false }
}

async function load() {
  loading.value = true
  try {
    const r = await extracurricularService.getExtracurriculars({ page: page.value, limit: limit.value, search: search.value })
    items.value = r.data.items || []
    total.value = r.data.totalItems || 0
  } catch { error('Gagal memuat data ekskul') }
  finally { loading.value = false }
}

function openExtracurricularModal(item = null) {
  Object.assign(form, item || { id: null, category_id: null, academic_year_id: academicYears.value?.[0]?.id || null, code: '', name: '', type: 'PILIHAN', location: '', max_members: '' })
  showModal.value = true
}

function openCategoryModal(item = null) {
  Object.assign(categoryForm, item || { id: null, name: '', description: '' })
  showCategoryModal.value = true
}

async function saveCategory() {
  try {
    if (categoryForm.id) await extracurricularService.updateCategory(categoryForm.id, categoryForm)
    else await extracurricularService.createCategory(categoryForm)
    success('Kategori tersimpan')
    showCategoryModal.value = false
    loadCategories()
  } catch { error('Gagal simpan kategori') }
}

async function save() {
  try {
    const payload = { ...form }
    if (payload.id) await extracurricularService.updateExtracurricular(payload.id, payload)
    else await extracurricularService.createExtracurricular(payload)
    success('Ekskul tersimpan')
    showModal.value = false
    load()
  } catch { error('Gagal simpan ekskul') }
}

async function toggle(item) {
  try { await extracurricularService.toggleExtracurricular(item.id); success('Status diperbarui'); load() } catch { error('Gagal ubah status') }
}

function onSearch(v) { search.value = v; page.value = 1; load() }
function onPage(v) { page.value = v; load() }

onMounted(async () => {
  await Promise.all([loadCategories(), load()])
  const ay = await academicYearService.getAll({ limit: 100 })
  academicYears.value = ay.data?.academicYears || []
})
</script>
