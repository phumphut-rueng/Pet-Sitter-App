import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

interface User {
  id: number
  name: string
  email: string
  profile_image?: string
  roles?: string[]
  isSitter?: boolean
}

interface AuthState {
  loading: boolean | null
  error: string | null
  user: User | null
}

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
}

interface AuthContextType {
  state: AuthState
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = React.createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    loading: null,
    error: null,
    user: null,
  })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()

  // Check authentication status and restore user data on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const userDataFromToken = jwtDecode(token) as User
          setState(prev => ({ ...prev, user: userDataFromToken }))
          setIsAuthenticated(true)
        } catch (error) {
          // Invalid token, remove it
          localStorage.removeItem('token')
          setIsAuthenticated(false)
        }
      } else {
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    }
  }, [])

  // make a login request
  const login = async (data: LoginData) => {
    const result = await axios.post("/api/auth/login", data)
    const token = result.data.token
    if (typeof window !== 'undefined') {
      localStorage.setItem("token", token)
      setIsAuthenticated(true)
      setIsLoading(false)
    }
    const userDataFromToken = jwtDecode(token) as User
    setState({ ...state, user: userDataFromToken })
    router.push("/")
  }

  // register the user
  const register = async (data: RegisterData) => {
    await axios.post("/api/auth/register", data)
    router.push("/login")
  }

  // clear the token in localStorage and the user data
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("token")
      setIsAuthenticated(false)
    }
    setState({ ...state, user: null, error: null })
  }


  return (
    <AuthContext.Provider
      value={{ state, login, logout, register, isAuthenticated, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}