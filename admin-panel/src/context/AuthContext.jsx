// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios.js'
import { getDeviceName } from '../utils/deviceDetector.js'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const login = async (username, password) => {
    setLoading(true);

    try {
      const deviceName = await getDeviceName(); // This is now dynamic!

      const res = await api.post('/api/login', {
        username,
        password,
        isAdmin: true,
        device_name: deviceName, // Real device name!
        user_agent: navigator.userAgent
      });

      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      setUser(res.data);
      return res.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

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