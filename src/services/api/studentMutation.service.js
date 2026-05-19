import api from '../api'

class StudentMutationService {
    async getAll(params = {}) {
        return api.get('/student-mutations', { params })
    }

    async getById(id) {
        return api.get(`/student-mutations/${id}`)
    }

    async getByStudentId(studentId, params = {}) {
        return api.get(`/students/${studentId}/mutations`, { params })
    }

    async create(data) {
        return api.post('/student-mutations', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }

    async update(id, data) {
        return api.put(`/student-mutations/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }

    async submit(id, payload = {}) {
        return api.post(`/student-mutations/${id}/submit`, payload)
    }

    async approve(id, payload = {}) {
        return api.post(`/student-mutations/${id}/approve`, payload)
    }

    async reject(id, payload = {}) {
        return api.post(`/student-mutations/${id}/reject`, payload)
    }

    async complete(id, payload = {}) {
        return api.post(`/student-mutations/${id}/complete`, payload)
    }

    async cancel(id, payload = {}) {
        return api.post(`/student-mutations/${id}/cancel`, payload)
    }

    async uploadDocument(id, file) {
        const formData = new FormData()
        formData.append('file', file)
        return api.post(`/student-mutations/${id}/upload-document`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }

    async print(id) {
        return api.get(`/student-mutations/${id}/print`, {
            responseType: 'blob'
        })
    }

    async getReport(params = {}) {
        return api.get('/student-mutations/report', { params })
    }
}

export default new StudentMutationService()
