import api from '../api'

export default {
    getAll(params) {
        return api.get('/student-leave-requests', { params })
    },
    
    getById(id) {
        return api.get(`/student-leave-requests/${id}`)
    },
    
    create(data) {
        // data must be FormData because of file upload
        return api.post('/student-leave-requests', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },
    
    update(id, data) {
        // data must be FormData because of file upload
        return api.put(`/student-leave-requests/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },
    
    delete(id) {
        return api.delete(`/student-leave-requests/${id}`)
    },
    
    approve(id) {
        return api.put(`/student-leave-requests/${id}/approve`)
    },
    
    reject(id) {
        return api.put(`/student-leave-requests/${id}/reject`)
    },
    
    // Public Kiosk Methods
    createPublic(data) {
        return api.post('/kiosk/student-leave-requests', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },
    
    searchStudentsPublic(params) {
        return api.get('/kiosk/students', { params })
    }
}
