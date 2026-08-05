import api from '../api';

class ClassSetupService {
    getSummary(params) {
        return api.get('/class-setup/summary', { params });
    }

    getClasses(params) {
        return api.get('/class-setup/classes', { params });
    }

    getUnassignedStudents(params) {
        return api.get('/class-setup/unassigned-students', { params });
    }

    getRombelSummary(params) {
        return api.get('/class-setup/rombel/summary', { params });
    }

    getRombels(params) {
        return api.get('/class-setup/rombel', { params });
    }

    getRombelDetail(class_id, params) {
        return api.get(`/class-setup/rombel/${class_id}`, { params });
    }

    getRombelStudents(class_id, params) {
        return api.get(`/class-setup/rombel/${class_id}/students`, { params });
    }

    bulkAssign(data) {
        return api.post('/class-setup/assign', data);
    }

    bulkMove(data) {
        return api.post('/class-setup/move', data);
    }

    removeAssignment(history_id) {
        return api.delete(`/class-setup/assignment/${history_id}`);
    }
}

export default new ClassSetupService();
