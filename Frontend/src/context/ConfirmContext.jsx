import { createContext, useContext, useState } from 'react'
import { createPortal } from 'react-dom'

const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
    const [options, setOptions] = useState(null)
    const [resolver, setResolver] = useState(null)
    const [inputValue, setInputValue] = useState('')

    const confirm = (opts) => {
        setOptions(opts)
        setInputValue(opts.defaultInput !== undefined ? String(opts.defaultInput) : '')
        return new Promise((resolve) => {
            setResolver(() => resolve)
        })
    }

    const handleConfirm = () => {
        if (options.requireInput && !inputValue.trim()) return
        if (resolver) resolver(options.requireInput ? inputValue : true)
        setOptions(null)
    }

    const handleCancel = () => {
        if (resolver) resolver(false)
        setOptions(null)
    }

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            {options && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={handleCancel} />

                    <div className="relative bg-surface border border-c p-8 w-full max-w-md shadow-2xl animate-fade-in">
                        <h2 className="text-2xl font-serif text-fg mb-3">{options.title || 'Are you sure?'}</h2>

                        {options.message && (
                            <p className="text-sm text-muted leading-relaxed mb-6">
                                {options.message}
                            </p>
                        )}

                        {options.requireInput && (
                            <div className="mb-6">
                                <label className="label-field">{options.inputLabel || 'Please provide details'}</label>
                                <input
                                    autoFocus
                                    required
                                    type={options.inputType || 'text'}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="input-field"
                                    placeholder={options.inputPlaceholder || 'Type here...'}
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={handleCancel} className="btn-outline px-6">
                                {options.cancelText || 'Cancel'}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`btn-primary px-6 ${options.isDanger ? 'bg-red-600 hover:bg-red-700 border-red-600 text-white' : ''}`}
                            >
                                {options.confirmText || 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </ConfirmContext.Provider>
    )
}

export const useConfirm = () => useContext(ConfirmContext)