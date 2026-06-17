import { createContext, useContext, useEffect, useState } from 'react'
import api from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      const t = localStorage.getItem('token')
      const exp = Number(localStorage.getItem('session_expires') || '0')
      if (t && exp && exp > Date.now()) return t
      // expired or missing
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('session_expires')
      return null
    } catch {
      return null
    }
  })

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user')
      const exp = Number(localStorage.getItem('session_expires') || '0')
      if (raw && exp && exp > Date.now()) return JSON.parse(raw)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('session_expires')
      return null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (!token) {
      setUser(null)
      localStorage.removeItem('token')
      localStorage.removeItem('session_expires')
      return
    }
    localStorage.setItem('token', token)
  }, [token])

  // auto-logout when session expires
  useEffect(() => {
    const checkExpiry = () => {
      const exp = Number(localStorage.getItem('session_expires') || '0')
      if (exp && exp <= Date.now()) {
        setAuth(null, null)
      }
    }
    const id = setInterval(checkExpiry, 60 * 1000) // check every minute
    checkExpiry()
    return () => clearInterval(id)
  }, [])

  const setAuth = (nextToken, nextUser) => {
    setToken(nextToken || null)
    if (nextUser && nextToken) {
      setUser(nextUser)
      localStorage.setItem('user', JSON.stringify(nextUser))
      // set session expiry to 7 days from now
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000
      localStorage.setItem('session_expires', String(expiresAt))
    } else {
      setUser(null)
      localStorage.removeItem('user')
      localStorage.removeItem('session_expires')
    }
  }

  const logout = () => {
    setAuth(null, null)
  }

  const refreshProfile = async () => {
    if (!token) return
    try {
      const { data } = await api.get('/api/user/me')
      const nextUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        defaultAddress: data.defaultAddress,
        isKycComplete: !!data.isKycComplete,
        role: data.role || (data.phone ? 'customer' : 'admin'),
        kyc: data.kyc // Include kyc data (which has profilePicture!)
      }
      setUser(nextUser)
      localStorage.setItem('user', JSON.stringify(nextUser))
    } catch {
      // ignore
    }
  }

  return (
    <AuthContext.Provider value={{ token, user, setAuth, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
