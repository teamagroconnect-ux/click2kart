import { useState } from 'react'
import api from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'
import PasswordInput from '../../components/PasswordInput'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { setAuth } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      const user = { ...data.admin, role: data.admin.role || 'admin' }
      setAuth(data.token, user)
      const target = sessionStorage.getItem('postLoginRedirect')
      if (target && target.startsWith('/admin')) {
        sessionStorage.removeItem('postLoginRedirect')
        location.href = target
      } else {
        location.href = '/admin'
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'login_failed')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      submit(e)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-20 w-40 rounded-2xl bg-white flex items-center justify-center shadow-xl border border-gray-100 p-2 overflow-hidden">
              <img src="/layoutlogo.png" alt="Click2Kart" className="h-full w-full object-contain" />
            </div>
          </div>
        </div>
        <form
          onSubmit={submit}
          onKeyDown={handleKeyPress}
          className="bg-white border border-gray-200 rounded-2xl px-6 py-6 md:px-8 md:py-7 shadow-lg space-y-4"
        >
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Admin Sign in</h1>
          </div>
          {error && (
            <div className="text-red-600 text-xs border border-red-200 bg-red-50 rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-gray-700">Email</label>
            <input
              className="border border-gray-300 bg-white text-gray-900 text-sm rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-gray-700">Password</label>
            <PasswordInput
              autoComplete="current-password"
              inputClassName="border border-gray-300 bg-white text-gray-900 text-sm rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold transition-colors">
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
