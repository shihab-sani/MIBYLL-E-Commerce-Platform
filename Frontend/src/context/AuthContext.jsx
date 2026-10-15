import { createContext, useContext, useState } from 'react'
import api from '../api/axios'
import { session } from '../api/session'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => session.getUser())
    const [loading, setLoading] = useState(false)

    const persist = (data) => {
        const u = {
            id: data.id,
            fullName: data.fullName,
            email: data.email,
            role: data.role,
            phone: data.phone || '',
            address: data.address || '',
        }
        session.set(data.token, u)
        setUser(u)
    }

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

    const logout = () => {
        session.clear()
        setUser(null)
    }

    const refreshProfile = async () => {
        try {
            setLoading(true)
            const { data } = await api.get('/auth/me')
            const u = { ...user, ...data }
            session.set(session.getToken(), u)
            setUser(u)
        } catch { /* ignore */ }
        finally { setLoading(false) }
    }

    const isAdmin          = user?.role === 'ROLE_ADMIN'
    const isSubAdmin       = user?.role === 'ROLE_SUBADMIN'
    const isAdminPanelUser = isAdmin || isSubAdmin
    const isCustomer       = user?.role === 'ROLE_CUSTOMER'
    const isAuthenticated  = !!user

    return (
        <AuthContext.Provider value={{
            user, login, register, logout, refreshProfile,
            isAdmin, isSubAdmin, isAdminPanelUser, isCustomer,
            isAuthenticated, loading,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)