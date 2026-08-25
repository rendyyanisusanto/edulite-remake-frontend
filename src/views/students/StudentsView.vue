<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Manajemen Data Siswa</h1>
      <div class="flex flex-wrap gap-2">
        <input type="file" ref="fileInput" @change="handleFileUpload" class="hidden" accept=".xlsx, .xls" />
        <BaseButton @click="downloadTemplate" variant="ghost" class="text-gray-500 hover:text-gray-800" icon="<svg class='h-5 w-5 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'/></svg>">
          Template
        </BaseButton>
        <BaseButton @click="openFilePicker" :loading="importing" variant="outline" icon="<svg class='h-5 w-5 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'/></svg>">
          Import Excel
        </BaseButton>
        <BaseButton @click="exportExcel" :loading="exporting" variant="secondary" icon="<svg class='h-5 w-5 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'/></svg>">
          Export Excel
        </BaseButton>
        <BaseButton @click="openCreateModal" icon="<svg class='h-5 w-5 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 4v16m8-8H4'/></svg>">
          Tambah Siswa
        </BaseButton>
      </div>
    </div>

    <!-- Filter Kelas (Searchable) -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2 flex-1 min-w-[220px] max-w-sm">
        <label class="text-xs font-medium text-gray-600 whitespace-nowrap">Filter Kelas:</label>
        <div class="relative w-full" ref="classDropdownRef">
          <!-- Input trigger -->
          <div
            @click="showClassDropdown = !showClassDropdown"
            class="flex items-center justify-between w-full rounded-md border border-gray-300 px-3 py-1.5 bg-white text-sm cursor-pointer hover:border-blue-400 transition-colors"
            :class="showClassDropdown ? 'border-blue-500 ring-1 ring-blue-500' : ''"
          >
            <span :class="filterClassId ? 'text-gray-800 font-medium' : 'text-gray-400'">
              {{ filterClassId ? (classOptions.find(c => c.id == filterClassId)?.name || 'Pilih Kelas') : 'Semua Kelas' }}
            </span>
            <div class="flex items-center gap-1">
              <button
                v-if="filterClassId"
                @click.stop="clearClassFilter"
                class="text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded"
              >
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
              <svg class="h-4 w-4 text-gray-400" :class="showClassDropdown ? 'rotate-180' : ''" style="transition: transform 0.2s" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>

          <!-- Dropdown panel -->
          <div
            v-if="showClassDropdown"
            class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            <!-- Search input -->
            <div class="p-2 border-b border-gray-100">
              <div class="relative">
                <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  v-model="classSearch"
                  @click.stop
                  placeholder="Cari kelas..."
                  class="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
                  autofocus
                />
              </div>
            </div>
            <!-- Options -->
            <div class="max-h-52 overflow-y-auto">
              <div
                @click="selectClass(null)"
                class="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors"
                :class="!filterClassId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500'"
              >
                Semua Kelas
              </div>
              <div
                v-for="cls in filteredClassOptions"
                :key="cls.id"
                @click="selectClass(cls)"
                class="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors flex items-center justify-between"
                :class="filterClassId == cls.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'"
              >
                <span>{{ cls.name }}</span>
                <svg v-if="filterClassId == cls.id" class="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <div v-if="filteredClassOptions.length === 0" class="px-3 py-3 text-sm text-gray-400 text-center">
                Kelas tidak ditemukan
              </div>
            </div>
          </div>
        </div>
      </div>

      <span v-if="filterClassId" class="text-xs text-blue-600 font-medium">
        Menampilkan: <strong>{{ classOptions.find(c => c.id == filterClassId)?.name }}</strong>
        &bull; <button @click="clearClassFilter" class="text-red-500 hover:text-red-700">Reset</button>
      </span>
    </div>

    <BaseTable
      :columns="columns"
      :data="students"
      :loading="loading"
      :total="total"
      :currentPage="currentPage"
      :perPage="limit"
      :searchQuery="search"
      @update:searchQuery="handleSearch"
      @page-change="handlePageChange"
      @sort="handleSort"
      :sortBy="sortBy"
      :sortDesc="sortDesc"
    >
      <template #cell-class_name="{ item }">
        <span
          v-if="item.class_history && item.class_history.length > 0"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
        >
          {{ item.class_history[0]?.class_info?.name || '-' }}
        </span>
        <span v-else class="text-xs text-gray-400">-</span>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2 justify-end">
          <button @click="openDetailModal(item)" class="text-indigo-600 hover:text-indigo-900 mx-1 tooltip" title="Lihat Detail">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
          </button>
          <router-link :to="`/students/${item.id}/character-report`" class="text-green-600 hover:text-green-900 mx-1 tooltip" title="Rapor Karakter">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </router-link>
          <button @click="openEditModal(item)" class="text-blue-600 hover:text-blue-900 mx-1 tooltip" title="Edit">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button @click="confirmDelete(item)" class="text-red-600 hover:text-red-900 mx-1 tooltip" title="Delete">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="showModal" :title="isEditing ? 'Edit Data Siswa' : 'Tambah Siswa Baru'" maxWidth="4xl">
      <div v-if="loadingForm" class="py-10 text-center text-sm text-gray-500">Memuat data siswa...</div>

      <form v-else @submit.prevent="saveStudent" class="space-y-6">
        <section class="space-y-4">
          <h3 class="text-sm font-semibold text-gray-800 uppercase tracking-wide">Data Siswa</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseInput id="nis" v-model="form.nis" label="NIS" placeholder="Nomor Induk Siswa" required />
            <BaseInput id="nisn" v-model="form.nisn" label="NISN" placeholder="Nomor Induk Siswa Nasional" />
            <BaseInput id="full_name" v-model="form.full_name" label="Nama Lengkap" placeholder="Nama Lengkap Siswa" required class="sm:col-span-2" />

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin <span class="text-red-500">*</span></label>
              <select v-model="form.gender" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" required>
                <option value="" disabled>Pilih Jenis Kelamin</option>
                <option value="L">Laki-Laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <BaseInput id="date_of_birth" v-model="form.date_of_birth" type="date" label="Tanggal Lahir" required />

            <div class="mb-4 sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
              <textarea v-model="form.address" rows="3" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white/50" placeholder="Alamat domisili lengkap"></textarea>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-sm font-semibold text-gray-800 uppercase tracking-wide">Parent Profiles</h3>
            <BaseButton type="button" variant="outline" @click="addParent">Tambah Parent</BaseButton>
          </div>

          <div v-if="form.parents.length === 0" class="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            Belum ada data parent. Klik "Tambah Parent".
          </div>

          <div v-for="(parent, parentIndex) in form.parents" :key="parent.local_key" class="rounded-xl border border-gray-200 p-4 space-y-4 bg-gray-50/50">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-gray-700">Parent {{ parentIndex + 1 }}</h4>
              <button type="button" class="text-xs text-red-600 hover:text-red-800" @click="removeParent(parentIndex)">Hapus Parent</button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <select v-model="parent.type" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white">
                  <option value="">Pilih Tipe</option>
                  <option value="AYAH">Ayah</option>
                  <option value="IBU">Ibu</option>
                  <option value="WALI">Wali</option>
                </select>
              </div>
              <BaseInput :id="`parent_full_name_${parent.local_key}`" v-model="parent.full_name" label="Nama Lengkap" placeholder="Nama Parent" />
              <BaseInput :id="`parent_nik_${parent.local_key}`" v-model="parent.nik" label="NIK" placeholder="Nomor NIK" />
              <BaseInput :id="`parent_phone_${parent.local_key}`" v-model="parent.phone" label="No HP" placeholder="08xxxxxxxxxx" />
              <BaseInput :id="`parent_email_${parent.local_key}`" v-model="parent.email" label="Email" placeholder="email@contoh.com" />
              <BaseInput :id="`parent_occupation_${parent.local_key}`" v-model="parent.occupation" label="Pekerjaan" placeholder="Pekerjaan" />
              <BaseInput :id="`parent_education_${parent.local_key}`" v-model="parent.education" label="Pendidikan" placeholder="Pendidikan Terakhir" />
              <div class="sm:col-span-2 flex items-center gap-2">
                <input :id="`parent_guardian_${parent.local_key}`" v-model="parent.is_guardian" type="checkbox" class="rounded border-gray-300 text-primary focus:ring-primary" />
                <label :for="`parent_guardian_${parent.local_key}`" class="text-sm text-gray-700">Sebagai Wali Utama</label>
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Parent</label>
                <textarea v-model="parent.address" rows="2" class="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white" placeholder="Alamat parent"></textarea>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h5 class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Dokumen Parent</h5>
                <button type="button" class="text-xs text-primary hover:text-primary/80" @click="addParentDocument(parentIndex)">Tambah Dokumen</button>
              </div>

              <div v-if="parent.documents.length === 0" class="rounded border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500">
                Belum ada dokumen parent.
              </div>

              <div v-for="(doc, docIndex) in parent.documents" :key="doc.local_key" class="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-gray-200 p-3 bg-white">
                <BaseInput :id="`parent_doc_type_${doc.local_key}`" v-model="doc.document_type" label="Jenis Dokumen" placeholder="Contoh: KTP, KK" />
                <BaseInput :id="`parent_doc_file_${doc.local_key}`" v-model="doc.document_file" label="File Dokumen" placeholder="URL/path file dokumen" />
                <div class="sm:col-span-2 text-right">
                  <button type="button" class="text-xs text-red-600 hover:text-red-800" @click="removeParentDocument(parentIndex, docIndex)">Hapus Dokumen</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>

      <template #footer>
        <BaseButton variant="outline" @click="showModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="saveStudent" :loading="saving">Simpan Data</BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="showDetailModal" title="Detail Lengkap Siswa" maxWidth="4xl">
      <div v-if="detailLoading" class="py-10 text-center text-sm text-gray-500">Memuat detail siswa...</div>
      <div v-else-if="detailStudent" class="space-y-6">
        <section>
          <h3 class="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Data Siswa</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div><span class="text-gray-500">NIS:</span> <span class="font-medium text-gray-900">{{ displayValue(detailStudent.nis) }}</span></div>
            <div><span class="text-gray-500">NISN:</span> <span class="font-medium text-gray-900">{{ displayValue(detailStudent.nisn) }}</span></div>
            <div><span class="text-gray-500">Nama:</span> <span class="font-medium text-gray-900">{{ displayValue(detailStudent.full_name) }}</span></div>
            <div><span class="text-gray-500">Gender:</span> <span class="font-medium text-gray-900">{{ detailStudent.gender === 'L' ? 'Laki-Laki' : detailStudent.gender === 'P' ? 'Perempuan' : '-' }}</span></div>
            <div><span class="text-gray-500">Tanggal Lahir:</span> <span class="font-medium text-gray-900">{{ formatDate(detailStudent.date_of_birth) }}</span></div>
            <div class="sm:col-span-2"><span class="text-gray-500">Alamat:</span> <span class="font-medium text-gray-900">{{ displayValue(detailStudent.address) }}</span></div>
          </div>
        </section>

        <section>
          <h3 class="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Parent Profiles</h3>
          <div v-if="!detailStudent.parents || detailStudent.parents.length === 0" class="rounded border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            Belum ada data parent.
          </div>
          <div v-else class="space-y-3">
            <div v-for="parent in detailStudent.parents" :key="parent.id" class="rounded-lg border border-gray-200 p-4 bg-gray-50/50">
              <div class="flex items-center justify-between mb-2">
                <p class="font-semibold text-gray-800">{{ displayValue(parent.full_name) }}</p>
                <span class="text-xs rounded bg-gray-200 px-2 py-1 text-gray-700">{{ displayValue(parent.type) }}</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                <div><span class="text-gray-500">NIK:</span> <span class="font-medium text-gray-900">{{ displayValue(parent.nik) }}</span></div>
                <div><span class="text-gray-500">No HP:</span> <span class="font-medium text-gray-900">{{ displayValue(parent.phone) }}</span></div>
                <div><span class="text-gray-500">Email:</span> <span class="font-medium text-gray-900">{{ displayValue(parent.email) }}</span></div>
                <div><span class="text-gray-500">Wali Utama:</span> <span class="font-medium text-gray-900">{{ parent.is_guardian ? 'Ya' : 'Tidak' }}</span></div>
                <div><span class="text-gray-500">Pekerjaan:</span> <span class="font-medium text-gray-900">{{ displayValue(parent.occupation) }}</span></div>
                <div><span class="text-gray-500">Pendidikan:</span> <span class="font-medium text-gray-900">{{ displayValue(parent.education) }}</span></div>
                <div class="sm:col-span-2"><span class="text-gray-500">Alamat:</span> <span class="font-medium text-gray-900">{{ displayValue(parent.address) }}</span></div>
              </div>

              <div>
                <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Dokumen Parent</p>
                <div v-if="!parent.documents || parent.documents.length === 0" class="text-xs text-gray-500">Belum ada dokumen.</div>
                <div v-else class="space-y-2">
                  <div v-for="doc in parent.documents" :key="doc.id" class="text-sm rounded border border-gray-200 bg-white px-3 py-2">
                    <p><span class="text-gray-500">Jenis:</span> <span class="font-medium text-gray-900">{{ displayValue(doc.document_type) }}</span></p>
                    <p><span class="text-gray-500">File:</span> <span class="font-medium text-gray-900 break-all">{{ displayValue(doc.document_file) }}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section class="mt-4 pt-4 border-t border-gray-100">
          <h3 class="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Dashboard Orang Tua</h3>
          <div class="rounded-lg border border-gray-200 p-4 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex-1">
              <p class="text-sm text-gray-600 mb-1">Akses real-time aktivitas siswa khusus untuk orang tua (tanpa login).</p>
              <div class="text-xs font-mono bg-white border border-gray-200 px-2 py-1 rounded inline-block text-gray-500 break-all select-all">
                {{ getParentDashboardUrl(detailStudent.id) }}
              </div>
            </div>
            <div class="flex gap-2">
              <BaseButton variant="outline" @click="copyParentDashboardUrl(detailStudent.id)">
                <template #icon>
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                </template>
                Copy Link
              </BaseButton>
              <BaseButton @click="openParentDashboardUrl(detailStudent.id)">
                <template #icon>
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                </template>
                Buka
              </BaseButton>
            </div>
          </div>
        </section>
      </div>
    </BaseModal>

    <BaseModal v-model="showDeleteModal" title="Konfirmasi Hapus" maxWidth="sm">
      <div class="mt-2 text-center sm:text-left">
        <p class="text-sm text-gray-500">
          Apakah Anda yakin ingin menghapus data siswa <span class="font-bold text-gray-900">{{ currentStudent?.full_name }}</span>? Data yang dihapus tidak dapat dikembalikan.
        </p>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showDeleteModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton variant="danger" @click="deleteStudent" :loading="deleting">Ya, Hapus</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import studentService from '@/services/api/student.service'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()

const fileInput = ref(null)
const importing = ref(false)
const exporting = ref(false)

const students = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const limit = ref(10)
const search = ref('')
const sortBy = ref('created_at')
const sortDesc = ref(true)
const filterClassId = ref('')
const classOptions = ref([])
const classSearch = ref('')
const showClassDropdown = ref(false)
const classDropdownRef = ref(null)

const showModal = ref(false)
const showDeleteModal = ref(false)
const showDetailModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const loadingForm = ref(false)
const detailLoading = ref(false)
const currentStudent = ref(null)
const detailStudent = ref(null)

const createParentDocument = () => ({
  local_key: `doc_${Date.now()}_${Math.random()}`,
  id: null,
  document_type: '',
  document_file: ''
})

const createParent = () => ({
  local_key: `parent_${Date.now()}_${Math.random()}`,
  id: null,
  type: '',
  full_name: '',
  nik: '',
  phone: '',
  email: '',
  occupation: '',
  education: '',
  is_guardian: false,
  address: '',
  documents: []
})

const createDefaultForm = () => ({
  nis: '',
  nisn: '',
  full_name: '',
  gender: '',
  date_of_birth: '',
  address: '',
  parents: [createParent()]
})

const form = reactive(createDefaultForm())

const columns = [
  { key: 'nis', label: 'NIS', sortable: true },
  { key: 'nisn', label: 'NISN', sortable: true },
  { key: 'full_name', label: 'Nama Lengkap', sortable: true },
  { key: 'gender', label: 'L/P', sortable: true },
  { key: 'class_name', label: 'Kelas', sortable: false },
  { key: 'date_of_birth', label: 'Tgl Lahir', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false, class: 'w-36 text-right' }
]

const resetForm = () => {
  Object.assign(form, createDefaultForm())
}

const normalizeParent = (parent = {}) => ({
  local_key: `parent_${parent.id || Date.now()}_${Math.random()}`,
  id: parent.id || null,
  type: parent.type || '',
  full_name: parent.full_name || '',
  nik: parent.nik || '',
  phone: parent.phone || '',
  email: parent.email || '',
  occupation: parent.occupation || '',
  education: parent.education || '',
  is_guardian: Boolean(parent.is_guardian),
  address: parent.address || '',
  documents: Array.isArray(parent.documents)
    ? parent.documents.map((doc) => ({
      local_key: `doc_${doc.id || Date.now()}_${Math.random()}`,
      id: doc.id || null,
      document_type: doc.document_type || '',
      document_file: doc.document_file || ''
    }))
    : []
})

const applyStudentToForm = (student = {}) => {
  Object.assign(form, {
    nis: student.nis || '',
    nisn: student.nisn || '',
    full_name: student.full_name || '',
    gender: student.gender || '',
    date_of_birth: student.date_of_birth || '',
    address: student.address || '',
    parents: Array.isArray(student.parents) && student.parents.length > 0
      ? student.parents.map(normalizeParent)
      : [createParent()]
  })
}

const hasDocContent = (doc = {}) => {
  return ['document_type', 'document_file'].some((field) => String(doc[field] || '').trim() !== '')
}

const hasParentContent = (parent = {}) => {
  if (parent.is_guardian) return true
  if (Array.isArray(parent.documents) && parent.documents.some(hasDocContent)) return true

  const fields = ['type', 'full_name', 'nik', 'phone', 'email', 'occupation', 'education', 'address']
  return fields.some((field) => String(parent[field] || '').trim() !== '')
}

const buildPayload = () => {
  const parents = form.parents
    .filter(hasParentContent)
    .map((parent) => ({
      id: parent.id || undefined,
      type: parent.type || null,
      full_name: parent.full_name || null,
      nik: parent.nik || null,
      phone: parent.phone || null,
      email: parent.email || null,
      occupation: parent.occupation || null,
      education: parent.education || null,
      is_guardian: Boolean(parent.is_guardian),
      address: parent.address || null,
      documents: (parent.documents || [])
        .filter(hasDocContent)
        .map((doc) => ({
          id: doc.id || undefined,
          document_type: doc.document_type || null,
          document_file: doc.document_file || null
        }))
    }))

  return {
    nis: form.nis,
    nisn: form.nisn,
    full_name: form.full_name,
    gender: form.gender,
    date_of_birth: form.date_of_birth,
    address: form.address,
    parents
  }
}

// Computed: filtered class options for search
const filteredClassOptions = computed(() => {
  if (!classSearch.value.trim()) return classOptions.value
  const q = classSearch.value.toLowerCase()
  return classOptions.value.filter(c => c.name.toLowerCase().includes(q))
})

const fetchClasses = async () => {
  try {
    // Get active academic year
    const yearRes = await api.get('/academic/years', { params: { limit: 50 } })
    const years = yearRes.data?.academicYears || []
    const activeYear = years.find(y => y.is_active)
    if (!activeYear) {
      // Fallback: load all classes
      const res = await api.get('/academic/classes', { params: { limit: 200 } })
      classOptions.value = res.data?.classes || []
      return
    }
    // Load classes scoped to active academic year (returns array directly)
    const res = await api.get('/class-setup/classes', { params: { academic_year_id: activeYear.id } })
    const rawClasses = res.data || []
    classOptions.value = rawClasses.map(c => ({ id: c.id, name: c.name }))
  } catch (e) { /* silent */ }
}

const selectClass = (cls) => {
  filterClassId.value = cls ? cls.id : ''
  showClassDropdown.value = false
  classSearch.value = ''
  currentPage.value = 1
  fetchStudents()
}

const clearClassFilter = () => {
  filterClassId.value = ''
  classSearch.value = ''
  showClassDropdown.value = false
  currentPage.value = 1
  fetchStudents()
}

const handleClickOutsideClass = (e) => {
  if (classDropdownRef.value && !classDropdownRef.value.contains(e.target)) {
    showClassDropdown.value = false
    classSearch.value = ''
  }
}

const fetchStudents = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: limit.value,
      search: search.value,
      ...(filterClassId.value ? { class_id: filterClassId.value } : {})
    }
    const response = await studentService.getAll(params)
    if (response.success) {
      students.value = response.data.students
      total.value = response.data.totalItems
    }
  } catch (err) {
    showError(err.message || 'Gagal mengambil data siswa')
  } finally {
    loading.value = false
  }
}

const handleFilterClass = () => {
  currentPage.value = 1
  fetchStudents()
}

const resetFilters = () => {
  filterClassId.value = ''
  currentPage.value = 1
  fetchStudents()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchStudents()
}

let searchTimeout
const handleSearch = (val) => {
  search.value = val
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchStudents()
  }, 500)
}

const handleSort = (key) => {
  if (sortBy.value === key) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = key
    sortDesc.value = true
  }
  fetchStudents()
}

const openFilePicker = () => {
  fileInput.value?.click()
}

const openCreateModal = () => {
  isEditing.value = false
  currentStudent.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = async (student) => {
  isEditing.value = true
  currentStudent.value = student
  resetForm()
  showModal.value = true
  loadingForm.value = true

  try {
    const response = await studentService.getById(student.id)
    if (response.success) {
      applyStudentToForm(response.data)
    }
  } catch (err) {
    showError(err.message || 'Gagal memuat detail siswa')
    showModal.value = false
  } finally {
    loadingForm.value = false
  }
}

const openDetailModal = async (student) => {
  currentStudent.value = student
  detailStudent.value = null
  showDetailModal.value = true
  detailLoading.value = true

  try {
    const response = await studentService.getById(student.id)
    if (response.success) {
      detailStudent.value = response.data
    }
  } catch (err) {
    showError(err.message || 'Gagal memuat detail siswa')
    showDetailModal.value = false
  } finally {
    detailLoading.value = false
  }
}

const confirmDelete = (student) => {
  currentStudent.value = student
  showDeleteModal.value = true
}

const addParent = () => {
  form.parents.push(createParent())
}

const removeParent = (parentIndex) => {
  form.parents.splice(parentIndex, 1)
  if (form.parents.length === 0) {
    form.parents.push(createParent())
  }
}

const addParentDocument = (parentIndex) => {
  form.parents[parentIndex].documents.push(createParentDocument())
}

const removeParentDocument = (parentIndex, docIndex) => {
  form.parents[parentIndex].documents.splice(docIndex, 1)
}

const saveStudent = async () => {
  if (!form.nis || !form.full_name || !form.gender) {
    showError('Harap lengkapi semua field wajib (*)!')
    return
  }

  saving.value = true
  try {
    const payload = buildPayload()

    if (isEditing.value) {
      await studentService.update(currentStudent.value.id, payload)
      success('Data siswa berhasil diperbarui')
    } else {
      await studentService.create(payload)
      success('Siswa baru berhasil ditambahkan')
    }
    showModal.value = false
    fetchStudents()
  } catch (err) {
    showError(err.message || 'Gagal menyimpan data')
  } finally {
    saving.value = false
  }
}

const deleteStudent = async () => {
  deleting.value = true
  try {
    await studentService.delete(currentStudent.value.id)
    success('Data siswa berhasil dihapus')
    showDeleteModal.value = false

    if (students.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }
    fetchStudents()
  } catch (err) {
    showError(err.message || 'Gagal menghapus data')
  } finally {
    deleting.value = false
  }
}

const downloadTemplate = async () => {
  try {
    const response = await studentService.downloadTemplate()
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'template_siswa.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    showError('Gagal mengunduh template')
  }
}

const exportExcel = async () => {
  exporting.value = true
  try {
    const params = { search: search.value, sortBy: sortBy.value, sortDesc: sortDesc.value }
    const response = await studentService.exportExcel(params)
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'data_siswa.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    success('Data berhasil diexport')
  } catch (err) {
    showError('Gagal export data')
  } finally {
    exporting.value = false
  }
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  importing.value = true
  try {
    const res = await studentService.importExcel(file)
    success(res.message || 'Import data berhasil')
    currentPage.value = 1
    fetchStudents()
  } catch (err) {
    showError(err.message || 'Gagal import data')
  } finally {
    importing.value = false
    event.target.value = ''
  }
}

const displayValue = (value) => {
  return value ? String(value) : '-'
}

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID')
}

const getParentDashboardUrl = (id) => {
  return `${window.location.origin}/parent/${id}`
}

const copyParentDashboardUrl = async (id) => {
  const url = getParentDashboardUrl(id)
  try {
    await navigator.clipboard.writeText(url)
    success('Link dashboard berhasil disalin!')
  } catch (err) {
    showError('Gagal menyalin link')
  }
}

const openParentDashboardUrl = (id) => {
  window.open(getParentDashboardUrl(id), '_blank')
}

onMounted(() => {
  fetchClasses()
  fetchStudents()
  document.addEventListener('click', handleClickOutsideClass)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutsideClass)
})
</script>
