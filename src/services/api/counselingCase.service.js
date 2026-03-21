import api from '../api'

class CounselingCaseService {
    getAll(params) { return api.get('/counseling-cases', { params }) }
    getById(id) { return api.get(`/counseling-cases/${id}`) }
    getStats() { return api.get('/counseling-cases/stats') }
    getFollowups(params) { return api.get('/counseling-cases/follow-up/all', { params }) }
    getByStudent(studentId, params) { return api.get(`/counseling-cases/student/${studentId}`, { params }) }
    create(data) { return api.post('/counseling-cases', data) }
    update(id, data) { return api.put(`/counseling-cases/${id}`, data) }
    updateStatus(id, status) { return api.patch(`/counseling-cases/${id}/status`, { status }) }
    delete(id) { return api.delete(`/counseling-cases/${id}`) }
}

export default new CounselingCaseService()
