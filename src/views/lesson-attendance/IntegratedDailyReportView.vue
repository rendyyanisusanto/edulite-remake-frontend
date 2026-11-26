<template>
  <div class="space-y-4">
    <!-- Breadcrumb & Header -->
    <div>
      <nav class="text-xs text-gray-500 mb-1">
        <router-link to="/dashboard" class="hover:text-primary">Beranda</router-link>
        <span class="mx-1.5">/</span>
        <span>Presensi Jam Pelajaran</span>
        <span class="mx-1.5">/</span>
        <span class="text-gray-800 font-medium">Laporan Harian Terpadu</span>
      </nav>
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Laporan Harian Terpadu</h1>
          <p class="text-sm text-gray-600 max-w-3xl">Pantau presensi gerbang, Tahfidz, dan jam pelajaran seluruh siswa dalam satu kelas serta identifikasi potensi pelanggaran berdasarkan data presensi harian.</p>
        </div>
        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <button v-if="canExportExcel" type="button" @click="handleExport('excel')" :disabled="!canExport || exportingExcel"
            class="px-3 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
            {{ exportingExcel ? 'Mengunduh Excel...' : 'Excel' }}
          </button>
          <button v-if="canExportPdf" type="button" @click="handleExport('pdf')" :disabled="!canExport || exportingPdf"
            class="px-3 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
            {{ exportingPdf ? 'Menyiapkan PDF...' : 'Cetak PDF' }}
          </button>
        </div>
      </div>
      <p class="text-[11px] text-gray-500 mt-1 sm:text-right">Export mencakup seluruh siswa dalam kelas yang dipilih.</p>
    </div>

    <!-- Filter -->
    <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-200 space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Tahun Ajaran</label>
          <select v-model="draft.academic_year_id" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option v-for="y in lookups.academic_years" :key="y.id" :value="y.id">{{ y.name }} {{ y.is_active ? '(Aktif)' : '' }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Tanggal</label>
          <input v-model="draft.attendance_date" type="date" :min="selectedYear?.start_date || undefined" :max="maxDate"
            class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Tingkat</label>
          <select v-model="draft.grade_id" @change="draft.class_id = ''" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua Tingkat</option>
            <option v-for="g in lookups.grades" :key="g.id" :value="g.id">{{ g.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Jurusan</label>
          <select v-model="draft.department_id" @change="draft.class_id = ''" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Semua Jurusan</option>
            <option v-for="d in lookups.departments" :key="d.id" :value="d.id">{{ d.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Kelas <span class="text-red-600">*</span></label>
          <select v-model="draft.class_id" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option value="">Pilih kelas...</option>
            <option v-for="c in filteredClasses" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button type="button" @click="applyFilters" :disabled="loading"
          class="px-4 py-1.5 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50">Tampilkan Laporan</button>
        <button type="button" @click="refresh" :disabled="!report || loading || refreshing"
          class="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50">
          {{ refreshing ? 'Menyegarkan...' : 'Refresh' }}
        </button>
        <button type="button" @click="resetFilters" class="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Reset</button>
        <span v-if="formError" class="text-xs text-red-600">{{ formError }}</span>
        <span v-if="report" class="ml-auto text-[11px] text-gray-500">Dihasilkan: {{ formatDateTime(report.generated_at) }}</span>
      </div>
    </div>

    <!-- Error / Permission -->
    <div v-if="errorMsg" class="p-4 border rounded-xl text-sm" :class="forbidden ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-700'">
      {{ errorMsg }}
    </div>

    <!-- Empty: no class selected -->
    <div v-if="!report && !loading && !errorMsg" class="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-sm text-gray-500">
      Pilih tanggal dan kelas, lalu klik <strong>Tampilkan Laporan</strong>.
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="bg-white rounded-xl border border-gray-200 p-6 space-y-3 animate-pulse">
      <div v-for="i in 8" :key="i" class="h-6 bg-gray-100 rounded"></div>
    </div>

    <template v-if="report && !loading">
      <!-- Class info -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
        <div><span class="text-gray-500 block">Kelas</span><strong class="text-sm">{{ report.class.name }}</strong></div>
        <div><span class="text-gray-500 block">Tingkat</span><strong>{{ report.class.grade_name || '-' }}</strong></div>
        <div><span class="text-gray-500 block">Jurusan</span><strong>{{ report.class.department_name || '-' }}</strong></div>
        <div><span class="text-gray-500 block">Tahun Ajaran</span><strong>{{ report.academic_year.name }}</strong></div>
        <div>
          <span class="text-gray-500 block">Wali Kelas</span>
          <strong>{{ report.class.homeroom_teacher_name || '-' }}</strong>
          <span v-if="report.is_historical_mode" class="block text-[10px] text-amber-700">wali kelas saat ini</span>
        </div>
        <div><span class="text-gray-500 block">Jumlah Siswa</span><strong>{{ report.class.student_count }}</strong></div>
        <div><span class="text-gray-500 block">Tanggal</span><strong>{{ formatDate(report.report_date) }}</strong></div>
      </div>

      <div v-if="report.is_provisional" class="text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2">
        Laporan sementara — kegiatan sekolah masih berlangsung.
      </div>

      <!-- Summary -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-3 py-2 flex flex-wrap items-stretch divide-x divide-gray-200">
        <div v-for="item in summaryItems" :key="item.label" class="px-3 py-1 min-w-[110px]">
          <div class="text-[11px] text-gray-500 leading-tight">{{ item.label }}</div>
          <div class="text-lg font-bold" :class="item.cls">{{ item.value }}</div>
        </div>
      </div>
      <p class="text-[11px] text-gray-500 -mt-2">Siswa memerlukan verifikasi dihitung per siswa (distinct); total temuan: <strong>{{ report.summary.total_findings }}</strong>.</p>

      <!-- Quick filter & search -->
      <div class="flex flex-wrap items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
        <div class="flex flex-wrap items-center gap-1.5">
          <button v-for="chip in quickFilters" :key="chip.key" type="button" @click="quick = chip.key"
            class="px-2.5 py-1 text-xs font-medium rounded-full border transition-colors"
            :class="quick === chip.key ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'">
            {{ chip.label }} <span class="opacity-70">({{ chip.count }})</span>
          </button>
        </div>
        <input v-model="search" type="text" maxlength="100" placeholder="Cari nama atau NIS..." class="px-2.5 py-1.5 text-xs border border-gray-300 rounded-md w-52" />
      </div>
      <div class="text-[11px] text-gray-500 -mt-2">Quick filter dan pencarian hanya membantu pemeriksaan di halaman ini. Menampilkan <strong>{{ visibleStudents.length }}</strong> dari {{ report.students.length }} siswa.</div>

      <!-- Matrix -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div v-if="report.students.length === 0" class="p-10 text-center text-sm text-gray-500">
          Tidak ada siswa pada kelas ini untuk tanggal yang dipilih.
        </div>
        <div v-else-if="visibleStudents.length === 0" class="p-10 text-center text-sm text-gray-500">
          Tidak ada siswa yang sesuai dengan filter atau pencarian.
        </div>
        <div v-else class="overflow-auto max-h-[70vh]">
          <table class="min-w-full border-separate border-spacing-0 text-xs">
            <thead>
              <tr>
                <th rowspan="2" class="sticky top-0 left-0 z-40 bg-gray-100 px-2 py-1 border-b border-r border-gray-300 w-10 min-w-[40px]">No</th>
                <th rowspan="2" class="sticky top-0 left-10 z-40 bg-gray-100 px-2 py-1 border-b border-r border-gray-300 w-24 min-w-[96px] text-left">NIS</th>
                <th rowspan="2" class="sticky top-0 left-[136px] z-40 bg-gray-100 px-3 py-1 border-b border-r border-gray-300 min-w-[190px] text-left">Nama Siswa</th>
                <th colspan="2" class="sticky top-0 z-30 bg-gray-100 px-2 py-1 border-b border-r border-gray-300 h-7">Presensi Gerbang</th>
                <th class="sticky top-0 z-30 bg-gray-100 px-2 py-1 border-b border-r border-gray-300">Tahfidz</th>
                <th v-if="report.periods.length" :colspan="report.periods.length" class="sticky top-0 z-30 bg-gray-100 px-2 py-1 border-b border-r border-gray-300">Presensi Jam Pelajaran</th>
                <th colspan="5" class="sticky top-0 z-30 bg-gray-100 px-2 py-1 border-b border-r border-gray-300">Rekap Mapel</th>
                <th class="sticky top-0 z-30 bg-gray-100 px-2 py-1 border-b border-gray-300">Temuan</th>
              </tr>
              <tr>
                <th class="sticky top-7 z-30 bg-gray-50 px-2 py-1 border-b border-r border-gray-300 min-w-[68px]">Masuk</th>
                <th class="sticky top-7 z-30 bg-gray-50 px-2 py-1 border-b border-r border-gray-300 min-w-[60px]">Pulang</th>
                <th class="sticky top-7 z-30 bg-gray-50 px-2 py-1 border-b border-r border-gray-300 min-w-[48px]">Status</th>
                <th v-for="p in report.periods" :key="p.period_number" class="sticky top-7 z-30 bg-gray-50 px-1 py-1 border-b border-r border-gray-300 min-w-[40px]"
                  :title="`${p.name} (${p.start_time}–${p.end_time})${p.subject_name ? ' | ' + p.subject_name : ''}`">
                  <div>{{ p.label }}</div><div class="text-[9px] font-normal text-gray-500">{{ p.start_time }}</div>
                </th>
                <th v-for="k in ['H','T','I','S','A']" :key="k" class="sticky top-7 z-30 bg-gray-50 px-1.5 py-1 border-b border-r border-gray-300 w-8" :class="recapHead[k]">{{ k }}</th>
                <th class="sticky top-7 z-30 bg-gray-50 px-2 py-1 border-b border-gray-300 min-w-[70px]">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(st, idx) in visibleStudents" :key="st.student_id" class="group hover:bg-blue-50/40">
                <td class="sticky left-0 z-10 bg-white group-hover:bg-blue-50 px-2 py-1 text-center text-gray-500 border-b border-r border-gray-200">{{ idx + 1 }}</td>
                <td class="sticky left-10 z-10 bg-white group-hover:bg-blue-50 px-2 py-1 font-mono text-gray-600 border-b border-r border-gray-200 whitespace-nowrap">{{ st.nis || '-' }}</td>
                <td class="sticky left-[136px] z-10 bg-white group-hover:bg-blue-50 px-3 py-1 font-medium text-gray-900 border-b border-r border-gray-200 whitespace-nowrap">
                  <button type="button" class="text-left hover:text-primary hover:underline" :disabled="!st.findings.length" @click="openFindings(st)" :title="st.findings.length ? 'Lihat detail temuan' : st.student_name">
                    {{ st.student_name }}
                  </button>
                  <span v-if="st.roster_source === 'HISTORY'" class="ml-1 text-[9px] px-1 bg-amber-100 text-amber-800 rounded" title="Keanggotaan kelas berdasarkan riwayat kelas tanpa transaksi pada tanggal ini">riwayat</span>
                </td>
                <!-- Gate in -->
                <td class="p-0.5 border-b border-r border-gray-200 text-center">
                  <button type="button" class="w-full h-7 rounded font-semibold px-1" :class="statusClass(gateInCode(st))" :title="gateTooltip(st)" @click="openGate(st)">
                    {{ gateInText(st) }}
                  </button>
                </td>
                <td class="p-0.5 border-b border-r border-gray-200 text-center">
                  <button type="button" class="w-full h-7 rounded px-1 text-gray-800 hover:bg-gray-100" :title="gateTooltip(st)" @click="openGate(st)">
                    {{ st.gate.source_error ? '?' : (st.gate.clock_out || '-') }}<span v-if="st.flags.early_departure" class="text-amber-600" title="Pulang lebih awal (potensi)"> ▲</span>
                  </button>
                </td>
                <!-- Tahfidz -->
                <td class="p-0.5 border-b border-r border-gray-200 text-center">
                  <button type="button" class="w-full h-7 rounded font-bold" :class="statusClass(st.tahfidz.display_status)" :title="tahfidzTooltip(st)" @click="openTahfidz(st)">
                    {{ st.tahfidz.display_status }}
                  </button>
                </td>
                <!-- Lessons -->
                <td v-for="c in st.lessons" :key="c.period_number" class="p-0.5 border-b border-r border-gray-200 text-center">
                  <button type="button" class="w-full h-7 rounded font-bold" :class="statusClass(c.display_status)" :title="lessonTooltip(st, c)" @click="openLesson(st, c)">
                    {{ c.display_status }}
                  </button>
                </td>
                <td class="px-1.5 py-1 text-right border-b border-r border-gray-200 text-emerald-700">{{ st.lesson_summary.hadir }}</td>
                <td class="px-1.5 py-1 text-right border-b border-r border-gray-200 text-amber-700">{{ st.lesson_summary.terlambat }}</td>
                <td class="px-1.5 py-1 text-right border-b border-r border-gray-200 text-blue-700">{{ st.lesson_summary.izin }}</td>
                <td class="px-1.5 py-1 text-right border-b border-r border-gray-200 text-purple-700">{{ st.lesson_summary.sakit }}</td>
                <td class="px-1.5 py-1 text-right border-b border-r border-gray-200 font-bold" :class="st.lesson_summary.alpa ? 'text-red-700' : 'text-gray-400'">{{ st.lesson_summary.alpa }}</td>
                <td class="px-2 py-1 text-right border-b border-gray-200 font-semibold" :class="st.finding_count ? 'text-red-700' : 'text-gray-400'">{{ st.finding_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Legend -->
        <div class="px-4 py-2.5 border-t border-gray-200 flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
          <strong>Legenda:</strong>
          <span v-for="l in legend" :key="l.code" class="px-1.5 py-0.5 rounded font-semibold" :class="statusClass(l.code)">{{ l.code }}: {{ l.label }}</span>
          <span class="text-gray-500">(T) pada jam masuk = terlambat · ▲ = pulang lebih awal</span>
        </div>
      </div>

      <!-- Findings -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="px-4 py-3 border-b border-gray-200">
          <h2 class="text-base font-semibold text-gray-900">Daftar Potensi Pelanggaran dan Ketidaksesuaian Presensi</h2>
        </div>
        <div v-if="report.findings_table.length === 0" class="p-6 text-sm text-gray-600">
          Tidak ditemukan potensi pelanggaran atau ketidaksesuaian berdasarkan data presensi yang tersedia.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full text-xs">
            <thead class="bg-gray-50">
              <tr class="text-left text-gray-600">
                <th class="px-3 py-2 w-10">No</th><th class="px-3 py-2 w-24">NIS</th><th class="px-3 py-2 w-48">Nama Siswa</th>
                <th class="px-3 py-2">Potensi Pelanggaran</th><th class="px-3 py-2">Ketidaksesuaian Presensi</th><th class="px-3 py-2">Keterangan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(row, i) in report.findings_table" :key="row.student_id" class="align-top hover:bg-gray-50">
                <td class="px-3 py-2 text-gray-500">{{ i + 1 }}</td>
                <td class="px-3 py-2 font-mono">{{ row.nis || '-' }}</td>
                <td class="px-3 py-2 font-medium">
                  <button type="button" class="text-left hover:text-primary hover:underline" @click="openFindingsById(row.student_id)">{{ row.student_name }}</button>
                </td>
                <td class="px-3 py-2"><ul class="list-disc pl-4 space-y-0.5 text-red-800"><li v-for="(f, k) in row.potential" :key="k">{{ f.description }}</li></ul><span v-if="!row.potential.length" class="text-gray-400">-</span></td>
                <td class="px-3 py-2"><ul class="list-disc pl-4 space-y-0.5 text-amber-800"><li v-for="(f, k) in row.inconsistencies" :key="k">{{ f.description }}</li></ul><span v-if="!row.inconsistencies.length" class="text-gray-400">-</span></td>
                <td class="px-3 py-2 text-gray-600">
                  <ul class="list-disc pl-4 space-y-0.5"><li v-for="(e, k) in rowEvidence(row)" :key="k">{{ e }}</li></ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-4 py-2.5 border-t border-gray-200 text-[11px] text-gray-600 italic">{{ report.disclaimer }}</div>
      </div>

      <!-- Completeness -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 space-y-2">
        <h2 class="text-base font-semibold text-gray-900">Catatan Kelengkapan Data</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5 text-xs text-gray-700">
          <div>Gerbang Masuk : <strong>{{ cnt(report.completeness.gate_entry_records) }} dari {{ report.completeness.total_students }}</strong> siswa memiliki record</div>
          <div>Gerbang Pulang: <strong>{{ cnt(report.completeness.gate_exit_records) }} dari {{ report.completeness.total_students }}</strong> siswa memiliki record</div>
          <div>Tahfidz : <strong>{{ cnt(report.completeness.tahfidz_records) }} dari {{ report.completeness.total_students }}</strong> siswa memiliki record</div>
          <div>Jam Pelajaran: <strong>{{ cnt(report.completeness.lesson_periods_recorded) }} dari {{ report.completeness.lesson_periods_total }}</strong> jam telah tercatat</div>
        </div>
        <ul class="space-y-1 text-xs">
          <li v-for="w in report.warnings" :key="w.code" class="rounded px-2.5 py-1.5 border"
            :class="{ 'bg-red-50 border-red-200 text-red-800': w.level === 'error', 'bg-amber-50 border-amber-200 text-amber-900': w.level === 'warning', 'bg-blue-50 border-blue-200 text-blue-900': w.level === 'info' }">
            {{ w.message }}
          </li>
        </ul>
      </div>
    </template>

    <!-- Cell detail modal -->
    <BaseModal v-model="detailOpen" maxWidth="md" :title="detail?.title || 'Detail Presensi'">
      <div v-if="detail" class="space-y-3 text-xs">
        <div class="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-1">
          <div><span class="text-gray-500">Siswa:</span> <strong>{{ detail.student.student_name }}</strong> ({{ detail.student.nis || '-' }})</div>
          <div><span class="text-gray-500">Tanggal:</span> <strong>{{ formatDate(report.report_date) }}</strong></div>
          <div v-if="detail.type === 'tahfidz'"><span class="text-gray-500">Kelas:</span> <strong>{{ report.class.name }}</strong></div>
        </div>
        <dl class="grid grid-cols-3 gap-x-2 gap-y-1.5">
          <template v-for="row in detail.rows" :key="row[0]">
            <dt class="text-gray-500">{{ row[0] }}</dt><dd class="col-span-2 font-medium text-gray-900 break-words">{{ row[1] || '-' }}</dd>
          </template>
        </dl>
        <p v-if="detail.note" class="p-2.5 bg-gray-100 rounded-lg text-gray-700">{{ detail.note }}</p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <button v-if="detail?.sessionId && canViewSessionData" type="button" @click="openTransaction" class="px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90">Lihat Transaksi</button>
          <button type="button" @click="detailOpen = false" class="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-md">Tutup</button>
        </div>
      </template>
    </BaseModal>

    <!-- Finding detail modal -->
    <BaseModal v-model="findingOpen" maxWidth="lg" title="Detail Temuan Siswa">
      <div v-if="findingStudent" class="space-y-3 text-xs">
        <div class="bg-gray-50 p-3 rounded-lg border border-gray-200 grid grid-cols-2 gap-1">
          <div><span class="text-gray-500">Siswa:</span> <strong>{{ findingStudent.student_name }}</strong> ({{ findingStudent.nis || '-' }})</div>
          <div><span class="text-gray-500">Tanggal:</span> <strong>{{ formatDate(report.report_date) }}</strong></div>
          <div><span class="text-gray-500">Gerbang:</span> <strong>{{ findingStudent.gate.clock_in || '-' }} / {{ findingStudent.gate.clock_out || '-' }}</strong></div>
          <div><span class="text-gray-500">Mapel:</span> <strong>{{ lessonLine(findingStudent) }}</strong></div>
          <div v-if="findingStudent.permissions.length" class="col-span-2"><span class="text-gray-500">Izin disetujui:</span> <strong>{{ findingStudent.permissions.map((p) => p.label).join('; ') }}</strong></div>
        </div>
        <div v-for="(f, i) in findingStudent.findings" :key="i" class="border rounded-lg p-3"
          :class="f.category === 'POTENTIAL_VIOLATION' ? 'border-red-200 bg-red-50/40' : f.category === 'INCONSISTENCY' ? 'border-amber-200 bg-amber-50/40' : 'border-gray-200 bg-gray-50'">
          <div class="flex items-center gap-2 mb-1">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold" :class="f.category === 'POTENTIAL_VIOLATION' ? 'bg-red-100 text-red-800' : f.category === 'INCONSISTENCY' ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-700'">{{ categoryLabel(f.category) }}</span>
            <strong>{{ f.title }}</strong>
          </div>
          <p class="text-gray-800 mb-1">{{ f.description }}</p>
          <ul class="list-disc pl-4 text-gray-600 space-y-0.5"><li v-for="(e, k) in f.evidence" :key="k">{{ e }}</li></ul>
          <div class="mt-1 text-[11px] text-gray-500">Sumber: {{ f.source_module.map(moduleLabel).join(', ') }}<template v-if="f.affected_periods.length"> · Jam terkait: {{ f.affected_periods.map((p) => 'J' + p).join(', ') }}</template></div>
          <div v-if="f.affected_periods.length" class="mt-1 text-[11px] text-gray-600">
            <template v-for="p in f.affected_periods" :key="p">
              <span v-if="lessonCell(findingStudent, p)?.subject_name" class="mr-2">J{{ p }}: {{ lessonCell(findingStudent, p).subject_name }} ({{ lessonCell(findingStudent, p).teacher_name || '-' }})</span>
            </template>
          </div>
        </div>
        <p class="italic text-gray-500">{{ report.disclaimer }}</p>
      </div>
      <template #footer>
        <div class="flex justify-end w-full"><button type="button" @click="findingOpen = false" class="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-md">Tutup</button></div>
      </template>
    </BaseModal>

    <SessionDetailModal v-model="sessionModalOpen" :sessionId="activeSessionId" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import lessonAttendanceService from '@/services/api/lessonAttendance.service'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BaseModal from '@/components/modals/BaseModal.vue'
import SessionDetailModal from '@/components/lesson-attendance/SessionDetailModal.vue'

const authStore = useAuthStore()
const toast = useToast()

const canExportExcel = computed(() => authStore.hasPermission('lesson_attendance.integrated_daily_report.export_excel'))
const canExportPdf = computed(() => authStore.hasPermission('lesson_attendance.integrated_daily_report.export_pdf'))
const canViewSessionData = computed(() => authStore.hasPermission('lesson_attendance.data.view'))

const lookups = ref({ academic_years: [], grades: [], departments: [], classes: [], server_date: '' })
const scope = ref({ all_classes: true, class_ids: [] })
const draft = reactive({ academic_year_id: '', attendance_date: '', grade_id: '', department_id: '', class_id: '' })
const applied = ref(null) // last successfully applied filters; used by refresh & export
const report = ref(null)
const loading = ref(false)
const refreshing = ref(false)
const exportingExcel = ref(false)
const exportingPdf = ref(false)
const errorMsg = ref('')
const forbidden = ref(false)
const formError = ref('')
const quick = ref('ALL')
const search = ref('')

const detailOpen = ref(false)
const detail = ref(null)
const findingOpen = ref(false)
const findingStudent = ref(null)
const sessionModalOpen = ref(false)
const activeSessionId = ref(null)
let timerId = null

const selectedYear = computed(() => lookups.value.academic_years.find((y) => Number(y.id) === Number(draft.academic_year_id)))
const maxDate = computed(() => {
  const end = selectedYear.value?.end_date ? String(selectedYear.value.end_date).slice(0, 10) : null
  const today = lookups.value.server_date
  return end && today && end < today ? end : today
})
const filteredClasses = computed(() => (lookups.value.classes || []).filter((c) => {
  if (!scope.value.all_classes && !scope.value.class_ids.includes(Number(c.id))) return false
  if (draft.grade_id && Number(c.grade_id) !== Number(draft.grade_id)) return false
  if (draft.department_id && Number(c.department_id) !== Number(draft.department_id)) return false
  return true
}))
const canExport = computed(() => Boolean(report.value) && !loading.value && !refreshing.value)

const legend = [
  { code: 'H', label: 'Hadir' }, { code: 'T', label: 'Terlambat' }, { code: 'I', label: 'Izin' }, { code: 'S', label: 'Sakit' },
  { code: 'A', label: 'Alpa' }, { code: '-', label: 'Tidak tercatat' }, { code: '?', label: 'Data tidak lengkap/konflik' },
  { code: 'X', label: 'Dibatalkan' }, { code: '◷', label: 'Belum berlangsung' }
]
const recapHead = { H: 'text-emerald-700', T: 'text-amber-700', I: 'text-blue-700', S: 'text-purple-700', A: 'text-red-700' }

const statusClass = (code) => ({
  H: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
  T: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  I: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  S: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  A: 'bg-red-100 text-red-800 ring-1 ring-red-300 hover:bg-red-200',
  '-': 'bg-gray-100 text-gray-500 hover:bg-gray-200',
  '?': 'bg-amber-50 text-amber-700 border border-amber-400',
  X: 'bg-slate-100 text-slate-500',
  '◷': 'bg-gray-50 text-gray-400'
}[code] || 'bg-gray-100 text-gray-500')

const summaryItems = computed(() => {
  const s = report.value.summary
  return [
    { label: 'Total siswa', value: s.total_students, cls: 'text-gray-900' },
    { label: 'Masuk gerbang tercatat', value: s.gate_entry_recorded, cls: 'text-emerald-700' },
    { label: 'Terlambat masuk', value: s.gate_late_entry, cls: 'text-amber-700' },
    { label: 'Hadir Tahfidz', value: s.tahfidz_present, cls: 'text-emerald-700' },
    { label: 'Alpa Tahfidz', value: s.tahfidz_absent, cls: 'text-red-700' },
    { label: 'Alpa mapel', value: s.students_with_lesson_alpa, cls: 'text-red-700' },
    { label: 'Terindikasi bolos', value: s.students_potential_truancy, cls: 'text-red-700' },
    { label: 'Perlu verifikasi', value: s.students_needing_verification, cls: 'text-amber-700' }
  ]
})

const quickDefs = [
  { key: 'ALL', label: 'Semua Siswa', fn: () => true },
  { key: 'POTENTIAL', label: 'Potensi Pelanggaran', fn: (s) => s.flags.has_potential_violation },
  { key: 'INCONSISTENCY', label: 'Ketidaksesuaian Presensi', fn: (s) => s.flags.has_inconsistency },
  { key: 'TRUANCY', label: 'Terindikasi Bolos', fn: (s) => s.flags.potential_truancy },
  { key: 'THF_NONE', label: 'Tahfidz Tidak Tercatat', fn: (s) => s.flags.tahfidz_not_recorded },
  { key: 'THF_ABSENT', label: 'Tahfidz Alpa', fn: (s) => s.flags.tahfidz_absent },
  { key: 'GATE_NONE', label: 'Gerbang Tidak Tercatat', fn: (s) => s.flags.gate_not_recorded },
  { key: 'EARLY', label: 'Pulang Lebih Awal', fn: (s) => s.flags.early_departure }
]
const quickFilters = computed(() => quickDefs.map((d) => ({
  key: d.key, label: d.label, count: report.value ? report.value.students.filter(d.fn).length : 0
})))
const visibleStudents = computed(() => {
  if (!report.value) return []
  const def = quickDefs.find((d) => d.key === quick.value) || quickDefs[0]
  const q = search.value.trim().toLowerCase()
  return report.value.students.filter((s) => def.fn(s) &&
    (!q || s.student_name.toLowerCase().includes(q) || String(s.nis || '').toLowerCase().includes(q)))
})

const cnt = (v) => (v === null || v === undefined ? '?' : v)
const formatDate = (d) => {
  if (!d) return '-'
  return new Date(`${String(d).slice(0, 10)}T00:00:00Z`).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}
const formatDateTime = (d) => (d ? new Date(d).toLocaleString('id-ID', { timeZone: report.value?.timezone || 'Asia/Jakarta' }) : '-')
const categoryLabel = (c) => ({ POTENTIAL_VIOLATION: 'Potensi Pelanggaran', INCONSISTENCY: 'Ketidaksesuaian Presensi', INCOMPLETE_DATA: 'Data Belum Lengkap' }[c] || c)
const moduleLabel = (m) => ({ GATE: 'Presensi Gerbang', TAHFIDZ: 'Tahfidz', LESSON: 'Jam Pelajaran' }[m] || m)
const rowEvidence = (row) => [...new Set([...row.potential, ...row.inconsistencies].flatMap((f) => f.evidence))]
const lessonCell = (st, p) => st.lessons.find((l) => l.period_number === p)
const lessonLine = (st) => st.lessons.map((l) => `J${l.period_number}:${l.display_status}`).join(' ')

const gateInCode = (st) => {
  if (st.gate.source_error) return '?'
  if (!st.gate.clock_in && ['I', 'S', 'A'].includes(st.gate.display_status)) return st.gate.display_status
  if (st.gate.clock_in) return st.gate.display_status === 'T' ? 'T' : 'H'
  return '-'
}
const gateInText = (st) => {
  if (st.gate.source_error) return '?'
  if (st.gate.clock_in) return `${st.gate.clock_in}${st.gate.display_status === 'T' ? ' (T)' : ''}`
  return ['I', 'S', 'A'].includes(st.gate.display_status) ? st.gate.display_status : '-'
}
const gateTooltip = (st) => {
  if (st.gate.source_error) return 'Data gerbang gagal dimuat'
  if (!st.gate.record) return `${st.student_name}: presensi gerbang tidak tercatat`
  const m = st.gate.clock_in_method === 'RFID' ? 'RFID' : st.gate.clock_in_method === 'MANUAL' ? 'Manual/Koreksi' : st.gate.clock_in_method || '-'
  return `${st.student_name} | Masuk ${st.gate.clock_in || '-'} (${m})${st.gate.late_minutes ? `, terlambat ${st.gate.late_minutes} menit` : ''} | Pulang ${st.gate.clock_out || '-'}`
}
const tahfidzLabel = { present: 'Hadir', permission: 'Izin', sick: 'Sakit', absent: 'Alpa' }
const tahfidzTooltip = (st) => st.tahfidz.source_error
  ? 'Data Tahfidz gagal dimuat'
  : (st.tahfidz.record ? `${st.student_name} | Tahfidz: ${tahfidzLabel[st.tahfidz.status] || st.tahfidz.status}` : `${st.student_name} | Tahfidz tidak tercatat`)
const lessonReason = (s) => ({
  NOT_RECORDED: 'Presensi kelas pada jam ini belum diisi.', UPCOMING: 'Jam pelajaran belum berlangsung.',
  MISSING_DETAIL: 'Detail siswa tidak tersedia pada transaksi.', CANCELLED: 'Transaksi presensi pada jam ini dibatalkan.',
  SOURCE_ERROR: 'Data jam pelajaran gagal dimuat.'
}[s] || '')
const lessonTooltip = (st, c) => (['HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPA'].includes(c.status)
  ? `${st.student_name} | J${c.period_number}: ${c.status} | ${c.subject_name || '-'} (${c.teacher_name || '-'})${c.permission_covered ? ' | ada izin disetujui' : ''}`
  : `${st.student_name} | J${c.period_number}: ${lessonReason(c.status)}`)

const methodLabel = (m) => ({ RFID: 'RFID', MANUAL: 'Manual / hasil koreksi' }[m] || m)
const openGate = (st) => {
  detail.value = {
    type: 'gate', title: 'Detail Presensi Gerbang', student: st, sessionId: null,
    note: st.gate.source_error ? 'Data presensi gerbang gagal dimuat karena kesalahan teknis.' : (!st.gate.record ? 'Presensi gerbang tidak tercatat pada tanggal ini.' : ''),
    rows: [
      ['Jam masuk', st.gate.clock_in], ['Jam pulang', st.gate.clock_out], ['Entry status', st.gate.entry_status], ['Exit status', st.gate.exit_status],
      ['Attendance status', st.gate.attendance_status], ['Menit terlambat', st.gate.late_minutes], ['Shift', st.gate.shift_name],
      ['Metode masuk', methodLabel(st.gate.clock_in_method)], ['Metode pulang', methodLabel(st.gate.clock_out_method)], ['Catatan', st.gate.note]
    ]
  }
  detailOpen.value = true
}
const openTahfidz = (st) => {
  detail.value = {
    type: 'tahfidz', title: 'Detail Presensi Tahfidz', student: st, sessionId: null,
    note: st.tahfidz.source_error ? 'Data Tahfidz gagal dimuat karena kesalahan teknis.' : (!st.tahfidz.record ? 'Presensi Tahfidz tidak tercatat. Ini bukan berarti siswa alpa.' : ''),
    rows: [
      ['Status Tahfidz', st.tahfidz.record ? (tahfidzLabel[st.tahfidz.status] || st.tahfidz.status) : null], ['Catatan', st.tahfidz.notes],
      ['Waktu pencatatan', st.tahfidz.recorded_at ? formatDateTime(st.tahfidz.recorded_at) : null],
      ...(st.tahfidz.recorded_by ? [['Petugas pencatat', st.tahfidz.recorded_by]] : [])
    ]
  }
  detailOpen.value = true
}
const openLesson = (st, c) => {
  detail.value = {
    type: 'lesson', title: `Detail Presensi Jam ke-${c.period_number}`, student: st, sessionId: c.session_id,
    note: ['HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPA'].includes(c.status) ? '' : lessonReason(c.status),
    rows: [
      ['Nomor jam', `J${c.period_number}`], ['Waktu', `${c.period_start_time || '-'}–${c.period_end_time || '-'}`],
      ['Mata pelajaran', c.subject_name], ['Guru pengajar', c.teacher_name], ['Status', c.status],
      ['Catatan', c.notes], ['Metode input', c.input_method], ['Waktu pencatatan', c.submitted_at ? formatDateTime(c.submitted_at) : null],
      ...(c.permission_covered ? [['Izin disetujui', c.permission_label]] : [])
    ]
  }
  detailOpen.value = true
}
const openTransaction = () => {
  activeSessionId.value = detail.value.sessionId
  detailOpen.value = false
  sessionModalOpen.value = true
}
const openFindings = (st) => { if (st.findings.length) { findingStudent.value = st; findingOpen.value = true } }
const openFindingsById = (id) => openFindings(report.value.students.find((s) => s.student_id === id))

const validateDraft = () => {
  formError.value = ''
  if (!draft.class_id) { formError.value = 'Kelas wajib dipilih.'; return false }
  if (!draft.attendance_date) { formError.value = 'Tanggal wajib diisi.'; return false }
  if (lookups.value.server_date && draft.attendance_date > lookups.value.server_date) { formError.value = 'Tanggal mendatang tidak diperbolehkan.'; return false }
  const y = selectedYear.value
  if (y?.start_date && draft.attendance_date < String(y.start_date).slice(0, 10)) { formError.value = 'Tanggal di luar periode tahun ajaran.'; return false }
  if (y?.end_date && draft.attendance_date > String(y.end_date).slice(0, 10)) { formError.value = 'Tanggal di luar periode tahun ajaran.'; return false }
  return true
}

const requestParams = (f) => ({ academic_year_id: f.academic_year_id, attendance_date: f.attendance_date, class_id: f.class_id })

const load = async (filters, mode) => {
  if (mode === 'silent' && (loading.value || refreshing.value)) return
  if (mode === 'refresh' || mode === 'silent') refreshing.value = true
  else loading.value = true
  errorMsg.value = ''
  forbidden.value = false
  try {
    const res = await lessonAttendanceService.getIntegratedDailyReport(requestParams(filters))
    report.value = res.data?.data || res.data
    applied.value = { ...filters }
  } catch (err) {
    const status = err.response?.status
    forbidden.value = status === 403
    const msg = err.response?.data?.message
    const fallback = err.code === 'ERR_NETWORK' ? 'Koneksi ke server gagal. Periksa jaringan Anda lalu coba lagi.' : 'Gagal memuat laporan harian terpadu.'
    if (mode !== 'silent') {
      errorMsg.value = forbidden.value ? (msg || 'Anda tidak memiliki akses ke laporan atau kelas ini.') : (msg || fallback)
      if (mode === 'apply') report.value = null
    }
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const applyFilters = () => {
  if (!validateDraft()) return
  quick.value = 'ALL'
  search.value = ''
  load({ ...draft }, 'apply')
}
const refresh = () => { if (applied.value) load(applied.value, 'refresh') }
const resetFilters = () => {
  draft.academic_year_id = lookups.value.active_academic_year?.id || ''
  draft.attendance_date = lookups.value.server_date
  draft.grade_id = ''
  draft.department_id = ''
  draft.class_id = ''
  formError.value = ''
  report.value = null
  applied.value = null
  errorMsg.value = ''
  quick.value = 'ALL'
  search.value = ''
}

const handleExport = async (type) => {
  if (!applied.value) return
  const isExcel = type === 'excel'
  if (isExcel) exportingExcel.value = true
  else exportingPdf.value = true
  try {
    const params = requestParams(applied.value) // last applied filters only; never quick filter/search
    const res = isExcel
      ? await lessonAttendanceService.exportIntegratedDailyExcel(params)
      : await lessonAttendanceService.exportIntegratedDailyPdf(params)

    const classSlug = String(report.value?.class?.name || 'Kelas')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9_-]/g, '')
    const fallbackName = `Laporan-Harian-Terpadu-${classSlug || 'Kelas'}-${applied.value.attendance_date}.${isExcel ? 'xlsx' : 'pdf'}`

    let blob
    let filename = fallbackName
    if (res instanceof Blob) {
      blob = res
    } else {
      const m = (res?.headers?.['content-disposition'] || '').match(/filename="?([^"]+)"?/i)
      if (m?.[1]) filename = m[1]
      blob = res?.data instanceof Blob
        ? res.data
        : new Blob([res?.data ?? res], { type: res?.headers?.['content-type'] || (isExcel ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf') })
    }

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
    const errBlob = err instanceof Blob ? err : (err?.response?.data instanceof Blob ? err.response.data : null)
    if (errBlob) {
      try { msg = JSON.parse(await errBlob.text()).message || msg } catch { /* keep default */ }
    } else if (err?.response?.data?.message) {
      msg = err.response.data.message
    } else if (err?.message) {
      msg = err.message
    }
    toast.error(msg)
  } finally {
    exportingExcel.value = false
    exportingPdf.value = false
  }
}

onMounted(async () => {
  try {
    const [lk, sc] = await Promise.all([
      lessonAttendanceService.getLookups(),
      lessonAttendanceService.getIntegratedDailyScope().catch(() => null)
    ])
    lookups.value = lk.data?.data || lk.data
    if (sc) scope.value = sc.data?.data || sc.data
    draft.academic_year_id = lookups.value.active_academic_year?.id || ''
    draft.attendance_date = lookups.value.server_date
    // Auto refresh every 60s for today's report, only for visible tabs, never overlapping.
    timerId = setInterval(() => {
      if (document.visibilityState === 'visible' && report.value?.is_today && applied.value) load(applied.value, 'silent')
    }, 60000)
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal memuat data filter laporan.'
  }
})
onUnmounted(() => { if (timerId) clearInterval(timerId) })
</script>
