import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem('user')
        return raw ? JSON.parse(raw) : null
    })
    const [loading, setLoading] = useState(false)

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password })
        persist(data)
        return data
    }

    const register = async (payload) => {
        const { data } = await api.post('/auth/register', payload)
        persist(data)
        return data
    }

    const persist = (data) => {
        const u = {
            id: data.id,
            fullName: data.fullName,
            email: data.email,
            role: data.role,
            phone: data.phone || '',
            address: data.address || '',
        }
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(u))
        setUser(u)
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
    }

    const refreshProfile = async () => {
        try {
            setLoading(true)
            const { data } = await api.get('/auth/me')
            const u = {
                ...user,
                id: data.id,
                fullName: data.fullName,
                email: data.email,
                role: data.role,
                phone: data.phone || '',
                address: data.address || '',
            }
            localStorage.setItem('user', JSON.stringify(u))
            setUser(u)
        } catch { /* ignore */ }
        finally { setLoading(false) }
    }

    // ---- role flags ----
    const isAdmin         = user?.role === 'ROLE_ADMIN'
    const isSubAdmin      = user?.role === 'ROLE_SUBADMIN'
    const isAdminPanelUser = isAdmin || isSubAdmin     // can access /admin
    const isCustomer      = user?.role === 'ROLE_CUSTOMER'
    const isAuthenticated = !!user                     // ← THIS WAS MISSING

    return (
        <AuthContext.Provider value={{
            user,
            login, register, logout, refreshProfile,
            isAdmin, isSubAdmin, isAdminPanelUser, isCustomer,
            isAuthenticated,
            loading,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)