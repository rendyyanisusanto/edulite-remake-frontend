import api from '@/services/api'

const permissionService = {
    getAll(params = {}) {
        return api.get('/permissions', { params })
    },
    getGrouped() {
        return api.get('/permissions/grouped')
    },
    getById(id) {
        return api.get(`/permissions/${id}`)
    },
    create(data) {
        return api.post('/permissions', data)
    },
    update(id, data) {
        return api.put(`/permissions/${id}`, data)
    }
}

export default permissionService
