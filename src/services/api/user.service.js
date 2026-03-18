import api from '@/services/api'

const userService = {
    getAll(params = {}) {
        return api.get('/users', { params })
    },
    getById(id) {
        return api.get(`/users/${id}`)
    },
    create(data) {
        return api.post('/users', data)
    },
    update(id, data) {
        return api.put(`/users/${id}`, data)
    },
    syncRoles(id, role_ids) {
        return api.put(`/users/${id}/roles`, { role_ids })
    },
    resetPassword(id, data) {
        return api.patch(`/users/${id}/reset-password`, data)
    },
    toggleStatus(id, is_active) {
        return api.patch(`/users/${id}/status`, { is_active })
    },
    getMyPermissions() {
        return api.get('/users/me/permissions')
    }
}

export default userService
