// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios.js'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const login = async (username, password) => {
    const res = await api.post('/api/login', {
      username,
      password,
      isAdmin: true,
      device_name: 'Web Admin Panel',
      user_agent: navigator.userAgent
    })

    localStorage.setItem('accessToken', res.data.accessToken)
    localStorage.setItem('refreshToken', res.data.refreshToken)
    setUser(res.data)
    return res.data
  }

  const logout = async () => {
    try {
      await api.post('/api/logout')
    } catch (e) {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  const updateUser = (data) => {
    setUser(prev => ({ ...prev, ...data }))
  }

  // Check if token is still valid on page load/refresh
  const validateToken = async () => {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')

    if (!accessToken || !refreshToken) {
      setLoading(false)
      return
    }

    try {
      // This endpoint should return user data if tokens are valid
      const res = await api.post('/api/tokensValid', {
        accessToken,
        refreshToken
      })

      setUser(res.data)  // res.data contains user info
    } catch (err) {
      // If tokens expired or invalid → clear everything
      console.warn('Token validation failed:', err.response?.data || err.message)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    validateToken()
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      updateUser,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)