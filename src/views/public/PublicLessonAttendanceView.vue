<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
    <!-- Top Compact Header (Stages 2 & 3) -->
    <header
      v-if="stage === 'setup' || stage === 'attendance'"
      class="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 shadow-xs"
    >
      <div class="max-w-2xl mx-auto flex items-center justify-between gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
              {{ contextData?.class_info?.name || classData?.class_info?.name }}
            </span>
            <span class="text-xs text-slate-500 truncate">
              {{ formattedAttendanceDate }}
            </span>
          </div>
          <p class="text-sm font-semibold text-slate-900 truncate mt-0.5">
            {{ contextData?.teacher?.full_name || verifiedTeacher?.full_name }}
          </p>
        </div>
        <button
          type="button"
          @click="requestSwitchTeacher"
          class="shrink-0 min-h-[38px] px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Ganti Guru
        </button>
      </div>
    </header>

    <!-- Main Container -->
    <main class="flex-1 w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col">
      <!-- Loading QR Initial -->
      <div
        v-if="loadingQr"
        class="flex-1 flex flex-col items-center justify-center py-16 space-y-4"
      >
        <div class="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-blue-600"></div>
        <p class="text-sm text-slate-500">Memvalidasi QR Code kelas...</p>
      </div>

      <!-- QR Error State -->
      <div
        v-else-if="qrError"
        class="flex-1 flex items-center justify-center py-8"
      >
        <div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 text-center space-y-4">
          <div
            class="mx-auto h-14 w-14 rounded-full flex items-center justify-center"
            :class="qrError.type === 'inactive' || qrError.type === 'config' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'"
          >
            <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 class="text-lg font-bold text-slate-900">{{ qrError.title }}</h1>
          <p class="text-sm text-slate-600 leading-relaxed">{{ qrError.message }}</p>
          <div class="pt-2">
            <BaseButton variant="outline" size="md" @click="validateQr" class="min-h-[44px] w-full sm:w-auto">
              Coba Lagi
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- STAGE 1: Teacher Verification -->
      <div
        v-else-if="stage === 'verify'"
        class="flex-1 flex items-center justify-center py-2"
      >
        <div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-6 text-center space-y-2 bg-gradient-to-b from-blue-50/70 to-white border-b border-slate-100">
            <img
              v-if="classData?.school?.logo"
              :src="classData.school.logo"
              alt="Logo Sekolah"
              class="h-12 w-12 object-contain mx-auto mb-2"
            />
            <p class="text-xs font-semibold uppercase tracking-wider text-blue-700">
              {{ classData?.school?.name || 'Edulite' }}
            </p>
            <h1 class="text-xl font-bold text-slate-900">Presensi Kelas</h1>
            <div class="pt-2">
              <p class="text-2xl font-extrabold text-slate-900">{{ classData?.class_info?.name }}</p>
              <p class="text-xs text-slate-500 mt-0.5">
                <span v-if="classData?.class_info?.grade">{{ classData.class_info.grade.name }}</span>
                <span v-if="classData?.class_info?.department"> &bull; {{ classData.class_info.department.name }}</span>
              </p>
              <p v-if="classData?.academic_year?.name" class="text-xs font-medium text-blue-700 mt-1">
                {{ classData.academic_year.name }}
              </p>
            </div>
          </div>

          <form @submit.prevent="handleVerifyPin" class="p-5 sm:p-6 space-y-4">
            <div
              v-if="verifyError"
              class="p-3 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700"
            >
              {{ verifyError }}
            </div>

            <!-- Searchable Teacher Select -->
            <div class="space-y-1.5 relative" ref="teacherDropdownRef">
              <label class="block text-sm font-semibold text-slate-700">Guru Pengajar</label>
              <div class="relative">
                <input
                  v-model="teacherSearchQuery"
                  type="text"
                  placeholder="Cari & pilih nama guru..."
                  autocomplete="off"
                  @focus="teacherDropdownOpen = true"
                  @input="onTeacherSearchInput"
                  class="w-full min-h-[46px] pl-3.5 pr-10 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  @click="teacherDropdownOpen = !teacherDropdownOpen"
                  class="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label="Toggle daftar guru"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <div
                v-if="teacherDropdownOpen"
                class="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100"
              >
                <div v-if="filteredTeachers.length === 0" class="p-3 text-sm text-slate-500 text-center">
                  Nama guru tidak ditemukan
                </div>
                <button
                  v-for="t in filteredTeachers"
                  :key="t.id"
                  type="button"
                  @click="selectTeacher(t)"
                  class="w-full text-left px-3.5 py-3 text-sm hover:bg-blue-50 flex items-center justify-between gap-2 transition-colors min-h-[44px]"
                  :class="selectedTeacherId === t.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-800'"
                >
                  <span class="truncate">{{ t.full_name }}</span>
                  <span v-if="t.nip" class="text-xs text-slate-400 shrink-0">{{ t.nip }}</span>
                </button>
              </div>
            </div>

            <!-- 6-Digit PIN Input -->
            <div class="space-y-1.5">
              <label for="teacher-pin-input" class="block text-sm font-semibold text-slate-700">
                PIN Presensi (6 Digit)
              </label>
              <div class="relative">
                <input
                  id="teacher-pin-input"
                  v-model="pinInput"
                  :type="showPin ? 'text' : 'password'"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  maxlength="6"
                  autocomplete="off"
                  placeholder="••••••"
                  @input="onPinInput"
                  class="w-full min-h-[48px] pl-4 pr-12 py-2.5 text-lg tracking-[0.35em] font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  @click="showPin = !showPin"
                  class="absolute inset-y-0 right-0 px-3.5 flex items-center text-slate-500 hover:text-slate-700 min-w-[44px] justify-center"
                  :aria-label="showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'"
                >
                  <svg v-if="showPin" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <BaseButton
              type="submit"
              variant="primary"
              class="w-full min-h-[48px] text-base font-semibold rounded-xl"
              :loading="verifyingPin"
              :disabled="verifyingPin || !selectedTeacherId || pinInput.length !== 6"
            >
              Lanjutkan
            </BaseButton>

            <p class="text-xs text-center text-slate-500 pt-1">
              Gunakan PIN presensi yang diberikan oleh administrator sekolah.
            </p>
          </form>
        </div>
      </div>

      <!-- STAGE 2: Lesson Info (Subject & Periods) -->
      <div v-else-if="stage === 'setup'" class="space-y-4 pb-6">
        <div v-if="loadingContext" class="py-12 flex flex-col items-center justify-center space-y-3">
          <div class="animate-spin rounded-full h-9 w-9 border-2 border-slate-200 border-t-blue-600"></div>
          <p class="text-sm text-slate-500">Memuat data pelajaran dan daftar siswa...</p>
        </div>

        <template v-else>
          <div
            v-if="setupError"
            class="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"
          >
            {{ setupError }}
          </div>

          <!-- Empty Roster Warning -->
          <div
            v-if="rosterStudents.length === 0"
            class="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center space-y-2"
          >
            <p class="text-sm font-bold text-amber-900">Daftar Siswa Kosong</p>
            <p class="text-xs sm:text-sm text-amber-800 leading-relaxed">
              Tidak ada siswa aktif yang terdaftar pada kelas ini untuk tahun ajaran berjalan. Silakan hubungi administrator sekolah.
            </p>
          </div>

          <!-- Subject Selection -->
          <section class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 shadow-xs">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold text-slate-900">Mata Pelajaran</h2>
              <span class="text-xs text-red-600 font-medium">Wajib</span>
            </div>

            <div class="relative" ref="subjectDropdownRef">
              <div class="relative">
                <input
                  v-model="subjectSearchQuery"
                  type="text"
                  placeholder="Cari & pilih mata pelajaran..."
                  autocomplete="off"
                  @focus="subjectDropdownOpen = true"
                  @input="onSubjectSearchInput"
                  class="w-full min-h-[46px] pl-3.5 pr-10 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  @click="subjectDropdownOpen = !subjectDropdownOpen"
                  class="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label="Toggle daftar mata pelajaran"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <div
                v-if="subjectDropdownOpen"
                class="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100"
              >
                <div v-if="filteredSubjects.length === 0" class="p-3 text-sm text-slate-500 text-center">
                  Mata pelajaran tidak ditemukan
                </div>
                <button
                  v-for="sub in filteredSubjects"
                  :key="sub.id"
                  type="button"
                  @click="selectSubject(sub)"
                  class="w-full text-left px-3.5 py-3 text-sm hover:bg-blue-50 flex items-center justify-between gap-2 transition-colors min-h-[44px]"
                  :class="selectedSubjectId === sub.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-800'"
                >
                  <span class="truncate">{{ sub.name }}</span>
                  <span v-if="sub.code" class="text-xs text-slate-400 shrink-0">{{ sub.code }}</span>
                </button>
              </div>
            </div>
          </section>

          <!-- Multi-Period Checkbox Grid -->
          <section class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 shadow-xs">
            <div class="flex items-center justify-between gap-2">
              <div>
                <h2 class="text-sm font-bold text-slate-900">Jam Pelajaran</h2>
                <p class="text-xs text-slate-500 mt-0.5">Pilih satu atau beberapa jam pelajaran yang diajar.</p>
              </div>
              <span
                v-if="selectedPeriodIds.length > 0"
                class="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"
              >
                {{ selectedPeriodIds.length }} dipilih
              </span>
            </div>

            <div
              v-if="!currentLessonPeriod"
              class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600"
            >
              Saat ini tidak ada jam pelajaran yang sedang berlangsung. Anda tetap dapat memilih jam pelajaran yang tersedia hari ini.
            </div>

            <div
              v-if="availablePeriods.length === 0"
              class="p-4 text-center text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl"
            >
              Belum ada jam pelajaran aktif yang tersedia.
            </div>

            <div v-else class="grid grid-cols-2 min-[360px]:grid-cols-3 gap-2">
              <button
                v-for="period in availablePeriods"
                :key="period.id"
                type="button"
                :disabled="isPeriodDisabled(period)"
                @click="togglePeriod(period)"
                class="relative text-left p-2.5 rounded-xl border transition-all min-h-[76px] flex flex-col justify-between"
                :class="periodCardClass(period)"
              >
                <div class="flex items-start justify-between gap-1">
                  <span class="text-xs sm:text-sm font-bold leading-tight">
                    Jam {{ period.period_number }}
                  </span>
                  <span
                    class="h-4 w-4 rounded border flex items-center justify-center shrink-0 mt-0.5"
                    :class="periodCheckboxClass(period)"
                  >
                    <svg
                      v-if="selectedPeriodIds.includes(period.id)"
                      class="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="3"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </div>

                <p class="text-[11px] opacity-80 tabular-nums mt-1">
                  {{ formatTimeShort(period.start_time) }} - {{ formatTimeShort(period.end_time) }}
                </p>

                <span
                  class="mt-1 inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded w-fit"
                  :class="periodBadgeClass(period)"
                >
                  {{ periodStatusLabel(period) }}
                </span>
              </button>
            </div>

            <p class="text-xs text-slate-500 bg-blue-50/70 border border-blue-100 rounded-xl p-2.5">
              Status kehadiran siswa akan diterapkan pada seluruh jam pelajaran yang dipilih.
            </p>
          </section>

          <BaseButton
            variant="primary"
            class="w-full min-h-[48px] text-base font-semibold rounded-xl"
            :disabled="!canProceedToAttendance"
            @click="goToAttendanceStage"
          >
            Lanjutkan ke Presensi ({{ rosterStudents.length }} Siswa)
          </BaseButton>
        </template>
      </div>

      <!-- STAGE 3: Student Attendance List -->
      <div v-else-if="stage === 'attendance'" class="space-y-3 pb-28">
        <!-- Lesson Summary Card -->
        <div class="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs space-y-2">
          <div class="flex items-center justify-between gap-2">
            <button
              type="button"
              @click="stage = 'setup'"
              class="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 min-h-[36px] px-1"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Ubah Mapel / Jam
            </button>
            <span class="text-xs font-semibold text-slate-500">
              {{ rosterStudents.length }} Siswa Aktif
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span class="font-bold text-slate-900">{{ selectedSubject?.name }}</span>
            <span class="text-slate-300">&bull;</span>
            <span class="text-blue-700 font-semibold">{{ selectedPeriodsLabel }}</span>
          </div>
        </div>

        <!-- Roster Changed Alert -->
        <div
          v-if="rosterChangedNotice"
          class="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs sm:text-sm text-amber-900 space-y-1"
        >
          <p class="font-bold">Daftar Siswa Diperbarui</p>
          <p>{{ rosterChangedNotice }}</p>
        </div>

        <!-- Live Summary -->
        <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
          <div class="grid grid-cols-5 gap-1.5 text-center">
            <div class="rounded-lg bg-emerald-50 border border-emerald-100 py-1.5 px-1">
              <p class="text-[11px] font-medium text-emerald-700">Hadir</p>
              <p class="text-base font-bold text-emerald-800">{{ attendanceSummary.HADIR }}</p>
            </div>
            <div class="rounded-lg bg-amber-50 border border-amber-100 py-1.5 px-1">
              <p class="text-[11px] font-medium text-amber-700">Telat</p>
              <p class="text-base font-bold text-amber-800">{{ attendanceSummary.TERLAMBAT }}</p>
            </div>
            <div class="rounded-lg bg-blue-50 border border-blue-100 py-1.5 px-1">
              <p class="text-[11px] font-medium text-blue-700">Izin</p>
              <p class="text-base font-bold text-blue-800">{{ attendanceSummary.IZIN }}</p>
            </div>
            <div class="rounded-lg bg-slate-100 border border-slate-200 py-1.5 px-1">
              <p class="text-[11px] font-medium text-slate-600">Sakit</p>
              <p class="text-base font-bold text-slate-800">{{ attendanceSummary.SAKIT }}</p>
            </div>
            <div class="rounded-lg bg-red-50 border border-red-100 py-1.5 px-1">
              <p class="text-[11px] font-medium text-red-700">Alpa</p>
              <p class="text-base font-bold text-red-800">{{ attendanceSummary.ALPA }}</p>
            </div>
          </div>
        </div>

        <!-- Search, Filter & Mark All Present -->
        <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-2.5">
          <div class="flex items-center gap-2">
            <div class="relative flex-1">
              <input
                v-model="studentSearchQuery"
                type="text"
                placeholder="Cari nama atau NIS siswa..."
                class="w-full min-h-[42px] pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <svg class="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              type="button"
              @click="requestMarkAllPresent"
              class="shrink-0 min-h-[42px] px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
            >
              Tandai Semua Hadir
            </button>
          </div>

          <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <button
              v-for="f in studentFilters"
              :key="f.value"
              type="button"
              @click="studentFilter = f.value"
              class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap min-h-[34px]"
              :class="studentFilter === f.value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            >
              {{ f.label }}
            </button>
          </div>

          <!-- Legend -->
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span><strong class="text-emerald-700">H</strong>: Hadir</span>
            <span><strong class="text-amber-700">T</strong>: Terlambat</span>
            <span><strong class="text-blue-700">I</strong>: Izin</span>
            <span><strong class="text-slate-700">S</strong>: Sakit</span>
            <span><strong class="text-red-700">A</strong>: Alpa</span>
          </div>
        </div>

        <!-- Student Rows -->
        <div v-if="filteredStudents.length === 0" class="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
          Tidak ada siswa yang sesuai dengan filter atau pencarian.
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="student in filteredStudents"
            :key="student.student_id"
            class="bg-white rounded-2xl border p-3.5 shadow-xs space-y-2.5"
            :class="newStudentIds.has(student.student_id) ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-xs font-bold text-slate-400 tabular-nums">{{ student.orderNumber }}.</span>
                  <p class="text-sm font-semibold text-slate-900 break-words leading-snug">
                    {{ student.full_name }}
                  </p>
                  <span
                    v-if="newStudentIds.has(student.student_id)"
                    class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800"
                  >
                    Baru
                  </span>
                </div>
                <p v-if="student.nis" class="text-xs text-slate-400 mt-0.5 tabular-nums">
                  NIS: {{ student.nis }}
                </p>
              </div>

              <button
                type="button"
                @click="toggleNoteField(student.student_id)"
                class="shrink-0 min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors"
                :class="hasStudentNote(student.student_id) || expandedNoteIds.has(student.student_id)
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'"
              >
                {{ hasStudentNote(student.student_id) ? 'Catatan ✓' : '+ Catatan' }}
              </button>
            </div>

            <!-- 5 Status Buttons -->
            <div class="grid grid-cols-5 gap-1.5">
              <button
                v-for="opt in statusOptions"
                :key="opt.value"
                type="button"
                @click="setStudentStatus(student.student_id, opt.value)"
                class="min-h-[44px] rounded-xl font-bold text-sm border transition-all flex items-center justify-center"
                :class="getStudentStatus(student.student_id) === opt.value ? opt.activeClass : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'"
                :aria-label="`${student.full_name}: ${opt.label}`"
              >
                {{ opt.short }}
              </button>
            </div>

            <!-- Optional Note Input -->
            <div v-if="expandedNoteIds.has(student.student_id)" class="pt-1">
              <input
                :value="getStudentNote(student.student_id)"
                @input="setStudentNote(student.student_id, $event.target.value)"
                type="text"
                maxlength="500"
                placeholder="Catatan singkat (opsional, maks. 500 karakter)..."
                class="w-full min-h-[40px] px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        <!-- Optional Session Notes -->
        <div class="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-1.5">
          <label for="session-notes" class="block text-xs font-semibold text-slate-700">
            Catatan Pertemuan (Opsional)
          </label>
          <textarea
            id="session-notes"
            v-model="sessionNotes"
            rows="2"
            maxlength="1000"
            placeholder="Materi atau catatan singkat kelas (opsional)..."
            class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
          ></textarea>
        </div>

        <!-- Sticky Bottom Action -->
        <div class="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div class="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {{ rosterStudents.length }} siswa &middot; {{ selectedPeriodIds.length }} jam pelajaran
              </p>
              <p v-if="!isSummaryComplete" class="text-[11px] text-red-600 font-medium">
                Status siswa belum lengkap
              </p>
            </div>
            <BaseButton
              variant="primary"
              class="shrink-0 min-h-[46px] px-5 font-semibold rounded-xl"
              :disabled="!canSubmitAttendance"
              @click="openConfirmModal"
            >
              Simpan Presensi
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- STAGE 4: Success Page -->
      <div
        v-else-if="stage === 'success' && submissionResult"
        class="flex-1 flex items-center justify-center py-4"
      >
        <div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5 text-center">
          <div class="mx-auto h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <svg class="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div class="space-y-1">
            <h1 class="text-xl font-bold text-slate-900">Presensi Berhasil</h1>
            <p class="text-base font-bold text-blue-700">{{ submissionResult.class_name }}</p>
            <p class="text-sm font-semibold text-slate-700">{{ submissionResult.subject_name }}</p>
            <p class="text-xs text-slate-500 pt-1">{{ formatIndonesianDate(submissionResult.attendance_date) }}</p>
          </div>

          <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
            <p class="text-sm font-bold text-slate-900">{{ formatPeriodsText(submissionResult.periods) }}</p>
            <p class="text-xs text-slate-600">
              {{ submissionResult.total_students }} siswa &middot; {{ submissionResult.total_sessions }} jam pelajaran
            </p>
          </div>

          <div class="border border-slate-200 rounded-xl divide-y divide-slate-100 text-sm">
            <div class="flex items-center justify-between px-4 py-2.5">
              <span class="text-slate-600">Hadir</span>
              <span class="font-bold text-emerald-700">{{ submissionResult.summary?.HADIR ?? 0 }}</span>
            </div>
            <div class="flex items-center justify-between px-4 py-2.5">
              <span class="text-slate-600">Terlambat</span>
              <span class="font-bold text-amber-700">{{ submissionResult.summary?.TERLAMBAT ?? 0 }}</span>
            </div>
            <div class="flex items-center justify-between px-4 py-2.5">
              <span class="text-slate-600">Izin</span>
              <span class="font-bold text-blue-700">{{ submissionResult.summary?.IZIN ?? 0 }}</span>
            </div>
            <div class="flex items-center justify-between px-4 py-2.5">
              <span class="text-slate-600">Sakit</span>
              <span class="font-bold text-slate-700">{{ submissionResult.summary?.SAKIT ?? 0 }}</span>
            </div>
            <div class="flex items-center justify-between px-4 py-2.5">
              <span class="text-slate-600">Alpa</span>
              <span class="font-bold text-red-700">{{ submissionResult.summary?.ALPA ?? 0 }}</span>
            </div>
          </div>

          <p class="text-xs text-slate-500">
            Disimpan pukul {{ formatWibTime(submissionResult.submitted_at) }} WIB
          </p>

          <div class="space-y-2.5 pt-1">
            <BaseButton
              variant="primary"
              class="w-full min-h-[48px] font-semibold rounded-xl"
              :loading="loadingContext"
              @click="handlePresensiLagi"
            >
              Presensi Lagi
            </BaseButton>
            <BaseButton
              variant="outline"
              class="w-full min-h-[46px] font-semibold rounded-xl"
              @click="handleFinishSession"
            >
              Selesai
            </BaseButton>
          </div>
        </div>
      </div>
    </main>

    <!-- Submission Confirmation Modal -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 z-50 bg-slate-900/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div class="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold text-slate-900">Konfirmasi Simpan Presensi</h2>

        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs sm:text-sm">
          <div class="flex justify-between gap-2">
            <span class="text-slate-500">Kelas</span>
            <span class="font-semibold text-slate-900">{{ contextData?.class_info?.name }}</span>
          </div>
          <div class="flex justify-between gap-2">
            <span class="text-slate-500">Guru</span>
            <span class="font-semibold text-slate-900 text-right">{{ contextData?.teacher?.full_name }}</span>
          </div>
          <div class="flex justify-between gap-2">
            <span class="text-slate-500">Mata Pelajaran</span>
            <span class="font-semibold text-slate-900 text-right">{{ selectedSubject?.name }}</span>
          </div>
          <div class="flex justify-between gap-2">
            <span class="text-slate-500">Tanggal</span>
            <span class="font-semibold text-slate-900">{{ formattedAttendanceDate }}</span>
          </div>
          <div class="flex justify-between gap-2">
            <span class="text-slate-500">Jam Pelajaran</span>
            <span class="font-semibold text-blue-700 text-right">{{ selectedPeriodsLabel }}</span>
          </div>
          <div class="flex justify-between gap-2">
            <span class="text-slate-500">Total Siswa</span>
            <span class="font-semibold text-slate-900">{{ rosterStudents.length }} siswa</span>
          </div>
        </div>

        <div class="grid grid-cols-5 gap-1.5 text-center text-xs">
          <div class="bg-emerald-50 rounded-lg py-1.5">
            <p class="text-emerald-700">Hadir</p>
            <p class="font-bold text-emerald-900">{{ attendanceSummary.HADIR }}</p>
          </div>
          <div class="bg-amber-50 rounded-lg py-1.5">
            <p class="text-amber-700">Telat</p>
            <p class="font-bold text-amber-900">{{ attendanceSummary.TERLAMBAT }}</p>
          </div>
          <div class="bg-blue-50 rounded-lg py-1.5">
            <p class="text-blue-700">Izin</p>
            <p class="font-bold text-blue-900">{{ attendanceSummary.IZIN }}</p>
          </div>
          <div class="bg-slate-100 rounded-lg py-1.5">
            <p class="text-slate-600">Sakit</p>
            <p class="font-bold text-slate-900">{{ attendanceSummary.SAKIT }}</p>
          </div>
          <div class="bg-red-50 rounded-lg py-1.5">
            <p class="text-red-700">Alpa</p>
            <p class="font-bold text-red-900">{{ attendanceSummary.ALPA }}</p>
          </div>
        </div>

        <div
          v-if="allStudentsPresent"
          class="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800"
        >
          Seluruh siswa ditandai hadir. Pastikan Anda telah memeriksa kehadiran siswa.
        </div>

        <p class="text-xs text-slate-600">
          Pastikan data kehadiran siswa sudah benar. Presensi akan disimpan untuk seluruh jam pelajaran yang dipilih.
        </p>

        <div v-if="submitError" class="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {{ submitError }}
        </div>

        <div class="grid grid-cols-2 gap-2.5 pt-1">
          <BaseButton
            variant="outline"
            class="min-h-[46px] rounded-xl font-semibold"
            :disabled="submitting"
            @click="showConfirmModal = false"
          >
            Kembali
          </BaseButton>
          <BaseButton
            variant="primary"
            class="min-h-[46px] rounded-xl font-semibold"
            :loading="submitting"
            :disabled="submitting"
            @click="handleSubmitAttendance"
          >
            Konfirmasi dan Simpan
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Session Expired Re-verification Modal -->
    <div
      v-if="showSessionExpiredModal"
      class="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
    >
      <div class="w-full max-w-sm bg-white rounded-2xl p-5 space-y-4 shadow-xl">
        <h2 class="text-base font-bold text-slate-900">Sesi Presensi Berakhir</h2>
        <p class="text-xs sm:text-sm text-slate-600">
          Sesi sementara Anda telah habis. Masukkan kembali PIN presensi guru untuk melanjutkan tanpa kehilangan data yang sudah diisi.
        </p>

        <div v-if="reauthError" class="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {{ reauthError }}
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-semibold text-slate-700">Guru</label>
          <p class="text-sm font-bold text-slate-900 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
            {{ contextData?.teacher?.full_name || verifiedTeacher?.full_name }}
          </p>
        </div>

        <div class="space-y-1.5">
          <label for="reauth-pin" class="block text-xs font-semibold text-slate-700">PIN Presensi (6 Digit)</label>
          <input
            id="reauth-pin"
            v-model="reauthPin"
            type="password"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="6"
            autocomplete="off"
            placeholder="••••••"
            @input="onReauthPinInput"
            class="w-full min-h-[46px] px-4 py-2 text-lg tracking-[0.35em] font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <BaseButton
            variant="outline"
            class="min-h-[44px] rounded-xl"
            :disabled="reauthing"
            @click="handleFinishSession"
          >
            Keluar
          </BaseButton>
          <BaseButton
            variant="primary"
            class="min-h-[44px] rounded-xl"
            :loading="reauthing"
            :disabled="reauthing || reauthPin.length !== 6"
            @click="handleReverifyPin"
          >
            Verifikasi
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Generic Action Confirmation Modal (Mark All Present / Switch Teacher) -->
    <div
      v-if="actionDialog"
      class="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
    >
      <div class="w-full max-w-sm bg-white rounded-2xl p-5 space-y-4 shadow-xl">
        <h2 class="text-base font-bold text-slate-900">{{ actionDialog.title }}</h2>
        <p class="text-sm text-slate-600">{{ actionDialog.message }}</p>
        <div class="grid grid-cols-2 gap-2.5">
          <BaseButton variant="outline" class="min-h-[44px] rounded-xl" @click="actionDialog = null">
            Batal
          </BaseButton>
          <BaseButton variant="primary" class="min-h-[44px] rounded-xl" @click="confirmActionDialog">
            Ya, Lanjutkan
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import lessonAttendanceService from '@/services/api/lessonAttendance.service'

const route = useRoute()

// Stage: 'verify' | 'setup' | 'attendance' | 'success'
const stage = ref('verify')

// QR & Initial state
const loadingQr = ref(true)
const qrError = ref(null)
const classData = ref(null)

// Stage 1: Teacher Verification
const teacherSearchQuery = ref('')
const teacherDropdownOpen = ref(false)
const teacherDropdownRef = ref(null)
const selectedTeacherId = ref(null)
const pinInput = ref('')
const showPin = ref(false)
const verifyingPin = ref(false)
const verifyError = ref('')

// Ephemeral in-memory attendance session (never stored in localStorage/sessionStorage)
const attendanceToken = ref('')
const verifiedTeacher = ref(null)

// Stage 2 & 3: Context & Form State
const loadingContext = ref(false)
const contextData = ref(null)
const setupError = ref('')

const subjectSearchQuery = ref('')
const subjectDropdownOpen = ref(false)
const subjectDropdownRef = ref(null)
const selectedSubjectId = ref(null)
const selectedPeriodIds = ref([])
const sessionNotes = ref('')

// Student attendance map: { [student_id]: { status: 'HADIR', notes: '' } }
const studentInputs = ref({})
const expandedNoteIds = ref(new Set())
const newStudentIds = ref(new Set())
const rosterChangedNotice = ref('')
const studentSearchQuery = ref('')
const studentFilter = ref('ALL')

// Confirmation & Submission
const showConfirmModal = ref(false)
const submitting = ref(false)
const submitError = ref('')
const submissionResult = ref(null)

// Session Expired Re-auth
const showSessionExpiredModal = ref(false)
const reauthPin = ref('')
const reauthing = ref(false)
const reauthError = ref('')

// Generic confirmation dialog
const actionDialog = ref(null)

const statusOptions = [
  {
    value: 'HADIR',
    short: 'H',
    label: 'Hadir',
    activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
  },
  {
    value: 'TERLAMBAT',
    short: 'T',
    label: 'Terlambat',
    activeClass: 'bg-amber-500 text-white border-amber-500 shadow-xs'
  },
  {
    value: 'IZIN',
    short: 'I',
    label: 'Izin',
    activeClass: 'bg-blue-600 text-white border-blue-600 shadow-xs'
  },
  {
    value: 'SAKIT',
    short: 'S',
    label: 'Sakit',
    activeClass: 'bg-slate-600 text-white border-slate-600 shadow-xs'
  },
  {
    value: 'ALPA',
    short: 'A',
    label: 'Alpa',
    activeClass: 'bg-red-600 text-white border-red-600 shadow-xs'
  }
]

const studentFilters = [
  { value: 'ALL', label: 'Semua' },
  { value: 'ABSENT', label: 'Tidak Hadir' },
  { value: 'TERLAMBAT', label: 'Terlambat' }
]

const qrToken = computed(() => String(route.params.token || '').trim())

const filteredTeachers = computed(() => {
  const list = classData.value?.teachers || []
  const q = teacherSearchQuery.value.trim().toLowerCase()
  if (!q) return list
  return list.filter((t) =>
    String(t.full_name || '').toLowerCase().includes(q) ||
    String(t.nip || '').toLowerCase().includes(q)
  )
})

const subjectsList = computed(() => contextData.value?.subjects || [])
const filteredSubjects = computed(() => {
  const q = subjectSearchQuery.value.trim().toLowerCase()
  if (!q) return subjectsList.value
  return subjectsList.value.filter((s) =>
    String(s.name || '').toLowerCase().includes(q) ||
    String(s.code || '').toLowerCase().includes(q)
  )
})

const selectedSubject = computed(() =>
  subjectsList.value.find((s) => s.id === selectedSubjectId.value) || null
)

const availablePeriods = computed(() => contextData.value?.available_lesson_periods || [])
const currentLessonPeriod = computed(() => contextData.value?.current_lesson_period || null)

const rosterStudents = computed(() => contextData.value?.students || contextData.value?.student_roster || [])

const formattedAttendanceDate = computed(() => {
  const dateStr = contextData.value?.attendance_date
  return dateStr ? formatIndonesianDate(dateStr) : ''
})

const selectedPeriodsLabel = computed(() => {
  const map = new Map(availablePeriods.value.map((p) => [p.id, p.period_number]))
  const nums = selectedPeriodIds.value
    .map((id) => map.get(id))
    .filter(Boolean)
    .sort((a, b) => a - b)
  if (nums.length === 0) return '-'
  if (nums.length === 1) return `Jam ${nums[0]}`
  if (nums.length === 2) return `Jam ${nums[0]} dan Jam ${nums[1]}`
  return `Jam ${nums.slice(0, -1).join(', ')} dan Jam ${nums[nums.length - 1]}`
})

const attendanceSummary = computed(() => {
  const counts = { HADIR: 0, TERLAMBAT: 0, IZIN: 0, SAKIT: 0, ALPA: 0 }
  for (const s of rosterStudents.value) {
    const st = studentInputs.value[s.student_id]?.status
    if (st && Object.prototype.hasOwnProperty.call(counts, st)) {
      counts[st] += 1
    }
  }
  return counts
})

const isSummaryComplete = computed(() => {
  const total = rosterStudents.value.length
  if (total === 0) return false
  const sum =
    attendanceSummary.value.HADIR +
    attendanceSummary.value.TERLAMBAT +
    attendanceSummary.value.IZIN +
    attendanceSummary.value.SAKIT +
    attendanceSummary.value.ALPA
  return sum === total
})

const allStudentsPresent = computed(() =>
  rosterStudents.value.length > 0 && attendanceSummary.value.HADIR === rosterStudents.value.length
)

const canProceedToAttendance = computed(() =>
  Boolean(selectedSubjectId.value) &&
  selectedPeriodIds.value.length > 0 &&
  rosterStudents.value.length > 0
)

const canSubmitAttendance = computed(() =>
  Boolean(selectedSubjectId.value) &&
  selectedPeriodIds.value.length > 0 &&
  rosterStudents.value.length > 0 &&
  isSummaryComplete.value &&
  !submitting.value &&
  !showSessionExpiredModal.value
)

const filteredStudents = computed(() => {
  const q = studentSearchQuery.value.trim().toLowerCase()
  return rosterStudents.value
    .map((s, idx) => ({ ...s, orderNumber: idx + 1 }))
    .filter((s) => {
      const status = getStudentStatus(s.student_id)
      if (studentFilter.value === 'ABSENT' && (status === 'HADIR' || status === 'TERLAMBAT')) {
        return false
      }
      if (studentFilter.value === 'TERLAMBAT' && status !== 'TERLAMBAT') {
        return false
      }
      if (q) {
        const nameMatch = String(s.full_name || '').toLowerCase().includes(q)
        const nisMatch = String(s.nis || '').toLowerCase().includes(q)
        if (!nameMatch && !nisMatch) return false
      }
      return true
    })
})

const hasUnsavedChanges = computed(() => {
  if (stage.value !== 'setup' && stage.value !== 'attendance') return false
  if (selectedSubjectId.value || sessionNotes.value.trim()) return true
  return rosterStudents.value.some((s) => {
    const entry = studentInputs.value[s.student_id]
    return entry && (entry.status !== 'HADIR' || Boolean(entry.notes && entry.notes.trim()))
  })
})

// Formatting Helpers
function formatIndonesianDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(dt)
}

function formatTimeShort(timeStr) {
  if (!timeStr) return ''
  return String(timeStr).slice(0, 5)
}

function formatWibTime(isoStr) {
  if (!isoStr) return ''
  const dt = new Date(isoStr)
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta'
  }).format(dt).replace(':', '.')
}

function formatPeriodsText(periods) {
  if (!Array.isArray(periods) || periods.length === 0) return '-'
  const nums = periods.map((p) => p.period_number).sort((a, b) => a - b)
  if (nums.length === 1) return `Jam ${nums[0]}`
  if (nums.length === 2) return `Jam ${nums[0]} dan Jam ${nums[1]}`
  return `Jam ${nums.slice(0, -1).join(', ')} dan Jam ${nums[nums.length - 1]}`
}

// Period Helpers
function isPeriodDisabled(period) {
  return period.attendance_state !== 'AVAILABLE'
}

function periodStatusLabel(period) {
  if (period.attendance_state === 'ALREADY_SUBMITTED') return 'Sudah Diabsen'
  if (period.attendance_state === 'CANCELLED') return 'Dibatalkan'
  if (period.is_current) return 'Berlangsung'
  if (period.is_future) return 'Berikutnya'
  return 'Tersedia'
}

function periodCardClass(period) {
  if (period.attendance_state === 'ALREADY_SUBMITTED') {
    return 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
  }
  if (period.attendance_state === 'CANCELLED') {
    return 'bg-red-50/60 border-red-200 text-red-400 cursor-not-allowed'
  }
  if (period.attendance_state === 'FUTURE') {
    return 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
  }
  if (selectedPeriodIds.value.includes(period.id)) {
    return 'bg-blue-50 border-blue-600 text-blue-950 ring-1 ring-blue-600'
  }
  if (period.is_current) {
    return 'bg-white border-blue-300 text-slate-900 hover:border-blue-500'
  }
  return 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
}

function periodCheckboxClass(period) {
  if (isPeriodDisabled(period)) return 'border-slate-300 bg-slate-200'
  if (selectedPeriodIds.value.includes(period.id)) return 'border-blue-600 bg-blue-600'
  return 'border-slate-300 bg-white'
}

function periodBadgeClass(period) {
  if (period.attendance_state === 'ALREADY_SUBMITTED') return 'bg-slate-200 text-slate-600'
  if (period.attendance_state === 'CANCELLED') return 'bg-red-100 text-red-700'
  if (period.attendance_state === 'FUTURE') return 'bg-slate-200 text-slate-500'
  if (period.is_current) return 'bg-emerald-100 text-emerald-800'
  return 'bg-slate-100 text-slate-600'
}

function togglePeriod(period) {
  if (isPeriodDisabled(period)) return
  const idx = selectedPeriodIds.value.indexOf(period.id)
  if (idx >= 0) {
    selectedPeriodIds.value.splice(idx, 1)
  } else {
    selectedPeriodIds.value.push(period.id)
  }
}

// Teacher Select & PIN
function onTeacherSearchInput() {
  teacherDropdownOpen.value = true
  const current = (classData.value?.teachers || []).find((t) => t.id === selectedTeacherId.value)
  if (!current || current.full_name !== teacherSearchQuery.value) {
    selectedTeacherId.value = null
  }
}

function selectTeacher(teacher) {
  selectedTeacherId.value = teacher.id
  teacherSearchQuery.value = teacher.full_name
  teacherDropdownOpen.value = false
  verifyError.value = ''
}

function onPinInput(e) {
  pinInput.value = String(e.target.value || '').replace(/\D/g, '').slice(0, 6)
}

function onReauthPinInput(e) {
  reauthPin.value = String(e.target.value || '').replace(/\D/g, '').slice(0, 6)
}

// Subject Select
function onSubjectSearchInput() {
  subjectDropdownOpen.value = true
  const current = subjectsList.value.find((s) => s.id === selectedSubjectId.value)
  if (!current || current.name !== subjectSearchQuery.value) {
    selectedSubjectId.value = null
  }
}

function selectSubject(subject) {
  selectedSubjectId.value = subject.id
  subjectSearchQuery.value = subject.name
  subjectDropdownOpen.value = false
}

// Student Input Helpers
function initStudentInputs(students, preserveExisting = false) {
  const prev = preserveExisting ? studentInputs.value : {}
  const next = {}
  const added = new Set()

  for (const s of students) {
    if (preserveExisting && prev[s.student_id]) {
      next[s.student_id] = { ...prev[s.student_id] }
    } else {
      next[s.student_id] = { status: 'HADIR', notes: '' }
      if (preserveExisting) {
        added.add(s.student_id)
      }
    }
  }

  studentInputs.value = next
  if (preserveExisting) {
    newStudentIds.value = added
  } else {
    newStudentIds.value = new Set()
    expandedNoteIds.value = new Set()
  }
}

function getStudentStatus(studentId) {
  return studentInputs.value[studentId]?.status || 'HADIR'
}

function setStudentStatus(studentId, status) {
  if (!studentInputs.value[studentId]) {
    studentInputs.value[studentId] = { status, notes: '' }
  } else {
    studentInputs.value[studentId].status = status
  }
}

function getStudentNote(studentId) {
  return studentInputs.value[studentId]?.notes || ''
}

function setStudentNote(studentId, val) {
  if (!studentInputs.value[studentId]) {
    studentInputs.value[studentId] = { status: 'HADIR', notes: '' }
  }
  studentInputs.value[studentId].notes = String(val || '').slice(0, 500)
}

function hasStudentNote(studentId) {
  return Boolean(studentInputs.value[studentId]?.notes && studentInputs.value[studentId].notes.trim())
}

function toggleNoteField(studentId) {
  const next = new Set(expandedNoteIds.value)
  if (next.has(studentId)) {
    next.delete(studentId)
  } else {
    next.add(studentId)
  }
  expandedNoteIds.value = next
}

function requestMarkAllPresent() {
  const hasChanges = rosterStudents.value.some((s) => {
    const entry = studentInputs.value[s.student_id]
    return entry && entry.status !== 'HADIR'
  })
  if (!hasChanges) return

  actionDialog.value = {
    title: 'Tandai Semua Hadir',
    message: 'Semua status siswa pada daftar ini akan dikembalikan menjadi Hadir. Lanjutkan?',
    onConfirm: () => {
      for (const s of rosterStudents.value) {
        if (studentInputs.value[s.student_id]) {
          studentInputs.value[s.student_id].status = 'HADIR'
        }
      }
    }
  }
}

function requestSwitchTeacher() {
  if (!hasUnsavedChanges.value) {
    handleFinishSession()
    return
  }
  actionDialog.value = {
    title: 'Ganti Guru',
    message: 'Terdapat data presensi yang belum disimpan. Yakin ingin keluar dan mengganti guru?',
    onConfirm: () => {
      handleFinishSession()
    }
  }
}

function confirmActionDialog() {
  const fn = actionDialog.value?.onConfirm
  actionDialog.value = null
  if (typeof fn === 'function') fn()
}

// API Calls
async function validateQr() {
  loadingQr.value = true
  qrError.value = null
  classData.value = null

  if (!qrToken.value) {
    qrError.value = {
      type: 'invalid',
      title: 'QR Code Tidak Valid',
      message: 'QR Code presensi ini sudah tidak berlaku. Silakan gunakan QR Code terbaru yang tersedia di kelas.'
    }
    loadingQr.value = false
    return
  }

  try {
    const res = await lessonAttendanceService.resolveClassAttendanceQr(qrToken.value)
    if (res.success) {
      classData.value = res.data
    } else {
      qrError.value = {
        type: 'invalid',
        title: 'QR Code Tidak Valid',
        message: 'QR Code presensi ini sudah tidak berlaku. Silakan gunakan QR Code terbaru yang tersedia di kelas.'
      }
    }
  } catch (err) {
    const code = err?.error_code
    if (code === 'ATTENDANCE_QR_INACTIVE') {
      qrError.value = {
        type: 'inactive',
        title: 'QR Code Nonaktif',
        message: 'QR Code presensi ini sudah tidak berlaku. Silakan gunakan QR Code terbaru yang tersedia di kelas.'
      }
    } else if (code === 'ACTIVE_ACADEMIC_YEAR_NOT_FOUND' || code === 'INVALID_ACADEMIC_YEAR_CONFIGURATION') {
      qrError.value = {
        type: 'config',
        title: 'Konfigurasi Tahun Ajaran',
        message: 'Tahun ajaran aktif belum dikonfigurasi dengan benar. Silakan hubungi administrator sekolah.'
      }
    } else if (code === 'PIN_RATE_LIMITED') {
      qrError.value = {
        type: 'ratelimit',
        title: 'Terlalu Banyak Permintaan',
        message: 'Silakan tunggu beberapa saat sebelum mencoba memindai kembali.'
      }
    } else {
      qrError.value = {
        type: 'invalid',
        title: 'QR Code Tidak Valid',
        message: 'QR Code presensi ini sudah tidak berlaku. Silakan gunakan QR Code terbaru yang tersedia di kelas.'
      }
    }
  } finally {
    loadingQr.value = false
  }
}

async function handleVerifyPin() {
  if (!selectedTeacherId.value || pinInput.value.length !== 6) return
  verifyingPin.value = true
  verifyError.value = ''

  try {
    const res = await lessonAttendanceService.verifyAttendanceTeacherPin(qrToken.value, {
      teacher_id: selectedTeacherId.value,
      pin: pinInput.value
    })
    pinInput.value = '' // Clear PIN immediately from state

    if (res.success && res.data?.attendance_token) {
      attendanceToken.value = res.data.attendance_token
      verifiedTeacher.value = res.data.teacher
      stage.value = 'setup'
      await fetchContext({ preserveInputs: false })
    } else {
      verifyError.value = res.message || 'Verifikasi PIN gagal.'
    }
  } catch (err) {
    pinInput.value = ''
    const code = err?.error_code
    if (code === 'PIN_RATE_LIMITED') {
      verifyError.value = 'Terlalu banyak percobaan PIN gagal. Silakan tunggu 15 menit sebelum mencoba kembali.'
    } else if (code === 'ATTENDANCE_QR_INACTIVE' || code === 'INVALID_QR_TOKEN') {
      verifyError.value = 'QR Code presensi ini sudah tidak berlaku. Silakan scan ulang QR Code kelas.'
    } else {
      verifyError.value = err?.message || 'Nama guru atau PIN presensi tidak valid.'
    }
  } finally {
    verifyingPin.value = false
  }
}

async function fetchContext({ preserveInputs = false } = {}) {
  loadingContext.value = true
  setupError.value = ''

  try {
    const res = await lessonAttendanceService.getLessonAttendanceContext(attendanceToken.value)
    if (res.success) {
      contextData.value = res.data
      const students = res.data.students || res.data.student_roster || []
      initStudentInputs(students, preserveInputs)

      if (!preserveInputs) {
        selectedPeriodIds.value = []
        const current = res.data.available_lesson_periods?.find(
          (p) => p.id === res.data.current_period_id && p.attendance_state === 'AVAILABLE'
        )
        if (current) {
          selectedPeriodIds.value = [current.id]
        }
      } else {
        // Keep only selected period IDs that are still AVAILABLE
        const availIds = new Set(
          (res.data.available_lesson_periods || [])
            .filter((p) => p.attendance_state === 'AVAILABLE')
            .map((p) => p.id)
        )
        selectedPeriodIds.value = selectedPeriodIds.value.filter((id) => availIds.has(id))
      }
    }
  } catch (err) {
    const code = err?.error_code
    if (code === 'ATTENDANCE_TOKEN_EXPIRED' || code === 'ATTENDANCE_TOKEN_INVALID') {
      showSessionExpiredModal.value = true
    } else {
      setupError.value = err?.message || 'Gagal memuat data presensi kelas.'
    }
  } finally {
    loadingContext.value = false
  }
}

function goToAttendanceStage() {
  if (!canProceedToAttendance.value) return
  rosterChangedNotice.value = ''
  submitError.value = ''
  stage.value = 'attendance'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openConfirmModal() {
  if (!canSubmitAttendance.value) return
  submitError.value = ''
  showConfirmModal.value = true
}

async function handleSubmitAttendance() {
  if (submitting.value || !canSubmitAttendance.value) return
  submitting.value = true
  submitError.value = ''

  const payload = {
    subject_id: selectedSubjectId.value,
    lesson_period_ids: [...selectedPeriodIds.value],
    notes: sessionNotes.value.trim() || null,
    students: rosterStudents.value.map((s) => ({
      student_id: s.student_id,
      status: getStudentStatus(s.student_id),
      notes: getStudentNote(s.student_id).trim() || null
    }))
  }

  try {
    const res = await lessonAttendanceService.submitLessonAttendance(attendanceToken.value, payload)
    if (res.success) {
      showConfirmModal.value = false
      submissionResult.value = res.data
      stage.value = 'success'
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  } catch (err) {
    const code = err?.error_code
    if (code === 'ATTENDANCE_TOKEN_EXPIRED' || code === 'ATTENDANCE_TOKEN_INVALID') {
      showConfirmModal.value = false
      showSessionExpiredModal.value = true
    } else if (code === 'ATTENDANCE_ROSTER_CHANGED') {
      showConfirmModal.value = false
      await fetchContext({ preserveInputs: true })
      rosterChangedNotice.value =
        'Daftar siswa kelas ini telah berubah. Siswa yang baru masuk ditandai sebagai "Baru". Silakan periksa kembali sebelum menyimpan presensi.'
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (code === 'ATTENDANCE_ALREADY_EXISTS') {
      submitError.value = err?.message || 'Sebagian jam pelajaran yang dipilih sudah diabsen.'
      await fetchContext({ preserveInputs: true })
    } else if (err?.code === 'ECONNABORTED' || !err?.error_code) {
      // Timeout or uncertain network error: check server state before allowing blind resubmit
      submitError.value = 'Koneksi terputus atau waktu habis. Memeriksa status penyimpanan di server...'
      await fetchContext({ preserveInputs: true })
      const submittedNow = selectedPeriodIds.value.length === 0
      if (submittedNow) {
        submitError.value = 'Sebagian atau seluruh jam pelajaran ternyata sudah tercatat di server. Silakan periksa kembali daftar jam pada tahap sebelumnya.'
      } else {
        submitError.value = 'Status penyimpanan belum dapat dipastikan karena gangguan jaringan. Silakan periksa jam pelajaran atau coba simpan kembali.'
      }
    } else {
      submitError.value = err?.message || 'Gagal menyimpan presensi. Silakan coba lagi.'
    }
  } finally {
    submitting.value = false
  }
}

async function handleReverifyPin() {
  const targetTeacherId = contextData.value?.teacher?.id || verifiedTeacher.value?.id || selectedTeacherId.value
  if (!targetTeacherId || reauthPin.value.length !== 6) return
  reauthing.value = true
  reauthError.value = ''

  try {
    const res = await lessonAttendanceService.verifyAttendanceTeacherPin(qrToken.value, {
      teacher_id: targetTeacherId,
      pin: reauthPin.value
    })
    reauthPin.value = ''
    if (res.success && res.data?.attendance_token) {
      attendanceToken.value = res.data.attendance_token
      showSessionExpiredModal.value = false
      await fetchContext({ preserveInputs: true })
    }
  } catch (err) {
    reauthPin.value = ''
    reauthError.value = err?.message || 'PIN tidak valid. Silakan coba lagi.'
  } finally {
    reauthing.value = false
  }
}

async function handlePresensiLagi() {
  submissionResult.value = null
  selectedSubjectId.value = null
  subjectSearchQuery.value = ''
  selectedPeriodIds.value = []
  sessionNotes.value = ''
  studentSearchQuery.value = ''
  studentFilter.value = 'ALL'
  rosterChangedNotice.value = ''
  stage.value = 'setup'
  await fetchContext({ preserveInputs: false })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleFinishSession() {
  attendanceToken.value = ''
  verifiedTeacher.value = null
  contextData.value = null
  selectedTeacherId.value = null
  teacherSearchQuery.value = ''
  pinInput.value = ''
  reauthPin.value = ''
  selectedSubjectId.value = null
  subjectSearchQuery.value = ''
  selectedPeriodIds.value = []
  sessionNotes.value = ''
  studentInputs.value = {}
  expandedNoteIds.value = new Set()
  newStudentIds.value = new Set()
  submissionResult.value = null
  showConfirmModal.value = false
  showSessionExpiredModal.value = false
  rosterChangedNotice.value = ''
  verifyError.value = ''
  setupError.value = ''
  submitError.value = ''
  stage.value = 'verify'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleClickOutside(event) {
  if (teacherDropdownRef.value && !teacherDropdownRef.value.contains(event.target)) {
    teacherDropdownOpen.value = false
  }
  if (subjectDropdownRef.value && !subjectDropdownRef.value.contains(event.target)) {
    subjectDropdownOpen.value = false
  }
}

function handleBeforeUnload(event) {
  if (hasUnsavedChanges.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('beforeunload', handleBeforeUnload)
  validateQr()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>
