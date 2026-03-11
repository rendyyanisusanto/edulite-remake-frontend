import api from '../api';

class StudentClassHistoryService {
    async getAll(params) {
        return api.get('/class-histories', { params });
    }

    async getById(id) {
        return api.get(`/class-histories/${id}`);
    }

    async create(data) {
        return api.post('/class-histories', data);
    }

    async update(id, data) {
        return api.put(`/class-histories/${id}`, data);
    }

    async delete(id) {
        return api.delete(`/class-histories/${id}`);
    }
}

export default new StudentClassHistoryService();
