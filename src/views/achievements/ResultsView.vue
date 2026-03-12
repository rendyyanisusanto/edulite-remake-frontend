<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Hasil & Penghargaan</h1>
      <BaseButton @click="openCreateModal">Catat Hasil</BaseButton>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-end">
       <div class="w-full sm:w-64">
         <!-- This could be enhanced to filter by participant or achievement, simplified for now -->
       </div>
    </div>

    <BaseTable :columns="columns" :data="items" :loading="loading" :total="total" :currentPage="currentPage" :perPage="limit" :searchQuery="search" @update:searchQuery="handleSearch" @page-change="handlePageChange" @sort="handleSort" :sortBy="sortBy" :sortDesc="sortDesc">
      <template #cell-participant="{ item }">
        <div class="font-medium text-gray-900">
           {{ item.participant?.student?.full_name || item.participant?.teacher?.full_name || '-' }}
        </div>
        <div class="text-xs text-gray-500">{{ item.participant?.achievement?.title || '-' }}</div>
      </template>
      <template #cell-result="{ item }">
        <div class="font-medium text-blue-700">{{ item.rank || '-' }}</div>
        <div class="text-xs text-gray-500">Kategori: {{ item.category || '-' }}</div>
        <div v-if="item.point_rule" class="text-xs text-green-600 mt-1">Aturan: {{ item.point_rule.level }} - {{ item.point_rule.rank }} {{ item.point_rule.category ? '- ' + item.point_rule.category : '' }} (+{{ item.point_rule.points }})</div>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2">
          <button @click="openEditModal(item)" class="text-blue-600 hover:text-blue-900" title="Edit"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
          <button @click="confirmDelete(item)" class="text-red-600 hover:text-red-900" title="Hapus"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="showModal" :title="isEditing ? 'Edit Hasil Prestasi' : 'Catat Hasil Prestasi'" maxWidth="md">
      <form @submit.prevent="saveData" class="space-y-4">
        
        <div class="mb-4">
           <BaseSearchSelect
              label="Pilih Peserta Prestasi"
              v-model="form.participant_id"
              :initialLabel="form.participant_label"
              :fetchOptions="fetchParticipantOptions"
              placeholder="Cari nama peserta / judul prestasi..."
              required
           />
           <p class="text-xs text-gray-500 mt-1">Cari berdasarkan nama siswa/guru, atau judul prestasinya.</p>
        </div>

        <div class="mb-4">
           <BaseSearchSelect
              label="Pilih Aturan Poin"
              v-model="form.point_rule_id"
              :initialLabel="form.point_rule_label"
              :fetchOptions="fetchPointRuleOptions"
              @change="handlePointRuleChange"
              placeholder="Cari tingkat atau kategori aturan poin..."
           />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput id="rank" v-model="form.rank" label="Peringkat/Juara" placeholder="Contoh: Juara 1" required />
          <BaseInput id="score" v-model="form.score" label="Skor/Nilai" placeholder="Contoh: 95.5" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput id="category" v-model="form.category" label="Kategori Lomba" placeholder="Contoh: Beregu Putra" />
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Poin yang didapat</label>
            <input type="number" v-model="form.points" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50" placeholder="0" min="0" />
            <p class="text-xs text-gray-500 mt-1">Otomatis terisi jika memilih aturan poin, tapi bisa diubah.</p>
          </div>
        </div>

        <!-- File Upload placeholder for certificate -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Upload Sertifikat</label>
          <input type="file" @change="handleFileUpload" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          <p v-if="form.certificate_file" class="text-xs text-green-600 mt-1">File saat ini: {{ form.certificate_file }}</p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
          <textarea v-model="form.notes" rows="2" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" placeholder="Opsional"></textarea>
        </div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="saveData" :loading="saving">Simpan</BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="showDeleteModal" title="Konfirmasi Hapus" maxWidth="sm">
      <p class="text-sm text-gray-500">Yakin ingin menghapus catatan hasil ini?</p>
      <template #footer>
        <BaseButton variant="outline" @click="showDeleteModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton variant="danger" @click="deleteData" :loading="deleting">Ya, Hapus</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseSearchSelect from '@/components/forms/BaseSearchSelect.vue'

import { achievementService } from '@/services/api/achievement.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()
const items = ref([]); const loading = ref(false); const total = ref(0); const currentPage = ref(1); const limit = ref(10); const search = ref(''); const sortBy = ref('id'); const sortDesc = ref(true)
const showModal = ref(false); const showDeleteModal = ref(false); const isEditing = ref(false); const saving = ref(false); const deleting = ref(false); const currentItem = ref(null)

const defaultForm = { participant_id: '', rank: '', score: '', category: '', certificate_file: '', notes: '', point_rule_id: '', points: 0, participant_label: '', point_rule_label: '' }
const form = reactive({ ...defaultForm })

let pointRulesCache = []
const uploadedFile = ref(null)

const columns = [
  { key: 'participant', label: 'Peserta & Prestasi', sortable: false },
  { key: 'result', label: 'Hasil & Kategori', sortable: false },
  { key: 'points', label: 'Poin', sortable: false },
  { key: 'notes', label: 'Catatan', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-24 text-right' }
]

const fetchParticipantOptions = async (query) => {
  try {
    const res = await achievementService.getParticipants({ search: query, limit: 10 });
    return res.data?.participants?.map(item => {
      const name = item.student ? item.student.full_name : (item.teacher ? item.teacher.full_name : 'Unknown');
      const title = item.achievement ? item.achievement.title : 'Unknown Achievement';
      return {
        value: item.id,
        label: `${name} - ${title}`,
        description: `Peran: ${item.role || '-'}`
      }
    }) || []
  } catch (error) { return [] }
}

const fetchPointRuleOptions = async (query) => {
  try {
    const res = await achievementService.getPointRules({ search: query, limit: 10 });
    const rules = res.data?.rules || [];
    pointRulesCache = rules; // Cache for finding points later
    return rules.map(item => {
      const labelParts = [item.level];
      if (item.rank) labelParts.push(item.rank);
      if (item.category) labelParts.push(item.category);
      return {
        value: item.id,
        label: labelParts.join(' - '),
        description: `Poin: +${item.points}`
      }
    })
  } catch (error) { return [] }
}

const handlePointRuleChange = (option) => {
  if (!option) return;
  const rule = pointRulesCache.find(r => r.id === option.value);
  if (rule) {
    form.points = rule.points;
    if (!form.rank && rule.rank) form.rank = rule.rank;
    if (!form.category && rule.category) form.category = rule.category;
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadedFile.value = file
    form.certificate_file = file.name // Simple indication
  }
}

const fetchData = async () => { 
  loading.value = true; 
  try { 
    const r = await achievementService.getResults({ 
      page: currentPage.value, limit: limit.value, search: search.value, sortBy: sortBy.value, sortDesc: sortDesc.value
    }); 
    if (r.success) { 
      items.value = r.data.results; 
      total.value = r.data.totalItems; 
    } 
  } catch (e) { 
    showError('Gagal mengambil data hasil prestasi') 
  } finally { 
    loading.value = false 
  } 
}

const handlePageChange = (p) => { currentPage.value = p; fetchData() }
let st; const handleSearch = (v) => { search.value = v; clearTimeout(st); st = setTimeout(() => { currentPage.value = 1; fetchData() }, 500) }
const handleSort = (k) => { if (sortBy.value === k) sortDesc.value = !sortDesc.value; else { sortBy.value = k; sortDesc.value = true }; fetchData() }

const openCreateModal = () => { 
    isEditing.value = false; currentItem.value = null; Object.assign(form, defaultForm); 
    uploadedFile.value = null;
    showModal.value = true 
}

const openEditModal = (item) => { 
  isEditing.value = true; 
  currentItem.value = item; 
  
  const p = item.participant;
  const name = p?.student ? p.student.full_name : (p?.teacher ? p.teacher.full_name : '');
  const title = p?.achievement?.title || '';
  const pr = item.point_rule;

  const labelParts = [pr?.level];
  if (pr?.rank) labelParts.push(pr.rank);
  if (pr?.category) labelParts.push(pr.category);

  Object.assign(form, {
      ...item,
      participant_label: name && title ? `${name} - ${title}` : '',
      point_rule_label: pr ? labelParts.filter(Boolean).join(' - ') : ''
  });
  uploadedFile.value = null;
  showModal.value = true 
}

const confirmDelete = (item) => { currentItem.value = item; showDeleteModal.value = true }

const saveData = async () => { 
  if (!form.participant_id) return showError('Pilih peserta!'); 
  
  saving.value = true; 
  try { 
    // Usually file upload needs FormData, but we'll send it as normal json for now since we just keep the literal string for mocking unless multipart is set up properly backend.
    const payload = { ...form };
    
    if (isEditing.value) await achievementService.updateResult(currentItem.value.id, payload); 
    else await achievementService.createResult(payload); 
    
    success('Data hasil tersimpan'); 
    showModal.value = false; 
    fetchData() 
  } catch (e) { 
    // Handle specific backend error message
    if (e.response && e.response.data && e.response.data.message) {
      showError(e.response.data.message);
    } else {
      showError('Gagal menyimpan data');
    }
  } finally { 
    saving.value = false 
  } 
}

const deleteData = async () => { 
  deleting.value = true; 
  try { 
    await achievementService.deleteResult(currentItem.value.id); 
    success('Data hasil dihapus'); 
    showDeleteModal.value = false; 
    if (items.value.length === 1 && currentPage.value > 1) currentPage.value--; 
    fetchData() 
  } catch (e) { 
    showError('Gagal menghapus data') 
  } finally { 
    deleting.value = false 
  } 
}

onMounted(() => { fetchData() })
</script>
