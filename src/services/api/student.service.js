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

    async downloadTemplate() {
        return api.get('/students/template', {
            responseType: 'blob'
        });
    }

    async exportExcel(params = {}) {
        return api.get('/students/export/excel', {
            params,
            responseType: 'blob'
        });
    }

    async importExcel(file) {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/students/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
}

export default new StudentService()
