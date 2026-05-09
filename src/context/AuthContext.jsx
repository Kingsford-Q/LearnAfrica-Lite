import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    }
    return null
  })

  const [isInstructorMode, setIsInstructorMode] = useState(false)

  const login = (userData) => {
    const userWithDefaults = {
      id: '1',
      name: userData.name || 'John Doe',
      email: userData.email,
      avatar: '/placeholder-user.jpg',
      role: 'student',
      joinedDate: new Date().toISOString(),
      ...userData
    }
    setUser(userWithDefaults)
    localStorage.setItem('user', JSON.stringify(userWithDefaults))
  }

  const logout = () => {
    setUser(null)
    setIsInstructorMode(false)
    localStorage.removeItem('user')
  }

  const toggleInstructorMode = () => {
    setIsInstructorMode(prev => !prev)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      isInstructorMode,
      toggleInstructorMode
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
