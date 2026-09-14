import api from '../api'

class CbtService {
    async getDashboardSummary() {
        const response = await api.get('/cbt/dashboard/summary')
        return response
    }

    async getHealth() {
        const response = await api.get('/cbt/health')
        return response
    }
}

export default new CbtService()
