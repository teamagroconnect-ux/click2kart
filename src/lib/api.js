import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('partnerToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const s = err?.response?.status
    const code = err?.response?.data?.error
    if (s === 401 || code === 'invalid_token') {
      try { sessionStorage.setItem('postLoginRedirect', location.pathname + location.search) } catch {}
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('userPhone')
      
      const isPartner = localStorage.getItem('partnerToken') || location.pathname.startsWith('/partner')
      localStorage.removeItem('partnerToken')
      localStorage.removeItem('partnerData')

      if (location.pathname.startsWith('/admin')) location.href = '/admin/login'
      else if (isPartner) location.href = '/partner'
      else location.href = '/login'
    }
    // For 403, do not force logout. Let pages handle access errors gracefully.
    return Promise.reject(err)
  }
)

export default api
