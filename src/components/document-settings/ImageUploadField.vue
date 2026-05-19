<template>
  <div class="image-upload-field">
    <label class="field-label" v-if="label">{{ label }}</label>

    <!-- Preview area -->
    <div class="preview-area" :class="{ 'has-image': previewUrl, 'wide': wide }">
      <img v-if="previewUrl" :src="previewUrl" :alt="label" class="preview-img" />
      <div v-else class="preview-placeholder">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="placeholder-text">Belum ada gambar</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="upload-actions">
      <label class="btn-upload" :class="{ 'uploading': uploading }">
        <svg v-if="uploading" class="spin-icon" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <svg v-else fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {{ uploading ? 'Mengupload...' : (previewUrl ? 'Ganti Gambar' : 'Upload Gambar') }}
        <input v-if="!uploading" type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml"
          class="hidden-input" @change="onFileChange" />
      </label>
      <span class="upload-hint">JPEG, PNG, WebP, SVG — maks 5 MB</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  currentUrl: { type: String, default: '' },
  uploading: { type: Boolean, default: false },
  /** wide = landscape aspect ratio (good for header/footer). Default = square */
  wide: { type: Boolean, default: false }
})

const emit = defineEmits(['upload'])

const previewUrl = computed(() => props.currentUrl || null)

function onFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  emit('upload', file)
  event.target.value = ''
}
</script>

<style scoped>
.image-upload-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.preview-area {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  border: 2px dashed #e2e8f0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: border-color 0.2s;
}

.preview-area.wide {
  aspect-ratio: 4 / 1;
}

.preview-area.has-image {
  border-style: solid;
  border-color: #dbeafe;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
  box-sizing: border-box;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #cbd5e1;
}

.preview-placeholder svg {
  width: 32px;
  height: 32px;
}

.placeholder-text {
  font-size: 12px;
}

.upload-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-upload {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 6px 14px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
  flex-shrink: 0;
}

.btn-upload:hover {
  background: #dbeafe;
}

.btn-upload.uploading {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-upload svg:not(.spin-icon) {
  width: 14px;
  height: 14px;
}

.spin-icon {
  width: 14px;
  height: 14px;
  animation: spin 1s linear infinite;
}

.hidden-input {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-hint {
  font-size: 11px;
  color: #94a3b8;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
