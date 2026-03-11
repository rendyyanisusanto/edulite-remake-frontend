import api from '../api'

class DocumentService {
    async getAll(params = {}) {
        return api.get('/documents', { params })
    }

    async getById(id) {
        return api.get(`/documents/${id}`)
    }

    async create(data) {
        return api.post('/documents', data)
    }

    async update(id, data) {
        return api.put(`/documents/${id}`, data)
    }

    async delete(id) {
        return api.delete(`/documents/${id}`)
    }
}

export default new DocumentService()
