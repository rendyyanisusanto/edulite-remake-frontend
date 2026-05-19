<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">Pelatih Ekskul</h1>
      <BaseButton @click="openModal()">Tambah Pelatih</BaseButton>
    </div>

    <BaseTable :columns="columns" :data="items" :loading="loading" :showPagination="false" :showActions="false">
      <template #cell-full_name="{ item }">
        <div class="flex items-center space-x-3">
          <div class="h-10 w-10 flex-shrink-0">
            <img v-if="item.photo" :src="item.photo" alt="" class="h-10 w-10 rounded-full object-cover border border-gray-200" />
            <div v-else class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
          </div>
          <div class="text-sm font-medium text-gray-900">{{ item.full_name }}</div>
        </div>
      </template>
      <template #cell-coach_type="{ value }">
        <span
          class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold"
          :class="value === 'INTERNAL' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'"
        >
          {{ value }}
        </span>
      </template>
      <template #cell-teacher_name="{ item }">{{ item.teacher?.full_name || '-' }}</template>
      <template #cell-user_email="{ item }">{{ item.user?.email || item.email || '-' }}</template>
      <template #cell-is_active="{ value }">{{ value ? 'Aktif' : 'Nonaktif' }}</template>
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2">
          <button @click="openModal(item)" class="text-blue-600 hover:text-blue-900 mx-1" title="Edit">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button @click="confirmDelete(item)" class="text-red-600 hover:text-red-900 mx-1" title="Hapus">
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

    <BaseModal v-model="showModal" :title="form.id ? 'Edit Pelatih' : 'Tambah Pelatih'" maxWidth="2xl">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium">Tipe Pelatih</label>
          <select v-model="form.coach_type" class="w-full rounded border px-3 py-2">
            <option value="INTERNAL">INTERNAL</option>
            <option value="EXTERNAL">EXTERNAL</option>
          </select>
        </div>

        <div v-if="form.coach_type === 'INTERNAL'">
          <label class="mb-1 block text-sm font-medium">Guru Internal</label>
          <select v-model="form.teacher_id" class="w-full rounded border px-3 py-2" @change="handleTeacherChange">
            <option :value="null">Pilih guru</option>
            <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.full_name }} - {{ t.user?.email || '-' }}</option>
          </select>
        </div>

        <BaseInput id="coach-full-name" v-model="form.full_name" label="Nama Lengkap" :disabled="form.coach_type === 'INTERNAL'" />
        <BaseInput id="coach-phone" v-model="form.phone" label="Telepon" />
        <BaseInput id="coach-gender" v-model="form.gender" label="Gender" placeholder="L / P" />
        <BaseInput id="coach-expertise" v-model="form.expertise" label="Keahlian" />
        <BaseInput id="coach-address" v-model="form.address" label="Alamat" />

        <div class="md:col-span-2 flex justify-center py-2">
          <div class="w-40">
            <AssetUpload
              label="Foto Pelatih"
              :current-url="form.photo"
              :uploading="uploadingPhoto"
              @upload="handleUploadPhoto"
            />
            <p v-if="!form.id" class="mt-1 text-center text-[10px] italic text-gray-400">
              Simpan data pelatih terlebih dahulu untuk upload foto.
            </p>
          </div>
        </div>

        <template v-if="form.coach_type === 'EXTERNAL'">
          <BaseInput id="coach-email" v-model="form.email" label="Email Login" type="email" />
          <BaseInput
            v-if="!form.id"
            id="coach-password"
            v-model="form.password"
            label="Password Awal"
            type="password"
          />
          <BaseInput
            v-else
            id="coach-password-edit"
            v-model="form.password"
            label="Password Baru (Opsional)"
            type="password"
          />
        </template>

        <div>
          <label class="mb-1 block text-sm font-medium">Status</label>
          <select v-model="form.is_active" class="w-full rounded border px-3 py-2">
            <option :value="true">Aktif</option>
            <option :value="false">Nonaktif</option>
          </select>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="outline" class="mr-2" @click="showModal = false">Batal</BaseButton>
        <BaseButton @click="save">Simpan</BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="showDeleteModal" title="Konfirmasi Hapus" maxWidth="sm">
      <div class="mt-2 text-center sm:text-left">
        <p class="text-sm text-gray-500">
          Yakin ingin menghapus pelatih <b>{{ currentItem?.full_name }}</b>?
        </p>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showDeleteModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton variant="danger" @click="deleteCoach" :loading="deleting">Ya, Hapus</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import AssetUpload from '@/components/school-profile/AssetUpload.vue'
import { extracurricularService } from '@/services/api/extracurricular.service'
import { teacherService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { success, error } = useToast()
const loading = ref(false)
const items = ref([])
const teachers = ref([])
const showModal = ref(false)
const uploadingPhoto = ref(false)
const showDeleteModal = ref(false)
const deleting = ref(false)
const currentItem = ref(null)

const emptyForm = () => ({
  id: null,
  coach_type: 'INTERNAL',
  teacher_id: null,
  full_name: '',
  gender: '',
  phone: '',
  email: '',
  password: '',
  address: '',
  expertise: '',
  photo: '',
  is_active: true
})

const form = reactive(emptyForm())

const selectedTeacher = computed(() => teachers.value.find(t => t.id === form.teacher_id) || null)

const columns = [
  { key: 'full_name', label: 'Nama' },
  { key: 'coach_type', label: 'Tipe' },
  { key: 'teacher_name', label: 'Guru Internal' },
  { key: 'user_email', label: 'Email Login' },
  { key: 'phone', label: 'Telepon' },
  { key: 'is_active', label: 'Status' },
  { key: 'actions', label: 'Aksi' }
]

function resetByCoachType(nextType) {
  if (nextType === 'INTERNAL') {
    form.email = ''
    form.password = ''
    form.teacher_id = null
    form.full_name = ''
  } else {
    form.teacher_id = null
    form.password = ''
  }
}

function handleTeacherChange() {
  if (form.coach_type !== 'INTERNAL') return
  if (!selectedTeacher.value) {
    form.full_name = ''
    return
  }

  form.full_name = selectedTeacher.value.full_name || ''
  if (!form.phone) form.phone = selectedTeacher.value.phone || ''
  if (!form.gender) form.gender = selectedTeacher.value.gender || ''
}

watch(() => form.coach_type, (next, prev) => {
  if (!showModal.value || next === prev) return
  resetByCoachType(next)
})

async function load() {
  loading.value = true
  try {
    const r = await extracurricularService.getCoaches({ limit: 200 })
    items.value = r.data.items || []
  } catch {
    error('Gagal memuat pelatih')
  } finally {
    loading.value = false
  }
}

async function loadTeachers() {
  try {
    const r = await teacherService.getAll({ limit: 500 })
    const all = r.data?.teachers || []
    teachers.value = all.filter(t => t.user_id)
  } catch {
    error('Gagal memuat data guru')
  }
}

function openModal(item = null) {
  Object.assign(form, emptyForm())
  if (item) {
    Object.assign(form, {
      id: item.id,
      coach_type: item.coach_type,
      teacher_id: item.teacher_id,
      full_name: item.full_name || '',
      gender: item.gender || '',
      phone: item.phone || '',
      email: item.user?.email || item.email || '',
      password: '',
      address: item.address || '',
      expertise: item.expertise || '',
      photo: item.photo || '',
      is_active: item.is_active
    })
  }
  if (form.coach_type === 'INTERNAL') handleTeacherChange()
  showModal.value = true
}

function buildPayload() {
  const base = {
    coach_type: form.coach_type,
    gender: form.gender || null,
    phone: form.phone || null,
    address: form.address || null,
    expertise: form.expertise || null,
    is_active: !!form.is_active
  }

  if (form.coach_type === 'INTERNAL') {
    return {
      ...base,
      teacher_id: form.teacher_id
    }
  }

  const payload = {
    ...base,
    teacher_id: null,
    full_name: form.full_name,
    email: form.email
  }

  if (form.password) payload.password = form.password
  return payload
}

function validateForm() {
  if (!form.coach_type) return 'Tipe pelatih wajib dipilih'

  if (form.coach_type === 'INTERNAL' && !form.teacher_id) {
    return 'Guru internal wajib dipilih'
  }

  if (form.coach_type === 'EXTERNAL') {
    if (!form.full_name) return 'Nama pelatih external wajib diisi'
    if (!form.email) return 'Email login pelatih external wajib diisi'
    if (!form.id && !form.password) return 'Password awal pelatih external wajib diisi'
  }

  return null
}

async function save() {
  const validationMessage = validateForm()
  if (validationMessage) {
    error(validationMessage)
    return
  }

  try {
    const payload = buildPayload()
    if (form.id) {
      await extracurricularService.updateCoach(form.id, payload)
    } else {
      await extracurricularService.createCoach(payload)
    }
    success('Data pelatih tersimpan')
    showModal.value = false
    load()
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal simpan pelatih')
  }
}

async function toggle(item) {
  try {
    await extracurricularService.toggleCoach(item.id)
    success('Status diperbarui')
    load()
  } catch {
    error('Gagal ubah status')
  }
}

function confirmDelete(item) {
  currentItem.value = item
  showDeleteModal.value = true
}

async function deleteCoach() {
  if (!currentItem.value?.id) return
  deleting.value = true
  try {
    await extracurricularService.deleteCoach(currentItem.value.id)
    success('Pelatih berhasil dihapus')
    showDeleteModal.value = false
    await load()
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal menghapus pelatih')
  } finally {
    deleting.value = false
  }
}

async function handleUploadPhoto(file) {
  if (!form.id) {
    error('Simpan data pelatih terlebih dahulu sebelum upload foto')
    return
  }

  uploadingPhoto.value = true
  try {
    const response = await extracurricularService.uploadCoachPhoto(form.id, file)
    if (response.success) {
      form.photo = response.data.url
      success('Foto pelatih berhasil diperbarui')
      await load()
    }
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal upload foto pelatih')
  } finally {
    uploadingPhoto.value = false
  }
}

onMounted(async () => {
  await Promise.all([load(), loadTeachers()])
})
</script>
