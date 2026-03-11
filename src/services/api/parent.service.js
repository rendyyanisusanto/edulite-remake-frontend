import api from '../api'

class ParentService {
    async getAll(params = {}) {
        return api.get('/parents', { params })
    }

    async getById(id) {
        return api.get(`/parents/${id}`)
    }

    async create(data) {
        return api.post('/parents', data)
    }

    async update(id, data) {
        return api.put(`/parents/${id}`, data)
    }

    async delete(id) {
        return api.delete(`/parents/${id}`)
    }
}

export default new ParentService()
