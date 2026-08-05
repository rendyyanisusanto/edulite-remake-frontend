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
    uploadPhoto(id, file) {
        const formData = new FormData()
        formData.append('photo', file)
        return api.post(`/academic/teachers/${id}/photo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }
    delete(id) { return api.delete(`/academic/teachers/${id}`) }
}

class SubjectService {
    getAll(params) { return api.get('/academic/subjects', { params }); }
    getById(id) { return api.get(`/academic/subjects/${id}`); }
    create(data) { return api.post('/academic/subjects', data); }
    update(id, data) { return api.put(`/academic/subjects/${id}`, data); }
    toggle(id) { return api.patch(`/academic/subjects/${id}/toggle`); }
    delete(id) { return api.delete(`/academic/subjects/${id}`); }
}

class LessonPeriodService {
    getTemplates(params) { return api.get('/academic/lesson-period-templates', { params }); }
    getTemplateById(id) { return api.get(`/academic/lesson-period-templates/${id}`); }
    createTemplate(data) { return api.post('/academic/lesson-period-templates', data); }
    updateTemplate(id, data) { return api.put(`/academic/lesson-period-templates/${id}`, data); }
    setDefaultTemplate(id) { return api.patch(`/academic/lesson-period-templates/${id}/default`); }
    toggleTemplate(id) { return api.patch(`/academic/lesson-period-templates/${id}/toggle`); }
    getPeriods(templateId) { return api.get(`/academic/lesson-period-templates/${templateId}/periods`); }
    createPeriod(data) { return api.post('/academic/lesson-periods', data); }
    updatePeriod(id, data) { return api.put(`/academic/lesson-periods/${id}`, data); }
    togglePeriod(id) { return api.patch(`/academic/lesson-periods/${id}/toggle`); }
    deletePeriod(id) { return api.delete(`/academic/lesson-periods/${id}`); }
}

export const academicYearService = new AcademicYearService()
export const gradeService = new GradeService()
export const departmentService = new DepartmentService()
export const classService = new ClassService()
export const teacherService = new TeacherService()
export const subjectService = new SubjectService()
export const lessonPeriodService = new LessonPeriodService()
