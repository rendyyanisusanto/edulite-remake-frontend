import api from '../api'

class AttendanceMonitoringService {
    getByDate(params) { return api.get('/attendance/monitoring', { params }) }
    getById(id) { return api.get(`/attendance/monitoring/${id}`) }
    getSummary(params) { return api.get('/attendance/monitoring/summary', { params }) }
}

export default new AttendanceMonitoringService()
