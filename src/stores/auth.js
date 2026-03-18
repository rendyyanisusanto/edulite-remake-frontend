import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('edulite_user')) || null,
        token: localStorage.getItem('edulite_token') || null,
        roles: JSON.parse(localStorage.getItem('edulite_roles')) || [],
        permissions: JSON.parse(localStorage.getItem('edulite_permissions')) || [],
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        isSuperAdmin: (state) => state.roles.includes('SUPERADMIN'),
        hasPermission: (state) => (code) => {
            if (state.roles.includes('SUPERADMIN')) return true
            if (state.permissions.includes('*')) return true
            return state.permissions.includes(code)
        },
        hasAnyPermission: (state) => (codes) => {
            if (state.roles.includes('SUPERADMIN')) return true
            if (state.permissions.includes('*')) return true
            return codes.some(c => state.permissions.includes(c))
        }
    },
    actions: {
        login(data) {
            this.user = data.user
            this.token = data.access_token
            this.roles = data.roles || []
            this.permissions = data.permissions || []
            localStorage.setItem('edulite_user', JSON.stringify(data.user))
            localStorage.setItem('edulite_token', data.access_token)
            localStorage.setItem('edulite_roles', JSON.stringify(data.roles || []))
            localStorage.setItem('edulite_permissions', JSON.stringify(data.permissions || []))
        },
        logout() {
            this.user = null
            this.token = null
            this.roles = []
            this.permissions = []
            localStorage.removeItem('edulite_user')
            localStorage.removeItem('edulite_token')
            localStorage.removeItem('edulite_roles')
            localStorage.removeItem('edulite_permissions')
        },
        updatePermissions(permissions) {
            this.permissions = permissions
            localStorage.setItem('edulite_permissions', JSON.stringify(permissions))
        }
    }
})
