<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Surat Izin Siswa</h1>
        <p class="text-sm text-gray-500 mt-0.5">Kelola surat izin kegiatan siswa</p>
      </div>
      <BaseButton @click="openCreateModal">+ Buat Surat Izin</BaseButton>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select v-model="filterStatus" @change="handleFilterChange" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm">
            <option value="">Semua Status</option>
            <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Guru Pendamping</label>
          <select v-model="filterTeacherId" @change="handleFilterChange" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm">
            <option value="">Semua Guru</option>
            <option v-for="t in teacherOptions" :key="t.id" :value="t.id">{{ t.full_name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Dari Tanggal</label>
          <input type="date" v-model="filterDateFrom" @change="handleFilterChange" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Sampai Tanggal</label>
          <input type="date" v-model="filterDateTo" @change="handleFilterChange" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white text-sm" />
        </div>
      </div>
      <div v-if="hasActiveFilter" class="mt-3 flex justify-end">
        <button @click="resetFilters" class="text-xs text-red-500 hover:text-red-700 font-medium">Reset Filter</button>
      </div>
    </div>

    <BaseTable :columns="columns" :data="items" :loading="loading" :total="total" :currentPage="currentPage" :perPage="limit" :searchQuery="search" @update:searchQuery="handleSearch" @page-change="handlePageChange" @sort="handleSort" :sortBy="sortBy" :sortDesc="sortDesc">
      <template #cell-code="{ item }">
        <span class="font-mono text-xs text-blue-700 font-semibold">{{ item.code }}</span>
      </template>
      <template #cell-activity_name="{ item }">
        <div class="max-w-[180px]">
          <p class="font-medium text-gray-800 text-sm truncate" :title="item.activity_name">{{ item.activity_name }}</p>
          <p v-if="item.location" class="text-xs text-gray-400 truncate">{{ item.location }}</p>
        </div>
      </template>
      <template #cell-companion_name="{ item }">
        <span class="text-sm text-gray-700">{{ item.companion_name || item.teacher?.full_name || '-' }}</span>
      </template>
      <template #cell-student_count="{ item }">
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{{ item.students?.length || 0 }} siswa</span>
      </template>
      <template #cell-start_date="{ item }">
        <span class="text-sm text-gray-700">{{ formatDate(item.start_date) }}</span>
      </template>
      <template #cell-end_date="{ item }">
        <span class="text-sm text-gray-700">{{ formatDate(item.end_date) || '-' }}</span>
      </template>
      <template #cell-status="{ item }">
        <span :class="statusBadgeClass(item.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
          <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="statusDotClass(item.status)"></span>{{ item.status }}
        </span>
      </template>
      <template #cell-creator="{ item }">
        <span class="text-xs text-gray-500">{{ item.creator?.name || '-' }}</span>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex items-center gap-1 justify-end">
          <button @click="openDetailModal(item)" title="Detail" class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></button>
          <!-- Print PDF button (all statuses) -->
          <button @click="handlePrint(item, 'preview')" :disabled="printLoadingId === item.id" title="Preview PDF" class="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50">
            <svg v-if="printLoadingId === item.id" class="animate-spin h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          </button>
          <button v-if="item.status === 'DRAFT'" @click="openEditModal(item)" title="Edit" class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
          <button v-if="item.status === 'DRAFT'" @click="confirmAction('submit', item)" title="Ajukan" class="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg></button>
          <button v-if="item.status === 'PENDING'" @click="confirmAction('approve', item)" title="Setujui" class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg></button>
          <button v-if="item.status === 'PENDING'" @click="confirmAction('reject', item)" title="Tolak" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
          <button v-if="['DRAFT','PENDING','APPROVED'].includes(item.status)" @click="confirmAction('cancel', item)" title="Batalkan" class="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg></button>
          <button v-if="item.status === 'DRAFT'" @click="confirmDelete(item)" title="Hapus" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
        </div>
      </template>
    </BaseTable>

    <!-- MODAL FORM -->
    <BaseModal v-model="showFormModal" :title="isEditing ? 'Edit Surat Izin' : 'Buat Surat Izin Baru'" maxWidth="3xl">
      <form @submit.prevent="saveData" class="space-y-5">
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100">Informasi Surat</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Kode Surat</label>
              <div class="flex gap-2">
                <input
                  id="f_code"
                  v-model="form.code"
                  placeholder="Otomatis jika dikosongkan"
                  class="block w-full rounded-md border border-gray-300 px-3 py-2 bg-white/50 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  @click="generateCodeHandler"
                  :disabled="generatingCode"
                  title="Generate kode surat otomatis"
                  class="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-blue-300 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <svg v-if="generatingCode" class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <svg v-else class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  {{ generatingCode ? 'Generating...' : 'Generate' }}
                </button>
              </div>
              <p class="text-xs text-gray-400 mt-1">Format: 001/104.26/SPm/SMK.IT/III/2026</p>
            </div>
            <BaseInput id="f_activity" v-model="form.activity_name" label="Nama Kegiatan" placeholder="Nama kegiatan" required />
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Tujuan Kegiatan</label>
              <textarea v-model="form.purpose" rows="2" placeholder="Jelaskan tujuan kegiatan" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50 text-sm"></textarea>
            </div>
            <BaseInput id="f_location" v-model="form.location" label="Tempat / Lokasi" placeholder="Lokasi kegiatan" class="sm:col-span-2" />
          </div>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100">Waktu Kegiatan</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseInput id="f_start_date" v-model="form.start_date" type="date" label="Tanggal Mulai" required />
            <BaseInput id="f_end_date" v-model="form.end_date" type="date" label="Tanggal Selesai" />
            <BaseInput id="f_start_time" v-model="form.start_time" type="time" label="Waktu Mulai" />
            <BaseInput id="f_end_time" v-model="form.end_time" type="time" label="Waktu Selesai" />
          </div>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100">Guru Pendamping</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseSearchSelect
              v-model="form.teacher_id"
              label="Guru Pendamping"
              placeholder="Ketik nama guru untuk mencari..."
              :initialLabel="teacherSearchLabel"
              :fetchOptions="fetchTeacherOptions"
              @change="onTeacherChange"
            />
            <BaseInput id="f_companion" v-model="form.companion_name" label="Nama Pendamping" placeholder="Otomatis dari guru atau isi manual" />
          </div>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100">
            Siswa Peserta <span class="ml-2 text-xs font-normal text-gray-400">(wajib minimal 1)</span>
          </h3>
          <div class="relative mb-3">
            <div class="relative">
              <input v-model="studentSearchQuery" @input="onStudentSearchInput" @focus="showStudentDropdown = true" @blur="onStudentBlur" placeholder="Cari siswa berdasarkan nama atau NIS..." class="block w-full rounded-md border-gray-300 px-3 py-2 pl-9 border bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg v-if="searchingStudents" class="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <svg v-else class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
            </div>
            <div v-if="showStudentDropdown && studentSearchResults.length > 0" class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
              <div v-for="s in studentSearchResults" :key="s.id" @mousedown.prevent="addStudent(s)" class="flex items-center justify-between px-3 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0">
                <div><p class="text-sm font-medium text-gray-800">{{ s.full_name }}</p><p class="text-xs text-gray-400">NIS: {{ s.nis || '-' }}</p></div>
                <span v-if="isStudentSelected(s.id)" class="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Dipilih</span>
                <span v-else class="text-xs text-blue-600 font-medium">+ Tambah</span>
              </div>
            </div>
            <div v-if="showStudentDropdown && studentSearchQuery.length >= 2 && studentSearchResults.length === 0 && !searchingStudents" class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-3 text-sm text-gray-400 text-center">
              Siswa tidak ditemukan
            </div>
          </div>
          <div class="min-h-[60px] rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3">
            <div v-if="selectedStudents.length === 0" class="flex items-center justify-center h-10 text-sm text-gray-400">Belum ada siswa dipilih. Cari dan tambahkan siswa di atas.</div>
            <div v-else class="space-y-1.5">
              <div v-for="(s, idx) in selectedStudents" :key="s.id" class="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{{ idx + 1 }}</span>
                  <div><p class="text-sm font-medium text-gray-800">{{ s.full_name }}</p><p class="text-xs text-gray-400">NIS: {{ s.nis || '-' }}</p></div>
                </div>
                <button type="button" @click="removeStudent(s.id)" class="text-gray-300 hover:text-red-500 transition-colors p-1 rounded"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
              </div>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-1.5"><span class="font-semibold text-blue-600">{{ selectedStudents.length }}</span> siswa dipilih</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
          <textarea v-model="form.notes" rows="2" placeholder="Catatan tambahan (opsional)" class="block w-full rounded-md border-gray-300 px-3 py-2 border bg-white/50 text-sm"></textarea>
        </div>
      </form>
      <template #footer>
        <BaseButton variant="outline" @click="showFormModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="saveData" :loading="saving">{{ isEditing ? 'Simpan Perubahan' : 'Buat Surat Izin' }}</BaseButton>
      </template>
    </BaseModal>

    <!-- MODAL DETAIL -->
    <BaseModal v-model="showDetailModal" title="Detail Surat Izin" maxWidth="2xl">
      <div v-if="currentItem" class="space-y-5">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span :class="statusBadgeClass(currentItem.status)" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold">
            <span class="w-2 h-2 rounded-full mr-2" :class="statusDotClass(currentItem.status)"></span>{{ currentItem.status }}
          </span>
          <span class="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">{{ currentItem.code }}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div class="sm:col-span-2"><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Nama Kegiatan</p><p class="font-semibold text-gray-900 mt-0.5 text-base">{{ currentItem.activity_name || '-' }}</p></div>
          <div class="sm:col-span-2"><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Tujuan</p><p class="text-gray-800 mt-0.5">{{ currentItem.purpose || '-' }}</p></div>
          <div><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Tanggal Mulai</p><p class="text-gray-900 mt-0.5">{{ formatDate(currentItem.start_date) }}</p></div>
          <div><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Tanggal Selesai</p><p class="text-gray-900 mt-0.5">{{ formatDate(currentItem.end_date) || '-' }}</p></div>
          <div><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Waktu Mulai</p><p class="text-gray-900 mt-0.5">{{ currentItem.start_time || '-' }}</p></div>
          <div><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Waktu Selesai</p><p class="text-gray-900 mt-0.5">{{ currentItem.end_time || '-' }}</p></div>
          <div><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Lokasi</p><p class="text-gray-900 mt-0.5">{{ currentItem.location || '-' }}</p></div>
          <div><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Guru Pendamping</p><p class="text-gray-900 mt-0.5">{{ currentItem.companion_name || currentItem.teacher?.full_name || '-' }}</p></div>
          <div v-if="currentItem.notes" class="sm:col-span-2"><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Catatan</p><p class="text-gray-800 mt-0.5">{{ currentItem.notes }}</p></div>
          <div v-if="currentItem.approver"><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Disetujui Oleh</p><p class="text-gray-900 mt-0.5">{{ currentItem.approver?.name || '-' }}</p></div>
          <div v-if="currentItem.approved_at"><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Waktu Persetujuan</p><p class="text-gray-900 mt-0.5">{{ formatDateTime(currentItem.approved_at) }}</p></div>
          <div><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Dibuat Oleh</p><p class="text-gray-900 mt-0.5">{{ currentItem.creator?.name || '-' }}</p></div>
          <div><p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Tanggal Dibuat</p><p class="text-gray-900 mt-0.5">{{ formatDateTime(currentItem.created_at) }}</p></div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-semibold text-gray-700">Daftar Siswa Peserta</p>
            <span class="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-0.5 rounded-full">{{ currentItem.students?.length || 0 }} siswa</span>
          </div>
          <div v-if="!currentItem.students || currentItem.students.length === 0" class="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-lg">Tidak ada siswa terdaftar</div>
          <div v-else class="border border-gray-100 rounded-lg overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-gray-50"><tr><th class="px-3 py-2 text-left text-xs font-medium text-gray-500 w-8">No</th><th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Nama Siswa</th><th class="px-3 py-2 text-left text-xs font-medium text-gray-500">NIS</th><th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Catatan</th></tr></thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="(ps, idx) in currentItem.students" :key="ps.id" class="hover:bg-gray-50">
                  <td class="px-3 py-2 text-gray-400 text-xs">{{ idx + 1 }}</td>
                  <td class="px-3 py-2 font-medium text-gray-800">{{ ps.student?.full_name || '-' }}</td>
                  <td class="px-3 py-2 text-gray-500 font-mono text-xs">{{ ps.student?.nis || '-' }}</td>
                  <td class="px-3 py-2 text-gray-400 text-xs">{{ ps.notes || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center gap-2 flex-wrap">
          <BaseButton variant="outline" @click="showDetailModal = false">Tutup</BaseButton>
          <!-- PDF Actions -->
          <BaseButton
            variant="outline"
            :loading="printLoadingId === currentItem?.id && printMode === 'preview'"
            @click="handlePrint(currentItem, 'preview')"
            customClass="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <svg class="h-4 w-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            Preview PDF
          </BaseButton>
          <BaseButton
            variant="outline"
            :loading="printLoadingId === currentItem?.id && printMode === 'download'"
            @click="handlePrint(currentItem, 'download')"
            customClass="border-green-300 text-green-700 hover:bg-green-50"
          >
            <svg class="h-4 w-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Download PDF
          </BaseButton>
          <BaseButton
            variant="outline"
            :loading="printLoadingId === currentItem?.id && printMode === 'print'"
            @click="handlePrint(currentItem, 'print')"
            customClass="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <svg class="h-4 w-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Print
          </BaseButton>
          <!-- Status actions -->
          <BaseButton v-if="currentItem?.status === 'DRAFT'" variant="secondary" @click="openEditFromDetail">Edit</BaseButton>
          <BaseButton v-if="currentItem?.status === 'DRAFT'" @click="confirmActionFromDetail('submit')" customClass="bg-yellow-500 hover:bg-yellow-600 border-yellow-500 text-white">Ajukan</BaseButton>
          <BaseButton v-if="currentItem?.status === 'PENDING'" @click="confirmActionFromDetail('approve')">Setujui</BaseButton>
          <BaseButton v-if="currentItem?.status === 'PENDING'" variant="danger" @click="confirmActionFromDetail('reject')">Tolak</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- MODAL ACTION CONFIRM -->
    <BaseModal v-model="showActionModal" :title="actionConfig.title" maxWidth="sm">
      <p class="text-sm text-gray-600 text-center py-2">{{ actionConfig.message }}</p>
      <template #footer>
        <BaseButton variant="outline" @click="showActionModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton :variant="actionConfig.variant" @click="doAction" :loading="actionLoading">{{ actionConfig.confirmLabel }}</BaseButton>
      </template>
    </BaseModal>

    <!-- MODAL DELETE -->
    <BaseModal v-model="showDeleteModal" title="Konfirmasi Hapus" maxWidth="sm">
      <p class="text-sm text-gray-600 text-center py-2">Hapus surat izin <b>{{ currentItem?.code }}</b>? Data yang dihapus tidak dapat dikembalikan.</p>
      <template #footer>
        <BaseButton variant="outline" @click="showDeleteModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton variant="danger" @click="doDelete" :loading="actionLoading">Ya, Hapus</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/tables/BaseTable.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseSearchSelect from '@/components/forms/BaseSearchSelect.vue'
import permissionLetterService from '@/services/api/permissionLetter.service'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()

// ─── Table columns ───────────────────────────────────────────────────────────
const columns = [
  { key: 'code', label: 'Kode', sortable: true },
  { key: 'activity_name', label: 'Nama Kegiatan', sortable: true },
  { key: 'companion_name', label: 'Guru Pendamping', sortable: false },
  { key: 'student_count', label: 'Siswa', sortable: false },
  { key: 'start_date', label: 'Tgl Mulai', sortable: true },
  { key: 'end_date', label: 'Tgl Selesai', sortable: false },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'creator', label: 'Dibuat Oleh', sortable: false },
  { key: 'actions', label: 'Aksi', sortable: false }
]

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Disetujui' },
  { value: 'REJECTED', label: 'Ditolak' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
  { value: 'FINISHED', label: 'Selesai' }
]

// ─── State ────────────────────────────────────────────────────────────────────
const items = ref([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const limit = ref(10)
const search = ref('')
const sortBy = ref('created_at')
const sortDesc = ref(true)

const filterStatus = ref('')
const filterTeacherId = ref('')
const filterDateFrom = ref('')
const filterDateTo = ref('')

const teacherOptions = ref([])
const teacherSearchLabel = ref('')

const showFormModal = ref(false)
const showDetailModal = ref(false)
const showActionModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const generatingCode = ref(false)
const actionLoading = ref(false)
const currentItem = ref(null)
const pendingAction = ref('')

// ─── PDF Print ────────────────────────────────────────────────────────────────
const printLoadingId = ref(null)
const printMode = ref('')

const defaultForm = {
  code: '', activity_name: '', purpose: '', location: '',
  start_date: '', end_date: '', start_time: '', end_time: '',
  teacher_id: '', companion_name: '', notes: ''
}
const form = reactive({ ...defaultForm })

// Student picker
const selectedStudents = ref([])
const studentSearchQuery = ref('')
const studentSearchResults = ref([])
const searchingStudents = ref(false)
const showStudentDropdown = ref(false)
let studentSearchTimer = null

// ─── Computed ─────────────────────────────────────────────────────────────────
const hasActiveFilter = computed(() =>
  filterStatus.value || filterTeacherId.value || filterDateFrom.value || filterDateTo.value
)

const actionConfig = computed(() => {
  const map = {
    submit: { title: 'Ajukan Surat Izin', message: 'Ajukan surat izin ini untuk mendapatkan persetujuan?', variant: 'primary', confirmLabel: 'Ya, Ajukan' },
    approve: { title: 'Setujui Surat Izin', message: 'Setujui surat izin ini?', variant: 'primary', confirmLabel: 'Ya, Setujui' },
    reject: { title: 'Tolak Surat Izin', message: 'Tolak surat izin ini?', variant: 'danger', confirmLabel: 'Ya, Tolak' },
    cancel: { title: 'Batalkan Surat Izin', message: 'Batalkan surat izin ini?', variant: 'danger', confirmLabel: 'Ya, Batalkan' }
  }
  return map[pendingAction.value] || {}
})

// ─── Fetch data ───────────────────────────────────────────────────────────────
async function fetchData() {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: limit.value,
      search: search.value,
      sortBy: sortBy.value,
      sortDesc: sortDesc.value,
      status: filterStatus.value,
      teacher_id: filterTeacherId.value,
      date_from: filterDateFrom.value,
      date_to: filterDateTo.value
    }
    const res = await permissionLetterService.getAll(params)
    items.value = res.data?.permissionLetters || []
    total.value = res.data?.totalItems || 0
  } catch (e) {
    showError('Gagal memuat data surat izin')
  } finally {
    loading.value = false
  }
}

async function fetchTeachers() {
  try {
    const res = await api.get('/academic/teachers', { params: { limit: 200 } })
    teacherOptions.value = res.data?.teachers || res.data || []
  } catch (e) { /* silent */ }
}

async function fetchTeacherOptions(query) {
  try {
    const res = await api.get('/academic/teachers', { params: { search: query, limit: 30 } })
    const teachers = res.data?.teachers || []
    return teachers.map(t => ({ value: t.id, label: t.full_name, description: t.nip || '' }))
  } catch (e) {
    return []
  }
}

// ─── Handlers ─────────────────────────────────────────────────────────────────
let searchTimer = null
function handleSearch(val) {
  search.value = val
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { currentPage.value = 1; fetchData() }, 400)
}

function handlePageChange(page) { currentPage.value = page; fetchData() }

function handleSort({ key, desc }) { sortBy.value = key; sortDesc.value = desc; fetchData() }

function handleFilterChange() { currentPage.value = 1; fetchData() }

function resetFilters() {
  filterStatus.value = ''; filterTeacherId.value = ''
  filterDateFrom.value = ''; filterDateTo.value = ''
  currentPage.value = 1; fetchData()
}

// ─── Form ─────────────────────────────────────────────────────────────────────
function resetForm() {
  Object.assign(form, defaultForm)
  teacherSearchLabel.value = ''
  selectedStudents.value = []
  studentSearchQuery.value = ''
  studentSearchResults.value = []
  showStudentDropdown.value = false
}

function openCreateModal() {
  isEditing.value = false
  resetForm()
  showFormModal.value = true
}

function openEditModal(item) {
  isEditing.value = true
  currentItem.value = item
  teacherSearchLabel.value = item.teacher?.full_name || item.companion_name || ''
  Object.assign(form, {
    code: item.code || '',
    activity_name: item.activity_name || '',
    purpose: item.purpose || '',
    location: item.location || '',
    start_date: item.start_date || '',
    end_date: item.end_date || '',
    start_time: item.start_time || '',
    end_time: item.end_time || '',
    teacher_id: item.teacher_id || '',
    companion_name: item.companion_name || '',
    notes: item.notes || ''
  })
  // Load students from item
  selectedStudents.value = (item.students || []).map(ps => ps.student || { id: ps.student_id })
  showFormModal.value = true
}

function openEditFromDetail() {
  showDetailModal.value = false
  openEditModal(currentItem.value)
}

async function saveData() {
  if (!form.activity_name) { showError('Nama kegiatan wajib diisi'); return }
  if (!form.start_date) { showError('Tanggal mulai wajib diisi'); return }
  if (selectedStudents.value.length === 0) { showError('Minimal 1 siswa harus dipilih'); return }

  saving.value = true
  try {
    const payload = {
      ...form,
      students: selectedStudents.value.map(s => ({ student_id: s.id }))
    }
    if (isEditing.value) {
      await permissionLetterService.update(currentItem.value.id, payload)
      success('Surat izin berhasil diperbarui')
    } else {
      await permissionLetterService.create(payload)
      success('Surat izin berhasil dibuat')
    }
    showFormModal.value = false
    fetchData()
  } catch (e) {
    showError(e?.response?.data?.message || 'Gagal menyimpan data')
  } finally {
    saving.value = false
  }
}

async function generateCodeHandler() {
  generatingCode.value = true
  try {
    const res = await permissionLetterService.generateCode()
    form.code = res.data?.code || ''
  } catch (e) {
    showError('Gagal generate kode surat')
  } finally {
    generatingCode.value = false
  }
}

function onTeacherChange(option) {
  if (option && !form.companion_name) {
    form.companion_name = option.label
  }
}

// ─── Student picker ───────────────────────────────────────────────────────────
function onStudentSearchInput() {
  clearTimeout(studentSearchTimer)
  if (studentSearchQuery.value.length < 2) { studentSearchResults.value = []; return }
  searchingStudents.value = true
  studentSearchTimer = setTimeout(async () => {
    try {
      const res = await api.get('/students', { params: { search: studentSearchQuery.value, limit: 20 } })
      studentSearchResults.value = res.data?.students || res.data || []
    } catch (e) {
      studentSearchResults.value = []
    } finally {
      searchingStudents.value = false
    }
  }, 350)
}

function onStudentBlur() {
  setTimeout(() => { showStudentDropdown.value = false }, 200)
}

function isStudentSelected(id) {
  return selectedStudents.value.some(s => s.id === id)
}

function addStudent(student) {
  if (!isStudentSelected(student.id)) {
    selectedStudents.value.push(student)
  }
  studentSearchQuery.value = ''
  studentSearchResults.value = []
  showStudentDropdown.value = false
}

function removeStudent(id) {
  selectedStudents.value = selectedStudents.value.filter(s => s.id !== id)
}

// ─── Detail ───────────────────────────────────────────────────────────────────
async function openDetailModal(item) {
  try {
    const res = await permissionLetterService.getById(item.id)
    currentItem.value = res.data
    showDetailModal.value = true
  } catch (e) {
    showError('Gagal memuat detail')
  }
}

// ─── Actions ──────────────────────────────────────────────────────────────────
function confirmAction(action, item) {
  currentItem.value = item
  pendingAction.value = action
  showActionModal.value = true
}

function confirmActionFromDetail(action) {
  pendingAction.value = action
  showDetailModal.value = false
  showActionModal.value = true
}

async function doAction() {
  actionLoading.value = true
  try {
    const id = currentItem.value.id
    if (pendingAction.value === 'submit') await permissionLetterService.submit(id)
    else if (pendingAction.value === 'approve') await permissionLetterService.approve(id)
    else if (pendingAction.value === 'reject') await permissionLetterService.reject(id)
    else if (pendingAction.value === 'cancel') await permissionLetterService.cancel(id)
    success(actionConfig.value.title + ' berhasil')
    showActionModal.value = false
    fetchData()
  } catch (e) {
    showError(e?.response?.data?.message || 'Gagal melakukan aksi')
  } finally {
    actionLoading.value = false
  }
}

function confirmDelete(item) {
  currentItem.value = item
  showDeleteModal.value = true
}

async function doDelete() {
  actionLoading.value = true
  try {
    await permissionLetterService.delete(currentItem.value.id)
    success('Surat izin berhasil dihapus')
    showDeleteModal.value = false
    fetchData()
  } catch (e) {
    showError(e?.response?.data?.message || 'Gagal menghapus data')
  } finally {
    actionLoading.value = false
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(val) {
  if (!val) return '-'
  return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime(val) {
  if (!val) return '-'
  return new Date(val).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function statusBadgeClass(status) {
  const map = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-200 text-gray-600',
    FINISHED: 'bg-blue-100 text-blue-700'
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}

function statusDotClass(status) {
  const map = {
    DRAFT: 'bg-gray-400',
    PENDING: 'bg-amber-500',
    APPROVED: 'bg-green-500',
    REJECTED: 'bg-red-500',
    CANCELLED: 'bg-gray-500',
    FINISHED: 'bg-blue-500'
  }
  return map[status] || 'bg-gray-400'
}

// ─── PDF Print ────────────────────────────────────────────────────────────────
/**
 * mode: 'preview' → open in new tab
 *       'download' → trigger file download
 *       'print'    → open in new tab and trigger browser print dialog
 */
async function handlePrint(item, mode = 'preview') {
  if (!item?.id) return
  printLoadingId.value = item.id
  printMode.value = mode
  try {
    // The axios interceptor in api.js returns response.data directly.
    // When responseType:'blob', response.data is already a Blob — use it directly.
    const blob = await permissionLetterService.printPdf(item.id)
    const url = URL.createObjectURL(blob)

    if (mode === 'download') {
      const code = item.code || item.id
      const safeName = `surat-izin-${code}.pdf`.replace(/\//g, '-').replace(/\s+/g, '_')
      const a = document.createElement('a')
      a.href = url
      a.download = safeName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } else if (mode === 'print') {
      const win = window.open(url, '_blank')
      if (win) {
        win.addEventListener('load', () => {
          win.focus()
          win.print()
        })
      }
    } else {
      // preview – open in new tab
      window.open(url, '_blank')
    }
  } catch (e) {
    showError('Gagal memuat PDF. Pastikan data surat sudah lengkap.')
  } finally {
    printLoadingId.value = null
    printMode.value = ''
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(() => {
  fetchData()
  fetchTeachers()
})
</script>
