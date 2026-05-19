import axios from 'axios'

const publicApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

publicApi.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error.response?.data || error)
)

export default publicApi

