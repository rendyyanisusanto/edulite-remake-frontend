<template>
  <div class="space-y-4">
    <!-- Breadcrumb & Header -->
    <div>
      <nav class="text-xs text-gray-500 mb-1">
        <router-link to="/dashboard" class="hover:text-primary">Beranda</router-link>
        <span class="mx-1.5">/</span>
        <span>Presensi Jam Pelajaran</span>
        <span class="mx-1.5">/</span>
        <span class="text-gray-800 font-medium">Laporan Harian Siswa</span>
      </nav>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Laporan Harian Siswa</h1>
          <p class="text-sm text-gray-600">Pantau kehadiran siswa setiap jam pelajaran dan identifikasi siswa yang terindikasi tidak mengikuti pelajaran.</p>
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
          <button
            type="button"
            @click="fetchReport(true)"
            :disabled="loading || refreshing"
            class="px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {{ refreshing ? 'Menyegarkan...' : 'Refresh' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Filter Toolbar -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Tahun Ajaran</label>
          <select v-model="draftFilters.academic_year_id" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md">
            <option v-for="y in lookups.academic_years" :key="y.id" :value="y.id">
              {{ y.name }} {{ y.is_active ? '(Aktif)' : '' }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Tanggal</label>
          <input v-model="draftFilters.attendance_date" type="date" :max="lookups.server_date" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md" />
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
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Cari Siswa / NIS</label>
          <input v-model="draftFilters.search" type="text" placeholder="Nama atau NIS..." @keyup.enter="applyFilters" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md" />
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-gray-100">
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" @click="applyFilters" class="px-4 py-1.5 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90">
            Tampilkan
          </button>
          <button type="button" @click="resetFilters" class="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
            Reset
          </button>
          <label class="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 ml-2 cursor-pointer">
            <input type="checkbox" v-model="draftFilters.prioritize_truancy" @change="applyFilters" class="rounded text-primary focus:ring-primary" />
            Prioritaskan siswa terindikasi bolos
          </label>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span class="text-gray-500">Urutkan:</span>
          <select v-model="draftFilters.sort_by" @change="applyFilters" class="px-2 py-1 border border-gray-300 rounded">
            <option value="class_name">Kelas</option>
            <option value="student_name">Nama Siswa</option>
            <option value="nis">NIS</option>
            <option value="alpa_count">Jumlah ALPA</option>
            <option value="truancy_count">Jumlah Jam Bolos</option>
          </select>
          <select v-model="draftFilters.sort_order" @change="applyFilters" class="px-2 py-1 border border-gray-300 rounded">
            <option value="ASC">A–Z / Terkecil</option>
            <option value="DESC">Z–A / Terbesar</option>
          </select>
          <select v-model.number="draftFilters.limit" @change="applyFilters" class="px-2 py-1 border border-gray-300 rounded">
            <option :value="25">25 / hal</option>
            <option :value="50">50 / hal</option>
            <option :value="100">100 / hal</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Compact Summary -->
    <div v-if="report" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <div class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <span class="text-xs text-gray-500 block">Total Siswa Dipantau</span>
        <span class="text-xl font-bold text-gray-900">{{ report.base_summary.total_students }}</span>
        <span v-if="appliedFilters.class_id" class="text-[11px] text-gray-500 block mt-0.5">
          {{ report.base_summary.recorded_periods }} dari {{ report.base_summary.total_applicable_periods }} jam terisi
        </span>
      </div>
      <div class="bg-white p-3 rounded-xl border border-red-200 shadow-sm">
        <span class="text-xs text-red-700 block">Terindikasi Bolos</span>
        <span class="text-xl font-bold text-red-700">{{ report.base_summary.potential_truancy_count }}</span>
      </div>
      <div class="bg-white p-3 rounded-xl border border-orange-200 shadow-sm">
        <span class="text-xs text-orange-700 block">Memiliki ALPA</span>
        <span class="text-xl font-bold text-orange-700">{{ report.base_summary.has_alpa_count }}</span>
      </div>
      <div class="bg-white p-3 rounded-xl border border-rose-200 shadow-sm">
        <span class="text-xs text-rose-700 block">Alpa Seluruh Jam Tercatat</span>
        <span class="text-xl font-bold text-rose-700">{{ report.base_summary.all_absent_count }}</span>
      </div>
      <div class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <span class="text-xs text-gray-600 block">Presensi Belum Lengkap</span>
        <span class="text-xl font-bold text-gray-800">{{ report.base_summary.incomplete_count }}</span>
      </div>
    </div>

    <!-- Quick Attendance Filters -->
    <div class="flex flex-wrap items-center justify-between gap-2 bg-white px-3 py-2.5 rounded-xl border border-gray-200 shadow-sm">
      <div class="flex flex-wrap items-center gap-1.5">
        <button
          v-for="chip in quickFilterChips"
          :key="chip.key"
          type="button"
          @click="setCondition(chip.key)"
          class="px-2.5 py-1 text-xs font-medium rounded-full transition-colors border"
          :class="draftFilters.attendance_condition === chip.key
            ? 'bg-primary text-white border-primary'
            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'"
        >
          {{ chip.label }}
        </button>
      </div>
      <div v-if="report" class="text-xs text-gray-500">
        Menampilkan <strong>{{ report.filtered_count }}</strong> dari <strong>{{ report.base_summary.total_students }}</strong> siswa
      </div>
    </div>

    <!-- Verification & Historical Notices -->
    <div class="space-y-2">
      <div class="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        <strong>Catatan Analisis:</strong> Indikasi bolos dihitung berdasarkan status ALPA setelah siswa tercatat hadir. Hasil ini memerlukan verifikasi petugas dan bukan merupakan pelanggaran terkonfirmasi.
      </div>
      <div v-if="report?.historical_warning" class="text-xs text-blue-900 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
        {{ report.historical_warning }}
      </div>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
      {{ errorMsg }}
    </div>

    <!-- Matrix Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="loading" class="p-8 space-y-3 animate-pulse">
        <div v-for="i in 6" :key="i" class="h-7 bg-gray-100 rounded"></div>
      </div>

      <div v-else-if="!report || report.students.length === 0" class="p-10 text-center text-sm text-gray-500">
        <template v-if="report && report.base_summary.total_students === 0">
          Tidak ada data siswa pada kelas atau tanggal yang dipilih.
        </template>
        <template v-else-if="draftFilters.attendance_condition === 'POTENTIAL_TRUANCY'">
          Tidak ada siswa yang terindikasi bolos pada filter ini.
        </template>
        <template v-else>
          Tidak ada siswa yang sesuai dengan kriteria pencarian atau filter.
        </template>
      </div>

      <div v-else class="overflow-x-auto max-h-[65vh]">
        <table class="min-w-full border-collapse text-xs">
          <thead class="bg-gray-50 sticky top-0 z-20 shadow-sm">
            <tr>
              <th class="sticky left-0 z-30 bg-gray-50 px-2.5 py-2 text-center font-semibold text-gray-600 border-b border-r border-gray-200 w-10">No</th>
              <th class="sticky left-10 z-30 bg-gray-50 px-2.5 py-2 text-left font-semibold text-gray-600 border-b border-r border-gray-200 w-24">NIS</th>
              <th class="sticky left-[136px] z-30 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-600 border-b border-r border-gray-200 min-w-[180px]">Nama Siswa</th>
              <th v-if="!appliedFilters.class_id" class="px-3 py-2 text-left font-semibold text-gray-600 border-b border-r border-gray-200 whitespace-nowrap">Kelas</th>
              <th
                v-for="p in report.periods"
                :key="p.period_number"
                class="px-1.5 py-1.5 text-center font-semibold text-gray-700 border-b border-r border-gray-200 min-w-[54px]"
                :title="`${p.name} (${p.start_time}–${p.end_time})${p.subject_name ? ' | ' + p.subject_name : ''}`"
              >
                <div>{{ p.label }}</div>
                <div class="text-[9px] font-normal text-gray-500">{{ p.start_time }}</div>
                <div v-if="p.subject_name && appliedFilters.class_id" class="text-[9px] font-normal text-primary truncate max-w-[64px] mx-auto">
                  {{ p.subject_name }}
                </div>
              </th>
              <th class="px-2 py-2 text-right font-semibold text-emerald-700 border-b border-r border-gray-200">H</th>
              <th class="px-2 py-2 text-right font-semibold text-amber-700 border-b border-r border-gray-200">T</th>
              <th class="px-2 py-2 text-right font-semibold text-blue-700 border-b border-r border-gray-200">I</th>
              <th class="px-2 py-2 text-right font-semibold text-purple-700 border-b border-r border-gray-200">S</th>
              <th class="px-2 py-2 text-right font-semibold text-red-700 border-b border-r border-gray-200">A</th>
              <th class="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200 min-w-[200px]">Indikasi</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200 bg-white">
            <tr
              v-for="(st, idx) in report.students"
              :key="`${st.student_id}-${st.class_id}`"
              :class="st.potential_truancy ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-blue-50/30'"
            >
              <td class="sticky left-0 z-10 px-2.5 py-2 text-center text-gray-500 border-r border-gray-200" :class="st.potential_truancy ? 'bg-red-50' : 'bg-white'">
                {{ (report.pagination.page - 1) * report.pagination.limit + idx + 1 }}
              </td>
              <td class="sticky left-10 z-10 px-2.5 py-2 font-mono text-gray-600 border-r border-gray-200 whitespace-nowrap" :class="st.potential_truancy ? 'bg-red-50' : 'bg-white'">
                {{ st.nis || '-' }}
              </td>
              <td class="sticky left-[136px] z-10 px-3 py-2 font-medium text-gray-900 border-r border-gray-200 whitespace-nowrap" :class="st.potential_truancy ? 'bg-red-50' : 'bg-white'">
                <div class="flex items-center gap-1.5">
                  <span v-if="st.potential_truancy" class="w-2 h-2 rounded-full bg-red-600 shrink-0" title="Terindikasi bolos"></span>
                  <span>{{ st.student_name }}</span>
                  <span v-if="st.multi_class_on_date" class="text-[10px] px-1 py-0.5 bg-amber-100 text-amber-800 rounded" title="Siswa tercatat pada lebih dari satu kelas pada tanggal ini">2 Kelas</span>
                </div>
              </td>
              <td v-if="!appliedFilters.class_id" class="px-3 py-2 text-gray-700 border-r border-gray-200 whitespace-nowrap">
                {{ st.class_name }}
              </td>
              <td
                v-for="cell in st.attendance"
                :key="cell.period_number"
                class="p-1 text-center border-r border-gray-200"
              >
                <button
                  type="button"
                  @click="openCellModal(st, cell)"
                  :title="cellTooltip(st, cell)"
                  class="w-full h-7 rounded text-[11px] font-bold flex items-center justify-center transition-transform hover:scale-105"
                  :class="cellClass(cell.status)"
                >
                  {{ cellCode(cell.status) }}
                </button>
              </td>
              <td class="px-2 py-2 text-right text-emerald-700 border-r border-gray-200">{{ st.summary.hadir }}</td>
              <td class="px-2 py-2 text-right text-amber-700 border-r border-gray-200">{{ st.summary.terlambat }}</td>
              <td class="px-2 py-2 text-right text-blue-700 border-r border-gray-200">{{ st.summary.izin }}</td>
              <td class="px-2 py-2 text-right text-purple-700 border-r border-gray-200">{{ st.summary.sakit }}</td>
              <td class="px-2 py-2 text-right font-bold border-r border-gray-200" :class="st.summary.alpa > 0 ? 'text-red-700' : 'text-gray-500'">
                {{ st.summary.alpa }}
              </td>
              <td class="px-3 py-2 text-xs">
                <span
                  v-if="st.potential_truancy"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800"
                >
                  {{ st.indication_summary }}
                </span>
                <span v-else class="text-gray-600">{{ st.indication_summary }}</span>
              </td>
            </tr>
          </tbody>

          <!-- Footer: Total ALPA per jam (seluruh hasil filter) -->
          <tfoot class="bg-gray-100 font-bold text-xs">
            <tr>
              <td :colspan="appliedFilters.class_id ? 3 : 4" class="px-3 py-2 text-right border-t border-r border-gray-200">
                Total ALPA (Seluruh Hasil Filter)
              </td>
              <td
                v-for="p in report.periods"
                :key="`tot-${p.period_number}`"
                class="px-1.5 py-2 text-center border-t border-r border-gray-200"
                :class="(report.column_totals[p.period_number]?.A || 0) > 0 ? 'text-red-700' : 'text-gray-500'"
              >
                {{ report.column_totals[p.period_number]?.A || 0 }}
              </td>
              <td colspan="6" class="px-3 py-2 text-left text-[11px] font-normal text-gray-600 border-t border-gray-200">
                * Dihitung dari {{ report.filtered_count }} siswa hasil filter.
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Legend & Pagination -->
      <div v-if="report" class="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-600">
        <div class="flex flex-wrap items-center gap-2.5">
          <span><strong>Legenda:</strong></span>
          <span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">H: Hadir</span>
          <span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">T: Terlambat</span>
          <span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">I: Izin</span>
          <span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold">S: Sakit</span>
          <span class="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-semibold">A: Alpa</span>
          <span class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold">-: Belum Tercatat</span>
          <span class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-semibold">◷: Belum Mulai</span>
          <span class="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold">✕: Dibatalkan</span>
        </div>

        <div v-if="report.pagination.total > 0" class="flex items-center gap-2 shrink-0">
          <span>Hal <strong>{{ report.pagination.page }}</strong> / <strong>{{ report.pagination.total_pages }}</strong> ({{ report.pagination.total }} siswa)</span>
          <button
            type="button"
            @click="changePage(report.pagination.page - 1)"
            :disabled="report.pagination.page <= 1"
            class="px-2.5 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            @click="changePage(report.pagination.page + 1)"
            :disabled="report.pagination.page >= report.pagination.total_pages"
            class="px-2.5 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Cell Detail Modal -->
    <BaseModal v-model="cellModalOpen" maxWidth="md" title="Detail Presensi Siswa per Jam">
      <div v-if="selectedCell" class="space-y-3 text-xs">
        <div class="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-1">
          <div><span class="text-gray-500">Siswa:</span> <strong>{{ selectedCell.student.student_name }}</strong> ({{ selectedCell.student.nis || '-' }})</div>
          <div><span class="text-gray-500">Kelas:</span> <strong>{{ selectedCell.student.class_name }}</strong></div>
          <div><span class="text-gray-500">Tanggal / Jam:</span> <strong>{{ report?.attendance_date }} — Jam ke-{{ selectedCell.cell.period_number }} ({{ selectedCell.cell.period_start_time }}–{{ selectedCell.cell.period_end_time }})</strong></div>
        </div>

        <div v-if="['HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPA'].includes(selectedCell.cell.status)" class="space-y-1.5">
          <div><span class="text-gray-500">Status:</span> <strong class="px-2 py-0.5 rounded" :class="cellClass(selectedCell.cell.status)">{{ selectedCell.cell.status }}</strong></div>
          <div><span class="text-gray-500">Mata Pelajaran:</span> <strong>{{ selectedCell.cell.subject_name || '-' }}</strong></div>
          <div><span class="text-gray-500">Guru Pengajar:</span> <strong>{{ selectedCell.cell.teacher_name || '-' }}</strong></div>
          <div><span class="text-gray-500">Metode Input:</span> <strong>{{ selectedCell.cell.input_method || '-' }}</strong></div>
          <div><span class="text-gray-500">Catatan Siswa:</span> <span>{{ selectedCell.cell.notes || '-' }}</span></div>
        </div>
        <div v-else class="p-3 bg-gray-100 rounded-lg text-gray-700">
          {{ cellReasonText(selectedCell.cell.status) }}
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <button
            v-if="selectedCell?.cell?.session_id && canViewSessionData"
            type="button"
            @click="openTransactionDetail"
            class="px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Lihat Transaksi Presensi
          </button>
          <button type="button" @click="cellModalOpen = false" class="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-md">
            Tutup
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- Reuse SessionDetailModal from LA-04 (read-only/existing correction flow) -->
    <SessionDetailModal
      v-model="sessionModalOpen"
      :sessionId="activeSessionId"
    />
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

const canExportExcel = computed(() => authStore.hasPermission('lesson_attendance.daily_report.export_excel'))
const canExportPdf = computed(() => authStore.hasPermission('lesson_attendance.daily_report.export_pdf'))
const canViewSessionData = computed(() => authStore.hasPermission('lesson_attendance.data.view'))

const quickFilterChips = [
  { key: 'ALL', label: 'Semua Siswa' },
  { key: 'POTENTIAL_TRUANCY', label: 'Terindikasi Bolos' },
  { key: 'HAS_ALPA', label: 'Memiliki Alpa' },
  { key: 'ABSENT_AT_START', label: 'Alpa Jam Awal' },
  { key: 'ALL_ABSENT', label: 'Alpa Seluruh Jam' },
  { key: 'INCOMPLETE', label: 'Presensi Belum Lengkap' }
]

const lookups = ref({ academic_years: [], grades: [], departments: [], classes: [], server_date: '' })

const draftFilters = reactive({
  academic_year_id: '',
  attendance_date: '',
  grade_id: '',
  department_id: '',
  class_id: '',
  search: '',
  attendance_condition: 'ALL',
  prioritize_truancy: false,
  sort_by: 'class_name',
  sort_order: 'ASC',
  page: 1,
  limit: 25
})

const appliedFilters = ref({})
const loading = ref(true)
const refreshing = ref(false)
const exportingExcel = ref(false)
const exportingPdf = ref(false)
const errorMsg = ref('')
const report = ref(null)

const cellModalOpen = ref(false)
const selectedCell = ref(null)
const sessionModalOpen = ref(false)
const activeSessionId = ref(null)

let timerId = null

const filteredClasses = computed(() => {
  return (lookups.value.classes || []).filter((c) => {
    if (draftFilters.grade_id && Number(c.grade_id) !== Number(draftFilters.grade_id)) return false
    if (draftFilters.department_id && Number(c.department_id) !== Number(draftFilters.department_id)) return false
    return true
  })
})

const buildCleanParams = (src) => {
  const params = {}
  Object.entries(src).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) params[k] = v
  })
  return params
}

const fetchReport = async (silent = false) => {
  if (silent && (loading.value || refreshing.value)) return
  if (silent) refreshing.value = true
  else loading.value = true
  errorMsg.value = ''

  try {
    const res = await lessonAttendanceService.getDailyStudentReport(buildCleanParams(appliedFilters.value))
    report.value = res.data?.data || res.data
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal memuat laporan harian presensi siswa.'
    if (!silent) toast.error(errorMsg.value)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const applyFilters = () => {
  draftFilters.page = 1
  appliedFilters.value = { ...draftFilters }
  fetchReport(false)
}

const setCondition = (key) => {
  draftFilters.attendance_condition = key
  applyFilters()
}

const resetFilters = () => {
  draftFilters.academic_year_id = lookups.value.active_academic_year?.id || ''
  draftFilters.attendance_date = lookups.value.server_date
  draftFilters.grade_id = ''
  draftFilters.department_id = ''
  draftFilters.class_id = ''
  draftFilters.search = ''
  draftFilters.attendance_condition = 'ALL'
  draftFilters.prioritize_truancy = false
  draftFilters.sort_by = 'class_name'
  draftFilters.sort_order = 'ASC'
  draftFilters.page = 1
  draftFilters.limit = 25
  appliedFilters.value = { ...draftFilters }
  fetchReport(false)
}

const changePage = (newPage) => {
  if (!report.value || newPage < 1 || newPage > report.value.pagination.total_pages) return
  draftFilters.page = newPage
  appliedFilters.value = { ...appliedFilters.value, page: newPage }
  fetchReport(false)
}

const openCellModal = (student, cell) => {
  selectedCell.value = { student, cell }
  cellModalOpen.value = true
}

const openTransactionDetail = () => {
  activeSessionId.value = selectedCell.value.cell.session_id
  cellModalOpen.value = false
  sessionModalOpen.value = true
}

const handleExport = async (type) => {
  const isExcel = type === 'excel'
  if (isExcel) exportingExcel.value = true
  else exportingPdf.value = true

  try {
    const params = buildCleanParams(appliedFilters.value)
    const res = isExcel
      ? await lessonAttendanceService.exportDailyStudentExcel(params)
      : await lessonAttendanceService.exportDailyStudentPdf(params)

    const disposition = res.headers['content-disposition'] || ''
    const match = disposition.match(/filename="?([^"]+)"?/i)
    const filename = match?.[1] || `Laporan-Harian-Siswa-${appliedFilters.value.attendance_date}.${isExcel ? 'xlsx' : 'pdf'}`

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
        const json = JSON.parse(await err.response.data.text())
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

const cellCode = (st) => ({
  HADIR: 'H',
  TERLAMBAT: 'T',
  IZIN: 'I',
  SAKIT: 'S',
  ALPA: 'A',
  NOT_RECORDED: '-',
  MISSING_DETAIL: '?',
  CANCELLED: '✕',
  UPCOMING: '◷',
  NOT_APPLICABLE: 'N/A'
}[st] || '-')

const cellClass = (st) => ({
  HADIR: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
  TERLAMBAT: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  IZIN: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  SAKIT: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  ALPA: 'bg-red-100 text-red-800 hover:bg-red-200 ring-1 ring-red-300',
  NOT_RECORDED: 'bg-gray-100 text-gray-500 hover:bg-gray-200',
  MISSING_DETAIL: 'bg-amber-50 text-amber-700 border border-amber-400',
  CANCELLED: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
  UPCOMING: 'bg-gray-50 text-gray-400',
  NOT_APPLICABLE: 'bg-slate-100 text-slate-500'
}[st] || 'bg-gray-100 text-gray-500')

const cellReasonText = (st) => ({
  NOT_RECORDED: 'Presensi kelas pada jam ini belum diisi.',
  UPCOMING: 'Jam pelajaran belum dimulai.',
  MISSING_DETAIL: 'Detail siswa tidak tersedia pada transaksi.',
  CANCELLED: 'Transaksi presensi pada jam ini dibatalkan.',
  NOT_APPLICABLE: 'Jam pelajaran tidak berlaku untuk kelas ini.'
}[st] || 'Status belum tercatat.')

const cellTooltip = (student, cell) => {
  if (['HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPA'].includes(cell.status)) {
    return `${student.student_name} (${student.class_name}) | J${cell.period_number}: ${cell.status} | ${cell.subject_name || '-'} (${cell.teacher_name || '-'})`
  }
  return `${student.student_name} | J${cell.period_number}: ${cellReasonText(cell.status)}`
}

onMounted(async () => {
  try {
    const res = await lessonAttendanceService.getLookups()
    lookups.value = res.data?.data || res.data
    draftFilters.academic_year_id = lookups.value.active_academic_year?.id || ''
    draftFilters.attendance_date = lookups.value.server_date
    appliedFilters.value = { ...draftFilters }
    await fetchReport(false)

    timerId = setInterval(() => {
      if (document.visibilityState === 'visible' && report.value?.is_today) {
        fetchReport(true)
      }
    }, 60000)
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal memuat halaman laporan harian.'
    loading.value = false
  }
})

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})
</script>
