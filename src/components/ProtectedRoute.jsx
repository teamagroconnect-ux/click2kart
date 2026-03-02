import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  const location = useLocation()
  if (!token) return <Navigate to="/admin/login" replace />
  if (location.pathname.startsWith('/admin')) {
    const part = (token.split('.')[1] || '')
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=')
    try {
      const payload = JSON.parse(typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('utf8'))
      if (payload?.role !== 'admin') return <Navigate to="/admin/login" replace />
    } catch {
      // If we can't decode (non-standard token), don't block here; server will enforce role.
    }
  }
  return children
}
