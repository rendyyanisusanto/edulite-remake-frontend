<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">Master Kategori Penitipan Barang</h1>
      <BaseButton @click="openCreate">+ Tambah Kategori</BaseButton>
    </div>

    <BaseTable :columns="columns" :data="items" :loading="loading" :total="items.length" :currentPage="1" :perPage="50" :showActions="false" :showPagination="false">
      <template #cell-is_active="{ item }">{{ item.is_active ? 'Aktif' : 'Nonaktif' }}</template>
      <template #cell-actions="{ item }">
        <div class="flex items-center gap-2 justify-end">
          <button class="text-blue-600 hover:text-blue-900 mx-1" @click="edit(item)" title="Edit">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button class="text-red-600 hover:text-red-900 mx-1" @click="remove(item.id)" title="Hapus">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="showModal" :title="editingId ? 'Edit Kategori' : 'Tambah Kategori'" maxWidth="md">
      <div class="space-y-3">
        <BaseInput id="cat-name" v-model="form.name" label="Nama" required />
        <BaseInput id="cat-desc" v-model="form.description" label="Deskripsi" />
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showModal=false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="save">Simpan</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import svc from '@/services/api/studentItemDeposit.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()
const loading = ref(false)
const items = ref([])
const showModal = ref(false)
const editingId = ref(null)
const form = reactive({ name: '', description: '' })
const columns = [{ key: 'name', label: 'Nama' }, { key: 'description', label: 'Deskripsi' }, { key: 'is_active', label: 'Status' }, { key: 'actions', label: 'Aksi' }]

const load = async () => {
  loading.value = true
  try { const res = await svc.getCategories(); items.value = res?.data || [] } catch (e) { showError(e.message || 'Gagal memuat kategori') }
  finally { loading.value = false }
}

const openCreate = () => { editingId.value = null; form.name=''; form.description=''; showModal.value = true }
const edit = (item) => { editingId.value = item.id; form.name = item.name || ''; form.description = item.description || ''; showModal.value = true }
const save = async () => {
  if (!form.name) return
  if (editingId.value) await svc.updateCategory(editingId.value, { ...form, is_active: true })
  else await svc.createCategory({ ...form, is_active: true })
  success('Kategori berhasil disimpan')
  showModal.value = false
  await load()
}
const remove = async (id) => { await svc.deleteCategory(id); success('Kategori berhasil dihapus'); await load() }

onMounted(load)
</script>
