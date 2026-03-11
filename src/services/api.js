import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import router from '@/router'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore()
        const token = authStore.token
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response Interceptor
api.interceptors.response.use(
    (response) => {
        return response.data
    },
    (error) => {
        const { error: toastError } = useToast()
        const errorMsg = error.response?.data?.message || error.message || 'An error occurred'

        if (error.response) {
            const status = error.response.status

            if (status === 401) {
                // Unauthorized - Token expired or invalid
                toastError('Session expired. Please login again.', 'Unauthorized')
                const authStore = useAuthStore()
                authStore.logout()
                router.push('/login')
            } else if (status === 403) {
                // Forbidden - No permission
                toastError('You do not have permission to perform this action.', 'Forbidden')
            } else if (status >= 500) {
                toastError('Internal Server Error. Please contact administrator.', 'Server Error')
            } else {
                toastError(errorMsg, `Error ${status}`)
            }
        } else if (error.request) {
            toastError('Cannot connect to the server. Please check your internet connection.', 'Network Error')
        }

        return Promise.reject(error.response?.data || error)
    }
)

export default api
