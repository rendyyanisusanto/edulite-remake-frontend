import api from '../api'

const BASE_PATH = '/settings/school-profile'

class SchoolProfileService {
    async get() {
        return api.get(BASE_PATH)
    }

    async update(data) {
        return api.put(BASE_PATH, data)
    }

    /**
     * Upload an image asset for the school profile.
     * @param {string} fieldName - logo | logo_light | logo_dark | favicon | school_icon
     * @param {File} file - browser File object
     */
    async uploadAsset(fieldName, file) {
        const formData = new FormData()
        formData.append('file', file)
        return api.post(`${BASE_PATH}/upload/${fieldName}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }
}

export default new SchoolProfileService()
