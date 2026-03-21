<template>
  <div class="space-y-4">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Penempatan Kelas Siswa</h1>
        <p class="text-sm text-gray-500 mt-0.5">Kelola penempatan kelas secara massal dengan cepat untuk tahun ajaran yang dipilih.</p>
      </div>
      <router-link to="/class-history">
        <BaseButton variant="outline" icon="<svg class='h-4 w-4 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'/></svg>">
          Lihat Daftar Riwayat
        </BaseButton>
      </router-link>
    </div>

    <!-- Top Filter Bar -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div class="flex flex-wrap items-end gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Tahun Ajaran <span class="text-red-500">*</span></label>
          <select v-model="selectedAcademicYear" @change="onAcademicYearChange" class="rounded-lg border-gray-200 text-sm px-3 py-2 border bg-gray-50 focus:border-primary focus:ring-1 focus:ring-primary min-w-[160px]">
            <option value="" disabled>Pilih Tahun Ajaran</option>
            <option v-for="year in academicYears" :key="year.id" :value="year.id">
              {{ year.name }} {{ year.is_active ? '✓' : '' }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Tingkat</label>
          <select v-model="selectedGrade" @change="onGradeChange" class="rounded-lg border-gray-200 text-sm px-3 py-2 border bg-gray-50 focus:border-primary focus:ring-1 focus:ring-primary min-w-[140px]">
            <option value="">Semua Tingkat</option>
            <option v-for="grade in grades" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
          </select>
        </div>
        <button @click="refreshAll" class="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary bg-gray-50 hover:bg-primary/5 rounded-lg border border-gray-200 transition-colors" :class="{ 'opacity-70 cursor-not-allowed': !selectedAcademicYear }">
          <svg class="w-4 h-4" :class="{ 'animate-spin': loadingClasses || loadingUnassigned }" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div v-if="summary && selectedAcademicYear" class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
        </div>
        <div>
          <p class="text-xs text-gray-500">Total Kelas</p>
          <p class="text-2xl font-bold text-gray-800">{{ summary.total_classes }}</p>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <p class="text-xs text-gray-500">Sudah Ditempatkan</p>
          <p class="text-2xl font-bold text-green-600">{{ summary.assigned_students }}</p>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <div>
          <p class="text-xs text-gray-500">Belum Punya Kelas</p>
          <p class="text-2xl font-bold text-amber-600">{{ summary.unassigned_students }}</p>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg>
        </div>
        <div>
          <p class="text-xs text-gray-500">Sisa Kapasitas</p>
          <p class="text-2xl font-bold text-purple-600">{{ summary.remaining_capacity }}</p>
        </div>
      </div>
    </div>

    <!-- No Academic Year Selected -->
    <div v-if="!selectedAcademicYear" class="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center">
      <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
      <p class="text-gray-500 font-medium">Pilih Tahun Ajaran terlebih dahulu</p>
      <p class="text-sm text-gray-400 mt-1">Pilih tahun ajaran di atas untuk mulai mengelola penempatan kelas.</p>
    </div>

    <!-- Main Split Panel -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">

      <!-- LEFT PANEL: Classes -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col" style="max-height: 680px;">
        <div class="p-4 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-semibold text-gray-800">Kelas & Anggota</h2>
              <p class="text-xs text-gray-500 mt-0.5">Klik kelas untuk melihat anggota</p>
            </div>
            <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{{ classes.length }} kelas</span>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3 space-y-2">
          <!-- Loading skeleton -->
          <div v-if="loadingClasses" class="space-y-2">
            <div v-for="i in 4" :key="i" class="animate-pulse h-20 bg-gray-100 rounded-lg"></div>
          </div>

          <!-- Empty state -->
          <div v-else-if="classes.length === 0" class="text-center py-12">
            <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            <p class="text-sm text-gray-400">Tidak ada kelas ditemukan</p>
          </div>

          <!-- Class cards -->
          <div v-else v-for="cls in classes" :key="cls.id">
            <!-- Class Card -->
            <button
              @click="selectClass(cls)"
              class="w-full text-left rounded-lg border-2 transition-all p-3"
              :class="selectedClass?.id === cls.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-800 text-sm">{{ cls.name }}</span>
                    <span v-if="cls.grade" class="text-xs text-gray-400">{{ cls.grade.name }}</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-0.5 truncate">
                    {{ cls.homeroom_teacher ? `Wali Kelas: ${cls.homeroom_teacher.full_name}` : 'Wali Kelas: -' }}
                  </p>
                  <!-- Occupancy bar -->
                  <div class="mt-2">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs text-gray-500">{{ cls.occupied }} / {{ cls.capacity || '∞' }} siswa</span>
                      <span class="text-xs font-medium px-1.5 py-0.5 rounded-full"
                        :class="cls.occupancy_status === 'full' ? 'bg-red-100 text-red-700'
                          : cls.occupancy_status === 'warning' ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'">
                        {{ cls.occupancy_status === 'full' ? 'Penuh' : cls.occupancy_status === 'warning' ? 'Hampir Penuh' : `${cls.remaining} tersisa` }}
                      </span>
                    </div>
                    <div v-if="cls.capacity" class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all"
                        :class="cls.occupancy_status === 'full' ? 'bg-red-500'
                          : cls.occupancy_status === 'warning' ? 'bg-amber-500'
                          : 'bg-green-500'"
                        :style="{ width: `${Math.min(100, Math.round((cls.occupied / cls.capacity) * 100))}%` }">
                      </div>
                    </div>
                  </div>
                </div>
                <svg v-if="selectedClass?.id === cls.id" class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
            </button>

            <!-- Members panel (when class is selected) -->
            <div v-if="selectedClass?.id === cls.id" class="mt-1 ml-2 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div class="px-3 py-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                <span class="text-xs font-semibold text-gray-600">Anggota Kelas</span>
                <div class="flex items-center gap-2">
                  <span v-if="selectedMembers.length > 0" class="text-xs text-primary font-medium">{{ selectedMembers.length }} dipilih</span>
                  <button v-if="selectedMembers.length > 0" @click="openMoveModal" class="text-xs text-white bg-amber-500 hover:bg-amber-600 px-2 py-0.5 rounded font-medium transition-colors">
                    Pindah Kelas
                  </button>
                  <button v-if="selectedMembers.length > 0" @click="selectedMembers = []" class="text-xs text-gray-500 hover:text-gray-700">Reset</button>
                </div>
              </div>
              <div class="max-h-56 overflow-y-auto">
                <div v-if="cls.members.length === 0" class="text-center py-4">
                  <p class="text-xs text-gray-400">Kelas ini belum memiliki anggota</p>
                </div>
                <div v-else>
                  <label v-for="member in cls.members" :key="member.history_id"
                    class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-white border-b border-gray-100 last:border-0 transition-colors"
                    :class="selectedMembers.includes(member.history_id) ? 'bg-primary/5' : ''">
                    <input type="checkbox" :value="member.history_id" v-model="selectedMembers" class="rounded border-gray-300 text-primary focus:ring-primary">
                    <div class="flex-1 min-w-0">
                      <span class="text-sm font-medium text-gray-800 truncate block">{{ member.full_name }}</span>
                      <span class="text-xs text-gray-500">{{ member.nis || '-' }}</span>
                    </div>
                    <span class="text-xs text-gray-400">{{ member.gender === 'L' ? '♂' : '♀' }}</span>
                  </label>
                </div>
              </div>
              <!-- Select all members button -->
              <div v-if="cls.members.length > 0" class="px-3 py-2 bg-gray-100 border-t border-gray-200 flex gap-2">
                <button @click="toggleSelectAllMembers(cls)" class="text-xs text-gray-600 hover:text-primary underline">
                  {{ selectedMembers.length === cls.members.length ? 'Batal Pilih Semua' : 'Pilih Semua' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL: Unassigned Students -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col" style="max-height: 680px;">
        <div class="p-4 border-b border-gray-100">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h2 class="text-base font-semibold text-gray-800">Siswa Belum Punya Kelas</h2>
              <p class="text-xs text-gray-500 mt-0.5">Pilih siswa lalu klik "Tempatkan ke Kelas"</p>
            </div>
            <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{{ unassignedTotal }} siswa</span>
          </div>
          <!-- Search -->
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input v-model="unassignedSearch" @input="onUnassignedSearch" type="text" placeholder="Cari nama / NIS..." class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
          </div>
        </div>

        <!-- Action Bar -->
        <div class="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-600">
              <span v-if="selectedStudents.length > 0" class="font-semibold text-primary">{{ selectedStudents.length }} dipilih</span>
              <span v-else>Belum ada pilihan</span>
            </span>
            <button v-if="selectedStudents.length > 0" @click="selectedStudents = []" class="text-xs text-gray-500 hover:text-red-500 transition-colors">Reset</button>
          </div>
          <div class="flex items-center gap-2">
            <button @click="toggleSelectAll"
              class="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-white transition-colors text-gray-600">
              {{ allCurrentPageSelected ? 'Batal Semua' : 'Pilih Halaman' }}
            </button>
            <button
              @click="openAssignModal"
              :disabled="selectedStudents.length === 0 || !selectedClass"
              class="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg transition-all"
              :class="selectedStudents.length > 0 && selectedClass
                ? 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Tempatkan ke Kelas
            </button>
          </div>
        </div>

        <!-- Student list -->
        <div class="flex-1 overflow-y-auto">
          <!-- Loading -->
          <div v-if="loadingUnassigned" class="p-4 space-y-2">
            <div v-for="i in 8" :key="i" class="animate-pulse h-12 bg-gray-100 rounded-lg"></div>
          </div>

          <!-- Empty -->
          <div v-else-if="unassignedStudents.length === 0" class="text-center py-16">
            <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-gray-500 font-medium">
              {{ unassignedSearch ? 'Siswa tidak ditemukan' : 'Semua siswa sudah punya kelas!' }}
            </p>
            <p class="text-xs text-gray-400 mt-1">
              {{ unassignedSearch ? 'Coba kata kunci yang berbeda.' : 'Penempatan kelas untuk tahun ajaran ini sudah lengkap.' }}
            </p>
          </div>

          <!-- Rows -->
          <div v-else>
            <label v-for="student in unassignedStudents" :key="student.id"
              class="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-primary/5 border-b border-gray-50 last:border-0 transition-colors"
              :class="selectedStudents.includes(student.id) ? 'bg-primary/5' : ''">
              <input type="checkbox" :value="student.id" v-model="selectedStudents" class="rounded border-gray-300 text-primary focus:ring-primary">
              <div class="flex-1 min-w-0">
                <span class="text-sm font-medium text-gray-800 block">{{ student.full_name }}</span>
                <span class="text-xs text-gray-500">{{ student.nis || '-' }}</span>
              </div>
              <span class="text-xs font-medium px-2 py-0.5 rounded-full"
                :class="student.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'">
                {{ student.gender === 'L' ? 'L' : 'P' }}
              </span>
            </label>

            <!-- Load more -->
            <div v-if="unassignedPage < unassignedTotalPages" class="p-3 text-center">
              <button @click="loadMoreUnassigned" :disabled="loadingMore" class="text-sm text-primary hover:underline">
                {{ loadingMore ? 'Memuat...' : `Muat lebih banyak (${unassignedTotal - unassignedStudents.length} lagi)` }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Confirm Modal -->
    <BaseModal v-model="showAssignModal" title="Konfirmasi Penempatan Kelas" maxWidth="sm">
      <div class="space-y-3">
        <div class="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
          <p class="font-semibold">{{ selectedStudents.length }} siswa akan ditempatkan ke:</p>
          <p class="mt-1 text-blue-700 font-bold text-base">{{ selectedClass?.name }}</p>
          <p class="text-xs text-blue-600 mt-1">
            Kapasitas: {{ selectedClass?.capacity || '∞' }} | Terisi: {{ selectedClass?.occupied }} | Tersisa: {{ selectedClass?.remaining ?? '∞' }}
          </p>
        </div>
        <p class="text-sm text-gray-500">Siswa yang sudah memiliki kelas di tahun ajaran ini akan dilewati secara otomatis.</p>
        <div v-if="selectedClass?.occupancy_status === 'full'" class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          ⚠️ Kelas ini sudah penuh. Penempatan mungkin gagal.
        </div>
        <div v-else-if="selectedClass?.occupancy_status === 'warning'" class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
          ⚠️ Kelas ini hampir penuh. Periksa kapasitas sebelum melanjutkan.
        </div>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showAssignModal = false" class="mr-3">Batal</BaseButton>
        <BaseButton @click="doAssign" :loading="assigning">Ya, Tempatkan</BaseButton>
      </template>
    </BaseModal>

    <!-- Bulk Move Modal -->
    <BulkMoveModal
      v-model="showMoveModal"
      :classes="classes"
      :from-class="selectedClass"
      :student-count="selectedMembers.length"
      :loading="moving"
      @confirm="doMove"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BulkMoveModal from '@/components/modals/BulkMoveModal.vue'
import classSetupService from '@/services/api/classSetup.service'
import { academicYearService, gradeService } from '@/services/api/academic.service'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()

// Filter state
const selectedAcademicYear = ref('')
const selectedGrade = ref('')
const academicYears = ref([])
const grades = ref([])

// Summary
const summary = ref(null)

// Left Panel
const classes = ref([])
const loadingClasses = ref(false)
const selectedClass = ref(null)
const selectedMembers = ref([]) // history_ids selected for move

// Right Panel - Unassigned Students
const unassignedStudents = ref([])
const unassignedTotal = ref(0)
const unassignedTotalPages = ref(1)
const unassignedPage = ref(1)
const unassignedSearch = ref('')
const loadingUnassigned = ref(false)
const loadingMore = ref(false)
const selectedStudents = ref([])

// Modal state
const showAssignModal = ref(false)
const showMoveModal = ref(false)
const assigning = ref(false)
const moving = ref(false)

// Computed
const allCurrentPageSelected = computed(() =>
  unassignedStudents.value.length > 0 &&
  unassignedStudents.value.every(s => selectedStudents.value.includes(s.id))
)

// Methods
const loadMasterData = async () => {
  try {
    const [resYears, resGrades] = await Promise.all([
      academicYearService.getAll(),
      gradeService.getAll()
    ])
    if (resYears.success) {
      academicYears.value = resYears.data.academicYears || []
      const active = academicYears.value.find(y => y.is_active)
      if (active) { selectedAcademicYear.value = active.id; loadAllData() }
    }
    if (resGrades.success) grades.value = resGrades.data.grades || []
  } catch (err) {
    console.error('Failed to load master data:', err)
  }
}

const loadAllData = () => {
  if (!selectedAcademicYear.value) return
  loadSummary()
  loadClasses()
  resetUnassigned()
}

const loadSummary = async () => {
  try {
    const res = await classSetupService.getSummary({
      academic_year_id: selectedAcademicYear.value,
      grade_id: selectedGrade.value || undefined
    })
    if (res.success) summary.value = res.data
  } catch (err) { console.error(err) }
}

const loadClasses = async () => {
  loadingClasses.value = true
  selectedClass.value = null
  selectedMembers.value = []
  try {
    const res = await classSetupService.getClasses({
      academic_year_id: selectedAcademicYear.value,
      grade_id: selectedGrade.value || undefined
    })
    if (res.success) classes.value = res.data
  } catch (err) {
    showError('Gagal memuat data kelas')
  } finally {
    loadingClasses.value = false
  }
}

const resetUnassigned = () => {
  unassignedStudents.value = []
  unassignedPage.value = 1
  selectedStudents.value = []
  loadUnassigned()
}

const loadUnassigned = async () => {
  if (!selectedAcademicYear.value) return
  loadingUnassigned.value = true
  try {
    const res = await classSetupService.getUnassignedStudents({
      academic_year_id: selectedAcademicYear.value,
      search: unassignedSearch.value || undefined,
      page: unassignedPage.value,
      limit: 30
    })
    if (res.success) {
      unassignedStudents.value = res.data.students
      unassignedTotal.value = res.data.totalItems
      unassignedTotalPages.value = res.data.totalPages
    }
  } catch (err) {
    showError('Gagal memuat data siswa')
  } finally {
    loadingUnassigned.value = false
  }
}

const loadMoreUnassigned = async () => {
  loadingMore.value = true
  unassignedPage.value++
  try {
    const res = await classSetupService.getUnassignedStudents({
      academic_year_id: selectedAcademicYear.value,
      search: unassignedSearch.value || undefined,
      page: unassignedPage.value,
      limit: 30
    })
    if (res.success) {
      unassignedStudents.value.push(...res.data.students)
    }
  } catch (err) {
    unassignedPage.value--
  } finally {
    loadingMore.value = false
  }
}

let searchTimeout
const onUnassignedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    unassignedPage.value = 1
    loadUnassigned()
  }, 400)
}

const onAcademicYearChange = () => { selectedGrade.value = ''; loadAllData() }
const onGradeChange = () => { loadAllData() }

const refreshAll = () => { if (selectedAcademicYear.value) loadAllData() }

const selectClass = (cls) => {
  if (selectedClass.value?.id === cls.id) {
    selectedClass.value = null
    selectedMembers.value = []
  } else {
    selectedClass.value = cls
    selectedMembers.value = []
  }
}

const toggleSelectAll = () => {
  if (allCurrentPageSelected.value) {
    selectedStudents.value = selectedStudents.value.filter(
      id => !unassignedStudents.value.find(s => s.id === id)
    )
  } else {
    const currentIds = unassignedStudents.value.map(s => s.id)
    const merged = new Set([...selectedStudents.value, ...currentIds])
    selectedStudents.value = Array.from(merged)
  }
}

const toggleSelectAllMembers = (cls) => {
  const allIds = cls.members.map(m => m.history_id)
  const allSelected = allIds.every(id => selectedMembers.value.includes(id))
  if (allSelected) {
    selectedMembers.value = selectedMembers.value.filter(id => !allIds.includes(id))
  } else {
    const merged = new Set([...selectedMembers.value, ...allIds])
    selectedMembers.value = Array.from(merged)
  }
}

const openAssignModal = () => {
  if (!selectedClass.value) { showError('Pilih kelas dari panel kiri terlebih dahulu'); return }
  if (selectedStudents.value.length === 0) { showError('Pilih minimal satu siswa'); return }
  showAssignModal.value = true
}

const openMoveModal = () => {
  if (selectedMembers.value.length === 0) { showError('Pilih minimal satu siswa untuk dipindahkan'); return }
  showMoveModal.value = true
}

const doAssign = async () => {
  assigning.value = true
  try {
    const res = await classSetupService.bulkAssign({
      academic_year_id: selectedAcademicYear.value,
      grade_id: selectedClass.value.grade?.id || selectedGrade.value,
      class_id: selectedClass.value.id,
      student_ids: selectedStudents.value
    })
    if (res.success) {
      success(res.data?.message || 'Siswa berhasil ditempatkan')
      showAssignModal.value = false
      selectedStudents.value = []
      loadAllData()
    }
  } catch (err) {
    showError(err.message || 'Gagal menempatkan siswa')
  } finally {
    assigning.value = false
  }
}

const doMove = async (toClassId) => {
  moving.value = true
  try {
    const res = await classSetupService.bulkMove({
      academic_year_id: selectedAcademicYear.value,
      from_class_id: selectedClass.value.id,
      to_class_id: toClassId,
      student_ids: selectedMembers.value
    })
    if (res.success) {
      success(res.data?.message || 'Siswa berhasil dipindahkan')
      showMoveModal.value = false
      selectedMembers.value = []
      selectedClass.value = null
      loadAllData()
    }
  } catch (err) {
    showError(err.message || 'Gagal memindahkan siswa')
  } finally {
    moving.value = false
  }
}

onMounted(() => { loadMasterData() })
</script>
