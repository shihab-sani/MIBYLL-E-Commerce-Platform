import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function AuditLog() {
    const { isAdmin } = useAuth()
    const [page, setPage] = useState(0)
    const [data, setData] = useState({ content: [], totalPages: 0 })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (!isAdmin) return
        setLoading(true)
        api.get(`/admin/audit?page=${page}&size=50`)
            .then(r => setData(r.data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [page, isAdmin])

    if (!isAdmin) {
        return (
            <div className="card p-8 text-center">
                <p className="text-sm text-fg">Only the primary admin can view the audit log.</p>
            </div>
        )
    }

    const rows = data.content.filter(l => {
        const q = search.toLowerCase()
        return !q
            || l.actorEmail?.toLowerCase().includes(q)
            || l.action?.toLowerCase().includes(q)
            || l.entityType?.toLowerCase().includes(q)
            || (l.details || '').toLowerCase().includes(q)
    })

    const badgeClass = (action) => {
        if (action?.includes('DELETED'))  return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
        if (action?.includes('CREATED'))  return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
        if (action?.includes('UPDATED'))  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
        return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif text-fg">Audit Log</h1>
                <p className="text-xs text-muted mt-1">
                    Every admin and sub-admin action, most recent first.
                </p>
            </div>

            <input
                placeholder="Search by actor, action, entity…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field max-w-sm"
            />

            <div className="card overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                    <thead>
                    <tr className="text-left text-[9px] uppercase tracking-widest2 text-muted border-b border-c">
                        <th className="px-5 py-3">When</th>
                        <th className="px-5 py-3">Actor</th>
                        <th className="px-5 py-3">Action</th>
                        <th className="px-5 py-3">Entity</th>
                        <th className="px-5 py-3">Details</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr><td colSpan="5" className="px-5 py-10 text-center text-xs text-muted">Loading…</td></tr>
                    ) : rows.length === 0 ? (
                        <tr><td colSpan="5" className="px-5 py-10 text-center text-xs text-muted">No entries</td></tr>
                    ) : rows.map(l => (
                        <tr key={l.id} className="border-b border-c last:border-0">
                            <td className="px-5 py-4 text-muted whitespace-nowrap">
                                {new Date(l.createdAt).toLocaleString()}
                            </td>
                            <td className="px-5 py-4">
                                <p className="text-fg">{l.actorEmail}</p>
                                <p className="text-[10px] text-muted uppercase tracking-widest2">
                                    {l.actorRole?.replace('ROLE_', '')}
                                </p>
                            </td>
                            <td className="px-5 py-4">
                  <span className={`text-[9px] uppercase tracking-widest2 px-2 py-1 ${badgeClass(l.action)}`}>
                    {l.action}
                  </span>
                            </td>
                            <td className="px-5 py-4 text-muted">
                                {l.entityType}{l.entityId ? ` #${l.entityId}` : ''}
                            </td>
                            <td className="px-5 py-4 text-muted max-w-[320px] truncate">{l.details || '—'}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {data.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 text-[11px] uppercase tracking-widest2 text-fg disabled:opacity-30">
                        Prev
                    </button>
                    <span className="px-4 py-2 text-[11px] text-muted">
            Page {page + 1} / {data.totalPages}
          </span>
                    <button disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 text-[11px] uppercase tracking-widest2 text-fg disabled:opacity-30">
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}