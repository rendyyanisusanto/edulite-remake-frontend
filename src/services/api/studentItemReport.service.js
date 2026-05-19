import api from '../api'

class StudentItemReportService {
  summary(params = {}) { return api.get('/student-item-reports/summary', { params }) }
  activeItems(params = {}) { return api.get('/student-item-reports/active-items', { params }) }
  dailyLoans(params = {}) { return api.get('/student-item-reports/daily-loans', { params }) }
  unreturnedItems(params = {}) { return api.get('/student-item-reports/unreturned-items', { params }) }
  finalReturns(params = {}) { return api.get('/student-item-reports/final-returns', { params }) }
  problemItems(params = {}) { return api.get('/student-item-reports/problem-items', { params }) }
  studentBehavior(params = {}) { return api.get('/student-item-reports/student-behavior', { params }) }
  classSummary(params = {}) { return api.get('/student-item-reports/class-summary', { params }) }
  studentHistory(studentId, params = {}) { return api.get(`/student-item-reports/student-history/${studentId}`, { params }) }

  async openPreview(path, params = {}) {
    const res = await api.get(path, { params, responseType: 'blob' })
    const blob = new Blob([res], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60000)
  }

  async downloadPdf(path, params = {}, filename = 'laporan.pdf') {
    const data = await api.get(path, { params, responseType: 'blob' })
    const blob = new Blob([data], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}

export default new StudentItemReportService()
