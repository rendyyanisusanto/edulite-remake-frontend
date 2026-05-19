<template>
  <div class="settings-page">

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ isEdit ? 'Edit Pengaturan Dokumen' : 'Tambah Pengaturan Dokumen' }}</h1>
        <p class="page-subtitle">{{ isEdit ? `Edit konfigurasi #${route.params.id}` : 'Buat konfigurasi dokumen baru' }}</p>
      </div>
      <button class="btn-secondary" @click="$router.push('/document-settings')">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali
      </button>
    </div>

    <!-- Skeleton Loader -->
    <div v-if="loading" class="skeleton-wrapper">
      <div v-for="n in 4" :key="n" class="skeleton-card">
        <div class="skeleton-title"></div>
        <div class="skeleton-grid">
          <div v-for="m in 4" :key="m" class="skeleton-field"></div>
        </div>
      </div>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSave" class="profile-form" novalidate>

      <!-- 1. Konfigurasi Dasar -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0...M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h2 class="section-title">Konfigurasi Dasar</h2>
            <p class="section-desc">Profil sekolah, jenis dokumen, dan status aktif</p>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-field">
            <label class="field-label">Profil Sekolah <span class="required">*</span></label>
            <select v-model="form.school_profile_id" class="field-input" :class="{ 'field-error': errors.school_profile_id }">
              <option value="">-- Pilih Profil Sekolah --</option>
              <option v-for="sp in schoolProfiles" :key="sp.id" :value="sp.id">{{ sp.name }}</option>
            </select>
            <p v-if="errors.school_profile_id" class="error-msg">{{ errors.school_profile_id }}</p>
          </div>
          <div class="form-field">
            <label class="field-label">Jenis Dokumen <span class="required">*</span></label>
            <select v-model="form.document_type" class="field-input" :class="{ 'field-error': errors.document_type }">
              <option value="">-- Pilih Jenis Dokumen --</option>
              <option v-for="t in DOCUMENT_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
            <p v-if="errors.document_type" class="error-msg">{{ errors.document_type }}</p>
          </div>
          <div class="form-field col-span-2">
            <label class="field-label">Status</label>
            <div class="toggle-row">
              <button type="button" class="toggle-btn" :class="{ 'toggle-on': form.is_active }" @click="form.is_active = !form.is_active">
                <span class="toggle-knob"></span>
              </button>
              <span class="toggle-label">{{ form.is_active ? 'Aktif' : 'Nonaktif' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Header & Footer Assets -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 class="section-title">Header & Footer</h2>
            <p class="section-desc">Gambar kepala dan kaki surat/dokumen (JPEG, PNG, WebP, SVG — maks 5 MB)</p>
          </div>
        </div>
        <div class="upload-grid-wide">
          <ImageUploadField
            label="Gambar Header"
            :wide="true"
            :current-url="form.header_image"
            :uploading="uploadingField === 'header_image'"
            @upload="(file) => handleUpload('header_image', file)"
          />
          <ImageUploadField
            label="Gambar Footer"
            :wide="true"
            :current-url="form.footer_image"
            :uploading="uploadingField === 'footer_image'"
            @upload="(file) => handleUpload('footer_image', file)"
          />
        </div>
        <p v-if="!isEdit" class="upload-note">
          💡 Simpan konfigurasi dasar terlebih dahulu untuk mengaktifkan upload gambar.
        </p>
      </div>

      <!-- 3. Tanda Tangan & Stempel -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 class="section-title">Tanda Tangan & Stempel</h2>
            <p class="section-desc">Gambar tanda tangan, stempel, dan data penandatangan</p>
          </div>
        </div>
        <div class="upload-grid-square">
          <ImageUploadField
            label="Tanda Tangan"
            :current-url="form.signature_image"
            :uploading="uploadingField === 'signature_image'"
            @upload="(file) => handleUpload('signature_image', file)"
          />
          <ImageUploadField
            label="Stempel"
            :current-url="form.stamp_image"
            :uploading="uploadingField === 'stamp_image'"
            @upload="(file) => handleUpload('stamp_image', file)"
          />
        </div>
        <p v-if="!isEdit" class="upload-note">💡 Simpan dulu sebelum upload gambar.</p>
        <div class="form-grid" style="margin-top: 16px;">
          <div class="form-field">
            <label class="field-label">Nama Penandatangan</label>
            <input v-model="form.signer_name" type="text" class="field-input" placeholder="Contoh: Drs. Budi Santoso, M.Pd." />
          </div>
          <div class="form-field">
            <label class="field-label">Jabatan Penandatangan</label>
            <input v-model="form.signer_title" type="text" class="field-input" placeholder="Kepala Sekolah" />
          </div>
          <div class="form-field">
            <label class="field-label">NIP Penandatangan</label>
            <input v-model="form.signer_nip" type="text" class="field-input" placeholder="198001012005011001" />
          </div>
          <div class="form-field">
            <label class="field-label">Kota</label>
            <input v-model="form.city" type="text" class="field-input" placeholder="Bandung" />
          </div>
        </div>
      </div>

      <!-- 4. Penomoran Surat -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
          </div>
          <div>
            <h2 class="section-title">Penomoran Surat</h2>
            <p class="section-desc">Prefiks dan format nomor surat otomatis</p>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-field">
            <label class="field-label">Prefiks Nomor Surat</label>
            <input v-model="form.letter_number_prefix" type="text" class="field-input" placeholder="Contoh: 420/" />
          </div>
          <div class="form-field">
            <label class="field-label">Format Nomor Surat</label>
            <input v-model="form.letter_number_format" type="text" class="field-input"
              placeholder="Contoh: {PREFIX}{NOMOR}/SMK/{BULAN}/{TAHUN}" />
          </div>
        </div>
      </div>

      <!-- 5. Konten Default -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 class="section-title">Konten Default</h2>
            <p class="section-desc">Perihal, penerima, tembusan, dan footer PDF default</p>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-field">
            <label class="field-label">Perihal Default</label>
            <input v-model="form.default_subject" type="text" class="field-input" placeholder="Perihal surat default" />
          </div>
          <div class="form-field">
            <label class="field-label">Kepada (Penerima Default)</label>
            <input v-model="form.default_recipient" type="text" class="field-input" placeholder="Yth. Kepala Sekolah" />
          </div>
          <div class="form-field col-span-2">
            <label class="field-label">Tembusan (CC)</label>
            <textarea v-model="form.default_cc" rows="2" class="field-input"
              placeholder="Yth. Wakil Kepala Sekolah&#10;Yth. Wali Kelas" />
          </div>
          <div class="form-field col-span-2">
            <label class="field-label">Footer PDF</label>
            <textarea v-model="form.pdf_footer_text" rows="2" class="field-input"
              placeholder="Teks yang muncul di kaki setiap halaman PDF" />
          </div>
        </div>
      </div>

      <!-- 6. Watermark -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <div>
            <h2 class="section-title">Watermark</h2>
            <p class="section-desc">Teks atau gambar watermark pada dokumen PDF</p>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-field col-span-2">
            <label class="field-label">Teks Watermark</label>
            <input v-model="form.watermark_text" type="text" class="field-input"
              placeholder="Contoh: RAHASIA / SALINAN / VALID" />
          </div>
        </div>
        <div class="upload-grid-square" style="max-width: 200px; margin-top: 16px;">
          <ImageUploadField
            label="Gambar Watermark"
            :current-url="form.watermark_image"
            :uploading="uploadingField === 'watermark_image'"
            @upload="(file) => handleUpload('watermark_image', file)"
          />
        </div>
        <p v-if="!isEdit" class="upload-note">💡 Simpan dulu sebelum upload gambar.</p>
      </div>

      <!-- 7. Verifikasi QR -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <div>
            <h2 class="section-title">Verifikasi QR</h2>
            <p class="section-desc">Tampilkan kode QR untuk verifikasi keaslian dokumen</p>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-field col-span-2">
            <label class="field-label">Tampilkan QR Verifikasi</label>
            <div class="toggle-row">
              <button type="button" class="toggle-btn" :class="{ 'toggle-on': form.show_qr_verification }"
                @click="form.show_qr_verification = !form.show_qr_verification">
                <span class="toggle-knob"></span>
              </button>
              <span class="toggle-label">{{ form.show_qr_verification ? 'Ya, tampilkan QR code' : 'Tidak ditampilkan' }}</span>
            </div>
          </div>
          <div class="form-field col-span-2" v-if="form.show_qr_verification">
            <label class="field-label">URL Dasar Verifikasi <span class="required">*</span></label>
            <input v-model="form.verification_base_url" type="url" class="field-input"
              :class="{ 'field-error': errors.verification_base_url }"
              placeholder="https://verifikasi.sekolah.sch.id/dokumen" />
            <p v-if="errors.verification_base_url" class="error-msg">{{ errors.verification_base_url }}</p>
            <p class="field-hint">URL ini akan digunakan sebagai base untuk link verifikasi di QR code dokumen.</p>
          </div>
        </div>
      </div>

      <!-- Save Bar -->
      <div class="save-bar">
        <button type="button" @click="$router.push('/document-settings')" class="btn-secondary" :disabled="saving">
          Batal
        </button>
        <button type="submit" class="btn-primary" :disabled="saving">
          <svg v-if="saving" class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {{ saving ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Buat Konfigurasi') }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import documentSettingService from '@/services/api/documentSetting.service'
import schoolProfileService from '@/services/api/schoolProfile.service'
import ImageUploadField from '@/components/document-settings/ImageUploadField.vue'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const { success: toastSuccess, error: toastError } = useToast()

const loading = ref(false)
const saving = ref(false)
const uploadingField = ref(null)
const schoolProfiles = ref([])

const isEdit = computed(() => !!route.params.id)

const DOCUMENT_TYPES = [
  { value: 'GENERAL', label: 'Umum (General)' },
  { value: 'PERMISSION_LETTER', label: 'Surat Izin' },
  { value: 'CERTIFICATE', label: 'Sertifikat' },
  { value: 'REPORT', label: 'Laporan' },
  { value: 'MUTATION', label: 'Mutasi' }
]

const EMPTY_FORM = {
  school_profile_id: '',
  document_type: '',
  is_active: true,
  header_image: '',
  footer_image: '',
  signature_image: '',
  stamp_image: '',
  signer_name: '',
  signer_title: '',
  signer_nip: '',
  city: '',
  letter_number_prefix: '',
  letter_number_format: '',
  default_subject: '',
  default_recipient: '',
  default_cc: '',
  pdf_footer_text: '',
  watermark_text: '',
  watermark_image: '',
  show_qr_verification: false,
  verification_base_url: ''
}

const form = reactive({ ...EMPTY_FORM })
const errors = reactive({})

onMounted(async () => {
  await loadSchoolProfiles()
  if (isEdit.value) {
    await loadRecord()
  }
})

async function loadSchoolProfiles() {
  try {
    const res = await schoolProfileService.get()
    // Backend returns single profile (singleton). Wrap as array for the select.
    const data = res?.data || res
    if (data) {
      schoolProfiles.value = [data]
    }
  } catch {
    // If no profile yet, leave empty
    schoolProfiles.value = []
  }
}

async function loadRecord() {
  loading.value = true
  try {
    const res = await documentSettingService.detail(route.params.id)
    const data = res?.data || res
    if (data) {
      Object.keys(EMPTY_FORM).forEach(k => {
        form[k] = data[k] ?? EMPTY_FORM[k]
      })
    }
  } catch (e) {
    toastError('Gagal memuat data pengaturan dokumen')
    router.push('/document-settings')
  } finally {
    loading.value = false
  }
}

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  let valid = true
  if (!form.school_profile_id) {
    errors.school_profile_id = 'Profil sekolah wajib dipilih'
    valid = false
  }
  if (!form.document_type) {
    errors.document_type = 'Jenis dokumen wajib dipilih'
    valid = false
  }
  if (form.show_qr_verification && !form.verification_base_url) {
    errors.verification_base_url = 'URL verifikasi wajib diisi jika QR verifikasi diaktifkan'
    valid = false
  }
  if (form.verification_base_url) {
    try { new URL(form.verification_base_url) } catch {
      errors.verification_base_url = 'Format URL tidak valid'
      valid = false
    }
  }
  return valid
}

async function handleSave() {
  if (!validate()) return

  saving.value = true
  try {
    const payload = {
      school_profile_id: Number(form.school_profile_id),
      document_type: form.document_type,
      is_active: form.is_active,
      signer_name: form.signer_name || null,
      signer_title: form.signer_title || null,
      signer_nip: form.signer_nip || null,
      city: form.city || null,
      letter_number_prefix: form.letter_number_prefix || null,
      letter_number_format: form.letter_number_format || null,
      default_subject: form.default_subject || null,
      default_recipient: form.default_recipient || null,
      default_cc: form.default_cc || null,
      pdf_footer_text: form.pdf_footer_text || null,
      watermark_text: form.watermark_text || null,
      show_qr_verification: Boolean(form.show_qr_verification),
      verification_base_url: form.verification_base_url || null
    }

    if (isEdit.value) {
      const res = await documentSettingService.update(route.params.id, payload)
      const updated = res?.data || res
      Object.keys(EMPTY_FORM).forEach(k => {
        if (updated[k] !== undefined) form[k] = updated[k] ?? EMPTY_FORM[k]
      })
      toastSuccess('Pengaturan dokumen berhasil diperbarui')
    } else {
      const res = await documentSettingService.create(payload)
      const created = res?.data || res
      toastSuccess('Pengaturan dokumen berhasil dibuat')
      // Redirect to edit page so user can now upload images
      router.replace(`/document-settings/${created.id}/edit`)
    }
  } catch (e) {
    toastError(e?.response?.data?.message || e?.message || 'Gagal menyimpan pengaturan')
  } finally {
    saving.value = false
  }
}

async function handleUpload(fieldName, file) {
  if (!isEdit.value) {
    toastError('Simpan konfigurasi dasar terlebih dahulu sebelum upload gambar.')
    return
  }
  uploadingField.value = fieldName
  try {
    const res = await documentSettingService.uploadAsset(route.params.id, fieldName, file)
    const result = res?.data || res
    form[fieldName] = result?.url || ''
    toastSuccess('Gambar berhasil diupload')
  } catch (e) {
    toastError(e?.response?.data?.message || e?.message || 'Gagal mengupload gambar')
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
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
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
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
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

.field-hint {
  font-size: 11.5px;
  color: #94a3b8;
  margin: 0;
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
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  box-sizing: border-box;
}

.field-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  background: #fff;
}

.field-input.field-error { border-color: #ef4444; }
.error-msg { font-size: 12px; color: #ef4444; margin: 0; }
textarea.field-input { resize: vertical; }
select.field-input { cursor: pointer; }

/* Toggle */
.toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-btn {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: #e2e8f0;
  border: none;
  cursor: pointer;
  transition: background 0.25s;
  flex-shrink: 0;
  padding: 0;
}

.toggle-btn.toggle-on { background: #2563eb; }

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  transition: left 0.25s;
}

.toggle-btn.toggle-on .toggle-knob { left: 23px; }

.toggle-label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

/* Upload Grids */
.upload-grid-wide {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upload-grid-square {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.upload-note {
  margin: 12px 0 0;
  font-size: 12.5px;
  color: #64748b;
  background: #f8fafc;
  border-radius: 8px;
  padding: 8px 12px;
  border-left: 3px solid #e2e8f0;
}

/* Save Bar */
.save-bar {
  position: sticky;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-top: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
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
  transition: opacity 0.2s, transform 0.15s;
}

.btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 9px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary svg { width: 15px; height: 15px; }
.btn-secondary:hover:not(:disabled) { background: #f1f5f9; }
.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

/* Skeleton */
.skeleton-wrapper { display: flex; flex-direction: column; gap: 20px; }

.skeleton-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
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
  .upload-grid-square { grid-template-columns: repeat(2, 1fr); }
  .page-header { flex-direction: column; }
}
</style>
