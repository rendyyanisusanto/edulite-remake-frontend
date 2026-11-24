<template>
    <div class="min-h-screen bg-slate-50 flex justify-center font-sans text-slate-800">
        <!-- Mobile Container -->
        <div class="w-full max-w-[480px] bg-white min-h-screen shadow-2xl relative pb-10 flex flex-col">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-b-2xl shadow-sm relative overflow-hidden">
                <!-- Decorative background elements -->
                <div class="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-white opacity-10"></div>
                <div class="absolute bottom-0 right-10 -mb-8 w-24 h-24 rounded-full bg-white opacity-10"></div>
                
                <div v-if="loading && !data" class="flex animate-pulse space-x-4 relative z-10">
                    <div class="rounded-full bg-blue-400/50 h-16 w-16"></div>
                    <div class="flex-1 space-y-3 py-1">
                        <div class="h-4 bg-blue-400/50 rounded w-3/4"></div>
                        <div class="h-3 bg-blue-400/50 rounded w-1/2"></div>
                    </div>
                </div>
                <div v-else-if="data" class="flex items-center gap-5 relative z-10">
                    <img 
                        :src="studentPhoto" 
                        alt="Foto Siswa" 
                        class="w-16 h-16 rounded-full border-[3px] border-white/90 object-cover shadow-md bg-white"
                        @error="handleImageError"
                    />
                    <div>
                        <h1 class="text-xl font-bold leading-tight tracking-tight">{{ data.student.name }}</h1>
                        <p class="text-sm text-blue-100 mt-1 opacity-90">{{ data.student.nis }} &bull; {{ data.student.class_name }}</p>
                        <div class="mt-2.5 inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide backdrop-blur-md border border-white/20">
                            <span v-html="getStatusIcon(data.summary.attendance)" class="flex items-center justify-center"></span>
                            <span class="uppercase">{{ data.summary.attendance }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Last Updated & Live indicator -->
            <div v-if="data" class="px-6 py-3 flex justify-between items-center text-xs text-slate-500 bg-white border-b border-slate-100">
                <span class="flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Update: <span class="font-semibold text-slate-700">{{ data.summary.last_updated }} WIB</span>
                </span>
                <span v-if="polling" class="flex items-center gap-1.5 text-blue-600 font-medium">
                    <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Live
                </span>
            </div>

            <!-- Filters -->
            <div class="px-6 pt-5 pb-3">
                <div class="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
                    <button 
                        v-for="filter in filters" 
                        :key="filter.value"
                        @click="setFilter(filter.value)"
                        :class="[
                            'whitespace-nowrap px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-200',
                            selectedFilter === filter.value 
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 border border-indigo-600' 
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        ]"
                    >
                        {{ filter.label }}
                    </button>
                    <!-- Custom Date Picker -->
                    <input 
                        type="date" 
                        v-model="customDate"
                        @change="setCustomDate"
                        class="px-3 py-1.5 rounded-xl text-[13px] font-medium border border-slate-200 text-slate-600 bg-white shadow-sm hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                </div>
            </div>

            <div v-if="loading && !data" class="p-6 space-y-4 flex-1">
                <div class="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
                <div class="h-48 bg-slate-100 rounded-xl animate-pulse"></div>
            </div>

            <div v-else-if="error" class="p-10 text-center flex-1 flex flex-col items-center justify-center">
                <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h3 class="text-lg font-bold text-slate-800 mb-1">Oops!</h3>
                <p class="text-slate-500 text-sm">{{ error }}</p>
                <button @click="fetchData" class="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Coba Lagi
                </button>
            </div>

            <div v-else-if="data" class="px-5 space-y-5 mt-1 flex-1">
                
                <!-- Kesimpulan Kehadiran Harian -->
                <section v-if="isDaily && dailyConclusion" class="rounded-2xl border p-4 shadow-sm" :class="dailyConclusion.style">
                    <div class="flex items-start gap-3">
                        <span class="text-xl leading-none mt-0.5 shrink-0">{{ dailyConclusion.icon }}</span>
                        <div class="min-w-0">
                            <p class="text-[11px] font-bold uppercase tracking-wider opacity-75">Kesimpulan Kehadiran</p>
                            <h3 class="text-sm font-extrabold mt-0.5">{{ dailyConclusion.title }}</h3>
                            <p class="text-xs leading-relaxed mt-1 opacity-90">{{ dailyConclusion.message }}</p>
                        </div>
                    </div>
                </section>

                <!-- KPI Hari Ini (tampilan satu hari) -->
                <section v-if="isDaily" class="grid grid-cols-1 gap-4">
                    <div class="rounded-2xl border p-5 shadow-sm" :class="schoolKpi.box">
                        <div class="flex items-center justify-between">
                            <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Kehadiran Sekolah</p>
                            <span class="text-2xl">{{ schoolKpi.emoji }}</span>
                        </div>
                        <p class="text-2xl font-extrabold mt-1" :class="schoolKpi.text">{{ schoolKpi.label }}</p>
                        <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div class="bg-white/70 rounded-xl px-3 py-2">
                                <p class="text-[11px] text-slate-500">Jam Masuk</p>
                                <p class="font-bold text-slate-800">{{ schoolAtt?.clock_in || '-' }}</p>
                            </div>
                            <div class="bg-white/70 rounded-xl px-3 py-2">
                                <p class="text-[11px] text-slate-500">Jam Pulang</p>
                                <p class="font-bold text-slate-800">{{ schoolAtt?.clock_out || '-' }}</p>
                            </div>
                        </div>
                        <p v-if="schoolAtt?.late_minutes" class="text-xs text-amber-700 font-semibold mt-2">Terlambat {{ schoolAtt.late_minutes }} menit</p>
                    </div>

                    <div class="rounded-2xl border p-5 shadow-sm" :class="tahfidzKpi.box">
                        <div class="flex items-center justify-between">
                            <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Kehadiran Tahfidz</p>
                            <span class="text-2xl">{{ tahfidzKpi.emoji }}</span>
                        </div>
                        <p class="text-2xl font-extrabold mt-1" :class="tahfidzKpi.text">{{ tahfidzKpi.label }}</p>
                        <p v-if="tahfidzAtt?.time" class="text-sm text-slate-600 mt-1">Dicatat pukul <span class="font-bold">{{ tahfidzAtt.time }}</span></p>
                        <p v-if="tahfidzAtt?.notes" class="text-xs text-slate-500 mt-1">{{ tahfidzAtt.notes }}</p>
                    </div>
                </section>

                <!-- 1a. Presensi Harian (Attendance / RFID) -->
                <section v-if="!isDaily" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                        <h2 class="font-bold text-slate-800 text-[15px]">
                            Presensi Sekolah <span v-if="selectedFilter === 'last7days' || selectedFilter === 'month'" class="text-xs font-normal text-slate-500 ml-1">({{ selectedFilter === 'month' ? 'Bulan Ini' : '7 Hari Terakhir' }})</span>
                        </h2>
                    </div>
                    <div v-if="data.daily_attendances && data.daily_attendances.length > 0" class="divide-y divide-slate-100">
                        <div v-for="(att, i) in data.daily_attendances" :key="i" class="p-4 flex items-center justify-between">
                            <div>
                                <p class="text-sm font-semibold text-slate-800">{{ getFormattedDate(att.date) }}</p>
                                <p class="text-xs text-slate-500 mt-0.5">
                                    Masuk: {{ att.clock_in || '-' }} &bull; Pulang: {{ att.clock_out || '-' }}
                                    <span v-if="att.late_minutes" class="text-amber-600"> &bull; Terlambat {{ att.late_minutes }} mnt</span>
                                </p>
                                <p v-if="att.notes" class="text-xs text-slate-500 mt-0.5">{{ att.notes }}</p>
                            </div>
                            <span class="text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border"
                                  :class="dailyStatusClass(att.status)">
                                {{ dailyStatusLabel(att.status) }}
                            </span>
                        </div>
                    </div>
                    <div v-else class="text-center py-6">
                        <p class="text-slate-400 text-sm">Belum ada data presensi sekolah.</p>
                    </div>
                </section>

                <!-- 1b. Presensi Tahfidz -->
                <section v-if="!isDaily" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                        <h2 class="font-bold text-slate-800 flex items-center gap-2 text-[15px]">
                            <svg class="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            Presensi Tahfidz <span v-if="selectedFilter === 'last7days' || selectedFilter === 'month'" class="text-xs font-normal text-slate-500 ml-1">({{ selectedFilter === 'month' ? 'Bulan Ini' : '7 Hari Terakhir' }})</span>
                        </h2>
                    </div>
                    <div class="p-0">
                        <div v-if="data.tahfidz_attendances && data.tahfidz_attendances.length > 0" class="divide-y divide-slate-100">
                            <div v-for="(att, i) in data.tahfidz_attendances" :key="i" class="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" 
                                         :class="{
                                            'bg-emerald-100 text-emerald-600': att.status === 'present',
                                            'bg-blue-100 text-blue-600': att.status === 'permission',
                                            'bg-amber-100 text-amber-600': att.status === 'sick',
                                            'bg-red-100 text-red-600': att.status === 'absent'
                                         }">
                                        <svg v-if="att.status === 'present'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                        <svg v-else-if="att.status === 'permission'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        <svg v-else-if="att.status === 'sick'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                        <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </div>
                                    <div>
                                        <p class="text-sm font-semibold text-slate-800">{{ getFormattedDate(att.date) }}</p>
                                        <p v-if="att.notes" class="text-xs text-slate-500 mt-0.5">{{ att.notes }}</p>
                                    </div>
                                </div>
                                <span class="text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider"
                                      :class="{
                                        'bg-emerald-50 text-emerald-700 border border-emerald-200': att.status === 'present',
                                        'bg-blue-50 text-blue-700 border border-blue-200': att.status === 'permission',
                                        'bg-amber-50 text-amber-700 border border-amber-200': att.status === 'sick',
                                        'bg-red-50 text-red-700 border border-red-200': att.status === 'absent'
                                      }">
                                    {{ getStatusLabel(att.status) }}
                                </span>
                            </div>
                        </div>
                    <div v-else class="text-center py-6">
                            <div class="w-12 h-12 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                <svg class="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <p class="text-slate-400 text-sm">Belum ada data kehadiran Tahfidz.</p>
                        </div>
                    </div>
                </section>

                <!-- 1c. Presensi Pelajaran (Per Jam Pel) -->
                <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                        <h2 class="font-bold text-slate-800 flex items-center gap-2 text-[15px]">
                            <svg class="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            Presensi Pelajaran
                            <span v-if="!isDaily" class="text-xs font-normal text-slate-500">({{ selectedFilter === 'month' ? 'Bulan Ini' : '7 Hari Terakhir' }})</span>
                        </h2>
                        <span v-if="lessonSummary.total > 0" class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {{ lessonSummary.total }} Jam Pel
                        </span>
                    </div>

                    <!-- Ringkasan Status Jam Pelajaran -->
                    <div v-if="lessonSummary.total > 0" class="px-4 py-3 bg-slate-50/40 border-b border-slate-100 grid grid-cols-5 gap-1.5 text-center">
                        <div class="rounded-lg bg-emerald-50 border border-emerald-100 py-1.5 px-1">
                            <p class="text-[10px] font-semibold text-emerald-700 uppercase">Hadir</p>
                            <p class="text-sm font-extrabold text-emerald-800">{{ lessonSummary.hadir }}</p>
                        </div>
                        <div class="rounded-lg bg-amber-50 border border-amber-100 py-1.5 px-1">
                            <p class="text-[10px] font-semibold text-amber-700 uppercase">Telat</p>
                            <p class="text-sm font-extrabold text-amber-800">{{ lessonSummary.terlambat }}</p>
                        </div>
                        <div class="rounded-lg bg-blue-50 border border-blue-100 py-1.5 px-1">
                            <p class="text-[10px] font-semibold text-blue-700 uppercase">Izin</p>
                            <p class="text-sm font-extrabold text-blue-800">{{ lessonSummary.izin }}</p>
                        </div>
                        <div class="rounded-lg bg-orange-50 border border-orange-100 py-1.5 px-1">
                            <p class="text-[10px] font-semibold text-orange-700 uppercase">Sakit</p>
                            <p class="text-sm font-extrabold text-orange-800">{{ lessonSummary.sakit }}</p>
                        </div>
                        <div class="rounded-lg bg-red-50 border border-red-100 py-1.5 px-1">
                            <p class="text-[10px] font-semibold text-red-700 uppercase">Alpa</p>
                            <p class="text-sm font-extrabold text-red-800">{{ lessonSummary.alpa }}</p>
                        </div>
                    </div>

                    <div v-if="(isDaily && dailyLessonRows.length > 0) || (!isDaily && groupedLessonAttendances.length > 0)">
                        <!-- Tampilan Harian -->
                        <div v-if="isDaily" class="divide-y divide-slate-100">
                            <div v-for="item in dailyLessonRows" :key="item.key" class="p-4 flex items-start justify-between gap-3 transition-colors" :class="item.hasRecord ? 'hover:bg-slate-50/70' : 'bg-slate-50/30'">
                                <div class="flex items-start gap-3 min-w-0">
                                    <div class="shrink-0 w-14 rounded-xl px-2 py-1.5 text-center border"
                                         :class="item.hasRecord ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-100 border-slate-200'">
                                        <p class="text-[11px] font-extrabold leading-tight" :class="item.hasRecord ? 'text-indigo-700' : 'text-slate-500'">Jam {{ item.period_number }}</p>
                                        <p class="text-[10px] font-medium mt-0.5" :class="item.hasRecord ? 'text-indigo-500' : 'text-slate-400'">{{ item.start_time }}</p>
                                    </div>
                                    <div class="min-w-0">
                                        <p class="text-sm font-bold truncate" :class="item.hasRecord ? 'text-slate-800' : 'text-slate-400'">
                                            {{ item.hasRecord ? item.subject_name : 'Belum ada presensi' }}
                                        </p>
                                        <p class="text-xs text-slate-500 mt-0.5 truncate">
                                            <template v-if="item.hasRecord">{{ item.teacher_name }} &bull; {{ item.start_time }} - {{ item.end_time }}</template>
                                            <template v-else>{{ item.start_time }} - {{ item.end_time }}</template>
                                        </p>
                                        <p v-if="item.notes" class="text-xs text-slate-500 italic mt-1">"{{ item.notes }}"</p>
                                    </div>
                                </div>
                                <span v-if="item.hasRecord" class="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border"
                                      :class="lessonStatusClass(item.status)">
                                    {{ lessonStatusLabel(item.status) }}
                                </span>
                                <span v-else class="shrink-0 text-xs font-bold px-2.5 py-1 rounded-md border bg-slate-100 text-slate-400 border-slate-200" title="Belum ada presensi">
                                    ✕
                                </span>
                            </div>
                        </div>

                        <!-- Tampilan Rentang Tanggal (7 Hari / Bulan Ini) -->
                        <div v-else class="divide-y divide-slate-200">
                            <div v-for="group in groupedLessonAttendances" :key="group.date">
                                <div class="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-600 flex items-center justify-between">
                                    <span>{{ getFormattedDate(group.date) }}</span>
                                    <span class="text-[11px] font-semibold text-slate-400">{{ group.recordedCount }} jam pel</span>
                                </div>
                                <div class="divide-y divide-slate-100">
                                    <div v-for="item in group.items" :key="item.key" class="px-4 py-3 flex items-start justify-between gap-3 transition-colors" :class="item.hasRecord ? 'hover:bg-slate-50/70' : 'bg-slate-50/30'">
                                        <div class="flex items-start gap-3 min-w-0">
                                            <div class="shrink-0 w-12 rounded-lg px-1.5 py-1 text-center border"
                                                 :class="item.hasRecord ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-100 border-slate-200'">
                                                <p class="text-[11px] font-extrabold" :class="item.hasRecord ? 'text-indigo-700' : 'text-slate-500'">Jam {{ item.period_number }}</p>
                                            </div>
                                            <div class="min-w-0">
                                                <p class="text-[13px] font-bold truncate" :class="item.hasRecord ? 'text-slate-800' : 'text-slate-400'">
                                                    {{ item.hasRecord ? item.subject_name : 'Belum ada presensi' }}
                                                </p>
                                                <p class="text-[11px] text-slate-500 truncate">
                                                    <template v-if="item.hasRecord">{{ item.teacher_name }} &bull; {{ item.start_time }} - {{ item.end_time }}</template>
                                                    <template v-else>{{ item.start_time }} - {{ item.end_time }}</template>
                                                </p>
                                                <p v-if="item.notes" class="text-[11px] text-slate-500 italic mt-0.5">"{{ item.notes }}"</p>
                                            </div>
                                        </div>
                                        <span v-if="item.hasRecord" class="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border"
                                              :class="lessonStatusClass(item.status)">
                                            {{ lessonStatusLabel(item.status) }}
                                        </span>
                                        <span v-else class="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-md border bg-slate-100 text-slate-400 border-slate-200" title="Belum ada presensi">
                                            ✕
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else class="text-center py-6">
                        <div class="w-12 h-12 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <svg class="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        </div>
                        <p class="text-slate-400 text-sm">Belum ada data presensi pelajaran.</p>
                    </div>
                </section>

                <!-- Timeline -->
                <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                        <h2 class="font-bold text-slate-800 flex items-center gap-2 text-[15px]">
                            <svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Histori Aktivitas
                        </h2>
                    </div>
                    <div class="p-5">
                        <div v-if="data.timeline && data.timeline.length > 0" class="relative">
                            <!-- Vertical Line -->
                            <div class="absolute left-[23px] top-4 bottom-4 w-0.5 bg-slate-200"></div>
                            
                            <div class="space-y-0 relative">
                                <div v-for="(item, index) in data.timeline" :key="index" class="flex gap-4 relative py-4 first:pt-0 last:pb-0">
                                    <div class="flex-none w-12 flex flex-col items-center">
                                        <div class="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm z-10 text-indigo-600" v-html="getTimelineIcon(item.icon)">
                                        </div>
                                    </div>
                                    <div class="flex-1 pt-1 pb-1">
                                        <div class="flex justify-between items-start mb-1">
                                            <h3 class="font-bold text-slate-800 text-sm">{{ item.title }}</h3>
                                            <span class="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">{{ item.formatted_time }}</span>
                                        </div>
                                        <p v-if="item.details" class="text-[13px] text-slate-500 leading-relaxed">{{ item.details }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center py-8">
                            <div class="w-12 h-12 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                <svg class="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                            </div>
                            <p class="text-slate-400 text-sm">Tidak ada aktivitas pada tanggal ini.</p>
                        </div>
                    </div>
                </section>

                <!-- Pelanggaran -->
                <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="px-5 py-3.5 border-b border-red-100 bg-red-50/50">
                        <h2 class="font-bold text-slate-800 flex items-center gap-2 text-[15px]">
                            <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            Detail Pelanggaran
                        </h2>
                    </div>
                    <div class="p-0">
                        <div v-if="data.violations && data.violations.length > 0" class="divide-y divide-slate-100">
                            <div v-for="(v, i) in data.violations" :key="i" class="p-5 flex gap-3 hover:bg-slate-50 transition-colors">
                                <div class="text-[11px] font-bold text-red-500 w-12 pt-1">{{ v.time }}</div>
                                <div class="flex-1">
                                    <div class="font-semibold text-slate-800 text-[13px] mb-1">{{ v.category }}</div>
                                    <p class="text-[13px] text-slate-500 leading-relaxed">{{ v.description }}</p>
                                    <div v-if="v.points" class="mt-2.5 text-[11px] font-bold text-red-700 bg-red-100 border border-red-200 inline-block px-2 py-0.5 rounded-md">
                                        Poin: {{ v.points }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="p-6 text-center">
                            <p class="text-slate-400 text-sm">Tidak ada pelanggaran hari ini.</p>
                        </div>
                    </div>
                </section>

                <!-- Perizinan -->
                <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="px-5 py-3.5 border-b border-amber-100 bg-amber-50/50">
                        <h2 class="font-bold text-slate-800 flex items-center gap-2 text-[15px]">
                            <svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Detail Perizinan
                        </h2>
                    </div>
                    <div class="p-0">
                        <div v-if="data.permissions && data.permissions.length > 0" class="divide-y divide-slate-100">
                            <div v-for="(p, i) in data.permissions" :key="i" class="p-5 hover:bg-slate-50 transition-colors">
                                <div class="flex justify-between items-start mb-2">
                                    <h3 class="font-semibold text-slate-800 text-[13px]">{{ p.type }}</h3>
                                    <span class="text-[11px] font-bold px-2 py-0.5 rounded-md border" :class="p.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'">
                                        {{ p.status }}
                                    </span>
                                </div>
                                <div class="text-xs font-medium text-slate-400 mb-2">{{ p.start_date }} s/d {{ p.end_date }}</div>
                                <p class="text-[13px] text-slate-600 leading-relaxed">{{ p.reason }}</p>
                            </div>
                        </div>
                        <div v-else class="p-6 text-center">
                            <p class="text-slate-400 text-sm">Belum ada perizinan.</p>
                        </div>
                    </div>
                </section>

                <!-- Catatan Positif -->
                <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="px-5 py-3.5 border-b border-emerald-100 bg-emerald-50/50">
                        <h2 class="font-bold text-slate-800 flex items-center gap-2 text-[15px]">
                            <svg class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                            Catatan Positif
                        </h2>
                    </div>
                    <div class="p-0">
                        <div v-if="data.positive_notes && data.positive_notes.length > 0" class="divide-y divide-slate-100">
                            <div v-for="(pn, i) in data.positive_notes" :key="i" class="p-5 flex gap-3 hover:bg-slate-50 transition-colors">
                                <div class="text-[11px] font-bold text-emerald-500 w-12 pt-1">{{ pn.time }}</div>
                                <div class="flex-1">
                                    <div class="font-semibold text-slate-800 text-[13px] mb-1">{{ pn.category }}</div>
                                    <p class="text-[13px] text-slate-500 leading-relaxed">{{ pn.description }}</p>
                                    <div v-if="pn.points" class="mt-2.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 inline-block px-2 py-0.5 rounded-md">
                                        Poin: +{{ pn.points }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="p-6 text-center">
                            <p class="text-slate-400 text-sm">Belum ada catatan positif.</p>
                        </div>
                    </div>
                </section>

            </div>
            
            <!-- Footer -->
            <div class="mt-8 mb-2 text-center text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                <p>Edulite Remake &copy; {{ new Date().getFullYear() }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import publicApi from '@/services/publicApi';

const route = useRoute();
const studentId = route.params.id;

const data = ref(null);
const loading = ref(true);
const error = ref(null);
const polling = ref(false);
const timer = ref(null);

const filters = [
    { label: 'Hari Ini', value: 'today' },
    { label: 'Kemarin', value: 'yesterday' },
    { label: '7 Hari Terakhir', value: 'last7days' },
    { label: 'Bulan Ini', value: 'month' }
];

const selectedFilter = ref('today');
const customDate = ref('');

const isDaily = computed(() => !['last7days', 'month'].includes(selectedFilter.value));
const schoolAtt = computed(() => data.value?.daily_attendances?.[0] || null);
const tahfidzAtt = computed(() => data.value?.tahfidz_attendances?.[0] || null);
const lessonPeriods = computed(() => data.value?.lesson_periods || []);
const lessonAttendances = computed(() => data.value?.lesson_attendances || []);
const lessonSummary = computed(() => data.value?.lesson_summary || {
    total: 0,
    hadir: 0,
    terlambat: 0,
    izin: 0,
    sakit: 0,
    alpa: 0
});

const buildDayLessonRows = (dayItems = [], keyPrefix = 'day') => {
    const byPeriod = new Map();
    for (const item of dayItems) {
        byPeriod.set(Number(item.period_number), item);
    }

    const rows = [];
    const seenPeriods = new Set();

    for (const p of lessonPeriods.value) {
        const pNum = Number(p.period_number);
        seenPeriods.add(pNum);
        const match = byPeriod.get(pNum);
        if (match) {
            rows.push({ ...match, hasRecord: true, key: `${keyPrefix}-${pNum}-${match.id}` });
        } else {
            rows.push({
                key: `${keyPrefix}-empty-${pNum}`,
                period_number: pNum,
                period_name: p.period_name,
                start_time: p.start_time,
                end_time: p.end_time,
                hasRecord: false
            });
        }
    }

    for (const item of dayItems) {
        const pNum = Number(item.period_number);
        if (!seenPeriods.has(pNum)) {
            rows.push({ ...item, hasRecord: true, key: `${keyPrefix}-extra-${pNum}-${item.id}` });
        }
    }

    return rows.sort((a, b) => Number(a.period_number) - Number(b.period_number));
};

const dailyLessonRows = computed(() => buildDayLessonRows(lessonAttendances.value, 'daily'));

const groupedLessonAttendances = computed(() => {
    const groups = [];
    const byDate = new Map();
    for (const item of lessonAttendances.value) {
        if (!byDate.has(item.date)) {
            const group = { date: item.date, rawItems: [] };
            byDate.set(item.date, group);
            groups.push(group);
        }
        byDate.get(item.date).rawItems.push(item);
    }
    return groups.map(g => ({
        date: g.date,
        recordedCount: g.rawItems.length,
        items: buildDayLessonRows(g.rawItems, g.date)
    }));
});

const dailyConclusion = computed(() => {
    if (!data.value || !isDaily.value) return null;

    const gateStatus = String(schoolAtt.value?.status || '').toUpperCase();
    const gatePresent = Boolean(schoolAtt.value && (schoolAtt.value.clock_in || ['PRESENT', 'LATE', 'INCOMPLETE'].includes(gateStatus)));
    const gateExcused = Boolean(schoolAtt.value && ['SICK', 'PERMIT', 'PERMISSION'].includes(gateStatus));

    const tahfidzStatus = tahfidzAtt.value?.status;
    const tahfidzPresent = tahfidzStatus === 'present';
    const tahfidzExcused = ['permission', 'sick'].includes(tahfidzStatus);
    const tahfidzAbsent = tahfidzStatus === 'absent';

    const lessonPresent = (lessonSummary.value.hadir + lessonSummary.value.terlambat) > 0;
    const lessonAlpa = lessonSummary.value.alpa > 0;

    if (!gatePresent && !gateExcused && lessonPresent && tahfidzPresent) {
        return {
            icon: '💳',
            title: 'Tidak Tap Kartu RFID di Gerbang',
            message: 'Ananda tercatat hadir di jam pelajaran dan kegiatan Tahfidz, namun belum melakukan tap kartu RFID di gerbang sekolah.',
            style: 'bg-amber-50 border-amber-200 text-amber-900'
        };
    }

    if (!gatePresent && !gateExcused && (lessonPresent || tahfidzPresent)) {
        return {
            icon: '💳',
            title: 'Belum Presensi Kartu RFID di Gerbang',
            message: lessonPresent
                ? 'Ananda tercatat mengikuti jam pelajaran di kelas, namun belum melakukan tap kartu RFID di gerbang sekolah.'
                : 'Ananda tercatat hadir di kegiatan Tahfidz, namun belum melakukan tap kartu RFID di gerbang sekolah.',
            style: 'bg-amber-50 border-amber-200 text-amber-900'
        };
    }

    if ((gatePresent || lessonPresent) && (tahfidzAbsent || (!tahfidzAtt.value && !tahfidzExcused))) {
        if (tahfidzAbsent) {
            return {
                icon: '⚠️',
                title: 'Tidak Mengikuti Kegiatan Tahfidz',
                message: 'Ananda tercatat hadir di sekolah, namun tidak mengikuti kegiatan Tahfidz tanpa keterangan. Mohon perhatian dan konfirmasi kepada ananda.',
                style: 'bg-rose-50 border-rose-200 text-rose-900'
            };
        }
        return {
            icon: '📋',
            title: 'Tahfidz Belum Tercatat',
            message: 'Ananda tercatat hadir di sekolah, namun belum memiliki catatan kehadiran pada kegiatan Tahfidz.',
            style: 'bg-amber-50 border-amber-200 text-amber-900'
        };
    }

    if (gatePresent && lessonAlpa) {
        return {
            icon: '⚠️',
            title: 'Perlu Perhatian Jam Pelajaran',
            message: `Ananda tercatat masuk gerbang sekolah, namun terdapat ${lessonSummary.value.alpa} jam pelajaran dengan status Alpa.`,
            style: 'bg-rose-50 border-rose-200 text-rose-900'
        };
    }

    if (gatePresent && tahfidzPresent) {
        return {
            icon: '✅',
            title: 'Kehadiran Lengkap & Baik',
            message: 'Ananda mengikuti presensi gerbang sekolah, kegiatan Tahfidz, dan pembelajaran dengan baik.',
            style: 'bg-emerald-50 border-emerald-200 text-emerald-900'
        };
    }

    if (gateExcused || tahfidzExcused) {
        return {
            icon: '📄',
            title: 'Berhalangan Hadir (Izin / Sakit)',
            message: 'Ananda tercatat izin atau sakit sesuai keterangan yang diterima sekolah.',
            style: 'bg-blue-50 border-blue-200 text-blue-900'
        };
    }

    return {
        icon: '⏳',
        title: 'Menunggu Data Kehadiran',
        message: 'Belum ada catatan presensi gerbang, Tahfidz, maupun jam pelajaran pada tanggal ini.',
        style: 'bg-slate-50 border-slate-200 text-slate-700'
    };
});

const schoolKpi = computed(() => {
    const a = schoolAtt.value;
    if (a && a.clock_in) {
        const late = a.entry_status === 'LATE' || a.late_minutes > 0;
        return late
            ? { label: 'Masuk (Terlambat)', emoji: '⏰', box: 'bg-amber-50 border-amber-200', text: 'text-amber-700' }
            : { label: 'Sudah Masuk', emoji: '✅', box: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' };
    }
    const s = String(a?.status || '').toUpperCase();
    if (['SICK', 'PERMIT', 'PERMISSION'].includes(s)) {
        return { label: dailyStatusLabel(s), emoji: '📄', box: 'bg-blue-50 border-blue-200', text: 'text-blue-700' };
    }
    if (s === 'ABSENT') return { label: 'Tidak Masuk', emoji: '❌', box: 'bg-red-50 border-red-200', text: 'text-red-700' };
    return { label: 'Belum Masuk', emoji: '⏳', box: 'bg-slate-50 border-slate-200', text: 'text-slate-600' };
});

const tahfidzKpi = computed(() => {
    const a = tahfidzAtt.value;
    if (!a) return { label: 'Belum Ada Presensi', emoji: '⏳', box: 'bg-slate-50 border-slate-200', text: 'text-slate-600' };
    const map = {
        present: { label: 'Hadir', emoji: '✅', box: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
        permission: { label: 'Izin', emoji: '📄', box: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
        sick: { label: 'Sakit', emoji: '🤒', box: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
        absent: { label: 'Tidak Hadir', emoji: '❌', box: 'bg-red-50 border-red-200', text: 'text-red-700' }
    };
    return map[a.status] || { label: a.status, emoji: '•', box: 'bg-slate-50 border-slate-200', text: 'text-slate-600' };
});

// Computed values
const studentPhoto = computed(() => {
    if (data.value && data.value.student.photo) {
        return data.value.student.photo;
    }
    return `https://ui-avatars.com/api/?name=${data.value?.student?.name || 'Student'}&background=e0e7ff&color=4338ca&size=128&bold=true`;
});

const getStatusIcon = (status) => {
    if (status === 'Terekap') {
        return `<svg class="w-3.5 h-3.5 text-emerald-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`;
    }
    return `<svg class="w-3.5 h-3.5 text-rose-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>`;
};

const getFormattedDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }).format(date);
};

const getStatusLabel = (status) => {
    switch(status) {
        case 'present': return 'Hadir';
        case 'permission': return 'Izin';
        case 'sick': return 'Sakit';
        case 'absent': return 'Alpa';
        default: return status;
    }
};

const dailyStatusLabel = (status) => ({
    PRESENT: 'Hadir', LATE: 'Terlambat', INCOMPLETE: 'Belum Lengkap',
    ABSENT: 'Alpa', SICK: 'Sakit', PERMIT: 'Izin', PERMISSION: 'Izin'
}[String(status || '').toUpperCase()] || status || '-');

const dailyStatusClass = (status) => ({
    PRESENT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    LATE: 'bg-amber-50 text-amber-700 border-amber-200',
    INCOMPLETE: 'bg-slate-50 text-slate-600 border-slate-200',
    ABSENT: 'bg-red-50 text-red-700 border-red-200',
    SICK: 'bg-amber-50 text-amber-700 border-amber-200',
    PERMIT: 'bg-blue-50 text-blue-700 border-blue-200',
    PERMISSION: 'bg-blue-50 text-blue-700 border-blue-200'
}[String(status || '').toUpperCase()] || 'bg-slate-50 text-slate-600 border-slate-200');

const lessonStatusLabel = (status) => ({
    HADIR: 'Hadir',
    TERLAMBAT: 'Terlambat',
    IZIN: 'Izin',
    SAKIT: 'Sakit',
    ALPA: 'Alpa'
}[String(status || '').toUpperCase()] || status || '-');

const lessonStatusClass = (status) => ({
    HADIR: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    TERLAMBAT: 'bg-amber-50 text-amber-700 border-amber-200',
    IZIN: 'bg-blue-50 text-blue-700 border-blue-200',
    SAKIT: 'bg-orange-50 text-orange-700 border-orange-200',
    ALPA: 'bg-red-50 text-red-700 border-red-200'
}[String(status || '').toUpperCase()] || 'bg-slate-50 text-slate-600 border-slate-200');

const getTimelineIcon = (iconStr) => {
    // Map emoji strings back to nice SVG icons
    if (iconStr === '✅' || iconStr === '🚪') {
        return `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    }
    if (iconStr === '🚻' || iconStr === '🚶') {
        return `<svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>`;
    }
    if (iconStr === '⚠' || iconStr === '⛔') {
        return `<svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
    }
    if (iconStr === '⭐') {
        return `<svg class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>`;
    }
    if (iconStr === '📄') {
        return `<svg class="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`;
    }
    // Default dot
    return `<svg class="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5"></circle></svg>`;
};

const getDateParam = () => {
    const today = new Date();
    
    if (customDate.value) {
        return customDate.value;
    }
    
    if (selectedFilter.value === 'today') {
        return today.toLocaleString('sv', { timeZone: 'Asia/Jakarta' }).split(' ')[0];
    } else if (selectedFilter.value === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toLocaleString('sv', { timeZone: 'Asia/Jakarta' }).split(' ')[0];
    } else if (selectedFilter.value === 'last7days' || selectedFilter.value === 'month') {
        return today.toLocaleString('sv', { timeZone: 'Asia/Jakarta' }).split(' ')[0];
    }
    
    return null;
};

const fetchData = async (isPolling = false) => {
    try {
        if (!isPolling) loading.value = true;
        polling.value = isPolling;
        error.value = null;
        
        const dateParam = getDateParam();
        const response = await publicApi.get(`/public/student-dashboard/${studentId}`, {
            params: { 
                date: dateParam,
                filter: customDate.value ? 'custom' : selectedFilter.value
            }
        });
        
        if (response.success) {
            data.value = response.data;
        } else {
            error.value = response.message || 'Data tidak ditemukan.';
        }
    } catch (err) {
        console.error('Error fetching dashboard:', err);
        error.value = err.message || 'Gagal mengambil data dari server.';
        if (!isPolling) {
            data.value = null;
        }
    } finally {
        loading.value = false;
        setTimeout(() => { polling.value = false; }, 1000);
    }
};

const setFilter = (val) => {
    selectedFilter.value = val;
    customDate.value = '';
    fetchData();
};

const setCustomDate = () => {
    if (customDate.value) {
        selectedFilter.value = 'custom';
        fetchData();
    }
};

onMounted(() => {
    fetchData();
    timer.value = setInterval(() => {
        fetchData(true);
    }, 60000);
});

onUnmounted(() => {
    if (timer.value) {
        clearInterval(timer.value);
    }
});

const handleImageError = (e) => {
    e.target.src = `https://ui-avatars.com/api/?name=${data.value?.student?.name || 'S'}&background=e0e7ff&color=4338ca&size=128&bold=true`;
};
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
    display: none;
}
.hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
