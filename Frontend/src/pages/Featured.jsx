import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import AboutUsPanel from '../components/AboutUsPanel' // Used for modal styling

export default function Featured() {
    const { isAuthenticated } = useAuth()
    const [products, setProducts] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [sendingRequest, setSendingRequest] = useState(false)

    useEffect(() => {
        // Fetch only featured products
        api.get('/products?featured=true').then(r => setProducts(r.data.content)).catch(() => {})
    }, [])

    const submitRequest = async (e) => {
        e.preventDefault()
        if (!isAuthenticated) {
            toast.error('Please sign in to send a request')
            return
        }
        setSendingRequest(true)
        try {
            await api.post('/orders/requests', { productId: selectedProduct.id, message })
            toast.success('Request sent to Admin!')
            setSelectedProduct(null)
            setMessage('')
        } catch {
            toast.error('Failed to send request')
        } finally { setSendingRequest(false) }
    }

    return (
        <div className="bg-surface min-h-screen">
            {/* Custom Minimal Header for this page */}
            <header className="py-8 text-center border-b border-c">
                <Link to="/" className="text-3xl font-serif tracking-[0.3em] uppercase">Mibyll</Link>
                <p className="text-xs text-muted mt-2 tracking-widest2 uppercase">Featured Collection</p>
            </header>

            <div className="max-w-[1200px] mx-auto py-16 px-5">
                {products.map((product, index) => {
                    const isReverse = index % 2 !== 0
                    return (
                        <section key={product.id} className={`flex flex-col md:flex-row min-h-[60vh] mb-12 ${isReverse ? 'md:flex-row-reverse' : ''}`}>
                            <div className="w-full md:w-1/2 relative bg-sand">
                                <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover absolute inset-0" />
                            </div>
                            <div className="w-full md:w-1/2 flex items-center justify-center p-12 md:p-24 text-center">
                                <div className="max-w-md">
                                    <p className="text-muted text-xs uppercase tracking-widest2 mb-4">{product.brand}</p>
                                    <h2 className="text-3xl md:text-5xl font-serif text-fg mb-6">{product.name}</h2>
                                    <p className="text-muted text-sm leading-relaxed mb-10">{product.description}</p>
                                    <button
                                        onClick={() => setSelectedProduct(product)}
                                        className="inline-block border border-[#C5A880] text-[#C5A880] px-10 py-3 text-xs uppercase tracking-widest2 hover:bg-[#C5A880] hover:text-white transition-colors"
                                    >
                                        Interested
                                    </button>
                                </div>
                            </div>
                        </section>
                    )
                })}
            </div>

            {/* Inquiry Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedProduct(null)} />
                    <div className="relative bg-surface p-8 w-full max-w-md shadow-2xl border border-c">
                        <h2 className="text-xl font-serif mb-2">Inquire about {selectedProduct.name}</h2>
                        <p className="text-xs text-muted mb-6">Send a message to our team regarding this piece.</p>
                        <form onSubmit={submitRequest}>
                            <textarea
                                required rows="4"
                                value={message} onChange={e => setMessage(e.target.value)}
                                placeholder="I am interested in this piece, please contact me..."
                                className="input-field resize-none mb-4"
                            />
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setSelectedProduct(null)} className="btn-outline">Cancel</button>
                                <button type="submit" disabled={sendingRequest} className="btn-primary">
                                    {sendingRequest ? 'Sending...' : 'Send Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
