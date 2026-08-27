<template>
  <div class="kiosk-admin-container">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">Manajemen Kiosk Tahfidz</h2>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-700">Daftar Kelas & Kiosk</h3>
        <button @click="fetchKiosks" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Refresh
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Kiosk</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading" class="text-center">
              <td colspan="3" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Memuat data...</td>
            </tr>
            <tr v-else-if="kiosks.length === 0" class="text-center">
              <td colspan="3" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Tidak ada data kelas.</td>
            </tr>
            <tr v-else v-for="item in kiosks" :key="item.class_id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ item.class_name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="!item.has_kiosk" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                  Belum Dibuat
                </span>
                <span v-else-if="item.is_active" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Aktif
                </span>
                <span v-else class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                  Nonaktif
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button v-if="!item.has_kiosk" @click="generateToken(item.class_id)" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md transition-colors">
                    Generate Kiosk
                  </button>
                  <template v-else>
                    <button @click="showQrCode(item)" class="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md transition-colors">
                      Lihat QR
                    </button>
                    <button @click="toggleActive(item)" :class="item.is_active ? 'text-orange-600 hover:text-orange-900 bg-orange-50' : 'text-green-600 hover:text-green-900 bg-green-50'" class="px-3 py-1 rounded-md transition-colors">
                      {{ item.is_active ? 'Nonaktifkan' : 'Aktifkan' }}
                    </button>
                    <button @click="generateToken(item.class_id)" class="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md transition-colors" title="Regenerate Token (Token lama akan hangus)">
                      Regenerate
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- QR Code Modal -->
    <div v-if="selectedKiosk" class="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-0" aria-hidden="true" @click="closeQrModal"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                  QR Code Kiosk - {{ selectedKiosk.class_name }}
                </h3>
                <div class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <qrcode-vue :value="kioskUrl" :size="250" level="M" render-as="svg" id="qr-canvas"></qrcode-vue>
                  <p class="mt-4 text-xs text-gray-500 text-center break-all">
                    {{ kioskUrl }}
                  </p>
                  <div class="mt-4 flex space-x-2 w-full">
                     <a :href="kioskUrl" target="_blank" class="flex-1 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm">
                      Buka Link
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm" @click="closeQrModal">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'
import QrcodeVue from 'qrcode.vue'

const { success: toastSuccess, error: toastError } = useToast()
const kiosks = ref([])
const loading = ref(false)
const selectedKiosk = ref(null)

const fetchKiosks = async () => {
  loading.value = true
  try {
    const response = await api.get('/v1/tahfidz-kiosks')
    if (response.success) {
      kiosks.value = response.data
    }
  } catch (error) {
    toastError('Gagal mengambil data kiosk')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const generateToken = async (classId) => {
  if (!confirm('Anda yakin ingin men-generate/regenerate token? QR Code lama tidak akan berlaku lagi.')) {
    return
  }

  try {
    const response = await api.post('/v1/tahfidz-kiosks/generate', { class_id: classId })
    if (response.success) {
      toastSuccess(response.message)
      fetchKiosks()
    }
  } catch (error) {
    toastError(error.message || 'Gagal generate token')
  }
}

const toggleActive = async (item) => {
  const action = item.is_active ? 'menonaktifkan' : 'mengaktifkan'
  if (!confirm(`Anda yakin ingin ${action} kiosk ini?`)) {
    return
  }

  try {
    const response = await api.patch(`/v1/tahfidz-kiosks/${item.kiosk_id}/toggle-active`)
    if (response.success) {
      toastSuccess(response.message)
      fetchKiosks()
    }
  } catch (error) {
    toastError(error.message || 'Gagal mengubah status kiosk')
  }
}

const showQrCode = (item) => {
  selectedKiosk.value = item
}

const closeQrModal = () => {
  selectedKiosk.value = null
}

const kioskUrl = computed(() => {
  if (!selectedKiosk.value || !selectedKiosk.value.token) return ''
  // Get current domain and protocol
  const origin = window.location.origin
  return `${origin}/kiosk/tahfidz/${selectedKiosk.value.token}`
})

onMounted(() => {
  fetchKiosks()
})
</script>
