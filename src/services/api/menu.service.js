import api from '@/services/api'

const menuService = {
    getMyMenus() {
        return api.get('/menus/me')
    },
    getAll() {
        return api.get('/menus')
    },
    toggleStatus(id, is_active) {
        return api.patch(`/menus/${id}/status`, { is_active })
    },
    updatePermission(id, permission_code) {
        return api.patch(`/menus/${id}/permission`, { permission_code })
    }
}

export default menuService
