import api from '../api'

class StudentService {
    async getAll(params = {}) {
        return api.get('/students', { params })
    }

    async getById(id) {
        return api.get(`/students/${id}`)
    }

    async create(data) {
        return api.post('/students', data)
    }

    async update(id, data) {
        return api.put(`/students/${id}`, data)
    }

    async delete(id) {
        return api.delete(`/students/${id}`)
    }

    async getCharacterReport(id) {
        return api.get(`/students/${id}/character-report`);
    }

    async downloadCharacterReportPdf(id, notes = '') {
        return api.get(`/students/${id}/character-report/pdf`, {
            params: { notes },
            responseType: 'blob'
        });
    }
}

export default new StudentService()
