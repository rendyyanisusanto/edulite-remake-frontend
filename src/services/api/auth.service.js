import api from '../api'

class AuthService {
    async login(username, password) {
        const response = await api.post('/auth/login', { username, password }, {
            params: { platform: 'web' }
        })
        return response.data
    }

    async getProfile() {
        return api.get('/auth/profile', {
            params: { platform: 'web' }
        })
    }
}

export default new AuthService()
