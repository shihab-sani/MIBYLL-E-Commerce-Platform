import axios from 'axios'
import { session } from './session'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
    const token = session.getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    if (config.data instanceof FormData) delete config.headers['Content-Type']
    return config
})

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            const isAuthEndpoint = err.config?.url?.includes('/auth/login')
            if (!isAuthEndpoint) {
                session.clear()
                if (!window.location.pathname.startsWith('/login')) {
                    window.location.href = '/login'
                }
            }
        }
        return Promise.reject(err)
    }
)

export default api