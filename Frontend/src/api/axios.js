import axios from 'axios'

export const API_URL = 'http://localhost:8080/api'

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
})

// Attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`

    // Let the browser set the correct multipart boundary
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type']
    }
    return config
})

// Global 401 handling
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            const isAuthEndpoint = err.config?.url?.includes('/auth/login')
            if (!isAuthEndpoint) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                if (!window.location.pathname.startsWith('/login')) {
                    window.location.href = '/login'
                }
            }
        }
        return Promise.reject(err)
    }
)

export default api