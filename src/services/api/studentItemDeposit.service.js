import api from '../api'

class StudentItemDepositService {
  getDashboard() { return api.get('/student-item-deposits-dashboard') }
  getDeposits(params = {}) { return api.get('/student-item-deposits', { params }) }
  getDepositById(id) { return api.get(`/student-item-deposits/${id}`) }
  createDeposit(data) { return api.post('/student-item-deposits', data, { headers: { 'Content-Type': 'multipart/form-data' } }) }
  updateDeposit(id, data) { return api.put(`/student-item-deposits/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }) }
  loan(id, payload = {}) { return api.post(`/student-item-deposits/${id}/loan`, payload) }
  returnDaily(id, payload = {}) { return api.post(`/student-item-deposits/${id}/return-daily`, payload) }
  finalReturn(id, payload = {}) { return api.post(`/student-item-deposits/${id}/final-return`, payload, { headers: { 'Content-Type': 'multipart/form-data' } }) }
  cancel(id, payload = {}) { return api.post(`/student-item-deposits/${id}/cancel`, payload) }
  markLost(id, payload = {}) { return api.post(`/student-item-deposits/${id}/mark-lost`, payload) }
  markDamaged(id, payload = {}) { return api.post(`/student-item-deposits/${id}/mark-damaged`, payload) }
  getLoans(params = {}) { return api.get('/student-item-loans', { params }) }
  getActiveLoans(params = {}) { return api.get('/student-item-loans/active', { params }) }
  getOverdueLoans(params = {}) { return api.get('/student-item-loans/overdue', { params }) }
  getLogs(id) { return api.get(`/student-item-deposits/${id}/logs`) }
  getCategories(params = {}) { return api.get('/student-item-categories', { params }) }
  createCategory(payload) { return api.post('/student-item-categories', payload) }
  updateCategory(id, payload) { return api.put(`/student-item-categories/${id}`, payload) }
  deleteCategory(id) { return api.delete(`/student-item-categories/${id}`) }
  getSettings() { return api.get('/student-item-deposit-settings') }
  updateSettings(id, payload) { return api.put(`/student-item-deposit-settings/${id}`, payload) }
  printPreview(id) { return api.get(`/student-item-deposits/${id}/print-preview`) }
  print(id) { return api.get(`/student-item-deposits/${id}/print`, { responseType: 'blob' }) }
  kioskScan(payload) { return api.post('/kiosk/student-item-deposits/rfid-scan', payload) }
  kioskLoan(id, payload) { return api.post(`/kiosk/student-item-deposits/${id}/loan`, payload) }
  kioskReturn(id, payload) { return api.post(`/kiosk/student-item-deposits/${id}/return-daily`, payload) }
}

export default new StudentItemDepositService()
