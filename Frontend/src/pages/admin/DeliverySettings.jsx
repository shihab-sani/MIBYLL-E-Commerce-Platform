import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function DeliverySettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        localDeliveryCharge: 0,
        domesticDeliveryCharge: 0,
        internationalDeliveryCharge: 0
    })

    useEffect(() => {
        // We reuse the footer settings endpoint since it holds all SiteSettings
        api.get('/admin/site/footer')
            .then(r => {
                setSettings({
                    localDeliveryCharge: r.data.localDeliveryCharge || 0,
                    domesticDeliveryCharge: r.data.domesticDeliveryCharge || 0,
                    internationalDeliveryCharge: r.data.internationalDeliveryCharge || 0
                })
            })
            .catch(() => toast.error('Failed to load settings'))
            .finally(() => setLoading(false))
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            // We send the full settings object back to prevent overwriting other fields
            const currentSettings = await api.get('/admin/site/footer')
            const updatedPayload = {
                ...currentSettings.data,
                localDeliveryCharge: Number(settings.localDeliveryCharge),
                domesticDeliveryCharge: Number(settings.domesticDeliveryCharge),
                internationalDeliveryCharge: Number(settings.internationalDeliveryCharge)
            }

            await api.put('/admin/site/footer', updatedPayload)
            toast.success('Delivery charges updated')
        } catch (err) {
            toast.error('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="text-sm text-muted">Loading settings...</div>

    return (
        <div className="max-w-3xl space-y-8">
            <div>
                <h1 className="text-3xl font-serif text-fg">Delivery Charges</h1>
                <p className="text-xs text-muted mt-1">Configure shipping rates based on the customer's location relative to the Admin's city.</p>
            </div>

            <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-8">

                {/* Local (City) */}
                <div className="border-b border-c pb-6">
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg mb-4">In City (Local)</h2>
                    <p className="text-xs text-muted mb-4">Applied when the customer's city matches the Admin's city.</p>
                    <div className="max-w-xs">
                        <label className="label-field">Delivery Charge (৳)</label>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            required
                            value={settings.localDeliveryCharge}
                            onChange={e => setSettings({ ...settings, localDeliveryCharge: e.target.value })}
                            className="input-field"
                        />
                    </div>
                </div>

                {/* Domestic (Outside City) */}
                <div className="border-b border-c pb-6">
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg mb-4">Outside City (Domestic)</h2>
                    <p className="text-xs text-muted mb-4">Applied when the customer is in the same country but a different city.</p>
                    <div className="max-w-xs">
                        <label className="label-field">Delivery Charge (৳)</label>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            required
                            value={settings.domesticDeliveryCharge}
                            onChange={e => setSettings({ ...settings, domesticDeliveryCharge: e.target.value })}
                            className="input-field"
                        />
                    </div>
                </div>

                {/* International */}
                <div>
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg mb-4">International</h2>
                    <p className="text-xs text-muted mb-4">Applied when the customer's country is different from the Admin's country.</p>
                    <div className="max-w-xs">
                        <label className="label-field">Delivery Charge (৳)</label>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            required
                            value={settings.internationalDeliveryCharge}
                            onChange={e => setSettings({ ...settings, internationalDeliveryCharge: e.target.value })}
                            className="input-field"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-c">
                    <button type="submit" disabled={saving} className="btn-primary">
                        {saving ? 'Saving...' : 'Save Charges'}
                    </button>
                </div>
            </form>
        </div>
    )
}
