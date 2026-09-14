<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Master Akun Peserta CBT</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola pembuatan akun dan credential peserta ujian CBT</p>
      </div>
      <div class="mt-4 sm:mt-0 space-x-2">
        <BaseButton @click="openBulkModal" variant="primary">
          <template #icon>
            <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          </template>
          Buat Akun Massal
        </BaseButton>
      </div>
    </div>

    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 flex flex-col md:flex-row gap-4 items-end">
       <div class="w-full md:w-1/4">
          <BaseSearchSelect 
            v-model="queryParams.academic_year_id" 
            label="Filter Tahun Ajaran" 
            :fetchOptions="fetchAcademicYears"
            @change="triggerFilter"
          />
       </div>
       <div class="w-full md:w-1/4">
          <BaseSearchSelect 
             v-model="queryParams.student_status" 
             label="Filter Status Siswa"
             :fetchOptions="fetchStudentStatuses"
             @change="triggerFilter"
          />
       </div>
       <div class="w-full md:w-1/4">
          <BaseSearchSelect 
             v-model="queryParams.account_status" 
             label="Filter Status Akun"
             :fetchOptions="fetchAccountStatuses"
             @change="triggerFilter"
          />
       </div>
       <div class="w-full md:w-1/4 mb-4 flex justify-end">
          <BaseButton @click="resetFilter" variant="outline">Reset Filter</BaseButton>
       </div>
    </div>

    <BaseTable 
      :columns="columns" 
      :data="items" 
      :loading="loading" 
      v-model:searchQuery="queryParams.search"
      @update:searchQuery="onSearch"
      :total="totalData"
      :currentPage="queryParams.page"
      :perPage="queryParams.limit"
      @page-change="onPageChange"
      @sort="onSort"
    >
      <template #cell-checkbox="{ item }">
         <input type="checkbox" v-model="selectedIds" :value="item.id" class="h-4 w-4 text-primary border-gray-300 rounded outline-none focus:ring-0">
      </template>

      <template #cell-student="{ item }">
        <div class="font-medium text-gray-900">{{ item.name }}</div>
        <div class="text-xs text-gray-500">NIS: {{ item.nis || '-' }} | NISN: {{ item.nisn || '-' }}</div>
      </template>
      
      <template #cell-class_info="{ item }">
        <div>{{ item.class_name }}</div>
        <div class="text-xs text-gray-500">{{ item.grade }} | {{ item.department }}</div>
      </template>

      <template #cell-credential="{ item }">
        <div v-if="item.username">
            <span class="text-gray-900 font-mono">{{ item.username }}</span>
        </div>
        <div v-else class="text-gray-400 italic text-xs">Belum ada</div>
      </template>

      <template #cell-account_status="{ item }">
        <span 
          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
          :class="{
              'bg-gray-100 text-gray-800': item.account_status === 'Belum dibuat',
              'bg-red-100 text-red-800': item.account_status === 'Data bermasalah',
              'bg-green-100 text-green-800': item.account_status === 'Aktif',
              'bg-amber-100 text-amber-800': item.account_status === 'Nonaktif'
          }"
        >
          {{ item.account_status }}
        </span>
        <!-- student status context -->
        <span v-if="item.student_status !== 'AKTIF'" class="ml-1 text-xs text-red-500 font-bold" title="Status siswa tidak aktif">[!]</span>
      </template>
      
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2">
          
          <button v-if="item.account_status === 'Belum dibuat'" @click="createSingle(item)" class="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 p-1.5 rounded" title="Buat Akun">
             <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          </button>

          <button v-if="['Aktif', 'Nonaktif'].includes(item.account_status)" @click="toggleStatus(item)" class="p-1.5 rounded" :class="item.account_status === 'Aktif' ? 'text-amber-600 hover:text-amber-900 bg-amber-50 hover:bg-amber-100' : 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100'" :title="item.account_status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'">
            <svg v-if="item.account_status === 'Aktif'" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
            <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </button>
          
          <button v-if="['Aktif', 'Nonaktif'].includes(item.account_status)" @click="promptResetPassword(item)" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded" title="Reset Password">
             <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
          
        </div>
      </template>
    </BaseTable>

    <!-- Modal Generate Result -->
    <BaseModal v-model="showResultModal" title="Hasil Pembuatan Akun" maxWidth="lg">
        <div class="px-2">
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
               <p class="text-sm text-yellow-700 font-medium">BACA DAN UNDUH SEKARANG!</p>
               <p class="text-xs text-yellow-600 mt-1">Password baru di bawah ini hanya tampil <span class="font-bold underline">SATU KALI SAJA</span> untuk keamanan. Begitu Anda menutup dialog atau me-refresh, data ini tidak dapat dikembalikan lagi, kecuali melalui hard reset password per siswa.</p>
            </div>
            
            <p v-if="generationErrorCount > 0" class="text-sm font-medium text-red-600 mb-2">Perhatian: {{ generationErrorCount }} siswa gagal digenerate akunnya (Mungkin duplikat atau NIS kosong).</p>

            <div class="max-h-64 overflow-auto border rounded divide-y mb-4 bg-gray-50 text-sm">
                <div v-for="acct in createdAccounts" :key="acct.username" class="p-2 flex justify-between">
                    <div>
                        <p class="font-bold text-gray-800">{{ acct.name }}</p>
                        <p class="text-xs text-gray-500 font-mono">{{ acct.nis }} ({{ acct.username }})</p>
                    </div>
                    <div class="flex items-center text-primary font-mono bg-white border px-2 py-1 rounded">
                        {{ acct.password }}
                    </div>
                </div>
                <div v-if="createdAccounts.length === 0" class="p-4 text-center text-gray-500">
                    Tidak ada akun yang berhasil ter-generate.
                </div>
            </div>

            <div class="flex justify-between items-center bg-gray-100 p-3 rounded h-full relative">
                <div>
                    <h3 class="font-medium text-gray-800">Unduh Rekap Password (CSV)</h3>
                    <p class="text-xs text-gray-500 mt-1">Disarankan dicetak dan dibagikan.</p>
                </div>
                <BaseButton v-if="createdAccounts.length > 0" @click="downloadCsv" variant="primary">
                   Unduh CSV
                </BaseButton>
            </div>
        </div>
        <div class="flex justify-end space-x-3 mt-6">
             <BaseButton variant="outline" @click="showResultModal = false">Saya Mengerti & Tutup</BaseButton>
        </div>
    </BaseModal>

    <!-- Modal Konfirmasi Bulk -->
    <BaseModal v-model="showBulkModal" title="Pembuatan Akun Massal">
        <p class="text-sm text-gray-600 mb-4">
          Anda akan memproses pembuatan akun bagi <span class="font-bold text-gray-900">{{ selectedIds.length }}</span> siswa yang dipilih. 
          Sistem akan melewati/skip secara otomatis bila siswa tersebut sudah memiliki akun.
        </p>
        <div class="flex justify-end space-x-3 mt-6">
             <BaseButton variant="outline" @click="showBulkModal = false" :disabled="saving">Batal</BaseButton>
             <BaseButton variant="primary" @click="submitBulk" :loading="saving" :disabled="selectedIds.length === 0">Lanjutkan</BaseButton>
        </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseSearchSelect from '@/components/forms/BaseSearchSelect.vue'
import cbtMasterService from '@/services/api/cbt-master.service'
import { useToast } from '@/composables/useToast'

const toast = useToast()

const columns = [
  { key: 'checkbox', label: '#', sortable: false },
  { key: 'student', label: 'Siswa / NIS', sortable: true },
  { key: 'class_info', label: 'Kelas / Tingkat', sortable: false },
  { key: 'credential', label: 'Username', sortable: false },
  { key: 'account_status', label: 'Status Akun', sortable: true },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'text-right' }
]

const items = ref([])
const totalData = ref(0)
const loading = ref(false)
const selectedIds = ref([])

const queryParams = ref({
  page: 1,
  limit: 20,
  search: '',
  academic_year_id: '',
  student_status: '',
  account_status: '',
  sort_by: 'name',
  sort_order: 'ASC'
})

const loadData = async () => {
    loading.value = true
    try {
        const res = await cbtMasterService.getStudentAccounts(queryParams.value)
        if (res.data.success) {
            items.value = res.data.data.data
            totalData.value = res.data.data.total
            // Optionally, selectedIds can be reset fully or maintained across pages if desired. Easiest is not resetting.
        }
    } catch (e) {
        toast.error('Gagal memuat data akun siswa')
    } finally {
        loading.value = false
    }
}

let searchTimeout = null;
const onSearch = (val) => {
    queryParams.value.search = val
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        queryParams.value.page = 1
        loadData()
    }, 500)
}

const onPageChange = (page) => {
    queryParams.value.page = page
    loadData()
}

const triggerFilter = () => {
    queryParams.value.page = 1
    loadData()
}

const resetFilter = () => {
    queryParams.value.academic_year_id = ''
    queryParams.value.student_status = ''
    queryParams.value.account_status = ''
    queryParams.value.search = ''
    queryParams.value.page = 1
    selectedIds.value = []
    
    // We also need to clear dropdown text refs if we use BaseSearchSelect by passing unique key or binding label, however we didn't inject label variables here to save verbosity. 
    loadData()
}

const onSort = (key) => {
    if (queryParams.value.sort_by === key) {
        queryParams.value.sort_order = queryParams.value.sort_order === 'ASC' ? 'DESC' : 'ASC'
    } else {
        queryParams.value.sort_by = key
        queryParams.value.sort_order = 'ASC'
    }
    loadData()
}

// Bulk Generation handling
const showBulkModal = ref(false)
const saving = ref(false)
const showResultModal = ref(false)
const createdAccounts = ref([])
const generationErrorCount = ref(0)

const openBulkModal = () => {
    if (selectedIds.value.length === 0) {
        toast.error('Silakan pilih (checklist) minimal satu siswa untuk di-generate.')
        return 
    }
    showBulkModal.value = true
}

const submitBulk = async () => {
    saving.value = true
    try {
        const res = await cbtMasterService.createBulkStudentAccounts(selectedIds.value)
        if (res.data.success) {
            toast.success(`Berhasil memproses ${selectedIds.value.length} akun.`)
            createdAccounts.value = res.data.data.created || []
            generationErrorCount.value = (res.data.data.skipped || []).length
            showBulkModal.value = false
            showResultModal.value = true
            selectedIds.value = []
            loadData()
        }
    } catch (e) {
        toast.error('Proses bulk creation gagal. ' + (e.response?.data?.message || ''))
    } finally {
        saving.value = false
    }
}

const createSingle = async (item) => {
    saving.value = true
    try {
        const res = await cbtMasterService.createStudentAccount(item.id)
        if (res.data.success) {
            toast.success('Akun berhasil dibuat.')
            createdAccounts.value = res.data.data || []
            generationErrorCount.value = 0
            showResultModal.value = true
            loadData()
        }
    } catch (e) {
        toast.error('Gagal membuat akun. ' + (e.response?.data?.message || ''))
    } finally {
        saving.value = false
    }
}

const promptResetPassword = async (item) => {
    if(!confirm(`Yakin mereset password CBT untuk ${item.name}? \nSesi login mereka saat ini akan dikeluarkan paksa.`)) return
    
    saving.value = true
    try {
        const res = await cbtMasterService.resetStudentAccountPassword(item.user_id) // item.user_id 
        if (res.data.success) {
            toast.success('Password berhasil direset!')
            
            // Format mock payload for the modal UI
            createdAccounts.value = [{
                name: item.name,
                nis: item.nis,
                username: res.data.data.username,
                password: res.data.data.password
            }]
            generationErrorCount.value = 0
            showResultModal.value = true
        }
    } catch (e) {
        toast.error('Gagal mereset password. ' + (e.response?.data?.message || ''))
    } finally {
        saving.value = false
    }
}

const toggleStatus = async (item) => {
    const nextStatus = item.account_status !== 'Aktif'
    try {
        await cbtMasterService.updateStudentAccountStatus(item.user_id, nextStatus)
        toast.success(`Berhasil ${nextStatus ? 'mengaktifkan' : 'menonaktifkan'} akun`)
        loadData()
    } catch (e) {
        toast.error('Gagal mengubah status. ' + (e.response?.data?.message || ''))
    }
}

const downloadCsv = () => {
    if (createdAccounts.value.length === 0) return

    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent += "NIS,Nama Siswa,Username,Password Awal\n"

    createdAccounts.value.forEach(row => {
        let nameField = row.name.replace(/"/g, '""'); // escape quotes
        let formatStr = `"${row.nis}","${nameField}","${row.username}","${row.password}"\n`;
        csvContent += formatStr;
    });

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Data_Akun_CBT_${new Date().getTime()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

// Lookup definitions
const fetchAcademicYears = async () => {
    const res = await cbtMasterService.getLookups('academic-years', {})
    return res.data?.data?.map(o => ({ value: o.id, label: o.name, description: o.is_active ? 'Aktif' : '' })) || []
}
const fetchStudentStatuses = async () => {
    return Promise.resolve([
        { value: 'AKTIF', label: 'Aktif' },
        { value: 'LULUS', label: 'Lulus' },
        { value: 'PINDAH', label: 'Pindah' }
    ])
}
const fetchAccountStatuses = async () => {
    return Promise.resolve([
        { value: 'Belum dibuat', label: 'Belum dibuat' },
        { value: 'Data bermasalah', label: 'Data bermasalah (Non-eligible)' },
        { value: 'Aktif', label: 'Aktif' },
        { value: 'Nonaktif', label: 'Nonaktif' }
    ])
}

onMounted(() => {
    loadData()
})
</script>
