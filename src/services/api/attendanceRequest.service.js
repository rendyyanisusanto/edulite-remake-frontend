import api from '../api'

class AttendanceRequestService {
    getAll(params) { return api.get('/attendance/requests', { params }) }
    getById(id) { return api.get(`/attendance/requests/${id}`) }
    approve(id, data) { return api.patch(`/attendance/requests/${id}/approve`, data) }
    reject(id, data) { return api.patch(`/attendance/requests/${id}/reject`, data) }
}

export default new AttendanceRequestService()
