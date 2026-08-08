import api from './api';

class TahfidzAttendanceService {
    getClasses() {
        return api.get('/v1/tahfidz-attendance/classes');
    }

    getAttendanceByClass(classId, date) {
        return api.get('/v1/tahfidz-attendance/class', {
            params: { class_id: classId, date }
        });
    }

    bulkUpsertAttendance(data) {
        return api.post('/v1/tahfidz-attendance/bulk-upsert', data);
    }

    getRecap(params) {
        return api.get('/v1/tahfidz-attendance/recap', { params });
    }

    getStudentRecap(studentId, params) {
        return api.get(`/v1/tahfidz-attendance/recap/student/${studentId}`, { params });
    }

    downloadTemplate(classId) {
        const token = localStorage.getItem('edulite_token');
        const baseURL = import.meta.env.VITE_API_URL || '/api';

        return fetch(`${baseURL}/v1/tahfidz-attendance/template?class_id=${classId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => {
            if (!res.ok) throw new Error('Gagal mengunduh template');
            return res.blob();
        });
    }

    importAttendance(formData) {
        return api.post('/v1/tahfidz-attendance/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
}

export default new TahfidzAttendanceService();
