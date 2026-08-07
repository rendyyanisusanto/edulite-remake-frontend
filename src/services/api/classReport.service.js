import api from '../api'

class ClassReportService {
  getClassReportData(classId, academicYearId) {
    return api.get(`/class-reports/${classId}/data`, { params: { academic_year_id: academicYearId } })
  }

  printPreview(classId, academicYearId) {
    return api.get(`/class-reports/${classId}/print`, {
      params: { academic_year_id: academicYearId }
    })
  }

  printPdf(classId, academicYearId) {
    return api.get(`/class-reports/${classId}/pdf`, {
      params: { academic_year_id: academicYearId },
      responseType: 'blob'
    })
  }
}

export default new ClassReportService()
