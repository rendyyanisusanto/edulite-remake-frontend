import api from '../api'

class CounselingSessionService {
    async getByCaseId(caseId, params = {}) {
        return api.get(`/counseling-sessions/cases/${caseId}`, { params })
    }

    async getCaseTimeline(caseId) {
        return api.get(`/counseling-sessions/cases/${caseId}/timeline`)
    }

    async getById(id) {
        return api.get(`/counseling-sessions/${id}`)
    }

    async create(data) {
        return api.post('/counseling-sessions', data)
    }

    async update(id, data) {
        return api.put(`/counseling-sessions/${id}`, data)
    }

    async delete(id) {
        return api.delete(`/counseling-sessions/${id}`)
    }
}

export default new CounselingSessionService()
