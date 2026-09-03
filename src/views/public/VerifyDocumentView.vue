<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
      <!-- Header -->
      <div class="bg-blue-600 px-6 py-8 text-center">
        <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <svg v-if="loading" class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else-if="isValid" class="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white mb-1">Verifikasi Dokumen</h1>
        <p class="text-blue-100 text-sm">Sistem Informasi Akademik</p>
      </div>

      <!-- Content -->
      <div class="px-6 py-8">
        <div v-if="loading" class="text-center py-4">
          <p class="text-gray-500 font-medium">Memeriksa keaslian dokumen...</p>
        </div>
        
        <div v-else-if="isValid" class="space-y-6">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p class="text-green-800 font-semibold mb-1">Dokumen Valid & Resmi</p>
            <p class="text-green-600 text-xs">Data dokumen ditemukan di database kami.</p>
          </div>
          
          <div class="space-y-3">
            <div class="flex flex-col">
              <span class="text-xs text-gray-500 uppercase font-medium">Jenis Dokumen</span>
              <span class="text-gray-900 font-semibold">{{ documentData.type }}</span>
            </div>
            
            <div class="flex flex-col">
              <span class="text-xs text-gray-500 uppercase font-medium">Nomor Referensi</span>
              <span class="text-gray-900 font-medium">#{{ documentData.document_id }}</span>
            </div>
            
            <div class="flex flex-col" v-if="documentData.student_name">
              <span class="text-xs text-gray-500 uppercase font-medium">Nama Siswa</span>
              <span class="text-gray-900 font-medium">{{ documentData.student_name }}</span>
            </div>
            
            <div class="flex flex-col" v-if="documentData.date">
              <span class="text-xs text-gray-500 uppercase font-medium">Tanggal</span>
              <span class="text-gray-900 font-medium">{{ formatDate(documentData.date) }}</span>
            </div>

            <div class="flex flex-col" v-if="documentData.status">
              <span class="text-xs text-gray-500 uppercase font-medium">Status</span>
              <span class="inline-flex items-center mt-1">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-medium" :class="statusClass(documentData.status)">
                  {{ documentData.status }}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p class="text-red-800 font-bold mb-1">Dokumen Tidak Ditemukan</p>
            <p class="text-red-600 text-sm">Dokumen ini tidak terdaftar dalam sistem kami atau mungkin palsu.</p>
          </div>
          <p class="text-gray-500 text-sm">Pastikan QR Code dipindai dari dokumen yang benar.</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="bg-gray-50 border-t border-gray-100 px-6 py-4 text-center">
        <p class="text-xs text-gray-400">&copy; {{ new Date().getFullYear() }} Edulite System. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const loading = ref(true)
const isValid = ref(false)
const documentData = ref({})

const type = route.query.type
const id = route.query.id
const token = route.query.token

const verifyDocument = async () => {
  if (!type || !id || !token) {
    loading.value = false
    isValid.value = false
    return
  }

  try {
    const response = await api.get('/public/verify', { params: { type, id, token } })
    if (response.success && response.data) {
      isValid.value = true
      documentData.value = response.data
    } else {
      isValid.value = false
    }
  } catch (error) {
    isValid.value = false
  } finally {
    loading.value = false
  }
}

const formatDate = (val) => {
  if (!val) return '-'
  return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

const statusClass = (status) => {
  const s = String(status).toUpperCase()
  if (s === 'APPROVED' || s === 'DISETUJUI') return 'bg-green-100 text-green-800'
  if (s === 'REJECTED' || s === 'DITOLAK') return 'bg-red-100 text-red-800'
  return 'bg-yellow-100 text-yellow-800'
}

onMounted(() => {
  verifyDocument()
})
</script>
