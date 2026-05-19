import api from '../api'

const BASE_PATH = '/settings/document-settings'

class DocumentSettingService {
    /**
     * List document settings with optional filters.
     * @param {object} params - { document_type, school_profile_id, is_active }
     */
    async list(params = {}) {
        return api.get(BASE_PATH, { params })
    }

    /**
     * Get single document setting by id.
     */
    async detail(id) {
        return api.get(`${BASE_PATH}/${id}`)
    }

    /**
     * Create a new document setting.
     */
    async create(data) {
        return api.post(BASE_PATH, data)
    }

    /**
     * Update an existing document setting.
     */
    async update(id, data) {
        return api.put(`${BASE_PATH}/${id}`, data)
    }

    /**
     * Toggle active status.
     * @param {number} id
     * @param {boolean} is_active
     */
    async updateStatus(id, is_active) {
        return api.patch(`${BASE_PATH}/${id}/status`, { is_active })
    }

    /**
     * Upload an image asset for a document setting.
     * @param {number} id - document setting id
     * @param {string} fieldName - header_image | footer_image | signature_image | stamp_image | watermark_image
     * @param {File} file - browser File object
     */
    async uploadAsset(id, fieldName, file) {
        const formData = new FormData()
        formData.append('file', file)
        return api.post(`${BASE_PATH}/${id}/upload/${fieldName}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }
}

export default new DocumentSettingService()
