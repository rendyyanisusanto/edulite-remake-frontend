<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola akun pengguna dan role</p>
      </div>
      <button
        v-if="authStore.hasPermission('user.create')"
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Tambah Pengguna
      </button>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div class="flex gap-3 flex-wrap">
        <div class="flex-1 min-w-48 relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>
          <input v-model="search" @input="debouncedFetch" type="text" placeholder="Cari nama atau email..."
            class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <select v-model="filterStatus" @change="() => { currentPage = 1; fetchUsers() }"
          class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
          <option value="">Semua Status</option>
          <option value="true">Aktif</option>
          <option value="false">Nonaktif</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Loading skeleton -->
      <div v-if="loading" class="p-6 space-y-3">
        <div v-for="i in 6" :key="i" class="animate-pulse flex space-x-4">
          <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-1/3"></div>
            <div class="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div class="h-4 bg-gray-200 rounded w-1/5"></div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!users.length" class="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg class="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <p class="font-medium">Tidak ada pengguna ditemukan</p>
      </div>

      <!-- Table content -->
      <table v-else class="min-w-full divide-y divide-gray-100">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengguna</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Login Terakhir</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {{ user.name?.charAt(0)?.toUpperCase() }}
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-800">{{ user.name }}</p>
                  <p class="text-xs text-gray-400">{{ user.email }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-wrap gap-1">
                <span v-for="role in (user.roles || [])" :key="role.id"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ role.name }}
                </span>
                <span v-if="!(user.roles || []).length" class="text-xs text-gray-400">-</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button
                  v-if="authStore.hasPermission('user.update')"
                  @click="toggleUserStatus(user)"
                  :class="user.is_active ? 'bg-green-500' : 'bg-gray-300'"
                  class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                  :title="user.is_active ? 'Nonaktifkan' : 'Aktifkan'"
                >
                  <span :class="user.is_active ? 'translate-x-5' : 'translate-x-1'"
                    class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm"/>
                </button>
                <span :class="user.is_active ? 'text-green-600' : 'text-gray-400'" class="text-xs font-medium">
                  {{ user.is_active ? 'Aktif' : 'Nonaktif' }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ user.last_login ? formatDate(user.last_login) : '-' }}
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button @click="openRoleModal(user)"
                  class="inline-flex items-center px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  title="Kelola Role">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.957 11.957 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  Role
                </button>
                <button v-if="authStore.hasPermission('user.update')" @click="openEditModal(user)"
                  class="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Edit
                </button>
                <button @click="openResetModal(user)"
                  class="inline-flex items-center px-2.5 py-1 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                  title="Reset Password">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                  </svg>
                  Reset
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p class="text-sm text-gray-500">Total {{ totalItems }} pengguna</p>
        <div class="flex gap-2">
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
            class="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">‹</button>
          <span class="px-3 py-1 text-sm">{{ currentPage }} / {{ totalPages }}</span>
          <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
            class="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">›</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <div v-if="showFormModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeFormModal"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-900">{{ editingUser ? 'Edit Pengguna' : 'Tambah Pengguna' }}</h3>
          <button @click="closeFormModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span class="text-red-500">*</span></label>
            <input v-model="form.name" type="text" required placeholder="Nama lengkap"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              :class="{ 'border-red-300': formErrors.name }"
            />
            <p v-if="formErrors.name" class="text-xs text-red-500 mt-1">{{ formErrors.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
            <input v-model="form.email" type="email" required placeholder="email@contoh.com"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              :class="{ 'border-red-300': formErrors.email }"
            />
            <p v-if="formErrors.email" class="text-xs text-red-500 mt-1">{{ formErrors.email }}</p>
          </div>
          <div v-if="!editingUser">
            <label class="block text-sm font-medium text-gray-700 mb-1">Password <span class="text-red-500">*</span></label>
            <div class="relative">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required placeholder="Minimal 8 karakter"
                class="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                :class="{ 'border-red-300': formErrors.password }"
              />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="!showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>
            <p v-if="formErrors.password" class="text-xs text-red-500 mt-1">{{ formErrors.password }}</p>
          </div>
          <div class="flex items-center gap-2">
            <input v-model="form.is_active" type="checkbox" id="is_active" class="w-4 h-4 rounded accent-primary"/>
            <label for="is_active" class="text-sm text-gray-700">Pengguna aktif</label>
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
              {{ editingUser ? 'Simpan' : 'Tambah' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Assign Role Modal -->
    <div v-if="showRoleModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeRoleModal"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-bold text-gray-900">Assign Role</h3>
            <p class="text-sm text-gray-500">{{ selectedUser?.name }}</p>
          </div>
          <button @click="closeRoleModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div v-if="rolesLoading" class="flex justify-center py-4">
          <svg class="animate-spin w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
        <div v-else class="space-y-2 mb-6">
          <label v-for="role in allRoles" :key="role.id"
            class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors">
            <input type="checkbox"
              :value="role.id"
              :checked="selectedRoleIds.has(role.id)"
              @change="toggleRole(role.id)"
              class="w-4 h-4 rounded accent-primary"
            />
            <div>
              <p class="text-sm font-medium text-gray-800">{{ role.name }}</p>
              <p v-if="role.description" class="text-xs text-gray-400">{{ role.description }}</p>
            </div>
          </label>
        </div>
        <div class="flex gap-3">
          <button @click="closeRoleModal"
            class="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
            Batal
          </button>
          <button @click="saveRoles" :disabled="roleSaving"
            class="flex-1 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            <svg v-if="roleSaving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- Reset Password Modal -->
    <div v-if="showResetModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeResetModal"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-bold text-gray-900">Reset Password</h3>
            <p class="text-sm text-gray-500">{{ resetUser?.name }}</p>
          </div>
          <button @click="closeResetModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="submitReset" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password Baru <span class="text-red-500">*</span></label>
            <div class="relative">
              <input v-model="resetForm.new_password" :type="showResetPassword ? 'text' : 'password'" required placeholder="Minimal 8 karakter"
                class="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <button type="button" @click="showResetPassword = !showResetPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeResetModal"
              class="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" :disabled="resetLoading"
              class="flex-1 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2">
              <svg v-if="resetLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import userService from '@/services/api/user.service'
import roleService from '@/services/api/role.service'
import { useToast } from '@/composables/useToast'

const authStore = useAuthStore()
const { success, error } = useToast()

// ── State ──────────────────────────────────────────────────────────────────
const loading = ref(false)
const users = ref([])
const totalItems = ref(0)
const totalPages = ref(1)
const currentPage = ref(1)
const search = ref('')
const filterStatus = ref('')
let debounceTimer = null

// Form modal
const showFormModal = ref(false)
const editingUser = ref(null)
const formLoading = ref(false)
const showPassword = ref(false)
const form = reactive({ name: '', email: '', password: '', is_active: true })
const formErrors = reactive({ name: '', email: '', password: '' })

// Role modal
const showRoleModal = ref(false)
const selectedUser = ref(null)
const allRoles = ref([])
const rolesLoading = ref(false)
const roleSaving = ref(false)
const selectedRoleIds = ref(new Set())

// Reset password modal
const showResetModal = ref(false)
const resetUser = ref(null)
const resetLoading = ref(false)
const showResetPassword = ref(false)
const resetForm = reactive({ new_password: '' })

// ── Methods ────────────────────────────────────────────────────────────────
const fetchUsers = async () => {
  loading.value = true
  try {
    const params = { page: currentPage.value, search: search.value, limit: 10 }
    if (filterStatus.value !== '') params.is_active = filterStatus.value
    const res = await userService.getAll(params)
    const d = res.data || res
    users.value = d.users || []
    totalItems.value = d.totalItems || 0
    totalPages.value = d.totalPages || 1
  } catch (e) {
    error('Gagal memuat data pengguna')
  } finally {
    loading.value = false
  }
}

const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { currentPage.value = 1; fetchUsers() }, 400)
}

const changePage = (p) => {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
  fetchUsers()
}

const formatDate = (dt) => {
  if (!dt) return '-'
  return new Date(dt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Form modal
const openCreateModal = () => {
  editingUser.value = null
  form.name = ''
  form.email = ''
  form.password = ''
  form.is_active = true
  showPassword.value = false
  Object.keys(formErrors).forEach(k => formErrors[k] = '')
  showFormModal.value = true
}

const openEditModal = (user) => {
  editingUser.value = user
  form.name = user.name
  form.email = user.email
  form.password = ''
  form.is_active = user.is_active
  showPassword.value = false
  Object.keys(formErrors).forEach(k => formErrors[k] = '')
  showFormModal.value = true
}

const closeFormModal = () => { showFormModal.value = false }

const submitForm = async () => {
  Object.keys(formErrors).forEach(k => formErrors[k] = '')
  if (!form.name.trim()) { formErrors.name = 'Nama wajib diisi'; return }
  if (!form.email.trim()) { formErrors.email = 'Email wajib diisi'; return }
  if (!editingUser.value && !form.password.trim()) { formErrors.password = 'Password wajib diisi'; return }

  formLoading.value = true
  try {
    if (editingUser.value) {
      const payload = { name: form.name, email: form.email, is_active: form.is_active }
      await userService.update(editingUser.value.id, payload)
      success('Pengguna berhasil diperbarui')
    } else {
      await userService.create({ name: form.name, email: form.email, password: form.password, is_active: form.is_active })
      success('Pengguna berhasil ditambahkan')
    }
    closeFormModal()
    fetchUsers()
  } catch (e) {
    error(e.message || 'Gagal menyimpan pengguna')
  } finally {
    formLoading.value = false
  }
}

// Toggle status
const toggleUserStatus = async (user) => {
  try {
    await userService.toggleStatus(user.id, !user.is_active)
    user.is_active = !user.is_active
    success(`Pengguna berhasil ${user.is_active ? 'diaktifkan' : 'dinonaktifkan'}`)
  } catch (e) {
    error(e.message || 'Gagal mengubah status pengguna')
  }
}

// Role modal
const openRoleModal = async (user) => {
  selectedUser.value = user
  selectedRoleIds.value = new Set((user.roles || []).map(r => r.id))
  showRoleModal.value = true
  rolesLoading.value = true
  try {
    const res = await roleService.getAll({ limit: 100 })
    const d = res.data || res
    allRoles.value = d.roles || []
  } catch (e) {
    error('Gagal memuat data role')
  } finally {
    rolesLoading.value = false
  }
}

const closeRoleModal = () => { showRoleModal.value = false }

const toggleRole = (id) => {
  const s = new Set(selectedRoleIds.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selectedRoleIds.value = s
}

const saveRoles = async () => {
  roleSaving.value = true
  try {
    await userService.syncRoles(selectedUser.value.id, Array.from(selectedRoleIds.value))
    success('Role berhasil disimpan')
    closeRoleModal()
    fetchUsers()
  } catch (e) {
    error(e.message || 'Gagal menyimpan role')
  } finally {
    roleSaving.value = false
  }
}

// Reset password modal
const openResetModal = (user) => {
  resetUser.value = user
  resetForm.new_password = ''
  showResetPassword.value = false
  showResetModal.value = true
}

const closeResetModal = () => { showResetModal.value = false }

const submitReset = async () => {
  if (!resetForm.new_password.trim()) return
  resetLoading.value = true
  try {
    await userService.resetPassword(resetUser.value.id, { new_password: resetForm.new_password })
    success('Password berhasil direset')
    closeResetModal()
  } catch (e) {
    error(e.message || 'Gagal mereset password')
  } finally {
    resetLoading.value = false
  }
}

onMounted(fetchUsers)
</script>
