import api from '../api'
import publicApi from '../publicApi'

class StudentAttendanceRfidService {
    scanGate(payload) {
        return publicApi.post('/v1/student-attendances/rfid-scan', payload)
    }

    getTodayScanLogsPublic(params) {
        return publicApi.get('/v1/student-attendances/rfid-scan-logs/today', { params })
    }

    getToday(params) {
        return api.get('/v1/student-attendances/today', { params })
    }

    getList(params) {
        return api.get('/v1/student-attendances', { params })
    }

    getReportSummary(params) {
        return api.get('/v1/student-attendances/report-summary', { params })
    }

    getTodayScanLogs(params) {
        return api.get('/v1/student-attendances/scan-logs/today', { params })
    }

    getShifts(params) {
        return api.get('/v1/student-attendance-shifts', { params })
    }

    getShiftDetail(id) {
        return api.get(`/v1/student-attendance-shifts/${id}`)
    }

    createShift(payload) {
        return api.post('/v1/student-attendance-shifts', payload)
    }

    updateShift(id, payload) {
        return api.put(`/v1/student-attendance-shifts/${id}`, payload)
    }

    toggleShift(id) {
        return api.patch(`/v1/student-attendance-shifts/${id}/toggle`)
    }

    getClassMappings(params) {
        return api.get('/v1/student-attendance-shift-classes', { params })
    }

    upsertClassMapping(payload) {
        return api.post('/v1/student-attendance-shift-classes', payload)
    }

    updateClassMapping(id, payload) {
        return api.put(`/v1/student-attendance-shift-classes/${id}`, payload)
    }

    deleteClassMapping(id) {
        return api.delete(`/v1/student-attendance-shift-classes/${id}`)
    }

    getStudentOverrides(params) {
        return api.get('/v1/student-attendance-shift-students', { params })
    }

    upsertStudentOverride(payload) {
        return api.post('/v1/student-attendance-shift-students', payload)
    }

    updateStudentOverride(id, payload) {
        return api.put(`/v1/student-attendance-shift-students/${id}`, payload)
    }

    deleteStudentOverride(id) {
        return api.delete(`/v1/student-attendance-shift-students/${id}`)
    }

    getCorrections(params) {
        return api.get('/v1/student-attendance-corrections', { params })
    }

    createCorrection(payload) {
        return api.post('/v1/student-attendance-corrections', payload)
    }

    updateCorrection(id, payload) {
        return api.put(`/v1/student-attendance-corrections/${id}`, payload)
    }

    reviewCorrection(id, payload) {
        return api.patch(`/v1/student-attendance-corrections/${id}/review`, payload)
    }
}

export default new StudentAttendanceRfidService()

