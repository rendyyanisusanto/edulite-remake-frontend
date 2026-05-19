<template>
  <div class="settings-page">

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Pengaturan Dokumen</h1>
        <p class="page-subtitle">Kelola konfigurasi dokumen per jenis surat dan template cetak</p>
      </div>
      <button class="btn-primary" @click="$router.push('/document-settings/create')">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Tambah Konfigurasi
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <select v-model="filters.document_type" class="filter-select" @change="fetchList">
        <option value="">Semua Jenis Dokumen</option>
        <option v-for="t in DOCUMENT_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
      </select>
      <select v-model="filters.is_active" class="filter-select" @change="fetchList">
        <option value="">Semua Status</option>
        <option value="true">Aktif</option>
        <option value="false">Nonaktif</option>
      </select>
    </div>

    <!-- Skeleton Loader -->
    <div v-if="loading" class="skeleton-wrapper">
      <div class="table-card">
        <div v-for="n in 4" :key="n" class="skeleton-row">
          <div class="skeleton-cell wide-cell"></div>
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell short-cell"></div>
          <div class="skeleton-cell short-cell"></div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div v-else-if="records.length > 0" class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Jenis Dokumen</th>
            <th>Profil Sekolah</th>
            <th>Penandatangan</th>
            <th>Kota</th>
            <th>QR Verifikasi</th>
            <th>Status</th>
            <th>Diperbarui</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.id">
            <td>
              <span class="doc-type-badge">{{ getDocTypeLabel(record.document_type) }}</span>
            </td>
            <td class="text-secondary">{{ record.schoolProfile?.name || '—' }}</td>
            <td>{{ record.signer_name || '—' }}</td>
            <td class="text-secondary">{{ record.city || '—' }}</td>
            <td>
              <span class="qr-badge" :class="record.show_qr_verification ? 'qr-on' : 'qr-off'">
                {{ record.show_qr_verification ? 'Ya' : 'Tidak' }}
              </span>
            </td>
            <td>
              <button
                class="status-badge"
                :class="record.is_active ? 'badge-active' : 'badge-inactive'"
                :disabled="togglingId === record.id"
                @click="toggleStatus(record)"
                :title="record.is_active ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'"
              >
                {{ record.is_active ? 'Aktif' : 'Nonaktif' }}
              </button>
            </td>
            <td class="text-secondary text-sm">{{ formatDate(record.updated_at) }}</td>
            <td>
              <div class="action-group">
                <button class="btn-action btn-edit" @click="$router.push(`/document-settings/${record.id}/edit`)"
                  title="Edit">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 class="empty-title">Belum ada konfigurasi dokumen</h3>
      <p class="empty-desc">Mulai dengan menambahkan konfigurasi untuk jenis dokumen pertama Anda.</p>
      <button class="btn-primary" @click="$router.push('/document-settings/create')">
        Tambah Konfigurasi Pertama
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import documentSettingService from '@/services/api/documentSetting.service'
import { useToast } from '@/composables/useToast'

const { success: toastSuccess, error: toastError } = useToast()

const loading = ref(true)
const togglingId = ref(null)
const records = ref([])

const DOCUMENT_TYPES = [
  { value: 'GENERAL', label: 'Umum (General)' },
  { value: 'PERMISSION_LETTER', label: 'Surat Izin' },
  { value: 'CERTIFICATE', label: 'Sertifikat' },
  { value: 'REPORT', label: 'Laporan' },
  { value: 'MUTATION', label: 'Mutasi' }
]

const filters = reactive({ document_type: '', is_active: '' })

onMounted(fetchList)

async function fetchList() {
  loading.value = true
  try {
    const params = {}
    if (filters.document_type) params.document_type = filters.document_type
    if (filters.is_active !== '') params.is_active = filters.is_active
    const res = await documentSettingService.list(params)
    records.value = res?.data || []
  } catch (e) {
    toastError('Gagal memuat daftar pengaturan dokumen')
  } finally {
    loading.value = false
  }
}

async function toggleStatus(record) {
  togglingId.value = record.id
  try {
    await documentSettingService.updateStatus(record.id, !record.is_active)
    record.is_active = !record.is_active
    toastSuccess(`Pengaturan berhasil ${record.is_active ? 'diaktifkan' : 'dinonaktifkan'}`)
  } catch (e) {
    toastError(e?.message || 'Gagal mengubah status')
  } finally {
    togglingId.value = null
  }
}

function getDocTypeLabel(value) {
  return DOCUMENT_TYPES.find(t => t.value === value)?.label || value
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.settings-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 0 80px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary, #0f172a);
  margin: 0 0 4px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary, #64748b);
  margin: 0;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  font-size: 13px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #1e293b;
  cursor: pointer;
  transition: border-color 0.2s;
  outline: none;
}

.filter-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

/* Table Card */
.table-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th {
  background: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
}

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f8fafc;
  vertical-align: middle;
  color: #1e293b;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover td {
  background: #f8fafc;
}

/* Doc Type Badge */
.doc-type-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: #eff6ff;
  color: #2563eb;
  white-space: nowrap;
}

/* QR Badge */
.qr-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.qr-on {
  background: #dcfce7;
  color: #16a34a;
}

.qr-off {
  background: #f1f5f9;
  color: #94a3b8;
}

/* Status Badge (clickable) */
.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
}

.status-badge:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.badge-active {
  background: #dcfce7;
  color: #16a34a;
}

.badge-inactive {
  background: #fee2e2;
  color: #dc2626;
}

.badge-active:hover:not(:disabled) {
  background: #bbf7d0;
}

.badge-inactive:hover:not(:disabled) {
  background: #fecaca;
}

.text-secondary { color: #64748b; }
.text-sm { font-size: 13px; }

/* Action Group */
.action-group {
  display: flex;
  gap: 6px;
}

.btn-action {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.btn-action svg {
  width: 15px;
  height: 15px;
}

.btn-edit { color: #2563eb; }
.btn-edit:hover { background: #eff6ff; border-color: #bfdbfe; }

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 9px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  white-space: nowrap;
}

.btn-primary svg {
  width: 16px;
  height: 16px;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  text-align: center;
}

.empty-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  margin-bottom: 16px;
}

.empty-icon svg {
  width: 28px;
  height: 28px;
}

.empty-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
}

.empty-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 20px;
  max-width: 380px;
}

/* Skeleton */
.skeleton-wrapper { display: flex; flex-direction: column; gap: 0; }

.skeleton-row {
  display: flex;
  gap: 16px;
  padding: 14px 16px;
  border-bottom: 1px solid #f8fafc;
  background: #fff;
}

.skeleton-row:first-child {
  border-radius: 16px 16px 0 0;
}

.skeleton-row:last-child {
  border-bottom: none;
  border-radius: 0 0 16px 16px;
}

.skeleton-cell {
  height: 16px;
  flex: 1;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 400% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 6px;
}

.wide-cell { flex: 2; }
.short-cell { flex: 0.5; }

@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

@media (max-width: 768px) {
  .data-table { font-size: 13px; }
  .data-table th, .data-table td { padding: 10px 12px; }
  .page-header { flex-direction: column; }
}
</style>
