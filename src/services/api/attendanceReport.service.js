import api from '../api'

class AttendanceReportService {
    getSummary(params) { return api.get('/attendance/reports', { params }) }
    getHistory(params) { return api.get('/attendance/history', { params }) }
    getHistoryById(id) { return api.get(`/attendance/history/${id}`) }
    exportExcel(params) {
        return api.get('/attendance/reports/export/excel', {
            params,
            responseType: 'blob'
        })
    }
}

export default new AttendanceReportService()
