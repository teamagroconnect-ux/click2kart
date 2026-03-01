import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'
import { useAuth } from '../../lib/AuthContext'
import logo from '../../click2kart.png'

export default function Login() {
  const { notify } = useToast()
  const navigate = useNavigate()
  const { setAuth, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/customer/login', formData)
      setAuth(data.token, { ...data.user, role: 'customer' })
      try { await refreshProfile() } catch {}
      notify('Welcome back!', 'success')
      navigate('/')
    } catch (err) {
      notify(err?.response?.data?.error || 'Invalid email or password', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-16 rounded-3xl bg-white shadow-xl border border-gray-100 p-1 overflow-hidden mb-4">
            <img src={logo} alt="Click2Kart" className="h-full w-auto object-contain" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-gray-500 font-medium">Access your B2B dashboard and inventory.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="group">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1 block">Email Address</label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="mr.uddhabcharandas@gmail.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="group">
              <div className="flex items-center justify-between ml-1 mb-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Password</label>
                <Link to="/forgot-password" size="sm" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">
                  Forgot?
                </Link>
              </div>
              <input
                name="password"
                type="password"
                required
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-5 rounded-3xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-100 hover:bg-blue-500 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          <p className="text-center text-xs text-gray-400 font-bold mt-6 uppercase tracking-widest">
            New to Click2Kart?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700">
              Create Account
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
