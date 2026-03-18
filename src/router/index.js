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
            { path: 'transfers', name: 'Transfers', component: () => import('@/views/students/TransfersView.vue') },
            { path: 'id-cards', name: 'IdCards', component: () => import('@/views/students/IdCardsView.vue') },
            // Akademik
            { path: 'academic-years', name: 'AcademicYears', component: () => import('@/views/academic/AcademicYearsView.vue') },
            { path: 'grades', name: 'Grades', component: () => import('@/views/academic/GradesView.vue') },
            { path: 'departments', name: 'Departments', component: () => import('@/views/academic/DepartmentsView.vue') },
            { path: 'classes', name: 'Classes', component: () => import('@/views/academic/ClassesView.vue') },
            { path: 'teachers', name: 'Teachers', component: () => import('@/views/academic/TeachersView.vue') },
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
            { path: 'positive-point-types', name: 'PositivePointTypes', component: () => import('@/views/counseling/PositivePointTypesView.vue') },
            { path: 'student-positive-points', name: 'StudentPositivePoints', component: () => import('@/views/counseling/StudentPositivePointsView.vue') },
            { path: 'counseling-cases', name: 'CounselingCases', component: () => import('@/views/counseling/CounselingCasesView.vue') },
            { path: 'counseling-sessions', name: 'CounselingSessions', component: () => import('@/views/counseling/CounselingSessionsView.vue') },
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
            { path: 'permissions', name: 'Permissions', component: () => import('@/views/system/PermissionsView.vue') }
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
