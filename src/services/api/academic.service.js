import api from '../api'

// Sub-services for each academic master
class AcademicYearService {
    getAll(params) { return api.get('/academic/years', { params }) }
    getById(id) { return api.get(`/academic/years/${id}`) }
    create(data) { return api.post('/academic/years', data) }
    update(id, data) { return api.put(`/academic/years/${id}`, data) }
    delete(id) { return api.delete(`/academic/years/${id}`) }
}

class GradeService {
    getAll(params) { return api.get('/academic/grades', { params }) }
    getById(id) { return api.get(`/academic/grades/${id}`) }
    create(data) { return api.post('/academic/grades', data) }
    update(id, data) { return api.put(`/academic/grades/${id}`, data) }
    delete(id) { return api.delete(`/academic/grades/${id}`) }
}

class DepartmentService {
    getAll(params) { return api.get('/academic/departments', { params }) }
    getById(id) { return api.get(`/academic/departments/${id}`) }
    create(data) { return api.post('/academic/departments', data) }
    update(id, data) { return api.put(`/academic/departments/${id}`, data) }
    delete(id) { return api.delete(`/academic/departments/${id}`) }
}

class ClassService {
    getAll(params) { return api.get('/academic/classes', { params }) }
    getById(id) { return api.get(`/academic/classes/${id}`) }
    create(data) { return api.post('/academic/classes', data) }
    update(id, data) { return api.put(`/academic/classes/${id}`, data) }
    delete(id) { return api.delete(`/academic/classes/${id}`) }
}

class TeacherService {
    getAll(params) { return api.get('/academic/teachers', { params }) }
    getById(id) { return api.get(`/academic/teachers/${id}`) }
    create(data) { return api.post('/academic/teachers', data) }
    update(id, data) { return api.put(`/academic/teachers/${id}`, data) }
    delete(id) { return api.delete(`/academic/teachers/${id}`) }
}

export const academicYearService = new AcademicYearService()
export const gradeService = new GradeService()
export const departmentService = new DepartmentService()
export const classService = new ClassService()
export const teacherService = new TeacherService()
