import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ThemeProvider>
                <AuthProvider>
                    <CartProvider>
                        <App />
                        <Toaster
                            position="top-center"
                            toastOptions={{
                                style: {
                                    fontSize: '12px',
                                    letterSpacing: '0.05em',
                                    borderRadius: 0,
                                    background: 'rgb(var(--surface))',
                                    color: 'rgb(var(--fg))',
                                    border: '1px solid rgb(var(--cbord))',
                                },
                            }}
                        />
                    </CartProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>,
)