import api from '../api';

class StudentClassHistoryService {
    getAll(params) {
        return api.get('/class-histories', { params });
    }

    getById(id) {
        return api.get(`/class-histories/${id}`);
    }

    getStudentHistory(student_id) {
        return api.get(`/class-histories/student/${student_id}`);
    }

    create(data) {
        return api.post('/class-histories', data);
    }

    update(id, data) {
        return api.put(`/class-histories/${id}`, data);
    }

    delete(id) {
        return api.delete(`/class-histories/${id}`);
    }
}

export default new StudentClassHistoryService();
