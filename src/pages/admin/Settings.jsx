import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'

export default function Settings() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updating, setUpdating] = useState(false)
  const { notify } = useToast()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/api/admin/settings')
        setData(data)
      } catch (e) {
        setError('Could not load settings.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      notify('Please fill both fields', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      notify('Passwords do not match', 'error')
      return
    }
    if (newPassword.length < 6) {
      notify('Password must be at least 6 characters', 'error')
      return
    }

    setUpdating(true)
    try {
      await api.put('/api/admin/deletion-password', { newPassword })
      notify('Deletion password updated!', 'success')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e) {
      console.error(e)
      notify('Failed to update password', 'error')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Store settings</h1>
        <p className="text-[11px] text-gray-500">
          Key details used on Click2Kart bills and stock alerts.
        </p>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading settings…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Billing profile
            </div>
            <div className="text-sm text-gray-900 font-medium">{data.companyName}</div>
            {data.companyAddress && (
              <div className="text-xs text-gray-600 whitespace-pre-line">
                {data.companyAddress}
              </div>
            )}
            {data.companyGst && (
              <div className="text-xs text-gray-700 mt-1">GSTIN: {data.companyGst}</div>
            )}
            <div className="text-xs text-gray-600 mt-2 space-y-0.5">
              {data.companyPhone && <div>Phone: {data.companyPhone}</div>}
              {data.companyEmail && <div>Email: {data.companyEmail}</div>}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Inventory
            </div>
            <div className="text-sm text-gray-900">
              Low stock threshold:{' '}
              <span className="font-semibold">{data.lowStockThreshold}</span>
            </div>
            <div className="text-xs text-gray-600">
              Products with stock at or below this number are treated as low stock for alerts.
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Deletion Protection
        </div>
        <p className="text-sm text-gray-600">
          Update the password required before deleting any items. Default: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">admin123</code>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New deletion password"
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
        <button
          onClick={handleUpdatePassword}
          disabled={updating}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
        >
          {updating ? 'Updating...' : 'Update Deletion Password'}
        </button>
      </div>

      <div className="text-[11px] text-gray-400">
        To change these values, update the server environment variables (`COMPANY_*` and
        `LOW_STOCK_THRESHOLD`) and redeploy the backend.
      </div>
    </div>
  )
}

