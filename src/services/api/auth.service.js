import api from '../api'

class AuthService {
    async login(email, password) {
        const response = await api.post('/auth/login', { email, password })
        return response.data
    }

    async getProfile() {
        return api.get('/auth/profile')
    }
}

export default new AuthService()
