<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Hak Akses (Permission)</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola daftar permission sistem</p>
      </div>
      <button
        v-if="authStore.hasPermission('permission.create')"
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Tambah Permission
      </button>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div class="flex gap-3 flex-wrap">
        <div class="flex-1 min-w-48 relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>
          <input v-model="search" @input="debouncedFetch" type="text" placeholder="Cari permission..."
            class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <select v-model="filterModule" @change="() => { currentPage = 1; fetchPermissions() }"
          class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
          <option value="">Semua Modul</option>
          <option v-for="mod in moduleList" :key="mod" :value="mod">{{ mod }}</option>
        </select>
      </div>
    </div>

    <!-- Grouped view -->
    <div v-if="viewMode === 'grouped' && !loading" class="space-y-4">
      <div v-if="!groupedPermissions.length" class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-16 text-gray-400">
        <svg class="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
        </svg>
        <p class="font-medium">Tidak ada permission ditemukan</p>
      </div>
      <div v-for="group in groupedPermissions" :key="group.module" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-gray-700 capitalize">{{ group.module }}</span>
            <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{{ group.permissions.length }}</span>
          </div>
        </div>
        <div class="divide-y divide-gray-50">
          <div v-for="perm in group.permissions" :key="perm.id"
            class="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-800">{{ perm.name }}</span>
                <span class="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{{ perm.code }}</span>
              </div>
              <p v-if="perm.description" class="text-xs text-gray-400 mt-0.5">{{ perm.description }}</p>
            </div>
            <div class="flex items-center gap-2 ml-4">
              <button v-if="authStore.hasPermission('permission.update')"
                @click="openEditModal(perm)"
                class="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table view (flat) -->
    <div v-else-if="viewMode === 'table'" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="p-6 space-y-3">
        <div v-for="i in 8" :key="i" class="animate-pulse flex space-x-4">
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/3"></div>
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
      <div v-else-if="!permissions.length" class="flex flex-col items-center justify-center py-16 text-gray-400">
        <p class="font-medium">Tidak ada permission ditemukan</p>
      </div>
      <table v-else class="min-w-full divide-y divide-gray-100">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Deskripsi</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="perm in permissions" :key="perm.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-3">
              <span class="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">{{ perm.code }}</span>
            </td>
            <td class="px-6 py-3 text-sm text-gray-800">{{ perm.name }}</td>
            <td class="px-6 py-3 text-sm text-gray-500">{{ perm.description || '-' }}</td>
            <td class="px-6 py-3 text-right">
              <button v-if="authStore.hasPermission('permission.update')"
                @click="openEditModal(perm)"
                class="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p class="text-sm text-gray-500">Total {{ totalItems }} permission</p>
        <div class="flex gap-2">
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
            class="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">‹</button>
          <span class="px-3 py-1 text-sm">{{ currentPage }} / {{ totalPages }}</span>
          <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
            class="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">›</button>
        </div>
      </div>
    </div>

    <!-- View toggle -->
    <div class="flex justify-end">
      <div class="inline-flex rounded-lg border border-gray-200 overflow-hidden">
        <button @click="switchView('grouped')" :class="viewMode === 'grouped' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
          class="px-4 py-2 text-sm font-medium transition-colors">Per Modul</button>
        <button @click="switchView('table')" :class="viewMode === 'table' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
          class="px-4 py-2 text-sm font-medium transition-colors border-l border-gray-200">Tabel</button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showFormModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeFormModal"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-900">{{ editingPerm ? 'Edit Permission' : 'Tambah Permission' }}</h3>
          <button @click="closeFormModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Code <span class="text-red-500">*</span></label>
            <input v-model="form.code" type="text" required placeholder="Contoh: student.view"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              :class="{ 'border-red-300': formErrors.code }"
              :disabled="!!editingPerm"
            />
            <p v-if="formErrors.code" class="text-xs text-red-500 mt-1">{{ formErrors.code }}</p>
            <p class="text-xs text-gray-400 mt-1">Format: modul.aksi (contoh: student.view)</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama <span class="text-red-500">*</span></label>
            <input v-model="form.name" type="text" required placeholder="Contoh: Lihat Data Siswa"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              :class="{ 'border-red-300': formErrors.name }"
            />
            <p v-if="formErrors.name" class="text-xs text-red-500 mt-1">{{ formErrors.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea v-model="form.description" rows="2" placeholder="Deskripsi permission..."
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            ></textarea>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeFormModal"
              class="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button type="submit" :disabled="formLoading"
              class="flex-1 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <svg v-if="formLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ editingPerm ? 'Simpan' : 'Tambah' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import permissionService from '@/services/api/permission.service'
import { useToast } from '@/composables/useToast'

const authStore = useAuthStore()
const { success, error } = useToast()

// ── State ──────────────────────────────────────────────────────────────────
const loading = ref(false)
const permissions = ref([])
const groupedPermissions = ref([])
const totalItems = ref(0)
const totalPages = ref(1)
const currentPage = ref(1)
const search = ref('')
const filterModule = ref('')
const viewMode = ref('grouped')
let debounceTimer = null

// Form modal
const showFormModal = ref(false)
const editingPerm = ref(null)
const formLoading = ref(false)
const form = reactive({ code: '', name: '', description: '' })
const formErrors = reactive({ code: '', name: '' })

// ── Computed ───────────────────────────────────────────────────────────────
const moduleList = computed(() => {
  const mods = new Set()
  groupedPermissions.value.forEach(g => mods.add(g.module))
  return Array.from(mods).sort()
})

// ── Methods ────────────────────────────────────────────────────────────────
const fetchPermissions = async () => {
  loading.value = true
  try {
    if (viewMode.value === 'grouped') {
      const res = await permissionService.getGrouped()
      const data = res.data || res
      let groups = Array.isArray(data) ? data : []
      if (search.value) {
        const q = search.value.toLowerCase()
        groups = groups.map(g => ({
          ...g,
          permissions: g.permissions.filter(p =>
            p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
          )
        })).filter(g => g.permissions.length > 0)
      }
      if (filterModule.value) {
        groups = groups.filter(g => g.module === filterModule.value)
      }
      groupedPermissions.value = groups
    } else {
      const res = await permissionService.getAll({
        page: currentPage.value,
        search: search.value,
        module: filterModule.value,
        limit: 20
      })
      const d = res.data || res
      permissions.value = d.permissions || []
      totalItems.value = d.totalItems || 0
      totalPages.value = d.totalPages || 1
    }
  } catch (e) {
    error('Gagal memuat data permission')
  } finally {
    loading.value = false
  }
}

const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { currentPage.value = 1; fetchPermissions() }, 400)
}

const changePage = (p) => {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
  fetchPermissions()
}

const switchView = (mode) => {
  viewMode.value = mode
  fetchPermissions()
}

// Form modal
const openCreateModal = () => {
  editingPerm.value = null
  form.code = ''
  form.name = ''
  form.description = ''
  formErrors.code = ''
  formErrors.name = ''
  showFormModal.value = true
}

const openEditModal = (perm) => {
  editingPerm.value = perm
  form.code = perm.code
  form.name = perm.name
  form.description = perm.description || ''
  formErrors.code = ''
  formErrors.name = ''
  showFormModal.value = true
}

const closeFormModal = () => { showFormModal.value = false }

const submitForm = async () => {
  formErrors.code = ''
  formErrors.name = ''
  let valid = true
  if (!form.code.trim()) { formErrors.code = 'Code wajib diisi'; valid = false }
  if (!form.name.trim()) { formErrors.name = 'Nama wajib diisi'; valid = false }
  if (!valid) return

  formLoading.value = true
  try {
    if (editingPerm.value) {
      await permissionService.update(editingPerm.value.id, { name: form.name, description: form.description })
      success('Permission berhasil diperbarui')
    } else {
      await permissionService.create({ code: form.code, name: form.name, description: form.description })
      success('Permission berhasil ditambahkan')
    }
    closeFormModal()
    fetchPermissions()
  } catch (e) {
    error(e.message || 'Gagal menyimpan permission')
  } finally {
    formLoading.value = false
  }
}

onMounted(async () => {
  await fetchPermissions()
})
</script>
