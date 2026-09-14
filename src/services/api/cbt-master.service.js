import api from '../api'

class CbtMasterService {
    // Lookups
    async getLookups(type, params) {
        return await api.get(`/cbt/lookups/${type}`, { params })
    }

    // Teacher Assignments
    async getTeacherAssignments(params) {
        return await api.get('/cbt/master/teacher-assignments', { params })
    }

    async createTeacherAssignment(data) {
        return await api.post('/cbt/master/teacher-assignments', data)
    }

    async updateTeacherAssignment(id, data) {
        return await api.put(`/cbt/master/teacher-assignments/${id}`, data)
    }

    async updateTeacherAssignmentStatus(id, isActive) {
        return await api.patch(`/cbt/master/teacher-assignments/${id}/status`, { is_active: isActive })
    }

    async deleteTeacherAssignment(id) {
        return await api.delete(`/cbt/master/teacher-assignments/${id}`)
    }

    // Student Accounts
    async getStudentAccounts(params) {
        return await api.get('/cbt/master/student-accounts', { params })
    }

    async createStudentAccount(studentId) {
        return await api.post('/cbt/master/student-accounts', { student_id: studentId })
    }

    async createBulkStudentAccounts(studentIds) {
        return await api.post('/cbt/master/student-accounts/bulk', { student_ids: studentIds })
    }

    async updateStudentAccountStatus(id, isActive) {
        return await api.patch(`/cbt/master/student-accounts/${id}/status`, { is_active: isActive })
    }

    async resetStudentAccountPassword(id) {
        return await api.post(`/cbt/master/student-accounts/${id}/reset-password`)
    }
}

export default new CbtMasterService()
