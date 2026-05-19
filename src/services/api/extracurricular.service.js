import api from '../api'

export const extracurricularService = {
  // category
  getCategories(params) { return api.get('/extracurricular/categories', { params }) },
  createCategory(data) { return api.post('/extracurricular/categories', data) },
  updateCategory(id, data) { return api.put(`/extracurricular/categories/${id}`, data) },

  // extracurricular
  getExtracurriculars(params) { return api.get('/extracurricular', { params }) },
  getExtracurricularById(id) { return api.get(`/extracurricular/${id}`) },
  createExtracurricular(data) { return api.post('/extracurricular', data) },
  updateExtracurricular(id, data) { return api.put(`/extracurricular/${id}`, data) },
  toggleExtracurricular(id) { return api.patch(`/extracurricular/${id}/toggle-active`) },

  // coach
  getCoaches(params) { return api.get('/extracurricular/coaches', { params }) },
  getCoachById(id) { return api.get(`/extracurricular/coaches/${id}`) },
  createCoach(data) { return api.post('/extracurricular/coaches', data) },
  updateCoach(id, data) { return api.put(`/extracurricular/coaches/${id}`, data) },
  deleteCoach(id) { return api.delete(`/extracurricular/coaches/${id}`) },
  uploadCoachPhoto(id, file) {
    const formData = new FormData()
    formData.append('photo', file)
    return api.post(`/extracurricular/coaches/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  toggleCoach(id) { return api.patch(`/extracurricular/coaches/${id}/toggle-active`) },

  // assignment
  getAssignments(params) { return api.get('/extracurricular/assignments', { params }) },
  createAssignment(data) { return api.post('/extracurricular/assignments', data) },
  updateAssignment(id, data) { return api.put(`/extracurricular/assignments/${id}`, data) },
  deleteAssignment(id) { return api.delete(`/extracurricular/assignments/${id}`) },
  toggleAssignment(id) { return api.patch(`/extracurricular/assignments/${id}/toggle-active`) },

  // schedule
  getSchedules(params) { return api.get('/extracurricular/schedules', { params }) },
  getSchedulesByExtracurricular(id, params) { return api.get(`/extracurricular/${id}/schedules`, { params }) },
  createSchedule(data) { return api.post('/extracurricular/schedules', data) },
  updateSchedule(id, data) { return api.put(`/extracurricular/schedules/${id}`, data) },

  // member
  getMembers(params) { return api.get('/extracurricular/members', { params }) },
  createMember(data) { return api.post('/extracurricular/members', data) },
  createMembersBulk(data) { return api.post('/extracurricular/members/bulk', data) },
  getAvailableStudents(extracurricularId, params) { return api.get(`/extracurricular/${extracurricularId}/available-students`, { params }) },
  getAssignedStudents(extracurricularId, params) { return api.get(`/extracurricular/${extracurricularId}/assigned-students`, { params }) },
  getMembersByExtracurricular(id, params) { return api.get(`/extracurricular/${id}/members`, { params }) },
  updateMember(id, data) { return api.put(`/extracurricular/members/${id}`, data) },
  updateMemberStatus(id, data) { return api.patch(`/extracurricular/members/${id}/status`, data) },
  deleteMember(id) { return api.delete(`/extracurricular/members/${id}`) },

  // session
  getSessions(params) { return api.get('/extracurricular/sessions', { params }) },
  getSessionById(id) { return api.get(`/extracurricular/sessions/${id}`) },
  createSession(data) { return api.post('/extracurricular/sessions', data) },
  updateSession(id, data) { return api.put(`/extracurricular/sessions/${id}`, data) },
  openSession(id) { return api.post(`/extracurricular/sessions/${id}/open`) },
  closeSession(id) { return api.post(`/extracurricular/sessions/${id}/close`) },
  cancelSession(id, data) { return api.post(`/extracurricular/sessions/${id}/cancel`, data) },

  // attendance
  coachCheckin(sessionId, data) { return api.post(`/extracurricular/sessions/${sessionId}/coach-checkin`, data) },
  coachCheckout(sessionId, data) { return api.post(`/extracurricular/sessions/${sessionId}/coach-checkout`, data) },
  getSessionStudentAttendances(sessionId) { return api.get(`/extracurricular/sessions/${sessionId}/student-attendances`) },
  bulkSessionStudentAttendances(sessionId, attendances) {
    return api.post(`/extracurricular/sessions/${sessionId}/student-attendances/bulk`, { attendances })
  },

  // progress
  getProgressAspects(params) { return api.get('/extracurricular/progress-aspects', { params }) },
  createProgressAspect(data) { return api.post('/extracurricular/progress-aspects', data) },
  updateProgressAspect(id, data) { return api.put(`/extracurricular/progress-aspects/${id}`, data) },
  deleteProgressAspect(id) { return api.delete(`/extracurricular/progress-aspects/${id}`) },
  toggleProgressAspect(id) { return api.patch(`/extracurricular/progress-aspects/${id}/toggle-active`) },

  getStudentProgress(params) { return api.get('/extracurricular/student-progress', { params }) },
  createStudentProgress(data) { return api.post('/extracurricular/student-progress', data) },
  updateStudentProgress(id, data) { return api.put(`/extracurricular/student-progress/${id}`, data) },
  deleteStudentProgress(id) { return api.delete(`/extracurricular/student-progress/${id}`) }
}
