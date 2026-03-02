import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  const location = useLocation()
  if (!token) return <Navigate to="/admin/login" replace />
  if (location.pathname.startsWith('/admin')) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''))
      if (payload?.role !== 'admin') return <Navigate to="/admin/login" replace />
    } catch {
      return <Navigate to="/admin/login" replace />
    }
  }
  return children
}
