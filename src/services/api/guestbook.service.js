import api from '../api'

class GuestbookService {
    async getAll(params = {}) {
        return api.get('/guestbooks', { params })
    }

    async getById(id) {
        return api.get(`/guestbooks/${id}`)
    }

    async create(data) {
        return api.post('/guestbooks', data)
    }

    async update(id, data) {
        return api.put(`/guestbooks/${id}`, data)
    }

    async checkout(id) {
        return api.patch(`/guestbooks/${id}/checkout`)
    }

    async cancel(id) {
        return api.patch(`/guestbooks/${id}/cancel`)
    }

    async delete(id) {
        return api.delete(`/guestbooks/${id}`)
    }

    async exportExcel(params = {}) {
        return api.get('/guestbooks/export/excel', { params, responseType: 'blob' })
    }

    async exportPdf(params = {}) {
        return api.get('/guestbooks/export/pdf', { params, responseType: 'blob' })
    }
}

export default new GuestbookService()
