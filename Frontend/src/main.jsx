import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { LocalizationProvider } from './context/LocalizationContext.jsx'
import LocationModal from './components/LocationModal.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ThemeProvider>
                <LocalizationProvider>
                    <AuthProvider>
                        <CartProvider>
                            <App />
                            <LocationModal />
                            <Toaster
                                position="top-center"
                                toastOptions={{
                                    // Default style for all toasts (warnings, custom messages, etc.)
                                    style: {
                                        background: 'rgba(5, 5, 16, 0.95)', // Deep dark background matching the Navbar
                                        color: '#ffffff',
                                        border: '1px solid rgba(197, 168, 128, 0.3)', // Subtle gold border
                                        borderRadius: '0px', // Sharp edges to match the luxury UI
                                        fontSize: '10px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.2em', // Wide tracking matching the brand
                                        padding: '16px 24px',
                                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7)',
                                        backdropFilter: 'blur(10px)', // Frosted glass effect
                                        fontFamily: 'inherit', // Uses your app's default sans-serif
                                    },
                                    success: {
                                        duration: 3000,
                                        iconTheme: {
                                            primary: '#C5A880', // Gold checkmark
                                            secondary: '#050510',
                                        },
                                        style: {
                                            border: '1px solid rgba(197, 168, 128, 0.5)', // Stronger gold border for success
                                        }
                                    },
                                    error: {
                                        duration: 4000,
                                        iconTheme: {
                                            primary: '#ef4444', // Red cross
                                            secondary: '#050510',
                                        },
                                        style: {
                                            border: '1px solid rgba(239, 68, 68, 0.5)', // Subtle red border for errors
                                        }
                                    },
                                    loading: {
                                        iconTheme: {
                                            primary: '#ffffff',
                                            secondary: '#050510',
                                        }
                                    }
                                }}
                            />
                        </CartProvider>
                    </AuthProvider>
                </LocalizationProvider>
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>,
)