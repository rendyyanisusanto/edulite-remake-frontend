import api from '../api'

class ExtracurricularReportService {
  getMembers(params) { return api.get('/extracurricular/reports/members', { params }) }
  getStudentAttendance(params) { return api.get('/extracurricular/reports/student-attendance', { params }) }
  getCoachAttendance(params) { return api.get('/extracurricular/reports/coach-attendance', { params }) }
  getStudentProgress(params) { return api.get('/extracurricular/reports/student-progress', { params }) }
  getSessions(params) { return api.get('/extracurricular/reports/sessions', { params }) }
  getRanking(params) { return api.get('/extracurricular/reports/ranking', { params }) }
  getDashboard(params) { return api.get('/extracurricular/reports/dashboard', { params }) }

  exportMembersExcel(params) { return api.get('/extracurricular/reports/members/export/excel', { params, responseType: 'blob' }) }
  exportStudentAttendanceExcel(params) { return api.get('/extracurricular/reports/student-attendance/export/excel', { params, responseType: 'blob' }) }
  exportCoachAttendanceExcel(params) { return api.get('/extracurricular/reports/coach-attendance/export/excel', { params, responseType: 'blob' }) }
  exportStudentProgressExcel(params) { return api.get('/extracurricular/reports/student-progress/export/excel', { params, responseType: 'blob' }) }
  exportSessionsExcel(params) { return api.get('/extracurricular/reports/sessions/export/excel', { params, responseType: 'blob' }) }
  exportRankingExcel(params) { return api.get('/extracurricular/reports/ranking/export/excel', { params, responseType: 'blob' }) }
  exportDashboardExcel(params) { return api.get('/extracurricular/reports/dashboard/export/excel', { params, responseType: 'blob' }) }

  exportMembersPdf(params) { return api.get('/extracurricular/reports/members/export/pdf', { params, responseType: 'blob' }) }
  exportStudentAttendancePdf(params) { return api.get('/extracurricular/reports/student-attendance/export/pdf', { params, responseType: 'blob' }) }
  exportCoachAttendancePdf(params) { return api.get('/extracurricular/reports/coach-attendance/export/pdf', { params, responseType: 'blob' }) }
  exportStudentProgressPdf(params) { return api.get('/extracurricular/reports/student-progress/export/pdf', { params, responseType: 'blob' }) }
  exportSessionsPdf(params) { return api.get('/extracurricular/reports/sessions/export/pdf', { params, responseType: 'blob' }) }
  exportRankingPdf(params) { return api.get('/extracurricular/reports/ranking/export/pdf', { params, responseType: 'blob' }) }
  exportDashboardPdf(params) { return api.get('/extracurricular/reports/dashboard/export/pdf', { params, responseType: 'blob' }) }
}

export default new ExtracurricularReportService()
