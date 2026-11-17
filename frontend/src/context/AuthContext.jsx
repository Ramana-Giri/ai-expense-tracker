import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Configure axios with token whenever it changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      console.log('Token set:', token.substring(0, 20) + '...')
    } else {
      delete axios.defaults.headers.common['Authorization']
      console.log('Token cleared')
    }
  }, [token])

  // Fetch user on mount and when token changes
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false)
        setUser(null)
        return
      }

      try {
        console.log('Fetching user with token...')
        const response = await axios.get('/api/auth/me')
        console.log('User fetched successfully:', response.data)
        setUser(response.data)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch user:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        })
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        setLoading(false)
      }
    }

    fetchUser()
  }, [token])

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
      })
      return response.data
    } catch (error) {
      console.error('Registration error:', error.response?.data)
      throw error
    }
  }

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email)
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      })
      console.log('Login successful, received token')
      const { access_token } = response.data
      
      // Set token immediately
      localStorage.setItem('token', access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      setToken(access_token)
      
      return response.data
    } catch (error) {
      console.error('Login error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
