<template>
  <div class="settings-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Profil Sekolah</h1>
        <p class="page-subtitle">Kelola identitas sekolah, kontak, kepemimpinan, dan aset branding</p>
      </div>
    </div>

    <!-- Skeleton Loader -->
    <div v-if="loading" class="skeleton-wrapper">
      <div v-for="n in 3" :key="n" class="skeleton-card">
        <div class="skeleton-title"></div>
        <div class="skeleton-grid">
          <div v-for="m in 4" :key="m" class="skeleton-field"></div>
        </div>
      </div>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSave" class="profile-form" novalidate>

      <!-- 1. Informasi Dasar -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          </div>
          <div>
            <h2 class="section-title">Informasi Dasar</h2>
            <p class="section-desc">Identitas resmi sekolah</p>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-field col-span-2">
            <label class="field-label">Nama Sekolah <span class="required">*</span></label>
            <input v-model="form.name" type="text" class="field-input" :class="{ 'field-error': errors.name }" placeholder="Nama lengkap sekolah" />
            <p v-if="errors.name" class="error-msg">{{ errors.name }}</p>
          </div>
          <div class="form-field">
            <label class="field-label">Nama Singkat</label>
            <input v-model="form.short_name" type="text" class="field-input" placeholder="SMK IT, SMPN 1, dll" />
          </div>
          <div class="form-field">
            <label class="field-label">NPSN</label>
            <input v-model="form.npsn" type="text" class="field-input" placeholder="Nomor Pokok Sekolah Nasional" />
          </div>
          <div class="form-field">
            <label class="field-label">NSS</label>
            <input v-model="form.nss" type="text" class="field-input" placeholder="Nomor Statistik Sekolah" />
          </div>
          <div class="form-field">
            <label class="field-label">Nama Yayasan</label>
            <input v-model="form.foundation_name" type="text" class="field-input" placeholder="Nama yayasan pengelola" />
          </div>
          <div class="form-field">
            <label class="field-label">Jenjang</label>
            <select v-model="form.level" class="field-input">
              <option value="">-- Pilih Jenjang --</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
              <option value="SMK">SMK</option>
              <option value="PONDOK">Pondok Pesantren</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </div>
          <div class="form-field">
            <label class="field-label">Status</label>
            <select v-model="form.status" class="field-input">
              <option value="">-- Pilih Status --</option>
              <option value="NEGERI">Negeri</option>
              <option value="SWASTA">Swasta</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 2. Kontak -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
          </div>
          <div>
            <h2 class="section-title">Informasi Kontak</h2>
            <p class="section-desc">Nomor telepon, email, dan website sekolah</p>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-field">
            <label class="field-label">Telepon</label>
            <input v-model="form.phone" type="tel" class="field-input" placeholder="(022) 123-4567" />
          </div>
          <div class="form-field">
            <label class="field-label">Email</label>
            <input v-model="form.email" type="email" class="field-input" :class="{ 'field-error': errors.email }" placeholder="info@sekolah.sch.id" />
            <p v-if="errors.email" class="error-msg">{{ errors.email }}</p>
          </div>
          <div class="form-field col-span-2">
            <label class="field-label">Website</label>
            <input v-model="form.website" type="url" class="field-input" placeholder="https://www.sekolah.sch.id" />
          </div>
        </div>
      </div>

      <!-- 3. Alamat -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <div>
            <h2 class="section-title">Alamat Sekolah</h2>
            <p class="section-desc">Lokasi fisik dan kode pos sekolah</p>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-field col-span-2">
            <label class="field-label">Alamat Lengkap</label>
            <textarea v-model="form.address" rows="2" class="field-input" placeholder="Jl. Raya No. 1, RT 01/RW 02"></textarea>
          </div>
          <div class="form-field">
            <label class="field-label">Desa / Kelurahan</label>
            <input v-model="form.village" type="text" class="field-input" placeholder="Nama desa/kelurahan" />
          </div>
          <div class="form-field">
            <label class="field-label">Kecamatan</label>
            <input v-model="form.district" type="text" class="field-input" placeholder="Nama kecamatan" />
          </div>
          <div class="form-field">
            <label class="field-label">Kota / Kabupaten</label>
            <input v-model="form.city" type="text" class="field-input" placeholder="Nama kota/kabupaten" />
          </div>
          <div class="form-field">
            <label class="field-label">Provinsi</label>
            <input v-model="form.province" type="text" class="field-input" placeholder="Nama provinsi" />
          </div>
          <div class="form-field">
            <label class="field-label">Kode Pos</label>
            <input v-model="form.postal_code" type="text" class="field-input" placeholder="40xxx" maxlength="10" />
          </div>
        </div>
      </div>

      <!-- 4. Branding -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <div>
            <h2 class="section-title">Branding & Aset Gambar</h2>
            <p class="section-desc">Logo, favicon, dan ikon sekolah. Maks 5 MB per file (JPEG, PNG, WebP, SVG, ICO).</p>
          </div>
        </div>
        <div class="assets-grid">
          <AssetUpload
            v-for="asset in assetFields"
            :key="asset.field"
            :label="asset.label"
            :current-url="form[asset.field]"
            :uploading="uploadingField === asset.field"
            @upload="(file) => handleUpload(asset.field, file)"
          />
        </div>
      </div>

      <!-- 5. Kepemimpinan -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </div>
          <div>
            <h2 class="section-title">Pimpinan Sekolah</h2>
            <p class="section-desc">Data kepala sekolah dan pelaksana tugas</p>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-field col-span-2"><p class="sub-section-label">Kepala Sekolah</p></div>
          <div class="form-field">
            <label class="field-label">Nama Kepala Sekolah</label>
            <input v-model="form.principal_name" type="text" class="field-input" placeholder="Nama lengkap" />
          </div>
          <div class="form-field">
            <label class="field-label">Gelar / Jabatan</label>
            <input v-model="form.principal_title" type="text" class="field-input" placeholder="S.Pd., M.M." />
          </div>
          <div class="form-field">
            <label class="field-label">NIP Kepala Sekolah</label>
            <input v-model="form.principal_nip" type="text" class="field-input" placeholder="NIP" />
          </div>
          <div class="form-field col-span-2"><p class="sub-section-label divider-label">Pelaksana Tugas (Plt.)</p></div>
          <div class="form-field">
            <label class="field-label">Nama Plt. Kepala Sekolah</label>
            <input v-model="form.acting_principal_name" type="text" class="field-input" placeholder="Nama lengkap (jika ada)" />
          </div>
          <div class="form-field">
            <label class="field-label">Gelar / Jabatan Plt.</label>
            <input v-model="form.acting_principal_title" type="text" class="field-input" placeholder="S.Pd." />
          </div>
          <div class="form-field">
            <label class="field-label">NIP Plt.</label>
            <input v-model="form.acting_principal_nip" type="text" class="field-input" placeholder="NIP Plt." />
          </div>
        </div>
      </div>

      <!-- 6. Deskripsi -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <div>
            <h2 class="section-title">Deskripsi Sekolah</h2>
            <p class="section-desc">Tentang sekolah, visi misi, atau info umum lainnya</p>
          </div>
        </div>
        <textarea v-model="form.description" rows="5" class="field-input w-full" placeholder="Tuliskan deskripsi singkat tentang sekolah..."></textarea>
      </div>

      <!-- Save Bar -->
      <div class="save-bar">
        <button type="button" @click="resetForm" class="btn-secondary" :disabled="saving">Reset</button>
        <button type="submit" class="btn-primary" :disabled="saving">
          <svg v-if="saving" class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
          {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import schoolProfileService from '@/services/api/schoolProfile.service'
import { useToast } from '@/composables/useToast'
import AssetUpload from '@/components/school-profile/AssetUpload.vue'

const { success: toastSuccess, error: toastError } = useToast()

const loading = ref(true)
const saving = ref(false)
const uploadingField = ref(null)

const EMPTY_FORM = {
  name: '', short_name: '', npsn: '', nss: '', level: '', status: '',
  foundation_name: '', phone: '', email: '', website: '',
  address: '', village: '', district: '', city: '', province: '', postal_code: '',
  logo: '', logo_light: '', logo_dark: '', favicon: '', school_icon: '',
  principal_name: '', principal_title: '', principal_nip: '',
  acting_principal_name: '', acting_principal_title: '', acting_principal_nip: '',
  description: ''
}

const form = reactive({ ...EMPTY_FORM })
const errors = reactive({})

const assetFields = [
  { field: 'logo', label: 'Logo Utama' },
  { field: 'logo_light', label: 'Logo (Light)' },
  { field: 'logo_dark', label: 'Logo (Dark)' },
  { field: 'favicon', label: 'Favicon' },
  { field: 'school_icon', label: 'Ikon Sekolah' }
]

// Track original snapshot for reset
let originalSnapshot = { ...EMPTY_FORM }

onMounted(fetchProfile)

async function fetchProfile() {
  loading.value = true
  try {
    const res = await schoolProfileService.get()
    const data = res?.data || res
    if (data) {
      Object.keys(EMPTY_FORM).forEach(k => {
        form[k] = data[k] ?? ''
      })
      originalSnapshot = { ...form }
    }
  } catch (e) {
    toastError('Gagal memuat profil sekolah')
  } finally {
    loading.value = false
  }
}

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  let valid = true
  if (!form.name.trim()) {
    errors.name = 'Nama sekolah wajib diisi'
    valid = false
  }
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Format email tidak valid'
    valid = false
  }
  return valid
}

async function handleSave() {
  if (!validate()) return
  saving.value = true
  try {
    const res = await schoolProfileService.update({ ...form })
    const updated = res?.data || res
    if (updated) {
      Object.keys(EMPTY_FORM).forEach(k => {
        form[k] = updated[k] ?? ''
      })
      originalSnapshot = { ...form }
    }
    toastSuccess('Profil sekolah berhasil disimpan')
  } catch (e) {
    toastError(e?.message || 'Gagal menyimpan profil sekolah')
  } finally {
    saving.value = false
  }
}

function resetForm() {
  Object.assign(form, originalSnapshot)
  Object.keys(errors).forEach(k => delete errors[k])
}

async function handleUpload(fieldName, file) {
  uploadingField.value = fieldName
  try {
    const res = await schoolProfileService.uploadAsset(fieldName, file)
    const result = res?.data || res
    form[fieldName] = result?.url || ''
    originalSnapshot[fieldName] = form[fieldName]
    toastSuccess('Gambar berhasil diupload')
  } catch (e) {
    toastError(e?.message || 'Gagal mengupload gambar')
  } finally {
    uploadingField.value = null
  }
}
</script>

<style scoped>
.settings-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 0 80px;
}

.page-header {
  margin-bottom: 28px;
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

/* Section Cards */
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.section-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.05);
  border: 1px solid #f1f5f9;
}
.section-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}
.section-icon {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
}
.section-icon svg { width: 20px; height: 20px; }
.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px;
}
.section-desc {
  font-size: 12.5px;
  color: #94a3b8;
  margin: 0;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.form-field { display: flex; flex-direction: column; gap: 6px; }
.col-span-2 { grid-column: span 2; }
.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}
.required { color: #ef4444; margin-left: 2px; }
.field-input {
  width: 100%;
  padding: 9px 12px;
  font-size: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fafafa;
  color: #1e293b;
  transition: border-color .2s, box-shadow .2s;
  outline: none;
  box-sizing: border-box;
}
.field-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, .12);
  background: #fff;
}
.field-input.field-error { border-color: #ef4444; }
.error-msg { font-size: 12px; color: #ef4444; margin: 0; }
textarea.field-input { resize: vertical; }
select.field-input { cursor: pointer; }

/* Sub-section label */
.sub-section-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: #64748b;
  margin: 4px 0 0;
}
.divider-label { margin-top: 8px; }

/* Assets Grid */
.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

/* Save Bar */
.save-bar {
  position: sticky;
  bottom: 0;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(8px);
  border-top: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.06);
  z-index: 10;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 9px 22px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity .2s, transform .15s;
}
.btn-primary:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.btn-secondary {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 9px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background .2s;
}
.btn-secondary:hover:not(:disabled) { background: #f1f5f9; }
.btn-secondary:disabled { opacity: .5; cursor: not-allowed; }

/* Skeleton */
.skeleton-wrapper { display: flex; flex-direction: column; gap: 20px; }
.skeleton-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.05);
}
.skeleton-title {
  width: 200px;
  height: 18px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 400% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 8px;
  margin-bottom: 20px;
}
.skeleton-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.skeleton-field {
  height: 38px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 400% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 8px;
}
@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

/* Responsive */
@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
  .col-span-2 { grid-column: span 1; }
  .assets-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
