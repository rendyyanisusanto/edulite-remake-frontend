import api from '../api'
import publicApi from '../publicApi'

class StudentToiletRfidService {
    scanToilet(payload) {
        return publicApi.post('/v1/student-toilet-permissions/rfid-scan', payload)
    }

    getCurrentlyOutPublic(params) {
        return publicApi.get('/v1/student-toilet-permissions/rfid-currently-out', { params })
    }

    getToday(params) {
        return api.get('/v1/student-toilet-permissions/today', { params })
    }

    getHistory(params) {
        return api.get('/v1/student-toilet-permissions', { params })
    }

    getSummary(params) {
        return api.get('/v1/student-toilet-permissions/summary', { params })
    }

    getTodayScanLogs(params) {
        return api.get('/v1/student-toilet-permissions/scan-logs/today', { params })
    }
}

export default new StudentToiletRfidService()

