import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
    const { isAuthenticated } = useAuth()
    const [wishlistIds, setWishlistIds] = useState([])
    const [wishlistItems, setWishlistItems] = useState([])

    const fetchWishlist = async () => {
        if (!isAuthenticated) {
            setWishlistIds([])
            setWishlistItems([])
            return
        }
        try {
            const [idsRes, itemsRes] = await Promise.all([
                api.get('/wishlist/ids'),
                api.get('/wishlist')
            ])
            setWishlistIds(idsRes.data)
            setWishlistItems(itemsRes.data)
        } catch { /* ignore */ }
    }

    useEffect(() => { fetchWishlist() }, [isAuthenticated])

    const toggleWishlist = async (productId) => {
        if (!isAuthenticated) {
            toast.error('Please sign in to save items')
            return
        }
        try {
            await api.post(`/wishlist/${productId}/toggle`)
            // Optimistically update the state
            setWishlistIds(prev =>
                prev.includes(productId)
                    ? prev.filter(id => id !== productId)
                    : [...prev, productId]
            )
            fetchWishlist() // Refresh full items list
        } catch {
            toast.error('Failed to update wishlist')
        }
    }

    const isInWishlist = (productId) => wishlistIds.includes(productId)

    return (
        <WishlistContext.Provider value={{ wishlistIds, wishlistItems, toggleWishlist, isInWishlist, fetchWishlist }}>
            {children}
        </WishlistContext.Provider>
    )
}

export const useWishlist = () => useContext(WishlistContext)
