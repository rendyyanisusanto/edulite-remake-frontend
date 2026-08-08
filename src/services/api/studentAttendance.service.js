import api from '../api'

/**
 * Student Attendance Service
 *
 * Service for managing student attendance records.
 * Supports multiple input methods: RFID, Manual, Import
 */

class StudentAttendanceService {
  /**
   * Get attendance list with filters and pagination
   * @param {Object} params - Query parameters (date, class_id, attendance_status, input_method, keyword, page, limit)
   * @returns {Promise} API response with attendances list
   */
  getList(params) {
    return api.get('/v1/student-attendances', { params })
  }

  /**
   * Get attendance by ID
   * @param {number} id - Attendance ID
   * @returns {Promise} API response with attendance detail
   */
  getById(id) {
    return api.get(`/v1/student-attendances/${id}`)
  }

  /**
   * Get summary statistics for attendance cards
   * @param {Object} params - Query parameters (date, class_id)
   * @returns {Promise} API response with summary stats
   */
  getSummary(params) {
    return api.get('/v1/student-attendances/summary', { params })
  }

  /**
   * Upsert single attendance record
   * @param {Object} data - Attendance data
   * @returns {Promise} API response
   */
  upsert(data) {
    return api.post('/v1/student-attendances/upsert', data)
  }

  /**
   * Bulk upsert attendance records for a class
   * @param {Object} data - Payload with date, class_id, and attendances array
   * @returns {Promise} API response
   */
  bulkUpsert(data) {
    return api.post('/v1/student-attendances/bulk-upsert', data)
  }

  /**
   * Import attendance from Excel/CSV file
   * @param {File} file - File to import
   * @param {Object} params - Query parameters (date, class_id)
   * @returns {Promise} API response
   */
  import(file, params) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/v1/student-attendances/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params
    })
  }

  /**
   * Validate import file before processing
   * @param {File} file - File to validate
   * @param {Object} params - Query parameters (date, class_id)
   * @returns {Promise} API response with validation results
   */
  validateImport(file, params) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/v1/student-attendances/import/validate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params
    })
  }

  /**
   * Download import template
   * @returns {Promise} Blob response for file download
   */
  downloadTemplate() {
    return api.get('/v1/student-attendances/template', {
      responseType: 'blob'
    })
  }

  /**
   * Update single attendance record
   * @param {number} id - Attendance ID
   * @param {Object} data - Updated attendance data
   * @returns {Promise} API response
   */
  update(id, data) {
    return api.put(`/v1/student-attendances/${id}`, data)
  }

  /**
   * Delete attendance record (soft delete)
   * @param {number} id - Attendance ID
   * @returns {Promise} API response
   */
  delete(id) {
    return api.delete(`/v1/student-attendances/${id}`)
  }

  /**
   * Get students by class for input form
   * @param {number} classId - Class ID
   * @param {Object} params - Query parameters (date)
   * @returns {Promise} API response with students list and existing attendance
   */
  getStudentsByClass(classId, params) {
    return api.get(`/v1/academic/classes/${classId}/students`, { params })
  }
}

export default new StudentAttendanceService()
