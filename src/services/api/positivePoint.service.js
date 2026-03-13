import api from '../api'

class PositivePointTypeService {
    getAll(params) { return api.get('/positive-points/types', { params }) }
    getById(id) { return api.get(`/positive-points/types/${id}`) }
    create(data) { return api.post('/positive-points/types', data) }
    update(id, data) { return api.put(`/positive-points/types/${id}`, data) }
    delete(id) { return api.delete(`/positive-points/types/${id}`) }
}

class StudentPositivePointService {
    getAll(params) { return api.get('/positive-points/student-points', { params }) }
    getById(id) { return api.get(`/positive-points/student-points/${id}`) }
    create(data) { return api.post('/positive-points/student-points', data) }
    update(id, data) { return api.put(`/positive-points/student-points/${id}`, data) }
    delete(id) { return api.delete(`/positive-points/student-points/${id}`) }
}

export const positivePointTypeService = new PositivePointTypeService()
export const studentPositivePointService = new StudentPositivePointService()
