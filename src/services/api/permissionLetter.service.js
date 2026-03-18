import api from '../api'

class PermissionLetterService {
    async getAll(params = {}) {
        return api.get('/permission-letters', { params })
    }

    async getById(id) {
        return api.get(`/permission-letters/${id}`)
    }

    async create(data) {
        return api.post('/permission-letters', data)
    }

    async update(id, data) {
        return api.put(`/permission-letters/${id}`, data)
    }

    async submit(id) {
        return api.patch(`/permission-letters/${id}/submit`)
    }

    async approve(id) {
        return api.patch(`/permission-letters/${id}/approve`)
    }

    async reject(id) {
        return api.patch(`/permission-letters/${id}/reject`)
    }

    async cancel(id) {
        return api.patch(`/permission-letters/${id}/cancel`)
    }

    async generateCode() {
        return api.get('/permission-letters/generate-code')
    }

    async delete(id) {
        return api.delete(`/permission-letters/${id}`)
    }

    /**
     * Fetch PDF as a Blob for preview / download / print
     */
    async printPdf(id) {
        return api.get(`/permission-letters/${id}/print`, {
            responseType: 'blob'
        })
    }
}

export default new PermissionLetterService()
