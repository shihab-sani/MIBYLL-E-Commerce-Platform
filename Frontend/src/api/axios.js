import axios from 'axios'
import { session } from './session' // Import the session wrapper

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
})

// Attach token
api.interceptors.request.use((config) => {
    const token = session.getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`

    // Let the browser set the correct multipart boundary
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type']
    }
    return config
})

// Global 401 handling (Session Expired)
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            const isAuthEndpoint = err.config?.url?.includes('/auth/login')
            if (!isAuthEndpoint) {
                // 1. Clear the session completely
                session.clear()
                localStorage.removeItem('token')
                localStorage.removeItem('user')

                // 2. Force redirect to login, preserving the current path to return later
                if (!window.location.pathname.startsWith('/login')) {
                    const currentPath = window.location.pathname + window.location.search
                    window.location.href = `/login?from=${encodeURIComponent(currentPath)}`
                }
            }
        }
        return Promise.reject(err)
    }
)

export default api