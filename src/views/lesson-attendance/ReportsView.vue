<template>
  <div class="space-y-4">
    <!-- Breadcrumb & Header -->
    <div>
      <nav class="text-xs text-gray-500 mb-1">
        <router-link to="/dashboard" class="hover:text-primary">Beranda</router-link>
        <span class="mx-1.5">/</span>
        <span>Presensi Jam Pelajaran</span>
        <span class="mx-1.5">/</span>
        <span class="text-gray-800 font-medium">Laporan Presensi</span>
      </nav>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Laporan Presensi Jam Pelajaran</h1>
          <p class="text-sm text-gray-600">Rekapitulasi dan detail transaksi presensi per jam pelajaran (tidak termasuk transaksi yang dibatalkan).</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-if="canExportExcel"
            type="button"
            @click="handleExport('excel')"
            :disabled="exportingExcel || loading"
            class="px-3 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {{ exportingExcel ? 'Mengunduh Excel...' : 'Export Excel' }}
          </button>
          <button
            v-if="canExportPdf"
            type="button"
            @click="handleExport('pdf')"
            :disabled="exportingPdf || loading"
            class="px-3 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {{ exportingPdf ? 'Mengunduh PDF...' : 'Export PDF' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Mode Tabs -->
    <div class="bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm inline-flex flex-wrap gap-1">
      <button
        v-for="tab in reportTabs"
        :key="tab.key"
        type="button"
        @click="switchMode(tab.key)"
        class="px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors"
        :class="activeMode === tab.key ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Global Report Filters -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Tahun Ajaran</label>
          <select v-model="draftFilters.academic_year_id" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option v-for="y in lookups.academic_years" :key="y.id" :value="y.id">{{ y.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Tanggal Mulai</label>
          <input v-model="draftFilters.date_from" type="date" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Tanggal Selesai</label>
          <input v-model="draftFilters.date_to" type="date" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Tingkat</label>
          <select v-model="draftFilters.grade_id" @change="draftFilters.class_id = ''" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua Tingkat</option>
            <option v-for="g in lookups.grades" :key="g.id" :value="g.id">{{ g.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Jurusan</label>
          <select v-model="draftFilters.department_id" @change="draftFilters.class_id = ''" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua Jurusan</option>
            <option v-for="d in lookups.departments" :key="d.id" :value="d.id">{{ d.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Kelas</label>
          <select v-model="draftFilters.class_id" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua Kelas</option>
            <option v-for="c in filteredClasses" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div v-if="activeMode === 'student' || activeMode === 'detail'">
          <label class="block text-xs font-medium text-gray-600 mb-1">Siswa (Cari)</label>
          <select v-model="draftFilters.student_id" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua Siswa</option>
            <option v-for="st in studentOptions" :key="st.id" :value="st.id">
              {{ st.full_name }} ({{ st.nis || '-' }})
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Guru</label>
          <select v-model="draftFilters.teacher_id" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua Guru</option>
            <option v-for="t in lookups.teachers" :key="t.id" :value="t.id">{{ t.full_name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Mata Pelajaran</label>
          <select v-model="draftFilters.subject_id" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua Mapel</option>
            <option v-for="s in lookups.subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Jam Pelajaran</label>
          <select v-model="draftFilters.period_number" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua Jam</option>
            <option v-for="p in lookups.lesson_periods" :key="p.id" :value="p.period_number">Jam ke-{{ p.period_number }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Metode Input</label>
          <select v-model="draftFilters.input_method" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua</option>
            <option value="QR">QR Code</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 pt-1">
        <button type="button" @click="applyReportFilters" class="px-4 py-1.5 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90">
          Tampilkan Laporan
        </button>
        <button type="button" @click="resetFilters" class="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
          Reset Filter
        </button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
      {{ errorMsg }}
    </div>

    <!-- Report Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <!-- Mode 1: Rekap Per Kelas -->
        <table v-if="activeMode === 'class'" class="min-w-full divide-y divide-gray-200 text-xs">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2.5 text-center w-10">No</th>
              <th class="px-3 py-2.5 text-left">Kelas</th>
              <th class="px-3 py-2.5 text-right">Sesi Tercatat</th>
              <th class="px-3 py-2.5 text-right">Total Record</th>
              <th class="px-3 py-2.5 text-right text-emerald-700">H</th>
              <th class="px-3 py-2.5 text-right text-amber-700">T</th>
              <th class="px-3 py-2.5 text-right text-blue-700">I</th>
              <th class="px-3 py-2.5 text-right text-orange-700">S</th>
              <th class="px-3 py-2.5 text-right text-red-700">A</th>
              <th class="px-3 py-2.5 text-right">Kehadiran %</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-if="loading"><td colspan="10" class="px-4 py-8 text-center text-gray-500">Memuat laporan...</td></tr>
            <tr v-else-if="rows.length === 0"><td colspan="10" class="px-4 py-8 text-center text-gray-500">Tidak ada data presensi pada periode ini.</td></tr>
            <tr v-else v-for="(r, i) in rows" :key="r.class_id" class="hover:bg-gray-50">
              <td class="px-3 py-2 text-center text-gray-500">{{ i + 1 }}</td>
              <td class="px-3 py-2 font-semibold text-gray-900">{{ r.class_name }}</td>
              <td class="px-3 py-2 text-right">{{ r.sessions_count }}</td>
              <td class="px-3 py-2 text-right">{{ r.total_records }}</td>
              <td class="px-3 py-2 text-right text-emerald-700">{{ r.hadir }}</td>
              <td class="px-3 py-2 text-right text-amber-700">{{ r.terlambat }}</td>
              <td class="px-3 py-2 text-right text-blue-700">{{ r.izin }}</td>
              <td class="px-3 py-2 text-right text-orange-700">{{ r.sakit }}</td>
              <td class="px-3 py-2 text-right text-red-700">{{ r.alpa }}</td>
              <td class="px-3 py-2 text-right font-semibold">{{ formatPct(r.attendance_percentage) }}</td>
            </tr>
          </tbody>
          <tfoot v-if="!loading && rows.length > 0 && grandTotal" class="bg-gray-100 font-bold text-xs">
            <tr>
              <td colspan="2" class="px-3 py-2.5 text-right">TOTAL KESELURUHAN</td>
              <td class="px-3 py-2.5 text-right">{{ grandTotal.sessions_count }}</td>
              <td class="px-3 py-2.5 text-right">{{ grandTotal.total_records }}</td>
              <td class="px-3 py-2.5 text-right text-emerald-800">{{ grandTotal.hadir }}</td>
              <td class="px-3 py-2.5 text-right text-amber-800">{{ grandTotal.terlambat }}</td>
              <td class="px-3 py-2.5 text-right text-blue-800">{{ grandTotal.izin }}</td>
              <td class="px-3 py-2.5 text-right text-orange-800">{{ grandTotal.sakit }}</td>
              <td class="px-3 py-2.5 text-right text-red-800">{{ grandTotal.alpa }}</td>
              <td class="px-3 py-2.5 text-right">{{ formatPct(grandTotal.attendance_percentage) }}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Mode 2: Rekap Per Siswa -->
        <table v-else-if="activeMode === 'student'" class="min-w-full divide-y divide-gray-200 text-xs">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2.5 text-center w-10">No</th>
              <th class="px-3 py-2.5 text-left">NIS</th>
              <th class="px-3 py-2.5 text-left">Nama Siswa</th>
              <th class="px-3 py-2.5 text-left">Kelas Tercatat</th>
              <th class="px-3 py-2.5 text-right">Total Jam</th>
              <th class="px-3 py-2.5 text-right text-emerald-700">H</th>
              <th class="px-3 py-2.5 text-right text-amber-700">T</th>
              <th class="px-3 py-2.5 text-right text-blue-700">I</th>
              <th class="px-3 py-2.5 text-right text-orange-700">S</th>
              <th class="px-3 py-2.5 text-right text-red-700">A</th>
              <th class="px-3 py-2.5 text-right">Kehadiran %</th>
              <th class="px-3 py-2.5 text-center">Detail</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-if="loading"><td colspan="12" class="px-4 py-8 text-center text-gray-500">Memuat laporan...</td></tr>
            <tr v-else-if="rows.length === 0"><td colspan="12" class="px-4 py-8 text-center text-gray-500">Tidak ada data presensi pada periode ini.</td></tr>
            <tr v-else v-for="(r, i) in rows" :key="`${r.student_id}-${r.class_id}`" class="hover:bg-gray-50">
              <td class="px-3 py-2 text-center text-gray-500">{{ i + 1 }}</td>
              <td class="px-3 py-2 font-mono text-gray-700">{{ r.nis || '-' }}</td>
              <td class="px-3 py-2 font-medium text-gray-900">
                {{ r.student_name }}
                <span v-if="r.student_status && r.student_status !== 'ACTIVE'" class="ml-1 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                  {{ r.student_status }}
                </span>
              </td>
              <td class="px-3 py-2 text-gray-800">{{ r.class_name }}</td>
              <td class="px-3 py-2 text-right font-medium">{{ r.total_periods }}</td>
              <td class="px-3 py-2 text-right text-emerald-700">{{ r.hadir }}</td>
              <td class="px-3 py-2 text-right text-amber-700">{{ r.terlambat }}</td>
              <td class="px-3 py-2 text-right text-blue-700">{{ r.izin }}</td>
              <td class="px-3 py-2 text-right text-orange-700">{{ r.sakit }}</td>
              <td class="px-3 py-2 text-right text-red-700">{{ r.alpa }}</td>
              <td class="px-3 py-2 text-right font-semibold">{{ formatPct(r.attendance_percentage) }}</td>
              <td class="px-3 py-2 text-center">
                <button type="button" @click="openStudentDrilldown(r)" class="px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20">
                  Riwayat
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Mode 3: Rekap Per Guru -->
        <table v-else-if="activeMode === 'teacher'" class="min-w-full divide-y divide-gray-200 text-xs">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2.5 text-center w-10">No</th>
              <th class="px-3 py-2.5 text-left">Guru</th>
              <th class="px-3 py-2.5 text-right">Jumlah Kelas</th>
              <th class="px-3 py-2.5 text-right">Jumlah Mapel</th>
              <th class="px-3 py-2.5 text-right">Sesi Tercatat</th>
              <th class="px-3 py-2.5 text-right text-blue-700">Via QR</th>
              <th class="px-3 py-2.5 text-right text-purple-700">Via Admin</th>
              <th class="px-3 py-2.5 text-right">Total Record Siswa</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-if="loading"><td colspan="8" class="px-4 py-8 text-center text-gray-500">Memuat laporan...</td></tr>
            <tr v-else-if="rows.length === 0"><td colspan="8" class="px-4 py-8 text-center text-gray-500">Tidak ada data presensi pada periode ini.</td></tr>
            <tr v-else v-for="(r, i) in rows" :key="r.teacher_id" class="hover:bg-gray-50">
              <td class="px-3 py-2 text-center text-gray-500">{{ i + 1 }}</td>
              <td class="px-3 py-2 font-semibold text-gray-900">{{ r.teacher_name }}</td>
              <td class="px-3 py-2 text-right">{{ r.classes_count }}</td>
              <td class="px-3 py-2 text-right">{{ r.subjects_count }}</td>
              <td class="px-3 py-2 text-right font-semibold">{{ r.sessions_count }}</td>
              <td class="px-3 py-2 text-right text-blue-700">{{ r.qr_sessions }}</td>
              <td class="px-3 py-2 text-right text-purple-700">{{ r.admin_sessions }}</td>
              <td class="px-3 py-2 text-right">{{ r.total_records }}</td>
            </tr>
          </tbody>
          <tfoot v-if="!loading && rows.length > 0 && grandTotal" class="bg-gray-100 font-bold text-xs">
            <tr>
              <td colspan="4" class="px-3 py-2.5 text-right">TOTAL KESELURUHAN</td>
              <td class="px-3 py-2.5 text-right">{{ grandTotal.sessions_count }}</td>
              <td class="px-3 py-2.5 text-right text-blue-800">{{ grandTotal.qr_sessions }}</td>
              <td class="px-3 py-2.5 text-right text-purple-800">{{ grandTotal.admin_sessions }}</td>
              <td class="px-3 py-2.5 text-right">{{ grandTotal.total_records }}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Mode 4: Rekap Per Mata Pelajaran -->
        <table v-else-if="activeMode === 'subject'" class="min-w-full divide-y divide-gray-200 text-xs">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2.5 text-center w-10">No</th>
              <th class="px-3 py-2.5 text-left">Mata Pelajaran</th>
              <th class="px-3 py-2.5 text-right">Jumlah Kelas</th>
              <th class="px-3 py-2.5 text-right">Sesi Tercatat</th>
              <th class="px-3 py-2.5 text-right">Total Record</th>
              <th class="px-3 py-2.5 text-right text-emerald-700">H</th>
              <th class="px-3 py-2.5 text-right text-amber-700">T</th>
              <th class="px-3 py-2.5 text-right text-blue-700">I</th>
              <th class="px-3 py-2.5 text-right text-orange-700">S</th>
              <th class="px-3 py-2.5 text-right text-red-700">A</th>
              <th class="px-3 py-2.5 text-right">Kehadiran %</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-if="loading"><td colspan="11" class="px-4 py-8 text-center text-gray-500">Memuat laporan...</td></tr>
            <tr v-else-if="rows.length === 0"><td colspan="11" class="px-4 py-8 text-center text-gray-500">Tidak ada data presensi pada periode ini.</td></tr>
            <tr v-else v-for="(r, i) in rows" :key="r.subject_id" class="hover:bg-gray-50">
              <td class="px-3 py-2 text-center text-gray-500">{{ i + 1 }}</td>
              <td class="px-3 py-2 font-semibold text-gray-900">{{ r.subject_name }}</td>
              <td class="px-3 py-2 text-right">{{ r.classes_count }}</td>
              <td class="px-3 py-2 text-right">{{ r.sessions_count }}</td>
              <td class="px-3 py-2 text-right">{{ r.total_records }}</td>
              <td class="px-3 py-2 text-right text-emerald-700">{{ r.hadir }}</td>
              <td class="px-3 py-2 text-right text-amber-700">{{ r.terlambat }}</td>
              <td class="px-3 py-2 text-right text-blue-700">{{ r.izin }}</td>
              <td class="px-3 py-2 text-right text-orange-700">{{ r.sakit }}</td>
              <td class="px-3 py-2 text-right text-red-700">{{ r.alpa }}</td>
              <td class="px-3 py-2 text-right font-semibold">{{ formatPct(r.attendance_percentage) }}</td>
            </tr>
          </tbody>
          <tfoot v-if="!loading && rows.length > 0 && grandTotal" class="bg-gray-100 font-bold text-xs">
            <tr>
              <td colspan="3" class="px-3 py-2.5 text-right">TOTAL KESELURUHAN</td>
              <td class="px-3 py-2.5 text-right">{{ grandTotal.sessions_count }}</td>
              <td class="px-3 py-2.5 text-right">{{ grandTotal.total_records }}</td>
              <td class="px-3 py-2.5 text-right text-emerald-800">{{ grandTotal.hadir }}</td>
              <td class="px-3 py-2.5 text-right text-amber-800">{{ grandTotal.terlambat }}</td>
              <td class="px-3 py-2.5 text-right text-blue-800">{{ grandTotal.izin }}</td>
              <td class="px-3 py-2.5 text-right text-orange-800">{{ grandTotal.sakit }}</td>
              <td class="px-3 py-2.5 text-right text-red-800">{{ grandTotal.alpa }}</td>
              <td class="px-3 py-2.5 text-right">{{ formatPct(grandTotal.attendance_percentage) }}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Mode 5: Detail Transaksi -->
        <table v-else class="min-w-full divide-y divide-gray-200 text-xs">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2.5 text-left">Tanggal</th>
              <th class="px-3 py-2.5 text-left">Kelas</th>
              <th class="px-3 py-2.5 text-center">Jam</th>
              <th class="px-3 py-2.5 text-left">Mata Pelajaran</th>
              <th class="px-3 py-2.5 text-left">Guru</th>
              <th class="px-3 py-2.5 text-left">NIS</th>
              <th class="px-3 py-2.5 text-left">Nama Siswa</th>
              <th class="px-3 py-2.5 text-center">Status</th>
              <th class="px-3 py-2.5 text-left">Catatan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-if="loading"><td colspan="9" class="px-4 py-8 text-center text-gray-500">Memuat detail transaksi...</td></tr>
            <tr v-else-if="rows.length === 0"><td colspan="9" class="px-4 py-8 text-center text-gray-500">Tidak ada detail transaksi pada periode ini.</td></tr>
            <tr v-else v-for="r in rows" :key="r.id" class="hover:bg-gray-50">
              <td class="px-3 py-2 whitespace-nowrap">{{ formatDate(r.attendance_date) }}</td>
              <td class="px-3 py-2 whitespace-nowrap font-medium">{{ r.class_name }}</td>
              <td class="px-3 py-2 text-center">J{{ r.period_number }}</td>
              <td class="px-3 py-2">{{ r.subject_name }}</td>
              <td class="px-3 py-2">{{ r.teacher_name }}</td>
              <td class="px-3 py-2 font-mono">{{ r.nis || '-' }}</td>
              <td class="px-3 py-2 font-medium">{{ r.student_name }}</td>
              <td class="px-3 py-2 text-center">
                <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold" :class="statusBadgeClass(r.status)">
                  {{ r.status }}
                </span>
              </td>
              <td class="px-3 py-2 text-gray-600">{{ r.notes || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination for Detail mode -->
      <div v-if="activeMode === 'detail' && detailPagination.total > 0" class="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
        <div>
          Halaman <strong>{{ detailPagination.page }}</strong> dari <strong>{{ detailPagination.total_pages }}</strong> (Total {{ detailPagination.total }} record)
        </div>
        <div class="flex gap-2">
          <button type="button" @click="changeDetailPage(detailPagination.page - 1)" :disabled="detailPagination.page <= 1" class="px-3 py-1 border border-gray-300 rounded bg-white disabled:opacity-50">
            Sebelumnya
          </button>
          <button type="button" @click="changeDetailPage(detailPagination.page + 1)" :disabled="detailPagination.page >= detailPagination.total_pages" class="px-3 py-1 border border-gray-300 rounded bg-white disabled:opacity-50">
            Berikutnya
          </button>
        </div>
      </div>
    </div>

    <!-- Student Drilldown Modal -->
    <BaseModal v-model="drilldownOpen" maxWidth="4xl" :title="drilldownTitle">
      <div v-if="drilldownLoading" class="py-10 text-center text-sm text-gray-500">Memuat riwayat presensi siswa...</div>
      <div v-else-if="drilldownData" class="space-y-3">
        <div class="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
          Siswa: <strong>{{ drilldownData.student?.full_name }}</strong> ({{ drilldownData.student?.nis || '-' }}) —
          Total {{ drilldownData.records?.length || 0 }} jam tercatat pada periode {{ formatDate(appliedFilters.date_from) }} s.d. {{ formatDate(appliedFilters.date_to) }}
        </div>
        <div class="overflow-x-auto border border-gray-200 rounded-lg max-h-96">
          <table class="min-w-full divide-y divide-gray-200 text-xs">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-3 py-2 text-left">Tanggal</th>
                <th class="px-3 py-2 text-left">Kelas</th>
                <th class="px-3 py-2 text-center">Jam</th>
                <th class="px-3 py-2 text-left">Mata Pelajaran</th>
                <th class="px-3 py-2 text-left">Guru</th>
                <th class="px-3 py-2 text-center">Status</th>
                <th class="px-3 py-2 text-left">Catatan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="rec in drilldownData.records" :key="rec.id" class="hover:bg-gray-50">
                <td class="px-3 py-2 whitespace-nowrap">{{ formatDate(rec.attendance_date) }}</td>
                <td class="px-3 py-2 whitespace-nowrap font-medium">{{ rec.class_name }}</td>
                <td class="px-3 py-2 text-center">J{{ rec.period_number }}</td>
                <td class="px-3 py-2">{{ rec.subject_name }}</td>
                <td class="px-3 py-2">{{ rec.teacher_name }}</td>
                <td class="px-3 py-2 text-center">
                  <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold" :class="statusBadgeClass(rec.status)">{{ rec.status }}</span>
                </td>
                <td class="px-3 py-2 text-gray-600">{{ rec.notes || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import lessonAttendanceService from '@/services/api/lessonAttendance.service'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BaseModal from '@/components/modals/BaseModal.vue'

const authStore = useAuthStore()
const toast = useToast()

const canExportExcel = computed(() => authStore.hasPermission('lesson_attendance.report.export_excel'))
const canExportPdf = computed(() => authStore.hasPermission('lesson_attendance.report.export_pdf'))

const reportTabs = [
  { key: 'class', label: 'Rekap Per Kelas' },
  { key: 'student', label: 'Rekap Per Siswa' },
  { key: 'teacher', label: 'Rekap Per Guru' },
  { key: 'subject', label: 'Rekap Per Mata Pelajaran' },
  { key: 'detail', label: 'Detail Transaksi' }
]

const activeMode = ref('class')
const lookups = ref({ academic_years: [], grades: [], departments: [], classes: [], teachers: [], subjects: [], lesson_periods: [], server_date: '' })
const studentOptions = ref([])

const draftFilters = reactive({
  academic_year_id: '',
  date_from: '',
  date_to: '',
  grade_id: '',
  department_id: '',
  class_id: '',
  student_id: '',
  teacher_id: '',
  subject_id: '',
  period_number: '',
  input_method: ''
})

const appliedFilters = ref({})
const detailPage = ref(1)
const detailPagination = ref({ page: 1, limit: 25, total: 0, total_pages: 1 })

const loading = ref(true)
const exportingExcel = ref(false)
const exportingPdf = ref(false)
const errorMsg = ref('')
const rows = ref([])
const grandTotal = ref(null)

const drilldownOpen = ref(false)
const drilldownLoading = ref(false)
const drilldownData = ref(null)
const drilldownTitle = computed(() => drilldownData.value?.student ? `Riwayat Presensi — ${drilldownData.value.student.full_name}` : 'Riwayat Presensi Siswa')

const filteredClasses = computed(() => {
  return (lookups.value.classes || []).filter((c) => {
    if (draftFilters.grade_id && Number(c.grade_id) !== Number(draftFilters.grade_id)) return false
    if (draftFilters.department_id && Number(c.department_id) !== Number(draftFilters.department_id)) return false
    return true
  })
})

const buildCleanParams = (src, includePage = false) => {
  const params = {}
  Object.entries(src).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) params[k] = v
  })
  if (includePage) {
    params.page = detailPage.value
    params.limit = 25
  }
  return params
}

const fetchReport = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const params = buildCleanParams(appliedFilters.value, activeMode.value === 'detail')
    if (activeMode.value === 'class') {
      const res = await lessonAttendanceService.getClassReport(params)
      const data = res.data?.data || res.data
      rows.value = data.rows || []
      grandTotal.value = data.grand_total || null
    } else if (activeMode.value === 'student') {
      const res = await lessonAttendanceService.getStudentReport(params)
      const data = res.data?.data || res.data
      rows.value = data.rows || []
      grandTotal.value = data.grand_total || null
    } else if (activeMode.value === 'teacher') {
      const res = await lessonAttendanceService.getTeacherReport(params)
      const data = res.data?.data || res.data
      rows.value = data.rows || []
      grandTotal.value = data.grand_total || null
    } else if (activeMode.value === 'subject') {
      const res = await lessonAttendanceService.getSubjectReport(params)
      const data = res.data?.data || res.data
      rows.value = data.rows || []
      grandTotal.value = data.grand_total || null
    } else {
      const res = await lessonAttendanceService.getDetailReport(params)
      rows.value = res.data?.data || []
      detailPagination.value = res.data?.pagination || { page: 1, limit: 25, total: 0, total_pages: 1 }
      grandTotal.value = null
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal memuat laporan presensi.'
    toast.error(errorMsg.value)
  } finally {
    loading.value = false
  }
}

const switchMode = (mode) => {
  activeMode.value = mode
  detailPage.value = 1
  fetchReport()
}

const applyReportFilters = () => {
  appliedFilters.value = { ...draftFilters }
  detailPage.value = 1
  fetchReport()
}

const resetFilters = () => {
  const today = lookups.value.server_date
  draftFilters.academic_year_id = lookups.value.active_academic_year?.id || ''
  draftFilters.date_from = today ? `${today.slice(0, 7)}-01` : ''
  draftFilters.date_to = today
  draftFilters.grade_id = ''
  draftFilters.department_id = ''
  draftFilters.class_id = ''
  draftFilters.student_id = ''
  draftFilters.teacher_id = ''
  draftFilters.subject_id = ''
  draftFilters.period_number = ''
  draftFilters.input_method = ''
  appliedFilters.value = { ...draftFilters }
  detailPage.value = 1
  fetchReport()
}

const changeDetailPage = (p) => {
  if (p < 1 || p > detailPagination.value.total_pages) return
  detailPage.value = p
  fetchReport()
}

const openStudentDrilldown = async (row) => {
  drilldownOpen.value = true
  drilldownLoading.value = true
  drilldownData.value = null
  try {
    const params = buildCleanParams(appliedFilters.value)
    const res = await lessonAttendanceService.getStudentReportDetail(row.student_id, params)
    drilldownData.value = res.data?.data || res.data
  } catch (err) {
    toast.error(err.response?.data?.message || 'Gagal memuat riwayat siswa.')
    drilldownOpen.value = false
  } finally {
    drilldownLoading.value = false
  }
}

const handleExport = async (type) => {
  const isExcel = type === 'excel'
  if (isExcel) exportingExcel.value = true
  else exportingPdf.value = true

  try {
    const params = {
      ...buildCleanParams(appliedFilters.value),
      mode: activeMode.value
    }
    const res = isExcel
      ? await lessonAttendanceService.exportExcel(params)
      : await lessonAttendanceService.exportPdf(params)

    const disposition = res.headers['content-disposition'] || ''
    const match = disposition.match(/filename="?([^"]+)"?/i)
    const fallbackName = `Presensi-Jam-Pelajaran-${activeMode.value}.${isExcel ? 'xlsx' : 'pdf'}`
    const filename = match?.[1] || fallbackName

    const blob = new Blob([res.data], { type: res.headers['content-type'] })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
    toast.success(`Export ${isExcel ? 'Excel' : 'PDF'} berhasil diunduh.`)
  } catch (err) {
    let msg = `Gagal export ${isExcel ? 'Excel' : 'PDF'}.`
    if (err.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text()
        const json = JSON.parse(text)
        if (json.message) msg = json.message
      } catch {}
    } else if (err.response?.data?.message) {
      msg = err.response.data.message
    }
    toast.error(msg)
  } finally {
    exportingExcel.value = false
    exportingPdf.value = false
  }
}

const formatDate = (val) => {
  if (!val) return '-'
  return new Date(`${String(val).slice(0, 10)}T00:00:00`).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

const formatPct = (pct) => (pct === null || pct === undefined ? '-' : `${Number(pct).toFixed(2)}%`)

const statusBadgeClass = (st) => ({
  HADIR: 'bg-emerald-100 text-emerald-800',
  TERLAMBAT: 'bg-amber-100 text-amber-800',
  IZIN: 'bg-blue-100 text-blue-800',
  SAKIT: 'bg-orange-100 text-orange-800',
  ALPA: 'bg-red-100 text-red-800'
}[st] || 'bg-gray-100 text-gray-800')

onMounted(async () => {
  try {
    const res = await lessonAttendanceService.getLookups()
    lookups.value = res.data?.data || res.data
    const today = lookups.value.server_date
    draftFilters.academic_year_id = lookups.value.active_academic_year?.id || ''
    draftFilters.date_from = today ? `${today.slice(0, 7)}-01` : ''
    draftFilters.date_to = today
    appliedFilters.value = { ...draftFilters }

    const [stRes] = await Promise.all([
      lessonAttendanceService.getStudentLookup({ academic_year_id: draftFilters.academic_year_id, limit: 100 }),
      fetchReport()
    ])
    studentOptions.value = stRes.data?.data || []
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal memuat halaman laporan.'
    loading.value = false
  }
})
</script>
