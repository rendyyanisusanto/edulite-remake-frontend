import api from '../api'

class AttendanceService {
    // Shifts
    getShifts(params) { return api.get('/attendance/shifts', { params }) }
    getActiveShifts() { return api.get('/attendance/shifts/active') }
    getShiftById(id) { return api.get(`/attendance/shifts/${id}`) }
    createShift(data) { return api.post('/attendance/shifts', data) }
    updateShift(id, data) { return api.put(`/attendance/shifts/${id}`, data) }
    toggleShift(id) { return api.patch(`/attendance/shifts/${id}/toggle`) }
    deleteShift(id) { return api.delete(`/attendance/shifts/${id}`) }

    // Settings
    getSettings() { return api.get('/attendance/settings') }
    saveSettings(data) { return api.post('/attendance/settings', data) }
}

export default new AttendanceService()
