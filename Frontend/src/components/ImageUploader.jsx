import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const isVideoUrl = (url) => /\.(mp4|webm|mov|avi|mkv|ogv|m4v)(\?|#|$)/i.test(url)

export default function ImageUploader({
                                          value = [],
                                          onChange,
                                          multiple = true,
                                          accept = 'image/*',                 // ← NEW: pass 'image/*,video/*' to allow videos
                                          label = 'Click or drop images here',
                                          hint,
                                      }) {
    const inputRef = useRef(null)
    const [uploading, setUploading] = useState(false)

    const handleFiles = async (files) => {
        if (!files || files.length === 0) return
        setUploading(true)
        try {
            const urls = []
            for (const file of files) {
                const fd = new FormData()
                fd.append('file', file)
                const { data } = await api.post('/admin/upload', fd)
                urls.push(data.url)
            }
            onChange(multiple ? [...value, ...urls] : urls.slice(0, 1))
            toast.success(`${urls.length} file${urls.length > 1 ? 's' : ''} uploaded`)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed')
        } finally {
            setUploading(false)
            if (inputRef.current) inputRef.current.value = ''
        }
    }

    const removeAt = (index) => onChange(value.filter((_, i) => i !== index))

    const move = (from, to) => {
        if (to < 0 || to >= value.length) return
        const next = [...value]
        const [item] = next.splice(from, 1)
        next.splice(to, 0, item)
        onChange(next)
    }

    const defaultHint = accept.includes('video')
        ? 'JPG / PNG / WEBP / MP4 / WEBM'
        : 'JPG / PNG / WEBP'

    return (
        <div className="space-y-4">
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
                className="border-2 border-dashed border-c p-8 text-center cursor-pointer
                   hover:border-fg transition-colors bg-surface"
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
                {uploading ? (
                    <p className="text-xs uppercase tracking-widest2 text-muted">Uploading…</p>
                ) : (
                    <>
                        <p className="text-xs uppercase tracking-widest2 mb-1 text-fg">{label}</p>
                        <p className="text-[10px] text-muted">
                            {hint || defaultHint} · {multiple ? 'multiple allowed' : 'single file'}
                        </p>
                    </>
                )}
            </div>

            {value.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {value.map((url, i) => {
                        const vid = isVideoUrl(url)
                        return (
                            <div key={i} className="relative group aspect-[3/4] bg-sand overflow-hidden border border-c">
                                {vid ? (
                                    <video
                                        src={url}
                                        muted
                                        playsInline
                                        preload="metadata"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                )}

                                {vid && (
                                    <span className="absolute bottom-1 left-1 bg-ink text-white text-[8px] uppercase
                                   tracking-widest2 px-1.5 py-0.5">
                    Video
                  </span>
                                )}

                                {i === 0 && multiple && (
                                    <span className="absolute top-1 left-1 bg-ink text-white text-[8px] uppercase
                                   tracking-widest2 px-1.5 py-0.5">
                    Main
                  </span>
                                )}

                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
                                transition-opacity flex items-center justify-center gap-2">
                                    {multiple && (
                                        <>
                                            <button type="button" onClick={() => move(i, i - 1)}
                                                    className="text-white text-xs px-2 py-1 border border-white/40">←</button>
                                            <button type="button" onClick={() => move(i, i + 1)}
                                                    className="text-white text-xs px-2 py-1 border border-white/40">→</button>
                                        </>
                                    )}
                                    <button type="button" onClick={() => removeAt(i)}
                                            className="text-white text-xs px-2 py-1 border border-white/40">✕</button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}