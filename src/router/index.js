import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { guest: true }
    },
    {
        path: '/parent/:id',
        name: 'ParentDashboard',
        component: () => import('@/views/public/ParentDashboardView.vue'),
        meta: { public: true }
    },
    {
        path: '/verify',
        name: 'VerifyDocument',
        component: () => import('@/views/public/VerifyDocumentView.vue'),
        meta: { public: true }
    },
    {
        path: '/rfid-gate-scan',
        alias: ['/rfid-scan'],
        name: 'RfidScan',
        component: () => import('@/views/student-rfid/RfidGateScanView.vue')
    },
    {
        path: '/rfid-toilet-scan',
        name: 'RfidToiletScan',
        component: () => import('@/views/student-rfid/RfidToiletScanView.vue')
    },
    {
        path: '/kiosk/student-item-deposits',
        name: 'StudentItemDepositsKiosk',
        component: () => import('@/views/student-item-deposits/StudentItemDepositsKioskView.vue')
    },
    {
        path: '/kiosk/manual',
        name: 'ManualKiosk',
        component: () => import('@/views/student-rfid/ManualKioskView.vue')
    },
    {
        path: '/kiosk/tahfidz/:token',
        name: 'TahfidzKioskPublic',
        component: () => import('@/views/tahfidz/KioskPublic.vue')
    },
    {
        path: '/tahfidz',
        component: () => import('@/layouts/MainLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: 'attendance',
                name: 'tahfidz-attendance',
                component: () => import('@/views/tahfidz/Attendance.vue'),
                meta: { 
                    title: 'Absen Tahfidz',
                    permission: 'tahfidz_attendance.view'
                }
            },
            {
                path: 'recap',
                name: 'tahfidz-recap',
                component: () => import('@/views/tahfidz/Recap.vue'),
                meta: { 
                    title: 'Rekap Tahfidz',
                    permission: 'tahfidz_attendance.report'
                }
            },
            {
                path: 'kiosks',
                name: 'tahfidz-kiosks',
                component: () => import('@/views/tahfidz/KioskAdmin.vue'),
                meta: { 
                    title: 'Kiosk Tahfidz',
                    permission: 'tahfidz_attendance.report'
                }
            }
        ]
    },
    {
        path: '/',
        component: () => import('@/layouts/MainLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/dashboard/DashboardView.vue')
            },
            // Siswa
            { path: 'students', name: 'Students', component: () => import('@/views/students/StudentsView.vue') },
            { path: 'students/:id/character-report', name: 'CharacterReport', component: () => import('@/views/students/CharacterReportView.vue') },
            { path: 'parents', name: 'Parents', component: () => import('@/views/students/ParentsView.vue') },
            { path: 'student-docs', name: 'StudentDocs', component: () => import('@/views/students/StudentDocsView.vue') },
            { path: 'class-history', name: 'ClassHistory', component: () => import('@/views/students/ClassHistoryView.vue') },
            { path: 'class-setup', name: 'ClassSetup', component: () => import('@/views/students/ClassSetupView.vue') },
            { path: 'rombels', name: 'Rombels', component: () => import('@/views/students/RombelView.vue') },
            { path: 'rombels/:classId', name: 'RombelDetail', component: () => import('@/views/students/RombelDetailView.vue') },
            { path: 'class-reports/:classId', name: 'ClassReportPrint', component: () => import('@/views/students/ClassReportPrintView.vue') },
            { path: 'transfers', name: 'Transfers', component: () => import('@/views/students/TransfersView.vue') },
            { path: 'student-item-deposits', name: 'StudentItemDeposits', component: () => import('@/views/student-item-deposits/StudentItemDepositsView.vue') },
            { path: 'student-item-deposits/monitoring', name: 'StudentItemDepositsMonitoring', component: () => import('@/views/student-item-deposits/StudentItemDepositsMonitoringView.vue') },
            { path: 'student-item-deposits/reports', name: 'StudentItemReportsIndex', component: () => import('@/views/student-item-deposits/reports/ReportIndexPage.vue') },
            { path: 'student-item-deposits/reports/active-items', name: 'StudentItemReportsActiveItems', component: () => import('@/views/student-item-deposits/reports/ActiveItemsReportPage.vue') },
            { path: 'student-item-deposits/reports/daily-loans', name: 'StudentItemReportsDailyLoans', component: () => import('@/views/student-item-deposits/reports/DailyLoansReportPage.vue') },
            { path: 'student-item-deposits/reports/unreturned-items', name: 'StudentItemReportsUnreturned', component: () => import('@/views/student-item-deposits/reports/UnreturnedItemsReportPage.vue') },
            { path: 'student-item-deposits/reports/final-returns', name: 'StudentItemReportsFinalReturns', component: () => import('@/views/student-item-deposits/reports/FinalReturnsReportPage.vue') },
            { path: 'student-item-deposits/reports/problem-items', name: 'StudentItemReportsProblemItems', component: () => import('@/views/student-item-deposits/reports/ProblemItemsReportPage.vue') },
            { path: 'student-item-deposits/reports/student-behavior', name: 'StudentItemReportsBehavior', component: () => import('@/views/student-item-deposits/reports/StudentBehaviorReportPage.vue') },
            { path: 'student-item-deposits/reports/class-summary', name: 'StudentItemReportsClassSummary', component: () => import('@/views/student-item-deposits/reports/ClassSummaryReportPage.vue') },
            { path: 'student-item-deposits/reports/student-history', name: 'StudentItemReportsStudentHistory', component: () => import('@/views/student-item-deposits/reports/StudentHistoryReportPage.vue') },
            { path: 'student-item-deposits/categories', name: 'StudentItemDepositsCategories', component: () => import('@/views/student-item-deposits/StudentItemDepositsCategoriesView.vue') },
            { path: 'student-item-deposits/settings', name: 'StudentItemDepositsSettings', component: () => import('@/views/student-item-deposits/StudentItemDepositsSettingsView.vue') },
            { path: 'student-item-deposits/print/:id', name: 'StudentItemDepositsPrint', component: () => import('@/views/student-item-deposits/StudentItemDepositPrintView.vue') },
            { path: 'id-cards', name: 'IdCards', component: () => import('@/views/students/IdCardsView.vue') },
            // Akademik
            { path: 'academic-years', name: 'AcademicYears', component: () => import('@/views/academic/AcademicYearsView.vue') },
            { path: 'grades', name: 'Grades', component: () => import('@/views/academic/GradesView.vue') },
            { path: 'departments', name: 'Departments', component: () => import('@/views/academic/DepartmentsView.vue') },
            { path: 'classes', name: 'Classes', component: () => import('@/views/academic/ClassesView.vue') },
            { path: 'teachers', name: 'Teachers', component: () => import('@/views/academic/TeachersView.vue') },
            { path: 'subjects', name: 'Subjects', component: () => import('@/views/academic/SubjectsView.vue') },
            { path: 'lesson-periods', name: 'LessonPeriods', component: () => import('@/views/academic/LessonPeriodsView.vue') },
            // Prestasi
            { path: 'achievements', name: 'Achievements', component: () => import('@/views/achievements/AchievementsView.vue') },
            { path: 'achievement-participants', name: 'Participants', component: () => import('@/views/achievements/ParticipantsView.vue') },
            { path: 'achievement-results', name: 'Results', component: () => import('@/views/achievements/ResultsView.vue') },
            { path: 'achievement-point-rules', name: 'PointRules', component: () => import('@/views/achievements/PointRulesView.vue') },
            { path: 'certificates', name: 'Certificates', component: () => import('@/views/achievements/CertificatesView.vue') },
            // Konseling & Disiplin
            { path: 'violation-types', name: 'ViolationTypes', component: () => import('@/views/counseling/ViolationTypesView.vue') },
            { path: 'violation-levels', name: 'ViolationLevels', component: () => import('@/views/counseling/ViolationLevelsView.vue') },
            { path: 'student-violations', name: 'StudentViolations', component: () => import('@/views/counseling/StudentViolationsView.vue') },
            { path: 'student-violations/reports', name: 'StudentViolationsReports', component: () => import('@/views/counseling/StudentViolationsReportView.vue') },
            { path: 'student-violations/statistics', name: 'StudentViolationsStatistics', component: () => import('@/views/counseling/StudentViolationsStatisticsView.vue') },
            { path: 'student-violations/statistics/trend', name: 'StudentViolationsTrend', component: () => import('@/views/counseling/StudentViolationsTrendView.vue') },
            { path: 'student-violations/statistics/type', name: 'StudentViolationsType', component: () => import('@/views/counseling/StudentViolationsTypeView.vue') },
            { path: 'positive-point-types', name: 'PositivePointTypes', component: () => import('@/views/counseling/PositivePointTypesView.vue') },
            { path: 'student-positive-points', name: 'StudentPositivePoints', component: () => import('@/views/counseling/StudentPositivePointsView.vue') },
            { path: 'counseling-cases', name: 'CounselingCases', component: () => import('@/views/counseling/CounselingCasesView.vue') },
            { path: 'counseling-cases/create', name: 'CounselingCaseCreate', component: () => import('@/views/counseling/CounselingCaseFormView.vue') },
            { path: 'counseling-cases/:id', name: 'CounselingCaseDetail', component: () => import('@/views/counseling/CounselingCaseDetailView.vue') },
            { path: 'counseling-cases/:id/edit', name: 'CounselingCaseEdit', component: () => import('@/views/counseling/CounselingCaseFormView.vue') },
            { path: 'students/:studentId/counseling-history', name: 'StudentCounselingHistory', component: () => import('@/views/counseling/StudentCounselingHistoryView.vue') },
            { path: 'counseling-cases/:caseId/sessions/create', name: 'CounselingSessionCreate', component: () => import('@/views/counseling/CounselingSessionFormView.vue') },
            { path: 'counseling-sessions/:id/edit', name: 'CounselingSessionEdit', component: () => import('@/views/counseling/CounselingSessionFormView.vue') },
            { path: 'counseling-followups', name: 'CounselingFollowups', component: () => import('@/views/counseling/CounselingFollowupsView.vue') },
            { path: 'character-reports', name: 'CharacterReports', component: () => import('@/views/students/CharacterReportIndexView.vue') },

            // Administrasi
            { path: 'guestbooks', name: 'Guestbooks', component: () => import('@/views/administration/GuestbooksView.vue') },
            { path: 'permission-letters', name: 'PermissionLetters', component: () => import('@/views/administration/PermissionLettersView.vue') },
            { path: 'incoming-mail', name: 'IncomingMail', component: () => import('@/views/administration/IncomingMailView.vue') },
            { path: 'outgoing-mail', name: 'OutgoingMail', component: () => import('@/views/administration/OutgoingMailView.vue') },
            { path: 'mail-disposition', name: 'MailDisposition', component: () => import('@/views/administration/MailDispositionView.vue') },
            // Sistem
            { path: 'users', name: 'Users', component: () => import('@/views/system/UsersView.vue') },
            { path: 'roles', name: 'Roles', component: () => import('@/views/system/RolesView.vue') },
            { path: 'permissions', name: 'Permissions', component: () => import('@/views/system/PermissionsView.vue') },
            { path: 'school-profile', name: 'SchoolProfile', component: () => import('@/views/system/SchoolProfileView.vue') },
            { path: 'document-settings', name: 'DocumentSettings', component: () => import('@/views/system/DocumentSettingsView.vue') },
            { path: 'document-settings/create', name: 'DocumentSettingCreate', component: () => import('@/views/system/DocumentSettingFormView.vue') },
            { path: 'document-settings/:id/edit', name: 'DocumentSettingEdit', component: () => import('@/views/system/DocumentSettingFormView.vue') },
            // Absensi
            { path: 'attendance/shifts', name: 'AttendanceShifts', component: () => import('@/views/attendance/AttendanceShiftsView.vue') },
            { path: 'attendance/settings', name: 'AttendanceSettings', component: () => import('@/views/attendance/AttendanceSettingsView.vue') },
            { path: 'attendance/monitoring', name: 'AttendanceMonitoring', component: () => import('@/views/attendance/AttendanceMonitoringView.vue') },
            { path: 'attendance/history', name: 'AttendanceHistory', component: () => import('@/views/attendance/AttendanceHistoryView.vue') },
            { path: 'attendance/reports', name: 'AttendanceReports', component: () => import('@/views/attendance/AttendanceReportsView.vue') },
            { path: 'attendance/requests', name: 'AttendanceRequests', component: () => import('@/views/attendance/AttendanceRequestsView.vue') },
            // Student Attendance
            { path: 'attendance/recap', name: 'StudentAttendanceRecap', component: () => import('@/views/student-attendance/AttendanceRecapView.vue'), meta: { permissions: ['attendance.view'] } },
            { path: 'attendance/input', name: 'StudentAttendanceInput', component: () => import('@/views/student-attendance/AttendanceInputView.vue'), meta: { permissions: ['attendance.view'] } },
            { path: 'attendance/import', name: 'StudentAttendanceImport', component: () => import('@/views/student-attendance/AttendanceImportView.vue'), meta: { permissions: ['attendance.view', 'attendance.import'] } },
            // RFID Siswa
            { path: 'student-rfid/master/shifts', name: 'StudentAttendanceShiftMaster', component: () => import('@/views/student-rfid/StudentAttendanceShiftMasterView.vue') },
            { path: 'student-rfid/master/shift-classes', name: 'StudentAttendanceShiftClassMapping', component: () => import('@/views/student-rfid/StudentAttendanceShiftClassMappingView.vue') },
            { path: 'student-rfid/master/shift-students', name: 'StudentAttendanceShiftStudentOverride', component: () => import('@/views/student-rfid/StudentAttendanceShiftStudentOverrideView.vue') },
            { path: 'student-rfid/master/rfid-mapping', name: 'StudentRfidMapping', component: () => import('@/views/student-rfid/StudentRfidMappingView.vue') },
            { path: 'student-rfid/attendance/monitoring', name: 'StudentAttendanceGateMonitoring', component: () => import('@/views/student-rfid/StudentAttendanceGateMonitoringView.vue') },
            { path: 'student-rfid/attendance/daily', name: 'StudentAttendanceDaily', component: () => import('@/views/student-rfid/StudentAttendanceDailyView.vue') },
            { path: 'student-rfid/attendance/corrections', name: 'StudentAttendanceCorrections', component: () => import('@/views/student-rfid/StudentAttendanceCorrectionView.vue') },
            { path: 'student-rfid/toilet/monitoring', name: 'StudentToiletMonitoring', component: () => import('@/views/student-rfid/StudentToiletMonitoringView.vue') },
            { path: 'student-rfid/toilet/history', name: 'StudentToiletHistory', component: () => import('@/views/student-rfid/StudentToiletHistoryView.vue') },
            { path: 'student-rfid/reports/attendance', name: 'StudentAttendanceReport', component: () => import('@/views/student-rfid/StudentAttendanceReportView.vue') },
            { path: 'student-rfid/reports/toilet', name: 'StudentToiletReport', component: () => import('@/views/student-rfid/StudentToiletReportView.vue') },
            // Ekstrakurikuler
            { path: 'extracurricular/master', name: 'ExtracurricularMaster', component: () => import('@/views/extracurricular/ExtracurricularMasterView.vue') },
            { path: 'extracurricular/coaches', name: 'ExtracurricularCoaches', component: () => import('@/views/extracurricular/ExtracurricularCoachesView.vue') },
            { path: 'extracurricular/assignments', name: 'ExtracurricularAssignments', component: () => import('@/views/extracurricular/ExtracurricularAssignmentsView.vue') },
            { path: 'extracurricular/schedules', name: 'ExtracurricularSchedules', component: () => import('@/views/extracurricular/ExtracurricularSchedulesView.vue') },
            { path: 'extracurricular/members', name: 'ExtracurricularMembers', component: () => import('@/views/extracurricular/ExtracurricularMembersView.vue') },
            { path: 'extracurricular/sessions', name: 'ExtracurricularSessions', component: () => import('@/views/extracurricular/ExtracurricularSessionsView.vue') },
            { path: 'extracurricular/attendances', name: 'ExtracurricularAttendances', component: () => import('@/views/extracurricular/ExtracurricularAttendancesView.vue') },
            { path: 'extracurricular/progress', name: 'ExtracurricularProgress', component: () => import('@/views/extracurricular/ExtracurricularProgressView.vue') },
            { path: 'extracurricular/reports', name: 'ExtracurricularReports', component: () => import('@/views/extracurricular/ExtracurricularReportsView.vue') }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    const isAuthenticated = authStore.isAuthenticated

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login')
    } else if (to.meta.guest && isAuthenticated) {
        next('/dashboard')
    } else {
        next()
    }
})

export default router
