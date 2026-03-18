import api from '@/services/api'

const roleService = {
    getAll(params = {}) {
        return api.get('/roles', { params })
    },
    getById(id) {
        return api.get(`/roles/${id}`)
    },
    create(data) {
        return api.post('/roles', data)
    },
    update(id, data) {
        return api.put(`/roles/${id}`, data)
    },
    delete(id) {
        return api.delete(`/roles/${id}`)
    },
    getPermissions(id) {
        return api.get(`/roles/${id}/permissions`)
    },
    syncPermissions(id, permission_ids) {
        return api.put(`/roles/${id}/permissions`, { permission_ids })
    }
}

export default roleService
