import React, { useState } from 'react'
import { useToast } from './Toast'

export default function PasswordConfirmModal({ 
  open, 
  title = 'Confirm Deletion', 
  message = 'Enter deletion password to confirm:', 
  onConfirm, 
  onCancel 
}) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { notify } = useToast()

  const handleConfirm = async () => {
    if (!password) {
      notify('Please enter password', 'error')
      return
    }
    setLoading(true)
    try {
      await onConfirm(password)
      setPassword('')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-xl font-black text-gray-900 mb-2">{title}</div>
        <div className="text-sm text-gray-600 mb-6">{message}</div>
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter deletion password"
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-6"
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
        />
        
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setPassword('')
              onCancel()
            }}
            disabled={loading}
            className="px-6 py-3 rounded-2xl border border-gray-200 text-gray-600 font-black text-sm hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-sm hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
          >
            {loading ? 'Confirming...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
