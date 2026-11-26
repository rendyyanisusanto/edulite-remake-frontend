import api from '../api'
import publicApi from '../publicApi'

class LessonAttendanceService {
    // Admin — Teacher PIN
    getTeacherAttendancePinStatus(teacherId) {
        return api.get(`/teachers/${teacherId}/attendance-pin/status`)
    }

    generateTeacherAttendancePin(teacherId) {
        return api.post(`/teachers/${teacherId}/attendance-pin/generate`)
    }

    setTeacherAttendancePin(teacherId, pin) {
        return api.put(`/teachers/${teacherId}/attendance-pin`, { pin })
    }

    removeTeacherAttendancePin(teacherId) {
        return api.delete(`/teachers/${teacherId}/attendance-pin`)
    }

    // Admin — Classroom QR
    getClassAttendanceQr(classId) {
        return api.get(`/classes/${classId}/attendance-qr`)
    }

    generateClassAttendanceQr(classId) {
        return api.post(`/classes/${classId}/attendance-qr/generate`)
    }

    regenerateClassAttendanceQr(classId) {
        return api.post(`/classes/${classId}/attendance-qr/regenerate`)
    }

    updateClassAttendanceQrStatus(classId, isActive) {
        return api.patch(`/classes/${classId}/attendance-qr/status`, { is_active: isActive })
    }

    // Public — Lesson Attendance Foundation (Sprint LA-02 / LA-03)
    resolveClassAttendanceQr(token) {
        return publicApi.get(`/public/lesson-attendance/classes/${encodeURIComponent(token)}`)
    }

    getAttendanceTeachers(token) {
        return publicApi.get(`/public/lesson-attendance/classes/${encodeURIComponent(token)}/teachers`)
    }

    verifyAttendanceTeacherPin(token, payload) {
        return publicApi.post(`/public/lesson-attendance/classes/${encodeURIComponent(token)}/verify-pin`, payload)
    }

    getLessonAttendanceContext(attendanceToken) {
        return publicApi.get('/public/lesson-attendance/context', {
            headers: {
                Authorization: `Bearer ${attendanceToken}`
            }
        })
    }

    submitLessonAttendance(attendanceToken, payload) {
        return publicApi.post('/public/lesson-attendance/submit', payload, {
            headers: {
                Authorization: `Bearer ${attendanceToken}`
            },
            timeout: 20000
        })
    }

    // Admin — LA-04 Lookups & Monitoring
    getLookups(params = {}) {
        return api.get('/lesson-attendance/lookups', { params })
    }

    getStudentLookup(params = {}) {
        return api.get('/lesson-attendance/lookups/students', { params })
    }

    getManualRoster(params) {
        return api.get('/lesson-attendance/roster', { params })
    }

    getMonitoring(params = {}) {
        return api.get('/lesson-attendance/monitoring', { params })
    }

    exportMonitoringPdf(params = {}) {
        return api.get('/lesson-attendance/monitoring/export/pdf', {
            params,
            responseType: 'blob',
            timeout: 60000
        })
    }

    // Admin — LA-04 Transaction Management
    listSessions(params = {}) {
        return api.get('/lesson-attendance/sessions', { params })
    }

    getSessionDetail(id, params = {}) {
        return api.get(`/lesson-attendance/sessions/${id}`, { params })
    }

    createManualAttendance(payload) {
        return api.post('/lesson-attendance/sessions', payload)
    }

    correctSession(id, payload) {
        return api.patch(`/lesson-attendance/sessions/${id}/correct`, payload)
    }

    cancelSession(id, reason) {
        return api.post(`/lesson-attendance/sessions/${id}/cancel`, { reason })
    }

    restoreSession(id, reason) {
        return api.post(`/lesson-attendance/sessions/${id}/restore`, { reason })
    }

    getSessionLogs(id) {
        return api.get(`/lesson-attendance/sessions/${id}/logs`)
    }

    // Admin — LA-04 Reports & Export
    getClassReport(params = {}) {
        return api.get('/lesson-attendance/reports/class', { params })
    }

    getStudentReport(params = {}) {
        return api.get('/lesson-attendance/reports/student', { params })
    }

    getStudentReportDetail(studentId, params = {}) {
        return api.get(`/lesson-attendance/reports/student/${studentId}/detail`, { params })
    }

    getTeacherReport(params = {}) {
        return api.get('/lesson-attendance/reports/teacher', { params })
    }

    getSubjectReport(params = {}) {
        return api.get('/lesson-attendance/reports/subject', { params })
    }

    getDetailReport(params = {}) {
        return api.get('/lesson-attendance/reports/detail', { params })
    }

    exportExcel(params = {}) {
        return api.get('/lesson-attendance/reports/export/excel', {
            params,
            responseType: 'blob',
            timeout: 60000
        })
    }

    exportPdf(params = {}) {
        return api.get('/lesson-attendance/reports/export/pdf', {
            params,
            responseType: 'blob',
            timeout: 60000
        })
    }

    // Admin — LA-05 Daily Student Matrix & Potential Truancy
    getDailyStudentReport(params = {}) {
        return api.get('/lesson-attendance/reports/daily-students', { params })
    }

    exportDailyStudentExcel(params = {}) {
        return api.get('/lesson-attendance/reports/daily-students/export/excel', {
            params,
            responseType: 'blob',
            timeout: 60000
        })
    }

    exportDailyStudentPdf(params = {}) {
        return api.get('/lesson-attendance/reports/daily-students/export/pdf', {
            params,
            responseType: 'blob',
            timeout: 60000
        })
    }

    // Admin — LA-06 Integrated Daily Report (gate + Tahfidz + lesson attendance)
    getIntegratedDailyReport(params = {}) {
        return api.get('/lesson-attendance/reports/integrated-daily', { params, timeout: 45000 })
    }

    getIntegratedDailyScope() {
        return api.get('/lesson-attendance/reports/integrated-daily/scope')
    }

    exportIntegratedDailyExcel(params = {}) {
        return api.get('/lesson-attendance/reports/integrated-daily/export/excel', {
            params,
            responseType: 'blob',
            timeout: 90000
        })
    }

    exportIntegratedDailyPdf(params = {}) {
        return api.get('/lesson-attendance/reports/integrated-daily/export/pdf', {
            params,
            responseType: 'blob',
            timeout: 90000
        })
    }
}

export const lessonAttendanceService = new LessonAttendanceService()
export default lessonAttendanceService
