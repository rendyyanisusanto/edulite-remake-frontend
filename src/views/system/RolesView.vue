<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Manajemen Role</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola role dan hak akses permission</p>
      </div>
      <button
        v-if="authStore.hasPermission('role.create')"
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Tambah Role
      </button>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div class="flex gap-3">
        <div class="flex-1 relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>
          <input
            v-model="search"
            @input="debouncedFetch"
            type="text"
            placeholder="Cari role..."
            class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Loading skeleton -->
      <div v-if="loading" class="p-6 space-y-3">
        <div v-for="i in 5" :key="i" class="animate-pulse flex space-x-4">
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!roles.length" class="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg class="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.957 11.957 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
        <p class="font-medium">Tidak ada role ditemukan</p>
      </div>

      <!-- Table content -->
      <table v-else class="min-w-full divide-y divide-gray-100">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Deskripsi</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Permissions</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="role in roles" :key="role.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                {{ role.name }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ role.description || '-' }}</td>
            <td class="px-6 py-4">
              <span class="text-sm text-gray-600">{{ (role.permissions || []).length }} permission</span>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="openPermissionModal(role)"
                  class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  title="Kelola Permission"
                >
                  <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                  </svg>
                  Permission
                </button>
                <button
                  v-if="authStore.hasPermission('role.update')"
                  @click="openEditModal(role)"
                  class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Edit
                </button>
                <button
                  v-if="authStore.hasPermission('role.delete')"
                  @click="confirmDelete(role)"
                  class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Hapus
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p class="text-sm text-gray-500">Total {{ totalItems }} role</p>
        <div class="flex gap-2">
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
            class="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">‹</button>
          <span class="px-3 py-1 text-sm">{{ currentPage }} / {{ totalPages }}</span>
          <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
            class="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">›</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showFormModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeFormModal"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-900">{{ editingRole ? 'Edit Role' : 'Tambah Role' }}</h3>
          <button @click="closeFormModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Role <span class="text-red-500">*</span></label>
            <input v-model="form.name" type="text" required placeholder="Contoh: ADMIN"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary uppercase"
              :class="{ 'border-red-300': formErrors.name }"
            />
            <p v-if="formErrors.name" class="text-xs text-red-500 mt-1">{{ formErrors.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea v-model="form.description" rows="3" placeholder="Deskripsi role..."
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
              {{ editingRole ? 'Simpan' : 'Tambah' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Permission Assignment Modal -->
    <div v-if="showPermModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closePermModal"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col z-10">
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 class="text-lg font-bold text-gray-900">Kelola Permission</h3>
            <p class="text-sm text-gray-500 mt-0.5">
              Role: <span class="font-semibold text-blue-600">{{ selectedRole?.name }}</span>
              · <span class="text-purple-600 font-medium">{{ selectedPermIds.size }} dipilih</span>
            </p>
          </div>
          <button @click="closePermModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Permission search -->
        <div class="px-6 py-3 border-b border-gray-100">
          <input v-model="permSearch" type="text" placeholder="Cari permission..."
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <!-- Permission groups -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <div v-if="permLoading" class="flex items-center justify-center py-8">
            <svg class="animate-spin w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
          <div v-else v-for="group in filteredPermGroups" :key="group.module" class="border border-gray-100 rounded-xl overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div class="flex items-center gap-2">
                <input type="checkbox"
                  :checked="isGroupAllChecked(group)"
                  :indeterminate="isGroupPartialChecked(group)"
                  @change="toggleGroup(group)"
                  class="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                />
                <span class="text-sm font-semibold text-gray-700 capitalize">{{ group.module }}</span>
                <span class="text-xs text-gray-400">({{ getGroupCheckedCount(group) }}/{{ group.permissions.length }})</span>
              </div>
              <button @click="toggleGroupExpand(group.module)"
                class="text-xs text-gray-400 hover:text-gray-600">
                {{ expandedPermGroups[group.module] ? 'Sembunyikan' : 'Tampilkan' }}
              </button>
            </div>
            <div v-show="expandedPermGroups[group.module]" class="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y divide-gray-50">
              <label v-for="perm in group.permissions" :key="perm.id"
                class="flex items-start gap-3 px-4 py-2.5 hover:bg-blue-50/50 cursor-pointer transition-colors">
                <input type="checkbox"
                  :value="perm.id"
                  :checked="selectedPermIds.has(perm.id)"
                  @change="togglePerm(perm.id)"
                  class="mt-0.5 w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                />
                <div>
                  <p class="text-sm font-medium text-gray-700">{{ perm.name }}</p>
                  <p class="text-xs text-gray-400 font-mono">{{ perm.code }}</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-gray-100 flex gap-3">
          <button @click="closePermModal"
            class="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button @click="savePermissions" :disabled="permSaving"
            class="flex-1 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <svg v-if="permSaving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Simpan Permission
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showDeleteModal = false"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-900">Hapus Role</h3>
            <p class="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>
        <p class="text-sm text-gray-600 mb-6">
          Apakah Anda yakin ingin menghapus role <strong>{{ deletingRole?.name }}</strong>?
        </p>
        <div class="flex gap-3">
          <button @click="showDeleteModal = false"
            class="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
            Batal
          </button>
          <button @click="executeDelete" :disabled="deleteLoading"
            class="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
            <svg v-if="deleteLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Hapus
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import roleService from '@/services/api/role.service'
import permissionService from '@/services/api/permission.service'
import { useToast } from '@/composables/useToast'

const authStore = useAuthStore()
const { success, error } = useToast()

// ── State ──────────────────────────────────────────────────────────────────
const loading = ref(false)
const roles = ref([])
const totalItems = ref(0)
const totalPages = ref(1)
const currentPage = ref(1)
const search = ref('')
let debounceTimer = null

// Form modal
const showFormModal = ref(false)
const editingRole = ref(null)
const formLoading = ref(false)
const form = reactive({ name: '', description: '' })
const formErrors = reactive({ name: '' })

// Permission modal
const showPermModal = ref(false)
const selectedRole = ref(null)
const permLoading = ref(false)
const permSaving = ref(false)
const permGroups = ref([])
const permSearch = ref('')
const selectedPermIds = ref(new Set())
const expandedPermGroups = reactive({})

// Delete modal
const showDeleteModal = ref(false)
const deletingRole = ref(null)
const deleteLoading = ref(false)

// ── Computed ───────────────────────────────────────────────────────────────
const filteredPermGroups = computed(() => {
  if (!permSearch.value) return permGroups.value
  const q = permSearch.value.toLowerCase()
  return permGroups.value
    .map(g => ({
      ...g,
      permissions: g.permissions.filter(p =>
        p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
      )
    }))
    .filter(g => g.permissions.length > 0)
})

// ── Methods ────────────────────────────────────────────────────────────────
const fetchRoles = async () => {
  loading.value = true
  try {
    const res = await roleService.getAll({ page: currentPage.value, search: search.value, limit: 10 })
    const d = res.data || res
    roles.value = d.roles || []
    totalItems.value = d.totalItems || 0
    totalPages.value = d.totalPages || 1
  } catch (e) {
    error('Gagal memuat data role')
  } finally {
    loading.value = false
  }
}

const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { currentPage.value = 1; fetchRoles() }, 400)
}

const changePage = (p) => {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
  fetchRoles()
}

// Form modal
const openCreateModal = () => {
  editingRole.value = null
  form.name = ''
  form.description = ''
  formErrors.name = ''
  showFormModal.value = true
}

const openEditModal = (role) => {
  editingRole.value = role
  form.name = role.name
  form.description = role.description || ''
  formErrors.name = ''
  showFormModal.value = true
}

const closeFormModal = () => { showFormModal.value = false }

const submitForm = async () => {
  formErrors.name = ''
  if (!form.name.trim()) { formErrors.name = 'Nama role wajib diisi'; return }

  formLoading.value = true
  try {
    if (editingRole.value) {
      await roleService.update(editingRole.value.id, { name: form.name, description: form.description })
      success('Role berhasil diperbarui')
    } else {
      await roleService.create({ name: form.name, description: form.description })
      success('Role berhasil ditambahkan')
    }
    closeFormModal()
    fetchRoles()
  } catch (e) {
    error(e.message || 'Gagal menyimpan role')
  } finally {
    formLoading.value = false
  }
}

// Permission modal
const openPermissionModal = async (role) => {
  selectedRole.value = role
  selectedPermIds.value = new Set((role.permissions || []).map(p => p.id))
  permSearch.value = ''
  showPermModal.value = true
  await loadPermissions()
}

const closePermModal = () => { showPermModal.value = false }

const loadPermissions = async () => {
  permLoading.value = true
  try {
    const res = await permissionService.getGrouped()
    const groups = res.data || res
    permGroups.value = Array.isArray(groups) ? groups : []
    // Auto-expand all groups
    permGroups.value.forEach(g => { expandedPermGroups[g.module] = true })
  } catch (e) {
    error('Gagal memuat permission')
  } finally {
    permLoading.value = false
  }
}

const togglePerm = (id) => {
  const s = new Set(selectedPermIds.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selectedPermIds.value = s
}

const isGroupAllChecked = (group) => group.permissions.every(p => selectedPermIds.value.has(p.id))
const isGroupPartialChecked = (group) => {
  const checked = group.permissions.filter(p => selectedPermIds.value.has(p.id)).length
  return checked > 0 && checked < group.permissions.length
}
const getGroupCheckedCount = (group) => group.permissions.filter(p => selectedPermIds.value.has(p.id)).length

const toggleGroup = (group) => {
  const s = new Set(selectedPermIds.value)
  const allChecked = isGroupAllChecked(group)
  group.permissions.forEach(p => { allChecked ? s.delete(p.id) : s.add(p.id) })
  selectedPermIds.value = s
}

const toggleGroupExpand = (module) => {
  expandedPermGroups[module] = !expandedPermGroups[module]
}

const savePermissions = async () => {
  permSaving.value = true
  try {
    await roleService.syncPermissions(selectedRole.value.id, Array.from(selectedPermIds.value))
    success('Permission berhasil disimpan')
    closePermModal()
    fetchRoles()
  } catch (e) {
    error(e.message || 'Gagal menyimpan permission')
  } finally {
    permSaving.value = false
  }
}

// Delete
const confirmDelete = (role) => { deletingRole.value = role; showDeleteModal.value = true }

const executeDelete = async () => {
  deleteLoading.value = true
  try {
    await roleService.delete(deletingRole.value.id)
    success('Role berhasil dihapus')
    showDeleteModal.value = false
    fetchRoles()
  } catch (e) {
    error(e.message || 'Gagal menghapus role')
  } finally {
    deleteLoading.value = false
  }
}

onMounted(fetchRoles)
</script>
