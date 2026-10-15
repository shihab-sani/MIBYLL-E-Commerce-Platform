import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
    const { isAuthenticated } = useAuth()
    const [cart, setCart] = useState({ items: [], subtotal: 0, totalItems: 0, totalSavings: 0 })
    const [loading, setLoading] = useState(false)

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCart({ items: [], subtotal: 0, totalItems: 0, totalSavings: 0 })
            return
        }
        try {
            setLoading(true)
            const { data } = await api.get('/cart')
            setCart(data)
        } catch { /* ignore */ }
        finally { setLoading(false) }
    }, [isAuthenticated])

    useEffect(() => { fetchCart() }, [fetchCart])

    const addToCart = async (productId, quantity = 1, size = '') => {
        const { data } = await api.post('/cart/items', { productId, quantity, size })
        setCart(data)
        return data
    }

    const updateItem = async (itemId, quantity) => {
        const { data } = await api.put(`/cart/items/${itemId}`, { quantity })
        setCart(data)
    }

    const removeItem = async (itemId) => {
        const { data } = await api.delete(`/cart/items/${itemId}`)
        setCart(data)
    }

    const clearCart = async () => {
        await api.delete('/cart')
        setCart({ items: [], subtotal: 0, totalItems: 0, totalSavings: 0 })
    }

    return (
        <CartContext.Provider value={{ cart, loading, addToCart, updateItem, removeItem, clearCart, fetchCart }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)