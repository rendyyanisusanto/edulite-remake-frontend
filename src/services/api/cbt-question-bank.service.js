import api from '../api'

class CbtQuestionBankService {
    async getQuestionBanks(params) {
        const response = await api.get('/cbt/question-banks', { params })
        return response.data
    }

    async getQuestionBankDetail(id) {
        const response = await api.get(`/cbt/question-banks/${id}`)
        return response.data
    }

    async createQuestionBank(data) {
        const response = await api.post('/cbt/question-banks', data)
        return response.data
    }

    async updateQuestionBank(id, data) {
        const response = await api.put(`/cbt/question-banks/${id}`, data)
        return response.data
    }

    async updateQuestionBankStatus(id, status) {
        const response = await api.patch(`/cbt/question-banks/${id}/status`, { status })
        return response.data
    }

    async archiveQuestionBank(id) {
        // Technically just calling status update with ARCHIVED
        return this.updateQuestionBankStatus(id, 'ARCHIVED')
    }

    // Question Layer APIs
    async getQuestions(bankId, params) {
        const response = await api.get(`/cbt/question-banks/${bankId}/questions`, { params })
        return response.data
    }

    async getQuestionDetail(bankId, questionId) {
        const response = await api.get(`/cbt/question-banks/${bankId}/questions/${questionId}`)
        return response.data
    }

    async createQuestion(bankId, data) {
        const response = await api.post(`/cbt/question-banks/${bankId}/questions`, data)
        return response.data
    }

    async updateQuestion(bankId, questionId, data) {
        const response = await api.put(`/cbt/question-banks/${bankId}/questions/${questionId}`, data)
        return response.data
    }

    async updateQuestionStatus(bankId, questionId, status) {
        const response = await api.patch(`/cbt/question-banks/${bankId}/questions/${questionId}/status`, { status })
        return response.data
    }

    async duplicateQuestion(bankId, questionId) {
        const response = await api.post(`/cbt/question-banks/${bankId}/questions/${questionId}/duplicate`)
        return response.data
    }

    // Media Upload
    async uploadMedia(file) {
        const formData = new FormData()
        formData.append('media', file)

        const response = await api.post('/cbt/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    }
}

export default new CbtQuestionBankService()
