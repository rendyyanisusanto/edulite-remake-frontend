<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Data Pelanggaran Siswa</h1>
      <div class="flex items-center gap-3">
        <select v-model="selectedAcademicYear" @change="handleAcademicYearChange" class="block w-48 rounded-md border-gray-300 px-3 py-2 border bg-white focus:ring-primary focus:border-primary">
          <option value="">Semua Tahun Ajaran</option>
          <option v-for="y in academicYears" :key="y.id" :value="y.id">{{ y.name }}</option>
        </select>
        <BaseButton @click="openCreateModal">Catat Pelanggaran</BaseButton>
      </div>
    </div>

    <BaseTable :columns="columns" :data="items" :loading="loading" :total="total" :currentPage="currentPage" :perPage="limit" :searchQuery="search" @update:searchQuery="handleSearch" @page-change="handlePageChange" @sort="handleSort" :sortBy="sortBy" :sortDesc="sortDesc">
      <template #cell-student="{ item }">
        <div>
          <span class="font-medium">{{ item.student?.full_name || '-' }}</span>
          <span class="block text-xs text-gray-500">NIS: {{ item.student?.nis || '-' }}</span>
        </div>
      </template>
      <template #cell-type="{ item }">
        <div>
          <span>{{ item.type?.name || '-' }}</span>
          <span v-if="item.type?.level?.name" class="ml-2 px-1.5 py-0.5 rounded text-xs font-semibold" :class="getLevelBadge(item.type?.level?.name)">{{ item.type.level.name }}</span>
        </div>
      </template>
      <template #cell-point="{ item }">
        <span class="font-bold text-red-600">{{ item.type?.point || 0 }}</span>
      </template>
      <template #cell-status="{ item }">
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="getStatusBadge(item.status)">{{ item.status || 'PENDING' }}</span>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2">
          <button @click="openEditModal(item)" title="Edit" class="text-blue-600 hover:text-blue-900"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
          <button @click="generatePdf(item)" title="Cetak Tanda Terima" :disabled="currentPdfItem === item.id" class="text-emerald-600 hover:text-emerald-900 disabled:opacity-40">
            <svg v-if="currentPdfItem === item.id" class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          </button>
          <button @click="confirmDelete(item)" title="Hapus" class="text-red-600 hover:text-red-900"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
        </div>
      </template>
    </BaseTable>

    <!-- Create/Edit Modal -->
    <BaseModal v-model="showModal" :title="isEditing ? 'Edit Pelanggaran' : 'Catat Pelanggaran Baru'" maxWidth="xl">
      <form @submit.prevent="saveData" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <BaseSearchSelect
              v-model="form.student_id"
              :initial-label="form.student_name"
              label="Pilih Siswa"
              placeholder="Ketik nama siswa atau NIS..."
              :fetch-options="fetchStudentOptions"
              required
            />
          </div>

          <div class="sm:col-span-2">
            <BaseSearchSelect
              v-model="form.type_id"
              :initial-label="form.type_name"
              label="Jenis Pelanggaran"
              placeholder="Ketik nama jenis pelanggaran..."
              :fetch-options="fetchViolationTypeOptions"
              required
            />
          </div>

          <BaseInput id="date" v-model="form.date" type="date" label="Tanggal Kejadian" required />
          <BaseInput id="location" v-model="form.location" label="Lokasi" placeholder="Contoh: Halaman Sekolah" />

          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Keterangan / Kronologi</label>
            <textarea v-model="form.description" rows="3" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" placeholder="Deskripsi kejadian..."></textarea>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
            <select v-model="form.academic_year_id" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50">
              <option value="">Otomatis (Tahun Aktif)</option>
              <option v-for="y in academicYears" :key="y.id" :value="y.id">{{ y.name }}</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select v-model="form.status" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50">
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Disetujui</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </div>
        </div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="saveData" :loading="saving">Simpan</BaseButton>
      </template>
    </BaseModal>

    <!-- Delete Confirmation -->
    <BaseModal v-model="showDeleteModal" title="Konfirmasi Hapus" maxWidth="sm">
      <p class="text-sm text-gray-500">Yakin ingin menghapus data pelanggaran siswa <b>{{ currentItem?.student?.full_name }}</b>?</p>
      <template #footer>
        <BaseButton variant="outline" @click="showDeleteModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton variant="danger" @click="deleteData" :loading="deleting">Ya, Hapus</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseSearchSelect from '@/components/forms/BaseSearchSelect.vue'
import { studentViolationService, violationTypeService } from '@/services/api/violation.service'
import studentService from '@/services/api/student.service'
import { academicYearService } from '@/services/api/academic.service'
import schoolProfileService from '@/services/api/schoolProfile.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()
const items = ref([]); const typeOptions = ref([]); const loading = ref(false); const total = ref(0); const currentPage = ref(1); const limit = ref(10); const search = ref(''); const sortBy = ref('date'); const sortDesc = ref(true)
const showModal = ref(false); const showDeleteModal = ref(false); const isEditing = ref(false); const saving = ref(false); const deleting = ref(false); const currentItem = ref(null)
const defaultForm = { student_id: '', student_name: '', type_id: '', type_name: '', date: new Date().toISOString().split('T')[0], location: '', description: '', status: 'PENDING', academic_year_id: '' }
const form = reactive({ ...defaultForm })
const academicYears = ref([])
const selectedAcademicYear = ref('')
const currentPdfItem = ref(null)
const schoolProfile = ref(null)

const columns = [
  { key: 'date', label: 'Tanggal', sortable: true },
  { key: 'student', label: 'Siswa', sortable: false },
  { key: 'type', label: 'Jenis & Level', sortable: false },
  { key: 'point', label: 'Poin', sortable: false },
  { key: 'location', label: 'Lokasi', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-24 text-right' }
]

const getLevelBadge = (name) => {
  if (!name) return 'bg-gray-100 text-gray-800'
  const n = name.toLowerCase()
  if (n.includes('ringan') || n.includes('light')) return 'bg-green-100 text-green-800'
  if (n.includes('sedang') || n.includes('medium')) return 'bg-yellow-100 text-yellow-800'
  if (n.includes('berat') || n.includes('heavy')) return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}

const getStatusBadge = (status) => {
  switch(status) {
    case 'APPROVED': return 'bg-green-100 text-green-800'
    case 'REJECTED': return 'bg-red-100 text-red-800'
    default: return 'bg-yellow-100 text-yellow-800'
  }
}

const handleAcademicYearChange = () => {
  currentPage.value = 1
  fetchData()
}

const fetchData = async () => { 
  loading.value = true; 
  try { 
    const r = await studentViolationService.getAll({ 
      page: currentPage.value, 
      limit: limit.value, 
      search: search.value, 
      sortBy: sortBy.value, 
      sortDesc: sortDesc.value,
      academic_year_id: selectedAcademicYear.value
    }); 
    if (r.success) { items.value = r.data.studentViolations; total.value = r.data.totalItems; } 
  } catch (e) { showError('Gagal mengambil data') } finally { loading.value = false } 
}

const fetchViolationTypeOptions = async (query) => {
  try {
    const r = await violationTypeService.getAll({ search: query, limit: 30 })
    const types = r.data.violationTypes || []
    return types.map(t => ({
      value: t.id,
      label: t.name,
      description: `Poin: ${t.point} — ${t.level?.name || 'Tanpa Level'}`
    }))
  } catch (e) { return [] }
}

const loadAcademicYears = async () => {
  try {
    const r = await academicYearService.getAll({ limit: 100 })
    if (r.success) {
      academicYears.value = r.data.academicYears || []
      const active = academicYears.value.find(y => y.is_active)
      if (active) selectedAcademicYear.value = active.id
    }
  } catch (e) {}
}

const fetchStudentOptions = async (query) => {
  try {
    const res = await studentService.getAll({ search: query, limit: 15, page: 1 })
    if (res.success && res.data.students) {
      return res.data.students.map(s => ({ value: s.id, label: s.full_name, description: `NIS: ${s.nis} - ${s.gender}` }))
    }
    return []
  } catch (e) { return [] }
}

const handlePageChange = (p) => { currentPage.value = p; fetchData() }
let st; const handleSearch = (v) => { search.value = v; clearTimeout(st); st = setTimeout(() => { currentPage.value = 1; fetchData() }, 500) }
const handleSort = (k) => { if (sortBy.value === k) sortDesc.value = !sortDesc.value; else { sortBy.value = k; sortDesc.value = true }; fetchData() }
const openCreateModal = () => { 
    isEditing.value = false; 
    currentItem.value = null; 
    for (const key in form) delete form[key];
    Object.assign(form, { ...defaultForm, date: new Date().toISOString().split('T')[0] }); 
    showModal.value = true 
}
const openEditModal = (item) => { isEditing.value = true; currentItem.value = item; Object.assign(form, item); form.student_name = item.student?.full_name || ''; form.type_name = item.type?.name || ''; showModal.value = true }
const confirmDelete = (item) => { currentItem.value = item; showDeleteModal.value = true }
const saveData = async () => { if (!form.student_id || !form.type_id || !form.date) return showError('Lengkapi siswa, jenis, dan tanggal!'); saving.value = true; try { if (isEditing.value) await studentViolationService.update(currentItem.value.id, form); else await studentViolationService.create(form); success('Data tersimpan'); showModal.value = false; fetchData() } catch (e) { showError('Gagal menyimpan') } finally { saving.value = false } }
const deleteData = async () => { deleting.value = true; try { await studentViolationService.delete(currentItem.value.id); success('Data dihapus'); showDeleteModal.value = false; if (items.value.length === 1 && currentPage.value > 1) currentPage.value--; fetchData() } catch (e) { showError('Gagal menghapus') } finally { deleting.value = false } }
const loadSchoolProfile = async () => {
  try {
    const r = await schoolProfileService.get()
    if (r?.data) schoolProfile.value = r.data
  } catch (e) {}
}

const formatDate = (val) => {
  if (!val) return '-'
  return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

const getLevelColor = (name) => {
  if (!name) return [75, 85, 99]
  const n = name.toLowerCase()
  if (n.includes('ringan') || n.includes('light')) return [22, 163, 74]
  if (n.includes('sedang') || n.includes('medium')) return [202, 138, 4]
  if (n.includes('berat') || n.includes('heavy')) return [220, 38, 38]
  return [75, 85, 99]
}

// Fetch header.png from backend static and convert to dataURL (cached)
let _headerImgCache = null
const loadHeaderImage = async () => {
  if (_headerImgCache) return _headerImgCache
  try {
    const resp = await fetch('/public/header.png')
    if (!resp.ok) return null
    const blob = await resp.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => { _headerImgCache = reader.result; resolve(reader.result) }
      reader.readAsDataURL(blob)
    })
  } catch { return null }
}

const generatePdf = async (item) => {
  currentPdfItem.value = item.id
  try {
    // Fetch full detail (includes creator, approver, class info etc)
    const r = await studentViolationService.getById(item.id)
    const d = r?.data || item

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.width
    const margin = 22.6  // ~65pt, same as permission letter

    // ── Kop Surat — same header.png as surat izin siswa ───────────────────
    const headerImg = await loadHeaderImage()
    let startY = 10

    if (headerImg) {
      // Render image same width as content area, from left margin
      const contentW = pageW - margin * 2
      doc.addImage(headerImg, 'PNG', margin, 0, contentW, 0)
      // Approximate header height: permission letter uses ~70pt ≈ 24.7mm
      startY = 28
    } else {
      // Fallback: text kop
      const sp = schoolProfile.value
      const schoolName = sp?.school_name || 'SEKOLAH'
      const schoolAddress = sp?.address || ''
      const schoolPhone = sp?.phone || ''
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(17, 24, 39)
      doc.text(schoolName.toUpperCase(), pageW / 2, 14, { align: 'center' })
      if (schoolAddress) {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(75, 85, 99)
        const addrLine = schoolPhone ? `${schoolAddress}  |  Telp. ${schoolPhone}` : schoolAddress
        doc.text(addrLine, pageW / 2, 20, { align: 'center' })
      }
      startY = 26
    }

    // ── Document Title ────────────────────────────────────────────────────
    const titleY = startY + 20
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(17, 24, 39)
    doc.text('BERITA ACARA PELANGGARAN SISWA', pageW / 2, titleY, { align: 'center' })

    const noSurat = `No. ${String(d.id).padStart(4, '0')}/${new Date(d.date || d.createdAt).getFullYear()}`
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(75, 85, 99)
    doc.text(noSurat, pageW / 2, titleY + 6, { align: 'center' })

    // ── Info Section ──────────────────────────────────────────────────────
    const levelName = d.type?.level?.name || '-'
    const levelColor = getLevelColor(levelName)

    const tableBody = [
      ['Tanggal Kejadian', formatDate(d.date)],
      ['Nama Siswa', d.student?.full_name || '-'],
      ['NIS', d.student?.nis || '-'],
      ['Jenis Pelanggaran', d.type?.name || '-'],
      ['Tingkat Pelanggaran', levelName],
      ['Poin Pelanggaran', String(d.type?.point ?? '-')],
      ['Lokasi Kejadian', d.location || '-'],
      ['Tahun Ajaran', d.academic_year?.name || '-'],
      ['Kronologi / Keterangan', d.description || '-'],
      ['Dicatat Oleh', 'Tim Tatib'],
    ]

    autoTable(doc, {
      body: tableBody,
      startY: titleY + 13,
      theme: 'plain',
      styles: { font: 'helvetica', fontSize: 10, valign: 'top', cellPadding: { top: 2, bottom: 2, left: 2, right: 2 }, textColor: [31, 41, 55] },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: 'bold', textColor: [55, 65, 81] },
        1: { cellWidth: 'auto' }
      },
      didParseCell: function (data) {
        // Highlight level cell
        if (data.section === 'body' && data.row.index === 4 && data.column.index === 1) {
          data.cell.styles.textColor = levelColor
          data.cell.styles.fontStyle = 'bold'
        }
        // Highlight point cell
        if (data.section === 'body' && data.row.index === 5 && data.column.index === 1) {
          data.cell.styles.textColor = [220, 38, 38]
          data.cell.styles.fontStyle = 'bold'
        }
      },
      didDrawRow: function (data) {
        // Add colon separator
        if (data.section === 'body') {
          const x = data.row.cells[0].x + data.row.cells[0].width
          const y = data.row.cells[0].y + data.row.cells[0].height / 2 + 1
          doc.setTextColor(55, 65, 81)
          doc.setFontSize(10)
          doc.text(':', x - 3, y)
        }
      }
    })

    // ── Signature Section (Verification QR) ──────────────────────────────
    const verifyUrl = `${window.location.origin}/verify?type=violation&id=${d.id}&token=${d.verify_token}`
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, scale: 5 })
    
    const afterY = doc.lastAutoTable.finalY + 15
    const qrSize = 25
    const rightEdge = pageW - margin
    
    // Calculate text width to center the QR code above it
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    const text1 = 'Tertanda tangani dan terverifikasi secara elektronik'
    const text2 = 'Scan QR Code untuk verifikasi keaslian.'
    const textW = doc.getTextWidth(text1)
    const centerX = rightEdge - (textW / 2)
    
    // Add QR Code
    doc.addImage(qrDataUrl, 'PNG', centerX - (qrSize / 2), afterY, qrSize, qrSize)
    
    // Add Verification Text
    doc.setTextColor(75, 85, 99)
    doc.text(text1, rightEdge, afterY + qrSize + 6, { align: 'right' })
    doc.text(text2, rightEdge, afterY + qrSize + 11, { align: 'right' })

    // ── Footer ────────────────────────────────────────────────────────────
    doc.setFontSize(7.5)
    doc.setTextColor(150, 150, 150)
    doc.text(`Dicetak pada: ${formatDate(new Date().toISOString().split('T')[0])}`, margin, 285, { align: 'left' })

    const studentName = (d.student?.full_name || 'siswa').replace(/\s+/g, '_')
    const dateStr = (d.date || '').replace(/-/g, '')
    doc.save(`Pelanggaran_${studentName}_${dateStr}.pdf`)

  } catch (e) {
    showError('Gagal membuat PDF: ' + (e.message || ''))
  } finally {
    currentPdfItem.value = null
  }
}

onMounted(async () => { await Promise.all([loadAcademicYears(), loadSchoolProfile()]); fetchData() })
</script>
