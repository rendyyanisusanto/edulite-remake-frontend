import api from '../api'

class ViolationLevelService {
    getAll(params) { return api.get('/violations/levels', { params }) }
    getById(id) { return api.get(`/violations/levels/${id}`) }
    create(data) { return api.post('/violations/levels', data) }
    update(id, data) { return api.put(`/violations/levels/${id}`, data) }
    delete(id) { return api.delete(`/violations/levels/${id}`) }
}

class ViolationTypeService {
    getAll(params) { return api.get('/violations/types', { params }) }
    getById(id) { return api.get(`/violations/types/${id}`) }
    create(data) { return api.post('/violations/types', data) }
    update(id, data) { return api.put(`/violations/types/${id}`, data) }
    delete(id) { return api.delete(`/violations/types/${id}`) }
}

class StudentViolationService {
    getAll(params) { return api.get('/violations/students', { params }) }
    getById(id) { return api.get(`/violations/students/${id}`) }
    create(data) { return api.post('/violations/students', data) }
    update(id, data) { return api.put(`/violations/students/${id}`, data) }
    delete(id) { return api.delete(`/violations/students/${id}`) }
}

export const violationLevelService = new ViolationLevelService()
export const violationTypeService = new ViolationTypeService()
export const studentViolationService = new StudentViolationService()
